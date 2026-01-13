import { Module } from '@nestjs/common';
import { EmailerService } from './emailer.service';
import { EmailTemplatesModule } from './email-templates/email-templates.module';
import { EmailElementsModule } from './email-elements/email-elements.module';
import { EmailerController } from './emailer.controller';
import { CampaignsModule } from './campaigns/campaigns.module';

@Module({
  providers: [EmailerService],
  exports: [EmailerService],
  controllers: [EmailerController],
  imports: [EmailTemplatesModule, EmailElementsModule, CampaignsModule],

})
export class EmailerModule {}
