/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
    'use strict';

    if (window.purpuraAvatarSearchInitialized) return;
    window.purpuraAvatarSearchInitialized = true;

    let config = { enabled: true, filters: true };
    let observer = null;
    let urlCheckInterval = null;

    let itemDataCache = new Map();
    let domMetadata = new WeakMap();
    let selectedFilters = new Set();
    let priceFilter = { min: { active: false, value: null }, max: { active: false, value: null } };
    let availabilityFilter = 'all';
    let creatorFilter = { active: false, name: '' };
    let activeCategoryKey = '';
    let scanSessionId = 0;
    let domUpdateFrame = null;
    let scanQueue = new Set();
    let scanQueueTimer = null;
    let activeObservers = [];
    let ensureUITimer = null;
    let observedLists = new WeakSet();
    let filterUpdatePending = false;
    let docClickHandler = null;

    const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

    function ensureAsStyles() {
        if (document.getElementById('purpura-as-vars')) return;
        var s = document.createElement('style');
        s.id = 'purpura-as-vars';
        s.textContent = ':root{' +
            '--purpura-as-accent:#9b6dff;' +
            '--purpura-as-accent-light:#b89dff;' +
            '--purpura-as-accent-hover:#8a5cef;' +
            '--purpura-as-accent-bg:rgba(155,109,255,0.12);' +
            '--purpura-as-accent-glow:rgba(155,109,255,0.15);' +
            '--purpura-as-accent-border:rgba(155,109,255,0.4);' +
            '--purpura-as-surface-1:#1a1b1f;' +
            '--purpura-as-surface-2:#25262a;' +
            '--purpura-as-text:#f0f0f0;' +
            '--purpura-as-text-muted:#999;' +
            '--purpura-as-stroke:rgba(255,255,255,0.1);' +
            '--purpura-as-stroke-light:rgba(255,255,255,0.08);' +
            '--purpura-as-stroke-lighter:rgba(255,255,255,0.07);' +
            '--purpura-as-toggle-knob:#fff;' +
            '--purpura-as-toggle-knob-shadow:rgba(0,0,0,0.3);' +
            '--purpura-as-dropdown-shadow:rgba(0,0,0,0.5);' +
            '--purpura-as-toggle-bg:#2a2b36;' +
            '--purpura-as-placeholder:#888;' +
            '--purpura-as-btn-text:#fff;' +
            '--purpura-as-loading-bg:rgba(0,0,0,0.8);' +
            '--purpura-as-loading-text:white}';
        document.head.appendChild(s);
    }

    function parseAsConfig(value) {
        if (typeof value === 'boolean') return { enabled: value, filters: true };
        if (value && typeof value === 'object') return {
            enabled: value.enabled !== false,
            filters: value.filters !== false
        };
        return { enabled: true, filters: true };
    }

    function injectStyles() {
        ensureAsStyles();
        if (document.getElementById('purpura-avatar-fx-styles')) return;
        const style = document.createElement('style');
        style.id = 'purpura-avatar-fx-styles';
        style.textContent = `
            .purpura-fx-hidden { display: none !important; }
            .purpura-filtering-enabled .list-item { display: none; }
            .purpura-filtering-enabled .list-item.purpura-show { display: inline-block !important; vertical-align: top; }
            #purpura-fx-container { position: relative; margin: 12px 0; z-index: auto; display: flex; align-items: center; gap: 10px; flex-wrap: nowrap; }
            #purpura-fx-toggle-btn {
                display: inline-flex; align-items: center; gap: 6px;
                padding: 7px 14px; background: var(--purpura-as-surface-1);
                border: 1px solid var(--purpura-as-stroke);
                border-radius: 6px; color: var(--purpura-as-text);
                font-size: 13px; cursor: pointer; transition: border-color 0.2s, background 0.2s;
                white-space: nowrap; font-family: inherit;
            }
            #purpura-fx-toggle-btn:hover { border-color: var(--purpura-as-accent-border); background: var(--purpura-as-surface-2); }
            #purpura-fx-toggle-btn.filter-applied { border-color: var(--purpura-as-accent); background: var(--purpura-as-accent-bg); color: var(--purpura-as-accent-light); }
            #purpura-fx-toggle-btn .purpura-fx-chevron { font-size: 10px; transition: transform 0.2s; opacity: 0.6; }
            #purpura-fx-toggle-btn[data-state="open"] .purpura-fx-chevron { transform: rotate(180deg); }
            #purpura-fx-dropdown {
                position: absolute; top: calc(100% + 4px); left: 0; min-width: 340px;
                background: var(--purpura-as-surface-2);
                border: 1px solid var(--purpura-as-stroke);
                border-radius: 10px; z-index: 10010;
                box-shadow: 0 12px 32px var(--purpura-as-dropdown-shadow);
                display: none; overflow: hidden;
            }
            #purpura-fx-dropdown[data-state="open"] { display: block; }
            .purpura-fx-dropdown-header {
                padding: 14px 18px; display: flex; align-items: center; justify-content: space-between;
                border-bottom: 1px solid var(--purpura-as-stroke-light);
            }
            .purpura-fx-dropdown-header h3 { margin: 0; font-size: 15px; font-weight: 600; color: var(--purpura-as-text); }
            .purpura-fx-close-btn {
                background: none; border: none; color: var(--purpura-as-text-muted);
                cursor: pointer; font-size: 18px; padding: 2px 6px; border-radius: 4px; line-height: 1;
            }
            .purpura-fx-close-btn:hover { background: var(--purpura-as-stroke-light); color: var(--purpura-as-text); }
            .purpura-fx-options { padding: 14px 18px; display: flex; flex-direction: column; gap: 12px; max-height: 60vh; overflow-y: auto; }
            .purpura-fx-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
            .purpura-fx-row > label { font-size: 13px; color: var(--purpura-as-text); flex-shrink: 0; font-weight: 500; }
            .purpura-fx-input {
                background: var(--purpura-as-surface-1); border: 1px solid var(--purpura-as-stroke);
                border-radius: 6px; padding: 6px 10px; color: var(--purpura-as-text);
                font-size: 13px; width: 160px; transition: border-color 0.2s; font-family: inherit;
            }
            .purpura-fx-input:focus { outline: none; border-color: var(--purpura-as-accent); box-shadow: 0 0 0 2px var(--purpura-as-accent-glow); }
            .purpura-fx-input[type="number"] { width: 100px; }
            .purpura-fx-select {
                background: var(--purpura-as-surface-1); border: 1px solid var(--purpura-as-stroke);
                border-radius: 6px; padding: 6px 10px; color: var(--purpura-as-text);
                font-size: 13px; cursor: pointer; font-family: inherit; width: 160px;
            }
            .purpura-fx-select:focus { outline: none; border-color: var(--purpura-as-accent); }
            .purpura-fx-toggle {
                position: relative; width: 36px; height: 20px; flex-shrink: 0;
                background: var(--purpura-as-toggle-bg); border-radius: 99px;
                cursor: pointer; transition: background 0.25s; border: 1px solid var(--purpura-as-stroke-lighter);
            }
            .purpura-fx-toggle::before {
                content: ''; position: absolute; left: 3px; top: 2px;
                width: 14px; height: 14px; border-radius: 50%; background: var(--purpura-as-toggle-knob);
                transition: transform 0.3s cubic-bezier(0.34, 1.3, 0.64, 1);
                box-shadow: 0 1px 3px var(--purpura-as-toggle-knob-shadow);
            }
            .purpura-fx-toggle[data-checked="true"] { background: var(--purpura-as-accent); border-color: transparent; }
            .purpura-fx-toggle[data-checked="true"]::before { transform: translateX(16px); }
            .purpura-fx-apply-btn {
                margin-top: 4px; padding: 9px 16px; width: 100%;
                background: var(--purpura-as-accent); color: var(--purpura-as-btn-text); border: none; border-radius: 6px;
                font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s; font-family: inherit;
            }
            .purpura-fx-apply-btn:hover { background: var(--purpura-as-accent-hover); }
            .purpura-fx-apply-btn:active { transform: scale(0.98); }
            #purpura-fx-search-bar {
                flex-grow: 1; width: auto; margin: 0;
                background: var(--purpura-as-surface-1); border: 1px solid var(--purpura-as-stroke);
                border-radius: 6px; padding: 7px 12px; color: var(--purpura-as-text);
                font-size: 13px; font-family: inherit; transition: border-color 0.2s;
            }
            #purpura-fx-search-bar:focus { outline: none; border-color: var(--purpura-as-accent); box-shadow: 0 0 0 2px var(--purpura-as-accent-glow); }
            #purpura-fx-search-bar::placeholder { color: var(--purpura-as-placeholder); }
            #purpura-filter-loading {
                position: absolute; top: 60px; right: 20px;
                background: var(--purpura-as-loading-bg); color: var(--purpura-as-loading-text);
                padding: 5px 12px; border-radius: 6px; z-index: 2000;
                font-size: 12px; pointer-events: none; font-family: inherit;
            }
        `;
        document.head.appendChild(style);
    }

    function createFilterRow(rowConfig) {
        const row = document.createElement('div');
        row.className = 'purpura-fx-row';

        const label = document.createElement('label');
        label.textContent = rowConfig.label;
        row.appendChild(label);

        let inputControl;

        switch (rowConfig.type) {
            case 'text':
            case 'number': {
                const input = document.createElement('input');
                input.id = rowConfig.id;
                input.type = rowConfig.type;
                input.className = 'purpura-fx-input';
                input.placeholder = rowConfig.placeholder || '';
                if (rowConfig.min !== undefined) input.min = rowConfig.min;
                if (rowConfig.type === 'number') {
                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'e' || e.key === 'E') e.preventDefault();
                    });
                }
                inputControl = input;
                break;
            }
            case 'select': {
                const select = document.createElement('select');
                select.id = rowConfig.id;
                select.className = 'purpura-fx-select';
                rowConfig.options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt.value;
                    option.textContent = opt.label;
                    select.appendChild(option);
                });
                if (rowConfig.initialValue) select.value = rowConfig.initialValue;
                inputControl = select;
                break;
            }
            case 'toggle': {
                const toggle = document.createElement('div');
                toggle.className = 'purpura-fx-toggle';
                toggle.id = rowConfig.id;
                toggle.setAttribute('data-checked', 'false');
                toggle.setAttribute('role', 'checkbox');
                toggle.setAttribute('aria-checked', 'false');
                toggle.addEventListener('click', () => {
                    const checked = toggle.getAttribute('data-checked') === 'true';
                    toggle.setAttribute('data-checked', String(!checked));
                    toggle.setAttribute('aria-checked', String(!checked));
                });
                inputControl = toggle;
                break;
            }
        }

        if (inputControl) row.appendChild(inputControl);
        return row;
    }

    function createFilterUIContainer(showFilters, showSearch) {
        injectStyles();

        const container = document.createElement('div');
        container.id = 'purpura-fx-container';

        if (showFilters) {
            const buttonWrapper = document.createElement('div');
            buttonWrapper.style.position = 'relative';
            buttonWrapper.style.flexShrink = '0';

            const toggleButton = document.createElement('button');
            toggleButton.id = 'purpura-fx-toggle-btn';
            toggleButton.type = 'button';
            toggleButton.setAttribute('data-state', 'closed');

            const btnLabel = document.createElement('span');
            btnLabel.textContent = 'Filter Items';
            toggleButton.appendChild(btnLabel);

            const chevron = document.createElement('span');
            chevron.className = 'purpura-fx-chevron';
            chevron.textContent = '\u25BC';
            toggleButton.appendChild(chevron);

            const dropdown = document.createElement('div');
            dropdown.id = 'purpura-fx-dropdown';
            dropdown.setAttribute('data-state', 'closed');
            dropdown.addEventListener('click', (e) => e.stopPropagation());

            const header = document.createElement('div');
            header.className = 'purpura-fx-dropdown-header';

            const title = document.createElement('h3');
            title.textContent = 'Filter Items';
            header.appendChild(title);

            const closeBtn = document.createElement('button');
            closeBtn.className = 'purpura-fx-close-btn';
            closeBtn.innerHTML = '&times;';
            closeBtn.addEventListener('click', () => {
                dropdown.setAttribute('data-state', 'closed');
                toggleButton.setAttribute('data-state', 'closed');
                toggleButton.classList.remove('filter-button-active');
            });
            header.appendChild(closeBtn);

            dropdown.appendChild(header);

            const options = document.createElement('div');
            options.className = 'purpura-fx-options';

            const filterConfigs = [
                { id: 'purpura-creator-name', type: 'text', label: 'Creator Name', placeholder: 'Creator name...' },
                { id: 'purpura-min-price', type: 'number', label: 'Min Price', min: 0, placeholder: '0' },
                { id: 'purpura-max-price', type: 'number', label: 'Max Price', min: 0, placeholder: '\u221E' },
                { id: 'purpura-availability', type: 'select', label: 'Availability', initialValue: 'all',
                  options: [
                    { value: 'all', label: 'Show All' },
                    { value: 'onsale', label: 'Onsale Only' },
                    { value: 'offsale', label: 'Offsale Only' }
                  ]
                },
                { id: 'purpura-filter-itemsWithEffects', type: 'toggle', label: 'Effects' },
                { id: 'purpura-filter-limited', type: 'toggle', label: 'Limiteds' }
            ];

            filterConfigs.forEach(cfg => {
                const row = createFilterRow(cfg);
                if (row) options.appendChild(row);
            });

            const applyBtn = document.createElement('button');
            applyBtn.className = 'purpura-fx-apply-btn';
            applyBtn.textContent = 'Apply Filter';
            applyBtn.addEventListener('click', async () => {
                await applyAllFilters();
                dropdown.setAttribute('data-state', 'closed');
                toggleButton.setAttribute('data-state', 'closed');
                toggleButton.classList.remove('filter-button-active');
            });
            options.appendChild(applyBtn);

            dropdown.appendChild(options);

            buttonWrapper.appendChild(toggleButton);
            buttonWrapper.appendChild(dropdown);
            container.appendChild(buttonWrapper);

            toggleButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = dropdown.getAttribute('data-state') === 'open';
                dropdown.setAttribute('data-state', isOpen ? 'closed' : 'open');
                toggleButton.setAttribute('data-state', isOpen ? 'closed' : 'open');
                toggleButton.classList.toggle('filter-button-active', !isOpen);
            });

            docClickHandler = (e) => {
                if (!container.contains(e.target) && dropdown.getAttribute('data-state') === 'open') {
                    dropdown.setAttribute('data-state', 'closed');
                    toggleButton.setAttribute('data-state', 'closed');
                    toggleButton.classList.remove('filter-button-active');
                }
            };
            document.addEventListener('click', docClickHandler);
        }

        if (showSearch) {
            const searchInput = document.createElement('input');
            searchInput.id = 'purpura-fx-search-bar';
            searchInput.type = 'text';
            searchInput.placeholder = 'Search items...';
            searchInput.addEventListener('input', () => triggerDomUpdate());
            container.appendChild(searchInput);
        }

        return container;
    }

    function isElementVisible(el) {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    }

    function getAvatarRoot() {
        return document.getElementById('avatar-react-container') || document.body;
    }

    function getActiveAvatarPane() {
        const activePane = document.querySelector('.tab-pane.active');
        if (activePane && activePane.querySelector('ul.item-cards-stackable, li.list-item'))
            return activePane;
        const avatarRoot = getAvatarRoot();
        const visibleList = Array.from(avatarRoot.querySelectorAll('ul.item-cards-stackable'))
            .find(list => isElementVisible(list) && !list.closest('#purpura-fx-container'));
        return visibleList ? visibleList.closest('.tab-pane, [role="tabpanel"], [data-testid*="tab"]') ||
               visibleList.parentElement : activePane || null;
    }

    function getActiveAvatarList(pane) {
        pane = pane || getActiveAvatarPane();
        if (!pane) return null;
        return Array.from(pane.querySelectorAll('ul.item-cards-stackable'))
            .find(list => isElementVisible(list) && !list.closest('#purpura-fx-container')) ||
            pane.querySelector('ul.item-cards-stackable') || null;
    }

    function getActiveCategoryKeyStr(pane) {
        pane = pane || getActiveAvatarPane();
        return window.location.hash || (pane && pane.id) ||
               (pane && pane.getAttribute('aria-labelledby')) ||
               (pane && pane.dataset && pane.dataset.category) || '';
    }

    function getAssetIdFromCard(card) {
        const thumbEl = card.querySelector('[data-thumbnail-target-id]');
        const directId = (thumbEl && thumbEl.getAttribute('data-thumbnail-target-id')) ||
                         card.getAttribute('data-item-id') ||
                         (card.dataset && card.dataset.itemId) ||
                         (card.dataset && card.dataset.assetId);
        const parsed = parseInt(directId, 10);
        if (parsed) return parsed;
        const linkEl = card.querySelector('a[href*="/catalog/"], a[href*="/library/"]');
        const match = linkEl && linkEl.href && linkEl.href.match(/\/(?:catalog|library)\/(\d+)/);
        return match ? parseInt(match[1], 10) : null;
    }

    function getAssetTypeFromCard(card) {
        const thumbEl = card.querySelector('[data-thumbnail-type]');
        return (thumbEl && thumbEl.getAttribute('data-thumbnail-type')) || 'Asset';
    }

    function getCardName(card) {
        const nameEl = card.querySelector('[data-item-name], .item-card-name, .item-card-thumb-container, a[href*="/catalog/"]');
        return (nameEl && ((nameEl.dataset && nameEl.dataset.itemName) ||
               nameEl.getAttribute('data-item-name') || nameEl.textContent)) || '';
    }

    let csrfToken = null;

    // Roblox rejects API POSTs that are missing a valid X-CSRF-TOKEN, and the
    // legacy XSRF-TOKEN cookie is no longer kept in sync. The page meta tag is the
    // reliable source, with a logout probe as the fallback (same flow the other
    // Purpura features use).
    async function getCsrfToken() {
        if (csrfToken) return csrfToken;

        try {
            const meta = document.querySelector('meta[name="csrf-token"], meta[name="x-csrf-token"]');
            const metaToken = meta && (meta.dataset.token || meta.getAttribute('content'));
            if (metaToken) {
                csrfToken = metaToken;
                return csrfToken;
            }
        } catch (e) {}

        try {
            const response = await fetch('https://auth.roblox.com/v1/logout', {
                method: 'POST',
                credentials: 'include'
            });
            if (response.ok || response.status === 403) {
                csrfToken = response.headers.get('x-csrf-token') || csrfToken;
            }
        } catch (e) {}

        return csrfToken || '';
    }

    // POSTs JSON with the CSRF token and retries once with a refreshed token when
    // Roblox reports an expired one. Without this the catalog lookups silently
    // failed, which left every card filtering out and the list looking stuck.
    async function postJson(url, body) {
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': await getCsrfToken()
                    },
                    credentials: 'include',
                    body: JSON.stringify(body)
                });
                if (response.status === 403) {
                    const fresh = response.headers.get('x-csrf-token');
                    if (fresh && fresh !== csrfToken) {
                        csrfToken = fresh;
                        continue;
                    }
                }
                return response;
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    async function fetchCatalogDetails(itemIds) {
        if (!itemIds.length) return;
        const batchSize = 50;
        for (let i = 0; i < itemIds.length; i += batchSize) {
            const chunk = itemIds.slice(i, i + batchSize);
            const items = chunk.map(id => ({ id: id, itemType: 'Asset' }));
            try {
                const response = await postJson('https://catalog.roblox.com/v1/catalog/items/details', { items: items });
                if (!response || !response.ok) continue;
                const data = await response.json();
                if (data && data.data) {
                    data.data.forEach(item => {
                        const entry = itemDataCache.get(item.id);
                        if (entry) {
                            entry.isLimited = (item.itemRestrictions && (
                                item.itemRestrictions.includes('Limited') ||
                                item.itemRestrictions.includes('LimitedUnique') ||
                                item.itemRestrictions.includes('Collectible')));
                            entry.name = item.name;
                            entry.searchName = (item.name || '').toLowerCase();
                            entry.price = item.price;
                            entry.creatorName = item.creatorName;
                            entry.creatorSearchName = (item.creatorName || '').toLowerCase();
                            entry.isOffsale = (item.priceStatus === 'Off Sale' || item.isOffSale === true) && !entry.isLimited;
                            entry.isValid = true;
                        }
                    });
                }
            } catch (e) {}
        }
    }

    async function checkAssetsForEffects(assetIds) {
        if (!assetIds.length) return [];
        const requestBody = assetIds.map(id => ({ assetId: id, requestId: id.toString() }));
        try {
            const response = await postJson('https://assetdelivery.roblox.com/v2/assets/batch', requestBody);
            if (!response || !response.ok) return assetIds.map(id => ({ assetId: id, effects: new Set(), isValid: false }));
            const batchData = await response.json();
            const assetUrlMap = new Map();
            if (Array.isArray(batchData)) {
                batchData.forEach(item => {
                    if (item.locations && item.locations[0] && item.locations[0].location) {
                        assetUrlMap.set(parseInt(item.requestId, 10), item.locations[0].location);
                    }
                });
            }
            const results = await Promise.all(assetIds.map(async id => {
                const url = assetUrlMap.get(id);
                if (!url) return { assetId: id, effects: new Set(), isValid: false };
                try {
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 8000);
                    const assetRes = await fetch(url, { signal: controller.signal });
                    clearTimeout(timeout);
                    if (!assetRes.ok) return { assetId: id, effects: new Set(), isValid: false };
                    const buffer = await assetRes.arrayBuffer();
                    const chunk = buffer.slice(0, 131072);
                    const text = new TextDecoder('latin1').decode(chunk);
                    const effects = new Set();
                    if (text.includes('ParticleEmitter') || text.includes('Sparkles') ||
                        text.includes('"Fire"') || text.includes('className="Fire"')) {
                        effects.add('itemsWithEffects');
                    }
                    if (text.includes('SurfaceAppearance') || text.includes('MaterialVariant') ||
                        text.includes('MetalnessMap') || text.includes('RoughnessMap') || text.includes('NormalMap')) {
                        effects.add('surfaceAppearance');
                    }
                    return { assetId: id, effects: effects, isValid: true };
                } catch (e) {
                    return { assetId: id, effects: new Set(), isValid: false };
                }
            }));
            return results;
        } catch (e) {
            return assetIds.map(id => ({ assetId: id, effects: new Set(), isValid: false }));
        }
    }

    async function processItemIds(assetIds, currentSession) {
        if (!assetIds.length) return;
        const needsEffectsCheck = selectedFilters.has('itemsWithEffects');

        for (let i = 0; i < assetIds.length; i += 100) {
            if (currentSession !== scanSessionId) return;
            const chunk = assetIds.slice(i, i + 100);
            const chunkNeedingDetails = [];
            const chunkNeedingEffects = [];

            chunk.forEach(id => {
                const entry = itemDataCache.get(id);
                if (!entry) {
                    itemDataCache.set(id, {
                        assetId: id, effects: new Set(), effectsChecked: false, isValid: false,
                        isLimited: false, isOffsale: false,
                        name: 'Loading...', searchName: '',
                        price: null, creatorName: 'Loading...', creatorSearchName: ''
                    });
                    chunkNeedingDetails.push(id);
                    if (needsEffectsCheck) chunkNeedingEffects.push(id);
                } else {
                    if (!entry.isValid) chunkNeedingDetails.push(id);
                    if (needsEffectsCheck && !entry.effectsChecked) chunkNeedingEffects.push(id);
                }
            });

            if (chunkNeedingDetails.length) {
                await fetchCatalogDetails(chunkNeedingDetails);
            }

            if (chunkNeedingEffects.length) {
                try {
                    const results = await checkAssetsForEffects(chunkNeedingEffects);
                    if (currentSession !== scanSessionId) return;
                    results.forEach(result => {
                        const entry = itemDataCache.get(result.assetId);
                        if (entry) {
                            if (result.isValid) entry.effects = result.effects;
                            entry.effectsChecked = true;
                        }
                    });
                } catch (e) {}
            }

            if (currentSession === scanSessionId) triggerDomUpdate();
        }
    }

    function isFilteringActive() {
        if (selectedFilters.size > 0 || priceFilter.min.active || priceFilter.max.active ||
            availabilityFilter !== 'all' || creatorFilter.active) return true;
        const searchInput = document.getElementById('purpura-fx-search-bar');
        return !!(searchInput && searchInput.value.length > 0);
    }

    function determineVisibility(meta, entry, searchTerm) {
        if (searchTerm && !((entry && entry.searchName) ? entry.searchName : meta.searchName).includes(searchTerm))
            return false;
        const structuralFilters = selectedFilters.size > 0 || priceFilter.min.active ||
            priceFilter.max.active || creatorFilter.active || availabilityFilter !== 'all';
        if (!structuralFilters) return true;
        if (meta.isOutfit) return false;
        if (!entry || !entry.isValid) return false;
        if (selectedFilters.size > 0) {
            for (const filterId of selectedFilters) {
                if (filterId === 'limited') {
                    if (!entry.isLimited) return false;
                } else if (!entry.effects.has(filterId)) {
                    return false;
                }
            }
        }
        if (priceFilter.min.active || priceFilter.max.active) {
            const val = entry.price;
            if (typeof val !== 'number' ||
                (priceFilter.min.active && val < priceFilter.min.value) ||
                (priceFilter.max.active && val > priceFilter.max.value)) return false;
        }
        if (availabilityFilter !== 'all') {
            if (availabilityFilter === 'onsale' && entry.isOffsale) return false;
            if (availabilityFilter === 'offsale' && !entry.isOffsale) return false;
        }
        if (creatorFilter.active && (!entry.creatorSearchName || !entry.creatorSearchName.includes(creatorFilter.name.toLowerCase())))
            return false;
        return true;
    }

    function triggerDomUpdate() {
        if (filterUpdatePending) return;
        filterUpdatePending = true;
        if (domUpdateFrame) cancelAnimationFrame(domUpdateFrame);
        domUpdateFrame = requestAnimationFrame(applyFilterToDOM);
    }

    function applyFilterToDOM() {
        filterUpdatePending = false;
        domUpdateFrame = null;

        const spinner = document.getElementById('purpura-filter-loading');
        if (spinner) spinner.style.display = 'none';

        const activePane = getActiveAvatarPane();
        if (!activePane) return;

        const searchInput = document.getElementById('purpura-fx-search-bar');
        const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const active = isFilteringActive();
        const listContainer = getActiveAvatarList(activePane);

        if (listContainer) {
            if (active) listContainer.classList.add('purpura-filtering-enabled');
            else listContainer.classList.remove('purpura-filtering-enabled');
        }

        const itemCards = activePane.getElementsByClassName('list-item');
        for (let i = 0, len = itemCards.length; i < len; i++) {
            const card = itemCards[i];
            const meta = domMetadata.get(card);
            if (!meta) continue;

            if (!active) {
                if (card.classList.contains('purpura-fx-hidden')) card.classList.remove('purpura-fx-hidden');
                card.classList.add('purpura-show');
                if (meta.img && meta.img.dataset.purpuraSrc) {
                    meta.img.src = meta.img.dataset.purpuraSrc;
                    delete meta.img.dataset.purpuraSrc;
                }
                continue;
            }

            const entry = meta.isOutfit ? null : itemDataCache.get(meta.id);
            const shouldShow = determineVisibility(meta, entry, searchTerm);
            const img = meta.img;

            if (shouldShow) {
                card.classList.add('purpura-show');
                card.classList.remove('purpura-fx-hidden');
                if (img && img.dataset.purpuraSrc) {
                    img.src = img.dataset.purpuraSrc;
                    delete img.dataset.purpuraSrc;
                }
            } else {
                card.classList.remove('purpura-show');
                if (img) {
                    const currentSrc = img.src;
                    if (currentSrc && !currentSrc.startsWith('data:')) {
                        img.dataset.purpuraSrc = currentSrc;
                        img.src = TRANSPARENT_PIXEL;
                    }
                }
            }
        }
    }

    async function applyAllFilters() {
        const currentSession = scanSessionId;
        addLoadingSpinner();

        selectedFilters.clear();
        document.querySelectorAll('#purpura-fx-dropdown .purpura-fx-toggle').forEach(toggle => {
            const filterId = toggle.id.replace('purpura-filter-', '');
            if (toggle.getAttribute('data-checked') === 'true') {
                selectedFilters.add(filterId);
            }
        });

        const creatorEl = document.getElementById('purpura-creator-name');
        const creatorVal = creatorEl ? creatorEl.value.trim() : '';
        creatorFilter = creatorVal ? { active: true, name: creatorVal } : { active: false, name: '' };

        const minPriceEl = document.getElementById('purpura-min-price');
        const maxPriceEl = document.getElementById('purpura-max-price');
        const minPrice = parseInt(minPriceEl ? minPriceEl.value : '', 10);
        const maxPrice = parseInt(maxPriceEl ? maxPriceEl.value : '', 10);
        priceFilter.min = !isNaN(minPrice) && minPrice >= 0 ? { active: true, value: minPrice } : { active: false, value: null };
        priceFilter.max = !isNaN(maxPrice) && maxPrice >= 0 ? { active: true, value: maxPrice } : { active: false, value: null };

        const availEl = document.getElementById('purpura-availability');
        availabilityFilter = (availEl && availEl.value) || 'all';

        updateToggleButtonText();
        triggerDomUpdate();

        const activePane = getActiveAvatarPane();
        const itemIdsToRecheck = new Set();
        if (activePane) {
            activePane.querySelectorAll('.list-item').forEach(card => {
                const meta = domMetadata.get(card);
                if (meta && meta.id && !meta.isOutfit) {
                    const entry = itemDataCache.get(meta.id);
                    if (!entry || !entry.isValid) {
                        itemIdsToRecheck.add(meta.id);
                    } else if (selectedFilters.has('itemsWithEffects') && !entry.effectsChecked) {
                        itemIdsToRecheck.add(meta.id);
                    }
                }
            });
        }

        try {
            if (itemIdsToRecheck.size > 0) {
                await processItemIds(Array.from(itemIdsToRecheck), currentSession);
            }
        } catch (e) {} finally {
            // Never leave the spinner up; the DOM update below is the only thing
            // that would otherwise clear it.
            const spinner = document.getElementById('purpura-filter-loading');
            if (spinner) spinner.style.display = 'none';
            if (currentSession === scanSessionId) triggerDomUpdate();
        }
    }

    function updateToggleButtonText() {
        const btn = document.getElementById('purpura-fx-toggle-btn');
        if (!btn) return;
        const count = selectedFilters.size + (priceFilter.min.active ? 1 : 0) + (priceFilter.max.active ? 1 : 0) +
                      (availabilityFilter !== 'all' ? 1 : 0) + (creatorFilter.active ? 1 : 0);
        const labelSpan = btn.querySelector('span');
        if (labelSpan) labelSpan.textContent = 'Filter Items';
        btn.classList.toggle('filter-applied', count > 0);
    }

    function ensureUIInActiveTab() {
        const activeTab = getActiveAvatarPane();
        if (!activeTab) return;

        if (document.getElementById('purpura-aeditor-host')) return;

        const currentCategoryKey = getActiveCategoryKeyStr(activeTab);
        if (currentCategoryKey !== activeCategoryKey) fullStateReset();

        let container = document.getElementById('purpura-fx-container');
        if (container && (container.dataset.category !== currentCategoryKey || container.parentElement !== activeTab)) {
            container.remove();
            container = null;
        }

        if (activeTab.id === 'scale' || activeTab.id === 'bodyColors') {
            if (container) container.remove();
            return;
        }

        const isCostumesTab = activeTab.id === 'costumes';
        const showFilters = config.filters && !isCostumesTab;
        const showSearch = config.enabled;

        if (!showFilters && !showSearch) {
            if (container) container.remove();
            return;
        }

        if (!container) {
            container = createFilterUIContainer(showFilters, showSearch);
            container.dataset.category = currentCategoryKey;

            const creatorInput = container.querySelector('#purpura-creator-name');
            if (creatorInput) {
                ['keydown', 'keypress', 'keyup', 'input', 'change', 'focus', 'focusin', 'click', 'mousedown'].forEach(evt => {
                    creatorInput.addEventListener(evt, (e) => e.stopPropagation());
                });
            }

            if (isCostumesTab) container.style.maxWidth = 'calc(100% - 170px)';
            activeTab.prepend(container);
        }

        if (showFilters || showSearch) {
            updateToggleButtonText();
            const existingList = getActiveAvatarList(activeTab);
            if (existingList) {
                attachObserverToList(existingList);
            }
        }
    }

    function scheduleEnsureUI(delay) {
        delay = delay || 100;
        if (ensureUITimer) clearTimeout(ensureUITimer);
        ensureUITimer = setTimeout(() => {
            ensureUITimer = null;
            ensureUIInActiveTab();
            triggerDomUpdate();
        }, delay);
    }

    function fullStateReset() {
        scanSessionId++;
        activeObservers.forEach(obs => { if (obs) obs.disconnect(); });
        activeObservers = [];
        if (scanQueueTimer) { clearTimeout(scanQueueTimer); scanQueueTimer = null; }
        scanQueue.clear();
        if (domUpdateFrame) { cancelAnimationFrame(domUpdateFrame); domUpdateFrame = null; }
        if (ensureUITimer) { clearTimeout(ensureUITimer); ensureUITimer = null; }
        itemDataCache = new Map();
        domMetadata = new WeakMap();
        observedLists = new WeakSet();
        selectedFilters.clear();
        priceFilter = { min: { active: false, value: null }, max: { active: false, value: null } };
        availabilityFilter = 'all';
        creatorFilter = { active: false, name: '' };
        activeCategoryKey = getActiveCategoryKeyStr();
        document.querySelectorAll('.purpura-filtering-enabled').forEach(el => {
            el.classList.remove('purpura-filtering-enabled');
        });
        const existingUI = document.getElementById('purpura-fx-container');
        if (existingUI) existingUI.remove();
        if (docClickHandler) {
            document.removeEventListener('click', docClickHandler);
            docClickHandler = null;
        }
    }

    function attachObserverToList(listElement) {
        if (observedLists.has(listElement)) return;
        observedLists.add(listElement);
        if (isFilteringActive()) listElement.classList.add('purpura-filtering-enabled');

        listElement.querySelectorAll('li.list-item').forEach(card => processCard(card, listElement));

        const itemObs = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType !== 1) return;
                    if (node.tagName === 'LI' && node.classList.contains('list-item')) {
                        processCard(node, listElement);
                    } else if (node.querySelectorAll) {
                        node.querySelectorAll('li.list-item').forEach(card => processCard(card, listElement));
                    }
                });
            });
        });
        itemObs.observe(listElement, { childList: true, subtree: true });
        activeObservers.push(itemObs);
    }

    function processCard(card, listElement) {
        if (!listElement.contains(card)) return;
        if (domMetadata.has(card)) return;

        const img = card.querySelector('.item-card-thumb img, [data-thumbnail-target-id] img, img');
        const id = getAssetIdFromCard(card);
        if (!id) return;

        const assetType = getAssetTypeFromCard(card);
        const nameText = getCardName(card);
        const isOutfit = assetType === 'Outfit';

        domMetadata.set(card, {
            id: id,
            searchName: nameText.toLowerCase(),
            img: img,
            isOutfit: isOutfit
        });

        if (!isOutfit) {
            const entry = itemDataCache.get(id);
            if (!entry && !scanQueue.has(id)) {
                scanQueue.add(id);
                if (!scanQueueTimer) {
                    scanQueueTimer = setTimeout(() => {
                        const idsToProcess = Array.from(scanQueue);
                        scanQueue.clear();
                        scanQueueTimer = null;
                        processItemIds(idsToProcess, scanSessionId);
                    }, 150);
                }
            }
        }

        if (isFilteringActive()) {
            const searchInput = document.getElementById('purpura-fx-search-bar');
            const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
            const meta = domMetadata.get(card);
            const entry = isOutfit ? null : itemDataCache.get(id);
            if (determineVisibility(meta, entry, searchTerm)) {
                card.classList.add('purpura-show');
                card.classList.remove('purpura-fx-hidden');
            } else {
                card.classList.remove('purpura-show');
                if (img) {
                    const currentSrc = img.src;
                    if (currentSrc && !currentSrc.startsWith('data:')) {
                        img.dataset.purpuraSrc = currentSrc;
                        img.src = TRANSPARENT_PIXEL;
                    }
                }
            }
        } else {
            card.classList.add('purpura-show');
        }
    }

    function addLoadingSpinner() {
        let spinner = document.getElementById('purpura-filter-loading');
        if (spinner) {
            spinner.style.display = 'block';
        } else {
            spinner = document.createElement('div');
            spinner.id = 'purpura-filter-loading';
            spinner.textContent = 'Filtering...';
            const pane = getActiveAvatarPane();
            if (pane) {
                if (!pane.style.position || pane.style.position === 'static') pane.style.position = 'relative';
                pane.prepend(spinner);
            }
        }
    }

    function initAvatarSearch() {
        if (observer) observer.disconnect();
        fullStateReset();

        if (urlCheckInterval) { clearInterval(urlCheckInterval); urlCheckInterval = null; }

        if (config.enabled || config.filters) {
            observer = new MutationObserver(() => {
                if (!(config.enabled || config.filters)) return;
                const isAvatarPage = window.location.pathname.includes('/my/avatar') ||
                                     window.location.pathname.includes('/avatar');
                if (!isAvatarPage) return;
                if (document.getElementById('purpura-aeditor-host')) return;
                scheduleEnsureUI(100);
            });
            observer.observe(document.body, { childList: true, subtree: true });

            const isAvatarPage = window.location.pathname.includes('/my/avatar') ||
                                 window.location.pathname.includes('/avatar');
            if (isAvatarPage && !document.getElementById('purpura-aeditor-host')) {
                setTimeout(() => {
                    ensureUIInActiveTab();
                    triggerDomUpdate();
                }, 500);
            }

            if (!urlCheckInterval) {
                urlCheckInterval = setInterval(() => {
                    if (!(config.enabled || config.filters)) return;
                    const isAvatarPage = window.location.pathname.includes('/my/avatar') ||
                                         window.location.pathname.includes('/avatar');
                    if (isAvatarPage && !document.getElementById('purpura-fx-container') &&
                        !document.getElementById('purpura-aeditor-host')) {
                        ensureUIInActiveTab();
                    }
                }, 1000);
            }
        } else {
            if (urlCheckInterval) { clearInterval(urlCheckInterval); urlCheckInterval = null; }
        }
    }

    function loadSettings() {
        window.__PurpuraSettings.ready.then(function() {
            const v = window.__PurpuraSettings.get('as');
            const newConfig = parseAsConfig(v);
            const changed = newConfig.enabled !== config.enabled || newConfig.filters !== config.filters;
            config = newConfig;
            if (changed) initAvatarSearch();
        });
    }

    loadSettings();

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync' && changes['as']) {
            loadSettings();
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAvatarSearch);
    } else {
        initAvatarSearch();
    }    window.addEventListener('beforeunload', () => {
        if (observer) observer.disconnect();
        if (urlCheckInterval) clearInterval(urlCheckInterval);
        if (scanQueueTimer) clearTimeout(scanQueueTimer);
        if (domUpdateFrame) cancelAnimationFrame(domUpdateFrame);
        if (ensureUITimer) clearTimeout(ensureUITimer);
        activeObservers.forEach(obs => { if (obs) obs.disconnect(); });
    });
})();
