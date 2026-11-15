# 03 Needs list

Status: done (merged into `main`). Plain-HTTP copy fallback to be rechecked on the NAS in milestone 05.

## Goal
Show what the family needs for the planned meals, as one plain list.

## Scope
- Pure function in `src/lib/core/`: from a schedule and the dishes to a list of ingredient names.
  - Match fixed, planned and manual meal names to dishes by exact name. Unmatched names add nothing.
  - Merge by normalized name: trim, collapse whitespace, lowercase (locale `de-CH`). Show the first-seen spelling.
  - Sort alphabetically with `de-CH` collation.
- The list is derived from the current schedule. It updates whenever the plan changes. No ticking, no removing, no manual extras, no state.
- Needs list view: below the plan on small screens, in the side column above the dishes on wide screens. Empty state when no planned meal has ingredients.
- "Copy as text" button: one ingredient per line. Tries `navigator.clipboard`, then `document.execCommand('copy')`, then shows a pre-selected text box.
- All strings in `de-CH.ts`.

## Out of scope
- Ticking items, per-item state, manual extras.
- Amounts, units. Aisle grouping is dropped entirely (see SPEC).
- Print styles (milestone 04).
- Fridge tracking.

## Acceptance criteria
- [x] An ingredient used in several meals appears once. Case and whitespace differences are merged. (Unit test.)
- [x] Pinned meals contribute their ingredients. (Unit test.)
- [x] Free-text meals (no matching dish) add nothing and cause no error. (Unit test.)
- [x] Dishes without `ingredients` add nothing. (Unit test.)
- [x] Changing the plan changes the list. (Unit test; the page derives the list from the plan.)
- [x] "Copy as text" puts the list on the clipboard, or shows the selected text box. (Checked manually on localhost. The plain-HTTP fallback path is untested: the test phone could not reach the dev PC. Skipped by decision; recheck on the NAS in milestone 05.)
- [x] Unit tests cover normalization, merging, unmatched names, missing ingredients.
- [x] `check`, `lint`, `test`, `build` pass.

## Assumptions
- Normalization is only trim, whitespace and case. Near-duplicates like "Zwiebel" and "Zwiebeln" are not merged. The owner cleans the data.
- `navigator.clipboard` exists only in secure contexts (HTTPS, localhost). On the NAS over plain HTTP no browser offers it, so the deprecated `execCommand('copy')` is tried next, then the text box.
