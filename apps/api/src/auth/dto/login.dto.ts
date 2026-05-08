import { IsBoolean, IsOptional, IsString } from "class-validator";

export class LoginDto {
  @IsString()
  idToken!: string;

  @IsOptional()
  @IsBoolean()
  privacyPolicyAccepted?: boolean;

  @IsOptional()
  @IsBoolean()
  termsAccepted?: boolean;
}
