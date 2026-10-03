/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';
    if (window.__purpuraPriceFloorLoaded) return;
    window.__purpuraPriceFloorLoaded = true;

    var STORAGE_KEY = 'pfl';
    var SELECTOR_PRICE = '.item-price-value.icon-text-wrapper.clearfix.icon-robux-price-container';
    var CLASS_ICON = 'purpura-price-floor-icon';
    var CLASS_TIP = 'purpura-price-floor-tip';
    var STYLE_ID = 'purpura-price-floor-style';

    var enabled = true;
    var observer = null;
    var scanTimer = 0;
    var urlPollInterval = null;
    var lastUrl = location.href;
    var inflight = new Map();
    var processed = new WeakMap();

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

    function getItemType() {
        return window.location.pathname.toLowerCase().indexOf('/bundles/') !== -1 ? 'Bundle' : 'Asset';
    }

    function ensureStyles() {
        if (document.getElementById(STYLE_ID)) return;
        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = '.' + CLASS_ICON + '{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;margin-left:6px;vertical-align:middle;border-radius:50%;background:var(--purpura-surface200,var(--color-surface-200,#2b2c32));color:var(--purpura-secondaryText,var(--color-content-muted,#a3a3a3));cursor:help;flex-shrink:0;position:relative} .' + CLASS_ICON + '{vertical-align:text-bottom} .' + CLASS_TIP + '{position:absolute;left:50%;bottom:100%;transform:translateX(-50%);margin-bottom:8px;min-width:220px;max-width:300px;padding:10px 12px;border-radius:8px;background:var(--purpura-surface100,var(--color-surface-100,#1f2025));border:1px solid var(--purpura-surface300,var(--color-stroke-default,rgba(255,255,255,.14)));color:var(--purpura-mainText,var(--color-content-emphasis,#fff));font-size:12px;line-height:1.45;box-shadow:0 8px 24px rgba(0,0,0,.35);z-index:9999;display:none;white-space:normal;line-height:1.45} .' + CLASS_ICON + ':hover .' + CLASS_TIP + ',.' + CLASS_ICON + ':focus-within .' + CLASS_TIP + '{display:block} .' + CLASS_TIP + ' .purpura-pfl-line{display:flex;align-items:center;gap:4px;flex-wrap:wrap;line-height:1.5} .' + CLASS_TIP + ' .purpura-pfl-label{font-weight:600} .' + CLASS_TIP + ' .purpura-pfl-amount{display:inline-flex;align-items:center;gap:1px;font-weight:600;white-space:nowrap;line-height:1;vertical-align:middle;margin-left:1px} .' + CLASS_TIP + ' .purpura-pfl-amount .icon-robux-16x16{flex-shrink:0;vertical-align:middle;display:inline-block!important;transform:scale(0.75);transform-origin:center center;margin:0 -3px 0 -2px} .' + CLASS_TIP + ' .purpura-pfl-status{margin-top:4px} .' + CLASS_TIP + ' .purpura-pfl-muted{color:var(--purpura-secondaryText,var(--color-content-muted,#a3a3a3));font-size:11px;display:block;margin-top:6px;line-height:1.4}';
        (document.head || document.documentElement).appendChild(style);
    }

    function fetchJson(endpoint, subdomain) {
        var host = subdomain ? subdomain + '.roblox.com' : 'www.roblox.com';
        var url = 'https://' + host + endpoint;
        return fetch(url, { credentials: 'include' }).then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        });
    }

    function buildPriceFloorQuery(details, isBundlePage) {
        var assetType = isBundlePage ? details.bundleType : details.assetType;
        var taxonomy = details.taxonomy || [];
        var isFullMask = taxonomy.some(function (t) { return t && t.taxonomyName === 'Full Masks'; });
        var isHeads = taxonomy.some(function (t) { return t && t.taxonomyName === 'Heads'; });
        if (isHeads) assetType = 2;
        if (!assetType && !isFullMask) return null;
        var isPbr = !!details.isPBR;
        var isBodysuit = taxonomy.some(function (t) { return t && t.taxonomyName === 'Bodysuit'; });
        var collectibleItemType = details.itemRestrictions && details.itemRestrictions.indexOf('Collectible') !== -1 ? 1 : 2;
        var typeParam = isBundlePage ? 'bundleType' : 'assetType';
        var qs = 'collectibleItemType=' + collectibleItemType + '&creationType=1&isPbr=' + isPbr + '&isBodysuit=' + isBodysuit;
        if (isFullMask) qs += '&categoryId=full_mask%7Cm4.1fullmask_20260224%7C6';
        else qs += '&' + typeParam + '=' + assetType;
        return qs;
    }

    function amountHtml(value) {
        return '<span class="purpura-pfl-amount"><span class="icon-robux-16x16"></span>' + Number(value).toLocaleString() + '</span>';
    }

    function renderIcon(element, floor, currentPrice, hasDiscount) {
        if (element.querySelector('.' + CLASS_ICON)) return;
        var icon = document.createElement('div');
        icon.className = CLASS_ICON;
        if (!hasDiscount) icon.style.verticalAlign = 'text-bottom';
        icon.setAttribute('tabindex', '0');
        icon.setAttribute('role', 'img');
        icon.setAttribute('aria-label', chrome.i18n.getMessage('settings_priceFloor_label') || 'Price Floor');
        icon.innerHTML = ICON_SVG;

        var label = chrome.i18n.getMessage('priceFloor_label') || 'Price Floor';
        var desc = chrome.i18n.getMessage('priceFloor_description') || 'The minimum price this item can be listed for. Roblox adjusts it based on the item type and configuration.';
        var statusLine = '';
        if (typeof currentPrice === 'number' && !isNaN(currentPrice)) {
            var diff = currentPrice - floor;
            var statusKey = diff > 0 ? 'above' : diff < 0 ? 'below' : 'at';
            var statusWord = chrome.i18n.getMessage('priceFloor_statusTypes_' + statusKey) || statusKey;
            if (statusKey === 'at') {
                statusLine = statusWord;
            } else {
                var diffVal = Math.abs(diff);
                var tmpl = chrome.i18n.getMessage('priceFloor_difference') || '{{diff}}';
                var diffHtml = tmpl.replace('{{diff}}', amountHtml(diffVal));
                var statusTmpl = chrome.i18n.getMessage('priceFloor_status') || '{{difference}} {{status}}';
                statusLine = statusTmpl.replace('{{status}}', statusWord).replace('{{difference}}', diffHtml);
            }
        }

        var tip = document.createElement('div');
        tip.className = CLASS_TIP;
        tip.innerHTML = '<div class="purpura-pfl-line"><span class="purpura-pfl-label">' + label + '</span>' + amountHtml(floor) + '</div>' + (statusLine ? '<div class="purpura-pfl-line purpura-pfl-status">' + statusLine + '</div>' : '') + '<span class="purpura-pfl-muted">' + desc + '</span>';
        icon.appendChild(tip);
        element.appendChild(icon);
        element.classList.add('purpura-price-floor-container');
    }

    function flush(key, data) {
        var waiters = inflight.get(key) || [];
        inflight.delete(key);
        waiters.forEach(function (element) {
            if (!element) return;
            processed.set(element, key);
            if (!data || !element.isConnected || element.querySelector('.' + CLASS_ICON)) return;
            renderIcon(element, data.floor, data.currentPrice, !!element.querySelector('.original-price'));
        });
    }

    function requestFloor(key, assetId, itemType) {
        var isBundlePage = itemType === 'Bundle';
        fetchJson('/v1/catalog/items/' + encodeURIComponent(assetId) + '/details?itemType=' + itemType, 'catalog').then(function (details) {
            if (!details) return null;
            var qs = buildPriceFloorQuery(details, isBundlePage);
            if (!qs) return null;
            return fetchJson('/v1/items/price-floor?' + qs, 'itemconfiguration').then(function (pfData) {
                if (!pfData || typeof pfData.priceFloor !== 'number') return null;
                return { floor: pfData.priceFloor, currentPrice: details.lowestPrice };
            });
        }).catch(function () {
            return null;
        }).then(function (data) {
            flush(key, data);
        });
    }

    function attachToElement(element) {
        if (!element || !element.isConnected) return;
        if (element.querySelector('.' + CLASS_ICON)) return;
        var assetId = getAssetIdFromUrl();
        if (!assetId) return;
        var key = assetId + '|' + getItemType();
        if (processed.get(element) === key) return;
        var waiters = inflight.get(key);
        if (waiters) {
            waiters.push(element);
            return;
        }
        inflight.set(key, [element]);
        requestFloor(key, assetId, getItemType());
    }

    function scan(root) {
        if (!enabled) return;
        ensureStyles();
        var targets = [];
        if (root && root.nodeType === 1 && root.matches && root.matches(SELECTOR_PRICE)) targets.push(root);
        if (root && root.querySelectorAll) root.querySelectorAll(SELECTOR_PRICE).forEach(function (el) { targets.push(el); });
        else if (!root) document.querySelectorAll(SELECTOR_PRICE).forEach(function (el) { targets.push(el); });
        targets.forEach(attachToElement);
        if (!targets.length && !root) {
            document.querySelectorAll(SELECTOR_PRICE).forEach(attachToElement);
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
            for (var i = 0; i < mutations.length; i++) {
                var m = mutations[i];
                if (m.addedNodes && m.addedNodes.length) { scheduleScan(); return; }
                var removed = m.removedNodes || [];
                for (var j = 0; j < removed.length; j++) {
                    var node = removed[j];
                    if (node.nodeType !== 1) continue;
                    var hadIcon = node.classList && node.classList.contains(CLASS_ICON);
                    if (!hadIcon && node.querySelector) hadIcon = !!node.querySelector('.' + CLASS_ICON);
                    if (hadIcon) {
                        processed.delete(m.target);
                        scheduleScan();
                        return;
                    }
                }
            }
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
        inflight.clear();
        processed = new WeakMap();
        document.querySelectorAll('.' + CLASS_ICON).forEach(function (el) { el.remove(); });
        if (document.getElementById(STYLE_ID)) document.getElementById(STYLE_ID).remove();
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
