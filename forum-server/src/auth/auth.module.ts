import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
// import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from './user.repository';
import { JwtAccessStrategy } from './jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    // PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, JwtAccessStrategy],
  exports: [JwtModule, JwtAccessStrategy],
})
export class AuthModule {}
