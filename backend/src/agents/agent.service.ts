import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { CreateListingDto } from '../listings/listing.dto';
import { ListingService } from '../listings/listing.service';
import { USER_MODEL, User, UserType } from '../user/user.entity';
import { UserService } from '../user/user.service';
import {
  AgentCreateFarmerDto,
  AgentListingRequestDto,
  SearchFarmersDto,
  VerifyAgentActionDto,
} from './agent.dto';
import {
  AGENT_ACTION_MODEL,
  AgentAction,
  AgentActionStatus,
  AgentActionType,
} from './agent-action.entity';

@Injectable()
export class AgentService {
  constructor(
    @InjectModel(AGENT_ACTION_MODEL)
    private readonly actionModel: Model<AgentAction>,
    @InjectModel(USER_MODEL)
    private readonly userModel: Model<User>,
    private readonly userService: UserService,
    private readonly listingService: ListingService,
    private readonly configService: ConfigService,
  ) {}

  async requestFarmerCreation(agentId: string, dto: AgentCreateFarmerDto) {
    const phoneNumber = dto.phoneNumber.trim();
    if (await this.userModel.exists({ phoneNumber })) {
      throw new BadRequestException('A user already uses this phone number');
    }

    return this.createAction(
      AgentActionType.CREATE_FARMER,
      agentId,
      phoneNumber,
      dto,
    );
  }

  async requestDelegatedListing(
    agentId: string,
    dto: AgentListingRequestDto,
  ) {
    const farmerPhone = dto.farmerPhone.trim();
    const farmer = await this.userModel
      .findOne({ phoneNumber: farmerPhone, role: UserType.FARMER })
      .lean();
    if (!farmer) {
      throw new NotFoundException('Farmer not found');
    }

    const { farmerPhone: _farmerPhone, ...listing } = dto;
    return this.createAction(
      AgentActionType.CREATE_LISTING,
      agentId,
      farmerPhone,
      listing,
      farmer._id.toString(),
    );
  }

  async verify(agentId: string, dto: VerifyAgentActionDto) {
    const action = await this.actionModel.findOne({
      _id: dto.actionId,
      agentId,
      status: AgentActionStatus.PENDING,
    });
    if (!action) {
      throw new NotFoundException('Pending agent action not found');
    }
    if (action.expiresAt.getTime() < Date.now()) {
      action.status = AgentActionStatus.EXPIRED;
      await action.save();
      throw new BadRequestException('OTP has expired');
    }
    if (action.attempts >= 5) {
      throw new BadRequestException('OTP attempt limit reached');
    }

    action.attempts += 1;
    const valid = await bcrypt.compare(dto.otp, action.otpHash);
    if (!valid) {
      await action.save();
      throw new BadRequestException('Invalid OTP');
    }

    const result =
      action.type === AgentActionType.CREATE_FARMER
        ? await this.completeFarmerCreation(action)
        : await this.completeDelegatedListing(action);

    action.status = AgentActionStatus.COMPLETED;
    action.completedAt = new Date();
    await action.save();

    return { message: 'Agent action completed', data: result };
  }

  async searchFarmers(query: SearchFarmersDto) {
    const filter: Record<string, unknown> = { role: UserType.FARMER };
    if (query.search?.trim()) {
      const pattern = new RegExp(this.escape(query.search.trim()), 'i');
      filter.$or = [{ name: pattern }, { phoneNumber: pattern }];
    }

    const data = await this.userModel
      .find(filter)
      .select('name phoneNumber landAmount address verificationStatus')
      .sort({ name: 1 })
      .limit(50)
      .lean();
    return { data };
  }

  async history(agentId: string) {
    const data = await this.actionModel
      .find({ agentId })
      .select('-otpHash')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return { data };
  }

  private async completeFarmerCreation(action: AgentAction) {
    const payload = action.payload as unknown as AgentCreateFarmerDto;
    const response = await this.userService.create({
      ...payload,
      role: UserType.FARMER,
    });
    action.farmerId = String(response.data._id);
    return response.data;
  }

  private async completeDelegatedListing(action: AgentAction) {
    const farmer = await this.userModel.findOne({
      phoneNumber: action.farmerPhone,
      role: UserType.FARMER,
    });
    if (!farmer) {
      throw new NotFoundException('Farmer not found');
    }

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
    payload: Record<string, unknown>,
    farmerId?: string,
  ) {
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const action = await this.actionModel.create({
      type,
      status: AgentActionStatus.PENDING,
      agentId,
      farmerPhone,
      farmerId,
      payload,
      otpHash: await bcrypt.hash(otp, 10),
      attempts: 0,
      expiresAt,
    });

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

  private escape(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
