import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGenerateTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAccessToken(userId: number, username: string): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: userId,
        username: username,
      }, 
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }
    );
  }

  async generateRefreshToken(userId: number): Promise<string> {
    return this.jwtService.signAsync(
      { 
        sub: userId,
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );
  }
}