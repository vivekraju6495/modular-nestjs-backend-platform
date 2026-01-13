import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { queueConfig } from './config/queue.config';
import { EmailWorker } from './workers/email.worker';
import { EmailQueue } from './queues/email.queue';
// import { EmailService } from '@app/email/email.service';
import { QueueManagerService } from './queue-manager.service';
import { QueueController } from './queue-controller.controller';

let EmailService: any;
try {
  ({ EmailService } = require('libs/email/src'));
} catch (e) {
  EmailService = null;
}

@Module({
  imports: [
    BullModule.forRoot(queueConfig),
    BullModule.registerQueue({ name: 'email' }),
  ],
  providers: [
    EmailWorker,
    EmailQueue,
    //EmailService,
    ...(EmailService ? [EmailService] : []),
    QueueManagerService,   // must be in providers
  ],
  exports: [
    EmailQueue,
    QueueManagerService,   // now safe to export
  ],
  controllers: [QueueController],
})
export class QueueManagerModule {}
