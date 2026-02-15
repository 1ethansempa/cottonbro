import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { MailModule } from "./common/mail/mail.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { ImagesModule } from "./images/images.module.js";
import { HealthModule } from "./health/health.module.js";
import { AuthGuard } from "./auth/auth.guard.js";

@Module({
  imports: [
    MailModule, // global mail service for sending emails
    AuthModule,
    ImagesModule, // image processing (proxies to Python service)
    HealthModule,
    // Global rate limiting (tune as needed)
    ThrottlerModule.forRoot([
      {
        ttl: 60_000, // 1 minute window
        limit: 60, // 60 requests/min per IP (tune as needed)
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
