"""
YOLOv8 Object Detection Module

Uses Ultralytics YOLOv8-nano for fast, lightweight object detection.
Detects 80 COCO classes including plants, bottles, people, vehicles, etc.
"""

import logging
from pathlib import Path
from PIL import Image
from ultralytics import YOLO

logger = logging.getLogger(__name__)


class YOLODetector:
    """YOLOv8 object detector wrapper."""

    def __init__(self, model_name: str = "yolov8n.pt", confidence_threshold: float = 0.3):
        self.model_name = model_name
        self.confidence_threshold = confidence_threshold
        self.model: YOLO | None = None
        self.loaded = False

    def load(self) -> None:
        """Load the YOLOv8 model. Downloads automatically if not cached."""
        try:
            logger.info(f"Loading YOLO model: {self.model_name}")
            self.model = YOLO(self.model_name)
            self.loaded = True
            logger.info(f"YOLO model loaded successfully. Classes: {len(self.model.names)}")
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}")
            raise

    def detect(self, image: Image.Image) -> list[dict]:
        """
        Run object detection on a PIL Image.

        Returns list of detections:
        [
            {"name": "person", "confidence": 0.92, "bbox": [x1, y1, x2, y2]},
            ...
        ]
        """
        if not self.loaded or self.model is None:
            raise RuntimeError("YOLO model not loaded. Call load() first.")

        # Run inference
        results = self.model(image, conf=self.confidence_threshold, verbose=False)

        detections = []
        for result in results:
            boxes = result.boxes
            if boxes is None:
                continue
            for box in boxes:
                cls_id = int(box.cls[0])
                confidence = float(box.conf[0])
                bbox = box.xyxy[0].tolist()  # [x1, y1, x2, y2]
                class_name = self.model.names[cls_id]

                detections.append({
                    "name": class_name,
                    "confidence": round(confidence, 3),
                    "bbox": [round(c, 1) for c in bbox],
                })

        # Sort by confidence descending
        detections.sort(key=lambda d: d["confidence"], reverse=True)
        logger.info(f"YOLO detected {len(detections)} objects")
        return detections

    def get_info(self) -> dict:
        """Return model metadata."""
        return {
            "name": self.model_name,
            "type": "YOLOv8 Object Detection",
            "classes": len(self.model.names) if self.model else 0,
            "loaded": self.loaded,
            "confidenceThreshold": self.confidence_threshold,
        }
