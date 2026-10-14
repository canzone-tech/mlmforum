# Login / Register acceptance checklist

Client `login.html` is a design/field reference, NOT an acceptable authentication implementation.

## Frontend verified by CI
- [ ] Login tab and create account tab preserve source layout on desktop and mobile
- [ ] No sample user accounts, passwords, role switching or unsecured preview dashboard
- [ ] Login submits email/password to an API; never authenticates in browser
- [ ] Sponsor lookup uses an API; unresolved or unavailable lookup fails closed
- [ ] Registration fields include full name, email, mobile number, Sponsor ID, read-only Sponsor name, account type, primary interest, consent
- [ ] Registration requires sponsor resolution before submitting; API failure never reports success
- [ ] Compiled Next server serves HTML, CSS and JS and refuses `/demo`/`/dashboard`
- [ ] Chromium route/action and 320px/390px mobile overflow smoke

## BLOCKED: functional production acceptance
- [ ] NestJS auth implemented with MySQL/Prisma, Argon2, secure session and RBAC
- [ ] Production password enrollment/recovery and OTP provider approved and integrated
- [ ] Unique sponsor ID lookup backed by MySQL with privacy-safe scope and abuse controls
- [ ] Account activation and account-type permissions approved
- [ ] Actual API integration, full browser login/register success+error UAT, logout and unauthorized 401
- [ ] Pixel-visual comparison against supplied screenshots and real mobile devices
- [ ] Local `npm run verify` confirmed by operator

Frontend passing is **not** production identity approval.
