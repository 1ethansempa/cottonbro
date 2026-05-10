import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller.js";
import { AuthService, USERS_REPOSITORY } from "./auth.service.js";
import { UsersRepository } from "./users.repository.js";
import { R2StorageService } from "../common/storage/r2-storage.service.js";

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [
    AuthService,
    R2StorageService,
    {
      provide: USERS_REPOSITORY,
      useClass: UsersRepository,
    },
  ],
  exports: [USERS_REPOSITORY],
})
export class AuthModule {}
