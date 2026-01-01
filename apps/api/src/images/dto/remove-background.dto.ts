import { IsString, IsNotEmpty } from "class-validator";

export class RemoveBackgroundDto {
  @IsString()
  @IsNotEmpty()
  image_base64!: string;
}

export class RemoveBackgroundResponseDto {
  image_base64!: string;
  success!: boolean;
  message!: string;
}

