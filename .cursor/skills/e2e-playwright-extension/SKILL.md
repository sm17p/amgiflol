---
name: e2e-playwright-extension
description: Adds or updates extension E2E tests using the project Playwright setup and fixture (load unpacked extension, popup/background). Use when adding e2e for a feature, fixing failing e2e, or when changing popup/options/background flows.
---

# E2E with Playwright (extension)

Aligned with [WXT’s Playwright E2E example](https://github.com/wxt-dev/examples/tree/main/examples/playwright-e2e-testing): Chromium only, extension loaded from `dist/chrome-mv3`.

## Layout

- Tests in [e2e/tests/](e2e/tests/)
- Shared fixture in [e2e/fixtures.ts](e2e/fixtures.ts)
- Page helpers in [e2e/pages/](e2e/pages/) (e.g. [e2e/pages/popup.ts](e2e/pages/popup.ts))

## Fixture

The fixture extends Playwright with:

- **context:** Chromium persistent context that loads the unpacked extension from `dist/chrome-mv3`
- **extensionId:** Resolved from the service worker (MV3) or background page otherwise

Use `context` and `extensionId` in tests. Import the extended `test` and `expect` from the fixture.

## Popup

Navigate to `chrome-extension://${extensionId}/popup.html`. Use helpers like `openPopup(page, extensionId)` from [e2e/pages/popup.ts](e2e/pages/popup.ts) for consistent setup.

## Run

- First-time: `pnpm exec playwright install chromium` (installs Chromium and headless shell; do not use `--no-shell` or default tests will fail).
- Build the extension: `pnpm build` so `dist/chrome-mv3` exists.
- Run tests: `pnpm test:e2e`

## Note

`playwright-webextext` is in devDependencies for potential future use; current tests use the custom fixture in `fixtures.ts`.
