import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

export async function bootstrapNestApp() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  await app.init();
  return app;
}

// local run: pnpm -C apps/api dev
if (require.main === module) {
  bootstrapNestApp().then((app) => app.listen(3000));
}
