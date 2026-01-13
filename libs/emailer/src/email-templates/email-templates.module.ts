import { Module } from '@nestjs/common';
import { EmailTemplatesService } from './email-templates.service';
import { EmailTemplatesController } from './email-templates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTemplate } from '../entities/emailTemplates.entity';

// Try to load EmailModule safely
let AuthModule: any;
try {
  // If libs/email/src exports a Nest module
  ({ AuthModule } = require('libs/auth/src'));
} catch (e) {
  AuthModule = null;
}

let CompanyProfileModule: any;
try {
  ({ CompanyProfileModule } = require('libs/company-profile/src'));
} catch (e) {
  CompanyProfileModule = null;
}
@Module({
  providers: [EmailTemplatesService],
  controllers: [EmailTemplatesController],
  imports: [TypeOrmModule.forFeature([
    EmailTemplate,
     ...(AuthModule ? [AuthModule] : []), // only import if available
     ...(CompanyProfileModule ? [CompanyProfileModule] : []),
  ])],
  // exports: [
  //   TypeOrmModule,
  //   ...(AuthModule ? [AuthModule] : []),
  //     ],
})
export class EmailTemplatesModule {}
