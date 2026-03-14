import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostRepository } from './post.repository';
import { PrismaModule } from 'src/infra/prisma/prisma.module';
import { S3clientModule } from 'src/infra/s3client/s3client.module';
import { ForumRepository } from 'src/forums/forum.repository';
import { ImageAssetRepository } from './image-asset.repository';
import { ImageAssetService } from './image-asset.service';

@Module({
  imports: [
    PrismaModule,
    S3clientModule
  ],
  controllers: [PostsController],
  providers: [PostsService, PostRepository, ForumRepository, ImageAssetRepository, ImageAssetService],
})
export class PostsModule {}
