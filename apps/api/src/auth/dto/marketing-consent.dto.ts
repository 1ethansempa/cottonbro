import { IsBoolean } from "class-validator";

export class MarketingConsentDto {
  @IsBoolean()
  enabled!: boolean;
}
