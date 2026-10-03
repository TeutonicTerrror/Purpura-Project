/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
importScripts(chrome.runtime.getURL('js/trading.js'));
const SESSION_TTL_DEFAULT_MS = 14 * 24 * 60 * 60 * 1000;
const STUDIO_API_KEY_STORAGE_KEY = 'purpura_studio_api_keys';
const STUDIO_API_KEY_LEGACY_STORAGE_KEY = 'purpura_ghost_api_keys';
const STUDIO_API_KEY_NAME = 'Purpura API key';
const STUDIO_API_KEY_DESCRIPTION = `Purpura API key, used for local API requests only.
Never used outside your local device.`;
const STUDIO_API_KEY_NAME_COMPAT = new Set(['Purpura API key']);
const STUDIO_API_KEY_DESCRIPTION_COMPAT = new Set([
    'Purpura API key, used for local API requests only.',
    'Purpura API key, used for local API requests only.\nNever used outside your local device.'
]);
let studioApiKeyInFlight = null;
let studioApiCsrfToken = '';

function normalizeStudioApiHttpMethod(method, fallback = 'GET') {
    const fallbackMethod = String(fallback || 'GET').trim().toUpperCase() || 'GET';
    const normalized = String(method || fallbackMethod).trim().toUpperCase();
    return new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']).has(normalized) ? normalized : fallbackMethod;
}

function isManagedStudioApiKeyEntry(entry) {
    if (!entry || typeof entry !== 'object') return false;

    const props = entry.cloudAuthUserConfiguredProperties;
    if (!props || typeof props !== 'object') return false;

    const name = typeof props.name === 'string' ? props.name.trim() : '';
    const description = typeof props.description === 'string' ? props.description.trim() : '';
    if (!name || !description) return false;

    return STUDIO_API_KEY_NAME_COMPAT.has(name) && STUDIO_API_KEY_DESCRIPTION_COMPAT.has(description);
}

async function getStudioApiKeyStorageMap() {
    const snapshot = await chrome.storage.local.get([STUDIO_API_KEY_STORAGE_KEY, STUDIO_API_KEY_LEGACY_STORAGE_KEY]);
    const currentMap = snapshot[STUDIO_API_KEY_STORAGE_KEY] && typeof snapshot[STUDIO_API_KEY_STORAGE_KEY] === 'object'
        ? { ...snapshot[STUDIO_API_KEY_STORAGE_KEY] }
        : {};

    const legacyMap = snapshot[STUDIO_API_KEY_LEGACY_STORAGE_KEY] && typeof snapshot[STUDIO_API_KEY_LEGACY_STORAGE_KEY] === 'object'
        ? snapshot[STUDIO_API_KEY_LEGACY_STORAGE_KEY]
        : {};

    let changed = false;
    for (const [userId, value] of Object.entries(legacyMap)) {
        if (!(userId in currentMap)) {
            currentMap[userId] = value;
            changed = true;
        }
    }

    if (changed) {
        await chrome.storage.local.set({ [STUDIO_API_KEY_STORAGE_KEY]: currentMap });
    }

    return currentMap;
}

async function setStudioApiKeyStorageMap(map) {
    await chrome.storage.local.set({ [STUDIO_API_KEY_STORAGE_KEY]: map && typeof map === 'object' ? map : {} });
}

async function getStudioApiAuthenticatedUserId() {
    try {
        const response = await fetch('https://users.roblox.com/v1/users/authenticated', {
            credentials: 'include'
        });

        if (!response.ok) return '';

        const data = await response.json();
        const userId = Number(data && data.id);
        return Number.isFinite(userId) && userId > 0 ? String(userId) : '';
    } catch (error) {
        return '';
    }
}

async function refreshStudioApiCsrfToken() {
    try {
        const headers = new Headers();
        if (studioApiCsrfToken) {
            headers.set('X-CSRF-TOKEN', studioApiCsrfToken);
        }

        const response = await fetch('https://auth.roblox.com/v2/logout', {
            method: 'POST',
            credentials: 'include',
            headers
        });

        const token = response.headers.get('x-csrf-token');
        if (typeof token === 'string' && token) {
            studioApiCsrfToken = token;
        }
    } catch (error) {
    }

    return studioApiCsrfToken;
}

async function fetchStudioApiJson(url, options = {}) {
    const method = normalizeStudioApiHttpMethod(options.method, 'GET');
    const headers = new Headers();
    headers.set('Accept', 'application/json, text/plain;q=0.9, */*;q=0.8');
    headers.set('Referer', 'https://www.roblox.com/');

    if (options.headers && typeof options.headers === 'object') {
        Object.entries(options.headers).forEach(([key, value]) => {
            if (typeof key === 'string' && key && typeof value === 'string' && value) {
                headers.set(key, value);
            }
        });
    }

    const bodyText = typeof options.body === 'string'
        ? options.body
        : (options.body !== undefined && options.body !== null ? JSON.stringify(options.body) : '');
    const body = method === 'GET' || method === 'HEAD' ? undefined : (bodyText || undefined);

    if (body && !headers.has('content-type')) {
        headers.set('content-type', 'application/json');
    }

    if (method !== 'GET' && method !== 'HEAD') {
        if (!studioApiCsrfToken) {
            await refreshStudioApiCsrfToken();
        }
        if (studioApiCsrfToken) {
            headers.set('X-CSRF-TOKEN', studioApiCsrfToken);
        }
    }

    let response = await fetch(url, {
        method,
        credentials: 'include',
        headers,
        body
    });

    const firstToken = response.headers.get('x-csrf-token');
    if (typeof firstToken === 'string' && firstToken) {
        studioApiCsrfToken = firstToken;
    }

    if (response.status === 403 && method !== 'GET' && method !== 'HEAD') {
        if (!studioApiCsrfToken) {
            await refreshStudioApiCsrfToken();
        }

        if (studioApiCsrfToken) {
            headers.set('X-CSRF-TOKEN', studioApiCsrfToken);
            response = await fetch(url, {
                method,
                credentials: 'include',
                headers,
                body
            });

            const retryToken = response.headers.get('x-csrf-token');
            if (typeof retryToken === 'string' && retryToken) {
                studioApiCsrfToken = retryToken;
            }
        }
    }

    const text = await response.text();
    let json = null;
    if (text) {
        try {
            json = JSON.parse(text);
        } catch (error) {
        }
    }

    return {
        ok: response.ok,
        status: response.status,
        json,
        text
    };
}

async function ensureStudioApiKey(forceRefresh = false) {
    if (studioApiKeyInFlight) {
        return studioApiKeyInFlight;
    }

    studioApiKeyInFlight = (async () => {
        const userId = await getStudioApiAuthenticatedUserId();
        if (!userId) {
            return { ok: false, apiKey: '', userId: '', reason: 'not-authenticated' };
        }

        const keyMap = await getStudioApiKeyStorageMap();
        const cached = keyMap[userId];
        if (!forceRefresh && cached && typeof cached.apiKey === 'string' && cached.apiKey) {
            return { ok: true, apiKey: cached.apiKey, userId, source: 'cached' };
        }

        const canUseResponse = await fetchStudioApiJson('https://apis.roblox.com/cloud-authentication/v1/canUseApiKeys', {
            method: 'POST',
            body: {},
            headers: { 'Content-Type': 'application/json' }
        });
        if (!canUseResponse.ok || !(canUseResponse.json && canUseResponse.json.canUseApiKeys === true)) {
            return { ok: false, apiKey: '', userId, reason: 'cannot-use-api-keys' };
        }

        const listResponse = await fetchStudioApiJson('https://apis.roblox.com/cloud-authentication/v1/apiKeys', {
            method: 'POST',
            body: { cursor: '', limit: 10, reverse: false },
            headers: { 'Content-Type': 'application/json' }
        });
        if (!listResponse.ok || !listResponse.json) {
            return { ok: false, apiKey: '', userId, reason: 'list-failed' };
        }

        const keyEntries = Array.isArray(listResponse.json.cloudAuthInfo) ? listResponse.json.cloudAuthInfo : [];
        const existingKey = keyEntries.find(isManagedStudioApiKeyEntry);

        let resultData = null;
        if (existingKey && existingKey.id) {
            const regenerateResponse = await fetchStudioApiJson(`https://apis.roblox.com/cloud-authentication/v1/apiKey/${existingKey.id}/regenerate`, {
                method: 'POST',
                body: {},
                headers: { 'Content-Type': 'application/json' }
            });

            if (regenerateResponse.ok && regenerateResponse.json) {
                resultData = regenerateResponse.json;
            }
        }

        if (!resultData) {
            const createResponse = await fetchStudioApiJson('https://apis.roblox.com/cloud-authentication/v1/apiKey', {
                method: 'POST',
                body: {
                    cloudAuthUserConfiguredProperties: {
                        name: STUDIO_API_KEY_NAME,
                        description: STUDIO_API_KEY_DESCRIPTION,
                        isEnabled: true,
                        allowedCidrs: ['0.0.0.0/0'],
                        scopes: []
                    }
                },
                headers: { 'Content-Type': 'application/json' }
            });

            if (!createResponse.ok || !createResponse.json) {
                return { ok: false, apiKey: '', userId, reason: 'create-failed' };
            }

            resultData = createResponse.json;
        }

        if (!resultData || typeof resultData.apikeySecret !== 'string' || !resultData.apikeySecret) {
            return { ok: false, apiKey: '', userId, reason: 'missing-secret' };
        }

        keyMap[userId] = {
            apiKey: resultData.apikeySecret,
            id: resultData.cloudAuthInfo && resultData.cloudAuthInfo.id
                ? resultData.cloudAuthInfo.id
                : (existingKey && existingKey.id ? existingKey.id : ''),
            timestamp: Date.now()
        };
        await setStudioApiKeyStorageMap(keyMap);

        return { ok: true, apiKey: resultData.apikeySecret, userId, source: existingKey ? 'regenerated' : 'created' };
    })();

    try {
        return await studioApiKeyInFlight;
    } catch (error) {
        return { ok: false, apiKey: '', userId: '', reason: 'exception' };
    } finally {
        studioApiKeyInFlight = null;
    }
}

async function invalidateStudioApiKey() {
    const userId = await getStudioApiAuthenticatedUserId();
    if (!userId) return { ok: false };

    const keyMap = await getStudioApiKeyStorageMap();
    if (!(userId in keyMap)) {
        return { ok: true };
    }

    delete keyMap[userId];
    await setStudioApiKeyStorageMap(keyMap);
    return { ok: true };
}

function initializeStudioApiKey() {
    ensureStudioApiKey(false).catch(() => {});
}

function purpuraAvatarCyclerApi(options) {
    const method = options.method || 'GET';
    const headers = Object.assign({ 'Accept': 'application/json' }, options.headers || {});
    const body = options.body === undefined ? undefined : JSON.stringify(options.body);
    if (body) headers['Content-Type'] = 'application/json';
    return fetch('https://' + options.subdomain + '.roblox.com' + options.endpoint, {
        method,
        headers,
        body,
        credentials: 'include'
    }).then(async response => {
        if (response.status === 403 && method !== 'GET' && method !== 'HEAD') {
            const token = response.headers.get('x-csrf-token');
            if (token) {
                headers['X-CSRF-TOKEN'] = token;
                return fetch('https://' + options.subdomain + '.roblox.com' + options.endpoint, {
                    method,
                    headers,
                    body,
                    credentials: 'include'
                });
            }
        }
        return response;
    });
}

async function purpuraAvatarCyclerRequestWithRetry(options) {
    let response;
    for (let attempt = 0; attempt < 4; attempt += 1) {
        response = await purpuraAvatarCyclerApi(options);
        if (response.ok) return response;
        if (response.status !== 429 && response.status < 500) return response;
        if (attempt < 3) await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return response;
}

function purpuraAvatarCyclerNormalizeBodyColors(details, model) {
    const candidates = [
        model && model.bodyColor3s,
        details && details.bodyColor3s,
        model && model.bodyColors,
        details && details.bodyColors,
        model && model.avatarDefinition && model.avatarDefinition.bodyColors,
        details && details.avatarDefinition && details.avatarDefinition.bodyColors
    ];
    const fields = [
        ['headColor3', 'headColor', 'headColor3Id', 'headColorId'],
        ['torsoColor3', 'torsoColor', 'torsoColor3Id', 'torsoColorId'],
        ['rightArmColor3', 'rightArmColor', 'rightArmColor3Id', 'rightArmColorId'],
        ['leftArmColor3', 'leftArmColor', 'leftArmColor3Id', 'leftArmColorId'],
        ['rightLegColor3', 'rightLegColor', 'rightLegColor3Id', 'rightLegColorId'],
        ['leftLegColor3', 'leftLegColor', 'leftLegColor3Id', 'leftLegColorId']
    ];
    const bodyColor3s = {};
    const bodyColors = {};

    fields.forEach(([color3Name, colorName, color3IdName, colorIdName]) => {
        let value;
        for (const candidate of candidates) {
            if (!candidate || typeof candidate !== 'object') continue;
            value = candidate[color3Name] ?? candidate[colorName] ?? candidate[color3IdName] ?? candidate[colorIdName];
            if (value !== undefined && value !== null && value !== '') break;
        }
        if (value === undefined || value === null || value === '') return;
        bodyColor3s[color3Name] = value;
        bodyColors[colorName] = typeof value === 'string' ? value.replace(/^#/, '') : value;
    });

    return Object.keys(bodyColor3s).length ? { bodyColor3s, bodyColors } : null;
}

function purpuraAvatarCyclerSetBodyColors(details, model) {
    const colors = purpuraAvatarCyclerNormalizeBodyColors(details, model);
    if (!colors) return Promise.resolve({ ok: true });

    return purpuraAvatarCyclerRequestWithRetry({
        subdomain: 'avatar',
        endpoint: '/v2/avatar/set-body-colors',
        method: 'POST',
        body: colors.bodyColor3s
    }).then(response => {
        if (response && response.ok) return response;
        return purpuraAvatarCyclerRequestWithRetry({
            subdomain: 'avatar',
            endpoint: '/v1/avatar/set-body-colors',
            method: 'POST',
            body: colors.bodyColors
        });
    });
}

async function purpuraAvatarCyclerWear(outfitData) {
    const outfitId = typeof outfitData === 'object' && outfitData !== null ? outfitData.itemId : outfitData;
    if (!outfitId) return false;

    let details = null;
    const stored = await chrome.storage.local.get(['purpura_avatar_cycler_details']);
    details = stored.purpura_avatar_cycler_details && stored.purpura_avatar_cycler_details[String(outfitId)];
    if (!details) {
        const response = await purpuraAvatarCyclerRequestWithRetry({
            subdomain: 'avatar',
            endpoint: '/v4/outfits/' + encodeURIComponent(outfitId) + '/details'
        });
        if (!response.ok) return false;
        details = await response.json();
    }

    const model = details.outfitModel || details;
    const assets = [...(Array.isArray(model.assets) ? model.assets : [])];
    const requests = [];
    const background = details.outfitConfigurations && details.outfitConfigurations.background && details.outfitConfigurations.background.backgroundAsset;

    if (background && background.id) {
        requests.push(purpuraAvatarCyclerRequestWithRetry({
            subdomain: 'avatar',
            endpoint: '/v4/avatar',
            method: 'PATCH',
            body: {
                updateTypes: ['UpdateBackground'],
                avatarDefinition: { updateAvatarConfig: { backgroundRequestModel: { id: background.id } } }
            }
        }));
    }
    if (assets.length) {
        requests.push(purpuraAvatarCyclerRequestWithRetry({
            subdomain: 'avatar',
            endpoint: '/v2/avatar/set-wearing-assets',
            method: 'POST',
            body: { assets }
        }));
    }
    if (model.playerAvatarType) {
        requests.push(purpuraAvatarCyclerRequestWithRetry({
            subdomain: 'avatar',
            endpoint: '/v1/avatar/set-player-avatar-type',
            method: 'POST',
            body: { playerAvatarType: model.playerAvatarType }
        }));
    }
    if (model.scale) {
        requests.push(purpuraAvatarCyclerRequestWithRetry({
            subdomain: 'avatar',
            endpoint: '/v1/avatar/set-scales',
            method: 'POST',
            body: model.scale
        }));
    }
    const bodyColors = purpuraAvatarCyclerSetBodyColors(details, model);
    if (bodyColors) requests.push(bodyColors);

    const results = await Promise.all(requests);
    return results.every(response => response && response.ok);
}

function purpuraAvatarCyclerUpdate() {
    Promise.all([
        new Promise(resolve => chrome.storage.sync.get(['ac', 'purpura_avatar_cycler_interval'], resolve)),
        new Promise(resolve => chrome.storage.local.get(['purpura_avatar_cycler_ids'], resolve))
    ]).then(results => {
        const syncData = results[0] || {};
        const localData = results[1] || {};
        if (purpuraAvatarCyclerTimer) {
            clearInterval(purpuraAvatarCyclerTimer);
            purpuraAvatarCyclerTimer = null;
        }
        const enabled = syncData.ac === undefined || syncData.ac === true || (syncData.ac && syncData.ac.enabled === true);
        const ids = Array.isArray(localData.purpura_avatar_cycler_ids) ? localData.purpura_avatar_cycler_ids : [];
        if (!enabled || ids.length < 2) return;
        purpuraAvatarCyclerIndex = 0;
        const seconds = Math.max(5, parseInt(syncData.purpura_avatar_cycler_interval, 10) || 5);
        const rotate = () => {
            const id = ids[purpuraAvatarCyclerIndex];
            purpuraAvatarCyclerIndex = (purpuraAvatarCyclerIndex + 1) % ids.length;
            purpuraAvatarCyclerWear(id).catch(() => {});
        };
        rotate();
        purpuraAvatarCyclerTimer = setInterval(rotate, seconds * 1000);
    }).catch(() => {});
}

let purpuraAvatarCyclerTimer = null;
let purpuraAvatarCyclerIndex = 0;

chrome.storage.onChanged.addListener((changes, namespace) => {
    if ((namespace === 'sync' && (changes.ac || changes.purpura_avatar_cycler_interval)) ||
        (namespace === 'local' && (changes.purpura_avatar_cycler_ids || changes.purpura_avatar_cycler_details))) {
        purpuraAvatarCyclerUpdate();
    }
});

function injectInfiniteAvatarPatch() {
    if (window.__purpuraIaInjected) return;
    window.__purpuraIaInjected = true;

    var ACCESSORY_IDS = [8, 41, 42, 43, 44, 45, 46, 47, 57, 58];
    var LAYERED_CLOTHING_IDS = [64, 65, 66, 67, 68, 69, 70, 71, 72];
    var PATCHED_FLAG = '__purpuraInfiniteAvatarPatched';
    var MAX_ACCESSORIES = 10;
    var MAX_LAYERED = 10;
    var multiAccessoryEnabled = true;

    function patchService(service) {
        if (!service || service[PATCHED_FLAG]) return;
        service[PATCHED_FLAG] = true;

        var originalLimit = service.getAdvancedAccessoryLimit;
        service.getAdvancedAccessoryLimit = function(assetTypeId) {
            var id = Number(assetTypeId);
            if (multiAccessoryEnabled && (ACCESSORY_IDS.indexOf(id) !== -1 || LAYERED_CLOTHING_IDS.indexOf(id) !== -1)) {
                return 100;
            }
            return typeof originalLimit === 'function' ? originalLimit.apply(this, arguments) : 10;
        };

        var originalAdd = service.addAssetToAvatar;
        if (typeof originalAdd !== 'function') return;
        service.addAssetToAvatar = function(asset, currentAssets) {
            if (!multiAccessoryEnabled) return originalAdd.apply(this, arguments);

            var base = originalAdd.apply(this, arguments).filter(function(item) {
                var id = item && item.assetType ? Number(item.assetType.id) : 0;
                return ACCESSORY_IDS.indexOf(id) === -1 && LAYERED_CLOTHING_IDS.indexOf(id) === -1;
            });
            var all = [asset].concat(Array.isArray(currentAssets) ? currentAssets : []);
            var seen = {};
            var accessories = [];
            var layered = [];
            all.forEach(function(item) {
                if (!item || !item.id || seen[item.id]) return;
                var id = item.assetType ? Number(item.assetType.id) : 0;
                if (ACCESSORY_IDS.indexOf(id) !== -1) { accessories.push(item); seen[item.id] = true; }
                else if (LAYERED_CLOTHING_IDS.indexOf(id) !== -1) { layered.push(item); seen[item.id] = true; }
            });
            return base.concat(accessories.slice(0, MAX_ACCESSORIES), layered.slice(0, MAX_LAYERED));
        };
    }

    function defineRobloxHook() {
        var roblox = window.Roblox;
        if (roblox) {
            var service = roblox.AvatarAccoutrementService;
            patchService(service);
            try {
                var descriptor = Object.getOwnPropertyDescriptor(roblox, 'AvatarAccoutrementService');
                if (!descriptor || descriptor.configurable) {
                    var current = service;
                    Object.defineProperty(roblox, 'AvatarAccoutrementService', {
                        configurable: true,
                        enumerable: true,
                        get: function() { return current; },
                        set: function(value) { current = value; patchService(value); }
                    });
                }
            } catch (e) {}
            return true;
        }

        var value;
        try {
            Object.defineProperty(window, 'Roblox', {
                configurable: true,
                enumerable: true,
                get: function() { return value; },
                set: function(next) {
                    value = next;
                    if (next && typeof next === 'object') {
                        var service = next.AvatarAccoutrementService;
                        patchService(service);
                        try {
                            Object.defineProperty(next, 'AvatarAccoutrementService', {
                                configurable: true,
                                enumerable: true,
                                get: function() { return service; },
                                set: function(v) { service = v; patchService(v); }
                            });
                        } catch (e) {}
                    }
                }
            });
        } catch (e) {}
        return false;
    }

    var attempts = 0;
    var interval = setInterval(function() {
        if (defineRobloxHook() || ++attempts > 40) clearInterval(interval);
    }, 250);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.action === "updateOfflineMode") {
        chrome.declarativeNetRequest.updateEnabledRulesets(
            request.enabled
                ? { enableRulesetIds: ["offline_mode"] }
                : { disableRulesetIds: ["offline_mode"] }
        ).then(() => {
            sendResponse({ success: true });
        }).catch(err => {
            sendResponse({ success: false, error: err.message });
        });
        return true;
    }
    if (request.action === "openChangelog") {
        chrome.tabs.create({ url: chrome.runtime.getURL("new.html") });
    } else if (request.action === "checkWebRequestPermission") {
        chrome.permissions.contains({ permissions: ['webRequest'] }, (has) => {
            sendResponse({ has });
        });
        return true;
    } else if (request.action === "requestWebRequestPermission") {
        chrome.permissions.request({ permissions: ['webRequest'] }, (granted) => {
            sendResponse({ granted });
        });
        return true;
    } else if (request.action === "removeWebRequestPermission") {
        chrome.permissions.remove({ permissions: ['webRequest'] }, (removed) => {
            sendResponse({ removed });
        });
        return true;
    } else if (request.action === "getGhostProfileRedirect") {
        const tabId = sender && sender.tab ? sender.tab.id : null;
        const userId = tabId !== null ? ghostProfilesState.redirects.get(tabId) : null;
        if (tabId !== null) {
            ghostProfilesState.redirects.delete(tabId);
        }
        sendResponse({ userId: userId || null });
        return true;
    } else if (request.action === "setStatusSpooferMode") {
        const mode = normalizeStatusSpooferMode(request.mode);
        updateStatusSpooferRules(mode);
        sendResponse({ success: true });
        return true;
    } else if (request.action === "injectScript") {
        if (sender.tab && sender.tab.id && request.codeToInject) {
            chrome.scripting.executeScript({
                target: { tabId: sender.tab.id },
                world: 'MAIN',
                func: (code) => {
                    const script = document.createElement('script');
                    script.textContent = code;
                    (document.head || document.documentElement).appendChild(script);
                    script.remove();
                },
                args: [request.codeToInject]
            }).catch(() => {});
        }
        return true;
    } else if (request.action === "injectInfiniteAvatarPatch") {
        if (sender.tab && sender.tab.id) {
            chrome.scripting.executeScript({
                target: { tabId: sender.tab.id },
                world: 'MAIN',
                func: injectInfiniteAvatarPatch
            }).catch(() => {});
        }
        return true;
    } else if (request.action === "updateContent") {
        chrome.tabs.query({url: "*://*.roblox.com/*"}, tabs => {
            tabs.forEach(tab => {
                chrome.scripting.executeScript({
                    target: {tabId: tab.id},
                    func: (enabled) => {
                        if (enabled) {
                            applyChanges();
                        } else {
                            revertChanges();
                        }
                    },
                    args: [request.enabled]
                });
            });
        });
    } else if (request.action === "getServerRegion") {
        getSimpleServerRegion(request.serverId, request.placeId).then(result => {
            sendResponse(result);
        }).catch(error => {
            sendResponse({ region: "??", regionName: "Unknown", location: null, error: error.message });
        });
        return true;
    } else if (request.action === "getAllServerRegions") {
        getAllServerRegions(request.placeId).then(result => {
            sendResponse(result);
        }).catch(error => {
            sendResponse({ regions: {} });
        });
        return true;
    } else if (request.action === "GET_DATACENTER_LIST") {
        loadDatacenterList().then(list => {
            sendResponse({ list: list || null });
        }).catch(() => {
            sendResponse({ list: null });
        });
        return true;
    } else if (request.action === "searchGames") {
        searchGamesInBackground(request.query).then(result => {
            sendResponse(result);
        }).catch(error => {
            sendResponse({ error: error.message, results: [] });
        });
        return true;
    } else if (request.action === "getDefaultSettings") {
        const url = chrome.runtime.getURL('data/default_settings.json');
        fetch(url).then(async (resp) => {
            if (!resp.ok) throw new Error('Failed to load');
            const data = await resp.json();
            sendResponse({ defaultSettings: data });
        }).catch(() => {
            sendResponse({ defaultSettings: {} });
        });
        return true;
    } else if (request.action === "fetchAvatarInventory") {
        fetchAvatarInventory(request.userId).then(result => {
            sendResponse(result);
        }).catch(error => {
            sendResponse({ error: error.message, items: [] });
        });
        return true;
    } else if (request.action === "purpuraEnsureStudioApiKey") {
        ensureStudioApiKey(request.forceRefresh === true).then(result => {
            sendResponse(result);
        }).catch(() => {
            sendResponse({ ok: false, apiKey: '', userId: '' });
        });
        return true;
    } else if (request.action === "purpuraInvalidateStudioApiKey") {
        invalidateStudioApiKey().then(result => {
            sendResponse(result);
        }).catch(() => {
            sendResponse({ ok: false });
        });
        return true;
    } else if (request.action === "getRobloxTheme") {
        const targetTabId = request.tabId || (sender.tab ? sender.tab.id : null);
        if (targetTabId) {
            getRobloxTheme(targetTabId).then(theme => sendResponse({ theme }));
        } else {
            sendResponse({ theme: "light" });
        }
        return true;
    } else if (request.action === "resetReviewCriteria") {
        chrome.storage.local.get(['purpuraFirstInstalled'], (data) => {
            chrome.storage.local.set({
                purpuraFirstInstalled: data.purpuraFirstInstalled || Date.now(),
                purpuraRobloxVisits: 0,
                purpuraSettingsOpenedCount: 0,
                purpuraReviewPromptShown: false,
                purpuraReviewPromptDismissed: false,
                purpuraReviewPromptLastShown: null,
                purpuraReviewEligible: false
            });
        });
        sendResponse({ success: true });
        return true;
    } else if (request.action === "reviewCompleted") {
        chrome.storage.local.set({ purpuraReviewCompleted: true });
        sendResponse({ success: true });
        return true;
    } else if (request.action === "fetchProfileInsights") {
        fetchProfileInsightsBg(request.userId, request.csrfToken).then(function(result) {
            sendResponse(result);
        }).catch(function(err) {
            sendResponse(null);
        });
        return true;
    } else if (request.action === "fetchAllFriendInsights") {
        fetchAllFriendInsightsBg(request.csrfToken).then(function(result) {
            sendResponse(result);
        }).catch(function(err) {
            sendResponse({});
        });
        return true;
    } else if (request.action === "fetchGameDetails") {
        fetchGameDetailsBg(request.universeId).then(function(result) {
            sendResponse(result);
        }).catch(function(err) {
            sendResponse({ name: '', thumbnail: '' });
        });
        return true;
    } else if (request.action === "unfriendUser") {
        unfriendUserBg(request.userId, request.csrfToken).then(function(result) {
            sendResponse(result);
        }).catch(function(err) {
            sendResponse({ ok: false, error: err.message });
        });
        return true;
    }
});

const INVENTORY_CACHE_TTL_MS = 1000 * 60 * 2;
const THUMBNAIL_CACHE_TTL_MS = 1000 * 60 * 15;

async function fetchProfileInsightsBg(userId, pageCsrfToken) {
    try {
        var url = 'https://apis.roblox.com/profile-insights-api/v1/multiProfileInsights';
        var body = JSON.stringify({ userIds: [String(userId)], rankingStrategy: 'tc_info_boost' });
        var body2 = JSON.stringify({ userIds: [String(userId)], rankingStrategy: 'profile_info_boost' });
        var headers = { 'Content-Type': 'application/json' };

        var csrfToUse = pageCsrfToken || studioApiCsrfToken;
        if (!csrfToUse) { await refreshStudioApiCsrfToken(); csrfToUse = studioApiCsrfToken; }
        if (csrfToUse) headers['X-CSRF-TOKEN'] = csrfToUse;

        var resp = await fetch(url, { method: 'POST', headers: headers, body: body });

        if (resp.status === 403) {
            var newToken = resp.headers.get('x-csrf-token');
            if (newToken) {
                studioApiCsrfToken = newToken;
                headers['X-CSRF-TOKEN'] = newToken;
                resp = await fetch(url, { method: 'POST', headers: headers, body: body });
            }
        }

        var result = null;
        if (resp.ok) {
            var data = await resp.json();
            var list = data.userInsights || data.data || [];
            if (!Array.isArray(list)) list = [list];
            if (list.length) result = parseInsightEntryBg(list[0]);
        }

        var resp2 = await fetch(url, { method: 'POST', headers: headers, body: body2 });
        if (resp2.status === 403) {
            var newToken2 = resp2.headers.get('x-csrf-token');
            if (newToken2) {
                studioApiCsrfToken = newToken2;
                headers['X-CSRF-TOKEN'] = newToken2;
                resp2 = await fetch(url, { method: 'POST', headers: headers, body: body2 });
            }
        }

        if (resp2.ok) {
            var data2 = await resp2.json();
            var list2 = data2.userInsights || data2.data || [];
            if (!Array.isArray(list2)) list2 = [list2];
            if (list2.length) {
                var parsed2 = parseInsightEntryBg(list2[0]);
                if (!result) {
                    result = parsed2;
                } else {
                    if (parsed2.since && !result.since) result.since = parsed2.since;
                    if (parsed2.origin !== null && parsed2.origin !== undefined && (result.origin === null || result.origin === undefined)) result.origin = parsed2.origin;
                    if (parsed2.mostFrequentUniverseId && !result.mostFrequentUniverseId) result.mostFrequentUniverseId = parsed2.mostFrequentUniverseId;
                }
            }
        }

        return result;
    } catch(e) {
        return null;
    }
}

function parseInsightEntryBg(entry) {
    var result = { since: null, origin: null, mostFrequentUniverseId: null };
    var insights = entry.profileInsights || entry.userInsights || entry.insights || entry.data || [];
    if (!Array.isArray(insights)) insights = [insights];

    for (var i = 0; i < insights.length; i++) {
        var ins = insights[i];
        if (!ins) continue;

        if (ins.friendshipAgeInsight && ins.friendshipAgeInsight.friendsSinceDateTime) {
            var sec = ins.friendshipAgeInsight.friendsSinceDateTime.seconds;
            if (sec) result.since = sec * 1000;
        }

        if (ins.friendRequestOriginInsight) {
            var src = ins.friendRequestOriginInsight.friendRequestOriginSource;
            if (src !== undefined && src !== null) result.origin = src;
        }

        if (ins.playedTogetherInsight && ins.playedTogetherInsight.mostFrequentUniverseId) {
            result.mostFrequentUniverseId = ins.playedTogetherInsight.mostFrequentUniverseId;
        }
    }

    return result;
}

async function fetchAllFriendInsightsBg(pageCsrfToken) {
    try {
        var authResp = await fetch('https://users.roblox.com/v1/users/authenticated', { credentials: 'include' });
        if (!authResp.ok) return {};
        var authData = await authResp.json();
        var myId = String(authData.id);

        var allFriendIds = [];
        var cursor = null;
        do {
            var friendsUrl = 'https://friends.roblox.com/v1/users/' + myId + '/friends?limit=200';
            if (cursor) friendsUrl += '&cursor=' + encodeURIComponent(cursor);
            var friendsResp = await fetch(friendsUrl, { credentials: 'include' });
            if (!friendsResp.ok) break;
            var friendsData = await friendsResp.json();
            var items = friendsData.data || [];
            for (var f = 0; f < items.length; f++) {
                allFriendIds.push(String(items[f].id));
            }
            cursor = friendsData.nextPageCursor || null;
        } while (cursor);

        if (!allFriendIds.length) return {};

        var headers = { 'Content-Type': 'application/json' };
        var csrfToUse = pageCsrfToken || studioApiCsrfToken;
        if (!csrfToUse) { await refreshStudioApiCsrfToken(); csrfToUse = studioApiCsrfToken; }
        if (csrfToUse) headers['X-CSRF-TOKEN'] = csrfToUse;

        var body = JSON.stringify({ userIds: allFriendIds, rankingStrategy: 'tc_info_boost' });
        var resp = await fetch('https://apis.roblox.com/profile-insights-api/v1/multiProfileInsights', {
            method: 'POST', headers: headers, body: body
        });

        if (resp.status === 403) {
            var newToken = resp.headers.get('x-csrf-token');
            if (newToken) {
                studioApiCsrfToken = newToken;
                headers['X-CSRF-TOKEN'] = newToken;
                resp = await fetch('https://apis.roblox.com/profile-insights-api/v1/multiProfileInsights', {
                    method: 'POST', headers: headers, body: body
                });
            }
        }

        var result = {};
        if (resp.ok) {
            var data = await resp.json();
            mergeInsightsIntoResult(data, result);
        }

        var body2 = JSON.stringify({ userIds: allFriendIds, rankingStrategy: 'profile_info_boost' });
        var resp2 = await fetch('https://apis.roblox.com/profile-insights-api/v1/multiProfileInsights', {
            method: 'POST', headers: headers, body: body2
        });

        if (resp2.status === 403) {
            var newToken2 = resp2.headers.get('x-csrf-token');
            if (newToken2) {
                studioApiCsrfToken = newToken2;
                headers['X-CSRF-TOKEN'] = newToken2;
                resp2 = await fetch('https://apis.roblox.com/profile-insights-api/v1/multiProfileInsights', {
                    method: 'POST', headers: headers, body: body2
                });
            }
        }

        if (resp2.ok) {
            var data2 = await resp2.json();
            mergeInsightsIntoResult(data2, result);
        }

        return result;
    } catch(e) {
        return {};
    }
}

function mergeInsightsIntoResult(data, result) {
    var list = data.userInsights || data.data || [];
    if (!Array.isArray(list)) list = [list];

    for (var j = 0; j < list.length; j++) {
        var entry = list[j];
        if (!entry) continue;
        var uid = String(entry.targetUser || entry.userId || entry.id || '');
        if (!uid) continue;

        var parsed = parseInsightEntryBg(entry);
        if (!result[uid]) {
            result[uid] = parsed;
        } else {
            if (parsed.since && !result[uid].since) result[uid].since = parsed.since;
            if (parsed.origin !== null && parsed.origin !== undefined && (result[uid].origin === null || result[uid].origin === undefined)) {
                result[uid].origin = parsed.origin;
            }
            if (parsed.mostFrequentUniverseId && !result[uid].mostFrequentUniverseId) {
                result[uid].mostFrequentUniverseId = parsed.mostFrequentUniverseId;
            }
        }
    }
}

async function unfriendUserBg(userId, pageCsrfToken) {
    try {
        var headers = { 'Content-Type': 'application/json' };
        var csrfToUse = pageCsrfToken || studioApiCsrfToken;
        if (!csrfToUse) { await refreshStudioApiCsrfToken(); csrfToUse = studioApiCsrfToken; }
        if (csrfToUse) headers['X-CSRF-TOKEN'] = csrfToUse;

        var resp = await fetch('https://friends.roblox.com/v1/users/' + encodeURIComponent(userId) + '/unfriend', {
            method: 'POST',
            credentials: 'include',
            headers: headers
        });

        if (resp.status === 403) {
            var newToken = resp.headers.get('x-csrf-token');
            if (newToken) {
                studioApiCsrfToken = newToken;
                headers['X-CSRF-TOKEN'] = newToken;
                resp = await fetch('https://friends.roblox.com/v1/users/' + encodeURIComponent(userId) + '/unfriend', {
                    method: 'POST',
                    credentials: 'include',
                    headers: headers
                });
            }
        }

        return { ok: resp.ok, status: resp.status };
    } catch(e) {
        return { ok: false, error: e.message };
    }
}

var gameDetailsCache = {};
async function fetchGameDetailsBg(universeId) {
    try {
        var cacheKey = String(universeId);
        if (gameDetailsCache[cacheKey]) return gameDetailsCache[cacheKey];

        var resp = await fetch('https://games.roblox.com/v1/games?universeIds=' + encodeURIComponent(universeId));
        if (!resp.ok) return { name: '', thumbnail: '' };

        var data = await resp.json();
        var games = data.data || [];
        var name = games.length ? (games[0].name || '') : '';
        var rootPlaceId = games.length ? (games[0].rootPlaceId || '') : '';

        var thumbResp = await fetch('https://thumbnails.roblox.com/v1/games/icons?universeIds=' + encodeURIComponent(universeId) + '&size=150x150&format=Png&isCircular=false');
        var thumbnail = '';
        if (thumbResp.ok) {
            var thumbData = await thumbResp.json();
            var thumbs = thumbData.data || [];
            thumbnail = thumbs.length ? (thumbs[0].imageUrl || '') : '';
        }

        var result = { name: name, thumbnail: thumbnail, rootPlaceId: String(rootPlaceId) };
        gameDetailsCache[cacheKey] = result;
        return result;
    } catch(e) {
        return { name: '', thumbnail: '', rootPlaceId: '' };
    }
}

async function fetchAvatarInventory(userId) {
    if (!userId) return { error: 'no userId', items: [] };

    const cacheKey = `purpura_inventory_${userId}`;
    const cached = await new Promise(resolve => chrome.storage.local.get([cacheKey], resolve));
    const cachedEntry = cached[cacheKey];
    const now = Date.now();
    if (cachedEntry && now - cachedEntry.ts < INVENTORY_CACHE_TTL_MS) {
        return { items: cachedEntry.items, fromCache: true };
    }

    let items = [];
    try {
        let cursor = null;
        do {
            const url = new URL('https://avatar.roblox.com/v1/avatar-inventory');
            url.searchParams.set('sortOption', '2');
            url.searchParams.set('pageLimit', '50');
            if (cursor) url.searchParams.set('cursor', cursor);

            const resp = await fetch(url.toString(), { credentials: 'include' });
            if (!resp.ok) break;
            const data = await resp.json();
            if (Array.isArray(data.data)) {
                items.push(...data.data);
            }
            cursor = data.nextPageCursor || data.nextPageToken || null;
        } while (cursor);

        const normalized = items.map(item => {
            const assetId = item.assetId || item.id;
            const name = item.name || item.displayName || item.assetName || '';
            const assetType = (item.assetType && (item.assetType.name || item.assetType)) || item.type || '';
            const thumbnail = item.thumbnailUrl || item.imageUrl || item.iconUrl || '';
            const isEquipped = !!(item.isEquipped || item.isActive);
            return { assetId, name, assetType, thumbnail, isEquipped };
        });

        await new Promise(resolve => chrome.storage.local.set({
            [cacheKey]: { ts: now, items: normalized }
        }, resolve));

        return { items: normalized, fromCache: false };
    } catch (error) {
        return { error: error.message, items: [] };
    }
}

async function getRobloxTheme(tabId) {
    try {
        const results = await chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
                return document.documentElement.classList.contains("dark-theme") || document.body.classList.contains("dark-theme") ? "dark" : "light";
            }
        });
        return results?.[0]?.result || "light";
    } catch {
        return "light";
    }
}

async function searchGamesInBackground(query) {
    try {
        const sessionId = crypto.randomUUID();

        const searchResponse = await fetch(
            `https://apis.roblox.com/search-api/omni-search?SearchQuery=${encodeURIComponent(query)}&SessionId=${sessionId}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        if (!searchResponse.ok) {
            throw new Error(`Search failed: ${searchResponse.status}`);
        }

        const searchData = await searchResponse.json();

        const games = [];
        if (searchData.searchResults) {
            for (const result of searchData.searchResults) {
                if (result.contentGroupType === 'Game' && result.contents) {
                    games.push(...result.contents);
                }
            }
        }

        if (games.length === 0) {
            return { results: [] };
        }

        const universeIds = games.map(game => game.universeId).filter(id => id);

        if (universeIds.length === 0) {
            return { results: [] };
        }

        const thumbResponse = await fetch(
            `https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeIds.join(',')}&size=150x150&format=Png&isCircular=false`
        );

        let thumbnailMap = {};
        if (thumbResponse.ok) {
            const thumbJson = await thumbResponse.json();
            const thumbnailsData = thumbJson.data || [];
            thumbnailsData.forEach(thumb => {
                if (thumb.targetId && thumb.imageUrl) {
                    thumbnailMap[thumb.targetId] = thumb.imageUrl;
                }
            });
        }

        const results = games.slice(0, 10).map((game) => {
            const thumbnail = thumbnailMap[game.universeId] || '';

            return {
                id: game.rootPlaceId,
                universeId: game.universeId,
                name: game.name,
                playerCount: game.playerCount || 0,
                thumbnail: thumbnail
            };
        });

        return { results };

    } catch (error) {
        return { error: error.message, results: [] };
    }
}

async function getSessionKey() {
    const result = await chrome.storage.local.get(['sessionKey']);
    return result.sessionKey || null;
}

async function setSessionKey(sessionKey) {
    await chrome.storage.local.set({ sessionKey });
}

async function clearSessionKey() {
    await chrome.storage.local.remove(['sessionKey', 'sessionExpiry']);
}


async function getRobloxUserId() {
    try {
        const sessionData = await chrome.storage.local.get(['robloxUserId']);
        if (sessionData.robloxUserId) {
            return sessionData.robloxUserId;
        }

        const response = await fetch('https://users.roblox.com/v1/users/authenticated', {
            credentials: 'include'
        });

        if (!response.ok) return null;

        const userData = await response.json();
        if (userData.id) {
            await chrome.storage.local.set({ robloxUserId: userData.id });
            return userData.id;
        }
        return null;
    } catch (error) {
        return null;
    }
}


let serverIpMap = null;
let regionCache = new Map();
let lastRequestTime = 0;
const REQUEST_THROTTLE_MS = 500;

function findDatacenter(dataCenterId) {
    if (!dataCenterId || !Array.isArray(serverIpMap)) return null;
    const wanted = Number(dataCenterId);
    if (!Number.isFinite(wanted)) return null;
    return serverIpMap.find(
        (dc) => Array.isArray(dc.dataCenterIds) && dc.dataCenterIds.map(Number).includes(wanted)
    ) || null;
}

const PURPURA_DATACENTER_API_URL = 'https://api.purpura.page/v1/datacenters/list';
const PURPURA_DATACENTER_STORAGE_KEY = 'purpuraDatacenterList';
const PURPURA_DATACENTER_CACHE_MAX_AGE_MS = 12 * 60 * 60 * 1000;
const PURPURA_DATACENTER_FETCH_TIMEOUT_MS = 6000;

function isUsableDatacenterList(list) {
    return Array.isArray(list) && list.length > 0 && list.some(function (entry) {
        return entry &&
            Array.isArray(entry.dataCenterIds) &&
            entry.dataCenterIds.length > 0 &&
            entry.location &&
            typeof entry.location.country === 'string' &&
            entry.location.country;
    });
}

function readDatacenterCache() {
    return new Promise(function (resolve) {
        try {
            chrome.storage.local.get([PURPURA_DATACENTER_STORAGE_KEY], function (data) {
                const entry = data && data[PURPURA_DATACENTER_STORAGE_KEY];
                resolve(entry && Array.isArray(entry.list) ? entry : null);
            });
        } catch (error) {
            resolve(null);
        }
    });
}

function writeDatacenterCache(list) {
    try {
        chrome.storage.local.set({
            [PURPURA_DATACENTER_STORAGE_KEY]: { list: list, fetchedAt: Date.now() }
        });
    } catch (error) {
    }
}

async function loadDatacenterList() {
    const cached = await readDatacenterCache();

    if (
        cached &&
        isUsableDatacenterList(cached.list) &&
        (Date.now() - (Number(cached.fetchedAt) || 0)) < PURPURA_DATACENTER_CACHE_MAX_AGE_MS
    ) {
        return cached.list;
    }

    try {
        const controller = new AbortController();
        const abortTimer = setTimeout(function () { controller.abort(); }, PURPURA_DATACENTER_FETCH_TIMEOUT_MS);
        let response;
        try {
            response = await fetch(PURPURA_DATACENTER_API_URL, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                signal: controller.signal
            });
        } finally {
            clearTimeout(abortTimer);
        }

        if (response && response.ok) {
            const list = await response.json();
            if (isUsableDatacenterList(list)) {
                writeDatacenterCache(list);
                return list;
            }
        }
    } catch (error) {
    }

    if (cached && isUsableDatacenterList(cached.list)) return cached.list;
    return null;
}

async function loadServerListData() {
    try {
        const url = chrome.runtime.getURL('data/ServerList.json');
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const serverListData = await response.json();

        if (Array.isArray(serverListData)) {
            serverIpMap = serverListData;
        } else {
            serverIpMap = serverListData;
        }

    } catch (error) {
        serverIpMap = [];
    }

    try {
        const apiList = await loadDatacenterList();
        if (isUsableDatacenterList(apiList)) serverIpMap = apiList;
    } catch (error) {
    }
}

async function getSimpleServerRegion(serverId, placeId) {
    if (regionCache.has(serverId)) {
        return regionCache.get(serverId);
    }

    try {
        if (!serverIpMap) {
            await loadServerListData();
        }

        const tabs = await chrome.tabs.query({url: "*://*.roblox.com/*"});

        if (tabs.length === 0) {
            const result = { region: "??", regionName: "Unknown", location: null };
            regionCache.set(serverId, result);
            return result;
        }

        const activeTab = tabs[0];

        const result = await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: async (serverId, placeId) => {
                async function getCsrfToken() {
                    try {
                        const response = await fetch('https://auth.roblox.com/v2/logout', {
                            method: 'POST',
                            credentials: 'include'
                        });
                        return response.headers.get('x-csrf-token');
                    } catch {
                        return null;
                    }
                }

                const csrfToken = await getCsrfToken();
                if (!csrfToken) {
                    return { error: 'Failed to get CSRF token' };
                }

                try {
                    const response = await fetch(`https://gamejoin.roblox.com/v1/join-game-instance`, {
                        method: 'POST',
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json",
                            "X-Csrf-Token": csrfToken
                        },
                        body: JSON.stringify({
                            placeId: parseInt(placeId, 10),
                            isTeleport: false,
                            gameId: serverId,
                            gameJoinAttemptId: crypto.randomUUID(),
                            isPlayTogetherGame: false
                        }),
                        credentials: 'include'
                    });

                    if (!response.ok) {
                        return { error: `HTTP ${response.status}` };
                    }

                    const data = await response.json();

                    const dataCenterId = data?.joinScript?.DataCenterId;
                    if (dataCenterId) {
                        return { dataCenterId, success: true };
                    }

                    const ipAddress = data?.joinScript?.UdmuxEndpoints?.[0]?.Address;
                    if (ipAddress) {
                        return { ipAddress, success: true };
                    }

                    return { error: 'No region data in response' };

                } catch (error) {
                    return { error: error.message };
                }
            },
            args: [serverId, placeId]
        });

        const serverData = result?.[0]?.result;

        if (!serverData || serverData.error) {
            const failResult = { region: "??", regionName: "Unknown", location: null };
            regionCache.set(serverId, failResult);
            return failResult;
        }

        let regionCode = "??";
        let regionName = "Unknown";
        let serverLat = null;
        let serverLon = null;

        if (serverData.dataCenterId) {
            const datacenterInfo = findDatacenter(serverData.dataCenterId);

            if (datacenterInfo && datacenterInfo.location) {
                const loc = datacenterInfo.location;
                const countryCode = loc.country;

                if (loc.latLong && loc.latLong.length === 2) {
                    serverLat = parseFloat(loc.latLong[0]);
                    serverLon = parseFloat(loc.latLong[1]);
                }

                if (countryCode === "US" && loc.region) {
                    const stateCode = getStateCodeFromRegion(loc.region);
                    regionCode = `US-${stateCode}`;
                    regionName = `${loc.city || loc.region}, ${loc.region}`;
                } else if (countryCode) {
                    regionCode = countryCode;
                    regionName = getRegionDisplayName(countryCode);
                }
            }
        }
        else if (serverData.ipAddress) {
            const ip = serverData.ipAddress.split('.').slice(0, 3).join('.') + '.0';
            const serverLocationData = serverIpMap.find(entry => entry.ip === ip);

            if (serverLocationData) {
                const countryCode = serverLocationData?.country?.code;
                serverLat = serverLocationData?.latitude;
                serverLon = serverLocationData?.longitude;

                if (countryCode === "US" && serverLocationData.region?.code) {
                    const stateCode = serverLocationData.region.code.replace(/-\d+$/, '');
                    regionCode = `US-${stateCode}`;
                    regionName = `${serverLocationData.region.name || stateCode}, USA`;
                } else if (countryCode) {
                    regionCode = countryCode;
                    regionName = getRegionDisplayName(countryCode);
                }
            }
        }

        const finalResult = {
            region: regionCode,
            regionName: regionName,
            location: (typeof serverLat === 'number' && typeof serverLon === 'number') ?
                { latitude: serverLat, longitude: serverLon } : null
        };

        regionCache.set(serverId, finalResult);
        return finalResult;

    } catch (error) {
        const result = { region: "??", regionName: "Unknown", location: null, error: error.message };
        return result;
    }
}

async function getCsrfToken(tabId) {
    try {
        const result = await chrome.scripting.executeScript({
            target: {tabId: tabId},
            func: async () => {

                const csrfMeta = document.querySelector('meta[name="csrf-token"]');
                if (csrfMeta) {
                    const token = csrfMeta.getAttribute('content');
                    if (token) return token;
                }

                if (window.Roblox && window.Roblox.XsrfToken) {                    try {
                        const token = window.Roblox.XsrfToken.getToken();
                        if (token) return token;
                    } catch (e) {
                    }
                }

                const hiddenInput = document.querySelector('input[name="__RequestVerificationToken"], input[name="csrf-token"]');
                if (hiddenInput) {
                    const token = hiddenInput.value;
                    if (token) return token;
                }

                if (window.__CSRF_TOKEN__) {
                    return window.__CSRF_TOKEN__;
                }

                const scripts = document.querySelectorAll('script');
                for (let script of scripts) {
                    if (script.textContent && script.textContent.includes('csrf') || script.textContent.includes('token')) {
                        const matches = script.textContent.match(/["']([a-zA-Z0-9+/=]{40,})["']/);
                        if (matches && matches[1]) {
                            return matches[1];
                        }
                    }
                }

                try {
                    const testResponse = await fetch('https://auth.roblox.com/v2/logout', {
                        method: 'POST',
                        credentials: 'include'
                    });
                    const token = testResponse.headers.get('x-csrf-token');
                    if (token) return token;
                } catch (e) {
                }

                try {
                    const testResponse2 = await fetch('https://catalog.roblox.com/v1/search/items/details', {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({})
                    });
                    const token = testResponse2.headers.get('x-csrf-token');
                    if (token) return token;
                } catch (e) {
                }

                return null;
            }
        });

        const token = result?.[0]?.result || null;
        return token;
    } catch (error) {
        return null;
    }
}

async function getAllServerRegions(placeId) {
    try {
        if (!serverIpMap) {
            await loadServerListData();
        }
        const serversResponse = await fetch(
            `https://games.roblox.com/v1/games/${placeId}/servers/Public?limit=100`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        if (!serversResponse.ok) {
            throw new Error(`Failed to fetch servers: ${serversResponse.status}`);
        }

        const serversData = await serversResponse.json();
        const servers = serversData.data || [];

        if (servers.length === 0) {
            return { regions: {} };
        }

        const tabs = await chrome.tabs.query({url: "*://*.roblox.com/*"});

        if (tabs.length === 0) {
            return { regions: {} };
        }

        const activeTab = tabs[0];

        const csrfResult = await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: async () => {
                try {
                    const response = await fetch('https://auth.roblox.com/v2/logout', {
                        method: 'POST',
                        credentials: 'include'
                    });
                    return response.headers.get('x-csrf-token');
                } catch {
                    return null;
                }
            }
        });

        const csrfToken = csrfResult?.[0]?.result;
        if (!csrfToken) {
            return { regions: {} };
        }

        const regionMap = {};
        const batchSize = 10;

        for (let i = 0; i < servers.length; i += batchSize) {
            const batch = servers.slice(i, i + batchSize);

            const batchPromises = batch.map(async (server) => {
                const serverId = server.id;

                if (regionCache.has(serverId)) {
                    return { serverId, data: regionCache.get(serverId) };
                }

                try {
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('timeout')), 3000)
                    );

                    const scriptPromise = chrome.scripting.executeScript({
                        target: { tabId: activeTab.id },
                        func: async (serverId, placeId, csrfToken) => {
                            try {
                                const controller = new AbortController();
                                const timeoutId = setTimeout(() => controller.abort(), 2500);

                                const response = await fetch(`https://gamejoin.roblox.com/v1/join-game-instance`, {
                                    method: 'POST',
                                    headers: {
                                        "Content-Type": "application/json",
                                        "X-Csrf-Token": csrfToken
                                    },
                                    body: JSON.stringify({
                                        placeId: parseInt(placeId, 10),
                                        isTeleport: false,
                                        gameId: serverId,
                                        gameJoinAttemptId: crypto.randomUUID()
                                    }),
                                    credentials: 'include',
                                    signal: controller.signal
                                });

                                clearTimeout(timeoutId);

                                if (!response.ok) {
                                    return { error: true, status: response.status };
                                }

                                const data = await response.json();
                                const dataCenterId = data?.joinScript?.DataCenterId;
                                const ipAddress = data?.joinScript?.UdmuxEndpoints?.[0]?.Address;

                                return { dataCenterId, ipAddress, fullResponse: data };
                            } catch (error) {
                                return { error: true, errorMsg: error.message };
                            }
                        },
                        args: [serverId, placeId, csrfToken]
                    });

                    const result = await Promise.race([scriptPromise, timeoutPromise]);

                    const serverData = result?.[0]?.result;
                    if (serverData && !serverData.error) {
                        return { serverId, data: serverData };
                    }
                } catch (error) {
                }

                return { serverId, data: null };
            });

            const batchResults = await Promise.all(batchPromises);

            for (const { serverId, data } of batchResults) {
                if (!data) {
                    continue;
                }

                let regionCode = "??";
                let regionName = "Unknown";
                let serverLat = null;
                let serverLon = null;

                if (data.dataCenterId) {
                    const datacenterInfo = findDatacenter(data.dataCenterId);

                    if (datacenterInfo && datacenterInfo.location) {
                        const loc = datacenterInfo.location;
                        const countryCode = loc.country;

                        if (loc.latLong && loc.latLong.length === 2) {
                            serverLat = parseFloat(loc.latLong[0]);
                            serverLon = parseFloat(loc.latLong[1]);
                        }

                        if (countryCode === "US" && loc.region) {
                            const stateCode = getStateCodeFromRegion(loc.region);
                            regionCode = `US-${stateCode}`;
                            regionName = `${loc.city || loc.region}, ${loc.region}`;
                        } else if (countryCode) {
                            regionCode = countryCode;
                            regionName = getRegionDisplayName(countryCode);
                        }
                    }
                }

                if (regionName === "Unknown" || regionCode === "??") {
                    regionName = "N/A";
                    regionCode = "N/A";
                }

                const regionData = {
                    region: regionCode,
                    regionName: regionName,
                    location: (typeof serverLat === 'number' && typeof serverLon === 'number') ?
                        { latitude: serverLat, longitude: serverLon } : null,
                    dataCenterId: data.dataCenterId || null,
                    serverIp: data.ipAddress || null
                };

                regionMap[serverId] = regionData;
                regionCache.set(serverId, regionData);
            }

            if (i + batchSize < servers.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        return { regions: regionMap };

    } catch (error) {
        return { regions: {} };
    }
}

function getStateCodeFromRegion(regionName) {
    const stateMap = {
        'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
        'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
        'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
        'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
        'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
        'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
        'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
        'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
        'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
        'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
    };

    return stateMap[regionName] || regionName.substring(0, 2).toUpperCase();
}
function getRegionDisplayName(regionCode) {
    const regionNames = {
        "SG": "Singapore",
        "DE": "Germany",
        "FR": "France",
        "JP": "Japan",
        "BR": "Brazil",
        "NL": "Netherlands",
        "US-CA": "California, USA",
        "US-VA": "Virginia, USA",
        "US-IL": "Illinois, USA",
        "US-TX": "Texas, USA",
        "US-FL": "Florida, USA",
        "US-NY": "New York, USA",
        "US-WA": "Washington, USA",
        "US-NJ": "New Jersey, USA",
        "US-OR": "Oregon, USA",
        "US-OH": "Ohio, USA",
        "AU": "Australia",
        "GB": "United Kingdom",
        "IN": "India"
    };

    return regionNames[regionCode] || regionCode;
}
async function getServerRegion(serverId) {

    if (regionCache.has(serverId)) {
        return regionCache.get(serverId);
    }

    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < REQUEST_THROTTLE_MS) {
        const waitTime = REQUEST_THROTTLE_MS - timeSinceLastRequest;
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    lastRequestTime = Date.now();

    try {
        if (!serverIpMap) {
            await loadServerListData();
        }

        const tabs = await chrome.tabs.query({url: "*://*.roblox.com/*"});

        if (tabs.length === 0) {
            const result = { region: "??", regionName: "Unknown", location: null, error: "No Roblox tabs" };
            regionCache.set(serverId, result);
            return result;
        }

        const activeTab = tabs[0];

        let result;
        try {
            result = await chrome.scripting.executeScript({
                target: {tabId: activeTab.id},
                func: async (serverId) => {

                if (!serverId) {
                    return { error: 'No server ID provided' };
                }


                async function getCsrfToken() {
                    try {
                        const response = await fetch('https://auth.roblox.com/v2/logout', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            credentials: 'include'
                        });

                        const token = response.headers.get('x-csrf-token');
                        if (token) {
                            return token;
                        } else {
                            const metaToken = document.querySelector('meta[name="csrf-token"]');
                            if (metaToken) {
                                return metaToken.getAttribute('content');
                            }
                            return null;
                        }
                    } catch (error) {
                        const metaToken = document.querySelector('meta[name="csrf-token"]');
                        if (metaToken) {
                            return metaToken.getAttribute('content');
                        }
                        return null;
                    }
                }

                function getStateCodeFromRegion(regionName) {
                    const stateMap = {
                        'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
                        'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
                        'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
                        'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
                        'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
                        'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
                        'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
                        'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
                        'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
                        'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
                    };

                    return stateMap[regionName] || regionName.substring(0, 2).toUpperCase();
                }

                const url = window.location.href;
                let placeId = null;
                const regex = /https:\/\/www\.roblox\.com\/(?:[a-z]{2}\/)?games\/(\d+)/;
                const match = url.match(regex);

                if (match && match[1]) {
                    placeId = parseInt(match[1], 10);
                } else {
                    return { error: 'Could not extract placeId from URL' };
                }

                try {
                    const authResponse = await fetch('https://users.roblox.com/v1/users/authenticated', {
                        credentials: 'include'
                    });

                    if (!authResponse.ok) {
                        return { error: 'User not logged in to Roblox' };
                    }

                    const authData = await authResponse.json();
                } catch (e) {
                    return { error: 'Failed to verify login status' };
                }

                try {
                    const homeResponse = await fetch('https://www.roblox.com/', {
                        credentials: 'include'
                    });
                } catch (e) {
                }

                try {
                    let csrfToken = await getCsrfToken();
                    if (!csrfToken) {
                        return { error: 'Failed to get CSRF token' };
                    }

                    let serverInfoResponse;
                    let retry = false;
                    let retryCount = 0;
                    const MAX_RETRIES = 3;

                    do {
                        retry = false;

                        if (retryCount > 0) {
                            await new Promise(resolve => setTimeout(resolve, 1000 + (retryCount * 500)));
                        }

                        serverInfoResponse = await fetch(`https://gamejoin.roblox.com/v1/join-game-instance`, {
                            method: 'POST',
                            headers: {
                                "Accept": "application/json, text/plain, */*",
                                "Accept-Language": "en-US,en;q=0.9",
                                "Cache-Control": "no-cache",
                                "Content-Type": "application/json",
                                "Pragma": "no-cache",
                                "Referer": `https://www.roblox.com/games/${placeId}/`,
                                "Origin": "https://www.roblox.com",
                                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
                                "X-Csrf-Token": csrfToken,
                                "Sec-Ch-Ua": '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
                                "Sec-Ch-Ua-Mobile": "?0",
                                "Sec-Ch-Ua-Platform": '"Windows"',
                                "Sec-Fetch-Dest": "empty",
                                "Sec-Fetch-Mode": "cors",
                                "Sec-Fetch-Site": "same-site"
                            },
                            body: JSON.stringify({
                                placeId: parseInt(placeId, 10),
                                isTeleport: false,
                                gameId: serverId,
                                gameJoinAttemptId: crypto.randomUUID(),
                                isPlayTogetherGame: false
                            }),
                            credentials: 'include',
                        });

                        if (serverInfoResponse.status === 403 && serverInfoResponse.headers.get('x-csrf-token') && retryCount < MAX_RETRIES) {
                            csrfToken = await getCsrfToken();
                            if (!csrfToken) {
                                return { error: 'Failed to refresh CSRF token' };
                            }
                            retry = true;
                            retryCount++;
                        } else if (serverInfoResponse.status === 429 && retryCount < MAX_RETRIES) {
                            retry = true;
                            retryCount++;
                        } else if (serverInfoResponse.status >= 500 && retryCount < MAX_RETRIES) {
                            retry = true;
                            retryCount++;
                        } else if (!serverInfoResponse.ok) {
                            return { error: `Request failed: ${serverInfoResponse.status}` };
                        }
                    } while (retry);

                    const ipData = await serverInfoResponse.json();

                    if (ipData?.message && ipData.message.includes('Unable to join Game')) {
                        if (ipData?.joinScript?.DataCenterId) {
                        }
                    }

                    if (ipData?.joinScript?.DataCenterId) {
                        const dataCenterId = ipData.joinScript.DataCenterId;

                        return {
                            dataCenterId: dataCenterId,
                            success: true,
                            serverInfo: ipData,
                            method: 'datacenter'
                        };
                    }

                    if (ipData?.joinScript?.UdmuxEndpoints?.[0]?.Address) {
                        let ip = ipData.joinScript.UdmuxEndpoints[0].Address;
                        ip = ip.split('.').slice(0, 3).join('.') + '.0';

                        return {
                            ipAddress: ip,
                            success: true,
                            serverInfo: ipData,
                            method: 'ip'
                        };
                    }

                    return { error: 'No region data available', serverInfo: ipData };

                } catch (error) {
                    return { error: error.message };
                }
            },
            args: [serverId]
        });
        } catch (executeError) {
            return {
                region: "??",
                regionName: "Unknown",
                location: null,
                error: `Script execution failed: ${executeError.message}`
            };
        }

        const serverInfo = result?.[0]?.result;

        if (!serverInfo || serverInfo.error) {
            return {
                region: "??",
                regionName: "Unknown",
                location: null,
                error: serverInfo?.error || "Failed to get server info"
            };
        }

        let regionCode = "??";
        let regionName = "Unknown";
        let serverLat = null;
        let serverLon = null;

        if (serverInfo.success && serverInfo.dataCenterId) {

            if (serverIpMap && Array.isArray(serverIpMap)) {
                const dataCenter = findDatacenter(serverInfo.dataCenterId);

                if (dataCenter) {
                    const countryCode = dataCenter.location?.country;

                    if (dataCenter.location?.latLong && dataCenter.location.latLong.length === 2) {
                        serverLat = parseFloat(dataCenter.location.latLong[0]);
                        serverLon = parseFloat(dataCenter.location.latLong[1]);
                    }

                    if (countryCode === "US" && dataCenter.location?.region) {
                        let stateCode = getStateCodeFromRegion(dataCenter.location.region);

                        if (stateCode) {
                            regionCode = `US-${stateCode}`;
                            regionName = `${dataCenter.location.region}, USA`;
                        } else {
                            regionCode = countryCode;
                            regionName = getRegionDisplayName(countryCode);
                        }
                    } else if (countryCode) {
                        regionCode = countryCode;
                        regionName = getRegionDisplayName(countryCode);
                    }
                }
            }
        } else if (serverInfo.success && serverInfo.method === 'ip' && serverInfo.ipAddress) {
            let ip = serverInfo.ipAddress;

            if (serverIpMap && Array.isArray(serverIpMap)) {
                const serverLocationData = serverIpMap.find(entry => entry.ip === ip);

                if (serverLocationData) {
                    const countryCode = serverLocationData?.country?.code;
                    serverLat = serverLocationData?.latitude;
                    serverLon = serverLocationData?.longitude;

                    if (countryCode === "US" && serverLocationData.region?.code) {
                        let stateCode = serverLocationData.region.code.replace(/-\d+$/, '');
                        regionCode = `US-${stateCode}`;
                        regionName = `${serverLocationData.region.name || stateCode}, USA`;
                    } else if (countryCode) {
                        regionCode = countryCode;
                        regionName = getRegionDisplayName(countryCode);
                    }
                }
            }
        }


        let userLocation = null;
        if (serverInfo.serverInfo?.joinScript?.SessionId) {
            try {
                const sessionData = JSON.parse(serverInfo.serverInfo.joinScript.SessionId || '{}');
                const latitude = sessionData?.Latitude;
                const longitude = sessionData?.Longitude;
                if (typeof latitude === 'number' && typeof longitude === 'number') {
                    userLocation = { latitude, longitude };
                }
            } catch (e) {
            }
        }

        const finalResult = {
            region: regionCode,
            regionName: regionName,
            location: (typeof serverLat === 'number' && typeof serverLon === 'number') ?
                { latitude: serverLat, longitude: serverLon } : null,
            userLocation: userLocation,
            dataCenterId: serverInfo.dataCenterId
        };

        regionCache.set(serverId, finalResult);

        return finalResult;

    } catch (error) {
        return { region: "??", regionName: "Unknown", location: null, error: error.message };
    }
}
loadServerListData();

chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: [{
        id: 1,
        priority: 1,
        action: {
            type: 'modifyHeaders',
            requestHeaders: [
                {
                    header: 'User-Agent',
                    operation: 'set',
                    value: 'Roblox/WinInet'
                }
            ]
        },
        condition: {
            urlFilter: 'https://gamejoin.roblox.com/v1/join-game-instance',
            resourceTypes: ['xmlhttprequest']
        }
    }]
}).catch(() => {});

const ICON_PATHS = {
    default: {
        16: chrome.runtime.getURL("images/icons/default/Purpura_Default_Logo_16.png"),
        48: chrome.runtime.getURL("images/icons/default/Purpura_Default_Logo_48.png"),
        128: chrome.runtime.getURL("images/icons/default/Purpura_Default_Logo_128.png")
    },
    newYears: {
        16: chrome.runtime.getURL("images/icons/newYears/Purpura_NewYears_Logo_16.png"),
        48: chrome.runtime.getURL("images/icons/newYears/Purpura_NewYears_Logo_48.png"),
        128: chrome.runtime.getURL("images/icons/newYears/Purpura_NewYears_Logo_128.png")
    },
    lunarNewYear: {
        16: chrome.runtime.getURL("images/icons/lunarNewYear/Purpura_LunarNewYear_Logo_16.png"),
        48: chrome.runtime.getURL("images/icons/lunarNewYear/Purpura_LunarNewYear_Logo_48.png"),
        128: chrome.runtime.getURL("images/icons/lunarNewYear/Purpura_LunarNewYear_Logo_128.png")
    },
    valentines: {
        16: chrome.runtime.getURL("images/icons/valentines/Purpura_Valentines_Logo_16.png"),
        48: chrome.runtime.getURL("images/icons/valentines/Purpura_Valentines_Logo_48.png"),
        128: chrome.runtime.getURL("images/icons/valentines/Purpura_Valentines_Logo_128.png")
    },
    blackHistory: {
        16: chrome.runtime.getURL("images/icons/blackHistory/Purpura_BlackHistory_Logo_16.png"),
        48: chrome.runtime.getURL("images/icons/blackHistory/Purpura_BlackHistory_Logo_48.png"),
        128: chrome.runtime.getURL("images/icons/blackHistory/Purpura_BlackHistory_Logo_128.png")
    },
    stPatricksDay: {
        16: chrome.runtime.getURL("images/icons/stPatricksDay/Purpura_StPatricks_Logo_16.png"),
        48: chrome.runtime.getURL("images/icons/stPatricksDay/Purpura_StPatricks_Logo_48.png"),
        128: chrome.runtime.getURL("images/icons/stPatricksDay/Purpura_StPatricks_Logo_128.png")
    },
    womensDay: {
        16: chrome.runtime.getURL("images/icons/womensDay/Purpura_WomensDay_Logo_16.png"),
        48: chrome.runtime.getURL("images/icons/womensDay/Purpura_WomensDay_Logo_48.png"),
        128: chrome.runtime.getURL("images/icons/womensDay/Purpura_WomensDay_Logo_128.png")
    },
    easter: {
        16: chrome.runtime.getURL("images/icons/easter/Purpura_Easter_Logo_16.png"),
        48: chrome.runtime.getURL("images/icons/easter/Purpura_Easter_Logo_48.png"),
        128: chrome.runtime.getURL("images/icons/easter/Purpura_Easter_Logo_128.png")
    },
    pride: {
        16: chrome.runtime.getURL("images/icons/pride/Purpura_Pride_Logo_16.png"),
        48: chrome.runtime.getURL("images/icons/pride/Purpura_Pride_Logo_48.png"),
        128: chrome.runtime.getURL("images/icons/pride/Purpura_Pride_Logo_128.png")
    },
    halloween: {
        16: chrome.runtime.getURL("images/icons/halloween/Purpura_Halloween_Logo_16.png"),
        48: chrome.runtime.getURL("images/icons/halloween/Purpura_Halloween_Logo_48.png"),
        128: chrome.runtime.getURL("images/icons/halloween/Purpura_Halloween_Logo_128.png")
    },
    diwali: {
        16: chrome.runtime.getURL("images/icons/diwali/Purpura_Diwali_Logo_16.png"),
        48: chrome.runtime.getURL("images/icons/diwali/Purpura_Diwali_Logo_48.png"),
        128: chrome.runtime.getURL("images/icons/diwali/Purpura_Diwali_Logo_128.png")
    },
    hanukkah: {
        16: chrome.runtime.getURL("images/icons/hanukkah/Purpura_Hanukkah_Logo_16.png"),
        48: chrome.runtime.getURL("images/icons/hanukkah/Purpura_Hanukkah_Logo_48.png"),
        128: chrome.runtime.getURL("images/icons/hanukkah/Purpura_Hanukkah_Logo_128.png")
    },
    christmas: {
        16: chrome.runtime.getURL("images/icons/christmas/Purpura_Christmas_Logo_16.png"),
        48: chrome.runtime.getURL("images/icons/christmas/Purpura_Christmas_Logo_48.png"),
        128: chrome.runtime.getURL("images/icons/christmas/Purpura_Christmas_Logo_128.png")
    }
};
function calculateEaster(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return { month, day };
}

function buildSeasons() {
    const year = new Date().getFullYear();
    const easter = calculateEaster(year);

    const easterStart = new Date(year, easter.month - 1, easter.day - 3);
    const easterEnd = new Date(year, easter.month - 1, easter.day + 1);

    return [
        { name: "newYears", start: [12, 28], end: [1, 2] },
        { name: "lunarNewYear", start: [1, 22], end: [2, 15] },
        { name: "valentines", start: [2, 7], end: [2, 15] },
        { name: "blackHistory", start: [2, 1], end: [2, 28] },
        { name: "stPatricksDay", start: [3, 15], end: [3, 18] },
        { name: "womensDay", start: [3, 6], end: [3, 10] },
        { name: "easter", start: [easterStart.getMonth() + 1, easterStart.getDate()], end: [easterEnd.getMonth() + 1, easterEnd.getDate()] },
        { name: "pride", start: [6, 1], end: [6, 30] },
        { name: "halloween", start: [10, 17], end: [11, 1] },
        { name: "diwali", start: [10, 15], end: [11, 15] },
        { name: "hanukkah", start: [11, 25], end: [12, 30] },
        { name: "christmas", start: [12, 18], end: [12, 25] }
    ];
}

let SEASONS = buildSeasons();
function isDateInRange(month, day, [startMonth, startDay], [endMonth, endDay]) {
    const year = new Date().getFullYear();
    const start = new Date(year, startMonth - 1, startDay);
    let end = new Date(year, endMonth - 1, endDay);
    if (end < start) end.setFullYear(year + 1);
    const current = new Date(year, month - 1, day);
    return current >= start && current <= end;
}
function getSeasonalIcon() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    for (const s of SEASONS) {
        if (isDateInRange(month, day, s.start, s.end)) {
            return ICON_PATHS[s.name];
        }
    }
    return ICON_PATHS.default;
}
function updateExtensionIcon() {
    SEASONS = buildSeasons();
    const icon = getSeasonalIcon();
    chrome.action.setIcon({ path: icon });
}
updateExtensionIcon();
const nextMidnight = new Date();
nextMidnight.setHours(24, 0, 0, 0);
setTimeout(() => {
    updateExtensionIcon();
    setInterval(updateExtensionIcon, 24 * 60 * 60 * 1000);
}, nextMidnight.getTime() - Date.now());

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getSeasonalIconUrl") {
        const icon = getSeasonalIcon();
        sendResponse({ iconUrl: icon[48] });
        return true;
    }
});

function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

function formatPlayerCount(count) {
    if (typeof count !== 'number') return '0';
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toLocaleString('en-US');
}

async function cacheDefaultSettings() {
    try {
        const url = chrome.runtime.getURL('data/default_settings.json');
        const resp = await fetch(url);
        if (!resp.ok) return;
        const data = await resp.json();
        chrome.storage.local.set({ purpuraDefaultSettings: data });
    } catch (e) {
    }
}

cacheDefaultSettings();

try {
    importScripts(chrome.runtime.getURL('content/core/sk-migrate.js'));
} catch (e) {
    console.warn('[Purpura] Storage migration script unavailable:', e);
}

async function runPurpuraStorageMigration() {
    if (!self.PurpuraStorageMigrate || typeof self.PurpuraStorageMigrate.migrateStorageKeys !== 'function') {
        return { migrated: 0, success: false, error: 'migration_unavailable' };
    }
    try {
        return await self.PurpuraStorageMigrate.migrateStorageKeys();
    } catch (e) {
        return { migrated: 0, success: false, error: e.message };
    }
}

function updateStatusSpooferRules(mode) {
    const enabled = mode === 'offline';
    chrome.declarativeNetRequest.updateEnabledRulesets(
        enabled
            ? { enableRulesetIds: ['offline_mode'] }
            : { disableRulesetIds: ['offline_mode'] }
    );
}

function normalizeStatusSpooferMode(value) {
    if (typeof value === 'object' && value !== null) {
        if (value.enabled !== true) return 'off';
        return normalizeStatusSpooferMode(value.mode);
    }
    if (value === true) return 'offline';
    if (value === false || value === undefined || value === null) return 'off';
    const lower = String(value).toLowerCase();
    if (lower === 'offline' || lower === 'studio' || lower === 'in-studio' || lower === 'off') return lower === 'in-studio' ? 'studio' : lower;
    return 'off';
}

chrome.runtime.onInstalled.addListener(() => {
    (async () => {
        const currentVersion = chrome.runtime.getManifest().version;
        const { lastSeenVersion } = await chrome.storage.local.get('lastSeenVersion');
        if (currentVersion !== lastSeenVersion) {
            chrome.tabs.create({ url: chrome.runtime.getURL('new.html') });
            await chrome.storage.local.set({ lastSeenVersion: currentVersion });
        }
    })().catch(() => {});

    runPurpuraStorageMigration().catch(() => {});

    (async () => {
        const data = await chrome.storage.local.get([
            'purpuraFirstInstalled',
            'purpuraRobloxVisits',
            'purpuraSettingsOpenedCount',
            'purpuraReviewPromptShown',
            'purpuraReviewPromptDismissed',
            'purpuraReviewCompleted'
        ]);
        if (!data.purpuraFirstInstalled) {
            await chrome.storage.local.set({
                purpuraFirstInstalled: Date.now(),
                purpuraRobloxVisits: 0,
                purpuraSettingsOpenedCount: 0,
                purpuraReviewPromptShown: false,
                purpuraReviewPromptDismissed: false,
                purpuraReviewPromptLastShown: null,
                purpuraReviewCompleted: false
            });
        }
    })().catch(() => {});

    fetch(chrome.runtime.getURL('data/default_settings.json'))
        .then(r => r.ok ? r.json() : {})
        .then(defaults => {
            if (!defaults || !Object.keys(defaults).length) return;

            const LOCAL_KEYS = new Set([
                'ghos', 'hpt', 'unc', 'uncConfig', 'pcr', 'pt',
                'thm', 'thmEnabled', 'rat', 'lts',
                'sdbr', 'bwr', 'stm', 'lb', 'rae',
                'ob', 'gr', 'sap',
            ]);

            const SKIP_SEED = new Set(['spc-legacy']);

            const syncWrites = {};
            const localWrites = {};

            chrome.storage.sync.get(Object.keys(defaults), syncResult => {
                chrome.storage.local.get(Object.keys(defaults), localResult => {
                    for (const [key, value] of Object.entries(defaults)) {
                        if (SKIP_SEED.has(key)) continue;
                        const stored = LOCAL_KEYS.has(key)
                            ? localResult[key]
                            : syncResult[key];
                        if (stored !== undefined) continue;
                        if (LOCAL_KEYS.has(key)) {
                            localWrites[key] = value;
                        } else {
                            syncWrites[key] = value;
                        }
                    }
                    if (Object.keys(syncWrites).length) chrome.storage.sync.set(syncWrites);
                    if (Object.keys(localWrites).length) chrome.storage.local.set(localWrites);
                });
            });
        })
        .catch(() => {});

    chrome.storage.sync.get(['spc', 'spc-legacy'], (result) => {
        let mode = 'off';
        if (result['spc'] !== undefined) {
            mode = normalizeStatusSpooferMode(result['spc']);
            if (typeof result['spc'] !== 'object' || result['spc'] === null) {
                const enabled = mode !== 'off';
                chrome.storage.sync.set({ 'spc': { enabled, mode: mode === 'off' ? 'offline' : mode } });
            }
        } else if (result['spc-legacy'] !== undefined) {
            mode = normalizeStatusSpooferMode(result['spc-legacy']);
            chrome.storage.sync.set({ 'spc': { enabled: !!result['spc-legacy'], mode: 'offline' } });
        }
        updateStatusSpooferRules(mode);
    });

    cacheDefaultSettings();
    initializeStudioApiKey();
});

chrome.runtime.onStartup.addListener(() => {
    runPurpuraStorageMigration().catch(() => {});

    chrome.storage.sync.get(['spc', 'spc-legacy'], (result) => {
        let mode = 'off';
        if (result['spc'] !== undefined) {
            mode = normalizeStatusSpooferMode(result['spc']);
            if (typeof result['spc'] !== 'object' || result['spc'] === null) {
                const enabled = mode !== 'off';
                chrome.storage.sync.set({ 'spc': { enabled, mode: mode === 'off' ? 'offline' : mode } });
            }
        } else if (result['spc-legacy'] !== undefined) {
            mode = normalizeStatusSpooferMode(result['spc-legacy']);
            chrome.storage.sync.set({ 'spc': { enabled: !!result['spc-legacy'], mode: 'offline' } });
        }
        updateStatusSpooferRules(mode);
    });
    cacheDefaultSettings();
    initializeStudioApiKey();
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace !== 'sync') return;
    if (changes['spc']) {
        updateStatusSpooferRules(normalizeStatusSpooferMode(changes['spc'].newValue));
    } else if (changes['spc-legacy']) {
        const enabled = !!changes['spc-legacy'].newValue;
        const mode = enabled ? 'offline' : 'off';
        updateStatusSpooferRules(mode);
        chrome.storage.sync.set({ 'spc': { enabled, mode: 'offline' } });
    }
});

const ghostProfilesState = { redirects: new Map() };

function handleGhostProfilesRedirect(details) {
    if (!details || typeof details.url !== 'string') return;
    const match = details.url.match(/\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?users\/(\d+)\/profile/i);
    if (!match || !match[1]) return;
    if (typeof details.tabId !== 'number') return;
    ghostProfilesState.redirects.set(details.tabId, match[1]);
}

function updateGhostProfilesListener() {
    if (!chrome.webRequest) return;

    chrome.storage.local.get(['ghos'], (result) => {
        const config = result['ghos'] || {};
        const enabled = !!config.enabled;
        const wantsPermission = !!config.webRequestPermission;

        const detach = () => {
            if (chrome.webRequest.onBeforeRedirect.hasListener(handleGhostProfilesRedirect)) {
                chrome.webRequest.onBeforeRedirect.removeListener(handleGhostProfilesRedirect);
            }
        };

        if (!enabled || !wantsPermission) {
            detach();
            return;
        }

        chrome.permissions.contains({ permissions: ['webRequest'] }, (has) => {
            if (!has) {
                detach();
                return;
            }

            if (!chrome.webRequest.onBeforeRedirect.hasListener(handleGhostProfilesRedirect)) {
                chrome.webRequest.onBeforeRedirect.addListener(
                    handleGhostProfilesRedirect,
                    {
                        urls: [
                            '*://www.roblox.com/users/*/profile*',
                            '*://www.roblox.com/*/users/*/profile*'
                        ]
                    }
                );
            }
        });
    });
}

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace !== 'local') return;
    if (changes['ghos']) {
        updateGhostProfilesListener();
    }
});

chrome.permissions.onAdded.addListener(() => {
    updateGhostProfilesListener();
});

chrome.permissions.onRemoved.addListener(() => {
    updateGhostProfilesListener();
});

updateGhostProfilesListener();
initializeStudioApiKey();

function purpuraRemadeNormalizeMethod(method, fallback = 'GET') {
    const fallbackMethod = String(fallback || 'GET').trim().toUpperCase() || 'GET';
    const normalized = String(method || fallbackMethod).trim().toUpperCase();
    return new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']).has(normalized) ? normalized : fallbackMethod;
}

function purpuraRemadeArrayBufferToBase64(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    const chunkSize = 0x8000;
    let binary = '';

    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
    }

    return btoa(binary);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!request || request.type !== 'PURPURA_FETCH_RESOURCE_REQUEST') {
        return;
    }

    (async () => {
        try {
            const headers = new Headers();
            if (typeof request.csrfToken === 'string' && request.csrfToken) {
                headers.set('X-CSRF-TOKEN', request.csrfToken);
            }
            if (typeof request.boundAuthToken === 'string' && request.boundAuthToken) {
                headers.set('x-bound-auth-token', request.boundAuthToken);
            }
            headers.set('Accept', request.accept || 'text/plain, application/json;q=0.9, */*;q=0.8');
            headers.set('Referer', 'https://www.roblox.com/');

            if (request.headers && typeof request.headers === 'object') {
                Object.entries(request.headers).forEach(([key, value]) => {
                    if (typeof key === 'string' && key && typeof value === 'string' && value) {
                        headers.set(key, value);
                    }
                });
            }

            const method = purpuraRemadeNormalizeMethod(request.method, 'GET');
            const bodyText = typeof request.body === 'string' && request.body.length > 0 ? request.body : undefined;
            const body = method === 'GET' || method === 'HEAD' ? undefined : bodyText;

            if (body && !headers.has('content-type')) {
                headers.set('content-type', 'application/json');
            }

            if (request.useStudioApiKey === true) {
                const keyResult = await ensureStudioApiKey(false);
                if (keyResult && keyResult.ok && typeof keyResult.apiKey === 'string' && keyResult.apiKey) {
                    headers.set('x-api-key', keyResult.apiKey);
                }
            }

            const isPurpura = new URL(request.url).origin === 'https://api.purpura.page';
            const executeFetch = () => fetch(request.url, {
                method,
                credentials: isPurpura ? 'omit' : 'include',
                headers: isPurpura ? new Headers({ Accept: 'application/json' }) : headers,
                body,
                ...(isPurpura ? { referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(8000) } : {})
            });

            let response = await executeFetch();

            if (request.useStudioApiKey === true && (response.status === 401 || response.status === 403)) {
                await invalidateStudioApiKey();
                const refreshed = await ensureStudioApiKey(true);
                if (refreshed && refreshed.ok && typeof refreshed.apiKey === 'string' && refreshed.apiKey) {
                    headers.set('x-api-key', refreshed.apiKey);
                    response = await executeFetch();
                }
            }

            if (request.responseType === 'arraybuffer') {
                const bodyBuffer = await response.arrayBuffer();
                sendResponse({
                    ok: response.ok,
                    status: response.status,
                    contentType: response.headers.get('content-type') || '',
                    csrfToken: response.headers.get('x-csrf-token') || '',
                    boundAuthToken: response.headers.get('x-bound-auth-token') || '',
                    rateLimitRemaining: response.headers.get('x-ratelimit-remaining') || '',
                    rateLimitReset: response.headers.get('x-ratelimit-reset') || '',
                    retryAfter: response.headers.get('retry-after') || '',
                    base64: purpuraRemadeArrayBufferToBase64(bodyBuffer)
                });
                return;
            }

            sendResponse({
                ok: response.ok,
                status: response.status,
                contentType: response.headers.get('content-type') || '',
                csrfToken: response.headers.get('x-csrf-token') || '',
                boundAuthToken: response.headers.get('x-bound-auth-token') || '',
                rateLimitRemaining: response.headers.get('x-ratelimit-remaining') || '',
                rateLimitReset: response.headers.get('x-ratelimit-reset') || '',
                retryAfter: response.headers.get('retry-after') || '',
                text: await response.text()
            });
        } catch (error) {
            sendResponse({
                ok: false,
                status: 0,
                contentType: '',
                text: error?.message || String(error)
            });
        }
    })();

    return true;
});

const PURPURA_API_ORIGIN = 'https://api.purpura.page';
const PURPURA_API_TIMEOUT_MS = 8000;
let purpuraReviewIdentityPromise = null;

function purpuraReviewIdentity() {
    if (!purpuraReviewIdentityPromise) {
        purpuraReviewIdentityPromise = (async () => {
            const response = await fetch('https://users.roblox.com/v1/users/authenticated', {
                credentials: 'include', signal: AbortSignal.timeout(PURPURA_API_TIMEOUT_MS),
            });
            if (!response.ok) return null;
            const user = await response.json();
            if (!Number.isSafeInteger(user.id) || !/^[A-Za-z0-9_]{3,20}$/.test(user.name || '')) return null;
            const stored = await chrome.storage.local.get('purpuraReviewCredentials');
            const credentials = stored.purpuraReviewCredentials || {};
            let key = credentials[String(user.id)];
            if (typeof key !== 'string' || !/^[a-f0-9]{64}$/.test(key)) {
                key = Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('');
                credentials[String(user.id)] = key;
                await chrome.storage.local.set({ purpuraReviewCredentials: credentials });
            }
            return { key, username: user.name };
        })().finally(() => { purpuraReviewIdentityPromise = null; });
    }
    return purpuraReviewIdentityPromise;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request?.type !== 'PURPURA_REVIEWS_REQUEST') return;
    (async () => {
        try {
            const settings = await chrome.storage.sync.get('grev');
            const local = await chrome.storage.local.get('noFeatures');
            if (settings.grev === false || local.noFeatures === true) throw new Error('Game Reviews is disabled.');
            const universeId = Number(request.universeId);
            if (!Number.isSafeInteger(universeId) || universeId <= 0 || universeId > 9e15) throw new Error('Invalid game.');
            const operation = request.operation;
            if (!['list', 'mine', 'save', 'delete'].includes(operation)) throw new Error('Invalid review operation.');
            const headers = new Headers({ Accept: 'application/json' });
            const url = new URL(operation === 'list' ? '/v1/reviews' : '/v1/reviews/mine', PURPURA_API_ORIGIN);
            url.searchParams.set('universeId', String(universeId));
            let identity = null;
            if (operation === 'list') {
                url.searchParams.set('page', String(request.page || 1));
                url.searchParams.set('sort', request.sort || 'newest');
            } else {
                identity = await purpuraReviewIdentity();
                if (!identity) {
                    sendResponse({ ok: operation === 'mine', review: null, canWrite: false, error: 'Log in to Roblox to review.' });
                    return;
                }
                headers.set('x-purpura-review-key', identity.key);
            }
            const writing = operation === 'save' || operation === 'delete';
            if (writing && request.expectedUsername !== identity.username) {
                throw new Error('Your Roblox login changed. Refresh reviews before continuing.');
            }
            const latest = await chrome.storage.sync.get('grev');
            const restrictions = await chrome.storage.local.get('noFeatures');
            if (latest.grev === false || restrictions.noFeatures === true) throw new Error('Game Reviews is disabled.');
            let body;
            if (writing) {
                headers.set('content-type', 'application/json');
                body = JSON.stringify({ action: operation,
                    gameplay: request.gameplay, creativity: request.creativity, polish: request.polish,
                    reviewText: request.reviewText });
            }
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), PURPURA_API_TIMEOUT_MS);
            try {
                const response = await fetch(url.href, {
                    method: writing ? 'POST' : 'GET', headers, body, credentials: 'omit', signal: controller.signal,
                });
                const data = await response.json();
                sendResponse({ ...data, ok: response.ok, canWrite: !!identity, username: identity?.username });
            } finally { clearTimeout(timer); }
        } catch (error) {
            sendResponse({ ok: false, error: error?.message || 'Reviews request failed.' });
        }
    })();
    return true;
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request?.type !== 'PURPURA_SHARE_SERVER_LINK') return;
    (async () => {
        try {
            const [settings, restrictions] = await Promise.all([
                chrome.storage.sync.get('ssl'), chrome.storage.local.get('noFeatures'),
            ]);
            if (settings.ssl === false || restrictions.noFeatures === true) throw new Error('Share Server Links is disabled.');
            const placeId = request.placeId;
            const serverId = request.serverId;
            if (!Number.isSafeInteger(placeId) || placeId <= 0 || placeId > 9e15 ||
                typeof serverId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(serverId)) {
                throw new Error('Invalid game/server target.');
            }
            const fallback = `https://purpura.page/join/?placeId=${placeId}&serverId=${serverId.toLowerCase()}`;
            try {
                const response = await fetch(`${PURPURA_API_ORIGIN}/v1/server-links`, {
                    method: 'POST', credentials: 'omit', headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ placeId, serverId }), signal: AbortSignal.timeout(PURPURA_API_TIMEOUT_MS),
                });
                const data = await response.json();
                if (!response.ok || typeof data.url !== 'string' || !/^https:\/\/purpura\.page\/join\/\?code=[a-f0-9]{24}$/.test(data.url)) {
                    throw new Error('Short link unavailable.');
                }
                sendResponse({ ok: true, url: data.url, fallback: false });
            } catch (error) {
                sendResponse({ ok: true, url: fallback, fallback: true });
            }
        } catch (error) {
            sendResponse({ ok: false, error: error?.message || 'Unable to share server.' });
        }
    })();
    return true;
});

const PURPURA_LIVE_COUNTERS_TTL_MS = 10000;
const purpuraLiveCountersCache = new Map();
const purpuraLiveCountersInflight = new Map();
const purpuraLiveCountersCooldown = new Map();

async function purpuraLiveCountersFetch(universeId) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PURPURA_API_TIMEOUT_MS);
    try {
        const result = { universeId, fetchedAt: Date.now() };
        const count = value => Number.isSafeInteger(value) && value >= 0;
        await Promise.allSettled([
            ['games', `https://games.roblox.com/v1/games?universeIds=${universeId}`],
            ['votes', `https://games.roblox.com/v1/games/votes?universeIds=${universeId}`],
        ].map(async ([kind, url]) => {
            const cooldownKey = `${universeId}:${kind}`;
            const until = purpuraLiveCountersCooldown.get(cooldownKey) || 0;
            if (until > Date.now()) {
                result.retryAfterMs = Math.max(result.retryAfterMs || 0, until - Date.now());
                return;
            }
            const response = await fetch(url, { credentials: 'omit', cache: 'no-store', signal: controller.signal });
            if (response.status === 429) {
                const header = response.headers?.get('retry-after');
                const seconds = Number(header);
                const delay = Math.max(15000, Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : Date.parse(header) - Date.now() || 60000);
                purpuraLiveCountersCooldown.set(cooldownKey, Date.now() + delay);
                result.retryAfterMs = Math.max(result.retryAfterMs || 0, delay);
                return;
            }
            if (!response.ok) return;
            const body = await response.json();
            const row = body?.data?.find(item => item.id === universeId);
            if (!row) return;
            const fields = kind === 'games' ? ['playing', 'visits', 'favoritedCount'] : ['upVotes', 'downVotes'];
            for (const field of fields) if (count(row[field])) result[field] = row[field];
        }));
        result.ok = ['playing', 'visits', 'favoritedCount', 'upVotes', 'downVotes'].some(field => count(result[field]));
        if (!result.ok) result.error = 'Live counters are temporarily unavailable.';
        if (result.retryAfterMs) result.status = 429;
        return result;
    } finally {
        clearTimeout(timer);
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request?.type !== 'PURPURA_LIVE_COUNTERS_REQUEST') return;
    (async () => {
        try {
            const [settings, restrictions] = await Promise.all([
                chrome.storage.sync.get('lc'), chrome.storage.local.get('noFeatures'),
            ]);
            if (settings.lc === false || settings.lc?.enabled === false || restrictions.noFeatures === true) throw new Error('Live Counters is disabled.');
            const universeId = Number(request.universeId);
            if (!Number.isSafeInteger(universeId) || universeId <= 0 || universeId > 9e15) throw new Error('Invalid game.');
            const cached = purpuraLiveCountersCache.get(universeId);
            if (cached && Date.now() - cached.fetchedAt < PURPURA_LIVE_COUNTERS_TTL_MS) {
                sendResponse(cached);
                return;
            }
            let pending = purpuraLiveCountersInflight.get(universeId);
            if (!pending) {
                pending = purpuraLiveCountersFetch(universeId).finally(() => purpuraLiveCountersInflight.delete(universeId));
                purpuraLiveCountersInflight.set(universeId, pending);
            }
            const result = await pending;
            if (result.ok) {
                if (purpuraLiveCountersCache.size >= 100) purpuraLiveCountersCache.delete(purpuraLiveCountersCache.keys().next().value);
                purpuraLiveCountersCache.set(universeId, result);
            }
            sendResponse(result);
        } catch (error) {
            sendResponse({ ok: false, status: error?.status || 0, error: error?.message || 'Live counters request failed.' });
        }
    })();
    return true;
});

function purpuraApiOriginAllowed(url) {
    try {
        return new URL(String(url || '')).origin === PURPURA_API_ORIGIN;
    } catch (error) {
        return false;
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!request || request.type !== 'PURPURA_API_REQUEST') {
        return;
    }

    (async () => {
        try {
            if (!purpuraApiOriginAllowed(request.url)) {
                sendResponse({ ok: false, status: 0, text: 'Blocked: url is not on the Purpura API origin' });
                return;
            }

            const method = purpuraRemadeNormalizeMethod(request.method, 'GET');
            const headers = new Headers({ 'Accept': 'application/json' });

            const bodyText = typeof request.body === 'string' && request.body.length > 0 ? request.body : undefined;
            const body = method === 'GET' || method === 'HEAD' ? undefined : bodyText;
            if (body) headers.set('content-type', 'application/json');

            const controller = new AbortController();
            const abortTimer = setTimeout(() => controller.abort(), PURPURA_API_TIMEOUT_MS);

            try {
                const response = await fetch(request.url, { method, headers, body, signal: controller.signal });
                sendResponse({ ok: response.ok, status: response.status, text: await response.text() });
            } finally {
                clearTimeout(abortTimer);
            }
        } catch (error) {
            sendResponse({ ok: false, status: 0, text: error?.message || String(error) });
        }
    })();

    return true;
});

chrome.tabs.onUpdated.addListener((tabId,changeInfo,tab)=>{if(changeInfo.status!=="complete")return;if(!tab.url||!tab.url.includes("roblox.com"))return;if(tab.url.includes("create.roblox.com")||tab.url.includes("devforum.roblox.com"))return;chrome.storage.local.get(["purpuraFirstInstalled","purpuraRobloxVisits","purpuraSettingsOpened","purpuraReviewPromptShown","purpuraReviewCompleted"],(data)=>{if(data.purpuraReviewPromptShown||data.purpuraReviewCompleted)return;const sevenDays=7*24*60*60*1000;const installedLongEnough=data.purpuraFirstInstalled&&(Date.now()-data.purpuraFirstInstalled>=sevenDays);const visits=(data.purpuraRobloxVisits||0)+1;const update={purpuraRobloxVisits:visits};const settingsCount=(data.purpuraSettingsOpenedCount||0)+(tab.url.includes("purpura=")?1:0);if(tab.url.includes("purpura=")){update.purpuraSettingsOpenedCount=settingsCount}if(installedLongEnough&&visits>=15&&settingsCount>=2){update.purpuraReviewEligible=true}chrome.storage.local.set(update)})});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_USER_ID') {
        getRobloxUserId()
            .then(userId => {
                if (!userId) {
                }
                sendResponse({ userId });
            })
            .catch(err => {
                sendResponse({ userId: null });
            });
        return true;
    }
});

(function() {
'use strict';

var PT_STORAGE_KEY = 'purpura_playtime';
var PT_DAILY_KEY = 'purpura_playtime_daily';
var PT_SESSION_KEY = 'purpura_playtime_sessions';
var PT_TRACKING_KEY = 'purpura_playtime_tracking';
var PT_USER_ID_KEY = 'purpura_playtime_userid';
var PT_ALARM_NAME = 'purpura-playtime-poll';
var PT_POLL_MINUTES = 0.5;
var PT_MIN_SESSION_MS = 30000;
var PT_STALE_AFTER_MS = 2 * 60 * 1000;
var PT_MAX_SESSIONS = 500;
var PT_MAX_DAILY = 90;

var ptEnabled = false;
var ptUserId = null;
var ptTracking = null;
var ptPollInFlight = false;
var ptInitPromise = null;

function ptGetStorage(key, fallback) {
    return new Promise(function(resolve) {
        chrome.storage.local.get([key], function(data) {
            resolve(data[key] !== undefined ? data[key] : fallback);
        });
    });
}

function ptSetStorage(key, value) {
    return new Promise(function(resolve) {
        var obj = {};
        obj[key] = value;
        chrome.storage.local.set(obj, resolve);
    });
}

function ptGetDateKey(ts) {
    var d = new Date(ts || Date.now());
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

async function ptGetUserId() {
    if (ptUserId) return ptUserId;
    var cached = await ptGetStorage(PT_USER_ID_KEY, null);
    if (cached) { ptUserId = parseInt(cached, 10); return ptUserId; }
    try {
        var resp = await fetch('https://users.roblox.com/v1/users/authenticated', { credentials: 'include' });
        if (resp.ok) {
            var data = await resp.json();
            if (data && data.id) {
                ptUserId = data.id;
                await ptSetStorage(PT_USER_ID_KEY, ptUserId);
                return ptUserId;
            }
        }
    } catch (e) {}
    return null;
}

async function ptCheckPresence(uid) {
    try {
        var resp = await fetch('https://presence.roblox.com/v1/presence/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userIds: [uid] })
        });
        if (!resp.ok) return null;
        var data = await resp.json();
        if (data.userPresences && data.userPresences.length > 0) {
            return data.userPresences[0];
        }
    } catch (e) {}
    return null;
}

async function ptResolvePlaceToUniverse(placeId) {
    try {
        var resp = await fetch('https://games.roblox.com/v1/games/multiget-place-details?placeIds=' + encodeURIComponent(placeId));
        if (!resp.ok) return null;
        var data = await resp.json();
        if (data && data.length > 0 && data[0].universeId) {
            return data[0].universeId;
        }
    } catch (e) {}
    return null;
}

async function ptRecordSession(sessionStart, universeId, rootPlaceId, gameName) {
    if (!sessionStart || !gameName || gameName === 'Unknown Game') return;
    var endTime = Date.now();
    var durationMs = endTime - sessionStart;
    if (durationMs < PT_MIN_SESSION_MS) return;
    var durationMinutes = Math.max(1, Math.round(durationMs / 60000));

    var playtimeData = await ptGetStorage(PT_STORAGE_KEY, { games: {} });
    var dailyStats = await ptGetStorage(PT_DAILY_KEY, []);
    var sessionHistory = await ptGetStorage(PT_SESSION_KEY, []);

    if (!playtimeData.games) playtimeData.games = {};

    var key = universeId || ('unknown_' + sessionStart);
    var game = playtimeData.games[key] || {
        universeId: universeId,
        rootPlaceId: rootPlaceId || null,
        name: gameName,
        totalMinutes: 0,
        lastPlayed: 0,
        sessions: 0,
        firstPlayedAt: endTime
    };

    game.totalMinutes += durationMinutes;
    game.lastPlayed = endTime;
    game.sessions = (game.sessions || 0) + 1;
    if (rootPlaceId && !game.rootPlaceId) game.rootPlaceId = rootPlaceId;
    if (gameName && gameName !== 'Unknown Game') game.name = gameName;
    playtimeData.games[key] = game;

    var dateKey = ptGetDateKey(sessionStart);
    var day = dailyStats.find(function(d) { return d.date === dateKey; });
    if (!day) {
        day = { date: dateKey, totalMinutes: 0, games: {} };
        dailyStats.unshift(day);
    }
    day.totalMinutes += durationMinutes;
    day.games[key] = (day.games[key] || 0) + durationMinutes;
    if (dailyStats.length > PT_MAX_DAILY) dailyStats = dailyStats.slice(0, PT_MAX_DAILY);

    sessionHistory.unshift({
        id: sessionStart + '-' + Math.random().toString(36).substring(2, 8),
        universeId: universeId,
        rootPlaceId: rootPlaceId || null,
        gameName: gameName,
        startTime: sessionStart,
        endTime: endTime,
        durationMinutes: durationMinutes
    });
    if (sessionHistory.length > PT_MAX_SESSIONS) sessionHistory = sessionHistory.slice(0, PT_MAX_SESSIONS);

    await Promise.all([
        ptSetStorage(PT_STORAGE_KEY, playtimeData),
        ptSetStorage(PT_DAILY_KEY, dailyStats),
        ptSetStorage(PT_SESSION_KEY, sessionHistory)
    ]);
}

async function ptPoll() {
    if (ptPollInFlight) return;
    ptPollInFlight = true;

    try {
        await ptEnsureInitialized();
        if (!ptEnabled) return;

        var uid = await ptGetUserId();
        if (!uid) return;

        var now = Date.now();
        var presence = await ptCheckPresence(uid);

        if (!presence) {
            if (ptTracking && ptTracking.lastSeenAt && now - ptTracking.lastSeenAt >= PT_STALE_AFTER_MS) {
                var staleSession = ptTracking;
                ptTracking = null;
                await ptSetStorage(PT_TRACKING_KEY, null);
                await ptRecordSession(staleSession.sessionStart, staleSession.universeId, staleSession.rootPlaceId, staleSession.gameName);
            }
            return;
        }

        var presenceType = presence.userPresenceType;
        if (presenceType !== 2) {
            if (ptTracking) {
                var endedSession = ptTracking;
                ptTracking = null;
                await ptSetStorage(PT_TRACKING_KEY, null);
                await ptRecordSession(endedSession.sessionStart, endedSession.universeId, endedSession.rootPlaceId, endedSession.gameName);
            }
            return;
        }

        var currentPlaceId = presence.placeId || null;
        var currentUniverseId = presence.universeId || null;
        if (!currentUniverseId && currentPlaceId) {
            currentUniverseId = await ptResolvePlaceToUniverse(currentPlaceId);
            if (!currentUniverseId) currentUniverseId = currentPlaceId;
        }
        var currentName = presence.lastLocation || null;
        var currentRootPlaceId = presence.rootPlaceId || null;
        var identityMatches = false;
        if (ptTracking) {
            if (currentUniverseId && ptTracking.universeId) {
                identityMatches = String(currentUniverseId) === String(ptTracking.universeId);
            } else if (currentPlaceId && ptTracking.placeId) {
                identityMatches = String(currentPlaceId) === String(ptTracking.placeId);
            } else {
                identityMatches = true;
            }
        }

        if (ptTracking && ptTracking.lastSeenAt && now - ptTracking.lastSeenAt >= PT_STALE_AFTER_MS) {
            var expiredSession = ptTracking;
            ptTracking = null;
            await ptSetStorage(PT_TRACKING_KEY, null);
            await ptRecordSession(expiredSession.sessionStart, expiredSession.universeId, expiredSession.rootPlaceId, expiredSession.gameName);
        }

        if (!ptTracking || !identityMatches) {
            if (ptTracking) {
                var changedGameSession = ptTracking;
                ptTracking = null;
                await ptSetStorage(PT_TRACKING_KEY, null);
                await ptRecordSession(changedGameSession.sessionStart, changedGameSession.universeId, changedGameSession.rootPlaceId, changedGameSession.gameName);
            }
            ptTracking = {
                sessionStart: now,
                lastSeenAt: now,
                universeId: currentUniverseId,
                placeId: currentPlaceId,
                rootPlaceId: currentRootPlaceId,
                gameName: currentName || 'Unknown Game'
            };
            await ptSetStorage(PT_TRACKING_KEY, ptTracking);
            return;
        }

        var updated = false;
        ptTracking.lastSeenAt = now;
        if (currentUniverseId && ptTracking.universeId !== currentUniverseId) {
            ptTracking.universeId = currentUniverseId;
            updated = true;
        }
        if (currentPlaceId && ptTracking.placeId !== currentPlaceId) {
            ptTracking.placeId = currentPlaceId;
            updated = true;
        }
        if (currentRootPlaceId && ptTracking.rootPlaceId !== currentRootPlaceId) {
            ptTracking.rootPlaceId = currentRootPlaceId;
            updated = true;
        }
        if (currentName && currentName !== 'Unknown Game' && ptTracking.gameName !== currentName) {
            ptTracking.gameName = currentName;
            updated = true;
        }
        if (updated || ptTracking.lastSeenAt === now) await ptSetStorage(PT_TRACKING_KEY, ptTracking);
    } catch (e) {} finally {
        ptPollInFlight = false;
    }
}

async function ptInit() {
    var syncData = await new Promise(function(resolve) {
        chrome.storage.sync.get(['plt'], function(data) { resolve(data); });
    });
    ptEnabled = !!(syncData.plt && syncData.plt.enabled !== false);
    ptTracking = await ptGetStorage(PT_TRACKING_KEY, null);
    if (ptTracking && !ptTracking.lastSeenAt) {
        ptTracking = null;
        await ptSetStorage(PT_TRACKING_KEY, null);
    }
}

function ptEnsureInitialized() {
    if (!ptInitPromise) {
        ptInitPromise = ptInit().catch(function() {});
    }
    return ptInitPromise;
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync' && changes.plt) {
        ptEnabled = !!(changes.plt.newValue && changes.plt.newValue.enabled !== false);
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (!request || request.action !== 'refreshPlaytimePresence') return;
    ptPoll().then(function() {
        sendResponse({ success: true, enabled: ptEnabled });
    }).catch(function() {
        sendResponse({ success: false, enabled: ptEnabled });
    });
    return true;
});

chrome.alarms.create(PT_ALARM_NAME, { periodInMinutes: PT_POLL_MINUTES });
chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === PT_ALARM_NAME) {
        ptPoll();
    }
});

ptInitPromise = ptInit().catch(function() {});
ptInitPromise.then(function() {
    ptPoll();
});
purpuraAvatarCyclerUpdate();
})();
