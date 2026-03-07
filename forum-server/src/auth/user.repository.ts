import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

const userSelect = {
  id: true,
  username: true,
  email: true,
  passwordHash: true,
  createdAt: true,
  profileImageKey: true,
  profileImageUrl: true
} satisfies Prisma.UserSelect;

type UserRow = Prisma.UserGetPayload<{
  select: typeof userSelect;
}>;

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  createUser(data: Prisma.UserCreateInput): Promise<UserRow> {
    return this.prisma.user.create({
      data,
      select: userSelect
    });
  }

  findById(userId: number): Promise<UserRow | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: userSelect
    });
  }

  findByUsername(username: string): Promise<UserRow | null> {
    return this.prisma.user.findUnique({
      where: { username },
      select: userSelect
    });
  }
} 