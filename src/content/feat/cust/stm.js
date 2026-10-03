/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
    'use strict';
    
    if (window.purpuraStreamerModeInitialized) return;
    window.purpuraStreamerModeInitialized = true;

    let isEnabled = false;
    let nameMaskObserver = null;
    let nameMaskRegex = null;
    let nameMaskInitPromise = null;
    const nameMaskClass = 'purpura-streamer-name-mask';
    const nameMaskSpanAttr = 'data-purpura-streamer-mask';

    function updateStreamerMode(enabled) {
        isEnabled = enabled;
        
        try {
            sessionStorage.setItem('purpura_streamermode', String(enabled));
        } catch {}

        document.dispatchEvent(new CustomEvent('purpura-streamer-mode', { detail: enabled }));

        if (enabled) {
            applyStreamerModeStyles();
            enableDynamicNameMasking();
        } else {
            disableDynamicNameMasking();
            removeStreamerModeStyles();
        }
    }

    function applyStreamerModeStyles() {
        if (document.getElementById('purpura-streamer-mode-styles')) return;

        const style = document.createElement('style');
        style.id = 'purpura-streamer-mode-styles';
        style.textContent = `
            .rbx-header-content .rbx-navbar-account .text-robux-lg,
            .rbx-header-content .rbx-navbar-account .icon-robux-16x16,
            .nav-robux-amount,
            .rbx-menu-item .text-robux,
            .rbx-menu-item .icon-robux,
            [class*="robux"]:not(.robux-menu-btn),
            .currency-counter,
            .text-robux,
            .icon-robux,
            #nav-robux,
            #nav-robux-amount,
            .avatar-name,
            .profile-display-name,
            .profile-name,
            .text-overflow.ng-binding,
            .profile-header-title,
            [data-testid="display-name"],
            .header-title,
            .username,
            .display-name,
            .settings-text-span-visible,
            .avatar-card-label:not(:has(.avatar-status-link)),
            a[href*="/users/profile"]:has(.thumbnail-2d-container) .text-truncate-end,
            a[href*="/users/profile"]:has(.thumbnail-2d-container) .text-no-wrap,
            a[href*="/users/"]:not([href*="/users/profile"])[href*="/profile"] .age-bracket-label-username,
            a[href*="/users/"]:not([href*="/users/profile"])[href*="/profile"] .friends-carousel-display-name,
            a[href*="/users/"]:not([href*="/users/profile"])[href*="/profile"] .friends-carousel-user-name,
            #profile-header-title-container-name,
            .stylistic-alts-username,
            .friend-tile-is-playing,
            .friend-tile-game-name,
            .purpura-streamer-name-mask {
                filter: blur(8px) !important;
                user-select: none !important;
                pointer-events: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    function removeStreamerModeStyles() {
        const style = document.getElementById('purpura-streamer-mode-styles');
        if (style) {
            style.remove();
        }
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
        if (parent.closest(`span[${nameMaskSpanAttr}="1"]`)) return false;
        return true;
    }

    function cleanupLegacyNameMaskClasses() {
        document.querySelectorAll(`.${nameMaskClass}:not([${nameMaskSpanAttr}="1"])`).forEach((element) => {
            element.classList.remove(nameMaskClass);
        });
    }

    const blurredContentStore = new WeakMap();
    const nameMaskOriginals = new WeakMap();
    const BLUR_MASK_CHAR = '\u2022';

    function blurSelectorList() {
        return [
            '.settings-text-span-visible',
            '.text-robux', '.icon-robux', '#nav-robux', '#nav-robux-amount',
            '.nav-robux-amount', '.currency-counter'
        ];
    }

    const blurSelectorStr = blurSelectorList().join(',');

    function maskTextNode(node) {
        if (!isEnabled || !nameMaskRegex) return;
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
            masked.className = nameMaskClass;
            masked.setAttribute(nameMaskSpanAttr, '1');
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

    function maskAllBlurredContent(scope) {
        if (!isEnabled) return;
        const root = (scope && scope.nodeType === Node.ELEMENT_NODE) ? scope : document;
        const elements = root.querySelectorAll ? root.querySelectorAll(blurSelectorStr) : [];
        for (const el of elements) {
            if (el.closest('.purpura-streamer-name-mask')) continue;
            if (blurredContentStore.has(el)) continue;
            blurredContentStore.set(el, el.innerHTML);
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            let node;
            while ((node = walker.nextNode())) {
                const text = node.nodeValue || '';
                if (text.trim()) {
                    node.nodeValue = text.replace(/[^\s]/g, BLUR_MASK_CHAR);
                }
            }
        }
    }

    function unmaskAllContent() {
        const elements = document.querySelectorAll(blurSelectorStr);
        for (const el of elements) {
            if (blurredContentStore.has(el)) {
                el.innerHTML = blurredContentStore.get(el);
                blurredContentStore.delete(el);
            }
        }
    }

    function maskFriendDropdownNames(scope) {
        if (!isEnabled) return;
        const container = (scope && scope.nodeType === Node.ELEMENT_NODE) ? scope : document.body;
        if (!container) return;

        const buttons = container.matches && container.matches('.friend-tile-dropdown-button')
            ? [container]
            : Array.from(container.querySelectorAll('.friend-tile-dropdown-button'));

        for (const btn of buttons) {
            if (btn.querySelector(`span[${nameMaskSpanAttr}="1"]`)) continue;

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
                masked.className = nameMaskClass;
                masked.setAttribute(nameMaskSpanAttr, '1');
                nameMaskOriginals.set(masked, friendName);
                masked.textContent = friendName.replace(/[^\s]/g, BLUR_MASK_CHAR);
                frag.appendChild(masked);

                textNode.replaceWith(frag);
                break;
            }
        }
    }

    function applyNameMaskingIn(root) {
        if (!isEnabled) return;

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
            maskAllBlurredContent(scope);
        }
    }

    function startNameMaskObserver() {
        if (nameMaskObserver || !document.body) return;

        nameMaskObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'characterData') {
                    const parent = mutation.target && mutation.target.parentElement;
                    if (parent) applyNameMaskingIn(parent);
                    continue;
                }

                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        applyNameMaskingIn(node);
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
        if (!isEnabled || !regex) return;

        cleanupLegacyNameMaskClasses();
        maskAllBlurredContent();
        applyNameMaskingIn(document.body);
        startNameMaskObserver();
    }

    function disableDynamicNameMasking() {
        stopNameMaskObserver();
        document.querySelectorAll(`span.${nameMaskClass}[${nameMaskSpanAttr}="1"]`).forEach((element) => {
            element.replaceWith(document.createTextNode(nameMaskOriginals.get(element) || element.textContent || ''));
        });
        cleanupLegacyNameMaskClasses();
        document.querySelectorAll(`.${nameMaskClass}`).forEach((element) => {
            element.classList.remove(nameMaskClass);
        });
        unmaskAllContent();
        if (document.body) {
            document.body.normalize();
        }
    }

    function loadSettings() {
        window.__PurpuraSettings.ready.then(function() {
            const newState = window.__PurpuraSettings.get('stm') === true;
            
            if (newState !== isEnabled) {
                updateStreamerMode(newState);
            } else if (newState) {
                enableDynamicNameMasking();
            }
        });
    }

    loadSettings();

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes['stm']) {
            loadSettings();
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadSettings);
    } else {
        loadSettings();
    }
})();
