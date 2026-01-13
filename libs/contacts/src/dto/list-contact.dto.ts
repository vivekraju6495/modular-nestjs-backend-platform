import { IsOptional, IsNumber, IsEnum, IsString, IsDate, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PermissionStatus } from '../entities/contact.entity';

export class ListContactDto {
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
  @IsEnum(PermissionStatus)
  permission?: PermissionStatus;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  status?: boolean;

   // Sorting
  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC' = 'DESC';

   @IsOptional()
  companyId?: string | null;

}
