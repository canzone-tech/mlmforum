#!/usr/bin/env bash
set -euo pipefail
test -f apps/api/prisma/schema.prisma
npm run api:generate
npm run typecheck -w @mlmforum/api
npm run api:build
npm run api:migrate
RUN_INTEGRATION_TESTS=1 npm run api:test
