# Python Services

FastAPI-based microservices for image processing tasks that Node.js struggles with.

## Requirements
- Python 3.12 (onnxruntime doesn't support 3.14 yet)

## Setup

```bash
cd apps/python-services
python3.12 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn src.main:app --reload --port 8000
```

## API Endpoints

### Images
- `POST /v1/images/remove-background` - Remove background from image

## Environment Variables

```env
# Optional: Set model cache directory
U2NET_HOME=/path/to/model/cache
```
