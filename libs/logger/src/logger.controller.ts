import { Controller, Get } from '@nestjs/common';
import { LoggerService } from './logger.service';

@Controller('logger')
export class LoggerHealthController {
  constructor(private readonly loggerService: LoggerService) {}

  @Get()
  async healthCheck() {
    const connection = this.loggerService.getConnectionStatus();
    const retentionDays = this.loggerService.getRetentionDays();
    const collections = await this.loggerService.getLogCollections();

    return {
      loggerService: !!this.loggerService,
      mongodbConnected: connection,
      retentionDays,
      logCollections: collections,
      message: 'Logger service is working',
    };
  }
}
