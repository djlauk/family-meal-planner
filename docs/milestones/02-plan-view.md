# 02 Plan view

Status: not started (sketch)

## Goal
Use the planner interactively. Pick a template, run it, discard suggestions, override cells, control which dishes take part.

## Scope
- Replace the bare data view with the plan view: a week grid, one row or card per day, meals in order. Shows `label` when present.
- Template picker. Switching resets the schedule and keeps the dish toggles (draft).
- State in memory (Svelte 5 runes): the template, the current schedule, the set of excluded dishes. A reload resets everything.
- **Run** button: creates a seed in the UI layer, shuffles the included dishes, calls the planner on the current schedule.
- Cell states: filled (suggestion), manual, fixed (from template), "no suggestion" (still `auto`). Absences are visible on auto cells.
- **Clear** on suggestion cells: restores the template cell and excludes the dish.
- **Override** on editable cells: pick any dish from the list. No warning, no checks. Cells that are `planned` in the template are not editable (draft).
- **Dish list** with an "include in planning" toggle per dish and an "enable all" button. Excluded dishes are marked.
- All strings in `de-CH.ts`. Mobile-friendly layout.

## Out of scope
- Needs list, print styles.
- Persistence of any kind.
- Editing templates or dishes in the UI.
- Theme toggle.

## Acceptance criteria (draft)
- [ ] Run fills the free cells. Running again fills only cells that are still `auto`.
- [ ] Clearing a suggestion restores the cell and excludes that dish from the next run.
- [ ] Overriding sets any dish, including ones whose `nogos` are not absent.
- [ ] Excluded dishes never appear in runs. "Enable all" re-includes them.
- [ ] Cells without a fitting dish show "no suggestion".
- [ ] A reload returns to the initial state.
- [ ] `check`, `lint`, `test`, `build` pass. Any new pure state logic has unit tests.

## Assumptions
- The state logic is in `core/` as pure functions. Components only call them.
- The seed comes from the UI layer, not from `core/`.
