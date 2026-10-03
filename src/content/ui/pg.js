/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
if (!window.pinnedGamesInitialized) { window.pinnedGamesInitialized = true;
(() => {
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
        const nav = document.querySelector('.folder-navigation');
        if (!nav) return;
        
        const folderButtons = nav.querySelectorAll('.folder-btn');
        folderButtons.forEach(btn => {
            const folderId = btn.dataset.folderId === 'null' ? null : btn.dataset.folderId;
            const count = getGamesInFolder(folderId).length;
            const countBadge = btn.querySelector('span:last-child');
            if (countBadge) {
                countBadge.textContent = count;
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
                margin-bottom: 16px;
                padding: 6px;
                background: var(--pg-input-bg);
                border: 1px solid var(--pg-border);
                border-radius: 10px;
                overflow-x: auto;
                scrollbar-width: none;
            }
            .pgf-nav::-webkit-scrollbar { display: none; }
            .pgf-chip-wrap { position: relative; flex-shrink: 0; }
            .pgf-chip {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                border-radius: 8px;
                border: 1px solid var(--pg-border);
                background: var(--pg-card-bg);
                color: var(--pg-text);
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .pgf-chip:hover {
                background: var(--pg-hover-bg, rgba(138,43,226,0.15));
                border-color: var(--pg-color, var(--pg-accent));
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .pgf-chip.active {
                background: var(--pg-active-bg, rgba(138,43,226,0.25));
                border-color: var(--pg-color, var(--pg-accent));
                color: var(--pg-text);
                font-weight: 700;
                box-shadow: inset 0 0 0 1px var(--pg-color, var(--pg-accent));
            }
            .pgf-chip-icon { display: flex; align-items: center; flex-shrink: 0; opacity: 0.8; }
            .pgf-chip-count {
                background: var(--pg-chip-count-bg);
                border: 1px solid var(--pg-border);
                border-radius: 12px;
                padding: 0 8px;
                font-size: 11px;
                font-weight: 800;
                min-width: 22px;
                text-align: center;
                line-height: 20px;
                height: 20px;
                opacity: 0.9;
                color: var(--pg-text);
            }
            .pgf-actions {
                position: absolute;
                top: -8px;
                right: -6px;
                display: none;
                gap: 3px;
                z-index: 2;
            }
            .pgf-chip-wrap:hover .pgf-actions { display: flex; }
            .pgf-action-btn {
                width: 18px;
                height: 18px;
                border-radius: 50%;
                border: 1px solid rgba(255,255,255,0.1);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                padding: 0;
                transition: all 0.2s ease;
                box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            }
            .pgf-action-btn.edit { background: #8b5cf6; color: white; }
            .pgf-action-btn.del  { background: #ef4444; color: white; }
            .pgf-action-btn:hover { transform: scale(1.15); filter: brightness(1.1); }
            .pgf-new-btn {
                flex-shrink: 0;
                width: 32px;
                height: 32px;
                border-radius: 8px;
                border: 1px dashed var(--pg-accent-muted);
                background: var(--pg-input-bg);
                color: var(--pg-accent);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }
            .pgf-new-btn:hover { 
                background: var(--pg-accent-muted); 
                border-color: var(--pg-accent); 
                color: white; 
                transform: rotate(90deg);
            }
            .pgf-modal-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.5);
                backdrop-filter: blur(8px);
                z-index: 100000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: pgf-fade 0.3s ease;
            }
            .pgf-modal {
                background: var(--pg-bg);
                backdrop-filter: var(--pg-glass);
                border: 1px solid var(--pg-border);
                border-radius: 20px;
                padding: 24px;
                width: 340px;
                color: var(--pg-text);
                animation: pgf-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                box-shadow: var(--pg-shadow);
            }
            .pgf-modal-title {
                font-size: 16px;
                font-weight: 700;
                color: var(--pg-accent);
                margin: 0 0 20px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .pgf-modal-label { font-size: 12px; font-weight: 600; color: var(--pg-muted); margin-bottom: 8px; }
            .pgf-modal-input {
                width: 100%;
                padding: 12px 14px;
                border-radius: 12px;
                border: 1px solid var(--pg-border);
                background: var(--pg-input-bg);
                color: var(--pg-text);
                font-size: 14px;
                outline: none;
                box-sizing: border-box;
                margin-bottom: 20px;
                transition: all 0.2s ease;
            }
            .pgf-modal-input:focus { border-color: var(--pg-accent); box-shadow: 0 0 0 2px var(--pg-accent-muted); }
            .pgf-color-grid { display: grid; grid-template-columns: repeat(6,1fr); gap: 10px; margin-bottom: 24px; }
            .pgf-swatch {
                aspect-ratio: 1;
                border-radius: 10px;
                cursor: pointer;
                border: 2px solid transparent;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .pgf-swatch:hover { transform: scale(1.15) rotate(5deg); }
            .pgf-swatch.selected { border-color: var(--pg-text); transform: scale(1.1); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
            .pgf-modal-footer { display: flex; gap: 12px; }
            .pgf-btn {
                flex: 1;
                padding: 12px;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 700;
                border: none;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .pgf-btn-primary:hover { transform: translateY(-2px); background: #9d4edd; filter: brightness(1.1); box-shadow: 0 8px 24px var(--pg-accent-muted); }
            .pgf-btn-ghost:hover { background: rgba(138, 43, 226, 0.12); border-color: var(--pg-accent); color: var(--pg-text); transform: translateY(-1px); }
            .pgf-btn-danger:hover { transform: translateY(-2px); background: #ef4444; border-color: #ef4444; color: white; box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4); }
            @keyframes pgf-fade { from { opacity:0; } to { opacity:1; } }
            @keyframes pgf-up { from { opacity:0; transform:translateY(20px) scale(0.95); } to { opacity:1; transform:none; } }
            @keyframes pgf-fade-in { 0% { opacity: 0; transform: translateY(12px) scale(0.98); } 100% { opacity: 1; transform: translateY(0) scale(1); } }`;
        document.head.appendChild(s);
    }

    function createFolderNavigation() {
        injectFolderStyles();
        const nav = document.createElement('div');
        nav.className = 'pgf-nav';

        nav.appendChild(createFolderButton('All Games', null, '#8A2BE2', getGamesInFolder(null).length));
        folders.forEach(folder => nav.appendChild(createFolderButton(folder.name, folder.id, folder.color, getGamesInFolder(folder.id).length)));

        const createBtn = document.createElement('button');
        createBtn.className = 'pgf-new-btn';
        createBtn.title = 'New folder';
        createBtn.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>`;
        createBtn.addEventListener('click', () => showCreateFolderDialog());
        nav.appendChild(createBtn);

        return nav;
    }

    function createFolderButton(name, folderId, color, gameCount) {
        const isActive = currentFolderId === folderId;
        const isAll = folderId === null;
        const chipColor = isAll ? '#a78bfa' : color;
        const rgb = hexToRgb(chipColor);

        const wrap = document.createElement('div');
        wrap.className = 'pgf-chip-wrap';

        const btn = document.createElement('button');
        btn.className = `pgf-chip${isActive ? ' active' : ''}${isAll ? ' pgf-chip-all' : ''}`;
        btn.dataset.folderId = folderId || 'null';
        btn.style.cssText = `--pgf-color:${chipColor};--pgf-hover-bg:rgba(${rgb},0.18);--pgf-active-bg:rgba(${rgb},0.27);`;

        const allSvg = `<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="0" y="0" width="5" height="5" rx="1"/><rect x="7" y="0" width="5" height="5" rx="1"/><rect x="0" y="7" width="5" height="5" rx="1"/><rect x="7" y="7" width="5" height="5" rx="1"/></svg>`;
        const folderSvg = `<svg width="13" height="11" viewBox="0 0 22 18" fill="currentColor"><path d="M9 0H2C.9 0 0 .9 0 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2h-9L9 0z"/></svg>`;
        const iconSvg = isAll ? allSvg : folderSvg;
        btn.innerHTML = `<span class="pgf-chip-icon" style="color:${chipColor};">${iconSvg}</span><span>${name}</span><span class="pgf-chip-count">${gameCount}</span>`;
        btn.addEventListener('click', () => switchToFolder(folderId));
        wrap.appendChild(btn);

        if (folderId !== null) {
            const actions = document.createElement('div');
            actions.className = 'pgf-actions';
            actions.innerHTML = `<button class="pgf-action-btn edit" title="Edit">✎</button><button class="pgf-action-btn del" title="Delete">✕</button>`;
            actions.querySelector('.edit').addEventListener('click', e => { e.stopPropagation(); showEditFolderDialog(folderId); });
            actions.querySelector('.del').addEventListener('click', e => { e.stopPropagation(); showDeleteFolderConfirmation(folderId); });
            wrap.appendChild(actions);
        }

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

    function createPinnedGamesCarousel(referenceElement, position) {
        if (document.querySelector('.pinned-games-carousel')) return;
        if (!isSafeMainContentAnchor(referenceElement)) return;

        const carousel = document.createElement('div');
        carousel.className = 'pinned-games-carousel';
        carousel.style.cssText = `
            margin: 24px 0;
            padding: 24px;
            background: var(--pg-bg);
            backdrop-filter: var(--pg-glass);
            -webkit-backdrop-filter: var(--pg-glass);
            border-radius: 20px;
            border: 1px solid var(--pg-border);
            box-shadow: var(--pg-shadow);
            position: relative;
            overflow: visible;
            animation: pgf-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            box-sizing: border-box;
        `;

        const headerSection = document.createElement('div');
        headerSection.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        `;

        const header = document.createElement('div');
        header.style.cssText = 'display:flex;align-items:center;gap:10px;';
        header.innerHTML = `
            <h3 style="
                color: var(--pg-accent);
                margin: 0;
                font-size: 1.4rem;
                font-weight: 800;
                letter-spacing: -0.02em;
            ">${t('pinnedGames_pinnedGamesHeader')}</h3>
            <div class="pgf-help-btn" style="
                position: relative;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                border: 1px solid var(--pg-border);
                background: var(--pg-input-bg);
                color: var(--pg-accent);
                font-size: 10px;
                font-weight: 700;
                cursor: default;
                flex-shrink: 0;
                user-select: none;
            " data-pgf-help>?<div style="
                display: none;
                position: absolute;
                bottom: calc(100% + 10px);
                left: 50%;
                transform: translateX(-50%);
                background: var(--pg-tooltip-bg);
                backdrop-filter: blur(20px);
                border: 1px solid var(--pg-border);
                border-radius: 12px;
                padding: 10px 14px;
                font-size: 11px;
                font-weight: 600;
                color: var(--pg-text);
                white-space: nowrap;
                pointer-events: none;
                box-shadow: var(--pg-shadow);
                z-index: 9999;
                line-height: 1.6;
            ">${t('pinnedGames_helpText')}</div></div>
        `;

        headerSection.appendChild(header);

        const helpBtn = header.querySelector('[data-pgf-help]');
        const helpTooltip = helpBtn?.querySelector('div');
        if (helpBtn && helpTooltip) {
            helpBtn.addEventListener('mouseenter', () => {
                helpTooltip.style.display = 'block';
            });
            helpBtn.addEventListener('mouseleave', () => {
                helpTooltip.style.display = 'none';
            });
        }

        const collapseBtn = document.createElement('button');
        collapseBtn.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            border-radius: 8px;
            border: 1px solid var(--pg-border);
            background: var(--pg-input-bg);
            cursor: pointer;
            padding: 0;
            color: var(--pg-muted);
            transition: all 0.2s ease;
            flex-shrink: 0;
        `;
        collapseBtn.innerHTML = `<svg class="pgf-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition:transform 0.2s ease;"><polyline points="18 15 12 9 6 15"/></svg>`;
        collapseBtn.addEventListener('mouseenter', () => {
            collapseBtn.style.background = 'rgba(138,43,226,0.22)';
            collapseBtn.style.borderColor = 'rgba(138,43,226,0.6)';
            collapseBtn.style.color = 'white';
        });
        collapseBtn.addEventListener('mouseleave', () => {
            collapseBtn.style.background = 'rgba(138,43,226,0.08)';
            collapseBtn.style.borderColor = 'rgba(138,43,226,0.3)';
            collapseBtn.style.color = 'rgba(200,170,255,0.6)';
        });
        headerSection.appendChild(collapseBtn);

        const collapseBody = document.createElement('div');
        collapseBody.className = 'pgf-body';
        collapseBody.style.cssText = 'overflow:hidden;transition:max-height 0.25s ease, opacity 0.2s ease;max-height:2000px;opacity:1;';

        let isCollapsed = false;

        const applyCollapsed = (collapsed, animate) => {
            isCollapsed = collapsed;
            const chevron = collapseBtn.querySelector('.pgf-chevron');
            if (collapsed) {
                if (!animate) collapseBody.style.transition = 'none';
                collapseBody.style.maxHeight = '0';
                collapseBody.style.opacity = '0';
                carousel.style.paddingBottom = '12px';
                headerSection.style.marginBottom = '0';
                if (chevron) chevron.style.transform = 'rotate(180deg)';
                collapseBody.style.overflow = 'hidden';
            } else {
                if (!animate) collapseBody.style.transition = 'none';
                collapseBody.style.maxHeight = '2000px';
                collapseBody.style.opacity = '1';
                carousel.style.paddingBottom = '20px';
                headerSection.style.marginBottom = '12px';
                if (chevron) chevron.style.transform = 'rotate(0deg)';
            }
            if (animate) {
                requestAnimationFrame(() => {
                    collapseBody.style.transition = 'max-height 0.25s ease, opacity 0.2s ease';
                    if (!collapsed) {
                        setTimeout(() => { if (!isCollapsed) collapseBody.style.overflow = 'visible'; }, 250);
                    }
                });
            } else {
                if (!collapsed) collapseBody.style.overflow = 'visible';
            }
        };

        window.__PurpuraSettings.ready.then(function() {
            applyCollapsed(window.__PurpuraSettings.get('pgfCollapsed') === true, false);
        });

        collapseBtn.addEventListener('click', () => {
            const next = !isCollapsed;
            applyCollapsed(next, true);
            chrome.storage.local.set({ pgfCollapsed: next });
        });

        const searchBar = document.createElement('div');
        searchBar.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 16px;
            background: var(--pg-input-bg);
            border: 1px solid var(--pg-border);
            border-radius: 12px;
            padding: 10px 16px;
            transition: all 0.2s ease;
            box-sizing: border-box;
            width: 100%;
        `;
        searchBar.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--pg-muted)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input type="text" placeholder="${t('pinnedGames_searchPlaceholder')}" style="
                flex: 1;
                background: transparent;
                border: none;
                outline: none;
                color: var(--pg-text);
                font-size: 14px;
                padding: 0;
                margin: 0;
            ">
            <button style="
                display: none;
                background: none;
                border: none;
                color: rgba(200,170,255,0.5);
                cursor: pointer;
                padding: 0;
                line-height: 1;
                font-size: 14px;
            ">✕</button>
        `;
        const searchInput = searchBar.querySelector('input');
        const clearBtn = searchBar.querySelector('button');
        searchBar.addEventListener('focusin', () => {
            searchBar.style.borderColor = 'rgba(138,43,226,0.5)';
        });
        searchBar.addEventListener('focusout', () => {
            searchBar.style.borderColor = 'rgba(138,43,226,0.18)';
        });
        searchInput.addEventListener('input', () => {
            clearBtn.style.display = searchInput.value ? 'block' : 'none';
        });
        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            searchInput.dispatchEvent(new Event('input'));
            searchInput.focus();
        });

        const folderNav = createFolderNavigation();
        folderNav.style.width = '100%';
        folderNav.style.boxSizing = 'border-box';

        const gamesContainer = document.createElement('div');
        gamesContainer.className = 'pinned-games-container';
        gamesContainer.style.cssText = `
            display: flex;
            gap: 20px;
            overflow-x: auto;
            padding: 50px 10px 10px;
            margin-top: -30px;
            scrollbar-width: none;
        `;

        const style = document.createElement('style');
        style.textContent = `
            .pinned-games-container::-webkit-scrollbar {
                height: 8px;
            }
            .pinned-games-container::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
            }
            .pinned-games-container::-webkit-scrollbar-thumb {
                background: #8A2BE2;
                border-radius: 4px;
            }
            .pinned-games-container::-webkit-scrollbar-thumb:hover {
                background: #9933FF;
            }
            .pinned-games-search::placeholder {
                color: rgba(255, 255, 255, 0.5);
            }
            
            /* Drag & Drop Animations */
            .pinned-game-card {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                animation: fadeInCard 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
            
            @keyframes fadeInCard {
                from {
                    opacity: 0;
                    transform: translateY(10px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            .pinned-game-card.dragging {
                opacity: 0.5;
                transform: scale(0.95) rotate(2deg);
                cursor: grabbing !important;
                box-shadow: 0 8px 32px rgba(138, 43, 226, 0.6);
                z-index: 1000;
            }
            
            .pinned-game-card.drag-over {
                transform: scale(1.05) translateY(-5px);
                border: 2px solid #FFD700;
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.5), 0 8px 32px rgba(138, 43, 226, 0.4);
                background: rgba(138, 43, 226, 0.3);
            }
            
            .pinned-game-card.drag-over::before {
                content: '';
                position: absolute;
                top: -4px;
                left: 50%;
                transform: translateX(-50%);
                width: 80%;
                height: 4px;
                background: linear-gradient(90deg, transparent, #FFD700, transparent);
                border-radius: 2px;
                animation: pulse 1s ease-in-out infinite;
            }
            
            @keyframes pulse {
                0%, 100% {
                    opacity: 0.6;
                    box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
                }
                50% {
                    opacity: 1;
                    box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
                }
            }
            
            .pinned-game-card.drop-success {
                animation: dropSuccess 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            
            @keyframes dropSuccess {
                0% {
                    transform: scale(0.9);
                }
                50% {
                    transform: scale(1.1);
                    box-shadow: 0 0 30px rgba(76, 175, 80, 0.8);
                    border-color: #4caf50;
                }
                100% {
                    transform: scale(1);
                }
            }
            
            .drag-ghost {
                position: fixed;
                pointer-events: none;
                z-index: 10000;
                opacity: 0.9;
                transform: rotate(5deg);
                transition: transform 0.2s ease;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                border: 2px solid #8A2BE2;
                animation: floatGhost 2s ease-in-out infinite;
            }
            
            @keyframes floatGhost {
                0%, 100% {
                    transform: translateY(0px) rotate(5deg);
                }
                50% {
                    transform: translateY(-10px) rotate(3deg);
                }
            }
        `;
        document.head.appendChild(style);
        allGameCards = [];
        const currentGames = getGamesInFolder(currentFolderId);
        
        currentGames.forEach(game => {
            const gameCard = createGameCard(game);
            gamesContainer.appendChild(gameCard);
            allGameCards.push({card: gameCard, game: game});
        });

        if (currentGames.length === 0) {
            const empty = document.createElement('div');
            empty.style.cssText = `display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 16px 20px;width:100%;box-sizing:border-box;gap:10px;opacity:0.72;`;
            const img = document.createElement('img');
            img.src = chrome.runtime.getURL('images/builderman_signature.png');
            msg.textContent = t('pinnedGames_buildermanLives');
            msg.style.cssText = `font-size:13px;color:var(--pg-muted);font-weight:600;letter-spacing:0.02em;`;
            const imgFilter = currentTheme === 'light' ? 'grayscale(1) contrast(0.5) opacity(0.15)' : 'invert(1) opacity(0.18)';
            img.style.cssText = `width:160px;max-width:80%;filter:${imgFilter};pointer-events:none;user-select:none;`;
            empty.appendChild(img);
            empty.appendChild(msg);
            gamesContainer.appendChild(empty);
        }

        searchInput.addEventListener('input', () => {
            const term = searchInput.value.toLowerCase().trim();
            let anyVisible = false;
            allGameCards.forEach(({card, game}) => {
                const visible = !term || game.name.toLowerCase().includes(term);
                card.style.display = visible ? '' : 'none';
                if (visible) anyVisible = true;
            });
            const existingEmpty = gamesContainer.querySelector('.pgf-search-empty');
            if (!anyVisible && term) {
                if (!existingEmpty) {
                    const noResults = document.createElement('div');
                    noResults.className = 'pgf-search-empty';
                    noResults.style.cssText = `display:flex;align-items:center;justify-content:center;padding:24px 16px;width:100%;box-sizing:border-box;font-size:13px;color:var(--pg-muted);font-weight:600;animation: pgf-fade-in 0.3s ease;`;
                    noResults.textContent = `No games match "${term}"`;
                    gamesContainer.appendChild(noResults);
                } else {
                    existingEmpty.textContent = `No games match "${term}"`;
                }
            } else if (existingEmpty) {
                existingEmpty.remove();
            }
        });

        collapseBody.appendChild(searchBar);
        collapseBody.appendChild(folderNav);
        collapseBody.appendChild(gamesContainer);
        carousel.appendChild(headerSection);
        carousel.appendChild(collapseBody);
        
        referenceElement.insertAdjacentElement(position, carousel);

        startLivePlayerCountUpdates(allGameCards);
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
            carousel.appendChild(newNav);
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

        gamesContainer.innerHTML = '';
        gamesContainer.style.animation = 'none';
        gamesContainer.offsetHeight; // trigger reflow
        gamesContainer.style.animation = 'pgf-fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        
        allGameCards = [];
        const currentGames = getGamesInFolder(currentFolderId);

        currentGames.forEach(game => {
            const card = createGameCard(game);
            gamesContainer.appendChild(card);
            allGameCards.push({ game, card });
        });

        if (currentGames.length === 0) {
            const empty = document.createElement('div');
            empty.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 16px 20px;width:100%;box-sizing:border-box;gap:10px;opacity:0.72;';
            const img = document.createElement('img');
            img.src = chrome.runtime.getURL('images/builderman_signature.png');
            const imgFilter = currentTheme === 'light' ? 'grayscale(1) contrast(0.5) opacity(0.15)' : 'invert(1) opacity(0.18)';
            img.style.cssText = `width:160px;max-width:80%;filter:${imgFilter};pointer-events:none;user-select:none;`;
            const msg = document.createElement('span');
            msg.textContent = currentFolderId === null ? 'The builderman lives here.' : 'This folder is empty.';
            msg.style.cssText = 'font-size:13px;color:var(--pg-muted);font-weight:600;letter-spacing:0.02em;';
            empty.appendChild(img);
            empty.appendChild(msg);
            gamesContainer.appendChild(empty);
        }

        const searchInput = carousel.querySelector('input[type="text"]');
        if (searchInput && searchInput.value.trim()) {
            const query = searchInput.value.trim().toLowerCase();
            allGameCards.forEach(({ card, game }) => {
                card.style.display = game.name.toLowerCase().includes(query) ? '' : 'none';
            });
        }

        startLivePlayerCountUpdates(allGameCards);
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
        const card = document.createElement('div');
        card.className = 'pinned-game-card';
        card.draggable = true;
        card.dataset.gameId = game.id;
        card.style.cssText = `
            min-width: 220px;
            background: var(--pg-card-bg);
            border-radius: 16px;
            padding: 14px;
            border: 1px solid var(--pg-border);
            cursor: grab;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        `;

        card.innerHTML = `
            <div class="drag-handle" style="
                position: absolute;
                top: 8px;
                left: 8px;
                width: 16px;
                height: 16px;
                cursor: grab;
                opacity: 0.6;
                transition: opacity 0.2s ease;
                z-index: 2;
            " title="${t('pinnedGames_dragToReorder')}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--pg-muted)">
                    <path d="M3 5h2v2H3V5zm4 0h2v2H7V5zm4 0h2v2h-2V5zm4 0h2v2h-2V5zm4 0h2v2h-2V5zM3 11h2v2H3v-2zm4 0h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM3 17h2v2H3v-2zm4 0h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/>
                </svg>
            </div>
            <button class="sync-game-btn" style="
                position: absolute;
                top: 10px;
                right: 10px;
                width: 28px;
                height: 28px;
                background: var(--pg-input-bg);
                border: 1px solid var(--pg-border);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2;
                padding: 0;
            ">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(138, 43, 226, 0.9)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
                <span class="sync-tooltip" style="
                    display: none;
                    position: absolute;
                    bottom: calc(100% + 8px);
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--pg-tooltip-bg);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--pg-border);
                    border-radius: 12px;
                    padding: 6px 10px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--pg-text);
                    white-space: nowrap;
                    pointer-events: none;
                    box-shadow: var(--pg-shadow);
                    z-index: 9999;
                ">${t('pinnedGames_syncDetails')}</span>
            </button>
            <button class="folder-menu-btn" style="
                position: absolute;
                top: 10px;
                right: 44px;
                width: 28px;
                height: 28px;
                background: var(--pg-input-bg);
                border: 1px solid var(--pg-border);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2;
                padding: 0;
            ">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(138, 43, 226, 0.9)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                <span class="folder-tooltip" style="
                    display: none;
                    position: absolute;
                    bottom: calc(100% + 8px);
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--pg-tooltip-bg);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--pg-border);
                    border-radius: 12px;
                    padding: 6px 10px;
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--pg-text);
                    white-space: nowrap;
                    pointer-events: none;
                    box-shadow: var(--pg-shadow);
                    z-index: 9999;
                ">${t('pinnedGames_folders')}</span>
            </button>
            <img src="${game.thumbnail}" alt="${game.name}" style="
                width: 100%;
                height: 120px;
                object-fit: cover;
                border-radius: 10px;
                margin-bottom: 12px;
                border: 1px solid var(--pg-border);
            ">
            <h4 style="
                color: var(--pg-text);
                font-size: 1rem;
                font-weight: 700;
                margin-bottom: 4px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            ">${game.name}</h4>
            <p style="
                color: var(--pg-muted);
                font-size: 0.85rem;
                font-weight: 500;
                margin-bottom: 12px;
            ">${t('pinnedGames_playingCount', [formatPlayerCount(game.playerCount)])}</p>
            <div class="game-actions" style="
                display: flex;
                gap: 6px;
                margin-top: 8px;
            ">
                <button class="join-game-btn" style="
                    position: relative;
                    flex: 1;
                    background: var(--pg-accent);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    padding: 12px 0;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z"/></svg>
                    <span style="
                        display: none;
                        position: absolute;
                        bottom: calc(100% + 8px);
                        left: 50%;
                        transform: translateX(-50%);
                        background: var(--pg-tooltip-bg);
                        backdrop-filter: blur(20px);
                        border: 1px solid var(--pg-border);
                        border-radius: 12px;
                        padding: 6px 10px;
                        font-size: 11px;
                        font-weight: 600;
                        color: var(--pg-text);
                        white-space: nowrap;
                        pointer-events: none;
                        box-shadow: var(--pg-shadow);
                        z-index: 9999;
                    ">${t('pinnedGames_playTooltip')}</span>
                </button>
                <button class="join-smallest-btn" style="
                    position: relative;
                    flex: 1;
                    background: var(--pg-input-bg);
                    color: var(--pg-accent);
                    border: 1px solid var(--pg-accent-muted);
                    border-radius: 10px;
                    padding: 12px 0;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8"/></svg>
                    <span style="
                        display: none;
                        position: absolute;
                        bottom: calc(100% + 8px);
                        left: 50%;
                        transform: translateX(-50%);
                        background: var(--pg-tooltip-bg);
                        backdrop-filter: blur(20px);
                        border: 1px solid var(--pg-border);
                        border-radius: 12px;
                        padding: 6px 10px;
                        font-size: 11px;
                        font-weight: 600;
                        color: var(--pg-text);
                        white-space: nowrap;
                        pointer-events: none;
                        box-shadow: var(--pg-shadow);
                        z-index: 9999;
                    ">${t('pinnedGames_joinSmallestTooltip')}</span>
                </button>
            </div>
        `;

        const dragHandle = card.querySelector('.drag-handle');
        dragHandle.addEventListener('mouseenter', () => {
            dragHandle.style.opacity = '1';
        });

        dragHandle.addEventListener('mouseleave', () => {
            dragHandle.style.opacity = '0.6';
        });

        card.addEventListener('mouseenter', () => {
            card.style.background = 'var(--pg-card-hover)';
            card.style.borderColor = 'var(--pg-accent)';
            card.style.transform = 'translateY(-4px)';
            card.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.background = 'var(--pg-card-bg)';
            card.style.borderColor = 'var(--pg-border)';
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
        });

        const joinGameBtn = card.querySelector('.join-game-btn');
        const joinSmallestBtn = card.querySelector('.join-smallest-btn');

        const joinGameTooltip = joinGameBtn.querySelector('span');
        joinGameBtn.addEventListener('mouseenter', () => {
            joinGameBtn.style.transform = 'scale(1.05)';
            joinGameBtn.style.filter = 'brightness(1.1)';
            if (joinGameTooltip) joinGameTooltip.style.display = 'block';
        });

        joinGameBtn.addEventListener('mouseleave', () => {
            joinGameBtn.style.transform = 'scale(1)';
            joinGameBtn.style.filter = 'none';
            if (joinGameTooltip) joinGameTooltip.style.display = 'none';
        });

        joinGameBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = `roblox://placeid=${game.id}`;
        });

        const joinSmallestTooltip = joinSmallestBtn.querySelector('span');
        joinSmallestBtn.addEventListener('mouseenter', () => {
            joinSmallestBtn.style.background = 'var(--pg-accent-muted)';
            joinSmallestBtn.style.color = 'white';
            joinSmallestBtn.style.transform = 'scale(1.05)';
            if (joinSmallestTooltip) joinSmallestTooltip.style.display = 'block';
        });

        joinSmallestBtn.addEventListener('mouseleave', () => {
            joinSmallestBtn.style.background = 'var(--pg-input-bg)';
            joinSmallestBtn.style.color = 'var(--pg-accent)';
            joinSmallestBtn.style.transform = 'scale(1)';
            if (joinSmallestTooltip) joinSmallestTooltip.style.display = 'none';
        });

        joinSmallestBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            findSmallestServer(game.id);
        });

        const syncGameBtn = card.querySelector('.sync-game-btn');

        const syncTooltip = syncGameBtn.querySelector('.sync-tooltip');

        syncGameBtn.addEventListener('mouseenter', () => {
            syncGameBtn.style.background = 'var(--pg-accent)';
            syncGameBtn.style.borderColor = 'var(--pg-accent)';
            const svg = syncGameBtn.querySelector('svg');
            if (svg) {
                svg.style.stroke = 'white';
                svg.style.transform = 'rotate(180deg)';
            }
            if (syncTooltip) syncTooltip.style.display = 'block';
        });

        syncGameBtn.addEventListener('mouseleave', () => {
            syncGameBtn.style.background = 'var(--pg-input-bg)';
            syncGameBtn.style.borderColor = 'var(--pg-border)';
            const svg = syncGameBtn.querySelector('svg');
            if (svg) {
                svg.style.stroke = 'var(--pg-accent)';
                svg.style.transform = 'rotate(0deg)';
            }
            if (syncTooltip) syncTooltip.style.display = 'none';
        });

        syncGameBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await syncGameDetails(game.id, card);
        });

        const folderMenuBtn = card.querySelector('.folder-menu-btn');
        
        const folderTooltip = folderMenuBtn.querySelector('.folder-tooltip');

        folderMenuBtn.addEventListener('mouseenter', () => {
            folderMenuBtn.style.background = 'var(--pg-accent)';
            folderMenuBtn.style.borderColor = 'var(--pg-accent)';
            const svg = folderMenuBtn.querySelector('svg');
            if (svg) svg.style.stroke = 'white';
            if (folderTooltip) folderTooltip.style.display = 'block';
        });
        
        folderMenuBtn.addEventListener('mouseleave', () => {
            folderMenuBtn.style.background = 'var(--pg-input-bg)';
            folderMenuBtn.style.borderColor = 'var(--pg-border)';
            const svg = folderMenuBtn.querySelector('svg');
            if (svg) svg.style.stroke = 'var(--pg-accent)';
            if (folderTooltip) folderTooltip.style.display = 'none';
        });
        
        folderMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showGameFolderMenu(game.id, folderMenuBtn);
        });

        card.addEventListener('click', (e) => {
            if (e.target.closest('.game-actions')) {
                return;
            }
            window.location.href = `https://www.roblox.com/games/${game.id}/`;
        });

        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', game.id);
            card.classList.add('dragging');
            
            const ghost = card.cloneNode(true);
            ghost.classList.add('drag-ghost');
            ghost.classList.remove('dragging');
            ghost.style.position = 'fixed';
            ghost.style.top = '-9999px';
            ghost.style.left = '-9999px';
            ghost.style.width = card.offsetWidth + 'px';
            ghost.style.height = card.offsetHeight + 'px';
            ghost.style.pointerEvents = 'none';
            document.body.appendChild(ghost);
            
            e.dataTransfer.setDragImage(ghost, card.offsetWidth / 2, card.offsetHeight / 2);
            
            setTimeout(() => {
                if (ghost.parentNode) {
                    ghost.remove();
                }
            }, 0);
            
            document.querySelectorAll('.pinned-game-card').forEach(c => {
                if (c !== card) {
                    c.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    c.style.opacity = '0.6';
                }
            });

        });

        card.addEventListener('dragend', (e) => {
            card.classList.remove('dragging');
            
            document.querySelectorAll('.pinned-game-card').forEach(c => {
                c.classList.remove('drag-over');
                c.style.opacity = '1';
            });
            
            document.querySelectorAll('.drag-ghost').forEach(g => g.remove());
        });

        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            card.classList.add('drag-over');
        });

        card.addEventListener('dragleave', (e) => {
            if (!card.contains(e.relatedTarget)) {
                card.classList.remove('drag-over');
            }
        });

        card.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedGameId = e.dataTransfer.getData('text/plain');
            const targetGameId = game.id;
            
            card.classList.remove('drag-over');
            
            if (draggedGameId !== targetGameId) {
                card.classList.add('drop-success');
                
                setTimeout(() => {
                    card.classList.remove('drop-success');
                }, 600);
                
                handleGameReorder(draggedGameId, targetGameId);
            }
        });

        return card;
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
                                    const playerCountElement = card.querySelector('p');
                                    if (playerCountElement) {
                                        playerCountElement.textContent = `${formatPlayerCount(cachedData.count)} playing`;
                                        playerCountElement.style.transition = 'color 0.3s ease';
                                        playerCountElement.style.color = '#4caf50';
                                        setTimeout(() => {
                                            playerCountElement.style.color = 'var(--pg-muted)';
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
                const playerCountElement = card.querySelector('p');
                
                if (playerCountElement && newPlayerCount !== null) {
                    playerCountElement.textContent = `${formatPlayerCount(newPlayerCount)} playing`;
                    
                    playerCountElement.style.transition = 'color 0.3s ease';
                    playerCountElement.style.color = '#4caf50';
                    setTimeout(() => {
                        playerCountElement.style.color = 'var(--pg-muted)';
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

    async function syncGameDetails(gameId, card) {

        const syncBtn = card.querySelector('.sync-game-btn');
        const originalSyncContent = syncBtn.innerHTML;
        
        syncBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
        </svg>`;
        syncBtn.disabled = true;
        syncBtn.style.cursor = 'wait';
        syncBtn.style.opacity = '0.7';

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

                const thumbnailImg = card.querySelector('img');
                const titleElement = card.querySelector('h4');
                const playerCountElement = card.querySelector('p');

                if (thumbnailImg) {
                    thumbnailImg.src = updatedGameInfo.thumbnail;
                }
                if (titleElement) {
                    titleElement.textContent = updatedGameInfo.name;
                    titleElement.title = updatedGameInfo.name;
                }
                if (playerCountElement) {
                    playerCountElement.textContent = `${formatPlayerCount(updatedGameInfo.playerCount)} playing`;
                    
                    playerCountElement.style.transition = 'color 0.3s ease';
                    playerCountElement.style.color = '#4caf50';
                    setTimeout(() => {
                        playerCountElement.style.color = 'var(--pg-muted)';
                    }, 1500);
                }

                syncBtn.style.background = 'rgba(76, 175, 80, 0.9)';
                syncBtn.style.borderColor = '#4caf50';
                syncBtn.style.boxShadow = '0 0 8px rgba(76, 175, 80, 0.5)';
                const successSvg = syncBtn.querySelector('svg');
                if (successSvg) successSvg.style.stroke = 'white';
                setTimeout(() => {
                    syncBtn.style.background = 'rgba(25, 0, 51, 0.8)';
                    syncBtn.style.borderColor = 'rgba(138, 43, 226, 0.4)';
                    syncBtn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
                    if (successSvg) successSvg.style.stroke = 'rgba(138, 43, 226, 0.9)';
                }, 1000);
            }
        } catch (error) {

            syncBtn.style.background = 'rgba(244, 67, 54, 0.9)';
            syncBtn.style.borderColor = '#f44336';
            syncBtn.style.boxShadow = '0 0 8px rgba(244, 67, 54, 0.5)';
            const errorSvg = syncBtn.querySelector('svg');
            if (errorSvg) errorSvg.style.stroke = 'white';
            setTimeout(() => {
                syncBtn.style.background = 'rgba(25, 0, 51, 0.8)';
                syncBtn.style.borderColor = 'rgba(138, 43, 226, 0.4)';
                syncBtn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
                if (errorSvg) errorSvg.style.stroke = 'rgba(138, 43, 226, 0.9)';
            }, 1000);
        } finally {
            syncBtn.innerHTML = originalSyncContent;
            syncBtn.disabled = false;
            syncBtn.style.cursor = 'pointer';
            syncBtn.style.opacity = '1';
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

    function showGameFolderMenu(gameId, anchorElement) {
        const existingMenu = document.querySelector('.game-folder-menu');
        if (existingMenu) existingMenu.remove();

        injectFolderStyles();

        const game = pinnedGames.find(g => g.id === gameId);
        const gameFolderIds = game?.folderIds || [];

        const rect = anchorElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const menuHeight = Math.min(300, 56 + folders.length * 40 + 52);
        const spaceBelow = viewportHeight - rect.bottom - 8;
        const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;

        const menu = document.createElement('div');
        menu.className = 'game-folder-menu';
        menu.style.cssText = `
            position: fixed;
            left: ${Math.max(8, Math.min(rect.left, window.innerWidth - 220))}px;
            ${openUpward ? `bottom: ${viewportHeight - rect.top + 10}px;` : `top: ${rect.bottom + 10}px;`}
            background: var(--pg-bg);
            backdrop-filter: var(--pg-glass);
            -webkit-backdrop-filter: var(--pg-glass);
            border: 1px solid var(--pg-border);
            border-radius: 12px;
            padding: 8px;
            z-index: 10001;
            box-shadow: var(--pg-shadow);
            max-height: 300px;
            overflow-y: auto;
            min-width: 220px;
            scrollbar-width: none;
            animation: pgf-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        `;

        const menuTitle = document.createElement('div');
        menuTitle.style.cssText = `
            font-size: 11px;
            font-weight: 800;
            color: var(--pg-accent);
            text-transform: uppercase;
            letter-spacing: 0.1em;
            padding: 6px 10px 8px;
            border-bottom: 1px solid var(--pg-border);
            margin-bottom: 6px;
        `;
        menuTitle.textContent = t('pinnedGames_addToFolder');
        menu.appendChild(menuTitle);

        const allGamesRow = document.createElement('div');
        allGamesRow.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 10px;
            border-radius: 8px;
            color: var(--pg-muted);
            font-size: 13px;
            cursor: default;
            user-select: none;
        `;
        allGamesRow.innerHTML = `
            <span style="display:flex;align-items:center;color:var(--pg-accent);">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </span>
            <span style="flex:1;font-weight:600;margin-left:4px;">${t('pinnedGames_allGames')}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        `;
        menu.appendChild(allGamesRow);

        if (folders.length > 0) {
            const sep = document.createElement('div');
            sep.style.cssText = `height:1px;background:var(--pg-border);margin:6px 0;`;
            menu.appendChild(sep);
        }

        folders.forEach(folder => {
            const inFolder = gameFolderIds.includes(folder.id);
            const rgb = hexToRgb(folder.color);

            const row = document.createElement('button');
            row.style.cssText = `
                display: flex;
                align-items: center;
                gap: 10px;
                width: 100%;
                padding: 8px 10px;
                background: ${inFolder ? `rgba(${rgb},0.2)` : 'transparent'};
                border: 1px solid ${inFolder ? `rgba(${rgb},0.4)` : 'transparent'};
                color: var(--pg-text);
                text-align: left;
                cursor: pointer;
                border-radius: 8px;
                font-size: 13px;
                font-weight: ${inFolder ? '700' : '500'};
                transition: all 0.2s ease;
                margin-bottom: 4px;
                box-sizing: border-box;
            `;
            row.innerHTML = `
                <span style="width:12px;height:12px;border-radius:3px;background:${folder.color};flex-shrink:0;display:inline-block;"></span>
                <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${folder.name}</span>
                ${inFolder
                    ? `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
                    : `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>`
                }
            `;

            row.addEventListener('mouseenter', () => {
                if (inFolder) {
                    row.style.background = `rgba(${rgb},0.32)`;
                } else {
                    row.style.background = `rgba(${rgb},0.15)`;
                    row.style.borderColor = `rgba(${rgb},0.3)`;
                }
            });
            row.addEventListener('mouseleave', () => {
                row.style.background = inFolder ? `rgba(${rgb},0.22)` : 'transparent';
                row.style.borderColor = inFolder ? `rgba(${rgb},0.4)` : 'transparent';
            });
            row.addEventListener('click', async () => {
                menu.remove();
                await animateGameMove(gameId, folder.id);
            });

            menu.appendChild(row);
        });

        const divider = document.createElement('div');
        divider.style.cssText = `height:1px;background:var(--pg-border);margin:6px 0;`;
        menu.appendChild(divider);

        const createBtn = document.createElement('button');
        createBtn.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            padding: 10px;
            background: var(--pg-input-bg);
            border: 1px dashed var(--pg-accent-muted);
            color: var(--pg-accent);
            text-align: center;
            cursor: pointer;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            transition: all 0.2s ease;
            box-sizing: border-box;
        `;
        createBtn.innerHTML = `
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
            <span>${t('pinnedGames_newFolder')}</span>
        `;
        createBtn.addEventListener('mouseenter', () => {
            createBtn.style.background = 'var(--pg-accent)';
            createBtn.style.borderColor = 'var(--pg-accent)';
            createBtn.style.color = 'white';
            createBtn.style.transform = 'translateY(-1px)';
        });
        createBtn.addEventListener('mouseleave', () => {
            createBtn.style.background = 'var(--pg-input-bg)';
            createBtn.style.borderColor = 'var(--pg-accent-muted)';
            createBtn.style.color = 'var(--pg-accent)';
            createBtn.style.transform = 'translateY(0)';
        });
        createBtn.addEventListener('click', () => {
            menu.remove();
            showCreateFolderDialog(gameId);
        });
        menu.appendChild(createBtn);

        document.body.appendChild(menu);

        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target) && e.target !== anchorElement) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
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
