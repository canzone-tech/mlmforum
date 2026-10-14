#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
node -e 'if(process.versions.node.split(".")[0]!=="24"){console.error("Node.js 24 required; found",process.version);process.exit(1)}'
test -f package-lock.json || { echo "Missing committed package-lock.json" >&2; exit 1; }
npm ci --no-audit --no-fund
npm run verify:backend
npm run verify:frontend
echo "MLM Forum integrated verification passed."
