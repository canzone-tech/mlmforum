# Design system: client-source-aligned

Source references are the client's `styles.css`, `login.html` and module-specific screenshots; the target is the real MLM Community Forum.

- **Tokens:** navy `#071b49`, blue `#123f82`, pink `#d84b91`, muted `#68758d`, borders `#dfe6f1`.
- **Layout:** 1100px max authentication container, balanced desktop columns, stacked under 620px.
- **Reusable visuals:** client logo/wordmark, login/register tabs, labeled fields, sponsor name read-only control, keyboard focus and accessible feedback.
- **States:** native input constraints plus API errors, pending submits, sponsor verification and account verification status.
- **Authentication:** role dropdown and preset credentials are **not** part of the real login UI. Roles must be server-authorized; sponsor records must be resolved from the MySQL-backed API.
- **Image:** the client reference uses an external Unsplash photo. Replace with approved licensed asset before release.
- **Testing:** compare responsive screenshots for each implementation module; browser interaction tests are separate from full production UAT.

Keep styles module-focused. Do not import the entire prototype stylesheet or implement unstarted modules.
