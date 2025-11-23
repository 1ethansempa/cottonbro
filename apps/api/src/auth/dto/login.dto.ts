import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from "class-validator";

export class LoginDto {
  @IsString()
  idToken!: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Min(60_000)
  ttlMs?: number; // optional override (e.g., admin 7d)
}
