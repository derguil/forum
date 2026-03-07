import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserRepository } from "./user.repository";
import { User } from '@prisma/client';

export type JwtPayload = {
  id: number
}

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(
      private readonly userRepository: UserRepository
  ) {
    const secret = process.env.JWT_REFRESH_SECRET;
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