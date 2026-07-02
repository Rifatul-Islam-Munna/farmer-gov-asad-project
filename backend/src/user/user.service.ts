import {
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
import { CreateUserDto, LoginDto } from './user.dto';
import {
  USER_MODEL,
  UserDocument,
  UserType,
} from './user.entity';

export type AccessPayload = {
  email: string;
  id: string;
  role: string;
  mobileNumber: string;
};

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectModel(USER_MODEL)
    private readonly userModel: Model<UserDocument>,
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
      isOtpVerified: true,
    });
  }

  async create(dto: CreateUserDto) {
    const email = dto.email?.trim().toLowerCase();
    const exists = await this.userModel
      .findOne({
        $or: [
          { phoneNumber: dto.phoneNumber },
          ...(email ? [{ email }] : []),
        ],
      })
      .lean();

    if (exists) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userModel.create({
      name: dto.name,
      phoneNumber: dto.phoneNumber,
      email,
      gender: dto.gender,
      role: dto.role ?? UserType.USER,
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
      access_token,
    };
  }

  async findProfile(id: string) {
    const monthKey = new Date().toISOString().slice(0, 7);
    const userRecord = await this.userModel
      .findById(id)
      .select('-credentialHash');

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
        role: user.role,
        mobileNumber: user.phoneNumber,
      },
      {
        secret: this.configService.getOrThrow<string>('ACCESS_TOKEN'),
        expiresIn: '10d',
      },
    );
  }
}
