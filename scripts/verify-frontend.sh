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
npm run smoke
if [[ "${SKIP_BROWSER_UAT:-}" == "1" ]]; then
  echo "Browser UAT intentionally skipped (not an all-green full verify)." >&2
else
  npx playwright install chromium
  npm run test:e2e
fi
