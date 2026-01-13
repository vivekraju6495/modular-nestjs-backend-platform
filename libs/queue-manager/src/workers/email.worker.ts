import { Processor, Process } from '@nestjs/bull';
import { Inject, Optional, Logger } from '@nestjs/common';
import type { Job } from 'bull';

let EmailService: any;
try {
  ({ EmailService } = require('libs/email/src'));
} catch {
  EmailService = null;
  console.warn('Email library not found — skipping email job.');
}

@Processor('email')
export class EmailWorker {
  private readonly logger = new Logger(EmailWorker.name);

  constructor(
    @Optional()
    @Inject(EmailService)
    private readonly emailService?: any,
  ) {}

  @Process('send-email')
  async handleSendEmail(job: Job) {
    const { campaignId, jobs, campaign, JobStatus } = job.data;

    try {
      if (this.emailService) {
        await this.emailService.sendCampaignEmail(
          campaignId,
          jobs,
          campaign,
          JobStatus,
        );
        this.logger.log(`Processed email job for campaign ${campaignId}`);
      } else {
        this.logger.warn('Email library not found — skipping email job.');
      }
    } catch (err: any) {
      this.logger.error(
        `Email job failed for campaign ${campaignId}: ${err.message}`,
      );
      throw err;
    }
  }
}
