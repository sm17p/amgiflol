---
name: jj-bookmark-push
description: Uses jj (Jujutsu VCS) to create or update bookmarks and push to the Git remote. Use when creating a branch/bookmark, moving a bookmark to the current revision, or pushing changes with jj instead of git.
---

# jj bookmark and push

Use jj for version control in this project (not git) when creating branches, updating bookmarks, or pushing.

## Create or update a bookmark

Bookmarks are named pointers (like Git branches). Set or move a bookmark to the current revision:

```bash
jj bookmark set <name>
```

Set to a specific revision:

```bash
jj bookmark set <name> -r <rev>
```

Short form: `jj b s <name>`. Use `-B`/`--allow-backwards` to move a bookmark backwards. New commits do not move bookmarks automatically; set the bookmark after committing if you want it to point at the new commit.

## Push to remote

Push one bookmark (maps to same-named Git branch on remote):

```bash
jj git push -b <name>
```

Push all bookmarks: `jj git push --all`. Push only tracked: `jj git push --tracked`. Specify remote: `jj git push --remote <remote>` (default is origin).

Push performs safety checks (similar to `git push --force-with-lease`). If the remote bookmark moved, run `jj git fetch` and resolve any bookmark conflict, then push again.

## Quick workflow

1. Make changes; commit with `jj commit` / `jj new` etc.
2. `jj bookmark set <branch-name>` so the bookmark points at the revision to publish.
3. `jj git push -b <branch-name>`.

List bookmarks: `jj bookmark list` or `jj b l`. List with remotes: `jj bookmark list --all`.
