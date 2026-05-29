from __future__ import annotations

import json
from typing import Any

import httpx

from app.constants.creator_tags import ALLOWED_CREATOR_TAG_VALUES
from app.models import AISummaryRequest, AISummaryResult

OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions"
DEFAULT_MODEL = "gpt-4o-mini"


def _clamp_score(value: Any) -> int | None:
    if value is None:
        return None
    try:
        score = int(round(float(value)))
    except (TypeError, ValueError):
        return None
    if 1 <= score <= 5:
        return score
    return None


def _normalize_tags(values: Any) -> list[str]:
    if not isinstance(values, list):
        return []
    tags: list[str] = []
    for item in values:
        if not isinstance(item, str):
            continue
        normalized = item.strip().upper().replace(" ", "_")
        if normalized in ALLOWED_CREATOR_TAG_VALUES and normalized not in tags:
            tags.append(normalized)
    return tags


def _parse_ai_json(content: str) -> dict[str, Any]:
    try:
        parsed = json.loads(content)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON from OpenAI: {exc}") from exc
    if not isinstance(parsed, dict):
        raise ValueError("OpenAI response must be a JSON object")
    return parsed


class AIService:
    def __init__(self, api_key: str | None, *, model: str = DEFAULT_MODEL) -> None:
        self.api_key = api_key
        self.model = model

    @property
    def configured(self) -> bool:
        return bool(self.api_key)

    async def summarize_creator(self, request: AISummaryRequest) -> AISummaryResult:
        if not self.configured:
            return AISummaryResult(raw={"status": "skipped", "reason": "OpenAI not configured"})

        prompt = _build_prompt(request)
        payload = {
            "model": self.model,
            "temperature": 0.2,
            "response_format": {"type": "json_object"},
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You assist a UGC growth team reviewing creator candidates. "
                        "Return JSON only with keys: niche (string), suggested_tags (array of tag "
                        f"values from {sorted(ALLOWED_CREATOR_TAG_VALUES)}), brand_fit_score (integer 1-5), "
                        "audience_fit_score (integer 1-5). Do not include risk notes or summaries."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
        }

        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                OPENAI_CHAT_URL,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            response.raise_for_status()
            body = response.json()

        try:
            content = body["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise ValueError(f"Unexpected OpenAI response shape: {body}") from exc

        parsed = _parse_ai_json(content)
        niche = parsed.get("niche")
        niche_str = niche.strip()[:200] if isinstance(niche, str) and niche.strip() else None

        return AISummaryResult(
            niche=niche_str,
            suggested_tags=_normalize_tags(parsed.get("suggested_tags")),
            brand_fit_score=_clamp_score(parsed.get("brand_fit_score")),
            audience_fit_score=_clamp_score(parsed.get("audience_fit_score")),
            raw={"openai": parsed},
        )


def _build_prompt(request: AISummaryRequest) -> str:
    campaign = request.campaign
    creator = request.creator
    enrichment = request.enrichment or {}

    lines = [
        f"Campaign: {campaign.get('name', 'unknown')}",
        f"Campaign objective: {campaign.get('objective') or 'n/a'}",
        f"Target audience: {campaign.get('targetAudience') or 'n/a'}",
        f"Product description: {campaign.get('productDescription') or 'n/a'}",
        f"Member proposal reason: {request.proposal_reason}",
        f"Creator handle: {creator.get('handle') or 'unknown'}",
        f"Platform: {creator.get('platform') or 'unknown'}",
        f"Profile URL: {creator.get('normalizedProfileLink') or creator.get('profile_url') or 'n/a'}",
    ]

    if enrichment.get("follower_count") is not None:
        lines.append(f"Follower count: {enrichment['follower_count']}")
    if enrichment.get("average_views") is not None:
        lines.append(f"Recent average views: {enrichment['average_views']}")
    if enrichment.get("bio"):
        lines.append(f"Profile bio snippet: {str(enrichment['bio'])[:300]}")

    return "\n".join(lines)
