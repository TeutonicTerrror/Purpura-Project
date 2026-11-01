/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';

    if (window.__purpuraPlayerFinderInitialized) return;
    window.__purpuraPlayerFinderInitialized = true;

    const STORAGE_KEY = 'pf';
    const BAR_ID = 'purpura-pf-bar';
    const STYLE_ID = 'purpura-pf-style';
    const MATCH_CLASS = 'purpura-pf-match';
    const MATCH_BADGE_ID = 'purpura-pf-match-badge';
    const PLAYER_TOKEN_LIMIT = 100;
    const PAGE_DELAY_MS = 350;
    const SORT_ORDERS = ['Desc', 'Asc'];
    const MAX_PAGES_PER_SORT = 12;
    const MAX_SCAN_MS = 60000;
    const PROFILE_URL = 'https://www.roblox.com/users/';
    const GAME_URL = 'https://www.roblox.com/games/';
    const PLACEHOLDER_LOCATIONS = ['roblox', 'website', 'playing'];

    const t = (key, fallback) => chrome.i18n.getMessage(key) || fallback;
    const fill = (text, values) => String(text).replace(/\{(\w+)\}/g, (match, key) =>
        Object.prototype.hasOwnProperty.call(values || {}, key) ? String(values[key]) : match
    );

    let enabled = false;
    let mountScheduled = false;
    let activeRun = null;
    let lastPlaceId = null;
    let bridgeState = 'unknown';

    function placeId() {
        const match = window.location.pathname.match(/^\/games\/(\d+)/);
        return match ? match[1] : null;
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function avatarHash(url) {
        const match = String(url || '').match(/([0-9a-f]{32})/i);
        return match ? match[1].toLowerCase() : '';
    }

    function pageFetch(url, options) {
        if (bridgeState === 'dead') return Promise.resolve(null);
        return new Promise(resolve => {
            const callbackId = 'purpura-pf-' + Date.now() + '-' + Math.random().toString(36).slice(2);
            let settled = false;
            const finish = value => {
                if (settled) return;
                settled = true;
                document.removeEventListener('purpura-fetch-response', onResponse);
                clearTimeout(timer);
                resolve(value);
            };
            const onResponse = event => {
                const detail = event && event.detail;
                if (!detail || detail.callbackId !== callbackId) return;
                bridgeState = 'ready';
                finish(detail.response && detail.response.final ? detail.response.final : null);
            };
            const timer = setTimeout(() => {
                if (bridgeState === 'unknown') bridgeState = 'dead';
                finish(null);
            }, bridgeState === 'unknown' ? 5000 : 9000);
            document.addEventListener('purpura-fetch-response', onResponse);
            document.dispatchEvent(new CustomEvent('purpura-fetch-request', {
                detail: { callbackId, url, options }
            }));
        });
    }

    async function requestJson(url, options) {
        const request = Object.assign({ credentials: 'include' }, options || {});
        try {
            const response = await fetch(url, request);
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            return null;
        }
    }

    async function postJson(url, body) {
        const payload = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            credentials: 'include'
        };
        const bridged = await pageFetch(url, payload);
        if (bridged && bridged.ok && bridged.bodyJson) return bridged.bodyJson;
        return requestJson(url, payload);
    }

    async function resolveUser(name) {
        const query = String(name || '').trim().replace(/^@/, '');
        if (!query) return null;
        const search = await requestJson(
            'https://users.roblox.com/v1/users/search?keyword=' + encodeURIComponent(query) + '&limit=10'
        );
        const candidates = search && Array.isArray(search.data) ? search.data : [];
        const exact = candidates.find(user => String(user.name || '').toLowerCase() === query.toLowerCase());
        if (exact) return exact;
        const listed = await postJson('https://users.roblox.com/v1/usernames/users', {
            usernames: [query],
            excludeBannedUsers: false
        });
        const found = listed && Array.isArray(listed.data) ? listed.data[0] : null;
        return found || null;
    }

    async function targetAvatar(userId) {
        const data = await requestJson(
            'https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=' + encodeURIComponent(userId) +
            '&size=150x150&format=Png&isCircular=false&returnPolicy=PlaceHolder'
        );
        const entry = data && Array.isArray(data.data) ? data.data[0] : null;
        const imageUrl = (entry && entry.imageUrl) || '';
        return { hash: avatarHash(imageUrl), imageUrl: imageUrl };
    }

    async function fetchPresence(userId) {
        const data = await postJson('https://presence.roblox.com/v1/presence/users', { userIds: [Number(userId)] });
        const entry = data && Array.isArray(data.userPresences) ? data.userPresences[0] : null;
        return entry || null;
    }

    function cleanLocation(value) {
        const text = String(value || '').trim();
        if (!text) return '';
        if (PLACEHOLDER_LOCATIONS.indexOf(text.toLowerCase()) !== -1) return '';
        return text;
    }

    async function universeIdForPlace(place) {
        if (!place) return null;
        const data = await requestJson(
            'https://apis.roblox.com/universes/v1/places/' + encodeURIComponent(place) + '/universe'
        );
        const universeId = data && Number(data.universeId);
        return Number.isFinite(universeId) && universeId > 0 ? universeId : null;
    }

    async function presenceGame(presence) {
        if (!presence) return null;
        const universeId = presence.universeId || await universeIdForPlace(presence.placeId || presence.rootPlaceId);
        if (!universeId) return null;
        const data = await requestJson(
            'https://games.roblox.com/v1/games?universeIds=' + encodeURIComponent(universeId)
        );
        const entry = data && Array.isArray(data.data) ? data.data[0] : null;
        if (!entry || !entry.name) return null;
        return {
            name: entry.name,
            placeId: entry.rootPlaceId || presence.rootPlaceId || presence.placeId || null
        };
    }

    function elsewhereSubtitle(user, game, presence) {
        const template = t('playerFinder_elsewhere', '{name} is in a different experience: {location}');
        const parts = String(template).split('{location}');
        const label = (game && game.name) || cleanLocation(presence && presence.lastLocation) ||
            t('playerFinder_someExperience', 'another experience');
        const nodes = [fill(parts[0] || '', { name: user.name })];
        if (parts.length === 1) nodes.push(' ');
        if (game && game.placeId) nodes.push({ text: label, href: GAME_URL + game.placeId + '/' });
        else nodes.push(label);
        if (parts[1]) nodes.push(fill(parts[1], { name: user.name }));
        return nodes;
    }

    async function fetchTokenThumbnails(tokens) {
        const body = tokens.map(token => ({
            requestId: token,
            type: 'AvatarHeadShot',
            token: token,
            size: '150x150',
            format: 'Png',
            isCircular: false
        }));
        const data = await postJson('https://thumbnails.roblox.com/v1/batch', body);
        if (!data || !Array.isArray(data.data)) return [];
        return data.data.map(entry => (entry && entry.imageUrl) || '');
    }

    function isCancelled(run) {
        return !run || run.cancelled;
    }

    async function scanServers(place, hash, run, onProgress) {
        const started = Date.now();
        const seen = new Set();
        let scanned = 0;
        let checked = 0;
        let withTokens = 0;

        for (const sortOrder of SORT_ORDERS) {
            let cursor = null;
            for (let page = 0; page < MAX_PAGES_PER_SORT; page += 1) {
                if (isCancelled(run) || Date.now() - started > MAX_SCAN_MS) {
                    return { aborted: true, scanned, checked, withTokens };
                }

                let url = 'https://games.roblox.com/v1/games/' + encodeURIComponent(place) +
                    '/servers/Public?sortOrder=' + sortOrder + '&excludeFullGames=false&limit=100';
                if (cursor) url += '&cursor=' + encodeURIComponent(cursor);

                const data = await requestJson(url);
                if (!data) break;
                const list = Array.isArray(data.data) ? data.data : [];

                for (const server of list) {
                    if (!server || !server.id || seen.has(server.id)) continue;
                    if (isCancelled(run)) {
                        return { aborted: true, scanned, checked, withTokens };
                    }
                    seen.add(server.id);
                    scanned += 1;

                    const tokens = Array.isArray(server.playerTokens)
                        ? server.playerTokens.filter(Boolean)
                        : [];
                    if (!tokens.length) {
                        onProgress({ scanned, checked, withTokens });
                        continue;
                    }
                    withTokens += 1;

                    for (let index = 0; index < tokens.length; index += PLAYER_TOKEN_LIMIT) {
                        if (isCancelled(run)) {
                            return { aborted: true, scanned, checked, withTokens };
                        }
                        const chunk = tokens.slice(index, index + PLAYER_TOKEN_LIMIT);
                        const images = await fetchTokenThumbnails(chunk);
                        checked += chunk.length;
                        if (images.some(url => avatarHash(url) === hash)) {
                            return {
                                match: {
                                    id: server.id,
                                    playing: typeof server.playing === 'number' ? server.playing : 0,
                                    maxPlayers: typeof server.maxPlayers === 'number' ? server.maxPlayers : 0,
                                    avatars: images.filter(Boolean)
                                },
                                scanned,
                                checked,
                                withTokens
                            };
                        }
                    }

                    onProgress({ scanned, checked, withTokens });
                }

                cursor = data.nextPageCursor || null;
                if (!cursor || !list.length) break;
                await sleep(PAGE_DELAY_MS);
            }
        }

        return { scanned, checked, withTokens };
    }

    function ensureStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            #${BAR_ID} {
                --pf-accent: var(--purpura-playButton, var(--color-action-emphasis-background, #335fff));
                box-sizing: border-box;
                width: 100%;
                margin: 0 0 10px;
                padding: 10px 12px;
                border: 1px solid var(--color-border-default, rgba(255, 255, 255, 0.12));
                border-radius: 8px;
                background: var(--color-surface-100, #232527);
                color: var(--color-content-default, #f2f2f7);
                font: inherit;
                text-align: left;
            }
            #${BAR_ID} * { box-sizing: border-box; }
            #${BAR_ID} .purpura-pf-row {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            #${BAR_ID} .purpura-pf-icon {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 16px;
                height: 16px;
                flex: 0 0 auto;
                color: var(--color-content-muted, #a3a3ad);
            }
            #${BAR_ID} .purpura-pf-input {
                flex: 1 1 auto;
                min-width: 0;
                height: 32px;
                padding: 0 10px;
                border: 1px solid var(--color-border-default, rgba(255, 255, 255, 0.14));
                border-radius: 6px;
                background: var(--color-surface-200, #1b1d21);
                color: inherit;
                font: inherit;
                font-size: 13.5px;
                outline: none;
                transition: border-color 0.15s ease;
            }
            #${BAR_ID} .purpura-pf-input::placeholder {
                color: var(--color-content-muted, #8b8b93);
            }
            #${BAR_ID} .purpura-pf-input:focus {
                border-color: var(--pf-accent);
            }
            #${BAR_ID} .purpura-pf-btn {
                flex: 0 0 auto;
                height: 32px;
                padding: 0 13px;
                border: 1px solid transparent;
                border-radius: 6px;
                background: var(--pf-accent);
                color: #fff;
                font: inherit;
                font-size: 13.5px;
                font-weight: 600;
                cursor: pointer;
                transition: filter 0.15s ease, opacity 0.15s ease;
            }
            #${BAR_ID} .purpura-pf-btn:hover { filter: brightness(1.06); }
            #${BAR_ID} .purpura-pf-btn:disabled { opacity: 0.5; cursor: default; }
            #${BAR_ID} .purpura-pf-btn.purpura-pf-ghost {
                background: transparent;
                border-color: var(--color-border-default, rgba(255, 255, 255, 0.18));
                color: inherit;
                font-weight: 500;
            }
            #${BAR_ID} .purpura-pf-btn.purpura-pf-ghost:hover {
                background: rgba(255, 255, 255, 0.06);
                filter: none;
            }
            #${BAR_ID} .purpura-pf-result {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                margin-top: 10px;
            }
            #${BAR_ID} .purpura-pf-avatar {
                display: block;
                width: 38px;
                height: 38px;
                border-radius: 50%;
                object-fit: cover;
                background: var(--color-surface-300, rgba(255, 255, 255, 0.08));
                border: 1px solid var(--color-border-default, rgba(255, 255, 255, 0.12));
            }
            #${BAR_ID} .purpura-pf-info {
                flex: 1 1 auto;
                min-width: 0;
            }
            #${BAR_ID} .purpura-pf-name {
                font-size: 13.5px;
                font-weight: 600;
                line-height: 1.35;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            #${BAR_ID} .purpura-pf-sub {
                margin-top: 1px;
                font-size: 12.5px;
                line-height: 1.5;
                color: var(--color-content-muted, rgba(255, 255, 255, 0.6));
            }
            #${BAR_ID} .purpura-pf-sub a {
                color: inherit;
                text-decoration: underline;
                text-underline-offset: 2px;
            }
            #${BAR_ID} .purpura-pf-sub a:hover { color: var(--pf-accent); }
            #${BAR_ID} .purpura-pf-result[data-kind="error"] .purpura-pf-sub { color: #ff8f8f; }
            #${BAR_ID} .purpura-pf-actions {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-top: 8px;
                flex-wrap: wrap;
            }
            #${BAR_ID} .purpura-pf-btn.purpura-pf-btn-sm {
                height: 28px;
                padding: 0 11px;
                font-size: 12.5px;
            }
            #${BAR_ID} .purpura-pf-avatars {
                display: flex;
                align-items: center;
                margin-top: 8px;
            }
            #${BAR_ID} .purpura-pf-mini {
                display: block;
                width: 20px;
                height: 20px;
                margin-left: -6px;
                border-radius: 50%;
                border: 2px solid var(--color-surface-100, #232527);
                object-fit: cover;
                background: var(--color-surface-300, rgba(255, 255, 255, 0.08));
            }
            #${BAR_ID} .purpura-pf-mini:first-child { margin-left: 0; }
            #${BAR_ID} .purpura-pf-track {
                height: 2px;
                margin-top: 8px;
                border-radius: 99px;
                overflow: hidden;
                background: rgba(255, 255, 255, 0.08);
            }
            #${BAR_ID} .purpura-pf-fill {
                display: block;
                height: 100%;
                width: 35%;
                border-radius: inherit;
                background: var(--pf-accent);
                animation: purpura-pf-sweep 1.15s linear infinite;
            }
            @keyframes purpura-pf-sweep {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(320%); }
            }
            .rbx-public-game-server-item.${MATCH_CLASS} {
                position: relative;
                outline: 2px solid var(--purpura-playButton, var(--color-action-emphasis-background, #335fff));
                outline-offset: 1px;
            }
            #${MATCH_BADGE_ID} {
                position: absolute;
                top: 6px;
                right: 8px;
                z-index: 2;
                padding: 2px 8px;
                border-radius: 4px;
                background: var(--purpura-playButton, var(--color-action-emphasis-background, #335fff));
                color: #fff;
                font: 600 10.5px/1.5 system-ui, -apple-system, sans-serif;
                letter-spacing: 0.4px;
                text-transform: uppercase;
                pointer-events: none;
            }
            :is(.light-theme, .theme-light, [data-theme="light"]) #${BAR_ID} .purpura-pf-result[data-kind="error"] .purpura-pf-sub {
                color: #b42318;
            }
            @media (max-width: 520px) {
                #${BAR_ID} .purpura-pf-row { flex-wrap: wrap; }
                #${BAR_ID} .purpura-pf-input { flex-basis: 100%; order: 3; }
            }
        `;
        (document.head || document.documentElement).appendChild(style);
    }

    function findCard(serverId) {
        if (!serverId) return null;
        const cards = document.querySelectorAll('.rbx-public-game-server-item');
        for (const card of cards) {
            if (card.getAttribute('data-gameinstanceid') === serverId) return card;
            if (card.dataset && card.dataset.gameinstanceid === serverId) return card;
            const button = card.querySelector('[data-gameinstanceid]');
            if (button && button.getAttribute('data-gameinstanceid') === serverId) return card;
            const ids = window.__PurpuraServerCardIds;
            if (ids && typeof ids.get === 'function' && ids.get(card) === serverId) return card;
        }
        return null;
    }

    function clearHighlight() {
        document.querySelectorAll('.' + MATCH_CLASS).forEach(card => card.classList.remove(MATCH_CLASS));
        document.querySelectorAll('#' + MATCH_BADGE_ID).forEach(badge => badge.remove());
    }

    function highlightServer(server) {
        clearHighlight();
        const card = findCard(server.id);
        if (!card) return;
        card.classList.add(MATCH_CLASS);
        const badge = document.createElement('span');
        badge.id = MATCH_BADGE_ID;
        badge.textContent = t('playerFinder_matchBadge', 'Match');
        card.appendChild(badge);
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function joinServer(place, serverId) {
        const id = parseInt(place, 10);
        if (!id || !serverId) return;
        const safeId = String(serverId).replace(/'/g, "\\'");
        const code = "if(typeof Roblox!=='undefined'&&Roblox.GameLauncher&&typeof Roblox.GameLauncher.joinGameInstance==='function'){" +
            'Roblox.GameLauncher.joinGameInstance(' + id + ",'" + safeId + "');}";
        try {
            chrome.runtime.sendMessage({ action: 'injectScript', codeToInject: code });
        } catch (error) { }
    }

    function buildBar() {
        ensureStyles();

        const bar = document.createElement('div');
        bar.id = BAR_ID;
        bar.setAttribute('role', 'search');

        const row = document.createElement('div');
        row.className = 'purpura-pf-row';

        const icon = document.createElement('span');
        icon.className = 'purpura-pf-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';

        const input = document.createElement('input');
        input.type = 'search';
        input.className = 'purpura-pf-input';
        input.placeholder = t('playerFinder_placeholder', 'Find a player in this game\u2026');
        input.setAttribute('aria-label', t('playerFinder_placeholder', 'Find a player in this game\u2026'));

        const find = document.createElement('button');
        find.type = 'button';
        find.className = 'purpura-pf-btn';
        find.textContent = t('playerFinder_find', 'Find');

        const cancel = document.createElement('button');
        cancel.type = 'button';
        cancel.className = 'purpura-pf-btn purpura-pf-ghost';
        cancel.textContent = t('playerFinder_cancel', 'Cancel');
        cancel.hidden = true;

        row.appendChild(icon);
        row.appendChild(input);
        row.appendChild(find);
        row.appendChild(cancel);

        const track = document.createElement('div');
        track.className = 'purpura-pf-track';
        track.hidden = true;
        const fillBar = document.createElement('span');
        fillBar.className = 'purpura-pf-fill';
        track.appendChild(fillBar);

        const result = document.createElement('div');
        result.className = 'purpura-pf-result';
        result.hidden = true;
        result.setAttribute('role', 'status');
        result.setAttribute('aria-live', 'polite');

        const avatarWrap = document.createElement('div');

        const info = document.createElement('div');
        info.className = 'purpura-pf-info';

        const name = document.createElement('div');
        name.className = 'purpura-pf-name';
        name.hidden = true;

        const sub = document.createElement('div');
        sub.className = 'purpura-pf-sub';
        sub.hidden = true;

        const actions = document.createElement('div');
        actions.className = 'purpura-pf-actions';
        actions.hidden = true;

        const avatars = document.createElement('div');
        avatars.className = 'purpura-pf-avatars';
        avatars.hidden = true;
        avatars.title = t('playerFinder_playersSeen', 'Players seen in this server');

        info.appendChild(name);
        info.appendChild(sub);
        info.appendChild(actions);
        info.appendChild(avatars);
        result.appendChild(avatarWrap);
        result.appendChild(info);

        bar.appendChild(row);
        bar.appendChild(track);
        bar.appendChild(result);

        bar.__pf = { input, find, cancel, track, result, avatarWrap, name, sub, actions, avatars };

        find.addEventListener('click', () => start(bar));
        input.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                start(bar);
            }
        });
        cancel.addEventListener('click', () => {
            if (!activeRun) return;
            activeRun.cancelled = true;
            setBusy(bar, false);
            setResult(bar, {
                subtitle: t('playerFinder_cancelled', 'Search cancelled.'),
                tone: 'error'
            });
        });

        return bar;
    }

    function setBusy(bar, busy) {
        const parts = bar.__pf;
        if (!parts) return;
        parts.find.disabled = busy;
        parts.input.disabled = busy;
        parts.cancel.hidden = !busy;
        parts.track.hidden = !busy;
    }

    function setResult(bar, patch) {
        const parts = bar.__pf;
        if (!parts) return;

        if (Object.prototype.hasOwnProperty.call(patch, 'title')) {
            parts.name.textContent = patch.title || '';
            parts.name.hidden = !patch.title;
        }
        if (Object.prototype.hasOwnProperty.call(patch, 'subtitle')) {
            parts.sub.textContent = patch.subtitle || '';
            parts.sub.hidden = !patch.subtitle;
        }
        if (Object.prototype.hasOwnProperty.call(patch, 'subtitleNodes')) {
            parts.sub.textContent = '';
            (patch.subtitleNodes || []).forEach(node => {
                if (!node) return;
                if (typeof node === 'string') {
                    parts.sub.appendChild(document.createTextNode(node));
                    return;
                }
                const link = document.createElement('a');
                link.href = node.href;
                link.target = '_blank';
                link.rel = 'noopener';
                link.textContent = node.text;
                parts.sub.appendChild(link);
            });
            parts.sub.hidden = !(patch.subtitleNodes && patch.subtitleNodes.length);
        }
        parts.result.dataset.kind = patch.tone || 'info';

        if (Object.prototype.hasOwnProperty.call(patch, 'avatarUrl')) {
            parts.avatarWrap.textContent = '';
            const avatar = document.createElement(patch.avatarUrl ? 'img' : 'span');
            avatar.className = 'purpura-pf-avatar';
            if (patch.avatarUrl) {
                avatar.src = patch.avatarUrl;
                avatar.alt = '';
            }
            parts.avatarWrap.appendChild(avatar);
        }

        if (Object.prototype.hasOwnProperty.call(patch, 'actions')) {
            parts.actions.textContent = '';
            (patch.actions || []).forEach(action => parts.actions.appendChild(action));
            parts.actions.hidden = !(patch.actions && patch.actions.length);
        }

        if (Object.prototype.hasOwnProperty.call(patch, 'avatars')) {
            parts.avatars.textContent = '';
            (patch.avatars || []).slice(0, 8).forEach(url => {
                const image = document.createElement('img');
                image.className = 'purpura-pf-mini';
                image.src = url;
                image.alt = '';
                parts.avatars.appendChild(image);
            });
            parts.avatars.hidden = !(patch.avatars && patch.avatars.length);
        }

        parts.result.hidden = false;
    }

    function actionButton(label, kind, onClick) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'purpura-pf-btn purpura-pf-btn-sm' + (kind === 'ghost' ? ' purpura-pf-ghost' : '');
        button.textContent = label;
        button.addEventListener('click', onClick);
        return button;
    }

    function profileAction(user) {
        return actionButton(t('playerFinder_profile', 'Profile'), 'ghost', () => {
            window.open(PROFILE_URL + user.id + '/profile', '_blank', 'noopener');
        });
    }

    function showMatch(bar, user, avatarUrl, server, source, sampleAvatars) {
        const players = server.playing ? String(server.playing) : '';
        const max = server.maxPlayers ? String(server.maxPlayers) : '';
        const count = players && max ? players + '/' + max : players || '';
        const subtitle = source === 'presence'
            ? t('playerFinder_presenceLine', 'Playing in this game right now')
            : fill(
                t('playerFinder_serverLine', 'Playing in a server \u00b7 {count} players'),
                { count: count || '?' }
            );

        setResult(bar, {
            title: user.displayName || user.name,
            subtitle: subtitle,
            tone: 'success',
            avatarUrl: avatarUrl || null,
            actions: [
                actionButton(t('playerFinder_join', 'Join'), 'solid', () => {
                    joinServer(placeId(), server.id);
                }),
                profileAction(user)
            ],
            avatars: source === 'presence' ? [] : (sampleAvatars || [])
        });

        highlightServer(server);
    }

    async function start(bar) {
        const parts = bar.__pf;
        if (!parts || activeRun) return;

        const query = parts.input.value.trim();
        if (!query) {
            parts.input.focus();
            return;
        }

        const place = placeId();
        if (!place) {
            setResult(bar, {
                title: t('playerFinder_errorTitle', 'Search failed'),
                subtitle: t('playerFinder_error', "Couldn't search right now. Try again in a moment."),
                tone: 'error',
                avatarUrl: null,
                actions: [],
                avatars: []
            });
            return;
        }

        const run = { cancelled: false };
        activeRun = run;
        setBusy(bar, true);
        setResult(bar, {
            title: query,
            subtitle: fill(t('playerFinder_searching', 'Looking up {name}\u2026'), { name: query }),
            tone: 'info',
            avatarUrl: null,
            actions: [],
            avatars: []
        });

        try {
            const user = await resolveUser(query);
            if (isCancelled(run)) return;
            if (!user) {
                setResult(bar, {
                    title: t('playerFinder_noUserTitle', 'Player not found'),
                    subtitle: t('playerFinder_noUser', 'No Roblox user found with that name.'),
                    tone: 'error',
                    actions: [],
                    avatars: []
                });
                return;
            }

            const avatar = await targetAvatar(user.id);
            if (isCancelled(run)) return;

            setResult(bar, {
                title: user.displayName || user.name,
                subtitle: t('playerFinder_checking', 'Checking where they are\u2026'),
                avatarUrl: avatar.imageUrl || null,
                tone: 'info',
                actions: []
            });

            const presence = await fetchPresence(user.id);
            if (isCancelled(run)) return;

            if (presence && presence.userPresenceType === 2) {
                const presencePlace = presence.placeId || presence.rootPlaceId || null;
                const inThisGame = String(presence.placeId || '') === String(place) ||
                    String(presence.rootPlaceId || '') === String(place);
                if (inThisGame && presence.gameId) {
                    showMatch(bar, user, avatar.imageUrl, {
                        id: presence.gameId,
                        playing: 0,
                        maxPlayers: 0
                    }, 'presence', []);
                    return;
                }
                if (presencePlace && !inThisGame) {
                    const game = await presenceGame(presence);
                    if (isCancelled(run)) return;
                    setResult(bar, {
                        subtitleNodes: elsewhereSubtitle(user, game, presence),
                        tone: 'error',
                        actions: [profileAction(user)]
                    });
                    return;
                }
            }

            if (!avatar.hash) {
                setResult(bar, {
                    subtitle: t('playerFinder_error', "Couldn't search right now. Try again in a moment."),
                    tone: 'error',
                    actions: []
                });
                return;
            }

            const scanningText = (scanned, checked) => fill(
                t('playerFinder_scanning', 'Scanning servers\u2026 {servers} servers \u00b7 {players} players checked'),
                { servers: scanned, players: checked }
            );

            setResult(bar, { subtitle: scanningText(0, 0), tone: 'info', actions: [] });

            const result = await scanServers(place, avatar.hash, run, progress => {
                if (isCancelled(run)) return;
                setResult(bar, { subtitle: scanningText(progress.scanned, progress.checked) });
            });
            if (isCancelled(run)) return;

            if (result.match) {
                showMatch(bar, user, avatar.imageUrl, result.match, 'scan', result.match.avatars);
                return;
            }

            if (result.withTokens === 0) {
                setResult(bar, {
                    subtitle: t('playerFinder_noTokens',
                        "Roblox isn't listing players for this game's servers, so a search can't run right now."),
                    tone: 'error',
                    actions: []
                });
                return;
            }

            setResult(bar, {
                subtitle: fill(
                    t('playerFinder_notFound',
                        'Scanned {servers} servers and {players} players. {name} was not found. Roblox only shows a sample of players per server.'),
                    { servers: result.scanned, players: result.checked, name: user.name }
                ),
                tone: 'error',
                actions: []
            });
        } catch (error) {
            if (!isCancelled(run)) {
                setResult(bar, {
                    subtitle: t('playerFinder_error', "Couldn't search right now. Try again in a moment."),
                    tone: 'error',
                    actions: []
                });
            }
        } finally {
            if (activeRun === run) activeRun = null;
            if (bar.isConnected) setBusy(bar, false);
        }
    }

    function removeBar() {
        const bar = document.getElementById(BAR_ID);
        if (bar) bar.remove();
        clearHighlight();
    }

    function mount() {
        if (!enabled) {
            removeBar();
            return;
        }
        const place = placeId();
        if (!place) {
            removeBar();
            return;
        }
        if (lastPlaceId && lastPlaceId !== place) {
            removeBar();
            clearHighlight();
        }
        lastPlaceId = place;

        const first = document.querySelector('.rbx-public-game-server-item');
        if (!first) {
            removeBar();
            return;
        }
        if (document.getElementById(BAR_ID)) return;

        const list = first.closest('ul, ol') || first.parentElement;
        const container = list && list.parentElement;
        if (!container) return;

        container.insertBefore(buildBar(), list);
    }

    function scheduleMount() {
        if (mountScheduled) return;
        mountScheduled = true;
        setTimeout(() => {
            mountScheduled = false;
            mount();
        }, 120);
    }

    async function configure() {
        const [settings, restrictions] = await Promise.all([
            chrome.storage.sync.get(STORAGE_KEY),
            chrome.storage.local.get('noFeatures')
        ]);
        enabled = settings[STORAGE_KEY] !== false && restrictions.noFeatures !== true;
        if (!enabled) {
            removeBar();
            return;
        }
        ensureStyles();
        scheduleMount();
    }

    const observer = new MutationObserver(() => {
        if (!enabled) return;
        scheduleMount();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    chrome.storage.onChanged.addListener((changes, area) => {
        if ((area === 'sync' && changes[STORAGE_KEY]) || (area === 'local' && changes.noFeatures)) {
            configure().catch(() => { });
        }
    });

    window.addEventListener('hashchange', scheduleMount);
    window.addEventListener('popstate', scheduleMount);

    configure().catch(() => { });
})();
