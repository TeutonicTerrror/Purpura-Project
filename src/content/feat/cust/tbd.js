/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';

    if (window.purpuraThumbnailBackgroundInitialized) return;
    window.purpuraThumbnailBackgroundInitialized = true;

    var STORAGE_KEY = 'tbd';
    var SESSION_KEY = 'purpura_thumbnail_background_disabled';
    var EVENT_NAME = 'purpura-thumbnail-background';

    function publish(value) {
        var disabled = value === true;
        try {
            sessionStorage.setItem(SESSION_KEY, String(disabled));
        } catch (_) {}
        try {
            document.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: disabled }));
        } catch (_) {}
    }

    function refresh() {
        publish(window.__PurpuraSettings.get(STORAGE_KEY) === true);
    }

    function init() {
        window.__PurpuraSettings.ready.then(refresh).catch(function () {});
        chrome.storage.onChanged.addListener(function (changes, namespace) {
            if (namespace !== 'sync' || !changes[STORAGE_KEY]) return;
            refresh();
        });
    }

    init();
})();
