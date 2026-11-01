/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
    'use strict';

    if (window.purpuraPreferredGameRegionsInitialized) return;
    window.purpuraPreferredGameRegionsInitialized = true;

    const STORAGE_KEY = 'pgr';
    const CONTAINER_SELECTOR = '#game-details-play-button-container';
    const PLAY_BUTTON_SELECTOR = 'button[data-testid="play-button"]';
    const BUTTON_ID = 'purpura-preferred-region-play';
    const BUTTON_CLASS = 'purpura-preferred-region-button';
    const HOST_CLASS = 'purpura-preferred-region-host';
    const STYLE_ID = 'purpura-preferred-region-style';
    const TOAST_ID = 'purpura-preferred-region-toast';
    const REGION_DATA_PATH = 'data/ServerList.json';
    const API_ORIGIN = 'https://api.purpura.page';
    const DEFAULT_REGION = 'US|Virginia|Ashburn';
    const MAX_PAGES = 2;
    const DETAIL_BATCH_SIZE = 100;
    const PROBE_CHUNK = 40;
    const SCAN_DEBOUNCE_MS = 250;
    const TOAST_DURATION_MS = 4200;

    let config = { enabled: false, region: DEFAULT_REGION };
    let regions = null;
    let busy = false;
    let scanTimer = null;
    let pageObserver = null;
    let sizeObserver = null;
    let observedPlayButton = null;

    function getPlaceId() {
        const match = window.location.pathname.match(/\/games\/(\d+)/);
        return match ? match[1] : null;
    }

    function locationKey(location) {
        if (!location) return '';
        return [location.country, location.region, location.city]
            .filter(Boolean)
            .join('|');
    }

    function locationLabel(location) {
        if (!location) return '';
        const parts = [];
        if (location.city) parts.push(location.city);
        if (location.country === 'US' && location.region) parts.push(location.region);
        if (location.country_name) parts.push(location.country_name);
        else if (location.country) parts.push(location.country);
        return parts.join(', ');
    }

    async function loadRegions() {
        if (regions) return regions;
        regions = new Map();
        try {
            const response = await fetch(chrome.runtime.getURL(REGION_DATA_PATH));
            if (!response.ok) return regions;
            const list = await response.json();
            if (!Array.isArray(list)) return regions;
            list.forEach((entry) => {
                const key = locationKey(entry && entry.location);
                if (!key || regions.has(key)) return;
                regions.set(key, locationLabel(entry.location) || key);
            });
        } catch (_) { }
        return regions;
    }

    async function currentRegionLabel() {
        const map = await loadRegions();
        return map.get(config.region) || config.region;
    }

    function ensureStyle() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            #${CONTAINER_SELECTOR.slice(1)}.${HOST_CLASS} {
                flex-direction: row !important;
                flex-wrap: nowrap !important;
                align-items: stretch !important;
                gap: 5px !important;
            }
            #${CONTAINER_SELECTOR.slice(1)}.${HOST_CLASS} > button[data-testid="play-button"] {
                flex: 1 1 auto !important;
                width: auto !important;
                min-width: 0 !important;
            }
            #${BUTTON_ID} {
                display: flex;
                align-items: center;
                justify-content: center;
                align-self: stretch;
                flex: 0 0 auto;
                margin: 0;
                padding: 0;
                cursor: pointer;
                background-color: var(--purpura-playButton, var(--color-action-emphasis-background, #335fff));
                color: #ffffff;
                transition: filter 0.18s ease, opacity 0.18s ease;
            }
            #${BUTTON_ID}:hover {
                filter: brightness(1.1);
            }
            #${BUTTON_ID}:active {
                filter: brightness(0.94);
            }
            #${BUTTON_ID}:focus-visible {
                outline: 2px solid var(--purpura-playButton, var(--color-action-emphasis-background, #335fff));
                outline-offset: 2px;
            }
            #${BUTTON_ID}.is-busy {
                opacity: 0.65;
                pointer-events: none;
            }
            #${BUTTON_ID}.is-busy svg {
                animation: purpura-pgr-pulse 1s ease-in-out infinite;
            }
            #${BUTTON_ID} svg {
                width: 22px;
                height: 22px;
                flex-shrink: 0;
            }
            @keyframes purpura-pgr-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.35; }
            }
        `;
        (document.head || document.documentElement).appendChild(style);
    }

    function toast(message) {
        let element = document.getElementById(TOAST_ID);
        if (!element) {
            element = document.createElement('div');
            element.id = TOAST_ID;
            element.setAttribute('role', 'status');
            element.style.cssText = [
                'position:fixed',
                'right:20px',
                'bottom:20px',
                'z-index:2147483000',
                'max-width:320px',
                'padding:12px 14px',
                'border-radius:10px',
                'background:rgba(20,20,26,0.96)',
                'border:1px solid rgba(155,109,255,0.4)',
                'color:#f2f2f7',
                'font:13px/1.5 system-ui,-apple-system,sans-serif',
                'box-shadow:0 10px 30px rgba(0,0,0,0.45)',
                'opacity:0',
                'transition:opacity 0.18s ease'
            ].join(';');
            document.body.appendChild(element);
        }
        element.textContent = message;
        void element.offsetWidth;
        element.style.opacity = '1';
        clearTimeout(element.hideTimer);
        element.hideTimer = setTimeout(() => {
            element.style.opacity = '0';
        }, TOAST_DURATION_MS);
    }

    function syncButtonSize(button, playButton) {
        if (!button || !playButton) return;
        const height = Math.round(playButton.getBoundingClientRect().height);
        if (!height) return;
        button.style.width = height + 'px';
        button.style.height = height + 'px';
        const styles = window.getComputedStyle(playButton);
        if (styles.borderRadius) button.style.borderRadius = styles.borderRadius;
    }

    async function updateTooltip(button) {
        if (!button) return;
        const label = await currentRegionLabel();
        if (!label || button.dataset.pgrLabel === label) return;
        button.dataset.pgrLabel = label;
        const text = 'Join a server in ' + label;
        button.title = text;
        button.setAttribute('aria-label', text);
    }

    function setBusy(button, value) {
        if (!button) return;
        button.classList.toggle('is-busy', !!value);
        button.setAttribute('aria-busy', value ? 'true' : 'false');
    }

    function launchGame(placeId, serverId) {
        const id = parseInt(placeId, 10);
        if (!id) return;
        const call = serverId
            ? `Roblox.GameLauncher.joinGameInstance(${id}, '${serverId}')`
            : `Roblox.GameLauncher.joinGameInstance(${id})`;
        const code = `if (typeof Roblox !== 'undefined' && Roblox.GameLauncher && typeof Roblox.GameLauncher.joinGameInstance === 'function') { ${call}; }`;
        try {
            chrome.runtime.sendMessage({ action: 'injectScript', codeToInject: code });
        } catch (_) { }
    }

    async function fetchServers(placeId) {
        const servers = [];
        let cursor = null;
        for (let page = 0; page < MAX_PAGES; page += 1) {
            let url = 'https://games.roblox.com/v1/games/' + encodeURIComponent(placeId) +
                '/servers/Public?sortOrder=Asc&excludeFullGames=true&limit=100';
            if (cursor) url += '&cursor=' + encodeURIComponent(cursor);
            const response = await fetch(url, { credentials: 'include' });
            if (!response.ok) break;
            const data = await response.json();
            const list = data && Array.isArray(data.data) ? data.data : [];
            list.forEach((server) => {
                if (!server || !server.id) return;
                const playing = typeof server.playing === 'number' ? server.playing : 0;
                const maxPlayers = typeof server.maxPlayers === 'number' ? server.maxPlayers : 0;
                if (maxPlayers && playing >= maxPlayers) return;
                servers.push({ id: server.id, playing: playing });
            });
            cursor = data && data.nextPageCursor ? data.nextPageCursor : null;
            if (!cursor || !list.length) break;
        }
        return servers;
    }

    function apiGet(path) {
        return new Promise((resolve) => {
            try {
                chrome.runtime.sendMessage({
                    type: 'PURPURA_API_REQUEST',
                    url: API_ORIGIN + path,
                    method: 'GET'
                }, (response) => {
                    if (chrome.runtime.lastError || !response || !response.ok) {
                        resolve(null);
                        return;
                    }
                    try {
                        resolve(JSON.parse(response.text));
                    } catch (_) {
                        resolve(null);
                    }
                });
            } catch (_) {
                resolve(null);
            }
        });
    }

    function requestServerLocations(placeId, serverIds) {
        if (!serverIds.length) return null;
        return new Promise((resolve) => {
            try {
                chrome.runtime.sendMessage({ action: 'getServerRegions', placeId, serverIds }, (response) => {
                    if (chrome.runtime.lastError || !response || !Array.isArray(response.servers) || !response.servers.length) {
                        resolve(null);
                        return;
                    }
                    const locations = new Map();
                    response.servers.forEach((entry) => {
                        if (entry && entry.serverId && entry.location) locations.set(entry.serverId, entry.location);
                    });
                    resolve(locations.size ? locations : null);
                });
            } catch (_) {
                resolve(null);
            }
        });
    }

    async function knownServerLocations(placeId, serverIds) {
        const locations = new Map();
        for (let index = 0; index < serverIds.length; index += DETAIL_BATCH_SIZE) {
            const batch = serverIds.slice(index, index + DETAIL_BATCH_SIZE);
            const data = await apiGet('/v1/servers/details?place_id=' + encodeURIComponent(placeId) +
                '&server_ids=' + encodeURIComponent(batch.join(',')));
            if (!data || !Array.isArray(data.servers)) continue;
            data.servers.forEach((entry) => {
                if (!entry || !entry.serverId || !entry.location) return;
                locations.set(entry.serverId, entry.location);
            });
        }
        return locations;
    }

    async function findServerInRegion(placeId, servers) {
        if (!servers.length) return null;
        const ordered = servers.slice().sort((a, b) => b.playing - a.playing);

        const known = await knownServerLocations(placeId, ordered.map((server) => server.id));
        for (const server of ordered) {
            const location = known.get(server.id);
            if (location && locationKey(location) === config.region) return server;
        }

        const unknown = ordered.filter((server) => !known.has(server.id));
        for (let index = 0; index < unknown.length; index += PROBE_CHUNK) {
            const chunk = unknown.slice(index, index + PROBE_CHUNK);
            const locations = await requestServerLocations(placeId, chunk.map((server) => server.id));
            if (!locations) continue;
            for (const server of chunk) {
                const location = locations.get(server.id);
                if (location && locationKey(location) === config.region) return server;
            }
        }

        return null;
    }

    async function joinPreferredRegion(placeId, button) {
        if (busy) return;
        busy = true;
        setBusy(button, true);
        try {
            const servers = await fetchServers(placeId);
            const match = await findServerInRegion(placeId, servers);
            if (match) {
                launchGame(placeId, match.id);
                return;
            }
            const label = await currentRegionLabel();
            toast(label
                ? 'No open ' + label + ' servers right now. Joining normally.'
                : 'No preferred region is set. Choose one in Purpura settings.');
            launchGame(placeId);
        } catch (_) {
            toast('Could not reach Roblox servers. Try again in a moment.');
        } finally {
            busy = false;
            setBusy(button, false);
        }
    }

    function playButtonClassList(playButton) {
        return (playButton.getAttribute('class') || '')
            .split(/\s+/)
            .filter((name) => name && name !== 'btn-full-width' && name !== 'btn-common-play-game-lg')
            .join(' ');
    }

    function createButton(playButton) {
        ensureStyle();
        const button = document.createElement('button');
        button.type = 'button';
        button.id = BUTTON_ID;
        button.className = playButtonClassList(playButton) + ' ' + BUTTON_CLASS;
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>';
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const placeId = getPlaceId();
            if (placeId) joinPreferredRegion(placeId, button);
        });
        syncButtonSize(button, playButton);
        updateTooltip(button);
        return button;
    }

    function unmount() {
        const button = document.getElementById(BUTTON_ID);
        if (button) button.remove();
        document.querySelectorAll('.' + HOST_CLASS).forEach((container) => container.classList.remove(HOST_CLASS));
        if (sizeObserver) {
            sizeObserver.disconnect();
            sizeObserver = null;
        }
        observedPlayButton = null;
    }

    function mount() {
        if (!config.enabled || !config.region) {
            unmount();
            return;
        }
        if (!getPlaceId()) return;
        const container = document.querySelector(CONTAINER_SELECTOR);
        if (!container) return;
        const playButton = container.querySelector(PLAY_BUTTON_SELECTOR);
        if (!playButton) return;

        container.classList.add(HOST_CLASS);

        let button = document.getElementById(BUTTON_ID);
        if (!button) {
            button = createButton(playButton);
            container.appendChild(button);
        }
        syncButtonSize(button, playButton);
        updateTooltip(button);

        if (typeof ResizeObserver === 'function' && observedPlayButton !== playButton) {
            if (sizeObserver) sizeObserver.disconnect();
            observedPlayButton = playButton;
            sizeObserver = new ResizeObserver(() => syncButtonSize(button, playButton));
            sizeObserver.observe(playButton);
        }
    }

    function scheduleMount() {
        if (scanTimer) clearTimeout(scanTimer);
        scanTimer = setTimeout(() => {
            scanTimer = null;
            mount();
        }, SCAN_DEBOUNCE_MS);
    }

    function applyConfig(value) {
        const next = {
            enabled: !!(value && value.enabled),
            region: value && typeof value.region === 'string' && value.region ? value.region : DEFAULT_REGION
        };
        const changed = next.enabled !== config.enabled || next.region !== config.region;
        config = next;
        if (!config.enabled) {
            unmount();
            if (pageObserver) {
                pageObserver.disconnect();
                pageObserver = null;
            }
            return;
        }
        if (!pageObserver) {
            pageObserver = new MutationObserver(scheduleMount);
            pageObserver.observe(document.documentElement, { childList: true, subtree: true });
        }
        if (changed || !document.getElementById(BUTTON_ID)) scheduleMount();
    }

    window.__PurpuraSettings.ready.then(() => {
        applyConfig(window.__PurpuraSettings.get(STORAGE_KEY));
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area !== 'sync') return;
            if (!Object.prototype.hasOwnProperty.call(changes, STORAGE_KEY)) return;
            applyConfig(changes[STORAGE_KEY].newValue);
        });
    });
})();
