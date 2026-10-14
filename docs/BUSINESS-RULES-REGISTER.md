# MLM Forum business-rules register

Client source: `MOBILE_NAV_AND_REGISTRATION_AUDIT.md`, `RBAC_PERMISSION_MATRIX.md`, `APPROVED_RANK_AND_LEVEL_PLAN_RULES.md`, `README_ENGINEER_HANDOVER.md`.

| Area | Source-derived baseline | Current state / approval |
| --- | --- | --- |
| Registration | Free; full name, email, Indian mobile, Sponsor ID + resolved sponsor name, account type, interest and consent | Store only a pending request; no activated account or commissions |
| Member identity | Real server-side auth, Argon2, roles, sessions, OTP required before activation | Sessions for *existing pre-provisioned verified users* can be tested. OTP/password enrollment provider not selected |
| Sponsor | Existing eligible sponsor resolved by member ID; Level Plan 1:10, not binary | Lookup requires ACTIVE + verified mobile, conservative minimal technical gate; final eligibility and referral policy needs owner approval |
| Registration accounts | Member, Business, Expert, Organizer, Advertiser offered | `requestedRole` never confers permissions; admin/moderator never public signup options |
| Rank | Ten rank names / targets from client, no income promise | Rank and active-member eligibility not enabled in this module |
| Payments | No commission formula/payout rates approved | No wallet, ledger or payout implemented |
| Privacy | Versioned consent and anti-abuse expected | Production consent text/version, retention and communication policy pending |
| Mobile OTP | Provider verification before account activation | BLOCKED; no provider configured, no fabricated OTP success |

Do not mistake an integration fixture or UI label for an approved production identity or business policy.
