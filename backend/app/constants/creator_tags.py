"""Allowed Creator.tagList / candidateTagList values (must match twenty-app-official)."""

ALLOWED_CREATOR_TAG_VALUES: frozenset[str] = frozenset(
    {
        "ROUTINE",
        "PRODUCT_DEMO",
        "CLEAN_BEAUTY",
        "UNBOXING",
        "GIFT_GUIDE",
        "LIFESTYLE",
        "WELLNESS",
        "MORNING_ROUTINE",
        "HYDRATION",
        "SKINCARE",
        "FITNESS",
        "DESK_SETUP",
        "REVIEWS",
    }
)
