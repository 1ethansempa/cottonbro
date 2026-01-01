"""
Cotton Bro Python Services
FastAPI application for image processing
"""

import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .routers import images

app = FastAPI(
    title="Cotton Bro Python Services",
    description="Image processing APIs for Cotton Bro platform",
    version="1.0.0",
)

# API Key for internal service-to-service auth
API_KEY = os.getenv("PYTHON_API_KEY", "dev-key-change-in-production")


@app.middleware("http")
async def verify_api_key(request: Request, call_next):
    """Validate API key for all requests except health check"""
    if request.url.path == "/health":
        return await call_next(request)
    
    api_key = request.headers.get("X-API-Key")
    if api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    
    return await call_next(request)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "https://cottonbro-api-491077850913.europe-west1.run.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(images.router, prefix="/v1/images", tags=["images"])


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "python-services"}
