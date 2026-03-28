# GabeAI 1.0

A local three-mode assistant prototype built with **PyTorch + FastAPI + HTML**.

## Modes

- **Lite**: optimized for speed and short outputs (Haiku-style profile)
- **Plus**: balanced quality and speed (Sonnet-style profile)
- **Pro**: deeper and more structured reasoning (Opus-style profile)

> This project provides a practical local architecture and UX for multi-tier intelligence profiles. It is not a literal replication of proprietary frontier systems.

## Run locally (recommended)

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open `http://127.0.0.1:8000`.

## If you open `templates/index.html` directly

Direct `file://` opens are supported now, but you must keep the repo structure intact and provide an API base URL in the UI (default: `http://127.0.0.1:8000`).

If you see browser errors like:
- `Failed to load resource: net::ERR_FILE_NOT_FOUND`
- `Unsafe attempt to load URL file:///...`

then either:
1. Start the FastAPI server and open `http://127.0.0.1:8000`, or
2. Open `templates/index.html` from disk and set **API Base** to your running backend.

## API

`POST /api/chat`

```json
{
  "message": "Build a startup plan",
  "mode": "pro",
  "history": [{"role":"user","content":"Hi"}]
}
```

## Architecture

- `app/model.py`: mode configs + tiny transformer reasoner for intent shaping.
- `app/main.py`: FastAPI server + chat endpoint.
- `templates/index.html`: browser chat UI.
- `static/app.js`: frontend chat client logic.
- `static/styles.css`: UI styling.
