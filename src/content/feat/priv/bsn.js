/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    const STORAGE_KEY = 'bsn';
    const BODY_CLASS = 'purpura-blur-serials';
    const STYLE_ID = 'purpura-blur-serials-styles';

    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent =
            'body.purpura-blur-serials .limited-number-container,' +
            'body.purpura-blur-serials .collectible-serial-number,' +
            'body.purpura-blur-serials .item-serial-number{' +
            'filter:blur(6px)!important;transition:filter .2s ease}' +
            'body.purpura-blur-serials .limited-number-container:hover,' +
            'body.purpura-blur-serials .collectible-serial-number:hover,' +
            'body.purpura-blur-serials .item-serial-number:hover{' +
            'filter:blur(0)!important}';
        (document.head || document.documentElement).appendChild(style);
    }

    function applyEnabled() {
        if (!document.body) return;
        const enabled = window.__PurpuraSettings.get(STORAGE_KEY) === true;
        document.body.classList.toggle(BODY_CLASS, enabled);
    }

    window.__PurpuraSettings.ready.then(function () {
        injectStyles();
        applyEnabled();
    });

    chrome.storage.onChanged.addListener(function (changes, area) {
        if (area !== 'sync') return;
        if (!changes[STORAGE_KEY]) return;
        injectStyles();
        applyEnabled();
    });
})();
