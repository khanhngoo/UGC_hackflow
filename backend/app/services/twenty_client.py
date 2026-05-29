from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

import httpx

from app.models import CreatorLink, Platform
from app.services.normalizers import build_links_field, platform_to_twenty, to_storage_normalized_link


class TwentyApiError(RuntimeError):
    pass


class TwentyClient:
    """GraphQL client for the self-hosted Twenty workspace (UGC custom objects)."""

    def __init__(self, api_url: str, api_key: str | None) -> None:
        self.api_url = api_url.rstrip("/")
        self.api_key = api_key

    @property
    def configured(self) -> bool:
        return bool(self.api_key)

    async def graphql(self, query: str, variables: dict[str, Any] | None = None) -> dict[str, Any]:
        if not self.api_key:
            raise TwentyApiError("TWENTY_API_KEY is not configured")

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{self.api_url}/graphql",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={"query": query, "variables": variables or {}},
            )
            response.raise_for_status()
            payload = response.json()

        if payload.get("errors"):
            raise TwentyApiError(str(payload["errors"]))

        data = payload.get("data")
        if data is None:
            raise TwentyApiError(f"Missing data in GraphQL response: {payload}")
        return data

    async def find_creator_by_normalized_profile_link(self, storage_link: str) -> dict[str, Any] | None:
        data = await self.graphql(
            """
            query FindCreator($filter: CreatorFilterInput!) {
              creators(filter: $filter, first: 1) {
                edges {
                  node {
                    id
                    name
                    handle
                    platform
                    normalizedProfileLink
                    profileLink { primaryLinkUrl }
                  }
                }
              }
            }
            """,
            {"filter": {"normalizedProfileLink": {"eq": storage_link}}},
        )
        edges = data["creators"]["edges"]
        return edges[0]["node"] if edges else None

    async def list_campaigns(self, *, first: int = 50) -> list[dict[str, Any]]:
        data = await self.graphql(
            """
            query ListCampaigns($first: Int!) {
              campaigns(first: $first) {
                edges {
                  node {
                    id
                    name
                    status
                  }
                }
              }
            }
            """,
            {"first": first},
        )
        return [edge["node"] for edge in data["campaigns"]["edges"]]

    async def get_campaign(self, campaign_id: str) -> dict[str, Any]:
        data = await self.graphql(
            """
            query GetCampaign($id: UUID!) {
              campaign(id: $id) {
                id
                name
                objective
                targetAudience
                productDescription
                status
              }
            }
            """,
            {"id": campaign_id},
        )
        campaign = data.get("campaign")
        if not campaign:
            raise TwentyApiError(f"Campaign not found: {campaign_id}")
        return campaign

    async def get_creator(self, creator_id: str) -> dict[str, Any]:
        data = await self.graphql(
            """
            query GetCreator($id: UUID!) {
              creator(id: $id) {
                id
                name
                handle
                platform
                normalizedProfileLink
                niche
                followerCount
                avgViewsRecent
                tagList
              }
            }
            """,
            {"id": creator_id},
        )
        creator = data.get("creator")
        if not creator:
            raise TwentyApiError(f"Creator not found: {creator_id}")
        return creator

    async def list_products_for_intake(self, *, first: int = 50) -> list[dict[str, Any]]:
        """Products eligible for Telegram picker (ACTIVE)."""
        data = await self.graphql(
            """
            query ListProductsForIntake($first: Int!, $filter: ProductFilterInput) {
              products(first: $first, filter: $filter) {
                edges {
                  node {
                    id
                    name
                    status
                  }
                }
              }
            }
            """,
            {
                "first": first,
                "filter": {"status": {"eq": "ACTIVE"}},
            },
        )
        return [edge["node"] for edge in data["products"]["edges"]]

    async def list_campaigns_for_intake(self, *, first: int = 50) -> list[dict[str, Any]]:
        """Campaigns eligible for Telegram picker (ACTIVE or PLANNING)."""
        data = await self.graphql(
            """
            query ListCampaignsForIntake($first: Int!, $filter: CampaignFilterInput) {
              campaigns(first: $first, filter: $filter) {
                edges {
                  node {
                    id
                    name
                    status
                  }
                }
              }
            }
            """,
            {
                "first": first,
                "filter": {"status": {"in": ["ACTIVE", "PLANNING"]}},
            },
        )
        return [edge["node"] for edge in data["campaigns"]["edges"]]

    async def list_campaigns_for_product(self, product_id: str, *, first: int = 50) -> list[dict[str, Any]]:
        """Campaigns for a product eligible for Telegram picker (ACTIVE or PLANNING)."""
        data = await self.graphql(
            """
            query ListCampaignsForProduct($first: Int!, $filter: CampaignFilterInput) {
              campaigns(first: $first, filter: $filter) {
                edges {
                  node {
                    id
                    name
                    status
                  }
                }
              }
            }
            """,
            {
                "first": first,
                "filter": {
                    "productRefId": {"eq": product_id},
                    "status": {"in": ["ACTIVE", "PLANNING"]},
                },
            },
        )
        return [edge["node"] for edge in data["campaigns"]["edges"]]

    async def find_open_candidate_for_creator_campaign(
        self,
        creator_id: str,
        campaign_id: str,
    ) -> dict[str, Any] | None:
        data = await self.graphql(
            """
            query FindOpenCandidate($filter: CampaignCreatorCandidateFilterInput!) {
              campaignCreatorCandidates(filter: $filter, first: 1) {
                edges {
                  node {
                    id
                    status
                    reason
                    campaign { id name }
                    creator { id handle }
                  }
                }
              }
            }
            """,
            {
                "filter": {
                    "creatorId": {"eq": creator_id},
                    "campaignId": {"eq": campaign_id},
                    "status": {"in": ["PROPOSED", "UNDER_REVIEW"]},
                },
            },
        )
        edges = data["campaignCreatorCandidates"]["edges"]
        return edges[0]["node"] if edges else None

    async def create_integration_event(
        self,
        *,
        source: str,
        external_id: str,
        event_type: str,
        status: str,
        payload_summary: str | None = None,
        error_message: str | None = None,
        linked_object_type: str | None = None,
        linked_object_id: str | None = None,
    ) -> dict[str, Any] | None:
        if not self.configured:
            return None

        payload: dict[str, Any] = {
            "name": f"{event_type} — {external_id}",
            "source": source,
            "externalId": external_id,
            "eventType": event_type,
            "status": status,
            "processedAt": datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
        }
        if payload_summary:
            payload["payloadSummary"] = payload_summary
        if error_message:
            payload["errorMessage"] = error_message
        if linked_object_type:
            payload["linkedObjectType"] = linked_object_type
        if linked_object_id:
            payload["linkedObjectId"] = linked_object_id

        try:
            data = await self.graphql(
                """
                mutation CreateIntegrationEvent($data: IntegrationEventCreateInput!) {
                  createIntegrationEvent(data: $data) {
                    id
                    eventType
                    status
                  }
                }
                """,
                {"data": payload},
            )
            return data["createIntegrationEvent"]
        except TwentyApiError:
            return None

    async def create_creator(self, creator_link: CreatorLink, *, name: str | None = None) -> dict[str, Any]:
        storage_link = to_storage_normalized_link(creator_link.normalized_url)
        platform = platform_to_twenty(creator_link.platform)
        profile_url = creator_link.normalized_url
        payload: dict[str, Any] = {
            "name": name or creator_link.handle or storage_link,
            "handle": creator_link.handle,
            "platform": platform,
            "normalizedProfileLink": storage_link,
            "profileLink": build_links_field(platform, profile_url),
            "reviewStatus": "PROPOSED",
        }

        if creator_link.platform == Platform.INSTAGRAM:
            payload["instagramLink"] = build_links_field("INSTAGRAM", profile_url)
        elif creator_link.platform == Platform.TIKTOK:
            payload["tiktokLink"] = build_links_field("TIKTOK", profile_url)

        data = await self.graphql(
            """
            mutation CreateCreator($data: CreatorCreateInput!) {
              createCreator(data: $data) {
                id
                name
                handle
                platform
                normalizedProfileLink
              }
            }
            """,
            {"data": payload},
        )
        return data["createCreator"]

    async def find_or_create_creator(self, creator_link: CreatorLink) -> tuple[dict[str, Any], bool]:
        storage_link = to_storage_normalized_link(creator_link.normalized_url)
        existing = await self.find_creator_by_normalized_profile_link(storage_link)
        if existing:
            return existing, False
        return await self.create_creator(creator_link), True

    async def create_campaign_creator_candidate(
        self,
        *,
        creator_id: str,
        campaign_id: str,
        proposed_by: str,
        reason: str,
        source: str,
        creator_link: CreatorLink,
        campaign_name: str,
        product_id: str | None = None,
        status: str = "PROPOSED",
    ) -> dict[str, Any]:
        handle = creator_link.handle or ""
        storage_link = to_storage_normalized_link(creator_link.normalized_url)
        platform = platform_to_twenty(creator_link.platform)
        profile_url = creator_link.normalized_url

        payload: dict[str, Any] = {
            "name": f"{handle or storage_link} - {campaign_name}",
            "creatorId": creator_id,
            "campaignId": campaign_id,
            "proposedBy": proposed_by,
            "reason": reason,
            "source": source,
            "dateProposed": datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "status": status,
            "creatorHandle": handle,
            "creatorHandleLink": build_links_field(platform, profile_url, label=handle or None),
        }
        if product_id:
            payload["productRefId"] = product_id

        data = await self.graphql(
            """
            mutation CreateCandidate($data: CampaignCreatorCandidateCreateInput!) {
              createCampaignCreatorCandidate(data: $data) {
                id
                status
                reason
                proposedBy
                creator { id handle normalizedProfileLink }
                campaign { id name }
              }
            }
            """,
            {"data": payload},
        )
        return data["createCampaignCreatorCandidate"]

    async def update_creator(self, creator_id: str, fields: dict[str, Any]) -> dict[str, Any]:
        data = await self.graphql(
            """
            mutation UpdateCreator($id: UUID!, $data: CreatorUpdateInput!) {
              updateCreator(id: $id, data: $data) {
                id
                handle
                normalizedProfileLink
              }
            }
            """,
            {"id": creator_id, "data": fields},
        )
        return data["updateCreator"]

    async def update_candidate_snapshots(self, candidate_id: str, fields: dict[str, Any]) -> dict[str, Any]:
        if not fields:
            return {"id": candidate_id}
        data = await self.graphql(
            """
            mutation UpdateCandidate($id: UUID!, $data: CampaignCreatorCandidateUpdateInput!) {
              updateCampaignCreatorCandidate(id: $id, data: $data) {
                id
                creatorNiche
                candidateTagList
                creatorBrandFitRating
                creatorAudienceFitRating
                creatorFollowerCount
                creatorAvgViewsRecent
                creatorMedianViewsRecent
              }
            }
            """,
            {"id": candidate_id, "data": fields},
        )
        return data["updateCampaignCreatorCandidate"]

    async def update_candidate_metrics(self, candidate_id: str, fields: dict[str, Any]) -> dict[str, Any]:
        return await self.update_candidate_snapshots(candidate_id, fields)

    async def list_outreach_records(self, *, first: int = 100) -> list[dict[str, Any]]:
        data = await self.graphql(
            """
            query ListOutreach($first: Int!) {
              outreachRecords(first: $first) {
                edges {
                  node {
                    id
                    creatorHandleLink { primaryLinkLabel primaryLinkUrl }
                    member
                    pipelineStatus
                    replyStatus
                    nextFollowUpAt
                    lastContactedAt
                    campaign { id name }
                  }
                }
              }
            }
            """,
            {"first": first},
        )
        return [edge["node"] for edge in data["outreachRecords"]["edges"]]

    async def create_outreach_record(self, payload: dict[str, Any]) -> dict[str, Any]:
        if "name" not in payload:
            handle_link = payload.get("creatorHandleLink") or {}
            handle = handle_link.get("primaryLinkLabel") if isinstance(handle_link, dict) else None
            payload = {**payload, "name": f"{handle or 'creator'} - outreach"}

        data = await self.graphql(
            """
            mutation CreateOutreach($data: OutreachRecordCreateInput!) {
              createOutreachRecord(data: $data) {
                id
                pipelineStatus
                creatorHandleLink { primaryLinkLabel primaryLinkUrl }
                member
                nextFollowUpAt
              }
            }
            """,
            {"data": payload},
        )
        return data["createOutreachRecord"]

    async def update_outreach_record(self, outreach_id: str, fields: dict[str, Any]) -> dict[str, Any]:
        data = await self.graphql(
            """
            mutation UpdateOutreach($id: UUID!, $data: OutreachRecordUpdateInput!) {
              updateOutreachRecord(id: $id, data: $data) {
                id
                pipelineStatus
                replyStatus
                nextFollowUpAt
                lastContactedAt
              }
            }
            """,
            {"id": outreach_id, "data": fields},
        )
        return data["updateOutreachRecord"]

    # Backward-compatible aliases used by webhook/reminder scaffolds.
    async def create_record(self, object_name: str, payload: dict[str, Any]) -> dict[str, Any]:
        if not self.configured:
            return {"id": "local-placeholder", "object": object_name, "payload": payload}
        if object_name == "outreachRecords":
            return await self.create_outreach_record(payload)
        raise TwentyApiError(f"create_record not implemented for {object_name}")

    async def update_record(self, object_name: str, record_id: str, payload: dict[str, Any]) -> dict[str, Any]:
        if not self.configured:
            return {"id": record_id, "object": object_name, "payload": payload}
        if object_name == "creators":
            return await self.update_creator(record_id, payload)
        if object_name == "outreachRecords":
            return await self.update_outreach_record(record_id, payload)
        raise TwentyApiError(f"update_record not implemented for {object_name}")
