Drop fine-tuned encoder checkpoints here.

Suggested files:
- `pet_resnet50_arcface.pt` for the main pet-face/body embedding model
- `dog_nose_arcface.pt` for nose-print secondary verification

Training helpers:
- `python scripts/train_margin_pet_encoder.py --data-dir /path/to/oxford-iiit-pet --output ./models/pet_resnet50_arcface.pt --loss-mode arcface`
- swap `--loss-mode magface` to experiment with magnitude-aware margin training
