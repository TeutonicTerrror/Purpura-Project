/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';
    if (window.__purpuraMostPlayedLoaded) return;
    window.__purpuraMostPlayedLoaded = true;

    var ID = 'purpura-most-played';
    var MAX_GAMES = 20;
    var RANGES = [
        { key: '7', days: 7, label: ['mostPlayed_range7', 'Past 7 days'], short: ['mostPlayed_range7Short', '7d'] },
        { key: '30', days: 30, label: ['mostPlayed_range30', 'Past 30 days'], short: ['mostPlayed_range30Short', '30d'] },
        { key: 'all', days: 0, label: ['mostPlayed_rangeAll', 'All time'], short: ['mostPlayed_rangeAllShort', 'All'] }
    ];
    var range = '30';
    var enabled = false;
    var renderSeq = 0;
    var gameInfoCache = new Map();
    var GREETING_WAIT_MS = 4000;
    var greetingWaitSince = 0;
    var fastTick = 0;

    function t(key, fallback) { return chrome.i18n.getMessage(key) || fallback; }

    function isHome() {
        var p = location.pathname.toLowerCase();
        return location.hostname === 'www.roblox.com' && (p === '/' || p === '/home' || p === '/home/' || /^\/[a-z]{2}(?:-[a-z]{2})?\/home\/?$/.test(p));
    }

    function formatMinutes(m) {
        var h = Math.floor(m / 60), r = m % 60;
        return h ? (r ? h + 'h ' + r + 'm' : h + 'h') : r + 'm';
    }

    function dateKey(d) {
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function rank(playtime, daily, days) {
        var games = (playtime && playtime.games) || {};
        var totals = {};
        if (!days) {
            Object.keys(games).forEach(function (k) { totals[k] = games[k].totalMinutes || 0; });
        } else {
            var cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - (days - 1));
            var min = dateKey(cutoff);
            (Array.isArray(daily) ? daily : []).forEach(function (day) {
                if (!day || day.date < min || !day.games) return;
                Object.keys(day.games).forEach(function (k) { totals[k] = (totals[k] || 0) + (day.games[k] || 0); });
            });
        }
        return Object.keys(totals)
            .map(function (k) {
                var g = games[k] || {};
                return { universeId: Number(g.universeId || k), minutes: totals[k], sessions: g.sessions || 0, name: g.name, rootPlaceId: g.rootPlaceId };
            })
            .filter(function (g) { return Number.isSafeInteger(g.universeId) && g.universeId > 0 && g.minutes > 0; })
            .sort(function (a, b) { return b.minutes - a.minutes; })
            .slice(0, MAX_GAMES);
    }

    function fetchJson(url) {
        return fetch(url, { credentials: 'include' }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
    }

    function loadGameInfo(ids) {
        var missing = ids.filter(function (id) { return !gameInfoCache.has(id); });
        if (!missing.length) return Promise.resolve();
        var q = missing.join(',');
        return Promise.all([
            fetchJson('https://games.roblox.com/v1/games?universeIds=' + q).catch(function () { return null; }),
            fetchJson('https://thumbnails.roblox.com/v1/games/icons?universeIds=' + q + '&returnPolicy=PlaceHolder&size=150x150&format=Webp&isCircular=false').catch(function () { return null; })
        ]).then(function (res) {
            var info = {};
            ((res[0] && res[0].data) || []).forEach(function (g) { info[g.id] = { rootPlaceId: g.rootPlaceId, name: g.name }; });
            ((res[1] && res[1].data) || []).forEach(function (row) {
                if (row.state === 'Completed' && row.imageUrl) (info[row.targetId] = info[row.targetId] || {}).thumb = row.imageUrl;
            });
            Object.keys(info).forEach(function (id) { gameInfoCache.set(Number(id), info[id]); });
        });
    }

    function injectStyles() {
        if (document.getElementById(ID + '-style')) return;
        var s = document.createElement('style');
        s.id = ID + '-style';
        var r = '#' + ID;
        var muted = 'var(--purpura-secondaryText,var(--color-content-muted,#a3a3a3))';
        var main = 'var(--purpura-mainText,var(--color-content-default,#f2f4f5))';
        s.textContent = [
            '.purpura-mpl-host:not(.purpura-mpl-fallback){flex-wrap:wrap;column-gap:24px;row-gap:12px}',
            '.purpura-mpl-host.purpura-mpl-fallback{position:relative;min-height:80px}',
            r + '{display:flex;flex-direction:column;gap:8px;margin-left:auto;min-width:0;max-width:min(100%,408px);color:' + main + '}',
            r + ' *{box-sizing:border-box}',
            r + ' .mpl-head{display:flex;align-items:center;justify-content:space-between;gap:16px}',
            r + ' .mpl-title{margin:0;font-size:14px;line-height:20px;font-weight:500;color:' + muted + '}',
            r + ' .mpl-ranges{display:flex;gap:4px}',
            r + ' .mpl-range{height:24px;padding:0 8px;border:0;border-radius:6px;background:transparent;color:' + muted + ';font:inherit;font-size:12px;font-weight:500;line-height:24px;cursor:pointer;transition:background-color .15s ease,color .15s ease}',
            r + ' .mpl-range:hover{background:rgba(127,127,127,.12);color:' + main + '}',
            r + ' .mpl-range[aria-pressed="true"]{background:rgba(127,127,127,.16);color:' + main + '}',
            r + ' .mpl-range:focus-visible,' + r + ' .mpl-card a:focus-visible,' + r + ' .mpl-arrow:focus-visible{outline:2px solid ' + main + ';outline-offset:2px}',
            r + ' .mpl-viewport{position:relative}',
            r + ' .mpl-list{display:flex;gap:12px;margin:0;padding:0;list-style:none;overflow:hidden;scroll-behavior:smooth}',
            r + ' .mpl-card{flex:0 0 72px;width:72px;min-width:0}',
            r + ' .mpl-card a{display:block;border-radius:8px;text-decoration:none;color:inherit}',
            r + ' .mpl-thumb{position:relative;width:72px;height:72px;border-radius:8px;overflow:hidden;background:rgba(127,127,127,.12)}',
            r + ' .mpl-thumb img{display:block;width:100%;height:100%;object-fit:cover;transition:opacity .15s ease}',
            r + ' .mpl-card a:hover .mpl-thumb img{opacity:.85}',
            r + ' .mpl-bar{position:absolute;left:0;right:0;bottom:0;height:3px;background:rgba(0,0,0,.45)}',
            r + ' .mpl-bar span{display:block;height:100%;background:#fff}',
            r + ' .mpl-name{margin-top:6px;font-size:12px;line-height:16px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
            r + ' .mpl-time{font-size:11px;line-height:16px;color:' + muted + ';font-variant-numeric:tabular-nums;white-space:nowrap}',
            r + ' .mpl-arrow{position:absolute;top:24px;width:24px;height:24px;padding:0;border:0;border-radius:12px;background:var(--purpura-surface100,var(--color-surface-100,#232527));color:' + main + ';box-shadow:0 1px 4px rgba(0,0,0,.35);cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:2;transition:background-color .15s ease}',
            r + ' .mpl-arrow:hover{background:var(--purpura-surface200,var(--color-surface-200,#2b2c32))}',
            r + ' .mpl-arrow[hidden]{display:none}',
            r + ' .mpl-arrow.prev{left:-12px}',
            r + ' .mpl-arrow.next{right:-12px}',
            r + ' .mpl-empty{margin:0;max-width:280px;font-size:12px;line-height:16px;color:' + muted + '}',
            r + ' .mpl-empty a{color:inherit;text-decoration:underline}',
            r + '.mpl-compact{position:absolute;right:0;top:50%;transform:translateY(-50%);flex-direction:row;align-items:center;gap:16px;max-width:min(60%,480px)}',
            r + '.mpl-compact .mpl-head{flex-direction:column;align-items:flex-start;justify-content:center;gap:4px;flex-shrink:0}',
            r + '.mpl-compact .mpl-ranges{margin-left:-8px}',
            r + '.mpl-compact .mpl-viewport{min-width:0}',
            r + '.mpl-compact .mpl-list{max-width:328px}',
            r + '.mpl-compact .mpl-card{flex-basis:56px;width:56px}',
            r + '.mpl-compact .mpl-thumb{width:56px;height:56px}',
            r + '.mpl-compact .mpl-name{display:none}',
            r + '.mpl-compact .mpl-time{margin-top:4px}',
            r + '.mpl-compact .mpl-arrow{top:16px}',
            '@media (max-width:767px){' + r + '.mpl-compact{display:none}}'
        ].join('');
        (document.head || document.documentElement).appendChild(s);
    }

    function card(game, i, top) {
        var info = gameInfoCache.get(game.universeId) || {};
        var name = info.name || game.name || 'Game';
        var placeId = info.rootPlaceId || game.rootPlaceId;
        var li = document.createElement('li');
        li.className = 'mpl-card';
        var a = document.createElement('a');
        a.href = placeId ? 'https://www.roblox.com/games/' + placeId + '/' : 'https://www.roblox.com/discover';
        a.title = '#' + (i + 1) + ' ' + name + ' · ' + formatMinutes(game.minutes) + (game.sessions ? ' · ' + game.sessions + ' ' + t('mostPlayed_sessions', 'sessions') : '');
        var thumb = document.createElement('div');
        thumb.className = 'mpl-thumb';
        if (info.thumb) {
            var img = document.createElement('img');
            img.src = info.thumb;
            img.alt = '';
            img.loading = 'lazy';
            thumb.appendChild(img);
        }
        var bar = document.createElement('div');
        bar.className = 'mpl-bar';
        var fill = document.createElement('span');
        fill.style.width = Math.max(4, Math.round(game.minutes / top * 100)) + '%';
        bar.appendChild(fill);
        thumb.appendChild(bar);
        var nameEl = document.createElement('div');
        nameEl.className = 'mpl-name';
        nameEl.textContent = name;
        var time = document.createElement('div');
        time.className = 'mpl-time';
        time.textContent = formatMinutes(game.minutes);
        a.append(thumb, nameEl, time);
        li.appendChild(a);
        return li;
    }

    function arrow(dir, label) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'mpl-arrow ' + dir;
        b.setAttribute('aria-label', label);
        b.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="' + (dir === 'prev' ? '15 18 9 12 15 6' : '9 18 15 12 9 6') + '"/></svg>';
        return b;
    }

    function renderList(section) {
        var seq = ++renderSeq;
        // Playtime data is stored per Roblox account; the background tracker keeps the current id up to date.
        chrome.storage.local.get(['purpura_playtime_userid'], function (u) {
        var meta = document.querySelector('meta[name="user-data"]');
        var uid = (meta && meta.getAttribute('data-userid')) || u.purpura_playtime_userid;
        var sfx = uid ? '_' + uid : '';
        chrome.storage.local.get(['purpura_playtime' + sfx, 'purpura_playtime_daily' + sfx], function (data) {
            var r = RANGES.find(function (x) { return x.key === range; }) || RANGES[1];
            var games = rank(data['purpura_playtime' + sfx], data['purpura_playtime_daily' + sfx], r.days);
            loadGameInfo(games.map(function (g) { return g.universeId; })).catch(function () {}).then(function () {
                if (seq !== renderSeq || !section.isConnected) return;
                var body = section.querySelector('.mpl-viewport');
                body.textContent = '';
                if (!games.length) {
                    var p = document.createElement('p');
                    p.className = 'mpl-empty';
                    p.textContent = (r.days ? t('mostPlayed_emptyRange', 'No playtime recorded in this period yet.') : t('mostPlayed_empty', 'Play a game and it will show up here. Purpura tracks your playtime while Roblox runs.')) + ' ';
                    var link = document.createElement('a');
                    link.href = '/purpura-time';
                    link.textContent = t('mostPlayed_openTracker', 'Open Play Time Tracker');
                    p.appendChild(link);
                    body.appendChild(p);
                    return;
                }
                var ul = document.createElement('ul');
                ul.className = 'mpl-list';
                games.forEach(function (g, i) { ul.appendChild(card(g, i, games[0].minutes)); });
                var prev = arrow('prev', t('pinnedGames_scrollLeft', 'Scroll left'));
                var next = arrow('next', t('pinnedGames_scrollRight', 'Scroll right'));
                var sync = function () {
                    prev.hidden = ul.scrollLeft <= 1;
                    next.hidden = ul.scrollLeft + ul.clientWidth >= ul.scrollWidth - 1;
                };
                prev.addEventListener('click', function () { ul.scrollBy({ left: -ul.clientWidth }); });
                next.addEventListener('click', function () { ul.scrollBy({ left: ul.clientWidth }); });
                ul.addEventListener('scroll', sync, { passive: true });
                body.append(prev, ul, next);
                requestAnimationFrame(sync);
            });
        });
        });
    }

    function findMount() {
        var greeting = document.querySelector('.purpura-greeting-wrapper .container-header');
        if (greeting) {
            greetingWaitSince = 0;
            return { el: greeting, fallback: false };
        }
        if (window.__PurpuraSettings.get('gr') !== false && location.pathname === '/home') {
            if (!greetingWaitSince) greetingWaitSince = Date.now();
            if (Date.now() - greetingWaitSince < GREETING_WAIT_MS && !document.getElementById(ID)) return null;
        }
        var h1 = document.querySelector('#HomeContainer .container-header h1, .home-container .container-header h1');
        var row = h1 && h1.closest('.container-header');
        return row ? { el: row, fallback: true } : null;
    }

    function clearHosts() {
        document.querySelectorAll('.purpura-mpl-host').forEach(function (el) { el.classList.remove('purpura-mpl-host', 'purpura-mpl-fallback'); });
    }

    function place(section, mount) {
        if (section.parentElement === mount.el) return;
        clearHosts();
        mount.el.classList.add('purpura-mpl-host');
        if (mount.fallback) mount.el.classList.add('purpura-mpl-fallback');
        section.classList.toggle('mpl-compact', mount.fallback);
        mount.el.appendChild(section);
    }

    function build(mount) {
        injectStyles();
        var section = document.createElement('div');
        section.id = ID;
        section.setAttribute('role', 'region');
        section.setAttribute('aria-label', t('mostPlayed_title', 'Most played'));
        var head = document.createElement('div');
        head.className = 'mpl-head';
        var title = document.createElement('h3');
        title.className = 'mpl-title';
        title.textContent = t('mostPlayed_title', 'Most played');
        var ranges = document.createElement('div');
        ranges.className = 'mpl-ranges';
        ranges.setAttribute('role', 'group');
        RANGES.forEach(function (r) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'mpl-range';
            b.dataset.range = r.key;
            b.textContent = t(r.short[0], r.short[1]);
            b.title = t(r.label[0], r.label[1]);
            b.setAttribute('aria-label', b.title);
            b.setAttribute('aria-pressed', String(r.key === range));
            b.addEventListener('click', function () {
                if (range === r.key) return;
                range = r.key;
                chrome.storage.local.set({ mplRange: range });
                ranges.querySelectorAll('.mpl-range').forEach(function (x) { x.setAttribute('aria-pressed', String(x.dataset.range === range)); });
                renderList(section);
            });
            ranges.appendChild(b);
        });
        head.append(title, ranges);
        var viewport = document.createElement('div');
        viewport.className = 'mpl-viewport';
        section.append(head, viewport);
        place(section, mount);
        renderList(section);
    }

    function tick() {
        var section = document.getElementById(ID);
        if (!enabled || !isHome()) {
            if (section) section.remove();
            clearHosts();
            greetingWaitSince = 0;
            return;
        }
        var mount = findMount();
        if (!mount) {
            if (greetingWaitSince && Date.now() - greetingWaitSince < GREETING_WAIT_MS && !fastTick) fastTick = setTimeout(function () { fastTick = 0; tick(); }, 100);
            return;
        }
        if (section) place(section, mount);
        else build(mount);
    }

    function readEnabled() {
        return window.__PurpuraSettings.get('plt') !== false && window.__PurpuraSettings.get('mpl') !== false;
    }

    function start() {
        window.__PurpuraSettings.ready.then(function () {
            enabled = readEnabled();
            chrome.storage.local.get('mplRange', function (d) {
                if (RANGES.some(function (r) { return r.key === d.mplRange; })) range = d.mplRange;
                tick();
                setInterval(tick, 1000);
            });
        });
    }

    chrome.storage.onChanged.addListener(function (c, area) {
        if (area === 'sync' && (c.plt || c.mpl) && window.__PurpuraSettings) {
            enabled = readEnabled();
            tick();
        }
        if (area === 'local' && Object.keys(c).some(function (k) { return /^purpura_playtime(_daily)?(_\d+)?$|^purpura_playtime_userid$/.test(k); })) {
            var section = document.getElementById(ID);
            if (section) renderList(section);
        }
    });

    var attempts = 0;
    var poll = setInterval(function () {
        if (window.__PurpuraSettings) { clearInterval(poll); start(); }
        else if (++attempts > 50) clearInterval(poll);
    }, 100);

    (function () {
        var d = dateKey(new Date());
        var r = rank({ games: { 1: { universeId: 1, totalMinutes: 50 }, 2: { universeId: 2, totalMinutes: 90 } } }, [{ date: d, games: { 1: 30 } }, { date: '2000-01-01', games: { 2: 90 } }], 7);
        console.assert(r.length === 1 && r[0].universeId === 1 && r[0].minutes === 30, '[Purpura] mostPlayed rank (range)');
        r = rank({ games: { 1: { universeId: 1, totalMinutes: 50 }, 2: { universeId: 2, totalMinutes: 90 } } }, [], 0);
        console.assert(r[0].universeId === 2 && r[1].universeId === 1, '[Purpura] mostPlayed rank (all)');
    })();
})();
