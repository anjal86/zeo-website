#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
MIGRATIONS_DIR=${1:-"$SCRIPT_DIR/migrations"}

required() {
  local name=$1
  local value=${!name:-}
  if [[ -z "${value//[[:space:]]/}" ]]; then
    echo "Missing required migration environment variable: $name" >&2
    exit 1
  fi
  printf '%s' "$value"
}

MYSQL_HOST_VALUE=$(required MYSQL_HOST)
MYSQL_USER_VALUE=$(required MYSQL_USER)
MYSQL_PASSWORD_VALUE=$(required MYSQL_PASSWORD)
MYSQL_DATABASE_VALUE=$(required MYSQL_DATABASE)
MYSQL_PORT_VALUE=${MYSQL_PORT:-3306}

if [[ ! "$MYSQL_PORT_VALUE" =~ ^[0-9]+$ ]]; then
  echo "MYSQL_PORT must be numeric" >&2
  exit 1
fi
if [[ ! -d "$MIGRATIONS_DIR" ]]; then
  echo "Migration directory is missing: $MIGRATIONS_DIR" >&2
  exit 1
fi

if command -v mariadb >/dev/null 2>&1; then
  DB_CLIENT=$(command -v mariadb)
elif command -v mysql >/dev/null 2>&1; then
  DB_CLIENT=$(command -v mysql)
else
  echo "Neither mariadb nor mysql client is available" >&2
  exit 127
fi

export MYSQL_PWD=$MYSQL_PASSWORD_VALUE
trap 'unset MYSQL_PWD' EXIT

DB_ARGS=(
  --protocol=TCP
  --host="$MYSQL_HOST_VALUE"
  --port="$MYSQL_PORT_VALUE"
  --user="$MYSQL_USER_VALUE"
  --database="$MYSQL_DATABASE_VALUE"
  --default-character-set=utf8mb4
  --connect-timeout=15
  --batch
  --skip-column-names
  --raw
)

run_sql() {
  "$DB_CLIENT" "${DB_ARGS[@]}" --execute="$1"
}

run_file() {
  "$DB_CLIENT" "${DB_ARGS[@]}" < "$1"
}

sha256_file() {
  local file=$1
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$file" | awk '{print $1}'
  elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$file" | awk '{print $1}'
  elif command -v openssl >/dev/null 2>&1; then
    openssl dgst -sha256 "$file" | awk '{print $NF}'
  else
    echo "A SHA-256 utility is required" >&2
    exit 1
  fi
}

legacy_checksum() {
  LC_ALL=C od -An -tu1 -v "$1" | awk '
    {
      for (index = 1; index <= NF; index += 1) {
        hash = (hash * 31 + $index) % 4294967296
      }
    }
    END { printf "%08x\n", hash }
  '
}

run_sql "
  CREATE TABLE IF NOT EXISTS schema_migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    checksum VARCHAR(64) NOT NULL,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
"

mapfile -d '' migration_files < <(
  find "$MIGRATIONS_DIR" -maxdepth 1 -type f -name '*.sql' -print0 | sort -z
)

applied_count=0
for migration_path in "${migration_files[@]}"; do
  filename=$(basename "$migration_path")
  if [[ ! "$filename" =~ ^[A-Za-z0-9._-]+\.sql$ ]]; then
    echo "Unsafe migration filename: $filename" >&2
    exit 1
  fi

  digest=$(sha256_file "$migration_path")
  legacy_digest=$(legacy_checksum "$migration_path")
  existing_checksum=$(run_sql "SELECT checksum FROM schema_migrations WHERE filename = '$filename' LIMIT 1" | tr -d '\r\n')

  if [[ -n "$existing_checksum" ]]; then
    if [[ "$existing_checksum" != "$digest" && "$existing_checksum" != "$legacy_digest" ]]; then
      echo "Applied migration checksum changed: $filename" >&2
      exit 1
    fi
    echo "skip $filename"
    continue
  fi

  echo "apply $filename"
  run_file "$migration_path"
  run_sql "INSERT INTO schema_migrations (filename, checksum) VALUES ('$filename', '$digest')"
  applied_count=$((applied_count + 1))
  echo "applied $filename"
done

echo "migrations applied: $applied_count"
