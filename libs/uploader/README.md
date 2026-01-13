// install aws package
npm install aws-sdk

//If you're using TypeScript, also install the type declarations:
npm install --save-dev @types/aws-sdk

//Env configuration
UPLOAD_STRATEGY=local or aws
UPLOAD_ROOT=uploads //path of upload

AWS_BUCKET_NAME=your-bucket
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

note
for upload the content type to set as in header
Content-Type: multipart/form-data

//To view the local upload file in browser(through url)
npm install @nestjs/serve-static

//Add the code in Main root project  app.module.ts

import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // path to your uploads folder
      serveRoot: '/uploads', // public route prefix
    }),
    // other modules...
  ],
})
export class AppModule {}

