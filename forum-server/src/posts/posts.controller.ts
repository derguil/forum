import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseInterceptors, UploadedFiles, ParseFilePipe, FileTypeValidator, MaxFileSizeValidator, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { GetPostsDto } from './dto/get-posts.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../common/decoraters/get-user.decorator';
import type { JwtAccessPayload } from '../auth/jwt.strategy';
import { FilesInterceptor } from '@nestjs/platform-express';
import { createPostImageFilesPipe } from 'src/common/pipes/post-image-files.pipe';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt-access'))  
  @UseInterceptors(FilesInterceptor('files', 20))
  addPost(
    @GetUser() jwtAccessPayload: JwtAccessPayload,
    @UploadedFiles(createPostImageFilesPipe(false)) files: Express.Multer.File[],
    @Body() createPostDto: CreatePostDto) {
    return this.postsService.addPost(jwtAccessPayload.sub, createPostDto, files);
  }

  @Get()
  getPosts(@Query() getPostsDto: GetPostsDto) {
    return this.postsService.getPosts(getPostsDto);
  }

  @Get('/:postId')
  getPostById(@Param('postId', ParseIntPipe) postId: number) {
    return this.postsService.getPostById(postId);
  }

  @Patch('/:postId')
  @UseGuards(AuthGuard('jwt-access'))
  @UseInterceptors(FilesInterceptor('files', 20))
  updatePost(
    @GetUser() jwtAccessPayload: JwtAccessPayload,
    @Param('postId', ParseIntPipe) postId: number,
    @UploadedFiles(createPostImageFilesPipe(false)) files: Express.Multer.File[],
    @Body() updatePostDto: UpdatePostDto
  ) {
    return this.postsService.updatePost(jwtAccessPayload.sub, postId, updatePostDto, files);
  }

  @Delete('/:postId')
  @UseGuards(AuthGuard('jwt-access'))
  softDeletePost(
    @GetUser() jwtAccessPayload: JwtAccessPayload,
    @Param('postId', ParseIntPipe) postId: number
  ) {
    return this.postsService.softDeletePost(jwtAccessPayload.sub, postId);
  }

  // @Delete('/admin/posts/:postId')
  // @UseGuards(AuthGuard('jwt-access'))
  // hardDeletePost(
  //   @GetUser() jwtAccessPayload: JwtAccessPayload,
  //   @Param('postId', ParseIntPipe) postId: number
  // ) {
  //   return this.postsService.hardDeletePost(jwtAccessPayload.sub, postId);
  // }



  // @Post('/:postId/likes')
  // addLike(@Param('postId', ParseIntPipe) postId: number) {
  //   return this.postsService.addPostLike(postId);
  // }

  // @Delete('/:postId/likes')
  // removeLike(@Param('postId', ParseIntPipe) postId: number) {
  //   return this.postsService.removePostLike(postId);
  // }



  // @Post('/:postId/scrap')
  // addScrap(@Param('postId', ParseIntPipe) postId: number) {
  //   return this.postsService.addPostScrap(postId);
  // }

  // @Delete('/:postId/scrap')
  // removeScrap(@Param('postId', ParseIntPipe) postId: number) {
  //   return this.postsService.removePostScrap(postId);
  // }
}
