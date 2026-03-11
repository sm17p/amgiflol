---
name: skill-hygiene
description: Checklist for updating project skills when the codebase or workflow changes. Use when applying the skill-maintenance rule, after dependency upgrades or script/e2e/release/issue-format changes, or when the user asks how to keep skills up to date.
---

# Skill hygiene

When updating a skill (see `.cursor/rules/skill-maintenance.mdc` for when to do so), read the current skill file first and then apply the checks below for the relevant skill(s).

## issue-refinement-triage

- Issue block template still matches `docs/ISSUE_REFINEMENTS.md`.
- Label table matches the "Label usage summary" in ISSUE_REFINEMENTS (same labels and "Use for" text).
- Workflow steps still reflect how open/closed issues and "My comments" are used.

## wxt-svelte-extension

- **Stack:** Entrypoints, config path, srcDir/outDir match current layout.
- **Scripts table:** Commands and purpose match `package.json` (dev, build, zip; Chrome vs Firefox).
- **Constraints:** No new dev data, storage prefix, shadow DOM isolation still accurate; wording matches current issues if referenced.
- **reference.md:** Known-issues list (e.g. #36, #17, #25) is current; add new recurring issues that should guide code, remove or note when an issue is closed.

## releases-changesets

- Rule and "Add a changeset" steps match `.changeset/config.json` and how the repo uses changesets.
- Release steps (build:all, zip:all, workflow_dispatch) match current process; update when CI or release automation changes.

## e2e-playwright-extension

- **Layout:** Paths (e2e/tests, e2e/pages, fixture file) match repo; fix fixture filename in skill if the typo is ever fixed in repo.
- **Fixture:** context/extensionId and MV3 vs background page still match [e2e/fixutes.ts](e2e/fixutes.ts).
- **Run:** `pnpm test:e2e` and build-before-test still correct.

## After editing

- Keep SKILL.md under 500 lines; move long detail to reference.md if needed.
- Descriptions (frontmatter) stay third-person and include WHAT and WHEN.
- Links stay one level deep (no deep nesting from SKILL.md).
