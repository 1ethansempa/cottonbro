import {
  Body,
  Controller,
  Get,
  HttpCode,
  Ip,
  Post,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
  UsePipes,
} from "@nestjs/common";
import { Response, Request } from "express";
import { AuthService } from "./auth.service.js";
import { OtpStartDto } from "./dto/otp-start.dto.js";
import { OtpVerifyDto } from "./dto/otp-verify.dto.js";
import { LoginDto } from "./dto/login.dto.js";
import { Throttle } from "@nestjs/throttler";
import { AuthGuard } from "./auth.guard.js";
import { Public } from "./public.decorator.js";

@Controller("auth") // with app.setGlobalPrefix('v1') this becomes /v1/auth/*
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post("otp/start")
  @HttpCode(204)
  async startOtp(@Body() dto: OtpStartDto, @Ip() ip: string): Promise<void> {
    await this.service.startOtp(dto.email, dto.captchaToken, ip);
  }

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 15 } })
  @Post("otp/verify")
  async verifyOtp(@Body() dto: OtpVerifyDto) {
    const customToken = await this.service.verifyOtpAndMintCustomToken(
      dto.email,
      dto.code
    );
    return { customToken };
  }

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 15 } })
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

  @UseGuards(AuthGuard)
  @Get("session")
  session(@Req() req: Request) {
    const user = (req as any).user;
    return { ok: true, uid: user?.uid, claims: user };
  }
}
