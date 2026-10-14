# MLM Community Forum

A **real** role-based community product built from the client's HTML/CSS/JS visual and workflow references. Development uses a small, module-by-module full-stack approach: **Next.js frontend + NestJS API + MySQL/Prisma data and integrated tests together**.

## Current implementation — INCOMPLETE
Login/Register interface exists in Next.js, but real server-side authentication, registration, sponsor verification, role permissions, and persistence are NOT implemented. Browser requests fail closed. This is **not** an operational login/registration module. No seeded sample accounts or browser-selected auth roles.

Backend verification intentionally blocks green CI until a real API and database integration test suite is included. Frontend-only success is not feature completion.

## First-time local setup (AFTER all three real same-SHA CI gates pass)
The repository is **not cloned locally yet**. When GitHub Backend CI, Frontend CI and Release Evidence are green together, clone the approved branch once:

```sh
git clone --branch dev/local-foundation --single-branch https://github.com/canzone-tech/mlmforum.git
cd mlmforum
npm run verify
```

For later development updates: `git pull` then `npm run verify` from the repository root.

Node.js 24 required. Root verification must run both backend and frontend, including real database/API/browser workflows. No production deployment without separate approval and recovery evidence.

See `AGENTS.md`, `docs/DEVELOPMENT-DELIVERY-RULES.md`, `docs/BUSINESS-RULES-REGISTER.md`, and `docs/RELEASE-SIGNOFF.md`.
