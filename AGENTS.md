# MLM Forum — Repository engineering rules

## Delivery principle
Implement **one client-defined module at a time**, retaining the supplied prototype's HTML/CSS/JS behavior and visual design. Ask for the screenshot of the exact module when needed. Do not redesign, invent functionality, or pre-build future modules.

## Keep it simple
- Inspect the existing source and repository before changes; reuse existing code. Never redo work already present.
- Choose the smallest maintainable implementation. No speculative abstractions, future-proof frameworks, extra services, or unnecessary dependencies.
- Keep role names, role-to-menu mappings, page metadata, configurable policies, public labels, URLs, ports, and environment settings in one clear configuration/source of truth where appropriate. Do not scatter duplicate literals.
- **Never hardcode production business rules, credentials, balances, member records, commission amounts, rank thresholds, or payout behavior.**
- Source prototype's example data is **demo-only**. It cannot become production persistence, approved policy, or real transaction data.
- Use real backend validation and authorization for real actions; UI visibility is never security.

## Project boundaries
This independent project uses Next.js + TypeScript, NestJS REST, MySQL + Prisma, JWT/Argon2/RBAC as enabled by approved modules, Node.js 24, and GitHub Actions. MongoDB/Redis only with demonstrated need.
Never import data, rules, infrastructure, or branding from unrelated projects.
Financial rules, rank qualifications, and payment integrations require explicit owner approval; MySQL remains authoritative.

## Git + verification
- Work only on `dev/local-foundation`; no main/default changes except the initial empty-repository bootstrap already completed.
- Preserve unrelated work; no force pushes or history rewrites.
- Commit source-aligned incremental work and verify Backend CI, Frontend CI, and Release Evidence on the **same exact SHA**.
- Root `npm run verify` is the local gate; do not claim local verification without user confirmation.
- Production requires a separate exact-release approval, recovery evidence, and safe compiled artifact deployment.
- Report current SHA, CI status, local status, changed files, blockers; never claim PASS without evidence.
