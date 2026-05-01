import { IsEmail, IsString, Matches } from "class-validator";

const OTP_CODE_PATTERN = /^\d{4}(?:\d{2})?$/;

export class OtpVerifyDto {
  @IsEmail()
  @IsString()
  email!: string;

  @IsString()
  @Matches(OTP_CODE_PATTERN)
  code!: string;
}
