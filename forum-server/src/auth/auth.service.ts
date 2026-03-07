import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRepository } from './user.repository';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { SafeUser } from './dto/safeuser.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) {}

  async getMe(userId: number): Promise<SafeUser | null> {
    const user = await this.userRepository.findById(userId)

    if (!user) return null

    const { passwordHash, ...safeUser } = user
    return safeUser
  }

  async register(registerDto: RegisterDto): Promise<void>{
    const { username, email, password, password2 } = registerDto

    if (password !== password2) {
      throw new BadRequestException('확인 비밀번호가 일치하지 않습니다.');
    }
    
    // const salt = await bcrypt.genSalt()
    const passwordHash = await bcrypt.hash(password, 10); //숫자(10): saltRounds (권장)

    try {
      await this.userRepository.createUser({
        username,
        email,
        passwordHash
      });
    } catch (e) {
      if (e.code === 'P2002') {
        const target = e.meta?.target;
        // console.log(target)
        if (target.includes('username')) {
          throw new ConflictException('이미 존재하는 username입니다.');
        }
        if (target.includes('email')) {
          throw new ConflictException('이미 존재하는 email입니다.');
        }

        throw new ConflictException('중복된 값이 존재합니다.');
      }
      throw e;
    }
  }

  async login(loginDto: LoginDto): Promise<{accessToken: string}> {
    const { username, password } = loginDto

    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new ConflictException('존재하지 않는 username입니다.');
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new ConflictException('비밀번호가 일치하지 않습니다.');
    }

    const payload = { id: user.id }
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '15min',
    })

    // // access (기본값 사용)
    // await this.jwtService.signAsync(payload);

    // refresh (오버라이드)
    // await this.jwtService.signAsync(payload, {
    //   secret: process.env.JWT_REFRESH_SECRET,
    //   expiresIn: '7d',
    // });

    return { accessToken }
  }
  // async logout()
}