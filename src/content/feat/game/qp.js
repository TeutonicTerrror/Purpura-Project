/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
    'use strict';
    function t(key, substitutions) { return chrome.i18n.getMessage(key, substitutions) || key; }
    
    if (window.purpuraQuickPlayInitialized) return;
    window.purpuraQuickPlayInitialized = true;

    let isEnabled = false;

    const State = {
        activePlaceId: null,
        activeGameCardLink: null,
        privateServerList: new Map(),
        privateServersContainer: null,
        dropdownPanel: null,
        hideOverlayTimer: null,
        isLoadingPrivateServers: false,
        currentNextPageCursor: null
    };

    function executeLaunchScript(codeToInject) {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage({ action: 'injectScript', codeToInject });
        }
    }

    function launchGame(placeId, jobId = null) {
        if (!placeId) return;
        const codeToInject = `if (typeof Roblox?.GameLauncher?.joinGameInstance === 'function') { ${jobId ? `Roblox.GameLauncher.joinGameInstance(parseInt('${placeId}', 10), '${jobId}')` : `Roblox.GameLauncher.joinGameInstance(parseInt('${placeId}', 10))`}; }`;
        executeLaunchScript(codeToInject);
    }

    function launchPrivateGame(placeId, accessCode, linkCode) {
        if (!placeId || !accessCode || !linkCode) {
            return;
        }
        const codeToInject = `if (typeof Roblox?.GameLauncher?.joinPrivateGame === 'function') { 
            Roblox.GameLauncher.joinPrivateGame(parseInt('${placeId}', 10), '${accessCode}', '${linkCode}'); 
        }`;
        executeLaunchScript(codeToInject);
    }

    function isQPPage() {
        const p = window.location.pathname;
        return p === '/home' || p === '/charts';
    }

    function extractPlaceId(gameUrl) {
        const match = gameUrl.match(/\/games\/(\d+)\//);
        return match ? match[1] : null;
    }

    async function callRobloxApi(subdomain, endpoint) {
        const url = `https://${subdomain}.roblox.com${endpoint}`;
        try {
            const response = await fetch(url, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            return response;
        } catch (error) {
            return null;
        }
    }

    function createGlobalPrivateServerContainer() {
        if (document.getElementById('purpura-private-servers-dropdown')) return;

        const dropdown = document.createElement('div');
        dropdown.id = 'purpura-private-servers-dropdown';
        dropdown.className = 'purpura-ps-dropdown';
        dropdown.setAttribute('data-state', 'closed');

        const container = document.createElement('div');
        container.className = 'purpura-ps-list';
        
        dropdown.appendChild(container);
        document.body.appendChild(dropdown);

        State.dropdownPanel = dropdown;
        State.privateServersContainer = container;

        dropdown.addEventListener('mouseenter', () => {
            clearTimeout(State.hideOverlayTimer);
        });

        dropdown.addEventListener('mouseleave', () => {
            State.hideOverlayTimer = setTimeout(hidePrivateServersOverlay, 200);
        });

        container.addEventListener('scroll', (e) => {
            if (State.isLoadingPrivateServers || !State.currentNextPageCursor || !State.activePlaceId) return;
            
            const { scrollTop, scrollHeight, clientHeight } = e.target;
            if (scrollHeight - scrollTop - clientHeight < 50) {
                fetchAndDisplayPrivateServers(State.activePlaceId, true, State.currentNextPageCursor);
            }
        });
    }

    async function fetchAndDisplayPrivateServers(placeId, loadMore = false, nextPageCursor = null) {
        if (State.isLoadingPrivateServers) return;
        State.isLoadingPrivateServers = true;

        try {
            if (!loadMore) {
                State.privateServersContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:80px;text-align:center;padding:10px;color:#888;font-size:14px;">Loading...</div>';

                if (State.privateServerList.has(placeId)) {
                    const cached = State.privateServerList.get(placeId);
                    renderPrivateServers(placeId, cached.servers, cached.nextPageCursor, false);
                    State.isLoadingPrivateServers = false;
                    return;
                }
            }

            const response = await callRobloxApi('games', `/v1/games/${placeId}/private-servers?limit=50&sortOrder=Desc${nextPageCursor ? `&cursor=${nextPageCursor}` : ''}`);
            
            if (!response || !response.ok) {
                throw new Error('Failed to fetch private servers');
            }

            const data = await response.json();
            const servers = data.data || [];

            if (loadMore) {
                const cached = State.privateServerList.get(placeId) || { servers: [], nextPageCursor: null };
                cached.servers.push(...servers);
                cached.nextPageCursor = data.nextPageCursor;
                renderPrivateServers(placeId, servers, data.nextPageCursor, true);
            } else {
                State.privateServerList.set(placeId, { servers, nextPageCursor: data.nextPageCursor });
                renderPrivateServers(placeId, servers, data.nextPageCursor, false);
            }
        } catch (error) {
            State.privateServersContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:80px;text-align:center;padding:10px;color:#888;font-size:14px;">Failed to load servers</div>';
        } finally {
            State.isLoadingPrivateServers = false;
        }
    }

    function renderPrivateServers(placeId, servers, nextPageCursor, append) {
        if (!append) {
            State.privateServersContainer.innerHTML = '';
        }

        State.currentNextPageCursor = nextPageCursor;

        const joinableServers = servers.filter(server => server.accessCode);

        if (!joinableServers.length && !append) {
            const msg = document.createElement('div');
            msg.textContent = 'No active private servers found';
            msg.style.cssText = 'display:flex;align-items:center;justify-content:center;min-height:80px;text-align:center;padding:10px;color:#888;font-size:14px;';
            State.privateServersContainer.appendChild(msg);
            return;
        }

        const fragment = document.createDocumentFragment();

        joinableServers.forEach(server => {
            const item = document.createElement('div');
            item.className = 'purpura-ps-item';

            const info = document.createElement('div');
            info.className = 'purpura-ps-info';

            const name = document.createElement('span');
            name.className = 'purpura-ps-name';
            name.textContent = server.name;
            name.title = server.name;

            const players = document.createElement('span');
            players.className = 'purpura-ps-players';
            players.textContent = `${server.players?.length || 0} / ${server.maxPlayers}`;

            info.appendChild(name);
            info.appendChild(players);

            const joinBtn = document.createElement('button');
            joinBtn.className = 'purpura-ps-join-btn';
            joinBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg>';
            joinBtn.title = 'Join Server';

            joinBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                launchPrivateGame(placeId, server.accessCode, server.vipServerId);
                hidePrivateServersOverlay();
            };

            item.appendChild(info);
            item.appendChild(joinBtn);
            fragment.appendChild(item);
        });

        State.privateServersContainer.appendChild(fragment);
    }

    function showPrivateServerOverlay(triggerButton, placeId) {
        const gameLink = triggerButton.closest('.game-card-link') || triggerButton;

        if (State.activeGameCardLink === gameLink) {
            hidePrivateServersOverlay();
            return;
        }

        if (State.activeGameCardLink) {
            State.activeGameCardLink.classList.remove('purpura-quick-play-active');
        }

        State.activeGameCardLink = gameLink;
        State.activePlaceId = placeId;
        gameLink.classList.add('purpura-quick-play-active');

        const dropdown = State.dropdownPanel;
        if (!dropdown) return;

        const btnRect = triggerButton.getBoundingClientRect();
        const width = 320;
        dropdown.style.width = `${width}px`;

        let left = btnRect.left + btnRect.width / 2 - width / 2;
        left = Math.max(10, Math.min(left, document.documentElement.clientWidth - width - 10));

        const vpHeight = document.documentElement.clientHeight;
        const dropdownHeight = 350;
        const spaceBelow = vpHeight - btnRect.bottom - 5;
        const spaceAbove = btnRect.top - 5;

        const list = dropdown.querySelector('.purpura-ps-list');

        if (spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove) {
            const top = btnRect.bottom + 5;
            dropdown.style.top = `${top}px`;
            dropdown.style.bottom = 'auto';
            dropdown.className = 'purpura-ps-dropdown open-down';
            if (list) {
                const maxH = Math.max(80, Math.min(dropdownHeight, vpHeight - btnRect.bottom - 20));
                list.style.maxHeight = `${maxH}px`;
            }
        } else {
            const bottom = vpHeight - btnRect.top + 5;
            dropdown.style.bottom = `${bottom}px`;
            dropdown.style.top = 'auto';
            dropdown.className = 'purpura-ps-dropdown open-up';
            if (list) {
                const maxH = Math.max(80, Math.min(dropdownHeight, btnRect.top - 20));
                list.style.maxHeight = `${maxH}px`;
            }
        }

        dropdown.style.left = `${left}px`;
        dropdown.classList.add('visible');
        dropdown.setAttribute('data-state', 'open');

        fetchAndDisplayPrivateServers(placeId);
    }

    function hidePrivateServersOverlay() {
        if (State.dropdownPanel && State.dropdownPanel.matches(':hover')) return;
        if (!State.dropdownPanel || !State.dropdownPanel.classList.contains('visible')) return;

        if (State.activeGameCardLink) {
            State.activeGameCardLink.classList.remove('purpura-quick-play-active');
        }

        State.dropdownPanel.classList.remove('visible');
        State.dropdownPanel.setAttribute('data-state', 'closed');
        State.activeGameCardLink = null;
        State.activePlaceId = null;
        State.currentNextPageCursor = null;
        const list = State.dropdownPanel.querySelector('.purpura-ps-list');
        if (list) list.style.maxHeight = '350px';
    }

    function injectStyles() {
        if (document.getElementById('purpura-quick-play-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'purpura-quick-play-styles';
        style.textContent = `
            .game-card-link {
                position: relative;
            }

            [data-purpura-quick-play]:hover {
                padding-bottom: 38px !important;
            }

            [data-purpura-quick-play] {
                transition: padding-bottom 0.25s ease;
            }

            .purpura-quick-play-buttons {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                display: flex;
                gap: 4px;
                padding: 0 4px 4px;
                opacity: 0;
                transform: translateY(8px);
                transition: opacity 0.25s ease, transform 0.25s ease;
                pointer-events: none;
                z-index: 15;
            }

            .game-card-link:hover .purpura-quick-play-buttons {
                opacity: 1;
                transform: translateY(0);
                pointer-events: all;
            }

            .purpura-qp-btn {
                flex: 1;
                height: 34px;
                border: none;
                cursor: pointer;
                font-weight: 600;
                font-size: 12px;
                color: #ffffff;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                transition: all 0.25s ease;
                position: relative;
                overflow: hidden;
                border-radius: 8px;
                font-family: 'Segoe UI', system-ui, sans-serif;
            }

            .purpura-qp-btn::before {
                content: '';
                position: absolute;
                inset: 0;
                background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);
                opacity: 0;
                transition: opacity 0.25s ease;
            }

            .purpura-qp-btn:hover::before {
                opacity: 1;
            }

            .purpura-qp-btn svg {
                width: 14px;
                height: 14px;
                flex-shrink: 0;
                transition: transform 0.25s ease;
            }

            .purpura-qp-play {
                background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            }

            .purpura-qp-play:hover {
                background: linear-gradient(135deg, #9d74f7 0%, #8b5cf6 100%);
                transform: translateY(-2px);
                box-shadow: 0 4px 14px rgba(139, 92, 246, 0.35);
            }

            .purpura-qp-play:hover svg {
                transform: scale(1.1);
            }

            .purpura-qp-servers {
                background: linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%);
            }

            .purpura-qp-servers:hover {
                background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
                transform: translateY(-2px);
                box-shadow: 0 4px 14px rgba(109, 40, 217, 0.35);
            }

            .purpura-qp-servers:hover svg {
                transform: scale(1.1);
            }

            .purpura-ps-dropdown {
                position: fixed;
                background: rgba(22, 23, 28, 0.98);
                border: 1px solid rgba(139, 92, 246, 0.15);
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.08);
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.2s ease, transform 0.2s ease;
                pointer-events: none;
                backdrop-filter: blur(16px);
            }

            .purpura-ps-dropdown.open-down { transform: translateY(-5px); }
            .purpura-ps-dropdown.open-up {
                transform: scaleY(0);
                transform-origin: bottom center;
            }

            .purpura-ps-dropdown.visible {
                opacity: 1;
                transform: translateY(0) scaleY(1);
                pointer-events: all;
            }

            .purpura-ps-list {
                max-height: 350px;
                min-height: 80px;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 8px;
            }

            .purpura-ps-list::-webkit-scrollbar {
                display: none;
            }

            .purpura-ps-list {
                scrollbar-width: none;
                -ms-overflow-style: none;
            }

            .purpura-ps-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 9px 10px;
                margin-bottom: 3px;
                background: rgba(139, 92, 246, 0.04);
                border: 1px solid rgba(139, 92, 246, 0.06);
                border-radius: 8px;
                transition: background 0.2s ease, border-color 0.2s ease;
            }

            .purpura-ps-item:hover {
                background: rgba(139, 92, 246, 0.08);
                border-color: rgba(139, 92, 246, 0.12);
            }

            .purpura-ps-info {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 4px;
                min-width: 0;
            }

            .purpura-ps-name {
                color: #ffffff;
                font-weight: 500;
                font-size: 14px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .purpura-ps-players {
                color: #888;
                font-size: 12px;
            }

            .purpura-ps-join-btn {
                width: 32px;
                height: 32px;
                border: none;
                background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                flex-shrink: 0;
            }

            .purpura-ps-join-btn svg {
                width: 14px;
                height: 14px;
                transition: transform 0.2s ease;
            }

            .purpura-ps-join-btn:hover {
                background: linear-gradient(135deg, #9d74f7 0%, #8b5cf6 100%);
                transform: scale(1.08);
                box-shadow: 0 3px 10px rgba(139, 92, 246, 0.3);
            }

            .purpura-ps-join-btn:hover svg {
                transform: scale(1.1);
            }
        `;
        document.head.appendChild(style);
    }

    function createQuickPlayButtons(gameLink) {
        if (gameLink.querySelector('.purpura-quick-play-buttons')) return;

        const placeId = extractPlaceId(gameLink.href);
        if (!placeId) return;

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'purpura-quick-play-buttons';

        const playButton = document.createElement('button');
        playButton.className = 'purpura-qp-btn purpura-qp-play';
        playButton.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg><span>${t('quickPlay_play')}</span>`;
        playButton.title = 'Quick Play';

        playButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            launchGame(placeId);
        });

        const serversButton = document.createElement('button');
        serversButton.className = 'purpura-qp-btn purpura-qp-servers';
        serversButton.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg><span>${t('quickPlay_servers')}</span>`;
        serversButton.title = 'Private Servers';

        serversButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showPrivateServerOverlay(serversButton, placeId);
        });

        buttonsContainer.appendChild(playButton);
        buttonsContainer.appendChild(serversButton);

        gameLink.appendChild(buttonsContainer);

        gameLink.addEventListener('mouseenter', () => {
            if (State.dropdownPanel?.classList.contains('visible') && State.activeGameCardLink === gameLink) {
                clearTimeout(State.hideOverlayTimer);
            }
        });

        gameLink.addEventListener('mouseleave', () => {
            if (State.activeGameCardLink === gameLink) {
                State.hideOverlayTimer = setTimeout(hidePrivateServersOverlay, 200);
            }
        });
    }

    function processGameCards() {
        if (!isEnabled) return;

        const gameCards = document.querySelectorAll('.game-card-link[href*="/games/"]:not([data-purpura-quick-play])');
        
        gameCards.forEach(gameLink => {
            gameLink.setAttribute('data-purpura-quick-play', 'true');
            createQuickPlayButtons(gameLink);
        });
    }

    let processCardsTimer = null;

    function observeGameCards() {
        const observer = new MutationObserver(() => {
            if (isEnabled && isQPPage()) {
                clearTimeout(processCardsTimer);
                processCardsTimer = setTimeout(processGameCards, 50);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        return observer;
    }

    function loadSettings() {
        window.__PurpuraSettings.ready.then(function() {
            var stored = window.__PurpuraSettings.get('qp');
            var newState = stored === undefined ? true : stored === true;
            
            if (newState !== isEnabled) {
                isEnabled = newState;
                
                if (isEnabled && isQPPage()) {
                    injectStyles();
                    createGlobalPrivateServerContainer();
                    processGameCards();
                } else if (!isEnabled) {
                    if (observer) { observer.disconnect(); observer = null; }
                    if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
                    document.querySelectorAll('.purpura-quick-play-buttons').forEach(el => el.remove());
                    document.querySelectorAll('[data-purpura-quick-play]').forEach(el => {
                        el.removeAttribute('data-purpura-quick-play');
                    });
                    document.getElementById('purpura-private-servers-dropdown')?.remove();
                }
            }
        });
    }

    loadSettings();

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync' && changes['qp']) {
            loadSettings();
        }
    });

    function startQuickPlay() {
        if (!document.head || !document.body) return;
        if (!isQPPage()) return;
        injectStyles();
        createGlobalPrivateServerContainer();
        processGameCards();
        isEnabled = true;
        observer = observeGameCards();
    }

    function setupSPAWatcher() {
        if (window.__purpuraQPSPAWatcher) return;
        window.__purpuraQPSPAWatcher = true;

        let lastUrl = window.location.href;

        const onNav = () => {
            const newUrl = window.location.href;
            if (newUrl === lastUrl) return;
            lastUrl = newUrl;
            if (isEnabled && isQPPage()) {
                processGameCards();
            }
        };

        const origPush = history.pushState.bind(history);
        history.pushState = function (...args) {
            origPush(...args);
            setTimeout(onNav, 50);
        };

        const origReplace = history.replaceState.bind(history);
        history.replaceState = function (...args) {
            origReplace(...args);
            setTimeout(onNav, 50);
        };

        window.addEventListener('popstate', () => setTimeout(onNav, 50));
    }

    let retryTimer = null;

    function startStaggeredRetries() {
        function scheduleRetry(delay) {
            retryTimer = setTimeout(() => {
                retryTimer = null;
                if (isEnabled && isQPPage()) {
                    const cards = document.querySelectorAll('.game-card-link[href*="/games/"]:not([data-purpura-quick-play])');
                    if (cards.length > 0) {
                        processGameCards();
                    } else if (delay < 1000) {
                        scheduleRetry(delay + 400);
                    }
                }
            }, delay);
        }
        scheduleRetry(200);
    }

    let observer = null;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            startQuickPlay();
            setupSPAWatcher();
            startStaggeredRetries();
        });
    } else {
        startQuickPlay();
        setupSPAWatcher();
        startStaggeredRetries();
    }

    window.addEventListener('beforeunload', () => {
        if (observer) {
            observer.disconnect();
        }
        if (retryTimer) {
            clearTimeout(retryTimer);
        }
    });
})();
