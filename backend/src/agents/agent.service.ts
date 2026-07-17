import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { toApiEntity } from '../lib/database/base.entity';
import { CreateListingDto } from '../listings/dto/listing.dto';
import { ListingService } from '../listings/listing.service';
import { User, UserType } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import {
  AgentCreateFarmerDto,
  AgentListingRequestDto,
  SearchFarmersDto,
  VerifyAgentActionDto,
} from './dto/agent.dto';
import {
  AgentAction,
  AgentActionStatus,
  AgentActionType,
} from './entities/agent-action.entity';

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(AgentAction)
    private readonly actionRepository: Repository<AgentAction>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly listingService: ListingService,
    private readonly configService: ConfigService,
  ) {}

  async requestFarmerCreation(agentId: string, dto: AgentCreateFarmerDto) {
    const phoneNumber = dto.phoneNumber.trim();
    if (await this.userRepository.exists({ where: { phoneNumber } })) {
      throw new BadRequestException('A user already uses this phone number');
    }
    return this.createAction(
      AgentActionType.CREATE_FARMER,
      agentId,
      phoneNumber,
      dto,
    );
  }

  async requestDelegatedListing(agentId: string, dto: AgentListingRequestDto) {
    const farmerPhone = dto.farmerPhone.trim();
    const farmer = await this.userRepository.findOne({
      where: { phoneNumber: farmerPhone, role: UserType.FARMER },
    });
    if (!farmer) throw new NotFoundException('Farmer not found');
    const { farmerPhone: _farmerPhone, ...listing } = dto;
    return this.createAction(
      AgentActionType.CREATE_LISTING,
      agentId,
      farmerPhone,
      listing,
      farmer.id,
    );
  }

  async verify(agentId: string, dto: VerifyAgentActionDto) {
    const action = await this.actionRepository
      .createQueryBuilder('action')
      .addSelect('action.otpHash')
      .where('action.id = :id', { id: dto.actionId })
      .andWhere('action.agentId = :agentId', { agentId })
      .andWhere('action.status = :status', {
        status: AgentActionStatus.PENDING,
      })
      .getOne();
    if (!action) throw new NotFoundException('Pending agent action not found');

    if (action.expiresAt.getTime() < Date.now()) {
      action.status = AgentActionStatus.EXPIRED;
      await this.actionRepository.save(action);
      throw new BadRequestException('OTP has expired');
    }
    if (action.attempts >= 5) {
      throw new BadRequestException('OTP attempt limit reached');
    }

    action.attempts += 1;
    if (!(await bcrypt.compare(dto.otp, action.otpHash))) {
      await this.actionRepository.save(action);
      throw new BadRequestException('Invalid OTP');
    }

    const result =
      action.type === AgentActionType.CREATE_FARMER
        ? await this.completeFarmerCreation(action)
        : await this.completeDelegatedListing(action);

    action.status = AgentActionStatus.COMPLETED;
    action.completedAt = new Date();
    await this.actionRepository.save(action);
    return { message: 'Agent action completed', data: result };
  }

  async searchFarmers(query: SearchFarmersDto) {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserType.FARMER })
      .orderBy('user.name', 'ASC')
      .take(50);
    if (query.search?.trim()) {
      qb.andWhere(
        '(user.name ILIKE :search OR user.phoneNumber ILIKE :search)',
        {
          search: `%${query.search.trim()}%`,
        },
      );
    }
    const data = await qb.getMany();
    return {
      data: data.map((user) => ({
        id: user.id,
        _id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        landAmount: user.landAmount,
        address: user.address,
        verificationStatus: user.verificationStatus,
      })),
    };
  }

  async history(agentId: string) {
    const data = await this.actionRepository.find({
      where: { agentId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
    return { data: data.map(toApiEntity) };
  }

  private async completeFarmerCreation(action: AgentAction) {
    const payload = action.payload as unknown as AgentCreateFarmerDto;
    const response = await this.userService.create({
      ...payload,
      role: UserType.FARMER,
    });
    action.farmerId = response.data.id;
    return response.data;
  }

  private async completeDelegatedListing(action: AgentAction) {
    const farmer = await this.userRepository.findOne({
      where: { phoneNumber: action.farmerPhone, role: UserType.FARMER },
    });
    if (!farmer) throw new NotFoundException('Farmer not found');
    action.farmerId = farmer.id;
    const result = await this.listingService.createForOwner(
      farmer.id,
      action.payload as unknown as CreateListingDto,
      action.agentId,
    );
    return result.data;
  }

  private async createAction(
    type: AgentActionType,
    agentId: string,
    farmerPhone: string,
    payload: object,
    farmerId?: string,
  ) {
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const action = await this.actionRepository.save(
      this.actionRepository.create({
        type,
        status: AgentActionStatus.PENDING,
        agentId,
        farmerPhone,
        farmerId,
        payload: payload as Record<string, unknown>,
        otpHash: await bcrypt.hash(otp, 10),
        attempts: 0,
        expiresAt,
      }),
    );
    const development =
      this.configService.get<string>('NODE_ENV') !== 'production';
    return {
      message: 'OTP authorization requested',
      data: {
        actionId: action.id,
        expiresAt,
        ...(development ? { demoOtp: otp } : {}),
      },
    };
  }

  private generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
  }
}
