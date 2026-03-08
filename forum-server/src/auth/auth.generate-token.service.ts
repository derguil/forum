import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGenerateTokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(userId: number, username: string): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: userId,
        username: username,
      }, 
      {
        secret: process.env.JWT_ACCESS_SECRET,
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
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      },
    );
  }
}