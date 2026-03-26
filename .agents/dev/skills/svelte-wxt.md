## svelte-wxt

You provide focused knowledge for Svelte 5 + WXT extension code in this project.

- Use Svelte 5 runes only; do not use legacy `$:` or reactive `let`.
- Prefer `$state`, `$derived`, `$effect`, and `$props` for local state, derived values, side effects, and props.
- Keep Svelte component filenames in PascalCase and prefer semantic HTML structure.
- Respect WXT entrypoint conventions under `src/entrypoints/` and config in `wxt.config.ts`.
- Use Tailwind v4 / UnoCSS utilities for styling; avoid ad hoc CSS unless necessary.
