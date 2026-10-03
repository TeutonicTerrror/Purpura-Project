/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
    const STORAGE_KEY = 'spc';
    const LEGACY_KEY = 'spc-legacy';

    function normalize(value) {
        if (typeof value === 'object' && value !== null) {
            if (value.enabled !== true) return 'off';
            return normalize(value.mode);
        }
        if (value === true) return 'offline';
        if (value === false || value === undefined || value === null) return 'off';
        const lower = String(value).toLowerCase();
        if (lower === 'offline' || lower === 'studio' || lower === 'in-studio' || lower === 'off') return lower === 'in-studio' ? 'studio' : lower;
        return 'off';
    }

    function dispatchMode(mode) {
        document.dispatchEvent(new CustomEvent('purpura-status-spoofer', { detail: { mode } }));
    }

    function init() {
        window.__PurpuraSettings.ready.then(function() {
            const spcVal = window.__PurpuraSettings.get(STORAGE_KEY);
            if (spcVal !== undefined) {
                dispatchMode(normalize(spcVal));
                return;
            }

            const legacyValue = window.__PurpuraSettings.get(LEGACY_KEY);
            const mode = normalize(legacyValue);
            const newValue = { enabled: !!legacyValue, mode: 'offline' };
            window.__PurpuraSettings.set(STORAGE_KEY, newValue).then(function () {
                dispatchMode(mode);
            });
        });

        chrome.storage.onChanged.addListener((changes, area) => {
            if (area !== 'sync') return;
            if (changes[STORAGE_KEY]) {
                dispatchMode(normalize(window.__PurpuraSettings.get(STORAGE_KEY)));
            }
            if (changes[LEGACY_KEY]) {
                const enabled = !!window.__PurpuraSettings.get(LEGACY_KEY);
                const mode = normalize(enabled ? 'offline' : 'off');
                const newValue = { enabled, mode: 'offline' };
                window.__PurpuraSettings.set(STORAGE_KEY, newValue);
                dispatchMode(mode);
            }
        });
    }

    init();
})();
