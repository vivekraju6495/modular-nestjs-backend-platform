import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common'; //added
import { AppModule } from './app.module';
// import * as crypto from 'crypto';
// (global as any).crypto = crypto;

let LoggerService: any;
try {
  ({ LoggerService } = require('@app/logger/logger.service'));
} catch (e) {
  LoggerService = null;
}

let LoggerInterceptor: any;
try {
  ({ LoggerInterceptor } = require('@app/logger/logger.interceptor'));
} catch (e) {
  LoggerInterceptor = null;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend running on port 3001
  app.enableCors({
    origin: process.env.FRONTEND_URL, // Frontend origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  if(LoggerService && LoggerService != null){
    app.useGlobalInterceptors(new LoggerInterceptor(app.get(LoggerService)));
  }
  app.useGlobalPipes(new ValidationPipe()); //added
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
