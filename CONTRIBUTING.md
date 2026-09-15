# Contributing to Purpura

Thanks for considering a contribution. This repository hosts the unpacked extension as distributed on the Chrome Web Store, so you can read, test, and propose changes directly against the files you install.

## Getting started

1. Fork the repository and clone it locally.
2. Create a branch for your change.
3. Edit the relevant files and verify in the browser.
4. Open a pull request with a clear description and test notes.

## Prerequisites

* Chromium-based browser with Developer Mode
* No build tools or hosting required. Settings are stored in `chrome.storage` and no backend is needed.

## Testing your changes

This repository is already runnable as an unpacked extension. No build step is needed.

1. Open `chrome://extensions` and enable Developer Mode.
2. Click Load unpacked and select the repository root (the folder containing `manifest.json`).
3. After editing files, click Reload on the extension card. For background changes (`background.js`), reload the extension fully and then reload any open Roblox pages.

## Where things live

* `manifest.json` -- permission and content script map
* `background.js` and `content/core/` -- settings storage, migration, and page bridges
* `content/feat/` -- feature implementations, grouped by area:
  * `cat/` catalog and marketplace
  * `cust/` avatar and appearance
  * `game/` games and home
  * `soc/` friends, profiles, social
  * `serv/` servers
  * `priv/` and `misc/` status, privacy, misc
* `content/ui/` -- settings pages (`psp.js`) and on-page UI (`pg.js`, `gr.js`, etc.)
* `content/api/api.js` -- shared Roblox API helpers
* `_locales/` and `data/default_settings.json` -- user-facing strings and feature defaults
* `css/`, `images/`, `data/`, `rules/` -- static assets

## Adding or changing a setting

Settings are user toggled features. A typical new toggle touches three places:

1. **Defaults:** add an entry in `data/default_settings.json`.
2. **Storage map:** add the key to `STORAGE_MAP` in `content/core/settings.js` (`sync` for small preference state, `local` for larger or page local state).
3. **Settings UI:** register the toggle in the settings config inside `content/ui/psp.js`:
   * Pick the correct category (`Friends`, `Catalog`, `Profiles`, `Avatar`, `Games`, `Appearance`, `Privacy`, `Experimental`, `Miscellanious`, etc.).
   * Provide `label` and `description` via `chrome.i18n.getMessage` keys. Add those keys to `_locales/en/messages.json` (and `es/` if you can) as `settings_yourFeature_label` and `settings_yourFeature_desc`.
   * Set `storageKey`, `storageType` (`sync` or `local`), and optionally `storagePath` for nested objects, plus `default`.
   * Use `experimental: true` or `beta: true` for unstable features. Those should default to off.

Reading the setting at runtime:

```js
// before use
await window.__PurpuraSettings.ready;
var enabled = window.__PurpuraSettings.get("yourKey");
// or for the full object
var raw = window.__PurpuraSettings.getRaw("yourKey");
```

Writing:

```js
await window.__PurpuraSettings.set("yourKey", nextValue);
```

## Adding a new feature script

* Create a new file under the matching `content/feat/*/` subfolder. Prefer a new file per feature.
* Keep the required GPL header at the top of the file (see License and assets). Never add or change headers in `content/feat/cust/aeditor/three/*` (vendored Three.js, MIT).
* Register the script in `manifest.json` under `content_scripts` with a precise `matches` pattern and the appropriate `run_at`.
* If the feature needs API calls, reuse `content/api/api.js`.
* For localized UI text, add keys under `_locales/en/messages.json` and read them with `chrome.i18n.getMessage`.
* Do not intentionally obfuscate, conceal, or encode URLs, functionality, or executable code. Code should remain reasonably inspectable and understandable.
* Do not add new extension permissions or host permissions unless they are strictly necessary. Explain any required permission change in the pull request description.
* Match existing style: beautified JS, consistent indentation, minimal observers used only where needed. Reuse an existing observer if one can cover the case.

## Icons and styling

* Icons live as inline SVGs near the feature that uses them. Reuse an existing icon where possible rather than duplicating similar shapes.
* Style injected UI to blend with Roblox. Use site CSS variables where available and avoid making the page look foreign. Keep selectors language agnostic (prefer IDs and structural hooks over visible text).

## Localization

* All user facing strings that appear on roblox.com should be behind `chrome.i18n.getMessage` so translations can cover them.
* Add keys to `_locales/en/messages.json` in the `settings_*` or feature namespace. Keep descriptions concise.

## Testing checklist

* Load the repository root unpacked and exercise the feature on the actual Roblox pages it targets (catalog, avatar editor, game page, profile, home, my/account for Purpura Settings).
* Toggle the setting off and on in Purpura Settings and reload the page. Verify no console errors on pages the feature does not target.
* If you touched storage or migration (`settings.js`, `sk-migrate.js`), test upgrading from existing stored values as well as from a fresh profile.

## Contributor badge

Contributors whose pull requests are merged may be eligible for a **Purpura Contributor badge** -- a small hexagon badge with a sparkle shine shown next to your display name on profile pages, visible to everyone running the extension. It uses `images/purpura_contributor_badge.svg` from this repository, so no external API is required.

If you would like the badge, add your Roblox user ID as a string to the array in `data/contributors.json` as part of your pull request and note your GitHub username in the PR description so maintainers can map the entry (JSON does not allow comments inside the file). The contribution itself needs approval -- your pull request must be reviewed and merged, and trivial or drive-by edits are not eligible for the badge. The file ships with the extension, so after the release that contains your ID, the badge will appear on your profile. The badge is optional -- you can contribute without requesting it.

## Pull requests

* Keep PRs small and single feature focused. Large overhauls are hard to review.
* Include a short summary, what you changed, and how you tested it (pages visited, on and off states).
* Do not change versioning, `License.md`, or branding assets (`images/PURPURA_TEXT.svg`, `images/icons/*`) unless the PR is specifically about them.

## Reporting bugs and requesting features

* Use the GitHub issue templates for bug reports and feature requests. Include the Purpura version (`chrome://extensions`), browser, affected URL, expected versus actual behavior, and console output if relevant.

## License and assets

* Source code contributions should be submitted under GPL-3.0 and, where applicable, will be distributed under GPL-3.0.
* `images/` contains Purpura branding and other visual assets. Purpura branding remains under the copyrights of TeutonicTerror and is not covered by GPL-3.0 unless explicitly stated. Other assets in this directory remain subject to their respective copyrights and licenses.
* `content/feat/cust/aeditor/three/` is Three.js r128 under MIT. Leave it as is and do not copy it elsewhere under GPL-3.0.

## Community

* Be respectful. Keep contributions focused on user value and stability.
* The contributor badge is a thank-you, not a reward for drive-by edits. Maintainers may decline badge requests for trivial changes.
* If you are unsure about direction, open a draft PR or a discussion issue first.
