/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
if (!window.purpuraRobuxConversationsInitialized) {
    window.purpuraRobuxConversationsInitialized = true;

    const RATE_USD = 0.0125;
    const SELECTORS = [
        "span.text-robux-lg",
        "span.text-robux",
        "span.text-robux-tile",
        ".text-robux",
        ".text-robux-tile",
        ".amount.icon-robux-container",
        ".robux",
        ".robux-amount",
        "#nav-robux-amount",
        "[data-robux]",
        "[data-robux-value]",
        "[data-robux-amount]",
    ];

    let observer = null;
    let enabled = false;
    let navHooksInstalled = false;

    function toNumber(value) {
        if (value == null) return null;
        const str = String(value)
            .trim()
            .replace(/,/g, "")
            .replace(/\s+/g, "");
        const match = str.match(/^(-?\d+(?:\.\d+)?)([kKmM])?$/);
        if (!match) return null;
        const num = Number(match[1]);
        if (!Number.isFinite(num)) return null;
        const suffix = match[2];
        if (suffix) {
            const factor = suffix.toLowerCase() === "k" ? 1e3 : 1e6;
            return num * factor;
        }
        return num;
    }

    function formatUSD(amount) {
        return amount.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 2
        });
    }

    function convertRobuxToUsd(robux) {
        const num = toNumber(robux);
        return num === null ? null : num * RATE_USD;
    }

    function tagRobuxSpan(span) {
        if (!span) return;
        const attributeValue = span.getAttribute("data-robux") || span.getAttribute("data-robux-value") || span.getAttribute("data-robux-amount");
        const rawText = attributeValue || span.textContent.trim();

        const robux = toNumber(rawText);
        if (robux === null) return;

        const usdValue = convertRobuxToUsd(robux);
        if (usdValue === null) return;

        const formattedUsd = `(${formatUSD(usdValue)})`;

        const existingUsdSpan = span.nextElementSibling;
        if (existingUsdSpan && existingUsdSpan.dataset && existingUsdSpan.dataset.purpuraRobuxUsdInjected === "1") {
            if (existingUsdSpan.textContent !== formattedUsd) {
                existingUsdSpan.textContent = formattedUsd;
            }
            span.dataset.purpuraRobuxUsdInjected = "1";
            return;
        }

        const usdSpan = document.createElement("span");
        usdSpan.className = "text-secondary";
        usdSpan.style.paddingLeft = "4px";
        usdSpan.textContent = formattedUsd;
        usdSpan.dataset.purpuraRobuxUsdInjected = "1";

        span.after(usdSpan);
        span.dataset.purpuraRobuxUsdInjected = "1";
    }

    function scanAndInject(root = document) {
        if (!enabled) return;
        if (!root) return;
        if (root.nodeType !== 1 && root.nodeType !== 9) return;
        if (typeof root.querySelectorAll !== "function") return;

        try {
            root.querySelectorAll(SELECTORS.join(", ")).forEach(span => tagRobuxSpan(span));
        } catch {
        }
    }

    function removeInjected() {
        document
            .querySelectorAll("span[data-purpura-robux-usd-injected]")
            .forEach(span => span.remove());
    }

    function startObserver() {
        if (observer) return;
        observer = new MutationObserver(mutations => {
            for (const m of mutations) {
                try {
                    if (m.type === "characterData") {
                        const parent = m.target.parentElement;
                        if (parent) scanAndInject(parent);
                        continue;
                    }

                    if (m.type === "attributes") {
                        scanAndInject(m.target);
                        continue;
                    }

                    if (!m.addedNodes.length) continue;
                    scanAndInject(m.target);
                    m.addedNodes.forEach(node => {
                        if (node.nodeType === 1) scanAndInject(node);
                    });
                } catch {
                }
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ["class", "data-robux", "data-robux-value", "data-robux-amount"]
        });
    }

    function stopObserver() {
        if (!observer) return;
        observer.disconnect();
        observer = null;
    }

    function watchNavigation() {
        if (navHooksInstalled) return;
        navHooksInstalled = true;
        const schedule = () => setTimeout(() => scanAndInject(), 50);

        const origPush = history.pushState;
        const origReplace = history.replaceState;

        history.pushState = function () {
            const result = origPush.apply(this, arguments);
            schedule();
            return result;
        };

        history.replaceState = function () {
            const result = origReplace.apply(this, arguments);
            schedule();
            return result;
        };

        window.addEventListener("popstate", schedule);
    }

    function enable() {
        if (enabled) return;
        enabled = true;
        scanAndInject();
        startObserver();
        watchNavigation();
    }

    function disable() {
        enabled = false;
        stopObserver();
        removeInjected();
    }

    window.__PurpuraSettings.ready.then(function() {
        var v = window.__PurpuraSettings.get('rconv');
        if (v !== false) enable();
    });

    chrome.storage.onChanged.addListener(function(changes, area) {
        if (area !== 'sync') return;
        var change = changes['rconv'];
        if (!change) return;
        if (change.newValue !== false) {
            enable();
        } else {
            disable();
        }
    });
}
