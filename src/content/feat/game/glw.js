/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
if (!window.gameLauncherWidgetInitialized) {
    function t(key, substitutions) { return chrome.i18n.getMessage(key, substitutions) || key; }
    window.gameLauncherWidgetInitialized = true;

    let widgetEnabled = false;
    let themeObserver = null;
    let widgetPosition = { x: 20, y: 20 };
    let isExpanded = false;
    let searchCache = new Map();
    let recentGames = [];
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    let activeSearchIndex = -1;
    let dragRaf = 0;
    let currentSearchResults = [];
    let currentSortMode = 'players-desc';

    const CACHE_DURATION = 5 * 60 * 1000; 
    const MAX_RECENT_GAMES = 5;
    const SEARCH_DEBOUNCE_MS = 300;
    const SORT_MODES = ['players-desc', 'players-asc', 'name-asc', 'name-desc'];

    initializeGameLauncherWidget();

    async function initializeGameLauncherWidget() {
        await window.__PurpuraSettings.ready;
        const result = { 'glw': window.__PurpuraSettings.get('glw') };
        if (!result['glw']) return;

        const themeRes = await chrome.runtime.sendMessage({ action: "getRobloxTheme" });
        const isLight = themeRes?.theme === "light";

        if (themeObserver) themeObserver.disconnect();
        themeObserver = new MutationObserver(async () => {
            const currentThemeRes = await chrome.runtime.sendMessage({ action: "getRobloxTheme" });
            const isNowLight = currentThemeRes?.theme === "light";
            const widget = document.getElementById('purpura-game-launcher-widget');
            if (widget) {
                widget.classList.toggle('light-mode', isNowLight);
                widget.classList.toggle('dark-mode', !isNowLight);
            }
        });
        
        const observeOptions = { attributes: true, attributeFilter: ['class'] };
        themeObserver.observe(document.documentElement, observeOptions);
        if (document.body) themeObserver.observe(document.body, observeOptions);

        const localData = await chrome.storage.local.get(['widgetPosition', 'recentGames', 'widgetSortMode']);
        widgetPosition = localData.widgetPosition || { x: (window.innerWidth - 80) / window.innerWidth, y: (window.innerHeight - 80) / window.innerHeight };

        if (Math.abs(widgetPosition.x) > 1 || Math.abs(widgetPosition.y) > 1) {
            widgetPosition = { x: widgetPosition.x / window.innerWidth, y: widgetPosition.y / window.innerHeight };
            chrome.storage.local.set({ widgetPosition });
        }
        recentGames = localData.recentGames || [];
        currentSortMode = SORT_MODES.includes(localData.widgetSortMode) ? localData.widgetSortMode : 'players-desc';

        widgetEnabled = true;
        createWidget(isLight);
    }

    function createWidget(isLight) {
        if (document.getElementById('purpura-game-launcher-widget')) return;

        const widget = document.createElement('div');
        widget.id = 'purpura-game-launcher-widget';
        widget.className = `purpura-widget collapsed ${isLight ? 'light-mode' : 'dark-mode'}`;
        widget.style.left = `${widgetPosition.x * window.innerWidth}px`;
        widget.style.top = `${widgetPosition.y * window.innerHeight}px`;
        widget.style.position = 'fixed';

        widget.innerHTML = `
            <div class="purpura-widget-button" id="purpuraWidgetButton">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </div>

            <div class="purpura-widget-panel" id="purpuraWidgetPanel">
                <div class="purpura-widget-header">
                    <div class="purpura-widget-title">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        ${t('gameLauncher_title')}
                    </div>
                    <button class="purpura-widget-close" id="purpuraWidgetClose">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <div class="purpura-widget-search">
                    <svg class="purpura-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <input 
                        type="text" 
                        id="purpuraGameSearch" 
                        placeholder="${t('gameLauncher_searchPlaceholder')}"
                        autocomplete="off"
                        spellcheck="false"
                    >
                    <button class="purpura-clear-search" id="purpuraClearSearch" style="display: none;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <div class="purpura-widget-content" id="purpuraWidgetContent">
                    <div class="purpura-recent-games" id="purpuraRecentGames" style="display: none;">
                        <div class="purpura-section-title">${t('gameLauncher_recentGames')}</div>
                        <div class="purpura-recent-list" id="purpuraRecentList"></div>
                    </div>
                    
                    <div class="purpura-search-results" id="purpuraSearchResults" style="display: none;">
                        <div class="purpura-results-header">
                            <div class="purpura-section-title">${t('gameLauncher_searchResults')}</div>
                            <select id="purpuraSortSelect" class="purpura-sort-select" aria-label="Sort search results">
                                <option value="players-desc">${t('gameLauncher_sortPlayersDesc')}</option>
                                <option value="players-asc">${t('gameLauncher_sortPlayersAsc')}</option>
                                <option value="name-asc">${t('gameLauncher_sortNameAsc')}</option>
                                <option value="name-desc">${t('gameLauncher_sortNameDesc')}</option>
                            </select>
                        </div>
                        <div class="purpura-results-list" id="purpuraResultsList"></div>
                    </div>

                    <div class="purpura-empty-state" id="purpuraEmptyState">
                        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="M21 21l-4.35-4.35"/>
                        </svg>
                        <p>${t('gameLauncher_emptyTitle')}</p>
                        <span>${t('gameLauncher_emptySubtitle')}</span>
                    </div>

                    <div class="purpura-loading-state" id="purpuraLoadingState" style="display: none;">
                        <div class="purpura-spinner"></div>
                        <p>${t('gameLauncher_searching')}</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(widget);
        injectWidgetStyles();
        attachEventListeners();
        
        ensureWidgetOnScreen();
        
        if (recentGames.length > 0) {
            displayRecentGames();
        }
    }

    function ensureGlwStyles() {
        if (document.getElementById('purpura-glw-vars')) return;
        var s = document.createElement('style');
        s.id = 'purpura-glw-vars';
        s.textContent = ':root{' +
            '--purpura-glw-search-bg:#F1F5F9;--purpura-glw-search-border:#E2E8F0;' +
            '--purpura-glw-search-bg-focus:#FFFFFF;--purpura-glw-item-border:#F1F5F9;' +
            '--purpura-glw-item-bg-hover:#FFFFFF;--purpura-glw-option-bg:#1e1e2e;' +
            '--purpura-glw-option-color:white;--purpura-glw-svg-stroke:rgba(138,43,226,0.5)}';
        document.head.appendChild(s);
    }

    function injectWidgetStyles() {
        ensureGlwStyles();
        if (document.getElementById('purpura-widget-styles')) return;

        const style = document.createElement('style');
        style.id = 'purpura-widget-styles';
        style.textContent = `
            .purpura-widget {
                all: initial;
                font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
                --pw-accent: #A855F7;
                --pw-accent-dark: #7E22CE;
                --pw-bg: rgba(15, 15, 20, 0.85);
                --pw-border: rgba(168, 85, 247, 0.25);
                --pw-text: #F8FAFC;
                --pw-muted: rgba(248, 250, 252, 0.5);
                --pw-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
                --pw-card-bg: rgba(168, 85, 247, 0.05);
                --pw-item-hover: rgba(168, 85, 247, 0.12);
                --pw-input-bg: rgba(0, 0, 0, 0.4);
                touch-action: none;
                will-change: left, top;
                width: 64px;
                height: 64px;
                pointer-events: none;
                z-index: 2147483600;
            }

            .purpura-widget.light-mode {
                --pw-bg: rgba(255, 255, 255, 0.7);
                --pw-border: rgba(168, 85, 247, 0.2);
                --pw-text: #0F172A;
                --pw-muted: #475569;
                --pw-shadow: 0 20px 50px rgba(0, 0, 0, 0.06);
                --pw-card-bg: rgba(255, 255, 255, 0.3);
                --pw-item-hover: rgba(255, 255, 255, 0.8);
                --pw-input-bg: rgba(255, 255, 255, 0.5);
            }

            .purpura-widget.expanded {
                width: 350px;
                height: 480px;
            }

            .purpura-widget * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }

            .purpura-widget-button {
                width: 60px;
                height: 60px;
                background: var(--pw-bg);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: move;
                box-shadow: var(--pw-shadow);
                transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
                border: 1.5px solid var(--pw-border);
                position: relative;
                pointer-events: auto;
            }

            .purpura-widget-button:hover {
                transform: scale(1.08) translateY(-2px);
                border-color: var(--pw-accent);
                box-shadow: 0 12px 30px rgba(168, 85, 247, 0.25);
            }

            .purpura-widget-button svg {
                stroke: var(--pw-accent);
                transition: transform 0.3s ease;
            }

            .purpura-widget.expanded .purpura-widget-button {
                opacity: 0;
                transform: scale(0.5);
                pointer-events: none;
            }

            .purpura-widget-panel {
                width: 340px;
                background: var(--pw-bg);
                backdrop-filter: blur(32px);
                -webkit-backdrop-filter: blur(32px);
                border-radius: 24px;
                box-shadow: var(--pw-shadow), inset 0 0 0 1px rgba(255, 255, 255, 0.2);
                border: 1px solid var(--pw-border);
                overflow: hidden;
                position: absolute;
                top: 0;
                left: 0;
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
                transform: translateY(24px) scale(0.96);
                transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .purpura-widget.expanded .purpura-widget-panel {
                opacity: 1;
                visibility: visible;
                pointer-events: auto;
                transform: translateY(0) scale(1);
            }

            .purpura-widget.light-mode .purpura-widget-panel {
                border-top: 5px solid var(--pw-accent);
                backdrop-filter: blur(45px) saturate(210%);
                -webkit-backdrop-filter: blur(45px) saturate(210%);
                box-shadow: var(--pw-shadow), inset 0 0 0 1.5px rgba(255, 255, 255, 0.5);
            }

            .purpura-widget-header {
                padding: 16px 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid var(--pw-border);
                cursor: move;
                user-select: none;
            }

            .purpura-widget-title {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 16px;
                font-weight: 800;
                color: var(--pw-text);
                letter-spacing: -0.3px;
            }

            .purpura-widget-title svg {
                stroke: var(--pw-accent);
                width: 22px;
                height: 22px;
            }

            .purpura-widget-close {
                background: rgba(168, 85, 247, 0.1);
                border: none;
                color: var(--pw-text);
                cursor: pointer;
                padding: 8px;
                border-radius: 12px;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .purpura-widget-close:hover {
                background: rgba(168, 85, 247, 0.2);
                transform: scale(1.1);
            }

            .purpura-widget-search {
                padding: 14px 18px;
                border-bottom: 1px solid var(--pw-border);
                position: relative;
                display: flex;
                align-items: center;
            }

            .purpura-search-icon {
                position: absolute;
                left: 32px;
                color: var(--pw-accent);
                opacity: 0.6;
                pointer-events: none;
                z-index: 2;
            }

            #purpuraGameSearch {
                width: 100%;
                background: var(--pw-input-bg);
                border: 1px solid var(--pw-border);
                border-radius: 14px;
                padding: 12px 16px 12px 42px;
                color: var(--pw-text);
                font-size: 14px;
                font-weight: 600;
                outline: none;
                transition: all 0.3s ease;
            }

            #purpuraGameSearch:focus {
                border-color: var(--pw-accent);
                background: var(--pw-bg);
                box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.15);
            }

            .purpura-widget.light-mode #purpuraGameSearch {
                background: var(--purpura-glw-search-bg);
                border-color: var(--purpura-glw-search-border);
            }

            .purpura-widget.light-mode #purpuraGameSearch:focus {
                background: var(--purpura-glw-search-bg-focus);
                border-color: var(--pw-accent);
            }

            .purpura-clear-search {
                position: absolute;
                right: 32px;
                background: transparent;
                border: none;
                color: var(--pw-muted);
                cursor: pointer;
                padding: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: color 0.2s;
            }

            .purpura-clear-search:hover {
                color: var(--pw-text);
            }

            .purpura-widget-content {
                height: 380px;
                overflow-y: auto;
                padding: 16px;
            }

            .purpura-widget-content::-webkit-scrollbar {
                width: 5px;
            }

            .purpura-widget-content::-webkit-scrollbar-thumb {
                background: var(--pw-accent);
                border-radius: 10px;
            }

            .purpura-section-title {
                font-size: 11px;
                font-weight: 800;
                color: var(--pw-muted);
                text-transform: uppercase;
                letter-spacing: 1.2px;
                margin-bottom: 16px;
                padding-left: 4px;
            }

            .purpura-game-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: var(--pw-card-bg);
                border: 1px solid var(--pw-border);
                border-radius: 18px;
                margin-bottom: 10px;
                cursor: pointer;
                transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .purpura-widget.light-mode .purpura-game-item {
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
                border-color: var(--purpura-glw-item-border);
            }

            .purpura-game-item:hover {
                background: var(--pw-item-hover);
                border-color: var(--pw-accent);
                transform: translateY(-3px);
                box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
            }

            .purpura-widget.light-mode .purpura-game-item:hover {
                background: var(--purpura-glw-item-bg-hover);
                border-color: var(--pw-accent);
                box-shadow: 0 15px 35px rgba(168, 85, 247, 0.1);
            }

            @keyframes purpuraFadeUp {
                from {
                    opacity: 0;
                    transform: translateY(16px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .purpura-game-item {
                animation: purpuraFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
            }

            .purpura-empty-state, .purpura-loading-state, .purpura-no-results {
                animation: purpuraFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
            }
                box-shadow: 0 15px 35px rgba(168, 85, 247, 0.1);
            }

            .purpura-game-item.is-active {
                background: var(--pw-item-hover);
                border-color: var(--pw-accent);
                box-shadow: 0 0 0 1px var(--pw-accent) inset;
            }

            .purpura-game-thumbnail {
                width: 56px;
                height: 56px;
                border-radius: 14px;
                object-fit: cover;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            .purpura-game-info {
                flex: 1;
                min-width: 0;
            }

            .purpura-game-name {
                font-size: 15px;
                font-weight: 700;
                color: var(--pw-text);
                margin-bottom: 4px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .purpura-game-stats {
                font-size: 12px;
                font-weight: 600;
                color: var(--pw-muted);
            }

            .purpura-game-actions {
                display: flex;
                gap: 8px;
            }

            .purpura-play-button, .purpura-smallest-button {
                width: 38px;
                height: 38px;
                background: var(--pw-accent);
                border: none;
                color: white;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3);
            }

            .purpura-play-button:hover, .purpura-smallest-button:hover {
                transform: scale(1.1);
                background: var(--pw-accent-dark);
            }

            .purpura-smallest-button {
                background: rgba(168, 85, 247, 0.15);
                color: var(--pw-accent);
                box-shadow: none;
                border: 1px solid var(--pw-border);
            }

            .purpura-smallest-button:hover {
                background: rgba(168, 85, 247, 0.25);
            }

            .purpura-empty-state, .purpura-loading-state, .purpura-no-results {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 60px 20px;
                text-align: center;
            }

            .purpura-empty-state svg, .purpura-no-results svg {
                margin-bottom: 20px;
                opacity: 0.4;
                color: var(--pw-accent);
            }

            .purpura-empty-state p, .purpura-loading-state p, .purpura-no-results p {
                font-size: 15px;
                font-weight: 700;
                color: var(--pw-text);
                margin-bottom: 6px;
            }

            .purpura-empty-state span, .purpura-no-results span {
                font-size: 13px;
                color: var(--pw-muted);
            }

            .purpura-spinner {
                width: 36px;
                height: 36px;
                border: 3px solid var(--pw-border);
                border-top-color: var(--pw-accent);
                border-radius: 50%;
                animation: spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite;
                margin-bottom: 16px;
            }

            .purpura-results-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 20px;
            }

            .purpura-sort-select {
                background: var(--pw-input-bg);
                color: var(--pw-text);
                border: 1px solid var(--pw-border);
                border-radius: 10px;
                font-size: 12px;
                font-weight: 700;
                padding: 6px 12px;
                outline: none;
                cursor: pointer;
            }

            .purpura-sort-select option {
                background: var(--purpura-glw-option-bg);
                color: var(--purpura-glw-option-color);
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;

        document.head.appendChild(style);
    }

    function attachEventListeners() {
        const button = document.getElementById('purpuraWidgetButton');
        const closeBtn = document.getElementById('purpuraWidgetClose');
        const searchInput = document.getElementById('purpuraGameSearch');
        const clearBtn = document.getElementById('purpuraClearSearch');
        const header = document.querySelector('.purpura-widget-header');
        const sortSelect = document.getElementById('purpuraSortSelect');

        button.addEventListener('click', (e) => {
            if (!isDragging) {
                toggleWidget();
            }
        });

        closeBtn.addEventListener('click', () => toggleWidget());

        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            activeSearchIndex = -1;
            
            if (query.length === 0) {
                clearBtn.style.display = 'none';
                showRecentGames();
            } else {
                clearBtn.style.display = 'block';
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => searchGames(query), SEARCH_DEBOUNCE_MS);
            }
        });

        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            activeSearchIndex = -1;
            currentSearchResults = [];
            showRecentGames();
            searchInput.focus();
        });

        sortSelect.value = currentSortMode;
        sortSelect.addEventListener('change', (e) => {
            currentSortMode = e.target.value;
            activeSearchIndex = -1;
            chrome.storage.local.set({ widgetSortMode: currentSortMode });
            renderSortedSearchResults();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key !== '/') {
                return;
            }

            if (!isExpanded) {
                return;
            }

            const target = e.target;
            const targetTag = target?.tagName;
            if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT' || target?.isContentEditable) {
                return;
            }

            e.preventDefault();
            searchInput.focus();
            searchInput.select();
        });

        searchInput.addEventListener('keydown', (e) => {
            const hasResultsOpen = document.getElementById('purpuraSearchResults').style.display === 'block';
            if (!hasResultsOpen) {
                return;
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                moveActiveSearchItem(1);
                return;
            }

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                moveActiveSearchItem(-1);
                return;
            }

            if (e.key === 'Enter') {
                const activeItem = getActiveSearchItem();
                if (!activeItem) {
                    return;
                }

                e.preventDefault();

                if (e.shiftKey) {
                    activeItem.querySelector('.purpura-smallest-button')?.click();
                } else {
                    activeItem.querySelector('.purpura-play-button')?.click();
                }
                return;
            }

            if (e.key === 'Escape') {
                activeSearchIndex = -1;
                updateActiveSearchItem();
            }
        });

        setupDragging(button);
        setupDragging(header);
    }

    function setupDragging(element) {
        element.addEventListener('pointerdown', startDrag);
        
        function startDrag(e) {
            if (e.button !== 0) {
                return;
            }

            if (e.target.closest('.purpura-widget-close, .purpura-play-button, .purpura-smallest-button, .purpura-clear-search, #purpuraGameSearch')) {
                return;
            }

            isDragging = false;
            const widget = document.getElementById('purpura-game-launcher-widget');
            const panel = document.getElementById('purpuraWidgetPanel');
            const rect = widget.getBoundingClientRect();
            widget.classList.add('dragging');
            element.setPointerCapture(e.pointerId);
            document.body.style.userSelect = 'none';
            document.body.style.webkitUserSelect = 'none';

            const collapsedWidth = 56;
            const collapsedHeight = 56;
            const panelRect = panel ? panel.getBoundingClientRect() : null;
            const activeWidth = isExpanded ? Math.ceil(panelRect?.width || 380) : collapsedWidth;
            const activeHeight = isExpanded ? Math.ceil(panelRect?.height || 450) : collapsedHeight;
            
            dragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };

            let hasMoved = false;
            let pendingX = rect.left;
            let pendingY = rect.top;

            function applyDragPosition() {
                dragRaf = 0;
                widget.style.left = pendingX + 'px';
                widget.style.top = pendingY + 'px';
                widgetPosition = { x: pendingX / window.innerWidth, y: pendingY / window.innerHeight };
            }

            function onPointerMove(e) {
                if (!hasMoved) {
                    hasMoved = true;
                    isDragging = true;
                }

                const newX = Math.max(0, Math.min(window.innerWidth - activeWidth, e.clientX - dragOffset.x));
                const newY = Math.max(0, Math.min(window.innerHeight - activeHeight, e.clientY - dragOffset.y));

                pendingX = newX;
                pendingY = newY;

                if (!dragRaf) {
                    dragRaf = requestAnimationFrame(applyDragPosition);
                }
            }

            function onPointerUp() {
                document.removeEventListener('pointermove', onPointerMove);
                document.removeEventListener('pointerup', onPointerUp);
                document.removeEventListener('pointercancel', onPointerUp);

                if (dragRaf) {
                    cancelAnimationFrame(dragRaf);
                    dragRaf = 0;
                    applyDragPosition();
                }
                
                if (hasMoved) {
                    chrome.storage.local.set({ widgetPosition });
                }

                document.body.style.userSelect = '';
                document.body.style.webkitUserSelect = '';
                widget.classList.remove('dragging');

                setTimeout(() => {
                    isDragging = false;
                }, 100);
            }

            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp);
            document.addEventListener('pointercancel', onPointerUp);
        }
    }

    function toggleWidget() {
        const widget = document.getElementById('purpura-game-launcher-widget');
        const searchInput = document.getElementById('purpuraGameSearch');

        isExpanded = !isExpanded;

        if (isExpanded) {
            const rect = widget.getBoundingClientRect();
            const panelWidth = 380;
            const panelHeight = 450;

            widget.setAttribute('data-original-x', rect.left);
            widget.setAttribute('data-original-y', rect.top);

            let newX = rect.left;
            let newY = rect.top;

            if (newX + panelWidth > window.innerWidth) {
                newX = window.innerWidth - panelWidth - 20;
            }

            if (newY + panelHeight > window.innerHeight) {
                newY = window.innerHeight - panelHeight - 20;
            }

            newX = Math.max(20, newX);
            newY = Math.max(20, newY);

            widget.style.left = newX + 'px';
            widget.style.top = newY + 'px';

            widget.classList.add('expanded');
            showRecentGames();
            setTimeout(() => searchInput.focus(), 72);
        } else {
            const origX = widget.getAttribute('data-original-x');
            const origY = widget.getAttribute('data-original-y');
            if (origX !== null && origY !== null) {
                widget.style.left = origX + 'px';
                widget.style.top = origY + 'px';
            }
            widget.classList.remove('expanded');
            searchInput.value = '';
            document.getElementById('purpuraClearSearch').style.display = 'none';
            activeSearchIndex = -1;
            currentSearchResults = [];
            updateActiveSearchItem();
        }
    }

    async function searchGames(query) {
        const resultsContainer = document.getElementById('purpuraSearchResults');
        const resultsList = document.getElementById('purpuraResultsList');
        const loadingState = document.getElementById('purpuraLoadingState');
        const emptyState = document.getElementById('purpuraEmptyState');
        const recentSection = document.getElementById('purpuraRecentGames');

        emptyState.style.display = 'none';
        recentSection.style.display = 'none';
        resultsContainer.style.display = 'none';
        loadingState.style.display = 'flex';

        try {
            const cacheKey = query.toLowerCase();
            const cached = searchCache.get(cacheKey);
            
            if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
                displaySearchResults(cached.results);
                return;
            }

            const response = await chrome.runtime.sendMessage({
                action: 'searchGames',
                query: query
            });

            if (!response || response.error) {
                throw new Error(response?.error || 'Search failed');
            }

            const results = response.results || [];

            searchCache.set(cacheKey, {
                results,
                timestamp: Date.now()
            });

            displaySearchResults(results);

        } catch (error) {
            loadingState.style.display = 'none';
            displayNoResults();
        }
    }

    function displaySearchResults(results) {
        const resultsContainer = document.getElementById('purpuraSearchResults');
        const loadingState = document.getElementById('purpuraLoadingState');

        loadingState.style.display = 'none';
        activeSearchIndex = -1;
        currentSearchResults = Array.isArray(results) ? results : [];

        if (currentSearchResults.length === 0) {
            displayNoResults();
            return;
        }

        resultsContainer.style.display = 'block';
        renderSortedSearchResults();
    }

    function displayNoResults() {
        const resultsList = document.getElementById('purpuraResultsList');
        activeSearchIndex = -1;
        currentSearchResults = [];
        resultsList.innerHTML = `
            <div class="purpura-no-results">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none"                stroke="var(--purpura-glw-svg-stroke)" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                </svg>
                <p>${t('gameLauncher_noResults')}</p>
            </div>
        `;
        document.getElementById('purpuraSearchResults').style.display = 'block';
        document.getElementById('purpuraLoadingState').style.display = 'none';
    }

    function createGameItem(game, index = 0) {
        const item = document.createElement('div');
        item.className = 'purpura-game-item';
        item.dataset.gameId = String(game.id);
        item.style.animationDelay = `${index * 0.05}s`;
        
        item.innerHTML = `
            <img class="purpura-game-thumbnail" src="${game.thumbnail}" alt="${game.name}">
            <div class="purpura-game-info">
                <div class="purpura-game-name" title="${game.name}">${game.name}</div>
                <div class="purpura-game-stats">
                    <span class="purpura-stat">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:4px;vertical-align:middle;opacity:0.7;">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                        </svg>
                        ${formatPlayerCount(game.playerCount)}
                    </span>
                </div>
            </div>
            <div class="purpura-game-actions">
                <button class="purpura-play-button" data-game-id="${game.id}" title="${t('gameLauncher_play')}" aria-label="Play ${escapeAttribute(game.name)}">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path d="M8 5.14v14l11-7z"/>
                    </svg>
                </button>
                <button class="purpura-smallest-button" data-game-id="${game.id}" title="${t('gameLauncher_joinSmallest')}" aria-label="Join smallest server in ${escapeAttribute(game.name)}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M19 13l2-2-2-2m2 2h-6"/>
                    </svg>
                </button>
            </div>
        `;

        item.addEventListener('click', () => {
            launchGame(game);
        });

        item.querySelector('.purpura-play-button').addEventListener('click', (e) => {
            e.stopPropagation();
            launchGame(game);
        });

        item.querySelector('.purpura-smallest-button').addEventListener('click', (e) => {
            e.stopPropagation();
            launchSmallestServer(game.id);
        });

        return item;
    }

    function showRecentGames() {
        const emptyState = document.getElementById('purpuraEmptyState');
        const recentSection = document.getElementById('purpuraRecentGames');
        const resultsSection = document.getElementById('purpuraSearchResults');
        const loadingState = document.getElementById('purpuraLoadingState');
        activeSearchIndex = -1;
        currentSearchResults = [];

        resultsSection.style.display = 'none';
        loadingState.style.display = 'none';

        if (recentGames.length === 0) {
            emptyState.style.display = 'flex';
            recentSection.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            displayRecentGames();
        }
    }

    function displayRecentGames() {
        const recentSection = document.getElementById('purpuraRecentGames');
        const recentList = document.getElementById('purpuraRecentList');
        activeSearchIndex = -1;

        recentSection.style.display = 'block';
        recentList.innerHTML = '';

        recentGames.forEach((game, index) => {
            const gameItem = createGameItem(game, index);
            recentList.appendChild(gameItem);
        });
    }

    function launchGame(game) {
        addToRecentGames(game);
        window.location.href = `roblox://placeid=${game.id}`;

    }

    async function launchSmallestServer(gameId) {
        try {
            const response = await fetch(
                `https://games.roblox.com/v1/games/${gameId}/servers/Public?sortOrder=Asc&limit=100`
            );

            if (!response.ok) {
                window.location.href = `roblox://placeid=${gameId}`;
                return;
            }

            const data = await response.json();
            
            if (!data.data || data.data.length === 0) {
                window.location.href = `roblox://placeid=${gameId}`;
                return;
            }

            let smallestServer = data.data.reduce((smallest, server) => {
                if (server.playing > 0 && server.playing < smallest.playing) {
                    return server;
                }
                return smallest;
            }, data.data[0]);

            window.location.href = `roblox://placeid=${gameId}&gameinstanceid=${smallestServer.id}`;

        } catch (error) {
            window.location.href = `roblox://placeid=${gameId}`;
        }
    }

    function addToRecentGames(game) {
        recentGames = recentGames.filter(g => g.id !== game.id);
        
        recentGames.unshift(game);
        
        recentGames = recentGames.slice(0, MAX_RECENT_GAMES);
        
        chrome.storage.local.set({ recentGames });
    }

    function formatPlayerCount(count) {
        if (typeof count !== 'number') return '0';
        return count.toLocaleString('en-US');
    }

    function renderSortedSearchResults() {
        const resultsContainer = document.getElementById('purpuraSearchResults');
        const resultsList = document.getElementById('purpuraResultsList');

        if (!currentSearchResults.length) {
            displayNoResults();
            return;
        }

        const sortedResults = sortGames(currentSearchResults, currentSortMode);
        resultsContainer.style.display = 'block';
        resultsList.innerHTML = '';

        sortedResults.forEach((game, index) => {
            const gameItem = createGameItem(game, index);
            resultsList.appendChild(gameItem);
        });

        updateActiveSearchItem();
    }

    function sortGames(games, mode) {
        const sorted = [...games];

        if (mode === 'players-asc') {
            sorted.sort((a, b) => toPlayerCount(a.playerCount) - toPlayerCount(b.playerCount));
            return sorted;
        }

        if (mode === 'name-asc') {
            sorted.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' }));
            return sorted;
        }

        if (mode === 'name-desc') {
            sorted.sort((a, b) => String(b.name || '').localeCompare(String(a.name || ''), undefined, { sensitivity: 'base' }));
            return sorted;
        }

        sorted.sort((a, b) => toPlayerCount(b.playerCount) - toPlayerCount(a.playerCount));
        return sorted;
    }

    function toPlayerCount(value) {
        return typeof value === 'number' && Number.isFinite(value) ? value : 0;
    }

    function escapeAttribute(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function getSearchItems() {
        return Array.from(document.querySelectorAll('#purpuraResultsList .purpura-game-item'));
    }

    function getActiveSearchItem() {
        const items = getSearchItems();
        if (!items.length || activeSearchIndex < 0 || activeSearchIndex >= items.length) {
            return null;
        }
        return items[activeSearchIndex];
    }

    function moveActiveSearchItem(direction) {
        const items = getSearchItems();
        if (!items.length) {
            return;
        }

        if (activeSearchIndex === -1) {
            activeSearchIndex = direction > 0 ? 0 : items.length - 1;
        } else {
            activeSearchIndex = (activeSearchIndex + direction + items.length) % items.length;
        }

        updateActiveSearchItem();
    }

    function updateActiveSearchItem() {
        const items = getSearchItems();
        items.forEach((item, index) => {
            item.classList.toggle('is-active', index === activeSearchIndex);
        });

        const activeItem = getActiveSearchItem();
        if (activeItem) {
            activeItem.scrollIntoView({ block: 'nearest' });
        }
    }

    function ensureWidgetOnScreen() {
        const widget = document.getElementById('purpura-game-launcher-widget');
        if (!widget) return;

        const buttonSize = 60;
        const maxX = window.innerWidth - buttonSize;
        const maxY = window.innerHeight - buttonSize;

        if (widgetPosition.x < 0) widgetPosition.x = 0;
        if (widgetPosition.x > 1) widgetPosition.x = 1;
        if (widgetPosition.y < 0) widgetPosition.y = 0;
        if (widgetPosition.y > 1) widgetPosition.y = 1;

        let newX = widgetPosition.x * window.innerWidth;
        let newY = widgetPosition.y * window.innerHeight;

        if (newX < 0) newX = 20;
        else if (newX > maxX) newX = maxX - 20;

        if (newY < 0) newY = 20;
        else if (newY > maxY) newY = maxY - 20;

        widget.style.left = `${newX}px`;
        widget.style.top = `${newY}px`;
    }

    window.addEventListener('resize', ensureWidgetOnScreen);
    window.addEventListener('load', ensureWidgetOnScreen);

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync' && changes['glw']) {
            const glwVal = window.__PurpuraSettings ? window.__PurpuraSettings.get('glw') : changes['glw'].newValue;
            const widget = document.getElementById('purpura-game-launcher-widget');
            
            if (glwVal && !widget) {
                initializeGameLauncherWidget();
            } else if (!glwVal && widget) {
                widget.remove();
                const styles = document.getElementById('purpura-widget-styles');
                if (styles) styles.remove();

            }
        }
    });
}
