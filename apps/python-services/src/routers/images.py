"""
Image processing router
"""

from fastapi import APIRouter, HTTPException

from ..models.schemas import ImageRequest, ImageResponse
from ..services.transparency import remove_background

router = APIRouter()


@router.post("/remove-background", response_model=ImageResponse)
async def remove_background_endpoint(request: ImageRequest) -> ImageResponse:
    """
    Remove background from an image.
    
    Accepts a base64-encoded image and returns a base64-encoded
    image with transparent background.
    """
    try:
        result_base64 = await remove_background(request.image_base64)
        return ImageResponse(
            image_base64=result_base64,
            success=True,
            message="Background removed successfully"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
