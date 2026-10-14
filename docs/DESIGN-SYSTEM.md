# Design system (client reference)

Source of truth: client's `styles.css` and module screenshots, not generic redesign.
The first converted module is `login.html`.

- **Tokens:** navy `#071b49`, blue `#123f82`, pink `#d84b91`, muted `#68758d`, borders `#dfe6f1`.
- **Layout:** 1100px max auth container, two balanced columns on desktop; vertical layout at 620px and below.
- **Elements:** original brand mark, tab styling, demo role selector, credential grid, focus-visible outline.
- **Typography:** Inter/Arial fallback; preserve original label and helper-text hierarchy.
- **States:** native required/form validation, live sponsor feedback, demo-only confirmation/error text.
- **Assets:** use the original source teamwork image URL; remote availability can vary.
- **Accessibility:** tab roles and selected state, associated labels, live messages, keyboard focus, no horizontal overflow.

Do not import the entire original stylesheet into global Next CSS: its unrelated page rules would introduce accidental cross-module coupling. Port only the classes required by each approved module and preserve the source design.
