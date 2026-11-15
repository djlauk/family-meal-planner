# 01 Foundation and planner

Status: done (merged into `main`).

## Goal
A tested project skeleton with validated sample data and a working planner, shuffle and schedule helpers. No real UI yet. Everything later builds on this.

## Scope

### Project setup
- SvelteKit project with `adapter-static`, TypeScript strict, Svelte 5 runes. Prerendering on.
- `<html lang="de-CH">` in `src/app.html`.
- npm scripts as listed in `CLAUDE.md`.
- Tooling: Vitest, ESLint (Svelte and TypeScript support), Prettier (Svelte plugin), `svelte-check`. All cross-platform.
- Folder layout as in `CLAUDE.md`.
- `.gitignore`, `.editorconfig`, `README.md` (name `family-meal-planner`, short description, how to install, run, test and build).

### Theming and strings
- Global CSS with custom properties for colors, spacing, radius, font sizes.
- Light and dark values via `@media (prefers-color-scheme: dark)`. System font stack. Mobile-first reset.
- `src/lib/i18n/de-CH.ts`: UI strings for this milestone (page title, weekday names, section headings).

### Types, schemas, loader
- Types as in `docs/SPEC.md` (data model). `weekdays` constant in fixed order.
- Zod schemas for family, dish, meal, schedule, data set. Types inferred from them where that stays readable.
- Validation beyond shape: ids in `nogos` and `absences` exist in `family`, unique family ids, unique dish names, all seven weekdays per template.
- Loader in `src/lib/data/`: imports the JSON, validates, returns typed data. Errors name the file and the problem.
- Sample data in `src/data/` (fictional, German de-CH):
  - `family.json`: 3-4 people.
  - `dishes.json`: about 12-15 dishes with plain ingredient lists. Some with `nogos`, some without, at least one with several `nogos`.
  - `templates.json`: at least two templates. One has a pinned meal (a pizza day), several `auto` cells with `absences`, and days with different meal counts.

### Planner and helpers (`src/lib/core/`)
- `planMeals(dishes, schedule)`: as specified in the SPEC. Drops dishes named in `planned` meals first, uses fixed weekday order, leaves unfillable cells `auto`.
- Acceptance rule as a small named function (`isDishAcceptable` or similar), not inlined.
- `clearCell`: restores the template's `AutoMeal` for a cell that was `auto` in the template.
- `overrideCell`: sets a cell to `planned` with a given dish name. No checks.
- Inclusion helpers: filter dishes by a set of excluded names. Clearing a suggestion adds that dish to the excluded set.
- Seeded shuffle: pure, same seed gives the same order. A small, well-known PRNG is enough (e.g. mulberry32 with Fisher-Yates). No new dependency.
- Exact function names and signatures are decided in the plan. Keep all of it pure and immutable.

### Bare data view
- One page that lists family, dishes (with ingredients and `nogos`) and the templates as simple 7-day lists. Read-only. Works in light and dark.
- Only to prove the data loads and renders. It is replaced in milestone 02.

### Tests
- Schema and loader: valid sample data passes. Broken data fails with the expected message (unknown person id in `nogos`, duplicate dish name, missing weekday, wrong type).
- Planner:
  - Same input gives the same output.
  - A dish with `nogos` lands only where all those people are absent.
  - A dish with `nogos` is never placed in a cell without `absences`.
  - Dishes named in `planned` meals are never suggested elsewhere.
  - No dish is used twice.
  - `planned` cells are unchanged. Input is not mutated.
  - If nothing fits, the cell stays `auto`.
  - Weekday order is fixed, regardless of key order in the input.
- Helpers: `clearCell` restores `absences`. `overrideCell` ignores `nogos`. Exclusion filtering works.
- Shuffle: same seed same order, different seeds usually differ, input not mutated, all items kept.

## Out of scope
- The real plan view, template picker, run button, dish toggles.
- Needs list, print styles.
- Theme toggle.
- Deployment.

## Acceptance criteria
- [x] `npm run check`, `lint`, `test` and `build` pass.
- [x] The static build opens from a plain static file server and shows the data view.
- [x] Switching the OS between light and dark changes the theme with no code change. (Checked manually.)
- [x] The page language is `de-CH`. All visible strings come from `de-CH.ts`. (Data values such as dish and template names come from the JSON.)
- [x] Breaking a sample JSON file (e.g. unknown person id) fails loading with a message that names the file.
- [x] The planner tests above all pass.
- [x] No network requests at runtime. No browser storage used. (SvelteKit's internal scroll-position `sessionStorage` is accepted; see SPEC.)
- [x] `README.md` explains install, run, test and build.

## Assumptions
- Zod is the validation library. Confirm in the plan or propose an alternative with reasons.
- JSON is imported at build time through Vite. No runtime fetching.
- The data model in the SPEC is final for this milestone. If a change is needed, ask and update the SPEC.
- The `label` field is included in the types and validated, but only displayed in milestone 02.
- Sample data is illustrative. The owner replaces it with real data later.
