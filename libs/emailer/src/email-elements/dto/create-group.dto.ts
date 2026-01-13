import { IsNumber, IsOptional, IsString, MinLength, Min } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsOptional()
  companyId?: string | null;

}
