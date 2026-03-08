import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
// import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from './user.repository';
import { JwtAccessStrategy, JwtRefreshStrategy } from './jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthGenerateTokenService } from './auth.generate-token.service';

@Module({
  imports: [
    PrismaModule,
    // PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, JwtAccessStrategy, JwtRefreshStrategy, AuthGenerateTokenService],
  exports: [JwtModule, JwtAccessStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
