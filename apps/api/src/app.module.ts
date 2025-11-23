import { Module } from "@nestjs/common";
import { ConfigModule } from "./common/config/config.module.js";
import { AuthModule } from "./auth/auth.module.js";

@Module({
  imports: [
    ConfigModule, // loads env + exposes ConfigService
    AuthModule,
  ],
})
export class AppModule {}
