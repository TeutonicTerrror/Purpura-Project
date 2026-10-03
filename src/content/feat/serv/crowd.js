/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
if (!window.purpuraCrowdInitialized) {
    window.purpuraCrowdInitialized = true;

    const API_ORIGIN = 'https://api.purpura.page';
    const STORAGE_KEY = 'cs';
    const LOOKUP_TIMEOUT_MS = 3000;
    const FLUSH_DELAY_MS = 8000;
    const FLUSH_BATCH_MAX = 100;
    const QUEUE_LIMIT = 400;
    const REPEAT_REPORT_GAP_MS = 60 * 1000;
    const GAME_PATH_RE = /^\/games\/(\d+)/;
    const HARVEST_MIN_LEDGER_SERVERS = 20;
    const DETAILS_MAX_IDS = 100;

    const state = {
        enabled: false,
        configured: false,
        place: null,
        servers: new Map(),
        placeSummary: null,
        loadedAt: 0,
        inFlight: null,
        inFlightPlace: null,
        queue: new Map(),
        reported: new Map(),
        harvested: new Set(),
        flushTimer: null
    };

    function currentPlaceId() {
        const match = window.location.pathname.match(GAME_PATH_RE);
        return match ? match[1] : null;
    }

    function apiRequest(method, path, payload) {
        return new Promise(function (resolve) {
            try {
                chrome.runtime.sendMessage({
                    type: 'PURPURA_API_REQUEST',
                    url: API_ORIGIN + path,
                    method,
                    body: payload ? JSON.stringify(payload) : ''
                }, function (response) {
                    if (chrome.runtime.lastError || !response) {
                        resolve(null);
                        return;
                    }
                    resolve(response);
                });
            } catch (e) {
                resolve(null);
            }
        });
    }

    function parseJson(response) {
        if (!response || !response.ok) return null;
        if (typeof response.text !== 'string' || !response.text) return null;
        try { return JSON.parse(response.text); } catch (e) { return null; }
    }

    function withTimeout(promise, timeoutMs) {
        return new Promise(function (resolve) {
            let settled = false;
            const timer = setTimeout(function () {
                if (settled) return;
                settled = true;
                resolve(false);
            }, timeoutMs);

            promise.then(function (value) {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                resolve(value);
            }, function () {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                resolve(false);
            });
        });
    }

    function requestRegionRefresh() {
        const refresh = window.__PurpuraServerInfoRefresh;
        if (typeof refresh !== 'function') return;
        try { refresh(); } catch (e) {}
    }

    function resetPlace() {
        state.servers = new Map();
        state.placeSummary = null;
        state.loadedAt = 0;
        state.inFlight = null;
        state.inFlightPlace = null;
    }

    function loadPlace(placeId) {
        if (!state.enabled || !placeId) return Promise.resolve(false);
        if (state.place === placeId && state.loadedAt > 0) return Promise.resolve(true);
        if (state.inFlight && state.inFlightPlace === placeId) return state.inFlight;

        if (state.place !== placeId) {
            state.place = placeId;
            resetPlace();
        }

        const promise = apiRequest('GET', '/v1/crowd/servers?placeId=' + encodeURIComponent(placeId))
            .then(function (response) {
                const data = parseJson(response);
                if (!data || state.place !== placeId) return false;

                const servers = Array.isArray(data.servers) ? data.servers : [];
                servers.forEach(function (entry) {
                    if (!entry || typeof entry.serverId !== 'string') return;
                    state.servers.set(entry.serverId, entry);
                });

                state.placeSummary = data.place || null;
                state.loadedAt = Date.now();
                if (state.servers.size > 0) requestRegionRefresh();
                return true;
            })
            .catch(function () { return false; })
            .then(function (loaded) {
                if (state.inFlight === promise) {
                    state.inFlight = null;
                    state.inFlightPlace = null;
                }
                return loaded;
            });

        state.inFlight = promise;
        state.inFlightPlace = placeId;
        return promise;
    }

    async function lookup(placeId, serverId) {
        if (!state.enabled || !placeId || !serverId) return null;

        const loaded = state.place === placeId && state.loadedAt > 0;
        if (!loaded) {
            await withTimeout(loadPlace(placeId), LOOKUP_TIMEOUT_MS);
        }

        if (state.place !== placeId || state.loadedAt === 0) return null;
        return state.servers.get(serverId) || null;
    }

    function normalizeServerIds(serverIds) {
        if (!Array.isArray(serverIds)) return [];

        const out = [];
        const seen = {};

        serverIds.forEach(function (value) {
            const id = typeof value === 'string' ? value.trim() : '';
            if (!id || id.length > 64 || seen[id]) return;
            if (!/^[A-Za-z0-9_-]{4,64}$/.test(id)) return;
            seen[id] = true;
            out.push(id);
        });

        return out.slice(0, DETAILS_MAX_IDS);
    }

    async function serverDetails(placeId, serverIds) {
        if (!state.enabled || !placeId) return null;

        const ids = normalizeServerIds(serverIds);
        if (ids.length === 0) return null;

        const response = await apiRequest(
            'GET',
            '/v1/servers/details?place_id=' + encodeURIComponent(placeId) +
                '&server_ids=' + encodeURIComponent(ids.join(','))
        );
        const data = parseJson(response);
        if (!data || !Array.isArray(data.servers)) return null;

        const map = {};
        data.servers.forEach(function (entry) {
            if (!entry || typeof entry.serverId !== 'string') return;
            map[entry.serverId] = entry;
        });

        return map;
    }

    function scheduleFlush() {
        if (state.flushTimer) return;
        state.flushTimer = setTimeout(function () {
            state.flushTimer = null;
            flush();
        }, FLUSH_DELAY_MS);
    }

    async function flush() {
        if (!state.enabled || state.queue.size === 0) return;

        const batch = Array.from(state.queue.values()).slice(0, FLUSH_BATCH_MAX);
        const response = await apiRequest('POST', '/v1/crowd/servers', { sightings: batch });
        const data = parseJson(response);

        if (!data || data.ok !== true) {
            if (state.queue.size > QUEUE_LIMIT) {
                const overflow = Array.from(state.queue.keys()).slice(0, state.queue.size - QUEUE_LIMIT);
                overflow.forEach(function (key) { state.queue.delete(key); });
            }
            return;
        }

        const now = Date.now();
        batch.forEach(function (sighting) {
            const key = sighting.placeId + ':' + sighting.serverId;
            state.queue.delete(key);
            state.reported.set(key, now);
        });

        if (state.queue.size > 0) scheduleFlush();
    }

    function maskServerIp(value) {
        if (typeof value !== 'string') return null;
        const match = value.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.\d{1,3}$/);
        if (!match) return null;
        const octets = [match[1], match[2], match[3]].map(Number);
        if (octets.some(function (octet) {
            return !Number.isInteger(octet) || octet < 0 || octet > 255;
        })) return null;
        return octets.join('.') + '.0';
    }

    function report(placeId, serverId, dataCenterId, placeVersion, serverIp) {
        if (!placeId || !serverId) return;
        if (state.configured && !state.enabled) return;

        const maskedIp = maskServerIp(serverIp);

        const key = placeId + ':' + serverId;
        const pending = state.queue.get(key);
        if (pending) {
            if (!pending.dataCenterId && dataCenterId) pending.dataCenterId = dataCenterId;
            if (!pending.serverIp && maskedIp) pending.serverIp = maskedIp;
            if (!pending.placeVersion && placeVersion) pending.placeVersion = placeVersion;
            return;
        }

        const lastReported = state.reported.get(key);
        if (lastReported && (Date.now() - lastReported) < REPEAT_REPORT_GAP_MS) return;
        if (state.queue.size >= QUEUE_LIMIT) return;

        const sighting = {
            placeId: Number(placeId),
            serverId,
            seenAt: Date.now()
        };
        if (dataCenterId) sighting.dataCenterId = Number(dataCenterId);
        if (maskedIp) sighting.serverIp = maskedIp;
        if (placeVersion) sighting.placeVersion = Number(placeVersion);

        state.queue.set(key, sighting);
        scheduleFlush();
    }

    function reportVersion(placeId, version) {
        if (!state.enabled || !placeId || !version) return;

        const key = 'v:' + placeId + ':' + version;
        if (state.reported.has(key)) return;

        state.reported.set(key, Date.now());

        apiRequest('POST', '/v1/crowd/versions/' + encodeURIComponent(placeId), {
            version: Number(version),
            observedAt: Date.now()
        }).then(function (response) {
            const data = parseJson(response);
            if (data && data.ok === true) return;
            state.reported.delete(key);
        });
    }

    function harvestObservedServers(placeId) {
        if (!state.enabled || !placeId) return;
        if (state.harvested.has(placeId)) return;
        if (state.servers.size >= HARVEST_MIN_LEDGER_SERVERS) return;

        state.harvested.add(placeId);

        try {
            chrome.runtime.sendMessage({ action: 'getAllServerRegions', placeId: placeId }, function (response) {
                if (chrome.runtime.lastError || !response || !response.regions) return;
                const regions = response.regions;
                Object.keys(regions).forEach(function (serverId) {
                    const entry = regions[serverId];
                    if (!entry || !entry.dataCenterId) return;
                    report(placeId, serverId, entry.dataCenterId, null, entry.serverIp || null);
                });
            });
        } catch (e) {}
    }

    function syncRoute() {
        const placeId = currentPlaceId();
        if (!placeId || !state.enabled) return;
        if (state.place === placeId && (state.loadedAt > 0 || state.inFlight)) return;
        resetPlace();
        state.place = placeId;
        loadPlace(placeId).then(function () {
            harvestObservedServers(placeId);
        });
    }

    function setEnabled(enabled) {
        const next = !!enabled;
        const wasEnabled = state.enabled;
        state.configured = true;
        state.enabled = next;

        if (!next) {
            state.queue.clear();
            state.reported.clear();
            state.servers = new Map();
            state.placeSummary = null;
            state.loadedAt = 0;
            if (state.flushTimer) {
                clearTimeout(state.flushTimer);
                state.flushTimer = null;
            }
            return;
        }

        if (!wasEnabled) syncRoute();
    }

    function installRouteHooks() {
        const notify = function () {
            setTimeout(syncRoute, 0);
        };
        const originalPushState = history.pushState;
        history.pushState = function () {
            const result = originalPushState.apply(this, arguments);
            notify();
            return result;
        };
        const originalReplaceState = history.replaceState;
        history.replaceState = function () {
            const result = originalReplaceState.apply(this, arguments);
            notify();
            return result;
        };
        window.addEventListener('popstate', notify);
        window.addEventListener('hashchange', notify);
        window.addEventListener('pageshow', notify);
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) flush();
            else syncRoute();
        });
    }

    window.__PurpuraCrowd = {
        lookup,
        serverDetails,
        report,
        reportVersion,
        isEnabled: function () { return state.enabled; },
        latestVersion: function () {
            return state.placeSummary && state.placeSummary.latestVersion
                ? state.placeSummary.latestVersion
                : null;
        },
        flush
    };

    chrome.storage.onChanged.addListener(function (changes, areaName) {
        if (areaName !== 'sync') return;
        if (!Object.prototype.hasOwnProperty.call(changes, STORAGE_KEY)) return;
        setEnabled(changes[STORAGE_KEY].newValue);
    });

    installRouteHooks();

    window.__PurpuraSettings.ready.then(function () {
        setEnabled(!!window.__PurpuraSettings.get(STORAGE_KEY));
    });
}
