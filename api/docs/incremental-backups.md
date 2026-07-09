# Incremental backend backups

This backend includes a daily incremental backup runner for changed upload files and changed MySQL records.

## What it backs up

- Files inside `BACKUP_UPLOAD_DIRS` that are new or modified since the last successful run.
- MySQL rows from tables that have one of the configured timestamp columns, by default `updated_at`, `created_at`, `updatedAt`, or `createdAt`.
- A manifest for each run, including changed files, deleted file paths, skipped database tables, and row counts.

The first successful run is treated as a baseline and will include all detectable upload files and all timestamped database rows.

## What it does not do

- It does not infer changed database rows from tables without timestamp columns.
- It does not backup raw MySQL binary logs.
- It does not restore backups automatically.

For important admin/content tables, make sure each table has either `updated_at` or `created_at`. Prefer both, with `updated_at` changing whenever the row is edited.

## Required environment variables

Add these to `api/.env` on the production server:

```env
BACKUP_BUCKET=your-bucket-name
BACKUP_ENDPOINT_URL=https://your-s3-compatible-endpoint
BACKUP_REGION=auto
BACKUP_ACCESS_KEY_ID=your-access-key
BACKUP_SECRET_ACCESS_KEY=your-secret-key
BACKUP_PREFIX=zeo/incremental
BACKUP_S3_FORCE_PATH_STYLE=true
BACKUP_UPLOAD_DIRS=uploads
BACKUP_DB_TIMESTAMP_COLUMNS=updated_at,created_at,updatedAt,createdAt
```

The script also accepts these aliases: `R3_BUCKET`, `R3_ENDPOINT`, `R3_ACCESS_KEY_ID`, `R3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_ENDPOINT`, `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY`.

## Manual test

From the `api` directory:

```bash
BACKUP_DRY_RUN=true npm run backup:changed
```

Then run a real upload:

```bash
npm run backup:changed
```

Logs are written to:

```text
api/logs/incremental-backup.log
api/logs/incremental-backup.cron.log
```

State is stored at:

```text
api/data/backups/incremental-state.json
```

Do not delete the state file unless you intentionally want the next run to rebuild the baseline.

## Daily cron schedule

Use the system cron scheduler. It is lightweight and does not keep another Node process running.

Example: run daily at 2:15 AM server time.

```cron
15 2 * * * cd /var/www/zeo/api && npm run backup:changed:cron
```

If your backend is deployed somewhere else, replace `/var/www/zeo/api` with the real API directory.

## Restore notes

Each uploaded archive contains:

```text
manifest.json
files/
db/
```

- Copy files from `files/` back into the matching API upload paths.
- Import JSON rows from `db/<table>/` using a controlled restore script or manual SQL upsert process.
- Review `manifest.json` before restoring, especially `deletedFiles` and skipped DB tables.
