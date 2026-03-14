import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3clientService {
  private readonly bucket: string;

  constructor(
    @Inject('S3_CLIENT') private readonly s3: S3Client,
    private readonly configService: ConfigService,
  ) {
    const bucket = this.configService.get<string>('AWS_S3_BUCKET');
    if (!bucket) {
      throw new Error('AWS_S3_BUCKET is not set in environment variables');
    }
    this.bucket = bucket;
  }

  private getPublicUrl(key: string): string {
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }

  /**
   * 다중 파일 업로드 처리
   * Promise.all을 사용하여 여러 파일을 병렬로 업로드
   */
  async uploadFiles(files: Express.Multer.File[], userId: number) {
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const ext = file.originalname.split('.').pop();
        const key = `uploads/${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        await this.s3.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
          }),
        );
        return {
          originalname: file.originalname,
          key,
          url: this.getPublicUrl(key),
          size: file.size,
          type: file.mimetype,
        };
      }),
    );

    return {
      success: true,
      files: uploadedFiles,
    };
  }
  /**
   * 다중 파일 삭제 처리
   * Promise.all을 사용하여 여러 파일을 병렬로 삭제
   */
  async deleteFiles(keys: string[]) {
    await Promise.all(
      keys.map((key) =>
        this.s3.send(
          new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
          }),
        ),
      ),
    );

    return {
      success: true,
      deletedKeys: keys,
    };
  }
}