from app.services.normalizers import normalize_creator_url, to_storage_normalized_link


def test_storage_normalized_link_strips_scheme_and_www() -> None:
    link = normalize_creator_url("https://www.tiktok.com/@creator?utm_source=x&lang=en")
    assert to_storage_normalized_link(link.normalized_url) == "tiktok.com/@creator?lang=en"


def test_storage_normalized_link_matches_twenty_seed_format() -> None:
    assert to_storage_normalized_link("https://instagram.com/jordanunboxes") == "instagram.com/jordanunboxes"
