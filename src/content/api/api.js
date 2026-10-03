/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
    const isTopWindow = () => {
        try {
            return window.top === window;
        } catch (e) {
            return false;
        }
    };

    if (!isTopWindow()) return;
    if (window.purpuraRothemerApiInitialized) return;
    window.purpuraRothemerApiInitialized = true;

    let pageType = 'unknown';
    let rothemerActive = false;

    let idObserver = null;
    let idPassTimeoutA = null;
    let idPassTimeoutB = null;
    let elementCounters = new Map();

    let dropdownObserver = null;
    let dropdownCheckTimeout = null;

    let logoutObserver = null;
    let routeWatcherInitialized = false;

    const detectPageType = () => {
        const path = window.location.pathname.toLowerCase();
        const hostname = window.location.hostname;

        if (path === '/' || path === '/home') return 'home';
        if (path.includes('/games/') && path.includes('/')) return 'game-details';
        if (path.includes('/discover')) return 'discover';
        if (path.includes('/games')) return 'games';
        if (path.includes('/catalog')) return 'catalog';
        if (path.includes('/avatar')) return 'avatar';
        if (path.includes('/inventory')) return 'inventory';
        if (path.includes('/users/') && path.includes('/profile')) return 'profile';
        if (path.includes('/users/')) return 'user-profile';
        if (path.includes('/groups/')) return 'group';
        if (path.includes('/my/messages')) return 'messages';
        if (path.includes('/my/account')) return 'account-settings';
        if (path.includes('/transactions')) return 'transactions';
        if (path.includes('/robux')) return 'robux';
        if (path.includes('/premium')) return 'premium';
        if (path.includes('/upgrades/')) return 'upgrades';
        if (path.includes('/feeds')) return 'feeds';
        if (path.includes('/develop')) return 'develop';
        if (path.includes('/create')) return 'create';
        if (path.includes('/library')) return 'library';
        if (path.includes('/search/')) return 'search';
        if (path.includes('/friend')) return 'friends';
        if (hostname.includes('create.roblox.com')) return 'creator-dashboard';
        if (hostname.includes('devforum.roblox.com')) return 'devforum';
        if (hostname.includes('talent.roblox.com')) return 'talent-hub';

        return 'unknown';
    };

    const isGameDetailsPage = () => window.location.pathname.toLowerCase().includes('/games/');
    const isAccountSettingsPage = () => window.location.pathname.toLowerCase().includes('/my/account');

    const updateBodyPageTags = () => {
        if (!document.body) return;
        pageType = detectPageType();
        document.body.setAttribute('data-purpura-page', pageType);
        document.body.setAttribute('data-purpura-page-id', `purpura-page-${pageType}`);
    };

    const generateElementId = (element) => {
        if (!element || element.nodeType !== 1) return;
        if (element.hasAttribute('data-purpura-id')) return;
        if (element === document.body || element === document.documentElement) return;
        if (element.closest && element.closest('#purpura-aeditor-host')) return;

        const idParts = [`purpura-${pageType}`];
        idParts.push(element.tagName.toLowerCase());

        if (element.className && typeof element.className === 'string') {
            const classes = element.className.split(' ').filter(c => c.trim());
            if (classes.length > 0) {
                const meaningfulClass = classes[0].replace(/[^a-z0-9-_]/gi, '-').substring(0, 30);
                if (meaningfulClass) idParts.push(meaningfulClass);
            }
        }

        const role = element.getAttribute('role');
        const ariaLabel = element.getAttribute('aria-label');
        if (role) {
            idParts.push(role);
        } else if (ariaLabel) {
            const labelSlug = ariaLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 20);
            if (labelSlug) idParts.push(labelSlug);
        }

        if (element.matches('a[href]')) {
            const href = element.getAttribute('href');
            if (href && href.startsWith('/')) {
                const pathPart = href.split('/')[1] || 'link';
                idParts.push(pathPart.replace(/[^a-z0-9-_]/gi, '-').substring(0, 15));
            }
        }

        if (element.matches('button')) {
            const btnText = element.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 20);
            if (btnText) idParts.push(btnText);
        }

        if (element.matches('input')) {
            const inputType = element.getAttribute('type') || 'text';
            const inputName = element.getAttribute('name');
            idParts.push(inputType);
            if (inputName) idParts.push(inputName.replace(/[^a-z0-9-_]/gi, '-').substring(0, 15));
        }

        if (element.matches('img')) {
            const alt = element.getAttribute('alt');
            if (alt) {
                const altSlug = alt.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 20);
                if (altSlug) idParts.push(altSlug);
            }
        }

        const baseId = idParts.join('-').replace(/--+/g, '-').replace(/^-|-$/g, '');
        const counter = elementCounters.get(baseId) || 0;
        elementCounters.set(baseId, counter + 1);

        element.setAttribute('data-purpura-id', counter === 0 ? baseId : `${baseId}-${counter}`);
    };

    const processExistingElements = () => {
        if (!document.body) return;
        const allElements = document.querySelectorAll('*:not([data-purpura-id])');
        allElements.forEach(element => {
            try {
                generateElementId(element);
            } catch (e) {
            }
        });
    };

    const processNodeTree = (node) => {
        if (!node || node.nodeType !== 1) return;
        try {
            generateElementId(node);
            const children = node.querySelectorAll('*:not([data-purpura-id])');
            children.forEach(child => {
                try {
                    generateElementId(child);
                } catch (e) {
                }
            });
        } catch (e) {
        }
    };

    const stopIdTagging = () => {
        if (idObserver) {
            idObserver.disconnect();
            idObserver = null;
        }
        if (idPassTimeoutA) {
            clearTimeout(idPassTimeoutA);
            idPassTimeoutA = null;
        }
        if (idPassTimeoutB) {
            clearTimeout(idPassTimeoutB);
            idPassTimeoutB = null;
        }
    };

    const startIdTagging = () => {
        if (!document.body || idObserver) return;
        elementCounters = new Map();
        processExistingElements();

        idObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    processNodeTree(node);
                });
            });
        });

        idObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        if (idPassTimeoutA) clearTimeout(idPassTimeoutA);
        if (idPassTimeoutB) clearTimeout(idPassTimeoutB);

        idPassTimeoutA = setTimeout(processExistingElements, 1500);
        idPassTimeoutB = setTimeout(processExistingElements, 3500);
    };

    const processDropdownMenu = (dropdown) => {
        if (!dropdown || dropdown.nodeType !== 1) return false;

        const dropdownMenu = dropdown.matches('.dropdown-menu')
            ? dropdown
            : dropdown.querySelector('.dropdown-menu');

        if (!dropdownMenu) return false;
        if (dropdownMenu.hasAttribute('data-purpura-processed-psdrop')) return false;

        const configureLink = dropdownMenu.querySelector('.rbx-private-server-configure, a[href*="private-server/configure"]');
        if (!configureLink) return false;

        dropdownMenu.setAttribute('aria-label', 'purpuraPrivServerdropdown');
        dropdownMenu.classList.add('private-server-configure-menu');
        dropdownMenu.setAttribute('data-purpura-processed-psdrop', 'true');
        return true;
    };

    const checkExistingDropdowns = () => {
        const gameInstanceDropdown = document.getElementById('game-instance-dropdown-menu');
        if (gameInstanceDropdown) processDropdownMenu(gameInstanceDropdown);

        const selectors = ['.popover-content', '.dropdown-menu', '[role="menu"]'];
        selectors.forEach((selector) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element) => {
                if (!element.closest('[data-purpura-processed-psdrop]')) {
                    processDropdownMenu(element);
                }
            });
        });
    };

    const stopDropdownWatcher = () => {
        if (dropdownObserver) {
            dropdownObserver.disconnect();
            dropdownObserver = null;
        }
        if (dropdownCheckTimeout) {
            clearTimeout(dropdownCheckTimeout);
            dropdownCheckTimeout = null;
        }
    };

    const startDropdownWatcher = () => {
        if (!document.body || dropdownObserver || !isGameDetailsPage()) return;

        checkExistingDropdowns();

        dropdownObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType !== 1) return;
                    if (node.matches('.dropdown-menu, .popover-content')) {
                        processDropdownMenu(node);
                    } else {
                        const dropdowns = node.querySelectorAll('.dropdown-menu:not([data-purpura-processed-psdrop]), .popover-content:not([data-purpura-processed-psdrop])');
                        dropdowns.forEach(processDropdownMenu);
                    }
                });
            });
        });

        dropdownObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        if (dropdownCheckTimeout) clearTimeout(dropdownCheckTimeout);
        dropdownCheckTimeout = setTimeout(checkExistingDropdowns, 800);
    };

    const tagLogoutButton = () => {
        const buttons = document.querySelectorAll('button.acct-settings-btn');
        buttons.forEach((btn) => {
            if (btn.textContent.trim() === 'Log Out of All Other Sessions' && !btn.id) {
                btn.id = 'purpura-logout-sessions-btn';
            }
        });
    };

    const stopLogoutWatcher = () => {
        if (logoutObserver) {
            logoutObserver.disconnect();
            logoutObserver = null;
        }
    };

    const startLogoutWatcher = () => {
        if (!document.body || logoutObserver || !isAccountSettingsPage()) return;
        tagLogoutButton();
        logoutObserver = new MutationObserver(tagLogoutButton);
        logoutObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    };

    const refreshRouteFeatures = () => {
        updateBodyPageTags();

        if (rothemerActive) {
            startIdTagging();
        } else {
            stopIdTagging();
        }

        if (isGameDetailsPage()) {
            startDropdownWatcher();
        } else {
            stopDropdownWatcher();
        }

        if (isAccountSettingsPage()) {
            startLogoutWatcher();
        } else {
            stopLogoutWatcher();
        }
    };

    const setupRouteWatcher = () => {
        if (routeWatcherInitialized) return;
        routeWatcherInitialized = true;

        let lastHref = window.location.href;

        const checkRouteChange = () => {
            const currentHref = window.location.href;
            if (currentHref === lastHref) return;
            lastHref = currentHref;
            refreshRouteFeatures();
        };

        const originalPushState = history.pushState.bind(history);
        history.pushState = function(...args) {
            const result = originalPushState(...args);
            setTimeout(checkRouteChange, 0);
            return result;
        };

        const originalReplaceState = history.replaceState.bind(history);
        history.replaceState = function(...args) {
            const result = originalReplaceState(...args);
            setTimeout(checkRouteChange, 0);
            return result;
        };

        window.addEventListener('popstate', () => {
            setTimeout(checkRouteChange, 0);
        });
    };

    const parseRothemerState = (value) => {
        if (typeof value === 'boolean') return value;
        if (value && typeof value === 'object') return value.enabled === true;
        return false;
    };

    const bootstrap = () => {
        updateBodyPageTags();
        setupRouteWatcher();

        window.__PurpuraSettings.ready.then(function() {
            rothemerActive = parseRothemerState(window.__PurpuraSettings.get('rothemerActive'));
            refreshRouteFeatures();
        });

        chrome.storage.onChanged.addListener((changes, areaName) => {
            if (areaName !== 'local') return;
            if (!changes.rothemerActive) return;
            rothemerActive = parseRothemerState(window.__PurpuraSettings.get('rothemerActive'));
            refreshRouteFeatures();
        });

        refreshRouteFeatures();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
    } else {
        bootstrap();
    }
})();