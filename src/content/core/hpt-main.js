/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';

    if (window.__purpuraHomeLayoutBridge) return;
    window.__purpuraHomeLayoutBridge = true;

    const STORAGE_KEY = 'purpuraHomeLayout';
    const OMNI_RECOMMENDATION_API_URL = 'https://apis.roblox.com/discovery-api/omni-recommendation';
    const FRIEND_SORT_TOPIC_ID = 600000000;
    const CONTINUE_SORT_TOPIC_ID = 100000003;
    const FRIEND_SORT_TREATMENT = 'FriendCarousel';
    const HOME_MARKER = 'data-purpura-home-sorts';
    const LAYOUT_WAIT_MS = 700;
    const REFRESH_DEBOUNCE_MS = 150;

    let layoutOrder = [];
    let layoutHidden = [];
    let layoutEnabled = false;
    let layoutReady = false;
    let layoutPromise = null;
    let resolveLayoutReady = null;
    let layoutTimeout = null;
    let removedHiddenSorts = [];
    let refreshTimer = null;
    let observer = null;

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

    function getSortType(sort) {
        if (!sort || typeof sort !== 'object') return 'unknown';
        if (sort.topicId === FRIEND_SORT_TOPIC_ID && sort.treatmentType === FRIEND_SORT_TREATMENT) return 'friends';
        if (sort.topicId === CONTINUE_SORT_TOPIC_ID) return 'continuePlaying';
        return getTypeFromLabel((sort.topic || '').toString().toLowerCase());
    }

    function getSortKey(sort) {
        if (!sort || typeof sort !== 'object') return '';
        if (sort.topicId !== undefined && sort.topicId !== null) return 'topicId:' + sort.topicId;
        if (sort.topic) return 'topic:' + sort.topic;
        return '';
    }

    function sortSequence(sorts) {
        return sorts.map(getSortType).join('|');
    }

    function readStoredLayout() {
        let found = false;
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                layoutEnabled = parsed.enabled === true;
                if (Array.isArray(parsed.order)) { layoutOrder = parsed.order.map(String); found = true; }
                if (Array.isArray(parsed.hidden)) { layoutHidden = parsed.hidden.map(String); found = true; }
            }
        } catch (e) {}
        return found;
    }

    function markLayoutReady() {
        if (resolveLayoutReady) {
            clearTimeout(layoutTimeout);
            resolveLayoutReady();
            resolveLayoutReady = null;
        }
    }

    function waitForLayout() {
        if (layoutReady) return Promise.resolve();
        if (!layoutPromise) {
            layoutPromise = new Promise((resolve) => {
                resolveLayoutReady = resolve;
                layoutTimeout = setTimeout(() => {
                    resolveLayoutReady = null;
                    resolve();
                }, LAYOUT_WAIT_MS);
            });
        }
        return layoutPromise;
    }

    function computeDesiredSorts(currentSorts) {
        if (!layoutEnabled) return currentSorts.slice();

        const hidden = new Set(layoutHidden);
        const full = currentSorts.slice();
        const keys = new Set(full.map(getSortKey));
        removedHiddenSorts.forEach((sort) => {
            const key = getSortKey(sort);
            if (!key || keys.has(key)) return;
            full.push(sort);
            keys.add(key);
        });
        removedHiddenSorts = full.filter((sort) => hidden.has(getSortType(sort)));

        const visible = full.filter((sort) => {
            const type = getSortType(sort);
            return type === 'friends' || !hidden.has(type);
        });

        const orderMap = new Map();
        layoutOrder.forEach((type, index) => { if (!orderMap.has(type)) orderMap.set(type, index); });
        const originalIndex = new Map(visible.map((sort, index) => [sort, index]));

        return visible.slice().sort((a, b) => {
            const aIndex = orderMap.get(getSortType(a));
            const bIndex = orderMap.get(getSortType(b));
            const aOrdered = aIndex !== undefined;
            const bOrdered = bIndex !== undefined;
            if (aOrdered && bOrdered) return aIndex - bIndex;
            if (aOrdered) return -1;
            if (bOrdered) return 1;
            return originalIndex.get(a) - originalIndex.get(b);
        });
    }

    function applyHomeLayoutToData(data) {
        if (!data || data.pageType !== 'Home' || !Array.isArray(data.sorts)) return false;
        const before = sortSequence(data.sorts);
        const desired = computeDesiredSorts(data.sorts);
        if (sortSequence(desired) === before) return false;
        data.sorts = desired;
        return true;
    }

    function isHomePage() {
        const path = location.pathname.toLowerCase();
        return path === '/' || path === '/home' || path.startsWith('/home/') || /\/[a-z]{2}(?:-[a-z]{2})?\/home(?:\/|$)/i.test(path);
    }

    function refreshClientSorts() {
        if (!location || !isHomePage()) return false;
        const card = document.querySelector('#HomeContainer a.game-card-link');
        if (!card) return false;
        const fiberKey = Object.keys(card).find((key) => key.indexOf('__reactFiber$') === 0);
        if (!fiberKey) return false;
        for (let fiber = card[fiberKey]; fiber; fiber = fiber.return) {
            for (let hook = fiber.memoizedState; hook; hook = hook.next) {
                const state = hook.memoizedState;
                if (!state || state.pageType !== 'Home' || !Array.isArray(state.sorts) || typeof hook.queue?.dispatch !== 'function') continue;
                const desired = computeDesiredSorts(state.sorts);
                if (sortSequence(desired) !== sortSequence(state.sorts)) {
                    hook.queue.dispatch((current) => {
                        if (!current || current.pageType !== 'Home' || !Array.isArray(current.sorts)) return current;
                        const nextSorts = computeDesiredSorts(current.sorts);
                        if (sortSequence(nextSorts) === sortSequence(current.sorts)) return current;
                        return Object.assign({}, current, { sorts: nextSorts });
                    });
                }
                document.documentElement.setAttribute(HOME_MARKER, '1');
                return true;
            }
        }
        return false;
    }

    function scheduleRefresh() {
        if (refreshTimer) clearTimeout(refreshTimer);
        refreshTimer = setTimeout(() => {
            refreshTimer = null;
            refreshClientSorts();
        }, REFRESH_DEBOUNCE_MS);
    }

    function startObserver() {
        if (observer) return;
        const root = document.documentElement;
        if (!root) {
            document.addEventListener('readystatechange', function onReady() {
                if (!document.documentElement) return;
                document.removeEventListener('readystatechange', onReady);
                startObserver();
            });
            return;
        }
        observer = new MutationObserver(() => {
            if (!isHomePage()) return;
            scheduleRefresh();
        });
        observer.observe(root, { childList: true, subtree: true });
        scheduleRefresh();
    }

    function getRequestUrl(input) {
        if (typeof input === 'string') return input;
        if (input instanceof Request) return input.url;
        try {
            if (input && typeof input.url === 'string') return input.url;
        } catch (e) {}
        return '';
    }

    function isHomeLayoutRequest(url) {
        return typeof url === 'string' && url.indexOf(OMNI_RECOMMENDATION_API_URL) !== -1;
    }

    document.addEventListener('purpura-home-layout', () => {
        readStoredLayout();
        layoutReady = true;
        markLayoutReady();
        scheduleRefresh();
    });

    layoutReady = readStoredLayout();
    startObserver();

    const originalFetch = window.fetch;
    if (typeof originalFetch === 'function') {
        window.fetch = async function (...args) {
            const response = await originalFetch.apply(this, args);
            if (!isHomeLayoutRequest(getRequestUrl(args[0]))) return response;
            try {
                await waitForLayout();
                const data = await response.clone().json();
                if (applyHomeLayoutToData(data)) {
                    const headers = new Headers(response.headers);
                    headers.delete('content-length');
                    return new Response(JSON.stringify(data), {
                        status: response.status,
                        statusText: response.statusText,
                        headers
                    });
                }
            } catch (e) {}
            scheduleRefresh();
            return response;
        };
    }

    const originalXhrOpen = XMLHttpRequest.prototype.open;
    const originalXhrSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        this._purpuraHomeLayoutUrl = typeof url === 'string' ? url : '';
        return originalXhrOpen.apply(this, [method, url, ...rest]);
    };

    XMLHttpRequest.prototype.send = function (...args) {
        const xhr = this;
        if (isHomeLayoutRequest(xhr._purpuraHomeLayoutUrl)) {
            Object.defineProperty(xhr, 'responseText', {
                configurable: true,
                get: function () {
                    if (xhr._purpuraHomeLayoutCached !== undefined) return xhr._purpuraHomeLayoutCached;
                    const original = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'responseText').get.call(this);
                    if (this.readyState !== 4) return original;
                    try {
                        const data = JSON.parse(original);
                        xhr._purpuraHomeLayoutCached = applyHomeLayoutToData(data) ? JSON.stringify(data) : '';
                    } catch (e) {
                        xhr._purpuraHomeLayoutCached = '';
                    }
                    return xhr._purpuraHomeLayoutCached || original;
                }
            });
            Object.defineProperty(xhr, 'response', {
                configurable: true,
                get: function () {
                    if (this.responseType === 'json') {
                        try {
                            return JSON.parse(this.responseText);
                        } catch (e) {
                            return Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'response').get.call(this);
                        }
                    }
                    return this.responseText;
                }
            });
            xhr.addEventListener('load', scheduleRefresh, { once: true });
        }
        return originalXhrSend.apply(this, args);
    };
})();
