# GabeAI 1.0

A local three-mode assistant prototype built with **PyTorch + FastAPI + HTML**.

## Modes

- **Lite**: optimized for speed and short outputs (Haiku-style profile).
- **Plus**: balanced quality and speed (Sonnet-style profile).
- **Pro**: deeper and more structured reasoning (Opus-style profile).

> This project is a local prototype with mode-based behavior. It is not a literal reproduction of proprietary frontier models.

## Quick Start (recommended)

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

If you see these errors:
- `Failed to load resource: net::ERR_FILE_NOT_FOUND`
- `Unsafe attempt to load URL file:///...`

use either the recommended server URL (`http://127.0.0.1:8000`) or ensure the repo structure is intact and API Base is set.

## API

### `POST /api/chat`

```json
{
  "message": "Build a startup plan",
  "mode": "pro",
  "history": [{"role": "user", "content": "Hi"}]
}
```

## Project Structure

- `app/model.py`: mode configs + tiny transformer reasoner for intent shaping.
- `app/main.py`: FastAPI server + chat endpoint.
- `templates/index.html`: browser chat UI.
- `static/app.js`: frontend chat client logic.
- `static/styles.css`: UI styling.

## Checks

```bash
python -m unittest discover -s tests
python -m compileall app static templates
```

## Merge conflict helper

If a PR reports multiple conflicts, use the helper script:

```bash
# choose one strategy
scripts/resolve_conflicts.sh ours
scripts/resolve_conflicts.sh theirs
```

Then run checks and commit:

```bash
python -m unittest discover -s tests
python -m compileall app static templates
git commit
```

This repo also includes `.gitattributes` entries using `merge=union` for markdown/html/js/css to reduce trivial text conflicts.
