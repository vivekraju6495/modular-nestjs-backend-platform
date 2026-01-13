import { IsArray, IsNumber } from 'class-validator';

export class UpdateGroupOrderDto {
  @IsArray()
  groups: {
    id: string;
    order: number;
  }[];
}
