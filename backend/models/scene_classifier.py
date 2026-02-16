"""
ResNet50 Scene Classification Module

Uses torchvision's pretrained ResNet50 (ImageNet) for scene/object classification.
Returns top-K predicted labels for the overall scene.
"""

import logging
import torch
import torch.nn.functional as F
from torchvision import models, transforms
from PIL import Image

logger = logging.getLogger(__name__)

# ImageNet class labels (abbreviated — full 1000 classes loaded from torchvision)
# We'll load them dynamically
IMAGENET_LABELS_URL = "https://raw.githubusercontent.com/pytorch/hub/master/imagenet_classes.txt"


class SceneClassifier:
    """ResNet50-based scene/image classifier."""

    def __init__(self, top_k: int = 10):
        self.top_k = top_k
        self.model = None
        self.transform = None
        self.labels: list[str] = []
        self.loaded = False
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

    def load(self) -> None:
        """Load the ResNet50 model with ImageNet weights."""
        try:
            logger.info(f"Loading ResNet50 on device: {self.device}")

            # Load pretrained ResNet50
            weights = models.ResNet50_Weights.IMAGENET1K_V2
            self.model = models.resnet50(weights=weights)
            self.model.eval()
            self.model.to(self.device)

            # Use the transforms from the weights
            self.transform = weights.transforms()

            # Load class labels from weights meta
            self.labels = weights.meta["categories"]

            self.loaded = True
            logger.info(f"ResNet50 loaded. {len(self.labels)} classes available.")
        except Exception as e:
            logger.error(f"Failed to load ResNet50: {e}")
            raise

    @torch.no_grad()
    def classify(self, image: Image.Image) -> list[dict]:
        """
        Classify an image and return top-K predictions.

        Returns:
        [
            {"label": "pot", "confidence": 0.45},
            {"label": "flowerpot", "confidence": 0.32},
            ...
        ]
        """
        if not self.loaded or self.model is None:
            raise RuntimeError("ResNet50 model not loaded. Call load() first.")

        # Preprocess
        img_tensor = self.transform(image.convert("RGB")).unsqueeze(0).to(self.device)

        # Forward pass
        output = self.model(img_tensor)
        probabilities = F.softmax(output, dim=1)

        # Get top-K
        top_probs, top_indices = torch.topk(probabilities, self.top_k, dim=1)

        results = []
        for prob, idx in zip(top_probs[0], top_indices[0]):
            results.append({
                "label": self.labels[idx.item()],
                "confidence": round(prob.item(), 4),
            })

        logger.info(f"ResNet50 top prediction: {results[0]['label']} ({results[0]['confidence']:.2%})")
        return results

    def get_info(self) -> dict:
        """Return model metadata."""
        return {
            "name": "ResNet50",
            "type": "Image Classification (ImageNet)",
            "classes": len(self.labels),
            "loaded": self.loaded,
            "device": self.device,
            "topK": self.top_k,
        }
