# Business rules register

The product is a real MLM Community Forum. Client-supplied HTML/JS shows screen design and desired workflows but does NOT establish safe production authentication rules. Source: `APPROVED_RANK_AND_LEVEL_PLAN_RULES.md`, `LEVEL_PLAN_1_10_AND_CONTENT_REQUIREMENTS.md`, `MOBILE_NAV_AND_REGISTRATION_AUDIT.md`, `RBAC_PERMISSION_MATRIX.md`.

| Area | Source requirement | Production status |
| --- | --- | --- |
| Registration | Free signup; full name, email, Indian mobile, Sponsor ID and name, account type and interest | Frontend fields mapped; secure activation/OTP provider and password enrollment need approval |
| Login | Email/password login | API integration missing; only server can authenticate and determine roles |
| Roles | Member, Business Partner, Expert / Author, Event Organizer, Advertiser, Moderator, Administrator | Non-privileged applicants may request an account type; **never grant permissions from browser-submitted values**. Server-issued RBAC needed |
| Sponsor | Level Plan 1:10, sponsor lookup and join verification | MySQL sponsor ID uniqueness, privacy-safe lookup, network limits and sponsor-change policy pending |
| Rank | Source has 10 ranks and targets | Eligibility/effective dates pending approved decision |
| Income and wallet | Source illustrates financial workflows | No commission or payout operations until approved ledger, provider UAT and recovery |
| Community | Discussions, publishing, moderation and admin queues | Real persisted CRUD, abuse protection, permissions and audit pending |

No sample members, passwords, sponsor IDs, rates or balances may be used as real records. Owner approvals must be recorded here before enabling consequential behavior.
