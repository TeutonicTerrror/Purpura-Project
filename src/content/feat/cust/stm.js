/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
    'use strict';

    if (window.purpuraStreamerModeInitialized) return;
    window.purpuraStreamerModeInitialized = true;

    const SETTING_KEY = 'stm';
    const SESSION_KEY = 'purpura_streamermode';
    const ITEMS_SESSION_KEY = 'purpura_streamer_items';
    const STYLE_ID = 'purpura-streamer-mode-styles';

    const ITEM_KEYS = [
        'names', 'others', 'avatars', 'robux', 'gameNames',
        'email', 'phone', 'birthdate', 'age', 'country', 'sessions', 'presence'
    ];

    const NAME_MASK_CLASS = 'purpura-streamer-name-mask';
    const NAME_MASK_ATTR = 'data-purpura-streamer-mask';
    const BLUR_MASK_CHAR = '\u2022';


    const ITEM_SELECTORS = {
        names: [ '.purpura-streamer-name-mask' ],
        others: [
            '#profile-header-title-container-name',
            '.profile-display-name',
            '.profile-header-title',
            '.stylistic-alts-username',
            '.avatar-name',
            '.username',
            '.display-name',
            '[data-testid="display-name"]',
            '.text-overflow.ng-binding',
            '.avatar-card-label:not(:has(.avatar-status-link))',
            '.age-bracket-label-username',
            '.friends-carousel-display-name',
            '.friends-carousel-user-name',
            'a[href*="/users/profile"]:has(.thumbnail-2d-container) .text-truncate-end'
        ],
        avatars: [
            '.user-profile-header-details-avatar-container .thumbnail-2d-container img',
            '.avatar-card-image',
            '.friends-carousel-tile .thumbnail-2d-container img'
        ],
        robux: [
            '.text-robux',
            '.text-robux-lg',
            '.icon-robux',
            '#nav-robux',
            '#nav-robux-amount',
            '.nav-robux-amount',
            '[class*="robux-amount"]',
            '.currency-counter',
            '[data-purpura-robux-usd-injected="1"]'
        ],
        gameNames: [
            '.friend-tile-game-name',
            '.friend-tile-is-playing',
            '.friend-tile-game-card'
        ]
    };


    const CLICKABLE_ITEMS = new Set([ 'avatars', 'gameNames' ]);


    const TEXT_MASKS = {
        robux: [
            '.text-robux', '.text-robux-lg', '.icon-robux', '#nav-robux',
            '#nav-robux-amount', '.nav-robux-amount', '[class*="robux-amount"]',
            '.currency-counter', '[data-purpura-robux-usd-injected="1"]'
        ],
        email: [ '.settings-text-span-visible' ]
    };

    let state = { enabled: false, items: {}, keybind: '', raw: {} };
    let nameMaskObserver = null;
    let nameMaskRegex = null;
    let nameMaskInitPromise = null;
    const nameMaskOriginals = new WeakMap();
    const maskedElements = new Set();
    const maskedOriginals = new WeakMap();

    function defaultItems() {
        const items = {};
        ITEM_KEYS.forEach((key) => { items[key] = true; });
        return items;
    }

    function normalize(raw) {
        const source = raw && typeof raw === 'object' ? raw : { enabled: raw === true };
        const items = {};
        ITEM_KEYS.forEach((key) => {
            items[key] = source[key] === undefined ? true : source[key] === true;
        });
        return {
            enabled: source.enabled === true || raw === true,
            items,
            keybind: typeof source.keybind === 'string' ? source.keybind.trim() : '',
            raw: { ...source, enabled: source.enabled === true || raw === true, items: undefined }
        };
    }

    function setSessionState() {
        try {
            sessionStorage.setItem(SESSION_KEY, String(state.enabled));
            sessionStorage.setItem(ITEMS_SESSION_KEY, JSON.stringify(state.items));
        } catch {}
    }

    function writeSetting(next) {
        const payload = { ...next.raw, enabled: next.enabled };
        ITEM_KEYS.forEach((key) => { payload[key] = next.items[key] === true; });
        delete payload.items;
        delete payload.preset;
        try {
            if (window.__PurpuraSettings && typeof window.__PurpuraSettings.set === 'function') {
                window.__PurpuraSettings.set(SETTING_KEY, payload);
                return;
            }
        } catch {}
        try {
            chrome.storage.local.set({ [SETTING_KEY]: payload });
        } catch {}
    }

    function stylesheetText() {
        const blocks = [];
        Object.entries(ITEM_SELECTORS).forEach(([item, selectors]) => {
            if (!state.items[item]) return;
            const pointer = CLICKABLE_ITEMS.has(item) ? '' : '\n    pointer-events: none !important;';
            blocks.push(`${selectors.join(',\n')} {\n    filter: blur(8px) !important;\n    user-select: none !important;${pointer}\n}`);
        });
        return blocks.join('\n\n');
    }

    function refreshStyles() {
        let style = document.getElementById(STYLE_ID);
        const css = state.enabled ? stylesheetText() : '';
        if (!css) {
            if (style) style.remove();
            return;
        }
        if (!style) {
            style = document.createElement('style');
            style.id = STYLE_ID;
            const parent = document.head || document.documentElement;
            if (parent) parent.appendChild(style);
        }
        style.textContent = css;
    }

    function escapeRegex(value) {
        return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    async function fetchNameMaskTokens() {
        try {
            const response = await fetch('https://users.roblox.com/v1/users/authenticated', { credentials: 'include' });
            if (!response.ok) return [];

            const data = await response.json();
            const tokens = new Set();

            for (const value of [data?.name, data?.displayName, data?.username]) {
                if (typeof value !== 'string') continue;
                const cleaned = value.trim();
                if (cleaned.length < 2) continue;
                tokens.add(cleaned);
            }

            return Array.from(tokens);
        } catch {
            return [];
        }
    }

    async function ensureNameMaskRegex() {
        if (nameMaskRegex) return nameMaskRegex;

        if (!nameMaskInitPromise) {
            nameMaskInitPromise = (async () => {
                const tokens = await fetchNameMaskTokens();
                const pattern = tokens
                    .map(escapeRegex)
                    .filter(Boolean)
                    .sort((a, b) => b.length - a.length)
                    .join('|');

                nameMaskRegex = pattern ? new RegExp(pattern, 'i') : null;
            })().finally(() => {
                nameMaskInitPromise = null;
            });
        }

        await nameMaskInitPromise;
        return nameMaskRegex;
    }

    function canMaskTextNode(node) {
        if (!(node instanceof Text)) return false;

        const parent = node.parentElement;
        if (!(parent instanceof Element)) return false;
        if (parent.closest('script,style,noscript,textarea,input,select,option')) return false;
        if (parent.closest(`span[${NAME_MASK_ATTR}="1"]`)) return false;
        return true;
    }

    function cleanupLegacyNameMaskClasses() {
        document.querySelectorAll(`.${NAME_MASK_CLASS}:not([${NAME_MASK_ATTR}="1"])`).forEach((element) => {
            element.classList.remove(NAME_MASK_CLASS);
        });
    }

    function maskTextNode(node) {
        if (!state.enabled || !state.items.names || !nameMaskRegex) return;
        if (!canMaskTextNode(node)) return;

        const raw = typeof node.nodeValue === 'string' ? node.nodeValue : '';
        if (!raw.trim()) return;
        if (!nameMaskRegex.test(raw)) return;

        const matcher = new RegExp(nameMaskRegex.source, 'gi');
        const frag = document.createDocumentFragment();
        let cursor = 0;
        let match;
        let found = false;

        while ((match = matcher.exec(raw)) !== null) {
            const start = match.index;
            const end = start + match[0].length;

            if (start > cursor) {
                frag.appendChild(document.createTextNode(raw.slice(cursor, start)));
            }

            const masked = document.createElement('span');
            masked.className = NAME_MASK_CLASS;
            masked.setAttribute(NAME_MASK_ATTR, '1');
            const originalText = raw.slice(start, end);
            nameMaskOriginals.set(masked, originalText);
            masked.textContent = originalText.replace(/[^\s]/g, BLUR_MASK_CHAR);
            frag.appendChild(masked);

            cursor = end;
            found = true;

            if (matcher.lastIndex <= start) {
                matcher.lastIndex = start + 1;
            }
        }

        if (!found) return;

        if (cursor < raw.length) {
            frag.appendChild(document.createTextNode(raw.slice(cursor)));
        }

        node.replaceWith(frag);
    }

    function maskElementText(el) {
        if (maskedOriginals.has(el)) return;
        maskedOriginals.set(el, el.innerHTML);
        maskedElements.add(el);
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
            const text = node.nodeValue || '';
            if (text.trim()) {
                node.nodeValue = text.replace(/[^\s]/g, BLUR_MASK_CHAR);
            }
        }
    }

    function maskElementTextIn(scope) {
        if (!state.enabled) return;
        const root = scope && scope.nodeType === Node.ELEMENT_NODE ? scope : document;
        Object.entries(TEXT_MASKS).forEach(([item, selectors]) => {
            if (!state.items[item]) return;
            if (root.matches && root.matches(selectors.join(','))) maskElementText(root);
            if (!root.querySelectorAll) return;
            for (const el of root.querySelectorAll(selectors.join(','))) {
                maskElementText(el);
            }
        });
    }

    function restoreMaskedText() {
        for (const el of maskedElements) {
            const original = maskedOriginals.get(el);
            if (original !== undefined) el.innerHTML = original;
        }
        maskedElements.clear();
    }

    function maskFriendDropdownNames(scope) {
        if (!state.enabled || !state.items.names) return;
        const container = scope && scope.nodeType === Node.ELEMENT_NODE ? scope : document.body;
        if (!container) return;

        const buttons = container.matches && container.matches('.friend-tile-dropdown-button')
            ? [container]
            : Array.from(container.querySelectorAll('.friend-tile-dropdown-button'));

        for (const btn of buttons) {
            if (btn.querySelector(`span[${NAME_MASK_ATTR}="1"]`)) continue;

            const walker = document.createTreeWalker(btn, NodeFilter.SHOW_TEXT);
            let textNode;
            while ((textNode = walker.nextNode())) {
                const raw = textNode.nodeValue || '';
                const chatMatch = raw.match(/^(\s*Chat with\s+)(.+)$/i);
                if (!chatMatch) continue;

                const prefix = chatMatch[1];
                const friendName = chatMatch[2];

                const frag = document.createDocumentFragment();
                frag.appendChild(document.createTextNode(prefix));

                const masked = document.createElement('span');
                masked.className = NAME_MASK_CLASS;
                masked.setAttribute(NAME_MASK_ATTR, '1');
                nameMaskOriginals.set(masked, friendName);
                masked.textContent = friendName.replace(/[^\s]/g, BLUR_MASK_CHAR);
                frag.appendChild(masked);

                textNode.replaceWith(frag);
                break;
            }
        }
    }

    function applyNameMaskingIn(root) {
        if (!state.enabled || !state.items.names) return;

        const scope = root && root.nodeType ? root : document.body;
        if (!scope) return;

        if (nameMaskRegex) {
            const textNodes = [];

            if (scope.nodeType === Node.TEXT_NODE) {
                textNodes.push(scope);
            } else {
                const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
                let node;

                while ((node = walker.nextNode())) {
                    textNodes.push(node);
                }
            }

            for (const textNode of textNodes) {
                maskTextNode(textNode);
            }
        }

        if (scope.nodeType === Node.ELEMENT_NODE) {
            maskFriendDropdownNames(scope);
        }
    }

    function startNameMaskObserver() {
        if (nameMaskObserver || !document.body) return;

        nameMaskObserver = new MutationObserver((mutations) => {
            if (!state.enabled) return;
            for (const mutation of mutations) {
                if (mutation.type === 'characterData') {
                    const parent = mutation.target && mutation.target.parentElement;
                    if (parent) {
                        applyNameMaskingIn(parent);
                        maskElementTextIn(parent);
                    }
                    continue;
                }

                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        applyNameMaskingIn(node);
                        maskElementTextIn(node);
                    } else if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
                        applyNameMaskingIn(node.parentElement);
                    }
                }
            }
        });

        nameMaskObserver.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    function stopNameMaskObserver() {
        if (nameMaskObserver) {
            nameMaskObserver.disconnect();
            nameMaskObserver = null;
        }
    }

    async function enableDynamicNameMasking() {
        const regex = await ensureNameMaskRegex();
        if (!state.enabled || !state.items.names || !regex) return;

        cleanupLegacyNameMaskClasses();
        applyNameMaskingIn(document.body);
        startNameMaskObserver();
    }

    function disableDynamicNameMasking() {
        stopNameMaskObserver();
        document.querySelectorAll(`span.${NAME_MASK_CLASS}[${NAME_MASK_ATTR}="1"]`).forEach((element) => {
            element.replaceWith(document.createTextNode(nameMaskOriginals.get(element) || element.textContent || ''));
        });
        cleanupLegacyNameMaskClasses();
        document.querySelectorAll(`.${NAME_MASK_CLASS}`).forEach((element) => {
            element.classList.remove(NAME_MASK_CLASS);
        });
        if (document.body) {
            document.body.normalize();
        }
    }

    function refreshNameMasking() {
        if (state.enabled && state.items.names) {
            enableDynamicNameMasking();
        } else {
            disableDynamicNameMasking();
        }
    }

    function keyNameFromEvent(event) {
        if (!event) return '';
        const key = event.key;
        if (!key) return '';
        if (key === 'Control' || key === 'Shift' || key === 'Alt' || key === 'Meta' || key === 'CapsLock') return '';
        if (key === ' ') return 'Space';
        if (key.length === 1) return key.toUpperCase();
        return key.charAt(0).toUpperCase() + key.slice(1);
    }

    function canonicalCombo(value) {
        if (!value || typeof value !== 'string') return '';
        const parts = value.split('+').map((part) => part.trim()).filter(Boolean);
        let ctrl = false;
        let alt = false;
        let shift = false;
        let key = '';
        for (const part of parts) {
            const lower = part.toLowerCase();
            if (lower === 'ctrl' || lower === 'control' || lower === 'meta' || lower === 'cmd' || lower === 'command' || lower === 'win') {
                ctrl = true;
            } else if (lower === 'alt' || lower === 'option') {
                alt = true;
            } else if (lower === 'shift') {
                shift = true;
            } else {
                key = part;
            }
        }
        if (!key) return '';
        const normalizedKey = key.length === 1 ? key.toUpperCase() : key.charAt(0).toUpperCase() + key.slice(1);
        const out = [];
        if (ctrl) out.push('Ctrl');
        if (alt) out.push('Alt');
        if (shift) out.push('Shift');
        out.push(normalizedKey === ' ' ? 'Space' : normalizedKey);
        return out.join('+');
    }

    function comboFromEvent(event) {
        const key = keyNameFromEvent(event);
        if (!key) return '';
        const parts = [];
        if (event.ctrlKey || event.metaKey) parts.push('Ctrl');
        if (event.altKey) parts.push('Alt');
        if (event.shiftKey) parts.push('Shift');
        parts.push(key);
        return parts.join('+');
    }

    function isEditableTarget(target) {
        if (!target || !(target instanceof Element)) return false;
        const el = target.closest('input,textarea,select,[contenteditable="true"],[contenteditable=""]');
        return !!el;
    }

    function setEnabled(enabled) {
        const next = { ...state, enabled: !!enabled, items: { ...state.items } };
        state = next;
        applyState();
        writeSetting(next);
    }

    function onKeyDown(event) {
        if (!state.keybind || event.repeat || event.isComposing) return;
        if (typeof event.key !== 'string' || !event.key) return;
        const combo = comboFromEvent(event);
        if (!combo || combo !== canonicalCombo(state.keybind)) return;
        const hasModifier = event.ctrlKey || event.metaKey || event.altKey;
        if (!hasModifier && isEditableTarget(event.target)) return;
        event.preventDefault();
        event.stopPropagation();
        setEnabled(!state.enabled);
    }

    function applyState() {
        setSessionState();
        document.dispatchEvent(new CustomEvent('purpura-streamer-mode', { detail: state.enabled }));
        refreshStyles();
        refreshNameMasking();
        restoreMaskedText();
        maskElementTextIn(document.body);
    }

    function readState() {
        window.__PurpuraSettings.ready.then(function() {
            const stored = window.__PurpuraSettings.get(SETTING_KEY);
            const next = normalize(stored);
            if (stored === true || stored === false) {

                writeSetting(next);
            }
            const changed =
                next.enabled !== state.enabled ||
                next.keybind !== state.keybind ||
                ITEM_KEYS.some((key) => next.items[key] !== state.items[key]);
            state = next;
            if (!next.enabled) {
                applyState();
                return;
            }
            if (changed) applyState();
        });
    }

    document.addEventListener('keydown', onKeyDown, true);

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes[SETTING_KEY]) {
            const next = normalize(changes[SETTING_KEY].newValue);
            state = next;
            applyState();
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', readState);
    } else {
        readState();
    }
})();
