from __future__ import annotations

from pathlib import Path

from PIL import Image

from .config import settings

try:
    from transformers import pipeline  # type: ignore
except Exception:  # pragma: no cover
    pipeline = None  # type: ignore[assignment]


_CANDIDATES = [
    'dog', 'cat', 'brown fur', 'black fur', 'white fur', 'ginger fur', 'gray fur',
    'small dog', 'large dog', 'short hair', 'long hair', 'pointy ears', 'floppy ears',
    'blue eyes', 'husky mix', 'golden retriever', 'labrador', 'tabby cat', 'black collar',
    'red collar', 'no collar', 'stray dog', 'stray cat',
]

_classifier = None


def _get_classifier():
    global _classifier
    if _classifier is not None or pipeline is None:
        return _classifier
    try:
        _classifier = pipeline('zero-shot-image-classification', model=settings.semantic_model_name)
    except Exception:
        _classifier = None
    return _classifier



def _dominant_color_tags(image_path: Path) -> list[str]:
    with Image.open(image_path) as img:
        rgb = img.convert('RGB').resize((64, 64))
        pixels = list(rgb.getdata())
    if not pixels:
        return []
    r = sum(p[0] for p in pixels) / len(pixels)
    g = sum(p[1] for p in pixels) / len(pixels)
    b = sum(p[2] for p in pixels) / len(pixels)
    tags: list[str] = []
    if max(r, g, b) < 65:
        tags.append('black fur')
    elif min(r, g, b) > 200:
        tags.append('white fur')
    elif r > g * 1.1 and r > b * 1.1:
        tags.append('brown fur' if g > 80 else 'ginger fur')
    elif b > r * 1.08 and b > g * 1.08:
        tags.append('gray fur')
    return tags



def _text_seed_tags(*values: str) -> list[str]:
    text = ' '.join(value.lower() for value in values if value)
    out: list[str] = []
    mapping = {
        'husky': 'husky mix',
        'golden': 'golden retriever',
        'labrador': 'labrador',
        'blue': 'blue eyes',
        'long hair': 'long hair',
        'short hair': 'short hair',
        'pointy': 'pointy ears',
        'floppy': 'floppy ears',
        'red collar': 'red collar',
        'black collar': 'black collar',
        'no collar': 'no collar',
    }
    for needle, tag in mapping.items():
        if needle in text:
            out.append(tag)
    return out



def extract_semantic_tags(image_path: Path, *text_fields: str) -> list[str]:
    tags = set(_dominant_color_tags(image_path))
    tags.update(_text_seed_tags(*text_fields))

    classifier = _get_classifier()
    if classifier is not None:
        try:
            result = classifier(str(image_path), candidate_labels=_CANDIDATES)
            for item in result:
                label = str(item.get('label', '')).strip().lower()
                score = float(item.get('score', 0.0))
                if label and score >= settings.semantic_tag_threshold:
                    tags.add(label)
        except Exception:
            pass

    clean = [item for item in tags if item]
    clean.sort()
    return clean[:10]
