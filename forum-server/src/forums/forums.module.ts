import { Module } from '@nestjs/common';
import { PrismaModule } from '../infra/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ForumsService } from './forums.service';
import { ForumsController } from './forums.controller';
import { ForumRepository } from './forum.repository';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ForumsController],
  providers: [ForumsService, ForumRepository],
})
export class ForumsModule {}
