# MLM Community Forum

Independent client-source-aligned Next.js/TypeScript project, developed only on `dev/local-foundation`.

## Current module — Login / Register (demo-only)

The supplied client `login.html`, `app.js`, `styles.css` and accompanying registration/mobile audit are the reference. The frontend contains a responsive login/register form, seven selectable preview identities, ten read-only sample sponsor IDs and browser validation. **No secure authentication, persisted signup, OTP, role authorization, financial transaction or MLM payout exists.**

The route `/demo?role=...` is only a visibly labeled placeholder for the future dashboard conversion. It is not private or authenticated.

Demo reference data is held in **one** `config/demo.ts` module, never in real datastore tables.

## Setup and verification

Use Node.js 24. The committed `package-lock.json` keeps installs reproducible. From repo root, after exact-SHA CI gates pass:

```sh
git pull
npm run verify
```

This runs a locked install, scope checks, lint, typecheck, tests, production build, compiled standalone startup/HTTP route smoke and Playwright Chromium browser UAT. It may download Chromium on first run. Do not claim local PASS until the operator confirms.

For dev preview after install, run `npm run dev`; browse `http://localhost:3000/login`.

## CI and release state

- Backend CI: explicit scope check; **backend not implemented**.
- Frontend CI: locked install, build/runtime/browser tests.
- Release Evidence: checks Backend + Frontend workflow conclusions on the **same SHA**, saves JSON evidence, and keeps production approval **PENDING**.
- No production deployment approval or real financial behavior is inferred.

See `AGENTS.md`, `docs/DEVELOPMENT-DELIVERY-RULES.md`, `docs/BUSINESS-RULES-REGISTER.md`, and `docs/UAT-CHECKLIST.md`.
