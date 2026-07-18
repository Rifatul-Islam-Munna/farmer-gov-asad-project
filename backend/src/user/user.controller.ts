import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AccessTokenGuard } from '../auth/access-token.guard';
import { AuthChallengeService } from '../auth/auth-challenge.service';
import type { AuthenticatedRequest } from '../auth/access-token.guard';
import {
  PasswordResetConfirmDto,
  PasswordResetRequestDto,
  VerificationCodeDto,
} from './dto/auth-flow.dto';
import {
  ChangeActiveRoleDto,
  CreateUserDto,
  LoginDto,
  OtpStringDto,
  RefreshTokenDto,
  UpdateMyLocationDto,
  UpdateMyProfileDto,
} from './dto/user.dto';
import { UserService } from './user.service';

@ApiTags('Users and Authentication')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authChallengeService: AuthChallengeService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Register a new user account' })
  create(@Body() dto: CreateUserDto, @Req() request: Request) {
    return this.userService.create(dto, this.sessionContext(request));
  }

  @Post('login-user')
  @ApiOperation({ summary: 'Login and receive access/refresh tokens' })
  login(@Body() dto: LoginDto, @Req() request: Request) {
    return this.userService.loginUser(dto, this.sessionContext(request));
  }

  @Post('refresh-token')
  @ApiOperation({
    summary: 'Rotate a refresh token and issue a new token pair',
  })
  refresh(@Body() dto: RefreshTokenDto, @Req() request: Request) {
    return this.userService.refresh(
      dto.refreshToken,
      this.sessionContext(request),
    );
  }

  @Post('request-phone-verification')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  requestPhoneVerification(@Req() request: AuthenticatedRequest) {
    return this.authChallengeService.requestPhoneVerification(request.user.id);
  }

  @Post('confirm-phone-verification')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  confirmPhoneVerification(
    @Req() request: AuthenticatedRequest,
    @Body() dto: VerificationCodeDto,
  ) {
    return this.authChallengeService.confirmPhoneVerification(
      request.user.id,
      dto.code,
    );
  }

  @Post('password-reset/request')
  requestPasswordReset(@Body() dto: PasswordResetRequestDto) {
    return this.authChallengeService.requestPasswordReset(dto.destination);
  }

  @Post('password-reset/confirm')
  confirmPasswordReset(@Body() dto: PasswordResetConfirmDto) {
    return this.authChallengeService.confirmPasswordReset(
      dto.destination,
      dto.code,
      dto.newPassword,
    );
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: OtpStringDto) {
    return this.userService.verifyOtp(dto.otp);
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  logout(@Req() request: AuthenticatedRequest) {
    return this.userService.logout(request.user.id);
  }

  @Patch('active-role')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  changeActiveRole(
    @Req() request: AuthenticatedRequest,
    @Body() dto: ChangeActiveRoleDto,
  ) {
    return this.userService.changeActiveRole(request.user.id, dto.role);
  }

  @Get('get-my-profile')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  getMyProfile(@Req() request: AuthenticatedRequest) {
    return this.userService.findProfile(request.user.id);
  }

  @Patch('profile')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  updateMyProfile(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateMyProfileDto,
  ) {
    return this.userService.updateProfile(request.user.id, dto);
  }

  @Patch('location')
  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  updateMyLocation(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateMyLocationDto,
  ) {
    return this.userService.updateLocation(request.user.id, dto);
  }

  private sessionContext(request: Request) {
    const forwardedFor = request.header('x-forwarded-for');
    return {
      ipAddress: forwardedFor?.split(',')[0]?.trim() || request.ip,
      userAgent: request.header('user-agent')?.slice(0, 255),
    };
  }
}
