import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateGroupDto {

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  order?: number;

  @IsOptional()
  companyId?: string | null;
}
