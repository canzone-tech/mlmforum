# Development and delivery rules

## Client-source-first implementation
Primary reference: client-provided `MLM_Community_Forum_MULTIPAGE_COMMUNITY_DISCUSSION_BUNDLE.zip`. This is a predevelopment prototype containing 5 HTML pages, styles, JavaScript, seven role navigation maps, workflow-specific form designs, and audit/requirements documents. Client screenshots are supplementary visual evidence, requested only for the module being implemented.

1. Select one page/module from the client's existing navigation.
2. Review its existing markup, CSS, JavaScript, audit documentation, labels, fields, validation, and permissions.
3. Separate **visual demo behavior** from approved operational behavior; record missing approvals.
4. Reuse shared layout/components and one configurable role/page registry. Avoid duplicate definitions and magic values.
5. Implement just that module's frontend/API/data contracts if approved, without inventing compensation, eligibility, or payment behavior.
6. Add focused regression tests and visual route smoke checks; update root verification and CI as appropriate.
7. Commit on `dev/local-foundation`, review diff, check exact-SHA three CI gates, then request user local `git pull` and `npm run verify`.
8. Production deployment is a separate authorized release step.

## Avoid complexity and repetition
Keep implementation readable and conventional. Use a single source of truth for branding, navigation, policies and environment settings. No advance engineering for unstarted modules, no duplicate work, no hard-coded live users or finances, and no false claims about tests or release status.

## Implementation state
Repository is being initialized. Login, registration, genealogy, ledger, wallet and administrative functions remain a **client prototype**, not validated production workflows.
