/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'ps';
    const CONTAINER_ID = 'purpuras-selection-container';

    (function() {
        var style = document.createElement('style');
        style.textContent = ':root{--purpura-ps-genre-pill-bg:rgba(0,0,0,0.75);--purpura-ps-genre-pill-text:#fff;--purpura-ps-light-color:#393939}';
        document.head.appendChild(style);
    })();

    const CURATED_GAMES = [
        { name: 'Welcome to Bloxburg', genre: 'Roleplay', placeId: 185655149 },
        { name: 'Bee Swarm Simulator', genre: 'Simulator', placeId: 1537690962 },
        { name: 'Vesteria', genre: 'RPG', placeId: 2376885433 },
        { name: 'Bite By Night', genre: 'Horror', placeId: 70845479499574 },
        { name: 'PHIGHTING!', genre: 'FPS', placeId: 7138009149 },
        { name: 'Parkour Reborn', genre: 'Obby', placeId: 11639495622 },
        { name: 'Theme Park Tycoon 2', genre: 'Tycoon', placeId: 69184822 },
        { name: 'Jujutsu Shenanigans', genre: 'PvP', placeId: 9391468976 },
        { name: 'All Star Tower Defense', genre: 'Tower Defense', placeId: 4996049426 },
        { name: 'The Wild West', genre: 'Survival', placeId: 2317712696 },
        { name: 'Dress To Impress', genre: 'Fashion', placeId: 15101393044 },
        { name: 'HOURS', genre: 'Strategy', placeId: 5732973455 },
        { name: 'Racket Rivals', genre: 'Sports', placeId: 90906407195271 },
        { name: 'Break In 2', genre: 'Story', placeId: 13864661000 },
        { name: 'Build A Boat For Treasure', genre: 'Creative Inspiration', placeId: 537413528 },
        { name: 'Possessor', genre: 'Murder Mystery', placeId: 14841485778 },
        { name: 'BedWars', genre: 'Team Fighting', placeId: 6872265039 },
        { name: 'Guts & Blackpowder', genre: 'Mature Audiences', placeId: 12334109280 },
        { name: 'Mad City: Chapter 2', genre: 'Prison', placeId: 1224212277 },
        { name: 'Fantastic Frontier', genre: 'Meme-ified', placeId: 510411669 },
        { name: 'REx Reincarnated', genre: 'Experimental', placeId: 8549934015 },
        { name: 'Aftermath', genre: 'Best Paid Experience', placeId: 15327728308 },
        { name: 'Cube Combination', genre: 'Puzzle', placeId: 9798463281 },
        { name: 'Super Doomspire', genre: 'Battle Royale', placeId: 3725149043 },
        { name: 'Arcade Island', genre: 'Retro', placeId: 2185497593 },
        { name: 'Battleboards', genre: 'Unique Concept', placeId: 3422469965 }
    ];

    let injected = false;
    let spaWatcherInit = false;
    let domObserver = null;
    let debounceTimer = null;

    function shuffleArray(arr) {
        const shuffled = arr.slice();
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    function formatPlayerCount(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        }
        return String(num);
    }

    async function isEnabled() {
        return new Promise(resolve => {
            const val = window.__PurpuraSettings.get(STORAGE_KEY);
            resolve(val === undefined || val === true || !!val);
        });
    }

    function isChartsPage() {
        return window.location.href.startsWith('https://www.roblox.com/charts');
    }

    function alreadyInjected() {
        return !!document.getElementById(CONTAINER_ID);
    }

    function findInsertionPoint() {
        const pinned = document.querySelector('.pinned-games-carousel');
        if (pinned) return { anchor: pinned, position: 'afterend' };

        const firstCarousel = document.querySelector('.games-list-container');
        if (firstCarousel) return { anchor: firstCarousel, position: 'beforebegin' };

        const filters = document.querySelector('.filters-container');
        if (filters) return { anchor: filters, position: 'afterend' };

        return null;
    }

    async function fetchUniverseIds(placeIds) {
        try {
            const resp = await fetch(
                `https://games.roblox.com/v1/games/multiget-place-details?placeIds=${placeIds.join('&placeIds=')}`,
                { credentials: 'include' }
            );
            if (!resp.ok) return {};
            const data = await resp.json();
            const map = {};
            for (const item of data) {
                map[item.placeId] = item.universeId;
            }
            return map;
        } catch (e) {
            return {};
        }
    }

    async function fetchGameStats(universeIds) {
        if (universeIds.length === 0) return {};
        const map = {};
        const idStr = universeIds.join(',');
        try {
            const [gamesResp, votesResp] = await Promise.all([
                fetch(`https://games.roblox.com/v1/games?universeIds=${idStr}`, { credentials: 'include' }),
                fetch(`https://games.roblox.com/v1/games/votes?universeIds=${idStr}`, { credentials: 'include' })
            ]);
            if (gamesResp.ok) {
                const gamesJson = await gamesResp.json();
                for (const game of gamesJson.data) {
                    map[game.id] = {
                        name: game.name,
                        playing: game.playing || 0,
                        votePercent: 0
                    };
                }
            }
            if (votesResp.ok) {
                const votesJson = await votesResp.json();
                for (const vote of votesJson.data) {
                    const total = vote.upVotes + vote.downVotes;
                    const pct = total > 0 ? Math.round((vote.upVotes / total) * 100) : 0;
                    if (map[vote.id]) {
                        map[vote.id].votePercent = pct;
                    } else {
                        map[vote.id] = { name: '', playing: 0, votePercent: pct };
                    }
                }
            }
        } catch (e) { }
        return map;
    }

    async function fetchThumbnails(universeIds) {
        if (universeIds.length === 0) return {};
        try {
            const resp = await fetch(
                `https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeIds.join(',')}&returnPolicy=PlaceHolder&size=256x256&format=Webp&isCircular=false`
            );
            if (!resp.ok) return {};
            const data = await resp.json();
            const map = {};
            for (const item of data.data) {
                if (item.state === 'Completed' && item.imageUrl) {
                    map[item.targetId] = item.imageUrl;
                }
            }
            return map;
        } catch (e) {
            return {};
        }
    }

    function injectGenrePillStyles() {
        if (document.getElementById('purpura-genre-pill-styles')) return;
        const style = document.createElement('style');
        style.id = 'purpura-genre-pill-styles';
        style.textContent = `
            html.light-theme .game-card-info .info-label,
            html.light-theme [data-testid="game-tile-stats"] .info-label,
            html.light-theme .game-card-container .info-label,
            html.light-theme .game-tile .info-label,
            html.light-theme .game-card .info-label,
            html[data-theme="light"] .game-card-info .info-label,
            html[data-theme="light"] [data-testid="game-tile-stats"] .info-label,
            html[data-theme="light"] .game-card-container .info-label,
            body.light-theme .game-card-info .info-label,
            body[data-theme="light"] .game-card-info .info-label,
            body.theme-light .game-card-info .info-label {
                color: var(--purpura-ps-light-color) !important;
            }
            .purpura-genre-pill {
                position: absolute;
                bottom: 4px;
                right: 4px;
                background: var(--purpura-ps-genre-pill-bg);
                color: var(--purpura-ps-genre-pill-text);
                font-size: 10px;
                font-weight: 600;
                padding: 2px 6px;
                border-radius: 4px;
                line-height: 14px;
                white-space: nowrap;
                pointer-events: none;
                z-index: 1;
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
            }
        `;
        document.head.appendChild(style);
    }

    function buildCarousel(games, thumbnailMap, statsMap) {
        injectGenrePillStyles();

        const container = document.createElement('div');
        container.className = 'games-list-container';
        container.id = CONTAINER_ID;

        const headerContainer = document.createElement('div');
        headerContainer.className = 'home-sort-header-container';
        headerContainer.style.marginBottom = '16px';

        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'css-ibw9t7-sectionHeader';
        sectionHeader.setAttribute('data-testid', 'section-header');

        const titleContainer = document.createElement('div');
        titleContainer.className = 'css-1h1fine-titleSubtitleContainer';
        titleContainer.setAttribute('data-testid', 'section-header-title-subtitle-container');

        const textIconRow = document.createElement('div');
        textIconRow.className = 'css-j5e4nw-textIconRow';
        textIconRow.setAttribute('aria-label', "Purpura's Selection");
        textIconRow.setAttribute('data-testid', 'text-icon-row');

        const titleSpan = document.createElement('span');
        titleSpan.className = 'css-4izgel-textIconRowText css-59f5rs-textOverride';
        titleSpan.setAttribute('data-testid', 'text-icon-row-text');
        titleSpan.setAttribute('data-sdui-text', 'true');
        titleSpan.textContent = "Purpura's Selection";

        textIconRow.appendChild(titleSpan);
        titleContainer.appendChild(textIconRow);
        sectionHeader.appendChild(titleContainer);
        headerContainer.appendChild(sectionHeader);
        container.appendChild(headerContainer);

        const carouselWrapper = document.createElement('div');
        carouselWrapper.setAttribute('data-testid', 'game-carousel');
        carouselWrapper.className = 'horizontal-scroller games-list dynamic-layout-sizing-disabled new-scroll-arrows';

        const scrollWindow = document.createElement('div');
        scrollWindow.className = 'clearfix horizontal-scroll-window';

        const scrollable = document.createElement('div');
        scrollable.className = 'horizontally-scrollable';
        scrollable.style.left = '-948px';

        const ul = document.createElement('ul');
        ul.className = 'hlist games game-cards game-tile-list games-page-carousel';

        const CARD_WIDTH = 158;
        const VISIBLE_CARDS = 6;
        const CLONE_COUNT = VISIBLE_CARDS;

        function createGameCard(game, stats, displayName, index) {
            const li = document.createElement('li');
            li.className = 'list-item game-card game-tile';

            const cardContainer = document.createElement('div');
            cardContainer.className = 'game-card-container';
            cardContainer.setAttribute('data-testid', 'game-tile');

            const link = document.createElement('a');
            link.className = 'game-card-link';
            link.href = `https://www.roblox.com/games/${game.placeId}/`;
            link.tabIndex = index < 5 ? 0 : -1;
            link.setAttribute('aria-hidden', index < 5 ? 'false' : 'true');
            if (game.universeId) link.id = String(game.universeId);

            const thumbContainer = document.createElement('div');
            thumbContainer.className = 'game-card-thumb-container';
            thumbContainer.style.position = 'relative';

            const thumbSpan = document.createElement('span');
            thumbSpan.className = 'thumbnail-2d-container game-card-thumb';

            const img = document.createElement('img');
            const thumbUrl = game.universeId ? thumbnailMap[game.universeId] : null;
            if (thumbUrl) {
                img.src = thumbUrl;
            }
            img.alt = displayName;
            img.title = displayName;

            thumbSpan.appendChild(img);
            thumbContainer.appendChild(thumbSpan);

            const genrePill = document.createElement('span');
            genrePill.className = 'purpura-genre-pill';
            genrePill.textContent = game.genre;
            thumbContainer.appendChild(genrePill);

            link.appendChild(thumbContainer);

            const nameDiv = document.createElement('div');
            nameDiv.className = 'game-card-name game-name-title';
            nameDiv.title = displayName;
            nameDiv.textContent = displayName;
            link.appendChild(nameDiv);

            const infoDiv = document.createElement('div');
            infoDiv.className = 'game-card-info';
            infoDiv.setAttribute('data-testid', 'game-tile-stats');

            const votesIcon = document.createElement('span');
            votesIcon.className = 'info-label icon-votes-gray';
            infoDiv.appendChild(votesIcon);

            const votesLabel = document.createElement('span');
            votesLabel.className = 'info-label vote-percentage-label';
            votesLabel.textContent = stats ? stats.votePercent + '%' : '--';
            infoDiv.appendChild(votesLabel);

            const playingIcon = document.createElement('span');
            playingIcon.className = 'info-label icon-playing-counts-gray';
            infoDiv.appendChild(playingIcon);

            const playingLabel = document.createElement('span');
            playingLabel.className = 'info-label playing-counts-label';
            playingLabel.textContent = stats ? formatPlayerCount(stats.playing) : '--';
            infoDiv.appendChild(playingLabel);

            link.appendChild(infoDiv);

            cardContainer.appendChild(link);
            li.appendChild(cardContainer);
            return li;
        }

        // Prepend clones of the last CLONE_COUNT items (seamless prev wrap)
        const prependStart = Math.max(0, games.length - CLONE_COUNT);
        for (let i = prependStart; i < games.length; i++) {
            const game = games[i];
            const stats = game.universeId ? statsMap[game.universeId] : null;
            const displayName = (stats && stats.name) ? stats.name : game.name;
            const clone = createGameCard(game, stats, displayName, i);
            clone.setAttribute('aria-hidden', 'true');
            ul.appendChild(clone);
        }
        const prependCount = games.length - prependStart;

        for (let i = 0; i < games.length; i++) {
            const game = games[i];
            const stats = game.universeId ? statsMap[game.universeId] : null;
            const displayName = (stats && stats.name) ? stats.name : game.name;
            const li = createGameCard(game, stats, displayName, i);
            ul.appendChild(li);
        }

        // Append clones of the first CLONE_COUNT items (seamless next wrap)
        for (let i = 0; i < CLONE_COUNT && i < games.length; i++) {
            const clone = ul.children[prependCount + i].cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            ul.appendChild(clone);
        }

        scrollable.appendChild(ul);
        scrollWindow.appendChild(scrollable);
        carouselWrapper.appendChild(scrollWindow);

        const prevBtn = document.createElement('div');
        prevBtn.setAttribute('data-testid', 'game-carousel-scroll-bar');
        prevBtn.className = 'scroller-new prev';
        prevBtn.setAttribute('aria-disabled', 'true');
        prevBtn.setAttribute('role', 'button');
        prevBtn.setAttribute('tabindex', '0');
        const prevIcon = document.createElement('span');
        prevIcon.className = 'icon-chevron-heavy-left';
        prevBtn.appendChild(prevIcon);

        const nextBtn = document.createElement('div');
        nextBtn.setAttribute('data-testid', 'game-carousel-scroll-bar');
        nextBtn.className = 'scroller-new next';
        nextBtn.setAttribute('aria-disabled', 'false');
        nextBtn.setAttribute('role', 'button');
        nextBtn.setAttribute('tabindex', '0');
        const nextIcon = document.createElement('span');
        nextIcon.className = 'icon-chevron-heavy-right';
        nextBtn.appendChild(nextIcon);

        carouselWrapper.appendChild(prevBtn);
        carouselWrapper.appendChild(nextBtn);
        container.appendChild(carouselWrapper);

        const INITIAL_OFFSET = CLONE_COUNT * CARD_WIDTH;
        const REAL_MAX = games.length * CARD_WIDTH;
        const MAX_OFFSET = (games.length + CLONE_COUNT) * CARD_WIDTH;
        let scrollOffset = INITIAL_OFFSET;
        scrollable.style.left = `-${scrollOffset}px`;

        function updateArrows() {
            const hasOverflow = games.length > VISIBLE_CARDS;
            prevBtn.setAttribute('aria-disabled', hasOverflow ? 'false' : 'true');
            nextBtn.setAttribute('aria-disabled', hasOverflow ? 'false' : 'true');
        }

        let animFrame = null;
        let animFrom = 0;
        let animTarget = 0;
        let animStart = 0;

        function scrollCarousel(direction) {
            if (animFrame) {
                cancelAnimationFrame(animFrame);
                animFrame = null;
                // Snap to current position for the next animation
                scrollable.style.left = `-${scrollOffset}px`;
            }

            const step = CARD_WIDTH * 3;
            const rawTarget = direction === 'next' ? scrollOffset + step : scrollOffset - step;

            animFrom = scrollOffset;
            animTarget = rawTarget;
            animStart = performance.now();

            function tick(now) {
                const elapsed = now - animStart;
                const progress = Math.min(elapsed / 350, 1);
                const eased = 1 - Math.pow(1 - progress, 3);

                let current = animFrom + (animTarget - animFrom) * eased;

                // Seamless wrap: if we cross the boundary during animation,
                // shift both from and target so the animation continues smoothly.
                // Only wrap when crossing 0 or MAX_OFFSET, not the clone boundaries.
                if (current >= MAX_OFFSET) {
                    current -= REAL_MAX;
                    animFrom -= REAL_MAX;
                    animTarget -= REAL_MAX;
                } else if (current < 0) {
                    current += REAL_MAX;
                    animFrom += REAL_MAX;
                    animTarget += REAL_MAX;
                }

                scrollable.style.transition = 'none';
                scrollable.style.left = `-${current}px`;
                scrollOffset = current;

                if (progress < 1) {
                    animFrame = requestAnimationFrame(tick);
                } else {
                    animFrame = null;
                    updateArrows();
                }
            }

            animFrame = requestAnimationFrame(tick);
        }

        prevBtn.addEventListener('click', () => scrollCarousel('prev'));
        nextBtn.addEventListener('click', () => scrollCarousel('next'));

        updateArrows();
        return container;
    }

    async function fetchAndBuild(shuffledGames) {
        const placeIds = shuffledGames.map(g => g.placeId);
        const universeMap = await fetchUniverseIds(placeIds);

        for (const game of shuffledGames) {
            game.universeId = universeMap[game.placeId] || null;
        }

        const universeIds = Object.values(universeMap).filter(Boolean);
        const [thumbnailMap, statsMap] = await Promise.all([
            fetchThumbnails(universeIds),
            fetchGameStats(universeIds)
        ]);

        return { thumbnailMap, statsMap };
    }

    async function tryInject() {
        if (injected || alreadyInjected()) {
            injected = true;
            return;
        }
        if (!isChartsPage()) return;

        const enabled = await isEnabled();
        if (!enabled) return;

        const insertion = findInsertionPoint();
        if (!insertion) return;

        injected = true;

        const shuffledGames = shuffleArray(CURATED_GAMES);
        const { thumbnailMap, statsMap } = await fetchAndBuild(shuffledGames);

        if (!isChartsPage()) { injected = false; return; }
        if (alreadyInjected()) return;

        const finalInsertion = findInsertionPoint();
        if (!finalInsertion) { injected = false; return; }

        const carousel = buildCarousel(shuffledGames, thumbnailMap, statsMap);
        finalInsertion.anchor.insertAdjacentElement(finalInsertion.position, carousel);
    }

    let retryTimer = null;

    function startObserver() {
        if (domObserver) return;

        domObserver = new MutationObserver(() => {
            if (!isChartsPage() || injected || alreadyInjected()) return;
            if (debounceTimer) return;
            debounceTimer = setTimeout(() => {
                debounceTimer = null;
                if (!isChartsPage() || injected || alreadyInjected()) return;
                if (findInsertionPoint()) {
                    tryInject();
                }
            }, 150);
        });

        domObserver.observe(document.body || document.documentElement, {
            childList: true,
            subtree: true
        });

        // Staggered retries: the DOM may not be ready when observer starts,
        // especially on first navigation after extension reload.
        function scheduleRetry(delay) {
            retryTimer = setTimeout(() => {
                retryTimer = null;
                if (!injected && !alreadyInjected() && isChartsPage() && findInsertionPoint()) {
                    tryInject();
                } else if (delay < 1000 && !injected && !alreadyInjected() && isChartsPage()) {
                    scheduleRetry(delay + 400);
                }
            }, delay);
        }
        scheduleRetry(300);
    }

    function stopObserver() {
        if (domObserver) {
            domObserver.disconnect();
            domObserver = null;
        }
        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }
        if (retryTimer) {
            clearTimeout(retryTimer);
            retryTimer = null;
        }
    }

    function removeCarousel() {
        const el = document.getElementById(CONTAINER_ID);
        if (el) el.remove();
        injected = false;
    }

    function setupSpaWatcher() {
        if (spaWatcherInit) return;
        spaWatcherInit = true;

        let lastUrl = window.location.href;

        const onNav = () => {
            const newUrl = window.location.href;
            if (newUrl === lastUrl) return;
            lastUrl = newUrl;

            if (isChartsPage()) {
                removeCarousel();
                stopObserver();
                startObserver();
                tryInject();
            } else {
                removeCarousel();
                stopObserver();
            }
        };

        const origPush = history.pushState.bind(history);
        history.pushState = function (...args) {
            origPush(...args);
            setTimeout(onNav, 100);
        };

        const origReplace = history.replaceState.bind(history);
        history.replaceState = function (...args) {
            origReplace(...args);
            setTimeout(onNav, 100);
        };

        window.addEventListener('popstate', () => setTimeout(onNav, 100));
    }

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'sync') return;
        if (!(STORAGE_KEY in changes)) return;
        const newVal = window.__PurpuraSettings.get(STORAGE_KEY);
        if (newVal === false) {
            removeCarousel();
            stopObserver();
        } else if (isChartsPage()) {
            removeCarousel();
            startObserver();
            tryInject();
        }
    });

    async function init() {
        setupSpaWatcher();
        if (isChartsPage()) {
            startObserver();
            tryInject();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
