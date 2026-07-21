# Zeo Tourism Production Deployment Guide

This document describes the production deployment system for the Zeo Tourism Next.js application. It covers the current cPanel architecture, automatic deployments from GitHub, database migrations, persistent uploads, backups, rollback, security, verification, and troubleshooting.

No passwords, private keys, or secret values belong in this file or in Git.

## 1. Production overview

| Item | Production value |
| --- | --- |
| Website | `https://zeotourism.com` |
| Source repository | `https://github.com/anjal86/zeo-website` |
| Deployment branch | `main` |
| Application | `next-zeo` |
| Runtime | Node.js 22 on CloudLinux/cPanel |
| Framework | Next.js standalone server |
| cPanel account | `brandspi` |
| cPanel web IP | `192.250.235.36` |
| Database | `brandspi_zeotourism` |
| Runtime DB user | `brandspi_zeoprod` |
| DNS provider | Cloudflare |

The old VPS should not receive new deployments. It may remain available temporarily as an emergency migration fallback, but production DNS points to cPanel.

## 2. Repository and branch rules

The Next.js production repository is:

```text
anjal86/zeo-website
```

The older `anjal86/zeopwebsite-new` repository is not the production deployment source.

The local remotes are intentionally named:

```text
origin         -> anjal86/zeo-website
legacy-origin  -> anjal86/zeopwebsite-new
```

Every push to `origin/main` triggers the production deployment workflow. Pull requests should pass CI before they are merged into `main`.

## 3. Production directory layout

```text
/home/brandspi/apps/zeo/
├── backups/
│   ├── database/                 # Pre-migration SQL dumps; latest five retained
│   └── releases/                 # Website rollback snapshots; latest three retained
├── incoming/                     # Uploaded GitHub release archives and deploy script
├── releases/
│   └── 2026-07-21-vps-live/      # Stable cPanel Node.js application root
│       ├── .next/
│       ├── deployment/
│       │   ├── migrations/
│       │   └── run-migrations.mjs
│       ├── node_modules/
│       ├── public/
│       │   └── uploads -> /home/brandspi/apps/zeo/shared/uploads
│       ├── REVISION
│       ├── package.json
│       └── server.js
└── shared/
    └── uploads/                   # Persistent user/admin uploads
```

The application root remains stable because cPanel associates its Node.js environment with that path. Releases are promoted into this directory with `rsync` after a rollback snapshot is created.

Uploads are never copied from GitHub or deleted during deployment. `public/uploads` is always restored as a symbolic link to the shared upload directory.

## 4. cPanel Node.js application

The application is registered in **Setup Node.js App** with:

| Setting | Value |
| --- | --- |
| Node.js version | `22.23.0` |
| Application mode | `Production` |
| Application root | `apps/zeo/releases/2026-07-21-vps-live` |
| Application URL | `zeotourism.com` |
| Startup file | `server.js` |

The application environment includes the following names:

```text
ADMIN_EMAIL
ADMIN_PASSWORD
APP_URL
JWT_SECRET
MYSQL_CONNECTION_LIMIT
MYSQL_DATABASE
MYSQL_HOST
MYSQL_PASSWORD
MYSQL_PORT
MYSQL_USER
STORAGE_DRIVER
UPLOAD_DIR
```

Expected non-secret production values include:

```text
APP_URL=https://zeotourism.com
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=brandspi_zeotourism
MYSQL_USER=brandspi_zeoprod
MYSQL_CONNECTION_LIMIT=5
STORAGE_DRIVER=local
UPLOAD_DIR=/home/brandspi/apps/zeo/shared/uploads
```

Requirements:

- `JWT_SECRET` must be a cryptographically random value of at least 64 characters.
- `ADMIN_PASSWORD` must meet the validation rules in `next-zeo/src/env.ts`.
- Secrets must only be stored in cPanel or an approved secret manager.
- Never paste production secrets into issues, pull requests, documentation, logs, or chat.

## 5. GitHub Actions configuration

Automatic deployment is defined in:

```text
.github/workflows/deploy-cpanel.yml
```

Required repository secrets:

| Secret | Purpose |
| --- | --- |
| `CPANEL_SSH_HOST` | cPanel SSH host/IP |
| `CPANEL_SSH_PORT` | cPanel SSH port |
| `CPANEL_SSH_USER` | Restricted cPanel account name |
| `CPANEL_SSH_KEY` | Dedicated private deployment key |

The matching public key must exist in:

```text
/home/brandspi/.ssh/authorized_keys
```

The key comment is `github-actions-zeo-website`. This key is dedicated to deployment and should not be reused for personal access.

To rotate the key:

1. Generate a new Ed25519 key pair in a secure temporary location.
2. Add the new public key to cPanel `authorized_keys`.
3. Confirm SSH authentication with the new private key.
4. Replace `CPANEL_SSH_KEY` in GitHub Actions secrets.
5. Run a manual deployment and verify it succeeds.
6. Remove the old public key from `authorized_keys`.
7. Securely delete the temporary local private key.

## 6. Automatic deployment sequence

A push to `main` performs the following sequence:

1. GitHub checks out the exact commit.
2. A temporary MySQL 8.4 service starts for build-time queries.
3. Dependencies install with `npm ci`.
4. All SQL migrations initialize the temporary build database.
5. TypeScript validation runs with `npm run typecheck`.
6. Next.js builds in standalone mode.
7. `package-cpanel-release.sh` creates a release archive containing:
   - standalone server files;
   - `.next/static` assets;
   - public assets, excluding uploads;
   - the Git revision;
   - the production migration runner and SQL migrations;
   - the migration runner's runtime dependencies.
8. GitHub uploads the archive and deployment script over SSH.
9. The server validates the archive.
10. The current website release is copied to a timestamped rollback directory.
11. Existing Zeo workers are stopped and terminated by application working directory. Other Node applications on the account are not touched.
12. The new website files are synchronized into the stable application root.
13. The persistent uploads link is restored.
14. Production database migrations run through CloudLinux with the cPanel application environment.
15. The Node.js application starts.
16. The workflow checks `https://zeotourism.com/api/sliders` against the cPanel web IP.
17. On success, the incoming archive is removed and old backups are pruned.
18. On failure, the previous website snapshot is restored and restarted.

Deployments are serialized using the `zeotourism-production` concurrency group. A second deployment waits instead of interrupting an active production deployment.

## 7. Database migrations

Migration files live in:

```text
next-zeo/src/server/db/migrations/
```

Naming convention:

```text
001_initial_schema.sql
002_uploaded_files_registry_fields.sql
003_admin_audit_logs.sql
004_descriptive_change.sql
```

Rules:

1. Never edit a migration that has been applied to production.
2. Add a new, incrementally numbered `.sql` file for every schema or controlled data transformation.
3. Migrations must be forward-only.
4. `DROP` and `TRUNCATE` statements are rejected automatically.
5. Test migrations against a copy or temporary database before merging.
6. Design migrations to remain compatible with both the previous and new application during deployment.
7. Large table rewrites require a maintenance plan; do not place them in a normal push deployment without testing lock time.

The production migration runner:

- obtains a MySQL advisory lock so two migration processes cannot overlap;
- creates/uses the `schema_migrations` ledger;
- verifies SHA-256 checksums for newly recorded migrations;
- skips migrations already listed in the ledger;
- creates a database dump before applying pending migrations;
- applies statements in filename order;
- records each successfully applied migration.

The first imported migrations may contain legacy short checksums. New migration records use SHA-256 checksums.

### Database permissions

The production user has application data permissions plus limited migration permissions:

```text
SELECT
INSERT
UPDATE
DELETE
CREATE
ALTER
INDEX
REFERENCES
```

Do not grant global privileges. Permissions must apply only to `brandspi_zeotourism`.

### Adding a migration

Example:

```sql
-- next-zeo/src/server/db/migrations/004_add_tour_status_index.sql
ALTER TABLE tours
  ADD INDEX idx_tours_status_created (status, created_at);
```

Then:

```bash
cd next-zeo
npm ci
npm run typecheck
npm run build
```

Commit the migration with the application code that uses it. After merging to `main`, monitor the production deployment until it completes.

### Runtime data versus migrations

Customer enquiries, leads, admin edits, uploaded media, and other live content remain in the production database and shared upload directory. Deployments do not overwrite this data.

Repository-controlled seed changes or data transformations must be expressed as a new migration. Do not export the local database and overwrite production during a routine deployment.

## 8. Backups and retention

### Website backups

Before replacing application files, the deployment creates:

```text
/home/brandspi/apps/zeo/backups/releases/<timestamp>-<previous-revision>/
```

The latest three website snapshots are retained automatically.

### Database backups

When at least one migration is pending, the runner creates:

```text
/home/brandspi/apps/zeo/backups/database/pre-deploy-<timestamp>.sql
```

The latest five pre-migration SQL dumps are retained automatically. Files and directories are created with restrictive permissions.

Database dumps are safety snapshots, not a substitute for the hosting provider's scheduled off-server backup. cPanel backups should also remain enabled.

## 9. Rollback behavior

Website rollback is automatic when:

- the release archive is invalid;
- file promotion fails;
- the migration command exits unsuccessfully;
- the application cannot start;
- the HTTPS health check fails after all retries.

The script restores the previous website directory, restores the shared upload link, and starts the previous application.

Important: MySQL DDL can auto-commit. Website rollback does not automatically reverse an already-applied database migration. Migrations must therefore be backward-compatible and forward-only. If a migration partially applies, inspect the migration ledger and database state before retrying. Use the pre-migration SQL dump for controlled recovery when necessary.

### Manual website rollback

Use manual rollback only after identifying the correct snapshot:

```bash
ls -1dt ~/apps/zeo/backups/releases/*
```

Stop the Zeo application through cPanel before restoring files. Preserve `public/uploads`, restore the selected snapshot with `rsync`, recreate the upload link, then start the application and run the health checks below.

Do not copy commands blindly when the selected backup path is uncertain.

## 10. Deployment and production verification

### GitHub Actions

Open:

```text
https://github.com/anjal86/zeo-website/actions
```

The `Deploy to cPanel` workflow must finish successfully. Review the `Promote release` output for the deployed commit and migration result.

### Public checks

```bash
curl -fsS -o /dev/null -w '%{http_code}\n' https://zeotourism.com/
curl -fsS -o /dev/null -w '%{http_code}\n' https://zeotourism.com/api/sliders
curl -fsS -o /dev/null -w '%{http_code}\n' https://zeotourism.com/api/activities
curl -fsS -o /dev/null -w '%{http_code}\n' https://zeotourism.com/admin/login
```

Each should return `200`.

Verify a known uploaded image after every deployment because uploads use a persistent symbolic link.

### Deployed revision

```bash
cat ~/apps/zeo/releases/2026-07-21-vps-live/REVISION
```

The value must match the Git commit deployed by GitHub Actions.

### Worker count

```bash
ps -u "$USER" -o pid,nlwp,etime,cmd --sort=-nlwp | grep -E '[n]ext-server'
```

There should be one Zeo `next-server` worker. The cPanel account may host unrelated Node applications; identify workers by working directory before terminating anything:

```bash
for pid in $(pgrep -u "$USER" -f '^next-server \(v' || true); do
  printf '%s ' "$pid"
  readlink "/proc/$pid/cwd"
done
```

Never kill every Node process owned by the account.

## 11. Manual deployment trigger

The workflow supports `workflow_dispatch`.

From GitHub:

1. Open **Actions**.
2. Select **Deploy to cPanel**.
3. Click **Run workflow**.
4. Select `main`.
5. Monitor the run through promotion and health check.

From GitHub CLI:

```bash
gh workflow run deploy-cpanel.yml --repo anjal86/zeo-website --ref main
gh run list --repo anjal86/zeo-website --workflow deploy-cpanel.yml --limit 5
```

## 12. Troubleshooting

### Workflow fails during build

Check:

- `npm ci` lockfile consistency;
- TypeScript errors;
- migration compatibility with an empty temporary MySQL database;
- build-time database queries;
- required build environment validation.

Reproduce locally with Node.js 22 and a temporary MySQL 8 database.

### SSH upload fails

Check:

- all four `CPANEL_SSH_*` secrets exist;
- the public deployment key remains in `~/.ssh/authorized_keys`;
- `~/.ssh` is mode `700`;
- `authorized_keys` is mode `600`;
- port 22 is open;
- the GitHub secret contains the complete private key.

Never print the private key in a workflow log.

### Migration fails

Review the `Promote release` JSON output. CloudLinux returns the script output as base64-encoded data inside JSON.

Common causes:

- missing `CREATE`, `ALTER`, `INDEX`, or `REFERENCES` privilege;
- destructive SQL rejected by policy;
- an applied migration was modified;
- invalid SQL for the production MySQL/MariaDB version;
- a partial DDL change from a previous failed attempt;
- unavailable `mysqldump` command;
- insufficient disk space for a backup.

Do not delete a migration ledger row merely to force a retry. First inspect the database and determine whether the SQL already changed the schema.

### Website returns 503

Check the cPanel Node.js application status and:

```bash
tail -n 100 ~/apps/zeo/releases/2026-07-21-vps-live/stderr.log
```

Also inspect process and thread usage:

```bash
ps -u "$USER" -o pid,nlwp,etime,cmd --sort=-nlwp
```

If duplicate Zeo workers exist, identify them by `/proc/<pid>/cwd`. Do not terminate an unrelated application. The deployment script already performs this targeted cleanup automatically.

### Uploads return 404

Verify the link:

```bash
ls -ld ~/apps/zeo/releases/2026-07-21-vps-live/public/uploads
readlink ~/apps/zeo/releases/2026-07-21-vps-live/public/uploads
```

Expected target:

```text
/home/brandspi/apps/zeo/shared/uploads
```

Restart the cPanel Node.js application after correcting the link.

### SSL error after DNS change

Verify DNS resolves to `192.250.235.36`, then run AutoSSL from cPanel. From cPanel Terminal:

```bash
uapi SSL start_autossl_check
```

Do not disable certificate verification as a permanent workaround.

## 13. Security checklist

- Protect `main` and require CI before merge.
- Keep GitHub Actions permissions at `contents: read` unless more is required.
- Use only the dedicated cPanel deployment key.
- Rotate deployment keys periodically and immediately after suspected exposure.
- Keep `JWT_SECRET`, database credentials, and the admin password strong and private.
- Grant database permissions only on `brandspi_zeotourism`.
- Never commit `.env` files or production exports.
- Review dependency audit findings regularly.
- Keep cPanel, Node.js, and GitHub Actions versions supported.
- Retain off-server backups in addition to local deployment snapshots.
- Verify the site, API, uploads, admin login, deployed revision, and worker count after significant releases.

## 14. Files that implement this system

| File | Responsibility |
| --- | --- |
| `.github/workflows/deploy-cpanel.yml` | CI build, packaging, SSH upload, and promotion |
| `next-zeo/scripts/package-cpanel-release.sh` | Creates the standalone cPanel release archive |
| `scripts/deploy-cpanel-release.sh` | Server promotion, worker control, migration call, health check, and rollback |
| `next-zeo/scripts/run-cpanel-migrations.mjs` | Backup, migration locking, ledger, validation, and execution |
| `next-zeo/src/server/db/migrations/*.sql` | Ordered database schema/data migrations |
| `next-zeo/src/env.ts` | Runtime environment validation |

Update this guide whenever the production path, domain, runtime, database, workflow, retention policy, or rollback behavior changes.
