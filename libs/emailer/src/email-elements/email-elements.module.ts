import { Module } from '@nestjs/common';
import { EmailElementsService } from './email-elements.service';
import { EmailElementsController } from './email-elements.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailElementsGroup } from '../entities/emailElementsGroup.entity';
import { EmailElement } from '../entities/emailElements.entity';

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
  imports: [
    TypeOrmModule.forFeature([
      EmailElementsGroup,
      EmailElement,
      ...(AuthModule ? [AuthModule] : []), // only import if available
      ...(CompanyProfileModule ? [CompanyProfileModule] : []),
    ]),
  ],
  controllers: [EmailElementsController],
  providers: [EmailElementsService],
  exports: [TypeOrmModule,EmailElementsService]
})
export class EmailElementsModule {}
