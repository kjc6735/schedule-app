import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorator/public.decorator';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/login.request.dto';
import { RegisterRequestDto } from './dto/register.request.dto';

@ApiTags('인증')
@Controller('auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({
    status: 201,
    description: '로그인 성공',
    schema: {
      properties: {
        accessToken: { type: 'string', description: 'JWT 액세스 토큰' },
        refreshToken: { type: 'string', description: 'JWT 리프레시 토큰' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '아이디 또는 비밀번호 불일치' })
  async login(@Body() loginRequestDto: LoginRequestDto) {
    return this.authService.login(loginRequestDto);
  }

  @Post('register')
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 400, description: '비밀번호 불일치' })
  @ApiResponse({ status: 401, description: '중복된 아이디 또는 휴대폰 번호' })
  @ApiResponse({ status: 500, description: '서버 오류' })
  async register(@Body() registerRequestDto: RegisterRequestDto) {
    return this.authService.register(registerRequestDto);
  }
}
