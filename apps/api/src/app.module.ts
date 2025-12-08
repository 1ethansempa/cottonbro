import { Module } from "@nestjs/common";
import { ConfigModule } from "./common/config/config.module.js";
import { MailModule } from "./common/mail/mail.module.js";
import { AuthModule } from "./auth/auth.module.js";

@Module({
  imports: [
    ConfigModule, // loads env + exposes ConfigService
    MailModule, // global mail service for sending emails
    AuthModule,
  ],
})
export class AppModule {}
