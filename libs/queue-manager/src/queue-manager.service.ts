import { Injectable } from '@nestjs/common';
import { EmailQueue } from './queues/email.queue';

@Injectable()
export class QueueManagerService {
  isConnected() {
    throw new Error('Method not implemented.');
  }
  constructor(private readonly emailQueue: EmailQueue) {}

  async enqueueBulkEmails(campaignId: number, jobs: any[], campaign: any, JobStatus: any) {
    const payloads = jobs.map(job => ({
      campaignId,
      jobs: [job], // process per recipient
      campaign,
      JobStatus,
    }));
    console.log("Entering to redis : ",payloads);
    await this.emailQueue.addBulkEmailJobs(payloads);
  }
}
