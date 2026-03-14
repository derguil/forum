import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/infra/prisma/prisma.service';

@Injectable()
export class ImageAssetRepository {
  constructor(private readonly prisma: PrismaService) {}

  findKeysByPostId(postId: number, keys: string[]) {
    if (keys.length === 0) {
      return Promise.resolve([]);
    }

    return this.prisma.imageAsset.findMany({
      where: {
        postId,
        key: { in: keys },
      },
      select: {
        key: true,
      },
    });
  }

  deleteByKeys(postId: number, keys: string[]) {
    if (keys.length === 0) {
      return Promise.resolve({ count: 0 });
    }

    return this.prisma.imageAsset.deleteMany({
      where: {
        postId,
        key: { in: keys },
      },
    });
  }

  createMany(data: Prisma.ImageAssetCreateManyInput[]) {
    if (data.length === 0) {
      return Promise.resolve({ count: 0 });
    }

    return this.prisma.imageAsset.createMany({
      data,
    });
  }
}