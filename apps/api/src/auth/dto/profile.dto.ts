import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";

const OTP_CODE_PATTERN = /^\d{4}(?:\d{2})?$/;

export class UpdateProfileNameDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;
}

export class UpdateProfilePhoneDto {
  @IsOptional()
  @IsString()
  @MaxLength(32)
  phoneNumber?: string;
}

export class UpdateProfileAvatarDto {
  @IsOptional()
  @IsString()
  @MaxLength(7_000_000)
  imageBase64?: string;
}

export class StartEmailChangeDto {
  @IsEmail()
  @IsString()
  email!: string;
}

export class ConfirmEmailChangeDto {
  @IsEmail()
  @IsString()
  email!: string;

  @IsString()
  @Matches(OTP_CODE_PATTERN)
  code!: string;
}
