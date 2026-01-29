import { Module } from "@nestjs/common";
import { MailModule } from "./common/mail/mail.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { ImagesModule } from "./images/images.module.js";
import { HealthModule } from "./health/health.module.js";

@Module({
  imports: [
    MailModule, // global mail service for sending emails
    AuthModule,
    ImagesModule, // image processing (proxies to Python service)
    HealthModule,
  ],
})
export class AppModule {}
