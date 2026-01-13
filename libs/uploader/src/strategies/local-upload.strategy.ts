import { UploadResult } from '../interfaces/upload-result.interface';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

export class LocalUploadStrategy {
  
  async upload(file: Express.Multer.File, folder: string = ''): Promise<UploadResult> {
    const rootDir = process.env.UPLOAD_ROOT || 'uploads';
    const targetDir = join(rootDir, folder);

    if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true });

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = join(targetDir, fileName);
    writeFileSync(filePath, file.buffer);

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const relativePath = `${folder}/${fileName}`.replace(/\\/g, '/');

    return {
      url: `${appUrl}/uploads/${relativePath}`,
      fileType: file.mimetype,
      fileName: file.originalname,
      size: file.size,
      path: relativePath,
    };
  }

}
