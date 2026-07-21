# Automated cPanel deployment

This project can deploy every verified `main` commit without building on cPanel.

The GitHub workflow performs lint, typecheck, regression tests and the Next.js standalone build on GitHub. Only the prepared ZIP archive is uploaded to cPanel. The remote release script then runs pending migrations with one database connection, copies the verified runtime into the existing application root, touches Passenger's `tmp/restart.txt`, checks the public website and rolls back the files automatically when the health check fails.

Deployment is opt-in. Nothing is sent to cPanel until the repository variable `CPANEL_DEPLOY_ENABLED` is exactly `true`.

## 1. Create a restricted SSH deployment key

Run locally:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/zeo_cpanel_deploy -C "zeo-github-deploy"
ssh-copy-id -i ~/.ssh/zeo_cpanel_deploy.pub -p 22 CPANEL_USER@CPANEL_HOST
ssh-keyscan -p 22 -H CPANEL_HOST > /tmp/zeo-cpanel-known-hosts
```

Use your real SSH port when it is not `22`.

Add these GitHub **Actions secrets**:

- `CPANEL_SSH_PRIVATE_KEY`: complete contents of `~/.ssh/zeo_cpanel_deploy`
- `CPANEL_SSH_KNOWN_HOSTS`: complete contents of `/tmp/zeo-cpanel-known-hosts`

Do not commit either value.

## 2. Add repository variables

In GitHub, open **Settings → Secrets and variables → Actions → Variables** and add:

| Variable | Example | Purpose |
| --- | --- | --- |
| `CPANEL_DEPLOY_ENABLED` | `false` initially | Master deployment switch |
| `CPANEL_HOST` | `server.example.com` | SSH hostname |
| `CPANEL_PORT` | `22` | SSH port |
| `CPANEL_USER` | `accountuser` | cPanel SSH user |
| `CPANEL_APP_PATH` | `/home/accountuser/next-zeo` | Existing cPanel Node.js application root |
| `CPANEL_SITE_URL` | `https://zeotourism.com` | Public health-check URL |
| `CPANEL_DEPLOY_ENV_FILE` | `/home/accountuser/.config/zeo/deploy.env` | Server-only database environment file |
| `CPANEL_NODE_BIN` | `/opt/cpanel/ea-nodejs22/bin/node` | Node 22 executable available over SSH |
| `CPANEL_KEEP_RELEASES` | `3` | Number of older release copies retained |

`CPANEL_APP_PATH` must remain the same application root currently configured in **Setup Node.js App**, with `server.js` as the startup file.

Find the usable Node executable over SSH with:

```bash
which node
node --version
```

It must be Node 22 and callable from a non-interactive SSH session.

## 3. Create the server-only migration environment file

The cPanel UI's application environment variables are not always available to non-interactive SSH commands. Create a small protected file containing only the database variables required by the migration runner:

```bash
mkdir -p ~/.config/zeo
chmod 700 ~/.config/zeo
nano ~/.config/zeo/deploy.env
```

Contents:

```dotenv
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=YOUR_DATABASE_USER
MYSQL_PASSWORD=YOUR_DATABASE_PASSWORD
MYSQL_DATABASE=YOUR_DATABASE_NAME
```

Then protect it:

```bash
chmod 600 ~/.config/zeo/deploy.env
```

Do not put this file inside the repository or public web root.

## 4. Confirm server commands

The deployment user must be able to run:

```bash
unzip -v
rsync --version
```

The workflow does not execute `npm install`, `npm ci` or `next build` on cPanel.

## 5. Initialize migration history before enabling

From the current application checkout, run the existing migration command once and confirm no migration remains pending:

```bash
cd /path/to/repository/next-zeo
npm run db:migrate
npm run db:migrate -- --dry-run
```

Production should have a populated `schema_migrations` table before the first automated deployment. The packaged runner accepts both the existing legacy checksum format and the newer SHA-256 format.

## 6. Test manually, then enable

Keep `CPANEL_DEPLOY_ENABLED=false` while adding the configuration. Change it to `true`, open **Actions → Next.js CI → Run workflow**, and run it against `main`.

A successful run will:

1. Verify the application against a temporary MySQL database.
2. Build and package the standalone runtime on GitHub.
3. Upload one ZIP file over SSH.
4. Create a one-time rollback snapshot on the first deployment.
5. Run only pending SQL migrations with one MySQL connection.
6. Copy the release while preserving `.env`, `.htaccess`, uploads, logs and storage.
7. Restart Passenger once using `tmp/restart.txt`.
8. Retry the public health check for up to two minutes.
9. Restore the previous release automatically if the public check fails.

After the manual run succeeds, every future push or merged pull request to `main` deploys automatically after verification.

## Resource impact

The CPU-heavy dependency installation and Next.js build run on GitHub-hosted infrastructure. cPanel only performs ZIP extraction, a low-concurrency migration check, `rsync`, one Passenger restart and cleanup of old releases.

The first automated deployment uses extra disk temporarily because it creates a rollback snapshot of the currently deployed application. Later runs retain the current release, the previous rollback release and a small configurable history.

## Rollback limitations

Application files can be rolled back automatically. Database migrations are intentionally not reversed. New migrations must therefore be backward-compatible with the previous application release, preferably additive changes before destructive cleanup in a later release.
