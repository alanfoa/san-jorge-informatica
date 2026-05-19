import {
  Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException, Inject,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { v2 as cloudinary } from 'cloudinary';
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard.js";
import { RolesGuard } from "../../common/guards/roles.guard.js";
import { Roles } from "../../common/guards/roles.decorator.js";
import { CLOUDINARY } from "../../cloudinary/constants.js";
import { unlink } from "fs/promises"; // Para eliminar el archivo temporal de multer

@Controller("upload")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin", "editor")
export class UploadController {
  constructor(@Inject(CLOUDINARY) private cloudinaryService: typeof cloudinary) {}

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\//)) {
          cb(new BadRequestException("Solo se permiten archivos de imagen"), false);
          return;
        }
        cb(null, true);
      },
    })
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("Archivo requerido");
    }

    try {
      // Subir el archivo a Cloudinary
      const result = await this.cloudinaryService.uploader.upload(file.path, {
        folder: 'sanjorge-informatica', // Carpeta en Cloudinary
      });

      // Eliminar el archivo temporal de multer después de subirlo a Cloudinary
      await unlink(file.path);

      return { url: result.secure_url };
    } catch (error) {
      // Si hay un error, intentar eliminar el archivo temporal
      if (file.path) {
        await unlink(file.path).catch(e => console.error("Error al eliminar archivo temporal:", e));
      }
      throw new BadRequestException("Error al subir la imagen a Cloudinary");
    }
  }
}
