# GabeAI 1.0

Local three-mode assistant prototype with FastAPI backend + browser frontend.

## Modes
- Lite (fast)
- Plus (balanced)
- Pro (deeper responses)

## Docs
- Usage guide: `docs/usage.md`
- Model/backend code: `app/model.py`, `app/main.py`
- Frontend: `templates/index.html`, `static/app.js`, `static/styles.css`
- Conflict helper: `scripts/resolve_conflicts.sh`

## Quick command
```bash
python -m unittest discover -s tests && python -m compileall app static templates
```
