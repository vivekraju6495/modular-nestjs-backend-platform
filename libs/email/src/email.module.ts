import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

let optionalEntities: Function[] = [];

try {
  const { EmailSendJob } = require('@app/emailer/campaign/entities/emailSendJob.entity');
  optionalEntities.push(EmailSendJob as Function);
} catch (err) {
  // Entity not present
}


@Module({
  imports: [
    TypeOrmModule.forFeature([...optionalEntities]),
    ConfigModule.forRoot({ isGlobal: true }),   
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
