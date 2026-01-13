import { IsString, IsEnum, IsOptional, IsUUID, IsDate, IsObject, IsArray, ArrayNotEmpty, IsBoolean } from 'class-validator';
import { CampaignStatus } from '@app/emailer/entities/emailCampaigns.entity';
import { Type } from 'class-transformer';

export class CreateCampaignDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    fromName: string;

    @IsOptional()
    @IsString()
    fromEmail: string;

    @IsOptional()
    @IsString()
    replyTo?: string;

    @IsString()
    subject: string;

    @IsEnum(CampaignStatus)
    status: CampaignStatus;

    @IsOptional()
    @Type(() => Date)  // Automatically transform string to Date
    @IsDate()
    sendAt?: Date;

    @IsOptional()
    @IsArray()
    audience: { uuid: string }[] | string[];

    @IsOptional()
    userId?: string | null;

    @IsOptional()
    companyId?: string | null;

    @IsOptional()
    @IsUUID()
    templateId?: string;
    
    @IsOptional()
    @IsArray()
    emails: string[];  // Expect array of UUID strings
    
    @IsBoolean()
    isSent?: boolean | true
}
