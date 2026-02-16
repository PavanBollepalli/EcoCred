"""
EcoCred Vision Backend — FastAPI Application

Provides image analysis endpoints using YOLOv8 + ResNet50 for the EcoCred platform.
Classifies uploaded images into eco-categories: planting, waste, energy, water.

Usage:
    python main.py
    # or
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

import io
import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from services.image_analyzer import ImageAnalyzer
from schemas.responses import (
    AnalysisResponse,
    ClassifyResponse,
    DetectedObject,
    ErrorResponse,
    HealthResponse,
    ModelInfoResponse,
)

# ─── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
)
logger = logging.getLogger("ecocred-vision")

# ─── Global Model Instance ──────────────────────────────────────────────────────
analyzer = ImageAnalyzer()


# ─── Lifespan (model loading on startup) ─────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on startup, cleanup on shutdown."""
    logger.info("Starting EcoCred Vision Backend...")
    try:
        analyzer.load_models()
        logger.info("Models loaded. Server ready.")
    except Exception as e:
        logger.error(f"Failed to load models: {e}")
        logger.warning("Server starting WITHOUT models. /api/health will report unhealthy.")
    yield
    logger.info("Shutting down EcoCred Vision Backend.")


# ─── FastAPI App ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="EcoCred Vision API",
    description="AI-powered image analysis for eco-task verification using YOLOv8 & ResNet50",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Helper ──────────────────────────────────────────────────────────────────────
async def _read_image(file: UploadFile) -> Image.Image:
    """Read an uploaded file into a PIL Image."""
    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file. Please upload a JPEG or PNG.")
    return image


# ─── Endpoints ───────────────────────────────────────────────────────────────────

@app.get("/api/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """Health check — reports model loading status."""
    return HealthResponse(
        status="healthy" if analyzer.is_loaded else "degraded",
        modelsLoaded=analyzer.is_loaded,
        yoloReady=analyzer.yolo.loaded,
        resnetReady=analyzer.scene.loaded,
    )


@app.get("/api/model-info", response_model=ModelInfoResponse, tags=["System"])
async def model_info():
    """Returns information about the loaded models."""
    info = analyzer.get_model_info()
    return ModelInfoResponse(
        yolo=info["yolo"],
        resnet=info["resnet"],
        ecoCategories=info["ecoCategories"],
    )


@app.post(
    "/api/analyze",
    response_model=AnalysisResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    tags=["Analysis"],
)
async def analyze_image(
    file: UploadFile = File(..., description="Image file (JPEG, PNG)"),
    category: Optional[str] = Form(None, description="Target eco-category: planting, waste, energy, water"),
):
    """
    Analyze an uploaded image using YOLOv8 object detection + ResNet50 classification.

    Optionally provide a `category` to get a relevance score for that specific eco-task.
    """
    if not analyzer.is_loaded:
        raise HTTPException(status_code=503, detail="Models are still loading. Try again shortly.")

    # Validate category
    valid_categories = {"planting", "waste", "energy", "water"}
    if category and category not in valid_categories:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category '{category}'. Must be one of: {', '.join(valid_categories)}",
        )

    image = await _read_image(file)

    try:
        result = analyzer.analyze(image, target_category=category)
    except Exception as e:
        logger.error(f"Analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Image analysis failed. Please try again.")

    detected_objects = [
        DetectedObject(
            name=d["name"],
            confidence=d["confidence"],
            bbox=d["bbox"],
        )
        for d in result["yoloDetections"][:20]  # Cap at 20 objects
    ]

    scene_labels = [s["label"] for s in result["sceneLabels"][:5]]

    return AnalysisResponse(
        success=True,
        detectedObjects=detected_objects,
        sceneLabels=scene_labels,
        ecoCategory=result["ecoCategory"],
        relevanceScore=result["relevanceScore"],
        reasoning=result["reasoning"],
    )


@app.post(
    "/api/classify",
    response_model=ClassifyResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    tags=["Analysis"],
)
async def classify_image(
    file: UploadFile = File(..., description="Image file (JPEG, PNG)"),
):
    """
    Classify an image into eco-categories without specifying a target.

    Returns scores for all four categories: planting, waste, energy, water.
    """
    if not analyzer.is_loaded:
        raise HTTPException(status_code=503, detail="Models are still loading. Try again shortly.")

    image = await _read_image(file)

    try:
        result = analyzer.classify_only(image)
    except Exception as e:
        logger.error(f"Classification failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Classification failed. Please try again.")

    detected_objects = [
        DetectedObject(
            name=d["name"],
            confidence=d["confidence"],
            bbox=d["bbox"],
        )
        for d in result["yoloDetections"][:20]
    ]

    scene_labels = [s["label"] for s in result["sceneLabels"][:5]]

    return ClassifyResponse(
        success=True,
        detectedObjects=detected_objects,
        sceneLabels=scene_labels,
        categories=result["categoryScores"],
        primaryCategory=result["ecoCategory"],
        reasoning=result["reasoning"],
    )


@app.post(
    "/api/analyze-base64",
    response_model=AnalysisResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    tags=["Analysis"],
)
async def analyze_base64(body: dict):
    """
    Analyze a base64-encoded image. Useful for integration with the Next.js API route.

    Request body:
    {
        "image": "base64-encoded-image-data",
        "category": "planting"  // optional
    }
    """
    import base64

    if not analyzer.is_loaded:
        raise HTTPException(status_code=503, detail="Models are still loading. Try again shortly.")

    image_b64 = body.get("image")
    category = body.get("category")

    if not image_b64:
        raise HTTPException(status_code=400, detail="'image' field with base64 data is required.")

    valid_categories = {"planting", "waste", "energy", "water"}
    if category and category not in valid_categories:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category '{category}'. Must be one of: {', '.join(valid_categories)}",
        )

    try:
        # Handle data URL format: data:image/jpeg;base64,...
        if "," in image_b64:
            image_b64 = image_b64.split(",", 1)[1]
        image_bytes = base64.b64decode(image_b64)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 image data.")

    try:
        result = analyzer.analyze(image, target_category=category)
    except Exception as e:
        logger.error(f"Analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Image analysis failed.")

    detected_objects = [
        DetectedObject(
            name=d["name"],
            confidence=d["confidence"],
            bbox=d["bbox"],
        )
        for d in result["yoloDetections"][:20]
    ]

    scene_labels = [s["label"] for s in result["sceneLabels"][:5]]

    return AnalysisResponse(
        success=True,
        detectedObjects=detected_objects,
        sceneLabels=scene_labels,
        ecoCategory=result["ecoCategory"],
        relevanceScore=result["relevanceScore"],
        reasoning=result["reasoning"],
    )


# ─── Entry Point ─────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
