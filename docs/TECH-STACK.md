# Technical stack and boundaries

Approved preference: Node.js 24, Next.js + TypeScript (public/member/admin), NestJS + TypeScript REST, MySQL 8 + Prisma, JWT access/refresh, Argon2, server-side RBAC. Docker Compose for local dependencies. GitHub Actions for CI.

MongoDB is optional only if flexible content requires it; Redis is optional only for validated cache, queue, or rate-limit needs. Do not add these by default.

Use shared frontend components and a configurable role/navigation registry. Keep operational data authoritative in MySQL. No real payments or commissions until business rules, financial audit/history, approval workflow, external-provider validation and recovery evidence are approved.

Production target (not deployment approval): Ubuntu 24.04, Apache TLS, dedicated non-root PM2, immutable source-free artifact and project-scoped rollback.
