"""
Transparency/background removal service using rembg
"""

import base64
import io
from PIL import Image
from rembg import remove, new_session

# Initialize session once at module load (uses pre-downloaded model)
_session = new_session("u2net")


async def remove_background(image_base64: str) -> str:
    """
    Remove background from a base64-encoded image.
    
    Args:
        image_base64: Base64-encoded image string (with or without data URI prefix)
        
    Returns:
        Base64-encoded PNG image with transparent background
        
    Raises:
        ValueError: If the image cannot be decoded
    """
    # Strip data URI prefix if present
    if "," in image_base64:
        image_base64 = image_base64.split(",")[1]
    
    try:
        # Decode base64 to bytes
        image_bytes = base64.b64decode(image_base64)
    except Exception:
        raise ValueError("Invalid base64 image data")
    
    # Open image with PIL
    try:
        input_image = Image.open(io.BytesIO(image_bytes))
    except Exception:
        raise ValueError("Could not decode image. Ensure it's a valid image format.")
    
    # Remove background using rembg with pre-initialized session
    output_image = remove(input_image, session=_session)
    
    # Ensure output is in RGBA mode for transparency
    if output_image.mode != "RGBA":
        output_image = output_image.convert("RGBA")
    
    # Convert output to base64 PNG
    output_buffer = io.BytesIO()
    output_image.save(output_buffer, format="PNG")
    output_bytes = output_buffer.getvalue()
    
    # Return base64-encoded result
    result_base64 = base64.b64encode(output_bytes).decode("utf-8")
    return f"data:image/png;base64,{result_base64}"
