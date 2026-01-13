import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  action: string;

  @IsString()
  @IsOptional()
  code: string;

  @IsString()
  @IsOptional()
  key: string;

  @IsString()
  @IsOptional()
  description: string;
        
}
