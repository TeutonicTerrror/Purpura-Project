/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
    if (window.purpuraNoRentInitialized) return;
    window.purpuraNoRentInitialized = true;

    const STORAGE_KEY = "nr";
    const STYLE_ID = "purpura-no-rent-style";
    const HIDE_ATTR = "data-purpura-no-rent-hidden";
    const TIMED_ROW_SELECTOR = ".timed-options-row-container";
    const HOLD_ICON_SELECTOR = ".icon-actions-info-sm.item-hold-icon";
    const SIZE_ATTR = "data-purpura-no-rent-size";
    const PURCHASE_CONTAINER_SELECTOR = ".shopping-cart-buy-button.item-purchase-btns-container";
    const PURCHASE_BUTTON_SELECTOR = "button.shopping-cart-buy-button.btn-growth-lg.PurchaseButton, button.btn-primary-lg";

    let enabled = true;
    let observer = null;
    let scanTimer = 0;
    const movedPurchaseContainers = new Map();

    function ensureStyle() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement("style");
        style.id = STYLE_ID;
        style.textContent = `.timed-options-container{display:none !important;}.timed-options-row-container .row-label{display:none !important;}[${HIDE_ATTR}="1"]{display:none !important;}[${SIZE_ATTR}="1"]{width:388.67px !important;height:51.33px !important;min-width:388.67px !important;min-height:51.33px !important;display:inline-flex !important;align-items:center !important;justify-content:center !important;}`;
        (document.head || document.documentElement).appendChild(style);
    }

    function removeStyle() {
        const style = document.getElementById(STYLE_ID);
        if (style) style.remove();
    }

    function clearHidden() {
        document.querySelectorAll(`[${HIDE_ATTR}="1"]`).forEach(el => el.removeAttribute(HIDE_ATTR));
        document.querySelectorAll(`[${SIZE_ATTR}="1"]`).forEach(el => el.removeAttribute(SIZE_ATTR));
    }

    function restoreMovedPurchaseContainers() {
        const entries = Array.from(movedPurchaseContainers.entries());
        entries.forEach(([container, placeholder]) => {
            if (!container || !placeholder) {
                movedPurchaseContainers.delete(container);
                return;
            }

            const parent = placeholder.parentNode;
            if (parent && container.isConnected) {
                parent.insertBefore(container, placeholder);
            }

            if (placeholder.parentNode) {
                placeholder.parentNode.removeChild(placeholder);
            }

            movedPurchaseContainers.delete(container);
        });
    }

    function applyContainer(container) {
        if (enabled) {
            container.setAttribute(HIDE_ATTR, "1");
            return;
        }
        container.removeAttribute(HIDE_ATTR);
    }

    function applyTimedRowLayout(row) {
        const purchaseContainer = row.querySelector(PURCHASE_CONTAINER_SELECTOR);
        if (!purchaseContainer) {
            if (!enabled) row.removeAttribute(HIDE_ATTR);
            return;
        }

        const priceScope = row.closest(".price-container-text") || row.closest(".price-row-container") || row.parentElement;
        const priceInfo = priceScope && priceScope.querySelector(".price-info.row-content");
        if (!priceInfo) {
            if (!enabled) row.removeAttribute(HIDE_ATTR);
            return;
        }

        if (enabled) {
            if (!priceInfo.contains(purchaseContainer)) {
                if (!movedPurchaseContainers.has(purchaseContainer) && purchaseContainer.parentNode) {
                    const placeholder = document.createComment("purpura-no-rent-purchase-anchor");
                    purchaseContainer.parentNode.insertBefore(placeholder, purchaseContainer);
                    movedPurchaseContainers.set(purchaseContainer, placeholder);
                }
                priceInfo.appendChild(purchaseContainer);
            }
            row.setAttribute(HIDE_ATTR, "1");
            return;
        }

        row.removeAttribute(HIDE_ATTR);
    }

    function scan(root = document) {
        if (!root || typeof root.querySelectorAll !== "function") return;

        const containers = [];
        if (root.nodeType === 1 && root.matches && root.matches(".timed-options-container")) {
            containers.push(root);
        }
        root.querySelectorAll(".timed-options-container").forEach(c => containers.push(c));
        containers.forEach(c => applyContainer(c));

        const timedRows = [];
        if (root.nodeType === 1 && root.matches && root.matches(TIMED_ROW_SELECTOR)) {
            timedRows.push(root);
        }
        root.querySelectorAll(TIMED_ROW_SELECTOR).forEach(row => timedRows.push(row));
        timedRows.forEach(row => applyTimedRowLayout(row));

        const holdIcons = [];
        if (root.nodeType === 1 && root.matches && root.matches(HOLD_ICON_SELECTOR)) {
            holdIcons.push(root);
        }
        root.querySelectorAll(HOLD_ICON_SELECTOR).forEach(icon => holdIcons.push(icon));
        holdIcons.forEach(icon => {
            const optionsRow = icon.closest(".row-label");
            const target = optionsRow || icon;
            if (enabled) {
                target.setAttribute(HIDE_ATTR, "1");
                if (target !== icon) icon.removeAttribute(HIDE_ATTR);
                return;
            }
            target.removeAttribute(HIDE_ATTR);
            icon.removeAttribute(HIDE_ATTR);
        });

        const purchaseButtons = [];
        if (root.nodeType === 1 && root.matches && root.matches(PURCHASE_BUTTON_SELECTOR)) {
            purchaseButtons.push(root);
        }
        root.querySelectorAll(PURCHASE_BUTTON_SELECTOR).forEach(button => purchaseButtons.push(button));
        purchaseButtons.forEach(button => {
            const label = (button.textContent || "").trim().toLowerCase();
            const isTarget = label === "buy" || label === "add to cart";
            if (enabled && isTarget) {
                button.setAttribute(SIZE_ATTR, "1");
                return;
            }
            button.removeAttribute(SIZE_ATTR);
        });
    }

    function scheduleScan() {
        if (scanTimer) clearTimeout(scanTimer);
        scanTimer = window.setTimeout(() => {
            scanTimer = 0;
            scan();
        }, 0);
    }

    function setEnabled(next) {
        enabled = !!next;
        if (enabled) {
            ensureStyle();
            scan();
            scheduleScan();
            return;
        }
        restoreMovedPurchaseContainers();
        clearHidden();
        removeStyle();
    }

    function loadSetting() {
        function doLoad() {
            window.__PurpuraSettings.ready.then(function() {
                var v = window.__PurpuraSettings.get(STORAGE_KEY);
                var next = typeof v === "boolean" ? v : true;
                setEnabled(next);
            });
        }

        if (!window.__PurpuraSettings) {
            var attempts = 0;
            var poll = setInterval(function () {
                if (window.__PurpuraSettings) {
                    clearInterval(poll);
                    doLoad();
                } else if (++attempts > 50) {
                    clearInterval(poll);
                }
            }, 100);
            return;
        }
        doLoad();
    }

    function initObserver() {
        if (observer || !document.documentElement) return;
        observer = new MutationObserver(mutations => {
            if (!enabled) return;
            for (const mutation of mutations) {
                if (mutation.type === "childList" && mutation.addedNodes.length) {
                    scheduleScan();
                    return;
                }
                if (mutation.type === "characterData") {
                    scheduleScan();
                    return;
                }
            }
        });
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    function bindNavigation() {
        const onNav = () => {
            if (enabled) scheduleScan();
        };

        const pushState = history.pushState.bind(history);
        history.pushState = function () {
            const result = pushState(...arguments);
            onNav();
            return result;
        };

        const replaceState = history.replaceState.bind(history);
        history.replaceState = function () {
            const result = replaceState(...arguments);
            onNav();
            return result;
        };

        window.addEventListener("popstate", onNav);
        window.addEventListener("hashchange", onNav);
    }

    setEnabled(enabled);
    loadSetting();
    initObserver();
    bindNavigation();

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace !== "sync" || !changes[STORAGE_KEY]) return;
        loadSetting();
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            if (enabled) scheduleScan();
        }, { once: true });
    } else if (enabled) {
        scheduleScan();
    }
})();