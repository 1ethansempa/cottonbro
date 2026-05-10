import { IsNotEmpty, IsString } from "class-validator";

export class RestoreAccountDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}
