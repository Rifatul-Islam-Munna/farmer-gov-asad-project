import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Brackets, Not, Repository } from 'typeorm';
import { toApiEntity } from '../lib/database/base.entity';
import {
  CreateUserDto,
  LoginDto,
  UpdateMyLocationDto,
  UpdateMyProfileDto,
} from './dto/user.dto';
import { User, UserType, VerificationStatus } from './entities/user.entity';

export type AccessPayload = {
  email: string;
  id: string;
  role: UserType;
  mobileNumber: string;
  verificationStatus: VerificationStatus;
};

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');
    if (!adminEmail || !adminPassword) return;

    const normalized = adminEmail.trim().toLowerCase();
    const existing = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.credentialHash')
      .where('LOWER(user.email) = :normalized', { normalized })
      .orWhere('user.phoneNumber = :normalized', { normalized })
      .getOne();

    const values: Partial<User> = {
      name: existing?.name || 'admin',
      email: normalized,
      phoneNumber: normalized,
      credentialHash: await bcrypt.hash(adminPassword, 10),
      role: UserType.ADMIN,
      verificationStatus: 'approved',
      isOtpVerified: true,
      documents: existing?.documents ?? [],
      planName: existing?.planName ?? 'Free',
      planFeatures: existing?.planFeatures ?? {},
    };
    await this.userRepository.save(
      this.userRepository.create({ ...(existing ?? {}), ...values }),
    );
  }

  async create(dto: CreateUserDto) {
    if (dto.role === UserType.ADMIN) {
      throw new ForbiddenException('Admin accounts cannot be publicly created');
    }

    const phoneNumber = dto.phoneNumber.trim();
    const email = dto.email?.trim().toLowerCase();
    const query = this.userRepository
      .createQueryBuilder('user')
      .where('user.phoneNumber = :phoneNumber', { phoneNumber });
    if (email) query.orWhere('LOWER(user.email) = :email', { email });
    if (await query.getExists()) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const verificationStatus: VerificationStatus =
      dto.role === UserType.FARMER ? 'approved' : 'pending';
    const user = await this.userRepository.save(
      this.userRepository.create({
        name: dto.name.trim(),
        phoneNumber,
        email,
        gender: dto.gender,
        role: dto.role,
        landAmount: dto.landAmount,
        documents: dto.documents ?? [],
        businessName: dto.businessName,
        shopName: dto.shopName,
        address: dto.address,
        verificationStatus,
        credentialHash: await bcrypt.hash(dto.password, 10),
        isOtpVerified: true,
        otpNumber: '000000',
        planName: 'Free',
        planFeatures: {},
      }),
    );

    const safeUser = this.safe(user);
    return {
      message: 'User created successfully',
      data: safeUser,
      user: safeUser,
      access_token: await this.signToken(user),
    };
  }

  async loginUser(dto: LoginDto) {
    const login = dto.phoneNumber.trim().toLowerCase();
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.credentialHash')
      .where('LOWER(user.phoneNumber) = :login', { login })
      .orWhere('LOWER(user.email) = :login', { login })
      .getOne();

    if (!user)
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    if (!(await bcrypt.compare(dto.password, user.credentialHash))) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    return {
      message: 'User logged in successfully',
      access_token: await this.signToken(user),
      user: this.safe(user),
    };
  }

  async verifyOtp(otp: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.otpNumber')
      .where('user.otpNumber = :otp', { otp })
      .getOne();
    if (!user)
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    user.isOtpVerified = true;
    user.otpNumber = null;
    await this.userRepository.save(user);
    const safeUser = this.safe(user);
    return {
      message: 'User verified successfully',
      data: safeUser,
      user: safeUser,
      access_token: await this.signToken(user),
    };
  }

  async findProfile(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    const monthKey = new Date().toISOString().slice(0, 7);
    if (user.monthlyUsageKey !== monthKey) {
      user.monthlyUsageKey = monthKey;
      user.monthlyEmailsUsed = 0;
      await this.userRepository.save(user);
    }
    return { data: this.safe(user) };
  }

  async updateProfile(id: string, dto: UpdateMyProfileDto) {
    const phoneNumber = dto.phoneNumber?.trim();
    const email = dto.email?.trim().toLowerCase();
    if (phoneNumber || email) {
      const qb = this.userRepository
        .createQueryBuilder('user')
        .where('user.id != :id', { id })
        .andWhere(
          new Brackets((inner) => {
            if (phoneNumber)
              inner.where('user.phoneNumber = :phoneNumber', { phoneNumber });
            if (email && phoneNumber) {
              inner.orWhere('LOWER(user.email) = :email', { email });
            } else if (email) {
              inner.where('LOWER(user.email) = :email', { email });
            }
          }),
        );
      if (await qb.getExists()) {
        throw new ConflictException('Phone number or email is already in use');
      }
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    Object.assign(user, {
      ...(dto.name != null ? { name: dto.name.trim() } : {}),
      ...(phoneNumber != null ? { phoneNumber } : {}),
      ...(email != null ? { email } : {}),
      ...(dto.gender != null ? { gender: dto.gender.trim() } : {}),
      ...(dto.landAmount != null ? { landAmount: dto.landAmount } : {}),
      ...(dto.documents != null ? { documents: dto.documents } : {}),
      ...(dto.businessName != null
        ? { businessName: dto.businessName.trim() }
        : {}),
      ...(dto.shopName != null ? { shopName: dto.shopName.trim() } : {}),
      ...(dto.address != null ? { address: dto.address.trim() } : {}),
    });
    await this.userRepository.save(user);
    return { message: 'Profile updated successfully', data: this.safe(user) };
  }

  async updateLocation(id: string, dto: UpdateMyLocationDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    user.location = {
      latitude: dto.latitude,
      longitude: dto.longitude,
      updatedAt: new Date().toISOString(),
    };
    await this.userRepository.save(user);
    return { message: 'Location saved successfully', data: this.safe(user) };
  }

  async verifyAccessToken(token: string) {
    try {
      return await this.jwtService.verifyAsync<AccessPayload>(token, {
        secret: this.configService.getOrThrow<string>('ACCESS_TOKEN'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private signToken(user: User) {
    return this.jwtService.signAsync(
      {
        email: user.email ?? '',
        id: user.id,
        role: user.role,
        mobileNumber: user.phoneNumber,
        verificationStatus: user.verificationStatus,
      } satisfies AccessPayload,
      {
        secret: this.configService.getOrThrow<string>('ACCESS_TOKEN'),
        expiresIn: '10d',
      },
    );
  }

  private safe(user: User) {
    const {
      credentialHash: _credentialHash,
      otpNumber: _otpNumber,
      ...safe
    } = user;
    return toApiEntity(safe as User);
  }
}
