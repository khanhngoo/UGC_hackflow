from typing import Any
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

from app.models import CreatorLink, Platform

PLATFORM_TO_TWENTY: dict[Platform, str] = {
    Platform.TIKTOK: "TIKTOK",
    Platform.INSTAGRAM: "INSTAGRAM",
    Platform.YOUTUBE: "YOUTUBE",
    Platform.X: "X",
    Platform.UNKNOWN: "OTHER",
}


TRACKING_QUERY_PREFIXES = ("utm_",)
TRACKING_QUERY_KEYS = {"fbclid", "gclid", "igshid", "si"}


def detect_platform(url: str) -> Platform:
    host = urlparse(url).netloc.lower()
    if "tiktok.com" in host:
        return Platform.TIKTOK
    if "instagram.com" in host:
        return Platform.INSTAGRAM
    if "youtube.com" in host or "youtu.be" in host:
        return Platform.YOUTUBE
    if "twitter.com" in host or host == "x.com" or host.endswith(".x.com"):
        return Platform.X
    return Platform.UNKNOWN


def normalize_creator_url(url: str) -> CreatorLink:
    parsed = urlparse(url.strip())
    if not parsed.scheme:
        parsed = urlparse(f"https://{url.strip()}")

    host = parsed.netloc.lower()
    if host.startswith("www."):
        host = host[4:]

    query_pairs = []
    for key, value in parse_qsl(parsed.query, keep_blank_values=False):
        if key in TRACKING_QUERY_KEYS:
            continue
        if any(key.startswith(prefix) for prefix in TRACKING_QUERY_PREFIXES):
            continue
        query_pairs.append((key, value))

    path = parsed.path.rstrip("/") or "/"
    normalized = urlunparse(
        (
            "https",
            host,
            path,
            "",
            urlencode(query_pairs),
            "",
        )
    )
    return CreatorLink(
        raw_url=url,
        platform=detect_platform(normalized),
        normalized_url=normalized,
        handle=extract_handle(host, path),
    )


def to_storage_normalized_link(url: str) -> str:
    """Canonical form stored in Twenty `normalizedProfileLink` (no scheme/www)."""
    parsed = urlparse(url.strip())
    if not parsed.scheme:
        parsed = urlparse(f"https://{url.strip()}")

    host = parsed.netloc.lower()
    if host.startswith("www."):
        host = host[4:]

    path = parsed.path.rstrip("/")
    base = f"{host}{path}" if path else host
    if parsed.query:
        return f"{base}?{parsed.query}"
    return base


def platform_to_twenty(platform: Platform) -> str:
    return PLATFORM_TO_TWENTY[platform]


def build_links_field(platform: str, url: str, *, label: str | None = None) -> dict[str, Any]:
    labels = {
        "TIKTOK": "TikTok",
        "INSTAGRAM": "Instagram",
        "YOUTUBE": "YouTube",
        "X": "X",
    }
    return {
        "primaryLinkLabel": label or labels.get(platform, "Profile"),
        "primaryLinkUrl": url,
        "secondaryLinks": None,
    }


def extract_handle(host: str, path: str) -> str | None:
    parts = [part for part in path.split("/") if part]
    if not parts:
        return None

    first = parts[0]
    if "tiktok.com" in host and first.startswith("@"):
        return first
    if "instagram.com" in host and first not in {"p", "reel", "reels", "stories"}:
        return first
    if host == "x.com" or "twitter.com" in host:
        if first not in {"i", "intent", "share", "search"}:
            return first
    if "youtube.com" in host and first.startswith("@"):
        return first
    return None

