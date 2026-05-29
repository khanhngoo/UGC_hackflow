/**
 * Creates OutreachRecord rows for APPROVED_TO_CONTACT candidates that have none.
 * Use after fixing approve-candidate-handoff or when logic functions did not run.
 *
 * Usage: node scripts/backfill-approved-handoff.mjs
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const API_URL = `${process.env.TWENTY_API_URL ?? 'http://localhost:2020'}/graphql`;

function readToken() {
  const configPath = path.join(os.homedir(), '.twenty/config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const remote = config.defaultRemote ?? 'local';
  return config.remotes?.[remote]?.apiKey ?? config.remotes?.[remote]?.twentyCLIAccessToken;
}

async function graphql(query, variables) {
  const token = readToken();
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  const payload = await response.json();
  if (payload.errors) {
    throw new Error(JSON.stringify(payload.errors, null, 2));
  }
  return payload.data;
}

async function listApprovedCandidates() {
  const data = await graphql(`{
    campaignCreatorCandidates(filter: { status: { eq: APPROVED_TO_CONTACT } }, first: 100) {
      edges {
        node {
          id
          creatorHandle
          creatorId
          campaignId
          productId
          proposedBy
          creatorHandleLink { primaryLinkLabel primaryLinkUrl }
          creator { id price }
          campaign { id name }
          productRef { id }
        }
      }
    }
  }`);
  return data.campaignCreatorCandidates.edges.map((edge) => edge.node);
}

async function hasOutreachForCandidate(candidateId) {
  const data = await graphql(
    `query ($candidateId: UUID!) {
      outreachRecords(filter: { candidateId: { eq: $candidateId } }, first: 1) {
        edges { node { id } }
      }
    }`,
    { candidateId },
  );
  return data.outreachRecords.edges.length > 0;
}

async function createOutreach(candidate) {
  const productRefId = candidate.productId ?? candidate.productRef?.id ?? null;
  const data = await graphql(
    `mutation ($data: OutreachRecordCreateInput!) {
      createOutreachRecord(data: $data) {
        id
        creatorHandle
        pipelineStatus
      }
    }`,
    {
      data: {
        candidateId: candidate.id,
        creatorId: candidate.creatorId ?? candidate.creator?.id,
        campaignId: candidate.campaignId ?? candidate.campaign?.id,
        productRefId,
        creatorHandle: candidate.creatorHandleLink?.primaryLinkLabel ?? candidate.creatorHandle,
        creatorHandleLink: candidate.creatorHandleLink ?? undefined,
        creatorPrice: candidate.creator?.price ?? undefined,
        member: candidate.proposedBy ?? undefined,
        pipelineStatus: 'APPROVED_TO_CONTACT',
        replyStatus: 'NO_REPLY',
      },
    },
  );
  return data.createOutreachRecord;
}

async function updateCreator(creatorId, candidate) {
  await graphql(
    `mutation ($id: UUID!, $data: CreatorUpdateInput!) {
      updateCreator(id: $id, data: $data) { id }
    }`,
    {
      id: creatorId,
      data: {
        reviewStatus: 'APPROVED_TO_CONTACT',
        pipelineStatus: 'APPROVED_TO_CONTACT',
        outreachOwner: candidate.proposedBy ?? undefined,
        activeCampaignName: candidate.campaign?.name ?? undefined,
      },
    },
  );
}

const candidates = await listApprovedCandidates();

for (const candidate of candidates) {
  const label = candidate.creatorHandle ?? candidate.id;
  if (await hasOutreachForCandidate(candidate.id)) {
    console.log(`Skip (has outreach): ${label}`);
    continue;
  }

  const outreach = await createOutreach(candidate);
  const creatorId = candidate.creatorId ?? candidate.creator?.id;
  if (creatorId) {
    await updateCreator(creatorId, candidate);
  }
  console.log(`Created outreach ${outreach.id} for ${label}`);
}

console.log('Backfill complete.');
