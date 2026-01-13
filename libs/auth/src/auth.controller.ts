import { Controller, Get, Post, Body, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { OtpDto } from './dto/otp.dto';
import { SentOtpDto } from './dto/sentOtp.dto';
import { AuthGuard } from '@nestjs/passport';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  getHello() {
    return { message: 'Welcome to Auth Library!' };
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto.email,registerDto.password,registerDto?.phone, registerDto?.whatsapp,registerDto?.firstName,registerDto?.MiddleName,registerDto?.lastName);
  }

  @Get('verify')
  async verify(@Query('token') token: string) {
    return this.authService.verifyRegistration(token);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('sent-otp')
  async sentOtp(@Body() loginDto: SentOtpDto) {
    return this.authService.sentOtp(loginDto.email, loginDto.phone, loginDto.type);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() loginDto: OtpDto) {
    return this.authService.verifyOtp(loginDto.email, loginDto.phone, loginDto.type,loginDto.otp);
  }

  @Post('refresh')
  async refreshToken(@Body('refreshToken') token: string) {
    return this.authService.refresh(token);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req) {
    return this.authService.logout(req.user?.uuid);
  }

}
