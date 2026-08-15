import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('set-pin')
  @HttpCode(HttpStatus.OK)
  async setPin(@Body() body: { userId: string; pin: string }) {
    console.log('📥 Set PIN request:', body);
    return this.authService.setPin(body.userId, body.pin);
  }

  @Post('verify-pin')
  @HttpCode(HttpStatus.OK)
  async verifyPin(@Body() body: { userId: string; pin: string }) {
    console.log('📥 Verify PIN request:', body);
    return this.authService.verifyPin(body.userId, body.pin);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@Body() body: { userId: string; oldPassword?: string; newPassword?: string }) {
    console.log('📥 Change Password request for user:', body.userId);
    return this.authService.changePassword(body.userId, body.oldPassword, body.newPassword);
  }
}
