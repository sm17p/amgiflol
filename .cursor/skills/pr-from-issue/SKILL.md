---
name: pr-from-issue
description: Creates a GitHub PR for the current work using GitHub MCP; links to an existing issue with Closes #N, creates an issue if none exists, and for large scope creates sub-issues and multiple PRs (each PR closes sub-issues; last PR closes sub-issues + main issue). Use when opening a PR for the current issue or when the user asks to create a PR from the current work.
---

# Create PR from current issue

Use GitHub MCP (server `user-github`) for all GitHub actions. Before calling any MCP tool, check its schema (e.g. under `mcps/user-github/tools/` or via Cursor MCP discovery) so parameters are correct.

## Quick decision

1. **Issue:** From conversation (e.g. "issue #5") or search — identify the main issue #M. If none exists, create one via GitHub MCP and use labels from [docs/ISSUE_REFINEMENTS.md](docs/ISSUE_REFINEMENTS.md) / [issue-refinement-triage](.cursor/skills/issue-refinement-triage/SKILL.md).
2. **Scope:** If the change is small or not splittable → single PR. If large and decomposable → create sub-issues S1…Sn, then multiple PRs (see [reference.md](reference.md) for heuristics).

## Single PR workflow

1. Ensure main issue #M exists (found or created).
2. Ensure branch is pushed: use [jj-bookmark-push](.cursor/skills/jj-bookmark-push/SKILL.md) — `jj bookmark set <branch-name>` then `jj git push -b <branch-name>`.
3. Check for a PR template: `.github/PULL_REQUEST_TEMPLATE/` or `pull_request_template.md` in the repo; use it if present.
4. Create the PR via `call_mcp_tool` with server `user-github` and the create_pull_request tool. PR body must include `Closes #M`.

## Multiple PR (sub-issues) workflow

1. Main issue #M exists. Create sub-issues S1, S2, … Sn (e.g. "Part 1: …", "Part 2: …") and reference the main issue in each sub-issue body (e.g. "Parent: #M").
2. For each sub-piece of work: push its branch (jj bookmark + push), then create a PR that closes the corresponding sub-issue(s).
   - PR 1: body includes `Closes #S1`.
   - PR 2: body includes `Closes #S2`.
   - …
3. **Last PR:** Include `Closes #S_last` (and any other sub-issues this PR completes) and **`Closes #M`** so the main issue is closed when the last PR is merged.

## GitHub MCP tools

Use `call_mcp_tool` with `server: "user-github"`. Typical tools and intent:

| Tool (check schema for exact name) | Use for                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------- |
| get_me                             | Current user and permissions; infer or confirm owner/repo                 |
| search_issues                      | Find existing issue by number, title, or labels; avoid duplicate creation |
| create_issue (or equivalent)       | Create main or sub-issue when missing; use ISSUE_REFINEMENTS labels       |
| create_pull_request                | Create PR from branch; use repo PR template if present                    |
| list_issue_types                   | Optional; use for orgs that use issue types                               |

Infer `owner/repo` from git remote or conversation. Always check the tool’s JSON descriptor for required parameters before calling.

## Branch and push

This project uses jj. A bookmark is the branch name. Before creating a PR:

1. `jj bookmark set <branch-name>` so the bookmark points at the revision to publish.
2. `jj git push -b <branch-name>`.

See [jj-bookmark-push](.cursor/skills/jj-bookmark-push/SKILL.md) for details. Do not rewrite already-pushed commits.

## PR body rules

- **Single issue:** Body must include `Closes #M` (main issue number).
- **Sub-issue PR (not last):** Body must include `Closes #S1` (and any other sub-issues that PR completes).
- **Last PR in a breakdown:** Body must include `Closes #S_last` and `Closes #M`.

Use the repo’s PR template if present. Title and description should reflect the issue and the change.

## Summary

| Scenario                  | Action                                                                                                     |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| No issue                  | Create issue via MCP; one PR with `Closes #M`.                                                             |
| One issue, small scope    | One PR with `Closes #M`.                                                                                   |
| One issue, can break down | Create sub-issues S1…Sn; each PR closes its sub-issue(s); last PR closes its sub-issue(s) and `Closes #M`. |

For when to treat work as "big", how to phrase sub-issues, and example PR body snippets, see [reference.md](reference.md).
