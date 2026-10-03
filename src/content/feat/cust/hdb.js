/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
    if (window.purpuraHideDownloadBtnInitialized) return;
    window.purpuraHideDownloadBtnInitialized = true;

    let isEnabled = true;
    let observer = null;

    const STORAGE_KEY = 'hdb';
    const DOWNLOAD_SELECTOR = '.navbar-download-app-item';
    const HIDE_CSS = `
        /* Purpura Hide Download Button */
        ${DOWNLOAD_SELECTOR} {
            display: none !important;
        }
        a[href*="/download"],
        a[href*="roblox.com/download"],
        a[href*="setup.roblox.com"],
        a[href^="https://www.roblox.com/download"] {
            display: none !important;
        }
    `;

    function applyHide() {
        const style = document.getElementById('purpura-hide-download-btn');
        if (!style || !style.isConnected) {
            createStyle();
        }
        hideExisting();
    }

    function createStyle() {
        const existing = document.getElementById('purpura-hide-download-btn');
        if (existing) existing.remove();

        const style = document.createElement('style');
        style.id = 'purpura-hide-download-btn';
        style.textContent = HIDE_CSS;
        document.head.appendChild(style);
    }

    function hideExisting() {
        document.querySelectorAll(DOWNLOAD_SELECTOR).forEach(el => {
            el.style.display = 'none';
        });
    }

    function revertHide() {
        const style = document.getElementById('purpura-hide-download-btn');
        if (style) style.remove();

        document.querySelectorAll(DOWNLOAD_SELECTOR).forEach(el => {
            el.style.display = '';
        });
    }

    function setupObserver() {
        if (!isEnabled) return;
        removeObserver();

        observer = new MutationObserver(() => {
            if (!document.getElementById('purpura-hide-download-btn')) {
                createStyle();
            }
            hideExisting();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function removeObserver() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    }

    function init() {
        window.__PurpuraSettings.ready.then(function() {
            const saved = window.__PurpuraSettings.get(STORAGE_KEY);
            isEnabled = saved !== false;

            if (isEnabled) {
                applyHide();
                setupObserver();
            }
        });
    }

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace !== 'local') return;
        if (!changes[STORAGE_KEY]) return;

        const newVal = window.__PurpuraSettings.get(STORAGE_KEY);
        isEnabled = newVal !== false;

        if (isEnabled) {
            applyHide();
            setupObserver();
        } else {
            revertHide();
            removeObserver();
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
