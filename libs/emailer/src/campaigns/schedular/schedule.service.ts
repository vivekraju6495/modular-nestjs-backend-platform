import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailCampaign, CampaignStatus } from '@app/emailer/entities/emailCampaigns.entity';
import { LessThanOrEqual, Repository } from 'typeorm';
import { CampaignsService } from '../campaigns.service';

@Injectable()
export class CampaignSchedulerService {
    private readonly logger = new Logger(CampaignSchedulerService.name);

    constructor(
        @InjectRepository(EmailCampaign)
        private readonly campaignRepo: Repository<EmailCampaign>,
        private readonly campaignService: CampaignsService,
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async handleScheduledCampaigns() {
        const now = new Date();

        const campaigns = await this.campaignRepo.find({
        where: {
            status: CampaignStatus.SCHEDULED,
            sendAt: LessThanOrEqual(now),
            is_sent:true
        },
        relations: ['template'],
        });

        for (const campaign of campaigns) {
        try {
            this.logger.log(`Sending campaign: ${campaign.name}`);

            const data = await this.campaignService.sentCampaignEmails(campaign);
            if(data){
                campaign.status = CampaignStatus.SENT;
            }else{
                campaign.status = CampaignStatus.SCHEDULED;
            }
            await this.campaignRepo.save(campaign);

        } catch (error) {
            this.logger.error(`Failed to send campaign ${campaign.id}: ${error.message}`);
            campaign.status = CampaignStatus.PAUSED;
            await this.campaignRepo.save(campaign);
        }
        }
    }

}
