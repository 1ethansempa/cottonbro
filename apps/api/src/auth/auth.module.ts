import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller.js";
import { AuthService, USERS_REPOSITORY } from "./auth.service.js";
import { UsersRepository } from "./users.repository.js";

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: USERS_REPOSITORY,
      useClass: UsersRepository,
    },
  ],
  exports: [USERS_REPOSITORY],
})
export class AuthModule {}
