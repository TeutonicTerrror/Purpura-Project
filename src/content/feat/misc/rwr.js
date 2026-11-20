/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';
    var ON_PAGE = location.pathname.replace(/\/+$/, '') === '/purpura-wrapped';
    var NYE_TEST_KEY = 'purpuraWrappedNyeTest';
    if (window.__purpuraWrappedLoaded) return;
    window.__purpuraWrappedLoaded = true;

    var ROOT_ID = 'purpura-wrapped-root';
    var CACHE_KEY = 'purpura_wrapped_cache';
    var API = 'https://apis.roblox.com/transaction-records/v1/users/';
    var MAX_PAGES = 2000;
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var TYPE_LABELS = {
        Asset: 'Avatar items',
        Bundle: 'Bundles',
        GamePass: 'Game passes',
        DeveloperProduct: 'In-experience items',
        PrivateServer: 'Private servers',
        PrivateServerProduct: 'Private servers',
        Badge: 'Badges'
    };

    var state = { user: null, cache: null, year: null, loading: false, iconCache: new Map() };

    function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function num(n) { return Math.round(n).toLocaleString(); }
    function dayKey(ts) { var d = new Date(ts); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
    function fmtDate(ts) { var d = new Date(ts); return MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(); }
    function fmtDayKey(k) { var p = k.split('-'); return MONTHS[+p[1] - 1] + ' ' + (+p[2]) + ', ' + p[0]; }
    function robux(n) { return '<span class="rw-rbx">' + num(n) + ' R$</span>'; }

    function readUser() {
        var meta = document.querySelector('meta[name="user-data"]');
        var id = meta && meta.getAttribute('data-userid');
        if (!/^\d+$/.test(id || '')) return null;
        return { id: id, name: meta.getAttribute('data-name') || '', displayName: meta.getAttribute('data-displayname') || meta.getAttribute('data-name') || '' };
    }

    function money(robuxAmount) {
        var fx = window.__PurpuraFx;
        var conf = (window.__PurpuraSettings && window.__PurpuraSettings.get('rconv')) || {};
        var code = fx && conf.currency && fx.rates[conf.currency] ? conf.currency : 'USD';
        var rate = fx ? fx.rateFor(fx.baseRates.Regular, code) : 0.0125;
        var amount = robuxAmount * rate;
        return fx ? fx.format(amount, code) : '$' + amount.toFixed(2);
    }

    function proxiedFetch(url) {
        return new Promise(function (resolve) {
            try {
                chrome.runtime.sendMessage({ type: 'PURPURA_FETCH_RESOURCE_REQUEST', url: url, method: 'GET', body: '', accept: 'application/json' }, function (res) {
                    if (chrome.runtime.lastError || !res) { resolve({ ok: false, status: 0, json: null, retryAfter: '' }); return; }
                    var json = null;
                    try { json = res.text ? JSON.parse(res.text) : null; } catch (e) { json = null; }
                    resolve({ ok: !!res.ok, status: Number(res.status) || 0, json: json, retryAfter: res.retryAfter || '' });
                });
            } catch (e) { resolve({ ok: false, status: 0, json: null, retryAfter: '' }); }
        });
    }

    function compact(t) {
        var d = t.details || {};
        var place = d.place || {};
        var agent = t.agent || {};
        return {
            t: Date.parse(t.created),
            r: Math.abs(Number(t.currency && t.currency.amount) || 0),
            n: d.name || '',
            k: d.type || '',
            i: d.id || null,
            c: agent.name || '',
            ci: agent.id || null,
            ct: agent.type || '',
            u: place.universeId || null,
            g: place.name || '',
            p: place.placeId || null
        };
    }

    async function fetchType(userId, type, opts) {
        var cursor = opts.cursor || '';
        var waits = 0;
        var retries = 0;
        for (var page = 0; page < MAX_PAGES;) {
            var url = new URL(API + userId + '/transactions');
            url.searchParams.set('limit', '100');
            url.searchParams.set('transactionType', type);
            if (type === 'Purchase') url.searchParams.set('itemPricingType', 'PaidAndLimited');
            if (cursor) url.searchParams.set('cursor', cursor);
            var res = await proxiedFetch(url.toString());
            if (res.status === 429) {
                if (++waits > 12) throw new Error('Roblox is rate limiting requests. Press Refresh in a few minutes to continue.');
                var ra = Number(res.retryAfter);
                var ms = Number.isFinite(ra) && ra > 0 ? ra * 1000 + 500 : Math.min(30000, 5000 * Math.pow(2, waits - 1));
                if (opts.onWait) opts.onWait(ms);
                await wait(ms);
                continue;
            }
            if (!res.ok) {
                if (res.status >= 500 || res.status === 0) {
                    if (++retries <= 3) { await wait(1000 * retries); continue; }
                }
                var err = new Error('Could not load your transactions (' + res.status + '). Press Refresh to try again.');
                err.status = res.status;
                throw err;
            }
            waits = 0;
            retries = 0;
            page++;
            var data = (res.json && Array.isArray(res.json.data)) ? res.json.data : [];
            var rows = [];
            var reachedKnown = false;
            for (var i = 0; i < data.length; i++) {
                var row = compact(data[i]);
                if (!Number.isFinite(row.t) || row.r <= 0) continue;
                if ((opts.newerThan && row.t <= opts.newerThan) || (opts.stopBefore && row.t < opts.stopBefore)) { reachedKnown = true; break; }
                rows.push(row);
            }
            var next = (res.json && res.json.nextPageCursor) || null;
            if (reachedKnown || !data.length) next = null;
            opts.onPage(rows, next);
            if (!next) return;
            cursor = next;
            await wait(100);
        }
    }

    function loadCache() {
        return new Promise(function (resolve) {
            chrome.storage.local.get(CACHE_KEY, function (d) {
                var c = d && d[CACHE_KEY];
                resolve(c && c.userId === state.user.id && Array.isArray(c.purchases) && Array.isArray(c.bought) ? c : null);
            });
        });
    }

    function saveCache(c) {
        return new Promise(function (resolve) {
            var o = {};
            o[CACHE_KEY] = c;
            chrome.storage.local.set(o, function () { resolve(); });
        });
    }

    var renderTimer = 0;
    function scheduleRender() {
        if (!renderTimer) renderTimer = setTimeout(function () { renderTimer = 0; render(); }, 1500);
    }

    function progress(c) {
        setStatus(c.purchases.length
            ? 'Loading older purchases… ' + num(c.purchases.length) + ' so far'
            : 'Loading your purchase history…');
    }

    async function refresh(isRetry) {
        if (state.loading) return;
        state.loading = true;
        var c = state.cache || { userId: state.user.id, fetchedAt: 0, purchases: [], bought: [], olderCursor: '', complete: false };
        if (c.complete === undefined) { c.complete = true; c.olderCursor = null; }
        state.cache = c;
        render();
        var resuming = !!c.olderCursor;
        try {
            if (c.purchases.length) {
                setStatus('Checking for new purchases…');
                var fresh = [];
                await fetchType(state.user.id, 'Purchase', { newerThan: c.purchases[0].t, onPage: function (rows) { fresh = fresh.concat(rows); } });
                if (fresh.length) { c.purchases = fresh.concat(c.purchases); scheduleRender(); }
            }
            setStatus('Checking Robux you bought…');
            var bought = [];
            await fetchType(state.user.id, 'CurrencyPurchase', { onPage: function (rows) { bought = bought.concat(rows.map(function (r) { return { t: r.t, r: r.r }; })); } });
            c.bought = bought;
            scheduleRender();
            if (!c.complete) {
                var pages = 0;
                progress(c);
                await fetchType(state.user.id, 'Purchase', {
                    cursor: c.olderCursor || '',
                    onWait: function (ms) { setStatus('Roblox asked us to slow down, continuing in ' + Math.ceil(ms / 1000) + 's… ' + num(c.purchases.length) + ' so far'); },
                    onPage: function (rows, next) {
                        c.purchases = c.purchases.concat(rows);
                        c.olderCursor = next;
                        c.complete = !next;
                        if (++pages % 5 === 0) saveCache(c);
                        progress(c);
                        scheduleRender();
                    }
                });
            }
            c.fetchedAt = Date.now();
            await saveCache(c);
            state.loading = false;
            render();
        } catch (e) {
            await saveCache(c);
            state.loading = false;
            if (resuming && !isRetry && e.status >= 400 && e.status < 500) {
                state.cache = null;
                await saveCache(null);
                refresh(true);
                return;
            }
            render();
            setStatus(e.message || 'Something went wrong while reading your transactions. Press Refresh to try again.', true);
        } finally {
            var btn = document.getElementById('rw-refresh');
            if (btn) btn.disabled = state.loading;
        }
    }

    function inPeriod(year) {
        return function (row) { return year === 'all' || new Date(row.t).getFullYear() === year; };
    }

    function analyze(cache, year) {
        var rows = cache.purchases.filter(inPeriod(year));
        var a = { count: rows.length, spent: 0, bought: 0, games: {}, creators: {}, types: {}, days: {}, buckets: {}, biggest: null, first: null, last: null };
        cache.bought.filter(inPeriod(year)).forEach(function (r) { a.bought += r.r; });
        rows.forEach(function (r) {
            a.spent += r.r;
            if (r.u) {
                var g = a.games[r.u] || (a.games[r.u] = { id: r.u, name: r.g, placeId: r.p, robux: 0, count: 0 });
                g.robux += r.r;
                g.count++;
            }
            if (r.c) {
                var ck = r.ct + ':' + r.ci;
                var c = a.creators[ck] || (a.creators[ck] = { name: r.c, id: r.ci, type: r.ct, robux: 0, count: 0 });
                c.robux += r.r;
                c.count++;
            }
            var tk = TYPE_LABELS[r.k] || 'Other';
            a.types[tk] = (a.types[tk] || 0) + r.r;
            var dk = dayKey(r.t);
            a.days[dk] = (a.days[dk] || 0) + r.r;
            var d = new Date(r.t);
            var bk = year === 'all' ? d.getFullYear() : d.getMonth();
            a.buckets[bk] = (a.buckets[bk] || 0) + r.r;
            if (!a.biggest || r.r > a.biggest.r) a.biggest = r;
            if (!a.first || r.t < a.first.t) a.first = r;
            if (!a.last || r.t > a.last.t) a.last = r;
        });
        var top = function (obj, n) { return Object.keys(obj).map(function (k) { return obj[k]; }).sort(function (x, y) { return y.robux - x.robux; }).slice(0, n); };
        a.topGames = top(a.games, 5);
        a.topCreators = top(a.creators, 5);
        a.typeList = Object.keys(a.types).map(function (k) { return { name: k, robux: a.types[k] }; }).sort(function (x, y) { return y.robux - x.robux; });
        var dayKeys = Object.keys(a.days).sort();
        a.bigDay = dayKeys.reduce(function (best, k) { return !best || a.days[k] > a.days[best] ? k : best; }, null);
        a.shoppingDays = dayKeys.length;
        a.streak = streakOf(dayKeys);
        return a;
    }

    function streakOf(sortedKeys) {
        var best = { len: 0, start: null };
        var len = 0, start = null, prev = null;
        sortedKeys.forEach(function (k) {
            var d = new Date(k + 'T00:00:00');
            if (prev && Math.round((d - prev) / 86400000) === 1) len++;
            else { len = 1; start = k; }
            if (len > best.len) best = { len: len, start: start };
            prev = d;
        });
        return best;
    }

    function years(cache) {
        var set = {};
        cache.purchases.forEach(function (r) { set[new Date(r.t).getFullYear()] = true; });
        return Object.keys(set).map(Number).sort(function (a, b) { return b - a; });
    }

    function setStatus(text, isError) {
        var el = document.getElementById('rw-status');
        if (!el) return;
        el.textContent = text;
        el.classList.toggle('rw-error', !!isError);
    }

    function list(items, valueOf, labelOf, hrefOf, iconOf) {
        if (!items.length) return '<p class="rw-muted">Nothing here for this period</p>';
        var max = items[0] ? valueOf(items[0]) : 1;
        return '<ol class="rw-list">' + items.map(function (it, i) {
            var href = hrefOf(it);
            var name = esc(labelOf(it));
            return '<li class="rw-row">'
                + '<span class="rw-rank">' + (i + 1) + '</span>'
                + (iconOf ? '<span class="rw-icon" data-universe="' + esc(iconOf(it)) + '"></span>' : '')
                + '<span class="rw-row-main">'
                + (href ? '<a class="rw-row-name" href="' + esc(href) + '">' + name + '</a>' : '<span class="rw-row-name">' + name + '</span>')
                + '<span class="rw-bar"><span style="width:' + Math.max(3, Math.round(valueOf(it) / max * 100)) + '%"></span></span>'
                + '</span>'
                + '<span class="rw-row-value">' + robux(valueOf(it)) + '</span>'
                + '</li>';
        }).join('') + '</ol>';
    }

    function chart(a, year) {
        var keys = year === 'all' ? Object.keys(a.buckets).map(Number).sort() : MONTHS.map(function (_, i) { return i; });
        if (!keys.length) return '';
        var max = Math.max.apply(null, keys.map(function (k) { return a.buckets[k] || 0; })) || 1;
        var peak = keys.reduce(function (b, k) { return (a.buckets[k] || 0) > (a.buckets[b] || 0) ? k : b; }, keys[0]);
        return '<div class="rw-chart">' + keys.map(function (k) {
            var v = a.buckets[k] || 0;
            var label = year === 'all' ? String(k) : MONTHS[k];
            return '<div class="rw-col' + (k === peak && v ? ' rw-peak' : '') + '" title="' + esc(label) + ': ' + num(v) + ' R$">'
                + '<span class="rw-col-bar" style="height:' + (v ? Math.max(2, Math.round(v / max * 100)) : 0) + '%"></span>'
                + '<span class="rw-col-label">' + label + '</span></div>';
        }).join('') + '</div>';
    }

    function render() {
        var body = document.getElementById('rw-body');
        if (!body) return;
        var cache = state.cache;
        var ys = cache ? years(cache) : [];
        var nav = document.getElementById('rw-years');
        var share = document.getElementById('rw-share');
        if (share) share.disabled = !cache || !cache.purchases.length;
        if (!cache || !cache.purchases.length) {
            if (nav) nav.innerHTML = '';
            if (state.loading) {
                body.innerHTML = '<div class="rw-empty"><p>Reading your purchase history</p><p class="rw-muted">Your most recent purchases show up first. The first load can take a few minutes on accounts with a long history, after that only new purchases are fetched.</p></div>';
            } else if (cache && !cache.complete) {
                body.innerHTML = '<div class="rw-empty"><p>Your purchase history hasn\'t loaded yet</p><p class="rw-muted">Press Refresh to continue.</p></div>';
            } else {
                body.innerHTML = '<div class="rw-empty"><p>No Robux purchases found on this account</p></div>';
                setStatus(cache && cache.fetchedAt ? 'Updated ' + fmtDate(cache.fetchedAt) : '');
            }
            return;
        }
        if (state.year === null || (state.year !== 'all' && ys.indexOf(state.year) === -1)) state.year = ys[0];
        nav.innerHTML = ys.concat(['all']).map(function (y) {
            return '<button type="button" class="rw-chip" data-year="' + y + '" aria-pressed="' + (y === state.year) + '">' + (y === 'all' ? 'All time' : y) + '</button>';
        }).join('');
        var a = analyze(cache, state.year);
        var period = state.year === 'all' ? 'ever' : 'in ' + state.year;
        var peakLabel = (function () {
            var keys = Object.keys(a.buckets);
            if (!keys.length) return '';
            var k = keys.reduce(function (b, x) { return a.buckets[x] > a.buckets[b] ? x : b; });
            return state.year === 'all' ? k : MONTHS_LONG[+k];
        })();
        var topGame = a.topGames[0];
        body.innerHTML = ''
            + (cache.complete ? '' : '<p class="rw-partial">Older purchases are still ' + (state.loading ? 'loading' : 'missing, press Refresh to continue loading them') + '. Totals for earlier years and All time will grow.</p>')
            + '<section class="rw-hero">'
            + '<p class="rw-eyebrow">' + esc(state.user.displayName) + ' spent ' + (state.year === 'all' ? 'in total' : 'in ' + state.year) + '</p>'
            + '<p class="rw-big">' + num(a.spent) + '<span> R$</span></p>'
            + '<p class="rw-sub">About ' + esc(money(a.spent)) + ' at the standard Robux price</p>'
            + '<dl class="rw-stats">'
            + '<div><dt>Purchases</dt><dd>' + num(a.count) + '</dd></div>'
            + '<div><dt>Average purchase</dt><dd>' + robux(a.count ? a.spent / a.count : 0) + '</dd></div>'
            + '<div><dt>Robux bought</dt><dd>' + robux(a.bought) + '</dd></div>'
            + '<div><dt>Shopping days</dt><dd>' + num(a.shoppingDays) + '</dd></div>'
            + '</dl>'
            + '</section>'
            + '<section class="rw-panel rw-wide"><h2>' + (state.year === 'all' ? 'Spending by year' : 'Spending by month') + (peakLabel ? '<span class="rw-h-note">Peak: ' + esc(peakLabel) + '</span>' : '') + '</h2>' + chart(a, state.year) + '</section>'
            + '<div class="rw-grid">'
            + '<section class="rw-panel"><h2>Top experiences</h2>' + list(a.topGames, function (g) { return g.robux; }, function (g) { return g.name || 'Experience'; }, function (g) { return g.placeId ? 'https://www.roblox.com/games/' + g.placeId + '/' : ''; }, function (g) { return g.id; }) + '</section>'
            + '<section class="rw-panel"><h2>Creators you supported</h2>' + list(a.topCreators, function (c) { return c.robux; }, function (c) { return c.name; }, function (c) { return c.id ? (c.type === 'Group' ? 'https://www.roblox.com/communities/' + c.id + '/' : 'https://www.roblox.com/users/' + c.id + '/profile') : ''; }) + '</section>'
            + '</div>'
            + '<div class="rw-grid">'
            + '<section class="rw-panel"><h2>Highlights</h2><dl class="rw-facts">'
            + (a.biggest ? '<div><dt>Biggest purchase</dt><dd>' + esc(a.biggest.n || 'Unknown item') + '<span>' + num(a.biggest.r) + ' R$ · ' + fmtDate(a.biggest.t) + '</span></dd></div>' : '')
            + (a.bigDay ? '<div><dt>Biggest day</dt><dd>' + fmtDayKey(a.bigDay) + '<span>' + num(a.days[a.bigDay]) + ' R$</span></dd></div>' : '')
            + (a.streak.len ? '<div><dt>Longest spending streak</dt><dd>' + a.streak.len + (a.streak.len === 1 ? ' day' : ' days') + '<span>From ' + fmtDayKey(a.streak.start) + '</span></dd></div>' : '')
            + (a.first ? '<div><dt>First purchase ' + period + '</dt><dd>' + esc(a.first.n || 'Unknown item') + '<span>' + fmtDate(a.first.t) + '</span></dd></div>' : '')
            + (topGame ? '<div><dt>Favorite experience</dt><dd>' + esc(topGame.name || 'Experience') + '<span>' + topGame.count + (topGame.count === 1 ? ' purchase' : ' purchases') + '</span></dd></div>' : '')
            + '</dl></section>'
            + '<section class="rw-panel"><h2>Where it went</h2>' + list(a.typeList, function (x) { return x.robux; }, function (x) { return x.name; }, function () { return ''; }) + '</section>'
            + '</div>'
            + '<p class="rw-note">Built from your Roblox transaction history in this browser. Nothing is uploaded. Money is an estimate at the standard Robux price, and some older or refunded transactions may be missing from Roblox\'s records.</p>';
        if (!state.loading) setStatus(cache.complete ? 'Updated ' + fmtDate(cache.fetchedAt) + ' · ' + num(cache.purchases.length) + ' purchases on record' : num(cache.purchases.length) + ' purchases loaded so far');
        loadIcons(a.topGames.map(function (g) { return g.id; }));
    }

    function loadIcons(ids) {
        var missing = ids.filter(function (id) { return !state.iconCache.has(id); });
        var apply = function () {
            document.querySelectorAll('.rw-icon[data-universe]').forEach(function (el) {
                var url = state.iconCache.get(Number(el.getAttribute('data-universe')));
                if (url && !el.firstChild) { var img = document.createElement('img'); img.src = url; img.alt = ''; el.appendChild(img); }
            });
        };
        if (!missing.length) { apply(); return; }
        fetch('https://thumbnails.roblox.com/v1/games/icons?universeIds=' + missing.join(',') + '&returnPolicy=PlaceHolder&size=150x150&format=Webp&isCircular=false')
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (d) {
                ((d && d.data) || []).forEach(function (row) { if (row.state === 'Completed') state.iconCache.set(row.targetId, row.imageUrl); });
                apply();
            }).catch(function () {});
    }

    function fitText(ctx, text, maxWidth) {
        text = String(text || '');
        if (ctx.measureText(text).width <= maxWidth) return text;
        var s = text;
        while (s.length > 1 && ctx.measureText(s + '…').width > maxWidth) s = s.slice(0, -1);
        return s + '…';
    }

    function withTimeout(promise, ms) {
        return Promise.race([promise, new Promise(function (resolve) { setTimeout(function () { resolve(null); }, ms); })]);
    }

    function proxiedImage(url) {
        return new Promise(function (resolve) {
            try {
                chrome.runtime.sendMessage({ type: 'PURPURA_FETCH_RESOURCE_REQUEST', url: url, method: 'GET', body: '', accept: 'image/*', responseType: 'arraybuffer' }, function (res) {
                    if (chrome.runtime.lastError || !res || !res.ok || !res.base64) { resolve(null); return; }
                    var bin = atob(res.base64);
                    var bytes = new Uint8Array(bin.length);
                    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                    createImageBitmap(new Blob([bytes], { type: res.contentType || 'image/png' })).then(resolve, function () { resolve(null); });
                });
            } catch (e) { resolve(null); }
        });
    }

    async function thumbBitmap(apiUrl) {
        var res = await proxiedFetch(apiUrl);
        var row = res.ok && res.json && res.json.data && res.json.data[0];
        return row && row.state === 'Completed' && row.imageUrl ? proxiedImage(row.imageUrl) : null;
    }

    function logoBitmap() {
        return fetch(chrome.runtime.getURL('images/icons/default/Purpura_Default_Logo_128.png'))
            .then(function (r) { return r.blob(); })
            .then(function (b) { return createImageBitmap(b); })
            .catch(function () { return null; });
    }

    function drawImageRounded(x, img, dx, dy, size, radius) {
        x.save();
        x.beginPath();
        x.roundRect(dx, dy, size, size, radius);
        x.clip();
        if (img) x.drawImage(img, dx, dy, size, size);
        else { x.fillStyle = 'rgba(255,255,255,0.1)'; x.fillRect(dx, dy, size, size); }
        x.restore();
    }

    async function shareCanvas() {
        var a = analyze(state.cache, state.year);
        var topGame = a.topGames[0];
        var imgs = await Promise.all([
            withTimeout(logoBitmap(), 4000),
            withTimeout(thumbBitmap('https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=' + state.user.id + '&size=420x420&format=Png&isCircular=false'), 6000),
            topGame ? withTimeout(thumbBitmap('https://thumbnails.roblox.com/v1/games/icons?universeIds=' + topGame.id + '&returnPolicy=PlaceHolder&size=512x512&format=Png&isCircular=false'), 6000) : null
        ]);
        var logo = imgs[0], avatar = imgs[1], gameIcon = imgs[2];
        var W = 1080, H = 1350, P = 80;
        var LAV = '#cdbcff', SOFT = 'rgba(255,255,255,0.72)';
        var font = '"Builder Sans","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
        var c = document.createElement('canvas');
        c.width = W;
        c.height = H;
        var x = c.getContext('2d');

        x.fillStyle = '#130a1f';
        x.fillRect(0, 0, W, H);
        var g1 = x.createRadialGradient(940, 80, 0, 940, 80, 980);
        g1.addColorStop(0, 'rgba(139,92,246,0.62)');
        g1.addColorStop(1, 'rgba(139,92,246,0)');
        x.fillStyle = g1;
        x.fillRect(0, 0, W, H);
        var g2 = x.createRadialGradient(60, 1320, 0, 60, 1320, 760);
        g2.addColorStop(0, 'rgba(109,40,217,0.42)');
        g2.addColorStop(1, 'rgba(109,40,217,0)');
        x.fillStyle = g2;
        x.fillRect(0, 0, W, H);

        if (logo) drawImageRounded(x, logo, P, 72, 56, 14);
        x.fillStyle = '#ffffff';
        x.font = '600 34px ' + font;
        x.textBaseline = 'middle';
        x.fillText('Roblox Wrapped', logo ? P + 76 : P, 101);
        var pill = state.year === 'all' ? 'All time' : String(state.year);
        x.font = '600 30px ' + font;
        var pw = x.measureText(pill).width + 48;
        x.fillStyle = 'rgba(255,255,255,0.14)';
        x.beginPath();
        x.roundRect(W - P - pw, 73, pw, 56, 28);
        x.fill();
        x.fillStyle = '#ffffff';
        x.fillText(pill, W - P - pw + 24, 102);

        x.save();
        x.beginPath();
        x.arc(P + 56, 264, 56, 0, Math.PI * 2);
        x.clip();
        x.fillStyle = 'rgba(255,255,255,0.12)';
        x.fillRect(P, 208, 112, 112);
        if (avatar) x.drawImage(avatar, P, 208, 112, 112);
        x.restore();
        x.fillStyle = '#ffffff';
        x.font = '700 44px ' + font;
        x.fillText(fitText(x, state.user.displayName || state.user.name, W - P * 2 - 140), P + 140, 246);
        x.fillStyle = LAV;
        x.font = '500 28px ' + font;
        x.fillText('@' + state.user.name, P + 140, 292);

        x.textBaseline = 'alphabetic';
        x.fillStyle = LAV;
        x.font = '500 32px ' + font;
        x.fillText('Robux spent', P, 418);
        var big = num(a.spent);
        var size = 220;
        x.font = '800 ' + size + 'px ' + font;
        while (size > 96 && x.measureText(big).width > W - P * 2 - 130) { size -= 8; x.font = '800 ' + size + 'px ' + font; }
        x.fillStyle = '#ffffff';
        x.fillText(big, P - 6, 590);
        var bw = x.measureText(big).width;
        x.fillStyle = LAV;
        x.font = '700 64px ' + font;
        x.fillText('R$', P + bw + 18, 590);
        x.fillStyle = SOFT;
        x.font = '500 34px ' + font;
        x.fillText('About ' + money(a.spent) + ' · ' + num(a.count) + (a.count === 1 ? ' purchase' : ' purchases'), P, 652);

        var py = 716, ph = 224;
        x.fillStyle = 'rgba(255,255,255,0.08)';
        x.strokeStyle = 'rgba(255,255,255,0.12)';
        x.lineWidth = 2;
        x.beginPath();
        x.roundRect(P, py, W - P * 2, ph, 32);
        x.fill();
        x.stroke();
        drawImageRounded(x, gameIcon, P + 26, py + 26, 172, 24);
        var tx = P + 26 + 172 + 32, tw = W - P - 32 - tx;
        x.fillStyle = LAV;
        x.font = '500 26px ' + font;
        x.fillText('Favorite experience', tx, py + 74);
        x.fillStyle = '#ffffff';
        x.font = '700 44px ' + font;
        x.fillText(fitText(x, topGame ? topGame.name || 'Experience' : 'No experience purchases', tw), tx, py + 130);
        if (topGame) {
            x.fillStyle = SOFT;
            x.font = '500 28px ' + font;
            x.fillText(num(topGame.robux) + ' R$ · ' + topGame.count + (topGame.count === 1 ? ' purchase' : ' purchases'), tx, py + 176);
        }

        var tiles = [
            ['Biggest purchase', a.biggest ? a.biggest.n || 'Unknown item' : '—', a.biggest ? num(a.biggest.r) + ' R$' : ''],
            ['Top creator', a.topCreators[0] ? a.topCreators[0].name : '—', a.topCreators[0] ? num(a.topCreators[0].robux) + ' R$' : ''],
            ['Longest streak', a.streak.len ? a.streak.len + (a.streak.len === 1 ? ' day' : ' days') : '—', a.streak.len ? 'of spending' : '']
        ];
        var gap = 20, ty = 968, th = 196, twid = (W - P * 2 - gap * 2) / 3;
        tiles.forEach(function (t, i) {
            var tx0 = P + i * (twid + gap);
            x.fillStyle = 'rgba(255,255,255,0.08)';
            x.beginPath();
            x.roundRect(tx0, ty, twid, th, 28);
            x.fill();
            x.stroke();
            x.fillStyle = LAV;
            x.font = '500 24px ' + font;
            x.fillText(fitText(x, t[0], twid - 48), tx0 + 24, ty + 54);
            x.fillStyle = '#ffffff';
            x.font = '700 36px ' + font;
            x.fillText(fitText(x, t[1], twid - 48), tx0 + 24, ty + 112);
            x.fillStyle = SOFT;
            x.font = '500 26px ' + font;
            x.fillText(fitText(x, t[2], twid - 48), tx0 + 24, ty + 156);
        });

        x.fillStyle = 'rgba(255,255,255,0.12)';
        x.fillRect(P, 1220, W - P * 2, 2);
        x.fillStyle = SOFT;
        x.font = '500 28px ' + font;
        x.fillText('Get your own Roblox Wrapped with', P, 1284);
        var cw = x.measureText('Get your own Roblox Wrapped with ').width;
        x.fillStyle = '#ffffff';
        x.font = '700 28px ' + font;
        x.fillText('Purpura', P + cw, 1284);
        return c;
    }

    async function openShare(nye) {
        if (!state.cache || !state.cache.purchases.length || document.querySelector('.rw-modal')) return;
        var label = state.year === 'all' ? 'all-time' : String(state.year);
        var overlay = document.createElement('div');
        overlay.className = 'rw-modal';
        var title = nye ? 'Your ' + state.year + ' on Roblox' : 'Share image';
        overlay.innerHTML = '<div class="rw-modal-box" role="dialog" aria-modal="true" aria-label="' + esc(title) + '">'
            + '<div class="rw-modal-head"><h2>' + esc(title) + '</h2><button type="button" class="rw-btn rw-close" aria-label="Close">Close</button></div>'
            + (nye ? '<p class="rw-modal-intro">Happy New Year\'s Eve. Here\'s your Roblox Wrapped for ' + state.year + '.</p>' : '')
            + '<div class="rw-preview-wrap"><p class="rw-muted">Preparing your image…</p></div>'
            + '<div class="rw-modal-actions"><button type="button" class="rw-btn rw-primary" data-act="download" disabled>Download</button><button type="button" class="rw-btn" data-act="copy" disabled>Copy image</button>' + (nye ? '<a class="rw-btn rw-link" href="/purpura-wrapped">See full Wrapped</a>' : '') + '<span class="rw-muted rw-copy-status" aria-live="polite"></span></div>'
            + '</div>';
        var canvas = null;
        var close = function () { overlay.remove(); document.removeEventListener('keydown', onKey); };
        var onKey = function (e) { if (e.key === 'Escape') close(); };
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay || e.target.closest('.rw-close')) return close();
            var act = e.target.closest('[data-act]');
            if (!act || !canvas) return;
            canvas.toBlob(function (blob) {
                if (!blob) return;
                if (act.dataset.act === 'download') {
                    var url = URL.createObjectURL(blob);
                    var link = document.createElement('a');
                    link.href = url;
                    link.download = 'roblox-wrapped-' + label + '.png';
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
                } else {
                    var status = overlay.querySelector('.rw-copy-status');
                    navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
                        .then(function () { status.textContent = 'Copied'; })
                        .catch(function () { status.textContent = 'Copying is blocked here, use Download'; });
                }
            }, 'image/png');
        });
        document.addEventListener('keydown', onKey);
        document.body.appendChild(overlay);
        overlay.querySelector('.rw-close').focus();
        canvas = await shareCanvas();
        if (!overlay.isConnected) return;
        var img = document.createElement('img');
        img.className = 'rw-preview';
        img.alt = 'Roblox Wrapped share image';
        img.src = canvas.toDataURL('image/png');
        var wrap = overlay.querySelector('.rw-preview-wrap');
        wrap.textContent = '';
        wrap.appendChild(img);
        overlay.querySelectorAll('[data-act]').forEach(function (b) { b.disabled = false; });
        overlay.querySelector('[data-act="download"]').focus();
    }

    function injectStyles() {
        if (document.getElementById('purpura-wrapped-style')) return;
        var s = document.createElement('style');
        s.id = 'purpura-wrapped-style';
        var r = '#' + ROOT_ID;
        s.textContent = [
            r + ',.rw-modal{--rw-panel:var(--secondary-bg-color,var(--purpura-surface100,var(--color-surface-100,#18181c)));--rw-raised:var(--tertiary-bg-color,var(--purpura-surface200,var(--color-surface-200,#202026)));--rw-text:var(--header-text-color,var(--text-color,var(--purpura-mainText,var(--color-content-emphasis,#f2f2f5))));--rw-text-2:var(--text-color,var(--purpura-mainText,var(--color-content-default,#c9c9d1)));--rw-muted:var(--purpura-secondaryText,var(--color-content-muted,#8d8d98));--rw-line:var(--border-color,rgba(127,127,127,.16));--rw-accent:var(--theme-color,#9b6dff);--rw-radius:var(--border-radius,12px)}',
            r + '{display:block;width:100%;min-height:100vh;color:var(--rw-text-2);font-family:inherit}',
            r + ' *{box-sizing:border-box}',
            r + ' .rw-wrap{max-width:1040px;margin:0 auto;padding:40px 24px 64px}',
            r + ' .rw-head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap;margin-bottom:24px}',
            r + ' h1{margin:0;font-size:32px;line-height:40px;font-weight:600;color:var(--rw-text)}',
            r + ' .rw-lede{margin:4px 0 0;font-size:14px;line-height:20px;color:var(--rw-muted)}',
            r + ' .rw-actions{display:flex;gap:8px}',
            r + ' .rw-btn{height:36px;padding:0 14px;border-radius:8px;border:1px solid var(--rw-line);background:var(--rw-raised);color:var(--rw-text);font:inherit;font-size:14px;font-weight:500;cursor:pointer;transition:background-color .15s ease,border-color .15s ease}',
            r + ' .rw-btn:hover:not(:disabled),.rw-modal .rw-btn:hover{border-color:rgba(127,127,127,.32)}',
            r + ' .rw-btn:disabled{opacity:.5;cursor:default}',
            r + ' .rw-primary,.rw-modal .rw-primary{background:var(--rw-text);color:var(--rw-panel);border-color:transparent}',
            r + ' .rw-bar-row{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:24px}',
            r + ' .rw-years{display:flex;gap:4px;flex-wrap:wrap}',
            r + ' .rw-chip{height:32px;padding:0 12px;border:0;border-radius:8px;background:transparent;color:var(--rw-muted);font:inherit;font-size:14px;font-weight:500;cursor:pointer;font-variant-numeric:tabular-nums;transition:background-color .15s ease,color .15s ease}',
            r + ' .rw-chip:hover{color:var(--rw-text)}',
            r + ' .rw-chip[aria-pressed="true"]{background:var(--rw-raised);color:var(--rw-text)}',
            r + ' .rw-status{font-size:13px;color:var(--rw-muted)}',
            r + ' .rw-status.rw-error{color:#f87171}',
            r + ' .rw-hero{padding:40px 0 32px;border-top:1px solid var(--rw-line)}',
            r + ' .rw-eyebrow{margin:0 0 8px;font-size:16px;color:var(--rw-muted)}',
            r + ' .rw-big{margin:0;font-size:88px;line-height:1;font-weight:700;color:var(--rw-text);font-variant-numeric:tabular-nums;letter-spacing:-.02em}',
            r + ' .rw-big span{font-size:32px;font-weight:500;color:var(--rw-muted);letter-spacing:0;margin-left:8px}',
            r + ' .rw-sub{margin:12px 0 0;font-size:16px;color:var(--rw-text-2)}',
            r + ' .rw-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:32px 0 0}',
            r + ' .rw-stats div{padding:16px 0 0;border-top:1px solid var(--rw-line)}',
            r + ' dt{font-size:13px;color:var(--rw-muted);margin:0 0 4px}',
            r + ' dd{margin:0;font-size:20px;font-weight:600;color:var(--rw-text);font-variant-numeric:tabular-nums}',
            r + ' .rw-panel{background:var(--rw-panel);border:1px solid var(--rw-line);border-radius:var(--rw-radius);padding:20px 24px}',
            r + ' .rw-panel h2{display:flex;align-items:baseline;justify-content:space-between;margin:0 0 16px;font-size:16px;font-weight:600;color:var(--rw-text)}',
            r + ' .rw-h-note{font-size:13px;font-weight:400;color:var(--rw-muted)}',
            r + ' .rw-wide{margin-bottom:16px}',
            r + ' .rw-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}',
            r + ' .rw-chart{display:flex;align-items:flex-end;gap:8px;height:180px}',
            r + ' .rw-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;min-width:0}',
            r + ' .rw-col-bar{display:block;width:100%;max-width:40px;border-radius:4px 4px 0 0;background:rgba(127,127,127,.32)}',
            r + ' .rw-peak .rw-col-bar{background:var(--rw-accent)}',
            r + ' .rw-col-label{margin-top:8px;font-size:12px;color:var(--rw-muted);font-variant-numeric:tabular-nums}',
            r + ' .rw-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}',
            r + ' .rw-row{display:flex;align-items:center;gap:12px}',
            r + ' .rw-rank{width:16px;flex-shrink:0;font-size:13px;color:var(--rw-muted);text-align:right;font-variant-numeric:tabular-nums}',
            r + ' .rw-icon{width:36px;height:36px;flex-shrink:0;border-radius:8px;overflow:hidden;background:var(--rw-raised)}',
            r + ' .rw-icon img{display:block;width:100%;height:100%;object-fit:cover}',
            r + ' .rw-row-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px}',
            r + ' .rw-row-name{font-size:14px;font-weight:500;color:var(--rw-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-decoration:none}',
            r + ' a.rw-row-name:hover{text-decoration:underline}',
            r + ' .rw-bar{display:block;height:4px;border-radius:2px;background:rgba(127,127,127,.16);overflow:hidden}',
            r + ' .rw-bar span{display:block;height:100%;background:var(--rw-text-2)}',
            r + ' .rw-row-value{flex-shrink:0;font-size:13px;color:var(--rw-text-2);font-variant-numeric:tabular-nums}',
            r + ' .rw-facts{display:flex;flex-direction:column;gap:16px;margin:0}',
            r + ' .rw-facts dd{font-size:16px;font-weight:500;overflow-wrap:anywhere}',
            r + ' .rw-facts dd span{display:block;margin-top:2px;font-size:13px;font-weight:400;color:var(--rw-muted)}',
            r + ' .rw-muted{color:var(--rw-muted);font-size:14px;margin:0}',
            r + ' .rw-empty{padding:64px 0;text-align:center;font-size:16px;color:var(--rw-text-2);border-top:1px solid var(--rw-line)}',
            r + ' .rw-empty p{margin:0 auto}',
            r + ' .rw-empty .rw-muted{max-width:440px;margin-top:8px;line-height:20px}',
            r + ' .rw-partial{margin:0 0 16px;padding:12px 16px;border-radius:8px;background:var(--rw-raised);font-size:14px;color:var(--rw-text-2)}',
            r + ' .rw-note{margin:24px 0 0;font-size:13px;line-height:20px;color:var(--rw-muted);max-width:720px}',
            r + ' .rw-btn:focus-visible,' + r + ' .rw-chip:focus-visible,' + r + ' a:focus-visible,.rw-modal .rw-btn:focus-visible{outline:2px solid var(--rw-text);outline-offset:2px}',
            '.rw-modal{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.6)}',
            '.rw-modal-box{display:flex;flex-direction:column;max-width:100%;max-height:calc(100vh - 48px);padding:20px;border-radius:var(--border-radius,16px);background:var(--rw-panel);border:1px solid var(--rw-line);color:var(--rw-text);font-family:var(--font-family,inherit);box-shadow:0 0 var(--shadow-thickness,0) var(--shadow-color,transparent)}',
            '.rw-preview-wrap{display:flex;align-items:center;justify-content:center;min-height:0;flex:1 1 auto}',
            '.rw-preview-wrap .rw-muted{width:320px;padding:160px 0;text-align:center}',
            '.rw-modal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}',
            '.rw-modal-head h2{margin:0;font-size:16px;font-weight:600}',
            '.rw-modal-intro{margin:-8px 0 16px;font-size:14px;color:var(--rw-text-2)}',
            '.rw-modal .rw-link{display:inline-flex;align-items:center;text-decoration:none}',
            '.rw-preview{display:block;width:auto;height:auto;max-width:min(432px,100%);max-height:calc(100vh - 200px);border-radius:12px}',
            '.rw-modal-actions{display:flex;align-items:center;gap:8px;margin-top:16px}',
            '.rw-modal .rw-btn{height:36px;padding:0 14px;border-radius:8px;border:1px solid var(--rw-line);background:var(--rw-raised);color:var(--rw-text);font:inherit;font-size:14px;font-weight:500;cursor:pointer}',
            '.rw-modal .rw-primary{background:var(--rw-text);color:var(--rw-panel);border-color:transparent}',
            '.rw-modal .rw-btn:disabled{opacity:.5;cursor:default}',
            '.rw-modal .rw-muted{font-size:13px;color:var(--rw-muted)}',
            '@media (max-width:760px){' + r + ' .rw-grid{grid-template-columns:1fr}' + r + ' .rw-stats{grid-template-columns:repeat(2,1fr)}' + r + ' .rw-big{font-size:56px}' + r + ' .rw-chart{gap:4px}}'
        ].join('');
        document.head.appendChild(s);
    }

    function mount(inner) {
        injectStyles();
        var root = document.createElement('div');
        root.id = ROOT_ID;
        root.innerHTML = '<div class="rw-wrap">' + inner + '</div>';
        var container = document.querySelector('.content');
        if (container) { container.innerHTML = ''; container.appendChild(root); }
        else { document.body.innerHTML = ''; document.body.appendChild(root); }
        document.title = 'Roblox Wrapped - Purpura';
        return root;
    }

    async function init() {
        await window.__PurpuraSettings.ready;
        if (window.__PurpuraSettings.get('rwr') === false) {
            mount('<h1>Roblox Wrapped</h1><p class="rw-lede">Roblox Wrapped is turned off. Turn it on in Purpura settings under Miscellaneous.</p>');
            return;
        }
        state.user = readUser();
        if (!state.user) {
            mount('<h1>Roblox Wrapped</h1><p class="rw-lede">Log in to Roblox to see your Wrapped.</p>');
            return;
        }
        var root = mount(''
            + '<header class="rw-head"><div><h1>Roblox Wrapped</h1><p class="rw-lede">Where your Robux went, from your own transaction history</p></div>'
            + '<div class="rw-actions"><button type="button" class="rw-btn" id="rw-refresh">Refresh</button><button type="button" class="rw-btn rw-primary" id="rw-share">Share image</button></div></header>'
            + '<div class="rw-bar-row"><nav class="rw-years" id="rw-years" aria-label="Period"></nav><span class="rw-status" id="rw-status" aria-live="polite"></span></div>'
            + '<div id="rw-body"></div>');
        root.addEventListener('click', function (e) {
            var chip = e.target.closest('.rw-chip');
            if (chip) {
                var y = chip.getAttribute('data-year');
                state.year = y === 'all' ? 'all' : Number(y);
                render();
                return;
            }
            if (e.target.closest('#rw-share')) openShare();
            var btn = e.target.closest('#rw-refresh');
            if (btn && !state.loading) { btn.disabled = true; refresh(); }
        });
        state.cache = await loadCache();
        render();
        if (!state.cache || state.cache.complete === false) {
            document.getElementById('rw-refresh').disabled = true;
            refresh();
        }
    }

    async function nyeCheck() {
        await window.__PurpuraSettings.ready;
        var test = false;
        try { test = localStorage.getItem(NYE_TEST_KEY) === '1'; } catch (e) {}
        if (window.__PurpuraSettings.get('rwr') === false || window.__PurpuraSettings.get('rwrNye') !== true) {
            if (test) console.info('[Purpura] Roblox Wrapped New Year\'s Eve popup is off. Turn on Roblox Wrapped and its New Year\'s Eve sub-toggle, then run the test again.');
            return;
        }
        var now = new Date();
        var year = now.getFullYear();
        if (!test && !(now.getMonth() === 11 && now.getDate() === 31)) return;
        if (window.self !== window.top) return;
        state.user = readUser();
        if (!state.user) return;
        if (test) {
            try { localStorage.removeItem(NYE_TEST_KEY); } catch (e) {}
        } else {
            var seen = await new Promise(function (r) { chrome.storage.local.get('rwrNyeShown', function (d) { r(d && d.rwrNyeShown); }); });
            if (seen === year) return;
            chrome.storage.local.set({ rwrNyeShown: year });
        }
        var c = await loadCache();
        try {
            if (c && c.purchases.length) {
                var fresh = [];
                await fetchType(state.user.id, 'Purchase', { newerThan: c.purchases[0].t, onPage: function (rows) { fresh = fresh.concat(rows); } });
                if (fresh.length) { c.purchases = fresh.concat(c.purchases); await saveCache(c); }
            } else {
                var rows = [];
                await fetchType(state.user.id, 'Purchase', { stopBefore: new Date(year, 0, 1).getTime(), onPage: function (r) { rows = rows.concat(r); } });
                c = { userId: state.user.id, purchases: rows, bought: [] };
            }
        } catch (e) {
            if (!c || !c.purchases.length) return;
        }
        state.cache = c;
        var ys = years(c);
        state.year = ys.indexOf(year) !== -1 ? year : (test ? ys[0] : null);
        if (!state.year) {
            if (test) console.info('[Purpura] No Robux purchases found to build a Wrapped from.');
            return;
        }
        injectStyles();
        openShare(true);
    }

    var attempts = 0;
    var poll = setInterval(function () {
        if (window.__PurpuraSettings) { clearInterval(poll); if (ON_PAGE) init(); else nyeCheck(); }
        else if (++attempts > 100) clearInterval(poll);
    }, 100);

    if (ON_PAGE) (function () {
        var s = streakOf(['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-05', '2026-01-06']);
        console.assert(s.len === 3 && s.start === '2026-01-01', '[Purpura] wrapped streak');
        var a = analyze({ purchases: [
            { t: Date.parse('2026-03-02T12:00:00'), r: 50, n: 'Sword', k: 'GamePass', c: 'Dev', ci: 1, ct: 'User', u: 9, g: 'Game', p: 90 },
            { t: Date.parse('2026-03-01T12:00:00'), r: 25, n: 'Hat', k: 'Asset', c: 'Shop', ci: 2, ct: 'Group', u: null, g: '', p: null },
            { t: Date.parse('2025-06-01T12:00:00'), r: 400, n: 'Old', k: 'Asset', c: 'Shop', ci: 2, ct: 'Group', u: null, g: '', p: null }
        ], bought: [{ t: Date.parse('2026-02-01T12:00:00'), r: 400 }] }, 2026);
        console.assert(a.spent === 75 && a.count === 2 && a.bought === 400 && a.topGames[0].id === 9 && a.biggest.r === 50 && a.streak.len === 2 && a.buckets[2] === 75, '[Purpura] wrapped analyze');
    })();
})();
