# Login and Registration UAT

## Automated full-stack acceptance
- [ ] Real compiled NestJS `/health/live`, `/health/ready` checks against MySQL
- [ ] Prisma migration replay against isolated `mlmforum_test`
- [ ] Existing verified user Argon2 login sets HttpOnly access/refresh cookies
- [ ] Wrong credentials, suspended account, missing session and disallowed Origin denied
- [ ] Server-provided roles only; admin privilege cannot be requested on public signup
- [ ] Refresh rotates/revokes previous session; logout idempotent and revokes session
- [ ] Sponsor ID lookup backed by MySQL; unknown/blocked IDs fail closed
- [ ] Signup validates fields and consent; stores only pending request; duplicates rejected
- [ ] No automatically created ACTIVE user, sponsor placement, commission or wallet
- [ ] Compiled Next+Nest health/readiness, API proxy 401, CSS and JS asset smoke
- [ ] Playwright actual login/logout, pending registration and sponsor lookup
- [ ] 320px and 390px width, keyboard accessible tabs/field error states

## Explicitly pending before production identity signoff
- [ ] Mobile OTP provider approval and real deliver/verify UAT
- [ ] Account password enrollment/recovery and verified activation
- [ ] Approved consent/privacy-policy revision and retention
- [ ] Verified role-assignment/upgrade and privileged MFA
- [ ] Original screenshot side-by-side visual UAT with operator
- [ ] Real production source-free deployment, backup/restore and security testing

## Member dashboard overview (client screenshot reference)
- [ ] Correct member navigation order and labels from client `app.js`; unimplemented links clearly disabled
- [ ] Actual logged-in user name, member code, status and verification from authoritative MySQL records
- [ ] Recent sign-ins scoped to authenticated member, no cross-member query override
- [ ] No client sample discussion/event/resource counts used as real statistics
- [ ] Non-member users receive API 403; guests/revoked session receive 401
- [ ] Existing Login/Register logout and auth flows continue working
- [ ] Sidebar opens/closes at mobile width with keyboard-accessible toggle; no 390px horizontal overflow
- [ ] Separate screenshot-to-implementation visual UAT still pending
