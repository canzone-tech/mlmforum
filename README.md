# MLM Community Forum

A real multi-role community platform under development. The client's HTML/CSS/JS is the source for screens and requested workflows, **not** authentication code, a development data source or permission policy.

## Login / Register milestone

Next.js + TypeScript renders client-aligned responsive login and registration forms. Seven client roles are **not** selectable at login: authenticated identity and permitted roles must come exclusively from the future NestJS/MySQL backend. Self-registration account-type options are limited to the five non-privileged roles in `config/auth.ts` pending owner approval.

The frontend sends login/register/sponsor requests to `NEXT_PUBLIC_API_BASE_URL` (default `/api`). These backend endpoints are **not implemented yet**; requests fail closed and display an unavailable/verification message. **No user is authenticated or registered until the real backend exists and passes UAT.**

## Verification

Node.js 24 required. After exact-SHA Backend CI, Frontend CI and Release Evidence are green, run from repo root:

```sh
git pull
npm run verify
```

This performs a deterministic npm install, lint/types, source/validation tests, Next production build, compiled server/CSS/JS startup, browser form interactions and mobile overflow checks.

**Current scope:** backend CI is explicitly scope-only; it does not claim authentication, DB, RBAC or provider verification. Production authorization remains pending.

See `AGENTS.md`, `docs/UAT-CHECKLIST.md`, `docs/BUSINESS-RULES-REGISTER.md`, and `docs/RELEASE-SIGNOFF.md`.
