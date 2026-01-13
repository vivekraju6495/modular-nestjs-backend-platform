import { IsNumber, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class AssignPermissionDto {
  @IsNumber()
  @IsNotEmpty()
  roleId: number;

  @IsNumber()
  @IsNotEmpty()
  permissionId: number;

  @IsString()
  @IsOptional()
  userId: string | null;
}
