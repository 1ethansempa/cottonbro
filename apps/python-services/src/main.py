"""
Cotton Bro Python Services
FastAPI application for image processing
"""

import os
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .routers import images

load_dotenv()

app = FastAPI(
    title="Cotton Bro Python Services",
    description="Image processing APIs for Cotton Bro platform",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:3001", "https://cottonbro-api-491077850913.europe-west1.run.app"],
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
