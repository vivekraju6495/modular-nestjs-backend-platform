import { IsEmail, IsEnum, IsOptional, IsString, IsBoolean, IsDateString } from 'class-validator';
import { PermissionStatus } from '../entities/contact.entity';

export class CreateContactBulkDto {
  @IsOptional()
  companyId?: string | null;
}

export class UpdateContactDto extends CreateContactBulkDto {}
