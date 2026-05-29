#!/usr/bin/env python3
"""Step 1 smoke test: find/create Creator and create CampaignCreatorCandidate."""

from __future__ import annotations

import asyncio
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.config import get_settings
from app.services.normalizers import normalize_creator_url, to_storage_normalized_link
from app.services.twenty_auth import resolve_twenty_api_key
from app.services.twenty_client import TwentyApiError, TwentyClient


async def main() -> int:
    settings = get_settings()
    api_key = resolve_twenty_api_key(settings)
    if not api_key:
        print("ERROR: Set TWENTY_API_KEY or run `yarn twenty remote:add` in twenty-app-official.")
        return 1

    twenty = TwentyClient(settings.twenty_api_url, api_key)
    suffix = uuid.uuid4().hex[:8]
    raw_url = f"https://www.tiktok.com/@ugc_step1_{suffix}"
    creator_link = normalize_creator_url(raw_url)
    storage_link = to_storage_normalized_link(creator_link.normalized_url)

    print(f"API: {settings.twenty_api_url}")
    print(f"Normalized (storage): {storage_link}")

    campaigns = await twenty.list_campaigns(first=10)
    if not campaigns:
        print("ERROR: No campaigns in Twenty. Run seed script or create a campaign first.")
        return 1

    campaign = campaigns[0]
    print(f"Using campaign: {campaign['name']} ({campaign['id']})")

    existing = await twenty.find_creator_by_normalized_profile_link(storage_link)
    if existing:
        print(f"Found existing creator: {existing['id']}")
        creator, created = existing, False
    else:
        creator, created = await twenty.find_or_create_creator(creator_link)
        print(f"Created creator: {creator['id']}")

    candidate = await twenty.create_campaign_creator_candidate(
        creator_id=creator["id"],
        campaign_id=campaign["id"],
        proposed_by="@smoke_test_user",
        reason="Step 1 TwentyClient smoke test",
        source="smoke_step1",
        creator_link=creator_link,
        campaign_name=campaign["name"],
    )
    print(f"Created candidate: {candidate['id']} status={candidate['status']}")
    print(f"Twenty creator id: {creator['id']} (new={created})")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(asyncio.run(main()))
    except TwentyApiError as exc:
        print(f"Twenty API error: {exc}")
        raise SystemExit(1) from exc
