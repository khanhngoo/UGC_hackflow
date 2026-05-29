# Self-Hosted Twenty Plan

## Goal

Use self-hosted Twenty for the MVP to avoid paid Twenty Cloud while keeping the same CRM-centered architecture.

## Local Development Flow

1. Generate the official app scaffold with `npx create-twenty-app@latest`.
2. Migrate UGC definitions from the draft `twenty-app/` folder into the official scaffold.
3. Add stable universal identifiers and official bidirectional relations.
4. Start a local Twenty app development server using the Twenty app tooling.
5. Sign into the local workspace.
6. Sync the official app into the local workspace.
7. Create a Twenty API key in the local workspace.
8. Configure the backend:

```bash
TWENTY_API_URL=http://localhost:2020
TWENTY_API_KEY=<local-api-key>
```

9. Run backend:

```bash
cd backend
. .venv/bin/activate
uvicorn app.main:app --reload
```

10. Test:

- Backend health returns `twentyConfigured: true`.
- Backend can create a test creator in Twenty.
- Telegram webhook can create a campaign creator candidate once a bot token exists.

## VPS Deployment Shape

For the first team pilot, deploy both services on one VPS:

- Twenty self-host stack
- UGC Ops backend
- Reverse proxy with HTTPS
- Environment variables/secrets
- Backups for Twenty database and uploaded files

Recommended service boundaries:

```text
https://twenty.yourdomain.com      -> Twenty UI/API
https://ugc-api.yourdomain.com     -> UGC Ops backend
```

## Operational Requirements

- Daily database backups.
- HTTPS for Telegram webhook.
- Separate secrets for local and production.
- Basic uptime monitoring on Twenty and backend `/health`.
- Document upgrade procedure before real campaign data is stored.

## Tradeoff

Self-hosting removes the paid Twenty Cloud dependency, but it adds responsibility for uptime, database backups, upgrades, and security patches.
