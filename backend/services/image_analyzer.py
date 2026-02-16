"""
Image Analyzer Service

Orchestrates YOLOv8 + ResNet50 + EcoMapper to produce a complete
image analysis for the EcoCred platform.
"""

import logging
from typing import Optional
from PIL import Image

from models.yolo_detector import YOLODetector
from models.scene_classifier import SceneClassifier
from models.eco_mapper import EcoMapper

logger = logging.getLogger(__name__)


class ImageAnalyzer:
    """Main service that runs the full analysis pipeline."""

    def __init__(self):
        self.yolo = YOLODetector(model_name="yolov8n.pt", confidence_threshold=0.25)
        self.scene = SceneClassifier(top_k=10)
        self.mapper = EcoMapper()
        self._loaded = False

    def load_models(self) -> None:
        """Load all models. Call once at startup."""
        logger.info("Loading all models...")
        self.yolo.load()
        self.scene.load()
        self._loaded = True
        logger.info("All models loaded successfully.")

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    def analyze(self, image: Image.Image, target_category: Optional[str] = None) -> dict:
        """
        Full analysis pipeline.

        Args:
            image: PIL Image to analyze
            target_category: Optional eco-category to score against

        Returns:
            Complete analysis dict with detections, classifications, scores, reasoning.
        """
        if not self._loaded:
            raise RuntimeError("Models not loaded. Call load_models() first.")

        # Step 1: YOLO object detection
        yolo_detections = self.yolo.detect(image)

        # Step 2: ResNet50 scene classification
        scene_labels = self.scene.classify(image)

        # Step 3: Map to eco-categories
        eco_result = self.mapper.compute_scores(
            yolo_detections=yolo_detections,
            scene_labels=scene_labels,
            target_category=target_category,
        )

        return {
            "yoloDetections": yolo_detections,
            "sceneLabels": scene_labels,
            "ecoCategory": eco_result["primaryCategory"],
            "relevanceScore": eco_result["relevanceScore"],
            "categoryScores": eco_result["scores"],
            "reasoning": eco_result["reasoning"],
        }

    def classify_only(self, image: Image.Image) -> dict:
        """
        Classify an image into eco-categories without a target.

        Returns category scores for all four eco-categories.
        """
        return self.analyze(image, target_category=None)

    def get_model_info(self) -> dict:
        """Return info about loaded models."""
        return {
            "yolo": self.yolo.get_info(),
            "resnet": self.scene.get_info(),
            "ecoCategories": ["planting", "waste", "energy", "water"],
            "loaded": self._loaded,
        }
