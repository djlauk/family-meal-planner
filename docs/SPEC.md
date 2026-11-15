# SPEC: family-meal-planner

Self-contained. Read it fully before planning any work.

## Goal
Fill the free cells of a weekly meal schedule with dishes that suit who is home. Then list the ingredients needed.

- The family keeps weekly templates: fixed meals (e.g. Thursday pizza) and free cells.
- Each free cell can name people who are absent (school, work). Dishes some person dislikes are scheduled only when that person is absent. This allows more variety for everyone else.
- The user can discard suggestions, override cells by hand, and print the plan and the ingredient list.

## Users and environment
- One family, one operator or one shared device. No accounts.
- Developer: Windows, knows Python well, TypeScript and Svelte less. Greenfield project.
- Static files. No network needed at runtime. Hosted later on the home NAS over plain HTTP, home network only.
- UI language: German (de-CH). Everything else: English.

## Decisions

### Architecture
- **Static app, no backend, no persistence.** The app starts fresh on every load. Reason: one device, no user management, data is edited by hand in JSON.
  - Exception (accepted): SvelteKit's client router writes scroll positions to `sessionStorage`. This is framework-internal; the app itself reads and writes no browser storage and keeps no app state there.
- **SvelteKit with `adapter-static`, Svelte 5 runes, TypeScript strict, plain CSS3 with variables.** Light and dark mode from the start via `prefers-color-scheme`.
- **Pure logic in `src/lib/core/`.** Testable and deterministic.
- **Data in the repo as plain JSON** (`src/data/`): `family.json` (array), `dishes.json` (array), `templates.json` (object keyed by template name). Imported at build time. One file per part, so errors can name the file.
  - Real data goes into `src/data-local/` (same three files, git-ignored). If that folder holds any data file, it must hold all three and is used instead of the sample data in `src/data/`. Errors then name the folder, e.g. `src/data-local/dishes.json: …`.
- **SvelteKit 3:** config lives in `vite.config.ts` (`sveltekit({ adapter })`). `$lib` is gone; imports use the Node subpath alias `#lib/*` from `package.json`, with explicit `.ts` extensions.

### Data model
```typescript
type FamilyMember = { id: string; name: string };
type Family = FamilyMember[];

type Dish = {
  name: string;
  ingredients?: string[];
  nogos?: string[]; // family member ids: dislikes, allergies, anything else
};

type AutoMeal = {
  type: "auto";
  label?: string; // display only, e.g. "Mittag"
  absences?: string[]; // family member ids who are not at this meal
};

type PlannedMeal = {
  type: "planned";
  label?: string;
  name: string; // dish name or free text, e.g. "Restaurant"
};

// Runtime only, never in JSON: a cell the user set by hand.
type ManualMeal = { type: "manual"; label?: string; name: string };
type PlanMeal = Meal | ManualMeal;
type Plan = Record<Weekday, PlanMeal[]>; // the working copy of a template

type Meal = AutoMeal | PlannedMeal;

type Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
type Schedule = Record<Weekday, Meal[]>;

type FullDataSet = {
  family: Family;
  dishes: Dish[];
  templates: Record<string, Schedule>; // named, e.g. "school week", "holidays"
};
```
- A fixed `weekdays` array defines day order (Monday first). Never rely on object key order.
- Each day holds an ordered list of meals. Different days may have different numbers of meals.
- A cell is identified by weekday and index.

### Validation at load
- Every id in `nogos` and `absences` exists in `family`. Family ids are unique.
- Dish names are unique.
- Planned meal names are free text. They need not match a dish.
- Each template defines all seven weekdays.
- No duplicate ids within one `nogos` or `absences` list. Names and ids must not be blank.
- Unknown keys are rejected (Zod strict objects), so a typo like `absent` fails instead of being ignored.
- Errors name the file and the problem. The app fails loudly instead of running on bad data.
- Message format (English, for the developer): `<file>: <path>: <problem>`, e.g. `templates.json: Schulwoche.friday[1].absences[0]: unknown family id "zoe"`. All problems of the first failing file are listed.
- Validation runs during prerendering, so bad data fails `npm run build` and shows the error overlay in `npm run dev`.
- Library: Zod 4. Schemas are the single source of the TypeScript types (`z.infer`).
- Template keys are display names and are shown as-is.

### Planner
Pure, deterministic, greedy. No randomness, no clock.
- Input: dishes (already filtered and shuffled by the caller), a schedule. Output: a new schedule and the number of cells left unfilled.
- First, remove every dish whose name appears in a `planned` or `manual` meal anywhere in the schedule. This stops e.g. the pinned Thursday pizza from being suggested on Monday.
- Fill order: weekdays in fixed order, then meals in list order. Only `auto` cells are filled.
- A dish is acceptable for a cell if `nogos` is missing or empty, or if every person in `nogos` is in the cell's `absences`.
- Take the first acceptable dish in the list. Remove it from the pool. The cell becomes `planned` with the dish name. Its `label` is kept.
- `planned` and `manual` cells are untouched.
- If no dish is acceptable, the cell stays `auto` and is counted. After a run the UI shows one message with that count. No repeats, no fallback.

### Shuffle
- A seeded shuffle reorders the dishes before each run. Same seed, same order.
- The UI layer creates the seed. The shuffle itself is pure.

### UI behavior
All state is in memory. A reload resets it. State: the selected template name, the current plan, the set of excluded dish names.
- The user picks a template (default: the first in `templates.json`). The template stays unchanged; the plan starts as a copy of it.
- **Cell states:**
  - **fixed:** `planned` in the template. Not editable at all.
  - **auto:** free. Shows its absences. Can be overridden.
  - **planned:** filled by a run. Can be cleared or overridden.
  - **manual:** set by hand. Can be cleared or overridden.
- **Run:** shuffle the included dishes with a seed from the UI, then fill the cells that are still `auto`. Planned and manual cells stay. If cells stay empty, one message names the count.
- **Clear:** restores the template's `AutoMeal` (with its `absences`). Clearing a `planned` cell also excludes its dish. Clearing a `manual` cell does not.
- **Override:** on any non-fixed cell, the user picks any dish from the full list (sorted, excluded dishes marked). The cell becomes `manual`. No `nogos`, `absences` or duplicate check, no warning. Overrides are deliberate choices.
- **Dish list:** each dish has an "include in planning" toggle. Toggles only affect the next run; cells already filled stay. An "enable all" button re-includes everything.
- Switching template resets the plan and keeps the toggles.
- **Reset:** returns the plan to the selected template. Toggles are kept.
- Labels are shown when present.

### Needs list
- The ingredients of all planned, manual and fixed meals, matched to dishes by exact name. Unmatched names (free text) add nothing.
- Merged by normalized name: trim, collapse whitespace, lowercase (locale `de-CH`). Show the first-seen spelling (trimmed, whitespace collapsed). "First seen" follows weekday order, then meal order, then ingredient order.
- Sorted alphabetically with `de-CH` collation. No grouping.
- A dish used in several cells adds its ingredients once.
- A derived, read-only list. It always reflects the current schedule. No ticking, no per-item state.
- The real shopping list is made out of band (paper, other tools). "Copy as text" is the digital way out: one ingredient per line.
  - Copy order: `navigator.clipboard` (only on HTTPS or localhost), then `document.execCommand('copy')` (deprecated, but works on plain HTTP), then a read-only text box with the list pre-selected for manual copying.

### Print
- `@media print` styles, no separate route. Prints the meal plan and the ingredient list.
- A "Drucken" button calls `window.print()`. A4 portrait, 15 mm margins.
- A dedicated print-only component renders the sheet; the whole screen UI is hidden in print.
- Heading: "Wochenplan – <template name>". No date line.
- Plan: one heading per weekday, then each meal on its own line ("Label: Gericht"). One 5-column grid (label | dish | gap | label | dish). Days paired into row blocks: Monday | Friday, Tuesday | Saturday, Wednesday | Sunday, Thursday | empty. Each block: a heading row, then as many rows as the longer day; the shorter side stays empty. Rows come from the pure `printRows` helper. Unfilled `auto` cells print empty (a blank line). Absences are not printed.
- Ingredient list in three columns. Each item gets an empty checkbox square, drawn with CSS.
- No page breaks inside a day or an item. If the list does not fit below the plan, it starts on a new page.
- Black on white regardless of theme, no backgrounds.

### Security and privacy
- No network requests, no secrets, no analytics, system font stack.
- First names or nicknames only. The sample data uses fictional names. Real data lives in the git-ignored `src/data-local/` and is never committed.

### Testing
- Vitest unit tests for pure logic: planner, shuffle, schedule helpers, needs list, validation.
- Static checks: `svelte-check`, ESLint, Prettier.
- No component or e2e tests. The print layout is checked manually in the browser's print preview.

### Documentation
- `README.md`, this SPEC, milestone files. Nothing else.

## Non-goals
- Accounts, login, permissions.
- Any persistence or sync.
- Fridge and pantry tracking.
- Ingredient amounts, units, nutrition, cost.
- Recipe instructions.
- Shop integration, online ordering.
- Multiple UI languages.

## Rejected alternatives
- **Django + HTMX, FastAPI + Jinja, FastAPI + React, Next.js:** no backend needed. SvelteKit was chosen.
- **Hosted backend-as-a-service:** third-party dependency, family data in someone else's cloud.
- **LLM-based planning:** nondeterministic, hard to test, family data goes to a third party.
- **Randomness inside the planner:** it stays pure. Shuffle happens outside.
- **localStorage, export/import, per-week overrides:** the app starts fresh on purpose.
- **Star ratings:** `nogos` covers dislikes. Ratings are deferred.
- **Slot catalogs, attendance table, ingredient registry, amounts:** more data entry than the problem needs.
- **Ticking items in the app:** done on paper or in other tools.
- **Aisle grouping of the needs list:** dropped. An alphabetical list is enough.
- **Manual theme toggle:** dropped. It would reset on every reload (nothing is persisted), and the OS setting via `prefers-color-scheme` already works.
- **Public hosting:** would expose names and schedules.
- **ADR folder, i18n library:** this SPEC records decisions. One language needs only a strings module.

## Deferred
- Dish and meal kinds (breakfast, lunch, dinner, snack).
- Star ratings.
- Persistence, export/import.
- Amounts and portion scaling.
- Fridge tracking.
- PWA (needs HTTPS), multi-device sync.
- Template editor in the UI.
- Calendar integration.
- LLM suggestions.
- Repeat fallback when the pool is empty.

## Open items
None.

## Release
- 1.0.0: milestones 01–05. Hosting: static files on the home NAS, plain HTTP, home network only. Paths are relative, so the app works at the web root or in any sub-folder (URL with trailing slash).
- Accessibility baseline: native controls only, visible focus, 44 px touch targets on touch screens, WCAG AA text contrast in both themes (checked by `src/theme.test.ts`).
