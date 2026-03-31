# Israel PetConnect AI — production-ready foundation (v3)

This version extends the prior upgrade with video-based intake, margin-loss training scaffolding, semantic attribute tagging, neighborhood volunteers, shelter intake scanning, and external social-ingest hooks.

## What changed in v3

### AI & recognition
- Added **short-video upload support** for lost/found workflows.
- Added a backend **best-frame selector** that extracts and scores frames from a 3–4 second clip using image-quality and centered-subject heuristics.
- Added **ArcFace / MagFace-style margin training scaffolding** via `backend/scripts/train_margin_pet_encoder.py`.
- Kept **nose-print secondary verification** and **microchip fallback** from v2.
- Added **semantic attribute tags** using a CLIP-style zero-shot path when available, with safe heuristic fallback tags when the transformer pipeline is unavailable.

### Matching & alerting
- Matching now combines:
  - primary embedding similarity
  - optional nose similarity
  - semantic-tag overlap
  - geolocation bonuses
  - exact microchip matches
- Added **trusted-neighbor volunteer alerts** for active responders near a new missing-pet report.
- Improved heat-map logic so it prefers sightings that are both nearby **and** visually similar.

### Community + operations
- Added a **Volunteer** API and frontend page.
- Added a **Shelter intake scan** API and frontend page for municipal shelters / pounds.
- Added a **social-ingest endpoint** and export script for Telegram / Facebook-style post ingestion.
- Added **comment suggestion / auto-reply stubs** for external posts.

## Important social-platform note
This repo includes a safe connector pattern for external posts, but **Facebook auto-commenting should only be used through approved platform APIs and policies**. The code therefore ships with a guarded stub rather than pretending unrestricted scraping/commenting is production-safe.

## Backend highlights
New or expanded endpoints include:
- `POST /api/lost-pets`
- `POST /api/found-reports`
- `POST /api/shelter/intake-scan`
- `POST /api/volunteers`
- `GET /api/volunteers`
- `POST /api/social-ingest/manual`
- `GET /api/lost-pets/{id}/sightings-heatmap`
- `GET /api/chip/{microchip_number}`
- `POST /api/matches/{lost_pet_id}/verify`
- `POST /api/proxy/{thread_token}/messages`

## Margin-loss training workflow
```bash
cd backend
python scripts/train_margin_pet_encoder.py \
  --data-dir /path/to/oxford-iiit-pet \
  --output ./models/pet_resnet50_arcface.pt \
  --loss-mode arcface
```

Swap `--loss-mode magface` to test a magnitude-aware margin head.

## Optional semantic tagging path
Semantic tags can use a CLIP-style zero-shot classifier when `transformers` is installed and the model configured in:
```env
SEMANTIC_MODEL_NAME=openai/clip-vit-base-patch32
```

## Municipal 106 setup
Configure actual city recipients with:
```env
MUNICIPAL_106_RECIPIENTS_JSON={"tel-aviv":"animals@example.org","haifa":"106@example.org"}
```

## Privacy note
The blur pipeline remains an on-upload mitigation layer for human faces and plate-like regions. It is practical, but not a perfect detector.
