# Release sign-off — NOT READY

- Client-provided `login.html`, styles and JavaScript are requirements and visual references, not approved production auth.
- MLM Forum is a **real** multi-role platform. Build each module's frontend + backend + persistence together.
- Current Login/Register: **INCOMPLETE**. Next.js form exists; NestJS/MySQL/authentication/sponsor workflows do not.
- **Backend CI must fail** while backend/integration testing is absent. Frontend CI alone does not satisfy a module or release gate. Release Evidence must not turn green unless real Backend CI and Frontend CI pass on one SHA.
- Local: repository folder **not created by user**; local `npm run verify` has NOT run.
- After full-stack three-gate green: first-time clone of approved branch then root `npm run verify`; subsequent `git pull` + `npm run verify`.
- Production approval: PENDING. No deployment or financial operations.
