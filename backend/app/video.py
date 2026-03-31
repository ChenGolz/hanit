from __future__ import annotations

import math
from pathlib import Path

from .config import settings

try:
    import cv2  # type: ignore
except Exception:  # pragma: no cover
    cv2 = None  # type: ignore[assignment]


def _frame_score(frame) -> tuple[float, dict]:
    if cv2 is None:
        return 0.0, {'sharpness': 0.0, 'brightness': 0.0, 'centered': 0.0}
    height, width = frame.shape[:2]
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    sharpness = min(1.0, float(cv2.Laplacian(gray, cv2.CV_64F).var()) / 500.0)
    brightness = float(gray.mean()) / 255.0
    brightness_score = 1.0 - min(1.0, abs(brightness - 0.55) / 0.55)

    edges = cv2.Canny(gray, 80, 180)
    ys, xs = edges.nonzero()
    centered_score = 0.35
    if len(xs) and len(ys):
        cx = float(xs.mean()) / max(width, 1)
        cy = float(ys.mean()) / max(height, 1)
        distance = math.sqrt((cx - 0.5) ** 2 + (cy - 0.5) ** 2)
        centered_score = max(0.0, 1.0 - distance * 1.8)

    contrast = min(1.0, float(gray.std()) / 72.0)
    score = sharpness * 0.45 + brightness_score * 0.15 + centered_score * 0.25 + contrast * 0.15
    return float(score), {
        'sharpness': round(sharpness, 4),
        'brightness': round(brightness_score, 4),
        'centered': round(centered_score, 4),
        'contrast': round(contrast, 4),
    }


async def extract_best_frame(video_path: Path, output_path: Path) -> dict:
    if cv2 is None:
        raise RuntimeError('OpenCV video support is unavailable')

    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError('Unable to read uploaded video')

    fps = cap.get(cv2.CAP_PROP_FPS) or 0.0
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    duration = (frame_count / fps) if fps else 0.0
    if duration and duration > settings.video_max_duration_seconds + 1:
        cap.release()
        raise RuntimeError(f'Please upload a video up to about {settings.video_max_duration_seconds} seconds long')

    if frame_count <= 0:
        frame_count = max(settings.best_frame_samples, 1)
    sample_count = max(4, settings.best_frame_samples)
    step = max(1, frame_count // sample_count)
    indices = list(range(0, frame_count, step))[:sample_count]
    if not indices:
        indices = [0]

    best_score = -1.0
    best_frame = None
    best_index = 0
    best_meta = {}

    for idx in indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ok, frame = cap.read()
        if not ok or frame is None:
            continue
        score, meta = _frame_score(frame)
        if score > best_score:
            best_score = score
            best_frame = frame
            best_index = idx
            best_meta = meta

    cap.release()
    if best_frame is None:
        raise RuntimeError('Unable to extract a usable frame from the uploaded video')

    output_path.parent.mkdir(parents=True, exist_ok=True)
    if not cv2.imwrite(str(output_path), best_frame):
        raise RuntimeError('Unable to save extracted best frame')

    return {
        'source': 'video',
        'frame_index': int(best_index),
        'score': round(max(best_score, 0.0), 4),
        'duration_seconds': round(duration, 2),
        'sampled_frames': len(indices),
        **best_meta,
    }
