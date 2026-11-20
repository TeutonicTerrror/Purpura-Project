/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
    'use strict';

    if (window.__purpuraFirefoxContentCompat) return;
    window.__purpuraFirefoxContentCompat = true;

    const nativeFetch = typeof window.fetch === 'function'
        ? window.fetch.bind(window)
        : null;

    function isProxyableRobloxUrl(input) {
        try {
            const raw = typeof input === 'string'
                ? input
                : (input && input.url) || String(input);
            const url = new URL(raw, window.location.href);

            if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
            if (url.origin === window.location.origin) return false;

            const host = url.hostname.toLowerCase();
            return host === 'roblox.com' ||
                host.endsWith('.roblox.com') ||
                host.endsWith('.rbxcdn.com');
        } catch {
            return false;
        }
    }

    function bytesFromBase64(value) {
        if (!value) return new Uint8Array(0);

        const binary = atob(value);
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) {
            bytes[index] = binary.charCodeAt(index);
        }
        return bytes;
    }

    function proxyRobloxFetch(input, init) {
        return new Promise((resolve, reject) => {
            let settled = false;
            const timer = setTimeout(() => {
                finish(reject, new Error('Purpura: Roblox request timed out'));
            }, 20000);

            const finish = (callback, value) => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                callback(value);
            };

            let request;
            try {
                request = new Request(input, init);
            } catch (error) {
                finish(reject, error);
                return;
            }

            const method = request.method.toUpperCase();
            const headers = {};
            request.headers.forEach((value, name) => {
                if (!/^(cookie|host|origin|referer|content-length)$/i.test(name)) {
                    headers[name] = value;
                }
            });

            const bodyPromise = method === 'GET' || method === 'HEAD'
                ? Promise.resolve('')
                : request.text();

            bodyPromise.then((body) => {
                try {
                    chrome.runtime.sendMessage({
                        type: 'PURPURA_FETCH_RESOURCE_REQUEST',
                        url: request.url,
                        method,
                        body,
                        accept: headers.accept || 'application/json, text/plain;q=0.9, */*;q=0.8',
                        csrfToken: headers['x-csrf-token'] || '',
                        headers,
                        responseType: 'arraybuffer'
                    }, (response) => {
                        if (settled) return;

                        if (chrome.runtime.lastError) {
                            finish(reject, new Error(
                                chrome.runtime.lastError.message || 'Purpura: Roblox request failed'
                            ));
                            return;
                        }

                        if (!response || typeof response.status !== 'number' || response.status < 100) {
                            finish(reject, new Error(
                                (response && response.text) || 'Purpura: Roblox request failed'
                            ));
                            return;
                        }

                        const responseHeaders = new Headers();
                        [
                            ['content-type', response.contentType],
                            ['x-csrf-token', response.csrfToken],
                            ['x-bound-auth-token', response.boundAuthToken],
                            ['x-ratelimit-remaining', response.rateLimitRemaining],
                            ['x-ratelimit-reset', response.rateLimitReset],
                            ['retry-after', response.retryAfter]
                        ].forEach(([name, value]) => {
                            if (value) responseHeaders.set(name, value);
                        });

                        const hasBody = ![204, 205, 304].includes(response.status);
                        const responseBody = hasBody
                            ? bytesFromBase64(response.base64)
                            : null;

                        try {
                            finish(resolve, new Response(responseBody, {
                                status: response.status,
                                headers: responseHeaders
                            }));
                        } catch (error) {
                            finish(reject, error);
                        }
                    });
                } catch (error) {
                    finish(reject, error);
                }
            }).catch((error) => finish(reject, error));
        });
    }

    try {
        window.__purpuraFirefoxFetch = proxyRobloxFetch;
    } catch {}

    if (nativeFetch) {
        try {
            window.fetch = function (input, init) {
                if (!isProxyableRobloxUrl(input)) return nativeFetch(input, init);
                return proxyRobloxFetch(input, init);
            };
        } catch {}
    }

    [
        'requestIdleCallback',
        'cancelIdleCallback',
        'requestAnimationFrame',
        'cancelAnimationFrame'
    ].forEach((name) => {
        if (typeof window[name] === 'function') {
            window[name] = window[name].bind(window);
        }
    });

    try {
        if (
            typeof cloneInto === 'function' &&
            typeof window.CustomEvent === 'function'
        ) {
            const NativeCustomEvent = window.CustomEvent;

            const PatchedCustomEvent = function (type, init) {
                if (init && init.detail && typeof init.detail === 'object') {
                    try {
                        init = { ...init, detail: cloneInto(init.detail, window) };
                    } catch {}
                }
                return new NativeCustomEvent(type, init);
            };

            PatchedCustomEvent.prototype = NativeCustomEvent.prototype;
            Object.setPrototypeOf(PatchedCustomEvent, NativeCustomEvent);
            window.CustomEvent = PatchedCustomEvent;
        }
    } catch {}
})();
