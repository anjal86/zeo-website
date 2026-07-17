# Production Runbook

## Runtime contract

- Node.js: 22.x
- Canonical public origin: `https://zeotourism.com`
- Deploy only from reviewed `main` commits with successful required checks.
- Keep API and Next.js environment values in the deployment secret store, never in Git.

## Pre-deployment checks

### API

```bash
cd api
npm ci --omit=dev
npm run security:test
npm audit --omit=dev --audit-level=high
```

### Next.js

```bash
cd next-zeo
npm ci
npm run verify
```

Also verify that all required database migrations have been applied to a staging or temporary database before production.

## Required production configuration

Confirm that deployment-specific environment values are present and do not contain placeholders:

- public and canonical origins
- JWT secret, issuer and audience
- bcrypt admin password hash
- database host, port, database, user and password
- object-storage credentials when private blobs are enabled
- request limits and trusted proxy configuration

The database account should have only the permissions the application needs. Do not deploy using a MySQL root account.

## Deployment procedure

1. Confirm the target commit and successful checks.
2. Take a fresh database backup.
3. Apply pending migrations.
4. install dependencies using the lockfiles.
5. build the Next.js production bundle.
6. restart the API and web application using the process manager or container platform.
7. verify the smoke-test checklist below.
8. monitor errors and response latency after release.

## Smoke-test checklist

Verify these routes and workflows after every production release:

- homepage renders without console or server errors
- canonical URL uses `https://zeotourism.com`
- sitemap and robots routes respond successfully
- destination, activity, tour and journal listing pages render
- a representative detail route renders with valid structured data
- enquiry submission reports a truthful success or failure
- newsletter subscription reports a truthful success or failure
- admin login succeeds with valid credentials and rejects invalid credentials
- protected admin routes reject unauthenticated requests
- admin logout invalidates the active session
- database readiness reports unavailable when the database is unavailable
- private blob reads reject URL-style or traversal input
- 404 and error states render correctly

## Rollback

1. Stop the unhealthy release from receiving new traffic.
2. restore the previous known-good application commit.
3. roll back database changes only when the migration provides a tested rollback path.
4. otherwise restore the pre-deployment backup into a controlled recovery process.
5. repeat the smoke-test checklist.
6. document the cause and add a regression test before redeploying.

## Backup verification

A backup is not considered healthy until it has been restored successfully.

Recommended minimum policy:

- daily encrypted backup
- seven daily restore points
- four weekly restore points
- six monthly restore points
- automated alert when a backup is missing or unexpectedly small
- monthly restore test into a temporary database

## Incident handling

For authentication, token, database or storage exposure:

1. restrict access to the affected service
2. rotate exposed credentials
3. invalidate active sessions where relevant
4. preserve sanitized logs
5. identify affected deployments and records
6. patch the root cause with a regression test
7. verify production and record follow-up work

Never paste production secrets, private customer data or database exports into public issues, pull requests or logs.
