import { IsOptional, IsString, IsEnum, IsBoolean, IsInt } from 'class-validator';
import { TemplateVersion, TemplateType } from '@app/emailer/entities/emailTemplates.entity';

export class UpdateEmailTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  model?: any;

  @IsOptional()
  @IsString()
  html?: string;

  @IsOptional()
  layout?: any;

  @IsOptional()
  @IsEnum(TemplateVersion)
  version?: TemplateVersion;

  @IsOptional()
  @IsBoolean()
  is_published?: boolean;

  @IsOptional()
  @IsString()
  thumbnail_url?: string;

  @IsOptional()
  @IsEnum(TemplateType)
  type?: TemplateType;

  @IsOptional()
  @IsInt()
  updated_by?: number;

  @IsOptional()
  companyId?: string | null;

  @IsOptional()
  userId?: string | null;
}
