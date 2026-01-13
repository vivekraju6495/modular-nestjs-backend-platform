import { IsEmail, IsEnum, IsOptional, IsString, IsBoolean, IsDateString } from 'class-validator';
import { PermissionStatus } from '../entities/contact.entity';

export class CreateContactDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  address1?: string;

  @IsOptional()
  @IsString()
  address2?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zipcode?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsDateString()
  birthday?: string | null;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  tags?: string[];

  @IsOptional()
  @IsEnum(PermissionStatus)
  permission?: PermissionStatus;

  @IsOptional()
  @IsBoolean()
  isSubscribed?: boolean;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

   @IsOptional()
  companyId?: string | null;
}

export class UpdateContactDto extends CreateContactDto {}
