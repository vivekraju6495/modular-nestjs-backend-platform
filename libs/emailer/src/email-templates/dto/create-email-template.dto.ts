import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import { TemplateVersion,TemplateType } from '@app/emailer/entities/emailTemplates.entity';
export class CreateEmailTemplateDto {

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  model?: any;

  @IsString()
  @IsOptional()
  html?: string;

  @IsOptional()
  layout?: any;

  @IsEnum(TemplateVersion)
  @IsOptional()
  version?: TemplateVersion;

  @IsBoolean()
  @IsOptional()
  is_published?: boolean;

  @IsString()
  @IsOptional()
  thumbnail_url?: string;

  @IsEnum(TemplateType)
  @IsOptional()
  type?: TemplateType;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsOptional()
  companyId?: string | null;

  @IsOptional()
  userId?: string | null
}


