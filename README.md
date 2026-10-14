# MLM Community Forum

Real role-based community product based on the client-supplied HTML/CSS/JS and role/requirements documents. Work occurs on `dev/local-foundation`.

## Current full-stack identity slice

Next.js + TypeScript Login/Register interfaces connect through a same-origin `/api` rewrite to compiled NestJS REST with MySQL 8.4 and Prisma. Implemented contracts:

- Login for already verified, ACTIVE users with Argon2 password hashes and server-derived RBAC roles
- HttpOnly access/refresh cookies, refresh rotation and revoked logout sessions
- MySQL-backed verified Sponsor ID/name lookup
- Validated free registration **request** persisted in MySQL as `PENDING_VERIFICATION`, with consent timestamp and version
- No browser role selection, fake passwords, auto account activation, MLM commissions or payouts
- Isolated test fixtures only in the guarded `mlmforum_test` DB. No production users are seeded.

**Not yet activated:** owner-approved OTP provider, signup password enrollment/verification, privacy/consent signoff, role upgrades and production auth operations. The local-only `.env.example` enables pending-request intake for isolated integration testing; production defaults closed. No completed account may be created by a pending request.

## Repeatable verification

Node.js 24 and Docker Compose required. Root `npm run verify` starts isolated MySQL, installs the committed lockfile, validates Prisma and migrations, compiles and boots NestJS, runs real auth/DB integration tests, builds Next standalone, checks compiled routes/assets and runs Playwright against the actual API.

## First-time local clone — AFTER all three same-SHA CI gates are green

This project has not been cloned to the user's machine yet:

```sh
git clone --branch dev/local-foundation --single-branch https://github.com/canzone-tech/mlmforum.git
cd mlmforum
npm run verify
```

On later updates: `git pull` and `npm run verify`.

## Release

Backend CI, Frontend CI and Release Evidence must all pass for the same SHA, then user confirms local verification. CI green is not production approval. Separate owner approvals, provider UAT, backup/restore and source-free immutable deployment evidence are required.
