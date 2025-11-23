import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { ConfigModule } from "../common/config/config.module.js";

@Module({
  imports: [
    ConfigModule,
    // Rate-limit OTP endpoints to prevent abuse
    ThrottlerModule.forRoot([
      {
        ttl: 60_000, // 1 minute window
        limit: 60, // 60 requests/min per IP (tune as needed)
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
