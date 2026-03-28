# GabeAI Usage Guide

## Quick Start

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open: `http://127.0.0.1:8000`

## Running from `file://` (optional)

You can open `templates/index.html` directly from disk, but the frontend still needs a running backend API.

1. Start FastAPI (`uvicorn app.main:app --reload`).
2. Open `templates/index.html`.
3. In the UI, set **API Base** to `http://127.0.0.1:8000`.

If you see errors:
- `Failed to load resource: net::ERR_FILE_NOT_FOUND`
- `Unsafe attempt to load URL file:///...`

use the recommended server URL (`http://127.0.0.1:8000`) or ensure the repo structure is intact and API Base is set.

## API

### `POST /api/chat`

```json
{
  "message": "Build a startup plan",
  "mode": "pro",
  "history": [{"role": "user", "content": "Hi"}]
}
```

## Checks

```bash
python -m unittest discover -s tests
python -m compileall app static templates
```

## Merge conflict helper

```bash
scripts/resolve_conflicts.sh ours
# or
scripts/resolve_conflicts.sh theirs
```

Then re-run checks and commit the resolution.
