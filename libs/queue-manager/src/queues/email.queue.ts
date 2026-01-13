import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class EmailQueue {
  getJobs(arg0: string[], arg1: number, arg2: number, arg3: boolean) {
    throw new Error('Method not implemented.');
  }
  constructor(@InjectQueue('email') private readonly emailQueue: Queue) {}

  // Add a single job
  async addEmailJob(jobData: any) {
    await this.emailQueue.add('send-email', jobData, {
      attempts: 3,
      backoff: { type: 'fixed', delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  // Add jobs in bulk with batching optimization
  async addBulkEmailJobs(jobs: any[], batchSize = 100) {
    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize).map(job => ({
        name: 'send-email',
        data: job,
        opts: {
          //delay: 900000,
          attempts: 3,
          backoff: { type: 'fixed', delay: 5000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      }));
      await this.emailQueue.addBulk(batch);
    }
  }
}
