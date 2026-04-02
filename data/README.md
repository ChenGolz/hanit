# Static image library search

Put your searchable reference images in `library/pets/` and list them in `data/pets.json`.

Example:

```json
[
  {
    "id": "bella-001",
    "name": "Bella",
    "city": "Tel Aviv",
    "animal_type": "dog",
    "breed": "Golden Retriever",
    "color": "Golden",
    "report_type": "lost",
    "image": "library/pets/bella.jpg",
    "unique_markings": "White patch on chest",
    "private_marker_prompt": "Small white spot on the back left paw"
  }
]
```

Notes:
- `report_type` should usually be `lost` for pets you want finders to search against.
- `image` is a path relative to the repo root.
- Visitors can upload a photo for one-time matching in the browser. Their photo is not saved to GitHub Pages.
- This mode is best for small libraries and demos.
