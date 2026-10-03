# Contributing to Purpura

This is a guide on how to contribute to Purpura.

## Getting Started

1. **Fork the repository** and clone it locally.
2. Create a new branch for your feature or bug fix.
3. Make your changes in `src/` or `assets/`.
4. Run `npm install` once, then `npm run build` after each change and test in the browser.
5. Submit a Pull Request with a clear description and test notes.

## Where Things Live

* `manifest.json` - permissions, icons, bundle map
* `src/background/background.js` - service worker
* `src/content/*/ - Content  Scripts
* `src/popup/` - popup pages and scripts (`home.html`, `new.html`)
* `src/css/` - Stylesheets
* `src/data/` - Data files
* `assets/images/` - images
* `assets/_locales/` - Translations

## Adding a New Setting

A new toggle touches three places:

1. **Defaults:** `src/data/default_settings.json`
2. **Storage map:** `STORAGE_MAP` in `src/content/core/settings.js` (`sync` for small prefs, `local` for larger/page-local state)
3. **Settings UI:** config in `src/content/ui/psp.js`

**File:** `src/content/ui/psp.js`

Settings are grouped by category (`Friends`, `Catalog`, `Profiles`, `Avatar`, `Games`, `Appearance`, `Privacy`, `Experimental`, `Miscellanious`, etc.).

### Setting Template

```js
yourFeature: {
    label: e("settings_yourFeature_label"),
    description: [ e("settings_yourFeature_desc") ],
    type: "checkbox", // "checkbox", "input", "select", etc.
    storageKey: "yourKey",
    storageType: "sync", // or "local"
    // storagePath: "nestedKey", // for nested objects
    default: true, // only features useful to everyone should default on
    // experimental: true, // beta: true, deprecated: true — should default off
    // subSettings: { ... }
}
```

Add locale keys to `assets/_locales/en/messages.json` (and `es/` if you can) as `settings_yourFeature_label` / `settings_yourFeature_desc`.

### Using Your Setting

```js
await window.__PurpuraSettings.ready;
const enabled = window.__PurpuraSettings.get("yourKey");
await window.__PurpuraSettings.set("yourKey", nextValue);
```

## Adding a New Feature Script

* Create a new file under `src/content/feat/*/` — one file per feature.
* Add it to the bundle order in `vite.config.js`: `ISO_START_ORDER` (`document_start`), `ISO_IDLE_ORDER` (`document_idle`), or `MAIN_ORDER` (page world). Place it after dependencies.
* Reuse `src/content/api/api.js` for API calls and `chrome.i18n.getMessage` for strings.
* Put assets in `assets/images/` or `src/css/` and reference them via `chrome.runtime.getURL`.
* Do not add new permissions unless strictly necessary — explain any permission change in the PR.

## Contributor Badge

Contributors with merged PRs may claim a **Purpura Contributor badge** shown next to your name on profiles.

**File:** `src/data/contributors.json`

Add your Roblox user ID as a string to the array:

```json
["123", "1234", "YOUR_USER_ID_HERE"]
```

Note your GitHub username in the PR description so maintainers can map the entry. The badge is optional and requires approval — trivial or drive-by edits are not eligible.

The tester badge (`assets/images/pBadges/purpura_tester_badge.svg`) is not opt-in — it is assigned to official testers only.

## Code Guidelines

* Keep PRs small and single-feature focused.
* Match existing style: beautified JS, consistent indentation, minimal observers (reuse one if possible).
* Make injected UI blend with Roblox. Use site CSS variables and prefer IDs/structural hooks over visible text.
* Reuse inline SVG icons where possible instead of duplicating shapes.
* All user-facing strings should use `chrome.i18n.getMessage` with locale support.
* Do not intentionally obfuscate, conceal, or encode URLs or executable code.
* Never change host/extension permissions or update `License.md` / branding (`assets/images/icons/PURPURA_TEXT.svg`, etc.) unless the PR is about them.
* Test on the actual Roblox pages your feature targets, with the setting both on and off. Check the console on unrelated pages for errors.

## AI Disclosure — Required on Every PR

See `.agents/ai-disclosure.md` for the full rule. In short:

* State whether AI was used. If not: `AI disclosure: No AI was used.`
* If AI was used, list the tool(s), files/sections produced, and one line of human verification (how you tested in-browser).
* PRs without a disclosure will be asked to add one before review.

## License and Assets

* Source contributions are under **GPL-3.0**.
* `assets/images/` branding remains under TeutonicTerror's copyright and is not covered by GPL-3.0 unless stated. Other assets keep their respective licenses.
* `src/content/feat/cust/aeditor/three/` is Three.js r128 under MIT — leave it as is.

## Need Help?

Open a draft PR or a GitHub issue. Include the Purpura version, browser, URL, expected vs actual behavior, and console output if relevant.
