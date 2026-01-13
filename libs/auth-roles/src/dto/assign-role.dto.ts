import { IsNumber, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class AssignRoleDto {
  @IsString()
  @IsOptional()
  userId: string | null;

  @IsNumber()
  @IsNotEmpty()
  roleId: number;
}
