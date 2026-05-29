# UGC Ops Twenty App

Twenty app scaffold for the UGC Campaign Ops workspace.

## Purpose

This folder is a draft of the CRM-native part of the system:

- Campaign operations data model
- Creator review workflow objects
- Outreach and content tracking records
- Metrics and integration event logs
- Workspace views and workflow specs

## Next Steps

1. Generate an official scaffold with `npx create-twenty-app@latest twenty-app-official`.
2. Migrate these draft UGC object/view/workflow definitions into the official scaffold.
3. Add stable `universalIdentifier` values for every object, field, relation, and view.
4. Replace placeholder relation fields with official bidirectional relation fields.
5. Validate field types against the active `twenty-sdk` version.
6. Sync to the self-hosted Twenty workspace.

The object files use the documented `defineObject` style from Twenty Apps, but this folder is not an official `create-twenty-app` scaffold. If the installed SDK has changed field enum names, adjust the imports/types during the first `yarn twenty dev --once` run in the official scaffold.

## Deployment Target

The MVP targets self-hosted Twenty, not paid Twenty Cloud. Develop locally first, then deploy Twenty and the backend to a VPS/private server once the workflow is validated.
