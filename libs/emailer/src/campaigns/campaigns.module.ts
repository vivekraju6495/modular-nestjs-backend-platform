import { forwardRef, Module } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailCampaign } from '../entities/emailCampaigns.entity';
import { EmailTemplate } from '../entities/emailTemplates.entity';
import { EmailSendJob } from '../entities/emailSendJob.entity';
import { CampaignSchedulerService } from './schedular/schedule.service';

// Try to load AuthModule safely
let AuthModule: any;
try {
  // If libs/email/src exports a Nest module
  ({ AuthModule } = require('libs/auth/src'));
} catch (e) {
  AuthModule = null;
}
//optional import Contact
let ContactsModule: any;
try {
  ({ ContactsModule } = require('libs/contacts/src'));
} catch (e) {
  ContactsModule = null;
}
// Try to load EmailModule safely
let EmailModule: any;
try {
  // If libs/email/src exports a Nest module
  ({ EmailModule } = require('libs/email/src'));
} catch (e) {
  EmailModule = null;
}
//queue manager library
// Try to load QueueManagerModule safely 
let QueueManagerModule: any;
try {
  // If libs/queue-manager/src exports a Nest module
  ({ QueueManagerModule } = require('libs/queue-manager/src'));
} catch (e) {
  QueueManagerModule = null;
}
let CompanyProfileModule: any;
try {
  ({ CompanyProfileModule } = require('libs/company-profile/src'));
} catch (e) {
  CompanyProfileModule = null;
}

let BullModule: any;
let bullImports: any[] = [];
let bullExports: any[] = [];

try {
  ({ BullModule } = require('@nestjs/bull'));

  bullImports = [
    BullModule.registerQueue(
      { name: 'emailQueue' },
      { name: 'bulkQueue' },
    ),
  ];
  bullExports = [BullModule];
} catch (e) {
  BullModule = null;
  bullImports = [];
  bullExports = [];
}

@Module({
    controllers: [CampaignsController],
    providers: [CampaignsService,CampaignSchedulerService],
    imports: [
      ...bullImports,
      TypeOrmModule.forFeature([EmailCampaign, EmailTemplate,EmailSendJob]),
      ...(AuthModule ? [AuthModule] : []),
      ...(ContactsModule ? [ContactsModule] : []),
      ...(EmailModule ? [EmailModule] : []), 
      ...(QueueManagerModule ? [QueueManagerModule] : []),
      ...(CompanyProfileModule ? [CompanyProfileModule] : []),
    ],
    exports: [
        CampaignsService,
        TypeOrmModule,
        ...bullExports,
        ...(AuthModule ? [AuthModule] : []),
        ...(ContactsModule ? [ContactsModule] : []),
        ...(EmailModule ? [EmailModule] : []), 
        ...(CompanyProfileModule ? [CompanyProfileModule] : []),
    ],
})
export class CampaignsModule {}