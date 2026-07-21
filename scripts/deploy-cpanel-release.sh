#!/usr/bin/env bash
set -euo pipefail

revision="${1:?usage: deploy-cpanel-release.sh <git-revision>}"
base="$HOME/apps/zeo"
app="$base/releases/2026-07-21-vps-live"
app_root="apps/zeo/releases/2026-07-21-vps-live"
shared_uploads="$base/shared/uploads"
incoming="$base/incoming/cpanel-release-${revision}.tar.gz"
backups="$base/backups/releases"
web_ip="192.250.235.36"
stage="$(mktemp -d "$base/incoming/stage.XXXXXX")"
timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
previous_revision="$(cat "$app/REVISION" 2>/dev/null || printf legacy-vps-live)"
backup="$backups/${timestamp}-${previous_revision}"

cleanup() {
  rm -rf "$stage"
}
trap cleanup EXIT

stop_app() {
  cloudlinux-selector stop \
    --interpreter nodejs \
    --app-root "$app_root" >/dev/null 2>&1 || true

  # CloudLinux can leave old Passenger workers alive after stop/restart.
  # Match by cwd so other Node applications owned by the account are untouched.
  local pid
  local -a app_pids=()
  for pid in $(pgrep -u "$USER" -f '^next-server \(v' || true); do
    if [[ "$(readlink "/proc/$pid/cwd" 2>/dev/null || true)" == "$app" ]]; then
      app_pids+=("$pid")
    fi
  done

  if ((${#app_pids[@]})); then
    kill "${app_pids[@]}" 2>/dev/null || true
    for _ in {1..10}; do
      local alive=0
      for pid in "${app_pids[@]}"; do
        kill -0 "$pid" 2>/dev/null && alive=1
      done
      ((alive == 0)) && return 0
      sleep 1
    done
    kill -9 "${app_pids[@]}" 2>/dev/null || true
  fi
}

start_app() {
  cloudlinux-selector start \
    --interpreter nodejs \
    --app-root "$app_root" >/dev/null 2>&1 || true
}

[[ -f "$incoming" ]] || { echo "Release archive not found: $incoming" >&2; exit 1; }
[[ -d "$app" ]] || { echo "Application root not found: $app" >&2; exit 1; }
[[ -d "$shared_uploads" ]] || { echo "Shared uploads not found: $shared_uploads" >&2; exit 1; }

tar -xzf "$incoming" -C "$stage"
[[ -f "$stage/server.js" ]] || { echo "Invalid release: server.js is missing" >&2; exit 1; }
[[ -f "$stage/REVISION" ]] || { echo "Invalid release: REVISION is missing" >&2; exit 1; }

install -d -m 700 "$backups"
mkdir -p "$backup"
rsync -a \
  --exclude public/uploads \
  --exclude public/uploads.release-copy \
  "$app/" "$backup/"

rollback() {
  echo "Health check failed; restoring $previous_revision" >&2
  stop_app
  rsync -a --delete \
    --exclude public/uploads \
    --exclude public/uploads.release-copy \
    "$backup/" "$app/"
  ln -sfn "$shared_uploads" "$app/public/uploads"
  start_app
}

trap rollback ERR
stop_app
rsync -a --delete \
  --exclude public/uploads \
  --exclude public/uploads.release-copy \
  "$stage/" "$app/"
ln -sfn "$shared_uploads" "$app/public/uploads"
start_app

for attempt in {1..12}; do
  if curl --fail --silent --show-error --insecure \
    --resolve "zeotourism.com:443:$web_ip" \
    https://zeotourism.com/api/sliders >/dev/null; then
    trap - ERR
    rm -f "$incoming"
    find "$backups" -mindepth 1 -maxdepth 1 -type d -print0 \
      | sort -z -r \
      | tail -z -n +4 \
      | xargs -0r rm -rf
    echo "Deployed $revision successfully"
    exit 0
  fi
  sleep 5
done

false
