#!/usr/bin/env bash
set -euo pipefail
# A frontend-only module cannot be signed off as a working full-stack module.
# Replace this gate with actual NestJS + MySQL/Prisma + API/RBAC tests when
# implementing the first integrated module. Never return a false success.
echo "BLOCKED: Login/Register backend and real integration tests are missing." >&2
echo "Backend CI requires actual NestJS API, MySQL migrations, auth/RBAC and request-flow verification." >&2
exit 1
