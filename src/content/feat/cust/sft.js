/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
    'use strict';

    if (window.purpuraSiteFontInitialized) return;
    window.purpuraSiteFontInitialized = true;

    const STORAGE_KEY = 'sft';
    const STYLE_ID = 'purpura-site-font';
    const GOOGLE_FONTS_CSS = 'https://fonts.googleapis.com/css2?family=';

    const KEEP_SELECTOR =
        ':not([class*="icon"])' +
        ':not(.purpura-settings-root):not(.purpura-settings-root *)' +
        ':not(.purpura-theme-modal):not(.purpura-theme-modal *)';

    function cleanFamily(name) {
        return String(name).replace(/[\s'"]+/g, ' ').trim();
    }

    function fromFamily(name) {
        const family = cleanFamily(name);
        if (!family) return null;
        return {
            family: family,
            url: GOOGLE_FONTS_CSS +
                encodeURIComponent(family).replace(/%20/g, '+').replace(/%2B/gi, '+') +
                '&display=swap'
        };
    }

    function fromStylesheetUrl(url) {
        const match = String(url).match(/[?&]family=([^&]+)/i);
        if (!match) return null;
        const first = decodeURIComponent(match[1]).split('|')[0].replace(/\+/g, ' ').split(':')[0];
        return fromFamily(first);
    }

    function resolveFont(input) {
        if (typeof input !== 'string') return null;
        const value = input.trim();
        if (!value) return null;

        const importMatch = value.match(
            /@import\s+(?:url\()?\s*['"]?(https?:\/\/fonts\.googleapis\.com\/[^'")\s]+)['"]?\s*\)?/i
        );
        if (importMatch) return fromStylesheetUrl(importMatch[1]);

        if (/^https?:\/\/fonts\.googleapis\.com\//i.test(value)) return fromStylesheetUrl(value);

        const specimen = value.match(/fonts\.google\.com\/specimen\/([^/?#\s]+)/i);
        if (specimen) return fromFamily(decodeURIComponent(specimen[1]).replace(/\+/g, ' '));

        if (/^[A-Za-z0-9][A-Za-z0-9 +'’&.-]{0,60}$/.test(value)) return fromFamily(value);

        return null;
    }

    function removeSiteFont() {
        const existing = document.getElementById(STYLE_ID);
        if (existing) existing.remove();
    }

    function applySiteFont(config) {
        const enabled = !!(config && (config === true || config.enabled));
        const raw = config && typeof config === 'object' && typeof config.fontUrl === 'string'
            ? config.fontUrl
            : '';

        if (!enabled) {
            removeSiteFont();
            return;
        }

        const resolved = resolveFont(raw);
        if (!resolved) {
            removeSiteFont();
            return;
        }

        removeSiteFont();

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent =
            "@import url('" + resolved.url + "');\n" +
            '* ' + KEEP_SELECTOR + ' {\n' +
            "    font-family: '" + resolved.family.replace(/\\/g, '\\\\').replace(/'/g, "\\'") +
            "', ui-sans-serif, system-ui, sans-serif !important;\n" +
            '}';
        (document.head || document.documentElement).appendChild(style);
    }

    function refresh() {
        applySiteFont(window.__PurpuraSettings.getRaw(STORAGE_KEY));
    }

    function init() {
        window.__PurpuraSettings.ready.then(refresh).catch(() => {});
        chrome.storage.onChanged.addListener(function (changes, namespace) {
            if (namespace !== 'local' || !changes[STORAGE_KEY]) return;
            refresh();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
