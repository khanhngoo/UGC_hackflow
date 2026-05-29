from app.models import Platform
from app.services.normalizers import normalize_creator_url


def test_normalizes_tiktok_profile_url_and_removes_tracking_params() -> None:
    result = normalize_creator_url("https://www.tiktok.com/@creator?utm_source=copy&lang=en")

    assert result.platform == Platform.TIKTOK
    assert result.normalized_url == "https://tiktok.com/@creator?lang=en"
    assert result.handle == "@creator"


def test_normalizes_instagram_profile_url() -> None:
    result = normalize_creator_url("instagram.com/example_creator/")

    assert result.platform == Platform.INSTAGRAM
    assert result.normalized_url == "https://instagram.com/example_creator"
    assert result.handle == "example_creator"


def test_detects_x_profile() -> None:
    result = normalize_creator_url("https://x.com/example/status/123?utm_campaign=test")

    assert result.platform == Platform.X
    assert result.normalized_url == "https://x.com/example/status/123"
    assert result.handle == "example"

