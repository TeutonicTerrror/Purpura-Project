/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
    'use strict';

    if (window.purpuraRemainingRobuxInitialized) return;
    window.purpuraRemainingRobuxInitialized = true;

    const STORAGE_KEY = 'rr';
    const STYLE_ID = 'purpura-remaining-robux-style';
    const CONTAINER_CLASS = 'purpura-remaining-robux-container';
    const MODAL_SELECTOR = '.modal-content, .unified-purchase-dialog-content, .foundation-web-dialog-content';

    let enabled = false;
    let observer = null;
    let scanTimer = 0;
    let robuxBalance = null;
    let balanceCacheTime = 0;
    const BALANCE_CACHE_DURATION = 30000;


    const priceCache = new Map();
    let lastCachedPrice = 0;

    function cachePrice(key, price) {
        const floored = Math.floor(price);
        priceCache.set(key, floored);
        lastCachedPrice = floored;
    }

    (function installFetchInterceptor() {
        const _wrappedFetch = window.fetch;

        window.fetch = function(input, init) {
            const requestUrl = typeof input === 'string' ? input : (input instanceof Request ? input.url : '');

            const promise = _wrappedFetch(input, init);

            promise.then(function(response) {
                if (!response || !response.ok) return;

                try {
                    if (requestUrl.includes('/marketplace-items/v1/items/details')) {
                        response.clone().json().then(function(data) {
                            if (data && Array.isArray(data.data)) {
                                for (var i = 0; i < data.data.length; i++) {
                                    var item = data.data[i];
                                    var price = item.price || item.lowestPrice || item.priceInRobux || 0;
                                    if (price > 0 && item.id) {
                                        cachePrice('item-' + item.id, price);
                                    }
                                }
                            }
                            if (lastCachedPrice > 0 && enabled) scheduleScan();
                        }).catch(function() {});
                    }
                    else if (requestUrl.includes('/game-passes/v1/game-passes/') && requestUrl.includes('/product-info')) {
                        var idMatch = requestUrl.match(/\/game-passes\/(\d+)/);
                        if (idMatch) {
                            var gamePassId = idMatch[1];
                            response.clone().json().then(function(data) {
                                var price = data && (data.PriceInRobux || data.priceInRobux || data.price || 0);
                                if (price > 0) {
                                    cachePrice('gamepass-' + gamePassId, price);
                                    if (enabled) scheduleScan();
                                }
                            }).catch(function() {});
                        }
                    }
                    else if (requestUrl.includes('economy.roblox.com') && requestUrl.includes('/assets/') && requestUrl.includes('/details')) {
                        var idMatch = requestUrl.match(/\/assets\/(\d+)/);
                        if (idMatch) {
                            var assetId = idMatch[1];
                            response.clone().json().then(function(data) {
                                var price = data && (data.PriceInRobux || data.price || 0);
                                if (price > 0) {
                                    cachePrice('item-' + assetId, price);
                                    if (enabled) scheduleScan();
                                }
                            }).catch(function() {});
                        }
                    }
                    else if (requestUrl.includes('/v1/catalog/items/') && requestUrl.includes('/details')) {
                        var idMatch = requestUrl.match(/\/items\/(\d+)\/details/);
                        if (idMatch) {
                            var catalogId = idMatch[1];
                            response.clone().json().then(function(data) {
                                var price = data && (data.PriceInRobux || data.price || data.priceInRobux || 0);
                                if (price > 0) {
                                    cachePrice('item-' + catalogId, price);
                                    if (enabled) scheduleScan();
                                }
                            }).catch(function() {});
                        }
                    }
                } catch (e) {
                }
            }).catch(function() {});

            return promise;
        };
    })();


    function getItemIdFromPage() {
        const path = window.location.pathname;
        if (!path) return null;

        let m = path.match(/\/catalog\/(\d+)/);
        if (m) return { type: 'item', id: m[1] };

        m = path.match(/\/game-pass\/(\d+)/);
        if (m) return { type: 'gamepass', id: m[1] };


        return null;
    }

    function getItemIdFromModal(modal) {
        if (!modal) return null;

        const dataAttrs = ['data-item-id', 'data-asset-id', 'data-product-id', 'data-gamepass-id',
            'data-itemid', 'data-assetid', 'data-productid', 'data-gamepassid'];
        for (const attr of dataAttrs) {
            const val = modal.getAttribute(attr);
            if (val && /^\d+$/.test(val)) {
                return { type: attr.includes('gamepass') ? 'gamepass' : 'item', id: val };
            }
        }

        const imgs = modal.querySelectorAll('img[src*="asset"], img[src*="game-pass"], img[src*="avatar"], img[src*="catalog"]');
        for (const img of imgs) {
            const src = img.getAttribute('src') || '';
            const m = src.match(/\/(?:asset|game-pass|avatar|item)s?\/(\d+)/i) || src.match(/[?&]id=(\d+)/);
            if (m) return { type: 'item', id: m[1] };
        }

        return null;
    }

    function findCachedPrice(modal) {
        const pageItem = getItemIdFromPage();
        if (pageItem) {
            const key = pageItem.type === 'gamepass' ? 'gamepass-' + pageItem.id : 'item-' + pageItem.id;
            const cached = priceCache.get(key);
            if (cached && cached > 0) return cached;
        }

        const modalItem = getItemIdFromModal(modal);
        if (modalItem) {
            const key = modalItem.type === 'gamepass' ? 'gamepass-' + modalItem.id : 'item-' + modalItem.id;
            const cached = priceCache.get(key);
            if (cached && cached > 0) return cached;
        }

        return lastCachedPrice;
    }


    function cleanPrice(value) {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value > 0 ? Math.floor(value) : 0;
        }

        const text = String(value || '').replace(/\u00A0/g, ' ');
        const match = text.match(/\d{1,3}(?:,\d{3})+|\d+/g);
        if (!match) return 0;

        return match
            .map(part => parseInt(part.replace(/,/g, ''), 10))
            .filter(n => Number.isFinite(n) && n > 0)
            .reduce((best, n) => n < best ? n : best, Infinity);
    }

    function formatNumber(value) {
        const n = Number(value);
        if (!Number.isFinite(n)) return '0';
        return n.toLocaleString();
    }


    function getBalanceFromModal(modal) {
        if (!modal) return null;

        var heading = modal.querySelector('#rbx-unified-purchase-heading, .purchase-heading, .modal-header h2, .dialog-header h2');
        if (heading) {
            var balanceEl = heading.querySelector('.text-robux, .text-robux-lg, .text-robux-md');
            if (balanceEl) {
                var balance = cleanPrice(balanceEl.textContent);
                if (balance > 0) return balance;
            }
        }

        var userBalanceEl = modal.querySelector('#user-balance, [data-testid*="user-balance"], .user-balance');
        if (userBalanceEl) {
            var robuxEl = userBalanceEl.querySelector('.text-robux, .text-robux-lg');
            if (robuxEl) {
                var balance = cleanPrice(robuxEl.textContent);
                if (balance > 0) return balance;
            }
        }

        return null;
    }

    async function getAuthenticatedUserId() {
        const meta = document.querySelector('meta[name="user-data"]');
        if (meta) {
            const userId = meta.getAttribute('data-userid');
            if (userId && /^\d+$/.test(userId)) return userId;
        }

        try {
            const response = await fetch('https://users.roblox.com/v1/users/authenticated', {
                credentials: 'include'
            });
            if (!response.ok) return null;
            const data = await response.json();
            return data && data.id ? String(data.id) : null;
        } catch {
            return null;
        }
    }

    var _balanceFetchPromise = null;

    async function fetchRobuxBalance() {
        if (robuxBalance !== null && (Date.now() - balanceCacheTime) < BALANCE_CACHE_DURATION) {
            return robuxBalance;
        }

        if (_balanceFetchPromise) return _balanceFetchPromise;

        _balanceFetchPromise = (async () => {
            try {
                const userId = await getAuthenticatedUserId();
                if (!userId) return robuxBalance;

                const response = await fetch(`https://economy.roblox.com/v1/users/${userId}/currency`, {
                    credentials: 'include'
                });
                if (!response.ok) return robuxBalance;

                const data = await response.json();
                const robux = Number(data && data.robux);
                if (Number.isFinite(robux)) {
                    robuxBalance = Math.floor(robux);
                    balanceCacheTime = Date.now();
                    return robuxBalance;
                }
                return robuxBalance;
            } catch {
                return robuxBalance;
            } finally {
                _balanceFetchPromise = null;
            }
        })();

        return _balanceFetchPromise;
    }


    function getPriceFromModal(modal) {
        if (!modal) return 0;

        const cachedPrice = findCachedPrice(modal);
        if (cachedPrice > 0) return cachedPrice;


        const heading = modal.querySelector('#rbx-unified-purchase-heading, .purchase-heading, .modal-header h2, .dialog-header h2');

        const exactPriceEl = modal.querySelector(
            '[data-testid="purchase-total-price"], [data-testid*="purchase-total"], [data-testid*="price"], .purchase-total-price'
        );
        if (exactPriceEl) {
            const price = cleanPrice(exactPriceEl.textContent);
            if (price > 0) return price;
        }

        const allRobuxEls = modal.querySelectorAll('.text-robux-lg, .text-robux, .text-robux-md');
        for (const el of allRobuxEls) {
            if (heading && heading.contains(el)) continue;

            const price = cleanPrice(el.textContent);
            if (price > 0) return price;
        }

        const candidates = modal.querySelectorAll('.icon-robux-container, .amount');
        for (const el of candidates) {
            if (heading && heading.contains(el)) continue;
            const price = cleanPrice(el.textContent);
            if (price > 0) return price;
        }

        return 0;
    }


    function injectRemainingBalance(modal) {
        if (!enabled || !modal || !document.body.contains(modal)) return;

        const price = getPriceFromModal(modal);
        if (!price || price <= 0) return;

        const infoContainer = modal.querySelector(
            '.min-w-0.flex.flex-col.gap-small, ' +
            '.purchase-info-container, ' +
            '.modal-message, ' +
            '.modal-body, ' +
            '.foundation-web-dialog-body'
        );
        if (!infoContainer) return;

        let container = modal.querySelector(`.${CONTAINER_CLASS}`);
        if (!container) {
            container = document.createElement('div');
            container.className = CONTAINER_CLASS;
            container.style.cssText = 'width:100%;margin-top:8px;padding-top:8px;border-top:1px solid var(--purpura-rr-divider);';
            infoContainer.appendChild(container);
        }

        const updateDisplay = () => {
            if (!enabled || !container.isConnected) return;
            const currentPrice = getPriceFromModal(modal);
            if (!currentPrice || currentPrice <= 0) return;

            const after = robuxBalance !== null
                ? robuxBalance - currentPrice
                : null;

            if (after === null) {
                container.innerHTML = `
                    <span class="text-body-medium" style="color:var(--purpura-rr-text-secondary);font-size:13px;">
                        Loading your Robux balance...
                    </span>`;
            } else {
                container.innerHTML = `
                    <span class="text-body-medium" style="color:var(--purpura-rr-text-secondary);font-size:13px;">
                        Your balance after this transaction will be
                        <span class="icon-robux-16x16" style="vertical-align: middle; position: relative; top: -1px;"></span>
                        <span class="text-robux" style="${after < 0 ? 'color:var(--purpura-rr-negative);' : ''}font-weight:600;">
                            ${formatNumber(after)}
                        </span>
                    </span>`;
            }
        };

        var domBalance = getBalanceFromModal(modal);
        if (domBalance !== null) {
            robuxBalance = domBalance;
            updateDisplay();
            return;
        }

        updateDisplay();
        fetchRobuxBalance().then(function(balance) {
            if (balance !== null) robuxBalance = balance;
            if (container.isConnected) updateDisplay();
        });
    }

    function ensureStyles() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = ':root{--purpura-rr-divider:rgba(110,118,138,0.35);--purpura-rr-text-secondary:rgba(215,221,236,0.9);--purpura-rr-negative:#d32f2f}' +
            `.${CONTAINER_CLASS} {
                animation: purpuraRemainingRobuxFadeIn 0.18s ease-out;
            }

            @keyframes purpuraRemainingRobuxFadeIn {
                from { opacity: 0; transform: translateY(4px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        (document.head || document.documentElement).appendChild(style);
    }

    function scan(root = document) {
        if (!root || typeof root.querySelectorAll !== 'function') return;

        document.querySelectorAll(`.${CONTAINER_CLASS}`).forEach(container => {
            if (!container.isConnected || !container.closest(MODAL_SELECTOR)) {
                container.remove();
            }
        });

        const modals = [];
        if (root.nodeType === 1 && root.matches && root.matches(MODAL_SELECTOR)) {
            modals.push(root);
        }
        root.querySelectorAll(MODAL_SELECTOR).forEach(modal => modals.push(modal));

        const seen = new Set();
        modals.forEach(modal => {
            if (seen.has(modal)) return;
            seen.add(modal);
            injectRemainingBalance(modal);
        });
    }

    function scheduleScan() {
        if (scanTimer) clearTimeout(scanTimer);
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
            subtree: true
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
        document.querySelectorAll(`.${CONTAINER_CLASS}`).forEach(el => el.remove());
        robuxBalance = null;
        balanceCacheTime = 0;
    }

    function loadSettings() {
        window.__PurpuraSettings.ready.then(function() {
            const rawVal = window.__PurpuraSettings.get(STORAGE_KEY);
            setEnabled(rawVal === true);
        });
    }

    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== 'sync') return;
        if (!Object.prototype.hasOwnProperty.call(changes, STORAGE_KEY)) return;
        loadSettings();
    });

    loadSettings();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (enabled) scheduleScan();
        }, { once: true });
    } else {
        if (enabled) scheduleScan();
    }
})();
