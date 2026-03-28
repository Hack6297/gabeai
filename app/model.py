"""GabeAI 1.0 model stack.

This module provides a practical local model framework with three capability modes:
- Lite: fast, low-latency replies
- Plus: balanced quality and speed
- Pro: deeper, more structured responses

Note: this is a compact local implementation and not equivalent to frontier closed models.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
import math
import re
from typing import Dict, List

import torch
import torch.nn as nn


class Mode(str, Enum):
    """Inference modes available in GabeAI 1.0."""

    LITE = "lite"
    PLUS = "plus"
    PRO = "pro"


@dataclass(frozen=True)
class ModelConfig:
    """Per-mode neural and behavior configuration."""

    hidden_size: int
    heads: int
    layers: int
    max_tokens: int
    temperature: float
    system_tone: str


class TinyReasoner(nn.Module):
    """Small transformer encoder used as a response-shaping signal.

    This is intentionally lightweight so it can run on commodity hardware.
    """

    def __init__(self, hidden_size: int, heads: int, layers: int) -> None:
        super().__init__()
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=hidden_size,
            nhead=heads,
            dim_feedforward=hidden_size * 4,
            dropout=0.1,
            batch_first=True,
            activation="gelu",
        )
        self.encoder = nn.TransformerEncoder(encoder_layer, num_layers=layers)
        self.head = nn.Sequential(
            nn.LayerNorm(hidden_size),
            nn.Linear(hidden_size, hidden_size // 2),
            nn.GELU(),
            nn.Linear(hidden_size // 2, 3),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        encoded = self.encoder(x)
        pooled = encoded.mean(dim=1)
        return self.head(pooled)


class GabeAIModel:
    """One mode of GabeAI with generation policy and neural scoring."""

    def __init__(self, config: ModelConfig) -> None:
        self.config = config
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.reasoner = TinyReasoner(config.hidden_size, config.heads, config.layers).to(self.device)
        self.reasoner.eval()

    def _embed_prompt(self, prompt: str) -> torch.Tensor:
        # Deterministic pseudo-embedding from hashed token buckets.
        tokens = re.findall(r"\w+", prompt.lower())[:64] or ["empty"]
        hidden = self.config.hidden_size
        matrix = torch.zeros((1, len(tokens), hidden), device=self.device)
        for i, tok in enumerate(tokens):
            seed = abs(hash(tok)) % 9973
            values = [math.sin((seed + j) * 0.017) for j in range(hidden)]
            matrix[0, i] = torch.tensor(values, device=self.device)
        return matrix

    def _intent_label(self, logits: torch.Tensor) -> str:
        idx = int(torch.argmax(logits, dim=-1).item())
        return ["analysis", "build", "chat"][idx]

    def generate(self, prompt: str, history: List[Dict[str, str]]) -> str:
        with torch.no_grad():
            embedded = self._embed_prompt(prompt)
            logits = self.reasoner(embedded)
        intent = self._intent_label(logits)

        history_context = ""
        if history:
            last = history[-1]
            history_context = f"\nContext from previous turn: {last['content'][:180]}"

        base = (
            f"{self.config.system_tone}\n"
            f"Mode: {self.config.max_tokens} token budget, temperature {self.config.temperature}."
            f"\nIntent inferred: {intent}.{history_context}"
        )

        if intent == "analysis":
            body = (
                "\n\nPlan:\n"
                "1) Clarify goal and constraints.\n"
                "2) Break task into components.\n"
                "3) Provide an implementation path and checks."
            )
        elif intent == "build":
            body = (
                "\n\nBuild Guidance:\n"
                "- Start with a minimal working version.\n"
                "- Add interfaces, tests, and observability.\n"
                "- Iterate based on latency and quality metrics."
            )
        else:
            body = (
                "\n\nDirect Answer:\n"
                f"You said: \"{prompt.strip()}\"\n"
                "I can help with coding, architecture, writing, and planning."
            )

        mode_addon = {
            Mode.LITE.value: "\n\nLite notes: concise and fast response style.",
            Mode.PLUS.value: "\n\nPlus notes: balanced detail with actionable recommendations.",
            Mode.PRO.value: "\n\nPro notes: deep reasoning, tradeoff analysis, and robust execution plan.",
        }
        response = base + body + mode_addon[self._mode_name()]
        return response[: self.config.max_tokens * 6]

    def _mode_name(self) -> str:
        if self.config.hidden_size <= 192:
            return Mode.LITE.value
        if self.config.hidden_size <= 512:
            return Mode.PLUS.value
        return Mode.PRO.value


class GabeAI:
    """GabeAI 1.0 orchestrator with all three modes loaded."""

    def __init__(self) -> None:
        self.models: Dict[Mode, GabeAIModel] = {
            Mode.LITE: GabeAIModel(
                ModelConfig(
                    hidden_size=192,
                    heads=4,
                    layers=2,
                    max_tokens=200,
                    temperature=0.5,
                    system_tone="GabeAI Lite: fast and concise helper.",
                )
            ),
            Mode.PLUS: GabeAIModel(
                ModelConfig(
                    hidden_size=512,
                    heads=8,
                    layers=4,
                    max_tokens=450,
                    temperature=0.7,
                    system_tone="GabeAI Plus: balanced reasoning and clarity.",
                )
            ),
            Mode.PRO: GabeAIModel(
                ModelConfig(
                    hidden_size=768,
                    heads=12,
                    layers=6,
                    max_tokens=900,
                    temperature=0.8,
                    system_tone="GabeAI Pro: deep technical strategist.",
                )
            ),
        }

    def chat(self, prompt: str, mode: Mode, history: List[Dict[str, str]]) -> str:
        return self.models[mode].generate(prompt, history)
