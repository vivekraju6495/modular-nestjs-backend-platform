import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadLog } from './entities/upload-log.entity';
import { Repository } from 'typeorm';
import { AwsUploadStrategy } from './strategies/aws-upload.strategy';
import { LocalUploadStrategy } from './strategies/local-upload.strategy';
import { UploadResult } from './interfaces/upload-result.interface';
import { isValidFileType } from './utils/file-validation.util';

@Injectable()
export class UploaderService {
  private strategy: AwsUploadStrategy | LocalUploadStrategy;

  constructor(
    @InjectRepository(UploadLog)
    private readonly uploadLogRepo: Repository<UploadLog>
  ) {
    this.strategy =
      process.env.UPLOAD_STRATEGY === 'aws'
        ? new AwsUploadStrategy()
        : new LocalUploadStrategy();
  }

  async upload(file: Express.Multer.File, folder: string = ''): Promise<any> {
    try {

      if (!file) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          message: `No file received`,
          data: null,
        };
      }

      if (!isValidFileType(file.mimetype)) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          status: false,
          message: `Unsupported file type: ${file.mimetype}`,
          data: null,
        };
      }

      const result: UploadResult = await this.strategy.upload(file, folder);

      await this.uploadLogRepo.save({
        fileName: result.fileName,
        fileType: result.fileType,
        url: result.url,
        size: result.size,
        error: null, // no error on success
      });

      return {
        statusCode: HttpStatus.OK,
        status: true,
        message: 'File uploaded successfully',
        data: result,
      };
      
    } catch (error) {
      console.error('Error uploading file:', error);

      // Log the error in the upload log table
      await this.uploadLogRepo.save({
        fileName: file.originalname,
        fileType: file.mimetype,
        url: file.originalname || null,
        size: file.size,
        error: error.message || 'Unknown error',
      });

      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        status: false,
        message: 'Failed to upload file',
        error: error.message || 'Internal Server Error',
        data: null,
      };
    }
  }


}
