import { Injectable } from "@nestjs/common";

@Injectable()
export class ConfigService {
  get COOKIE_DOMAIN() {
    return process.env.COOKIE_DOMAIN || undefined; // e.g. .cottonbro.com
  }
  get TURNSTILE_SECRET() {
    return process.env.TURNSTILE_SECRET?.trim();
  }
  get TWO_WEEKS_MS() {
    return 14 * 24 * 60 * 60 * 1000;
  }
  get DEFAULT_TTL_MS() {
    // default session TTL (can be overridden by request body ttlMs, but capped)
    return this.TWO_WEEKS_MS;
  }
}
