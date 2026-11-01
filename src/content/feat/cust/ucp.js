/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';

    if (window.purpuraChatUsernameColorInitialized) return;
    window.purpuraChatUsernameColorInitialized = true;

    var STORAGE_KEY = 'ucp';
    var USERNAME_SELECTOR = '.stylistic-alts-username, .deleted-user-container .user-name';
    var COLORS = [
        '#fd2943',
        '#01a2ff',
        '#02b857',
        '#6b327c',
        '#da8541',
        '#f5cd30',
        '#e8bac8',
        '#d7c59a'
    ];
    var SCAN_DELAY = 150;

    var enabled = false;
    var observer = null;
    var scanTimer = 0;
    var originalColors = new WeakMap();

    function hashUsername(username) {
        var value = 0;
        for (var index = 0; index < username.length; index++) {
            var code = username.charCodeAt(index);
            var reverseIndex = username.length - index;
            if (username.length % 2 === 1) reverseIndex -= 1;
            if (reverseIndex % 4 >= 2) code = -code;
            value += code;
        }
        return value;
    }

    function colorFor(username) {
        var value = hashUsername(username);
        var index = value - Math.floor(value / COLORS.length) * COLORS.length;
        return COLORS[index];
    }

    function usernameOf(element) {
        var text = (element.textContent || '').trim();
        if (!text) return '';
        return text.charAt(0) === '@' ? text.slice(1) : text;
    }

    function paint(element) {
        var username = usernameOf(element);
        if (!username) return;
        var color = colorFor(username);
        if (element.getAttribute('data-purpura-username-color') === color) return;
        if (!originalColors.has(element)) originalColors.set(element, element.style.color);
        element.setAttribute('data-purpura-username-color', color);
        element.style.color = color;
    }

    function restore(element) {
        if (!originalColors.has(element)) return;
        element.style.color = originalColors.get(element);
        originalColors.delete(element);
        element.removeAttribute('data-purpura-username-color');
    }

    function eachUsername(callback) {
        var elements = document.querySelectorAll(USERNAME_SELECTOR);
        for (var index = 0; index < elements.length; index++) callback(elements[index]);
    }

    function scan() {
        eachUsername(paint);
    }

    function queueScan() {
        if (scanTimer) return;
        scanTimer = setTimeout(function () {
            scanTimer = 0;
            scan();
        }, SCAN_DELAY);
    }

    function startObserver() {
        if (observer) return;
        observer = new MutationObserver(queueScan);
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    function stopObserver() {
        if (!observer) return;
        observer.disconnect();
        observer = null;
        if (scanTimer) {
            clearTimeout(scanTimer);
            scanTimer = 0;
        }
    }

    function apply(value) {
        enabled = value === true;
        if (!enabled) {
            eachUsername(restore);
            stopObserver();
            return;
        }
        scan();
        startObserver();
    }

    function refresh() {
        apply(window.__PurpuraSettings.get(STORAGE_KEY) === true);
    }

    function init() {
        window.__PurpuraSettings.ready.then(refresh).catch(function () {});
        chrome.storage.onChanged.addListener(function (changes, namespace) {
            if (namespace !== 'sync' || !changes[STORAGE_KEY]) return;
            refresh();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
