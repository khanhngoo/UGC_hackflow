import os

import pytest

from app.config import get_settings
from app.services.normalizers import normalize_creator_url, to_storage_normalized_link
from app.services.twenty_auth import resolve_twenty_api_key
from app.services.twenty_client import TwentyClient

pytestmark = pytest.mark.skipif(
    os.environ.get("RUN_TWENTY_INTEGRATION") != "1"
    and not resolve_twenty_api_key(get_settings()),
    reason="Set RUN_TWENTY_INTEGRATION=1 or configure TWENTY_API_KEY / ~/.twenty/config.json",
)


@pytest.mark.asyncio
async def test_find_or_create_and_candidate() -> None:
    settings = get_settings()
    twenty = TwentyClient(settings.twenty_api_url, resolve_twenty_api_key(settings))
    assert twenty.configured

    import uuid

    creator_link = normalize_creator_url(f"https://tiktok.com/@pytest_{uuid.uuid4().hex[:10]}")
    storage = to_storage_normalized_link(creator_link.normalized_url)

    creator, created = await twenty.find_or_create_creator(creator_link)
    assert creator["id"]
    assert created is True

    again, created_again = await twenty.find_or_create_creator(creator_link)
    assert again["id"] == creator["id"]
    assert created_again is False

    found = await twenty.find_creator_by_normalized_profile_link(storage)
    assert found is not None
    assert found["id"] == creator["id"]

    campaigns = await twenty.list_campaigns(first=1)
    assert campaigns

    candidate = await twenty.create_campaign_creator_candidate(
        creator_id=creator["id"],
        campaign_id=campaigns[0]["id"],
        proposed_by="@pytest",
        reason="integration test",
        source="pytest",
        creator_link=creator_link,
        campaign_name=campaigns[0]["name"],
    )
    assert candidate["id"]
    assert candidate["status"] == "PROPOSED"
