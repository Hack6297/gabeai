# GabeAI 1.0

A local three-mode assistant prototype built with **PyTorch + FastAPI + HTML**.

## Modes

- **Lite**: optimized for speed and short outputs (Haiku-style profile)
- **Plus**: balanced quality and speed (Sonnet-style profile)
- **Pro**: deeper and more structured reasoning (Opus-style profile)

> This project provides a practical local architecture and UX for multi-tier intelligence profiles. It is not a literal replication of proprietary frontier systems.

## Run locally

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open `http://127.0.0.1:8000`.

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
