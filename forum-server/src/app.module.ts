import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ForumsModule } from './forums/forums.module';
import { PostsModule } from './posts/posts.module';
import { MeModule } from './me/me.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    ForumsModule,
    PostsModule,
    // MeModule
  ],
})
export class AppModule {}
