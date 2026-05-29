/**
 * Removes default Twenty CRM sidebar clutter (Companies, People, Tasks, etc.)
 * and keeps only UGC Ops navigation items from the app manifest.
 *
 * Usage: node scripts/cleanup-workspace-sidebar.mjs
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from '../node_modules/twenty-sdk/dist/define/index.mjs';

const METADATA_URL = `${process.env.TWENTY_API_URL ?? 'http://localhost:2020'}/metadata`;

const STANDARD_OBJECT_UNIVERSAL_IDS = [
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.task.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.note.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.dashboard.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workflow.universalIdentifier,
];

const KEEP_PAGE_LAYOUT_NAMES = new Set(['UGC Ops']);

function readCliToken() {
  const configPath = path.join(os.homedir(), '.twenty/config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const remote = config.defaultRemote ?? 'local';
  return config.remotes?.[remote]?.twentyCLIAccessToken;
}

async function metadata(query, variables) {
  const token = readCliToken();
  if (!token) {
    throw new Error('Missing twentyCLIAccessToken. Run: yarn twenty remote:add --local --as local');
  }

  const response = await fetch(METADATA_URL, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
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

async function listNavigationItems() {
  const data = await metadata(`{
    navigationMenuItems {
      id
      name
      type
      applicationId
      targetObjectMetadataId
    }
  }`);

  return data.navigationMenuItems;
}

async function listObjects() {
  const data = await metadata(`{
    objects(paging: { first: 200 }) {
      edges {
        node {
          id
          nameSingular
          universalIdentifier
          isActive
          isCustom
        }
      }
    }
  }`);

  return data.objects.edges.map((edge) => edge.node);
}

async function deactivateObject(id, nameSingular) {
  await metadata(
    `mutation Deactivate($id: UUID!) {
      updateOneObject(input: { id: $id, update: { isActive: false } }) {
        id
        isActive
      }
    }`,
    { id },
  );
  console.log(`Deactivated object: ${nameSingular}`);
}

async function deleteNavigationItem(id, label) {
  await metadata(
    `mutation DeleteNav($id: UUID!) {
      deleteNavigationMenuItem(id: $id) { id }
    }`,
    { id },
  );
  console.log(`Removed sidebar item: ${label}`);
}

function shouldRemoveNavItem(item) {
  const type = item.type;
  const name = item.name ?? type;

  if (type === 'OBJECT' || type === 'FOLDER') {
    return true;
  }

  if (type === 'PAGE_LAYOUT' && (name === 'Star History' || !KEEP_PAGE_LAYOUT_NAMES.has(name))) {
    return true;
  }

  return false;
}

const navItems = await listNavigationItems();
const objects = await listObjects();

const objectByUniversalId = new Map(
  objects.map((object) => [object.universalIdentifier, object]),
);

for (const universalId of STANDARD_OBJECT_UNIVERSAL_IDS) {
  const object = objectByUniversalId.get(universalId);
  if (object?.isActive) {
    await deactivateObject(object.id, object.nameSingular);
  }
}

for (const item of navItems) {
  if (!shouldRemoveNavItem(item)) {
    continue;
  }

  const label = item.name ?? `${item.type} (${item.id.slice(0, 8)}…)`;
  await deleteNavigationItem(item.id, label);
}

console.log('Sidebar cleanup complete. Hard-refresh http://localhost:2020');
