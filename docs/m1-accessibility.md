# M1 accessibility verification

**Status:** Automated component checks and core manual browser pass completed

## Automated coverage

The primary poll forms are scanned with `axe-core` in Vitest:

- Create Poll form
- Public Poll Voting form

Component scans disable `color-contrast` because the DOM test environment cannot calculate rendered colors. They also disable `region` because isolated component tests do not render the application layout landmarks. Both concerns remain part of the browser checklist below.

The tests also assert form-specific behavior including accessible labels, pressed state for quick-time controls, signed-in participant prefill, announced success and error states, and visible pending feedback.

## Manual keyboard and screen-reader pass

Run this checklist in English and one non-default locale at desktop and mobile widths.

### Dashboard and navigation

- [ ] Tab reaches the mobile menu trigger at narrow widths and its focus indicator is visible.
- [ ] Enter or Space opens the navigation drawer; Escape closes it and returns focus appropriately.
- [ ] Every sidebar destination is keyboard reachable and the current page is announced.

### Create Poll

- [ ] Heading order describes the page and the contextual guidance panel logically.
- [ ] Tab order follows title, description, date, quick times, custom time, add button, selected-time removal buttons, and submit.
- [ ] Space toggles each quick time and its pressed state is announced.
- [ ] Selected times can be removed without a pointer.
- [ ] Validation errors are perceivable and focus remains in a useful location.
- [ ] Text, controls, focus rings, and selected states meet contrast expectations in light and dark themes.

### Public Poll Voting

- [ ] Name and email fields have announced labels.
- [ ] Every candidate time and Yes/If Needed/No choice is understandable without visual position alone.
- [ ] Submission pending, success, and failure states are announced once.
- [ ] The sticky submission control does not obscure focused content at narrow heights.

## Completion record

| Item | Result |
| --- | --- |
| Date | 2026-09-07 |
| Browser and operating system | Microsoft Edge on Windows |
| Screen reader | Windows Narrator |
| Locales exercised | English and Spanish |
| Keyboard and screen-reader result | Core navigation and Create Poll interaction worked without an identified blocker. Tabbing from navigation correctly moved to the first interactive form control; headings remained available through Narrator browse/heading navigation. |
| Automated result | Create Poll and Public Poll Voting axe component scans passed. |
| Limitations | Spanish translation quality was not assessed because the tester does not speak Spanish. Exact desktop/mobile viewport sizes and a separate measured contrast result were not recorded. |

The M1 requirement for automated primary-form coverage and a documented manual keyboard/screen-reader pass is satisfied. Re-run this checklist after material navigation, form-control, theme, or layout changes.
