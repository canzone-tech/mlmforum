# Development and delivery rules

## Client-source-first, integrated module delivery
Reference: supplied `MLM_Community_Forum_MULTIPAGE_COMMUNITY_DISCUSSION_BUNDLE.zip` (HTML/CSS/JS, role-based UI and workflow documents). Request screenshots **only for the current module** as needed.

1. Choose one client-defined real module. Inspect its HTML, styles, JavaScript, requirements, fields, role permissions and current repository implementation.
2. Identify what is confirmed, what is only visual example behavior and what requires owner approval. Do not invent compensation, eligibility, payments or provider requirements.
3. Implement the **minimal coherent vertical slice**: Next.js interface + NestJS REST validation/auth/RBAC + MySQL/Prisma data model/transaction needs. No disconnected UI and no fake-success handlers.
4. Keep roles, navigation and approved policies configuration-driven; reuse existing components and contracts rather than duplicate logic.
5. For the same module, test database migration/schema, API success/failure paths, authorization/ownership, frontend user actions, responsive appearance and backend/frontend integration. Include regression tests in repo.
6. Root `npm run verify` runs **both** sides and fails if a required side or its checks are absent. Backend CI, Frontend CI and Release Evidence must be green on the **same commit SHA** before local handoff. Scope-only Backend CI is not sufficient.
7. Review final diff and push normally on `dev/local-foundation`, with no production changes.
8. User currently has **no local clone**. After integrated CI is green, the initial handoff is a **single branch-specific git clone** plus `npm run verify` from the cloned repository root. Only later updates use `git pull` + `npm run verify`.
9. Deploy only after separate exact-release approval and all production/recovery prerequisites.

## Current status
Previous Login/Register UI exists, but real NestJS/MySQL authentication, registration and sponsor verification are missing. Therefore **Login/Register is NOT complete**, and the joint backend gate must stay red until real API and integration tests are implemented. Existing client source examples are references, not a second app to reproduce.

## Simplicity
No advance engineering, unnecessary dependencies or duplicate module implementations. Do not pretend CI/local/deployment actions passed when they have not.
