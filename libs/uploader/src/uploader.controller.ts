import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploaderService } from './uploader.service';

@Controller('uploader')
export class UploaderController {
  constructor(private readonly uploaderService: UploaderService) {}

  @Get()
  getHello() {
    return { message: 'Welcome to Uploader Library!' };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Query('path') path: string
  ) {
    return this.uploaderService.upload(file, path);
  }


  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    return Promise.all(files.map(file => this.uploaderService.upload(file)));
  }
}
