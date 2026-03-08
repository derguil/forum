import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserRepository } from "./user.repository";
import { User } from '@prisma/client';

export type JwtAccessPayload = {
  sub: number,
  username: string,
  iat?: number;
  exp?: number;
}

export type JwtRefreshPayload = {
  sub: number,
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor() {
    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtAccessPayload) {
    return payload;
  }
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.refresh_token,
      ]),
      secretOrKey: secret,
      ignoreExpiration: false,
    })
  }
  validate(payload: JwtRefreshPayload) {
    return payload
  }
} 