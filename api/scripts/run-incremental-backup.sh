#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${API_DIR}"
mkdir -p logs data/backups

node scripts/incremental-backup.js >> logs/incremental-backup.cron.log 2>&1
