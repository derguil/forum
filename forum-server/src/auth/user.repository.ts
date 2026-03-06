// import { Injectable } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import { Prisma } from '@prisma/client';

// const userSelect = {
//   id: true,
//   username: true,
//   password: true,
//   createdAt: true,
// } satisfies Prisma.UserSelect;

// type UserRow = Prisma.UserGetPayload<{
//   select: typeof userSelect;
// }>;

// @Injectable()
// export class UserRepository {
//   constructor(private readonly prisma: PrismaService) {}

//   createUser(data: Prisma.UserCreateInput): Promise<UserRow> {
//     return this.prisma.user.create({
//       data,
//       select: userSelect
//     });
//   }

//   findByUsername(username: string): Promise<UserRow | null> {
//     return this.prisma.user.findUnique({
//       where: { username },
//       select: userSelect
//     });
//   }
// } 