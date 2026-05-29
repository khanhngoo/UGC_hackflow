from app.services.ai_service import AIService


async def generate_weekly_report_job(ai: AIService, campaign_id: str) -> dict:
    # TODO: Query Twenty for campaign records and save generated report.
    return {
        "campaignId": campaign_id,
        "status": "skipped",
        "reason": "Twenty campaign aggregation implementation pending",
    }

