# Release status — approval PENDING

This milestone implements initial **real full-stack** account authentication, sponsor lookup and **pending** registration storage, with isolated test accounts only for CI.

**Not production-ready:** OTP provider, password enrollment/activation, privacy policy approval, full dashboard and privileged role onboarding remain blocked. No live user activation or financial operations.

Evidence must include three exact-SHA Github CI runs, integration/migration/compiled startup and real browser UAT. Local root `npm run verify` requires user confirmation. The user has no local clone yet. No production deployment authorized.
