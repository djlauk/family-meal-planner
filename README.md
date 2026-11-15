# family-meal-planner

Static web app that fills the free cells of a weekly meal schedule with dishes that suit who is home, and lists the ingredients needed. No backend, no network, no persistence.

See `docs/SPEC.md` for the design and `docs/milestones/` for the plan.

## Requirements

- Node.js (current LTS) and npm

## Install

```sh
npm install
```

## Run

```sh
npm run dev       # dev server with hot reload
```

## Test and check

```sh
npm test          # Vitest unit tests
npm run check     # svelte-check (TypeScript)
npm run lint      # Prettier check and ESLint
npm run format    # Prettier write
```

## Build

```sh
npm run build     # static site in build/
npm run preview   # serve the build locally
```

`build/` uses relative paths and can be served by any static file server.

## Data

Edit the JSON files in `src/data/`: `family.json`, `dishes.json`, `templates.json`. They are validated at build time. An error names the file and the problem, for example:

```
dishes.json: [7].nogos[0]: unknown family id "zoe"
```

The committed data is fictional sample data.
