import { S3 } from 'aws-sdk';
import { UploadResult } from '../interfaces/upload-result.interface';

export class AwsUploadStrategy {
  private s3 = new S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  async upload(file: Express.Multer.File, folder: string = ''): Promise<UploadResult> {
    const bucketName = process.env.AWS_BUCKET_NAME;
    const region = process.env.AWS_REGION;

    if (!bucketName || !region) {
      throw new Error('Missing AWS_BUCKET_NAME or AWS_REGION in environment variables');
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const key = folder ? `${folder}/${fileName}` : fileName; // folder prefix

    await this.s3
      .putObject({
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
      .promise();

    return {
      url: `https://${bucketName}.s3.${region}.amazonaws.com/${key}`,
      path: key,
      fileType: file.mimetype,
      fileName: file.originalname,
      size: file.size,
    };
  }


}
