#!/usr/bin/env bash
set -euo pipefail
# Backend is explicitly out of scope until real auth/workflow policy is approved.
# Never claim this is API, database, or RBAC test evidence.
test -f AGENTS.md
test -f docs/BUSINESS-RULES-REGISTER.md
test -f config/demo.ts
if [[ -d apps/api ]]; then
  echo "Backend module now exists: update this gate to run its real verification." >&2
  exit 1
fi
echo "Backend scope gate passed: API NOT IMPLEMENTED; no auth, MySQL or financial processing enabled."
