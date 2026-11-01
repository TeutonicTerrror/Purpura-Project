/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';

    if (window.purpuraAvatarDownloaderInitialized) return;
    window.purpuraAvatarDownloaderInitialized = true;

    var STORAGE_KEY = 'dav';
    var BUTTON_CLASS = 'purpura-avatar-downloader-button';
    var OVERLAY_ID = 'purpura-avatar-downloader-overlay';
    var STYLE_ID = 'purpura-avatar-downloader-style';
    var CONTAINER_SELECTOR = '.avatar-toggle-button';
    var SIZES = ['150x150', '420x420', '720x720'];
    var TYPES = [
        { key: 'portrait', endpoint: 'avatar-headshot', suffix: 'portrait' },
        { key: 'bust', endpoint: 'avatar-bust', suffix: 'bust' },
        { key: 'avatar', endpoint: 'avatar', suffix: 'avatar' }
    ];
    var PENDING_RETRIES = 10;
    var PENDING_DELAY = 600;
    var SCAN_DELAY = 150;

    var enabled = false;
    var observer = null;
    var scanTimer = 0;
    var selectedSize = '420x420';
    var statusElement = null;
    var actionButtons = [];
    var sizeButtons = [];
    var busy = false;

    function message(key) {
        return chrome.i18n.getMessage(key) || key;
    }

    function userIdFromUrl() {
        var match = window.location.pathname.match(/\/users\/(\d+)\/profile/i);
        return match ? match[1] : '';
    }

    function isProfilePage() {
        return !!userIdFromUrl();
    }

    function usernameFromPage() {
        var element = document.querySelector('.stylistic-alts-username');
        if (!element) return '';
        var text = (element.textContent || '').trim();
        if (!text) return '';
        return text.charAt(0) === '@' ? text.slice(1) : text;
    }

    function usernameFor(userId) {
        var fromPage = usernameFromPage();
        if (fromPage) return Promise.resolve(fromPage);
        return fetch('https://users.roblox.com/v1/users/' + userId, { credentials: 'include' })
            .then(function (response) { return response.ok ? response.json() : null; })
            .then(function (data) { return (data && data.name) || ''; })
            .catch(function () { return ''; });
    }

    function addStyles() {
        if (document.getElementById(STYLE_ID)) return;
        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = [
            '.avatar-toggle-button:has(.' + BUTTON_CLASS + '){display:flex;align-items:center;gap:10px}',
            '.' + BUTTON_CLASS + '{box-sizing:border-box;display:inline-flex!important;align-items:center;justify-content:center;min-height:32px;height:32px;padding:0 14px;border:1px solid var(--purpura-surface300,var(--color-stroke-default,rgba(255,255,255,.16)))!important;border-radius:999px!important;background:var(--purpura-surface200,var(--color-surface-200,#2b2c32))!important;color:var(--purpura-mainText,var(--color-content-emphasis,#fff))!important;font-size:13px;font-weight:600;line-height:1;white-space:nowrap;cursor:pointer;transition:background-color .16s ease,border-color .16s ease}',
            '.' + BUTTON_CLASS + ':hover{border-color:var(--purpura-surface300,var(--color-stroke-default,rgba(255,255,255,.28)))!important;background:var(--purpura-surface300,var(--color-surface-300,#34353b))!important}',
            '.' + BUTTON_CLASS + ':focus-visible{outline:2px solid var(--purpura-playButton,var(--color-action-emphasis,#00a2ff));outline-offset:2px}',
            '#' + OVERLAY_ID + '{position:fixed;inset:0;z-index:100000;background:color-mix(in srgb,var(--purpura-surface0,var(--color-surface-0,#000)) 78%,transparent);display:flex;align-items:center;justify-content:center;padding:20px}',
            '#' + OVERLAY_ID + ' .purpura-dav-dialog{display:flex;flex-direction:column;gap:12px;width:min(440px,94vw);max-height:86vh;padding:20px;border:1px solid var(--purpura-surface300,var(--color-stroke-default,rgba(255,255,255,.14)));border-radius:var(--purpura-radius,var(--radius-medium,12px));background:var(--purpura-surface100,var(--color-surface-100,#1f2025));color:var(--purpura-mainText,var(--color-content-emphasis,#fff));box-shadow:0 20px 60px color-mix(in srgb,var(--purpura-surface0,#000) 55%,transparent)}',
            '#' + OVERLAY_ID + ' .purpura-dav-header{display:flex;align-items:center;gap:10px}',
            '#' + OVERLAY_ID + ' .purpura-dav-header h2{margin:0;flex:1;font-size:18px;font-weight:700;color:inherit}',
            '#' + OVERLAY_ID + ' .purpura-dav-close{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;padding:0;border:1px solid transparent;border-radius:8px;background:transparent;color:inherit;font-size:16px;line-height:1;cursor:pointer;flex-shrink:0}',
            '#' + OVERLAY_ID + ' .purpura-dav-close:hover{background:color-mix(in srgb,var(--purpura-mainText,#fff) 12%,transparent)}',
            '#' + OVERLAY_ID + ' .purpura-dav-label{font-size:13px;color:var(--purpura-secondaryText,var(--color-content-muted,#a3a3a3))}',
            '#' + OVERLAY_ID + ' .purpura-dav-row{display:flex;flex-wrap:wrap;gap:8px}',
            '#' + OVERLAY_ID + ' .purpura-dav-size{flex:1 1 0;min-width:84px;height:34px;border:1px solid var(--purpura-surface300,var(--color-stroke-default,rgba(255,255,255,.16)));border-radius:999px;background:var(--purpura-surface200,var(--color-surface-200,#2b2c32));color:inherit;font-size:12px;font-weight:500;cursor:pointer}',
            '#' + OVERLAY_ID + ' .purpura-dav-size:hover:not(:disabled){background:var(--purpura-surface300,var(--color-surface-300,#34353b))}',
            '#' + OVERLAY_ID + ' .purpura-dav-size.is-selected{border-color:var(--purpura-playButton,var(--color-action-emphasis,#00a2ff));background:var(--purpura-playButton,var(--color-action-emphasis,#00a2ff));color:#fff;font-weight:600}',
            '#' + OVERLAY_ID + ' .purpura-dav-action{flex:1 1 0;min-width:110px;height:38px;border:1px solid var(--purpura-surface300,var(--color-stroke-default,rgba(255,255,255,.16)));border-radius:8px;background:var(--purpura-surface200,var(--color-surface-200,#2b2c32));color:inherit;font-size:13px;font-weight:600;cursor:pointer}',
            '#' + OVERLAY_ID + ' .purpura-dav-action:hover:not(:disabled){background:var(--purpura-surface300,var(--color-surface-300,#34353b))}',
            '#' + OVERLAY_ID + ' button:disabled{opacity:.5;cursor:not-allowed}',
            '#' + OVERLAY_ID + ' .purpura-dav-status{min-height:16px;font-size:12px;color:var(--purpura-secondaryText,var(--color-content-muted,#a3a3a3))}'
        ].join('\n');
        (document.head || document.documentElement).appendChild(style);
    }

    function closeOverlay() {
        var overlay = document.getElementById(OVERLAY_ID);
        if (overlay) overlay.remove();
        document.removeEventListener('keydown', closeOnEscape);
        statusElement = null;
        actionButtons = [];
        sizeButtons = [];
    }

    function closeOnEscape(event) {
        if (event.key === 'Escape') closeOverlay();
    }

    function setStatus(text) {
        if (statusElement) statusElement.textContent = text || '';
    }

    function paintSizeButtons() {
        var restricted = selectedSize === '720x720';
        sizeButtons.forEach(function (button) {
            button.classList.toggle('is-selected', button.dataset.size === selectedSize);
        });
        actionButtons.forEach(function (button) {
            if (button.dataset.restricted !== 'true') return;
            button.disabled = restricted || busy;
        });
    }

    function thumbnailUrl(userId, endpoint, size) {
        return 'https://thumbnails.roblox.com/v1/users/' + endpoint +
            '?userIds=' + encodeURIComponent(userId) +
            '&size=' + size +
            '&format=Png' +
            '&isCircular=false';
    }

    function fetchThumbnail(userId, endpoint, size, attempt) {
        attempt = attempt || 0;
        return fetch(thumbnailUrl(userId, endpoint, size), { credentials: 'include' })
            .then(function (response) { return response.ok ? response.json() : null; })
            .then(function (data) {
                var entry = data && Array.isArray(data.data) ? data.data[0] : null;
                if (entry && entry.state === 'Completed' && entry.imageUrl) return entry.imageUrl;
                if (attempt >= PENDING_RETRIES) return null;
                return new Promise(function (resolve) {
                    setTimeout(resolve, PENDING_DELAY);
                }).then(function () {
                    return fetchThumbnail(userId, endpoint, size, attempt + 1);
                });
            })
            .catch(function () { return null; });
    }

    function saveBlob(blob, filename) {
        var url = URL.createObjectURL(blob);
        var anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    }

    function download(userId, type, button) {
        if (busy) return;
        busy = true;
        paintSizeButtons();
        setStatus(message('avatarDownloader_downloading'));
        var size = selectedSize;

        fetchThumbnail(userId, type.endpoint, size)
            .then(function (imageUrl) {
                if (!imageUrl) throw new Error('thumbnail unavailable');
                return fetch(imageUrl);
            })
            .then(function (response) {
                if (!response || !response.ok) throw new Error('thumbnail download failed');
                return response.blob();
            })
            .then(function (blob) {
                return usernameFor(userId).then(function (username) {
                    saveBlob(blob, (username || userId) + '_' + type.suffix + '_' + size + '.png');
                    setStatus('');
                });
            })
            .catch(function () {
                setStatus(message('avatarDownloader_failed'));
            })
            .finally(function () {
                busy = false;
                paintSizeButtons();
            });
    }

    function makeButton(className, text, dataset) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = className;
        button.textContent = text;
        if (dataset) {
            Object.keys(dataset).forEach(function (key) {
                button.dataset[key] = dataset[key];
            });
        }
        return button;
    }

    function openOverlay(userId) {
        if (document.getElementById(OVERLAY_ID)) return;
        addStyles();

        var overlay = document.createElement('div');
        overlay.id = OVERLAY_ID;

        var dialog = document.createElement('div');
        dialog.className = 'purpura-dav-dialog';

        var header = document.createElement('div');
        header.className = 'purpura-dav-header';
        var title = document.createElement('h2');
        title.textContent = message('avatarDownloader_title');
        var close = makeButton('purpura-dav-close', '\u2715');
        close.setAttribute('aria-label', message('avatarDownloader_close'));
        close.title = message('avatarDownloader_close');
        close.addEventListener('click', closeOverlay);
        header.appendChild(title);
        header.appendChild(close);

        var label = document.createElement('div');
        label.className = 'purpura-dav-label';
        label.textContent = message('avatarDownloader_size');

        var sizeRow = document.createElement('div');
        sizeRow.className = 'purpura-dav-row';
        SIZES.forEach(function (size) {
            var button = makeButton('purpura-dav-size', size, { size: size });
            button.addEventListener('click', function () {
                if (busy) return;
                selectedSize = size;
                paintSizeButtons();
            });
            sizeButtons.push(button);
            sizeRow.appendChild(button);
        });

        var actionRow = document.createElement('div');
        actionRow.className = 'purpura-dav-row';
        TYPES.forEach(function (type) {
            var button = makeButton('purpura-dav-action', message('avatarDownloader_' + type.key), {
                restricted: type.suffix === 'avatar' ? 'false' : 'true'
            });
            button.addEventListener('click', function () {
                download(userId, type, button);
            });
            actionButtons.push(button);
            actionRow.appendChild(button);
        });

        statusElement = document.createElement('div');
        statusElement.className = 'purpura-dav-status';

        dialog.appendChild(header);
        dialog.appendChild(label);
        dialog.appendChild(sizeRow);
        dialog.appendChild(actionRow);
        dialog.appendChild(statusElement);
        overlay.appendChild(dialog);
        overlay.addEventListener('click', function (event) {
            if (event.target === overlay) closeOverlay();
        });
        document.body.appendChild(overlay);
        document.addEventListener('keydown', closeOnEscape);
        paintSizeButtons();
    }

    function injectButton(container) {
        if (container.querySelector('.' + BUTTON_CLASS)) return;
        var button = makeButton(BUTTON_CLASS, message('avatarDownloader_button'));
        button.addEventListener('click', function () {
            var userId = userIdFromUrl();
            if (!userId) return;
            openOverlay(userId);
        });
        container.prepend(button);
    }

    function scan() {
        if (!enabled || !isProfilePage()) return;
        var containers = document.querySelectorAll(CONTAINER_SELECTOR);
        for (var index = 0; index < containers.length; index++) injectButton(containers[index]);
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
        observer.observe(document.documentElement, { childList: true, subtree: true });
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

    function removeUi() {
        var buttons = document.querySelectorAll('.' + BUTTON_CLASS);
        for (var index = 0; index < buttons.length; index++) buttons[index].remove();
        closeOverlay();
    }

    function apply(value) {
        enabled = value === true;
        if (!enabled) {
            removeUi();
            stopObserver();
            return;
        }
        addStyles();
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
