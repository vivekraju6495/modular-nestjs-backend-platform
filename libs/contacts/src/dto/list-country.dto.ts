import { IsOptional, IsString } from 'class-validator';

export class ListCountryDto {
  @IsOptional()
  @IsString()
  search?: string; // search by country name or code
}