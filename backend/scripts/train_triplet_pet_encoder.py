from __future__ import annotations

"""Fine-tune a pet encoder with triplet loss.

This script is intentionally lightweight and production-oriented:
- Uses Oxford-IIIT Pet via torchvision datasets.
- Starts from ResNet50 ImageNet weights.
- Optimizes with TripletMarginLoss so same-pet images are pulled together.
- Saves a checkpoint that the FastAPI app can load for embeddings.

Example:
python scripts/train_triplet_pet_encoder.py --epochs 6 --batch-size 24 --output ./models/pet_resnet50_triplet.pt
"""

import argparse
import random
from collections import defaultdict
from pathlib import Path

import torch
from torch import nn
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms
from torchvision.datasets import OxfordIIITPet
from torchvision.models import ResNet50_Weights, resnet50


class TripletPetDataset(Dataset):
    def __init__(self, root: str, split: str = 'trainval'):
        self.transform = transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.RandomResizedCrop(224, scale=(0.75, 1.0)),
            transforms.RandomHorizontalFlip(),
            transforms.ColorJitter(0.15, 0.15, 0.15, 0.05),
            transforms.ToTensor(),
            transforms.Normalize(mean=ResNet50_Weights.DEFAULT.transforms().mean, std=ResNet50_Weights.DEFAULT.transforms().std),
        ])
        base = OxfordIIITPet(root=root, split=split, target_types='category', download=True)
        self.samples = list(base)
        self.by_label = defaultdict(list)
        for idx, (_, label) in enumerate(self.samples):
            self.by_label[int(label)].append(idx)
        self.labels = sorted(self.by_label)

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        anchor_img, anchor_label = self.samples[idx]
        positives = self.by_label[int(anchor_label)]
        pos_idx = idx
        while pos_idx == idx and len(positives) > 1:
            pos_idx = random.choice(positives)
        neg_label = random.choice([label for label in self.labels if label != int(anchor_label)])
        neg_idx = random.choice(self.by_label[neg_label])
        positive_img, _ = self.samples[pos_idx]
        negative_img, _ = self.samples[neg_idx]
        return self.transform(anchor_img), self.transform(positive_img), self.transform(negative_img)


def build_encoder() -> nn.Module:
    model = resnet50(weights=ResNet50_Weights.DEFAULT)
    model.fc = nn.Identity()
    return model


def train(args):
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    dataset = TripletPetDataset(args.data_root)
    loader = DataLoader(dataset, batch_size=args.batch_size, shuffle=True, num_workers=args.num_workers, pin_memory=True)
    encoder = build_encoder().to(device)
    optimizer = torch.optim.AdamW(encoder.parameters(), lr=args.lr, weight_decay=1e-4)
    criterion = nn.TripletMarginLoss(margin=args.margin)

    encoder.train()
    for epoch in range(args.epochs):
        running = 0.0
        for anchor, positive, negative in loader:
            anchor = anchor.to(device)
            positive = positive.to(device)
            negative = negative.to(device)
            a = nn.functional.normalize(encoder(anchor), dim=1)
            p = nn.functional.normalize(encoder(positive), dim=1)
            n = nn.functional.normalize(encoder(negative), dim=1)
            loss = criterion(a, p, n)
            optimizer.zero_grad(set_to_none=True)
            loss.backward()
            optimizer.step()
            running += float(loss.item())
        avg = running / max(len(loader), 1)
        print(f'epoch={epoch + 1} loss={avg:.4f}')

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    torch.save(encoder.state_dict(), output)
    print(f'saved checkpoint -> {output}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--data-root', default='./data')
    parser.add_argument('--epochs', type=int, default=6)
    parser.add_argument('--batch-size', type=int, default=24)
    parser.add_argument('--num-workers', type=int, default=2)
    parser.add_argument('--lr', type=float, default=2e-4)
    parser.add_argument('--margin', type=float, default=0.35)
    parser.add_argument('--output', default='./models/pet_resnet50_triplet.pt')
    train(parser.parse_args())
