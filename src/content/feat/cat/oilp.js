/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';
    if (window.__purpuraOilpLoaded) return;
    window.__purpuraOilpLoaded = true;

    var STORAGE_KEY = 'oilp';
    var STYLE_ID = 'purpura-oilp-style';
    var CLASS_ICON = 'purpura-oilp-icon';
    var CLASS_TIP = 'purpura-oilp-tip';
    var CLASS_TEXT = 'purpura-oilp-text';
    var DATASET_CARD = 'purpuraOilp';
    var DATASET_DETAIL = 'purpuraOilpDetail';

    var enabled = true;
    var observer = null;
    var scanTimer = 0;
    var urlPollInterval = null;
    var lastUrl = location.href;
    var inflight = new Set();

    var itemPrices = new Map();
    var itemIsOffSale = new Map();
    var itemDeadlines = new Map();
    var pendingCards = new Map();

    var ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>';

    function getEnabled(value) {
        if (value === undefined) return true;
        return value === true;
    }

    function getAssetIdFromUrl(url) {
        url = url || window.location.href;
        try {
            var urlObj = new URL(url, window.location.origin);
            var qp = urlObj.searchParams.get('PlaceId');
            if (qp) return qp;
            var m = urlObj.pathname.match(/^(?:\/[a-z]{2}(?:-[a-z]{2})?)?\/(?:games|catalog|bundles|hidden-catalog|looks|library|game-pass|private-games)\/(\d+)/i);
            if (m && m[1]) return m[1];
        } catch (e) {}
        var match = String(url).match(/\/(?:games|catalog|bundles|hidden-catalog|looks|library|game-pass|private-games)\/(\d+)/);
        return match ? match[1] : null;
    }

    function getItemTypeFromHref(href) {
        if (!href) return 'Asset';
        return href.toLowerCase().indexOf('/bundles/') !== -1 ? 'Bundle' : 'Asset';
    }

    function isOffSale(data) {
        return data && (data.isOffSale === true || data.noPriceStatus === 'OffSale' || data.priceStatus === 'Off Sale' || data.isPurchasable === false);
    }

    function ensureStyles() {
        if (document.getElementById(STYLE_ID)) return;
        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = '.' + CLASS_ICON + '{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;margin-left:6px;vertical-align:middle;border-radius:50%;background:var(--purpura-surface200,var(--color-surface-200,#2b2c32));color:var(--purpura-secondaryText,var(--color-content-muted,#a3a3a3));cursor:help;flex-shrink:0;position:relative} .' + CLASS_TIP + '{position:absolute;left:50%;bottom:100%;transform:translateX(-50%);margin-bottom:8px;min-width:200px;max-width:300px;padding:10px 12px;border-radius:8px;background:var(--purpura-surface100,var(--color-surface-100,#1f2025));border:1px solid var(--purpura-surface300,var(--color-stroke-default,rgba(255,255,255,.14)));color:var(--purpura-mainText,var(--color-content-emphasis,#fff));font-size:12px;line-height:1.45;box-shadow:0 8px 24px rgba(0,0,0,.35);z-index:9999;display:none;white-space:normal} .' + CLASS_ICON + ':hover .' + CLASS_TIP + ',.' + CLASS_ICON + ':focus-within .' + CLASS_TIP + '{display:block} .' + CLASS_TEXT + '{margin-top:5px;font-size:12px;color:var(--purpura-secondaryText,var(--color-content-muted,#a3a3a3));display:flex;align-items:center;gap:4px;flex-wrap:wrap;line-height:1.45} .' + CLASS_TEXT + ' .icon-robux-16x16{flex-shrink:0;vertical-align:middle;display:inline-block!important;transform:scale(0.75);transform-origin:center center;margin:0 -3px 0 -2px} .' + CLASS_TIP + ' .purpura-oilp-line{display:flex;align-items:center;gap:4px;flex-wrap:wrap;line-height:1.5} .' + CLASS_TIP + ' .purpura-oilp-amount{display:inline-flex;align-items:center;gap:1px;font-weight:600;white-space:nowrap;line-height:1;vertical-align:middle;margin-left:1px} .' + CLASS_TIP + ' .purpura-oilp-amount .icon-robux-16x16{flex-shrink:0;vertical-align:middle;display:inline-block!important;transform:scale(0.75);transform-origin:center center;margin:0 -3px 0 -2px}';
        (document.head || document.documentElement).appendChild(style);
    }

    function fetchJson(endpoint, subdomain, opts) {
        var host = subdomain ? subdomain + '.roblox.com' : 'www.roblox.com';
        var url = 'https://' + host + endpoint;
        var fetchOpts = { credentials: 'include' };
        if (opts && opts.method) fetchOpts.method = opts.method;
        if (opts && opts.body) {
            fetchOpts.headers = { 'Content-Type': 'application/json' };
            fetchOpts.body = typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body);
        }
        return fetch(url, fetchOpts).then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        });
    }

    function amountHtml(value) {
        return '<span class="purpura-oilp-amount"><span class="icon-robux-16x16"></span>' + Number(value).toLocaleString() + '</span>';
    }

    function formatDeadline(deadline) {
        try {
            var d = new Date(deadline);
            if (isNaN(d.getTime()) || d.getFullYear() < 2000) return null;
            return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        } catch (e) { return null; }
    }

    function addIcon(container, price, deadline) {
        if (!container || container.querySelector('.' + CLASS_ICON)) return;
        ensureStyles();
        var icon = document.createElement('div');
        icon.className = CLASS_ICON;
        icon.setAttribute('tabindex', '0');
        icon.setAttribute('role', 'img');
        icon.setAttribute('aria-label', 'Previous Price');
        icon.innerHTML = ICON_SVG;
        var hasDeadline = deadline && formatDeadline(deadline);
        var formatted = hasDeadline ? formatDeadline(deadline) : null;
        var robuxHtml = amountHtml(price);
        var tip = document.createElement('div');
        tip.className = CLASS_TIP;
        if (formatted) {
            var lastOnSale = chrome.i18n.getMessage('oilp_lastOnSale') || 'Last on sale';
            var forWord = chrome.i18n.getMessage('oilp_for') || 'for';
            tip.innerHTML = '<div class="purpura-oilp-line">' + lastOnSale + ' ' + formatted + ' ' + forWord + ' ' + robuxHtml + '</div>';
        } else {
            var prevText = chrome.i18n.getMessage('oilp_previousPrice') || 'Previous Price:';
            tip.innerHTML = '<div class="purpura-oilp-line">' + prevText + ' ' + robuxHtml + '</div>';
        }
        icon.appendChild(tip);
        container.appendChild(icon);
    }

    function addTextPrice(container, price, deadline) {
        if (!container || container.querySelector('.' + CLASS_TEXT)) return;
        ensureStyles();
        var div = document.createElement('div');
        div.className = CLASS_TEXT;
        var hasDeadline = deadline && formatDeadline(deadline);
        var formatted = hasDeadline ? formatDeadline(deadline) : null;
        if (formatted) {
            var lastOnSale = chrome.i18n.getMessage('oilp_lastOnSale') || 'Last on sale';
            var forWord = chrome.i18n.getMessage('oilp_for') || 'for';
            div.appendChild(document.createTextNode(lastOnSale + ' ' + formatted + ' ' + forWord + ' '));
        } else {
            var prevText = chrome.i18n.getMessage('oilp_previousPrice') || 'Previous Price:';
            div.appendChild(document.createTextNode(prevText + ' '));
        }
        var robuxIcon = document.createElement('span');
        robuxIcon.className = 'icon-robux-16x16';
        div.appendChild(robuxIcon);
        var priceText = document.createElement('span');
        priceText.textContent = Number(price).toLocaleString();
        priceText.style.fontWeight = '600';
        div.appendChild(priceText);
        container.appendChild(div);
    }

    function addPriceIconToCard(card, assetId) {
        var price = itemPrices.get(assetId);
        var off = itemIsOffSale.get(assetId);
        var deadline = itemDeadlines.get(assetId);
        if (!off || price === undefined || price === null || price <= 1) return;
        if (card.matches && card.matches('.price-container-text')) {
            addTextPrice(card, price, deadline);
            return;
        }
        var container = card.querySelector('.text-overflow.item-card-price, .item-card-price');
        if (!container) {
            var caption = card.querySelector('.item-card-caption');
            if (caption) {
                var newContainer = document.createElement('div');
                newContainer.className = 'text-overflow item-card-price font-header-2 text-subheader margin-top-none';
                var offSaleSpan = document.createElement('span');
                offSaleSpan.className = 'text text-label text-robux-tile';
                offSaleSpan.textContent = (chrome.i18n.getMessage('oilp_offSale') || 'Off Sale');
                newContainer.appendChild(offSaleSpan);
                caption.appendChild(newContainer);
                container = newContainer;
            }
        }
        if (container && !container.querySelector('.' + CLASS_ICON)) addIcon(container, price, deadline);
    }

    function handleItemCard(card) {
        if (!card || !card.isConnected) return;
        if (card.dataset[DATASET_CARD]) return;
        var link = card.querySelector('.item-card-link') || card.querySelector('a[href*="/catalog/"]') || card.querySelector('a[href*="/bundles/"]') || card.querySelector('a[href*="/library/"]');
        if (!link) return;
        var href = link.getAttribute('href') || '';
        var m = href.match(/\/(?:catalog|bundles|hidden-catalog|looks|library|game-pass|private-games)\/(\d+)/i);
        if (!m) return;
        var assetId = parseInt(m[1], 10);
        if (!assetId) return;
        var priceLabelContainer = card.querySelector('.text-overflow.item-card-price, .item-card-price');
        var shouldProcess = false;
        if (!priceLabelContainer) shouldProcess = true;
        else {
            var textContent = (priceLabelContainer.textContent || '').trim().toLowerCase();
            var hasRobux = !!priceLabelContainer.querySelector('.icon-robux-tile, .icon-robux, .icon-robux-16x16');
            if (!hasRobux || textContent.indexOf('off sale') !== -1 || textContent.indexOf('offsale') !== -1) shouldProcess = true;
        }
        if (!shouldProcess) return;
        if (itemPrices.has(assetId) && itemIsOffSale.get(assetId)) {
            addPriceIconToCard(card, assetId);
            card.dataset[DATASET_CARD] = 'done';
            return;
        }
        if (card.querySelector('.' + CLASS_ICON)) {
            card.dataset[DATASET_CARD] = 'done';
            return;
        }
        if (!pendingCards.has(assetId)) pendingCards.set(assetId, []);
        var arr = pendingCards.get(assetId);
        if (arr.indexOf(card) === -1) arr.push(card);
        fetchDetailsForCard(assetId, getItemTypeFromHref(href));
    }

    function fetchDetailsForCard(assetId, itemType) {
        var key = assetId + '|' + itemType;
        if (inflight.has(key)) return;
        inflight.add(key);
        fetchJson('/v1/catalog/items/' + encodeURIComponent(assetId) + '/details?itemType=' + itemType, 'catalog').then(function (details) {
            if (!details) return;
            var price = details.price != null ? details.price : details.lowestPrice;
            if (price != null) itemPrices.set(assetId, price);
            itemIsOffSale.set(assetId, isOffSale(details));
            if (details.offSaleDeadline) itemDeadlines.set(assetId, details.offSaleDeadline);
            if (pendingCards.has(assetId)) {
                var list = pendingCards.get(assetId);
                pendingCards.delete(assetId);
                list.forEach(function (card) {
                    if (card && card.isConnected) addPriceIconToCard(card, assetId);
                    if (card) card.dataset[DATASET_CARD] = 'done';
                });
            }
        }).catch(function () {
            if (pendingCards.has(assetId)) {
                var lst = pendingCards.get(assetId);
                lst.forEach(function (c) { if (c) c.dataset[DATASET_CARD] = 'fail'; });
            }
        }).finally(function () {
            inflight.delete(key);
        });
    }

    function handleOffsalePriceContainer(container) {
        if (!container || container.dataset[DATASET_DETAIL]) return;
        container.dataset[DATASET_DETAIL] = 'true';
        var assetId = getAssetIdFromUrl();
        if (!assetId) return;
        var numeric = parseInt(assetId, 10);
        if (!numeric) return;
        var itemType = window.location.pathname.toLowerCase().indexOf('/bundles/') !== -1 ? 'Bundle' : 'Asset';
        var key = numeric + '|' + itemType;
        if (inflight.has(key)) {
            if (!pendingCards.has(numeric)) pendingCards.set(numeric, []);
            var p = pendingCards.get(numeric);
            if (p.indexOf(container) === -1) p.push(container);
            return;
        }
        var hasPrice = itemPrices.has(numeric) && itemPrices.get(numeric) > 1;
        var hasDeadline = itemDeadlines.has(numeric);
        if (hasPrice && hasDeadline) {
            addPriceIconToCard(container, numeric);
            return;
        }
        inflight.add(key);
        if (!pendingCards.has(numeric)) pendingCards.set(numeric, []);
        var pend = pendingCards.get(numeric);
        if (pend.indexOf(container) === -1) pend.push(container);
        fetchJson('/v1/catalog/items/' + encodeURIComponent(numeric) + '/details?itemType=' + itemType, 'catalog').then(function (details) {
            if (!details) return;
            var price = details.price != null ? details.price : details.lowestPrice;
            if (price != null) itemPrices.set(numeric, price);
            itemIsOffSale.set(numeric, isOffSale(details));
            if (details.offSaleDeadline) itemDeadlines.set(numeric, details.offSaleDeadline);
            var isOff = itemIsOffSale.get(numeric);
            var pr = itemPrices.get(numeric);
            if (isOff && pr != null && pr > 1) {
                if (pendingCards.has(numeric)) {
                    var list = pendingCards.get(numeric);
                    pendingCards.delete(numeric);
                    list.forEach(function (el) {
                        if (el && el.isConnected) addPriceIconToCard(el, numeric);
                    });
                } else {
                    addPriceIconToCard(container, numeric);
                }
            } else {
                pendingCards.delete(numeric);
            }
        }).catch(function () {
            pendingCards.delete(numeric);
        }).finally(function () {
            inflight.delete(key);
        });
    }

    function scanCards(root) {
        if (!enabled) return;
        ensureStyles();
        var cards = [];
        if (root && root.nodeType === 1) {
            if (root.matches && root.matches('.item-card')) cards.push(root);
            if (root.querySelectorAll) root.querySelectorAll('.item-card').forEach(function (c) { cards.push(c); });
        }
        if ((!root || cards.length === 0) && !root) {
            document.querySelectorAll('.item-card').forEach(function (c) { cards.push(c); });
        } else if (root && root.querySelectorAll && cards.length === 0) {
            root.querySelectorAll('.item-card').forEach(function (c) { cards.push(c); });
        }
        cards.forEach(handleItemCard);
    }

    function scanDetail(root) {
        if (!enabled) return;
        ensureStyles();
        var containers = [];
        if (root && root.nodeType === 1) {
            if (root.matches && root.matches('.price-container-text')) containers.push(root);
            if (root.querySelectorAll) root.querySelectorAll('.price-container-text').forEach(function (c) { containers.push(c); });
            if (root.querySelectorAll) root.querySelectorAll('.item-price-value.icon-text-wrapper.clearfix.icon-robux-price-container').forEach(function (c) {
                var parent = c.closest('.price-container-text') || c.parentElement;
                if (parent && containers.indexOf(parent) === -1) containers.push(parent);
            });
        } else if (!root) {
            document.querySelectorAll('.price-container-text').forEach(function (c) { containers.push(c); });
        }
        containers.forEach(handleOffsalePriceContainer);
        var offsaleEl = document.getElementById('offsale-since-date');
        if (offsaleEl) offsaleEl.style.display = 'none';
    }

    function scan(root) {
        if (!enabled) return;
        scanCards(root);
        scanDetail(root);
        if (!root) {
            var offsaleEl2 = document.getElementById('offsale-since-date');
            if (offsaleEl2) offsaleEl2.style.display = 'none';
        }
    }

    function scheduleScan() {
        if (scanTimer) clearTimeout(scanTimer);
        scanTimer = setTimeout(function () { scanTimer = 0; scan(document); }, 120);
    }

    function startObserver() {
        if (observer || !document.documentElement) return;
        observer = new MutationObserver(function (mutations) {
            if (!enabled) return;
            var should = false;
            for (var i = 0; i < mutations.length; i++) {
                var m = mutations[i];
                if (m.addedNodes && m.addedNodes.length) { should = true; break; }
                if (m.target && m.target.id === 'offsale-since-date') should = true;
            }
            if (should) scheduleScan();
            var el = document.getElementById('offsale-since-date');
            if (el && el.style.display !== 'none') el.style.display = 'none';
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    function stopObserver() {
        if (observer) { observer.disconnect(); observer = null; }
        if (scanTimer) { clearTimeout(scanTimer); scanTimer = 0; }
    }

    function onUrlChange() {
        var n = location.href;
        if (n === lastUrl) return;
        lastUrl = n;
        if (enabled) scheduleScan();
    }

    function startUrlPolling() {
        if (urlPollInterval) return;
        urlPollInterval = setInterval(onUrlChange, 800);
    }

    function stopUrlPolling() {
        if (urlPollInterval) { clearInterval(urlPollInterval); urlPollInterval = null; }
    }

    function setEnabled(next) {
        enabled = !!next;
        if (enabled) {
            ensureStyles();
            startObserver();
            startUrlPolling();
            scheduleScan();
            return;
        }
        stopObserver();
        stopUrlPolling();
        document.querySelectorAll('.' + CLASS_ICON).forEach(function (el) { el.remove(); });
        document.querySelectorAll('.' + CLASS_TEXT).forEach(function (el) { el.remove(); });
        document.querySelectorAll('[data-' + DATASET_CARD + ']').forEach(function (el) { try { delete el.dataset[DATASET_CARD]; } catch (_) { el.removeAttribute('data-' + DATASET_CARD); } });
        document.querySelectorAll('[data-' + DATASET_DETAIL + ']').forEach(function (el) { try { delete el.dataset[DATASET_DETAIL]; } catch (_) { el.removeAttribute('data-' + DATASET_DETAIL); } });
        pendingCards.clear();
        if (document.getElementById(STYLE_ID)) document.getElementById(STYLE_ID).remove();
        var offsaleEl = document.getElementById('offsale-since-date');
        if (offsaleEl) offsaleEl.style.display = '';
    }

    function loadSetting() {
        function doLoad() {
            window.__PurpuraSettings.ready.then(function () {
                setEnabled(getEnabled(window.__PurpuraSettings.get(STORAGE_KEY)));
            });
        }
        if (!window.__PurpuraSettings) {
            var attempts = 0;
            var poll = setInterval(function () {
                if (window.__PurpuraSettings) { clearInterval(poll); doLoad(); }
                else if (++attempts > 50) clearInterval(poll);
            }, 100);
            return;
        }
        doLoad();
    }

    loadSetting();
    chrome.storage.onChanged.addListener(function (changes, area) {
        if (area !== 'sync' || !changes[STORAGE_KEY]) return;
        loadSetting();
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { if (enabled) scheduleScan(); }, { once: true });
    } else if (enabled) scheduleScan();
    startObserver();
    startUrlPolling();

    var origPushState = history.pushState.bind(history);
    history.pushState = function () { var r = origPushState.apply(this, arguments); onUrlChange(); return r; };
    var origReplaceState = history.replaceState.bind(history);
    history.replaceState = function () { var r = origReplaceState.apply(this, arguments); onUrlChange(); return r; };
    window.addEventListener('popstate', onUrlChange);
})();
