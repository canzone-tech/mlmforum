# Development and delivery rules

## Per-module implementation
1. Inspect existing client HTML, JavaScript, CSS, requirements and the GitHub module; request screenshot when necessary.
2. Separate approved business behavior from illustrative prototype data and unresolved provider/policy decisions.
3. Implement the minimal **frontend + backend + database** vertical slice; no UI fake success, no speculative features.
4. Test server validation, MySQL constraints and migrations, auth/RBAC/ownership and concurrency/idempotency where relevant.
5. Compile both runtimes, boot them and verify API readiness, frontend routes, real browser actions and mobile widths.
6. Run all checks from root `npm run verify` locally and in CI. CI Backend, Frontend and Release Evidence must pass on the same SHA.
7. Commit only to `dev/local-foundation`; review diff and preserve unrelated work.
8. **First-time local clone only after three CI gates green.** Subsequent updates: `git pull` then `npm run verify`.
9. Production approval, financial behavior and OTP/vendor activation remain separate owner decisions.

## Current identity slice
A real MySQL-backed login/session/sponsor/pending-registration slice is under construction. A registration request cannot become an ACTIVE member without a separately approved mobile OTP + account provisioning workflow. Test-only accounts and secrets exist only in guarded isolated local integration fixtures, never production seed data.

## Security decisions still pending
OTP provider and signup password enrollment; privacy/terms version and consent presentation; sponsor eligibility beyond verified active membership; approved role upgrade/approval flow; deployment/provisioning roles and privileged MFA.
