#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
node -e 'if(process.versions.node.split(".")[0]!=="24"){console.error("Node.js 24 required; found",process.version);process.exit(1)}'
if [[ ! -f package-lock.json ]]; then
  echo "Missing committed package-lock.json; CI must generate/commit the lockfile first." >&2
  exit 1
fi
npm ci --no-audit --no-fund
npm run verify:backend
npm run verify:frontend
echo "MLM Forum local verification passed (frontend prototype only; backend not implemented)."
