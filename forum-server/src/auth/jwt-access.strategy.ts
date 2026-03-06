import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserRepository } from "./user.repository";
import { User } from '@prisma/client';

export interface JwtPayload {
  id: number;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(
      private readonly userRepository: UserRepository
  ) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.access_token,
      ]),
      secretOrKey: secret
    })
  }
  validate(payload: JwtPayload) {
    return payload;
  }
  // async validate(payload) { //refresh
  //     const { username } = payload;
  //     const user: User | null = await this.userRepository.findByUsername({ username });
  //     if(!user) {
  //         throw new UnauthorizedException();
  //     }
  //     return user;
  // }
}