import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
//Adds middleware to parse cookies from incoming requests.
import cookieParser from "cookie-parser";
//Helmet adds HTTP security headers automatically.
import helmet from "helmet";
//Allows the server to read request bodies.
import { json, urlencoded } from "express";

//initializes and starts the server.
async function bootstrap() {
  //This disables Nest's default CORS configuration so you can configure it manually later.
  //better for dynamic cors configurations
  const app = await NestFactory.create(AppModule, { cors: false });

  // Trust the ingress proxy so req.ip and forwarded protocol/host resolve correctly.
  app.getHttpAdapter().getInstance().set("trust proxy", 1);

  // Registers helmet as global middleware. Every HTTP response will include security headers.
  app.use(helmet());

  // Allow larger JSON payloads for base64 image uploads
  app.use(json({ limit: "15mb" }));
  app.use(urlencoded({ extended: true, limit: "15mb" }));

  // Adds middleware to populate req.cookies
  app.use(cookieParser());

  const allowedOrigins = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  //credentials: true allows cookies, authorization headers
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Global prefix for all routes
  app.setGlobalPrefix("v1");

  await app.listen(
    process.env.PORT ? Number(process.env.PORT) : 3001,
    "0.0.0.0",
  );
}

bootstrap();
