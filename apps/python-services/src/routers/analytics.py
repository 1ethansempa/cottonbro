"""
Analytics router (placeholder for future use)
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/placeholder")
async def placeholder():
    """Placeholder endpoint for future analytics APIs"""
    return {"message": "Analytics API coming soon"}
