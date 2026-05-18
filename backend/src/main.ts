import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { fileURLToPath } from "url";
import { AppModule } from "./app.module.js";
import { ThrottlerGuard } from '@nestjs/throttler'; // Importar ThrottlerGuard

const __dirname = fileURLToPath(new URL(".", import.meta.url));

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix("api");
  app.enableCors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : []),
    ],
    credentials: true,
  });

  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads",
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalGuards(new ThrottlerGuard()); // Registrar ThrottlerGuard globalmente

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`→ Backend San Jorge en http://localhost:${port}`);
}
bootstrap();
