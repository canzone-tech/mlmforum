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

## Member dashboard overview slice

The screenshot-defined member sidebar, four-summary-card layout, recent-activity table and next-actions panel use real logged-in member account data. The API `GET /api/member/overview` requires a current server session and MEMBER RBAC; users cannot query other profiles through a supplied member ID. Recent sign-ins derive from MySQL sessions. The client screenshot's discussion/event/resource statistics are intentionally not copied as live numbers because those modules are not implemented. Other member pages are visibly disabled rather than linked to dummy functionality.

**Local setup remains deferred at owner's request** because another project is running on that machine. Do not ask for clone/install/verify until owner says local environment is free. GitHub full-stack CI is the active gate.

## Member Genealogy Tree (read-only)

`/dashboard/genealogy` is available to authenticated MEMBER accounts. `GET /api/member/genealogy` returns only the member's own confirmed sponsor-link hierarchy from MySQL/Prisma, limited to the source prototype's first three visual levels. Root/member card layout, search among currently displayed nodes, level selector and reset follow the client screenshot.

No pending applications are attached as live downline. This view does **not** enforce sponsor placement or rank qualification, calculate commissions, perform payments, or expose private contact details. ACTIVE/mobile-verified visibility is a conservative display gate rather than a final eligibility definition. Depth/cap are configured via `GENEALOGY_VIEW_MAX_LEVEL` and `GENEALOGY_VIEW_MAX_NODES_PER_LEVEL`. The UI identifies partial results whenever a view cap is reached.

Local clone, installation, Docker and verification remain deferred at owner request. GitHub Actions provides the current test evidence.

## Member My Network
`/dashboard/my-network`: screenshot-aligned, protected two-column page using
`GET /api/member/network` and `GET/PUT /api/member/network/filters`.
MySQL MemberSponsorLink supplies only the logged-in member's **confirmed direct**
active/verified referrals. Date and member-ID/name filters use bounded validated
queries; account-owned filter drafts persist in MySQL. Results include only names,
member codes, join dates and current permitted status; no private contacts or
financial information. Client-defined follow-up categories and inactive/pending
member visibility remain disabled pending policy/consent approval. CI and local
`npm run verify` exercise the same MySQL/API/browser flows.
Local cloning, installs and testing remain deferred at the owner's request.
