/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
if (!window.purpuraRobuxConversationsInitialized) {
    window.purpuraRobuxConversationsInitialized = true;

    const SETTING_KEY = 'rconv';
    const DEVEX_URL = 'https://economy.roblox.com/v1/developer-exchange/info';
    const DEVEX_TTL = 10 * 60 * 1000;
    const RATE_TYPES = [ 'Regular', 'DevEx', 'Premium', 'Custom' ];
    const DEFAULT_CONFIG = {
        enabled: true,
        rateType: 'Regular',
        currency: 'USD',
        customRate: '',
        color: '#ffffff'
    };
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
    let config = { ...DEFAULT_CONFIG };
    let devex = null;

    const fx = window.__PurpuraFx || null;

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

    function normalize(value) {
        if (value === false) return { ...DEFAULT_CONFIG, enabled: false };
        if (!value || typeof value !== "object") return { ...DEFAULT_CONFIG };

        const currency = typeof value.currency === "string" ? value.currency.toUpperCase() : "";
        const customRate = typeof value.customRate === "number" ? String(value.customRate) : value.customRate;

        return {
            enabled: value.enabled !== false,
            rateType: RATE_TYPES.indexOf(value.rateType) !== -1 ? value.rateType : DEFAULT_CONFIG.rateType,
            currency: fx && fx.rates[currency] ? currency : DEFAULT_CONFIG.currency,
            customRate: typeof customRate === "string" ? customRate.trim() : "",
            color: typeof value.color === "string" && /^#[0-9a-f]{6}$/i.test(value.color) ? value.color : DEFAULT_CONFIG.color
        };
    }

    async function devexRate() {
        if (devex && Date.now() - devex.at < DEVEX_TTL) return devex.rate;

        let rate = fx ? fx.baseRates.DevEx : 0.0038;
        try {
            const response = await fetch(DEVEX_URL, { credentials: "include" });
            if (response.ok) {
                const data = await response.json();
                const percent = Number(data && data.conversionPercent);
                if (Number.isFinite(percent) && percent > 0) rate = percent;
            }
        } catch {
        }

        devex = { rate, at: Date.now() };
        return rate;
    }

    async function currentRate() {
        let base;
        if (config.rateType === "Custom") {
            const custom = Number(String(config.customRate).replace(",", "."));
            base = Number.isFinite(custom) && custom > 0 ? custom : (fx ? fx.baseRates.Regular : 0.0125);
        } else if (config.rateType === "DevEx") {
            base = await devexRate();
        } else if (config.rateType === "Premium") {
            base = fx ? fx.baseRates.Premium : 0.01136;
        } else {
            base = fx ? fx.baseRates.Regular : 0.0125;
        }

        return fx ? fx.rateFor(base, config.currency) : base;
    }

    function formatCurrency(amount) {
        if (fx) return fx.format(amount, config.currency);
        return `$${amount.toFixed(2)}`;
    }

    function tagRobuxSpan(span, rate) {
        if (!span) return;
        const attributeValue = span.getAttribute("data-robux") || span.getAttribute("data-robux-value") || span.getAttribute("data-robux-amount");
        const rawText = attributeValue || span.textContent.trim();

        const robux = toNumber(rawText);
        if (robux === null) return;

        const formatted = `(${formatCurrency(robux * rate)})`;
        const rateLabel = `1 Robux = ${rate.toFixed(6)} ${config.currency}`;

        const existing = span.nextElementSibling;
        if (existing && existing.dataset && existing.dataset.purpuraRobuxUsdInjected === "1") {
            if (existing.textContent !== formatted) existing.textContent = formatted;
            existing.style.color = config.color;
            existing.title = rateLabel;
            span.dataset.purpuraRobuxUsdTagged = "1";
            return;
        }

        const converted = document.createElement("span");
        converted.className = "text-secondary";
        converted.style.paddingLeft = "4px";
        converted.style.color = config.color;
        converted.textContent = formatted;
        converted.title = rateLabel;
        converted.dataset.purpuraRobuxUsdInjected = "1";

        span.after(converted);
        span.dataset.purpuraRobuxUsdTagged = "1";
    }

    async function scanAndInject(root = document) {
        if (!enabled) return;
        if (!root) return;
        if (root.nodeType !== 1 && root.nodeType !== 9) return;
        if (typeof root.querySelectorAll !== "function") return;

        const rate = await currentRate();
        if (!enabled) return;

        try {
            root.querySelectorAll(SELECTORS.join(", ")).forEach(span => tagRobuxSpan(span, rate));
        } catch {
        }
    }

    function removeInjected() {
        document
            .querySelectorAll("[data-purpura-robux-usd-injected]")
            .forEach(element => element.remove());
        document
            .querySelectorAll("[data-purpura-robux-usd-tagged]")
            .forEach(element => delete element.dataset.purpuraRobuxUsdTagged);
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
            attributeFilter: [ "class", "data-robux", "data-robux-value", "data-robux-amount" ]
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

    function applyConfig(next) {
        const wasEnabled = enabled;
        config = normalize(next);
        if (!config.enabled) {
            disable();
            return;
        }
        if (wasEnabled) {
            removeInjected();
            scanAndInject();
            return;
        }
        enable();
    }

    window.__PurpuraSettings.ready.then(function () {
        applyConfig(window.__PurpuraSettings.get(SETTING_KEY));
    });

    chrome.storage.onChanged.addListener(function (changes, area) {
        if (area !== "sync") return;
        const change = changes[SETTING_KEY];
        if (!change) return;
        applyConfig(change.newValue);
    });
}
