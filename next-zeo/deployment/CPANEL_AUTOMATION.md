# Automated cPanel deployment

Verified `main` commits are built on GitHub, uploaded through explicit FTPS, and activated by a signed HTTPS PHP webhook. Next.js continues to run directly under cPanel Passenger; PHP is only the authenticated launcher for the Bash release script.

Deployment is opt-in. Nothing is sent until `CPANEL_DEPLOY_ENABLED` is exactly `true`.

## Server layout

The examples below use `/home/CPANEL_USER/apps/zeo/releases/2026-07-21-vps-live` as the existing Passenger application root.

```text
/home/CPANEL_USER/
├── .config/zeo/
│   ├── deploy.env
│   └── deploy-webhook.php
├── apps/zeo/releases/2026-07-21-vps-live/
│   ├── .deploy/incoming/
│   ├── deployment/cpanel-release.sh
│   └── tmp/restart.txt
└── PUBLIC_DOCUMENT_ROOT/
    └── zeo-deploy.php
```

Use cPanel File Manager for the one-time setup if Terminal and SSH are unavailable:

1. Copy `deployment/webhook/deploy.php` to the HTTPS domain document root as `zeo-deploy.php`.
2. Copy `deployment/cpanel-release.sh` to the application root at `deployment/cpanel-release.sh` and make it executable (`0755`).
3. Create `/home/CPANEL_USER/.config/zeo/deploy-webhook.php` from `deployment/webhook/deploy-config.php.example`, replace every placeholder, and set permissions to `0600`.
4. Keep `deploy-webhook.php` and `deploy.env` outside every public document root.
5. Confirm PHP `proc_open` is enabled. The webhook returns a configuration error when the activation script is missing or not executable.

Generate the shared webhook secret locally with:

```bash
openssl rand -hex 32
```

Use the same value in the private PHP config and GitHub secret. Never commit it or paste it into the public webhook.

## FTPS account

Create a dedicated cPanel FTP account rooted at the Passenger application root. It needs access only to that directory. The workflow writes the archive to:

```text
.deploy/incoming/GIT_COMMIT_SHA.zip
```

The upload uses explicit TLS, verifies the server certificate, uploads to a temporary `.part` name, and renames it only after a complete transfer. The signed webhook independently verifies the archive SHA-256 before Bash extracts it.

## GitHub configuration

Add these Actions secrets:

| Secret | Purpose |
| --- | --- |
| `CPANEL_FTP_PASSWORD` | Password for the restricted FTP account |
| `CPANEL_DEPLOY_WEBHOOK_SECRET` | Same random HMAC secret stored in the private PHP config |

Add these repository variables:

| Variable | Example | Purpose |
| --- | --- | --- |
| `CPANEL_DEPLOY_ENABLED` | `false` initially | Master deployment switch |
| `CPANEL_FTP_HOST` | `ftp.example.com` | Hostname whose TLS certificate is valid |
| `CPANEL_FTP_PORT` | `21` | Explicit FTPS port |
| `CPANEL_FTP_USER` | `zeodeploy@example.com` | Restricted FTP login |
| `CPANEL_FTP_ROOT` | `.` | FTP-visible application root |
| `CPANEL_SITE_URL` | `https://zeotourism.com` | Public health-check base URL |
| `CPANEL_DEPLOY_WEBHOOK_URL` | `https://example.com/zeo-deploy.php` | Public HTTPS launcher URL |

The old SSH secrets and variables are not used by this workflow.

## Migration environment

Create `/home/CPANEL_USER/.config/zeo/deploy.env` with permissions `0600`:

```dotenv
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=YOUR_DATABASE_USER
MYSQL_PASSWORD=YOUR_DATABASE_PASSWORD
MYSQL_DATABASE=YOUR_DATABASE_NAME
```

The private webhook config points to this file. The packaged migration runner uses one MySQL connection and constrained Node memory/thread settings.

## Enable and verify

Keep `CPANEL_DEPLOY_ENABLED=false` during setup. Send a plain GET request to the webhook URL; a correct installation returns HTTP `405`, proving the file is served while refusing unsigned browser execution. Do not expect a deployment from a browser visit.

Then set `CPANEL_DEPLOY_ENABLED=true` and run **Actions → Next.js CI → Run workflow** against `main`. A successful run:

1. Tests and builds on GitHub.
2. Uploads one standalone ZIP through FTPS.
3. Sends a five-minute, HMAC-signed POST request.
4. Verifies the archive checksum again on cPanel.
5. Runs pending migrations before changing live files.
6. Preserves environment files, uploads, logs, storage and deployment metadata.
7. Stops only the Zeo Passenger app, waits for its workers to exit, then starts it once through cPanel.
8. Confirms `/api/health` reports the exact Git commit.
9. Sends a signed rollback request if production verification fails.

The webhook never runs `pkill`, `killall`, PM2, `npm install`, or a Next.js build. It intentionally uses a short stop/start window instead of Passenger's graceful overlap because CloudLinux counts both workers' Node threads against this account's small NPROC allowance. If the account is already at its process limit and PHP itself returns `503`, hosting support must first clear the stuck LVE/NPROC state; no HTTP launcher can execute until PHP is admitted.

## Rollback limitation

Application files roll back automatically. Database migrations are intentionally not reversed, so new migrations must remain compatible with the previous application release.
