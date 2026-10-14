#!/usr/bin/env bash
set -euo pipefail
# Backend remains missing: scope check MUST NOT claim real authentication or API verification.
test -f AGENTS.md
test -f docs/BUSINESS-RULES-REGISTER.md
test -f config/auth.ts
if [[ -d apps/api ]]; then
  echo "Backend exists: add real NestJS/MySQL verification before claiming this gate." >&2
  exit 1
fi
echo "Backend scope gate only: NestJS, MySQL, OTP and authentication NOT IMPLEMENTED."
