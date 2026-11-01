/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';
    if (window.purpuraRolimonsProfileInitialized) return;
    window.purpuraRolimonsProfileInitialized = true;

    var SETTING_KEY = 'rvp';
    var ROW_ID = 'purpura-rvp-row';
    var PROFILE_URL_RE = /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?users\/(\d+)\/profile(?:\/|$)/i;

    var enabled = false;
    var generation = 0;
    var currentUserId = null;
    var stats = null;
    var observer = null;

    function t(key, fallback) { return chrome.i18n.getMessage(key) || fallback; }
    function fmt(n) { return typeof n === 'number' ? n.toLocaleString('en-US') : n; }

    function profileUserId() {
        var m = PROFILE_URL_RE.exec(location.pathname);
        if (!m) return null;
        if (document.body && document.body.dataset.purpuraGhostProfile === '1') return null;
        return m[1];
    }

    function addStyles() {
        if (document.getElementById('purpura-rvp-style')) return;
        var s = document.createElement('style');
        s.id = 'purpura-rvp-style';
        s.textContent =
            '#' + ROW_ID + '{display:flex;flex-wrap:wrap;align-items:center;gap:6px;}' +
            '#' + ROW_ID + ' .purpura-rvp-chip{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 14px;' +
            'border-radius:999px;font-size:14px;font-weight:600;text-decoration:none!important;color:inherit;' +
            'background:rgba(127,127,127,.18);transition:background .15s;}' +
            '#' + ROW_ID + ' .purpura-rvp-chip:hover{background:rgba(127,127,127,.3);}' +
            '#' + ROW_ID + ' .purpura-rvp-chip img{width:16px;height:16px;}' +
            '.light-theme #' + ROW_ID + ' .purpura-rvp-chip img{filter:invert(1);}';
        document.head.appendChild(s);
    }

    function chip(kind, icon, label, valueText, userId) {
        var a = document.createElement('a');
        a.className = 'purpura-rvp-chip purpura-rvp-' + kind;
        a.href = 'https://www.rolimons.com/player/' + userId;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.title = label;
        var img = document.createElement('img');
        img.src = chrome.runtime.getURL(icon);
        img.alt = '';
        var span = document.createElement('span');
        span.textContent = valueText;
        a.appendChild(img);
        a.appendChild(span);
        return a;
    }

    function findTarget() {
        var header = document.querySelector('.user-profile-header');
        var info = header && header.querySelector(':scope > .user-profile-header-info');
        if (info) return { parent: header, after: info };
        var pills = document.querySelector('.profile-header-overlay .flex-nowrap.gap-small.flex');
        if (pills) return { parent: pills, after: null };
        return null;
    }

    function render() {
        var userId = currentUserId;
        if (!enabled || !userId || !stats) return;
        var target = findTarget();
        if (!target) return;
        var row = document.getElementById(ROW_ID);
        if (row && row.dataset.key === userId + '|' + stats.key && row.parentNode === target.parent) return;
        if (row) row.remove();
        addStyles();
        row = document.createElement('div');
        row.id = ROW_ID;
        row.dataset.key = userId + '|' + stats.key;
        if (stats.value !== undefined) {
            row.appendChild(chip('value', 'images/rolimons/rolimons.png', t('rvp_value', 'Rolimons Value'), fmt(stats.value), userId));
        }
        row.appendChild(chip('rap', 'images/rolimons/robux.png', t('rvp_rap', 'RAP'), fmt(stats.rap), userId));
        if (target.after) target.parent.insertBefore(row, target.after.nextSibling);
        else target.parent.appendChild(row);
    }

    async function fetchCollectibles(userId) {
        var items = [];
        var cursor = '';
        for (var page = 0; page < 50; page++) {
            var url = 'https://inventory.roblox.com/v1/users/' + userId + '/assets/collectibles?limit=100&sortOrder=Asc' +
                (cursor ? '&cursor=' + encodeURIComponent(cursor) : '');
            var res = await fetch(url, { credentials: 'include' });
            if (res.status === 403) return null;
            if (!res.ok) throw new Error('inventory ' + res.status);
            var data = await res.json();
            if (Array.isArray(data.data)) items = items.concat(data.data);
            cursor = data.nextPageCursor;
            if (!cursor) break;
        }
        return items;
    }

    async function fetchValues(ids) {
        var unique = Array.from(new Set(ids));
        var rows = {};
        for (var i = 0; i < unique.length; i += 100) {
            var result = await chrome.runtime.sendMessage({ type: 'PURPURA_PROFILE_VALUES', ids: unique.slice(i, i + 100) });
            if (!result || !result.ok) throw new Error((result && result.error) || 'values unavailable');
            Object.assign(rows, result.items || {});
        }
        return rows;
    }

    async function load(userId, gen) {
        stats = { key: 'loading', rap: '…', value: '…' };
        render();
        var items;
        try {
            items = await fetchCollectibles(userId);
        } catch (_) {
            if (gen !== generation) return;
            stats = { key: 'error', rap: '???', value: '???' };
            render();
            return;
        }
        if (gen !== generation) return;
        if (items === null) {
            var priv = t('rvp_private', 'Private');
            stats = { key: 'private', rap: priv };
            render();
            return;
        }
        var rap = 0;
        for (var i = 0; i < items.length; i++) rap += Number(items[i].recentAveragePrice) || 0;
        stats = { key: 'rap', rap: rap, value: items.length ? '…' : 0 };
        render();
        if (!items.length) return;
        var valueText;
        try {
            var rows = await fetchValues(items.map(function (it) { return Number(it.assetId); }));
            var value = 0;
            for (var j = 0; j < items.length; j++) {
                var row = rows[items[j].assetId];
                if (!row) continue;
                var v = row.value === null || row.value === undefined ? row.rap : row.value;
                value += Number(v) || 0;
            }
            valueText = value;
        } catch (_) {
            valueText = '???';
        }
        if (gen !== generation) return;
        stats = { key: 'done', rap: rap, value: valueText };
        render();
    }

    function reset() {
        generation++;
        stats = null;
        currentUserId = null;
        var row = document.getElementById(ROW_ID);
        if (row) row.remove();
    }

    function sync() {
        var userId = enabled ? profileUserId() : null;
        if (userId !== currentUserId) {
            reset();
            currentUserId = userId;
            if (userId) load(userId, generation);
            return;
        }
        render();
    }

    function start() {
        if (observer) return;
        var pending = false;
        observer = new MutationObserver(function () {
            if (pending) return;
            pending = true;
            requestAnimationFrame(function () { pending = false; sync(); });
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
        sync();
    }

    function stop() {
        if (observer) { observer.disconnect(); observer = null; }
        reset();
    }

    function apply() { if (enabled) start(); else stop(); }

    window.__PurpuraSettings.ready.then(function () {
        enabled = window.__PurpuraSettings.get(SETTING_KEY) !== false;
        apply();
    });

    chrome.storage.onChanged.addListener(function (changes, area) {
        if (area !== 'sync' || !changes[SETTING_KEY]) return;
        enabled = changes[SETTING_KEY].newValue !== false;
        apply();
    });
})();
