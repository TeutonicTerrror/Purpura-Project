/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'bc';
    const AUTO_REFRESH_KEY = 'bcAutoRefresh';
    const LAUNCH_SUCCESS_EVENT = 'purpura-game-launch-success';
    const REFRESH_THROTTLE_MS = 4000;
    const POST_LAUNCH_REFRESH_DELAYS = [2500, 7000, 15000];
    const DOM_SYNC_DELAYS = [0, 400, 1200, 3000];
    const MAX_NEW_CARDS_PER_REFRESH = 2;
    const CONTINUE_CAROUSEL_SELECTOR = [
        '.game-sort-carousel-wrapper',
        '[data-testid="game-carousel"]',
        '.game-carousel',
        '.home-page-carousel'
    ].join(',');
    const GAME_CARD_LINK_SELECTOR = 'a.game-card-link[href]';

    let enabled = false;
    let autoRefreshEnabled = false;
    let listenersInitialized = false;
    let refreshPromise = null;
    let lastRefreshAt = 0;
    let launchRefreshGeneration = 0;
    let domSyncGeneration = 0;
    let recentlyVisitedGames = [];
    let continueCarousel = null;

    function readSetting(key) {
        return window.__PurpuraSettings && typeof window.__PurpuraSettings.get === 'function'
            ? window.__PurpuraSettings.get(key)
            : undefined;
    }

    function isHomePage() {
        const path = window.location.pathname.toLowerCase();
        return path === '/home' || path.startsWith('/home/') ||
            /^\/[a-z]{2}(?:-[a-z]{2})?\/home(?:\/|$)/i.test(path) || path === '/';
    }

    function normalizeId(value) {
        const id = String(value ?? '').trim();
        return /^\d+$/.test(id) && id !== '0' ? id : '';
    }

    function getGameIds(game) {
        return new Set([
            game?.universeId,
            game?.universe_id,
            game?.id,
            game?.rootPlaceId,
            game?.root_place_id,
            game?.placeId,
            game?.place_id,
            game?.rootPlace?.id
        ].map(normalizeId).filter(Boolean));
    }

    function getUniverseId(game) {
        return normalizeId(game?.universeId ?? game?.universe_id ?? game?.id);
    }

    function getRootPlaceId(game) {
        return normalizeId(
            game?.rootPlaceId ?? game?.root_place_id ?? game?.placeId ??
            game?.place_id ?? game?.rootPlace?.id
        );
    }

    function getGamesSignature(games) {
        return (Array.isArray(games) ? games : [])
            .map(game => getUniverseId(game) || getRootPlaceId(game))
            .filter(Boolean)
            .join(',');
    }

    function getElementIds(element) {
        const ids = new Set();
        if (!(element instanceof Element)) return ids;

        const addId = value => {
            const id = normalizeId(value);
            if (id) ids.add(id);
        };
        const elements = [
            element,
            ...element.querySelectorAll(
                '[data-universe-id], [data-universeid], [data-game-id], [data-gameid], ' +
                '[data-place-id], [data-root-place-id], [data-rootplaceid]'
            )
        ];

        elements.forEach(current => {
            addId(current.id);
            addId(current.dataset?.universeId);
            addId(current.dataset?.universeid);
            addId(current.dataset?.gameId);
            addId(current.dataset?.gameid);
            addId(current.dataset?.placeId);
            addId(current.dataset?.rootPlaceId);
            addId(current.dataset?.rootplaceid);
            addId(current.dataset?.purpuraContinueUniverseId);
        });

        const links = element.matches('a[href]')
            ? [element]
            : [...element.querySelectorAll('a[href]')];
        links.forEach(link => {
            try {
                const url = new URL(link.href, window.location.origin);
                ['universeId', 'universe-id', 'gameId', 'placeId', 'rootPlaceId']
                    .forEach(key => addId(url.searchParams.get(key)));
                const match = url.pathname.match(/\/games\/(\d+)/i);
                if (match) addId(match[1]);
            } catch (_) {
                /* Ignore malformed links. */
            }
        });
        return ids;
    }

    function getCarouselCardCollection(carousel) {
        if (!(carousel instanceof Element)) return { cards: [], parent: null };
        const links = [...carousel.querySelectorAll(GAME_CARD_LINK_SELECTOR)];
        const rootsByParent = new Map();

        links.forEach(link => {
            let child = link;
            let parent = child.parentElement;
            while (parent && carousel.contains(parent)) {
                if (!rootsByParent.has(parent)) rootsByParent.set(parent, new Set());
                rootsByParent.get(parent).add(child);
                if (parent === carousel) break;
                child = parent;
                parent = parent.parentElement;
            }
        });

        let bestParent = null;
        let bestCards = [];
        rootsByParent.forEach((roots, parent) => {
            if (roots.size > bestCards.length) {
                bestParent = parent;
                bestCards = [...roots];
            }
        });
        return { cards: bestCards, parent: bestParent };
    }

    function normalizeText(value) {
        return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
    }

    function scoreCarousel(carousel, knownIds) {
        const { cards } = getCarouselCardCollection(carousel);
        if (!cards.length) return 0;

        const header = carousel.querySelector(
            'a[data-testid="section-header-title-subtitle-container"], h1, h2, h3, ' +
            '.container-header, .game-sort-header-container'
        );
        const headerText = normalizeText(header?.textContent);
        let score = 0;
        if (headerText === 'continue' || headerText === 'continue playing') score += 1000;
        else if (headerText.startsWith('continue ')) score += 500;
        cards.forEach(card => {
            if ([...getElementIds(card)].some(id => knownIds.has(id))) score += 10;
        });
        return score;
    }

    function findContinueCarousel(previousGames, nextGames) {
        if (continueCarousel?.isConnected) return continueCarousel;

        const knownIds = new Set();
        [...previousGames, ...nextGames].forEach(game => {
            getGameIds(game).forEach(id => knownIds.add(id));
        });

        let bestCarousel = null;
        let bestScore = 0;
        document.querySelectorAll(CONTINUE_CAROUSEL_SELECTOR).forEach(carousel => {
            const score = scoreCarousel(carousel, knownIds);
            if (score > bestScore) {
                bestCarousel = carousel;
                bestScore = score;
            }
        });

        if (bestCarousel && bestScore > 0) {
            continueCarousel = bestCarousel;
            continueCarousel.dataset.purpuraContinueCarousel = 'true';
        }
        return continueCarousel;
    }

    function createContinueCardRoot(game, templateCard) {
        if (!(templateCard instanceof Element)) return null;
        const universeId = getUniverseId(game);
        const placeId = getRootPlaceId(game) || universeId;
        if (!universeId && !placeId) return null;

        const wrapper = templateCard.cloneNode(true);
        wrapper.classList.add('purpura-live-continue-card');
        wrapper.dataset.purpuraContinueUniverseId = universeId || placeId;
        wrapper.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));

        const link = wrapper.matches('a[href]')
            ? wrapper
            : wrapper.querySelector('a.game-card-link, a[href*="/games/"]');
        if (link) {
            link.href = `https://www.roblox.com/games/${placeId}/`;
            link.dataset.purpuraContinueUniverseId = universeId || placeId;
        }

        if (game?.name) {
            const nameElement = wrapper.querySelector(
                '.game-card-name, .game-name-title, [data-testid*="game-name" i]'
            );
            if (nameElement) nameElement.textContent = game.name;
            if (link) link.setAttribute('aria-label', game.name);
        }

        const thumbnailUrl = game?.thumbnailUrl || game?.thumbnail?.url || game?.imageUrl;
        if (thumbnailUrl) {
            const image = wrapper.querySelector('img');
            if (image) {
                image.src = thumbnailUrl;
                image.alt = game.name || '';
            }
        }
        return wrapper;
    }

    function resetCarouselScroll(cardParent, carousel) {
        let current = cardParent;
        while (current && carousel.contains(current)) {
            if (current.scrollWidth > current.clientWidth + 1) {
                current.scrollLeft = 0;
                return;
            }
            current = current.parentElement;
        }
    }

    function syncContinueDom(nextGames, previousGames) {
        if (!enabled || !autoRefreshEnabled || !isHomePage() || !nextGames.length) return false;

        const carousel = findContinueCarousel(previousGames, nextGames);
        if (!carousel) return false;
        let { cards, parent: cardParent } = getCarouselCardCollection(carousel);
        if (!cards.length || !cardParent) return false;

        const nativeIds = new Set();
        cards.forEach(card => {
            if (!card.classList.contains('purpura-live-continue-card')) {
                getElementIds(card).forEach(id => nativeIds.add(id));
            }
        });
        cards.filter(card => card.classList.contains('purpura-live-continue-card'))
            .filter(card => [...getElementIds(card)].some(id => nativeIds.has(id)))
            .forEach(card => card.remove());

        ({ cards, parent: cardParent } = getCarouselCardCollection(carousel));
        const previousIds = new Set();
        previousGames.forEach(game => getGameIds(game).forEach(id => previousIds.add(id)));
        if (previousIds.size && !cards.some(card =>
            [...getElementIds(card)].some(id => previousIds.has(id)))) {
            continueCarousel = null;
            return false;
        }

        const targetCount = Math.min(nextGames.length, Math.max(cards.length, 1));
        const targetGames = nextGames.slice(0, targetCount);
        const cardsById = new Map();
        cards.forEach(card => {
            getElementIds(card).forEach(id => {
                if (!cardsById.has(id)) cardsById.set(id, card);
            });
        });

        const usedCards = new Set();
        const orderedCards = [];
        let createdCards = 0;
        targetGames.forEach(game => {
            const card = [...getGameIds(game)]
                .map(id => cardsById.get(id))
                .find(candidate => candidate && !usedCards.has(candidate));
            let selectedCard = card;
            if (!selectedCard && createdCards < MAX_NEW_CARDS_PER_REFRESH) {
                selectedCard = createContinueCardRoot(game, cards[0]);
                if (selectedCard) {
                    cardParent.appendChild(selectedCard);
                    cards.push(selectedCard);
                    createdCards += 1;
                }
            }
            if (selectedCard) {
                usedCards.add(selectedCard);
                orderedCards.push(selectedCard);
            }
        });
        if (!orderedCards.length) return false;

        const display = getComputedStyle(cardParent).display;
        if (['flex', 'inline-flex', 'grid', 'inline-grid'].includes(display)) {
            orderedCards.forEach((card, index) => { card.style.order = String(index); });
            cards.filter(card => !usedCards.has(card)).forEach((card, index) => {
                card.style.order = String(targetGames.length + index);
            });
        } else {
            const fragment = document.createDocumentFragment();
            orderedCards.forEach(card => fragment.appendChild(card));
            cardParent.insertBefore(fragment, cardParent.firstChild);
        }

        resetCarouselScroll(cardParent, carousel);
        return true;
    }

    function scheduleDomSync(nextGames, previousGames) {
        const generation = ++domSyncGeneration;
        let synced = false;
        DOM_SYNC_DELAYS.forEach(delay => {
            setTimeout(() => {
                if (!synced && generation === domSyncGeneration) {
                    synced = syncContinueDom(nextGames, previousGames);
                }
            }, delay);
        });
    }

    async function fetchRecentlyVisitedGames() {
        const response = await fetch(
            'https://apis.roblox.com/search-landing-page-api/v1?sessionId=Purpura',
            {
                credentials: 'include',
                cache: 'no-store',
                headers: { Accept: 'application/json' }
            }
        );
        if (!response.ok) return null;
        const data = await response.json();
        const recentlyVisited = Array.isArray(data.sorts)
            ? data.sorts.find(sort => sort.sortId === 'RecentlyVisited')
            : null;
        return Array.isArray(recentlyVisited?.games) ? recentlyVisited.games : null;
    }

    async function refreshContinue(force = false) {
        if (!enabled || !autoRefreshEnabled || !isHomePage()) {
            return { changed: false, refreshed: false };
        }
        if (refreshPromise) return refreshPromise;

        const now = Date.now();
        if (!force && now - lastRefreshAt < REFRESH_THROTTLE_MS) {
            return { changed: false, refreshed: false };
        }
        lastRefreshAt = now;
        refreshPromise = (async () => {
            try {
                const games = await fetchRecentlyVisitedGames();
                if (!games) return { changed: false, refreshed: false };
                const previousGames = recentlyVisitedGames;
                const changed = getGamesSignature(previousGames) !== getGamesSignature(games);
                recentlyVisitedGames = games;
                scheduleDomSync(games, previousGames);
                return { changed, refreshed: true };
            } catch (_) {
                return { changed: false, refreshed: false };
            } finally {
                refreshPromise = null;
            }
        })();
        return refreshPromise;
    }

    function schedulePostLaunchRefresh() {
        if (!enabled || !autoRefreshEnabled || !isHomePage()) return;
        const generation = ++launchRefreshGeneration;
        const baselineSignature = getGamesSignature(recentlyVisitedGames);
        const attempt = index => {
            if (generation !== launchRefreshGeneration || !enabled ||
                !autoRefreshEnabled || !isHomePage()) return;
            if (getGamesSignature(recentlyVisitedGames) !== baselineSignature) return;
            setTimeout(async () => {
                if (generation !== launchRefreshGeneration || !isHomePage()) return;
                const result = await refreshContinue(true);
                if (!result.changed && index + 1 < POST_LAUNCH_REFRESH_DELAYS.length) {
                    attempt(index + 1);
                }
            }, POST_LAUNCH_REFRESH_DELAYS[index]);
        };
        attempt(0);
    }

    function refreshWhenReturningToHome() {
        if (enabled && autoRefreshEnabled && isHomePage() && !document.hidden) {
            refreshContinue();
        }
    }

    function initializeAutoRefreshListeners() {
        if (listenersInitialized) return;
        listenersInitialized = true;
        document.addEventListener(LAUNCH_SUCCESS_EVENT, schedulePostLaunchRefresh);
        document.addEventListener('visibilitychange', refreshWhenReturningToHome);
        window.addEventListener('focus', refreshWhenReturningToHome);
    }

    window.__PurpuraSettings.ready.then(function () {
        enabled = readSetting(STORAGE_KEY) === true;
        autoRefreshEnabled = readSetting(AUTO_REFRESH_KEY) !== false;
        initializeAutoRefreshListeners();
        if (enabled) initBetterContinue();
    });

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'local') return;
        let relevantChange = false;
        if (changes[STORAGE_KEY]) {
            relevantChange = true;
            enabled = changes[STORAGE_KEY].newValue === true;
            if (enabled) initBetterContinue();
            else {
                launchRefreshGeneration += 1;
                domSyncGeneration += 1;
            }
        }
        if (changes[AUTO_REFRESH_KEY]) {
            relevantChange = true;
            autoRefreshEnabled = changes[AUTO_REFRESH_KEY].newValue !== false;
            if (!autoRefreshEnabled) {
                launchRefreshGeneration += 1;
                domSyncGeneration += 1;
            }
        }
        if (relevantChange) refreshWhenReturningToHome();
    });

    async function initBetterContinue() {
        initializeAutoRefreshListeners();
        try {
            const games = await fetchRecentlyVisitedGames();
            if (!games || !enabled) return;
            recentlyVisitedGames = games;
            const observer = new MutationObserver(() => {
                const carousel = findContinueCarousel([], games);
                if (carousel && syncContinueDom(games, [])) observer.disconnect();
            });
            observer.observe(document.body || document.documentElement, {
                childList: true,
                subtree: true
            });
            scheduleDomSync(games, []);
        } catch (_) {
            /* Ignore transient Roblox API or DOM failures. */
        }
    }
})();
