---
name: jj-commit
description: Stages and commits changes in jj (Jujutsu VCS) with a clear, concise commit message. Use when committing changes with jj, setting a revision description, or when the user asks to commit with jj.
---

# jj commit (describe)

Create a commit for the current changes by setting the revision description. In jj there is no staging area; the working copy is the current revision.

## Steps

1. Run `jj status` to see working-copy state and which files changed.
2. Run `jj diff` to see changes in the current revision (working copy vs parent). Use `-r @` to restrict to the current rev if needed.
3. Run `jj log -n 5` to see recent commit style.
4. Write a commit message and run `jj describe -m "message"`.

If the user provides a message hint (e.g. in the request), use it when writing the message.

To start a new change before describing, run `jj new`; then set the description on that revision.

## Commit message rules

- Use the imperative mood ("Add", "Fix", "Remove", not "Added", "Fixes", "Removed").
- Be concise: one short sentence, ideally under 50 characters.
- Do NOT use conventional commit prefixes (no `feat:`, `fix:`, `chore:`, etc.).
- Do NOT add any `Co-Authored-By` or similar trailers.
- Focus on **what** changed and **why**, not how.
- If a second line is needed for context, keep it brief.

## Examples of good messages

- `Prevent discount code from being cleared on edit`
- `Add integration test for offer code persistence`
- `Remove unused legacy export helper`
- `Fix thumbnail missing in upsell insert`

When pushing, use [jj-bookmark-push](.cursor/skills/jj-bookmark-push/SKILL.md); never push without a description.
