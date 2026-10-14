# UAT checklist

## Login/Register first milestone (client prototype parity)
- [ ] Desktop 1440px visual match vs client login screenshot
- [ ] Mobile widths 390px and 320px: stacked columns, readable header, no horizontal overflow
- [ ] Tabs switch with mouse and keyboard; `?tab=register` opens registration
- [ ] Each of seven demo-role buttons fills matching email/password and role
- [ ] Wrong password and mismatched role/email display errors
- [ ] Valid demo credentials reach **demo preview only** (not secure dashboard)
- [ ] Registration requires full name, email, 10-digit Indian mobile, sponsor ID, consent
- [ ] Known sponsor IDs MLM-1001 to MLM-1010 show expected name, unknown ones rejected
- [ ] Demo registration never creates live account or sends OTP
- [ ] Real user authentication, approval policies, OTP and dashboards remain out of scope
- [ ] Compiled production Next server boots and serves `/`, `/login`, `/demo`
- [ ] Browser visual UAT run independently; CI/build alone does not close visual items

No production UAT is implied by passing prototype-only tests.
