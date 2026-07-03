import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from '../auth/access-token.guard';
import type { AuthenticatedRequest } from '../auth/access-token.guard';
import {
  CreateUserDto,
  LoginDto,
  OtpStringDto,
  UpdateMyLocationDto,
  UpdateMyProfileDto,
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

  @Post('logout')
  @UseGuards(AccessTokenGuard)
  logout() {
    return {
      message: 'User logged out successfully',
      note: 'Remove the access token from the client.',
    };
  }

  @Get('get-my-profile')
  @UseGuards(AccessTokenGuard)
  getMyProfile(@Req() request: AuthenticatedRequest) {
    return this.userService.findProfile(request.user.id);
  }

  @Patch('profile')
  @UseGuards(AccessTokenGuard)
  updateMyProfile(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateMyProfileDto,
  ) {
    return this.userService.updateProfile(request.user.id, dto);
  }

  @Patch('location')
  @UseGuards(AccessTokenGuard)
  updateMyLocation(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateMyLocationDto,
  ) {
    return this.userService.updateLocation(request.user.id, dto);
  }
}
