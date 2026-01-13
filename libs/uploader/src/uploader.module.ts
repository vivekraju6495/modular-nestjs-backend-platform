import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploaderService } from './uploader.service';
import { UploaderController } from './uploader.controller';
import { UploadLog } from './entities/upload-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UploadLog])],
  providers: [UploaderService],
  controllers: [UploaderController],
  exports: [UploaderService],
})
export class UploaderModule {}
