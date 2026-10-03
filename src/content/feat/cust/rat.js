/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    const FEATURE_STORAGE_KEY = 'rat';
    const AGE_THEME_CLASSES = ['age-roblox-theme', 'age-kids-theme', 'age-startmode-theme'];

    const THEME_MAP = {
        'Normal Roblox': 'age-roblox-theme',
        'Roblox Kids': 'age-kids-theme',
        'Roblox Select': 'age-startmode-theme'
    };

    let isEnabled = false;
    let currentTheme = 'Normal Roblox';
    let observer = null;

    async function initialize() {
        await window.__PurpuraSettings.ready;
        const config = window.__PurpuraSettings.get(FEATURE_STORAGE_KEY);

        if (config && typeof config === 'object') {
            isEnabled = !!config.enabled;
            currentTheme = config.theme || 'Normal Roblox';
        } else {
            isEnabled = false;
            currentTheme = 'Normal Roblox';
        }

        if (isEnabled) {
            applyTheme(currentTheme);
            startObserver();
        }
    }

    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== 'local') return;
        if (!changes[FEATURE_STORAGE_KEY]) return;

        const newConfig = window.__PurpuraSettings.get(FEATURE_STORAGE_KEY);
        const oldEnabled = isEnabled;

        const newEnabled = !!(newConfig && newConfig.enabled);

        if (newEnabled) {
            const theme = (newConfig && newConfig.theme) || 'Normal Roblox';
            isEnabled = true;
            currentTheme = theme;
            applyTheme(theme);
            startObserver();
        } else if (oldEnabled && !newEnabled) {
            isEnabled = false;
            removeTheme();
            stopObserver();
        }
    });

    function applyTheme(theme) {
        const themeClass = THEME_MAP[theme] || 'age-roblox-theme';
        document.body.classList.remove(...AGE_THEME_CLASSES);
        document.body.classList.add(themeClass);
    }

    function removeTheme() {
        document.body.classList.remove(...AGE_THEME_CLASSES);
    }

    function startObserver() {
        if (observer) return;
        observer = new MutationObserver(() => {
            if (!isEnabled) return;
            const themeClass = THEME_MAP[currentTheme] || 'age-roblox-theme';
            if (!document.body.classList.contains(themeClass)) {
                document.body.classList.remove(...AGE_THEME_CLASSES);
                document.body.classList.add(themeClass);
            }
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    function stopObserver() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
