# 02 Plan view

Status: in review (branch `feature/02-plan-view`). Open: manual browser check.

## Goal
Use the planner interactively. Pick a template, run it, discard suggestions, override cells, control which dishes take part.

## Scope
- Replace the bare data view with the plan view: a week grid, one card per day, meals in order. Shows `label` when present.
- Template picker. Switching resets the plan and keeps the dish toggles.
- State in memory (Svelte 5 runes): the template name, the current plan, the set of excluded dishes. A reload resets everything.
- **Run** button: creates a seed in the UI layer, shuffles the included dishes, calls the planner on the current plan. If cells stay empty, one message names the count.
- Cell states: fixed (from template, not editable), auto (free, absences visible), planned (filled by a run), manual (set by hand).
- **Clear** on planned and manual cells: restores the template cell. Clearing a planned cell also excludes its dish.
- **Override** on every non-fixed cell: pick any dish from the list. No warning, no checks, duplicates allowed. The cell becomes manual.
- **Dish list** with an "include in planning" toggle per dish and an "enable all" button. Excluded dishes are marked. Toggles only affect the next run.
- All strings in `de-CH.ts`. Mobile-friendly layout.

## Out of scope
- Needs list, print styles.
- Persistence of any kind.
- Editing templates or dishes in the UI.
- Theme toggle.

## Acceptance criteria
- [x] Run fills the free cells. Running again fills only cells that are still `auto`. (Unit test.)
- [x] Clearing a suggestion restores the cell and excludes that dish from the next run. Clearing a manual cell does not exclude. (Unit tests.)
- [x] Overriding sets any dish, including ones whose `nogos` are not absent, and duplicates. (Unit test.)
- [x] Excluded dishes never appear in runs. "Enable all" re-includes them. (Unit tests.)
- [x] If cells stay without a fitting dish, a message after the run names the count. (Unit test for the count; message in the page.)
- [x] Fixed template cells cannot be edited. (Unit test; no controls rendered.)
- [x] A reload returns to the initial state. (No storage used; state only in component variables.)
- [x] `check`, `lint`, `test`, `build` pass. Any new pure state logic has unit tests.
- [ ] Manual check in the browser: the flows above, mobile width, light and dark.

## Assumptions
- The state logic is in `core/` as pure functions. Components only call them.
- The seed comes from the UI layer, not from `core/`.
