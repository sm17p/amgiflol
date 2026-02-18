# Dependency bumps – breaking changes summary

Bumped from `pnpm outdated` (Feb 2026). Versions and impact below.

| Package               | From     | To      | Breaking impact for this repo |
|-----------------------|----------|---------|-------------------------------|
| oxlint (dev)          | 1.6.0    | ^1.48.0 | Low. Rule renames/removals or config/CLI changes only; run `pnpm lint` after install. |
| @types/node (dev)     | ^24.10.13| ^25.2.3 | Low. Types match Node 25 API; runtime breakage only if running Node 25 (e.g. fs constant removals). We use Node ≥24. |
| @lucide/svelte        | ^0.525.0 | ^0.574.0| Low. No use of deprecated `SvelteComponentTyped` in our code; icon API stable. |
| @wxt-dev/analytics    | 0.5.0    | 0.5.2   | Patch no longer applied: `patches/@wxt-dev__analytics.patch` targeted 0.5.0 and was removed; 0.5.2 may include fixes. Re-add a patch if background-script detection regresses. |
| oxlint-tsgolint (dev) | ^0.2.1   | ^0.14.0 | Low. If type-aware lint runs: ensure no `baseUrl` in tsconfig (we use `paths` only in `.wxt/tsconfig.json`). |
| runed (dev)           | ^0.29.2  | ^0.37.1 | None for current usage. We only use `watch()`. Breaking in 0.35: `Interval` removed in favour of `useInterval` (we use native `setInterval`). 0.33: `validateSearchParams` return shape changed (we don’t use it). |

## After bump

1. Run `pnpm install` (from project root; if store path errors, run `pnpm install` once to align store).
2. `pnpm run build:all` then `pnpm run check` and `pnpm run lint`.
3. If you use Node 25: watch for Node 25 removals (e.g. `fs.F_OK`/`R_OK`/`W_OK`/`X_OK`, deprecated URL/TLS/process APIs).
