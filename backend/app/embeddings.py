from __future__ import annotations

import logging
import math
from functools import lru_cache
from pathlib import Path

from PIL import Image

from .config import settings

logger = logging.getLogger(__name__)

try:
    import torch
    from torchvision.models import ResNet50_Weights, resnet50

    TORCH_AVAILABLE = True
except Exception:  # pragma: no cover
    TORCH_AVAILABLE = False
    torch = None  # type: ignore[assignment]
    ResNet50_Weights = None  # type: ignore[assignment]
    resnet50 = None  # type: ignore[assignment]


class _IdentityEncoder(torch.nn.Module if TORCH_AVAILABLE else object):  # type: ignore[misc]
    pass


@lru_cache(maxsize=4)
def _load_encoder(encoder_type: str = 'primary'):
    if not TORCH_AVAILABLE:
        return None, None

    checkpoint = Path(settings.pet_embedding_checkpoint if encoder_type == 'primary' else settings.nose_embedding_checkpoint)
    weights = ResNet50_Weights.DEFAULT
    model = resnet50(weights=weights)
    model.fc = torch.nn.Identity()  # type: ignore[union-attr]

    if checkpoint.exists():
        try:
            payload = torch.load(checkpoint, map_location='cpu')
            if isinstance(payload, dict) and 'state_dict' in payload:
                payload = payload['state_dict']
            if isinstance(payload, dict):
                cleaned = {k.replace('module.', '').replace('encoder.', ''): v for k, v in payload.items()}
                model.load_state_dict(cleaned, strict=False)
                logger.info('Loaded %s checkpoint from %s', encoder_type, checkpoint)
        except Exception as exc:  # pragma: no cover
            logger.warning('Unable to load %s checkpoint %s: %s', encoder_type, checkpoint, exc)

    model.eval()
    preprocess = weights.transforms()
    return model, preprocess


def _normalize(vec: list[float]) -> list[float]:
    norm = math.sqrt(sum(x * x for x in vec)) or 1.0
    return [x / norm for x in vec]


def _fallback_embedding(image_path: Path, target_dim: int) -> list[float]:
    with Image.open(image_path) as img:
        img = img.convert('RGB').resize((128, 128))
        histogram = img.histogram()
    histogram = [float(x) for x in histogram]
    if not histogram:
        histogram = [0.0]
    repeated: list[float] = []
    while len(repeated) < target_dim:
        repeated.extend(histogram)
    return _normalize(repeated[:target_dim])


async def embed_image(image_path: Path, encoder_type: str = 'primary') -> list[float]:
    target_dim = settings.embedding_dim if encoder_type == 'primary' else settings.nose_embedding_dim
    if not TORCH_AVAILABLE:
        logger.warning('Torch/TorchVision unavailable; using histogram fallback embeddings.')
        return _fallback_embedding(image_path, target_dim)

    model, preprocess = _load_encoder(encoder_type)
    if model is None or preprocess is None:
        return _fallback_embedding(image_path, target_dim)

    with Image.open(image_path) as img:
        rgb = img.convert('RGB')

    with torch.no_grad():  # type: ignore[union-attr]
        batch = preprocess(rgb).unsqueeze(0)
        output = model(batch).squeeze(0)
        vector = output.detach().cpu().tolist()

    floats = [float(x) for x in vector]
    if len(floats) < target_dim:
        floats.extend([0.0] * (target_dim - len(floats)))
    return _normalize(floats[:target_dim])
