import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import {
  CreateUserDto,
  FindOneTokenDto,
  LoginDto,
  OtpStringDto,
} from './user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Post('login-user')
  login(@Body() dto: LoginDto) {
    return this.userService.loginUser(dto);
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: OtpStringDto) {
    return this.userService.verifyOtp(dto.otp);
  }

  @Post('login-user-with-google')
  loginWithGoogle(@Body() dto: FindOneTokenDto) {
    return this.userService.loginUser({
      phoneNumber: dto.id,
      password: dto.id,
    });
  }

  @Post('logout')
  async logout(@Req() request: Request) {
    const token = this.getAccessToken(request);
    await this.userService.verifyAccessToken(token);

    return {
      message: 'User logged out successfully',
      note: 'Remove the access token from the client.',
    };
  }

  @Get('get-my-profile')
  async getMyProfile(@Req() request: Request) {
    const token = this.getAccessToken(request);
    const payload = await this.userService.verifyAccessToken(token);
    return this.userService.findProfile(payload.id);
  }

  private getAccessToken(request: Request) {
    const headerToken = request.headers.access_token;
    const authorization = request.headers.authorization;
    const bearerToken = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : undefined;
    const token =
      (Array.isArray(headerToken) ? headerToken[0] : headerToken) ??
      bearerToken;

    if (!token) {
      throw new UnauthorizedException('No token found');
    }

    return token;
  }
}
