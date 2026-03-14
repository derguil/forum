import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../infra/prisma/prisma.service';

const postSelect = {
  id: true,
  userId: true,
  forumId: true,
  title: true,
  content: true,
  commentCount: true,
  voteCount: true,
  scrapCount: true,
  createdAt: true,
  updatedAt: true,
  isDeleted: true,
  deletedAt: true,
  images: {
    select: {
      key: true,
      url: true,
    },
  },
  user: {
    select: {
      id: true,
      username: true,
      profileImageKey: true,
      profileImageUrl: true,
    },
  },
} satisfies Prisma.PostSelect;

type PostListItem = Prisma.PostGetPayload<{
  select: typeof postSelect;
}>;

@Injectable()
export class PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  createPost(data: Prisma.PostCreateInput): Promise<PostListItem> {
    return this.prisma.post.create({
      data,
      select: postSelect,
    });
  }

  findPostsByForumId(forumId: number, page: number, limit: number): Promise<PostListItem[]> {
    return this.prisma.post.findMany({
      where: { forumId },
      select: postSelect,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findPostByPostId(postId: number): Promise<PostListItem | null> {
    return this.prisma.post.findUnique({
      where: { id: postId },
      select: postSelect,
    });
  }

  updatePost(postId: number, data: Prisma.PostUpdateInput): Promise<PostListItem> {
    return this.prisma.post.update({
      where: { id: postId },
      data,
      select: postSelect,
    });
  }

  softDeletePostByPostId(postId: number): Promise<PostListItem> {
    return this.prisma.post.update({
      where: { id: postId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
      select: postSelect,
    });
  }

  // hardDeletePostByPostId(postId: number): Promise<PostListItem> {
  //   return this.prisma.post.delete({
  //     where: { id: postId },
  //     select: postSelect,
  //   });
  // }
}