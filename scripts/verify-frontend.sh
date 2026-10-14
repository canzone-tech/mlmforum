#!/usr/bin/env bash
set -euo pipefail
npm run lint
npm run typecheck
npm run test
npm run build
test -f .next/standalone/server.js
mkdir -p .next/standalone/.next
cp -R .next/static .next/standalone/.next/static
if [[ -d public ]]; then cp -R public .next/standalone/public; fi
node apps/api/test/fixtures.mjs create
node apps/api/dist/main.js > /tmp/mlmforum-api-smoke.log 2>&1 &
api_pid=$!
cleanup() {
  kill "$api_pid" 2>/dev/null || true
  wait "$api_pid" 2>/dev/null || true
  node apps/api/test/fixtures.mjs clean || true
}
trap cleanup EXIT
npm run smoke
npx playwright install chromium
npm run test:e2e
