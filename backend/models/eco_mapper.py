"""
Eco-Category Mapper Module

Maps YOLO detections and ResNet50 scene labels to EcoCred eco-categories:
  - planting: trees, plants, gardening, agriculture
  - waste: recycling, garbage, cleanup
  - energy: solar, LED, electrical, conservation
  - water: water bodies, taps, conservation, irrigation

Uses keyword matching with weighted scoring to produce
a relevance score and category prediction.
"""

import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ─── Mapping Tables ────────────────────────────────────────────────────────────

# YOLO COCO class → eco-category associations with weight
# Higher weight = stronger association
YOLO_ECO_MAP: dict[str, list[tuple[str, float]]] = {
    # ── Planting ──
    "potted plant":   [("planting", 0.95)],
    "vase":           [("planting", 0.4), ("water", 0.2)],
    "broccoli":       [("planting", 0.5)],
    "carrot":         [("planting", 0.5)],
    "apple":          [("planting", 0.4)],
    "orange":         [("planting", 0.4)],
    "banana":         [("planting", 0.4)],

    # ── Waste ──
    "bottle":         [("waste", 0.7), ("water", 0.2)],
    "cup":            [("waste", 0.5)],
    "handbag":        [("waste", 0.3)],
    "backpack":       [("waste", 0.2)],
    "suitcase":       [("waste", 0.2)],

    # ── Energy ──
    "tv":             [("energy", 0.5)],
    "laptop":         [("energy", 0.5)],
    "cell phone":     [("energy", 0.4)],
    "microwave":      [("energy", 0.6)],
    "oven":           [("energy", 0.6)],
    "toaster":        [("energy", 0.5)],
    "refrigerator":   [("energy", 0.5)],
    "hair drier":     [("energy", 0.4)],

    # ── Water ──
    "sink":           [("water", 0.7)],
    "toilet":         [("water", 0.5)],
    "bowl":           [("water", 0.3)],

    # ── General / multi-category ──
    "person":         [("planting", 0.1), ("waste", 0.1), ("energy", 0.1), ("water", 0.1)],
    "bicycle":        [("energy", 0.3)],  # eco-friendly transport
    "car":            [("energy", -0.2)],  # negative signal for energy conservation
    "truck":          [("energy", -0.2), ("waste", 0.2)],
    "bus":            [("energy", 0.1)],
    "scissors":       [("planting", 0.3)],  # gardening
    "knife":          [("planting", 0.2)],
    "fork":           [("waste", 0.2)],
    "spoon":          [("waste", 0.2)],
    "bird":           [("planting", 0.3)],  # nature
    "cat":            [("planting", 0.1)],
    "dog":            [("planting", 0.1)],
    "horse":          [("planting", 0.2)],
    "cow":            [("planting", 0.2)],
    "sheep":          [("planting", 0.2)],
    "elephant":       [("planting", 0.3)],
}

# ResNet50/ImageNet label keywords → eco-category associations
# These are partial-match keywords against ImageNet class names
SCENE_ECO_KEYWORDS: dict[str, list[tuple[str, float]]] = {
    # ── Planting ──
    "tree":           [("planting", 0.9)],
    "garden":         [("planting", 0.9)],
    "flower":         [("planting", 0.85)],
    "plant":          [("planting", 0.85)],
    "pot":            [("planting", 0.7)],
    "greenhouse":     [("planting", 0.9)],
    "lawn":           [("planting", 0.7)],
    "mushroom":       [("planting", 0.5)],
    "vegetable":      [("planting", 0.7)],
    "herb":           [("planting", 0.7)],
    "daisy":          [("planting", 0.8)],
    "rose":           [("planting", 0.8)],
    "sunflower":      [("planting", 0.8)],
    "seedling":       [("planting", 0.95)],
    "leaf":           [("planting", 0.7)],
    "forest":         [("planting", 0.8)],
    "park":           [("planting", 0.6)],
    "soil":           [("planting", 0.8)],
    "shovel":         [("planting", 0.7)],
    "hoe":            [("planting", 0.7)],
    "corn":           [("planting", 0.6)],
    "acorn":          [("planting", 0.7)],

    # ── Waste ──
    "garbage":        [("waste", 0.95)],
    "trash":          [("waste", 0.95)],
    "bin":            [("waste", 0.9)],
    "recycl":         [("waste", 0.95)],
    "plastic":        [("waste", 0.85)],
    "bag":            [("waste", 0.5)],
    "bottle":         [("waste", 0.7)],
    "can":            [("waste", 0.5)],
    "waste":          [("waste", 0.95)],
    "compost":        [("waste", 0.9)],
    "litter":         [("waste", 0.9)],
    "dump":           [("waste", 0.8)],
    "cardboard":      [("waste", 0.7)],
    "paper":          [("waste", 0.6)],
    "carton":         [("waste", 0.6)],
    "crate":          [("waste", 0.5)],

    # ── Energy ──
    "solar":          [("energy", 0.95)],
    "panel":          [("energy", 0.6)],
    "bulb":           [("energy", 0.8)],
    "lamp":           [("energy", 0.7)],
    "light":          [("energy", 0.5)],
    "electric":       [("energy", 0.7)],
    "power":          [("energy", 0.7)],
    "wind":           [("energy", 0.7)],
    "turbine":        [("energy", 0.9)],
    "battery":        [("energy", 0.7)],
    "switch":         [("energy", 0.6)],
    "plug":           [("energy", 0.5)],
    "led":            [("energy", 0.8)],
    "bicycle":        [("energy", 0.4)],
    "bike":           [("energy", 0.4)],

    # ── Water ──
    "water":          [("water", 0.9)],
    "rain":           [("water", 0.85)],
    "river":          [("water", 0.7)],
    "lake":           [("water", 0.7)],
    "pond":           [("water", 0.7)],
    "fountain":       [("water", 0.7)],
    "tap":            [("water", 0.85)],
    "faucet":         [("water", 0.85)],
    "bucket":         [("water", 0.7)],
    "hose":           [("water", 0.7)],
    "irrigation":     [("water", 0.9)],
    "sprinkler":      [("water", 0.8)],
    "dam":            [("water", 0.7)],
    "well":           [("water", 0.7)],
    "tank":           [("water", 0.6)],
    "pipe":           [("water", 0.5)],
    "aquarium":       [("water", 0.5)],
    "ocean":          [("water", 0.6)],
    "sea":            [("water", 0.6)],
}

ECO_CATEGORIES = ["planting", "waste", "energy", "water"]


class EcoMapper:
    """Maps YOLO detections and scene labels to eco-categories with scoring."""

    def compute_scores(
        self,
        yolo_detections: list[dict],
        scene_labels: list[dict],
        target_category: Optional[str] = None,
    ) -> dict:
        """
        Compute eco-category scores from detections and scene labels.

        Args:
            yolo_detections: List of {"name": str, "confidence": float, ...}
            scene_labels: List of {"label": str, "confidence": float}
            target_category: If provided, compute relevance for this specific category

        Returns:
            {
                "scores": {"planting": 0.75, "waste": 0.1, ...},
                "primaryCategory": "planting",
                "relevanceScore": 87,          # 0-100
                "reasoning": "Explanation...",
                "matchedObjects": [...],
                "matchedScenes": [...],
            }
        """
        scores = {cat: 0.0 for cat in ECO_CATEGORIES}
        matched_objects = []
        matched_scenes = []

        # ── Score from YOLO detections ──
        for det in yolo_detections:
            obj_name = det["name"].lower()
            obj_conf = det["confidence"]

            if obj_name in YOLO_ECO_MAP:
                for category, weight in YOLO_ECO_MAP[obj_name]:
                    contribution = weight * obj_conf
                    scores[category] += contribution
                    matched_objects.append(f"{det['name']} → {category} (+{contribution:.2f})")

        # ── Score from ResNet50 scene labels ──
        for scene in scene_labels:
            label = scene["label"].lower()
            scene_conf = scene["confidence"]

            for keyword, mappings in SCENE_ECO_KEYWORDS.items():
                if keyword in label:
                    for category, weight in mappings:
                        contribution = weight * scene_conf
                        scores[category] += contribution
                        matched_scenes.append(f"{scene['label']} (~{keyword}) → {category} (+{contribution:.2f})")

        # Normalize scores to 0-1 range
        max_score = max(scores.values()) if max(scores.values()) > 0 else 1.0
        normalized = {cat: min(1.0, score / max(max_score, 0.01)) for cat, score in scores.items()}

        # Determine primary category
        primary = max(scores, key=lambda c: scores[c])

        # Compute relevance score (0-100)
        if target_category:
            # Score relative to target category
            raw = scores.get(target_category, 0.0)
            # Scale: anything above 1.0 raw score → 90-100, 0.5-1.0 → 60-90, etc.
            if raw >= 1.5:
                relevance = min(100, int(85 + raw * 10))
            elif raw >= 0.5:
                relevance = int(55 + raw * 30)
            elif raw > 0:
                relevance = int(30 + raw * 50)
            else:
                relevance = 10
            relevance = min(100, max(0, relevance))
        else:
            # General relevance — how strongly eco-related overall
            total = sum(scores.values())
            if total >= 2.0:
                relevance = min(100, int(80 + total * 5))
            elif total >= 0.5:
                relevance = int(40 + total * 30)
            elif total > 0:
                relevance = int(15 + total * 50)
            else:
                relevance = 5

        # Build reasoning
        reasoning = self._build_reasoning(
            yolo_detections, scene_labels, scores, primary,
            target_category, relevance, matched_objects, matched_scenes
        )

        return {
            "scores": {cat: round(normalized[cat], 3) for cat in ECO_CATEGORIES},
            "rawScores": {cat: round(scores[cat], 3) for cat in ECO_CATEGORIES},
            "primaryCategory": primary,
            "relevanceScore": relevance,
            "reasoning": reasoning,
            "matchedObjects": matched_objects,
            "matchedScenes": matched_scenes,
        }

    def _build_reasoning(
        self, yolo_detections, scene_labels, scores, primary,
        target_category, relevance, matched_objects, matched_scenes
    ) -> str:
        """Build a human-readable reasoning string."""
        parts = []

        # Summarize what was detected
        obj_names = list({d["name"] for d in yolo_detections[:8]})
        if obj_names:
            parts.append(f"Detected objects: {', '.join(obj_names)}.")

        scene_names = [s["label"] for s in scene_labels[:3]]
        if scene_names:
            parts.append(f"Scene appears to be: {', '.join(scene_names)}.")

        # Category reasoning
        if target_category:
            if relevance >= 75:
                parts.append(
                    f"Strong match for '{target_category}' category (score: {relevance}/100)."
                )
            elif relevance >= 45:
                parts.append(
                    f"Moderate match for '{target_category}' category (score: {relevance}/100). "
                    f"Some relevant elements detected."
                )
            else:
                parts.append(
                    f"Weak match for '{target_category}' category (score: {relevance}/100). "
                    f"Image may not be directly related to this task type."
                )
                if primary != target_category and scores[primary] > 0:
                    parts.append(f"Looks more like a '{primary}' activity.")
        else:
            parts.append(f"Best matching eco-category: '{primary}' (score: {relevance}/100).")

        if not obj_names and not scene_names:
            parts.append("No strong eco-related signals detected in the image.")

        return " ".join(parts)
