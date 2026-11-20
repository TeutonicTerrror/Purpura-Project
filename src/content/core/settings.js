/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';
    if (window.__PurpuraSettings && window.__PurpuraSettings.ready) return;
    var READY_PROMISE;
    var _readyResolve;
    READY_PROMISE = new Promise(function (r) { _readyResolve = r; });
    function safeGet(key) { return undefined; }
    function safeSet(key, value) { return Promise.resolve(); }
    var SAFE_API = {
        get: safeGet,
        set: safeSet,
        ready: READY_PROMISE,
        STORAGE_MAP: {},
    };
    window.__PurpuraSettings = SAFE_API;
    try {
    const STORAGE_MAP = {
        bd: 'sync',
        ps: 'sync',
        qs: 'sync',
        explr: 'sync',
        pg: 'sync',
        mpl: 'sync',
        pgr: 'sync',
        srm: 'sync',
        go: 'sync',
        grev: 'sync',
        sho: 'sync',
        ssl: 'sync',
        rs: 'sync',
        lc: 'sync',
        otp: 'sync',
        pwi: 'sync',
        qp: 'sync',
        glw: 'sync',
        fm: 'sync',
        lo: 'sync',
        as: 'sync',
        ia: 'sync',
        ac: 'sync',
        nr: 'sync',
        rconv: 'sync',
        rbp: 'sync',
        rbon: 'sync',
        biv: 'sync',
        up: 'sync',
        tse: 'sync',
        slr: 'sync',
        rr: 'sync',
        pb: 'sync',
        si: 'sync',
        cs: 'sync',
        spc: 'sync',
        sap: 'local',
        bc: 'local',
        bcAutoRefresh: 'local',
        lts: 'sync',
        gr: 'local',
        'spc-legacy': 'sync',
        thm: 'local',
        thmEnabled: 'local',
        frpt: 'sync',
        ghos: 'local',
        hpt: 'local',
        unc: 'local',
        uncConfig: 'local',
        pcr: 'local',
        pt: 'local',
        sdbr: 'local',
        sbt: 'local',
        bwr: 'local',
        sfix: 'local',
        ucp: 'local',
        tbd: 'local',
        dav: 'local',
        sft: 'local',
        cbg: 'local',
        rat: 'local',
        stm: 'local',
        lb: 'local',
        bsn: 'sync',
        psc: 'sync',
        es: 'sync',
        qse: 'sync',
        dva: 'sync',
        rae: 'sync',
        ob: 'local',
        pinnedGamesList: 'local',
        pinnedGamesFolders: 'local',
        pgfCollapsed: 'local',
        widgetPosition: 'local',
        recentGames: 'local',
        widgetSortMode: 'local',
        r6w: 'sync',
        aa: 'sync',
        eo: 'sync',
        rvp: 'sync',
        rwr: 'sync',
        gb: 'sync',
        gbBtn: 'sync',
        gbPageBtn: 'sync',
        bffStar: 'sync',
        rwrNye: 'sync',
        vb: 'sync',
        oilp: 'sync',
    };
    const CACHE = {};
    let READY = false;
    async function loadDefaults() {
        try {
            var url = chrome.runtime.getURL('data/default_settings.json');
            var resp = await fetch(url);
            if (resp.ok) return await resp.json();
        } catch (_) { }
        return {
            bd: { enabled: true, showDatabase: true, roundToWholeNumbers: true },
            ps: true, qs: true, explr: true, ac: true, bc: true, bcAutoRefresh: true,
            spc: { enabled: false, mode: 'offline' },
            si: { enabled: true, info: { region: true, ping: true, fps: true,
                   serverVersion: false, serverId: false } },
        };
    }
    function storageFor(key) {
        return STORAGE_MAP[key] === 'local' ? chrome.storage.local : chrome.storage.sync;
    }
    init().catch(function () {
        _readyResolve();
    });
    async function init() {
        var defaults = await loadDefaults();
        var results = await Promise.all([
            new Promise(function (r) { chrome.storage.sync.get(null, r); }),
            new Promise(function (r) { chrome.storage.local.get(null, r); }),
        ]);
        var syncData = results[0] || {};
        var localData = results[1] || {};
        if (localData.rae !== undefined && syncData.rae === undefined) {
            syncData.rae = localData.rae;
            chrome.storage.sync.set({ rae: localData.rae });
        }
        if (syncData.qse !== undefined && syncData.es === undefined) {
            syncData.es = syncData.qse;
            chrome.storage.sync.set({ es: syncData.qse });
        }
        var syncWrites = {};
        var localWrites = {};
        var allKeys = new Set();
        Object.keys(STORAGE_MAP).forEach(function (k) { allKeys.add(k); });
        Object.keys(defaults).forEach(function (k) { allKeys.add(k); });
        allKeys.forEach(function (key) {
            var area = STORAGE_MAP[key] || 'sync';
            var stored = area === 'sync' ? syncData[key] : localData[key];
            if (stored !== undefined) {
                CACHE[key] = stored;
            } else if (defaults[key] !== undefined) {
                CACHE[key] = defaults[key];
                if (area === 'sync') {
                    syncWrites[key] = defaults[key];
                } else {
                    localWrites[key] = defaults[key];
                }
            }
        });
        if (typeof syncData.up === 'boolean') {
            syncData.up = { enabled: syncData.up, showPending: true };
            CACHE['up'] = syncData.up;
            syncWrites.up = syncData.up;
        }
        if (typeof syncData.rconv === 'boolean') {
            syncData.rconv = {
                enabled: syncData.rconv,
                rateType: 'Regular',
                currency: 'USD',
                customRate: '',
                color: '#ffffff'
            };
            CACHE['rconv'] = syncData.rconv;
            syncWrites.rconv = syncData.rconv;
        }
        if (syncData.rconv && typeof syncData.rconv === 'object' && syncData.rconv.color === '#00a2ff') {
            syncData.rconv = Object.assign({}, syncData.rconv, { color: '#ffffff' });
            CACHE['rconv'] = syncData.rconv;
            syncWrites.rconv = syncData.rconv;
        }
        if (CACHE['es'] === undefined && CACHE['qse'] !== undefined) {
            CACHE['es'] = CACHE['qse'];
            if (STORAGE_MAP['es'] === 'sync') syncWrites['es'] = CACHE['qse'];
            else localWrites['es'] = CACHE['qse'];
        }
        if (CACHE['rae'] === true) {
            CACHE['rae'] = false;
            syncWrites['rae'] = false;
        }
        if (CACHE['fm'] === true) {
            CACHE['fm'] = false;
            syncWrites['fm'] = false;
        }
        if (Object.keys(syncWrites).length) chrome.storage.sync.set(syncWrites);
        if (Object.keys(localWrites).length) chrome.storage.local.set(localWrites);
        READY = true;
        _readyResolve();
    }
    function get(key) {
        return CACHE[key];
    }
    function getRaw(key) {
        return CACHE[key];
    }
    function set(key, value) {
        CACHE[key] = value;
        var storage = storageFor(key);
        var data = {};
        data[key] = value;
        return new Promise(function (resolve) {
            storage.set(data, resolve);
        });
    }
    chrome.storage.onChanged.addListener(function (changes, namespace) {
        Object.keys(changes).forEach(function (key) {
            var expectedArea = STORAGE_MAP[key] || 'sync';
            if (namespace === expectedArea) {
                CACHE[key] = changes[key].newValue;
            }
        });
    });
    window.__PurpuraSettings = {
        get: get,
        getRaw: getRaw,
        set: set,
        ready: READY_PROMISE,
        STORAGE_MAP: STORAGE_MAP,
    };
    } catch (_err) {
        _readyResolve();
    }
})();
