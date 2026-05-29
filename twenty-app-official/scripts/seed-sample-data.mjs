import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const API_URL = process.env.TWENTY_API_URL ?? 'http://localhost:2020';
const API_KEY =
  process.env.TWENTY_API_KEY ?? readLocalTwentyApiKey();

if (!API_KEY) {
  throw new Error(
    'Missing TWENTY_API_KEY. Set it or run `yarn twenty remote:add` first.',
  );
}

const glowBottleProduct = {
  id: '77777777-7777-4777-8777-777777777701',
  name: 'Glow Bottle',
  description: 'Hydrating face mist for daily skincare routines.',
  productPageLink: link('Glow Bottle product page', 'https://shop.example.com/glow-bottle'),
  category: 'Skincare',
  status: 'ACTIVE',
};

const campaign = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Sample UGC Launch - Glow Bottle',
  objective: 'Source creators for product demos and paid ad testing.',
  product: 'Glow Bottle',
  productRefId: glowBottleProduct.id,
  targetAudience: 'US skincare and wellness buyers aged 18-34',
  platforms: ['TIKTOK', 'INSTAGRAM'],
  owner: 'Growth Team',
  status: 'ACTIVE',
  startDate: '2026-05-29',
  endDate: '2026-06-28',
  creatorSourcingGoal: 30,
  contentSubmissionGoal: 12,
  performanceGoal: 'Find 3 creators with CPA below target after ad test.',
  notes: 'Sample campaign used to validate Creator Database, Review, and Operations views.',
  weeklySummary: 'Initial boards seeded for workflow testing.',
  briefDocumentLink: link(
    'Glow Bottle brief doc',
    'https://docs.example.com/briefs/glow-bottle-core',
  ),
  productDescription: glowBottleProduct.description,
  format: '15-30s vertical video, TikTok or Reels',
  deadline: '2026-06-15T23:59:00.000Z',
  submissionInstruction:
    'Upload raw file to the shared drive and paste the link on your deliverable record.',
  exampleHooks: richText(
    '“My 10-second glow step” / “What I use before makeup”',
  ),
  doGuidelines: richText(
    'Natural lighting, show product label, mention hydration benefit.',
  ),
  dontGuidelines: richText(
    'No medical claims, no competitor products in frame.',
  ),
  budget: 15000,
  budgetUsed: 850,
  budgetUsePercent: budgetUsePercent(15000, 850),
};

const creators = [
  creatorRow({
    id: '22222222-2222-4222-8222-222222222201',
    name: 'Maya Tran',
    handle: '@mayaglow',
    platform: 'TIKTOK',
    profileUrl: 'https://www.tiktok.com/@mayaglow',
    instagramUrl: null,
    tiktokUrl: 'https://www.tiktok.com/@mayaglow',
    country: 'US',
    niche: 'Skincare',
    tags: ['ROUTINE', 'PRODUCT_DEMO', 'CLEAN_BEAUTY'],
    followerCount: 185000,
    medianViewsRecent: 38000,
    avgViewsRecent: 42000,
    engagementRate: 0.062,
    avgLikesRecent: 2400,
    avgCommentsRecent: 180,
    postsLast30Days: 14,
    brandFit: 5,
    audienceFit: 5,
    engagementQuality: 'HIGH',
    riskNotes: 'No visible brand safety issue.',
    reviewStatus: 'PROPOSED',
    owner: 'Ava',
    price: 450,
  }),
  creatorRow({
    id: '22222222-2222-4222-8222-222222222202',
    name: 'Jordan Lee',
    handle: '@jordanunboxes',
    platform: 'INSTAGRAM',
    profileUrl: 'https://www.instagram.com/jordanunboxes',
    instagramUrl: 'https://www.instagram.com/jordanunboxes',
    tiktokUrl: null,
    country: 'US',
    niche: 'Unboxing',
    tags: ['UNBOXING', 'GIFT_GUIDE', 'LIFESTYLE'],
    followerCount: 92000,
    medianViewsRecent: 16000,
    avgViewsRecent: 18000,
    engagementRate: 0.041,
    avgLikesRecent: 620,
    avgCommentsRecent: 48,
    postsLast30Days: 9,
    brandFit: 4,
    audienceFit: 4,
    engagementQuality: 'MEDIUM',
    riskNotes: 'Check exclusivity with competing bottle brand.',
    reviewStatus: 'UNDER_REVIEW',
    owner: 'Ben',
    price: 600,
  }),
  creatorRow({
    id: '22222222-2222-4222-8222-222222222203',
    name: 'Sofia Nguyen',
    handle: '@sofiawellness',
    platform: 'TIKTOK',
    profileUrl: 'https://www.tiktok.com/@sofiawellness',
    instagramUrl: null,
    tiktokUrl: 'https://www.tiktok.com/@sofiawellness',
    country: 'CA',
    niche: 'Wellness',
    tags: ['WELLNESS', 'MORNING_ROUTINE', 'HYDRATION'],
    followerCount: 310000,
    medianViewsRecent: 72000,
    avgViewsRecent: 76000,
    engagementRate: 0.058,
    avgLikesRecent: 4100,
    avgCommentsRecent: 290,
    postsLast30Days: 16,
    brandFit: 5,
    audienceFit: 5,
    engagementQuality: 'HIGH',
    riskNotes: 'No known issue.',
    reviewStatus: 'APPROVED_TO_CONTACT',
    pipelineStatus: 'CONTENT_SUBMITTED',
    contentReviewStatus: 'SUBMITTED',
    outreachOwner: 'Ava',
    proposedReason: 'Best fit for hydration habit creative.',
    activeCampaignName: campaign.name,
    owner: 'Ava',
    price: 850,
  }),
  creatorRow({
    id: '22222222-2222-4222-8222-222222222204',
    name: 'Nina Park',
    handle: '@ninafitdesk',
    platform: 'INSTAGRAM',
    profileUrl: 'https://www.instagram.com/ninafitdesk',
    instagramUrl: 'https://www.instagram.com/ninafitdesk',
    tiktokUrl: null,
    country: 'US',
    niche: 'Fitness',
    tags: ['FITNESS', 'HYDRATION', 'DESK_SETUP'],
    followerCount: 64000,
    medianViewsRecent: 9000,
    avgViewsRecent: 9500,
    engagementRate: 0.035,
    avgLikesRecent: 310,
    avgCommentsRecent: 22,
    postsLast30Days: 8,
    brandFit: 3,
    audienceFit: 3,
    engagementQuality: 'MEDIUM',
    riskNotes: 'Need media kit before decision.',
    reviewStatus: 'NEEDS_MORE_INFO',
    proposedReason: 'Need media kit and recent story metrics.',
    activeCampaignName: campaign.name,
    owner: 'Chloe',
  }),
  creatorRow({
    id: '22222222-2222-4222-8222-222222222205',
    name: 'Ethan Brooks',
    handle: '@ethanreviews',
    platform: 'YOUTUBE',
    profileUrl: 'https://www.youtube.com/@ethanreviews',
    instagramUrl: null,
    tiktokUrl: null,
    country: 'US',
    niche: 'Tech reviews',
    tags: ['REVIEWS', 'UNBOXING'],
    followerCount: 124000,
    medianViewsRecent: 20000,
    avgViewsRecent: 22000,
    engagementRate: 0.028,
    avgLikesRecent: 540,
    avgCommentsRecent: 95,
    postsLast30Days: 6,
    brandFit: 2,
    audienceFit: 1,
    engagementQuality: 'LOW',
    riskNotes: 'Audience mismatch.',
    reviewStatus: 'REJECTED',
    proposedReason: 'Audience mismatch for wellness product.',
    activeCampaignName: campaign.name,
    owner: 'Ben',
  }),
  creatorRow({
    id: '22222222-2222-4222-8222-222222222206',
    name: 'Maya Tran Backup',
    handle: '@maya.glow.backup',
    platform: 'TIKTOK',
    profileUrl: 'https://www.tiktok.com/@maya.glow.backup',
    instagramUrl: null,
    tiktokUrl: 'https://www.tiktok.com/@maya.glow.backup',
    country: 'US',
    niche: 'Skincare',
    tags: ['SKINCARE', 'ROUTINE'],
    followerCount: 12000,
    medianViewsRecent: 1900,
    avgViewsRecent: 2100,
    engagementRate: 0.022,
    avgLikesRecent: 45,
    avgCommentsRecent: 6,
    postsLast30Days: 3,
    brandFit: 2,
    audienceFit: 2,
    engagementQuality: 'LOW',
    riskNotes: 'Duplicate of @mayaglow.',
    reviewStatus: 'DUPLICATE',
    proposedReason: 'Backup account for an already proposed creator.',
    activeCampaignName: campaign.name,
    owner: 'Ava',
  }),
];

const candidates = [
  buildCandidate('33333333-3333-4333-8333-333333333301', creators[0], 'PROPOSED', 'Strong skincare demo history; proposed for initial review.', 'Apify TikTok search', 'Ava', 'Ava: strong routine content; prioritize for first outreach batch.'),
  buildCandidate('33333333-3333-4333-8333-333333333302', creators[1], 'UNDER_REVIEW', 'Unboxing audience may fit product packaging angle.', 'Instagram manual shortlist', 'Ben', 'Ben: checking if unboxing audience converts for skincare.'),
  buildCandidate('33333333-3333-4333-8333-333333333303', creators[2], 'APPROVED_TO_CONTACT', 'Best fit for hydration habit creative.', 'Growth team referral', 'Ava', 'Ava: approved — best hydration-angle creator for Glow Bottle.'),
  buildCandidate('33333333-3333-4333-8333-333333333304', creators[3], 'NEEDS_MORE_INFO', 'Need media kit and recent story metrics.', 'Instagram discovery', 'Chloe', 'Chloe: waiting on media kit and story reach before approving.'),
  buildCandidate('33333333-3333-4333-8333-333333333305', creators[4], 'REJECTED', 'Audience mismatch for wellness product.', 'YouTube search', 'Ben', 'Ben: rejected — tech review audience, not wellness buyers.'),
  buildCandidate('33333333-3333-4333-8333-333333333306', creators[5], 'DUPLICATE', 'Backup account for an already proposed creator.', 'Duplicate detector', 'Ava', 'Ava: duplicate of @mayaglow; do not contact.'),
];

const sofiaSubmissionUrl = 'https://drive.example.com/glow-bottle/sofia-draft-v1';
const sofiaSubmissionUrlV2 = 'https://drive.example.com/glow-bottle/sofia-draft-v2';

const deliverables = [
  {
    id: '66666666-6666-4666-8666-666666666601',
    name: `${creators[2].handle} - Glow Bottle submission`,
    creatorId: creators[2].id,
    campaignId: campaign.id,
    creatorHandle: creators[2].handle,
    creatorHandleLink: handleLink(creators[2]),
    productRefId: campaign.productRefId,
    submissionLink: linksWithSecondary(
      { label: 'Draft video v1', url: sofiaSubmissionUrl },
      [{ label: 'Draft video v2', url: sofiaSubmissionUrlV2 }],
    ),
    submittedAt: '2026-06-01T16:00:00.000Z',
    reviewStatus: 'SUBMITTED',
    reviewer: null,
    revisionNotes: null,
    approvedAssetLink: null,
  },
];

const outreachRecords = [
  {
    id: '44444444-4444-4444-8444-444444444401',
    name: 'Sofia Nguyen - Glow Bottle outreach',
    creatorId: creators[2].id,
    campaignId: campaign.id,
    candidateId: '33333333-3333-4333-8333-333333333303',
    creatorHandle: creators[2].handle,
    creatorHandleLink: handleLink(creators[2]),
    creatorPrice: creators[2].price,
    productRefId: campaign.productRefId,
    member: 'Ava',
    contactMethod: 'TIKTOK_DM',
    pipelineStatus: 'CONTENT_SUBMITTED',
    replyStatus: 'REPLIED',
    firstContactedAt: '2026-05-26T14:00:00.000Z',
    lastContactedAt: '2026-06-01T10:00:00.000Z',
    nextFollowUpAt: null,
    brief: link('Glow Bottle brief', 'https://docs.example.com/briefs/glow-bottle-sofia'),
    contract: link('Creator agreement', 'https://docs.example.com/contracts/sofia-glow-bottle'),
    submitted: linksWithSecondary(
      { label: 'Draft video v1', url: sofiaSubmissionUrl },
      [{ label: 'Draft video v2', url: sofiaSubmissionUrlV2 }],
    ),
    notes: 'Content submitted; awaiting review on Content Review board.',
  },
];

await upsertProduct(glowBottleProduct);
await upsertCampaign(campaign);

for (const creator of creators) {
  await upsertCreator(creator);
}

for (const item of candidates) {
  await upsertCandidate(item);
}

for (const item of deliverables) {
  await upsertDeliverable(item);
}

for (const outreach of outreachRecords) {
  await upsertOutreach(outreach);
}

console.log(
  `Seeded 1 product, ${creators.length} creators, ${candidates.length} candidates, ${deliverables.length} deliverable(s), and ${outreachRecords.length} outreach record(s).`,
);
console.log(
  'Open Creator Database, Creator Review, Creator Operations, Campaigns, and Content Review in the Twenty sidebar.',
);

function creatorRow({
  id,
  name,
  handle,
  platform,
  profileUrl,
  instagramUrl,
  tiktokUrl,
  country,
  niche,
  tags,
  followerCount,
  medianViewsRecent,
  avgViewsRecent,
  engagementRate,
  avgLikesRecent,
  avgCommentsRecent,
  postsLast30Days,
  brandFit,
  audienceFit,
  engagementQuality,
  riskNotes,
  reviewStatus,
  pipelineStatus = null,
  contentReviewStatus = null,
  outreachOwner = null,
  proposedReason = null,
  activeCampaignName = campaign.name,
  owner,
  price = null,
}) {
  return {
    id,
    name,
    handle,
    price,
    platform,
    profileLink: link(platform, profileUrl),
    instagramLink: instagramUrl ? link('Instagram', instagramUrl) : null,
    tiktokLink: tiktokUrl ? link('TikTok', tiktokUrl) : null,
    normalizedProfileLink: profileUrl.replace(/^https?:\/\/(www\.)?/, ''),
    country,
    language: 'English',
    niche,
    tagList: tags,
    followerCount,
    medianViewsRecent,
    avgViewsRecent,
    engagementRate,
    avgLikesRecent,
    avgCommentsRecent,
    postsLast30Days,
    lastPostAt: '2026-05-28T18:00:00.000Z',
    brandFitRating: `RATING_${brandFit}`,
    audienceFitRating: `RATING_${audienceFit}`,
    engagementQuality,
    riskNotes,
    owner,
    reviewStatus,
    pipelineStatus,
    activeCampaignName,
    proposedReason,
    outreachOwner,
    lastContactedAt: null,
    firstContactedAt: null,
    nextFollowUpAt: pipelineStatus ? '2026-06-01T10:00:00.000Z' : null,
    replyStatus: pipelineStatus ? 'NO_REPLY' : null,
    blocker: null,
    contentReviewStatus,
  };
}

function buildCandidate(id, creator, status, reason, source, proposedBy, memberNotes = '') {
  return {
    id,
    name: `${creator.handle} - ${campaign.name}`,
    creatorId: creator.id,
    campaignId: campaign.id,
    productRefId: campaign.productRefId,
    proposedBy,
    reason,
    source,
    dateProposed: '2026-05-29T09:00:00.000Z',
    status,
    decisionReason:
      status === 'REJECTED'
        ? 'Rejected because audience and content category do not match this campaign.'
        : status === 'DUPLICATE'
          ? 'Duplicate creator account; keep the main creator profile only.'
          : '',
    creatorHandle: creator.handle,
    creatorHandleLink: handleLink(creator),
    creatorNiche: creator.niche,
    candidateTagList: creator.tagList,
    creatorCountry: creator.country,
    creatorLanguage: creator.language,
    creatorFollowerCount: creator.followerCount,
    creatorMedianViewsRecent: creator.medianViewsRecent,
    creatorAvgViewsRecent: creator.avgViewsRecent,
    creatorEngagementRate: creator.engagementRate,
    creatorAvgLikesRecent: creator.avgLikesRecent,
    creatorAvgCommentsRecent: creator.avgCommentsRecent,
    creatorPostsLast30Days: creator.postsLast30Days,
    creatorLastPostAt: creator.lastPostAt,
    creatorBrandFitRating: creator.brandFitRating ?? null,
    creatorAudienceFitRating: creator.audienceFitRating ?? null,
    memberNotes,
  };
}

function budgetUsePercent(budget, budgetUsed) {
  if (budget == null || budget <= 0) {
    return null;
  }
  return Math.round(((budgetUsed ?? 0) / budget) * 10000) / 100;
}

function link(label, url) {
  return {
    primaryLinkLabel: label,
    primaryLinkUrl: url,
    secondaryLinks: null,
  };
}

/** Clickable handle on review cards: label = @handle, URL = primary profile. */
function handleLink(creator) {
  const url =
    creator.tiktokLink?.primaryLinkUrl ??
    creator.instagramLink?.primaryLinkUrl ??
    creator.profileLink?.primaryLinkUrl;

  if (!url) {
    return null;
  }

  return link(creator.handle, url);
}

function richText(markdown) {
  return { markdown };
}

function linksWithSecondary(primary, secondaries = []) {
  return {
    primaryLinkLabel: primary.label,
    primaryLinkUrl: primary.url,
    secondaryLinks:
      secondaries.length > 0
        ? secondaries.map((item) => ({
            label: item.label,
            url: item.url,
          }))
        : null,
  };
}

async function upsertProduct(data) {
  const mutation = `
    mutation SeedProduct($data: ProductCreateInput!) {
      createProduct(data: $data, upsert: true) { id name }
    }
  `;
  await graphQL(mutation, { data });
}

async function upsertCampaign(data) {
  const mutation = `
    mutation SeedCampaign($data: CampaignCreateInput!) {
      createCampaign(data: $data, upsert: true) { id name }
    }
  `;
  await graphQL(mutation, { data });
}

async function upsertCreator(data) {
  const mutation = `
    mutation SeedCreator($data: CreatorCreateInput!) {
      createCreator(data: $data, upsert: true) { id name handle }
    }
  `;
  await graphQL(mutation, { data });
}

async function upsertCandidate(data) {
  const mutation = `
    mutation SeedCandidate($data: CampaignCreatorCandidateCreateInput!) {
      createCampaignCreatorCandidate(data: $data, upsert: true) {
        id
        reason
        status
        creator { id handle }
        campaign { id name }
      }
    }
  `;
  await graphQL(mutation, { data });
}

async function upsertOutreach(data) {
  const mutation = `
    mutation SeedOutreach($data: OutreachRecordCreateInput!) {
      createOutreachRecord(data: $data, upsert: true) { id pipelineStatus }
    }
  `;
  await graphQL(mutation, { data });
}

async function upsertDeliverable(data) {
  const mutation = `
    mutation SeedDeliverable($data: DeliverableCreateInput!) {
      createDeliverable(data: $data, upsert: true) { id reviewStatus }
    }
  `;
  await graphQL(mutation, { data });
}

async function graphQL(query, variables) {
  const response = await fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = await response.json();

  if (!response.ok || payload.errors) {
    throw new Error(JSON.stringify(payload.errors ?? payload, null, 2));
  }

  return payload.data;
}

function readLocalTwentyApiKey() {
  const configPath = path.join(os.homedir(), '.twenty', 'config.json');

  if (!fs.existsSync(configPath)) {
    return null;
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const remote = config.defaultRemote ?? 'local';

  return config.remotes?.[remote]?.apiKey ?? null;
}
