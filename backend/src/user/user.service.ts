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
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import {
  CreateUserDto,
  LoginDto,
  UpdateMyLocationDto,
  UpdateMyProfileDto,
} from './user.dto';
import { USER_MODEL, User, UserType } from './user.entity';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

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
    @InjectModel(USER_MODEL)
    private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (!adminEmail || !adminPassword) {
      return;
    }

    const existing = await this.userModel.findOne({
      $or: [{ email: adminEmail }, { phoneNumber: adminEmail }],
    });
    const credentialHash = await bcrypt.hash(adminPassword, 10);

    if (existing) {
      existing.name = existing.name || 'admin';
      existing.email = adminEmail;
      existing.phoneNumber = adminEmail;
      existing.credentialHash = credentialHash;
      existing.role = UserType.ADMIN;
      existing.verificationStatus = 'approved';
      existing.isOtpVerified = true;
      await existing.save();
      return;
    }

    await this.userModel.create({
      name: 'admin',
      email: adminEmail,
      phoneNumber: adminEmail,
      credentialHash,
      role: UserType.ADMIN,
      verificationStatus: 'approved',
      isOtpVerified: true,
    });
  }

  async create(dto: CreateUserDto) {
    if (dto.role === UserType.ADMIN) {
      throw new ForbiddenException('Admin accounts cannot be publicly created');
    }

    const email = dto.email?.trim().toLowerCase();
    const exists = await this.userModel
      .findOne({
        $or: [
          { phoneNumber: dto.phoneNumber.trim() },
          ...(email ? [{ email }] : []),
        ],
      })
      .lean();

    if (exists) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const verificationStatus: VerificationStatus =
      dto.role === UserType.FARMER ? 'approved' : 'pending';

    const user = await this.userModel.create({
      name: dto.name.trim(),
      phoneNumber: dto.phoneNumber.trim(),
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
    });

    const { credentialHash: _credentialHash, ...safeUser } = user.toObject();
    const access_token = await this.signToken(safeUser);

    return {
      message: 'User created successfully',
      data: safeUser,
      user: safeUser,
      access_token,
    };
  }

  async loginUser(dto: LoginDto) {
    const login = dto.phoneNumber.trim().toLowerCase();
    const user = await this.userModel
      .findOne({
        $or: [{ phoneNumber: login }, { email: login }],
      })
      .lean();

    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const match = await bcrypt.compare(dto.password, user.credentialHash);
    if (!match) {
      throw new HttpException('Invalid credentials', HttpStatus.BAD_REQUEST);
    }

    const { credentialHash: _credentialHash, ...safeUser } = user;
    const access_token = await this.signToken(safeUser);

    return {
      message: 'User logged in successfully',
      access_token,
      user: safeUser,
    };
  }

  async verifyOtp(otp: string) {
    const user = await this.userModel
      .findOneAndUpdate(
        { otpNumber: otp },
        { isOtpVerified: true, otpNumber: null },
        { returnDocument: 'after' },
      )
      .lean();

    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const { credentialHash: _credentialHash, ...safeUser } = user;
    const access_token = await this.signToken(safeUser);

    return {
      message: 'User verified successfully',
      data: safeUser,
      user: safeUser,
      access_token,
    };
  }

  async findProfile(id: string) {
    const monthKey = new Date().toISOString().slice(0, 7);
    const userRecord = await this.userModel
      .findById(id)
      .select('-credentialHash -otpNumber');

    if (userRecord && userRecord.monthlyUsageKey !== monthKey) {
      userRecord.monthlyUsageKey = monthKey;
      userRecord.monthlyEmailsUsed = 0;
      await userRecord.save();
    }

    const user = userRecord?.toObject();
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return { data: user };
  }

  async updateProfile(id: string, dto: UpdateMyProfileDto) {
    const phoneNumber = dto.phoneNumber?.trim();
    const email = dto.email?.trim().toLowerCase();
    const duplicateFilters: Record<string, string>[] = [];
    if (phoneNumber) duplicateFilters.push({ phoneNumber });
    if (email) duplicateFilters.push({ email });

    if (duplicateFilters.length > 0) {
      const duplicate = await this.userModel
        .findOne({ _id: { $ne: id }, $or: duplicateFilters })
        .lean();
      if (duplicate) {
        throw new ConflictException('Phone number or email is already in use');
      }
    }

    const set: Record<string, unknown> = {};
    if (dto.name != null) set.name = dto.name.trim();
    if (phoneNumber != null) set.phoneNumber = phoneNumber;
    if (email != null) set.email = email;
    if (dto.gender != null) set.gender = dto.gender.trim();
    if (dto.landAmount != null) set.landAmount = dto.landAmount;
    if (dto.documents != null) set.documents = dto.documents;
    if (dto.businessName != null) set.businessName = dto.businessName.trim();
    if (dto.shopName != null) set.shopName = dto.shopName.trim();
    if (dto.address != null) set.address = dto.address.trim();

    const data = await this.userModel
      .findByIdAndUpdate(
        id,
        { $set: set },
        { returnDocument: 'after', runValidators: true },
      )
      .select('-credentialHash -otpNumber')
      .lean();

    if (!data) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return { message: 'Profile updated successfully', data };
  }

  async updateLocation(id: string, dto: UpdateMyLocationDto) {
    const data = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            location: {
              latitude: dto.latitude,
              longitude: dto.longitude,
              updatedAt: new Date(),
            },
          },
        },
        { returnDocument: 'after', runValidators: true },
      )
      .select('-credentialHash -otpNumber')
      .lean();

    if (!data) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return { message: 'Location saved successfully', data };
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

  private signToken(user: Record<string, any>) {
    return this.jwtService.signAsync(
      {
        email: user.email ?? '',
        id: user._id?.toString(),
        role: user.role as UserType,
        mobileNumber: user.phoneNumber,
        verificationStatus:
          (user.verificationStatus as VerificationStatus | undefined) ??
          'approved',
      } satisfies AccessPayload,
      {
        secret: this.configService.getOrThrow<string>('ACCESS_TOKEN'),
        expiresIn: '10d',
      },
    );
  }
}
