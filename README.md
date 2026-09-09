# Emoji Art

![CI](https://github.com/devvalczak/emoji-art/actions/workflows/ci.yml/badge.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![No backend](https://img.shields.io/badge/backend-none-lightgrey)

Turn any image (file upload or URL) into a mosaic of emoji that visually resembles the original. The app runs entirely in the browser — no backend.

**Live demo:** [devvalczak.github.io/emoji-art](https://devvalczak.github.io/emoji-art/) (deployed from `main`)

## Table of contents

- [Quick start](#quick-start)
- [Features](#features)
- [How it works](#how-it-works)
- [Project structure](#project-structure)
- [Known limitations](#known-limitations)
- [Tech stack](#tech-stack)
- [Development](#development)
- [License](#license)

## Quick start

Requires Node.js 20+.

```bash
npm install
npm run dev       # dev server with HMR
```

Other available commands:

```bash
npm run build     # typecheck (tsc -b) + production build to dist/
npm run preview   # preview the production build
npm run lint      # oxlint
```

> The project doesn't have a test suite yet — `vitest` is in `devDependencies` as a base for future tests of the logic in `src/lib/`, but there's no `test` script or `*.test.ts` files.

## Features

- **Input**: upload an image file or paste an image URL.
- **Resolution**: any number of columns × rows in the emoji grid.
- **Matching mode**: by color, by shape, or a mix with a color/shape weight slider.
- **Emoji style**: system (your device's emoji font), [Twemoji](https://github.com/jdecked/twemoji), or [OpenMoji](https://github.com/hfg-gmuend/openmoji) — the latter two are drawn as real graphics, so they look the same regardless of the viewer's operating system.
- **Output typography**: font size, line height, letter spacing — with a live preview showing which part of the image will be cropped.
- **Two output modes**:
  - **Text** — a real, copyable block of text made of emoji.
  - **Image** — rendered to a PNG file (useful at high resolutions, where text mode stops being practical), with a configurable cell size.
- Matching and image rendering run in Web Workers (with a progress bar), so the UI never freezes even on large grids.
- Emoji palette features (color + shape) are computed once and cached (IndexedDB), so subsequent generations are much faster.
- Settings are saved in `localStorage` and persist across page reloads.

## How it works

1. The source image is cropped to match the real shape of a single cell (measured in the DOM from font size, line height, and letter spacing), rather than an assumed square.
2. The cropped image is divided into a `columns × rows` grid, and each cell is sampled down to an average color (in Lab space) plus a simplified 8×8 luminance map (shape).
3. Every candidate in the emoji palette (a few hundred characters) is rendered once to a hidden canvas and analyzed the exact same way, so image cells and emoji are directly comparable.
4. For each cell, the emoji with the smallest distance is picked (color / shape / a weighted combination of both).
5. The result is rendered either as text (the browser's emoji font) or as a PNG image (real graphics for the Twemoji/OpenMoji styles, or `fillText` for the system style).

Implementation details for each step (with references to specific files) are documented in [`CLAUDE.md`](./CLAUDE.md) — written for Claude Code, but useful as an architecture map for anyone working on this codebase.

## Project structure

```
src/
  components/     UI components (upload, settings, preview, text/image results)
  state/          global state (Zustand, with settings persistence)
  lib/            all the logic: image loading, emoji feature extraction,
                  image sampling, matching, rendering, export
  workers/        Web Workers: emoji matching (convert.worker.ts)
                  and PNG image rendering (render.worker.ts)
```

## Known limitations

- **CORS when pasting a URL** — reading image pixels from another domain requires the server to send CORS headers. If that fails, the app shows a clear message suggesting you download and upload the file manually. This limitation comes from having no backend (a deliberate design choice) and can't be worked around client-side alone.
- **Text mode vs. emoji style** — real text always renders with the emoji font of whoever is viewing it. The chosen style (Twemoji/OpenMoji) affects *which* emoji get picked, but doesn't guarantee identical appearance in text mode — only the PNG export guarantees the selected style, since that's where real graphics are drawn.
- **Twemoji/OpenMoji styles** fetch graphics from jsDelivr (`cdn.jsdelivr.net`) on the fly — they require an internet connection and availability of that CDN.
- **Graphics licenses**: Twemoji — CC-BY 4.0, OpenMoji — CC-BY-SA 4.0 (images exported in the OpenMoji style are subject to the share-alike requirement). The corresponding attribution appears in the app's footer for the selected style.
- **No tests** — see the note in [Quick start](#quick-start).

## Tech stack

React + TypeScript + Vite, Zustand (state), `culori` (RGB↔Lab color conversions). No backend — everything is computed in the browser (Canvas API, Web Workers, OffscreenCanvas, IndexedDB).

## Development

There's no established review process beyond CI — the following is the local minimum before sending changes:

1. `npm run lint` — [oxlint](https://oxc.rs/docs/guide/usage/linter.html) checks for basic errors and style.
2. `npm run build` — runs typecheck (`tsc -b`) and verifies the project builds.
3. Manually test the change in the browser (`npm run dev`) — there are no automated tests, so this is the only functional verification.

Every push and pull request against `main` runs the same lint + typecheck + build steps in CI (`.github/workflows/ci.yml`), so a red run there means one of the local checks above would have caught it too.

For changes to the matching pipeline (`src/lib/`, `src/workers/`), check [`CLAUDE.md`](./CLAUDE.md) — it describes the data flow and the places where regressions are easy to introduce (e.g. bumping `PALETTE_VERSION` when changing the palette or feature extraction).

### CI/CD

- **CI** (`.github/workflows/ci.yml`) — on every push and pull request against `main`: install, lint, typecheck, build.
- **CD** (`.github/workflows/deploy.yml`) — on every push to `main`: builds the app and deploys `dist/` to GitHub Pages via `actions/deploy-pages`. Also runnable manually from the Actions tab (`workflow_dispatch`).

One-time repo setup required for deployment to work: in **Settings → Pages**, set **Source** to **GitHub Actions**. Since the app is served from a subpath (`/emoji-art/`) rather than a custom domain, `vite.config.ts` sets `base: '/emoji-art/'` for production builds only — local `dev`/`preview` still run at `/`.

## License

The repository currently has no `LICENSE` file and no license declared in `package.json` (the package is marked `private`). The code is available for viewing in this repository only; if you need an explicit open-source license, please open an issue.

The Twemoji and OpenMoji graphics have their own licenses — see [Known limitations](#known-limitations).
