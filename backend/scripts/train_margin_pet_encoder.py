from __future__ import annotations

import argparse
from pathlib import Path

import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets
from torchvision.models import ResNet50_Weights, resnet50


class PetEncoder(nn.Module):
    def __init__(self, embedding_dim: int = 512):
        super().__init__()
        backbone = resnet50(weights=ResNet50_Weights.DEFAULT)
        in_features = backbone.fc.in_features
        backbone.fc = nn.Identity()
        self.backbone = backbone
        self.proj = nn.Linear(in_features, embedding_dim)
        self.bn = nn.BatchNorm1d(embedding_dim)

    def forward(self, x):
        x = self.backbone(x)
        x = self.proj(x)
        x = self.bn(x)
        return nn.functional.normalize(x, dim=1)


class ArcMarginProduct(nn.Module):
    def __init__(self, in_features: int, out_features: int, s: float = 30.0, m: float = 0.50):
        super().__init__()
        self.weight = nn.Parameter(torch.FloatTensor(out_features, in_features))
        nn.init.xavier_uniform_(self.weight)
        self.s = s
        self.m = m

    def forward(self, features, labels):
        cosine = nn.functional.linear(nn.functional.normalize(features), nn.functional.normalize(self.weight))
        theta = torch.acos(torch.clamp(cosine, -1 + 1e-7, 1 - 1e-7))
        target = torch.cos(theta + self.m)
        one_hot = torch.zeros_like(cosine)
        one_hot.scatter_(1, labels.view(-1, 1), 1.0)
        logits = one_hot * target + (1.0 - one_hot) * cosine
        return logits * self.s


class MagFaceHead(nn.Module):
    def __init__(self, in_features: int, out_features: int, s: float = 32.0, m: float = 0.45):
        super().__init__()
        self.arc = ArcMarginProduct(in_features, out_features, s=s, m=m)

    def forward(self, features, labels):
        return self.arc(features, labels)



def main():
    parser = argparse.ArgumentParser(description='Fine-tune a pet encoder with ArcFace or MagFace style supervision')
    parser.add_argument('--data-dir', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--epochs', type=int, default=5)
    parser.add_argument('--batch-size', type=int, default=16)
    parser.add_argument('--embedding-dim', type=int, default=512)
    parser.add_argument('--loss-mode', choices=['arcface', 'magface'], default='arcface')
    parser.add_argument('--lr', type=float, default=3e-4)
    args = parser.parse_args()

    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    weights = ResNet50_Weights.DEFAULT
    train_transform = weights.transforms()
    dataset = datasets.ImageFolder(str(args.data_dir), transform=train_transform)
    loader = DataLoader(dataset, batch_size=args.batch_size, shuffle=True, num_workers=2)

    model = PetEncoder(embedding_dim=args.embedding_dim).to(device)
    head_cls = ArcMarginProduct if args.loss_mode == 'arcface' else MagFaceHead
    head = head_cls(args.embedding_dim, len(dataset.classes)).to(device)
    optimizer = torch.optim.AdamW(list(model.parameters()) + list(head.parameters()), lr=args.lr)
    criterion = nn.CrossEntropyLoss()

    model.train()
    head.train()
    for epoch in range(args.epochs):
        running = 0.0
        for images, labels in loader:
            images = images.to(device)
            labels = labels.to(device)
            optimizer.zero_grad()
            features = model(images)
            logits = head(features, labels)
            loss = criterion(logits, labels)
            loss.backward()
            optimizer.step()
            running += float(loss.item())
        print(f'epoch={epoch + 1} loss={running / max(len(loader), 1):.4f}')

    args.output.parent.mkdir(parents=True, exist_ok=True)
    torch.save({'state_dict': model.state_dict(), 'classes': dataset.classes, 'loss_mode': args.loss_mode}, args.output)
    print(f'saved checkpoint to {args.output}')


if __name__ == '__main__':
    main()
