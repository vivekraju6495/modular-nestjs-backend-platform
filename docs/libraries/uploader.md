# Uploader Library

## 1. Overview
The `@app/uploader` library provides a centralized, reusable module for handling as
## 2. Core Features
•	Upload files to local storage or AWS S3, depending on configuration.
•	Support for single and multiple file uploads.
•	 Automatically generates unique filenames to prevent collisions.
•	 Securely handles files with validation and size restrictions.
•	Optional static serving for local uploads via Express middleware.
•	 Modular — can be plugged into any NestJS application.
________________________________________
## 3. Environment Variables
Variable	Description	Example
UPLOAD_STRATEGY	Defines the upload method: local or aws	local
UPLOAD_ROOT	Local folder path where files will be stored	uploads
AWS_BUCKET_NAME	AWS S3 bucket name	your-bucket
AWS_REGION	AWS S3 region	ap-south-1
AWS_ACCESS_KEY_ID	AWS Access Key	AKIA...
AWS_SECRET_ACCESS_KEY	AWS Secret Key	xxxx...
________________________________________
## 4. Installation & Setup

### Step 1: Add environment variables
UPLOAD_STRATEGY=local #aws
UPLOAD_ROOT=uploads

AWS_BUCKET_NAME=your-bucket
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

### Step 2: Import module conditionally in app.module.ts
import { Module } from '@nestjs/common';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

let UploaderModule: any;
try {
  ({ UploaderModule } = require('@app/uploader'));
} catch (e) {
  UploaderModule = null;
}

@Module({
  imports: [
    ...(UploaderModule ? [UploaderModule] : []),

    // Enable file serving for local uploads
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
})
export class AppModule {}


## 5. Module Architecture

UploaderService
Handles the core upload logic, determining whether to store files locally or on AWS S3 based on environment configuration.

## API Endpoints
Endpoint	Method	Description	Request	Response
/uploader	GET	Welcome message	-	{ message: "Welcome to Uploader Library!" }
/uploader/upload	POST	Upload a single file	FormData (file)	{ status: true, fileUrl: "..." }
/uploader/multiple	POST	Upload multiple files	FormData (files[])	[ { status: true, fileUrl: "..." }, ... ]

File Serving for Local Uploads
When using local storage, uploaded files can be viewed directly in the browser using their generated URL.
### Example:
http://localhost:3000/uploads/profile/user1.png


Uploads is the default path mentioned in the env. Profile we can mentioned the path while uploading


## 9. Error Handling
•	Handles file validation errors and unsupported formats gracefully.
•	For AWS uploads, catches S3 SDK errors (e.g., invalid credentials, missing bucket).
•	Returns structured error responses:
{
  "status": false,
  "message": "Failed to upload file. Please try again."
}
________________________________________
## 10. Security & Sanitization
•	Files are saved using timestamp-based names to prevent overwriting.
•	Paths are sanitized to avoid directory traversal.
•	Only authorized endpoints (if guarded) can upload.
•	AWS credentials are never exposed in API responses.
________________________________________
## 11. Maintenance
•	Old uploads can be periodically purged using a scheduled cleanup script if required.
•	Ensure sufficient storage permissions for UPLOAD_ROOT directory.
•	Monitor AWS bucket usage and policies if using S3.
________________________________________
## 12. Future Enhancements
•	🔹 File type & size validation decorators.
•	🔹 Support for Google Cloud Storage or Azure Blob.
•	🔹 File compression for large uploads.
•	🔹 Presigned URLs for direct client uploads (to bypass backend).
•	🔹 Metadata tagging for search and analytics.

