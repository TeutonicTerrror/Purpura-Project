/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';
    if (window.__PurpuraGameBlocker) return;

    var SETTING_KEY = 'gb';
    var BUTTON_KEY = 'gbBtn';
    var PAGE_BUTTON_KEY = 'gbPageBtn';
    var LIST_KEY = 'gbList';
    var HIDDEN = 'purpura-gb-hidden';
    var CARD_BTN = 'purpura-gb-card-btn';
    var BAN_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/></svg>';

    var enabled = false;
    var showCardButton = true;
    var showPageButton = false;
    var list = { games: [], creators: [], keywords: [] };
    var version = 0;
    var placeSet = new Set();
    var universeSet = new Set();
    var creatorSet = new Set();
    var keywordRules = [];
    var creatorOf = new Map();
    var universeOfPlace = new Map();
    var pendingUniverses = new Set();
    var pendingPlaces = new Set();
    var lookupTimer = 0;
    var scanTimer = 0;
    var observer = null;
    var viewAnyway = '';

    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function idOf(v) { var n = Number(v); return Number.isSafeInteger(n) && n > 0 ? n : null; }

    function parseRule(raw) {
        var text = String(raw || '').trim();
        if (!text) return null;
        var m = text.match(/^\/(.+)\/([a-z]*)$/i);
        if (m) {
            try { var re = new RegExp(m[1], m[2].replace(/[gy]/g, '')); return { raw: text, test: function (s) { return re.test(s); } }; }
            catch (e) { return null; }
        }
        var words = text.toLowerCase().split(/\s+/).filter(Boolean);
        return { raw: text, test: function (s) { var l = s.toLowerCase(); return words.every(function (w) { return l.indexOf(w) !== -1; }); } };
    }

    function rebuild() {
        placeSet = new Set(list.games.map(function (g) { return g.p; }).filter(Boolean));
        universeSet = new Set(list.games.map(function (g) { return g.u; }).filter(Boolean));
        creatorSet = new Set(list.creators.map(function (c) { return c.type + ':' + c.id; }));
        keywordRules = list.keywords.map(function (k) { return parseRule(k.r); }).filter(Boolean);
        version++;
    }

    function normalize(v) {
        var out = { games: [], creators: [], keywords: [] };
        if (!v || typeof v !== 'object') return out;
        var seen = new Set();
        (Array.isArray(v.games) ? v.games : []).forEach(function (g) {
            var p = idOf(g && g.p), u = idOf(g && g.u);
            var key = (p || '') + ':' + (u || '');
            if ((!p && !u) || seen.has(key)) return;
            seen.add(key);
            out.games.push({ p: p, u: u, n: String(g.n || '').slice(0, 200), at: Number(g.at) || Date.now() });
        });
        (Array.isArray(v.creators) ? v.creators : []).forEach(function (c) {
            var id = idOf(c && c.id), type = c && c.type === 'Group' ? 'Group' : 'User';
            if (!id || out.creators.some(function (x) { return x.id === id && x.type === type; })) return;
            out.creators.push({ id: id, type: type, n: String(c.n || '').slice(0, 200), at: Number(c.at) || Date.now() });
        });
        (Array.isArray(v.keywords) ? v.keywords : []).forEach(function (k) {
            var r = String(k && k.r || '').trim().slice(0, 200);
            if (!r || !parseRule(r) || out.keywords.some(function (x) { return x.r.toLowerCase() === r.toLowerCase(); })) return;
            out.keywords.push({ r: r, at: Number(k.at) || Date.now() });
        });
        return out;
    }

    function save() {
        rebuild();
        var o = {};
        o[LIST_KEY] = list;
        chrome.storage.local.set(o);
        refreshAll();
    }

    function reasonFor(info) {
        if ((info.p && placeSet.has(info.p)) || (info.u && universeSet.has(info.u))) return { kind: 'game' };
        var creator = info.u ? creatorOf.get(info.u) : null;
        if (creator && creatorSet.has(creator.type + ':' + creator.id)) return { kind: 'creator', creator: creator };
        if (info.n) {
            for (var i = 0; i < keywordRules.length; i++) if (keywordRules[i].test(info.n)) return { kind: 'keyword', rule: keywordRules[i].raw };
        }
        return null;
    }

    function cardInfo(link) {
        var m = (link.getAttribute('href') || '').match(/\/games\/(\d+)/);
        var p = m ? idOf(m[1]) : null;
        var u = idOf(link.id) || idOf(link.closest('[data-testid="wide-game-tile"]') && link.closest('[data-testid="wide-game-tile"]').id);
        if (!u && p && universeOfPlace.has(p)) u = universeOfPlace.get(p);
        var nameEl = link.querySelector('.game-card-name, [data-testid="game-tile-game-title"], .game-name-title') || link.querySelector('[title]');
        var img = link.querySelector('img[alt]');
        var n = ((nameEl && (nameEl.getAttribute('title') || nameEl.textContent)) || (img && img.alt) || '').trim();
        return { p: p, u: u, n: n };
    }

    function gameKeyOf(a) {
        var m = (a.getAttribute('href') || '').match(/\/games\/(\d+)/);
        return m ? m[1] : '';
    }

    function cardContainer(link) {
        var el = link.closest('li, .grid-item-container, .featured-grid-item-container, [data-testid="game-tile"]') || link;
        for (var depth = 0; depth < 4; depth++) {
            var parent = el.parentElement;
            if (!parent || parent === document.body || /^(UL|OL|BODY|MAIN)$/.test(parent.tagName)) break;
            if (parent.querySelector('h1,h2,h3,.container-header,.game-sort-header-container,[data-testid="section-header"]')) break;
            var keys = new Set();
            var anchors = parent.querySelectorAll('a[href*="/games/"]');
            for (var i = 0; i < anchors.length; i++) { var k = gameKeyOf(anchors[i]); if (k) keys.add(k); }
            if (keys.size > 1) break;
            el = parent;
        }
        return el;
    }

    function isCardLink(link) {
        if (link.closest('#purpura-gb-manager, .purpura-gb-screen, #left-navigation-container, .rbx-header, #header, .friends-carousel-container, .friend-carousel-container, .react-friends-carousel-container, .friend-tile-dropdown, .friends-carousel-tile, #chat-container, .chat-container, .dialog-container')) return false;
        return !!link.querySelector('img, .thumbnail-2d-container, [class*="thumb"]');
    }

    function queueLookup(info) {
        if (!list.creators.length) return;
        if (info.u && !creatorOf.has(info.u)) pendingUniverses.add(info.u);
        else if (!info.u && info.p && !universeOfPlace.has(info.p)) pendingPlaces.add(info.p);
        else return;
        if (!lookupTimer) lookupTimer = setTimeout(runLookups, 300);
    }

    function getJson(url) {
        return fetch(url, { credentials: 'include' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    }

    async function runLookups() {
        lookupTimer = 0;
        var places = Array.from(pendingPlaces).slice(0, 50);
        places.forEach(function (p) { pendingPlaces.delete(p); universeOfPlace.set(p, null); });
        if (places.length) {
            var pd = await getJson('https://games.roblox.com/v1/games/multiget-place-details?placeIds=' + places.join(','));
            (Array.isArray(pd) ? pd : []).forEach(function (row) {
                var u = idOf(row.universeId);
                if (u) { universeOfPlace.set(row.placeId, u); if (!creatorOf.has(u)) pendingUniverses.add(u); }
            });
        }
        var unis = Array.from(pendingUniverses).slice(0, 50);
        unis.forEach(function (u) { pendingUniverses.delete(u); creatorOf.set(u, null); });
        if (unis.length) {
            var gd = await getJson('https://games.roblox.com/v1/games?universeIds=' + unis.join(','));
            ((gd && gd.data) || []).forEach(function (g) {
                if (g.creator) creatorOf.set(g.id, { id: g.creator.id, type: g.creator.type === 'Group' ? 'Group' : 'User', name: g.creator.name });
            });
        }
        if (pendingPlaces.size || pendingUniverses.size) lookupTimer = setTimeout(runLookups, 300);
        version++;
        scheduleScan();
    }

    function addCardButton(container, link, info) {
        if (!showCardButton || container.querySelector('.' + CARD_BTN)) return;
        var host = link.querySelector('.game-card-thumb-container, .thumbnail-2d-container, [class*="thumb"]') || container;
        if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
        var b = document.createElement('button');
        b.type = 'button';
        b.className = CARD_BTN;
        b.title = 'Block experience';
        b.setAttribute('aria-label', 'Block ' + (info.n || 'experience'));
        b.innerHTML = BAN_SVG;
        b.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var fresh = cardInfo(link);
            blockGame(fresh);
            toast('Blocked ' + (fresh.n || 'experience'), function () { unblockGame(fresh); });
        }, true);
        host.appendChild(b);
    }

    function scan() {
        scanTimer = 0;
        if (!enabled) return;
        var links = document.querySelectorAll('a[href*="/games/"]');
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            if (link.dataset.gbv === String(version) || !isCardLink(link)) continue;
            link.dataset.gbv = String(version);
            var info = cardInfo(link);
            if (!info.p && !info.u) continue;
            var container = cardContainer(link);
            var reason = reasonFor(info);
            container.classList.toggle(HIDDEN, !!reason);
            if (!reason) {
                queueLookup(info);
                addCardButton(container, link, info);
            }
        }
        checkGamePage();
    }

    function scheduleScan() {
        if (!scanTimer) scanTimer = setTimeout(scan, 120);
    }

    function refreshAll() {
        document.querySelectorAll('.' + HIDDEN).forEach(function (el) { el.classList.remove(HIDDEN); });
        document.querySelectorAll('.' + CARD_BTN).forEach(function (el) { if (!showCardButton || !enabled) el.remove(); });
        var screen = document.querySelector('.purpura-gb-screen');
        if (screen) { screen.remove(); restoreGamePage(); }
        updateGamePageButton();
        scan();
    }

    function blockGame(info) {
        if (!info.p && !info.u) return;
        list.games = list.games.filter(function (g) { return !((info.p && g.p === info.p) || (info.u && g.u === info.u)); });
        list.games.unshift({ p: info.p, u: info.u, n: info.n || '', at: Date.now() });
        save();
    }

    function unblockGame(info) {
        list.games = list.games.filter(function (g) { return !((info.p && g.p === info.p) || (info.u && g.u === info.u)); });
        save();
    }

    function blockCreator(c) {
        if (!c || list.creators.some(function (x) { return x.id === c.id && x.type === c.type; })) return;
        list.creators.unshift({ id: c.id, type: c.type, n: c.name || '', at: Date.now() });
        save();
    }

    function unblockCreator(c) {
        list.creators = list.creators.filter(function (x) { return !(x.id === c.id && x.type === c.type); });
        save();
    }

    function toast(text, undo) {
        var old = document.querySelector('.purpura-gb-toast');
        if (old) old.remove();
        var t = document.createElement('div');
        t.className = 'purpura-gb-toast';
        t.setAttribute('role', 'status');
        var span = document.createElement('span');
        span.textContent = text;
        t.appendChild(span);
        if (undo) {
            var b = document.createElement('button');
            b.type = 'button';
            b.textContent = 'Undo';
            b.addEventListener('click', function () { undo(); t.remove(); });
            t.appendChild(b);
        }
        document.body.appendChild(t);
        setTimeout(function () { if (t.isConnected) t.remove(); }, 6000);
    }

    function gamePageInfo() {
        var m = location.pathname.match(/^(?:\/[a-z]{2}(?:-[a-z]{2})?)?\/games\/(\d+)/i);
        if (!m) return null;
        var meta = document.getElementById('game-detail-meta-data');
        var title = document.querySelector('.game-name, h1.game-name, .game-title-container h1');
        return {
            p: idOf(m[1]),
            u: idOf(meta && meta.getAttribute('data-universe-id')),
            n: ((meta && meta.getAttribute('data-place-name')) || (title && title.textContent) || '').trim()
        };
    }

    function gamePageRoot() {
        return document.getElementById('game-detail-page') || document.querySelector('.game-main-content');
    }

    function restoreGamePage() {
        var root = gamePageRoot();
        if (root) root.classList.remove(HIDDEN);
    }

    function checkGamePage() {
        var info = gamePageInfo();
        if (!info) return;
        if (info.u && !creatorOf.has(info.u) && list.creators.length) queueLookup(info);
        var root = gamePageRoot();
        var existing = document.querySelector('.purpura-gb-screen');
        var reason = viewAnyway === location.pathname ? null : reasonFor(info);
        if (!reason || !root) {
            if (existing) { existing.remove(); restoreGamePage(); }
            addGamePageButton(info);
            return;
        }
        if (existing && existing.dataset.kind === reason.kind) return;
        if (existing) existing.remove();
        root.classList.add(HIDDEN);
        root.parentNode.insertBefore(blockedScreen(info, reason), root);
    }

    function blockedScreen(info, reason) {
        var s = document.createElement('section');
        s.className = 'purpura-gb-screen';
        s.dataset.kind = reason.kind;
        var title = reason.kind === 'game' ? 'You blocked this experience'
            : reason.kind === 'creator' ? 'You blocked this experience\'s creator'
            : 'This experience matches a blocked keyword';
        var detail = reason.kind === 'game' ? (info.n ? esc(info.n) + ' is hidden across Roblox for you.' : 'It is hidden across Roblox for you.')
            : reason.kind === 'creator' ? 'Everything by <strong>' + esc(reason.creator.name) + '</strong> is hidden across Roblox for you.'
            : 'Its name matches <strong>' + esc(reason.rule) + '</strong>.';
        var unblockLabel = reason.kind === 'game' ? 'Unblock' : reason.kind === 'creator' ? 'Unblock creator' : 'Manage keywords';
        s.innerHTML = '<div class="purpura-gb-screen-icon">' + BAN_SVG + '</div>'
            + '<h2>' + title + '</h2><p>' + detail + '</p>'
            + '<div class="purpura-gb-actions">'
            + '<button type="button" class="purpura-gb-btn purpura-gb-primary" data-act="back">Go back</button>'
            + '<button type="button" class="purpura-gb-btn" data-act="unblock">' + unblockLabel + '</button>'
            + '<button type="button" class="purpura-gb-btn purpura-gb-quiet" data-act="view">View anyway</button>'
            + '</div>';
        s.addEventListener('click', function (e) {
            var act = e.target.closest('[data-act]');
            if (!act) return;
            var a = act.dataset.act;
            if (a === 'back') { if (history.length > 1) history.back(); else location.href = '/home'; }
            else if (a === 'view') { viewAnyway = location.pathname; s.remove(); restoreGamePage(); addGamePageButton(info); }
            else if (reason.kind === 'game') unblockGame(info);
            else if (reason.kind === 'creator') unblockCreator(reason.creator);
            else openManager('keywords');
        });
        return s;
    }

    function updateGamePageButton() {
        var li = document.querySelector('.purpura-gb-page-btn');
        if (li && (!enabled || !showPageButton)) li.remove();
    }

    function addGamePageButton(info) {
        var row = document.querySelector('.favorite-follow-vote-share');
        if (!showPageButton || !row || row.querySelector('.purpura-gb-page-btn')) return;
        var fav = row.querySelector('.game-favorite-button-container');
        var li = document.createElement('li');
        li.className = 'purpura-gb-page-btn';
        li.innerHTML = '<button type="button" aria-haspopup="menu" aria-expanded="false">' + BAN_SVG.replace('width="16" height="16"', 'width="20" height="20"') + '<span>Block</span></button>';
        var btn = li.querySelector('button');
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var open = document.querySelector('.purpura-gb-menu');
            if (open) { open.remove(); btn.setAttribute('aria-expanded', 'false'); return; }
            openGameMenu(btn, gamePageInfo() || info);
        });
        if (fav) fav.parentNode.insertBefore(li, fav.nextSibling);
        else row.appendChild(li);
    }

    async function openGameMenu(btn, info) {
        var menu = document.createElement('div');
        menu.className = 'purpura-gb-menu';
        menu.setAttribute('role', 'menu');
        menu.innerHTML = '<button type="button" role="menuitem" data-act="game">Block this experience</button>'
            + '<button type="button" role="menuitem" data-act="creator" disabled>Block creator…</button>';
        var r = btn.getBoundingClientRect();
        menu.style.top = (r.bottom + window.scrollY + 6) + 'px';
        menu.style.left = Math.max(8, r.left + window.scrollX + r.width / 2 - 120) + 'px';
        document.body.appendChild(menu);
        btn.setAttribute('aria-expanded', 'true');
        var close = function (ev) {
            if (ev && menu.contains(ev.target)) return;
            menu.remove();
            btn.setAttribute('aria-expanded', 'false');
            document.removeEventListener('click', close, true);
        };
        setTimeout(function () { document.addEventListener('click', close, true); }, 0);
        var creator = null;
        menu.addEventListener('click', function (e) {
            var act = e.target.closest('[data-act]');
            if (!act || act.disabled) return;
            menu.remove();
            document.removeEventListener('click', close, true);
            if (act.dataset.act === 'game') blockGame(info);
            else if (creator) blockCreator(creator);
        });
        if (info.u) {
            var gd = await getJson('https://games.roblox.com/v1/games?universeIds=' + info.u);
            var g = gd && gd.data && gd.data[0];
            if (g && g.creator) {
                creator = { id: g.creator.id, type: g.creator.type === 'Group' ? 'Group' : 'User', name: g.creator.name };
                creatorOf.set(info.u, creator);
                var cb = menu.querySelector('[data-act="creator"]');
                if (cb) { cb.disabled = false; cb.textContent = 'Block everything by ' + creator.name; }
            }
        }
    }

    function openManager(tab) {
        var old = document.getElementById('purpura-gb-manager');
        if (old) old.remove();
        injectStyles();
        var current = tab || 'games';
        var query = '';
        var overlay = document.createElement('div');
        overlay.id = 'purpura-gb-manager';
        overlay.innerHTML = '<div class="purpura-gb-dialog" role="dialog" aria-modal="true" aria-labelledby="purpura-gb-title">'
            + '<header><h2 id="purpura-gb-title">Game Blocker</h2><button type="button" class="purpura-gb-btn" data-act="close">Close</button></header>'
            + '<nav class="purpura-gb-tabs" role="tablist"></nav>'
            + '<div class="purpura-gb-tools"><input type="search" class="purpura-gb-input" placeholder="Search" aria-label="Search blocked"></div>'
            + '<div class="purpura-gb-add" hidden><input type="text" class="purpura-gb-input" placeholder="Keyword or /regex/i" aria-label="New keyword rule"><button type="button" class="purpura-gb-btn purpura-gb-primary" data-act="add">Add</button></div>'
            + '<p class="purpura-gb-hint" hidden>Words in one rule must all appear in the name. Use /pattern/flags for a regular expression.</p>'
            + '<ul class="purpura-gb-list"></ul>'
            + '<footer><button type="button" class="purpura-gb-btn" data-act="export">Export</button><button type="button" class="purpura-gb-btn" data-act="import">Import</button><span class="purpura-gb-status" aria-live="polite"></span></footer>'
            + '</div>';
        var tabs = overlay.querySelector('.purpura-gb-tabs');
        var ul = overlay.querySelector('.purpura-gb-list');
        var search = overlay.querySelector('.purpura-gb-tools input');
        var addRow = overlay.querySelector('.purpura-gb-add');
        var addInput = addRow.querySelector('input');
        var hint = overlay.querySelector('.purpura-gb-hint');
        var status = overlay.querySelector('.purpura-gb-status');

        function render() {
            var defs = [['games', 'Experiences', list.games.length], ['creators', 'Creators', list.creators.length], ['keywords', 'Keywords', list.keywords.length]];
            tabs.innerHTML = defs.map(function (d) {
                return '<button type="button" role="tab" data-tab="' + d[0] + '" aria-selected="' + (d[0] === current) + '">' + d[1] + '<span>' + d[2] + '</span></button>';
            }).join('');
            addRow.hidden = hint.hidden = current !== 'keywords';
            var q = query.toLowerCase();
            var rows = current === 'games' ? list.games.map(function (g, i) { return { i: i, name: g.n || ('Place ' + (g.p || g.u)), sub: g.p ? 'Place ' + g.p : 'Universe ' + g.u, href: g.p ? '/games/' + g.p + '/' : '', u: g.u }; })
                : current === 'creators' ? list.creators.map(function (c, i) { return { i: i, name: c.n || ('Creator ' + c.id), sub: c.type === 'Group' ? 'Community' : 'User', href: c.type === 'Group' ? '/communities/' + c.id + '/' : '/users/' + c.id + '/profile' }; })
                : list.keywords.map(function (k, i) { return { i: i, name: k.r, sub: /^\/.+\/[a-z]*$/i.test(k.r) ? 'Regular expression' : 'All words must match' }; });
            rows = rows.filter(function (r) { return !q || r.name.toLowerCase().indexOf(q) !== -1; });
            if (!rows.length) {
                ul.innerHTML = '<li class="purpura-gb-empty">' + (query ? 'No matches' : current === 'games' ? 'No blocked experiences yet. Use the block button on any game card or game page.' : current === 'creators' ? 'No blocked creators yet. Block one from a game page\'s Block menu.' : 'No keyword rules yet') + '</li>';
                return;
            }
            ul.innerHTML = rows.map(function (r) {
                return '<li>' + (current === 'games' ? '<span class="purpura-gb-thumb"' + (r.u ? ' data-u="' + r.u + '"' : '') + '></span>' : '')
                    + '<span class="purpura-gb-row-main">' + (r.href ? '<a href="' + esc(r.href) + '">' + esc(r.name) + '</a>' : '<span>' + esc(r.name) + '</span>') + '<small>' + esc(r.sub) + '</small></span>'
                    + '<button type="button" class="purpura-gb-btn" data-remove="' + r.i + '">' + (current === 'keywords' ? 'Remove' : 'Unblock') + '</button></li>';
            }).join('');
            if (current === 'games') loadThumbs();
        }

        function loadThumbs() {
            var ids = Array.from(ul.querySelectorAll('.purpura-gb-thumb[data-u]')).map(function (el) { return el.dataset.u; }).slice(0, 100);
            if (!ids.length) return;
            getJson('https://thumbnails.roblox.com/v1/games/icons?universeIds=' + ids.join(',') + '&returnPolicy=PlaceHolder&size=50x50&format=Webp&isCircular=false').then(function (d) {
                ((d && d.data) || []).forEach(function (row) {
                    var el = ul.querySelector('.purpura-gb-thumb[data-u="' + row.targetId + '"]');
                    if (el && row.imageUrl && !el.firstChild) { var img = document.createElement('img'); img.src = row.imageUrl; img.alt = ''; el.appendChild(img); }
                });
            });
        }

        function addKeyword() {
            var raw = addInput.value.trim();
            if (!raw) return;
            if (!parseRule(raw)) { status.textContent = 'That regular expression is not valid'; return; }
            if (list.keywords.some(function (k) { return k.r.toLowerCase() === raw.toLowerCase(); })) { status.textContent = 'That rule already exists'; return; }
            list.keywords.unshift({ r: raw.slice(0, 200), at: Date.now() });
            addInput.value = '';
            status.textContent = '';
            save();
            render();
        }

        var close = function () { overlay.remove(); document.removeEventListener('keydown', onKey); };
        var onKey = function (e) { if (e.key === 'Escape') close(); };
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) return close();
            var t = e.target.closest('[data-tab]');
            if (t) { current = t.dataset.tab; render(); return; }
            var rm = e.target.closest('[data-remove]');
            if (rm) {
                var arr = current === 'games' ? list.games : current === 'creators' ? list.creators : list.keywords;
                arr.splice(Number(rm.dataset.remove), 1);
                save();
                render();
                return;
            }
            var act = e.target.closest('[data-act]');
            if (!act) return;
            if (act.dataset.act === 'close') close();
            else if (act.dataset.act === 'add') addKeyword();
            else if (act.dataset.act === 'export') {
                var blob = new Blob([JSON.stringify({ purpuraGameBlocker: 1, games: list.games, creators: list.creators, keywords: list.keywords }, null, 2)], { type: 'application/json' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = 'purpura-game-blocker.json';
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
            } else if (act.dataset.act === 'import') {
                var input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json,application/json';
                input.addEventListener('change', function () {
                    var f = input.files && input.files[0];
                    if (!f) return;
                    f.text().then(function (txt) {
                        var data = normalize(JSON.parse(txt));
                        var before = list.games.length + list.creators.length + list.keywords.length;
                        list = normalize({ games: list.games.concat(data.games), creators: list.creators.concat(data.creators), keywords: list.keywords.concat(data.keywords) });
                        save();
                        render();
                        status.textContent = 'Imported ' + (list.games.length + list.creators.length + list.keywords.length - before) + ' new entries';
                    }).catch(function () { status.textContent = 'That file could not be read'; });
                });
                input.click();
            }
        });
        search.addEventListener('input', function () { query = search.value; render(); });
        addInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') addKeyword(); });
        document.addEventListener('keydown', onKey);
        document.body.appendChild(overlay);
        render();
        (current === 'keywords' ? addInput : search).focus();
    }

    function injectStyles() {
        if (document.getElementById('purpura-gb-style')) return;
        var s = document.createElement('style');
        s.id = 'purpura-gb-style';
        var vars = '--gb-panel:var(--secondary-bg-color,var(--purpura-surface100,var(--color-surface-100,#18181c)));--gb-raised:var(--tertiary-bg-color,var(--purpura-surface200,var(--color-surface-200,#232329)));--gb-text:var(--text-color,var(--purpura-mainText,var(--color-content-emphasis,#f2f2f5)));--gb-muted:var(--purpura-secondaryText,var(--color-content-muted,#8d8d98));--gb-line:var(--border-color,rgba(127,127,127,.18));--gb-radius:var(--border-radius,12px)';
        s.textContent = [
            '.' + HIDDEN + '{display:none!important}',
            '.purpura-gb-screen,#purpura-gb-manager,.purpura-gb-menu,.purpura-gb-toast,.purpura-gb-page-btn{' + vars + '}',
            '.' + CARD_BTN + '{position:absolute;top:6px;right:6px;z-index:5;display:flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0;border-radius:14px;background:rgba(17,17,20,.78);color:#fff;cursor:pointer;opacity:0;transition:opacity .15s ease,background-color .15s ease}',
            '.' + CARD_BTN + ':hover{background:rgba(17,17,20,.92)}',
            '.' + CARD_BTN + ':focus-visible{opacity:1;outline:2px solid #fff;outline-offset:2px}',
            'li:hover .' + CARD_BTN + ',.grid-item-container:hover .' + CARD_BTN + ',.featured-grid-item-container:hover .' + CARD_BTN + ',[data-testid="game-tile"]:hover .' + CARD_BTN + ',a[href*="/games/"]:hover .' + CARD_BTN + '{opacity:1}',
            '@media (hover:none){.' + CARD_BTN + '{opacity:1}}',
            '.purpura-gb-page-btn{display:inline-flex;align-items:center;list-style:none;margin:0;padding:0;vertical-align:middle}',
            '.purpura-gb-page-btn button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-width:48px;min-height:48px;padding:8px 6px;border:0;border-radius:6px;background:transparent;color:inherit;font:inherit;font-size:12px;line-height:1;cursor:pointer;opacity:.8;transition:opacity .15s ease}',
            '.purpura-gb-page-btn button:hover,.purpura-gb-page-btn button[aria-expanded="true"]{opacity:1}',
            '.purpura-gb-menu{position:absolute;z-index:100001;display:flex;flex-direction:column;min-width:240px;padding:6px;border-radius:10px;background:var(--gb-panel);border:1px solid var(--gb-line);box-shadow:0 8px 24px rgba(0,0,0,.35)}',
            '.purpura-gb-menu button{padding:10px 12px;border:0;border-radius:6px;background:transparent;color:var(--gb-text);font:inherit;font-size:14px;text-align:left;cursor:pointer}',
            '.purpura-gb-menu button:hover:not(:disabled){background:var(--gb-raised)}',
            '.purpura-gb-menu button:disabled{color:var(--gb-muted);cursor:default}',
            '.purpura-gb-screen{display:flex;flex-direction:column;align-items:center;max-width:520px;margin:64px auto;padding:40px 32px;text-align:center;border-radius:var(--gb-radius);background:var(--gb-panel);border:1px solid var(--gb-line);color:var(--gb-text)}',
            '.purpura-gb-screen-icon{display:flex;align-items:center;justify-content:center;width:56px;height:56px;margin-bottom:16px;border-radius:28px;background:var(--gb-raised);color:var(--gb-muted)}',
            '.purpura-gb-screen-icon svg{width:28px;height:28px}',
            '.purpura-gb-screen h2{margin:0 0 8px;font-size:20px;font-weight:600;color:var(--gb-text)}',
            '.purpura-gb-screen p{margin:0 0 24px;font-size:14px;line-height:20px;color:var(--gb-muted)}',
            '.purpura-gb-screen strong{color:var(--gb-text);font-weight:600}',
            '.purpura-gb-actions{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}',
            '.purpura-gb-btn{height:36px;padding:0 14px;border-radius:8px;border:1px solid var(--gb-line);background:var(--gb-raised);color:var(--gb-text);font:inherit;font-size:14px;font-weight:500;cursor:pointer;white-space:nowrap;transition:border-color .15s ease}',
            '.purpura-gb-btn:hover{border-color:rgba(127,127,127,.4)}',
            '.purpura-gb-primary{background:var(--gb-text);color:var(--gb-panel);border-color:transparent}',
            '.purpura-gb-quiet{background:transparent;border-color:transparent;color:var(--gb-muted)}',
            '.purpura-gb-btn:focus-visible,.purpura-gb-menu button:focus-visible,#purpura-gb-manager [role="tab"]:focus-visible,.purpura-gb-page-btn button:focus-visible{outline:2px solid var(--gb-text);outline-offset:2px}',
            '.purpura-gb-toast{position:fixed;left:50%;bottom:24px;z-index:100002;transform:translateX(-50%);display:flex;align-items:center;gap:16px;padding:10px 10px 10px 16px;border-radius:10px;background:var(--gb-panel);border:1px solid var(--gb-line);color:var(--gb-text);font-size:14px;box-shadow:0 8px 24px rgba(0,0,0,.35)}',
            '.purpura-gb-toast button{height:32px;padding:0 12px;border:0;border-radius:6px;background:var(--gb-raised);color:var(--gb-text);font:inherit;font-weight:600;cursor:pointer}',
            '#purpura-gb-manager{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.6)}',
            '.purpura-gb-dialog{display:flex;flex-direction:column;width:min(560px,100%);max-height:calc(100vh - 48px);padding:20px;border-radius:var(--border-radius,16px);background:var(--gb-panel);border:1px solid var(--gb-line);color:var(--gb-text);font-family:var(--font-family,inherit)}',
            '.purpura-gb-dialog header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}',
            '.purpura-gb-dialog h2{margin:0;font-size:18px;font-weight:600;color:var(--gb-text)}',
            '.purpura-gb-tabs{display:flex;gap:4px;margin-bottom:12px}',
            '.purpura-gb-tabs button{display:flex;align-items:center;gap:6px;height:32px;padding:0 12px;border:0;border-radius:8px;background:transparent;color:var(--gb-muted);font:inherit;font-size:14px;font-weight:500;cursor:pointer}',
            '.purpura-gb-tabs button[aria-selected="true"]{background:var(--gb-raised);color:var(--gb-text)}',
            '.purpura-gb-tabs span{font-size:12px;color:var(--gb-muted);font-variant-numeric:tabular-nums}',
            '.purpura-gb-tools,.purpura-gb-add{display:flex;gap:8px;margin-bottom:12px}',
            '.purpura-gb-add[hidden],.purpura-gb-hint[hidden]{display:none}',
            '.purpura-gb-input{flex:1;min-width:0;height:36px;padding:0 12px;border-radius:8px;border:1px solid var(--gb-line);background:var(--gb-raised);color:var(--gb-text);font:inherit;font-size:14px}',
            '.purpura-gb-input:focus{outline:2px solid var(--gb-text);outline-offset:0}',
            '.purpura-gb-hint{margin:-4px 0 12px;font-size:12px;line-height:16px;color:var(--gb-muted)}',
            '.purpura-gb-list{flex:1;min-height:120px;overflow:auto;margin:0;padding:0;list-style:none;border-top:1px solid var(--gb-line)}',
            '.purpura-gb-list li{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--gb-line)}',
            '.purpura-gb-list .purpura-gb-empty{display:block;padding:32px 8px;border:0;text-align:center;font-size:14px;color:var(--gb-muted)}',
            '.purpura-gb-thumb{width:40px;height:40px;flex-shrink:0;border-radius:8px;overflow:hidden;background:var(--gb-raised)}',
            '.purpura-gb-thumb img{display:block;width:100%;height:100%;object-fit:cover}',
            '.purpura-gb-row-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}',
            '.purpura-gb-row-main a,.purpura-gb-row-main>span{font-size:14px;font-weight:500;color:var(--gb-text);text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
            '.purpura-gb-row-main a:hover{text-decoration:underline}',
            '.purpura-gb-row-main small{font-size:12px;color:var(--gb-muted)}',
            '.purpura-gb-dialog footer{display:flex;align-items:center;gap:8px;margin-top:16px}',
            '.purpura-gb-status{font-size:13px;color:var(--gb-muted)}'
        ].join('');
        (document.head || document.documentElement).appendChild(s);
    }

    function setEnabled(next) {
        enabled = next;
        if (enabled) {
            injectStyles();
            if (!observer) {
                observer = new MutationObserver(scheduleScan);
                observer.observe(document.documentElement, { childList: true, subtree: true });
            }
            version++;
            refreshAll();
            return;
        }
        if (observer) { observer.disconnect(); observer = null; }
        version++;
        document.querySelectorAll('.' + HIDDEN).forEach(function (el) { el.classList.remove(HIDDEN); });
        document.querySelectorAll('.' + CARD_BTN + ',.purpura-gb-screen,.purpura-gb-page-btn,.purpura-gb-menu').forEach(function (el) { el.remove(); });
    }

    function readSettings() {
        showCardButton = window.__PurpuraSettings.get(BUTTON_KEY) !== false;
        showPageButton = window.__PurpuraSettings.get(PAGE_BUTTON_KEY) === true;
        setEnabled(window.__PurpuraSettings.get(SETTING_KEY) !== false);
    }

    window.__PurpuraGameBlocker = { openManager: openManager };

    var attempts = 0;
    var poll = setInterval(function () {
        if (!window.__PurpuraSettings) { if (++attempts > 100) clearInterval(poll); return; }
        clearInterval(poll);
        window.__PurpuraSettings.ready.then(function () {
            chrome.storage.local.get(LIST_KEY, function (d) {
                list = normalize(d && d[LIST_KEY]);
                rebuild();
                readSettings();
            });
        });
    }, 100);

    chrome.storage.onChanged.addListener(function (c, area) {
        if (area === 'sync' && (c[SETTING_KEY] || c[BUTTON_KEY] || c[PAGE_BUTTON_KEY]) && window.__PurpuraSettings) {
            if (c[BUTTON_KEY]) showCardButton = c[BUTTON_KEY].newValue !== false;
            if (c[PAGE_BUTTON_KEY]) showPageButton = c[PAGE_BUTTON_KEY].newValue === true;
            setEnabled(c[SETTING_KEY] ? c[SETTING_KEY].newValue !== false : enabled);
        }
        if (area === 'local' && c[LIST_KEY]) {
            var next = normalize(c[LIST_KEY].newValue);
            if (JSON.stringify(next) !== JSON.stringify(list)) { list = next; rebuild(); refreshAll(); }
        }
    });
})();
