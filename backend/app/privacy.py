from __future__ import annotations

from pathlib import Path

from .config import settings

try:
    import cv2  # type: ignore
except Exception:  # pragma: no cover
    cv2 = None  # type: ignore[assignment]


def _blur_rectangles(image, rectangles: list[tuple[int, int, int, int]]) -> int:
    blurred = 0
    for x, y, w, h in rectangles:
        if w <= 0 or h <= 0:
            continue
        roi = image[y : y + h, x : x + w]
        if roi.size == 0:
            continue
        image[y : y + h, x : x + w] = cv2.GaussianBlur(roi, (31, 31), 0)
        blurred += 1
    return blurred


def _detect_faces(gray) -> list[tuple[int, int, int, int]]:
    if cv2 is None:
        return []
    cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(28, 28))
    return [tuple(map(int, rect)) for rect in faces]


def _detect_plate_like_regions(gray) -> list[tuple[int, int, int, int]]:
    if cv2 is None:
        return []
    edges = cv2.Canny(gray, 80, 180)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    found: list[tuple[int, int, int, int]] = []
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        area = w * h
        if area < 900 or area > 45000:
            continue
        aspect = w / max(h, 1)
        if 2.0 <= aspect <= 6.5 and h >= 18 and w >= 60:
            found.append((x, y, w, h))
    return found[:6]


def blur_sensitive_background(path: Path) -> dict:
    if not settings.privacy_blur_enabled or cv2 is None or not path.exists():
        return {"enabled": settings.privacy_blur_enabled, "faces": 0, "plates": 0, "applied": False}

    image = cv2.imread(str(path))
    if image is None:
        return {"enabled": settings.privacy_blur_enabled, "faces": 0, "plates": 0, "applied": False}

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = _detect_faces(gray)
    plates = _detect_plate_like_regions(gray)
    blurred_faces = _blur_rectangles(image, faces)
    blurred_plates = _blur_rectangles(image, plates)
    applied = bool(blurred_faces or blurred_plates)
    if applied:
        cv2.imwrite(str(path), image)
    return {
        "enabled": True,
        "faces": blurred_faces,
        "plates": blurred_plates,
        "applied": applied,
    }
