# Purpura Agent Instructions

Purpura is a browser extension that enhances Roblox in many ways, and it is free, forever.

## Build and test

- `npm install` once, then `npm run build` — writes `build/chromium` and `build/firefox`, plus the packaged zips.
- Test by loading `build/chromium` unpacked, or `build/firefox/manifest.json` as a temporary add-on in `about:debugging`.
- The repository root is not loadable because `manifest.json` points at generated bundles. Never edit built output.

## Hard rules

- Every non-vendored `.js`, `.html`, and `.css` file starts with the project copyright header (`Purpura Extension` / `Copyright © 2026 TeutonicTerror` / `Licensed under the GNU General Public License v3.0.`), exactly once. Vendored `src/content/feat/cust/aeditor/three/` keeps its MIT header.
- LF endings, 2-space indent, no explanatory comments beyond that header.
- No new host or extension permissions unless the change requires them — say why in the pull request.
- Never obfuscate, conceal, or encode URLs or executable code.
- AI-assisted work is welcome, but it must carry the pull request disclosure so maintainers can review generated code for security. Undisclosed AI use is the one thing that gets a pull request sent back.

## Contributing

`.github/CONTRIBUTING.md` covers the workflow.
