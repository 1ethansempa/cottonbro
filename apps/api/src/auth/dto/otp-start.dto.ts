import { IsEmail, IsString } from "class-validator";

export class OtpStartDto {
  @IsEmail()
  @IsString()
  email!: string;
}
