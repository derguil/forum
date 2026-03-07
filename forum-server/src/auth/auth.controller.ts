import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './get-user.decorator';
import type { JwtPayload } from './jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @Get('me')
  @UseGuards(AuthGuard('jwt-access'))
  getMe(@GetUser() jwtPayload: JwtPayload) {
    return this.authService.getMe(jwtPayload.id);
  }

  @Post('register')
  async register(@Body() registerdto: RegisterDto) {
    await this.authService.register(registerdto);
    return {
      success: true,
      message: '회원가입 성공'
    };
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken } = await this.authService.login(loginDto);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: false, // https에서만 (개발중이면 false 가능)
      sameSite: 'strict',
      maxAge: 1000 * 60 * 15, // 15분 
    });

    return {
      success: true,
      message: '로그인 성공'
    };
  }
  


  // @UseGuards(AuthGuard('jwt-access'))
  // @Post('logout')
  // logout(@Body() id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.logout(+id, updateAuthDto);
  // }
}
