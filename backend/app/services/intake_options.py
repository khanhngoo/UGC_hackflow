from __future__ import annotations

from app.models import IntakeCampaignOption, IntakeOptionsResponse, IntakeProductOption
from app.services.twenty_client import TwentyClient


async def load_intake_options(twenty: TwentyClient) -> IntakeOptionsResponse:
    products_raw = await twenty.list_products_for_intake()
    products = [
        IntakeProductOption(id=p["id"], name=p["name"], status=p.get("status"))
        for p in products_raw
    ]

    campaigns: list[IntakeCampaignOption] = []
    for product in products:
        campaigns_raw = await twenty.list_campaigns_for_product(product.id)
        for campaign in campaigns_raw:
            campaigns.append(
                IntakeCampaignOption(
                    id=campaign["id"],
                    name=campaign["name"],
                    product_id=product.id,
                    status=campaign.get("status"),
                )
            )

    return IntakeOptionsResponse(products=products, campaigns=campaigns)
