# WXT upgrade plan: 0.20.11 → 0.20.17

## Current state

| Package                | Current  | Target   |
| ---------------------- | -------- | -------- |
| wxt                    | ^0.20.11 | ^0.20.17 |
| @wxt-dev/analytics     | 0.5.0    | 0.5.2    |
| @wxt-dev/module-svelte | ^2.0.4   | (peer)   |
| @wxt-dev/unocss        | ^1.0.1   | (peer)   |
| @wxt-dev/auto-icons    | ^1.1.0   | (peer)   |

No `web-ext.config.ts` or `.wxtrc` in use. Content script uses `createShadowRootUi` and one place relies on `[data-wxt-shadow-root]` for “is this our UI?” detection.

---

## Breaking / behaviour changes that affect this project

### 1. **0.20.12 – `data-wxt-*` attributes removed** (must fix)

- **What:** WXT no longer adds `data-wxt-shadow-root` (or other `data-wxt-*`) to the shadow host.
- **Where:** `src/lib/core/ElementInspector.ts` uses `element.closest("[data-wxt-shadow-root]")` in `isExtensionElement()`.
- **Action:** Stop relying on WXT’s attribute. Either:
  - **A)** In `src/entrypoints/content.ts` `onMount`, get the host (`container.getRootNode()?.host`) and set a custom attribute, e.g. `data-amgiflol-root`, then in `ElementInspector.ts` use `element.closest("[data-amgiflol-root]")`.
  - **B)** Or use another stable way to detect “inside our shadow UI” (e.g. a known class on a root node we control).

### 2. **0.20.12 – Content script CSS default**

- **What:** Content script CSS now defaults to `use_dynamic_url: true`.
- **Action:** Confirm behaviour; only override in manifest/config if you hit issues (e.g. wrong or missing CSS).

### 3. **0.20.14 – Shadow root UI position**

- **What:** Position when creating shadow root UI now uses `uiContainer` ([#2036](https://github.com/wxt-dev/wxt/pull/2036)).
- **Action:** After upgrade, visually check overlay/toolbar position and layout; fix via WXT options or CSS if something regresses.

### 4. **0.20.14 – `ExtensionRunner#closeBrowser` optional**

- **What:** `closeBrowser` is optional on the runner.
- **Action:** No code change unless you call it; then ensure null checks if you type it yourself.

### 5. **0.20.15 – Rollup `name` → `names` then reverted in 0.20.16**

- **What:** Deprecation fix was reverted; no action needed for app code.

---

## Optional / nice-to-have

- **0.20.13 – `.wxtrc`:** You can move shared config into `.wxtrc` later if you want.
- **0.20.15 – `--level`:** Use `wxt --level debug` (or other level) when debugging.
- **0.20.15 – Firefox popup:** If you care about Firefox popup area/icons, check new `default_area` and `theme_icons` support.

---

## Upgrade steps (recommended order)

1. **Backup / branch**
   - Branch from current main (e.g. `upgrade/wxt-0.20.17`).

2. **Bump versions**
   - In `package.json`:
     - `wxt`: `^0.20.11` → `^0.20.17`.
     - `@wxt-dev/analytics`: `0.5.0` → `0.5.2` (optional but recommended).
   - Run: `pnpm install`.

3. **Fix `data-wxt-shadow-root` usage (required)**
   - In `src/entrypoints/content.ts` (inside `onMount`): get the shadow host and set a custom attribute, e.g.:
     - `(container.getRootNode() as ShadowRoot)?.host?.setAttribute?.("data-amgiflol-root", "true")`.
   - In `src/lib/core/ElementInspector.ts`: replace `[data-wxt-shadow-root]` with `[data-amgiflol-root]` in `isExtensionElement()`.

4. **Smoke test**
   - `pnpm run build:all` (must pass).
   - `pnpm run dev` (Chrome) and quick manual check: open a page, confirm overlay/toolbar appear and positioning is correct.
   - If you use Firefox: `pnpm run dev:firefox` and same checks.

5. **E2E**
   - `pnpm exec playwright install` if needed, then `pnpm test:e2e`. Fix any failures (e.g. selectors that still assumed `data-wxt-shadow-root`).

6. **Lint / typecheck**
   - `pnpm run check` and `pnpm run lint`.

7. **Changelog**
   - Add a changeset or CHANGELOG entry for “Upgrade WXT 0.20.11 → 0.20.17 (and @wxt-dev/analytics 0.5.0 → 0.5.2)”.

---

## Rollback

If something breaks and you need to rollback:

- Revert the branch (or revert the dependency and code changes).
- Restore `[data-wxt-shadow-root]` in `ElementInspector.ts` and remove the custom attribute from `content.ts`.
- Run `pnpm install` and re-test.

---

## Checklist

- [ ] Branch created
- [ ] `package.json` updated (wxt, optionally analytics)
- [ ] `pnpm install` run
- [ ] Custom host attribute added in content script `onMount`
- [ ] `ElementInspector.ts` updated to use new selector
- [ ] `pnpm run build:all` passes
- [ ] Manual smoke test (Chrome, and Firefox if used)
- [ ] `pnpm test:e2e` passes
- [ ] `pnpm run check` and `pnpm run lint` pass
- [ ] Changelog/changeset added
