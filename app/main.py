from __future__ import annotations

from typing import Dict, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from app.model import GabeAI, Mode


app = FastAPI(title="GabeAI 1.0", version="1.0.0")
engine = GabeAI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")


class Message(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str = Field(min_length=1, max_length=8000)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    mode: Mode
    history: List[Message] = Field(default_factory=list)


class ChatResponse(BaseModel):
    mode: Mode
    reply: str


@app.get("/", response_class=HTMLResponse)
def index() -> str:
    with open("templates/index.html", "r", encoding="utf-8") as f:
        return f.read()


@app.post("/api/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    try:
        history_dicts: List[Dict[str, str]] = [m.model_dump() for m in payload.history]
        reply = engine.chat(payload.message, payload.mode, history_dicts)
        return ChatResponse(mode=payload.mode, reply=reply)
    except KeyError as exc:
        raise HTTPException(status_code=400, detail="Unsupported mode") from exc
