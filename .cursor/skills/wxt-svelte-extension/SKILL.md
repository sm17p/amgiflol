---
name: wxt-svelte-extension
description: Provides project context for the amgiflol WXT + Svelte 5 browser extension. Use when adding or editing extension code, adding entrypoints, fixing extension bugs, or when working in src/entrypoints or wxt.config.ts.
---

# WXT + Svelte Extension (amgiflol)

## Stack

- WXT, Svelte 5 (runes), UnoCSS
- Entrypoints in [src/entrypoints/](src/entrypoints/) (e.g. background.ts, content.ts)
- Config in [wxt.config.ts](wxt.config.ts); srcDir `src`, outDir `dist`

## Scripts

| Command                     | Purpose                  |
| --------------------------- | ------------------------ |
| `pnpm dev`                  | Chrome dev (MV3)         |
| `pnpm dev:firefox`          | Firefox dev (MV2 in dev) |
| `pnpm build`                | Chrome build (MV3)       |
| `pnpm build:firefox`        | Firefox build (MV3)      |
| `pnpm build:all`            | Both targets             |
| `pnpm zip` / `pnpm zip:all` | Distribution zips        |

## Constraints

- Do not create new data in dev; it breaks seeding.
- Storage keys: use a fixed prefix (e.g. `amgiflol_`) for all extension storage to avoid collisions with host page (see [reference.md](reference.md)).
- Extension UI in shadow DOM: isolate from host page styles (e.g. WXT ShadowRootContentScriptUiOptions) so host root font/CSS vars do not affect the UI.

## Lint and format

- `pnpm lint` (oxlint); import order and sort-imports per [.oxlintrc.json](.oxlintrc.json)
- `pnpm fmt` (oxfmt); `pnpm fmt:check` to check only

## Additional context

For known issues and when to apply them (storage prefix, shadow root isolation, Firefox quirks), see [reference.md](reference.md).
