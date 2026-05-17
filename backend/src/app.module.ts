import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./modules/auth/auth.module.js";
import { UsersModule } from "./modules/users/users.module.js";
import { CategoriasModule } from "./modules/categorias/categorias.module.js";
import { ProductosModule } from "./modules/productos/productos.module.js";
import { UploadModule } from "./modules/upload/upload.module.js";
import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: "sqljs",
      location: join(__dirname, "..", "data.db"),
      autoSave: true,
      autoLoadEntities: true,
      synchronize: false,
    }),
    AuthModule,
    UsersModule,
    CategoriasModule,
    ProductosModule,
    UploadModule,
  ],
})
export class AppModule {}
