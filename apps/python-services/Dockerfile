FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for rembg/opencv
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the rembg u2net model (~170MB) during build
RUN python -c "from rembg import remove, new_session; \
    session = new_session('u2net'); \
    print('Model downloaded successfully')"

# Copy application code
COPY src/ ./src/

# Expose port (Cloud Run uses PORT env var, defaults to 8080)
EXPOSE 8080

# Run the application - use PORT env var for Cloud Run
CMD ["sh", "-c", "uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8080}"]
