from pydantic import BaseModel, Field
from typing import Optional


class DetectedObject(BaseModel):
    """A single detected object from YOLO."""
    name: str = Field(..., description="Object class name")
    confidence: float = Field(..., description="Detection confidence 0-1")
    bbox: list[float] = Field(..., description="Bounding box [x1, y1, x2, y2]")


class AnalysisResponse(BaseModel):
    """Full image analysis response."""
    success: bool = True
    detectedObjects: list[DetectedObject] = Field(default_factory=list)
    sceneLabels: list[str] = Field(default_factory=list)
    ecoCategory: str = Field(..., description="Predicted eco category")
    relevanceScore: int = Field(..., ge=0, le=100, description="Relevance score 0-100")
    reasoning: str = Field(..., description="Human-readable reasoning")


class ClassifyResponse(BaseModel):
    """Image classification response without target category."""
    success: bool = True
    detectedObjects: list[DetectedObject] = Field(default_factory=list)
    sceneLabels: list[str] = Field(default_factory=list)
    categories: dict[str, float] = Field(
        default_factory=dict,
        description="Scores for each eco category (planting, waste, energy, water)"
    )
    primaryCategory: str = Field(..., description="Highest scoring category")
    reasoning: str = ""


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "healthy"
    modelsLoaded: bool = False
    yoloReady: bool = False
    resnetReady: bool = False


class ModelInfoResponse(BaseModel):
    """Model information response."""
    yolo: dict = Field(default_factory=dict)
    resnet: dict = Field(default_factory=dict)
    ecoCategories: list[str] = ["planting", "waste", "energy", "water"]


class ErrorResponse(BaseModel):
    """Error response."""
    success: bool = False
    error: str
