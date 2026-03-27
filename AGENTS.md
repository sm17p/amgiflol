## Project overview

- **Name**: amgiflol — Figma-like layout inspector for the web.
- **Stack**: WXT (MV3) browser extension, Svelte 5 (runes), UnoCSS/Tailwind v4, Playwright for e2e tests.
- **Entrypoints**: Extension code under `src/` and `src/entrypoints/`; config in `wxt.config.ts`.

## Dev environment

- **CI**: GitHub Actions use [jdx/mise-action](https://github.com/jdx/mise-action) with [`mise.toml`](mise.toml) (Node + env such as `WXT_MIN_CHROME_VERSION`).
- **Install deps**: `pnpm install`
- **Dev (Chrome, MV3)**: `pnpm dev`
- **Dev (Firefox, MV3)**: `pnpm dev:firefox`
- **Build (Chrome, MV3)**: `pnpm build`
- **Build (Firefox, MV3)**: `pnpm build:firefox`
- **Build both targets**: `pnpm build:all`
- **Zip (Chrome)**: `pnpm zip`
- **Zip both targets**: `pnpm zip:all`

## Code style and rules

- **Svelte / WXT**:
  - Use Svelte 5 runes only; do not use legacy `$:` or reactive `let`.
  - Use `$state`, `$derived`, `$effect`, `$props` consistently.
  - Use PascalCase for Svelte component filenames.
  - Use semantic HTML wherever reasonable.
- **Styling**:
  - Use Tailwind v4 / UnoCSS utility classes; avoid custom CSS where possible.
- **TypeScript**:
  - Do not use type assertions.
  - Prefer verb-based names for methods that do work; nouns for simple accessors.
  - Prefer shorthand initialization when defining objects.
- **General**:
  - No comments in code; rely on clear naming and structure.
  - Prefer small, readable, and complete changes; avoid leaving todos or placeholders.

## Testing

- **Typecheck**: `pnpm check`
- **Lint**: `pnpm lint`
- **Format**:
  - Format: `pnpm fmt`
  - Format check: `pnpm fmt:check`
- **E2E tests (Playwright)**:
  - First-time setup: `pnpm exec playwright install chromium`
  - Build extension: `pnpm build`
  - Run e2e: `pnpm test:e2e`
- **E2E layout**:
  - Tests live in `e2e/tests/` (main suite in `e2e/tests/extension.spec.ts`).
  - Shared fixtures in `e2e/fixtures.ts`.
  - Page helpers in `e2e/pages/` (for popup and other flows).

Agents should run the smallest relevant subset of these commands before considering a task finished.

## Data and environment constraints

- **Do not create new data in dev**; it breaks seeding.
- Use the existing storage key patterns and prefixes in extension code to avoid collisions with host pages.
- Do not introduce new secrets or touch production configuration from this repo.

## Agents in this repo

High-level agents for this project:

- **Dev agent – `typescript-pro`**:
  - Focus: Svelte 5 + WXT extension code (popup, background, settings, stores).
  - Reads: this file, Svelte/WXT rules, and relevant e2e sections.
  - Must keep diffs small, update tests when behavior changes, and ensure `pnpm check`, `pnpm lint`, and relevant tests pass.
- **Dev agent (code quality) – `code-quality`**:
  - Focus: Review, refactors, naming, and structure using `.agents/dev/skills/code-quality-principles.md`.
  - Reads: that file, `.agents/dev/agents/code-quality.md`, the nearest `AGENTS.md`, and relevant code.
  - When to use: see **Choosing dev agents** below.

### Choosing dev agents

- **`typescript-pro`**: New features, bug fixes that change behaviour, wiring stores/popup/background, and any work whose main deliverable is implementation in `src/`.
- **`code-quality`**: PR-style review, refactors driven by structure/naming/decomposition, applying the numbered principles in `.agents/dev/skills/code-quality-principles.md`, cleanup without a feature spec, or when the user asks for a quality or review pass.

- **QA agent – `test-automator`**:
  - Focus: Playwright e2e tests and fixtures under `e2e/`.
  - Reads: testing and e2e sections here plus any nested `AGENTS.md` inside `e2e/` (if present).
  - Owns test additions/updates and keeps tests deterministic and scoped.
- **Docs agent – `docs-maintainer`**:
  - Focus: this `AGENTS.md`, `.cursor/rules/`, `.cursor/skills/`, and other project docs.
  - Keeps instructions aligned with actual scripts and workflows.
- **Release agent – `release-manager`**:
  - Focus: changesets, build/zip commands, and release process.
  - Uses changesets; never edits `package.json` versions by hand.

Agents should always prefer the **nearest `AGENTS.md`** to the files they are working on. Explicit user instructions in chat override this file when they conflict.

## Releases and changesets

- **Rule**: All user-facing or notable changes get a changeset under `.changeset/`; do not bump versions manually.
- **Add changeset**: `pnpm changeset` and follow the prompts.
- **Release flow (high level)**:
  - Build both targets: `pnpm build:all`
  - Zip both targets: `pnpm zip:all`
  - Use the existing workflow automation when available.

## Keeping this file useful

- Keep this file under roughly 250 lines and focused on concrete, actionable rules.
- Prefer adding or updating a small section over writing long narratives.
- If workflows or scripts change, update this file and the matching skills in `.cursor/skills/` so agents stay in sync.
