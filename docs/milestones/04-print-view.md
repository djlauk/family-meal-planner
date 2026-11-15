# 04 Print view

Status: not started (sketch)

## Goal
Print the meal plan and the ingredient list on paper. The paper list is the working copy for shopping.

## Scope
- `@media print` styles. No separate route.
- "Print" button that calls `window.print()` (draft).
- Prints two parts: the meal plan (week grid) and the ingredient list.
- Hidden in print: buttons, toggles, the dish list, template picker, override and clear controls.
- Forced light colors regardless of the dark mode setting. Black on white, no backgrounds.
- A4 portrait (draft).
- Plan and list on one page if they fit. Otherwise the list goes on its own page. No page breaks inside a row or inside a day.
- Every ingredient prints with an empty checkbox square, regardless of anything in the app.
- Unfilled `auto` cells print as empty.
- Strings in `de-CH.ts`.

## Out of scope
- PDF generation, custom print dialogs, print settings in the app.
- Print of the dish list.

## Acceptance criteria (draft)
- [ ] The browser's print preview shows the plan and the list on A4 with no buttons or inputs.
- [ ] Dark mode does not affect the print.
- [ ] Every list item has a blank checkbox.
- [ ] Long lists continue on a second page without cutting an item in half.
- [ ] `check`, `lint`, `test`, `build` pass.

## Assumptions
- UI tests are out of scope. The print layout is checked manually in the print preview (Chromium and Firefox).
- Checkbox squares are drawn with CSS, not with an input element.
