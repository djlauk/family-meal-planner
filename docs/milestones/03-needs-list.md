# 03 Needs list

Status: not started (sketch)

## Goal
Show what the family needs for the planned meals, as one plain list.

## Scope
- Pure function in `src/lib/core/`: from a schedule and the dishes to a list of ingredient names.
  - Match planned meal names to dishes by exact name. Unmatched names add nothing.
  - Merge by normalized name: trim, collapse whitespace, lowercase (locale `de-CH`). Show the first-seen spelling.
  - Sort alphabetically with `de-CH` collation (draft).
- The list is derived from the current schedule. It updates whenever the plan changes. No ticking, no removing, no manual extras, no state.
- Needs list view next to or below the plan. Empty state when nothing is planned.
- "Copy as text" button: one ingredient per line, to the clipboard (draft).
- All strings in `de-CH.ts`.

## Out of scope
- Ticking items, per-item state, manual extras.
- Amounts, units, aisle grouping.
- Print styles (milestone 04).
- Fridge tracking.

## Acceptance criteria (draft)
- [ ] An ingredient used in several meals appears once. Case and whitespace differences are merged.
- [ ] Pinned meals contribute their ingredients.
- [ ] Free-text meals (no matching dish) add nothing and cause no error.
- [ ] Dishes without `ingredients` add nothing.
- [ ] Changing the plan changes the list.
- [ ] "Copy as text" puts the list on the clipboard.
- [ ] Unit tests cover normalization, merging, unmatched names, missing ingredients.
- [ ] `check`, `lint`, `test`, `build` pass.

## Assumptions
- Normalization is only trim, whitespace and case. Near-duplicates like "Zwiebel" and "Zwiebeln" are not merged. The owner cleans the data.
- Clipboard access works on the NAS over plain HTTP only in some browsers. If it does not, show the text in a selectable box as a fallback.
