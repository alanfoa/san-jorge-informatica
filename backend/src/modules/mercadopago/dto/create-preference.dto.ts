import {
  IsArray, IsNumber, IsOptional, IsString, Min, ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class PreferenceItemDto {
  @IsString()
  title: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0.01)
  unit_price: number;
}

export class CreatePreferenceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreferenceItemDto)
  items: PreferenceItemDto[];

  @IsOptional()
  @IsString()
  external_reference?: string;
}
