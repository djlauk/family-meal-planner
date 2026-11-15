# family-meal-planner

Static web app. Fills the free cells of a weekly meal schedule with dishes that suit who is home. Derives a "we need this" ingredient list.

Before any work: read `docs/SPEC.md`, then the current milestone in `docs/milestones/`.

## Tech stack
- SvelteKit with `adapter-static` (prerendered, no server)
- Svelte 5, runes only (`$state`, `$derived`, `$effect`, `$props`)
- TypeScript, strict mode
- Plain CSS3 with custom properties. Light and dark via `prefers-color-scheme`
- Data: plain JSON files in `src/data/`, imported at build time
- Zod for validation (confirm in the milestone 01 plan)
- Vitest, ESLint, Prettier, `svelte-check`
- npm, current Node LTS
- Developer machine is Windows. Scripts must be cross-platform (no bash-only scripts)
- Use .editorconfig and .gitattributes to ensure LF line ends, except Windows specific scripts

## Commands
- `npm run dev`: dev server
- `npm run build`: static build
- `npm run preview`: serve the build
- `npm run check`: `svelte-check`
- `npm run lint`: ESLint and Prettier check
- `npm run format`: Prettier write
- `npm test`: Vitest

## Layout
- `src/lib/core/`: pure logic (planner, shuffle, schedule helpers, needs list)
- `src/lib/data/`: types, Zod schemas, loader
- `src/lib/i18n/de-CH.ts`: all UI strings
- `src/lib/components/`: thin Svelte components
- `src/data/`: hand-edited JSON (family, dishes, templates)
- `docs/`: SPEC and milestones

## Architecture rules
- `core/` is pure: no Svelte, no DOM, no `Date.now()`, no `Math.random()`.
- The planner is deterministic. Same input, same schedule.
- Randomness lives only in the seeded shuffle utility. The UI layer supplies the seed.
- Data is immutable. Functions return new values and never mutate arguments.
- All state is in memory. A reload resets everything, by design.
- JSON is validated at load. Errors name the file and the problem.
- Components hold no business logic. They call `core/` and render.
- Every UI string comes from `i18n/de-CH.ts`. No inline strings in components.

## Forbidden
- Backend, server routes, anything needing a running server
- Network requests, CDNs, web fonts, analytics, secrets
- Any persistence: `localStorage`, `sessionStorage`, IndexedDB, cookies, URL-encoded state
- Svelte 4 syntax (`export let`, `$:`, stores for local state)
- `any`, `@ts-ignore`, `@ts-expect-error` without a comment explaining why
- CSS frameworks, UI component libraries, i18n libraries
- New dependencies without asking first
- Real family names or data in the sample data (use fictional ones)
- Anything listed under "Non-goals" or "Deferred" in `docs/SPEC.md`

## Working method
1. Read the SPEC and the current milestone.
2. Write a short plan. Wait for my OK before coding.
3. Start a feature branch. Implement in small steps. Write tests together with the code.
4. Run `npm run check`, `npm run lint`, `npm test`. Fix before moving on.
5. Update the milestone status and tick off acceptance criteria.
6. Stop and summarize for review. Do not start the next milestone.

Rules:
- Make small commits with clear messages.
- If the SPEC is silent or contradictory, ask. Do not guess.
- If a decision changes, update `docs/SPEC.md` in the same change.
- Stay inside the milestone scope. Note ideas under "Deferred", do not build them.
- I know Python well, TypeScript and Svelte less. Explain non-obvious choices briefly in plans.

## Language and style
- Code, comments, docs, commit messages: English.
- UI strings and sample data: German, Swiss spelling (de-CH, never "ß").
- Docs and replies: concise, short statements, no filler.
- Comments explain why, not what.
- Names: descriptive, no abbreviations. `camelCase` values, `PascalCase` types and components, `kebab-case` files.

## Definition of done (every milestone)
- `check`, `lint`, `test`, `build` pass.
- Acceptance criteria in the milestone file are met and ticked.
- Status updated. SPEC updated if anything changed.
