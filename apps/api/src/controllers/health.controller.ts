import { Controller, Get } from "@nestjs/common";

@Controller("api")
export class HealthController {
  @Get("healthz")
  health() {
    return { ok: true };
  }
}
