"""
Pydantic schemas for API request/response models
"""

from pydantic import BaseModel, Field


class ImageRequest(BaseModel):
    """Request model for image processing endpoints"""
    image_base64: str = Field(
        ...,
        description="Base64-encoded image data (with or without data URI prefix)",
        examples=["data:image/png;base64,iVBORw0KGgo..."]
    )


class ImageResponse(BaseModel):
    """Response model for image processing endpoints"""
    image_base64: str = Field(
        ...,
        description="Base64-encoded result image (PNG with transparency)"
    )
    success: bool = Field(
        default=True,
        description="Whether the operation succeeded"
    )
    message: str = Field(
        default="Success",
        description="Human-readable status message"
    )
