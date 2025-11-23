import {
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
  UseGuards,
  ValidationPipe,
  UsePipes,
} from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./auth.service.js";
import { OtpStartDto } from "./dto/otp-start.dto.js";
import { OtpVerifyDto } from "./dto/otp-verify.dto.js";
import { LoginDto } from "./dto/login.dto.js";
import { ThrottlerGuard } from "@nestjs/throttler";

@Controller("auth") // with app.setGlobalPrefix('v1') this becomes /v1/auth/*
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @UseGuards(ThrottlerGuard)
  @Post("otp/start")
  @HttpCode(204)
  async startOtp(@Body() dto: OtpStartDto): Promise<void> {
    await this.service.startOtp(dto.email);
  }

  @UseGuards(ThrottlerGuard)
  @Post("otp/verify")
  async verifyOtp(@Body() dto: OtpVerifyDto) {
    const customToken = await this.service.verifyOtpAndMintCustomToken(
      dto.email,
      dto.code
    );
    return { customToken };
  }

  @Post("login")
  @HttpCode(204)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    await this.service.createSessionCookie(dto.idToken, dto.ttlMs, res);
    // 204 No Content
  }

  @Post("logout")
  @HttpCode(204)
  async logout(@Res({ passthrough: true }) res: Response) {
    await this.service.logoutAndRevoke(res);
  }
}
