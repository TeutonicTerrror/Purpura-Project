/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
if (!window.pinnedGamesInitialized) { window.pinnedGamesInitialized = true;
(() => {
    const fetch = window.__purpuraFirefoxFetch || window.fetch.bind(window);
    function t(key, substitutions) { return chrome.i18n.getMessage(key, substitutions) || key; }

    let pinnedGames = [];
    let folders = [];
    let currentFolderId = null;
    let liveUpdateInterval = null;
    let autoSyncInterval = null;
    let allGameCards = [];
    let lastApiCallTime = 0;
    let apiCallCount = 0;
    const API_RATE_LIMIT_DELAY = 2000;
    const API_RATE_LIMIT_RESET = 60000;
    const AUTO_SYNC_INTERVAL = 4 * 60 * 60 * 1000;
    
    const playerCountCache = new Map();
    const CACHE_DURATION = 45000;

    const voteCache = new Map();
    const VOTE_CACHE_DURATION = 15 * 60 * 1000;
    
    const gameInfoCache = new Map();
    const GAME_INFO_CACHE_DURATION = 5 * 60 * 1000;
    
    let refreshDebounceTimer = null;
    const REFRESH_DEBOUNCE_DELAY = 300;
    
    let currentTheme = 'dark';
    let themeObserver = null;

    initializePinnedGames();

    async function setupThemeObserver() {
        try {
            const response = await chrome.runtime.sendMessage({ action: "getRobloxTheme" });
            currentTheme = response?.theme || 'dark';
        } catch (e) { }

        updateThemeStyles();

        if (themeObserver) themeObserver.disconnect();
        themeObserver = new MutationObserver(async () => {
            try {
                const response = await chrome.runtime.sendMessage({ action: "getRobloxTheme" });
                const newTheme = response?.theme || 'dark';
                if (newTheme !== currentTheme) {
                    currentTheme = newTheme;
                    updateThemeStyles();
                }
            } catch (e) { }
        });

        const observeOptions = { attributes: true, attributeFilter: ['class'] };
        themeObserver.observe(document.documentElement, observeOptions);
        if (document.body) themeObserver.observe(document.body, observeOptions);
    }

    function updateThemeStyles() {
        const isLight = currentTheme === 'light';
        let style = document.getElementById('purpura-pinned-games-vars');
        if (!style) {
            style = document.createElement('style');
            style.id = 'purpura-pinned-games-vars';
            document.head.appendChild(style);
        }

        style.textContent = `
            :root {
                --pg-bg: ${isLight ? 'rgba(255, 255, 255, 0.55)' : 'rgba(15, 7, 25, 0.35)'};
                --pg-card-bg: ${isLight ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.05)'};
                --pg-card-hover: ${isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(138, 43, 226, 0.18)'};
                --pg-text: ${isLight ? '#0f172a' : '#f8fafc'};
                --pg-muted: ${isLight ? '#475569' : '#94a3b8'};
                --pg-accent: #8A2BE2;
                --pg-accent-muted: rgba(138, 43, 226, 0.4);
                --pg-border: ${isLight ? 'rgba(0, 0, 0, 0.14)' : 'rgba(138, 43, 226, 0.3)'};
                --pg-shadow: ${isLight ? '0 16px 48px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.8), inset 1px 0 0 rgba(255,255,255,0.8)' : '0 12px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1), inset 1px 0 0 rgba(255,255,255,0.1)'};
                --pg-glass: blur(45px) saturate(${isLight ? '140%' : '180%'});
                --pg-input-bg: ${isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)'};
                --pg-tooltip-bg: ${isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(15, 7, 25, 0.9)'};
                --pg-chip-count-bg: ${isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.1)'};
            }
            .pinned-games-carousel * { box-sizing: border-box; }
        `;
        
        injectFolderStyles();
    }

    async function initializePinnedGames() {
        await window.__PurpuraSettings.ready;
        if (!window.__PurpuraSettings.get('pg')) return;

        setupThemeObserver();

        const pinnedData = await chrome.storage.local.get(['pinnedGamesList', 'pinnedGamesFolders']);
        pinnedGames = pinnedData.pinnedGamesList || [];
        folders = pinnedData.pinnedGamesFolders || [];

        let needsMigration = false;
        pinnedGames.forEach(game => {
            if (game.folderId !== undefined && !game.folderIds) {
                game.folderIds = game.folderId ? [game.folderId] : [];
                delete game.folderId;
                needsMigration = true;
            } else if (!game.folderIds) {
                game.folderIds = [];
                needsMigration = true;
            }
        });
        if (needsMigration) {
            await chrome.storage.local.set({ pinnedGamesList: pinnedGames });
        }

        setupSpaNavigationWatcher();

        const currentUrl = window.location.href;
        
        if (currentUrl.includes('/games/')) {
            initializeGamePage();
        } else if (isHomePage(currentUrl)) {
            initializeHomePage();
        } else if (isChartsPage(currentUrl)) {
            initializeChartsPage();
        }
    }

    function initializeGamePage() {
        const favoriteContainer = document.querySelector('.favorite-follow-vote-share');
        if (!favoriteContainer) {
            setTimeout(initializeGamePage, 1000);
            return;
        }

        addPinButton(favoriteContainer);
    }

    function addPinButton(container) {
        if (container.querySelector('.pin-game-button-container')) return;

        const favoriteButton = container.querySelector('.game-favorite-button-container');
        if (!favoriteButton) return;

        const gameId = extractGameIdFromUrl();
        if (!gameId) return;

        const pinButtonContainer = document.createElement('li');
        pinButtonContainer.className = 'pin-game-button-container';
        pinButtonContainer.style.cssText = `
            display: inline-flex;
            align-items: center;
            margin: 0;
            padding: 0;
            list-style: none;
            vertical-align: middle;
        `;
        
        const isPinned = pinnedGames.some(game => game.id === gameId);
        
        pinButtonContainer.innerHTML = `
            <div class="tooltip-container" data-toggle="tooltip" data-original-title="${isPinned ? t('pinnedGames_unpin') : t('pinnedGames_pinAction')}">
                <button class="btn-secondary-xs btn-min-width pin-game-btn" data-game-id="${gameId}" style="
                    background: transparent;
                    border: none;
                    color: white;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    padding: 8px 6px;
                    border-radius: 3px;
                    font-size: 12px;
                    font-weight: 400;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    min-height: 48px;
                    min-width: 48px;
                    opacity: 0.8;
                    margin: 0;
                ">
                    <svg class="pin-icon" width="20" height="20" viewBox="0 0 24 24" fill="${isPinned ? 'white' : 'none'}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 12V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v8L6 14v2h5v6l1-1 1 1v-6h5v-2l-2-2z"/>
                    </svg>
                    <span class="btn-text" style="font-size: 12px; line-height: 1; text-align: center; width: 100%; display: block; margin: 0; padding: 0;">${isPinned ? t('pinnedGames_pinned') : t('pinnedGames_pinAction')}</span>
                </button>
            </div>
        `;

        const pinButton = pinButtonContainer.querySelector('.pin-game-btn');
        pinButton.addEventListener('click', () => handlePinClick(gameId, pinButton));

        pinButton.addEventListener('mouseenter', () => {
            pinButton.style.opacity = '1';
            pinButton.style.transform = 'scale(1.05)';
            pinButton.style.transition = 'all 0.2s ease';
        });

        pinButton.addEventListener('mouseleave', () => {
            pinButton.style.transform = 'scale(1)';
            if (pinButton.classList.contains('pinned')) {
                pinButton.style.opacity = '1';
            } else {
                pinButton.style.opacity = '0.8';
            }
        });

        if (typeof $ !== 'undefined' && $.fn.tooltip) {
            $(tooltipContainer).tooltip();
        }

        favoriteButton.parentNode.insertBefore(pinButtonContainer, favoriteButton);

        fixNativeButtonContainerSizes();

        if (isPinned) {
            pinButton.classList.add('pinned');
            pinButton.style.opacity = '1'; 
            const pinIcon = pinButton.querySelector('.pin-icon');
            const btnText = pinButton.querySelector('.btn-text');
            const tooltipContainer = pinButton.querySelector('.tooltip-container');
            
            if (pinIcon) {
                pinIcon.setAttribute('fill', '#FFFFFF');
                pinIcon.setAttribute('stroke', '#FFFFFF');
            }
            if (btnText) btnText.textContent = t('pinnedGames_pinned');
            if (tooltipContainer) tooltipContainer.setAttribute('data-original-title', t('pinnedGames_unpin'));
        }
    }

    function fixNativeButtonContainerSizes() {
        const style = document.createElement('style');
        style.textContent = `
            .favorite-follow-vote-share {
                display: flex !important;
                align-items: center !important;
                gap: 12px !important;
                flex-wrap: nowrap !important;
            }
            
            #voting-section {
                display: revert !important;
                flex: none !important;
            }
            
            .pin-game-button-container,
            .game-favorite-button-container,
            .game-follow-button-container {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                margin: 0 !important;
                padding: 0 !important;
                width: auto !important;
                height: auto !important;
                min-width: 48px !important;
                min-height: 48px !important;
            }
            
            .game-favorite-button-container .tooltip-container,
            .game-follow-button-container .tooltip-container {
                width: 100% !important;
                height: 100% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            }
            
            .game-favorite-button-container .favorite-button,
            .game-follow-button-container .follow-button {
                width: 100% !important;
                height: 100% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                min-width: 48px !important;
                min-height: 48px !important;
            }
            
            .game-favorite-button-container .favorite-button a,
            .game-follow-button-container .follow-button a {
                width: 100% !important;
                height: 100% !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 4px !important;
                padding: 8px 6px !important;
                text-decoration: none !important;
            }
        `;
        
        if (!document.querySelector('#pinned-games-button-fix-style')) {
            style.id = 'pinned-games-button-fix-style';
            document.head.appendChild(style);
        }
    }

    async function handlePinClick(gameId, button) {
        const gameInfo = await getGameInfo(gameId);
        if (!gameInfo) {
            return;
        }

        const isCurrentlyPinned = pinnedGames.some(game => game.id === gameId);
        
        if (isCurrentlyPinned) {
            pinnedGames = pinnedGames.filter(game => game.id !== gameId);
            button.classList.remove('pinned');
            button.style.opacity = '0.8'; 
            
            const btnText = button.querySelector('.btn-text');
            const pinIcon = button.querySelector('.pin-icon');
            const tooltipContainer = button.querySelector('.tooltip-container');
            
            if (btnText) btnText.textContent = t('pinnedGames_pinAction');
            if (pinIcon) {
                pinIcon.setAttribute('fill', 'none');
                pinIcon.setAttribute('stroke', 'white');
            }
            if (tooltipContainer) {
                tooltipContainer.setAttribute('data-original-title', t('pinnedGames_pinAction'));
                if (typeof $ !== 'undefined' && $.fn.tooltip) {
                    $(tooltipContainer).tooltip('dispose').tooltip();
                }
            }
        } else {
            pinnedGames.push(gameInfo);
            button.classList.add('pinned');
            button.style.opacity = '1'; 
            
            const btnText = button.querySelector('.btn-text');
            const pinIcon = button.querySelector('.pin-icon');
            const tooltipContainer = button.querySelector('.tooltip-container');
            
            if (btnText) btnText.textContent = t('pinnedGames_pinned');
            if (pinIcon) {
                pinIcon.setAttribute('fill', '#FFFFFF');
                pinIcon.setAttribute('stroke', '#FFFFFF');
            }
            if (tooltipContainer) {
                tooltipContainer.setAttribute('data-original-title', t('pinnedGames_unpin'));
                if (typeof $ !== 'undefined' && $.fn.tooltip) {
                    $(tooltipContainer).tooltip('dispose').tooltip();
                }
            }
        }

        await chrome.storage.local.set({ pinnedGamesList: pinnedGames });
    }

    async function updatePinnedGamesOrder(newOrder) {
        pinnedGames = newOrder;
        await chrome.storage.local.set({ pinnedGamesList: pinnedGames });
    }

    async function createFolder(name, color = '#8A2BE2') {
        const newFolder = {
            id: Date.now().toString(),
            name: name,
            color: color,
            gameIds: [],
            collapsed: false
        };
        
        folders.push(newFolder);
        await chrome.storage.local.set({ pinnedGamesFolders: folders });
        
        return newFolder;
    }

    async function deleteFolder(folderId) {
        const folder = folders.find(f => f.id === folderId);
        if (!folder) return;
        
        pinnedGames.forEach(game => {
            if (game.folderIds) {
                game.folderIds = game.folderIds.filter(id => id !== folderId);
            }
        });
        
        folders = folders.filter(f => f.id !== folderId);
        
        await chrome.storage.local.set({ 
            pinnedGamesFolders: folders,
            pinnedGamesList: pinnedGames
        });
    }

    async function updateFolder(folderId, updates) {
        const folder = folders.find(f => f.id === folderId);
        if (!folder) return;
        
        Object.assign(folder, updates);
        await chrome.storage.local.set({ pinnedGamesFolders: folders });
    }

    async function moveGameToFolder(gameId, folderId) {
        await toggleGameInFolder(gameId, folderId);
    }

    async function toggleGameInFolder(gameId, folderId) {
        const game = pinnedGames.find(g => g.id === gameId);
        if (!game) return;
        
        if (!game.folderIds) game.folderIds = [];
        
        if (folderId === null) {
            game.folderIds = [];
        } else {
            if (game.folderIds.includes(folderId)) {
                game.folderIds = game.folderIds.filter(id => id !== folderId);
            } else {
                game.folderIds.push(folderId);
            }
        }
        
        await chrome.storage.local.set({ pinnedGamesList: pinnedGames });
    }

    function getGamesInFolder(folderId) {
        if (folderId === null) {
            return pinnedGames;
        }
        return pinnedGames.filter(game => game.folderIds && game.folderIds.includes(folderId));
    }

    function getFolderName(folderId) {
        if (folderId === null) return 'All Games';
        const folder = folders.find(f => f.id === folderId);
        return folder ? folder.name : 'Unknown';
    }

    async function animateGameMove(gameId, targetFolderId) {
        const game = pinnedGames.find(g => g.id === gameId);
        const isCurrentlyInTargetFolder = targetFolderId !== null && game?.folderIds?.includes(targetFolderId);
        const removingFromCurrentView = currentFolderId !== null && isCurrentlyInTargetFolder && targetFolderId === currentFolderId;

        const card = document.querySelector(`[data-game-id="${gameId}"]`);
        
        if (card && removingFromCurrentView) {
            card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 1, 1)';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.8) translateY(-20px)';
            
            await new Promise(resolve => setTimeout(resolve, 400));
            
            card.remove();
        }
        
        await toggleGameInFolder(gameId, targetFolderId);
        
        updateFolderCounts();
        debouncedRefresh();
    }

    function updateFolderCounts() {
        const nav = document.querySelector('.pinned-games-carousel .pgf-nav');
        if (!nav) return;

        nav.querySelectorAll('.pgf-chip').forEach(btn => {
            const folderId = btn.dataset.folderId === 'null' ? null : btn.dataset.folderId;
            const countBadge = btn.querySelector('.pgf-chip-count');
            if (countBadge) {
                countBadge.textContent = getGamesInFolder(folderId).length;
            }
        });
    }

    let homeSentinelObserver = null;
    let chartsSentinelObserver = null;
    let urlWatcherInitialized = false;
    let heartbeatInterval = null;

    function isHomePage(url) {
        return url === 'https://www.roblox.com/home'
            || url === 'https://www.roblox.com/'
            || url === 'https://www.roblox.com';
    }

    function isChartsPage(url) {
        return url.startsWith('https://www.roblox.com/charts');
    }

    function stopHeartbeat() {
        if (!heartbeatInterval) return;
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }

    function startHeartbeat() {
        if (heartbeatInterval) return;
        heartbeatInterval = setInterval(() => {
            if (document.visibilityState !== 'visible') return;
            if (pinnedGames.length === 0) return;
            const url = window.location.href;
            if (isHomePage(url)) {
                if (!document.querySelector('.pinned-games-carousel')) {
                    const anchor = document.querySelector('.friend-carousel-container');
                    if (isSafeMainContentAnchor(anchor)) createPinnedGamesCarousel(anchor, 'afterend');
                }
            } else if (isChartsPage(url)) {
                if (!document.querySelector('.pinned-games-carousel')) {
                    const anchor = document.querySelector('.filters-container');
                    if (isSafeMainContentAnchor(anchor)) createPinnedGamesCarousel(anchor, 'afterend');
                }
            }
        }, 2200);
    }

    function setupSpaNavigationWatcher() {
        if (urlWatcherInitialized) return;
        urlWatcherInitialized = true;

        const initialUrl = window.location.href;
        if (isHomePage(initialUrl) || isChartsPage(initialUrl)) {
            startHeartbeat();
        }

        let lastUrl = window.location.href;
        let navDebounce = null;

        const onNavigate = () => {
            const newUrl = window.location.href;
            if (newUrl === lastUrl) return;
            lastUrl = newUrl;
            if (navDebounce) clearTimeout(navDebounce);
            navDebounce = setTimeout(() => handlePageChange(newUrl), 200);
        };

        const origPushState = history.pushState.bind(history);
        history.pushState = function (...args) {
            origPushState(...args);
            setTimeout(onNavigate, 50);
        };

        const origReplaceState = history.replaceState.bind(history);
        history.replaceState = function (...args) {
            origReplaceState(...args);
            setTimeout(onNavigate, 50);
        };

        window.addEventListener('popstate', () => setTimeout(onNavigate, 50));
        document.addEventListener('visibilitychange', () => {
            const currentUrl = window.location.href;
            if (document.visibilityState === 'visible' && (isHomePage(currentUrl) || isChartsPage(currentUrl))) {
                startHeartbeat();
            } else if (document.visibilityState !== 'visible') {
                stopHeartbeat();
            }
        });
    }

    function handlePageChange(url) {
        const onHome = isHomePage(url);
        const onCharts = isChartsPage(url);

        if (!onHome && homeSentinelObserver) {
            homeSentinelObserver.disconnect();
            homeSentinelObserver = null;
        }
        if (!onCharts && chartsSentinelObserver) {
            chartsSentinelObserver.disconnect();
            chartsSentinelObserver = null;
        }

        const c = document.querySelector('.pinned-games-carousel');
        if (c) c.remove();

        if (liveUpdateInterval) { clearInterval(liveUpdateInterval); liveUpdateInterval = null; }
        if (autoSyncInterval) { clearInterval(autoSyncInterval); autoSyncInterval = null; }

        if (!onHome && !onCharts) {
            stopHeartbeat();
            return;
        }

        startHeartbeat();

        if (onHome) initializeHomePage();
        else if (onCharts) initializeChartsPage();
    }

    function makeSentinel(getAnchor, anchorClass, getIsOnPage, storeKey) {
        if (storeKey === 'home') {
            if (homeSentinelObserver) { homeSentinelObserver.disconnect(); homeSentinelObserver = null; }
        } else {
            if (chartsSentinelObserver) { chartsSentinelObserver.disconnect(); chartsSentinelObserver = null; }
        }

        let sentinelDebounce = null;

        const tryNow = () => {
            if (!getIsOnPage()) return;
            if (pinnedGames.length === 0) return;
            if (document.querySelector('.pinned-games-carousel')) return;
            const anchor = getAnchor();
            if (anchor) { createPinnedGamesCarousel(anchor, 'afterend'); return; }
            setTimeout(tryNow, 300);
        };
        tryNow();

        const obs = new MutationObserver((mutations) => {
            if (!getIsOnPage() || pinnedGames.length === 0) return;
            if (document.querySelector('.pinned-games-carousel')) return;
            if (sentinelDebounce) return;
            sentinelDebounce = setTimeout(() => {
                sentinelDebounce = null;
                if (!getIsOnPage() || pinnedGames.length === 0) return;
                if (document.querySelector('.pinned-games-carousel')) return;
                const anchor = getAnchor();
                if (anchor) { createPinnedGamesCarousel(anchor, 'afterend'); return; }
                for (const m of mutations) {
                    for (const node of m.addedNodes) {
                        if (node.nodeType !== 1) continue;
                        const a = node.classList?.contains(anchorClass)
                            ? node
                            : node.querySelector?.('.' + anchorClass);
                        if (a) { createPinnedGamesCarousel(a, 'afterend'); return; }
                    }
                }
            }, 80);
        });
        obs.observe(document.body, { childList: true, subtree: true });

        if (storeKey === 'home') homeSentinelObserver = obs;
        else chartsSentinelObserver = obs;
    }

    function initializeHomePage() {
        makeSentinel(
            () => {
                const anchor = document.querySelector('.friend-carousel-container');
                return isSafeMainContentAnchor(anchor) ? anchor : null;
            },
            'friend-carousel-container',
            () => isHomePage(window.location.href),
            'home'
        );
    }

    function initializeChartsPage() {
        makeSentinel(
            () => {
                const anchor = document.querySelector('.filters-container');
                return isSafeMainContentAnchor(anchor) ? anchor : null;
            },
            'filters-container',
            () => isChartsPage(window.location.href),
            'charts'
        );
    }

    function injectFolderStyles() {
        if (document.getElementById('pgf-styles')) return;
        const s = document.createElement('style');
        s.id = 'pgf-styles';
        s.textContent = `            .pgf-nav {
                display: flex;
                gap: 8px;
                align-items: center;
                margin: 10px 0 0;
                padding: 2px 0;
                max-width: 100%;
                min-width: 0;
                overflow-x: auto;
                overflow-y: hidden;
                overscroll-behavior-x: contain;
                -webkit-overflow-scrolling: touch;
                padding-bottom: 8px;
            }
            .pgf-nav::-webkit-scrollbar { height: 6px; }
            .pgf-nav::-webkit-scrollbar-track { background: transparent; }
            .pgf-nav::-webkit-scrollbar-thumb {
                background: var(--color-shift-400, rgba(255,255,255,0.24));
                border-radius: 999px;
            }
            .pgf-nav::-webkit-scrollbar-thumb:hover { background: var(--color-shift-400, rgba(255,255,255,0.4)); }
            .pgf-chip-wrap { position: relative; flex-shrink: 0; }
            .pgf-chip {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                height: 32px;
                padding: 0 12px;
                border-radius: 999px;
                border: 1px solid transparent;
                background: var(--purpura-surface200, var(--color-surface-200, rgba(255,255,255,0.06)));
                color: var(--purpura-mainText, var(--color-content-default, #f2f4f5));
                font-size: 13px;
                font-weight: 600;
                line-height: 1;
                cursor: pointer;
                white-space: nowrap;
                transition: background-color 0.16s ease, border-color 0.16s ease;
            }
            .pgf-chip:hover {
                background: var(--purpura-surface300, var(--color-surface-300, rgba(255,255,255,0.12)));
            }
            .pgf-chip.active {
                background: var(--purpura-surface300, var(--color-surface-300, rgba(255,255,255,0.16)));
                border-color: var(--purpura-surface300, var(--color-stroke-default, rgba(255,255,255,0.24)));
                font-weight: 700;
            }
            .pgf-chip-count {
                background: none;
                border: none;
                border-radius: 0;
                padding: 0;
                font-size: 11px;
                font-weight: 600;
                min-width: 0;
                height: auto;
                line-height: 1;
                opacity: 0.6;
                color: inherit;
            }
            .pgf-chip-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
            .pgf-chip-more {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 18px;
                height: 18px;
                margin: 0 -4px 0 2px;
                border-radius: 4px;
                font-size: 13px;
                line-height: 1;
                opacity: 0;
                transition: opacity 0.15s ease, background-color 0.15s ease;
            }
            .pgf-chip-wrap:hover .pgf-chip-more,
            .pgf-chip.active .pgf-chip-more { opacity: 0.6; }
            .pgf-chip-more:hover { opacity: 1; background: rgba(255,255,255,0.14); }
            .pgf-new-btn {
                flex-shrink: 0;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                height: 32px;
                padding: 0 12px;
                border-radius: 999px;
                border: 1px dashed var(--purpura-surface300, var(--color-stroke-default, rgba(255,255,255,0.24)));
                background: transparent;
                color: var(--purpura-secondaryText, var(--color-content-muted, #a3a3a3));
                font-size: 13px;
                font-weight: 600;
                white-space: nowrap;
                cursor: pointer;
                transition: background-color 0.16s ease, color 0.16s ease, border-color 0.16s ease;
            }
            .pgf-new-btn:hover { 
                background: var(--purpura-surface200, var(--color-state-hover, rgba(255,255,255,0.08)));
                border-color: var(--purpura-surface300, var(--color-stroke-default, rgba(255,255,255,0.32)));
                color: var(--purpura-mainText, var(--color-content-default, #f2f4f5));
            }
            .pgf-modal-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.6);
                z-index: 100000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: pgf-fade 0.2s ease;
            }
            .pgf-modal {
                width: 340px;
                max-width: calc(100vw - 32px);
                padding: 20px;
                border-radius: 8px;
                background: var(--purpura-surface100, var(--color-surface-100, #232527));
                border: 1px solid var(--purpura-surface300, var(--color-stroke-default, rgba(255,255,255,0.16)));
                color: var(--purpura-mainText, var(--color-content-default, #f2f4f5));
                box-shadow: 0 12px 32px rgba(0,0,0,0.5);
                animation: pgf-up 0.2s ease;
            }
            .pgf-modal-title {
                margin: 0 0 16px;
                font-size: 16px;
                font-weight: 700;
                color: inherit;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .pgf-modal-label { font-size: 12px; font-weight: 600; color: var(--purpura-secondaryText, var(--color-content-muted, #a3a3a3)); margin-bottom: 6px; }
            .pgf-modal-body { font-size: 14px; line-height: 1.45; margin-bottom: 8px; }
            .pgf-modal-sub { font-size: 12px; color: var(--purpura-secondaryText, var(--color-content-muted, #a3a3a3)); margin-bottom: 18px; }
            .pgf-modal-input {
                width: 100%;
                height: 36px;
                padding: 0 10px;
                border-radius: 6px;
                border: 1px solid var(--purpura-surface300, var(--color-stroke-default, rgba(255,255,255,0.16)));
                background: var(--purpura-surface200, var(--color-surface-200, rgba(255,255,255,0.06)));
                color: inherit;
                font: inherit;
                font-size: 14px;
                outline: none;
                box-sizing: border-box;
                margin-bottom: 16px;
                transition: border-color 0.16s ease;
            }
            .pgf-modal-input:focus { border-color: var(--purpura-mainText, var(--color-content-emphasis, rgba(255,255,255,0.5))); }
            .pgf-color-grid { display: grid; grid-template-columns: repeat(6,1fr); gap: 8px; margin-bottom: 20px; }
            .pgf-swatch {
                aspect-ratio: 1;
                border-radius: 6px;
                cursor: pointer;
                border: 2px solid transparent;
                transition: transform 0.12s ease, border-color 0.12s ease;
            }
            .pgf-swatch:hover { transform: scale(1.08); }
            .pgf-swatch.selected { border-color: var(--purpura-mainText, var(--color-content-emphasis, #fff)); }
            .pgf-modal-footer { display: flex; gap: 8px; }
            .pgf-btn {
                flex: 1;
                height: 32px;
                padding: 0 14px;
                border-radius: 6px;
                font: inherit;
                font-size: 14px;
                font-weight: 600;
                border: 1px solid transparent;
                cursor: pointer;
                transition: background-color 0.16s ease, border-color 0.16s ease, opacity 0.16s ease;
            }
            .pgf-btn-primary {
                background: var(--purpura-mainText, var(--color-action-emphasis, #ffffff));
                color: var(--purpura-surface100, var(--color-surface-100, #1f2025));
            }
            .pgf-btn-primary:hover { opacity: 0.88; }
            .pgf-btn-ghost {
                background: transparent;
                border-color: var(--purpura-surface300, var(--color-stroke-default, rgba(255,255,255,0.2)));
                color: inherit;
            }
            .pgf-btn-ghost:hover { background: var(--purpura-surface200, var(--color-state-hover, rgba(255,255,255,0.08))); }
            .pgf-btn-danger { background: #e5484d; color: #ffffff; }
            .pgf-btn-danger:hover { background: #d93a3f; }
            @keyframes pgf-fade { from { opacity:0; } to { opacity:1; } }
            @keyframes pgf-up { from { opacity:0; transform:translateY(20px) scale(0.95); } to { opacity:1; transform:none; } }
            @keyframes pgf-fade-in { 0% { opacity: 0; transform: translateY(12px) scale(0.98); } 100% { opacity: 1; transform: translateY(0) scale(1); } }`;
        document.head.appendChild(s);
    }

    function injectCarouselStyles() {
        if (document.getElementById('pgf-carousel-styles')) return;
        const s = document.createElement('style');
        s.id = 'pgf-carousel-styles';
        s.textContent = `
            .pinned-games-carousel {
                display: block;
                width: 100%;
                margin: 16px 0 20px;
                text-align: left;
                color: var(--purpura-mainText, var(--color-content-default, #f2f4f5));
                font-family: inherit;
            }
            .pinned-games-carousel *, .pinned-games-carousel *::before, .pinned-games-carousel *::after { box-sizing: border-box; }
            .pinned-games-carousel .pgf-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 16px;
                margin: 0 0 24px;
                padding: 0;
                text-align: left;
            }
            .pinned-games-carousel .pgf-title {
                margin: 0;
                padding: 0;
                font-size: 32px;
                font-weight: 700;
                line-height: normal;
                letter-spacing: -0.5px;
                text-align: left;
                color: var(--color-content-emphasis, var(--purpura-mainText, #ffffff));
            }
            .pinned-games-carousel .pgf-header .pgf-native-header {
                flex: 1 1 auto;
                min-width: 0;
                margin: 0;
            }
            .pinned-games-carousel .pgf-header-tools { display: flex; align-items: center; gap: 12px; flex-shrink: 0; margin-left: auto; }
            .pgf-icon-btn {
                width: 40px;
                height: 40px;
                padding: 0;
                border: 0;
                border-radius: 6px;
                background: transparent;
                color: var(--purpura-secondaryText, var(--color-content-muted, #a3a3a3));
                display: inline-flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: background-color 0.16s ease, color 0.16s ease;
            }
            .pgf-icon-btn:hover, .pgf-icon-btn.is-active {
                background: var(--purpura-surface200, var(--color-state-hover, rgba(255,255,255,0.08)));
                color: var(--purpura-mainText, var(--color-content-default, #f2f4f5));
            }
            .pgf-icon-btn svg { pointer-events: none; }
            .pgf-search-row { display: none; margin-top: 10px; }
            .pgf-search-row.open { display: block; }
            .pgf-search {
                display: flex;
                align-items: center;
                gap: 8px;
                height: 36px;
                padding: 0 12px;
                border-radius: 8px;
                border: 1px solid var(--purpura-surface300, var(--color-stroke-default, rgba(255,255,255,0.16)));
                background: var(--purpura-surface200, var(--color-surface-200, rgba(255,255,255,0.06)));
            }
            .pgf-search:focus-within { border-color: var(--purpura-mainText, var(--color-content-emphasis, rgba(255,255,255,0.5))); }
            .pgf-search input {
                flex: 1;
                min-width: 0;
                border: 0;
                outline: 0;
                padding: 0;
                margin: 0;
                background: transparent;
                color: inherit;
                font: inherit;
                font-size: 14px;
            }
            .pgf-search input::placeholder { color: var(--purpura-secondaryText, var(--color-content-muted, #a3a3a3)); }
            .pgf-search-clear { display: none; border: 0; background: transparent; color: inherit; opacity: 0.6; cursor: pointer; padding: 0; line-height: 1; font-size: 14px; }
            .pgf-search-clear:hover { opacity: 1; }
            .pgf-carousel { position: relative; margin-top: 12px; }
            .pinned-games-container {
                display: flex;
                align-items: flex-start;
                margin: 0;
                padding: 4px 2px 6px;
                list-style: none;
                overflow-x: auto;
                overflow-y: hidden;
                scroll-snap-type: x proximity;
                scroll-behavior: smooth;
                scrollbar-width: none;
                -ms-overflow-style: none;
            }
            .pinned-games-container::-webkit-scrollbar { display: none; }
            .pinned-games-container.is-adjusting { scroll-snap-type: none; }
            .pinned-games-carousel .scroller-new {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                padding: 0;
                border: 0;
                border-radius: 50%;
                background: var(--purpura-surface100, var(--color-surface-100, #232527));
                color: var(--purpura-mainText, var(--color-content-emphasis, #f2f4f5));
                box-shadow: 0 0 4px var(--color-common-shadow, rgba(0, 0, 0, 0.4));
                cursor: pointer;
                z-index: 4;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.16s ease, background-color 0.16s ease;
            }
            .pinned-games-carousel .scroller-new.prev { left: 0; }
            .pinned-games-carousel .scroller-new.next { right: 0; }
            .pinned-games-carousel .scroller-new.next svg { transform: scaleX(-1); }
            .pinned-games-carousel .scroller-new[aria-disabled="false"],
            .pinned-games-carousel .scroller-new:focus-visible { opacity: 0.9; pointer-events: auto; }
            .pinned-games-carousel .scroller-new[aria-disabled="false"]:hover {
                opacity: 1;
                background: var(--purpura-surface200, var(--color-surface-200, #2b2c32));
            }
            .pinned-games-carousel .scroller-new[aria-disabled="true"] { opacity: 0 !important; pointer-events: none; }

            :where(.pinned-game-card) {
                position: relative;
                width: 150px;
                min-width: 150px;
                margin-right: 12px;
                scroll-snap-align: start;
            }
            :where(.pinned-game-card) .game-card-container,
            :where(.pinned-game-card) .game-card-link {
                display: block;
                text-decoration: none;
                color: inherit;
            }
            :where(.pinned-game-card) .game-card-thumb-container {
                position: relative;
                width: 100%;
                aspect-ratio: 16 / 9;
                border-radius: 8px;
                overflow: hidden;
                background: var(--purpura-surface200, var(--color-surface-200, rgba(255,255,255,0.06)));
            }
            :where(.pinned-game-card) .game-card-thumb {
                display: block;
                width: 100%;
                height: 100%;
                border-radius: 8px;
                overflow: hidden;
            }
            :where(.pinned-game-card) .game-card-thumb img {
                display: block;
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .pinned-game-card .game-card-name {
                display: block;
                margin: 8px 0 2px;
                font-family: inherit;
                font-size: 16px;
                line-height: 20px;
                font-weight: 500;
                letter-spacing: normal;
                text-decoration: none;
                color: inherit;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .pinned-game-card .game-card-name.game-name-title { text-decoration: none; }
            :where(.pinned-game-card) .game-card-info {
                display: flex;
                align-items: center;
                gap: 4px;
                margin-top: 2px;
                font-size: 12px;
                line-height: 14px;
            }
            :where(.pinned-game-card) .playing-counts-label { transition: color 0.3s ease; }

            .pinned-game-card { cursor: pointer; }
            .pinned-game-card:focus-visible { outline: 2px solid var(--purpura-mainText, var(--color-content-emphasis, #fff)); outline-offset: 2px; border-radius: 8px; }
            .pinned-game-card .game-card-container { position: relative; }
            .pinned-game-card .game-card-thumb-container { position: relative; }
            .pgf-card-menu-btn {
                position: absolute;
                top: 6px;
                right: 6px;
                width: 26px;
                height: 26px;
                padding: 0;
                border: 0;
                border-radius: 4px;
                background: transparent;
                color: #ffffff;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                opacity: 0;
                pointer-events: none;
                z-index: 3;
                filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.65));
                transition: opacity 0.15s ease, background-color 0.15s ease;
            }
            .pinned-game-card:hover .pgf-card-menu-btn,
            .pinned-game-card:focus-within .pgf-card-menu-btn { opacity: 1; pointer-events: auto; }
            .pgf-card-menu-btn:hover { background: rgba(0, 0, 0, 0.38); }
            .pinned-game-card.dragging { opacity: 0.45; }
            .pinned-game-card.drag-over .game-card-thumb-container {
                outline: 2px solid var(--purpura-mainText, var(--color-content-emphasis, #fff));
                outline-offset: 2px;
            }
            .pinned-game-card.drop-success .game-card-thumb-container { animation: pgf-card-pop 0.4s ease; }
            @keyframes pgf-card-pop { 0% { transform: scale(0.96); } 50% { transform: scale(1.04); } 100% { transform: scale(1); } }

            .pgf-empty {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 10px;
                width: 100%;
                min-height: 118px;
                padding: 24px 16px;
                margin: 0;
                text-align: center;
                color: var(--purpura-secondaryText, var(--color-content-muted, #a3a3a3));
                font-size: 13px;
                font-weight: 500;
                list-style: none;
            }
            .pgf-empty img { width: 130px; max-width: 70%; opacity: 0.28; pointer-events: none; user-select: none; }
            .pgf-body { overflow: hidden; transition: max-height 0.25s ease, opacity 0.2s ease; max-height: 2000px; opacity: 1; }
            .pgf-body.is-collapsed { max-height: 0; opacity: 0; }

            .pgf-menu {
                position: fixed;
                z-index: 10001;
                min-width: 220px;
                max-height: 320px;
                overflow-y: auto;
                padding: 4px;
                border-radius: 8px;
                background: var(--purpura-surface100, var(--color-surface-100, #232527));
                border: 1px solid var(--purpura-surface300, var(--color-stroke-default, rgba(255,255,255,0.16)));
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
                color: var(--purpura-mainText, var(--color-content-default, #f2f4f5));
                font-family: inherit;
                scrollbar-width: thin;
            }
            .pgf-menu-item {
                display: flex;
                align-items: center;
                gap: 8px;
                width: 100%;
                padding: 8px 10px;
                border: 0;
                border-radius: 6px;
                background: transparent;
                color: inherit;
                font: inherit;
                font-size: 13px;
                text-align: left;
                cursor: pointer;
            }
            .pgf-menu-item:hover { background: var(--purpura-surface200, var(--color-state-hover, rgba(255,255,255,0.08))); }
            .pgf-menu-title {
                padding: 8px 10px 4px;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.06em;
                text-transform: uppercase;
                color: var(--purpura-secondaryText, var(--color-content-muted, #a3a3a3));
            }
            .pgf-menu-sep { height: 1px; margin: 4px 6px; background: var(--color-stroke-default, rgba(255,255,255,0.12)); }
            .pgf-menu-swatch { width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0; }
            .pgf-menu-check { margin-left: auto; opacity: 0.9; }

            @media (hover: none) {
                .pgf-card-menu-btn { opacity: 1; pointer-events: auto; }
                .pinned-games-carousel .scroller-new[aria-disabled="false"] { opacity: 0.9; pointer-events: auto; }
            }
            @media (max-width: 767px) {
                :where(.pinned-game-card) { width: 128px; min-width: 128px; }
                .pinned-games-carousel .scroller-new { width: 32px; height: 32px; }
            }
        `;
        document.head.appendChild(s);
    }
    function createFolderNavigation() {
        injectFolderStyles();
        const nav = document.createElement('div');
        nav.className = 'pgf-nav';

        nav.appendChild(createFolderButton('All Games', null, '#8A2BE2', getGamesInFolder(null).length));
        folders.forEach(folder => nav.appendChild(createFolderButton(folder.name, folder.id, folder.color, getGamesInFolder(folder.id).length)));

        const createBtn = document.createElement('button');
        createBtn.type = 'button';
        createBtn.className = 'pgf-new-btn';
        createBtn.title = t('pinnedGames_newFolder');
        createBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg><span>${t('pinnedGames_newFolder')}</span>`;
        createBtn.addEventListener('click', () => showCreateFolderDialog());
        nav.appendChild(createBtn);

        nav.addEventListener('wheel', (e) => {
            if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
            if (nav.scrollWidth - nav.clientWidth <= 1) return;
            e.preventDefault();
            nav.scrollLeft += e.deltaY;
        }, { passive: false });

        return nav;
    }

    function createFolderButton(name, folderId, color, gameCount) {
        const isActive = currentFolderId === folderId;
        const isAll = folderId === null;

        const wrap = document.createElement('div');
        wrap.className = 'pgf-chip-wrap';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `pgf-chip${isActive ? ' active' : ''}${isAll ? ' pgf-chip-all' : ''}`;
        btn.dataset.folderId = folderId || 'null';

        if (!isAll) {
            const dot = document.createElement('span');
            dot.className = 'pgf-chip-dot';
            dot.style.background = color;
            btn.appendChild(dot);
        }

        const label = document.createElement('span');
        label.textContent = name;
        btn.appendChild(label);

        const count = document.createElement('span');
        count.className = 'pgf-chip-count';
        count.textContent = gameCount;
        btn.appendChild(count);

        if (!isAll) {
            const more = document.createElement('span');
            more.className = 'pgf-chip-more';
            more.setAttribute('role', 'button');
            more.setAttribute('tabindex', '-1');
            more.setAttribute('aria-label', `${t('pinnedGames_options')} ${name}`);
            more.textContent = '⋯';
            more.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                showFolderChipMenu(folderId, more);
            });
            btn.appendChild(more);
        }

        btn.addEventListener('click', () => switchToFolder(folderId));
        wrap.appendChild(btn);
        return wrap;
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ?
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
            '138, 43, 226';
    }

    function switchToFolder(folderId) {
        currentFolderId = folderId;
        debouncedRefresh();
    }

    function openFolderModal({ title, nameValue, colorValue, confirmLabel, confirmClass, onConfirm }) {
        const COLORS = ['#8A2BE2','#7c3aed','#2563eb','#0891b2','#059669','#16a34a','#ca8a04','#ea580c','#dc2626','#db2777','#9333ea','#4f46e5'];
        injectFolderStyles();
        const resolved = colorValue || COLORS[0];
        const backdrop = document.createElement('div');
        backdrop.className = 'pgf-modal-backdrop';
        const modal = document.createElement('div');
        modal.className = 'pgf-modal';
        modal.innerHTML = `
            <div class="pgf-modal-title">${title}</div>
            <div class="pgf-modal-label">${t('pinnedGames_folderName')}</div>
            <input class="pgf-modal-input pgf-name-inp" type="text" value="${nameValue || ''}" placeholder="${t('pinnedGames_folderNamePlaceholder')}" maxlength="30">
            <div class="pgf-modal-label">${t('pinnedGames_color')}</div>
            <div class="pgf-color-grid">${COLORS.map(c => `<div class="pgf-swatch${c === resolved ? ' selected' : ''}" data-color="${c}" style="background:${c};"></div>`).join('')}</div>
            <div class="pgf-modal-footer">
                <button class="pgf-btn ${confirmClass || 'pgf-btn-primary'} pgf-confirm-btn">${confirmLabel}</button>
                <button class="pgf-btn pgf-btn-ghost pgf-cancel-btn">${t('pinnedGames_cancel')}</button>
            </div>
        `;
        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);

        let selectedColor = resolved;
        modal.querySelectorAll('.pgf-swatch').forEach(sw => {
            sw.addEventListener('click', () => {
                modal.querySelectorAll('.pgf-swatch').forEach(s => s.classList.remove('selected'));
                sw.classList.add('selected');
                selectedColor = sw.dataset.color;
            });
        });

        const nameInput = modal.querySelector('.pgf-name-inp');
        nameInput.focus();
        nameInput.select();

        const close = () => backdrop.remove();
        modal.querySelector('.pgf-cancel-btn').addEventListener('click', close);
        backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });

        const confirm = async () => {
            const name = nameInput.value.trim();
            if (!name) { nameInput.focus(); return; }
            close();
            await onConfirm(name, selectedColor);
        };
        modal.querySelector('.pgf-confirm-btn').addEventListener('click', confirm);
        nameInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') confirm();
            if (e.key === 'Escape') close();
        });
    }

    function showCreateFolderDialog(gameIdToMove = null) {
        openFolderModal({
            title: t('pinnedGames_newFolder'),
            confirmLabel: t('pinnedGames_add'),
            onConfirm: async (name, color) => {
                const newFolder = await createFolder(name, color);
                if (gameIdToMove && newFolder) {
                    await animateGameMove(gameIdToMove, newFolder.id);
                } else {
                    debouncedRefresh();
                }
            }
        });
    }

    function showFolderOptionsMenu(folderId, x, y) {
        showEditFolderDialog(folderId);
    }

    function showDeleteFolderConfirmation(folderId) {
        const folder = folders.find(f => f.id === folderId);
        if (!folder) return;
        injectFolderStyles();
        const gameCount = getGamesInFolder(folder.id).length;
        const backdrop = document.createElement('div');
        backdrop.className = 'pgf-modal-backdrop';
        const modal = document.createElement('div');
        modal.className = 'pgf-modal';
        modal.innerHTML = `
            <div class="pgf-modal-title" style="color:#f87171;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                ${t('pinnedGames_deleteFolderTitle')}
            </div>
            <div class="pgf-modal-body">${t('pinnedGames_deleteFolderConfirm', ['<strong style="color:' + folder.color + ';">' + folder.name + '</strong>'])}</div>
            <div class="pgf-modal-sub">${gameCount > 0 ? t('pinnedGames_deleteMovedToAll', [gameCount, gameCount === 1 ? '' : 's']) : t('pinnedGames_deleteFolderEmpty')}</div>
            <div class="pgf-modal-footer">
                <button class="pgf-btn pgf-btn-danger pgf-confirm-btn">${t('pinnedGames_delete')}</button>
                <button class="pgf-btn pgf-btn-ghost pgf-cancel-btn">${t('pinnedGames_cancel')}</button>
            </div>
        `;
        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);
        const close = () => backdrop.remove();
        backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });
        modal.querySelector('.pgf-cancel-btn').addEventListener('click', close);
        modal.querySelector('.pgf-confirm-btn').addEventListener('click', async () => {
            close();
            await deleteFolder(folderId);
            if (currentFolderId === folderId) currentFolderId = null;
            debouncedRefresh();
        });
        document.addEventListener('keydown', function onKey(e) {
            if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); }
        });
    }

    function showEditFolderDialog(folderId) {
        const folder = folders.find(f => f.id === folderId);
        if (!folder) return;
        openFolderModal({
            title: t('pinnedGames_editFolder'),
            nameValue: folder.name,
            colorValue: folder.color,
            confirmLabel: t('pinnedGames_save'),
            onConfirm: async (name, color) => {
                await updateFolder(folderId, { name, color });
                debouncedRefresh();
            }
        });
    }

    const EXCLUDED_ANCHOR_SELECTOR = '#left-navigation-container,.left-nav,.navigation-container,.groups-list-sidebar,.rbx-header,#header,#navigation';

    function isSafeMainContentAnchor(node) {
        if (!node || !node.isConnected) return false;
        return !(node.closest && node.closest(EXCLUDED_ANCHOR_SELECTOR));
    }

    function makePinnedIconButton(iconSvg, label) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pgf-icon-btn';
        btn.title = label;
        btn.setAttribute('aria-label', label);
        btn.innerHTML = iconSvg;
        return btn;
    }

    function syncCarouselArrows() {
        const carousel = document.querySelector('.pinned-games-carousel');
        if (!carousel) return;
        const container = carousel.querySelector('.pinned-games-container');
        const left = carousel.querySelector('.scroller-new.prev');
        const right = carousel.querySelector('.scroller-new.next');
        if (!container || !left || !right) return;
        const maxScroll = container.scrollWidth - container.clientWidth;
        const hasOverflow = maxScroll > 4;
        const setDisabled = (btn, disabled) => {
            btn.setAttribute('aria-disabled', disabled ? 'true' : 'false');
            btn.tabIndex = disabled ? -1 : 0;
        };
        setDisabled(left, !hasOverflow || container.scrollLeft <= 2);
        setDisabled(right, !hasOverflow || container.scrollLeft >= maxScroll - 2);
    }

    function applyPinnedGamesSearch() {
        const carousel = document.querySelector('.pinned-games-carousel');
        if (!carousel) return;
        const container = carousel.querySelector('.pinned-games-container');
        const input = carousel.querySelector('.pgf-search input');
        if (!container) return;

        const term = (input?.value || '').trim().toLowerCase();
        let anyVisible = false;

        allGameCards.forEach(({ card, game }) => {
            const visible = !term || game.name.toLowerCase().includes(term);
            card.style.display = visible ? '' : 'none';
            if (visible) anyVisible = true;
        });

        const existing = carousel.querySelector('.pgf-search-empty');
        const showEmpty = !!term && allGameCards.length > 0 && !anyVisible;
        if (showEmpty && !existing) {
            const msg = document.createElement('div');
            msg.className = 'pgf-empty pgf-search-empty';
            msg.textContent = t('pinnedGames_noGames');
            container.appendChild(msg);
        } else if (!showEmpty && existing) {
            existing.remove();
        }

        syncCarouselArrows();
    }

    function renderPinnedGamesInto(container) {
        allGameCards = [];
        container.innerHTML = '';

        const games = getGamesInFolder(currentFolderId);

        if (games.length === 0) {
            const empty = document.createElement('li');
            empty.className = 'pgf-empty';
            const img = document.createElement('img');
            img.src = chrome.runtime.getURL('images/builderman_signature.png');
            img.alt = '';
            img.style.filter = currentTheme === 'light' ? 'grayscale(1) contrast(0.4) opacity(0.5)' : 'invert(1) opacity(0.35)';
            const msg = document.createElement('span');
            msg.textContent = currentFolderId === null ? t('pinnedGames_buildermanLives') : t('pinnedGames_noGames');
            empty.appendChild(img);
            empty.appendChild(msg);
            container.appendChild(empty);
        } else {
            games.forEach(game => {
                const card = createGameCard(game);
                container.appendChild(card);
                allGameCards.push({ card, game });
            });
        }

        applyPinnedGamesSearch();
        startLivePlayerCountUpdates(allGameCards);
        refreshVotePercents(allGameCards);
        requestAnimationFrame(syncCarouselArrows);
    }

    const NATIVE_HEADER_WRAPPERS = ['[data-testid="section-header"]', '.game-sort-header-container'];
    const NATIVE_HEADER_SKIP = '.pinned-games-carousel, #purpuras-selection-container';

    function createNativeSectionHeader(text) {
        for (const selector of NATIVE_HEADER_WRAPPERS) {
            const template = Array.from(document.querySelectorAll(selector)).find(el =>
                !el.closest(NATIVE_HEADER_SKIP) &&
                !el.querySelector('.pinned-games-carousel, #purpuras-selection-container') &&
                el.querySelector('[data-testid="text-icon-row-text"], h2')
            );
            if (!template) continue;

            const header = template.cloneNode(true);
            header.removeAttribute('id');

            const title = header.querySelector('[data-testid="text-icon-row-text"], h2');
            if (!title) continue;

            let node = title;
            while (node && node !== header && node.parentElement) {
                const parent = node.parentElement;
                Array.from(parent.children).forEach(child => {
                    if (child !== node && !child.contains(title)) child.remove();
                });
                node = parent;
            }

            header.querySelectorAll('a').forEach(link => {
                const replacement = document.createElement('span');
                for (const attr of Array.from(link.attributes)) {
                    if (attr.name === 'href' || attr.name === 'target' || attr.name === 'rel') continue;
                    replacement.setAttribute(attr.name, attr.value);
                }
                replacement.append(...link.childNodes);
                link.replaceWith(replacement);
            });

            header.querySelectorAll('.games-filter-changer').forEach(el => el.classList.remove('games-filter-changer'));
            title.textContent = text;
            title.setAttribute('aria-label', text);
            header.setAttribute('aria-label', text);
            return header;
        }
        return null;
    }

    function createPinnedGamesCarousel(referenceElement, position) {
        if (document.querySelector('.pinned-games-carousel')) return;
        if (!isSafeMainContentAnchor(referenceElement)) return;

        injectFolderStyles();
        injectCarouselStyles();

        const carousel = document.createElement('div');
        carousel.className = 'pinned-games-carousel';
        carousel.setAttribute('aria-label', t('pinnedGames_title'));

        const header = document.createElement('div');
        header.className = 'pgf-header';

        const nativeHeader = createNativeSectionHeader(t('pinnedGames_pinnedGamesHeader'));
        if (nativeHeader) {
            nativeHeader.classList.add('pgf-native-header');
            header.appendChild(nativeHeader);
        } else {
            const title = document.createElement('h2');
            title.className = 'pgf-title';
            title.textContent = t('pinnedGames_pinnedGamesHeader');
            header.appendChild(title);
        }

        const tools = document.createElement('div');
        tools.className = 'pgf-header-tools';

        const searchBtn = makePinnedIconButton(
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
            t('pinnedGames_searchPlaceholder')
        );

        const collapseBtn = makePinnedIconButton(
            '<svg class="pgf-collapse-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.2s ease;"><polyline points="18 15 12 9 6 15"/></svg>',
            t('pinnedGames_collapse')
        );

        tools.append(searchBtn, collapseBtn);
        header.appendChild(tools);

        const body = document.createElement('div');
        body.className = 'pgf-body';

        const searchRow = document.createElement('div');
        searchRow.className = 'pgf-search-row';
        searchRow.innerHTML = `
            <div class="pgf-search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;opacity:0.6;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" placeholder="${t('pinnedGames_searchPlaceholder')}" aria-label="${t('pinnedGames_searchPlaceholder')}">
                <button type="button" class="pgf-search-clear" aria-label="${t('pinnedGames_searchPlaceholder')}">✕</button>
            </div>
        `;

        const folderNav = createFolderNavigation();

        const viewport = document.createElement('div');
        viewport.className = 'pgf-carousel';

        const gamesContainer = document.createElement('ul');
        gamesContainer.className = 'hlist games game-cards game-tile-list pinned-games-container';

        const makeCarouselScrollButton = (direction, label) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `scroller-new ${direction}`;
            btn.setAttribute('data-testid', 'game-carousel-scroll-bar');
            btn.setAttribute('aria-disabled', 'true');
            btn.setAttribute('aria-label', label);
            btn.tabIndex = -1;
            btn.innerHTML = '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M8.583 14c0-.332.132-.65.366-.884l6.25-6.25a1.25 1.25 0 0 1 1.768 1.768L11.6 14l5.366 5.366a1.25 1.25 0 0 1-1.768 1.768l-6.25-6.25A1.25 1.25 0 0 1 8.583 14"/></svg>';
            return btn;
        };

        const leftArrow = makeCarouselScrollButton('prev', t('pinnedGames_scrollLeft'));
        const rightArrow = makeCarouselScrollButton('next', t('pinnedGames_scrollRight'));

        viewport.append(leftArrow, gamesContainer, rightArrow);
        body.append(searchRow, folderNav, viewport);
        carousel.append(header, body);
        referenceElement.insertAdjacentElement(position, carousel);

        const searchInput = searchRow.querySelector('input');
        const clearBtn = searchRow.querySelector('.pgf-search-clear');

        const setSearchOpen = (open) => {
            searchRow.classList.toggle('open', open);
            searchBtn.classList.toggle('is-active', open);
            if (open) {
                searchInput.focus();
            } else if (searchInput.value) {
                searchInput.value = '';
                clearBtn.style.display = 'none';
                applyPinnedGamesSearch();
            }
            syncCarouselArrows();
        };

        searchBtn.addEventListener('click', () => setSearchOpen(!searchRow.classList.contains('open')));
        searchInput.addEventListener('input', () => {
            clearBtn.style.display = searchInput.value ? 'block' : 'none';
            applyPinnedGamesSearch();
        });
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            applyPinnedGamesSearch();
            searchInput.focus();
        });
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') setSearchOpen(false);
        });

        let isCollapsed = false;
        const applyCollapsed = (collapsed) => {
            isCollapsed = collapsed;
            body.classList.toggle('is-collapsed', collapsed);
            const chevron = collapseBtn.querySelector('.pgf-collapse-chevron');
            if (chevron) chevron.style.transform = collapsed ? 'rotate(180deg)' : 'rotate(0deg)';
            const label = collapsed ? t('pinnedGames_expand') : t('pinnedGames_collapse');
            collapseBtn.title = label;
            collapseBtn.setAttribute('aria-label', label);
        };

        applyCollapsed(window.__PurpuraSettings.get('pgfCollapsed') === true);
        collapseBtn.addEventListener('click', () => {
            const next = !isCollapsed;
            applyCollapsed(next);
            chrome.storage.local.set({ pgfCollapsed: next });
        });

        const scrollByPage = (direction) => {
            gamesContainer.scrollBy({
                left: direction * Math.max(240, gamesContainer.clientWidth * 0.8),
                behavior: 'smooth'
            });
        };
        leftArrow.addEventListener('click', () => scrollByPage(-1));
        rightArrow.addEventListener('click', () => scrollByPage(1));
        gamesContainer.addEventListener('scroll', syncCarouselArrows, { passive: true });
        window.addEventListener('resize', syncCarouselArrows);

        renderPinnedGamesInto(gamesContainer);
        requestAnimationFrame(syncCarouselArrows);
    }
    async function findSmallestServer(gameId) {
        try {

            const response = await fetch(`https://games.roblox.com/v1/games/${gameId}/servers/Public?sortOrder=Asc&limit=100`);
            
            if (response.status === 429) {
                
                window.location.href = `roblox://placeid=${gameId}`;
                return;
            }
            
            if (!response.ok) {
                throw new Error(`Server API request failed: ${response.status}`);
            }

            const serverData = await response.json();
            
            if (!serverData.data || serverData.data.length === 0) {
                
                window.location.href = `roblox://placeid=${gameId}`;
                return;
            }

            let smallestServer = null;
            let minPlayers = Infinity;

            for (const server of serverData.data) {
                if (server.playing > 0 && server.playing < minPlayers) {
                    minPlayers = server.playing;
                    smallestServer = server;
                }
            }

            if (!smallestServer) {
                for (const server of serverData.data) {
                    if (server.playing < server.maxPlayers) {
                        smallestServer = server;
                        break;
                    }
                }
            }

            if (smallestServer) {
                
                window.location.href = `roblox://placeid=${gameId}&gameinstanceid=${smallestServer.id}`;
            } else {
                
                window.location.href = `roblox://placeid=${gameId}`;
            }

        } catch (error) {
            
            window.location.href = `roblox://placeid=${gameId}`;
        }
    }

    async function handleGameReorder(draggedGameId, targetGameId) {

        const draggedIndex = pinnedGames.findIndex(game => game.id === draggedGameId);
        const targetIndex = pinnedGames.findIndex(game => game.id === targetGameId);

        if (draggedIndex === -1 || targetIndex === -1) {
            
            return;
        }

        const newOrder = [...pinnedGames];
        const draggedGame = newOrder.splice(draggedIndex, 1)[0];
        newOrder.splice(targetIndex, 0, draggedGame);

        await updatePinnedGamesOrder(newOrder);

        const container = document.querySelector('.pinned-games-container');
        if (container) {
            const draggedCard = container.querySelector(`[data-game-id="${draggedGameId}"]`);
            const targetCard = container.querySelector(`[data-game-id="${targetGameId}"]`);
            
            if (draggedCard && targetCard) {
                if (draggedIndex < targetIndex) {
                    targetCard.insertAdjacentElement('afterend', draggedCard);
                } else {
                    targetCard.insertAdjacentElement('beforebegin', draggedCard);
                }
            }
        }

    }

    function debouncedRefresh() {
        if (refreshDebounceTimer) {
            clearTimeout(refreshDebounceTimer);
        }
        
        refreshDebounceTimer = setTimeout(() => {
            const existingCarousel = document.querySelector('.pinned-games-carousel');
            if (existingCarousel) {
                updateCarouselInPlace(existingCarousel);
            } else {
                refreshPinnedGamesCarousel();
            }
            refreshDebounceTimer = null;
        }, REFRESH_DEBOUNCE_DELAY);
    }

    function updateCarouselInPlace(carousel) {
        const oldNav = carousel.querySelector('.pgf-nav');
        const newNav = createFolderNavigation();
        if (oldNav) {
            oldNav.replaceWith(newNav);
        } else {
            const viewport = carousel.querySelector('.pgf-carousel');
            if (viewport) viewport.before(newNav);
            else carousel.appendChild(newNav);
        }

        const gamesContainer = carousel.querySelector('.pinned-games-container');
        if (!gamesContainer) return;

        if (liveUpdateInterval) {
            clearInterval(liveUpdateInterval);
            liveUpdateInterval = null;
        }
        if (autoSyncInterval) {
            clearInterval(autoSyncInterval);
            autoSyncInterval = null;
        }

        gamesContainer.scrollLeft = 0;
        renderPinnedGamesInto(gamesContainer);
    }

    function refreshPinnedGamesCarousel() {
        if (homeSentinelObserver) {
            homeSentinelObserver.disconnect();
            homeSentinelObserver = null;
        }
        if (chartsSentinelObserver) {
            chartsSentinelObserver.disconnect();
            chartsSentinelObserver = null;
        }

        const existingCarousel = document.querySelector('.pinned-games-carousel');
        if (existingCarousel) {
            existingCarousel.remove();
        }

        if (liveUpdateInterval) {
            clearInterval(liveUpdateInterval);
            liveUpdateInterval = null;
        }

        if (autoSyncInterval) {
            clearInterval(autoSyncInterval);
            autoSyncInterval = null;
        }

        const href = window.location.href;
        if (isHomePage(href)) {
            initializeHomePage();
        } else if (isChartsPage(href)) {
            initializeChartsPage();
        }
    }

    function createGameCard(game) {
        const item = document.createElement('li');
        item.className = 'list-item game-card game-tile pinned-game-card';
        item.dataset.gameId = game.id;
        item.draggable = true;

        const container = document.createElement('div');
        container.className = 'game-card-container';
        container.setAttribute('data-testid', 'game-tile');

        const link = document.createElement('a');
        link.className = 'game-card-link';
        link.href = `https://www.roblox.com/games/${game.id}/`;
        link.draggable = false;

        const thumbContainer = document.createElement('div');
        thumbContainer.className = 'game-card-thumb-container';

        const thumbSpan = document.createElement('span');
        thumbSpan.className = 'thumbnail-2d-container game-card-thumb';

        const img = document.createElement('img');
        img.src = game.thumbnail;
        img.alt = game.name;
        img.title = game.name;
        img.loading = 'lazy';
        img.draggable = false;

        thumbSpan.appendChild(img);
        thumbContainer.appendChild(thumbSpan);
        link.appendChild(thumbContainer);

        const name = document.createElement('div');
        name.className = 'game-card-name game-name-title';
        name.title = game.name;
        name.textContent = game.name;
        link.appendChild(name);

        const info = document.createElement('div');
        info.className = 'game-card-info';
        info.setAttribute('data-testid', 'game-tile-stats');

        const votesIcon = document.createElement('span');
        votesIcon.className = 'info-label icon-votes-gray';

        const votesLabel = document.createElement('span');
        votesLabel.className = 'info-label vote-percentage-label';
        votesLabel.textContent = '--';

        const playingIcon = document.createElement('span');
        playingIcon.className = 'info-label icon-playing-counts-gray';

        const playingLabel = document.createElement('span');
        playingLabel.className = 'info-label playing-counts-label';
        playingLabel.textContent = formatCompactCount(game.playerCount);
        playingLabel.title = t('pinnedGames_playingCount', [formatPlayerCount(game.playerCount)]);

        info.append(votesIcon, votesLabel, playingIcon, playingLabel);
        link.appendChild(info);

        container.appendChild(link);

        const menuBtn = document.createElement('button');
        menuBtn.type = 'button';
        menuBtn.className = 'pgf-card-menu-btn';
        menuBtn.title = t('pinnedGames_options');
        menuBtn.setAttribute('aria-label', `${t('pinnedGames_options')} ${game.name}`);
        menuBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>';
        menuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showGameMenu(game.id, menuBtn);
        });

        container.appendChild(menuBtn);
        item.appendChild(container);

        item.addEventListener('dragstart', (e) => {
            if (e.target.closest('.pgf-card-menu-btn')) {
                e.preventDefault();
                return;
            }
            e.dataTransfer.setData('text/plain', game.id);
            item.classList.add('dragging');

            const ghost = item.cloneNode(true);
            ghost.classList.add('drag-ghost');
            ghost.classList.remove('dragging');
            ghost.style.position = 'fixed';
            ghost.style.top = '-9999px';
            ghost.style.left = '-9999px';
            ghost.style.width = item.offsetWidth + 'px';
            ghost.style.height = item.offsetHeight + 'px';
            ghost.style.pointerEvents = 'none';
            ghost.style.opacity = '0.9';
            ghost.style.zIndex = '10000';
            document.body.appendChild(ghost);

            e.dataTransfer.setDragImage(ghost, item.offsetWidth / 2, item.offsetHeight / 2);

            setTimeout(() => {
                if (ghost.parentNode) ghost.remove();
            }, 0);
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');

            document.querySelectorAll('.pinned-game-card').forEach(c => {
                c.classList.remove('drag-over');
            });

            document.querySelectorAll('.drag-ghost').forEach(g => g.remove());
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            item.classList.add('drag-over');
        });

        item.addEventListener('dragleave', (e) => {
            if (!item.contains(e.relatedTarget)) {
                item.classList.remove('drag-over');
            }
        });

        item.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedGameId = e.dataTransfer.getData('text/plain');
            const targetGameId = game.id;

            item.classList.remove('drag-over');

            if (draggedGameId && draggedGameId !== targetGameId) {
                item.classList.add('drop-success');

                setTimeout(() => {
                    item.classList.remove('drop-success');
                }, 400);

                handleGameReorder(draggedGameId, targetGameId);
            }
        });

        return item;
    }
    function startLivePlayerCountUpdates(gameCards) {
        if (liveUpdateInterval) {
            clearInterval(liveUpdateInterval);
            
        }

        const now = Date.now();
        if (now - lastApiCallTime > API_RATE_LIMIT_DELAY) {
            updatePlayerCounts(gameCards);
        }
        
        liveUpdateInterval = setInterval(() => {
            if (!document.querySelector('.pinned-games-carousel')) {
                clearInterval(liveUpdateInterval);
                liveUpdateInterval = null;
                return;
            }
            updatePlayerCounts(gameCards);
        }, 30000); 

        startAutoSync(gameCards);
    }

    function startAutoSync(gameCards) {
        if (autoSyncInterval) {
            clearInterval(autoSyncInterval);
            
        }

        autoSyncInterval = setInterval(async () => {
            if (!document.querySelector('.pinned-games-carousel')) {
                clearInterval(autoSyncInterval);
                autoSyncInterval = null;
                return;
            }

            for (let i = 0; i < gameCards.length; i++) {
                const {card, game} = gameCards[i];
                
                if (i > 0) {
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
                
                try {
                    await syncGameDetails(game.id, card);
                } catch (error) {
                    
                }
            }

        }, AUTO_SYNC_INTERVAL);
    }

    async function updatePlayerCounts(gameCards) {
        const now = Date.now();
        
        if (now - lastApiCallTime < API_RATE_LIMIT_DELAY) {
            return;
        }

        if (now - lastApiCallTime > API_RATE_LIMIT_RESET) {
            apiCallCount = 0;
        }

        if (apiCallCount > 10) {
            return;
        }

        lastApiCallTime = now;
        apiCallCount++;

        const gamesNeedingUpdate = gameCards.filter(({game}) => {
            const cacheKey = game.universeId || game.id;
            const cachedData = playerCountCache.get(cacheKey);
            return !cachedData || (Date.now() - cachedData.timestamp >= CACHE_DURATION);
        });

        if (gamesNeedingUpdate.length === 0) {
            return;
        }

        const universeIds = gamesNeedingUpdate
            .map(({game}) => game.universeId)
            .filter(id => id);

        if (universeIds.length > 0) {
            try {
                const batchResponse = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeIds.join(',')}`);
                
                if (batchResponse.status === 429) {
                    console.log('%c[Pinned Games] %cRATE LIMITED - Batch Games API (429) | Attempted to fetch %c' + universeIds.length + ' games', 
                        'color: #8A2BE2; font-weight: bold;', 'color: #ff6b6b; font-weight: bold;', 'color: #FFD700; font-weight: bold;');
                    return;
                }
                
                if (batchResponse.ok) {
                    const batchData = await batchResponse.json();
                    
                    if (batchData.data) {
                        batchData.data.forEach(gameData => {
                            playerCountCache.set(gameData.id, {
                                count: gameData.playing || 0,
                                timestamp: Date.now()
                            });
                        });

                        gamesNeedingUpdate.forEach(({card, game}) => {
                            if (game.universeId) {
                                const cachedData = playerCountCache.get(game.universeId);
                                if (cachedData) {
                                    const playerCountElement = card.querySelector('.playing-counts-label');
                                    if (playerCountElement) {
                                        playerCountElement.textContent = formatCompactCount(cachedData.count);
                                        playerCountElement.title = t('pinnedGames_playingCount', [formatPlayerCount(cachedData.count)]);
                                        playerCountElement.style.color = '#00b06f';
                                        setTimeout(() => {
                                            playerCountElement.style.color = '';
                                        }, 1000);
                                    }
                                }
                            }
                        });

                        return;
                    }
                }
            } catch (error) {
            }
        }

        for (let i = 0; i < Math.min(gamesNeedingUpdate.length, 3); i++) {
            const {card, game} = gamesNeedingUpdate[i];
            
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            try {
                const newPlayerCount = await getLivePlayerCount(game.id, game.universeId);
                const playerCountElement = card.querySelector('.playing-counts-label');
                
                if (playerCountElement && newPlayerCount !== null) {
                    playerCountElement.textContent = formatCompactCount(newPlayerCount);
                    playerCountElement.title = t('pinnedGames_playingCount', [formatPlayerCount(newPlayerCount)]);
                    playerCountElement.style.color = '#00b06f';
                    setTimeout(() => {
                        playerCountElement.style.color = '';
                    }, 1000);
                }
            } catch (error) {
            }
        }
    }

    async function getLivePlayerCount(gameId, universeId) {
        const cacheKey = universeId || gameId;
        const cachedData = playerCountCache.get(cacheKey);
        
        if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
            return cachedData.count;
        }

        try {
            let finalUniverseId = universeId;
            if (!finalUniverseId) {
                const placeResponse = await fetch(`https://apis.roblox.com/universes/v1/places/${gameId}/universe`);
                if (placeResponse.status === 429) {
                    console.log('%c[Pinned Games] %cRATE LIMITED - Universe API (429) | Game: %c' + gameId, 
                        'color: #8A2BE2; font-weight: bold;', 'color: #ff6b6b; font-weight: bold;', 'color: #FFD700;');
                    if (cachedData) {
                        console.log('%c[Pinned Games] %cUsing stale cache for game ' + gameId, 
                            'color: #8A2BE2; font-weight: bold;', 'color: #FFA500;');
                        return cachedData.count;
                    }
                    return null;
                }
                const placeData = await placeResponse.json();
                finalUniverseId = placeData.universeId;
            }

            if (!finalUniverseId) return null;

            const response = await fetch(`https://games.roblox.com/v1/games?universeIds=${finalUniverseId}`);
            
            if (response.status === 429) {
                console.log('%c[Pinned Games] %cRATE LIMITED - Games API (429) | Universe: %c' + finalUniverseId, 
                    'color: #8A2BE2; font-weight: bold;', 'color: #ff6b6b; font-weight: bold;', 'color: #FFD700;');
                if (cachedData) {
                    console.log('%c[Pinned Games] %cUsing stale cache for universe ' + finalUniverseId, 
                        'color: #8A2BE2; font-weight: bold;', 'color: #FFA500;');
                    return cachedData.count;
                }
                return null;
            }
            
            const data = await response.json();
            let playerCount = null;
            
            if (data.data && data.data.length > 0 && data.data[0].playing !== undefined) {
                playerCount = data.data[0].playing;
            } else {
                const countResponse = await fetch(`https://games.roblox.com/v1/games/${finalUniverseId}/servers/Public?sortOrder=Asc&limit=10`);
                
                if (countResponse.status === 429) {
                    
                    return null;
                }
                
                const countData = await countResponse.json();
                
                if (countData.data && countData.data.length > 0) {
                    playerCount = countData.data.reduce((total, server) => total + (server.playing || 0), 0);
                } else {
                    playerCount = 0;
                }
            }

            if (playerCount !== null) {
                playerCountCache.set(cacheKey, {
                    count: playerCount,
                    timestamp: Date.now()
                });
            }

            return playerCount;
        } catch (error) {
            
            return null;
        }
    }

    function formatPlayerCount(count) {
        if (typeof count !== 'number') return '0';
        return count.toLocaleString('en-US');
    }

    function formatCompactCount(count) {
        const value = Number(count);
        if (!Number.isFinite(value) || value < 0) return '0';
        if (value >= 1e9) return (value / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
        if (value >= 1e6) return (value / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
        if (value >= 1e3) return (value / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
        return String(value);
    }

    async function refreshVotePercents(gameCards) {
        const ids = [...new Set(gameCards.map(({ game }) => game.universeId).filter(Boolean))];
        const stale = ids.filter(id => {
            const cached = voteCache.get(id);
            return !cached || Date.now() - cached.timestamp > VOTE_CACHE_DURATION;
        });

        for (let i = 0; i < stale.length; i += 50) {
            const chunk = stale.slice(i, i + 50);
            try {
                const response = await fetch(`https://games.roblox.com/v1/games/votes?universeIds=${chunk.join(',')}`);
                if (response.ok) {
                    const data = await response.json();
                    (data.data || []).forEach(vote => {
                        const total = (vote.upVotes || 0) + (vote.downVotes || 0);
                        voteCache.set(vote.id, {
                            percent: total > 0 ? Math.round((vote.upVotes / total) * 100) : null,
                            timestamp: Date.now()
                        });
                    });
                }
            } catch (e) { }
        }

        gameCards.forEach(({ game, card }) => {
            const label = card.querySelector('.vote-percentage-label');
            if (!label) return;
            const cached = game.universeId ? voteCache.get(game.universeId) : null;
            label.textContent = cached && cached.percent !== null && cached.percent !== undefined ? `${cached.percent}%` : '--';
        });
    }

    async function syncGameDetails(gameId, card) {

        const syncBtn = card.querySelector('.pgf-sync-btn');
        if (!syncBtn) return;
        const originalSyncContent = syncBtn.innerHTML;
        
        syncBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
        </svg>`;
        syncBtn.disabled = true;
        syncBtn.classList.add('is-busy');

        if (!document.querySelector('#sync-spin-animation')) {
            const style = document.createElement('style');
            style.id = 'sync-spin-animation';
            style.textContent = `
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }

        try {
            gameInfoCache.delete(gameId);
            
            const updatedGameInfo = await getGameInfo(gameId);
            
            if (!updatedGameInfo) {
                throw new Error('Failed to fetch game info');
            }

            const gameIndex = pinnedGames.findIndex(g => g.id === gameId);
            if (gameIndex !== -1) {
                pinnedGames[gameIndex] = {
                    ...pinnedGames[gameIndex],
                    name: updatedGameInfo.name,
                    thumbnail: updatedGameInfo.thumbnail,
                    playerCount: updatedGameInfo.playerCount,
                    universeId: updatedGameInfo.universeId
                };

                await chrome.storage.local.set({ pinnedGamesList: pinnedGames });

                const thumbnailImg = card.querySelector('.game-card-thumb img');
                const titleElement = card.querySelector('.game-card-name');
                const playerCountElement = card.querySelector('.playing-counts-label');

                if (thumbnailImg) {
                    thumbnailImg.src = updatedGameInfo.thumbnail;
                }
                if (titleElement) {
                    titleElement.textContent = updatedGameInfo.name;
                    titleElement.title = updatedGameInfo.name;
                }
                if (playerCountElement) {
                    playerCountElement.textContent = formatCompactCount(updatedGameInfo.playerCount);
                    playerCountElement.title = t('pinnedGames_playingCount', [formatPlayerCount(updatedGameInfo.playerCount)]);
                    playerCountElement.style.color = '#00b06f';
                    setTimeout(() => {
                        playerCountElement.style.color = '';
                    }, 1500);
                }

                syncBtn.classList.add('is-success');
                setTimeout(() => syncBtn.classList.remove('is-success'), 1000);
            }
        } catch (error) {
            syncBtn.classList.add('is-error');
            setTimeout(() => syncBtn.classList.remove('is-error'), 1000);
        } finally {
            syncBtn.innerHTML = originalSyncContent;
            syncBtn.disabled = false;
            syncBtn.classList.remove('is-busy');
        }
    }

    function extractGameIdFromUrl() {
        const match = window.location.href.match(/\/games\/(\d+)/);
        return match ? match[1] : null;
    }

    async function getGameInfo(gameId) {
        const cachedInfo = gameInfoCache.get(gameId);
        if (cachedInfo && Date.now() - cachedInfo.timestamp < GAME_INFO_CACHE_DURATION) {
            return cachedInfo.data;
        }

        try {
            const placeResponse = await fetch(`https://apis.roblox.com/universes/v1/places/${gameId}/universe`);
            
            if (placeResponse.status === 429) {
                console.log('%c[Pinned Games] %cRATE LIMITED - Universe API (429) in getGameInfo | Game: %c' + gameId, 
                    'color: #8A2BE2; font-weight: bold;', 'color: #ff6b6b; font-weight: bold;', 'color: #FFD700;');
                return null;
            }
            
            const placeData = await placeResponse.json();
            
            if (!placeData.universeId) {
                return null;
            }

            const universeId = placeData.universeId;

            const response = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
            
            if (response.status === 429) {
                console.log('%c[Pinned Games] %cRATE LIMITED - Games API (429) in getGameInfo | Universe: %c' + universeId, 
                    'color: #8A2BE2; font-weight: bold;', 'color: #ff6b6b; font-weight: bold;', 'color: #FFD700;');
                return null;
            }
            
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                const game = data.data[0];
                
                const thumbResponse = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=150x150&format=Png&isCircular=false`);
                const thumbData = await thumbResponse.json();
                
                let playerCount = 0;
                
                if (game.playing) {
                    playerCount = game.playing;
                } else {
                    try {
                        const countResponse = await fetch(`https://games.roblox.com/v1/games/${universeId}/servers/Public?sortOrder=Asc&limit=10`);
                        const countData = await countResponse.json();
                        
                        if (countData.data && countData.data.length > 0) {
                            playerCount = countData.data.reduce((total, server) => total + (server.playing || 0), 0);
                        }
                    } catch (countError) {
                    }
                }

                const gameInfo = {
                    id: gameId, 
                    universeId: universeId,
                    name: game.name,
                    thumbnail: thumbData.data?.[0]?.imageUrl || chrome.runtime.getURL('images/icons/default/Purpura_Default_Logo_48.png'),
                    playerCount: playerCount
                };

                gameInfoCache.set(gameId, {
                    data: gameInfo,
                    timestamp: Date.now()
                });

                return gameInfo;
            }
        } catch (error) {
        }
        return null;
    }

    async function getUserId() {
        try {
            const response = await fetch('https://users.roblox.com/v1/users/authenticated', {
                credentials: 'include'
            });
            
            if (!response.ok) return null;
            
            const userData = await response.json();
            return userData.id;
        } catch (error) {
            return null;
        }
    }

    function openAnchoredMenu(anchorElement, menu, estimatedHeight) {
        const rect = anchorElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom - 8;
        const openUpward = spaceBelow < estimatedHeight && rect.top > estimatedHeight;

        menu.style.left = `${Math.max(8, Math.min(rect.right - 220, window.innerWidth - 232))}px`;
        if (openUpward) menu.style.bottom = `${viewportHeight - rect.top + 6}px`;
        else menu.style.top = `${rect.bottom + 6}px`;

        function onOutsideClick(e) {
            if (!menu.contains(e.target) && e.target !== anchorElement) close();
        }

        function onKey(e) {
            if (e.key === 'Escape') close();
        }

        function close() {
            menu.remove();
            document.removeEventListener('click', onOutsideClick);
            document.removeEventListener('keydown', onKey);
        }

        document.body.appendChild(menu);
        setTimeout(() => {
            document.addEventListener('click', onOutsideClick);
            document.addEventListener('keydown', onKey);
        }, 0);

        return close;
    }

    function showFolderChipMenu(folderId, anchorElement) {
        const existingMenu = document.querySelector('.pgf-menu');
        if (existingMenu) existingMenu.remove();

        injectCarouselStyles();

        const folder = folders.find(f => f.id === folderId);
        if (!folder) return;

        const menu = document.createElement('div');
        menu.className = 'pgf-menu';
        menu.setAttribute('role', 'menu');

        const closeMenu = openAnchoredMenu(anchorElement, menu, 110);

        const addAction = (label, onClick) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'pgf-menu-item';
            btn.setAttribute('role', 'menuitem');
            btn.textContent = label;
            btn.addEventListener('click', () => {
                closeMenu();
                onClick();
            });
            menu.appendChild(btn);
            return btn;
        };

        addAction(t('pinnedGames_rename'), () => showEditFolderDialog(folderId));
        addAction(t('pinnedGames_delete'), () => showDeleteFolderConfirmation(folderId));
    }

    function showGameMenu(gameId, anchorElement) {
        const existingMenu = document.querySelector('.pgf-menu');
        if (existingMenu) existingMenu.remove();

        injectCarouselStyles();

        const game = pinnedGames.find(g => g.id === gameId);
        if (!game) return;

        const gameFolderIds = game.folderIds || [];
        const card = document.querySelector(`.pinned-game-card[data-game-id="${gameId}"]`);

        const menu = document.createElement('div');
        menu.className = 'pgf-menu';
        menu.setAttribute('role', 'menu');

        const closeMenu = openAnchoredMenu(anchorElement, menu, Math.min(340, 220 + folders.length * 34));

        const addAction = (label, onClick) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'pgf-menu-item';
            btn.setAttribute('role', 'menuitem');
            btn.textContent = label;
            btn.addEventListener('click', () => {
                closeMenu();
                onClick();
            });
            menu.appendChild(btn);
            return btn;
        };

        addAction(t('pinnedGames_playTooltip'), () => {
            window.location.href = `roblox://placeid=${gameId}`;
        });
        addAction(t('pinnedGames_joinSmallestTooltip'), () => findSmallestServer(gameId));
        addAction(t('pinnedGames_syncDetails'), () => {
            if (card) syncGameDetails(gameId, card);
        });

        const sep1 = document.createElement('div');
        sep1.className = 'pgf-menu-sep';
        menu.appendChild(sep1);

        const title = document.createElement('div');
        title.className = 'pgf-menu-title';
        title.textContent = t('pinnedGames_addToFolder');
        menu.appendChild(title);

        const allRow = document.createElement('div');
        allRow.className = 'pgf-menu-item';
        allRow.textContent = t('pinnedGames_allGames');
        if (!gameFolderIds.length) {
            const check = document.createElement('span');
            check.className = 'pgf-menu-check';
            check.textContent = '✓';
            allRow.appendChild(check);
        }
        menu.appendChild(allRow);

        folders.forEach(folder => {
            const inFolder = gameFolderIds.includes(folder.id);
            const row = document.createElement('button');
            row.type = 'button';
            row.className = 'pgf-menu-item';
            row.setAttribute('role', 'menuitemcheckbox');
            row.setAttribute('aria-checked', inFolder ? 'true' : 'false');

            const swatch = document.createElement('span');
            swatch.className = 'pgf-menu-swatch';
            swatch.style.background = folder.color;
            row.appendChild(swatch);

            const label = document.createElement('span');
            label.textContent = folder.name;
            row.appendChild(label);

            if (inFolder) {
                const check = document.createElement('span');
                check.className = 'pgf-menu-check';
                check.textContent = '✓';
                row.appendChild(check);
            }

            row.addEventListener('click', () => {
                closeMenu();
                animateGameMove(gameId, folder.id);
            });
            menu.appendChild(row);
        });

        const sep2 = document.createElement('div');
        sep2.className = 'pgf-menu-sep';
        menu.appendChild(sep2);

        addAction(t('pinnedGames_newFolder'), () => showCreateFolderDialog(gameId));
    }

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync' && changes['pinned-games']) {
            if (changes['pinned-games'].newValue && !changes['pinned-games'].oldValue) {
                initializePinnedGames();
            } else if (!changes['pinned-games'].newValue && changes['pinned-games'].oldValue) {
                document.querySelectorAll('.pin-game-button-container').forEach(el => el.remove());
                
            }
        }
    });
})();
}
