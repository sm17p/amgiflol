---
name: issue-refinement-triage
description: Refines GitHub issues into the ISSUE_REFINEMENTS format and keeps docs/ISSUE_REFINEMENTS.md in sync. Use when triaging issues, refining a new issue, updating the refinements doc, or when the user asks to refine an issue or add to refinements.
---

# Issue Refinement and Triage

## Canonical source

Read [docs/ISSUE_REFINEMENTS.md](docs/ISSUE_REFINEMENTS.md) for the current open/closed list and label table before editing.

## Issue block template

Each refined issue uses this format. Separate blocks with `---`.

```markdown
### #N — Title

**Labels:** `label1` `label2`
**Context:** Raw description or user report.
**Refined:** One-line actionable scope or decision.
**My comments:** _(add notes here)_
```

## Labels (only these)

| Label              | Use for                                |
| ------------------ | -------------------------------------- |
| `bug`              | Something broken or incorrect behavior |
| `documentation`    | Docs, README, FAQ, browser support     |
| `enhancement`      | New feature or improvement             |
| `good first issue` | Clear, scoped tasks for contributors   |
| `question`         | Open questions, naming, investigation  |
| `UI/UX`            | User-facing behavior, flows, layout    |
| `Brainstorm`       | Ideas, naming, long-running discussion |
| `infrastructure`   | CI/CD, release, monitoring, tooling    |

Suggest only these labels; use space-separated list in the block.

## Workflow

1. **New or raw issue:** Propose labels (from the table) and a one-line **Refined** that scopes or clarifies the issue.
2. **Updating ISSUE_REFINEMENTS:** Add new refined issues under "Open issues (refined)". When an issue is closed, move its block to "Closed issues (reference)" and keep the same format.
3. **My comments:** Reserved for maintainer notes (priority, blockers, batching). Leave as `*(add notes here)*` if no note.
