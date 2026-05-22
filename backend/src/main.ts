import "reflect-metadata";
import compression from "compression";
import helmet from "helmet";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";
import { fileURLToPath } from "url";
import { AppModule } from "./app.module.js";

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

  app.use(compression());
  app.use(helmet());

  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads",
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  if (process.env.NODE_ENV === "production") {
    app.enable("trust proxy");
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`→ Backend San Jorge en http://localhost:${port}`);
}
bootstrap();
