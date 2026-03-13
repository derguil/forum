import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PostsRepository } from './posts.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { GetPostsDto } from './dto/get-posts.dto';
import { S3clientService } from 'src/infra/s3client/s3client.service';
import { Post } from '@prisma/client';
import { ForumsRepository } from 'src/forums/forums.repository';

@Injectable()
export class PostsService {
  constructor(
    private readonly forumsRepository: ForumsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly s3ClientService: S3clientService,
  ) {}

  async addPost(userId: number, createPostDto: CreatePostDto, files: Express.Multer.File[]): Promise<Post> {
    const { forumId, title, content } = createPostDto;
    const forum = await this.forumsRepository.findByForumId(forumId)
    if (!forum) {
      throw new NotFoundException('Forum not found');
    }
    try {
      return await this.postsRepository.createPost({
        title,
        content,
        user: { connect: { id: userId } },
        forum: { connect: { id: forumId } },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Forum not found');
      }
      throw error;
    }
  }

  async getPosts(getPostsDto: GetPostsDto): Promise<Post[]> {
    const { forumId, page, limit } = getPostsDto;
    return await this.postsRepository.findPostsByForumId(forumId, page, limit)
  }

  async getPostById(postId: number): Promise<Post> {
    const post = await this.postsRepository.findPostByPostId(postId)
    if (!post) {
      throw new NotFoundException('post not found');
    }
    return post;
  }

  async updatePost(userId: number, postId: number, updatePostDto: UpdatePostDto, files: Express.Multer.File[]): Promise<Post> {
    const post = await this.postsRepository.findPostByPostId(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.userId !== userId) {
      throw new ForbiddenException('No permission');
    }
    return this.postsRepository.updatePost(postId, {
      ...updatePostDto
    });
  }

  async softDeletePost(userId: number, postId: number): Promise<Post> {
    const post = await this.postsRepository.findPostByPostId(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.userId !== userId) {
      throw new ForbiddenException('No permission');
    }
    return this.postsRepository.softDeletePostByPostId(postId);
  }
  
  // async hardDeletePost(userId: number, postId: number): Promise<Post> {
  //   const post = await this.postsRepository.findPostByPostId(postId);
  //   if (!post) {
  //     throw new NotFoundException('Post not found');
  //   }
  //   if (post.userId !== userId) {
  //     throw new ForbiddenException('No permission');
  //   }
  //   return this.postsRepository.hardDeletePostByPostId(postId);
  // }



  // async addPostLike(postId: number) {
  //   void postId;
  //   throw new Error('Not implemented');
  // }

  // async removePostLike(postId: number) {
  //   void postId;
  //   throw new Error('Not implemented');
  // }



  // async addPostScrap(postId: number) {
  //   void postId;
  //   throw new Error('Not implemented');
  // }

  // async removePostScrap(postId: number) {
  //   void postId;
  //   throw new Error('Not implemented');
  // }
}
