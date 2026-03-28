---
name: issue-refinement-triage
description: Refines GitHub issues using the block template and label table below. Tracking lives on GitHub; use when triaging issues, refining a new issue, or when the user asks to refine an issue.
---

# Issue Refinement and Triage

## Canonical source

Use **GitHub issues** for open/closed tracking and descriptions. This file defines the **label table** and **issue block template** only.

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
2. **GitHub:** Update the issue body or add a triage comment using the block template so the refined scope stays visible on the issue.
3. **My comments:** Reserved for maintainer notes (priority, blockers, batching). Leave as `*(add notes here)*` if no note.
