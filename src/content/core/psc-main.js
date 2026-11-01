/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';

    if (window.__purpuraPrivateServerControlsCreateWatcher) return;
    window.__purpuraPrivateServerControlsCreateWatcher = true;

    const CREATE_ENDPOINT = 'games.roblox.com/v1/games/vip-servers/';
    const CREATED_EVENT = 'purpura-private-server-created';

    function isPrivateServerCreation(url, method) {
        if (!url || typeof url !== 'string') return false;
        if (url.indexOf(CREATE_ENDPOINT) === -1) return false;
        return String(method || '').toUpperCase() === 'POST';
    }

    function emitCreated(payload) {
        try {
            document.dispatchEvent(new CustomEvent(CREATED_EVENT, { detail: payload }));
        } catch (_) {}
    }

    const originalFetch = window.fetch;
    window.fetch = function (input, init) {
        const url = typeof input === 'string' ? input : (input && input.url) || '';
        const method = (init && init.method) || (input && input.method) || '';
        const request = originalFetch.apply(this, arguments);

        if (isPrivateServerCreation(url, method)) {
            try {
                request.then(function (response) {
                    if (!response || !response.ok) return;
                    response.clone().json().then(function (data) {
                        emitCreated(data || {});
                    }).catch(function () {});
                }).catch(function () {});
            } catch (_) {}
        }

        return request;
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url) {
        this._purpuraMethod = method;
        this._purpuraUrl = typeof url === 'string' ? url : '';
        return originalOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function () {
        if (isPrivateServerCreation(this._purpuraUrl, this._purpuraMethod)) {
            this.addEventListener('load', function () {
                if (this.status < 200 || this.status >= 300) return;
                try {
                    emitCreated(JSON.parse(this.responseText));
                } catch (_) {}
            });
        }
        return originalSend.apply(this, arguments);
    };
})();
