import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostsRepository } from './posts.repository';
import { PrismaModule } from 'src/infra/prisma/prisma.module';
import { S3clientModule } from 'src/infra/s3client/s3client.module';
import { ForumsRepository } from 'src/forums/forums.repository';

@Module({
  imports: [
    PrismaModule,
    S3clientModule
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsRepository, ForumsRepository],
})
export class PostsModule {}
