from __future__ import annotations

import argparse
import json
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description='Read exported Telegram/Facebook-style posts and prepare PetConnect ingest payloads')
    parser.add_argument('--input', type=Path, required=True)
    args = parser.parse_args()
    payload = json.loads(args.input.read_text())
    items = payload if isinstance(payload, list) else payload.get('items', [])
    for item in items:
        print(json.dumps({
            'animal_type': item.get('animal_type', 'dog'),
            'city': item.get('city', ''),
            'neighborhood': item.get('neighborhood', ''),
            'notes': item.get('text', ''),
            'source_platform': item.get('platform', 'manual'),
            'source_reference_url': item.get('url', ''),
            'source_post_id': item.get('id', ''),
        }, ensure_ascii=False))


if __name__ == '__main__':
    main()
