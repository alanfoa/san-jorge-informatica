import {
  Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { fileURLToPath } from "url";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard.js";
import { RolesGuard } from "../../common/guards/roles.guard.js";
import { Roles } from "../../common/guards/roles.decorator.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

@Controller("upload")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin", "editor")
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: join(__dirname, "..", "..", "..", "uploads"),
        filename: (_req, file, cb) => {
          const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${name}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\//)) {
          cb(new BadRequestException("Solo imágenes"), false);
          return;
        }
        cb(null, true);
      },
    })
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("Archivo requerido");
    return { url: `/uploads/${file.filename}` };
  }
}
