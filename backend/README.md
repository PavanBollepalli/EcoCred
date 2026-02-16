# EcoCred Vision Backend

AI-powered image analysis backend for the EcoCred platform using **YOLOv8** for object detection and **ResNet50** for scene classification.

## Features

- **YOLOv8 Object Detection** — Detects real-world objects in uploaded images (people, plants, bottles, bins, etc.)
- **ResNet50 Scene Classification** — Classifies the overall scene using ImageNet-trained features
- **Eco-Category Mapping** — Maps detected objects/scenes to EcoCred categories: `planting`, `waste`, `energy`, `water`
- **Confidence Scoring** — Returns a relevance score (0–100) for how well the image matches the claimed task
- **FastAPI** — High-performance async REST API

## Setup

### 1. Create virtual environment
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the server
```bash
# Development
python main.py

# Or with uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`.
API docs at `http://localhost:8000/docs`.

## API Endpoints

### `POST /api/analyze`
Analyze an uploaded image.

**Request:** `multipart/form-data`
- `file` (image file) — The image to analyze
- `category` (string, optional) — Expected eco-task category: `planting`, `waste`, `energy`, `water`

**Response:**
```json
{
  "success": true,
  "detectedObjects": [
    {"name": "potted plant", "confidence": 0.92, "bbox": [100, 200, 300, 400]},
    {"name": "person", "confidence": 0.88, "bbox": [50, 50, 250, 450]}
  ],
  "sceneLabels": ["garden", "greenhouse"],
  "ecoCategory": "planting",
  "relevanceScore": 87,
  "reasoning": "Detected potted plants and gardening activity consistent with planting tasks."
}
```

### `POST /api/classify`
Classify an image into eco-categories without a target category.

### `GET /api/health`
Health check endpoint.

### `GET /api/model-info`
Returns loaded model information and capabilities.

## Models Used

| Model | Purpose | Size | Source |
|-------|---------|------|--------|
| YOLOv8n | Object Detection | ~6MB | [Ultralytics](https://docs.ultralytics.com/) |
| ResNet50 | Scene Classification | ~98MB | [torchvision](https://pytorch.org/vision/) |

Models are downloaded automatically on first run.

## Architecture

```
backend/
├── main.py                  # FastAPI app entry point
├── requirements.txt         # Python dependencies
├── models/
│   ├── __init__.py
│   ├── yolo_detector.py     # YOLOv8 object detection
│   ├── scene_classifier.py  # ResNet50 scene classification
│   └── eco_mapper.py        # Maps detections → eco categories
├── services/
│   ├── __init__.py
│   └── image_analyzer.py    # Orchestrator service
├── schemas/
│   ├── __init__.py
│   └── responses.py         # Pydantic response models
└── README.md
```
