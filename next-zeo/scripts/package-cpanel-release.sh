#!/usr/bin/env bash
set -euo pipefail

revision="${1:?usage: package-cpanel-release.sh <git-revision>}"
archive="cpanel-release-${revision}.tar.gz"
stage="$(mktemp -d "${TMPDIR:-/tmp}/zeo-cpanel-package.XXXXXX")"
trap 'rm -rf "$stage"' EXIT

if [[ ! -f .next/standalone/server.js ]]; then
  echo "Standalone server not found. Run npm run build first." >&2
  exit 1
fi

cp -a .next/standalone/. "$stage/"
# Keep deployment scripts from the source package manifest even if the
# standalone manifest was produced before a script-only package change.
cp package.json "$stage/package.json"
mkdir -p "$stage/.next/static" "$stage/public"
cp -a .next/static/. "$stage/.next/static/"

# Uploads are persistent production data and are linked on the server.
if [[ -d public ]]; then
  rsync -a --exclude uploads/ public/ "$stage/public/"
fi

mkdir -p "$stage/deployment/migrations"
cp scripts/run-cpanel-migrations.mjs "$stage/deployment/run-migrations.mjs"
cp src/server/db/migrations/*.sql "$stage/deployment/migrations/"

# The migration runner executes outside Next's traced server bundle, so include
# mysql2 and its small runtime dependency closure explicitly.
migration_packages=(
  mysql2 aws-ssl-profiles denque generate-function iconv-lite long lru.min
  named-placeholders sql-escaper is-property safer-buffer
)
mkdir -p "$stage/node_modules"
for package_name in "${migration_packages[@]}"; do
  [[ -d "node_modules/$package_name" ]] || {
    echo "Missing migration runtime package: $package_name" >&2
    exit 1
  }
  cp -a "node_modules/$package_name" "$stage/node_modules/"
done

printf '%s\n' "$revision" > "$stage/REVISION"
tar -czf "$archive" -C "$stage" .
echo "Created $archive"
