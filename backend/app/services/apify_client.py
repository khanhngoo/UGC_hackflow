from typing import Any

import httpx

from app.models import EnrichmentRequest, EnrichmentResult, Platform


class ApifyClient:
    def __init__(self, token: str | None, actor_ids: dict[Platform, str | None]) -> None:
        self.token = token
        self.actor_ids = actor_ids

    async def enrich_creator(self, request: EnrichmentRequest) -> EnrichmentResult:
        actor_id = self.actor_ids.get(request.platform)
        if not self.token or not actor_id:
            return EnrichmentResult(raw={"status": "skipped", "reason": "Apify not configured"})

        url = f"https://api.apify.com/v2/acts/{actor_id}/run-sync-get-dataset-items"
        payload = {"startUrls": [{"url": str(request.profile_url)}]}
        async with httpx.AsyncClient(timeout=180) as client:
            response = await client.post(
                url,
                params={"token": self.token},
                json=payload,
            )
            response.raise_for_status()
            items: list[dict[str, Any]] = response.json()

        first = items[0] if items else {}
        return EnrichmentResult(
            handle=first.get("username") or first.get("handle"),
            display_name=first.get("fullName") or first.get("name"),
            bio=first.get("biography") or first.get("bio"),
            follower_count=_to_int(first.get("followersCount") or first.get("followers")),
            average_views=_to_int(first.get("averageViews")),
            recent_content_links=_extract_links(items),
            raw={"items": items[:5]},
        )


def _to_int(value: Any) -> int | None:
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _extract_links(items: list[dict[str, Any]]) -> list[str]:
    links: list[str] = []
    for item in items[:10]:
        link = item.get("url") or item.get("videoUrl") or item.get("postUrl")
        if link:
            links.append(str(link))
    return links

