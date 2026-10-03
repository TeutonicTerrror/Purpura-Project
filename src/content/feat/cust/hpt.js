/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
if (!window.homePageTweaksInitialized) {
    window.homePageTweaksInitialized = true;

    const STYLE_ID = 'purpura-home-page-tweaks-style';
    const TYPE_ATTR = 'data-purpura-type';
    const LABEL_SELECTOR = '[data-testid="text-icon-row-text"],.container-header h2,[data-testid="section-header-title-subtitle-container"],.people-list-header h2,h2.container-header,a[aria-label],div[aria-label],h3';
    const SECTION_WRAPPER_SELECTOR = '.game-sort-carousel-wrapper,[data-testid="home-page-game-grid"],[data-testid*="game-grid" i],.home-game-grid,.game-grid-container,[data-testid="game-carousel"],.friend-carousel-container,.game-carousel,.home-sort-container,[data-testid="home-page-carousel-container"],.react-friends-carousel-container,.pinned-games-carousel';
    const SIDEBAR_SELECTOR = '#left-navigation-container,.left-nav,.navigation-container,.groups-list-sidebar,.rbx-header,#header,#navigation';
    const SECTION_LABELS = {
        continuePlaying: 'Continue Playing',
        todaysGamePicks: "Today's Picks",
        recommendedGames: 'Recommended For You',
        favoriteGames: 'Favorite Games',
        standoutGames: 'Standout Games',
        pinnedGames: 'Pinned Games',
        friends: 'Friends',
        gamesMissing: "Games You're Missing",
        peopleYouMayKnow: 'People You May Know',
        underratedGames: 'Underrated Games'
    };

    let config = {};
    let observer = null;
    let lastUrl = location.href;
    let navigationListenerSetup = false;
    let visibilityListenerSetup = false;
    let applyTimer = null;
    let retryTimers = [];
    let layoutButtonEl = null;
    let layoutModalEl = null;
    let dragSrcEl = null;
    let homeTheme = 'dark';
    let homeThemeObserver = null;
    let firstMutation = true;

    function getHomeTheme() {
        const root = document.documentElement;
        if (root.classList.contains('dark-theme') || root.getAttribute('data-theme') === 'dark') return 'dark';
        if (root.classList.contains('light-theme') || root.getAttribute('data-theme') === 'light') return 'light';
        if (document.body) {
            if (document.body.classList.contains('dark-theme') || document.body.classList.contains('theme-dark')) return 'dark';
            if (document.body.classList.contains('light-theme') || document.body.classList.contains('theme-light')) return 'light';
        }
        return 'dark';
    }

    let bodyCheckInterval = null;

    function setupHomeThemeObserver() {
        if (homeThemeObserver) homeThemeObserver.disconnect();
        if (bodyCheckInterval) { clearInterval(bodyCheckInterval); bodyCheckInterval = null; }
        homeTheme = getHomeTheme();
        homeThemeObserver = new MutationObserver(() => {
            const t = getHomeTheme();
            if (t !== homeTheme) {
                homeTheme = t;                updateLayoutModalTheme();
                updateLayoutButtonTheme();
                fixGameCardTextColors();
            }
        });
        const observeOptions = { attributes: true, attributeFilter: ['class', 'data-theme'] };
        homeThemeObserver.observe(document.documentElement, observeOptions);
        if (document.body) {
            homeThemeObserver.observe(document.body, observeOptions);
        } else {
            const bodyCheck = setInterval(() => {
                if (document.body) {
                    clearInterval(bodyCheck);
                    if (homeThemeObserver) {
                        homeThemeObserver.observe(document.body, observeOptions);
                        const t = getHomeTheme();
                        if (t !== homeTheme) {
                            homeTheme = t;                            updateLayoutModalTheme();
                            updateLayoutButtonTheme();
                            fixGameCardTextColors();
                        }
                    }
                }
            }, 50);
            bodyCheckInterval = bodyCheck;
        }
    }

    function updateLayoutModalTheme() {
        const modal = document.getElementById('purpura-home-layout-modal');
        if (!modal) return;
        const isLight = homeTheme === 'light';
        const dialog = modal.querySelector('div');
        if (!dialog) return;
        const colors = isLight ? {
            bg: '#ffffff', border: 'rgba(0,0,0,0.12)', text: '#111113', text2: '#4b4b55', text3: '#8a8a95',
            card: 'rgba(0,0,0,0.03)', cardBorder: 'rgba(0,0,0,0.08)', accent: '#7c3aed',
            sliderOff: '#c8c8d0', btnBg: 'rgba(0,0,0,0.04)', btnBorder: 'rgba(0,0,0,0.1)', btnText: '#4b4b55',
            overlay: 'rgba(17,17,19,0.40)', shadow: '0 24px 64px rgba(0,0,0,0.15)'
        } : {
            bg: '#1a1b26', border: 'rgba(255,255,255,0.12)', text: '#f0eeff', text2: '#a89ec4', text3: '#6d6487',
            card: 'rgba(255,255,255,0.04)', cardBorder: 'rgba(255,255,255,0.08)', accent: '#9b6dff',
            sliderOff: '#2a2b36', btnBg: 'rgba(255,255,255,0.06)', btnBorder: 'rgba(255,255,255,0.1)', btnText: '#a89ec4',
            overlay: 'rgba(0,0,0,0.6)', shadow: '0 24px 64px rgba(0,0,0,0.6)'
        };
        dialog.style.background = colors.bg;
        dialog.style.border = '1px solid ' + colors.border;
        dialog.style.color = colors.text;
        dialog.style.boxShadow = colors.shadow;
        modal.style.background = colors.overlay;
        dialog.querySelectorAll('h3').forEach(h => { h.style.color = colors.text; });
        dialog.querySelectorAll('p').forEach(p => { p.style.color = colors.text3; });
        dialog.querySelectorAll('li').forEach(li => {
            li.style.background = colors.card;
            li.style.border = '1px solid ' + colors.cardBorder;
        });
        dialog.querySelectorAll('li > span:first-of-type').forEach(s => { s.style.color = colors.text3; });
        dialog.querySelectorAll('li > span:nth-of-type(2)').forEach(s => { s.style.color = colors.text; });
        dialog.querySelectorAll('li input[type=checkbox]').forEach(inp => {
            const sl = inp.nextElementSibling;
            if (sl) sl.style.background = inp.checked ? colors.accent : colors.sliderOff;
        });
        const buttons = dialog.querySelectorAll('button:not([id])');
        buttons.forEach(btn => {
            if (btn.textContent === '×') {
                btn.style.background = colors.card;
                btn.style.border = '1px solid ' + colors.cardBorder;
                btn.style.color = colors.text2;
            }
        });
    }

    function defaultConfig() {
        return {
            enabled: true,
            todaysGamePicks: false,
            continuePlaying: false,
            recommendedGames: false,
            favoriteGames: false,
            friends: false,
            standoutGames: false,
            pinnedGames: false,
            gamesMissing: false,
            peopleYouMayKnow: false,
            underratedGames: false,
            homeLayout: ['friends', 'pinnedGames', 'continuePlaying', 'recommendedGames', 'favoriteGames', 'todaysGamePicks', 'standoutGames', 'gamesMissing', 'peopleYouMayKnow', 'underratedGames'],
            homePageButton: false
        };
    }

    function onHomePage() {
        const path = location.pathname.toLowerCase();
        const isHomePath = path === '/' || path === '/home' || path.startsWith('/home/') || /\/[a-z]{2}(?:-[a-z]{2})?\/home(?:\/|$)/i.test(path);
        if (isHomePath) return true;
        try {
            const homeLink = document.querySelector('a[href*="/home"],a[data-testid="nav-home"]');
            if (homeLink && (homeLink.classList.contains('active') || (homeLink.parentElement && homeLink.parentElement.classList.contains('active')))) return true;
        } catch (e) {}
        return false;
    }

    function getHomeRoot() {
        return document.querySelector('#HomeContainer') || document.querySelector('main.container-main') || document.querySelector('.container-main');
    }

    function isHomeContentNode(node, homeRoot) {
        if (!node || !homeRoot || !homeRoot.contains(node)) return false;
        return !(node.closest && node.closest(SIDEBAR_SELECTOR));
    }

    function findSectionRoot(node, homeRoot) {
        if (!node) return null;
        const root = node.closest(SECTION_WRAPPER_SELECTOR);
        if (root) return isHomeContentNode(root, homeRoot) ? root : null;
        let current = node.parentElement;
        let depth = 0;
        while (current && current !== document.body && depth < 8) {
            if (current.classList.contains('home-sort-header-container') || current.classList.contains('css-ibw9t7-sectionHeader') || current.hasAttribute('data-testid') && current.getAttribute('data-testid').includes('header')) {
                const candidate = current.parentElement;
                return isHomeContentNode(candidate, homeRoot) ? candidate : null;
            }
            current = current.parentElement;
            depth++;
        }
        return isHomeContentNode(node.parentElement, homeRoot) ? node.parentElement : null;
    }

    function getTypeFromLabel(label) {
        if (!label) return 'unknown';
        label = label.toLowerCase();
        if (label.includes('continue playing') || label === 'continue') return 'continuePlaying';
        if (label.includes('friend')) return 'friends';
        if (label.includes('favorite') || label.includes('favourite')) return 'favoriteGames';
        if (label.includes('standout')) return 'standoutGames';
        if (label.includes('recommended') || label.includes('for you')) return 'recommendedGames';
        if (label.includes('picks') || label.includes('today') || label.includes('choice') || label.includes('featured')) return 'todaysGamePicks';
        if (label.includes('pinned') || label.includes('pin ')) return 'pinnedGames';
        if (label.includes('missing')) return 'gamesMissing';
        if (label.includes('people you may know')) return 'peopleYouMayKnow';
        if (label.includes('underrated')) return 'underratedGames';
        return 'unknown';
    }

    function buildCssRules() {
        const rules = [];
        const types = ['friends', 'continuePlaying', 'todaysGamePicks', 'recommendedGames', 'favoriteGames', 'standoutGames', 'pinnedGames', 'gamesMissing', 'peopleYouMayKnow', 'underratedGames'];
        types.forEach(type => {
            if (config[type]) {
                rules.push(`[${TYPE_ATTR}="${type}"]{display:none!important;}`);
            }
        });
        rules.push('html.light-theme .info-label,html[data-theme="light"] .info-label,body.light-theme .info-label,body[data-theme="light"] .info-label,body.theme-light .info-label{color:#393939!important;}');
        return rules.join('\n');
    }

    function updateStyleElement() {
        let style = document.getElementById(STYLE_ID);
        const css = config.enabled && onHomePage() ? buildCssRules() : '';
        if (!css) {
            if (style) style.remove();
            return;
        }
        const target = document.head || document.documentElement;
        if (!style) {
            style = document.createElement('style');
            style.id = STYLE_ID;
            target.appendChild(style);
        }
        if (style.textContent !== css) style.textContent = css;
    }

    function debounceApply() {
        if (applyTimer) clearTimeout(applyTimer);
        applyTimer = setTimeout(applyTweaks, 250);
    }

    function initializeHomePageTweaks() {
        config = defaultConfig();
        setupNavigationListener();
        setupVisibilityListener();
        setupHomeThemeObserver();
        if (config.enabled && onHomePage()) {
            setupObserver();
            applyTweaksWithRetry();
        }
        window.__PurpuraSettings.ready.then(function() {
            const localResult = { hpt: window.__PurpuraSettings.get('hpt') };
            config = Object.assign(defaultConfig(), localResult.hpt || {});
            if (typeof config.homeLayout === 'string') {
                try { config.homeLayout = JSON.parse(config.homeLayout); } catch (e) { config.homeLayout = defaultConfig().homeLayout; }
            }
            if (!Array.isArray(config.homeLayout)) config.homeLayout = defaultConfig().homeLayout;
            if (config.pinnedGames === undefined) config.pinnedGames = false;
            if (!config.homeLayout.includes('pinnedGames')) { config.homeLayout.push('pinnedGames'); saveConfig(); }
            if (!config.homeLayout.includes('favoriteGames')) {
                const ri = config.homeLayout.indexOf('recommendedGames');
                if (ri >= 0) { config.homeLayout.splice(ri + 1, 0, 'favoriteGames'); }
                else { config.homeLayout.push('favoriteGames'); }
                saveConfig();
            }
            if (!config.homeLayout.includes('gamesMissing')) { config.homeLayout.push('gamesMissing'); saveConfig(); }
            if (!config.homeLayout.includes('peopleYouMayKnow')) { config.homeLayout.push('peopleYouMayKnow'); saveConfig(); }
            if (!config.homeLayout.includes('underratedGames')) { config.homeLayout.push('underratedGames'); saveConfig(); }
            publishHomeLayoutConfig();
            if (config.enabled && onHomePage()) {
                setupObserver();
                applyTweaksWithRetry();
            } else if (!config.enabled) {
                cleanup();
            }
        });
    }

    function fixGameCardTextColors() {
        if (homeTheme !== 'light' || !config.enabled || !onHomePage()) return;
        const infoLabels = document.querySelectorAll('.info-label');
        infoLabels.forEach(el => {
            el.style.setProperty('color', '#393939', 'important');
        });
    }

    function cleanup() {
        clearRetryTimers();
        removeObserver();
        removeLayoutButton();
        hideLayoutModal();
        updateStyleElement();
        if (document.body) document.body.removeAttribute('data-purpura-home');
    }

    function clearRetryTimers() {
        retryTimers.forEach(timer => clearTimeout(timer));
        retryTimers = [];
    }

    function applyTweaksWithRetry() {
        clearRetryTimers();
        applyTweaks();
        [500, 1000, 1500, 2500, 3500, 5000, 8000].forEach(delay => {
            retryTimers.push(setTimeout(applyTweaks, delay));
        });
    }

    chrome.storage.onChanged.addListener(changes => {
        if (changes.hpt) {
            config = Object.assign(defaultConfig(), window.__PurpuraSettings.get('hpt') || {});
            if (typeof config.homeLayout === 'string') {
                try { config.homeLayout = JSON.parse(config.homeLayout); } catch (e) { config.homeLayout = defaultConfig().homeLayout; }
            }
            if (!Array.isArray(config.homeLayout)) config.homeLayout = defaultConfig().homeLayout;
            if (config.pinnedGames === undefined) config.pinnedGames = false;
            if (!config.homeLayout.includes('pinnedGames')) { config.homeLayout.push('pinnedGames'); saveConfig(); }
            if (!config.homeLayout.includes('favoriteGames')) {
                const ri = config.homeLayout.indexOf('recommendedGames');
                if (ri >= 0) { config.homeLayout.splice(ri + 1, 0, 'favoriteGames'); }
                else { config.homeLayout.push('favoriteGames'); }
                saveConfig();
            }
            if (!config.homeLayout.includes('gamesMissing')) { config.homeLayout.push('gamesMissing'); saveConfig(); }
            if (!config.homeLayout.includes('peopleYouMayKnow')) { config.homeLayout.push('peopleYouMayKnow'); saveConfig(); }
            if (!config.homeLayout.includes('underratedGames')) { config.homeLayout.push('underratedGames'); saveConfig(); }
            publishHomeLayoutConfig();
            if (config.enabled && onHomePage()) {
                setupObserver();
                applyTweaksWithRetry();
            } else {
                cleanup();
            }
        }
    });

    function checkUrlChange() {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            if (onHomePage() && config.enabled) {
                setupObserver();
                applyTweaksWithRetry();
            } else {
                cleanup();
            }
        }
    }

    function setupNavigationListener() {
        if (navigationListenerSetup) return;
        navigationListenerSetup = true;
        const pushState = history.pushState;
        const replaceState = history.replaceState;
        history.pushState = function() {
            pushState.apply(history, arguments);
            setTimeout(checkUrlChange, 0);
        };
        history.replaceState = function() {
            replaceState.apply(history, arguments);
            setTimeout(checkUrlChange, 0);
        };
        window.addEventListener('popstate', checkUrlChange);
        window.addEventListener('hashchange', checkUrlChange);
        window.addEventListener('pageshow', checkUrlChange);
        setInterval(checkUrlChange, 2000);
    }

    function setupVisibilityListener() {
        if (visibilityListenerSetup) return;
        visibilityListenerSetup = true;
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && config.enabled && onHomePage()) {
                setupObserver();
                debounceApply();
            }
        });
    }

    function setupObserver() {
        if (observer) return;
        observer = new MutationObserver((mutations) => {
            if (!config.enabled || !onHomePage()) return;
            let significantChange = false;
            let pinnedCarouselAdded = false;
            for (const m of mutations) {
                if (m.addedNodes.length > 0) {
                    significantChange = true;
                    for (const node of m.addedNodes) {
                        if (node.nodeType === 1 && (node.classList.contains('pinned-games-carousel') || node.querySelector('.pinned-games-carousel'))) {
                            pinnedCarouselAdded = true;
                            break;
                        }
                    }
                    if (pinnedCarouselAdded) break;
                }
            }
            if (pinnedCarouselAdded) {
                applyTweaks();
                return;
            }
            if (significantChange) {
                debounceApply();
            }
        });
        const target = document.documentElement;
        if (target) {
            observer.observe(target, { childList: true, subtree: true });
        }
    }

    function removeObserver() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    }

    const REACT_FRIEND_SORT_TOPIC_ID = 600000000;
    const REACT_CONTINUE_SORT_TOPIC_ID = 100000003;

    function getHomeSortType(sort) {
        if (!sort || typeof sort !== 'object') return 'unknown';
        if (sort.topicId === REACT_FRIEND_SORT_TOPIC_ID && sort.treatmentType === 'FriendCarousel') return 'friends';
        if (sort.topicId === REACT_CONTINUE_SORT_TOPIC_ID) return 'continuePlaying';
        return getTypeFromLabel((sort.topic || '').toLowerCase());
    }

    function orderHomeSorts(sorts) {
        const orderTypes = Array.isArray(config.homeLayout) ? config.homeLayout : [];
        const orderMap = new Map();
        orderTypes.forEach((type, index) => { if (!orderMap.has(type)) orderMap.set(type, index); });
        const originalIndex = new Map(sorts.map((sort, index) => [sort, index]));
        return sorts.slice().sort((a, b) => {
            const aIndex = orderMap.get(getHomeSortType(a));
            const bIndex = orderMap.get(getHomeSortType(b));
            const aOrdered = aIndex !== undefined;
            const bOrdered = bIndex !== undefined;
            if (aOrdered && bOrdered) return aIndex - bIndex;
            if (aOrdered) return -1;
            if (bOrdered) return 1;
            return originalIndex.get(a) - originalIndex.get(b);
        });
    }

    function sortTypeSequence(sorts) {
        return sorts.map(getHomeSortType).join('|');
    }

    function applyReactHomeSortOrder() {
        const card = document.querySelector('#HomeContainer a.game-card-link');
        if (!card) return false;
        const fiberKey = Object.keys(card).find(key => key.startsWith('__reactFiber$'));
        if (!fiberKey) return false;
        for (let fiber = card[fiberKey]; fiber; fiber = fiber.return) {
            for (let hook = fiber.memoizedState; hook; hook = hook.next) {
                const state = hook.memoizedState;
                if (!state || state.pageType !== 'Home' || !Array.isArray(state.sorts) || typeof hook.queue?.dispatch !== 'function') continue;
                const desired = orderHomeSorts(state.sorts);
                if (sortTypeSequence(desired) !== sortTypeSequence(state.sorts)) {
                    hook.queue.dispatch(current => {
                        if (!current || current.pageType !== 'Home' || !Array.isArray(current.sorts)) return current;
                        const nextSorts = orderHomeSorts(current.sorts);
                        if (sortTypeSequence(nextSorts) === sortTypeSequence(current.sorts)) return current;
                        return Object.assign({}, current, { sorts: nextSorts });
                    });
                }
                return true;
            }
        }
        return false;
    }

    function positionPinnedCarousel(homeRoot) {
        const pinned = homeRoot.querySelector('[' + TYPE_ATTR + '="pinnedGames"]');
        if (!pinned || !pinned.parentElement) return;
        const order = Array.isArray(config.homeLayout) ? config.homeLayout : [];
        const pinnedIndex = order.indexOf('pinnedGames');
        if (pinnedIndex === -1) return;
        const parent = pinned.parentElement;
        let anchor = null;
        for (let i = pinnedIndex + 1; i < order.length; i++) {
            const el = homeRoot.querySelector('[' + TYPE_ATTR + '="' + order[i] + '"]');
            if (el && el !== pinned && el.parentElement === parent) { anchor = el; break; }
        }
        if (anchor) {
            if (pinned.nextElementSibling !== anchor) {
                try { parent.insertBefore(pinned, anchor); } catch (e) {}
            }
            return;
        }
        let last = null;
        for (let i = pinnedIndex - 1; i >= 0; i--) {
            const el = homeRoot.querySelector('[' + TYPE_ATTR + '="' + order[i] + '"]');
            if (el && el !== pinned && el.parentElement === parent) { last = el; break; }
        }
        if (last && last.nextSibling && last.nextElementSibling !== pinned) {
            try { parent.insertBefore(pinned, last.nextSibling); } catch (e) {}
        }
    }

    function applyLayoutOrder(homeRoot, allowNativeMoves) {
        if (!homeRoot) homeRoot = getHomeRoot();
        if (!homeRoot) return false;
        if (!config.homeLayout || !Array.isArray(config.homeLayout) || config.homeLayout.length === 0) return false;

        const byType = {};
        config.homeLayout.forEach(type => {
            const elements = homeRoot.querySelectorAll(`[${TYPE_ATTR}="${type}"]`);
            if (elements.length > 0) byType[type] = Array.from(elements);
        });

        const ordered = [];
        const seen = new Set();
        config.homeLayout.forEach(type => {
            (byType[type] || []).forEach(el => {
                if (!seen.has(el)) { ordered.push(el); seen.add(el); }
            });
        });

        if (ordered.length === 0) return false;

        ordered.forEach(el => {
            const type = el.getAttribute(TYPE_ATTR);
            el.style.removeProperty('order');
            if (config[type]) {
                el.style.setProperty('display', 'none', 'important');
            } else {
                if (el.style.display === 'none') el.style.removeProperty('display');
            }
        });

        if (ordered.length < 2) return true;

        if (allowNativeMoves === false) return true;

        const groups = new Map();
        ordered.forEach(el => {
            const parent = el.parentElement;
            if (!parent || !homeRoot.contains(parent)) return;
            if (!groups.has(parent)) groups.set(parent, []);
            groups.get(parent).push(el);
        });

        groups.forEach(list => {
            for (let i = 1; i < list.length; i++) {
                const prev = list[i - 1];
                const curr = list[i];
                if (curr.previousElementSibling !== prev) {
                    try {
                        prev.insertAdjacentElement('afterend', curr);
                    } catch (e) {}
                }
            }
        });

        return true;
    }

    function applyTweaks() {
        updateStyleElement();
        fixGameCardTextColors();
        if (!config.enabled || !onHomePage()) return;
        if (!document.body) return;
        document.body.setAttribute('data-purpura-home', 'true');

        const homeRoot = getHomeRoot();
        if (!homeRoot) {
            injectLayoutButton();
            return false;
        }

        let reactApplied = document.documentElement.hasAttribute('data-purpura-home-sorts');
        if (!reactApplied) reactApplied = applyReactHomeSortOrder();
        
        var labels = homeRoot.querySelectorAll(LABEL_SELECTOR);
        for (var li = 0; li < labels.length; li++) {
            var node = labels[li];
            if (node.closest && node.closest('button, [role="button"]')) continue;
            var text = (node.textContent || node.getAttribute('aria-label') || '').toLowerCase();
            var type = getTypeFromLabel(text);
            if (type !== 'unknown') {
                var root = findSectionRoot(node, homeRoot);
                if (root && !root.hasAttribute(TYPE_ATTR)) {
                    root.setAttribute(TYPE_ATTR, type);
                }
            }
        }

        const pinnedCarousel = homeRoot.querySelector('.pinned-games-carousel:not([' + TYPE_ATTR + '])');
        if (pinnedCarousel) {
            pinnedCarousel.setAttribute(TYPE_ATTR, 'pinnedGames');
        }

        var fallbackTypes = ['gamesMissing', 'peopleYouMayKnow', 'underratedGames'];
        for (var fi = 0; fi < fallbackTypes.length; fi++) {
            var fbType = fallbackTypes[fi];
            if (homeRoot.querySelectorAll('[' + TYPE_ATTR + '="' + fbType + '"]').length === 0) {
                var h2s = homeRoot.querySelectorAll('h2');
                for (var hi = 0; hi < h2s.length; hi++) {
                    var h2 = h2s[hi];
                    if (h2.closest && h2.closest('.game-card, [data-testid*="game-tile" i]')) continue;
                    if (getTypeFromLabel(h2.textContent || '') === fbType) {
                        var root = findSectionRoot(h2, homeRoot);
                        if (root && root.getAttribute(TYPE_ATTR) !== fbType) {
                            root.setAttribute(TYPE_ATTR, fbType);
                            break;
                        }
                    }
                }
            }
        }

        const didLayout = applyLayoutOrder(homeRoot, !reactApplied);
        if (reactApplied) positionPinnedCarousel(homeRoot);
        injectLayoutButton();
                return didLayout;
    }

    function getLayoutButtonColors() {
        const isLight = homeTheme === 'light';
        return {
            bg: isLight ? '#2563eb' : '#8b5cf6',
            shadow: isLight ? 'rgba(37,99,235,0.3)' : 'rgba(139,92,246,0.4)',
            hoverShadow: isLight ? 'rgba(37,99,235,0.45)' : 'rgba(139,92,246,0.55)'
        };
    }

    function updateLayoutButtonTheme() {
        if (!layoutButtonEl || !layoutButtonEl.isConnected) return;
        const c = getLayoutButtonColors();
        layoutButtonEl.style.background = c.bg;
        layoutButtonEl.style.boxShadow = '0 4px 16px ' + c.shadow;
    }

    function injectLayoutButton() {
        if (!config.homePageButton || !onHomePage()) {
            removeLayoutButton();
            return;
        }
        if (!document.body) return;
        if (layoutButtonEl && layoutButtonEl.isConnected) {
            updateLayoutButtonTheme();
            return;
        }
        if (layoutButtonEl) layoutButtonEl = null;

        const c = getLayoutButtonColors();

        layoutButtonEl = document.createElement('button');
        layoutButtonEl.id = 'purpura-home-layout-btn';
        layoutButtonEl.textContent = '\u2630 Layout';
        layoutButtonEl.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;padding:10px 18px;background:' + c.bg + ';color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 4px 16px ' + c.shadow + ';font-family:-apple-system,BlinkMacSystemFont,sans-serif;transition:transform 0.15s,box-shadow 0.15s,background 0.25s;';
        layoutButtonEl.addEventListener('mouseenter', () => { layoutButtonEl.style.transform = 'translateY(-2px)'; layoutButtonEl.style.boxShadow = '0 6px 20px ' + getLayoutButtonColors().hoverShadow; });
        layoutButtonEl.addEventListener('mouseleave', () => { layoutButtonEl.style.transform = ''; layoutButtonEl.style.boxShadow = '0 4px 16px ' + getLayoutButtonColors().shadow; });
        layoutButtonEl.addEventListener('click', showLayoutModal);
        document.body.appendChild(layoutButtonEl);
    }

    function removeLayoutButton() {
        if (layoutButtonEl) {
            layoutButtonEl.remove();
            layoutButtonEl = null;
        }
    }

    function onLayoutModalKeydown(e) {
        if (e.key === 'Escape') hideLayoutModal();
    }

    function showLayoutModal() {
        if (!document.body) return;
        hideLayoutModal();
        document.addEventListener('keydown', onLayoutModalKeydown);

        layoutModalEl = document.createElement('div');
        layoutModalEl.id = 'purpura-home-layout-modal';
        const isLight = homeTheme === 'light';
        layoutModalEl.style.cssText = 'position:fixed;inset:0;z-index:100000;background:' + (isLight ? 'rgba(17,17,19,0.40)' : 'rgba(0,0,0,0.6)') + ';display:flex;align-items:center;justify-content:center;';

        const dialog = document.createElement('div');
        dialog.style.cssText = 'background:' + (isLight ? '#ffffff' : '#1a1b26') + ';border:1px solid ' + (isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)') + ';border-radius:18px;padding:24px;width:420px;max-width:92vw;max-height:80vh;overflow-y:auto;color:' + (isLight ? '#111113' : '#f0eeff') + ';font-family:-apple-system,BlinkMacSystemFont,sans-serif;box-shadow:' + (isLight ? '0 24px 64px rgba(0,0,0,0.15)' : '0 24px 64px rgba(0,0,0,0.6)') + ';';

        const header = document.createElement('div');
        header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;';
        const title = document.createElement('h3');
        title.textContent = 'Home Layout';
        title.style.cssText = 'margin:0;font-size:18px;font-weight:700;color:' + (isLight ? '#111113' : '#f0eeff') + ';';
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '\u00d7';
        closeBtn.style.cssText = 'background:' + (isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.08)') + ';border:1px solid ' + (isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)') + ';color:' + (isLight ? '#4b4b55' : '#a89ec4') + ';width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;';
        closeBtn.addEventListener('click', hideLayoutModal);
        header.appendChild(title);
        header.appendChild(closeBtn);

        const hint = document.createElement('p');
        hint.textContent = 'Drag sections to reorder. Toggle to show or hide.';
        hint.style.cssText = 'font-size:12px;color:' + (isLight ? '#8a8a95' : '#6d6487') + ';margin:0 0 12px 0;';

        const list = document.createElement('ul');
        list.style.cssText = 'list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px;';

        const currentOrder = [...(config.homeLayout && Array.isArray(config.homeLayout) ? config.homeLayout : defaultConfig().homeLayout)];

        if (!currentOrder.includes('pinnedGames')) {
            const fi = currentOrder.indexOf('friends');
            if (fi >= 0) { currentOrder.splice(fi + 1, 0, 'pinnedGames'); }
            else { currentOrder.push('pinnedGames'); }
            config.homeLayout = currentOrder;
            saveConfig();
        }
        if (!currentOrder.includes('favoriteGames')) {
            const ri = currentOrder.indexOf('recommendedGames');
            if (ri >= 0) { currentOrder.splice(ri + 1, 0, 'favoriteGames'); }
            else { currentOrder.push('favoriteGames'); }
            config.homeLayout = currentOrder;
            saveConfig();
        }

        dialog.appendChild(header);
        dialog.appendChild(hint);
        dialog.appendChild(list);
        layoutModalEl.appendChild(dialog);
        layoutModalEl.addEventListener('click', function(e) {
            if (e.target === layoutModalEl) hideLayoutModal();
        });
        document.body.appendChild(layoutModalEl);

            const pgEnabled = window.__PurpuraSettings.get('pg') === true;

            currentOrder.forEach(type => {
                if (type === 'pinnedGames' && !pgEnabled) return;

            const label = SECTION_LABELS[type] || type;
            const isHidden = config[type] === true;

            const item = document.createElement('li');
            item.draggable = true;
            item.dataset.type = type;
            item.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 12px;background:' + (isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)') + ';border:1px solid ' + (isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)') + ';border-radius:10px;cursor:grab;transition:border-color 0.15s,background 0.15s;';
            if (isHidden) item.style.opacity = '0.45';

            const handle = document.createElement('span');
            handle.textContent = '\u2261';
            handle.style.cssText = 'color:' + (isLight ? '#8a8a95' : '#6d6487') + ';font-size:18px;cursor:grab;user-select:none;flex-shrink:0;';

            const name = document.createElement('span');
            name.textContent = label;
            name.style.cssText = 'flex:1;font-size:14px;font-weight:500;color:' + (isLight ? '#111113' : '#f0eeff') + ';';

            const toggle = document.createElement('label');
            toggle.style.cssText = 'position:relative;display:inline-block;width:36px;height:20px;flex-shrink:0;cursor:pointer;';
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = !isHidden;
            input.style.cssText = 'opacity:0;width:0;height:0;';
            const slider = document.createElement('span');
            slider.style.cssText = 'position:absolute;inset:0;background:' + (input.checked ? (isLight ? '#7c3aed' : '#9b6dff') : (isLight ? '#c8c8d0' : '#2a2b36')) + ';border-radius:99px;transition:background 0.25s;';
            const knob = document.createElement('span');
            knob.style.cssText = 'position:absolute;height:14px;width:14px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:transform 0.3s;';
            if (input.checked) knob.style.transform = 'translateX(16px)';
            input.addEventListener('change', function() {
                config[type] = !this.checked;
                item.style.opacity = this.checked ? '1' : '0.45';
                slider.style.background = this.checked ? (homeTheme === 'light' ? '#7c3aed' : '#9b6dff') : (homeTheme === 'light' ? '#c8c8d0' : '#2a2b36');
                knob.style.transform = this.checked ? 'translateX(16px)' : '';
                saveConfig();
            });
            toggle.appendChild(input);
            toggle.appendChild(slider);
            slider.appendChild(knob);

            item.appendChild(handle);
            item.appendChild(name);
            item.appendChild(toggle);

            item.addEventListener('dragstart', function(e) {
                dragSrcEl = this;
                this.style.opacity = '0.5';
                e.dataTransfer.effectAllowed = 'move';
            });
            item.addEventListener('dragend', function() {
                const hidden = config[type] === true;
                this.style.opacity = hidden ? '0.45' : '1';
                dragSrcEl = null;
                const items = Array.from(list.querySelectorAll('li'));
                items.forEach(li => li.style.borderTop = '');
            });
            item.addEventListener('dragover', function(e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });
            item.addEventListener('dragenter', function(e) {
                e.preventDefault();
                if (this !== dragSrcEl) {
                    this.style.borderTop = '2px solid ' + (homeTheme === 'light' ? '#7c3aed' : '#9b6dff');
                }
            });
            item.addEventListener('dragleave', function() {
                this.style.borderTop = '';
            });
            item.addEventListener('drop', function(e) {
                e.stopPropagation();
                this.style.borderTop = '';
                if (dragSrcEl && dragSrcEl !== this) {
                    const items = Array.from(list.querySelectorAll('li'));
                    const fromIndex = items.indexOf(dragSrcEl);
                    const toIndex = items.indexOf(this);
                    try {
                        if (fromIndex < toIndex) {
                            this.parentNode.insertBefore(dragSrcEl, this.nextSibling);
                        } else {
                            this.parentNode.insertBefore(dragSrcEl, this);
                        }
                    } catch (e) {}
                    const newOrder = Array.from(list.querySelectorAll('li')).map(li => li.dataset.type);
                    config.homeLayout = newOrder;
                    saveConfig();
                }
            });

            list.appendChild(item);

        });
    }

    function hideLayoutModal() {
        document.removeEventListener('keydown', onLayoutModalKeydown);
        if (layoutModalEl) {
            layoutModalEl.remove();
            layoutModalEl = null;
        }
    }

    function publishHomeLayoutConfig() {
        const order = Array.isArray(config.homeLayout) ? config.homeLayout : [];
        const hidden = Object.keys(SECTION_LABELS).filter(type => config[type] === true);
        const payload = { enabled: config.enabled !== false, order, hidden };
        try { sessionStorage.setItem('purpuraHomeLayout', JSON.stringify(payload)); } catch (e) {}
        try { document.dispatchEvent(new CustomEvent('purpura-home-layout', { detail: payload })); } catch (e) {}
    }

    function saveConfig() {
        window.__PurpuraSettings.set('hpt', config);
    }

    initializeHomePageTweaks();
}
