#!/usr/bin/env bash
set -Eeuo pipefail

APP_ROOT=${1:?Application root is required}
RELEASE_ID=${2:?Release ID is required}
ENV_FILE=${3:-}
NODE_BIN=${4:-node}
ACTION=${5:-deploy}
KEEP_RELEASES=${6:-3}

if [[ "$APP_ROOT" != /* ]]; then
  echo "Application root must be an absolute path" >&2
  exit 2
fi
if [[ ! "$RELEASE_ID" =~ ^[A-Za-z0-9._-]+$ ]]; then
  echo "Invalid release ID" >&2
  exit 2
fi
if [[ ! "$KEEP_RELEASES" =~ ^[1-9][0-9]*$ ]]; then
  echo "KEEP_RELEASES must be a positive integer" >&2
  exit 2
fi

DEPLOY_DIR="$APP_ROOT/.deploy"
INCOMING_DIR="$DEPLOY_DIR/incoming"
RELEASES_DIR="$DEPLOY_DIR/releases"
LOCK_DIR="$DEPLOY_DIR/lock"
CURRENT_MARKER="$DEPLOY_DIR/current-release"
PREVIOUS_MARKER="$DEPLOY_DIR/previous-release"
INCOMING_ZIP="$INCOMING_DIR/$RELEASE_ID.zip"
RELEASE_DIR="$RELEASES_DIR/$RELEASE_ID"

mkdir -p "$APP_ROOT" "$INCOMING_DIR" "$RELEASES_DIR"
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "Another deployment is already running" >&2
  exit 75
fi

switch_started=0
previous_release=''

sync_release() {
  local source_dir=$1
  rsync -a --delete \
    --exclude '.deploy/' \
    --exclude '.env' \
    --exclude '.env.*' \
    --exclude '.htaccess' \
    --exclude '.well-known/' \
    --exclude 'backups/' \
    --exclude 'logs/' \
    --exclude 'storage/' \
    --exclude 'tmp/' \
    --exclude 'uploads/' \
    "$source_dir/" "$APP_ROOT/"
}

restart_passenger() {
  mkdir -p "$APP_ROOT/tmp"
  touch "$APP_ROOT/tmp/restart.txt"

  # restart.txt reloads a running Passenger worker. Recover through CloudLinux
  # only when this specific app has no worker; starting an app CloudLinux still
  # considers running can block indefinitely.
  if command -v cloudlinux-selector >/dev/null 2>&1; then
    local pid worker_running=false
    for pid in $(pgrep -u "$USER" -f '^next-server \(v' || true); do
      if [[ "$(readlink "/proc/$pid/cwd" 2>/dev/null || true)" == "$APP_ROOT" ]]; then
        worker_running=true
        break
      fi
    done

    if [[ "$worker_running" == false ]]; then
      local selector_root=${APP_ROOT#"$HOME"/}
      timeout 20s cloudlinux-selector stop \
        --interpreter nodejs --app-root "$selector_root" >/dev/null 2>&1 || true
      timeout 30s cloudlinux-selector start \
        --interpreter nodejs --app-root "$selector_root" >/dev/null 2>&1 || true
    fi
  fi
}

write_marker() {
  local marker=$1
  local value=$2
  local temporary="$marker.tmp.$$"
  printf '%s\n' "$value" > "$temporary"
  mv -f "$temporary" "$marker"
}

cleanup() {
  local status=$?
  trap - EXIT
  if [[ $status -ne 0 && $switch_started -eq 1 && -n "$previous_release" && -d "$RELEASES_DIR/$previous_release" ]]; then
    echo "Deployment failed after file switch; restoring $previous_release" >&2
    set +e
    sync_release "$RELEASES_DIR/$previous_release"
    write_marker "$CURRENT_MARKER" "$previous_release"
    restart_passenger
    set -e
  fi
  rm -rf "$LOCK_DIR"
  exit "$status"
}
trap cleanup EXIT

rollback() {
  if [[ ! -s "$PREVIOUS_MARKER" ]]; then
    echo "No previous release is available for rollback" >&2
    exit 1
  fi

  local target current
  target=$(tr -d '\r\n' < "$PREVIOUS_MARKER")
  current=''
  [[ -s "$CURRENT_MARKER" ]] && current=$(tr -d '\r\n' < "$CURRENT_MARKER")
  if [[ ! -d "$RELEASES_DIR/$target" ]]; then
    echo "Rollback release directory is missing: $target" >&2
    exit 1
  fi

  echo "Rolling back from ${current:-unknown} to $target"
  sync_release "$RELEASES_DIR/$target"
  write_marker "$CURRENT_MARKER" "$target"
  [[ -n "$current" ]] && write_marker "$PREVIOUS_MARKER" "$current"
  restart_passenger
  echo "Rollback complete"
}

if [[ "$ACTION" == 'rollback' ]]; then
  rollback
  exit 0
fi
if [[ "$ACTION" != 'deploy' ]]; then
  echo "Unsupported action: $ACTION" >&2
  exit 2
fi

for command in unzip rsync; do
  command -v "$command" >/dev/null 2>&1 || { echo "Required command is missing: $command" >&2; exit 1; }
done
if [[ "$NODE_BIN" == */* ]]; then
  [[ -x "$NODE_BIN" ]] || { echo "Node binary is not executable: $NODE_BIN" >&2; exit 1; }
else
  command -v "$NODE_BIN" >/dev/null 2>&1 || { echo "Node binary was not found: $NODE_BIN" >&2; exit 1; }
fi
[[ -f "$INCOMING_ZIP" ]] || { echo "Uploaded release archive is missing: $INCOMING_ZIP" >&2; exit 1; }

if [[ ! -d "$RELEASE_DIR" ]]; then
  temporary_release="$RELEASES_DIR/.${RELEASE_ID}.extracting"
  rm -rf "$temporary_release"
  mkdir -p "$temporary_release"
  unzip -q "$INCOMING_ZIP" -d "$temporary_release"
  [[ -f "$temporary_release/server.js" ]] || { echo "Release does not contain server.js" >&2; exit 1; }
  [[ -f "$temporary_release/deployment/run-migrations.mjs" ]] || { echo "Release does not contain the migration runner" >&2; exit 1; }
  mv "$temporary_release" "$RELEASE_DIR"
fi

if [[ -s "$CURRENT_MARKER" ]]; then
  previous_release=$(tr -d '\r\n' < "$CURRENT_MARKER")
fi
if [[ -z "$previous_release" || ! -d "$RELEASES_DIR/$previous_release" ]]; then
  previous_release="initial-$(date -u +%Y%m%d%H%M%S)"
  echo "Creating one-time rollback snapshot: $previous_release"
  mkdir -p "$RELEASES_DIR/$previous_release"
  rsync -a \
    --exclude '.deploy/' \
    --exclude '.env' \
    --exclude '.env.*' \
    --exclude 'tmp/' \
    --exclude 'uploads/' \
    "$APP_ROOT/" "$RELEASES_DIR/$previous_release/"
  write_marker "$CURRENT_MARKER" "$previous_release"
fi

if [[ -n "$ENV_FILE" ]]; then
  [[ -r "$ENV_FILE" ]] || { echo "Deployment environment file is not readable: $ENV_FILE" >&2; exit 1; }
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

echo "Running pending database migrations"
ulimit -c 0 || true
migration_attempt=1
while true; do
  set +e
  (
    ulimit -t 120
    exec env \
      UV_THREADPOOL_SIZE=1 \
      MALLOC_ARENA_MAX=2 \
      NODE_OPTIONS='--v8-pool-size=1 --max-old-space-size=192 --max-semi-space-size=4' \
      nice -n 10 \
      "$NODE_BIN" "$RELEASE_DIR/deployment/run-migrations.mjs"
  )
  migration_status=$?
  set -e

  if (( migration_status == 0 )); then
    break
  fi
  if (( migration_attempt == 1 )) && (( migration_status == 134 || migration_status == 137 )); then
    echo "Migration runtime exited with resource status $migration_status; retrying once after a short cooldown" >&2
    migration_attempt=2
    sleep 5
    continue
  fi
  echo "Migration runner failed with status $migration_status" >&2
  exit "$migration_status"
done

write_marker "$PREVIOUS_MARKER" "$previous_release"
switch_started=1
echo "Publishing release $RELEASE_ID"
sync_release "$RELEASE_DIR"
write_marker "$CURRENT_MARKER" "$RELEASE_ID"
restart_passenger
switch_started=0
rm -f "$INCOMING_ZIP"

echo "Pruning old releases (keeping rollback history)"
kept=0
while IFS= read -r directory; do
  [[ -n "$directory" ]] || continue
  release_name=$(basename "$directory")
  if [[ "$release_name" == "$RELEASE_ID" || "$release_name" == "$previous_release" ]]; then
    continue
  fi
  kept=$((kept + 1))
  if (( kept >= KEEP_RELEASES )); then
    rm -rf "$directory"
  fi
done <<< "$(ls -1dt "$RELEASES_DIR"/* 2>/dev/null || true)"

echo "Release $RELEASE_ID deployed successfully"
