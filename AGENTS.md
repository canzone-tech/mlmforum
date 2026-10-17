# MLM Community Forum — engineering rules

- Independent project. Work only on `dev/local-foundation`. Never change main/default or unrelated projects.
- Client ZIP HTML/CSS/JS and module screenshots are the visual/field/workflow reference; do not copy prototype credentials or fake success messages.
- Deliver **one real vertical slice at a time**: Next.js frontend + NestJS REST + MySQL/Prisma + regression and integrated browser/API tests.
- Keep configuration centralized and use the smallest architecture-consistent change. Do not create unrelated modules or duplicate logic.
- Authentication and RBAC are server decisions, never browser-selected roles. Use Argon2 password hashes and HttpOnly access/refresh cookies; revoke and rotate sessions.
- Only persist pending registration requests until owner approves OTP provider, password enrollment and account activation. Do not create active members, network positions, commissions or financial operations from registration.
- No hardcoded production data, amounts, rates, secrets, referrals or business policies. MySQL is authoritative.
- CI Backend, Frontend and Release Evidence must all PASS on **one exact SHA**; Backend CI tests real DB/API behavior, and Frontend CI runs root `npm run verify` for full-stack parity.
- Existing root verification must run backend+frontend, migrations, compiled servers, health and browser UAT; fail on missing components.
- User has **no local clone yet**. First handoff after CI green: `git clone --branch dev/local-foundation --single-branch https://github.com/canzone-tech/mlmforum.git`; `cd mlmforum`; `npm run verify`. After first clone: `git pull` then `npm run verify`.
- No production deployment or real provider integration without explicit authorization, full backup/isolated restore, release evidence, rollback, safe compiled source-free artifact and external UAT.
- Report commit SHA, changed files, real CI status, local status, pending approvals and deployment status. No unsupported PASS.

- Current operator decision: **defer all local clone/install/Docker/verification** while another project runs locally. Keep working only in GitHub and verify through GitHub Actions until user explicitly requests local testing. Do not ask user to run local commands merely because three CI gates pass.

- Genealogy business safety: pending registration requests must never become confirmed downline links automatically. Read-only relationships are not eligibility/rank/payout calculations; sponsor changes and qualification policies require prior approval.

- My Network: only confirmed direct sponsor links from MySQL; never infer pending
  registrations or follow-up statuses. Draft filters are member-owned and
  cannot be written for another user. Follow-up/contact policies need approval.
