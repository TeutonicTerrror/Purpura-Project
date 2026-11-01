/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
    'use strict';

    if (window.purpuraRobuxBalancePrecisionInitialized) return;
    window.purpuraRobuxBalancePrecisionInitialized = true;

    const SETTING_KEY = 'rbp';
    const SELECTORS = [
        '#nav-robux-amount',
        '#nav-robux-balance',
        '#nav-robux .nav-robux-amount',
        '.nav-robux-amount',
        '[data-testid="navbar-robux-amount"]'
    ];
    const RAW_PATTERN = /^(\d[\d,]*)(?:\.(\d+))?\s*([KkMm])?\+?$/;

    let mode = 'default';
    let observer = null;
    let scheduled = false;
    const touched = new Set();
    const elementState = new WeakMap();

    function parseAmount(text) {
        if (!text) return null;
        const match = RAW_PATTERN.exec(text.trim());
        if (!match) return null;

        let value = Number(match[1].replace(/,/g, ''));
        if (!Number.isFinite(value)) return null;
        if (match[2]) value += Number(`0.${match[2]}`);

        const suffix = match[3] ? match[3].toLowerCase() : '';
        if (suffix === 'k') value *= 1e3;
        else if (suffix === 'm') value *= 1e6;

        return Number.isFinite(value) ? value : null;
    }

    function formatAmount(value) {
        if (mode === 'default') return null;

        if (mode === 'full') {
            return Math.round(value).toLocaleString();
        }

        const digits = Number(mode);
        if (!Number.isFinite(digits)) return null;
        if (Math.abs(value) < 1000) return Math.round(value).toLocaleString();

        return new Intl.NumberFormat(undefined, {
            notation: 'compact',
            compactDisplay: 'short',
            maximumFractionDigits: digits
        }).format(value);
    }

    function restore(element) {
        const state = elementState.get(element);
        if (state && state.original !== undefined && element.textContent !== state.original) {
            element.textContent = state.original;
        }
        elementState.delete(element);
        touched.delete(element);
    }

    function apply(element) {
        if (!element || element.children.length) return;

        const text = element.textContent.trim();
        if (!text) return;

        let state = elementState.get(element);
        let value;

        if (state && text === state.formatted) {
            value = state.raw;
        } else {
            value = parseAmount(text);
            if (value === null) {

                if (state) elementState.delete(element);
                return;
            }
            if (!state) {
                state = { raw: value, formatted: text, original: element.textContent };
                touched.add(element);
            }
            state.raw = value;
            elementState.set(element, state);
        }

        const formatted = formatAmount(value);
        if (formatted === null) {
            restore(element);
            return;
        }

        state.formatted = formatted;
        if (element.textContent !== formatted) {
            element.textContent = formatted;
        }
    }

    function scan() {
        scheduled = false;
        for (const selector of SELECTORS) {
            let elements;
            try {
                elements = document.querySelectorAll(selector);
            } catch {
                continue;
            }
            elements.forEach(apply);
        }

        touched.forEach(element => {
            if (!element.isConnected) {
                elementState.delete(element);
                touched.delete(element);
            }
        });
    }

    function scheduleScan() {
        if (scheduled) return;
        scheduled = true;
        setTimeout(scan, 30);
    }

    function startObserver() {
        if (observer) return;
        observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === 'characterData') {
                    const parent = mutation.target && mutation.target.parentElement;
                    if (parent) apply(parent);
                    continue;
                }
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) scheduleScan();
                }
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    function stopObserver() {
        if (!observer) return;
        observer.disconnect();
        observer = null;
    }

    function applyMode(nextMode) {
        mode = typeof nextMode === 'string' && nextMode ? nextMode : 'default';
        if (mode === 'default') {
            touched.forEach(restore);
            stopObserver();
            return;
        }
        scan();
        startObserver();
    }

    window.__PurpuraSettings.ready.then(function () {
        const stored = window.__PurpuraSettings.get(SETTING_KEY);
        applyMode(typeof stored === 'string' ? stored : '2');
    });

    chrome.storage.onChanged.addListener(function (changes, area) {
        if (area !== 'sync') return;
        const change = changes[SETTING_KEY];
        if (!change) return;
        applyMode(change.newValue);
    });
})();
