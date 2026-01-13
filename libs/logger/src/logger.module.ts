import { Module, Global } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LoggerInterceptor } from './logger.interceptor';
import { LoggerHealthController } from './logger.controller';

@Global()
@Module({
  providers: [LoggerService, LoggerInterceptor],
  exports: [LoggerService, LoggerInterceptor],
  controllers: [LoggerHealthController],
})
export class LoggerModule {}
