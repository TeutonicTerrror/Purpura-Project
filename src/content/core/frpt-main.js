/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
    'use strict';
    if (window.__PURPURA_FRPT_INTERCEPTOR__) return;
    window.__PURPURA_FRPT_INTERCEPTOR__ = true;

    const ACCOUNT_SETTINGS_UI_API_URL = 'https://apis.roblox.com/guac-v2/v1/bundles/account-settings-ui';
    const USER_SETTINGS_API_URL = 'https://apis.roblox.com/user-settings-api/v1/user-settings';
    const SESSION_KEY = 'purpura_freeRobloxPlusThemes';

    let frptEnabled = false;
    try {
        frptEnabled = sessionStorage.getItem(SESSION_KEY) === 'true';
    } catch {}

    let knownTheme = '';

    document.addEventListener('purpura:frpt-enabled', (event) => {
        frptEnabled = event.detail === true;
        try {
            sessionStorage.setItem(SESSION_KEY, String(frptEnabled));
        } catch {}
    });

    document.addEventListener('purpura:frpt-theme-known', (event) => {
        knownTheme = typeof event.detail === 'string' ? event.detail : '';
    });

    function isAccountSettingsUiRequest(url) {
        try {
            const parsedUrl = new URL(url, window.location.origin);
            const endpointUrl = new URL(ACCOUNT_SETTINGS_UI_API_URL);
            return parsedUrl.origin === endpointUrl.origin && parsedUrl.pathname === endpointUrl.pathname;
        } catch {
            return false;
        }
    }

    function isUserSettingsRequest(url) {
        try {
            const parsedUrl = new URL(url, window.location.origin);
            const endpointUrl = new URL(USER_SETTINGS_API_URL);
            return parsedUrl.origin === endpointUrl.origin && parsedUrl.pathname === endpointUrl.pathname;
        } catch {
            return false;
        }
    }

    function applyAccountSettingsUiOverrides(data) {
        return !data || typeof data !== 'object' || Array.isArray(data) || data.appThemesAccess === 'Enabled'
            ? false
            : (data.appThemesAccess = 'Enabled', true);
    }

    function applyUserSettingsThemeOverride(data) {
        if (!frptEnabled || !knownTheme || !data || typeof data !== 'object' || Array.isArray(data)) return false;
        if (data.accountTheme === knownTheme) return false;
        if (typeof data.accountTheme === 'string' && data.accountTheme && data.accountTheme !== 'Default' && data.accountTheme !== 'Classic') {
            return false;
        }
        data.accountTheme = knownTheme;
        return true;
    }

    function announcePickedTheme(body) {
        if (!frptEnabled || typeof body !== 'string' || !body) return;
        let payload = null;
        try {
            payload = JSON.parse(body);
        } catch {
            return;
        }
        if (!payload || typeof payload !== 'object') return;
        for (const key of Object.keys(payload)) {
            const value = payload[key];
            if (typeof value === 'string' && /theme/i.test(key)) {
                knownTheme = value;
                document.dispatchEvent(new CustomEvent('purpura:frpt-theme-picked', { detail: { theme: value } }));
                return;
            }
        }
    }

    function dispatchUserSettingsResponse(data) {
        if (!data || typeof data !== 'object' || Array.isArray(data)) return;
        document.dispatchEvent(new CustomEvent('purpura:user-settings-response', { detail: data }));
    }

    function responseWithJson(response, data) {
        const headers = new Headers(response.headers);
        headers.delete('content-length');
        headers.delete('content-encoding');
        return new Response(JSON.stringify(data), {
            status: response.status,
            statusText: response.statusText,
            headers
        });
    }

    function isGetMethod(method) {
        return String(method || 'GET').toUpperCase() === 'GET';
    }

    async function applyUserSettingsResponseOverrides(response) {
        if (!frptEnabled || !knownTheme) return response;
        try {
            const data = await response.clone().json();
            return applyUserSettingsThemeOverride(data) ? responseWithJson(response, data) : response;
        } catch {
            return response;
        }
    }

    const originalFetch = window.fetch;
    if (typeof originalFetch === 'function') {
        window.fetch = async function (...args) {
            const url = args[0];
            const isReqObj = typeof Request !== 'undefined' && url instanceof Request;
            const requestUrl = typeof url === 'string' ? url : (isReqObj ? url.url : '');
            const requestMethod = (args[1] && args[1].method) || (isReqObj ? url.method : 'GET');
            const requestBody = args[1] && typeof args[1].body === 'string' ? args[1].body : '';
            const isUserSettings = typeof requestUrl === 'string' && isUserSettingsRequest(requestUrl);

            if (isUserSettings && !isGetMethod(requestMethod)) {
                if (requestBody) {
                    announcePickedTheme(requestBody);
                } else if (isReqObj && typeof url.clone === 'function') {
                    url.clone().text().then(announcePickedTheme).catch(() => {});
                }
            }

            let response = await originalFetch(...args);

            if (frptEnabled && isAccountSettingsUiRequest(requestUrl)) {
                try {
                    const data = await response.clone().json();
                    if (applyAccountSettingsUiOverrides(data)) response = responseWithJson(response, data);
                } catch {}
            }

            if (isUserSettings) {
                if (!isGetMethod(requestMethod) && !response.ok && frptEnabled && knownTheme) {
                    response = new Response(JSON.stringify({ accountTheme: knownTheme }), {
                        status: 200,
                        statusText: 'OK',
                        headers: new Headers({ 'content-type': 'application/json' })
                    });
                } else if (isGetMethod(requestMethod)) {
                    response = await applyUserSettingsResponseOverrides(response);
                }
                response.clone().json().then(dispatchUserSettingsResponse).catch(() => {});
            }

            return response;
        };
    }

    const originalXhrOpen = XMLHttpRequest.prototype.open;
    const originalXhrSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        this._purpura_frpt_account_settings_ui = typeof url === 'string' && isAccountSettingsUiRequest(url);
        this._purpura_frpt_user_settings = typeof url === 'string' && isUserSettingsRequest(url);
        this._purpura_frpt_method = method;
        this._purpura_frpt_url = typeof url === 'string' ? url : '';
        return originalXhrOpen.apply(this, [method, url, ...rest]);
    };

    XMLHttpRequest.prototype.send = function (...args) {
        const xhr = this;
        const spoofAccountSettingsUi = xhr._purpura_frpt_account_settings_ui && frptEnabled;
        const spoofUserSettings = xhr._purpura_frpt_user_settings && isGetMethod(xhr._purpura_frpt_method) && frptEnabled && !!knownTheme;

        if (!isGetMethod(xhr._purpura_frpt_method) && xhr._purpura_frpt_user_settings) {
            announcePickedTheme(typeof args[0] === 'string' ? args[0] : '');
        }

        if (spoofAccountSettingsUi || spoofUserSettings) {
            Object.defineProperty(xhr, 'responseText', {
                configurable: true,
                get: function () {
                    if (xhr._purpura_frpt_cached_response) return xhr._purpura_frpt_cached_response;
                    const original = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'responseText').get.call(this);
                    if (this.readyState !== 4) return original;
                    try {
                        const data = JSON.parse(original);
                        let changed = false;
                        if (spoofAccountSettingsUi && applyAccountSettingsUiOverrides(data)) changed = true;
                        if (spoofUserSettings && applyUserSettingsThemeOverride(data)) changed = true;
                        if (changed) return xhr._purpura_frpt_cached_response = JSON.stringify(data);
                    } catch {}
                    return original;
                }
            });
            Object.defineProperty(xhr, 'response', {
                configurable: true,
                get: function () {
                    if (this.responseType === 'json') {
                        try {
                            return JSON.parse(this.responseText);
                        } catch {
                            return Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'response').get.call(this);
                        }
                    }
                    return this.responseText;
                }
            });
        }

        xhr.addEventListener('load', function () {
            if (typeof xhr._purpura_frpt_url === 'string' && isUserSettingsRequest(xhr._purpura_frpt_url)) {
                try {
                    dispatchUserSettingsResponse(JSON.parse(xhr.responseText));
                } catch {}
            }
        });

        return originalXhrSend.apply(this, args);
    };
})();
