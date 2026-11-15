# family-meal-planner

A static web app for one family. It fills the free cells of a weekly meal schedule with dishes that suit who is home, and lists the ingredients you need. A dish someone dislikes is only suggested when that person is absent.

- No backend, no network requests, no accounts, no storage. A reload starts fresh.
- UI in German (de-CH). Runs on the home network from any static web server.

Design and decisions: `docs/SPEC.md`. Milestones: `docs/milestones/`.

## Using the app

1. Pick a template (**Vorlage**), e.g. "Schulwoche".
2. **Vorschläge erstellen** fills the free cells. Run it again to fill cells that are still free.
3. Per cell:
   - **Verwerfen** removes a suggestion and excludes that dish from the next runs.
   - **Entfernen** removes a dish you picked by hand.
   - The dropdown sets any dish by hand, without checks.
   - Fixed cells from the template cannot be changed.
4. **Gerichte**: untick dishes you do not want suggested. **Alle aktivieren** re-includes all.
5. **Wir brauchen** lists the ingredients. **Als Text kopieren** copies them, one per line.
6. **Drucken** prints the plan and the list on A4, with a box to tick per ingredient.
7. **Zurücksetzen** returns the plan to the template. Dish ticks stay.

## Requirements

- Node.js (current LTS) and npm. Windows, macOS and Linux all work.

## Commands

```sh
npm install       # once, after cloning
npm run dev       # dev server with hot reload, http://localhost:5173
npm run build     # static site in build/
npm run preview   # serve build/ locally, http://localhost:4173
npm test          # unit tests (Vitest)
npm run check     # type check (svelte-check)
npm run lint      # Prettier check and ESLint
npm run format    # Prettier write
```

## Data

The app reads three JSON files at build time:

| Folder            | Used when                         | In git |
| ----------------- | --------------------------------- | ------ |
| `src/data-local/` | it contains any of the data files | no     |
| `src/data/`       | otherwise (fictional sample data) | yes    |

**Put your real data in `src/data-local/`.** The folder is git-ignored, so real names never get committed. It must hold all three files. Start by copying the samples:

```sh
mkdir src/data-local
cp src/data/*.json src/data-local/
```

(On Windows PowerShell: `New-Item -ItemType Directory src/data-local; Copy-Item src/data/*.json src/data-local/`.)

After editing, run `npm run build` (or keep `npm run dev` running; it reloads).

### `family.json`

Everyone who eats at home. `id` is used in the other files; `name` is shown. Use first names or nicknames.

```json
[
	{ "id": "lea", "name": "Lea" },
	{ "id": "nico", "name": "Nico" }
]
```

### `dishes.json`

Dishes the planner may suggest. Names must be unique.

```json
[
	{ "name": "Rösti mit Spiegelei", "ingredients": ["Kartoffeln", "Eier", "Butter"] },
	{ "name": "Pilzrisotto", "ingredients": ["Risottoreis", "Champignons"], "nogos": ["lea", "nico"] },
	{ "name": "Reste" }
]
```

- `ingredients` (optional): plain names, no amounts. The list merges names that differ only in case or spaces; "Zwiebel" and "Zwiebeln" stay separate.
- `nogos` (optional): family ids who should not get this dish (dislike, allergy, anything). The dish is only suggested for a meal where **all** of them are absent.

### `templates.json`

Named weeks. Each template has all seven days (`monday` … `sunday`). A day is a list of meals in order; days may have different numbers of meals.

```json
{
	"Schulwoche": {
		"monday": [
			{ "type": "planned", "label": "Zmorge", "name": "Brot mit Konfi" },
			{ "type": "auto", "label": "Zmittag", "absences": ["lea", "nico"] },
			{ "type": "auto", "label": "Znacht" }
		],
		"tuesday": [],
		"wednesday": [],
		"thursday": [{ "type": "planned", "label": "Znacht", "name": "Pizza" }],
		"friday": [],
		"saturday": [],
		"sunday": []
	}
}
```

- `"type": "auto"`: a free cell the planner fills. `absences` (optional) lists family ids not at this meal.
- `"type": "planned"`: a fixed meal. `name` is a dish name or any text ("Restaurant"). If it matches a dish, that dish is not suggested elsewhere and its ingredients go on the list.
- `label` (optional): shown in the plan and on paper, e.g. "Zmittag".
- The template name (here "Schulwoche") is shown as-is. The first template is selected at start.

### Errors

Broken data stops `npm run build` (and shows an overlay in `npm run dev`). The message names the folder, file and place:

```
src/data-local/templates.json: Schulwoche.friday[1].absences[0]: unknown family id "zoe"
```

Read it as: in `templates.json`, template "Schulwoche", Friday, second meal (counting from 0), first entry of `absences`. Typical causes: a typo in an id, a misspelled key (`absent` instead of `absences`), a duplicate dish name, a missing weekday.

## Deploying to the NAS

The build is a folder of static files. Any web server on the NAS can serve it over plain HTTP. Keep it on the home network; do not expose it to the internet (it contains family names and schedules).

1. Put the real data in `src/data-local/` (see above).
2. `npm run build`
3. Copy the **contents** of `build/` to a folder of the NAS web server, e.g. its web root or a sub-folder like `essen/`.
4. Open it in a browser: `http://<nas-address>/` or `http://<nas-address>/essen/`.

Notes:

- Paths are relative, so any sub-folder works without configuration.
- Use the address with the trailing slash (`/essen/`). Most web servers redirect `/essen` to `/essen/` themselves; if yours does not, `/essen` loads without styles.
- To update the data, edit, build and copy again. Old files can be replaced; there is nothing to migrate.

### After the first deployment, check

- [ ] The page loads from another device (phone, tablet).
- [ ] **Als Text kopieren** works over plain HTTP: either "Kopiert" appears, or a pre-selected text box to copy by hand. (Browsers allow the clipboard API only over HTTPS; the app falls back automatically. Not yet verified on a real NAS.)
- [ ] Printing from that device looks like the print preview on the PC.

## Development notes

- Pure logic in `src/lib/core/`, data loading and validation in `src/lib/data/`, UI strings in `src/lib/i18n/de-CH.ts`, components in `src/lib/components/`.
- Imports use the `#lib/…` alias with an explicit `.ts` extension (SvelteKit 3).
- Project rules for contributors and AI assistants: `CLAUDE.md`.
