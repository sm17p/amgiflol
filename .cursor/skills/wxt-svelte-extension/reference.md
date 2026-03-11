# Known issues (reference)

When touching related code, consider these tracked issues:

- **#36 — Prefix local storage keys:** Use a fixed prefix (e.g. `amgiflol_`) for all extension storage keys to avoid collisions with host page storage.
- **#17 — Shadow root UI isolation:** Host page root font size / CSS vars can affect extension shadow root UI. Use WXT ShadowRootContentScriptUiOptions (e.g. inheritStyles) or isolate so extension UI is not affected by site globals.
- **#25 — Style tags removed on firefox.com:** Firefox-specific behavior on some sites; shadow root styles removed. Reproduce and narrow (extension injection vs site CSP vs browser quirk) before changing code.
