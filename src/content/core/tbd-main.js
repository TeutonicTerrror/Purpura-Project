/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';

    if (window.__purpuraThumbnailBackgroundMain) return;
    window.__purpuraThumbnailBackgroundMain = true;

    var SESSION_KEY = 'purpura_thumbnail_background_disabled';
    var EVENT_NAME = 'purpura-thumbnail-background';
    var THUMBNAILS_HOST = 'thumbnails.roblox.com';

    var disabled = false;
    try {
        disabled = sessionStorage.getItem(SESSION_KEY) === 'true';
    } catch (_) {}

    function isThumbnailsRequest(url) {
        if (!url || typeof url !== 'string') return false;
        try {
            return new URL(url, window.location.origin).hostname === THUMBNAILS_HOST;
        } catch (_) {
            return false;
        }
    }

    function rewriteUrl(url) {
        if (!disabled || !isThumbnailsRequest(url)) return url;
        try {
            var target = new URL(url, window.location.origin);
            target.searchParams.set('includeBackground', 'false');
            return target.toString();
        } catch (_) {
            return url;
        }
    }

    function rewriteBody(body) {
        if (!disabled || typeof body !== 'string' || !body) return body;
        try {
            var data = JSON.parse(body);
            if (!data || typeof data !== 'object') return body;
            if (Array.isArray(data)) {
                for (var index = 0; index < data.length; index++) {
                    var entry = data[index];
                    if (entry && typeof entry === 'object') entry.includeBackground = false;
                }
            } else {
                data.includeBackground = false;
            }
            return JSON.stringify(data);
        } catch (_) {
            return body;
        }
    }

    function isRequest(input) {
        return typeof Request === 'function' && input instanceof Request;
    }

    function requestUrlOf(input) {
        if (typeof input === 'string') return input;
        if (isRequest(input)) return input.url;
        if (input && typeof input.url === 'string') return input.url;
        return '';
    }

    async function rewriteFetchArgs(args) {
        var input = args[0];
        var init = args[1];
        var url = requestUrlOf(input);

        if (!disabled || !isThumbnailsRequest(url)) return args;

        var rewrittenUrl = rewriteUrl(url);

        if (init && init.body !== undefined) {
            var rewrittenInit = {};
            Object.keys(init).forEach(function (key) {
                rewrittenInit[key] = init[key];
            });
            rewrittenInit.body = rewriteBody(init.body);
            return [rewrittenUrl, rewrittenInit];
        }

        if (!isRequest(input)) return [rewrittenUrl, init];

        try {
            var body = await input.clone().text();
            var rewrittenBody = rewriteBody(body);
            if (rewrittenUrl === url && rewrittenBody === body) return args;
            return [
                new Request(rewrittenUrl, {
                    method: input.method,
                    headers: input.headers,
                    body: rewrittenBody || undefined,
                    credentials: input.credentials,
                    mode: input.mode,
                    cache: input.cache,
                    redirect: input.redirect,
                    referrer: input.referrer,
                    referrerPolicy: input.referrerPolicy,
                    integrity: input.integrity,
                    keepalive: input.keepalive
                }),
                init
            ];
        } catch (_) {
            return args;
        }
    }

    var originalFetch = window.fetch;
    window.fetch = function () {
        var args = arguments;
        if (!disabled || !isThumbnailsRequest(requestUrlOf(args[0]))) {
            return originalFetch.apply(this, args);
        }
        var target = this;
        return rewriteFetchArgs(args).then(function (rewritten) {
            return originalFetch.apply(target, rewritten);
        });
    };

    var originalOpen = XMLHttpRequest.prototype.open;
    var originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url) {
        var args = Array.prototype.slice.call(arguments);
        if (typeof url === 'string' && disabled && isThumbnailsRequest(url)) {
            args[1] = rewriteUrl(url);
            this.__purpuraThumbnailBackgroundUrl = args[1];
        } else {
            this.__purpuraThumbnailBackgroundUrl = typeof url === 'string' ? url : '';
        }
        return originalOpen.apply(this, args);
    };

    XMLHttpRequest.prototype.send = function (body) {
        var args = Array.prototype.slice.call(arguments);
        if (disabled && isThumbnailsRequest(this.__purpuraThumbnailBackgroundUrl)) {
            args[0] = rewriteBody(body);
        }
        return originalSend.apply(this, args);
    };

    document.addEventListener(EVENT_NAME, function (event) {
        disabled = event.detail === true;
        try {
            sessionStorage.setItem(SESSION_KEY, String(disabled));
        } catch (_) {}
    });
})();
