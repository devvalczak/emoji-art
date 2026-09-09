# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Emoji Art turns an uploaded/URL image into an emoji mosaic that visually resembles the original. Pure client-side React + TypeScript app (Vite), no backend — all image processing happens in the browser via Canvas API, Web Workers, OffscreenCanvas, and IndexedDB.

## Commands

```bash
npm install
npm run dev       # dev server with HMR
npm run build     # typecheck (tsc -b) + production build to dist/
npm run preview   # preview the production build
npm run lint      # oxlint
```

There is no test suite yet (Vitest is a devDependency but no `test` script or `*.test.ts` files exist).

## Architecture

The pipeline, from source image to rendered output, spans `src/lib/` and `src/workers/`:

1. **Cell aspect measurement** (`lib/aspectRatio.ts`) — runs on the main thread (needs the DOM). Lays out sample emoji text with the current typography settings and measures the real rendered cell size, so cropping matches the actual glyph shape rather than an assumed square.
2. **Cropping** (`lib/imageLoader.ts`) crops the source image to the grid's aspect ratio using the measured cell aspect.
3. **Feature extraction** — both image cells and palette emoji are reduced to the same comparable representation: an average color in Lab space, plus an 8×8 alpha-weighted luminance grid (`SHAPE_GRID_SIZE` in `lib/types.ts`) for shape.
   - Image side: `lib/blockSampler.ts` (`sampleImageBlocks`) samples each grid cell of the cropped image.
   - Emoji side: `lib/featureExtraction.ts` renders each candidate emoji once to an offscreen canvas and analyzes it the same way.
4. **Palette caching** (`lib/featureCache.ts` + `lib/idbCache.ts`) — the ~few hundred emoji in `lib/emojiPalette.ts` are feature-extracted once per style and cached both in-memory (per worker instance) and in IndexedDB (`getPaletteFeatures`), keyed by style + `PALETTE_VERSION` + palette length. Bump `PALETTE_VERSION` when changing palette contents or feature extraction so stale caches are invalidated.
5. **Matching** (`lib/matcher.ts`) — for each cell, picks the palette emoji with the smallest distance under the selected `MatchMode` (`color` | `shape` | `mixed`, weighted by `mixedWeight`). Color distance uses `labDistance` (`lib/colorSpace.ts`, via `culori`); shape distance is Euclidean over the flattened luminance grids.
6. **Two independent Web Workers** drive the expensive steps off the main thread, each reporting `{done, total}` progress messages consumed via `lib/workerClient.ts`:
   - `workers/convert.worker.ts` — runs sampling + matching, producing a `GridResult` (grid of chosen emoji).
   - `workers/render.worker.ts` — takes a `GridResult` and rasterizes it to a PNG blob via `lib/imageRenderer.ts`, at a configurable per-cell pixel size.
7. **Output**: `ResultTextView` renders the `GridResult` as real copyable emoji text (viewer's own emoji font renders it); `ResultImageView` shows the PNG produced by the render worker. Only the image path guarantees the chosen visual style (Twemoji/OpenMoji), since text mode always renders with the reader's system emoji font.

### Emoji styles and CDN assets

`lib/emojiStyles.ts` + `lib/emojiAssetLoader.ts` handle the three styles (`system`, `twemoji`, `openmoji`). CDN styles (Twemoji/OpenMoji) fetch per-codepoint SVGs from `cdn.jsdelivr.net` on demand and cache the decoded `ImageBitmap`s (`lib/codepoints.ts` builds filename candidates from grapheme codepoints). `validateCdnStyle` does a quick single-emoji probe so a broken/unreachable CDN surfaces immediately instead of after a full matching run. See the note at the top of `emojiAssetLoader.ts`: the jsDelivr URL patterns are pinned to `@latest` and were not live-verified from a sandboxed environment — double check against a real browser before relying on them, and consider pinning an exact release tag for cache stability.

### State

`state/useAppStore.ts` (Zustand + `persist`) holds source image, grid result, generation/render progress and errors, and result mode. Only `settings`, `resultMode`, and `exportCellPx` are persisted to `localStorage` (see `partialize`) — transient state like the loaded image, grid result, and in-flight progress is not.

### Known constraints (see README for full detail)

- No backend: cross-origin image URLs need the source server to send CORS headers, or loading fails with a user-facing message.
- Text mode's visual style is not guaranteed across viewers (depends on their OS emoji font); only PNG export guarantees the selected style.
- Twemoji/OpenMoji require network access to jsDelivr at render time.
