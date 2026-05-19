import { IsString, IsOptional } from "class-validator";

export class CreateCategoriaDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  imagen?: string;
}
