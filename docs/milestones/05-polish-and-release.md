# 05 Polish and release

Status: done (branch `feature/05-polish-and-release`, awaiting merge). Release 1.0.0.

## Goal
Make the app comfortable on a phone or tablet and ready to host on the home NAS.

## Scope
- Mobile layout pass: 44 px touch targets on touch screens, readable week view on small screens.
- Accessibility pass: keyboard navigation, visible focus, labels, colour contrast in light and dark (WCAG AA, checked by a unit test that reads `app.css`).
  - Fix: the override dropdown now keeps the manual choice, so arrow keys step through dishes instead of jumping back to the top.
- Empty and error states: "Keine Mahlzeiten" for empty days; the Run message covers unfillable cells; broken data fails the build with a file/path message (explained in the README).
- Theme toggle: dropped (see SPEC, rejected alternatives).
- Real data in the git-ignored `src/data-local/`; the loader prefers it over the sample data.
- Static build verified from a plain web server at the root and under a sub-path. No base-path setting needed: paths are relative.
- NAS deployment notes and an after-deploy checklist in `README.md`.
- README completed: purpose, usage, data file formats, editing, errors, all commands.
- `npm audit` and dependency review.
- Version 1.0.0.

## Out of scope
- PWA, service worker, offline install (needs HTTPS).
- Persistence.
- New features. Ideas go to "Deferred" in `docs/SPEC.md`.

## Acceptance criteria
- [x] Usable on a phone-sized screen without horizontal scrolling. (Checked manually, single column.)
- [x] The main flows (run, clear, override, toggle dishes, print) work with the keyboard only. (Checked manually.)
- [x] The build runs from a static server at the root and under a sub-path. (Checked with a plain Node server: `/` and `/essen/`, all 13 files 200; `/essen` redirects to `/essen/`.)
- [x] A new reader can edit the data files and deploy using only the README. (Owner read-through.)
- [x] `check`, `lint`, `test`, `build` pass.
- [x] Real data cannot be committed by accident (`src/data-local/` is git-ignored; checked with `git status --ignored`).
- [x] Text contrast meets WCAG AA in light and dark. (Unit test.)

## Dependency review (2026-11-15)
- All packages on the latest version within their ranges. TypeScript 7 (major) not adopted: waits for typescript-eslint and svelte-check support.
- `npm audit`: 11 findings (4 low, 7 moderate) from two transitive packages, neither in the shipped build:
  - `deepmerge` 4.3.1 (prototype poisoning, low) via `@sveltejs/vite-plugin-svelte`, build time only, trusted input.
  - `minimatch` 10.2.6 (ReDoS, moderate) via `typescript-eslint`, lint time only.
  - npm's suggested fixes are downgrades to ancient majors; not applied. Recheck when typescript-eslint updates.

## Carried over
- Plain-HTTP copy fallback (milestone 03): to verify on the real NAS, see the README checklist.

## Assumptions
- The NAS can serve static files. Product and setup are the owner's task.
- Real family data is added by the owner in `src/data-local/` and is not committed.
