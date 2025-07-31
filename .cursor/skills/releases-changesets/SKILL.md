---
name: releases-changesets
description: Uses changesets for versioning and changelog; avoids manual version bumps; aligns with build/zip and workflow_dispatch. Use when cutting a release, adding a changeset, preparing for publish, or when touching version or changelog.
---

# Releases and Versioning (changesets)

## Rule

All user-facing or notable changes get a changeset in [.changeset/](.changeset/). Do not edit `package.json` version manually for releases.

## Adding a changeset

- Run `pnpm changeset`, or add a new `.md` file in `.changeset/` with the standard format: semver type (major/minor/patch) and a short summary for the changelog.

## Config

[.changeset/config.json](.changeset/config.json): `changelog: "@changesets/cli/changelog"`, `commit: false`, `baseBranch: "main"`.

## Release steps

1. Build both targets: `pnpm build:all`
2. Create zips: `pnpm zip:all`
3. workflow_dispatch (e.g. issue #27) is the intended automation when available; document in README when in place.
