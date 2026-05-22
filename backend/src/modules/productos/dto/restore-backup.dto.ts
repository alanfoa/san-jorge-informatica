import { IsArray, IsOptional } from "class-validator";

export class RestoreBackupDto {
  @IsOptional()
  @IsArray()
  categorias?: Record<string, unknown>[];

  @IsArray()
  productos: Record<string, unknown>[];
}
