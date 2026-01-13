import { IsOptional, IsNumber, IsEnum, IsString, IsDate, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { CampaignStatus } from '@app/emailer/entities/emailCampaigns.entity'; 

export class ListCampaignDto {
  @IsOptional()
  @Type(() => Number)       // Converts string to number
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)       // Converts string to number
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @IsOptional()
  @Type(() => Date)         // Converts string to Date object
  @IsDate()
  sendAt?: Date;

  @IsOptional()
  @IsBoolean()
  isSent?: boolean | true

  @IsOptional()
  userId?: string;

  @IsOptional()
  companyId?: string;
}
