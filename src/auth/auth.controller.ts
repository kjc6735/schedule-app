import { Body, Controller, Post } from '@nestjs/common';
import { Public } from 'src/common/decorator/public.decorator';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/login.request.dto';
import { RegisterRequestDto } from './dto/register.request.dto';

@Controller('auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginRequestDto: LoginRequestDto) {
    return this.authService.login(loginRequestDto);
  }
  @Post('register')
  async register(@Body() registerRequestDto: RegisterRequestDto) {
    return this.authService.register(registerRequestDto);
  }
}
