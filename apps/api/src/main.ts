import "./env.js";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });

  // Security headers
  app.use(helmet());

  // Cookies
  app.use(cookieParser());

  const appEnv = process.env.APP_ENV ?? "prod";

  const allowedOrigins =
    appEnv === "prod"
      ? ["https://cottonbro.com"]
      : [
          "http://localhost:5173",
          "https://cottonbro-web-rgkcirpgkq-ew.a.run.app",
          "https://cottonbro-web-491077850913.europe-west1.run.app",
        ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix("v1");

  await app.listen(
    process.env.PORT ? Number(process.env.PORT) : 3001,
    "0.0.0.0"
  );
}
bootstrap();
