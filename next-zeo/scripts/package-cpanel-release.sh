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
mkdir -p "$stage/.next/static" "$stage/public"
cp -a .next/static/. "$stage/.next/static/"

# Uploads are persistent production data and are linked on the server.
if [[ -d public ]]; then
  rsync -a --exclude uploads/ public/ "$stage/public/"
fi

printf '%s\n' "$revision" > "$stage/REVISION"
tar -czf "$archive" -C "$stage" .
echo "Created $archive"

