import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { UploadController } from "./upload.controller.js";
import { CloudinaryModule } from "../../cloudinary/cloudinary.module.js";

@Module({
  imports: [
    MulterModule.register({
      dest: "./uploads", // Multer still needs a temporary destination
    }),
    CloudinaryModule,
  ],
  controllers: [UploadController],
  providers: [], // Agregaremos un servicio de upload si fuera necesario para más lógica
})
export class UploadModule {}
