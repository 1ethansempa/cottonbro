import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class OtpStartDto {
  @IsEmail()
  @IsString()
  email!: string;

  @IsString()
  @IsNotEmpty()
  captchaToken!: string;
}
