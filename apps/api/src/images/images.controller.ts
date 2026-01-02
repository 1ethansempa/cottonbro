import { Controller, Post, Body } from "@nestjs/common";
import { ImagesService } from "./images.service.js";
import {
  RemoveBackgroundDto,
  RemoveBackgroundResponseDto,
} from "./dto/remove-background.dto.js";

// NOTE: No AuthGuard here - the design page already requires auth client-side
// and this endpoint is protected by the Python service's API key
@Controller("images")
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post("remove-background")
  async removeBackground(
    @Body() dto: RemoveBackgroundDto
  ): Promise<RemoveBackgroundResponseDto> {
    return this.imagesService.removeBackground(dto.image_base64);
  }
}
