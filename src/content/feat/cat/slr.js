/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
    function t(key, substitutions) { return chrome.i18n.getMessage(key, substitutions) || key; }
    if (window.purpuraSaveLotsRobuxInitialized) return;
    window.purpuraSaveLotsRobuxInitialized = true;

    const TOGGLE_KEY = 'slr';
    const PLACE_ID_LEGACY_KEY = 'slr-place-id';
    const STYLE_ID = 'purpura-save-lots-robux-style';
    const BUTTON_CLASS = 'purpura-save-lots-robux-button';
    const DIALOG_OVERLAY_CLASS = 'purpura-save-lots-robux-dialog-overlay';
    const DIALOG_CLASS = 'purpura-save-lots-robux-dialog';
    const DIALOG_TITLE_CLASS = 'purpura-save-lots-robux-dialog-title';
    const DIALOG_MESSAGE_CLASS = 'purpura-save-lots-robux-dialog-message';
    const DIALOG_INPUT_CLASS = 'purpura-save-lots-robux-dialog-input';
    const DIALOG_ACTIONS_CLASS = 'purpura-save-lots-robux-dialog-actions';
    const DIALOG_BUTTON_CLASS = 'purpura-save-lots-robux-dialog-btn';
    const DIALOG_ERROR_CLASS = 'purpura-save-lots-robux-dialog-error';
    const MODAL_SELECTOR = '.modal-content, .unified-purchase-dialog-content, .foundation-web-dialog-content';
    const DEFAULT_SAVINGS_RATE = 0.4;
    const GAMEPASS_SAVINGS_RATE = 0.1;
    const CLASSIC_CLOTHING_SAVINGS_RATE = 0.1;
    const ALLOWED_HTTP_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD']);

    let enabled = false;
    let observer = null;
    let scanTimer = 0;
    let lastClickedPurchaseData = null;
    let csrfToken = '';
    let boundAuthToken = '';
    let authTokensHydrated = false;
    let assetToSubcategoryMap = null;
    let classicClothingSubcategories = null;
    let catalogMetadataPromise = null;
    const itemDetailsCache = new Map();
    const savingsEstimateCache = new Map();

    function extractPriceCandidates(value) {
        if (value === null || value === undefined) return [];

        const text = String(value).replace(/\u00A0/g, ' ');
        const matches = text.match(/\d{1,3}(?:,\d{3})+|\d+/g);
        if (!matches) return [];

        return matches
            .map(part => parseInt(part.replace(/,/g, ''), 10))
            .filter(number => Number.isFinite(number) && number > 0);
    }

    function cleanPrice(value) {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value > 0 ? Math.floor(value) : 0;
        }

        const candidates = extractPriceCandidates(value);
        return candidates.length ? candidates[0] : 0;
    }

    function formatNumber(value) {
        const n = Number(value);
        if (!Number.isFinite(n)) return '0';
        return n.toLocaleString();
    }

    function filterStructuralClasses(classString) {
        if (!classString) return '';
        return classString.split(/\s+/).filter(function(cls) {
            if (!cls || cls === BUTTON_CLASS) return false;
            if (cls.indexOf('opacity-[') === 0) return false;
            if (cls.indexOf('group/') === 0) return false;
            if (cls.indexOf('focus-visible:') === 0) return false;
            if (cls.indexOf('disabled:') === 0) return false;
            if (cls.indexOf('cursor-') === 0) return false;
            if (cls === 'clip') return false;
            if (cls === 'bg-action-emphasis' || cls === 'bg-action-standard' || cls === 'bg-action-secondary') return false;
            if (cls === 'content-action-emphasis' || cls === 'content-action-standard') return false;
            return true;
        }).join(' ');
    }

    function getDefaultSavingsRate(type) {
        return String(type || '').toLowerCase() === 'gamepass' ? GAMEPASS_SAVINGS_RATE : DEFAULT_SAVINGS_RATE;
    }

    function buildSavingsCacheKey(entries) {
        if (!Array.isArray(entries) || !entries.length) return '';
        return entries
            .map(entry => {
                const type = String(entry && entry.type ? entry.type : '').toLowerCase();
                const id = String(entry && entry.id ? entry.id : '').trim();
                const price = Number(entry && entry.price);
                return `${type}:${id}:${Number.isFinite(price) ? price : 0}`;
            })
            .join('|');
    }


    function showCustomDialog(options = {}) {
        ensureStyles();

        var mode = options.mode === 'prompt' ? 'prompt' : (options.mode === 'alert' ? 'alert' : 'confirm');
        var title = typeof options.title === 'string' && options.title.trim() ? options.title.trim() : 'Robux Saver';
        var message = typeof options.message === 'string' ? options.message : '';
        var confirmText = typeof options.confirmText === 'string' && options.confirmText.trim()
            ? options.confirmText.trim()
            : (mode === 'alert' ? 'OK' : 'Continue');
        var cancelText = typeof options.cancelText === 'string' && options.cancelText.trim() ? options.cancelText.trim() : 'Cancel';
        var initialValue = typeof options.initialValue === 'string' ? options.initialValue : '';
        var placeholder = typeof options.placeholder === 'string' ? options.placeholder : '';

        return new Promise(function(resolve) {
            if (!document.body) {
                if (mode === 'prompt') resolve(null);
                else if (mode === 'confirm') resolve(false);
                else resolve(undefined);
                return;
            }

            var previousActive = document.activeElement instanceof HTMLElement ? document.activeElement : null;

            var overlay = document.createElement('div');
            overlay.className = DIALOG_OVERLAY_CLASS;

            var dialog = document.createElement('div');
            dialog.className = DIALOG_CLASS + ' mode-' + mode;

            var titleEl = document.createElement('h3');
            titleEl.className = DIALOG_TITLE_CLASS;
            titleEl.textContent = title;

            var messageEl = document.createElement('div');
            messageEl.className = DIALOG_MESSAGE_CLASS;
            messageEl.textContent = message;

            dialog.appendChild(titleEl);
            dialog.appendChild(messageEl);

            var input = null;
            if (mode === 'prompt') {
                input = document.createElement('input');
                input.type = 'text';
                input.className = DIALOG_INPUT_CLASS;
                input.value = initialValue;
                input.autocomplete = 'off';
                input.placeholder = placeholder;
                dialog.appendChild(input);
            }

            var actions = document.createElement('div');
            actions.className = DIALOG_ACTIONS_CLASS;

            if (mode !== 'alert') {
                var cancelBtn = document.createElement('button');
                cancelBtn.type = 'button';
                cancelBtn.className = DIALOG_BUTTON_CLASS + ' cancel';
                cancelBtn.textContent = cancelText;
                cancelBtn.addEventListener('click', function() {
                    closeWith(mode === 'prompt' ? null : false);
                });
                actions.appendChild(cancelBtn);
            }

            var confirmBtn = document.createElement('button');
            confirmBtn.type = 'button';
            confirmBtn.className = DIALOG_BUTTON_CLASS + ' confirm';
            confirmBtn.textContent = confirmText;
            confirmBtn.addEventListener('click', function() {
                if (mode === 'prompt') {
                    closeWith(input ? input.value : '');
                } else if (mode === 'confirm') {
                    closeWith(true);
                } else {
                    closeWith(undefined);
                }
            });
            actions.appendChild(confirmBtn);

            dialog.appendChild(actions);
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            var closed = false;
            function closeWith(value) {
                if (closed) return;
                closed = true;
                document.removeEventListener('keydown', onKeyDown, true);
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                if (previousActive && typeof previousActive.focus === 'function') {
                    previousActive.focus();
                }
                resolve(value);
            }

            function onKeyDown(event) {
                if (!overlay.isConnected) return;
                if (event.key === 'Escape') {
                    event.preventDefault();
                    closeWith(mode === 'prompt' ? null : (mode === 'confirm' ? false : undefined));
                    return;
                }
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    if (mode === 'prompt') {
                        closeWith(input ? input.value : '');
                    } else if (mode === 'confirm') {
                        closeWith(true);
                    } else {
                        closeWith(undefined);
                    }
                }
            }

            overlay.addEventListener('click', function(event) {
                if (event.target === overlay) {
                    closeWith(mode === 'prompt' ? null : (mode === 'confirm' ? false : undefined));
                }
            });

            document.addEventListener('keydown', onKeyDown, true);

            if (mode === 'prompt' && input) {
                input.focus();
                input.select();
            } else {
                confirmBtn.focus();
            }
        });
    }

    function parsePurchaseTypeFromPath(pathname) {
        const path = String(pathname || '').toLowerCase();

        let match = path.match(/\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?catalog\/(\d+)/i);
        if (match) {
            return { id: match[1], type: 'asset' };
        }

        match = path.match(/\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?bundles\/(\d+)/i);
        if (match) {
            return { id: match[1], type: 'bundle' };
        }

        match = path.match(/\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?game-pass\/(\d+)/i);
        if (match) {
            return { id: match[1], type: 'gamepass' };
        }

        return null;
    }

    function extractLinkedItemInfo(node) {
        if (!node) return null;

        const link = node.closest('.store-card, .item-card, .list-item, .catalog-item-card, .game-pass-item, .cart-item-container')?.querySelector('a[href*="/catalog/"], a[href*="/bundles/"], a[href*="/game-pass/"]');
        if (!link) return null;

        const href = link.getAttribute('href') || '';

        let match = href.match(/\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?catalog\/(\d+)/i);
        if (match) return { id: match[1], type: 'asset' };

        match = href.match(/\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?bundles\/(\d+)/i);
        if (match) return { id: match[1], type: 'bundle' };

        match = href.match(/\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?game-pass\/(\d+)/i);
        if (match) return { id: match[1], type: 'gamepass' };

        return null;
    }

    function getCurrentUserIdFromMeta() {
        const meta = document.querySelector('meta[name="user-data"]');
        if (!meta) return null;

        const userId = meta.getAttribute('data-userid');
        if (!userId || !/^\d+$/.test(userId)) return null;

        return userId;
    }

    async function getAuthenticatedUserId() {
        const metaUserId = getCurrentUserIdFromMeta();
        if (metaUserId) return metaUserId;

        const response = await fetch('https://users.roblox.com/v1/users/authenticated', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user (${response.status})`);
        }

        const data = await response.json();
        if (!data || !data.id) {
            throw new Error('Could not resolve authenticated user ID');
        }

        return String(data.id);
    }

    async function getRobuxBalance(userId) {
        if (!userId) return null;

        const response = await fetch(`https://economy.roblox.com/v1/users/${userId}/currency`, {
            credentials: 'include'
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        const robux = Number(data && data.robux);
        if (!Number.isFinite(robux)) return null;

        return Math.floor(robux);
    }

    function getModalBuyButton(modal) {
        if (!modal) return null;

        return modal.querySelector('[data-testid="purchase-confirm-button"], .modal-button.btn-primary-md, #confirm-btn.btn-primary-md, a#confirm-btn, .modal-footer .btn-primary-md, .foundation-web-button[data-testid="purchase-confirm-button"], button.btn-primary-md, button.btn-primary-lg, .shopping-cart-buy-button, .PurchaseButton');
    }

    function getModalCloseButton(modal) {
        if (!modal) return null;

        return modal.querySelector('button[aria-label="Close"], .modal-header .close, .foundation-web-dialog-close-container button, .simplemodal-close');
    }

    function getButtonHostElement(modal, buyButton) {
        if (!modal) return null;

        const buyParent = buyButton ? buyButton.parentElement : null;
        if (buyParent) return buyParent;

        return modal.querySelector('.modal-footer .modal-buttons, .modal-footer, .dialog-footer, .purchase-modal-footer');
    }

    function getCartItems() {
        const cartModal = document.querySelector('.shopping-cart-modal');
        if (!cartModal) return [];

        const items = [];
        cartModal.querySelectorAll('.cart-item-container').forEach(container => {
            const link = container.querySelector('.item-details-container a.item-name, a.item-name, a[href*="/catalog/"], a[href*="/bundles/"]');
            if (!link) return;

            const href = link.getAttribute('href') || '';
            let type = 'asset';
            let id = null;

            let match = href.match(/\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?catalog\/(\d+)/i);
            if (match) {
                id = match[1];
                type = 'asset';
            }

            match = href.match(/\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?bundles\/(\d+)/i);
            if (match) {
                id = match[1];
                type = 'bundle';
            }

            const name = (link.textContent || '').trim();
            const priceEl = container.querySelector('.text-robux, .item-price, .price, .text-robux-lg');
            const price = cleanPrice(priceEl ? priceEl.textContent : '');

            if (!id) return;

            items.push({
                id,
                type,
                name,
                price
            });
        });

        return items;
    }

    function getElementContextText(element, modal) {
        if (!element) return '';

        const parts = [];
        let current = element;
        let depth = 0;

        while (current && depth < 3) {
            const text = current.textContent || '';
            if (text.trim()) {
                parts.push(text.trim());
            }

            if (current === modal) break;
            current = current.parentElement;
            depth += 1;
        }

        return parts.join(' ').replace(/\s+/g, ' ').trim();
    }

    function isBalanceLikeContext(text) {
        const normalized = String(text || '').toLowerCase();
        return /(\bbalance\b|\bremaining\b|after purchase|you have|\bowned\b|already own|wallet|credit|funds available|top up)/i.test(normalized);
    }

    function isPriceLikeContext(text) {
        const normalized = String(text || '').toLowerCase();
        return /(\bprice\b|\btotal\b|\bcost\b|\bpurchase\b|\bbuy\b|robux|r\$)/i.test(normalized);
    }

    function collectModalPriceCandidates(modal, selector, options = {}) {
        const { requirePriceContext = false } = options;
        const candidates = [];
        const seen = new Set();

        modal.querySelectorAll(selector).forEach(element => {
            if (seen.has(element)) return;
            seen.add(element);

            const elementText = (element.textContent || '').trim();
            if (!elementText) return;

            const contextText = getElementContextText(element, modal);
            if (isBalanceLikeContext(contextText)) return;
            if (requirePriceContext && !isPriceLikeContext(contextText)) return;

            extractPriceCandidates(elementText).forEach(value => {
                if (value > 0) candidates.push(value);
            });
        });

        return candidates;
    }

    function selectBestPrice(candidates, expectedPriceHint = 0) {
        if (!Array.isArray(candidates) || !candidates.length) return 0;

        if (expectedPriceHint > 0) {
            let best = candidates[0];
            let bestDistance = Math.abs(best - expectedPriceHint);

            for (let i = 1; i < candidates.length; i += 1) {
                const value = candidates[i];
                const distance = Math.abs(value - expectedPriceHint);
                if (distance < bestDistance) {
                    best = value;
                    bestDistance = distance;
                }
            }

            return best;
        }

        return Math.min(...candidates);
    }

    function getPriceFromModal(modal, options = {}) {
        if (!modal) return 0;

        const expectedPriceHint = Number(options.expectedPriceHint) || 0;

        const fromAttr = cleanPrice(modal.getAttribute('data-purpura-expected-price'));
        if (fromAttr > 0) return fromAttr;

        const strictCandidates = collectModalPriceCandidates(modal, [
            '[data-testid="purchase-total-price"]',
            '[data-testid*="purchase-total"]',
            '[data-testid*="price"]',
            '.purchase-total-price',
            '.modal-footer .text-robux',
            '.modal-message .text-robux',
            '.text-robux-lg',
            '.text-robux'
        ].join(', '));
        const strictPrice = selectBestPrice(strictCandidates, expectedPriceHint);
        if (strictPrice > 0) return strictPrice;

        const fallbackCandidates = collectModalPriceCandidates(modal, '.icon-robux-container, .amount', { requirePriceContext: true });
        const fallbackPrice = selectBestPrice(fallbackCandidates, expectedPriceHint);
        if (fallbackPrice > 0) return fallbackPrice;

        if (expectedPriceHint > 0) {
            return expectedPriceHint;
        }

        return 0;
    }

    function getPurchaseLabel(modal, fallback) {
        if (lastClickedPurchaseData && lastClickedPurchaseData.name) {
            return lastClickedPurchaseData.name;
        }

        const labelEl = modal.querySelector('.font-bold, strong, .item-name, .item-name-container h1, .modal-message strong, .modal-message .font-bold');
        const label = (labelEl && labelEl.textContent ? labelEl.textContent : '').trim();
        if (label) return label;

        return fallback;
    }

    function getSinglePurchaseContext(modal) {
        const pathInfo = parsePurchaseTypeFromPath(window.location.pathname);

        let itemId = pathInfo ? pathInfo.id : null;
        let type = pathInfo ? pathInfo.type : 'asset';

        if (!itemId) {
            const linked = extractLinkedItemInfo(modal);
            if (linked) {
                itemId = linked.id;
                type = linked.type;
            }
        }

        if (!itemId && lastClickedPurchaseData && (Date.now() - lastClickedPurchaseData.timestamp) < 5000) {
            itemId = lastClickedPurchaseData.itemId || itemId;
            if (lastClickedPurchaseData.isGamePass) {
                type = 'gamepass';
            }
        }

        if (!itemId) {
            const dataNode = modal.querySelector('[data-item-id], [data-asset-id], [data-product-id]');
            if (dataNode) {
                itemId = dataNode.getAttribute('data-item-id') || dataNode.getAttribute('data-asset-id') || itemId;
            }
        }

        if (!itemId || !/^\d+$/.test(String(itemId))) {
            return null;
        }

        if (window.location.pathname.toLowerCase().includes('/games/') && type === 'asset') {
            type = 'gamepass';
        }

        const expectedPriceHint = (lastClickedPurchaseData && (Date.now() - lastClickedPurchaseData.timestamp) < 5000 && lastClickedPurchaseData.expectedPrice > 0)
            ? lastClickedPurchaseData.expectedPrice
            : 0;

        const price = expectedPriceHint > 0
            ? expectedPriceHint
            : getPriceFromModal(modal, { expectedPriceHint });

        if (!price || price <= 0) {
            return null;
        }

        const savingsRate = getDefaultSavingsRate(type);
        const savings = Math.floor(price * savingsRate);
        const label = getPurchaseLabel(modal, type === 'gamepass' ? 'Game Pass' : 'Item');

        return {
            itemLabel: label,
            totalPrice: price,
            savings,
            entries: [{ id: String(itemId), type, price }],
            launchData: `${type}:${itemId}`
        };
    }

    function getCartPurchaseContext(modal) {
        const batchThumbs = modal.querySelectorAll('.modal-multi-item-image-container img');
        const cartItems = getCartItems();

        if (batchThumbs.length < 2 && cartItems.length < 2) {
            return null;
        }

        if (!cartItems.length) {
            return null;
        }

        const launchParts = [];
        const entries = [];
        let totalPrice = 0;
        let totalSavings = 0;

        cartItems.forEach(item => {
            if (!item.id) return;
            const partType = item.type === 'bundle' ? 'bundle' : 'asset';
            launchParts.push(`${partType}:${item.id}`);
            entries.push({ id: String(item.id), type: partType, price: Number(item.price) || 0 });

            if (item.price > 0) {
                totalPrice += item.price;
                totalSavings += Math.floor(item.price * getDefaultSavingsRate(partType));
            }
        });

        if (!launchParts.length) {
            return null;
        }

        if (totalPrice <= 0) {
            totalPrice = getPriceFromModal(modal);
            totalSavings = Math.floor(totalPrice * DEFAULT_SAVINGS_RATE);
        }

        if (totalPrice <= 0) {
            return null;
        }

        return {
            itemLabel: `${cartItems.length} cart item${cartItems.length === 1 ? '' : 's'}`,
            totalPrice,
            savings: totalSavings,
            entries,
            launchData: launchParts.join(',')
        };
    }

    function getPurchaseContext(modal) {
        const cartContext = getCartPurchaseContext(modal);
        if (cartContext) return cartContext;
        return getSinglePurchaseContext(modal);
    }

    function getStorageValue(storage, key, fallback) {
        return new Promise(resolve => {
            storage.get({ [key]: fallback }, result => {
                resolve(result[key]);
            });
        });
    }

    function setStorageValue(storage, key, value) {
        return new Promise(resolve => {
            storage.set({ [key]: value }, () => {
                resolve();
            });
        });
    }

    function normalizeHttpMethod(method, fallback = 'GET') {
        const normalizedFallback = String(fallback || 'GET').trim().toUpperCase() || 'GET';
        const normalized = String(method || normalizedFallback).trim().toUpperCase();
        return ALLOWED_HTTP_METHODS.has(normalized) ? normalized : normalizedFallback;
    }

    function hydrateAuthTokens() {
        if (authTokensHydrated) return;
        authTokensHydrated = true;

        try {
            const csrfMeta = document.querySelector('meta[name="csrf-token"], meta[name="x-csrf-token"]');
            const boundMeta = document.querySelector('meta[name="x-bound-auth-token"], meta[name="bound-auth-token"]');

            if (csrfMeta && typeof csrfMeta.content === 'string' && csrfMeta.content.trim()) {
                csrfToken = csrfMeta.content.trim();
            }

            if (boundMeta && typeof boundMeta.content === 'string' && boundMeta.content.trim()) {
                boundAuthToken = boundMeta.content.trim();
            }

            ['csrf-token', 'x-csrf-token', 'rbxBoundAuthToken', 'x-bound-auth-token', 'boundAuthToken'].forEach(key => {
                try {
                    const stored = window.localStorage?.getItem(key) || window.sessionStorage?.getItem(key) || '';
                    if (!stored || typeof stored !== 'string' || !stored.trim()) return;

                    const normalized = stored.trim();
                    if ((key === 'csrf-token' || key === 'x-csrf-token') && !csrfToken) {
                        csrfToken = normalized;
                    }

                    if ((key === 'rbxBoundAuthToken' || key === 'x-bound-auth-token' || key === 'boundAuthToken') && !boundAuthToken) {
                        boundAuthToken = normalized;
                    }
                } catch {
                }
            });
        } catch {
        }
    }

    function sendBackgroundFetch(request) {
        return new Promise(resolve => {
            try {
                chrome.runtime.sendMessage(request, response => {
                    if (chrome.runtime.lastError) {
                        resolve({ ok: false, status: 0, contentType: '', text: '' });
                        return;
                    }

                    resolve(response && typeof response === 'object' ? response : { ok: false, status: 0, contentType: '', text: '' });
                });
            } catch {
                resolve({ ok: false, status: 0, contentType: '', text: '' });
            }
        });
    }

    async function fetchRobloxApiJson(url, options = {}) {
        hydrateAuthTokens();

        const method = normalizeHttpMethod(options.method, 'GET');
        const bodyText = typeof options.body === 'string'
            ? options.body
            : (options.body !== undefined && options.body !== null ? JSON.stringify(options.body) : '');
        const headers = options.headers && typeof options.headers === 'object' ? options.headers : {};
        const accept = typeof options.accept === 'string' && options.accept
            ? options.accept
            : 'application/json, text/plain;q=0.9, */*;q=0.8';

        const send = () => sendBackgroundFetch({
            type: 'PURPURA_FETCH_RESOURCE_REQUEST',
            url,
            method,
            body: bodyText,
            accept,
            csrfToken: method === 'GET' || method === 'HEAD' ? '' : csrfToken,
            boundAuthToken,
            headers
        });

        let response = await send();
        if (response && typeof response.csrfToken === 'string' && response.csrfToken) {
            csrfToken = response.csrfToken;
        }
        if (response && typeof response.boundAuthToken === 'string' && response.boundAuthToken) {
            boundAuthToken = response.boundAuthToken;
        }

        if ((!response || !response.ok) && response && response.status === 403 && method !== 'GET' && method !== 'HEAD') {
            response = await send();
            if (response && typeof response.csrfToken === 'string' && response.csrfToken) {
                csrfToken = response.csrfToken;
            }
            if (response && typeof response.boundAuthToken === 'string' && response.boundAuthToken) {
                boundAuthToken = response.boundAuthToken;
            }
        }

        const text = response && typeof response.text === 'string' ? response.text : '';
        let json = null;
        if (text) {
            try {
                json = JSON.parse(text);
            } catch {
            }
        }

        return {
            ok: !!(response && response.ok),
            status: Number(response && response.status) || 0,
            json,
            text
        };
    }


    function normalizePlaceId(value) {
        const normalized = String(value || '').trim();
        return /^\d+$/.test(normalized) ? normalized : '';
    }

    async function fetchCatalogMetadata() {
        if (assetToSubcategoryMap && classicClothingSubcategories) {
            return;
        }

        if (catalogMetadataPromise) {
            await catalogMetadataPromise;
            return;
        }

        catalogMetadataPromise = (async () => {
            try {
                const [assetToSubResponse, subcategoriesResponse] = await Promise.all([
                    fetchRobloxApiJson('https://catalog.roblox.com/v1/asset-to-subcategory', {
                        method: 'GET'
                    }),
                    fetchRobloxApiJson('https://catalog.roblox.com/v1/subcategories', {
                        method: 'GET'
                    })
                ]);

                if (assetToSubResponse.ok && assetToSubResponse.json && typeof assetToSubResponse.json === 'object') {
                    assetToSubcategoryMap = assetToSubResponse.json;
                }

                if (subcategoriesResponse.ok && subcategoriesResponse.json && typeof subcategoriesResponse.json === 'object') {
                    const classicKeys = ['ClassicShirts', 'ClassicPants', 'ClassicTShirts'];
                    const classicIds = [];
                    classicKeys.forEach(key => {
                        if (subcategoriesResponse.json[key] !== undefined) {
                            classicIds.push(subcategoriesResponse.json[key]);
                        }
                    });
                    classicClothingSubcategories = classicIds;
                }
            } catch {
            } finally {
                catalogMetadataPromise = null;
            }
        })();

        await catalogMetadataPromise;
    }

    async function fetchCatalogItemDetails(itemId, itemType = 'Asset') {
        const normalizedId = normalizePlaceId(itemId);
        if (!normalizedId) return null;

        const cacheKey = `${itemType}:${normalizedId}`;
        if (itemDetailsCache.has(cacheKey)) {
            return itemDetailsCache.get(cacheKey);
        }

        let item = null;
        try {
            const response = await fetchRobloxApiJson('https://catalog.roblox.com/v1/catalog/items/details', {
                method: 'POST',
                body: {
                    items: [{ itemType, id: parseInt(normalizedId, 10) }]
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok && response.json && Array.isArray(response.json.data) && response.json.data.length > 0) {
                item = response.json.data[0] || null;
            }
        } catch {
        }

        itemDetailsCache.set(cacheKey, item);
        return item;
    }

    async function getSavingsRateForEntry(entry) {
        const type = String(entry && entry.type ? entry.type : '').toLowerCase();
        const price = Number(entry && entry.price);

        if (type === 'gamepass') {
            return GAMEPASS_SAVINGS_RATE;
        }

        if (type !== 'asset') {
            return DEFAULT_SAVINGS_RATE;
        }

        await fetchCatalogMetadata();
        if (!assetToSubcategoryMap || !Array.isArray(classicClothingSubcategories)) {
            return DEFAULT_SAVINGS_RATE;
        }

        const details = await fetchCatalogItemDetails(entry && entry.id ? entry.id : '', 'Asset');
        const assetType = Number(details && details.assetType);
        if (!Number.isFinite(assetType)) {
            return DEFAULT_SAVINGS_RATE;
        }

        const subcategoryId = assetToSubcategoryMap[String(assetType)];
        if (classicClothingSubcategories.includes(subcategoryId)) {
            return price < 10 ? 0 : CLASSIC_CLOTHING_SAVINGS_RATE;
        }

        return DEFAULT_SAVINGS_RATE;
    }

    async function calculateAccurateSavings(context) {
        const entries = Array.isArray(context && context.entries) ? context.entries : [];
        if (!entries.length) {
            return Number(context && context.savings) || 0;
        }

        const key = buildSavingsCacheKey(entries);
        if (key && savingsEstimateCache.has(key)) {
            return savingsEstimateCache.get(key);
        }

        let totalSavings = 0;
        for (const entry of entries) {
            const price = Number(entry && entry.price);
            if (!Number.isFinite(price) || price <= 0) continue;

            const rate = await getSavingsRateForEntry(entry);
            totalSavings += Math.floor(price * rate);
        }

        if (key) {
            savingsEstimateCache.set(key, totalSavings);
        }

        return totalSavings;
    }

    function parseFeatureEnabledFromRaw(rawValue) {
        if (rawValue && typeof rawValue === 'object') {
            return rawValue.enabled === true;
        }
        return rawValue === true;
    }

    function normalizeFeatureConfig(rawValue) {
        if (rawValue && typeof rawValue === 'object') {
            return {
                enabled: rawValue.enabled === true,
                placeId: normalizePlaceId(rawValue.placeId)
            };
        }

        return {
            enabled: rawValue === true,
            placeId: ''
        };
    }

    async function getFeatureConfig() {
        const rawValue = await getStorageValue(chrome.storage.sync, TOGGLE_KEY, { enabled: false, placeId: '' });
        const config = normalizeFeatureConfig(rawValue);

        if (rawValue === true || rawValue === false || (rawValue && typeof rawValue === 'object' && typeof rawValue.placeId === 'boolean')) {
            await setStorageValue(chrome.storage.sync, TOGGLE_KEY, config);
        }

        if (!config.placeId) {
            const legacyPlaceId = await getStorageValue(chrome.storage.local, PLACE_ID_LEGACY_KEY, '');
            const normalizedLegacy = normalizePlaceId(legacyPlaceId);
            if (normalizedLegacy) {
                config.placeId = normalizedLegacy;
            }
        }

        return config;
    }

    async function setFeatureConfigPatch(patch) {
        const current = await getFeatureConfig();
        const next = {
            ...current,
            ...patch
        };

        await setStorageValue(chrome.storage.sync, TOGGLE_KEY, next);
    }

    async function getPlaceId() {
        const config = await getFeatureConfig();
        return config.placeId;
    }

    async function ensurePlaceId() {
        const existing = await getPlaceId();
        if (existing) return existing;

        await showCustomDialog({
            mode: 'alert',
            title: 'Important Information',
            message: 'Owner Account: The group owner CANNOT be the same account you are buying items with. The owner should be a secured alt account with 2FA enabled and a strong, unique password. Payouts: Only the group owner account can pay out the saved Robux from the group funds. Pending Robux: After using this feature, the Robux will be pending for approximately one month before they can be paid out.',
            confirmText: 'I Understand'
        });

        const entered = await showCustomDialog({
            mode: 'prompt',
            title: 'Enter Place ID',
            message: 'Enter the Place ID of your Robux Saver game. See template-place/README.md for setup instructions.',
            confirmText: 'Save Place ID',
            cancelText: 'Cancel',
            initialValue: ''
        });
        if (!entered) return null;

        const normalized = String(entered).trim();
        if (!/^\d+$/.test(normalized)) {
            await showCustomDialog({
                mode: 'alert',
                title: 'Invalid Place ID',
                message: 'Invalid Place ID. Please enter numbers only.',
                confirmText: 'OK'
            });
            return null;
        }

        await Promise.all([
            setFeatureConfigPatch({ placeId: normalized }),
            setStorageValue(chrome.storage.local, PLACE_ID_LEGACY_KEY, normalized)
        ]);
        return normalized;
    }

    function closePurchaseModal(modal) {
        const closeButton = getModalCloseButton(modal);
        if (closeButton) {
            closeButton.click();
        }
    }

    function launchMultiplayerGame(placeId, launchData) {
        const parsedPlaceId = parseInt(placeId, 10);
        if (!Number.isFinite(parsedPlaceId) || parsedPlaceId <= 0) {
            return;
        }

        const payload = { launchData };
        const codeToInject = `if (typeof Roblox !== 'undefined' && Roblox.GameLauncher && typeof Roblox.GameLauncher.joinMultiplayerGame === 'function') { Roblox.GameLauncher.joinMultiplayerGame(${parsedPlaceId}, false, false, null, null, ${JSON.stringify(payload)}); }`;

        chrome.runtime.sendMessage({
            action: 'injectScript',
            codeToInject
        });
    }

    async function handleSaveButtonClick(modal, context) {
        var placeId = await ensurePlaceId();
        if (!placeId) return;

        var accurateSavings = await calculateAccurateSavings(context);
        if (Number.isFinite(accurateSavings)) {
            context.savings = accurateSavings;
        }

        closePurchaseModal(modal);
        showSaveNotification(context);

        // Poll until modal is removed from DOM before launching
        var attempts = 0;
        var checkInterval = setInterval(function() {
            attempts++;
            if (!modal.isConnected || attempts > 50) {
                clearInterval(checkInterval);
                try { launchMultiplayerGame(placeId, context.launchData); } catch(e) {}
            }
        }, 50);
    }

    function showSaveNotification(context) {
        // Show a brief toast confirming the savings before Roblox launches
        if (!document.body) return;

        var toast = document.createElement('div');
        toast.className = 'purpura-slr-toast';
        toast.innerHTML = '<span style="font-weight:600">Saving ' + formatNumber(context.savings) + ' Robux</span><span style="opacity:0.7;font-size:12px">Launching Roblox...</span>';
        toast.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:999999;background:var(--modal-background,#252934);color:var(--text-color-primary,#f2f4f8);border:1px solid var(--divider-color,rgba(110,118,138,0.55));border-radius:12px;padding:12px 18px;display:flex;flex-direction:column;gap:2px;font-family:var(--font-family,sans-serif);font-size:14px;box-shadow:0 8px 32px rgba(0,0,0,0.4);animation:purpuraSaveToastIn 0.3s ease-out';
        document.body.appendChild(toast);

        setTimeout(function() {
            if (toast.parentNode) {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.2s';
                setTimeout(function() { if (toast.parentNode) toast.remove(); }, 200);
            }
        }, 5000);
    }

    function ensureStyles() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .${BUTTON_CLASS} {
                cursor: pointer;
                margin: 0 8px;
            }

            .${DIALOG_OVERLAY_CLASS} {
                position: fixed;
                inset: 0;
                background: rgba(12,14,20,0.68);
                backdrop-filter: blur(4px);
                z-index: 100000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 18px;
                animation: purpuraSaveDialogFadeIn 0.18s ease-out;
            }

            .${DIALOG_CLASS} {
                width: min(440px, 100%);
                border-radius: 12px;
                border: 1px solid var(--t-border, var(--divider-color, rgba(110,118,138,0.55)));
                background: var(--t-surface-2, var(--modal-background, var(--t-surface, #1f1f23)));
                box-shadow: 0 12px 40px rgba(0,0,0,0.3);
                color: var(--t-text, var(--text-color-primary, #f2f4f8));
                padding: 24px;
                font-family: var(--font-family, 'Builder Sans', Arial, sans-serif);
                animation: purpuraSaveDialogPopIn 0.24s cubic-bezier(.21,1.08,.27,1);
            }

            .${DIALOG_CLASS}.mode-alert {
                border-color: rgba(207,164,93,0.68);
            }


            .${DIALOG_TITLE_CLASS} {
                margin: 0 0 10px;
                font-size: 17px;
                font-weight: 700;
                line-height: 1.3;
            }

            .${DIALOG_MESSAGE_CLASS} {
                margin: 0;
                font-size: 14px;
                line-height: 1.5;
                color: var(--text-color-secondary, rgba(215, 221, 236, 0.9));
                white-space: pre-line;
            }

            .${DIALOG_INPUT_CLASS} {
                width: 100%;
                margin-top: 10px;
                border-radius: 10px;
                border: 1px solid var(--divider-color, rgba(118, 127, 149, 0.6));
                background: var(--input-background, #1f2330);
                color: var(--text-color-primary, #f2f4f8);
                padding: 11px 12px;
                font-size: 14px;
                outline: none;
                transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
            }

            .${DIALOG_INPUT_CLASS}:focus {
                border-color: var(--primary-button-background, #3a65ff);
                box-shadow: 0 0 0 3px rgba(58,101,255,0.2);
            }

            .${DIALOG_ERROR_CLASS} {
                margin-top: 8px;
                color: #ff8c87;
                font-size: 12px;
                line-height: 1.35;
                display: none;
            }

            .${DIALOG_ACTIONS_CLASS} {
                display: flex;
                justify-content: flex-end;
                gap: 9px;
                margin-top: 18px;
            }

            .${DIALOG_BUTTON_CLASS} {
                border: 1px solid transparent;
                border-radius: 8px;
                padding: 10px 20px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                min-width: 100px;
                transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease;
            }

            .${DIALOG_BUTTON_CLASS}:active {
                transform: scale(0.97);
            }

            .${DIALOG_BUTTON_CLASS}.cancel {
                border-color: var(--t-border, var(--divider-color, rgba(118,127,149,0.6)));
                background: transparent;
                color: var(--t-text, var(--text-color-primary, #f2f4f8));
            }

            .${DIALOG_BUTTON_CLASS}.cancel:hover {
                background: var(--t-surface-hover, rgba(255,255,255,0.06));
            }

            .${DIALOG_BUTTON_CLASS}.confirm {
                border-color: transparent;
                background: var(--t-accent, var(--button-primary-background, #00b06f));
                color: #ffffff;
            }

            .${DIALOG_BUTTON_CLASS}.confirm:hover {
                filter: brightness(1.1);
            }

            @keyframes purpuraSaveDialogFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes purpuraSaveDialogPopIn {
                from { transform: translateY(16px) scale(0.96); opacity: 0; }
                to { transform: translateY(0) scale(1); opacity: 1; }
            }

            @keyframes purpuraSaveToastIn {
                from { transform: translateY(16px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;

        (document.head || document.documentElement).appendChild(style);
    }

    function clearInjectedButtons() {
        document.querySelectorAll(`.${BUTTON_CLASS}`).forEach(function(btn) {
            btn.remove();
        });
        document.querySelectorAll('.purpura-balance-after').forEach(function(el) {
            el.remove();
        });
    }

    function upsertSaveButton(modal) {
        if (!modal || !document.body.contains(modal)) return;

        const buyButton = getModalBuyButton(modal);

        function removeInjections() {
            modal.querySelectorAll(`.${BUTTON_CLASS}`).forEach(function(b) { b.remove(); });
            modal.querySelectorAll('.purpura-balance-after').forEach(function(el) { el.remove(); });
        }

        if (!enabled || !buyButton) {
            removeInjections();
            return;
        }

        const context = getPurchaseContext(modal);
        if (!context || !context.launchData) {
            removeInjections();
            return;
        }

        ensureStyles();

        // Clone the original buy button classes so our button matches Roblox's native look
        var existingBtn = modal.querySelector(`.${BUTTON_CLASS}`);
        if (existingBtn) {
            var existingKey = existingBtn.getAttribute('data-purpura-launch-data');
            if (existingKey === context.launchData) return;
            existingBtn.remove();
        }

        var button = document.createElement(buyButton.tagName.toLowerCase() || 'button');
        button.type = 'button';
        button.className = filterStructuralClasses(buyButton.className) + ' bg-action-emphasis content-action-emphasis ' + BUTTON_CLASS;
        button.textContent = t('saveLots_saveAmountRobux', [formatNumber(context.savings)]);
        button.setAttribute('data-purpura-launch-data', context.launchData);
        button.addEventListener('click', function() {
            handleSaveButtonClick(modal, context);
        });

        // Insert after the original buy button in its parent
        buyButton.insertAdjacentElement('afterend', button);

        calculateAccurateSavings(context).then(function(accurateSavings) {
            if (!Number.isFinite(accurateSavings)) return;
            if (!button.isConnected) return;
            if (button.getAttribute('data-purpura-launch-data') !== context.launchData) return;

            context.savings = accurateSavings;
            button.textContent = t('saveLots_saveAmountRobux', [formatNumber(accurateSavings)]);
        }).catch(function() {});
    }

    function scan(root = document) {
        if (!root || typeof root.querySelectorAll !== 'function') return;

        const modals = [];

        if (root.nodeType === 1 && root.matches && root.matches(MODAL_SELECTOR)) {
            modals.push(root);
        }

        root.querySelectorAll(MODAL_SELECTOR).forEach(modal => modals.push(modal));

        const seen = new Set();
        modals.forEach(modal => {
            if (seen.has(modal)) return;
            seen.add(modal);
            upsertSaveButton(modal);
        });
    }

    function scheduleScan() {
        if (scanTimer) {
            clearTimeout(scanTimer);
        }

        scanTimer = setTimeout(() => {
            scanTimer = 0;
            scan();
        }, 60);
    }

    function startObserver() {
        if (observer || !document.documentElement) return;

        observer = new MutationObserver(() => {
            if (!enabled) return;
            scheduleScan();
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
        });
    }

    function stopObserver() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }

        if (scanTimer) {
            clearTimeout(scanTimer);
            scanTimer = 0;
        }
    }

    function setEnabled(value) {
        enabled = !!value;

        if (enabled) {
            ensureStyles();
            startObserver();
            scheduleScan();
            return;
        }

        stopObserver();
        clearInjectedButtons();
    }

    function loadEnabledSetting() {
        window.__PurpuraSettings.ready.then(function() {
            const rawVal = window.__PurpuraSettings.get(TOGGLE_KEY);
            setEnabled(parseFeatureEnabledFromRaw(rawVal));
        });
    }

    function bindNavigationEvents() {
        const onNavigate = () => {
            if (enabled) scheduleScan();
        };

        const originalPushState = history.pushState;
        history.pushState = function() {
            const result = originalPushState.apply(this, arguments);
            onNavigate();
            return result;
        };

        const originalReplaceState = history.replaceState;
        history.replaceState = function() {
            const result = originalReplaceState.apply(this, arguments);
            onNavigate();
            return result;
        };

        window.addEventListener('popstate', onNavigate);
        window.addEventListener('hashchange', onNavigate);
    }

    function getExpectedPriceFromButtonContext(button) {
        if (!button) return 0;

        const directPrice = cleanPrice(
            button.getAttribute('data-expected-price') ||
            button.dataset.expectedPrice ||
            button.getAttribute('data-price') ||
            button.dataset.price ||
            ''
        );
        if (directPrice > 0) return directPrice;

        const containers = [];
        if (button.parentElement) containers.push(button.parentElement);

        const scopedParent = button.closest('.item-card-container, .item-card, .item-details-info-header, .item-details-info-content, .game-pass-detail, .purchase-button-container, [data-testid*="purchase"]');
        if (scopedParent && !containers.includes(scopedParent)) {
            containers.push(scopedParent);
        }

        for (const container of containers) {
            const attrPrice = cleanPrice(
                container.getAttribute('data-expected-price') ||
                container.dataset.expectedPrice ||
                container.getAttribute('data-price') ||
                container.dataset.price ||
                ''
            );
            if (attrPrice > 0) return attrPrice;

            const priceNodes = container.querySelectorAll('[data-testid*="price"], .text-robux, .text-robux-lg, .item-price, .price, .icon-robux-container');
            for (const node of priceNodes) {
                const contextText = getElementContextText(node, container);
                if (isBalanceLikeContext(contextText)) continue;

                const values = extractPriceCandidates(node.textContent || '');
                if (values.length) {
                    return values[0];
                }
            }
        }

        return 0;
    }

    function capturePurchaseClick(event) {
        const target = event.target;
        if (!target || typeof target.closest !== 'function') return;

        const button = target.closest('.PurchaseButton, .shopping-cart-buy-button, .btn-primary-md, .btn-primary-lg, [data-product-id], [data-item-id], [data-asset-id]');
        if (!button) return;

        if (button.closest('.modal-dialog, .modal-content, .unified-purchase-dialog-content, .foundation-web-dialog-content')) {
            return;
        }

        const linked = extractLinkedItemInfo(button);

        const itemId = button.getAttribute('data-item-id') || button.dataset.itemId || button.getAttribute('data-asset-id') || button.dataset.assetId || (linked ? linked.id : null) || null;
        const productId = button.getAttribute('data-product-id') || button.dataset.productId || null;
        const expectedPrice = getExpectedPriceFromButtonContext(button);
        const name = (button.getAttribute('data-item-name') || button.dataset.itemName || '').trim();

        let isGamePass = false;
        if (linked && linked.type === 'gamepass') {
            isGamePass = true;
        }
        if (window.location.pathname.toLowerCase().includes('/game-pass/') || window.location.pathname.toLowerCase().includes('/games/')) {
            isGamePass = true;
        }

        lastClickedPurchaseData = {
            timestamp: Date.now(),
            itemId,
            productId,
            expectedPrice,
            name,
            isGamePass
        };
    }

    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== 'sync') return;
        if (!Object.prototype.hasOwnProperty.call(changes, TOGGLE_KEY)) return;
        setEnabled(parseFeatureEnabledFromRaw(window.__PurpuraSettings.get(TOGGLE_KEY)));
    });

    document.addEventListener('click', capturePurchaseClick, true);

    bindNavigationEvents();
    loadEnabledSetting();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (enabled) scheduleScan();
        }, { once: true });
    } else {
        if (enabled) scheduleScan();
    }
})();
