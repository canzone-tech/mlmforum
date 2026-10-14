# Production runbook — NOT YET DEPLOYABLE

MLM Forum is a real-product implementation. A visually working frontend is NOT production authentication.

Production requires approved Node 24/NestJS, MySQL schema, real sponsor lookup, password provisioning, mobile OTP and account activation, server-side RBAC, operational secrets and rate limiting. All routes including dashboard need real session enforcement. This module's backend does not yet exist.

Before deployment: exact-SHA CI and local verification, explicit approval, independent off-host encrypted backup/restore evidence, artifact checksums, dedicated non-root PM2 account, scoped Apache TLS proxy, atomic switch, rollback, external HTTPS and auth 401 checks, visual UAT. Do not deploy this incomplete implementation.
