import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { AuthModule } from "./modules/auth/auth.module.js";
import { UsersModule } from "./modules/users/users.module.js";
import { CategoriasModule } from "./modules/categorias/categorias.module.js";
import { ProductosModule } from "./modules/productos/productos.module.js";
import { UploadModule } from "./modules/upload/upload.module.js";
import { MercadoPagoModule } from "./modules/mercadopago/mercadopago.module.js";
import { HealthModule } from "./modules/health/health.module.js";
import { CloudinaryModule } from "./cloudinary/cloudinary.module.js";
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
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    CloudinaryModule,
    MercadoPagoModule,
    HealthModule,
    AuthModule,
    UsersModule,
    CategoriasModule,
    ProductosModule,
    UploadModule,
  ],
})
export class AppModule {}
