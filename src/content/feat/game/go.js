/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';
    function t(key, substitutions) { return chrome.i18n.getMessage(key, substitutions) || key; }

    let isOutfitsEnabled = true;
    let outfitsTabInjected = false;
    let csrfToken = null;
    let currentTheme = 'dark';
    let themeObserver = null;
    let checkTabsTimer = null;
    let initialized = false;


    async function updateTheme() {
        try {
            const response = await chrome.runtime.sendMessage({ action: "getRobloxTheme" });
            const newTheme = response?.theme || 'dark';
            if (newTheme !== currentTheme) {
                currentTheme = newTheme;
                applyThemeStyles();
            }
        } catch (e) { }
    }

    function applyThemeStyles() {
        var isLight = currentTheme === 'light';

        var styles = isLight ? {
            '--go-bg': '#f5f5f7',
            '--go-surface': '#ffffff',
            '--go-surface-secondary': '#ebebed',
            '--go-border': '#d8d8dc',
            '--go-text': '#111113',
            '--go-text-muted': '#6b6b72',
            '--go-accent': '#7c3aed',
            '--go-accent-hover': '#8b5cf6',
            '--go-success-bg': '#f0fdf4',
            '--go-success-border': '#16a34a',
            '--go-error-bg': '#fef2f2',
            '--go-error-border': '#dc2626',
            '--go-warning-bg': '#fffbeb',
            '--go-warning-border': 'rgba(180, 83, 9, 0.3)',
            '--go-warning-text': '#b45309',
            '--go-shadow': '0 1px 3px rgba(0, 0, 0, 0.06)',
            '--go-shadow-hover': '0 4px 14px rgba(124, 58, 237, 0.15)',
            '--go-scrollbar': '#c8c8cc',
            '--go-no-thumb-text': '#888'
        } : {
            '--go-bg': 'var(--background-color, #232527)',
            '--go-surface': 'var(--background-secondary-color, #393b3d)',
            '--go-surface-secondary': 'rgba(255, 255, 255, 0.03)',
            '--go-border': 'transparent',
            '--go-text': 'var(--text-color, #fff)',
            '--go-text-muted': 'var(--text-secondary-color, #bbb)',
            '--go-accent': '#8b5cf6',
            '--go-accent-hover': '#7c3aed',
            '--go-success-bg': 'rgba(34, 197, 94, 0.1)',
            '--go-success-border': '#22c55e',
            '--go-error-bg': 'rgba(239, 68, 68, 0.1)',
            '--go-error-border': '#ef4444',
            '--go-warning-bg': 'rgba(251, 191, 36, 0.1)',
            '--go-warning-border': 'rgba(251, 191, 36, 0.3)',
            '--go-warning-text': '#fbbf24',
            '--go-shadow': 'none',
            '--go-shadow-hover': '0 4px 12px rgba(139, 92, 246, 0.2)',
            '--go-scrollbar': 'rgba(255, 255, 255, 0.15)',
            '--go-no-thumb-text': '#888'
        };

        let styleTag = document.getElementById('purpura-outfits-theme-vars');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'purpura-outfits-theme-vars';
            document.head.appendChild(styleTag);
        }

        let css = ':root {';
        for (const [prop, val] of Object.entries(styles)) {
            css += `${prop}: ${val};`;
        }
        css += '}';
        styleTag.textContent = css;
    }

    async function setupThemeObserver() {
        if (themeObserver) return;
        
        await updateTheme();
        applyThemeStyles();

        themeObserver = new MutationObserver(() => {
            updateTheme();
        });
        
        const config = { attributes: true, attributeFilter: ['class'] };
        themeObserver.observe(document.documentElement, config);
        if (document.body) themeObserver.observe(document.body, config);
    }


    function isGamePage() {
        return /^\/games\/\d+/.test(window.location.pathname);
    }

    async function getCurrentUserId() {
        try {
            const response = await fetch('https://users.roblox.com/v1/users/authenticated', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                return data.id;
            }
        } catch (e) {
        }
        return null;
    }

    async function getCsrfToken() {
        if (csrfToken) return csrfToken;
        try {
            const meta = document.querySelector('meta[name="csrf-token"]');
            if (meta?.dataset?.token) {
                csrfToken = meta.dataset.token;
                return csrfToken;
            }
            const response = await fetch('https://auth.roblox.com/v1/logout', {
                method: 'POST',
                credentials: 'include'
            });
            if (response.ok || response.status === 403) {
                csrfToken = response.headers.get('x-csrf-token');
            }
            return csrfToken;
        } catch (e) {
            return null;
        }
    }

    async function robloxFetch(url, options) {
        var opts = options || {};
        opts.credentials = 'include';
        if (!opts.headers) opts.headers = {};
        opts.headers['Content-Type'] = 'application/json';
        return fetch(url, opts);
    }

    async function robloxPost(url, body, retries) {
        if (retries === undefined) retries = 3;
        var token = await getCsrfToken();
        var resp = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token || ''
            },
            credentials: 'include',
            body: JSON.stringify(body)
        });
        if (resp.status === 403 && retries > 0) {
            var newToken = resp.headers.get('x-csrf-token');
            if (newToken) {
                csrfToken = newToken;
            }
            await new Promise(function (r) { setTimeout(r, 500); });
            return robloxPost(url, body, retries - 1);
        }
        if (resp.status === 429 && retries > 0) {
            await new Promise(function (r) { setTimeout(r, 1000); });
            return robloxPost(url, body, retries - 1);
        }
        return resp;
    }

    async function fetchOutfits(userId) {
        var outfits = [];
        var cursor = null;
        var retries = 3;

        while (true) {
            var url = 'https://avatar.roblox.com/v2/avatar/users/' + userId + '/outfits?outfitType=1&page=1&itemsPerPage=100&isEditable=true';
            if (cursor) url += '&cursor=' + cursor;

            try {
                var response = await robloxFetch(url);
                if (response.status === 429 && retries > 0) {
                    retries--;
                    await new Promise(function (r) { setTimeout(r, 1000); });
                    continue;
                }
                if (!response.ok) break;
                var result = await response.json();
                if (result.data) outfits = outfits.concat(result.data);
                cursor = result.nextPageCursor;
                if (!cursor) break;
                retries = 3;
            } catch (e) {
                break;
            }
        }

        return outfits;
    }

    var wearOutfitRunning = false;

    // Outfit details is a GET on avatar.roblox.com. Sending it as a POST returns
    // 405/404, which made every equip attempt report "Failed".
    async function fetchOutfitDetails(outfitId) {
        var url = 'https://avatar.roblox.com/v3/outfits/' + outfitId + '/details';
        var retries = 3;
        while (true) {
            try {
                var resp = await fetch(url, { credentials: 'include' });
                if (resp.status === 429 && retries > 0) {
                    retries--;
                    await new Promise(function (r) { setTimeout(r, 1000); });
                    continue;
                }
                return resp;
            } catch (e) {
                if (retries-- > 0) {
                    await new Promise(function (r) { setTimeout(r, 500); });
                    continue;
                }
                throw e;
            }
        }
    }

    async function wearOutfit(outfitId) {
        if (wearOutfitRunning) {
            return { ok: false, error: 'already_wearing' };
        }
        wearOutfitRunning = true;

        try {
            var detailsRes = await fetchOutfitDetails(outfitId);
            if (!detailsRes.ok) {
                var errorText = 'Failed to fetch outfit details';
                try { var errBody = await detailsRes.json(); if (errBody && errBody.message) errorText = errBody.message; } catch (e) {}
                return { ok: false, error: errorText };
            }

            var details = await detailsRes.json();
            var results = [];

            if (details.scale) {
                var r = await robloxPost('https://avatar.roblox.com/v1/avatar/set-scales', details.scale);
                results.push(r.ok);
            }

            // v2/v3 outfit details expose body colors as `bodyColor3s`.
            var bodyColors = details.bodyColor3s || details.bodyColors;
            if (bodyColors) {
                var bcUrl = bodyColors.brickColorId !== undefined ? 'https://avatar.roblox.com/v1/avatar/set-body-colors' : 'https://avatar.roblox.com/v2/avatar/set-body-colors';
                var r = await robloxPost(bcUrl, bodyColors);
                results.push(r.ok);
            }

            if (details.playerAvatarType) {
                var r = await robloxPost('https://avatar.roblox.com/v1/avatar/set-player-avatar-type', { playerAvatarType: details.playerAvatarType });
                results.push(r.ok);
            }

            if (details.assets && details.assets.length > 0) {
                var r = await robloxPost('https://avatar.roblox.com/v2/avatar/set-wearing-assets', { assets: details.assets });
                results.push(r.ok);
                if (!r.ok) {
                    var assetIds = details.assets.map(function (a) { return typeof a === 'object' ? a.id : a; });
                    var r2 = await robloxPost('https://avatar.roblox.com/v2/avatar/set-wearing-assets', { assets: assetIds });
                    results.push(r2.ok);
                }
            }

            return { ok: results.length === 0 || results.every(function (v) { return v; }) };
        } catch (e) {
            return { ok: false, error: e.message };
        } finally {
            wearOutfitRunning = false;
        }
    }

    function injectStyles() {
        if (document.getElementById('purpura-outfits-styles')) return;

        const style = document.createElement('style');
        style.id = 'purpura-outfits-styles';
        style.textContent = `
            #horizontal-tabs {
                display: flex !important;
                flex-wrap: nowrap !important;
                width: 100% !important;
            }
            
            #horizontal-tabs .rbx-tab {
                flex: 1 1 auto !important;
                min-width: 0 !important;
            }
            
            #horizontal-tabs .rbx-tab-heading {
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                padding: 10px 8px !important;
            }
            
            .purpura-outfits-tab {
                position: relative;
            }
            
            .purpura-outfits-panel {
                display: none;
                padding: 20px;
                background: var(--go-bg);
                border: 1px solid var(--go-border);
                border-radius: 8px;
                margin-top: 12px;
            }
            
            .purpura-outfits-panel.active {
                display: block;
            }
            
            .purpura-outfits-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }
            
            .purpura-outfits-title {
                font-size: 18px;
                font-weight: 600;
                color: var(--go-text);
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .purpura-outfits-count {
                font-size: 13px;
                color: var(--go-text-muted);
                font-weight: 400;
            }
            
            .purpura-outfits-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                gap: 12px;
            }
            
            .purpura-outfit-card {
                background: var(--go-surface);
                border-radius: 8px;
                padding: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                border: 2px solid var(--go-border);
                text-align: center;
                box-shadow: var(--go-shadow);
            }
            
            .purpura-outfit-card:hover {
                border-color: var(--go-accent);
                transform: translateY(-2px);
                box-shadow: var(--go-shadow-hover);
                background: var(--go-surface-secondary);
            }
            
            .purpura-outfit-card.equipping {
                opacity: 0.7;
                pointer-events: none;
            }
            
            .purpura-outfit-card.success {
                border-color: var(--go-success-border);
                background: var(--go-success-bg);
            }
            
            .purpura-outfit-card.error {
                border-color: var(--go-error-border);
                background: var(--go-error-bg);
            }
            
            .purpura-outfit-thumbnail {
                width: 100%;
                aspect-ratio: 1;
                border-radius: 6px;
                background: var(--go-surface-secondary);
                margin-bottom: 8px;
                overflow: hidden;
            }
            
            .purpura-outfit-thumbnail img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .purpura-outfit-name {
                font-size: 12px;
                font-weight: 500;
                color: var(--go-text);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .purpura-outfit-status {
                font-size: 11px;
                margin-top: 4px;
                color: var(--go-text-muted);
            }
            
            .purpura-outfits-empty {
                text-align: center;
                padding: 40px 20px;
                color: var(--go-text-muted);
            }
            
            .purpura-outfits-empty-text {
                font-size: 14px;
                margin-bottom: 8px;
            }
            
            .purpura-outfits-empty-subtext {
                font-size: 12px;
                opacity: 0.7;
            }
            
            .purpura-outfits-loading {
                text-align: center;
                padding: 40px 20px;
                color: var(--go-text-muted);
            }
            
            .purpura-outfits-loading-spinner {
                width: 32px;
                height: 32px;
                border: 3px solid var(--go-surface-secondary);
                border-top-color: var(--go-accent);
                border-radius: 50%;
                animation: purpura-spin 0.8s linear infinite;
                margin: 0 auto 12px;
            }
            
            @keyframes purpura-spin {
                to { transform: rotate(360deg); }
            }
            
            .purpura-outfits-refresh {
                background: linear-gradient(135deg, var(--go-accent) 0%, var(--go-accent-hover) 100%);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .purpura-outfits-refresh:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px var(--go-shadow-hover);
            }
            
            .purpura-outfits-refresh:active {
                transform: translateY(0);
            }
            
            .purpura-outfits-rate-limited {
                text-align: center;
                padding: 40px 20px;
                background: var(--go-error-bg);
                border: 2px solid var(--go-error-border);
                border-radius: 8px;
            }
            
            .purpura-outfits-rate-limited-title {
                font-size: 16px;
                font-weight: 600;
                color: var(--go-error-border);
                margin-bottom: 8px;
            }
            
            .purpura-outfits-rate-limited-text {
                font-size: 13px;
                color: var(--go-text-muted);
                margin-bottom: 16px;
            }
            
            .purpura-outfits-retry-btn {
                background: linear-gradient(135deg, var(--go-error-border) 0%, var(--go-error-border) 100%);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .purpura-outfits-retry-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
            }
            
            .purpura-outfit-card.no-thumbnail .purpura-outfit-thumbnail {
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--go-surface-secondary);
            }
            
            .purpura-outfits-warning {
                background: var(--go-warning-bg);
                border: 1px solid var(--go-warning-border);
                border-radius: 6px;
                padding: 10px 14px;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 12px;
                color: var(--go-warning-text);
            }
            
        `;
        document.head.appendChild(style);
    }

    function createOutfitsPanel() {
        const panel = document.createElement('div');
        panel.id = 'purpura-outfits-panel';
        panel.className = 'purpura-outfits-panel';

        panel.innerHTML = `
            <div class="purpura-outfits-header">
                <div class="purpura-outfits-title">
                    ${t('gameOutfits_outfits')}
                    <span class="purpura-outfits-count"></span>
                </div>
                <button class="purpura-outfits-refresh" id="purpura-refresh-outfits" title="Try to avoid doing this too much, may cause heavy rate limiting.">
                    Refresh
                </button>
            </div>
            <div class="purpura-outfits-content">
                <div class="purpura-outfits-loading">
                    <div class="purpura-outfits-loading-spinner"></div>
                    <div>${t('gameOutfits_loading')}</div>
                </div>
            </div>
        `;

        return panel;
    }

    async function fetchOutfitThumbnailsBatch(outfitIds) {
        const thumbnailMap = {};
        let wasRateLimited = false;

        for (let i = 0; i < outfitIds.length; i += 100) {
            const batch = outfitIds.slice(i, i + 100);
            const idsParam = batch.join(',');
            let retries = 3;
            let success = false;

            while (retries > 0 && !success) {
                try {
                    const response = await robloxFetch(`https://thumbnails.roblox.com/v1/users/outfits?userOutfitIds=${idsParam}&size=150x150&format=Png&isCircular=false`);

                    if (response.status === 429) {
                        retries--;
                        if (retries > 0) {
                            await new Promise(r => setTimeout(r, 1000));
                            continue;
                        }
                        wasRateLimited = true;
                        break;
                    }

                    if (response.ok) {
                        const data = await response.json();
                        if (data.data) {
                            data.data.forEach(item => {
                                if (item.imageUrl) {
                                    thumbnailMap[item.targetId] = item.imageUrl;
                                }
                            });
                        }
                        success = true;
                    } else {
                        success = true;
                    }
                } catch (e) {
                    retries--;
                    if (retries > 0) {
                        await new Promise(r => setTimeout(r, 1000));
                        continue;
                    }
                    wasRateLimited = true;
                    break;
                }
            }

            if (i + 100 < outfitIds.length) {
                await new Promise(r => setTimeout(r, 200));
            }
        }

        return { thumbnailMap, wasRateLimited };
    }

    function showRateLimitError(container, onRetry) {
        const contentDiv = container.querySelector('.purpura-outfits-content');
        contentDiv.innerHTML = `
            <div class="purpura-outfits-rate-limited">
                <div class="purpura-outfits-rate-limited-title">Rate Limited by Roblox</div>
                <div class="purpura-outfits-rate-limited-text">
                    You've made too many requests. Please wait a moment before trying again.<br>
                    This is a Roblox API limitation, not a Purpura issue.
                </div>
                <button class="purpura-outfits-retry-btn">Try Again</button>
            </div>
        `;

        contentDiv.querySelector('.purpura-outfits-retry-btn').addEventListener('click', () => {
            contentDiv.innerHTML = `
                <div class="purpura-outfits-loading">
                    <div class="purpura-outfits-loading-spinner"></div>
                    <div>Loading outfits...</div>
                </div>
            `;
            onRetry();
        });
    }

    async function renderOutfits(outfits, container, onRetry) {
        const contentDiv = container.querySelector('.purpura-outfits-content');
        const countSpan = container.querySelector('.purpura-outfits-count');

        countSpan.textContent = `(${outfits.length})`;

        if (outfits.length === 0) {
            contentDiv.innerHTML = `
                <div class="purpura-outfits-empty">
                    <div class="purpura-outfits-empty-text">No outfits found</div>
                    <div class="purpura-outfits-empty-subtext">Create outfits in the Avatar Editor to see them here</div>
                </div>
            `;
            return;
        }

        const outfitIds = outfits.map(o => o.id);
        const { thumbnailMap, wasRateLimited } = await fetchOutfitThumbnailsBatch(outfitIds);

        const grid = document.createElement('div');
        grid.className = 'purpura-outfits-grid';

        let warningHtml = '';
        if (wasRateLimited) {
            warningHtml = `
                <div class="purpura-outfits-warning">
                    <span>Thumbnails unavailable due to rate limiting. Outfits still work!</span>
                </div>
            `;
        }

        outfits.forEach(outfit => {
            const card = document.createElement('div');
            card.className = 'purpura-outfit-card';
            card.dataset.outfitId = outfit.id;

            const hasThumbnail = thumbnailMap[outfit.id];
            if (!hasThumbnail) {
                card.classList.add('no-thumbnail');
            }

            if (hasThumbnail) {
                card.innerHTML = `
                    <div class="purpura-outfit-thumbnail">
                        <img src="${thumbnailMap[outfit.id]}" alt="${outfit.name}">
                    </div>
                    <div class="purpura-outfit-name" title="${outfit.name}">${outfit.name}</div>
                    <div class="purpura-outfit-status">Click to equip</div>
                `;
            } else {
                card.innerHTML = `
                    <div class="purpura-outfit-thumbnail">
                        <div style="font-size: 14px; color: var(--go-no-thumb-text); font-weight: 500;">No Image</div>
                    </div>
                    <div class="purpura-outfit-name" title="${outfit.name}">${outfit.name}</div>
                    <div class="purpura-outfit-status">Click to equip</div>
                `;
            }

            card.addEventListener('click', async () => {
                if (card.classList.contains('equipping')) return;

                card.classList.add('equipping');
                card.querySelector('.purpura-outfit-status').textContent = 'Equipping...';

                const result = await wearOutfit(outfit.id);

                card.classList.remove('equipping');

                if (result.ok) {
                    card.classList.add('success');
                    card.querySelector('.purpura-outfit-status').textContent = t('gameOutfits_equipped');
                    setTimeout(() => {
                        card.classList.remove('success');
                        card.querySelector('.purpura-outfit-status').textContent = 'Click to equip';
                    }, 2000);
                } else {
                    card.classList.add('error');
                    card.querySelector('.purpura-outfit-status').textContent = t('gameOutfits_failed');
                    setTimeout(() => {
                        card.classList.remove('error');
                        card.querySelector('.purpura-outfit-status').textContent = 'Click to equip';
                    }, 2000);
                }
            });

            grid.appendChild(card);
        });

        contentDiv.innerHTML = warningHtml;
        contentDiv.appendChild(grid);
    }

    async function loadOutfits(panel) {
        const retryFn = () => loadOutfits(panel);

        const userId = await getCurrentUserId();
        if (!userId) {
            const contentDiv = panel.querySelector('.purpura-outfits-content');
            contentDiv.innerHTML = `
                <div class="purpura-outfits-empty">
                    <div class="purpura-outfits-empty-text">Please log in</div>
                    <div class="purpura-outfits-empty-subtext">You need to be logged in to view your outfits</div>
                </div>
            `;
            return;
        }

        const outfits = await fetchOutfits(userId);
        await renderOutfits(outfits, panel, retryFn);
    }

    function injectOutfitsTab() {
        if (outfitsTabInjected) return;

        const tabList = document.querySelector('#horizontal-tabs');
        if (!tabList) return;


        if (document.getElementById('tab-purpura-outfits')) {
            outfitsTabInjected = true;
            return;
        }

        injectStyles();

        const tab = document.createElement('li');
        tab.id = 'tab-purpura-outfits';
        tab.className = 'rbx-tab purpura-outfits-tab';
        tab.innerHTML = `
            <a class="rbx-tab-heading" href="#purpura-outfits">
                <span class="text-lead">${t('gameOutfits_outfits')}</span>
            </a>
        `;

        const serversTab = document.getElementById('tab-game-instances');
        if (serversTab) {
            serversTab.after(tab);
        } else {
            tabList.appendChild(tab);
        }

        const panel = createOutfitsPanel();

        const tabContent = document.querySelector('.tab-content') || document.querySelector('.rbx-tabs-content');
        if (tabContent) {
            tabContent.appendChild(panel);
        } else {
            const gameContainer = tabList.closest('.game-about-container') || tabList.parentElement;
            if (gameContainer) {
                gameContainer.appendChild(panel);
            }
        }

        tab.addEventListener('click', (e) => {
            e.preventDefault();

            tabList.querySelectorAll('.rbx-tab').forEach(t => t.classList.remove('active'));

            document.querySelectorAll('.tab-pane, .purpura-outfits-panel').forEach(p => {
                p.classList.remove('active', 'in');
            });

            tab.classList.add('active');
            panel.classList.add('active');

            if (!panel.dataset.loaded) {
                panel.dataset.loaded = 'true';
                loadOutfits(panel);
            }
        });

        tabList.querySelectorAll('.rbx-tab:not(#tab-purpura-outfits)').forEach(otherTab => {
            otherTab.addEventListener('click', () => {
                tab.classList.remove('active');
                panel.classList.remove('active');
            });
        });

        panel.querySelector('#purpura-refresh-outfits').addEventListener('click', () => {
            panel.querySelector('.purpura-outfits-content').innerHTML = `
                <div class="purpura-outfits-loading">
                    <div class="purpura-outfits-loading-spinner"></div>
                    <div>Loading outfits...</div>
                </div>
            `;
            loadOutfits(panel);
        });

        outfitsTabInjected = true;
    }

    function removeOutfitsTab() {
        const tab = document.getElementById('tab-purpura-outfits');
        const panel = document.getElementById('purpura-outfits-panel');
        const styles = document.getElementById('purpura-outfits-styles');

        if (tab) tab.remove();
        if (panel) panel.remove();
        if (styles) styles.remove();

        outfitsTabInjected = false;
    }



    function checkAndInitialize() {
        if (initialized) return;
        if (!isGamePage() || !isOutfitsEnabled) return;

        initialized = true;

        const checkTabs = setInterval(() => {
            const tabList = document.querySelector('#horizontal-tabs');
            if (tabList) {
                clearInterval(checkTabs);
                injectOutfitsTab();
            }
        }, 500);

        setTimeout(() => clearInterval(checkTabs), 10000);

        setupThemeObserver();
    }

    function resetInitialization() {
        initialized = false;
        removeOutfitsTab();
    }

    chrome.storage.sync.get(['go'], (result) => {
        const settings = window.__PurpuraSettings ? window.__PurpuraSettings.get('go') : result['go'];
        if (typeof settings === 'object') {
            isOutfitsEnabled = settings.enabled !== undefined ? settings.enabled : true;
        } else {
            isOutfitsEnabled = settings !== undefined ? settings : true;
        }

        if (isOutfitsEnabled && isGamePage()) {
            checkAndInitialize();
        }
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace !== 'sync' || !changes['go']) return;
        const newSettings = window.__PurpuraSettings ? window.__PurpuraSettings.get('go') : changes['go'].newValue;

        if (typeof newSettings === 'object') {
            isOutfitsEnabled = newSettings.enabled !== undefined ? newSettings.enabled : true;
        } else {
            isOutfitsEnabled = newSettings;
        }

        resetInitialization();

        if (isOutfitsEnabled && isGamePage()) {
            checkAndInitialize();
        }
    });

    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            outfitsTabInjected = false;
            setTimeout(() => {
                checkAndInitialize();
            }, 1000);
        }
    }).observe(document, { subtree: true, childList: true });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndInitialize);
    } else {
        checkAndInitialize();
    }
})();
