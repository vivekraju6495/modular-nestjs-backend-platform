import { IsNumber, IsString } from "class-validator";

export class ReorderElementsDto {
  @IsString()
  groupId: string;

  @IsString({ each: true })
  elementIds: string[];
}