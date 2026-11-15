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
- **SvelteKit with `adapter-static`, Svelte 5 runes, TypeScript strict, plain CSS3 with variables.** Light and dark mode from the start via `prefers-color-scheme`.
- **Pure logic in `src/lib/core/`.** Testable and deterministic.
- **Data in the repo as plain JSON** (`src/data/`): `family.json`, `dishes.json`, `templates.json` (draft file names). Imported at build time.

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
  label?: string; // display only, e.g. "Mittag" (draft)
  absences?: string[]; // family member ids who are not at this meal
};

type PlannedMeal = {
  type: "planned";
  label?: string; // draft
  name: string; // dish name or free text, e.g. "Restaurant"
};

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
- Errors name the file and the problem. The app fails loudly instead of running on bad data.

### Planner
Pure, deterministic, greedy. No randomness, no clock.
- Input: dishes (already filtered and shuffled by the caller), a schedule. Output: a new schedule.
- First, remove every dish whose name appears in a `planned` meal anywhere in the schedule. This stops e.g. the pinned Thursday pizza from being suggested on Monday.
- Fill order: weekdays in fixed order, then meals in list order. Only `auto` cells are filled.
- A dish is acceptable for a cell if `nogos` is missing or empty, or if every person in `nogos` is in the cell's `absences`.
- Take the first acceptable dish in the list. Remove it from the pool. The cell becomes `planned` with the dish name.
- `planned` cells are untouched.
- If no dish is acceptable, the cell stays `auto`. The UI shows "no suggestion". No repeats, no fallback.

### Shuffle
- A seeded shuffle reorders the dishes before each run. Same seed, same order.
- The UI layer creates the seed. The shuffle itself is pure.

### UI behavior
All state is in memory. A reload resets it.
- The user picks a template. The UI keeps the template unchanged and a current schedule.
- **Run:** shuffle the dishes that are included in planning, then fill the cells that are still `auto`. Filled and overridden cells stay.
- **Suggestion cells:** a cell that was `auto` in the template and is now `planned` can be cleared. Clearing restores the template's `AutoMeal` (with its `absences`) and sets that dish to "excluded".
- **Override:** the user picks any dish from the list for such a cell. The cell becomes `planned`. No `nogos` or `absences` check, no warning. Overrides are deliberate choices.
- **Fixed cells:** cells that are `planned` in the template are not editable (draft).
- **Dish list:** each dish has an "include in planning" toggle. Excluded dishes are left out of runs. An "enable all" button re-includes everything. Overrides may pick excluded dishes.
- Switching template resets the schedule and keeps the toggles (draft).

### Needs list
- The ingredients of all planned meals, matched to dishes by exact name. Unmatched names (free text) add nothing.
- Merged by normalized name: trim, collapse whitespace, lowercase (locale `de-CH`). Show the first-seen spelling.
- A derived, read-only list. It always reflects the current schedule. No ticking, no per-item state.
- The real shopping list is made out of band (paper, other tools). "Copy as text" is the digital way out (draft).

### Print
- `@media print` styles, no separate route. Prints the meal plan and the ingredient list.
- Light colors regardless of theme. Each ingredient gets an empty checkbox square for ticking on paper.

### Security and privacy
- No network requests, no secrets, no analytics, system font stack.
- First names or nicknames only. The sample data uses fictional names. Real data is added by the owner at deployment and is not committed.

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
- **Public hosting:** would expose names and schedules.
- **ADR folder, i18n library:** this SPEC records decisions. One language needs only a strings module.

## Deferred
- Dish and meal kinds (breakfast, lunch, dinner, snack).
- Star ratings.
- Persistence, export/import.
- Amounts and portion scaling.
- Fridge tracking.
- Aisle grouping of the list.
- PWA (needs HTTPS), multi-device sync.
- Template editor in the UI.
- Calendar integration.
- LLM suggestions.
- Repeat fallback when the pool is empty.

## Open items (draft)
- Zod as the validation library.
- The optional `label` field.
- "Copy as text" in the needs list.
- Fixed template cells not editable. Switching templates keeps the toggles.
- Manual theme toggle (would reset on reload, since nothing is persisted).
