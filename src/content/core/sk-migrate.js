/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function (globalScope) {
    'use strict';

    const OLD_TO_NEW = {
        sync: {
            'bot-detector': 'bd',
            'status-spoofer': 'spc',
            'offline-mode': 'spc-legacy',
            'server-info': 'si',
            'game-launcher-widget': 'glw',
            'game-launcher-omnibox': 'glw-omnibox',
            'game-outfits': 'go',
            'pinned-games': 'pg',
            'quick-play': 'qp',
            'purpuras-selection': 'ps',
            'page-binds': 'pb',
            'avatar-search': 'as',
            'infinite-avatar': 'ia',
            'sticky-avatar-preview': 'sap',
            'save-lots-robux': 'slr',
            'quick-status-switcher': 'qs',
            'quick-settings': 'qs',
            'quick-settings-manager': 'qs',
            'no-rent': 'nr',
            'robux-conversions': 'rconv',
            'bundle-item-viewer': 'biv',
            'friends-manager': 'fm',
            'last-online': 'lo',
            'better-continue': 'bc',
            'legacy-theme-switcher': 'lts',
            'save-lots-robux-place-id': '__slr_placeId__'
        },
        local: {
            'ghost-profiles': 'ghos',
            'uncooperatify': 'unc',
            'uncoorporatifyConfig': 'uncConfig',
            'unpending-robux': 'up',
            'greetings': 'gr',
            'greetings-enabled': 'gr',
            'purpuraCursor': 'pcr',
            'purpura-cursors': 'pcr',
            'purpuraTabs': 'pt',
            'purpura-tabs': 'pt',
            'homePageTweaks': 'hpt',
            'home-page-tweaks': 'hpt',
            'bloatwareRemover': 'bwr',
            'bloatware-remover': 'bwr',
            'reworkedSidebar': 'sdbr',
            'reworked-sidebar': 'sdbr',
            'redesigned-avatar-editor': 'rae',
            'roblox-age-theme': 'rat',
            'streamer-mode': 'stm',
            'login-banner': 'lb',
            'purpuraOnboardingShown': 'ob',
            'purpura-last-online-cache-v1': 'lo'
        }
    };

    const FALLBACK_DEFAULTS = {
        si: { enabled: true, info: { region: true, ping: true, fps: true, serverVersion: false, serverId: false } },
        bd: { enabled: true, showDatabase: true, roundToWholeNumbers: true },
        go: { enabled: true, launchPopup: false },
        pb: { enabled: false, binds: [] },
        hpt: { enabled: true, todaysGamePicks: true, continuePlaying: false, recommendedGames: true, favoriteGames: false, standoutGames: true, friends: false },
        ghos: { enabled: false, webRequestPermission: false },
        bwr: { enabled: false },
        pcr: { enabled: false, preset: 'default', cursor: 'auto', name: 'Default', type: 'preset', trailEffects: false },
        pt: { enabled: false, favicon: { type: 'purpura' }, titleFormat: '{n} Purpura' },
        sdbr: { enabled: false },
        slr: { enabled: false, placeId: '' },
        rat: { enabled: false, theme: 'Normal Roblox' },
        spc: { enabled: false, mode: 'offline' },
        uncConfig: { enabled: true, sections: { charts: true, marketplace: true, create: true, groups: true } }
    };

    // Keys for features that have been removed from Purpura. Swept from
    // storage on every migration run so existing users' orphaned values are
    // cleaned up (removing a nonexistent key is a no-op, so this is safe to
    // run unconditionally).
    const REMOVED_FEATURE_KEYS = {
        sync: [],
        local: ['fix-memory-leak', 'blm', 'betterLightMode', 'better-light-mode']
    };

    const SKIP_NORMALIZE_KEYS = new Set([
        'savedThemes',
        'rothemerActive',
        'selectedTheme',
        'purpuraDefaultSettings',
        'purpura_studio_api_keys',
        'purpura_ghost_api_keys',
        'robloxUserId',
        'sessionKey',
        'sessionExpiry',
        'noFeatures',
        'noFeaturesReason',
        'pinnedGamesList',
        'pinnedGamesFolders'
    ]);

    function storageGetAll(storage) {
        return new Promise(resolve => {
            try {
                storage.get(null, data => resolve(data || {}));
            } catch {
                resolve({});
            }
        });
    }

    function storageSet(storage, values) {
        return new Promise(resolve => {
            if (!values || !Object.keys(values).length) {
                resolve();
                return;
            }
            try {
                storage.set(values, () => resolve());
            } catch {
                resolve();
            }
        });
    }

    function storageRemove(storage, keys) {
        return new Promise(resolve => {
            if (!keys || !keys.length) {
                resolve();
                return;
            }
            try {
                storage.remove(keys, () => resolve());
            } catch {
                resolve();
            }
        });
    }

    function deepClone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function valuesEqual(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    function hyphenToCamel(value) {
        return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    }

    function expandKeyMap(keyMap) {
        const expanded = { ...keyMap };
        for (const [oldKey, newKey] of Object.entries(keyMap)) {
            const camel = hyphenToCamel(oldKey);
            if (camel !== oldKey && expanded[camel] === undefined) {
                expanded[camel] = newKey;
            }
        }
        return expanded;
    }

    async function loadDefaults() {
        try {
            const stored = await new Promise(resolve => {
                chrome.storage.local.get(['purpuraDefaultSettings'], resolve);
            });
            if (stored.purpuraDefaultSettings && typeof stored.purpuraDefaultSettings === 'object') {
                return { ...FALLBACK_DEFAULTS, ...stored.purpuraDefaultSettings };
            }
        } catch { /* ignore */ }

        try {
            const url = chrome.runtime.getURL('data/default_settings.json');
            const resp = await fetch(url);
            if (resp.ok) {
                const json = await resp.json();
                return { ...FALLBACK_DEFAULTS, ...json };
            }
        } catch { /* ignore */ }

        return { ...FALLBACK_DEFAULTS };
    }

    function defaultForKey(key, defaults) {
        if (Object.prototype.hasOwnProperty.call(defaults, key)) {
            return defaults[key];
        }
        return FALLBACK_DEFAULTS[key];
    }

    function isObjectSettingDefault(def) {
        return def && typeof def === 'object' && !Array.isArray(def);
    }

    function normalizeStorageValue(key, value, defaults) {
        if (value === undefined || value === null) {
            return undefined;
        }

        const def = defaultForKey(key, defaults);

        if (typeof value === 'boolean') {
            if (isObjectSettingDefault(def)) {
                const out = deepClone(def);
                out.enabled = value;
                return out;
            }
            return value;
        }

        if (Array.isArray(value)) {
            if (key === 'pb') {
                const out = isObjectSettingDefault(def) ? deepClone(def) : { enabled: true, binds: [] };
                out.enabled = true;
                out.binds = value;
                return out;
            }
            return value;
        }

        if (typeof value === 'object' && isObjectSettingDefault(def)) {
            const out = { ...deepClone(def), ...value };
            if (Object.prototype.hasOwnProperty.call(def, 'enabled') && !Object.prototype.hasOwnProperty.call(value, 'enabled')) {
                out.enabled = true;
            }
            return out;
        }

        return value;
    }

    function mergeStorageValues(key, existing, incoming, defaults) {
        const left = normalizeStorageValue(key, existing, defaults);
        const right = normalizeStorageValue(key, incoming, defaults);

        if (typeof left === 'boolean' || typeof right === 'boolean') {
            return right !== undefined ? right : left;
        }

        if (Array.isArray(left) || Array.isArray(right)) {
            return right !== undefined ? right : left;
        }

        if (isObjectSettingDefault(left) || isObjectSettingDefault(right)) {
            const def = defaultForKey(key, defaults);
            const base = isObjectSettingDefault(def) ? deepClone(def) : {};
            return { ...base, ...(left || {}), ...(right || {}) };
        }

        return right !== undefined ? right : left;
    }

    function applySlrPlaceId(allData, toSet, placeIdValue, defaults) {
        const merged = mergeStorageValues(
            'slr',
            toSet.slr !== undefined ? toSet.slr : allData.slr,
            { placeId: String(placeIdValue ?? '') },
            defaults
        );
        toSet.slr = merged;
    }

    async function migrateStorageArea(area, defaults) {
        const storage = area === 'sync' ? chrome.storage.sync : chrome.storage.local;
        const keyMap = expandKeyMap(OLD_TO_NEW[area] || {});
        const allData = await storageGetAll(storage);
        const toSet = {};
        const toRemove = [];
        let migrated = 0;

        const working = { ...allData };

        for (const [oldKey, newKey] of Object.entries(keyMap)) {
            if (!(oldKey in working) || working[oldKey] === undefined) {
                continue;
            }

            const oldValue = working[oldKey];

            if (newKey === '__slr_placeId__') {
                const before = toSet.slr !== undefined ? toSet.slr : working.slr;
                applySlrPlaceId(working, toSet, oldValue, defaults);
                if (!valuesEqual(before, toSet.slr)) {
                    migrated++;
                }
                toRemove.push(oldKey);
                delete working[oldKey];
                continue;
            }

            const normalizedOld = normalizeStorageValue(newKey, oldValue, defaults);
            const existing = toSet[newKey] !== undefined ? toSet[newKey] : working[newKey];
            let nextValue;

            if (existing === undefined) {
                nextValue = normalizedOld;
            } else {
                nextValue = mergeStorageValues(newKey, existing, normalizedOld, defaults);
            }

            if (!valuesEqual(existing, nextValue)) {
                migrated++;
            }

            toSet[newKey] = nextValue;
            working[newKey] = nextValue;
            toRemove.push(oldKey);
            delete working[oldKey];
        }

        Object.assign(working, toSet);

        const normalizeKeys = new Set([
            ...Object.keys(defaults),
            ...Object.values(OLD_TO_NEW.sync || {}),
            ...Object.values(OLD_TO_NEW.local || {}),
            ...Object.keys(working)
        ]);

        for (const key of normalizeKeys) {
            if (SKIP_NORMALIZE_KEYS.has(key) || key === '__slr_placeId__') {
                continue;
            }
            if (!(key in working) || working[key] === undefined) {
                continue;
            }

            const current = toSet[key] !== undefined ? toSet[key] : working[key];
            const normalized = normalizeStorageValue(key, current, defaults);
            if (normalized === undefined || valuesEqual(current, normalized)) {
                continue;
            }

            toSet[key] = normalized;
            working[key] = normalized;
            migrated++;
        }

        await storageSet(storage, toSet);
        await storageRemove(storage, [...toRemove, ...(REMOVED_FEATURE_KEYS[area] || [])]);

        return migrated;
    }

    async function migrateStorageKeys() {
        const defaults = await loadDefaults();
        let migrated = 0;

        migrated += await migrateStorageArea('sync', defaults);
        migrated += await migrateStorageArea('local', defaults);

        return { migrated, success: true };
    }

    globalScope.PurpuraStorageMigrate = {
        migrateStorageKeys
    };
})(typeof globalThis !== 'undefined' ? globalThis : window);
