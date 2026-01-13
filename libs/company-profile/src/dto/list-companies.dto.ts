import { IsOptional, IsNumber, IsString, IsDate, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class ListCompaniesDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdAt?: Date;

  @IsOptional()
  @IsString()
  sortBy?: string; // e.g., "company_Name", "createdAt"

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC'; // default DESC

  // @IsOptional()
  // @Type(() => Number)
  // @IsNumber()
  // userId?: number; // filter by user ID

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  createdBy?: number; // filter by user ID
}
