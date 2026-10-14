# MLM Forum — Repository engineering rules

## Delivery principle
Build **one real, client-defined module at a time**, preserving the supplied HTML/CSS/JS design and approved user workflow. Ask for a screenshot of that specific page when useful.

**Mandatory vertical-slice rule:** frontend (Next.js), backend (NestJS API), and necessary MySQL/Prisma persistence are designed, implemented, and tested **together for each module**. Do not call a frontend-only form an implemented module. No mock login, fake credential bypass or sample financial data in application logic. Backend auth/RBAC must decide access, never a browser role selector.

## Keep it simple
- Inspect existing source and GitHub before any changes. Reuse what exists and avoid repeating tasks.
- Implement only current client-defined functionality: no speculative modules, unnecessary services or advance engineering.
- Use one clear configuration/source of truth for reusable roles, menus, application settings and approved versioned policies. Do not scatter duplicate literals.
- Never hardcode production members, passwords, Sponsor IDs, fees, balances, rank eligibility, commissions or payout behavior.
- Client prototype's example data is **visual reference only**, not authoritative real records.
- Secure server-side validation/authorization, auditability and database ownership matter for real operations.

## Project boundaries
Independent project: Next.js + TypeScript frontend, NestJS + TypeScript REST, MySQL 8 + Prisma, JWT access/refresh + Argon2 + RBAC when implemented, Node.js 24; use MongoDB/Redis only upon demonstrated need. Do not reuse other-project rules, data, secrets, branding or infrastructure.
Payments/compensation and rank qualification must not be enabled without explicit business approval. MySQL is authoritative.

## Git, full-stack CI and local bootstrap
- Work only on `dev/local-foundation`. Never force push, rewrite history or change other projects.
- **Backend CI must run real backend validation/tests for the current module**, including relevant DB/API/security checks. A scope-only placeholder must NOT pass as Backend CI.
- Frontend CI must run lint/types/build and real browser route/action smoke. Release Evidence may turn green **only on the same SHA** as successful real Backend CI and Frontend CI.
- Root `npm run verify` must exercise backend and frontend together. If either part is missing, **fail closed**.
- **User has not created a local repository folder yet.** Never ask for `git pull` alone. After exact-SHA three-gate CI is green, provide the initial clone of `dev/local-foundation`, followed by root `npm run verify`. For subsequent updates use `git pull` + `npm run verify`.
- Local verification is unconfirmed until user runs it; do not make unsupported PASS claims.
- Production deployment requires separate exact-release approval, off-host backup/restore evidence, immutable source-free artifact, safe rollback and post-deploy UAT.
- Report changed files, branch/SHA, exact-SHA CI statuses, local status and blockers.
