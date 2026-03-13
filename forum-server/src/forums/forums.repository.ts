import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma/prisma.service';
import { Forum, Prisma } from '@prisma/client';

const forumSelect = {
  id: true,
  userId: true,
  title: true,
  createdAt: true,
} satisfies Prisma.ForumSelect

type ForumListItem = Prisma.ForumGetPayload<{
  select: typeof forumSelect;
}>;

@Injectable()
export class ForumsRepository {
  constructor(private readonly prisma: PrismaService) {}

  createForum(data: Prisma.ForumCreateInput): Promise<ForumListItem> {
    return this.prisma.forum.create({
      data,
      select: forumSelect,
    });
  }

  findForums(): Promise<ForumListItem[]> {
    return this.prisma.forum.findMany({
      select: forumSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  findByForumId(forumId: number): Promise<ForumListItem | null> {
    return this.prisma.forum.findUnique({
      where: { id: forumId },
      select: forumSelect,
    });
  }
}