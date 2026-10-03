/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';
    var REFRESH_MS = 15000;
    var enabled = false;
    var options = {};
    var universeId = null;
    var nextRefresh = 0;
    var generation = 0;
    var configuration = 0;
    var pending = null;
    var last = {};
    var lastPath = location.pathname;
    var counters = new Map();
    var formatter = new Intl.NumberFormat();

    function isGamePage() {
        return /^\/games\/\d+(?:\/|$)/.test(location.pathname);
    }

    function readUniverseId() {
        var meta = document.querySelector('#game-detail-page[data-universe-id], #game-detail-meta-data[data-universe-id]');
        var id = Number(meta && meta.getAttribute('data-universe-id'));
        return Number.isSafeInteger(id) && id > 0 ? id : null;
    }

    function restore() {
        counters.forEach(function (state, node) {
            cancelAnimationFrame(state.frame);
            node.textContent = state.originalText;
            if (state.originalTitle === null) node.removeAttribute('title');
            else node.title = state.originalTitle;
            node.removeAttribute('data-purpura-live');
            node.classList.remove('purpura-live-counter');
        });
        counters.clear();
    }

    function paint(node, value) {
        if (!node || !Number.isSafeInteger(value) || value < 0) return;
        var state = counters.get(node);
        if (!state) {
            var original = Number((node.title || node.textContent).replace(/[^0-9]/g, ''));
            state = { originalText: node.textContent, originalTitle: node.getAttribute('title'),
                current: /^\s*[\d, .]+\s*$/.test(node.title || node.textContent) && Number.isSafeInteger(original) ? original : value,
                target: null, frame: 0 };
            counters.set(node, state);
        }
        var render = function (number) {
            state.current = number;
            var text = formatter.format(number);
            if (node.textContent !== text) node.textContent = text;
            node.title = String(number);
            node.setAttribute('data-purpura-live', String(value));
            node.classList.add('purpura-live-counter');
        };
        if (state.target === value) {
            if (!state.frame) render(value);
            return;
        }
        cancelAnimationFrame(state.frame);
        state.target = value;
        var start = state.current;
        if (start === value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            state.frame = 0;
            render(value);
            return;
        }
        var started = performance.now();
        var duration = 5000;
        var animate = function (now) {
            if (!enabled || !node.isConnected) { state.frame = 0; return; }
            var progress = Math.min(1, (now - started) / duration);
            render(Math.round(start + (value - start) * progress));
            state.frame = progress < 1 ? requestAnimationFrame(animate) : 0;
        };
        state.frame = requestAnimationFrame(animate);
    }

    function apply() {
        if (!enabled) return;
        counters.forEach(function (state, node) {
            if (!node.isConnected) { cancelAnimationFrame(state.frame); counters.delete(node); }
        });
        var stat = document.querySelector('.game-stat');
        if (options.players) paint(stat && stat.querySelector('p:nth-of-type(2)'), last.playing);
        if (options.visits) paint(document.getElementById('game-visits-count'), last.visits);
        if (options.likeDislike) {
            paint(document.getElementById('vote-up-text'), last.upVotes);
            paint(document.getElementById('vote-down-text'), last.downVotes);
            var favorite = document.querySelector('#game-favorite-count, #game-favorites-count, #favorite-count');
            if (!favorite) {
                var favoriteButton = document.querySelector('#favorite-icon, .game-stat .icon-favorite');
                favorite = favoriteButton && favoriteButton.closest('.game-stat')?.querySelector('p:nth-of-type(2)');
            }
            if (!favorite) favorite = document.querySelector('.game-stat:nth-child(2) p:nth-of-type(2)');
            paint(favorite, last.favoritedCount);
        }
    }

    async function tick() {
        if (!enabled || !isGamePage() || document.hidden || !universeId || pending || Date.now() < nextRefresh) return;
        if (!options.likeDislike && !options.players && !options.visits) return;
        var current = generation;
        var id = universeId;
        var path = location.pathname;
        var token = {};
        pending = token;
        nextRefresh = Date.now() + REFRESH_MS;
        try {
            var result = await chrome.runtime.sendMessage({ type: 'PURPURA_LIVE_COUNTERS_REQUEST', universeId: id });
            if (current !== generation || path !== location.pathname || id !== readUniverseId() || !enabled) return;
            if (result?.ok) {
                for (var field of ['playing', 'visits', 'favoritedCount', 'upVotes', 'downVotes']) {
                    if (Number.isSafeInteger(result[field]) && result[field] >= 0) last[field] = result[field];
                }
                apply();
            }
        } catch (error) {
        } finally {
            if (pending === token) pending = null;
        }
    }

    function restart() {
        generation++;
        restore();
        universeId = null;
        last = {};
        pending = null;
        nextRefresh = 0;
        lastPath = location.pathname;
    }

    async function configure() {
        var current = ++configuration;
        var results = await Promise.all([chrome.storage.sync.get('lc'), chrome.storage.local.get('noFeatures')]);
        if (current !== configuration) return;
        var raw = results[0].lc;
        var config = raw && typeof raw === 'object' ? raw : {};
        enabled = raw !== false && config.enabled !== false && results[1].noFeatures !== true;
        options = { likeDislike: config.likeDislike !== false, players: config.players !== false, visits: config.visits !== false };
        restart();
        update();
    }

    function update() {
        if (!enabled) return;
        var id = isGamePage() ? readUniverseId() : null;
        if (lastPath !== location.pathname || (universeId && universeId !== id)) restart();
        if (!isGamePage()) return;
        universeId = id;
        apply();
        tick().catch(function () {});
    }

    setInterval(update, 1000);
    document.addEventListener('visibilitychange', function () {
        if (!document.hidden) update();
    });
    chrome.storage.onChanged.addListener(function (changes, area) {
        if ((area === 'sync' && changes.lc) || (area === 'local' && changes.noFeatures)) configure().catch(function () {});
    });
    configure().catch(function () {});
})();
