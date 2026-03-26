---
"amgiflol": patch
---

# Storage migration to amg-state

Consolidate extension storage under `amg-state` and migrate shared legacy state.

This updates popup/background/store bindings and E2E coverage for the new storage shape.
Per-domain activation keys are not auto-migrated, so domains may need to be re-enabled once.
