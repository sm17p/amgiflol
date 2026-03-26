# Known issues (reference)

When touching related code, consider these tracked issues:

- **#36 — Prefix local storage keys:** Use a fixed prefix (e.g. `amgiflol_`) for all extension storage keys to avoid collisions with host page storage.
- **#17 — Shadow root UI isolation:** Host page root font size / CSS vars can affect extension shadow root UI. Use WXT ShadowRootContentScriptUiOptions (e.g. inheritStyles) or isolate so extension UI is not affected by site globals.
- **#25 — Style tags removed on firefox.com:** Firefox-specific behavior on some sites; shadow root styles removed. Reproduce and narrow (extension injection vs site CSP vs browser quirk) before changing code.
- **#35 — Minimum Chrome version:** Set via `WXT_MIN_CHROME_VERSION` / [`mise.toml`](../../../mise.toml) `[env]`; Firefox minimum stays literal until Firefox can be tested in automation (see issue). [GitHub issue #35](https://github.com/sm17p/amgiflol/issues/35).
