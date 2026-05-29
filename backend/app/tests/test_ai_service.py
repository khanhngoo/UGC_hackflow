import pytest

from app.models import AISummaryRequest, AISummaryResult
from app.services.ai_service import AIService


@pytest.mark.asyncio
async def test_summarize_creator_skipped_without_api_key() -> None:
    ai = AIService(None)
    result = await ai.summarize_creator(
        AISummaryRequest(
            campaign={"name": "Camp"},
            creator={"handle": "@a"},
            proposal_reason="Good fit",
        )
    )
    assert result.raw.get("status") == "skipped"
    assert result.niche is None
    assert result.suggested_tags == []
