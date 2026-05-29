# Twenty Developer Guide For UGC Ops

This is a local working guide distilled from the official Twenty developer documentation. Use the source links as the authority because Twenty Apps are still evolving.

## Official Documentation Entry Points

- Full docs index: https://docs.twenty.com/llms.txt
- Developer overview: https://docs.twenty.com/developers/introduction
- App quick start: https://docs.twenty.com/developers/extend/apps/getting-started/quick-start
- Project structure: https://docs.twenty.com/developers/extend/apps/getting-started/project-structure
- Local app server: https://docs.twenty.com/developers/extend/apps/getting-started/local-server
- App data model overview: https://docs.twenty.com/developers/extend/apps/data/overview
- Objects: https://docs.twenty.com/developers/extend/apps/data/objects
- Relations: https://docs.twenty.com/developers/extend/apps/data/relations
- Views: https://docs.twenty.com/developers/extend/apps/layout/views
- Logic functions: https://docs.twenty.com/developers/extend/apps/logic/logic-functions
- APIs: https://docs.twenty.com/developers/extend/api
- Webhooks: https://docs.twenty.com/developers/extend/webhooks
- Self-host Docker Compose: https://docs.twenty.com/developers/self-host/capabilities/docker-compose

## App Creation Workflow

The official app path starts with:

```bash
npx create-twenty-app@latest my-twenty-app
```

The generated project includes the required app configuration, default role, universal identifiers, tests, TypeScript config, and Twenty CLI setup. Our current `twenty-app/` folder was manually scaffolded, so the next implementation step should be to create an official scaffold and migrate our UGC object definitions into it.

Recommended next command from repo root:

```bash
npx create-twenty-app@latest twenty-app-official
```

Then compare `twenty-app-official/` with our existing `twenty-app/`, keep the official config/tooling files, and migrate the UGC objects, views, and workflow specs.

## Local Twenty App Development

Twenty app development has three phases:

1. Scaffold a TypeScript app with `create-twenty-app`.
2. Run a local Twenty server with Docker.
3. Sync app code with `yarn twenty dev`.

Useful commands:

```bash
yarn twenty docker:start
yarn twenty docker:status
yarn twenty docker:logs
yarn twenty docker:stop
yarn twenty docker:reset
yarn twenty docker:upgrade
yarn twenty dev
yarn twenty dev --once
```

The local app server normally runs on port `2020`. The quick-start docs mention the demo login:

```text
Email: tim@apple.dev
Password: tim@apple.dev
```

## Scaffolded App Structure

The official scaffold contains:

- `src/application-config.ts`: required app identity and configuration.
- `src/default-role.ts`: default permissions for app logic.
- `src/constants/universal-identifiers.ts`: stable generated IDs and metadata.
- `src/__tests__/`: app install/integration tests.
- `public/`: static assets.
- `package.json`, `yarn.lock`, `.nvmrc`, `.yarnrc.yml`, TypeScript config, Vitest config, and CI config.

Important implication for this repo: our current object files lack stable `universalIdentifier` values and full official scaffold config. Before syncing to Twenty, migrate into the official scaffold and add stable UUIDs for every object, field, relation, and view.

## Objects And Fields

Twenty apps define custom record types with `defineObject()`.

Important requirements:

- Each object needs a stable `universalIdentifier`.
- Each custom field needs a stable `universalIdentifier`.
- Base fields such as `id`, `name`, `createdAt`, `updatedAt`, and deletion metadata are added automatically.
- File organization is flexible because the SDK detects exported `define...()` entities by AST analysis.
- Use `defineField()` when extending an object you do not own.

For UGC Ops, custom objects should include:

- Campaign
- Creator
- CampaignCreatorCandidate, replacing the confusing name CreatorProposal
- CreatorEvaluation
- OutreachRecord
- Brief
- Deliverable
- CampaignMetric
- IntegrationEvent

## Relations

Twenty relations are bidirectional.

Pattern:

- `MANY_TO_ONE` side lives on the object that stores the foreign key.
- `ONE_TO_MANY` side lives on the object that owns the collection.
- Both sides use `FieldType.RELATION`.
- Both sides reference each other through stable relation field universal IDs.
- `MANY_TO_ONE` needs `joinColumnName` and an `onDelete` rule.

Important implication for our current scaffold: inline relation fields like `targetObject: 'creator'` are too loose for the official SDK pattern. We should replace them with proper bidirectional relation fields during the official scaffold migration.

## Views And Layout

Twenty apps can ship saved views with `defineView()`.

Views specify:

- Object universal identifier.
- View name and icon.
- View key, usually index/list.
- Field order, visibility, and size.
- Optional filters, groups, filter groups, and field groups.

For UGC Ops, implement official `defineView()` files for:

- Proposal/candidate review board.
- Creator pipeline.
- Overdue follow-ups.
- Blocked creators.
- Content review queue.
- Ready-for-ad-test assets.
- Campaign metrics.

Our current `twenty-app/src/views/workspace-views.md` is only a spec. It still needs to become real `defineView()` TypeScript files.

## Logic Functions

Twenty logic functions are server-side TypeScript functions that can be triggered by:

- HTTP routes.
- Cron schedules.
- Database events.
- AI tools.
- Workflow actions.

For this product, keep heavy provider orchestration in the external backend first. Twenty logic functions are still useful for smaller CRM-native actions, for example:

- Create an outreach record when a candidate is approved.
- Generate a task when a follow-up date is set.
- Expose an app-specific action in Twenty workflows.

Use the external backend for Telegram conversation state, Apify runs, retries, provider secrets, and longer-running AI/reporting jobs.

## APIs

Twenty APIs are generated from the workspace schema.

There is no one static REST API reference for all workspaces. After custom objects are created, the workspace exposes matching REST and GraphQL endpoints.

API families:

- Core API: `/rest/` and `/graphql/` for records.
- Metadata API: `/rest/metadata/` and `/metadata/` for schema/workspace metadata.

Auth:

```http
Authorization: Bearer YOUR_API_KEY
```

Self-hosted base URL:

```text
https://{your-domain}/
```

Local development default in this repo:

```text
http://localhost:2020
```

Known limits from docs:

- 100 requests per minute.
- Batch size up to 60 records per request.

## Webhooks

Twenty webhooks notify external systems when records change.

Setup:

1. Go to Settings -> APIs & Webhooks -> Webhooks.
2. Create a webhook.
3. Enter a publicly accessible backend URL.
4. Save.

Events include created, updated, and deleted record events for standard and custom objects.

Security:

- Validate `X-Twenty-Webhook-Signature`.
- Validate `X-Twenty-Webhook-Timestamp`.
- Compute HMAC SHA256 over timestamp plus JSON payload using the webhook secret.
- Return a `2xx` response only after accepting the event.

For UGC Ops, webhooks should notify the backend about:

- Candidate approval.
- Outreach status changes.
- Deliverable review status changes.
- Campaign metrics/report triggers if needed.

## Self-Hosting

Twenty can be self-hosted with Docker Compose.

Minimum production concerns:

- At least 2 GB RAM.
- Docker and Docker Compose.
- Strong `ENCRYPTION_KEY`.
- Strong Postgres password.
- Correct `SERVER_URL`.
- HTTPS behind a reverse proxy for production.
- Persistent database/storage volumes.
- Tested backups and restores.

Official install paths:

- One-line script from Twenty's docker package.
- Manual `.env` and `docker-compose.yml` download from the Twenty repo.

For our MVP, use the app-dev local server first for app work, then deploy a production Docker Compose setup to VPS when the data model and workflow are stable.

## Concrete Next Steps For This Repo

1. Generate an official app scaffold:

```bash
npx create-twenty-app@latest twenty-app-official
```

2. Move our current UGC definitions into the official scaffold.
3. Rename `CreatorProposal` to `CampaignCreatorCandidate`.
4. Add stable universal identifiers for all objects and fields.
5. Replace loose relation placeholders with official bidirectional relation fields.
6. Convert `workspace-views.md` into real `defineView()` files.
7. Run:

```bash
cd twenty-app-official
yarn twenty dev --once
```

8. After successful sync, update backend `TWENTY_API_URL` and `TWENTY_API_KEY`.
9. Test backend creator/candidate creation against the self-hosted Twenty API.

