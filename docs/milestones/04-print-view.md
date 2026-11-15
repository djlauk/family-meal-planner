# 04 Print view

Status: in review (branch `feature/04-print-view`). Open: manual print-preview check.

## Goal
Print the meal plan and the ingredient list on paper. The paper list is the working copy for shopping.

## Scope
- `@media print` styles. No separate route. A dedicated print-only component; the screen UI is hidden in print.
- "Drucken" button that calls `window.print()`.
- Prints two parts: the meal plan and the ingredient list.
  - Plan: heading "Wochenplan – <template name>", one heading per weekday, each meal on its own line. Days in two columns. No date line. No absences.
  - List: three columns, every ingredient with an empty CSS checkbox square.
- Hidden in print: buttons, toggles, the dish list, template picker, override and clear controls.
- Forced light colors regardless of the dark mode setting. Black on white, no backgrounds.
- A4 portrait.
- Plan and list on one page if they fit. Otherwise the list goes on its own page. No page breaks inside a day or an item.
- Unfilled `auto` cells print as empty (a blank line).
- Strings in `de-CH.ts`.

## Out of scope
- PDF generation, custom print dialogs, print settings in the app.
- Print of the dish list.

## Acceptance criteria
- [ ] The browser's print preview shows the plan and the list on A4 with no buttons or inputs. (Manual check.)
- [ ] Dark mode does not affect the print. (Manual check.)
- [ ] Every list item has a blank checkbox. (Manual check.)
- [ ] Long lists continue on a second page without cutting an item in half. (Manual check.)
- [x] `check`, `lint`, `test`, `build` pass.

## Assumptions
- UI tests are out of scope. The print layout is checked manually in the print preview (Chromium and Firefox).
- Checkbox squares are drawn with CSS, not with an input element.
