import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { mintApiIdToken } from "../auth/api-auth.js";

@Injectable()
export class ImagesService {
  private readonly pythonServiceUrl: string;

  constructor() {
    this.pythonServiceUrl =
      process.env.PYTHON_SERVICE_URL ?? "http://localhost:8000";
  }

  async removeBackground(imageBase64: string): Promise<{
    image_base64: string;
    success: boolean;
    message: string;
  }> {
    try {
      const idToken = await mintApiIdToken(this.pythonServiceUrl);
      const upstreamUrl = `${this.pythonServiceUrl}/v1/images/remove-background`;
      console.log(`[ImagesService] Calling Python service: ${upstreamUrl}`);
      const response = await fetch(
        upstreamUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ image_base64: imageBase64 }),
        }
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "unknown";
        console.error(
          `[ImagesService] Upstream error: ${response.status} ${response.statusText} (content-type: ${contentType})`
        );
        const errorText = await response.text();
        throw new HttpException(
          `Python service error: ${errorText}`,
          response.status
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Failed to connect to Python service: ${error}`,
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }
  }
}
