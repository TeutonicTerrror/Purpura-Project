/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
    let streamerModeEnabled = false;
    let statusSpooferMode = 'off';
    let statusSpooferTimer = null;

    const SPOOF_MSG = 'Purpura Streamer Mode is enabled. This data is hidden.';
    const SESSION_SPOOF = 'Purpura Streamer Mode is active. Disable to view.';

    try {
        streamerModeEnabled = sessionStorage.getItem('purpura_streamermode') === 'true';
    } catch {}

    function isStreamerActive() {
        if (streamerModeEnabled) return true;
        try {
            const val = sessionStorage.getItem('purpura_streamermode');
            if (val === 'true') {
                streamerModeEnabled = true;
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }

    const originalFetch = window.fetch;
    const originalXhrOpen = XMLHttpRequest.prototype.open;
    const originalXhrSend = XMLHttpRequest.prototype.send;

    function uuidv4() {
        return crypto.randomUUID?.() ||
            'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                const r = (Math.random() * 16) | 0;
                const v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            });
    }

    const SPOOFER_TARGET = 'https://apis.roblox.com/user-heartbeats-api/pulse';

    async function sendStudioHeartbeat() {
        const body = {
            clientSideTimestampEpochMs: Date.now(),
            locationInfo: { studioLocationInfo: { placeId: 0 } },
            sessionInfo: { sessionId: uuidv4() }
        };
        try {
            await originalFetch(SPOOFER_TARGET, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        } catch {}
    }

    function setStatusSpooferMode(newMode) {
        statusSpooferMode = newMode;
        if (statusSpooferTimer) {
            clearInterval(statusSpooferTimer);
            statusSpooferTimer = null;
        }
        if (newMode === 'offline' || newMode === 'studio') {
            sendStudioHeartbeat();
            statusSpooferTimer = setInterval(sendStudioHeartbeat, 60000);
        }
    }

    function setStreamerMode(enabled) {
        streamerModeEnabled = enabled;
    }

    function getStreamerTarget(url) {
        if (!url || typeof url !== 'string') return null;
        if (url.includes('/my/settings/json')) return 'settings';
        if (url.includes('v1/phone')) return 'phone';
        if (url.includes('v1/birthdate')) return 'birthdate';
        if (url.includes('verified-age')) return 'age';
        if (url.includes('account-country')) return 'country';
        if (url.includes('age-group')) return 'agegroup';
        if (url.includes('sessions')) return 'sessions';
        if (url.includes('v1/emails')) return 'email';
        return null;
    }

    function applySpoof(data, target) {
        if (!data || typeof data !== 'object') return data;
        switch (target) {
            case 'settings':
                data.UserEmail = SPOOF_MSG;
                data.UserEmailVerified = true;
                data.PreviousUserNames = SPOOF_MSG;
                break;
            case 'email':
                data.verifiedEmail = SPOOF_MSG;
                break;
            case 'phone':
                data.countryCode = SPOOF_MSG;
                data.prefix = SPOOF_MSG;
                data.phone = SPOOF_MSG;
                break;
            case 'birthdate':
                data.birthMonth = 0;
                data.birthDay = 0;
                data.birthYear = 0;
                break;
            case 'age':
                data.verifiedAge = 0;
                data.isSeventeenPlus = false;
                break;
            case 'country':
                if (data.value) {
                    data.value.countryName = SPOOF_MSG;
                    data.value.localizedName = SPOOF_MSG;
                    data.value.countryId = 1;
                }
                break;
            case 'agegroup':
                data.ageGroupTranslationKey = SPOOF_MSG;
                break;
            case 'sessions':
                if (data.sessions) {
                    data.sessions.forEach(s => {
                        if (s.location) {
                            s.location.city = '';
                            s.location.subdivision = '';
                            s.location.country = SESSION_SPOOF;
                        }
                        if (s.agent) {
                            s.agent.os = 'Hidden';
                            s.agent.type = 'App';
                        }
                        s.lastAccessedIp = 'Hidden';
                        s.lastAccessedTimestampEpochMilliseconds = '0';
                    });
                }
                break;
        }
        return data;
    }

    async function spoofFetchResponse(response, target) {
        if (!response.ok) return response;
        try {
            const clone = response.clone();
            const data = await clone.json();
            applySpoof(data, target);
            return new Response(JSON.stringify(data), {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
            });
        } catch {
            return response;
        }
    }

    window.fetch = async function(input, init) {
        const requestUrl = typeof input === 'string' ? input : (input instanceof Request ? input.url : '');
        
        if (statusSpooferMode !== 'off' && requestUrl.includes('user-heartbeats-api')) {
            return originalFetch(input, init);
        }

        if (isStreamerActive()) {
            if (requestUrl.includes('presence')) {
                const modifiedInit = init ? { ...init } : {};
                if (!modifiedInit.method || modifiedInit.method === 'GET') {
                    return originalFetch(input, init);
                }
                try {
                    const body = modifiedInit.body ? JSON.parse(typeof modifiedInit.body === 'string' ? modifiedInit.body : '') : {};
                    const newBody = { ...body };
                    if (newBody.userIds) newBody.userIds = [];
                    modifiedInit.body = JSON.stringify(newBody);
                    return originalFetch(input, modifiedInit);
                } catch {
                    return originalFetch(input, init);
                }
            }

            const target = getStreamerTarget(requestUrl);
            if (target) {
                const response = await originalFetch(input, init);
                return spoofFetchResponse(response, target);
            }
        }

        return originalFetch(input, init);
    };

    XMLHttpRequest.prototype.open = function(method, url) {
        this._purpura_url = typeof url === 'string' ? url : '';
        return originalXhrOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function() {
        if (isStreamerActive() && this._purpura_url) {
            const target = getStreamerTarget(this._purpura_url);
            if (target) {
                const xhr = this;
                const originalReadyStateChange = xhr.onreadystatechange;
                xhr.addEventListener('readystatechange', function handler() {
                    if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const data = JSON.parse(xhr.responseText);
                            applySpoof(data, target);
                            const modified = JSON.stringify(data);
                            Object.defineProperty(xhr, 'responseText', {
                                configurable: true,
                                get: () => modified
                            });
                            Object.defineProperty(xhr, 'response', {
                                configurable: true,
                                get: () => modified
                            });
                        } catch {}
                    }
                });
            }
        }
        return originalXhrSend.apply(this, arguments);
    };

    document.addEventListener('purpura-status-spoofer', (e) => {
        setStatusSpooferMode(e.detail.mode);
    });

    document.addEventListener('purpura-streamer-mode', (e) => {
        setStreamerMode(e.detail);
    });

    setStatusSpooferMode('off');
})();
