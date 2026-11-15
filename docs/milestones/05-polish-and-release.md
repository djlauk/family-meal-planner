# 05 Polish and release

Status: not started (sketch)

## Goal
Make the app comfortable on a phone or tablet and ready to host on the home NAS.

## Scope
- Mobile layout pass: touch-friendly targets, readable week view on small screens.
- Accessibility pass: keyboard navigation, visible focus, labels, color contrast in light and dark.
- Review of empty and error states: no suggestion, empty template, broken data at load.
- Manual theme toggle: light, dark, system (draft). It cannot be remembered, since nothing is persisted. Reconsider whether it is worth having.
- Static build verified from a plain web server at the root and under a sub-path (configurable base path).
- NAS deployment notes in `README.md`: copy the build output to the web server, plain HTTP, home network only.
- README completed: purpose, data file formats, how to edit family, dishes and templates, all commands.
- `npm audit` and dependency review.

## Out of scope
- PWA, service worker, offline install (needs HTTPS).
- Persistence.
- New features. Ideas go to "Deferred" in `docs/SPEC.md`.

## Acceptance criteria (draft)
- [ ] Usable on a phone-sized screen without horizontal scrolling.
- [ ] The main flows (run, clear, override, toggle dishes, print) work with the keyboard only.
- [ ] The build runs from a static server at the root and under a sub-path.
- [ ] A new reader can edit the data files and deploy using only the README.
- [ ] `check`, `lint`, `test`, `build` pass.

## Assumptions
- The NAS can serve static files. Product and setup are the owner's task.
- Real family data is added by the owner at deployment and is not committed.
