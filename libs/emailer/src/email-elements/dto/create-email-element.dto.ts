import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateEmailElementDto {
  @IsString()
  groupId: string; // parent group id

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @IsOptional()
  block?: string;

  @IsString()
  @IsOptional()
  attributes?: Record<string, any>; //json

  @IsOptional()
  companyId?: string | null;

}