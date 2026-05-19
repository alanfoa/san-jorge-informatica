import { IsEmail, IsString, IsOptional, MinLength, IsIn } from "class-validator";

export class CreateUserDto {
  @IsString()
  nombre: string;

  @IsEmail({}, { message: "Email inválido" })
  email: string;

  @IsString()
  @MinLength(4, { message: "La contraseña debe tener al menos 4 caracteres" })
  password: string;

  @IsOptional()
  @IsIn(["admin", "editor"], { message: "Rol debe ser admin o editor" })
  rol?: string;
}
