# PR-from-issue reference

## When to consider work "big" and break into sub-issues

Consider creating sub-issues when:

- **Many files or areas:** Change touches several unrelated modules, entrypoints, or layers (e.g. backend + frontend + docs).
- **Logical parts:** Work naturally splits into steps (e.g. "add API", "add UI", "add tests") that can be implemented and reviewed separately.
- **User says so:** User asks to break the PR down or to open multiple smaller PRs.

Stay with a single PR when the change is one coherent patch (e.g. one feature in one area, or a small fix).

## Sub-issue titles and linking to the main issue

- **Titles:** Use clear, scoped titles (e.g. "Part 1: Add API for X", "Part 2: Popup UI for X"). Avoid vague titles like "Sub-issue 1".
- **Body:** In each sub-issue body, reference the main issue (e.g. "Parent: #M" or "Part of #M — …") so the relationship is visible on GitHub.

## Example PR body snippets

**Single issue:**

```markdown
Closes #12.

Implements the settings page as described in the issue.
```

**Sub-issue PR (not the last):**

```markdown
Closes #14.

Part 2 of #10: adds the popup UI. API and types were added in #13.
```

**Last PR in a breakdown (closes sub-issue + main):**

```markdown
Closes #15. Closes #10.

Final part: wiring and E2E tests. With this merge, the main issue #10 is complete.
```

Use the repo’s PR template if one exists; add the "Closes" line(s) in the appropriate place (often at the top or in a "Fixes" section).
