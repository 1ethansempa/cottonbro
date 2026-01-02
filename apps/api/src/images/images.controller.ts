import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { ImagesService } from "./images.service.js";
import {
  RemoveBackgroundDto,
  RemoveBackgroundResponseDto,
} from "./dto/remove-background.dto.js";
import { AuthGuard } from "../auth/auth.guard.js";

@Controller("images")
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @UseGuards(AuthGuard)
  @Post("remove-background")
  async removeBackground(
    @Body() dto: RemoveBackgroundDto
  ): Promise<RemoveBackgroundResponseDto> {
    return this.imagesService.removeBackground(dto.image_base64);
  }
}
