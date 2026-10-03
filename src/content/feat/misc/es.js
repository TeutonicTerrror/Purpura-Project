/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    if (window.__purpuraEnhancedSearchLoaded) return;
    window.__purpuraEnhancedSearchLoaded = true;

    var STORAGE_KEY = 'es';
    var SEARCH_INPUT_ID = 'navbar-search-input';
    var RESULT_CLASS = 'purpura-enhanced-search-result';
    var MENU_SELECTOR = 'ul.new-dropdown-menu';

    var SELECTORS_SEARCH = [
        '#navbar-search-input',
        '#navbar-universal-search input',
        '[data-testid="navigation-search-input-field"]',
        '[data-testid="search-input"]',
        '.navbar-search input'
    ];

    var userController = null;
    var gameController = null;
    var lastQuery = '';
    var selectedIndex = 0;
    var activeReq = null;
    var committedReq = null;
    var quickPlayEnabled = false;
    var focusKeyEnabled = true;
    var seekTimer = 0;
    var thumbCache = new Map();

    function debounce(fn, ms) {
        var t = 0;
        return function () {
            var a = arguments;
            var ctx = this;
            clearTimeout(t);
            t = setTimeout(function () { fn.apply(ctx, a); }, ms);
        };
    }

    function esc(s) {
        return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function formatCount(n) {
        n = Number(n) || 0;
        if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
        if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
        return String(n);
    }

    function isTypingContext() {
        var el = document.activeElement;
        if (!el) return false;
        var tag = el.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable === true;
    }

    function findSearchInput() {
        for (var i = 0; i < SELECTORS_SEARCH.length; i++) {
            var el = document.querySelector(SELECTORS_SEARCH[i]);
            if (el) return el;
        }
        return null;
    }

    function focusSearchBox() {
        var inp = findSearchInput();
        if (inp) { inp.focus(); return true; }
        return false;
    }

    function getQseCfg() {
        try {
            var v = window.__PurpuraSettings.get(STORAGE_KEY);
            if (v === true) return { enabled: true, userSearch: true, gameSearch: true, friendSearch: true, focusKey: true };
            if (v === false) return { enabled: false, userSearch: false, gameSearch: false, friendSearch: false, focusKey: false };
            if (v && typeof v === 'object') {
                if (v.enabled === true && v.focusKey === undefined) v.focusKey = true;
                if (v.enabled === true && v.userSearch === undefined) v.userSearch = true;
                if (v.enabled === true && v.gameSearch === undefined) v.gameSearch = true;
                if (v.enabled === true && v.friendSearch === undefined) v.friendSearch = true;
                return v;
            }
        } catch (e2) {}
        return { enabled: false, userSearch: true, gameSearch: true, friendSearch: true, focusKey: true };
    }

    function getEnabled() {
        try {
            var v = window.__PurpuraSettings.get(STORAGE_KEY);
            if (v === true) return true;
            if (v && typeof v === 'object') return v.enabled === true;
            return v === true;
        } catch (e) { return false; }
    }

    function getUserSearchEnabled() {
        var c = getQseCfg();
        return c.enabled === true && c.userSearch !== false;
    }

    function getGameSearchEnabled() {
        var c = getQseCfg();
        return c.enabled === true && c.gameSearch !== false;
    }

    function getFriendSearchEnabled() {
        var c = getQseCfg();
        return c.enabled === true && c.friendSearch !== false;
    }

    function getFocusKeyEnabled() {
        var c = getQseCfg();
        return c.enabled === true && c.focusKey !== false;
    }

    function getQuickPlayEnabled() {
        try {
            var v = window.__PurpuraSettings.get('qp');
            return v === true || v === undefined;
        } catch (e) { return true; }
    }

    function ensureEsStyles() {
        if (document.getElementById('purpura-es-styles')) return;
        var s = document.createElement('style');
        s.id = 'purpura-es-styles';
        s.textContent = '.purpura-es-qp-buttons{display:flex;gap:6px;align-items:center;flex-shrink:0;padding-right:12px}.purpura-qp-btn{flex-shrink:0;width:36px;height:36px;border:none;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;transition:all 0.2s ease}.purpura-qp-btn svg{width:16px;height:16px}.purpura-qp-play{background:linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%)}.purpura-qp-play:hover{background:linear-gradient(135deg,#9d74f7 0%,#8b5cf6 100%);transform:translateY(-1px);box-shadow:0 4px 14px rgba(139,92,246,0.35)}.purpura-qp-servers{background:linear-gradient(135deg,#6d28d9 0%,#5b21b6 100%)}.purpura-qp-servers:hover{background:linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%);transform:translateY(-1px);box-shadow:0 4px 14px rgba(109,40,217,0.35)}.purpura-es-ps-dropdown{position:fixed;background:rgba(22,23,28,0.98);border:1px solid rgba(139,92,246,0.15);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.5);z-index:10000;opacity:0;transition:opacity 0.2s ease,transform 0.2s ease;pointer-events:none;backdrop-filter:blur(16px);width:320px;transform:translateY(-5px)}.purpura-es-ps-dropdown.visible{opacity:1;transform:translateY(0);pointer-events:all}.purpura-es-ps-list{max-height:300px;min-height:60px;overflow-y:auto;padding:8px;scrollbar-width:none}.purpura-es-ps-list::-webkit-scrollbar{display:none}.purpura-es-ps-item{display:flex;align-items:center;gap:10px;padding:9px 10px;margin-bottom:3px;background:rgba(139,92,246,0.04);border:1px solid rgba(139,92,246,0.06);border-radius:8px}.purpura-es-ps-item:hover{background:rgba(139,92,246,0.08);border-color:rgba(139,92,246,0.12)}.purpura-es-ps-info{flex:1;display:flex;flex-direction:column;gap:4px;min-width:0}.purpura-es-ps-name{color:#fff;font-weight:500;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.purpura-es-ps-players{color:#888;font-size:12px}.purpura-es-ps-join{width:32px;height:32px;border:none;background:linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%);border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}.purpura-es-ps-join:hover{background:linear-gradient(135deg,#9d74f7 0%,#8b5cf6 100%);transform:scale(1.05)}.purpura-es-ps-join svg{width:14px;height:14px}';
        document.head.appendChild(s);
    }
    var esPrivateCache = new Map();
    var esDropdown = null;
    var esActivePlaceId = null;
    var esHideTimer = null;
    function ensureEsPrivateDropdown() {
        if (document.getElementById('purpura-es-ps-dropdown')) { esDropdown = document.getElementById('purpura-es-ps-dropdown'); return; }
        var dd = document.createElement('div');
        dd.id = 'purpura-es-ps-dropdown';
        dd.className = 'purpura-es-ps-dropdown';
        var list = document.createElement('div');
        list.className = 'purpura-es-ps-list';
        dd.appendChild(list);
        document.body.appendChild(dd);
        esDropdown = dd;
        dd.addEventListener('mouseenter', function(){ clearTimeout(esHideTimer); });
        dd.addEventListener('mouseleave', function(){ esHideTimer = setTimeout(hideEsPrivateDropdown, 200); });
    }
    function hideEsPrivateDropdown() {
        if (!esDropdown || !esDropdown.classList.contains('visible')) return;
        if (esDropdown.matches(':hover')) return;
        esDropdown.classList.remove('visible');
        esActivePlaceId = null;
    }
    function renderEsPrivateServers(placeId, servers, nextCursor, append) {
        if (!esDropdown) return;
        var list = esDropdown.querySelector('.purpura-es-ps-list');
        if (!list) return;
        if (!append) list.innerHTML = '';
        var joinable = servers.filter(function(s){ return s.accessCode; });
        if (!joinable.length && !append) {
            var msg = document.createElement('div');
            msg.textContent = 'No active private servers found';
            msg.style.cssText = 'display:flex;align-items:center;justify-content:center;min-height:60px;text-align:center;padding:10px;color:#888;font-size:13px';
            list.appendChild(msg);
            return;
        }
        var frag = document.createDocumentFragment();
        joinable.forEach(function(server){
            var item = document.createElement('div');
            item.className = 'purpura-es-ps-item';
            var info = document.createElement('div');
            info.className = 'purpura-es-ps-info';
            var name = document.createElement('span');
            name.className = 'purpura-es-ps-name';
            name.textContent = server.name;
            name.title = server.name;
            var players = document.createElement('span');
            players.className = 'purpura-es-ps-players';
            players.textContent = (server.players ? server.players.length : 0) + ' / ' + server.maxPlayers;
            info.appendChild(name);
            info.appendChild(players);
            var joinBtn = document.createElement('button');
            joinBtn.className = 'purpura-es-ps-join';
            joinBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg>';
            joinBtn.title = 'Join Server';
            joinBtn.onclick = function(ev){
                ev.preventDefault(); ev.stopPropagation();
                var code = "if(typeof Roblox!=='undefined'&&Roblox.GameLauncher&&typeof Roblox.GameLauncher.joinPrivateGame==='function'){Roblox.GameLauncher.joinPrivateGame(parseInt('" + placeId + "',10),'" + String(server.accessCode).replace(/'/g, "\\'") + "','" + String(server.vipServerId).replace(/'/g, "\\'") + "');}";
                try { chrome.runtime.sendMessage({ action: 'injectScript', codeToInject: code }); } catch(e2){}
                hideEsPrivateDropdown();
            };
            item.appendChild(info);
            item.appendChild(joinBtn);
            frag.appendChild(item);
        });
        list.appendChild(frag);
    }
    function fetchAndDisplayEsPrivateServers(placeId) {
        if (!esDropdown) return;
        var list = esDropdown.querySelector('.purpura-es-ps-list');
        if (list) list.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:60px;padding:10px;color:#888;font-size:13px">Loading...</div>';
        if (esPrivateCache.has(placeId)) {
            var cached = esPrivateCache.get(placeId);
            renderEsPrivateServers(placeId, cached.servers, cached.nextCursor, false);
            return;
        }
        fetch('https://games.roblox.com/v1/games/' + encodeURIComponent(placeId) + '/private-servers?limit=50&sortOrder=Desc', { credentials: 'include' }).then(function(r){
            if (!r.ok) throw new Error('' + r.status);
            return r.json();
        }).then(function(j){
            var servers = (j && j.data) ? j.data : [];
            esPrivateCache.set(placeId, { servers: servers, nextCursor: j.nextPageCursor || null });
            renderEsPrivateServers(placeId, servers, j.nextPageCursor || null, false);
        }).catch(function(){
            if (list) list.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:60px;padding:10px;color:#888;font-size:13px">Failed to load servers</div>';
        });
    }
    function showPrivateServerOverlayForSearch(btn, placeId) {
        ensureEsPrivateDropdown();
        ensureEsStyles();
        if (!esDropdown) return;
        if (esActivePlaceId === placeId && esDropdown.classList.contains('visible')) { hideEsPrivateDropdown(); return; }
        esActivePlaceId = placeId;
        var rect = btn.getBoundingClientRect();
        var width = 320;
        esDropdown.style.width = width + 'px';
        var left = rect.left + rect.width/2 - width/2;
        left = Math.max(8, Math.min(left, document.documentElement.clientWidth - width - 8));
        var vpH = document.documentElement.clientHeight;
        var ddH = 300;
        var spaceBelow = vpH - rect.bottom - 8;
        var spaceAbove = rect.top - 8;
        var list = esDropdown.querySelector('.purpura-es-ps-list');
        if (spaceBelow >= ddH || spaceBelow >= spaceAbove) {
            esDropdown.style.top = (rect.bottom + 8) + 'px';
            esDropdown.style.bottom = 'auto';
            if (list) list.style.maxHeight = Math.max(80, Math.min(ddH, vpH - rect.bottom - 16)) + 'px';
        } else {
            esDropdown.style.bottom = (vpH - rect.top + 8) + 'px';
            esDropdown.style.top = 'auto';
            if (list) list.style.maxHeight = Math.max(80, Math.min(ddH, rect.top - 16)) + 'px';
        }
        esDropdown.style.left = left + 'px';
        esDropdown.classList.add('visible');
        fetchAndDisplayEsPrivateServers(placeId);
    }


    function getMenu() {
        return document.querySelector(MENU_SELECTOR);
    }

    function isCurrent(req, signal) {
        return !!req && !(signal && signal.aborted) && (activeReq === req || committedReq === req);
    }

    function makeRequest(query) {
        return { query: query, userResult: null, gameResult: null, friendResults: [], userDone: false, gameDone: query.length < 2, committed: false };
    }

    function setResult(req, key, val) {
        if (!req) return;
        if (req.committed) {
            if (key === 'userResult') window._purpuraLastUserResult = val;
            if (key === 'gameResult') window._purpuraLastGameResult = val;
            if (key === 'friendResults') window._purpuraLastFriendResults = val;
            return;
        }
        req[key] = val;
    }

    function getResult(req, key) {
        if (!req) return null;
        if (req.committed) {
            if (key === 'userResult') return window._purpuraLastUserResult || null;
            if (key === 'gameResult') return window._purpuraLastGameResult || null;
            if (key === 'friendResults') return window._purpuraLastFriendResults || [];
        }
        return req[key];
    }

    function commit(req) {
        if (!req || (activeReq !== req && committedReq !== req)) return;
        if (req.committed) { injectMenu(); return; }
        if (!req.userDone || !req.gameDone) return;
        committedReq = req;
        activeReq = null;
        req.committed = true;
        window._purpuraLastUserResult = req.userResult;
        window._purpuraLastGameResult = req.gameResult;
        window._purpuraLastFriendResults = req.friendResults;
        selectedIndex = 0;
        injectMenu(true);
    }

    function fetchRoblox(subdomain, endpoint, opts) {
        var url = 'https://' + subdomain + '.roblox.com' + endpoint;
        var fOpts = { credentials: 'include' };
        if (opts && opts.method) fOpts.method = opts.method;
        if (opts && opts.body) {
            fOpts.headers = { 'Content-Type': 'application/json' };
            fOpts.body = typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body);
        }
        if (opts && opts.signal) fOpts.signal = opts.signal;
        return fetch(url, fOpts);
    }

    function fetchJson(subdomain, endpoint, opts) {
        var retries = (opts && opts.retries != null) ? opts.retries : 2;
        var signal = opts && opts.signal ? opts.signal : null;
        var method = opts && opts.method ? opts.method : 'GET';
        var body = opts && opts.body ? opts.body : undefined;
        function attempt(n) {
            return fetchRoblox(subdomain, endpoint, { method: method, body: body, signal: signal }).then(function (r) {
                if (r.status === 499) { var e = new Error('aborted'); e.name = 'AbortError'; throw e; }
                if (r.status === 429 && n > 0) return new Promise(function (res) { setTimeout(res, 800); }).then(function () { return attempt(n - 1); });
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            }).catch(function (e) {
                if (e.name === 'AbortError') throw e;
                if (n > 0) return new Promise(function (res) { setTimeout(res, 600); }).then(function () { return attempt(n - 1); });
                throw e;
            });
        }
        return attempt(retries);
    }

    function fetchThumbnails(items, type, size, signal) {
        if (!items || !items.length) return Promise.resolve(new Map());
        var m = new Map();
        var uncached = [];
        for (var k = 0; k < items.length; k++) {
            var ck = type + ':' + (size || '48x48') + ':' + Number(items[k].id);
            if (thumbCache.has(ck)) m.set(Number(items[k].id), thumbCache.get(ck));
            else uncached.push(items[k]);
        }
        if (!uncached.length) return Promise.resolve(m);
        var batches = [];
        for (var i = 0; i < uncached.length; i += 50) batches.push(uncached.slice(i, i + 50));
        var promises = batches.map(function (batch) {
            var ids = batch.map(function (x) { return x.id; }).join(',');
            var endpoint = '';
            var sub = 'thumbnails';
            if (type === 'AvatarHeadshot') endpoint = '/v1/users/avatar-headshot?userIds=' + encodeURIComponent(ids) + '&size=' + encodeURIComponent(size || '48x48') + '&format=Png&isCircular=true&returnPolicy=PlaceHolder';
            else if (type === 'GameIcon') endpoint = '/v1/games/icons?universeIds=' + encodeURIComponent(ids) + '&returnPolicy=PlaceHolder&size=' + encodeURIComponent(size || '50x50') + '&format=Png&isCircular=false';
            else endpoint = '/v1/users/avatar-headshot?userIds=' + encodeURIComponent(ids) + '&size=' + encodeURIComponent(size || '48x48') + '&format=Png&isCircular=true&returnPolicy=PlaceHolder';
            return fetchRoblox(sub, endpoint, signal ? { signal: signal } : {}).then(function (r) {
                if (!r.ok) throw new Error('thumb ' + r.status);
                return r.json();
            }).then(function (j) {
                (j.data || []).forEach(function (d) {
                    var tid = Number(d.targetId);
                    var entry = { targetId: tid, imageUrl: d.imageUrl || '', state: d.state || 'Completed' };
                    m.set(tid, entry);
                    thumbCache.set(type + ':' + (size || '48x48') + ':' + tid, entry);
                    if (d.imageUrl) try { var pre = new Image(); pre.src = d.imageUrl; } catch (e2) {}
                });
                batch.forEach(function (it) {
                    var nid = Number(it.id);
                    if (!m.has(nid)) {
                        var blk = { targetId: nid, imageUrl: '', state: 'Blocked' };
                        m.set(nid, blk);
                        thumbCache.set(type + ':' + (size || '48x48') + ':' + nid, blk);
                    }
                });
            }).catch(function () {
                batch.forEach(function (it) {
                    var nid2 = Number(it.id);
                    if (!m.has(nid2)) {
                        var blk2 = { targetId: nid2, imageUrl: '', state: 'Blocked' };
                        m.set(nid2, blk2);
                        thumbCache.set(type + ':' + (size || '48x48') + ':' + nid2, blk2);
                    }
                });
            });
        });
        return Promise.all(promises).then(function () { return m; });
    }

    function formatPresenceStatus(presence) {
        if (!presence) return null;
        if (presence.userPresenceType === 2 && presence.lastLocation) return 'Playing ' + presence.lastLocation;
        if (presence.userPresenceType === 1) return 'Online';
        if (presence.userPresenceType === 3) return 'In Studio';
        return null;
    }

    function launchGame(placeId, jobId) {
        if (!placeId) return;
        var code = jobId
            ? "if(typeof Roblox!=='undefined'&&Roblox.GameLauncher&&typeof Roblox.GameLauncher.joinGameInstance==='function'){Roblox.GameLauncher.joinGameInstance(parseInt('" + placeId + "',10),'" + String(jobId).replace(/'/g, "\\'") + "');}"
            : "if(typeof Roblox!=='undefined'&&Roblox.GameLauncher&&typeof Roblox.GameLauncher.joinGameInstance==='function'){Roblox.GameLauncher.joinGameInstance(parseInt('" + placeId + "',10));}";
        try { chrome.runtime.sendMessage({ action: 'injectScript', codeToInject: code }); } catch (e) {}
    }

    function followUserFn(userId) {
        var u = parseInt(userId, 10);
        if (!u) return;
        var deep = 'roblox-player:1+launchmode:play+placelauncherurl:' + encodeURIComponent('https://assetgame.roblox.com/game/PlaceLauncher.ashx?request=RequestFollowUser&userId=' + u + '&is30=false');
        var code = "if(typeof Roblox!=='undefined'&&Roblox.GameLauncher&&typeof Roblox.GameLauncher.followPlayerIntoGame==='function'){Roblox.GameLauncher.followPlayerIntoGame(" + u + ");}else{window.location.href='" + deep.replace(/'/g, "\\'") + "';}";
        try { chrome.runtime.sendMessage({ action: 'injectScript', codeToInject: code }); } catch (e2) { window.location.href = deep; }
    }

    function createUserLi(user, thumbData, presence, isFriend) {
        var li = document.createElement('li');
        li.className = 'navbar-search-option rbx-clickable-li improved-search ' + RESULT_CLASS;
        li.dataset.userId = String(user.id);

        var row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.padding = '6px 0px';
        row.style.gap = '12px';
        row.style.maxHeight = '56px';

        var link = document.createElement('a');
        link.href = 'https://www.roblox.com/users/' + user.id + '/profile';
        link.style.display = 'flex';
        link.style.alignItems = 'center';
        link.style.gap = '12px';
        link.style.flex = '1';
        link.style.minWidth = '0';
        link.style.textDecoration = 'none';
        link.style.color = 'inherit';

        var thumbWrap = document.createElement('span');
        thumbWrap.className = 'thumbnail-2d-container';
        thumbWrap.style.position = 'relative';
        thumbWrap.style.height = '48px';
        thumbWrap.style.width = '48px';
        thumbWrap.style.borderRadius = '50%';
        thumbWrap.style.flexShrink = '0';
        thumbWrap.style.overflow = 'visible';
        thumbWrap.style.display = 'inline-flex';
        thumbWrap.style.alignItems = 'center';
        thumbWrap.style.justifyContent = 'center';

        var img = null;
        var url = thumbData && thumbData.imageUrl ? thumbData.imageUrl : null;
        if (url) {
            img = document.createElement('img');
            img.src = url;
            img.alt = user.displayName || user.name || '';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.borderRadius = '50%';
            img.style.objectFit = 'cover';
            thumbWrap.appendChild(img);
        } else {
            var sh = document.createElement('span');
            sh.className = 'thumbnail-2d-container shimmer';
            sh.style.display = 'block';
            sh.style.width = '100%';
            sh.style.height = '100%';
            sh.style.borderRadius = '50%';
            thumbWrap.appendChild(sh);
        }

        if (presence && presence.userPresenceType) {
            var cls = '';
            var col = '';
            if (presence.userPresenceType === 1) { cls = 'online'; col = 'rgb(0,162,255)'; }
            else if (presence.userPresenceType === 2) { cls = 'ingame'; col = 'rgb(2,183,87)'; }
            else if (presence.userPresenceType === 3) { cls = 'ingame'; col = 'rgb(246,136,2)'; }
            if (cls) {
                var dot = document.createElement('span');
                dot.className = cls + ' avatar-status';
                dot.style.position = 'absolute';
                dot.style.bottom = '0px';
                dot.style.right = '0px';
                dot.style.width = '12px';
                dot.style.height = '12px';
                dot.style.backgroundColor = col;
                dot.style.borderRadius = '50%';
                dot.style.border = '2px solid var(--color-surface-100, #232527)';
                thumbWrap.appendChild(dot);
            }
        }

        var info = document.createElement('div');
        info.style.display = 'flex';
        info.style.flexDirection = 'column';
        info.style.justifyContent = 'center';
        info.style.overflow = 'hidden';
        info.style.width = '100%';

        var dn = document.createElement('div');
        dn.className = 'game-card-name';
        dn.title = user.displayName || user.name || '';
        dn.style.fontSize = '16px';
        dn.style.fontWeight = '500';
        dn.style.whiteSpace = 'nowrap';
        dn.style.overflow = 'hidden';
        dn.style.textOverflow = 'ellipsis';
        dn.style.display = 'flex';
        dn.style.alignItems = 'center';
        var dnSpan = document.createElement('span');
        dnSpan.textContent = user.displayName || user.name || '';
        dnSpan.style.whiteSpace = 'nowrap';
        dnSpan.style.overflow = 'hidden';
        dnSpan.style.textOverflow = 'ellipsis';
        dn.appendChild(dnSpan);
        if (user.hasVerifiedBadge) {
            var bdg = document.createElement('span');
            bdg.textContent = ' \u2713';
            bdg.title = 'Verified';
            bdg.style.marginLeft = '5px';
            bdg.style.flexShrink = '0';
            bdg.style.color = 'rgb(0,162,255)';
            bdg.style.fontSize = '12px';
            dn.appendChild(bdg);
        }

        var sec = document.createElement('div');
        sec.className = 'game-card-info';
        sec.style.fontSize = '12px';
        sec.style.color = 'var(--color-content-muted, #8a8e91)';
        sec.style.whiteSpace = 'nowrap';
        sec.style.overflow = 'hidden';
        sec.style.textOverflow = 'ellipsis';
        var statusText = '@' + (user.name || '');
        var ps = formatPresenceStatus(presence);
        if (ps) statusText = ps;
        else if (isFriend) statusText = '@' + (user.name || '') + ' \u00B7 Friend';
        sec.textContent = statusText;

        info.appendChild(dn);
        info.appendChild(sec);
        link.appendChild(thumbWrap);
        link.appendChild(info);
        row.appendChild(link);

        if (presence && presence.userPresenceType === 2 && presence.gameId) {
            var btns = document.createElement('div');
            btns.style.display = 'flex';
            btns.style.gap = '6px';
            btns.style.alignItems = 'center';
            btns.style.flexShrink = '0';
            btns.style.paddingRight = '12px';
            var play = document.createElement('button');
            play.type = 'button';
            play.setAttribute('aria-label', isFriend ? 'Join friend' : 'Join game');
            play.innerHTML = '<span class="icon-common-play" style="width:30px;height:30px;display:inline-block;"></span>';
            play.style.backgroundColor = 'var(--purpura-playButton, #7c3aed)';
            play.style.border = 'none';
            play.style.borderRadius = '8px';
            play.style.width = '36px';
            play.style.height = '36px';
            play.style.cursor = 'pointer';
            play.style.display = 'flex';
            play.style.alignItems = 'center';
            play.style.justifyContent = 'center';
            play.style.flexShrink = '0';
            play.onmousedown = function (ev) { ev.preventDefault(); ev.stopPropagation(); };
            play.onclick = function (ev) {
                ev.preventDefault(); ev.stopPropagation();
                if (isFriend) followUserFn(user.id);
                else launchGame(presence.rootPlaceId, presence.gameId);
            };
            btns.appendChild(play);
            row.appendChild(btns);
        }

        li.appendChild(row);
        return li;
    }

    function createGameLi(game, thumbUrl, playerCount, voteRatio, totalVotes) {
        var li = document.createElement('li');
        li.className = 'navbar-search-option rbx-clickable-li improved-search ' + RESULT_CLASS;
        var row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.padding = '6px 0px';
        row.style.gap = '12px';
        row.style.maxHeight = '56px';

        var link = document.createElement('a');
        link.className = 'new-navbar-search-anchor';
        link.href = 'https://www.roblox.com/games/' + game.rootPlaceId + '/';
        link.style.display = 'flex';
        link.style.alignItems = 'center';
        link.style.gap = '12px';
        link.style.flex = '1';
        link.style.minWidth = '0';
        link.style.textDecoration = 'none';
        link.style.color = 'inherit';

        var tWrap = document.createElement('span');
        tWrap.className = 'thumbnail-2d-container';
        tWrap.style.height = '48px';
        tWrap.style.width = '48px';
        tWrap.style.borderRadius = '8px';
        tWrap.style.flexShrink = '0';
        tWrap.style.display = 'block';
        tWrap.style.overflow = 'hidden';
        if (thumbUrl) {
            var gi = document.createElement('img');
            gi.src = thumbUrl;
            gi.alt = game.name || '';
            gi.style.height = '100%';
            gi.style.width = '100%';
            gi.style.borderRadius = '8px';
            gi.style.objectFit = 'cover';
            tWrap.appendChild(gi);
        } else {
            var sh2 = document.createElement('span');
            sh2.className = 'thumbnail-2d-container shimmer';
            sh2.style.display = 'block';
            sh2.style.height = '100%';
            sh2.style.width = '100%';
            sh2.style.borderRadius = '8px';
            tWrap.appendChild(sh2);
        }

        var col = document.createElement('div');
        col.style.display = 'flex';
        col.style.flexDirection = 'column';
        col.style.justifyContent = 'center';
        col.style.overflow = 'hidden';
        col.style.width = '100%';

        var nameEl = document.createElement('div');
        nameEl.className = 'game-card-name';
        nameEl.title = game.name || '';
        nameEl.textContent = game.name || '';
        nameEl.style.fontSize = '16px';
        nameEl.style.fontWeight = '500';
        nameEl.style.whiteSpace = 'nowrap';
        nameEl.style.overflow = 'hidden';
        nameEl.style.textOverflow = 'ellipsis';

        var statsEl = document.createElement('div');
        statsEl.className = 'game-card-info';
        statsEl.style.display = 'flex';
        statsEl.style.alignItems = 'center';
        statsEl.style.gap = '4px';
        statsEl.style.marginTop = '4px';
        statsEl.style.fontSize = '12px';
        if (playerCount == null || totalVotes == null) {
            var shimmer = document.createElement('span');
            shimmer.className = 'thumbnail-2d-container shimmer';
            shimmer.style.display = 'block';
            shimmer.style.width = '115px';
            shimmer.style.height = '12px';
            shimmer.style.borderRadius = '4px';
            statsEl.appendChild(shimmer);
        } else {
            var likeIcon = document.createElement('span');
            likeIcon.className = 'info-label icon-votes-gray';
            statsEl.appendChild(likeIcon);
            var pct = document.createElement('span');
            pct.className = 'info-label vote-percentage-label';
            pct.textContent = voteRatio + '%';
            pct.style.marginLeft = '2px';
            statsEl.appendChild(pct);
            var playIcon = document.createElement('span');
            playIcon.className = 'info-label icon-playing-counts-gray';
            playIcon.style.marginLeft = '8px';
            statsEl.appendChild(playIcon);
            var pc = document.createElement('span');
            pc.className = 'info-label playing-counts-label';
            pc.textContent = playerCount;
            pc.style.marginLeft = '2px';
            statsEl.appendChild(pc);
        }

        col.appendChild(nameEl);
        col.appendChild(statsEl);
        link.appendChild(tWrap);
        link.appendChild(col);
        row.appendChild(link);

        var rightBtns = document.createElement('div');
        rightBtns.style.display = 'flex';
        rightBtns.style.gap = '6px';
        rightBtns.style.alignItems = 'center';
        rightBtns.style.flexShrink = '0';
        rightBtns.style.paddingRight = '12px';

        rightBtns.className = 'purpura-es-qp-buttons';
        rightBtns.style.display = (quickPlayEnabled && getGameSearchEnabled()) ? 'flex' : 'none';
        var playGame = document.createElement('button');
        playGame.type = 'button';
        playGame.className = 'purpura-qp-btn purpura-qp-play';
        playGame.setAttribute('aria-label', 'Play');
        playGame.innerHTML = '<span class="icon-common-play" style="width:30px;height:30px;display:inline-block;"></span>';
        playGame.style.backgroundColor = 'var(--purpura-playButton, #7c3aed)';
        playGame.style.border = 'none';
        playGame.style.borderRadius = '8px';
        playGame.style.width = '36px';
        playGame.style.height = '36px';
        playGame.style.cursor = 'pointer';
        playGame.style.display = 'flex';
        playGame.style.alignItems = 'center';
        playGame.style.justifyContent = 'center';
        playGame.style.flexShrink = '0';
        playGame.style.color = '#fff';
        playGame.onmousedown = function (ev) { ev.preventDefault(); ev.stopPropagation(); };
        playGame.onclick = function (ev) {
            ev.preventDefault(); ev.stopPropagation();
            launchGame(game.rootPlaceId);
        };
        var serversBtn = document.createElement('button');
        serversBtn.type = 'button';
        serversBtn.className = 'purpura-qp-btn purpura-qp-servers';
        serversBtn.setAttribute('aria-label', 'Servers');
        serversBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>';
        serversBtn.style.backgroundColor = '#6d28d9';
        serversBtn.style.border = 'none';
        serversBtn.style.borderRadius = '8px';
        serversBtn.style.width = '36px';
        serversBtn.style.height = '36px';
        serversBtn.style.cursor = 'pointer';
        serversBtn.style.display = 'flex';
        serversBtn.style.alignItems = 'center';
        serversBtn.style.justifyContent = 'center';
        serversBtn.style.flexShrink = '0';
        serversBtn.style.color = '#fff';
        serversBtn.onmousedown = function (ev) { ev.preventDefault(); ev.stopPropagation(); };
        serversBtn.onclick = function (ev) {
            ev.preventDefault(); ev.stopPropagation();
            showPrivateServerOverlayForSearch(serversBtn, game.rootPlaceId);
        };
        rightBtns.appendChild(playGame);
        rightBtns.appendChild(serversBtn);
        row.appendChild(rightBtns);
        li.appendChild(row);
        return li;
    }

    function hasExternalItems(menu) {
        if (!menu) return false;
        var items = menu.querySelectorAll('li.navbar-search-option');
        for (var i = 0; i < items.length; i++) {
            var el = items[i];
            if (el.classList.contains(RESULT_CLASS)) continue;
            var extra = false;
            for (var j = 0; j < el.classList.length; j++) {
                var c = el.classList[j];
                if (c !== 'navbar-search-option' && c !== 'rbx-clickable-li' && c !== 'new-selected' && c !== 'improved-search') { extra = true; break; }
            }
            if (extra) return true;
        }
        return false;
    }

    function syncSelection() {
        var menu = getMenu();
        if (!menu) return;
        var items = Array.prototype.slice.call(menu.querySelectorAll('li.navbar-search-option'));
        if (!items.length) return;
        if (hasExternalItems(menu)) {
            selectedIndex = 0;
            var injected = menu.querySelectorAll('.' + RESULT_CLASS);
            for (var k = 0; k < injected.length; k++) injected[k].classList.toggle('new-selected', k === 0);
            return;
        }
        if (selectedIndex < 0) selectedIndex = items.length - 1;
        if (selectedIndex >= items.length) selectedIndex = 0;
        for (var t = 0; t < items.length; t++) items[t].classList.toggle('new-selected', t === selectedIndex);
    }

    function injectMenu(reset) {
        var menu = getMenu();
        if (!menu) return;
        menu.querySelectorAll('.' + RESULT_CLASS).forEach(function (el) { el.remove(); });
        if (window._purpuraLastGameResult) menu.prepend(window._purpuraLastGameResult);
        if (window._purpuraLastFriendResults && window._purpuraLastFriendResults.length) {
            var fr = window._purpuraLastFriendResults.slice().reverse();
            for (var i = 0; i < fr.length; i++) menu.prepend(fr[i]);
        }
        if (window._purpuraLastUserResult) menu.prepend(window._purpuraLastUserResult);
        if (reset) selectedIndex = 0;
        syncSelection();
    }

    function injectExisting() {
        var menu = getMenu();
        if (!menu || menu.querySelector('.' + RESULT_CLASS)) return;
        if (window._purpuraLastGameResult) menu.prepend(window._purpuraLastGameResult);
        if (window._purpuraLastFriendResults && window._purpuraLastFriendResults.length) {
            var fr = window._purpuraLastFriendResults.slice().reverse();
            for (var r = 0; r < fr.length; r++) menu.prepend(fr[r]);
        }
        if (window._purpuraLastUserResult) menu.prepend(window._purpuraLastUserResult);
        syncSelection();
    }

    function clearMenu() {
        var menu = getMenu();
        if (!menu) return;
        menu.querySelectorAll('.' + RESULT_CLASS).forEach(function (el) { el.remove(); });
        syncSelection();
    }

    function fetchAuthedFriends(query, signal) {
        var q = (query || '').toLowerCase();
        if (!q) return Promise.resolve([]);
        return new Promise(function (resolve) {
            chrome.storage.local.get(['purpura_friends_cache', 'purpura_friends_cache_time'], function (res) {
                var now = Date.now();
                var cached = res.purpura_friends_cache;
                var ct = res.purpura_friends_cache_time || 0;
                var fresh = cached && Array.isArray(cached) && (now - ct < 300000);
                if (fresh) {
                    var out = [];
                    for (var i = 0; i < cached.length && out.length < 5; i++) {
                        var f = cached[i];
                        var u = (f.username || f.name || '').toLowerCase();
                        var d = (f.displayName || f.combinedName || '').toLowerCase();
                        var c = (f.combinedName || '').toLowerCase();
                        if (u.indexOf(q) !== -1 || d.indexOf(q) !== -1 || c.indexOf(q) !== -1) out.push(f);
                    }
                    resolve(out);
                    return;
                }
                var authedId = null;
                try {
                    var meta = document.querySelector('meta[name="user-data"]');
                    authedId = meta ? meta.getAttribute('data-userid') : null;
                } catch (e2) {}
                authedId = authedId ? String(authedId) : '';
                if (!authedId || authedId === '0') { resolve([]); return; }
                if (signal && signal.aborted) { resolve([]); return; }
                fetch('https://friends.roblox.com/v1/users/' + encodeURIComponent(authedId) + '/friends?limit=100&sortOrder=Asc', { credentials: 'include', signal: signal }).then(function (r) {
                    if (!r.ok) throw new Error('friends ' + r.status);
                    return r.json();
                }).then(function (j) {
                    var list = (j && j.data) ? j.data : [];
                    var mapped = [];
                    for (var k = 0; k < list.length; k++) {
                        var u2 = list[k];
                        mapped.push({ id: u2.id, username: u2.name, name: u2.name, displayName: u2.displayName, combinedName: u2.displayName, hasVerifiedBadge: !!u2.hasVerifiedBadge, isBanned: false });
                    }
                    try { chrome.storage.local.set({ purpura_friends_cache: mapped, purpura_friends_cache_time: Date.now() }); } catch (e3) {}
                    var out2 = [];
                    for (var m = 0; m < mapped.length && out2.length < 5; m++) {
                        var fm = mapped[m];
                        var uu = (fm.username || '').toLowerCase();
                        var dd = (fm.displayName || '').toLowerCase();
                        if (uu.indexOf(q) !== -1 || dd.indexOf(q) !== -1) out2.push(fm);
                    }
                    resolve(out2);
                }).catch(function () { resolve([]); });
            });
        });
    }

    function performUserSearch(query, req) {
        if (userController) try { userController.abort(); } catch (e3) {}
        userController = new AbortController();
        var signal = userController.signal;
        var userData = null;
        var didUser = false;

        function finishUser() {
            if (didUser) return;
            didUser = true;
            req.userDone = true;
            commit(req);
        }

        var doUserExact = getUserSearchEnabled();
        var doFriends = getFriendSearchEnabled();
        if (!doUserExact) {
            setResult(req, 'userResult', null);
            finishUser();
        }
        if (doUserExact) {
            fetchJson('users', '/v1/usernames/users', { method: 'POST', body: { usernames: [query], excludeBannedUsers: false }, signal: signal, retries: 2 }).then(function (j) {
                if (!isCurrent(req, signal)) return;
                userData = j && j.data && j.data[0] ? j.data[0] : null;
                if (userData) {
                    setResult(req, 'userResult', createUserLi({ id: userData.id, name: userData.name, displayName: userData.displayName, hasVerifiedBadge: !!userData.hasVerifiedBadge, isBanned: false }, null, null, false));
                } else {
                    setResult(req, 'userResult', null);
                }
                finishUser();
                if (userData) {
                    Promise.all([
                        fetchThumbnails([{ id: userData.id }], 'AvatarHeadshot', '48x48', signal),
                        fetchJson('presence', '/v1/presence/users', { method: 'POST', body: { userIds: [userData.id] }, signal: signal, retries: 2 }).catch(function () { return null; })
                    ]).then(function (arr) {
                        if (!isCurrent(req, signal)) return;
                        var tmap = arr[0];
                        var pres = arr[1] && arr[1].userPresences ? arr[1].userPresences[0] : null;
                        setResult(req, 'userResult', createUserLi({ id: userData.id, name: userData.name, displayName: userData.displayName, hasVerifiedBadge: !!userData.hasVerifiedBadge, isBanned: false }, tmap.get(Number(userData.id)) || null, pres, false));
                        if (req.committed) injectMenu();
                    }).catch(function () {});
                }
                setTimeout(function () {
                    if (!doFriends) { setResult(req, 'friendResults', []); if (req.committed) injectMenu(); return; }
                    fetchAuthedFriends(query, signal).then(function (friends) {
                    if (!isCurrent(req, signal) || !friends.length) {
                        if (!friends.length) { setResult(req, 'friendResults', []); if (req.committed) injectMenu(); }
                        return;
                    }
                    var valid = friends.map(function (f) {
                        return { id: f.id, name: f.username, displayName: f.combinedName || f.displayName, hasVerifiedBadge: !!f.isVerified, isBanned: !!f.isDeleted };
                    });
                    fetchThumbnails(valid.map(function (u) { return { id: u.id }; }), 'AvatarHeadshot', '48x48', signal).then(function (tmap2) {
                        if (!isCurrent(req, signal)) return;
                        var curUser = getResult(req, 'userResult');
                        var curId = curUser && curUser.dataset ? curUser.dataset.userId : null;
                        var lis = [];
                        for (var i = 0; i < valid.length; i++) {
                            var fu = valid[i];
                            if (curId && String(curId) === String(fu.id)) continue;
                            lis.push(createUserLi(fu, tmap2.get(Number(fu.id)) || null, null, true));
                        }
                        setResult(req, 'friendResults', lis);
                        fetchJson('presence', '/v1/presence/users', { method: 'POST', body: { userIds: valid.map(function (u) { return u.id; }) }, signal: signal, retries: 2 }).then(function (pd) {
                            if (!isCurrent(req, signal)) return;
                            var pmap = new Map();
                            (pd && pd.userPresences || []).forEach(function (p) { pmap.set(p.userId, p); });
                            var cur2 = getResult(req, 'userResult');
                            var curId2 = cur2 && cur2.dataset ? cur2.dataset.userId : null;
                            var lis2 = [];
                            for (var j = 0; j < valid.length; j++) {
                                var fu2 = valid[j];
                                if (curId2 && String(curId2) === String(fu2.id)) continue;
                                lis2.push(createUserLi(fu2, tmap2.get(Number(fu2.id)) || null, pmap.get(Number(fu2.id)) || null, true));
                            }
                            setResult(req, 'friendResults', lis2);
                            if (req.committed) injectMenu();
                        }).catch(function () {});
                        if (req.committed) injectMenu();
                    }).catch(function () {
                        setResult(req, 'friendResults', []);
                        if (req.committed) injectMenu();
                    });
                }).catch(function () {
                    setResult(req, 'friendResults', []);
                    if (req.committed) injectMenu();
                });
            }, 0);
            }).catch(function (e) {
                if (e && e.name === 'AbortError') return;
                if (isCurrent(req, signal)) { setResult(req, 'userResult', null); setResult(req, 'friendResults', []); finishUser(); }
            });
            }
            if (!doUserExact && doFriends) {
                finishUser();
                fetchAuthedFriends(query, signal).then(function (friends) {
                    if (!isCurrent(req, signal) || !friends.length) {
                        if (!friends.length) { setResult(req, 'friendResults', []); if (req.committed) injectMenu(); }
                        return;
                    }
                    var valid = friends.map(function (f) {
                        return { id: f.id, name: f.username, displayName: f.combinedName || f.displayName, hasVerifiedBadge: !!f.isVerified, isBanned: !!f.isDeleted };
                    });
                    fetchThumbnails(valid.map(function (u) { return { id: u.id }; }), 'AvatarHeadshot', '48x48', signal).then(function (tmap2) {
                        if (!isCurrent(req, signal)) return;
                        var curUser = getResult(req, 'userResult');
                        var curId = curUser && curUser.dataset ? curUser.dataset.userId : null;
                        var lis = [];
                        for (var i = 0; i < valid.length; i++) {
                            var fu = valid[i];
                            if (curId && String(curId) === String(fu.id)) continue;
                            lis.push(createUserLi(fu, tmap2.get(Number(fu.id)) || null, null, true));
                        }
                        setResult(req, 'friendResults', lis);
                        fetchJson('presence', '/v1/presence/users', { method: 'POST', body: { userIds: valid.map(function (u) { return u.id; }) }, signal: signal, retries: 2 }).then(function (pd) {
                            if (!isCurrent(req, signal)) return;
                            var pmap = new Map();
                            (pd && pd.userPresences || []).forEach(function (pp) { pmap.set(pp.userId, pp); });
                            var cur2 = getResult(req, 'userResult');
                            var curId2 = cur2 && cur2.dataset ? cur2.dataset.userId : null;
                            var lis2 = [];
                            for (var j = 0; j < valid.length; j++) {
                                var fu2 = valid[j];
                                if (curId2 && String(curId2) === String(fu2.id)) continue;
                                lis2.push(createUserLi(fu2, tmap2.get(Number(fu2.id)) || null, pmap.get(Number(fu2.id)) || null, true));
                            }
                            setResult(req, 'friendResults', lis2);
                            if (req.committed) injectMenu();
                        }).catch(function () {});
                        if (req.committed) injectMenu();
                    }).catch(function () {
                        setResult(req, 'friendResults', []);
                        if (req.committed) injectMenu();
                    });
                }).catch(function () {
                    setResult(req, 'friendResults', []);
                    if (req.committed) injectMenu();
                });
            } else if (!doUserExact) {
                setResult(req, 'friendResults', []);
                if (req.committed) injectMenu();
            }
    }

    function performGameSearch(query, req) {
        if (!getGameSearchEnabled()) { setResult(req, 'gameResult', null); req.gameDone = true; commit(req); return; }
        if (gameController) try { gameController.abort(); } catch (e4) {}
        gameController = new AbortController();
        var signal = gameController.signal;
        var authedId = null;
        try {
            var m = document.querySelector('meta[name="user-data"]');
            authedId = m ? (m.getAttribute('data-userid') || '0') : '0';
        } catch (e5) { authedId = '0'; }
        fetchJson('apis', '/search-api/omni-search?searchQuery=' + encodeURIComponent(query) + '&sessionid=' + encodeURIComponent(authedId || '0') + '&pageType=Game', { signal: signal, retries: 2 }).then(function (j) {
            if (!isCurrent(req, signal)) return;
            var group = j && j.searchResults ? j.searchResults.find(function (r) { return r.contentGroupType === 'Game' && r.contents && r.contents.length; }) : null;
            if (!group) { setResult(req, 'gameResult', null); req.gameDone = true; commit(req); return; }
            var game = group.contents[0];
            setResult(req, 'gameResult', createGameLi(game, null, null, null, null));
            req.gameDone = true;
            commit(req);
            setTimeout(function () {
                Promise.all([
                    fetchThumbnails([{ id: game.universeId }], 'GameIcon', '50x50', signal),
                    fetchJson('games', '/v1/games/votes?universeIds=' + game.universeId, { signal: signal, retries: 2 }).catch(function () { return null; })
                ]).then(function (arr2) {
                    if (!isCurrent(req, signal)) return;
                    var tmap = arr2[0];
                    var vj = arr2[1];
                    var v = vj && vj.data && vj.data[0] ? vj.data[0] : { upVotes: 0, downVotes: 0 };
                    var total = (v.upVotes || 0) + (v.downVotes || 0);
                    var ratio = total ? Math.floor((v.upVotes / total) * 100) : 0;
                    var thumb = tmap.get(Number(game.universeId));
                    var url2 = thumb && thumb.imageUrl ? thumb.imageUrl : '';
                    setResult(req, 'gameResult', createGameLi(game, url2, formatCount(game.playerCount || 0), ratio, total));
                    if (req.committed) injectMenu();
                }).catch(function () {});
            }, 0);
        }).catch(function (e) {
            if (e && e.name === 'AbortError') return;
            if (isCurrent(req, signal)) { setResult(req, 'gameResult', null); req.gameDone = true; commit(req); }
        });
    }

    function onSlashKey(e) {
        if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
        if (isTypingContext()) return;
        if (!getEnabled() || !focusKeyEnabled) return;
        e.preventDefault();
        focusSearchBox();
    }

    function initSearch() {
        quickPlayEnabled = getQuickPlayEnabled();
        focusKeyEnabled = getFocusKeyEnabled();
        ensureEsStyles();
        ensureEsPrivateDropdown();
        var debGame = debounce(function (q, r) { performGameSearch(q, r); }, 300);
        var debUser = debounce(function (q, r) { performUserSearch(q, r); }, 100);

        function waitInput() {
            var input = findSearchInput();
            if (!input) {
                if (seekTimer) return;
                seekTimer = setInterval(function () {
                    var inp2 = findSearchInput();
                    if (inp2) { clearInterval(seekTimer); seekTimer = 0; waitInput(); }
                }, 400);
                return;
            }
            var trigger = function (force) {
                if (!getEnabled()) return;
                var cur = (input.value || '').trim();
                if (!force && cur === lastQuery) return;
                if (force && cur === lastQuery && (window._purpuraLastUserResult || window._purpuraLastGameResult || (window._purpuraLastFriendResults && window._purpuraLastFriendResults.length))) {
                    injectExisting();
                    return;
                }
                lastQuery = cur;
                if (userController) try { userController.abort('new'); } catch (e6) {}
                if (gameController) try { gameController.abort('new'); } catch (e7) {}
                if (cur.length < 1) {
                    activeReq = null; committedReq = null; selectedIndex = 0;
                    window._purpuraLastUserResult = null;
                    window._purpuraLastGameResult = null;
                    window._purpuraLastFriendResults = [];
                    injectMenu(true);
                    return;
                }
                var req = makeRequest(cur);
                activeReq = req;
                var doUser = getUserSearchEnabled() || getFriendSearchEnabled();
                var doGame = getGameSearchEnabled();
                if (doUser) debUser(cur, req);
                else { req.userDone = true; setResult(req, 'userResult', null); setResult(req, 'friendResults', []); }
                if (doGame) {
                    if (cur.length >= 2) debGame(cur, req);
                    else { req.gameDone = true; commit(req); }
                } else {
                    setResult(req, 'gameResult', null);
                    req.gameDone = true;
                    commit(req);
                }
            };

            input.addEventListener('input', function () { trigger(false); });
            input.addEventListener('focus', function () { trigger(true); });
            input.addEventListener('keydown', function (e) {
                if (!getEnabled()) return;
                var menu = getMenu();
                var vis = menu && (menu.offsetParent !== null || menu.classList.contains('show'));
                if (hasExternalItems(menu)) return;
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Tab') {
                    if (!vis) return;
                    var items = menu.querySelectorAll('li.navbar-search-option');
                    if (!items.length) return;
                    e.preventDefault(); e.stopImmediatePropagation();
                    if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) selectedIndex++;
                    else selectedIndex--;
                    syncSelection();
                } else if (e.key === 'Enter') {
                    if (!vis) return;
                    var sel = menu.querySelector('li.navbar-search-option.new-selected');
                    if (sel) {
                        var a = sel.querySelector('a');
                        if (a && a.href) {
                            e.preventDefault(); e.stopImmediatePropagation(); e.stopPropagation();
                            a.click();
                            if (window.location.href !== a.href) window.location.href = a.href;
                        }
                    }
                }
            });
            input.addEventListener('keyup', function (e) {
                if (!getEnabled() || e.key !== 'Enter') return;
                var menu = getMenu();
                var vis2 = menu && (menu.offsetParent !== null || menu.classList.contains('show'));
                if (vis2 && hasExternalItems(menu)) return;
                var handled = false;
                if (vis2) {
                    var sel2 = menu.querySelector('li.navbar-search-option.new-selected');
                    if (sel2) {
                        var a2 = sel2.querySelector('a');
                        if (a2) { handled = true; }
                    }
                }
                if (!handled) {
                    var v = input.value || '';
                    if (v.trim().length) {
                    }
                }
            }, true);

            var moTarget = getMenu();
            if (moTarget) {
                var obs = new MutationObserver(function (muts) {
                    for (var i = 0; i < muts.length; i++) {
                        var mt = muts[i];
                        if (mt.type !== 'attributes' || mt.attributeName !== 'class') continue;
                        var t2 = mt.target;
                        if (!t2.classList.contains('navbar-search-option') || !t2.classList.contains(RESULT_CLASS)) continue;
                        var items2 = Array.prototype.slice.call(moTarget.querySelectorAll('li.navbar-search-option'));
                        var idx = items2.indexOf(t2);
                        if (idx === -1) continue;
                        if (idx === selectedIndex && !t2.classList.contains('new-selected')) t2.classList.add('new-selected');
                        if (idx !== selectedIndex && t2.classList.contains('new-selected')) t2.classList.remove('new-selected');
                    }
                });
                obs.observe(moTarget, { attributes: true, subtree: true, attributeFilter: ['class'] });
            }

            var pollMenu = setInterval(function () {
                var mm = getMenu();
                if (mm && !mm.__purpuraMenuObserved) {
                    mm.__purpuraMenuObserved = true;
                    if (getEnabled()) injectExisting();
                    var mo2 = new MutationObserver(function (muts2) {
                        for (var p = 0; p < muts2.length; p++) {
                            var mt2 = muts2[p];
                            if (mt2.type !== 'attributes' || mt2.attributeName !== 'class') continue;
                            var t3 = mt2.target;
                            if (!t3.classList || !t3.classList.contains('navbar-search-option') || !t3.classList.contains(RESULT_CLASS)) continue;
                            var all2 = Array.prototype.slice.call(mm.querySelectorAll('li.navbar-search-option'));
                            var idx2 = all2.indexOf(t3);
                            if (idx2 === -1) continue;
                            if (idx2 === selectedIndex && !t3.classList.contains('new-selected')) t3.classList.add('new-selected');
                            if (idx2 !== selectedIndex && t3.classList.contains('new-selected')) t3.classList.remove('new-selected');
                        }
                    });
                    mo2.observe(mm, { attributes: true, subtree: true, attributeFilter: ['class'] });
                }
            }, 500);
            setTimeout(function () { clearInterval(pollMenu); }, 30000);
        }

        waitInput();
    }

    document.addEventListener('keydown', onSlashKey, true);

    function onStorageChange(changes, area) {
        if (area !== 'sync') return;
        if (changes[STORAGE_KEY]) {
            var nv = changes[STORAGE_KEY].newValue;
            var on = false;
            if (nv === true) on = true;
            else if (nv && typeof nv === 'object') on = nv.enabled === true;
            if (!on) {
                lastQuery = '';
                activeReq = null; committedReq = null;
                window._purpuraLastUserResult = null;
                window._purpuraLastGameResult = null;
                window._purpuraLastFriendResults = [];
                clearMenu();
            } else {
                var ov = changes[STORAGE_KEY].oldValue;
                if (ov === true) ov = { enabled: true, userSearch: true, gameSearch: true, friendSearch: true, focusKey: true };
                if (ov === false || ov == null || typeof ov !== 'object') ov = { enabled: false, userSearch: true, gameSearch: true, friendSearch: true, focusKey: true };
                if (nv === true) nv = { enabled: true, userSearch: true, gameSearch: true, friendSearch: true, focusKey: true };
                var nvUser = nv.userSearch !== false;
                var ovUser = ov.userSearch !== false;
                var nvFriend = nv.friendSearch !== false;
                var ovFriend = ov.friendSearch !== false;
                var nvGame = nv.gameSearch !== false;
                var ovGame = ov.gameSearch !== false;
                if (!nvUser && ovUser) { window._purpuraLastUserResult = null; clearMenu(); if (userController) try { userController.abort(); } catch(e9) {} }
                if (!nvFriend && ovFriend) { window._purpuraLastFriendResults = []; clearMenu(); if (userController) try { userController.abort(); } catch(e10) {} }
                if (!nvGame && ovGame) {
                    window._purpuraLastGameResult = null;
                    clearMenu();
                    if (gameController) try { gameController.abort(); } catch(e8) {}
                    activeReq = null; committedReq = null;
                    var preQp = document.querySelectorAll('.purpura-es-qp-buttons');
                    for (var pq = 0; pq < preQp.length; pq++) preQp[pq].style.display = 'none';
                    if (esDropdown) esDropdown.classList.remove('visible');
                }
                if ((nvUser && !ovUser) || (nvFriend && !ovFriend) || (nvGame && !ovGame)) {
                    if (lastQuery) {
                        var curInput = findSearchInput();
                        if (curInput && (curInput.value || '').trim() === lastQuery) {
                            var req2 = makeRequest(lastQuery);
                            activeReq = req2;
                            var doU2 = getUserSearchEnabled() || getFriendSearchEnabled();
                            var doG2 = getGameSearchEnabled();
                            if (doU2) performUserSearch(lastQuery, req2);
                            else { req2.userDone = true; setResult(req2, 'userResult', null); setResult(req2, 'friendResults', []); }
                            if (doG2) { if (lastQuery.length >= 2) performGameSearch(lastQuery, req2); else { req2.gameDone = true; commit(req2); } }
                            else { setResult(req2, 'gameResult', null); req2.gameDone = true; commit(req2); }
                        }
                    }
                }
                if (ovGame !== nvGame && window._purpuraLastGameResult) {
                    var qpWrap = window._purpuraLastGameResult.querySelector('.purpura-es-qp-buttons');
                    if (qpWrap) qpWrap.style.display = (quickPlayEnabled && nvGame) ? 'flex' : 'none';
                    if (committedReq) injectMenu();
                }
                var nvFocus = nv.focusKey !== false;
                var ovFocus = ov.focusKey !== false;
                if (nvFocus !== ovFocus) {
                    focusKeyEnabled = nvFocus;
                }
            }
        }
        if (changes['qp']) {
            quickPlayEnabled = changes['qp'].newValue === true || (changes['qp'].newValue && typeof changes['qp'].newValue === 'object' && changes['qp'].newValue.enabled === true);
            if (window._purpuraLastGameResult) {
                var qpWrap2 = window._purpuraLastGameResult.querySelector('.purpura-es-qp-buttons');
                var showQP2 = quickPlayEnabled && getGameSearchEnabled();
                if (qpWrap2) qpWrap2.style.display = showQP2 ? 'flex' : 'none';
                if (committedReq) injectMenu();
            }
        }
    }

    window.__PurpuraSettings.ready.then(function () {
        chrome.storage.onChanged.addListener(onStorageChange);
        quickPlayEnabled = getQuickPlayEnabled();
        focusKeyEnabled = getFocusKeyEnabled();
        ensureEsStyles();
        initSearch();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            if (window.__PurpuraSettings && window.__PurpuraSettings.ready) return;
            setTimeout(function () {
                if (getEnabled()) initSearch();
            }, 800);
        }, { once: true });
    }
})();
