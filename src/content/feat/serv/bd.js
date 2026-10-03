/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
function initBotDetector() {
    function t(key, substitutions) { return chrome.i18n.getMessage(key, substitutions) || key; }
    function ensureBdStyles() {
        if (document.getElementById('purpura-bd-vars')) return;
        var s = document.createElement('style');
        s.id = 'purpura-bd-vars';
        s.textContent = ':root{' +
            '--purpura-bd-error:#ef4444;--purpura-bd-success:#34d399;--purpura-bd-warning:#f59e0b;' +
            '--purpura-bd-accent-light:#7C3AED;--purpura-bd-muted-light:#475569}';
        document.head.appendChild(s);
    }
    ensureBdStyles();
    try { if (window.PurpuraBotDetector?.cleanup) window.PurpuraBotDetector.cleanup(); } catch {}
    let themeObserver = null;

    const INJECT_DELAY_MS = 3000;
    const MAX_PAGES = 1;
    const MAX_SERVERS_TO_CHECK = 100;
    const TOKENS_PER_SERVER = 3;
    const THUMBNAIL_BATCH_SIZE = 25;
    const MIN_THUMBNAILS_REQUIRED = 4;
    const SIMILARITY_THRESHOLD = 5;
    const REFRESH_MS = 60000;
    const REQUEST_DELAY_MS = 1000;
    const BATCH_DELAY_MS = 3000;
    const MAX_TOKENS_TOTAL = 500;
    const MAX_WAIT_FOR_ELEMENT_MS = 45000;

    const placeId = window.location.pathname.match(/games\/(\d+)/)?.[1];
    if (!placeId) return;

    const CACHE_KEY = `purpura_bot_cache_${placeId}`;
    const UI_STATE_KEY = `purpura_bot_ui_${placeId}`;

    function el(html) {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = html.trim();
        return wrapper.firstElementChild;
    }

    function loadCache() { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); } catch { return {}; } }
    function saveCache(obj) { try { localStorage.setItem(CACHE_KEY, JSON.stringify(obj)); } catch {} }
    function loadUiState() { try { return JSON.parse(localStorage.getItem(UI_STATE_KEY) || "{}"); } catch { return {}; } }
    function saveUiState(state) { try { localStorage.setItem(UI_STATE_KEY, JSON.stringify(state)); } catch {} }

    function calculateHashFromImage(img) {
        try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = canvas.height = 8;
            ctx.drawImage(img, 0, 0, 8, 8);
            const data = ctx.getImageData(0, 0, 8, 8).data;
            let hash = "";
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                hash += avg < 128 ? "0" : "1";
            }
            return hash;
        } catch (e) {
            return null;
        }
    }

    function calculateHashDistance(a, b) {
        if (!a || !b || a.length !== b.length) return Infinity;
        let d = 0;
        for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
        return d;
    }

    async function fetchGameInfo(placeId) {
        try {
            const placeResp = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
            if (!placeResp.ok) return null;
            const placeJson = await placeResp.json();
            const universeId = placeJson.universeId;
            const gameResp = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
            if (!gameResp.ok) return { universeId };
            const gameJson = await gameResp.json();
            if (!gameJson?.data?.length) return { universeId };
            const g = gameJson.data[0];
            return { name: g.name, universeId, playing: typeof g.playing === "number" ? g.playing : 0 };
        } catch (e) {
            return null;
        }
    }

    async function fetchThumbnailsForTokens(tokens, updateProgress) {
        if (!tokens || tokens.length === 0) return [];
        const results = [];
        let processed = 0;
        const total = tokens.length;

        for (let i = 0; i < tokens.length; i += THUMBNAIL_BATCH_SIZE * 4) {
            const batchGroup = tokens.slice(i, i + THUMBNAIL_BATCH_SIZE * 4);

            for (let j = 0; j < batchGroup.length; j += THUMBNAIL_BATCH_SIZE) {
                const batchTokens = batchGroup.slice(j, j + THUMBNAIL_BATCH_SIZE);
                const requestData = batchTokens.map(token => ({
                    requestId: token.slice(0, 12),
                    token,
                    type: "AvatarHeadshot",
                    size: "150x150",
                    format: "Png",
                    isCircular: false
                }));

                try {
                    if (j > 0) await new Promise(r => setTimeout(r, REQUEST_DELAY_MS));
                    const resp = await fetch("https://thumbnails.roblox.com/v1/batch", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(requestData)
                    });
                    if (resp.status === 429) {
                        break;
                    }
                    if (!resp.ok) continue;
                    const json = await resp.json();
                    if (json && Array.isArray(json.data)) {
                        json.data.forEach(item => {
                            if (item.state === "Completed" && item.imageUrl) results.push(item.imageUrl);
                        });
                    }
                } catch (e) {
                }

                processed += batchTokens.length;
                if (updateProgress) updateProgress(Math.min(processed, total), total);
            }

            if (i + THUMBNAIL_BATCH_SIZE * 4 < tokens.length) {
                await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
            }
        }

        return results;
    }

    function loadImageAndHash(url) {
        return new Promise(resolve => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(calculateHashFromImage(img));
            img.onerror = () => resolve(null);
            img.src = url;
        });
    }

    async function performScan(updateProgress) {
        let servers = [];
        let cursor = "";
        for (let p = 0; p < MAX_PAGES; p++) {
            try {
                if (p > 0) await new Promise(r => setTimeout(r, REQUEST_DELAY_MS));
                const resp = await fetch(`https://games.roblox.com/v1/games/${placeId}/servers/Public?sortOrder=Asc&limit=100${cursor ? `&cursor=${cursor}` : ""}`, {
                    credentials: 'include'
                });
                if (resp.status === 429) {
                    break;
                }
                if (!resp.ok) { break; }
                const json = await resp.json();
                if (json && Array.isArray(json.data)) servers.push(...json.data);
                cursor = json.nextPageCursor || "";
                if (!cursor) break;
            } catch (e) {
                break;
            }
        }

        servers = servers.slice(0, MAX_SERVERS_TO_CHECK);
        const totalServerPlayers = servers.reduce((sum, s) => sum + (s.playing || 0), 0);

        const tokens = [];
        for (const s of servers) {
            if (s.playerTokens && s.playerTokens.length > 0) {
                const t = s.playerTokens.slice(0, TOKENS_PER_SERVER);
                tokens.push(...t);
            } else if (s.playerList && Array.isArray(s.playerList)) {
                const playerListTokens = s.playerList
                    .filter(p => p && p.playerToken)
                    .map(p => p.playerToken)
                    .slice(0, TOKENS_PER_SERVER);
                tokens.push(...playerListTokens);
            }
        }
        const sampledTokens = tokens.slice(0, MAX_TOKENS_TOTAL);

        const imageUrls = await fetchThumbnailsForTokens(sampledTokens, updateProgress);

        if (!imageUrls || imageUrls.length < MIN_THUMBNAILS_REQUIRED) {
            return {
                success: false,
                reason: imageUrls ? `not_enough_thumbnails (${imageUrls.length}/${MIN_THUMBNAILS_REQUIRED})` : "thumb_fetch_failed",
                serversCount: servers.length,
                imageCount: imageUrls ? imageUrls.length : 0,
                totalServerPlayers,
                tokensCollected: sampledTokens.length
            };
        }

        const hashPromises = imageUrls.map(url => loadImageAndHash(url));
        const rawHashes = (await Promise.all(hashPromises)).filter(Boolean);

        if (rawHashes.length === 0) {
            return {
                success: false,
                reason: "no_hashes",
                serversCount: servers.length,
                imageCount: imageUrls.length,
                totalServerPlayers
            };
        }

        const uniqueHashes = {};
        rawHashes.forEach(h => uniqueHashes[h] = (uniqueHashes[h] || 0) + 1);
        const uniqueList = Object.keys(uniqueHashes);

        const groups = [];
        const assigned = new Array(uniqueList.length).fill(false);

        for (let i = 0; i < uniqueList.length; i++) {
            if (assigned[i]) continue;
            const base = uniqueList[i];
            const group = new Set([base]);
            assigned[i] = true;
            for (let j = i + 1; j < uniqueList.length; j++) {
                if (assigned[j]) continue;
                const other = uniqueList[j];
                const dist = calculateHashDistance(base, other);
                if (dist <= SIMILARITY_THRESHOLD) {
                    group.add(other);
                    assigned[j] = true;
                }
            }
            groups.push(group);
        }

        let totalPlayers = rawHashes.length;
        let totalBots = 0;
        groups.forEach(group => {
            let occ = 0;
            group.forEach(h => { occ += uniqueHashes[h] || 0; });
            if (occ >= 2) totalBots += occ;
        });

        const botPercentage = Number(((totalBots / totalPlayers) * 100).toFixed(2));

        return { success: true, totalPlayers, totalBots, botPercentage, serversCount: servers.length, time: Date.now(), totalServerPlayers, imageUrls };
    }

    function tryFindDescription() {
        const selectors = [
            ".game-description-container",
            "[class*='game-description-container']",
            ".game-description",
            "[class*='game-description']"
        ];
        
        for (const selector of selectors) {
            const el = document.querySelector(selector);
            if (el) {
                return el;
            }
        }
        
        return null;
    }

    function waitForDescription() {
        return new Promise((resolve) => {
            const existing = tryFindDescription();
            if (existing) {
                resolve(existing);
                return;
            }

            const startTime = Date.now();
            const observer = new MutationObserver(() => {
                const found = tryFindDescription();
                if (found) {
                    observer.disconnect();
                    resolve(found);
                } else if (Date.now() - startTime > MAX_WAIT_FOR_ELEMENT_MS) {
                    observer.disconnect();
                    resolve(null);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                resolve(null);
            }, MAX_WAIT_FOR_ELEMENT_MS);
        });
    }

    function createUI(gameInfo) {
        const existing = document.querySelector(".purpura-bot-card");
        if (existing) return null;
        const descriptionElement = tryFindDescription();
        if (!descriptionElement || !descriptionElement.parentElement) return null;

        const card = document.createElement("div");
        card.className = "purpura-bot-card";
        card.classList.toggle('light-mode', gameInfo.isLight);
        card.classList.toggle('dark-mode', !gameInfo.isLight);

        const styleTag = document.createElement("style");
        styleTag.setAttribute("data-purpura-bot-style", "1");
        styleTag.textContent = `
            .purpura-bot-card {
                --pb-bg: #121215;
                --pb-text: #d5d7dd;
                --pb-muted: #9ca3af;
                --pb-accent: #c084fc;
                --pb-border: rgba(255,255,255,0.03);
                --pb-shadow: 0 8px 30px rgba(0,0,0,0.6);
                --pb-card-bg: #1a1a1d;
                --pb-btn-bg: #1a1a1d;
                --pb-btn-hover: #232328;
                
                background: var(--pb-bg);
                color: var(--pb-text);
                border-radius: 12px;
                padding: 18px;
                margin-bottom: 16px;
                font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
                box-shadow: var(--pb-shadow);
                border: 1px solid var(--pb-border);
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                max-width: 780px;
            }

            .purpura-bot-card.light-mode {
                --pb-bg: rgba(255, 255, 255, 0.7);
                --pb-text: #0F172A;
                --pb-muted: #475569;
                --pb-accent: #A855F7;
                --pb-border: rgba(168, 85, 247, 0.15);
                --pb-shadow: 0 10px 40px rgba(0,0,0,0.06), inset 0 0 0 1.5px rgba(255, 255, 255, 0.5);
                --pb-card-bg: rgba(255, 255, 255, 0.4);
                --pb-btn-bg: rgba(168, 85, 247, 0.1);
                --pb-btn-hover: rgba(168, 85, 247, 0.15);
                
                backdrop-filter: blur(40px) saturate(200%);
                -webkit-backdrop-filter: blur(40px) saturate(200%);
                border-top: 4px solid var(--pb-accent);
            }

            .purpura-bot-card.purpura-flash { 
                box-shadow: 0 0 0 6px rgba(168, 85, 247, 0.12), var(--pb-shadow);
                transform: translateY(-2px); 
            }
            
            .purpura-bot-card .purpura-section { margin-bottom: 12px; }
            .purpura-bot-card .purpura-section h4 { 
                color: var(--pb-accent); 
                margin: 0 0 8px 0; 
                font-size: 12px; 
                font-weight: 800; 
                text-transform: uppercase;
                letter-spacing: 0.8px;
            }
            
            .purpura-hidden { display:none !important; }
            
            .purpura-database-btn { 
                background: var(--pb-btn-bg); 
                color: var(--pb-accent); 
                border: 1px solid var(--pb-border); 
                padding: 12px 24px; 
                border-radius: 10px; 
                font-weight: 700; 
                font-size: 14px; 
                cursor: pointer; 
                transition: all 0.2s ease; 
                width: 100%; 
                font-family: inherit;
            }
            
            .purpura-database-btn:hover { 
                background: var(--pb-btn-hover); 
                border-color: var(--pb-accent); 
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(168, 85, 247, 0.15);
            }
            
            .purpura-thumbnail-modal { 
                --pb-bg: #121215;
                --pb-text: #d5d7dd;
                --pb-muted: #9ca3af;
                --pb-accent: #c084fc;
                --pb-border: rgba(255,255,255,0.1);
                --pb-card-bg: #0f0f12;

                position: fixed; 
                inset: 0;
                background: rgba(0,0,0,0.75); 
                backdrop-filter: blur(12px);
                z-index: 999999; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                padding: 40px;
                animation: purpuraModalFade 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .purpura-thumbnail-modal.light-mode {
                --pb-bg: rgba(255, 255, 255, 0.3);
                --pb-text: #0F172A;
                --pb-muted: #475569;
                --pb-accent: #A855F7;
                --pb-border: rgba(255, 255, 255, 0.3);
                --pb-card-bg: rgba(255, 255, 255, 0.2);
                
                backdrop-filter: blur(12px) saturate(180%);
                -webkit-backdrop-filter: blur(12px) saturate(180%);
            }

            .purpura-thumbnail-modal.light-mode .purpura-thumbnail-container {
                box-shadow: 
                    0 8px 32px rgba(0, 0, 0, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.5),
                    inset 0 -1px 0 rgba(255, 255, 255, 0.1),
                    inset 0 0 40px 20px rgba(255, 255, 255, 2);
                position: relative;
                border-top: none;
            }

            .purpura-thumbnail-modal.light-mode .purpura-thumbnail-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 1px;
                background: linear-gradient(
                    90deg,
                    transparent,
                    rgba(255, 255, 255, 0.8),
                    transparent
                );
                z-index: 10;
            }

            .purpura-thumbnail-modal.light-mode .purpura-thumbnail-container::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 1px;
                height: 100%;
                background: linear-gradient(
                    180deg,
                    rgba(255, 255, 255, 0.8),
                    transparent,
                    rgba(255, 255, 255, 0.3)
                );
                z-index: 10;
            }

            @keyframes purpuraModalFade {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes purpuraContainerScale {
                from { transform: scale(0.95); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            
            .purpura-thumbnail-container { 
                background: var(--pb-bg); 
                border-radius: 28px; 
                padding: 32px; 
                width: 100%;
                max-width: 1000px;
                height: 100%;
                max-height: 800px;
                display: flex;
                flex-direction: column;
                overflow: hidden; 
                border: 1px solid var(--pb-border);
                box-shadow: 0 40px 100px rgba(0,0,0,0.5);
                animation: purpuraContainerScale 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
            }

            .purpura-thumbnail-modal.light-mode .purpura-thumbnail-container {
                box-shadow: 
                    0 40px 100px rgba(0,0,0,0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.5),
                    inset 0 -1px 0 rgba(255, 255, 255, 0.1),
                    inset 0 0 40px 20px rgba(255, 255, 255, 2);
            }
            
            .purpura-thumbnail-header { 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                margin-bottom: 20px; 
                padding-bottom: 16px; 
                border-bottom: 1.5px solid var(--pb-border); 
                flex-shrink: 0;
            }
            
            .purpura-thumbnail-header h3 { 
                margin: 0; 
                font-size: 20px; 
                color: var(--pb-accent); 
                font-weight: 800; 
                letter-spacing: -0.5px;
            }

            .purpura-thumbnail-scrollable {
                flex: 1;
                overflow-y: auto;
                overscroll-behavior: contain;
                padding-right: 12px;
                margin-right: -12px;
            }

            .purpura-thumbnail-scrollable::-webkit-scrollbar {
                width: 6px;
            }

            .purpura-thumbnail-scrollable::-webkit-scrollbar-track {
                background: transparent;
            }

            .purpura-thumbnail-scrollable::-webkit-scrollbar-thumb {
                background: var(--pb-accent);
                border-radius: 10px;
            }
            
            .purpura-close-btn { 
                background: rgba(239, 68, 68, 0.1); 
                color: var(--purpura-bd-error); 
                border: 1px solid rgba(239, 68, 68, 0.1); 
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%; 
                cursor: pointer; 
                transition: all 0.3s ease; 
                padding: 0;
            }
            
            .purpura-close-btn:hover { 
                background: var(--purpura-bd-error); 
                color: #fff; 
                transform: rotate(90deg) scale(1.1);
            }
            
            .purpura-close-btn svg {
                width: 18px;
                height: 18px;
            }
            
            .purpura-thumbnail-grid { 
                display: grid; 
                grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); 
                gap: 12px; 
                padding-bottom: 20px;
            }
            
            .purpura-thumbnail-grid img { 
                width: 100%; 
                aspect-ratio: 1;
                object-fit: cover; 
                border-radius: 14px; 
                background: var(--pb-card-bg); 
                border: 1.5px solid var(--pb-border); 
                transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); 
                cursor: pointer; 
            }
            
            .purpura-thumbnail-grid img:hover { 
                transform: scale(1.12) translateY(-4px); 
                border-color: var(--pb-accent); 
                box-shadow: 0 12px 24px rgba(168, 85, 247, 0.25); 
                z-index: 2; 
            }
        `;
        document.head.appendChild(styleTag);

        const botSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="var(--pb-accent)" d="M12 2a1 1 0 0 1 1 1v2.07A7.002 7.002 0 0 1 19 12v5h1a1 1 0 1 1 0 2h-1v1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-1H4a1 1 0 1 1 0-2h1v-5a7.002 7.002 0 0 1 6-6.93V3a1 1 0 0 1 1-1zm-5 9a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm10 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-7 6h6v-1H10v1z"/></svg>';
        const chevronSVG = (rot = 0) => `<svg width="18" height="18" viewBox="0 0 24 24" style="transform:rotate(${rot}deg);transition:transform 180ms ease;"><path fill="var(--pb-accent)" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>`;

        const header = el(`<div style="display:flex; align-items:center; justify-content:space-between;"><div class="purpura-collapser" title="Click to collapse/expand" style="display:flex; align-items:center; gap:8px;">${botSVG}<div style="display:flex;flex-direction:column;"><div style="font-weight:800; color:var(--pb-accent); font-size:15px; letter-spacing:-0.3px;">${t('botDetector_title')}</div><div id="purpura-subtitle" style="font-size:12px; color:var(--pb-muted); margin-top:1px; font-weight:500;">${t('botDetector_scanning')}</div></div></div><div id="purpura-toggle" style="display:flex; align-items:center;">${chevronSVG(0)}</div></div>`);

        const gameNameVal = gameInfo?.name ? gameInfo.name : t('botDetector_unknown');
        const gamePlayingVal = (gameInfo && typeof gameInfo.playing === "number" && gameInfo.playing > 0) ? gameInfo.playing.toLocaleString() : t('botDetector_calculating');

        const body = el(`<div class="purpura-body"><div class="purpura-section"><h4>${t('botDetector_gameInfo')}</h4><div id="purpura-gameinfo" style="color:var(--pb-text);"><div><strong>${t('botDetector_gameName')}</strong> <span id="purpura-game-name">${gameNameVal}</span></div><div><strong>${t('botDetector_playercount')}</strong> <span id="purpura-game-players">${gamePlayingVal}</span></div></div></div><div class="purpura-section"><h4>${t('botDetector_message')}</h4><div id="purpura-msg" style="font-weight:700; color:var(--pb-text);">${t('botDetector_analyzing')}</div></div><div class="purpura-section"><h4>${t('botDetector_percentEstimation')}</h4><div id="purpura-percent" style="font-weight:700; color:var(--pb-text);">-</div></div><div class="purpura-section"><h4>${t('botDetector_dataset')}</h4><div id="purpura-data" style="color:var(--pb-text);">-</div></div><div class="purpura-section purpura-hidden" id="purpura-database-section"><h4>${t('botDetector_viewAnalysisData')}</h4><button class="purpura-database-btn" id="purpura-database-btn">${t('botDetector_viewDatabase')}</button></div><div class="purpura-section"><h4>${t('botDetector_extraNotes')}</h4><div style="color:var(--pb-muted); font-size:13px;">${t('botDetector_note1')} <br>${t('botDetector_note2')}</div></div></div>`);

        card.appendChild(header);
        card.appendChild(body);
        descriptionElement.parentElement.insertBefore(card, descriptionElement);

        const toggle = card.querySelector("#purpura-toggle");
        const collapser = card.querySelector(".purpura-collapser");
        const uiState = loadUiState();

        function setCollapsed(collapsed) {
            const bodyEl = card.querySelector(".purpura-body");
            bodyEl.classList.toggle("purpura-hidden", collapsed);
            toggle.innerHTML = chevronSVG(collapsed ? 180 : 0);
            saveUiState({ collapsed });
        }

        collapser.addEventListener("click", () => setCollapsed(!card.querySelector(".purpura-body").classList.contains("purpura-hidden")));
        toggle.addEventListener("click", () => setCollapsed(!card.querySelector(".purpura-body").classList.contains("purpura-hidden")));
        if (uiState && uiState.collapsed) setCollapsed(true);

        return {
            subtitle: card.querySelector("#purpura-subtitle"),
            msg: card.querySelector("#purpura-msg"),
            percent: card.querySelector("#purpura-percent"),
            data: card.querySelector("#purpura-data"),
            gameNameSpan: card.querySelector("#purpura-game-name"),
            gamePlayersSpan: card.querySelector("#purpura-game-players"),
            databaseBtn: card.querySelector("#purpura-database-btn"),
            databaseSection: card.querySelector("#purpura-database-section"),
            card,
            styleTag
        };
    }

    function flashGreen(card) {
        card.classList.add("purpura-flash");
        setTimeout(() => card.classList.remove("purpura-flash"), 1000);
    }

    async function init() {
        await new Promise(r => setTimeout(r, INJECT_DELAY_MS));

        const featureEnabled = await new Promise(resolve => {
            const config = window.__PurpuraSettings.get("bd");
            if (typeof config === "boolean") resolve(config);
            else if (config && typeof config === "object") resolve(config.enabled !== false);
            else resolve(true);
        });
        if (!featureEnabled) {
            return;
        }

        const gameInfo = await fetchGameInfo(placeId);

        const descriptionElement = await waitForDescription();
        
        if (!descriptionElement) {
            return;
        }

        const themeRes = await chrome.runtime.sendMessage({ action: "getRobloxTheme" });
        const isLight = themeRes?.theme === "light";

        const ui = createUI({ ...(gameInfo || {}), isLight });
        if (!ui) {
            return;
        }

        if (themeObserver) themeObserver.disconnect();
        themeObserver = new MutationObserver(async () => {
            const currentThemeRes = await chrome.runtime.sendMessage({ action: "getRobloxTheme" });
            const isNowLight = currentThemeRes?.theme === "light";
            const card = document.querySelector(".purpura-bot-card");
            if (card) {
                card.classList.toggle('light-mode', isNowLight);
                card.classList.toggle('dark-mode', !isNowLight);
            }
        });
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        if (document.body) themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        return initializeUI(ui, gameInfo || {});
    }

    async function initializeUI(ui, gameInfo) {
        let intervalId = null;

        const config = await new Promise(resolve => {
            const cfg = window.__PurpuraSettings.get("bd");
            if (cfg && typeof cfg === "object") resolve(cfg);
            else resolve({});
        });

        const showDatabase = config.showDatabase !== false;
        const roundToWholeNumbers = config.roundToWholeNumbers !== false;

        if (showDatabase) {
            const cached = loadCache();
            if (cached && cached.success && cached.imageUrls) {
                ui.databaseSection.classList.remove("purpura-hidden");
            }
        }

        function formatPercentDisplay(botPercentage, totalPlayers, totalBots) {
            if (roundToWholeNumbers) {
                return t('botDetector_percentBots', [String(Math.round(botPercentage))]);
            } else {
                return t('botDetector_percentBots', [String(botPercentage)]);
            }
        }

        async function showThumbnailModal(imageUrls) {
            if (!imageUrls || imageUrls.length === 0) {
                alert(t('botDetector_noThumbnailData'));
                return;
            }

            const themeRes = await chrome.runtime.sendMessage({ action: "getRobloxTheme" });
            const isLight = themeRes?.theme === "light";

            const modal = el(`<div class="purpura-thumbnail-modal ${isLight ? 'light-mode' : 'dark-mode'}">
                <div class="purpura-thumbnail-container">
                    <div class="purpura-thumbnail-header">
                        <div>
                            <h3 style="color: ${isLight ? 'var(--purpura-bd-accent-light)' : 'var(--pb-accent)'}">${t('botDetector_analysisDatabase')} <span style="font-size: 13px; color: ${isLight ? 'var(--purpura-bd-muted-light)' : 'var(--pb-muted)'}; font-weight: 600; margin-left: 8px;">${t('botDetector_samples', [String(imageUrls.length)])}</span></h3>
                        </div>
                        <button class="purpura-close-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                    <div class="purpura-thumbnail-scrollable">
                        <div class="purpura-thumbnail-grid"></div>
                    </div>
                </div>
            </div>`);

            const grid = modal.querySelector(".purpura-thumbnail-grid");
            imageUrls.forEach(url => {
                const img = document.createElement("img");
                img.src = url;
                img.alt = "Player thumbnail";
                grid.appendChild(img);
            });

            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.documentElement.style.overflow = "hidden";
            document.body.style.overflow = "hidden";
            if (scrollbarWidth > 0) {
                document.body.style.paddingRight = `${scrollbarWidth}px`;
            }

            const preventScroll = (e) => {
                if (!modal.querySelector(".purpura-thumbnail-scrollable").contains(e.target)) {
                    e.preventDefault();
                }
            };
            modal.addEventListener("wheel", preventScroll, { passive: false });
            modal.addEventListener("touchmove", preventScroll, { passive: false });

            const closeModal = () => {
                modal.remove();
                document.documentElement.style.overflow = "";
                document.body.style.overflow = "";
                document.body.style.paddingRight = "";
                modal.removeEventListener("wheel", preventScroll);
                modal.removeEventListener("touchmove", preventScroll);
            };

            const closeBtn = modal.querySelector(".purpura-close-btn");
            closeBtn.addEventListener("click", closeModal);
            modal.addEventListener("click", (e) => {
                if (e.target === modal) closeModal();
            });

            document.body.appendChild(modal);
        }

        if (ui.databaseBtn) {
            ui.databaseBtn.addEventListener("click", () => {
                const cached = loadCache();
                if (cached && cached.imageUrls) {
                    showThumbnailModal(cached.imageUrls);
                } else {
                    alert("No thumbnail data available. Please wait for a scan to complete.");
                }
            });
        }

        const cached = loadCache();
        if (cached && cached.success) {
            ui.subtitle.textContent = t('botDetector_lastScan', [new Date(cached.time).toLocaleString()]);
            ui.msg.textContent = cached.message || t('botDetector_cachedResults');
            ui.msg.style.color = cached.msgColor || "var(--pb-text)";
            ui.percent.textContent = formatPercentDisplay(cached.botPercentage, cached.totalPlayers, cached.totalBots);
            ui.data.textContent = t('botDetector_analyzedCached', [String(cached.totalPlayers), String(cached.serversCount)]);
            if (typeof cached.totalServerPlayers === "number") {
                const best = Math.max(cached.totalServerPlayers || 0, (gameInfo?.playing || 0));
                ui.gameNameSpan.textContent = (gameInfo?.name || t('botDetector_unknown'));
                ui.gamePlayersSpan.textContent = best ? best.toLocaleString() : t('botDetector_unknown');
            }
        } else {
            if (gameInfo?.name) ui.gameNameSpan.textContent = gameInfo.name;
            ui.gamePlayersSpan.textContent = (typeof gameInfo?.playing === "number" && gameInfo.playing > 0) ? gameInfo.playing.toLocaleString() : t('botDetector_calculating');
        }

        async function runOnceAndUpdate() {
            ui.subtitle.textContent = t('botDetector_scanningProgress', ['0', String(MAX_TOKENS_TOTAL)]);
            try {
                const result = await performScan((done, total) => {
                    ui.subtitle.textContent = t('botDetector_scanningProgress', [String(done), String(total)]);
                });

                if (!result.success) {
                    const c = loadCache();
                    if (c && c.success) {
                        ui.subtitle.textContent = t('botDetector_cachedFallback', [result.reason]);
                        ui.msg.textContent = c.message || t('botDetector_cachedResults');
                        ui.msg.style.color = c.msgColor || "var(--pb-text)";
                        ui.percent.textContent = formatPercentDisplay(c.botPercentage, c.totalPlayers, c.totalBots);
                        ui.data.textContent = t('botDetector_analyzedCached', [String(c.totalPlayers), String(c.serversCount)]);
                        if (typeof c.totalServerPlayers === "number") ui.gamePlayersSpan.textContent = Math.max(c.totalServerPlayers || 0, (gameInfo?.playing || 0)).toLocaleString();
                    } else {
                        ui.subtitle.textContent = t('botDetector_scanFailed', [result.reason || t('botDetector_unknown')]);
                        ui.msg.textContent = t('botDetector_couldNotGatherData');
                        ui.msg.style.color = "var(--purpura-bd-error)";
                        ui.percent.textContent = "-";
                        ui.data.textContent = t('botDetector_triedScanning', [String(result.serversCount || 0), String(result.imageCount || 0)]);
                        ui.gamePlayersSpan.textContent = (gameInfo?.playing && gameInfo.playing > 0) ? gameInfo.playing.toLocaleString() : t('botDetector_calculating');
                    }
                    return;
                }

                let msg = "";
                let msgColor = "var(--purpura-bd-success)";
                if (result.botPercentage > 20) { msg = "This game has a lot of bots detected."; msgColor = "var(--purpura-bd-error)"; }
                else if (result.botPercentage > 10) { msg = "This game has some bots but mostly real players."; msgColor = "var(--purpura-bd-warning)"; }
                else { msg = "This game seems mostly bot-free."; }

                ui.subtitle.textContent = t('botDetector_lastScan', [new Date(result.time).toLocaleString()]);
                ui.msg.textContent = msg;
                ui.msg.style.color = msgColor;
                ui.percent.textContent = formatPercentDisplay(result.botPercentage, result.totalPlayers, result.totalBots);
                ui.data.textContent = t('botDetector_analyzed', [String(result.totalPlayers), String(result.serversCount)]);

                const apiPlayers = (gameInfo && typeof gameInfo.playing === "number") ? gameInfo.playing : 0;
                const scannedPlayers = (typeof result.totalServerPlayers === "number") ? result.totalServerPlayers : 0;
                const displayPlayers = Math.max(apiPlayers, scannedPlayers) || (apiPlayers || scannedPlayers || "Unknown");

                ui.gameNameSpan.textContent = (gameInfo?.name || t('botDetector_unknown'));
                ui.gamePlayersSpan.textContent = (typeof displayPlayers === "number") ? displayPlayers.toLocaleString() : t('botDetector_unknown');

                saveCache({ ...result, message: msg, msgColor, totalServerPlayers: result.totalServerPlayers, imageUrls: result.imageUrls });

                if (showDatabase && result.imageUrls && result.imageUrls.length > 0) {
                    ui.databaseSection.classList.remove("purpura-hidden");
                }

                flashGreen(ui.card);
            } catch (err) {
                const c = loadCache();
                if (c && c.success) {
                    ui.subtitle.textContent = t('botDetector_cachedError');
                    ui.msg.textContent = c.message || t('botDetector_cachedResults');
                    ui.msg.style.color = c.msgColor || "var(--pb-text)";
                    ui.percent.textContent = formatPercentDisplay(c.botPercentage, c.totalPlayers, c.totalBots);
                    ui.data.textContent = t('botDetector_analyzedCached', [String(c.totalPlayers), String(c.serversCount)]);
                    if (typeof c.totalServerPlayers === "number") ui.gamePlayersSpan.textContent = Math.max(c.totalServerPlayers || 0, (gameInfo?.playing || 0)).toLocaleString();
                } else {
                    ui.subtitle.textContent = t('botDetector_scanError');
                    ui.msg.textContent = t('botDetector_couldNotScan');
                    ui.msg.style.color = "var(--purpura-bd-error)";
                    ui.percent.textContent = "-";
                    ui.data.textContent = t('botDetector_noCachedData');
                    ui.gamePlayersSpan.textContent = (gameInfo?.playing && gameInfo.playing > 0) ? gameInfo.playing.toLocaleString() : t('botDetector_calculating');
                }
            }
        }

        await runOnceAndUpdate();
        intervalId = setInterval(runOnceAndUpdate, REFRESH_MS);

        const storageListener = (changes, namespace) => {
            if (namespace === "sync" && changes["bd"]) {
                const newConfig = window.__PurpuraSettings.get("bd");
                if (newConfig && typeof newConfig === "object") {
                    const newShowDatabase = newConfig.showDatabase === true;
                    const newRoundToWholeNumbers = newConfig.roundToWholeNumbers === true;

                    if (newShowDatabase !== (config.showDatabase === true)) {
                        if (newShowDatabase) {
                            const cached = loadCache();
                            if (cached && cached.success && cached.imageUrls && cached.imageUrls.length > 0) {
                                ui.databaseSection.classList.remove("purpura-hidden");
                            }
                        } else {
                            ui.databaseSection.classList.add("purpura-hidden");
                        }
                        config.showDatabase = newShowDatabase;
                    }

                    if (newRoundToWholeNumbers !== (config.roundToWholeNumbers === true)) {
                        config.roundToWholeNumbers = newRoundToWholeNumbers;
                        const cached = loadCache();
                        if (cached && cached.success) {
                            ui.percent.textContent = formatPercentDisplay(cached.botPercentage, cached.totalPlayers, cached.totalBots);
                        }
                    }
                }
            }
        };

        chrome.storage.onChanged.addListener(storageListener);

        const cleanup = () => {
            try { if (intervalId) clearInterval(intervalId); } catch {}
            try { chrome.storage.onChanged.removeListener(storageListener); } catch {}
            try { if (themeObserver) themeObserver.disconnect(); } catch {}
            try { if (ui && ui.card) ui.card.remove(); } catch {}
            try { const st = document.head.querySelector('style[data-purpura-bot-style="1"]'); if (st) st.remove(); } catch {}
            try { const modal = document.querySelector('.purpura-thumbnail-modal'); if (modal) modal.remove(); } catch {}
            try { if (window.PurpuraBotDetector?.cleanup === cleanup) window.PurpuraBotDetector.cleanup = null; } catch {}
        };

        window.PurpuraBotDetector = window.PurpuraBotDetector || {};
        window.PurpuraBotDetector.cleanup = cleanup;

        return cleanup;
    }

    init().catch(() => {});

    return () => { try { if (window.PurpuraBotDetector?.cleanup) window.PurpuraBotDetector.cleanup(); } catch {} };
}

chrome.storage.sync.get(["bd"], (data) => {
        const config = window.__PurpuraSettings ? window.__PurpuraSettings.get("bd") : data["bd"];
        let enabled = true;
        if (typeof config === "boolean") enabled = config;
        else if (config && typeof config === "object") enabled = config.enabled !== false;
        if (enabled) initBotDetector();
    });

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "sync" && changes["bd"]) {
        const newVal = window.__PurpuraSettings ? window.__PurpuraSettings.get("bd") : changes["bd"].newValue;
        let enabled = false;
        if (typeof newVal === "boolean") enabled = newVal;
        else if (newVal && typeof newVal === "object") enabled = newVal.enabled !== false;
        
        if (enabled) {
            try { if (window.PurpuraBotDetector?.cleanup) window.PurpuraBotDetector.cleanup(); } catch {}
            initBotDetector();
        } else {
            try { if (window.PurpuraBotDetector?.cleanup) window.PurpuraBotDetector.cleanup(); } catch {}
        }
    }
});
