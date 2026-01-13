import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { CompanyProfileService } from './company-profile.service';
import { CompanyController } from './company.controller';

// Try to load AuthModule safely
let AuthModule: any;
try {
  // If libs/email/src exports a Nest module
  ({ AuthModule } = require('libs/auth/src'));
} catch (e) {
  AuthModule = null;
}

@Module({
  imports: [TypeOrmModule.forFeature([Company]),
   ...(AuthModule ? [AuthModule] : []),
  ],
  providers: [CompanyProfileService],
  controllers: [CompanyController],
  exports: [
    CompanyProfileService,
    TypeOrmModule,
    ...(AuthModule ? [AuthModule] : []),
  ],
})
export class CompanyProfileModule {}
