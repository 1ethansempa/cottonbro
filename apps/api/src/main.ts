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

  // Dev CORS (in prod, prefer same-origin or a gateway)
  if (process.env.NODE_ENV !== "production") {
    app.enableCors({
      origin: [/^http:\/\/localhost:\d+$/],
      credentials: true,
    });
  }

  // Global prefix
  app.setGlobalPrefix("v1");

  await app.listen(
    process.env.PORT ? Number(process.env.PORT) : 3001,
    "0.0.0.0"
  );
}
bootstrap();
