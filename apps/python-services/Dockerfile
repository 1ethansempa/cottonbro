# Start from the official Python 3.11 slim image.
# "slim" keeps the base image smaller than the full Python image.
FROM python:3.11-slim

# Set environment variables used by Python, pip, and the app.
ENV PYTHONDONTWRITEBYTECODE=1 \
    # Prevent Python from creating .pyc files.
    # This avoids extra filesystem writes inside the container.
    PYTHONUNBUFFERED=1 \
    # Force stdout/stderr to be unbuffered.
    # Useful for seeing logs immediately in Docker/Cloud Run.
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    # Stops pip from checking whether a newer pip version exists.
    # Slightly reduces noise and build-time overhead.
    PORT=8080 \
    # Default application port.
    # The final CMD uses this, or falls back to 8080 if not set.
    XDG_CACHE_HOME=/app/.cache
    # Sets a predictable cache directory for tools/libraries
    # such as rembg model downloads.

# Set the working directory inside the container.
# All following relative paths run from /app.
WORKDIR /app

# Install required system libraries.
RUN set -eux; \
    # set -e  -> exit immediately if a command fails
    # set -u  -> fail on unset variables
    # set -x  -> print commands as they run (useful for debugging builds)
    apt-get update; \
    # Refresh package index so apt knows what packages are available.
    apt-get install -y --no-install-recommends \
        libgl1 \
        # Common OpenCV/runtime graphics dependency.
        libglib2.0-0 \
        # Common dependency required by image-processing libraries.
        libsm6 \
        # X11/session-related runtime library, sometimes needed by OpenCV.
        libxext6 \
        # X11 extension library, often pulled in for graphics/image libs.
        libxrender1 \
        # X rendering support library.
        ca-certificates; \
        # SSL root certificates so HTTPS requests can work properly.
    rm -rf /var/lib/apt/lists/*
    # Remove apt package lists to reduce final image size.

# Copy only the requirements file first.
# This helps Docker layer caching: dependencies only reinstall
# when requirements.txt changes.
COPY requirements.txt .

# Upgrade pip, then install Python dependencies from requirements.txt.
RUN python -m pip install --upgrade pip \
    && python -m pip install --no-cache-dir -r requirements.txt
    # --no-cache-dir avoids storing pip wheel/download cache in the image,
    # which keeps the final image smaller.

# Create the cache directory used by XDG_CACHE_HOME.
RUN mkdir -p /app/.cache

# Pre-download the rembg model during image build.
# This means the container already contains the model at runtime,
# avoiding a first-request download.
RUN python -c "from rembg import new_session; new_session('u2net'); print('Model downloaded successfully')"

# Copy application source code into the image.
COPY src/ ./src/

# Create a non-root user for better security,
# then give that user ownership of /app.
RUN useradd --uid 10001 --create-home appuser \
    && chown -R appuser:appuser /app

# Switch from root to the non-root user.
# The app will run as appuser instead of root.
USER appuser

# Document that the container listens on port 8080.
# This does not actually publish the port by itself,
# but acts as metadata for humans and tools.
EXPOSE 8080

# Start the FastAPI app with uvicorn.
# Uses sh -c so ${PORT:-8080} can be expanded by the shell.
# If PORT is set in the environment, use it; otherwise use 8080.
CMD ["sh", "-c", "uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8080}"]