---
name: jj-bookmark-push
description: Uses jj (Jujutsu VCS) to create or update bookmarks and push to the Git remote. Use when creating a branch/bookmark, moving a bookmark to the current revision, or pushing changes with jj instead of git.
---

# jj bookmark and push

Use jj for version control in this project (not git) when creating branches, updating bookmarks, or pushing.

## Rules

- **Never push without a description.** jj rejects pushing revisions with no commit message. Before push, ensure current revision has a description: `jj describe -m "message"` or `jj describe` (editor). If the working copy is a new empty revision, describe it or move the bookmark to a described revision.
- **Never rewrite pushed commits.** No amend/squash of commits already pushed or on a branch with an open PR; that force-pushes and removes GitHub PR comments. Add a new commit for follow-up changes unless the user explicitly requests a force-push.

## Workflow

1. Make changes; commit with `jj commit` / `jj new` (set description when committing).
2. `jj bookmark set <branch-name>` so the bookmark points at the revision to publish.
3. `jj git push -b <branch-name>`.

Bookmarks are branch-like pointers. Set: `jj bookmark set <name>`. Set to a revision: `jj bookmark set <name> -r <rev>`. Use `-B` to move backwards. Push one: `jj git push -b <name>`. Push all: `jj git push --all`. List: `jj bookmark list --all`.

## If push fails

| Symptom | Fix |
| -------- | --- |
| "has no description" | `jj describe -m "message"` on current rev, then push again. Or move bookmark to a described rev: `jj bookmark set <name> -r <rev> -B` then push. |
| "Refusing to move bookmark backwards" | Use `-B`: `jj bookmark set <name> -r <rev> -B`. |
| Remote bookmark moved / conflict | `jj git fetch`; resolve conflict or set bookmark to desired rev with `-B` if needed, then push. |
