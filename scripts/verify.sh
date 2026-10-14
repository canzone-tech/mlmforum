#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
node -e 'if(process.versions.node.split(".")[0]!=="24"){console.error("Node.js 24 required; found",process.version);process.exit(1)}'
test -f package-lock.json || { echo "Missing committed package-lock.json" >&2; exit 1; }
if [[ -f .env ]]; then
  set -a; source .env; set +a
else
  set -a; source .env.example; set +a
fi
: "${DATABASE_URL:?DATABASE_URL is required}"
docker compose up -d --wait mysql
npm ci --no-audit --no-fund
npm run verify:backend
npm run verify:frontend
echo "Full-stack verification PASS (with pending account activation/provider approval)."
