import {
  IsString, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested, Min,
} from "class-validator";
import { Type } from "class-transformer";

class ImagenDto {
  @IsString()
  url: string;

  @IsOptional()
  @IsNumber()
  orden?: number;
}

class CaracteristicaDto {
  @IsString()
  nombre: string;

  @IsString()
  valor: string;
}

export class CreateProductoDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNumber()
  @Min(0)
  precio: number;

  @IsOptional()
  @IsString()
  imagen?: string;

  @IsOptional()
  @IsNumber()
  categoriaId?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsBoolean()
  destacado?: boolean;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImagenDto)
  imagenes?: ImagenDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CaracteristicaDto)
  caracteristicas?: CaracteristicaDto[];
}
