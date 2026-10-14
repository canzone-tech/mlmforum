# Production runbook — UNAPPROVED / NOT DEPLOYED

Production infrastructure, real auth, backups/isolated restore, immutable artifact promotion, scoped rollback, external TLS smoke and operator sign-off are **not** implemented in the first visual prototype module. Do not run migrations, payments or deployments.

Target stack when approved: Ubuntu 24.04, Apache TLS, dedicated non-root PM2 per project; compiled source-free checksum-verified artifacts; separate approved migrations; encrypted off-host backup and verified isolated restore; project-only rollback.

**Do not deploy this phase as a real membership system.** It is a role-login **demo preview** only.
