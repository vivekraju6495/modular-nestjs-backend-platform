import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { Country } from './entities/country.entity';

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
    ConfigModule.forRoot({ isGlobal: true }),   
    TypeOrmModule.forFeature([
      Contact, 
      Country,
      ...(AuthModule ? [AuthModule] : []), // only import if available
      ...(CompanyProfileModule ? [CompanyProfileModule] : []),
      ])
  ],
  providers: [ContactsService],
  exports: [ContactsService],
  controllers: [ContactsController],
})
export class ContactsModule {}
