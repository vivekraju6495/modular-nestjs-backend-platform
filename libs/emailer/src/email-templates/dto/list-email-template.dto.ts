import { IsOptional, IsNumber, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { TemplateVersion, TemplateType } from '@app/emailer/entities/emailTemplates.entity';

export class ListEmailTemplatesDto {
  @IsOptional()
  @Type(() => Number)       // converts string to number
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)       // converts string to number
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(TemplateVersion)
  version?: TemplateVersion;

  @IsOptional()
  @IsEnum(TemplateType)
  type?: TemplateType;

  @IsOptional()
  companyId?: string | null;

  @IsOptional()
  userId?: string | null
}
