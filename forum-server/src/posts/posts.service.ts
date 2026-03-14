import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PostRepository } from './post.repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { GetPostsDto } from './dto/get-posts.dto';
import { S3clientService } from 'src/infra/s3client/s3client.service';
import { Post } from '@prisma/client';
import { ForumRepository } from 'src/forums/forum.repository';
import { ImageAssetRepository } from './image-asset.repository';
import { ImageAssetService } from './image-asset.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly forumRepository: ForumRepository,
    private readonly postRepository: PostRepository,
    private readonly s3ClientService: S3clientService,
    private readonly imageAssetRepository: ImageAssetRepository,
    private readonly imageAssetService: ImageAssetService,
  ) {}

  async addPost(userId: number, createPostDto: CreatePostDto, files: Express.Multer.File[]): Promise<Post> {
    const { forumId, title, content } = createPostDto;
    const forum = await this.forumRepository.findByForumId(forumId)
    if (!forum) {
      throw new NotFoundException('Forum not found');
    }
    // try {
    //   return await this.postRepository.createPost({
    //     title,
    //     content,
    //     user: { connect: { id: userId } },
    //     forum: { connect: { id: forumId } },
    //   });
    // } catch (error) {
    //   if (error.code === 'P2025') {
    //     throw new NotFoundException('Forum not found');
    //   }
    //   throw error;
    // }
    const createdPost = await this.postRepository.createPost({
      title,
      content,
      user: { connect: { id: userId } },
      forum: { connect: { id: forumId } },
    });

    if (files.length > 0) {
      const uploadedImages = await this.s3ClientService.uploadFiles(files, userId);
      await this.imageAssetRepository.createMany(
        uploadedImages.files.map((img) => ({
          postId: createdPost.id,
          key: img.key,
          url: img.url,
        })),
      );
    }

    return createdPost;
  }

  async getPosts(getPostsDto: GetPostsDto): Promise<Post[]> {
    const { forumId, page, limit } = getPostsDto;
    return await this.postRepository.findPostsByForumId(forumId, page, limit)
  }

  async getPostById(postId: number): Promise<Post> {
    const post = await this.postRepository.findPostByPostId(postId)
    if (!post) {
      throw new NotFoundException('post not found');
    }
    return post;
  }

  async updatePost(userId: number, postId: number, updatePostDto: UpdatePostDto, files: Express.Multer.File[]): Promise<Post> {
    const { removedOldKeys = [], ...postData } = updatePostDto;
    const post = await this.postRepository.findPostByPostId(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.userId !== userId) {
      throw new ForbiddenException('No permission');
    }
    if (removedOldKeys.length > 0) {
      await this.imageAssetService.validatePostImageKeys(postId, removedOldKeys);
    }

    const uploadedImages = files?.length > 0
      ? await this.s3ClientService.uploadFiles(files, userId)
      : [];

    if (removedOldKeys.length > 0) {
      await this.s3ClientService.deleteFiles(removedOldKeys);
    }

    await this.imageAssetRepository.deleteByKeys(postId, removedOldKeys);
    const newImages = Array.isArray(uploadedImages) ? uploadedImages : uploadedImages.files;
    if (newImages.length > 0) {
      await this.imageAssetRepository.createMany(
        newImages.map((img) => ({
          postId,
          key: img.key,
          url: img.url,
        })),
      );
    }
    return this.postRepository.updatePost(postId, {
      ...postData,
    });
  }

  async softDeletePost(userId: number, postId: number): Promise<Post> {
    const post = await this.postRepository.findPostByPostId(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.userId !== userId) {
      throw new ForbiddenException('No permission');
    }
    return await this.postRepository.softDeletePostByPostId(postId);
  }
  
  // async hardDeletePost(userId: number, postId: number): Promise<Post> {
  //   const post = await this.postRepository.findPostByPostId(postId);
  //   if (!post) {
  //     throw new NotFoundException('Post not found');
  //   }
  //   if (post.userId !== userId) {
  //     throw new ForbiddenException('No permission');
  //   }
  //   await this.s3ClientService.deleteFiles(files, userId)
  //   return this.postRepository.hardDeletePostByPostId(postId);
  // }

  async addPostLike(postId: number) {
    const post = await this.postRepository.findPostByPostId(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return this.postRepository.updatePost(postId, {
      voteCount: {
        increment: 1
      }
    });
  }

  async removePostLike(postId: number) {
    const post = await this.postRepository.findPostByPostId(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return this.postRepository.updatePost(postId, {
      voteCount: {
        decrement: 1
      }
    });
  }



  async addPostScrap(postId: number) {
    const post = await this.postRepository.findPostByPostId(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return this.postRepository.updatePost(postId, {
      scrapCount: {
        increment: 1
      }
    });
  }

  async removePostScrap(postId: number) {
    const post = await this.postRepository.findPostByPostId(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return this.postRepository.updatePost(postId, {
      scrapCount: {
        decrement: 1
      }
    });
  }
}
