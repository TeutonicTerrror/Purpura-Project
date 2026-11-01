/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
    'use strict';

    if (window.purpuraPrivateServerControlsInitialized) return;
    window.purpuraPrivateServerControlsInitialized = true;

    function t(key, fallback) {
        return chrome.i18n.getMessage(key) || fallback || key;
    }

    const FEATURE_KEY = 'psc';
    const EXTRACTOR_SCRIPT_ID = 'purpura-serverid-extractor-script';
    const EXTRACTOR_SCRIPT_SRC = 'content/feat/serv/sie.js';
    const EXTRACT_REQUEST_EVENT = 'purpura-extract-serverid-request';
    const EXTRACTED_EVENT = 'purpura-serverid-extracted';
    const CREATED_EVENT = 'purpura-private-server-created';
    const PRIVATE_ROW_SELECTOR = '.flex.items-center.justify-between.padding-y-medium.width-full';
    const BUTTON_COLUMN_SELECTOR = [
        '.flex.items-center.gap-small.grow-0.shrink-0.basis-auto',
        '.flex.flex-col.items-center.gap-xsmall.grow-0.shrink-0.basis-auto'
    ].join(', ');
    const LEGACY_ITEM_SELECTOR = '.rbx-private-game-server-item';
    const LEGACY_DETAILS_SELECTOR = '.rbx-private-game-server-details';
    const SECTION_SELECTOR = '.flex.flex-col.width-full';
    const SECTION_HEADER_SELECTOR = '.flex.flex-col.gap-xsmall';
    const SECTION_FLAG = 'data-purpura-psc-section';
    const CONFIGURE_ANCHOR_SELECTOR = '[aria-label="Configure"], .rbx-private-server-configure, a[href*="private-server/configure"]';
    const MENU_SELECTOR = '.dropdown-menu, [role="menu"], .popover-content';
    const ROW_FLAG = 'data-purpura-psc';
    const EXTRACT_TIMEOUT_MS = 1200;
    const EXTRACT_RETRY_DELAY_MS = 800;
    const MAX_EXTRACT_RETRIES = 4;
    const FLASH_DURATION_MS = 1500;
    const SUMMARY_DELAY_MS = 2500;

    let enabled = false;
    let quickLinkEnabled = true;
    let friendsToggleEnabled = true;
    let autoAllowOnCreate = true;

    let observer = null;
    let scanTimer = null;
    let csrfToken = null;
    let currentUserId = null;
    let currentUserIdRequest = null;
    const detailsCache = new Map();
    const claimedIds = new Set();

    const diagnostics = {
        scans: 0,
        candidates: 0,
        cardsSeen: 0,
        injected: 0,
        recent: []
    };

    function describeElement(element) {
        if (!element || !element.tagName) return '(none)';
        const id = element.id ? '#' + element.id : '';
        const classes = typeof element.className === 'string' ? element.className.trim() : '';
        const cls = classes ? '.' + classes.split(/\s+/).slice(0, 4).join('.') : '';
        return element.tagName.toLowerCase() + id + cls;
    }

    function reportEvent(row, reason) {
        if (reason.indexOf('injected:') === 0) diagnostics.injected += 1;

        diagnostics.recent.push({
            at: Date.now(),
            reason: reason,
            element: describeElement(row)
        });
        if (diagnostics.recent.length > 60) diagnostics.recent.shift();

        console.debug('[Purpura PSC]', reason, row);
    }

    window.__purpuraPSC = {
        diagnostics: diagnostics,
        collectPrivateServerCards: collectPrivateServerCards
    };


    function robloxFetch(endpoint, options) {
        const opts = options || {};
        const method = (opts.method || 'GET').toUpperCase();
        const url = `https://games.roblox.com${endpoint}`;
        const headers = { Accept: 'application/json' };

        if (opts.body) headers['Content-Type'] = 'application/json';
        if (method !== 'GET' && method !== 'HEAD' && csrfToken) {
            headers['X-CSRF-TOKEN'] = csrfToken;
        }

        return fetch(url, {
            method,
            headers,
            credentials: 'include',
            body: opts.body ? JSON.stringify(opts.body) : undefined
        });
    }

    async function apiFetch(endpoint, options) {
        const method = ((options && options.method) || 'GET').toUpperCase();
        let response = await robloxFetch(endpoint, options);

        if (response.status === 403 && method !== 'GET' && method !== 'HEAD') {
            const token = response.headers.get('x-csrf-token');
            if (token) {
                csrfToken = token;
                response = await robloxFetch(endpoint, options);
            }
        }

        let data = null;
        try { data = await response.clone().json(); } catch (_) {}

        return { ok: response.ok, status: response.status, data };
    }

    async function getVipServerDetails(vipServerId) {
        if (detailsCache.has(vipServerId)) return detailsCache.get(vipServerId);

        let details = null;
        try {
            const result = await apiFetch(`/v1/vip-servers/${vipServerId}`);
            if (result.ok && result.data) details = result.data;
        } catch (_) {}

        detailsCache.set(vipServerId, details);
        return details;
    }

    async function fetchVipServerDetails(vipServerId) {
        try {
            const result = await apiFetch(`/v1/vip-servers/${vipServerId}`);
            if (result.ok && result.data) {
                detailsCache.set(vipServerId, result.data);
                return result.data;
            }
        } catch (_) {}
        return null;
    }

    function setFriendsAllowed(vipServerId, friendsAllowed) {
        return apiFetch(`/v1/vip-servers/${vipServerId}/permissions`, {
            method: 'PATCH',
            body: { friendsAllowed }
        });
    }

    function regenerateJoinCode(vipServerId) {
        return apiFetch(`/v1/vip-servers/${vipServerId}`, {
            method: 'PATCH',
            body: { newJoinCode: true }
        });
    }


    function ensureExtractorScript() {
        if (document.getElementById(EXTRACTOR_SCRIPT_ID)) return;

        const parent = document.head || document.documentElement;
        if (!parent) return;

        const script = document.createElement('script');
        script.id = EXTRACTOR_SCRIPT_ID;
        script.src = chrome.runtime.getURL(EXTRACTOR_SCRIPT_SRC);
        script.async = false;
        parent.appendChild(script);
    }

    function extractServerIdentifiers(row) {
        return new Promise((resolve) => {
            ensureExtractorScript();

            const extractionId = `purpura_psc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
            let finished = false;
            let timer = null;

            const cleanup = () => {
                row.removeAttribute('data-purpura-extraction-id');
                window.removeEventListener(EXTRACTED_EVENT, onExtracted);
                clearTimeout(timer);
            };

            const onExtracted = (event) => {
                const detail = event && event.detail;
                if (finished || !detail || detail.extractionId !== extractionId) return;
                finished = true;
                cleanup();
                resolve(detail.error ? null : detail);
            };

            row.setAttribute('data-purpura-extraction-id', extractionId);
            window.addEventListener(EXTRACTED_EVENT, onExtracted);

            timer = setTimeout(() => {
                if (finished) return;
                finished = true;
                cleanup();
                resolve(null);
            }, EXTRACT_TIMEOUT_MS);

            window.dispatchEvent(new CustomEvent(EXTRACT_REQUEST_EVENT, {
                detail: { extractionId, scope: 'ancestors' }
            }));
        });
    }

    function getCurrentUserId() {
        if (currentUserId) return Promise.resolve(currentUserId);
        if (currentUserIdRequest) return currentUserIdRequest;

        currentUserIdRequest = fetch('https://users.roblox.com/v1/users/authenticated', {
            credentials: 'include'
        })
            .then((response) => (response.ok ? response.json() : null))
            .then((data) => {
                currentUserId = data && data.id ? String(data.id) : null;
                return currentUserId;
            })
            .catch(() => null)
            .then((id) => {
                currentUserIdRequest = null;
                return id;
            });

        return currentUserIdRequest;
    }

    function getRowOwnerId(row) {
        const ownerLink = row.querySelector('.rbx-private-owner a[href], .rbx-private-owner .avatar-card-fullbody[href]');
        const href = ownerLink ? ownerLink.getAttribute('href') : '';
        const match = href ? href.match(/\/users\/(\d+)\//) : null;
        return match ? match[1] : null;
    }


    function injectStyles() {
        if (document.getElementById('purpura-psc-styles')) return;

        const style = document.createElement('style');
        style.id = 'purpura-psc-styles';
        style.textContent = `
            .purpura-psc-controls {
                display: flex;
                flex-direction: column;
                gap: 6px;
                width: 100%;
                margin-top: 6px;
            }

            .purpura-psc-actions {
                display: flex;
                gap: 6px;
                width: 100%;
            }

            .purpura-psc-action {
                flex: 1;
                min-width: 0;
                padding: 6px 8px;
                border-radius: 6px;
                border: 1px solid rgba(128, 128, 140, 0.3);
                background: rgba(128, 128, 140, 0.14);
                color: inherit;
                font: inherit;
                font-size: 11px;
                font-weight: 500;
                line-height: 1.4;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                cursor: pointer;
                transition: background 0.15s ease, border-color 0.15s ease;
            }

            .purpura-psc-action:hover:not([disabled]) {
                background: rgba(139, 92, 246, 0.18);
                border-color: rgba(139, 92, 246, 0.45);
            }

            .purpura-psc-action[disabled] {
                opacity: 0.5;
                cursor: default;
            }

            .purpura-psc-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                width: 100%;
            }

            .purpura-psc-label {
                font-size: 12px;
                opacity: 0.72;
                color: inherit;
            }

            .purpura-psc-switch {
                position: relative;
                flex: 0 0 auto;
                width: 34px;
                height: 18px;
                padding: 0;
                border: none;
                border-radius: 9px;
                background: rgba(128, 128, 140, 0.45);
                cursor: pointer;
                transition: background 0.15s ease;
            }

            .purpura-psc-switch[aria-checked="true"] {
                background: #8b5cf6;
            }

            .purpura-psc-switch[disabled] {
                opacity: 0.55;
                cursor: default;
            }

            .purpura-psc-knob {
                position: absolute;
                top: 2px;
                left: 2px;
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: #ffffff;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
                transition: transform 0.15s ease;
            }

            .purpura-psc-switch[aria-checked="true"] .purpura-psc-knob {
                transform: translateX(16px);
            }
        `;
        (document.head || document.documentElement).appendChild(style);
    }

    function flashLabel(button, text) {
        if (!button.dataset.pscLabel) button.dataset.pscLabel = button.textContent;

        clearTimeout(button.pscFlashTimer);
        button.textContent = text;
        button.pscFlashTimer = setTimeout(() => {
            button.textContent = button.dataset.pscLabel;
            button.pscFlashTimer = null;
        }, FLASH_DURATION_MS);
    }

    function applyLinkActionState(copyButton, regenerateButton, details) {
        copyButton.disabled = !(details && details.link);
        regenerateButton.disabled = !!(details && details.active === false);
    }

    function createLinkActions(vipServerId, details) {
        const actions = document.createElement('div');
        actions.className = 'purpura-psc-actions';

        const update = (nextDetails) => {
            applyLinkActionState(copyButton, regenerateButton, nextDetails);
        };

        const copyButton = document.createElement('button');
        copyButton.type = 'button';
        copyButton.className = 'purpura-psc-action';
        copyButton.textContent = t('privateServerControls_copyLink', 'Copy Link');

        const regenerateButton = document.createElement('button');
        regenerateButton.type = 'button';
        regenerateButton.className = 'purpura-psc-action';
        regenerateButton.textContent = t('privateServerControls_regenerate', 'Regenerate Link');

        update(details);

        copyButton.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (copyButton.disabled) return;

            const current = await fetchVipServerDetails(vipServerId);
            if (!current || !current.link) {
                flashLabel(copyButton, t('privateServerControls_error', 'Try Again'));
                return;
            }

            try {
                await navigator.clipboard.writeText(current.link);
                flashLabel(copyButton, t('privateServerControls_copied', 'Copied!'));
            } catch (_) {
                flashLabel(copyButton, t('privateServerControls_error', 'Try Again'));
            }

            applyLinkActionState(copyButton, regenerateButton, current);
        });

        regenerateButton.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (regenerateButton.disabled) return;

            regenerateButton.disabled = true;

            let current = null;
            try {
                const result = await regenerateJoinCode(vipServerId);
                if (!result.ok) throw new Error(`HTTP ${result.status}`);

                detailsCache.delete(vipServerId);
                current = await fetchVipServerDetails(vipServerId);
                if (!current) copyButton.disabled = false;
                flashLabel(regenerateButton, t('privateServerControls_regenerated', 'Regenerated!'));
            } catch (_) {
                flashLabel(regenerateButton, t('privateServerControls_error', 'Try Again'));
            } finally {
                const latest = current || detailsCache.get(vipServerId) || null;
                applyLinkActionState(copyButton, regenerateButton, latest);
            }
        });

        actions.appendChild(copyButton);
        actions.appendChild(regenerateButton);
        return { element: actions, update: update };
    }

    function createFriendsToggle(vipServerId, friendsAllowed) {
        const label = t('privateServerControls_friendsAllowed', 'Friends Allowed');

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'purpura-psc-switch';
        toggle.setAttribute('role', 'switch');
        toggle.setAttribute('aria-checked', String(friendsAllowed === true));
        toggle.setAttribute('aria-label', label);
        toggle.title = label;

        const knob = document.createElement('span');
        knob.className = 'purpura-psc-knob';
        toggle.appendChild(knob);

        toggle.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (toggle.disabled) return;

            const next = toggle.getAttribute('aria-checked') !== 'true';
            toggle.setAttribute('aria-checked', String(next));
            toggle.disabled = true;

            try {
                const result = await setFriendsAllowed(vipServerId, next);
                if (!result.ok) throw new Error(`HTTP ${result.status}`);
                detailsCache.delete(vipServerId);
            } catch (_) {
                toggle.setAttribute('aria-checked', String(!next));
            } finally {
                toggle.disabled = false;
            }
        });

        return toggle;
    }

    function createFriendsRow(vipServerId, friendsAllowed, options) {
        const label = t('privateServerControls_friendsAllowed', 'Friends Allowed');
        const pending = !!(options && options.pending);

        const row = document.createElement('div');
        row.className = 'purpura-psc-row';

        const text = document.createElement('span');
        text.className = 'purpura-psc-label';
        text.textContent = label;

        const toggle = createFriendsToggle(vipServerId, friendsAllowed);
        toggle.disabled = pending;

        row.appendChild(text);
        row.appendChild(toggle);

        const update = (details) => {
            const allowed = !!(
                details &&
                details.permissions &&
                details.permissions.friendsAllowed === true
            );
            toggle.setAttribute('aria-checked', String(allowed));
            toggle.disabled = false;
        };

        return { element: row, update: update };
    }

    function isInsideMenu(element) {
        return !!element.closest(MENU_SELECTOR);
    }

    function findConfigureAnchor(root) {
        if (!root || !root.querySelectorAll) return null;

        const anchors = root.querySelectorAll(CONFIGURE_ANCHOR_SELECTOR);
        for (const anchor of anchors) {
            if (!isInsideMenu(anchor)) return anchor;
        }
        return null;
    }

    function tagPrivateSections() {
        document.querySelectorAll(SECTION_SELECTOR).forEach((section) => {
            const header = section.querySelector(SECTION_HEADER_SELECTOR);
            const heading = (header && header.querySelector('h3')) || section.querySelector('h3');
            const text = heading && heading.textContent ? heading.textContent.toLowerCase() : '';

            let type = 'other';
            if (section.id === 'rbx-friends-running-games' || text.includes('friends')) {
                type = 'friends';
            } else if (section.id === 'rbx-public-running-games' || text.includes('other')) {
                type = 'public';
            } else if (
                section.id === 'rbx-private-running-games' ||
                section.classList.contains('gap-small') ||
                text.includes('private')
            ) {
                type = 'private';
            }

            if (section.getAttribute(SECTION_FLAG) !== type) {
                section.setAttribute(SECTION_FLAG, type);
            }
        });
    }

    function isInPrivateSection(row) {
        if (row.closest('[data-rovalra-section-type="private"]')) return true;
        return !!row.closest(`[${SECTION_FLAG}="private"]`);
    }

    function findButtonColumn(card) {
        return card.querySelector(BUTTON_COLUMN_SELECTOR) || null;
    }

    function findLegacyDetails(card) {
        return card.querySelector(LEGACY_DETAILS_SELECTOR) || null;
    }

    function canHostControls(card) {
        return !!findLegacyDetails(card) || !!findButtonColumn(card);
    }

    function hasControlsForId(vipServerId) {
        const id = String(vipServerId);
        const containers = document.querySelectorAll('.purpura-psc-controls');

        for (const container of containers) {
            if (container.getAttribute('data-purpura-psc-id') === id) return true;
        }

        return false;
    }

    const CONFIGURE_HREF_PATTERNS = [
        /private-server\/configure\/(\d+)/,
        /[?&](?:serverId|vipServerId|privateServerId)=(\d+)/,
        /private-server\/(\d{4,})/,
        /\/vip-servers\/(\d+)/
    ];

    function getOwnershipFlag(row) {
        return (
            row.getAttribute('data-rovalra-is-owner') ||
            row.getAttribute('data-purpura-is-owner') ||
            ''
        );
    }

    function isKnownNonOwner(row) {
        return getOwnershipFlag(row) === 'false';
    }

    async function resolveOwnership(row, identifiers) {
        const flag = getOwnershipFlag(row);
        if (flag === 'true') return { owned: true, reason: 'owned:flag' };
        if (flag === 'false') return { owned: false, reason: 'not-owned:flag' };

        const ownerId = getRowOwnerId(row);
        if (ownerId) {
            const viewerId = await getCurrentUserId();
            if (!viewerId) return { owned: false, reason: 'not-owned:unknown-viewer' };
            if (ownerId === viewerId) {
                return { owned: true, reason: 'owned:owner-link' };
            }
            return { owned: false, reason: 'not-owned:owner-link' };
        }

        if (identifiers && identifiers.isOwner === true) {
            return { owned: true, reason: 'owned:fiber' };
        }

        if (findConfigureAnchor(row)) {
            return { owned: true, reason: 'owned:configure' };
        }

        return { owned: false, reason: 'not-owned:no-evidence' };
    }

    function isSettledRow(row) {
        const state = row.getAttribute(ROW_FLAG);
        return state === 'done' || state === 'skipped';
    }

    function readPrivateServerId(root) {
        if (root.getAttribute) {
            const tagged =
                root.getAttribute('data-private-server-id') ||
                root.getAttribute('data-purpura-private-server-id');
            if (tagged) return String(tagged);
        }

        const anchor = findConfigureAnchor(root);
        const href = anchor ? anchor.getAttribute('href') || '' : '';

        for (const pattern of CONFIGURE_HREF_PATTERNS) {
            const match = href.match(pattern);
            if (match) return match[1];
        }

        return null;
    }

    function isOwnControls(node) {
        return !!node.closest('.purpura-psc-controls, .purpura-psc-actions, .purpura-psc-row');
    }

    function collectPrivateServerCards() {
        const cards = new Set();

        document.querySelectorAll(PRIVATE_ROW_SELECTOR).forEach((row) => {
            if (!isInPrivateSection(row)) return;
            if (!findButtonColumn(row)) return;
            cards.add(row);
        });

        document.querySelectorAll(LEGACY_ITEM_SELECTOR).forEach((item) => {
            if (!findLegacyDetails(item)) return;
            cards.add(item);
        });

        return cards;
    }

    function prepareButtonColumn(column) {
        if (!column) return;

        if (!column.classList.contains('flex-col')) {
            column.classList.remove('gap-small');
            column.classList.add(
                'flex',
                'flex-col',
                'items-center',
                'gap-xsmall',
                'grow-0',
                'shrink-0',
                'basis-auto'
            );
        }

        const configure = findConfigureAnchor(column);
        const joinButton = column.querySelector(
            'button:not(.purpura-psc-action):not(.purpura-psc-switch)'
        );
        const joinWrapper =
            joinButton && joinButton.parentElement !== column
                ? joinButton.parentElement
                : null;

        if (!configure || !joinWrapper) return;
        if (configure.parentElement !== column) return;
        if (joinWrapper.parentElement !== column) return;

        const configureJoinRow = document.createElement('div');
        configureJoinRow.className = 'flex flex-row items-center gap-xsmall';

        configureJoinRow.appendChild(configure);
        configureJoinRow.appendChild(joinWrapper);
        column.prepend(configureJoinRow);
    }

    function insertControls(card, container) {
        if (card.querySelector('.purpura-psc-controls')) return;

        const details = findLegacyDetails(card);
        if (details) {
            const joinSpan = details.querySelector('span[data-placeid]');
            if (joinSpan && joinSpan.parentElement === details) {
                joinSpan.after(container);
            } else {
                details.appendChild(container);
            }
            return;
        }

        const column = findButtonColumn(card);
        if (column) {
            prepareButtonColumn(column);
            column.appendChild(container);
        } else {
            card.appendChild(container);
        }
    }


    async function processPrivateServerRow(row, attempt) {
        if (!row.isConnected) return;
        if (isSettledRow(row)) return;
        if (isOwnControls(row)) return;
        if (isKnownNonOwner(row)) return;

        if (!canHostControls(row)) {
            row.setAttribute(ROW_FLAG, 'skipped');
            reportEvent(row, 'no-container');
            return;
        }

        let vipServerId = readPrivateServerId(row);
        let identifiers = null;

        if (!vipServerId) {
            identifiers = await extractServerIdentifiers(row);
            vipServerId = identifiers && identifiers.privateServerId ? String(identifiers.privateServerId) : null;
        }

        if (!vipServerId) {
            reportEvent(row, 'no-id');
            if (attempt < MAX_EXTRACT_RETRIES && row.isConnected) {
                setTimeout(() => processPrivateServerRow(row, attempt + 1), EXTRACT_RETRY_DELAY_MS);
            }
            return;
        }

        if (claimedIds.has(vipServerId) || hasControlsForId(vipServerId)) {
            row.setAttribute(ROW_FLAG, 'skipped');
            reportEvent(row, 'duplicate:' + vipServerId);
            return;
        }
        claimedIds.add(vipServerId);

        const ownership = await resolveOwnership(row, identifiers);
        if (!ownership.owned) {
            row.setAttribute(ROW_FLAG, 'skipped');
            reportEvent(row, ownership.reason);
            return;
        }

        row.setAttribute(ROW_FLAG, 'done');
        reportEvent(row, ownership.reason);

        const container = document.createElement('div');
        container.className = 'purpura-psc-controls';
        container.setAttribute('data-purpura-psc-id', vipServerId);

        const actions = quickLinkEnabled ? createLinkActions(vipServerId, null) : null;
        const friends = friendsToggleEnabled
            ? createFriendsRow(vipServerId, false, { pending: true })
            : null;

        if (actions) container.appendChild(actions.element);
        if (friends) container.appendChild(friends.element);
        if (!container.childElementCount) return;

        insertControls(row, container);
        reportEvent(row, 'injected:' + vipServerId);

        const details = await fetchVipServerDetails(vipServerId);
        if (!container.isConnected || !details) return;

        if (details.subscription && details.subscription.expired) {
            container.remove();
            claimedIds.delete(vipServerId);
            return;
        }

        if (actions) actions.update(details);
        if (friends) friends.update(details);
    }

    function scanPrivateServerRows() {
        if (!enabled || (!quickLinkEnabled && !friendsToggleEnabled)) return;

        tagPrivateSections();

        const candidates = collectPrivateServerCards();
        diagnostics.scans += 1;
        diagnostics.candidates = candidates.size;
        if (candidates.size > diagnostics.cardsSeen) diagnostics.cardsSeen = candidates.size;

        candidates.forEach((card) => {
            if (!card.isConnected) return;
            if (isOwnControls(card)) return;
            if (isKnownNonOwner(card)) return;
            if (isSettledRow(card)) return;
            if (card.querySelector('.purpura-psc-controls')) return;

            card.setAttribute(ROW_FLAG, 'pending');
            processPrivateServerRow(card, 0);
        });
    }


    async function handlePrivateServerCreated(event) {
        if (!enabled || !autoAllowOnCreate) return;

        const detail = (event && event.detail) || {};
        if (detail.FailureReason !== undefined) return;

        const vipServerId = detail.vipServerId;
        if (!vipServerId) return;

        try {
            await setFriendsAllowed(vipServerId, true);
            detailsCache.delete(vipServerId);
        } catch (_) {}
    }


    function start() {
        if (!document.body || observer) return;

        injectStyles();
        scanPrivateServerRows();
        setTimeout(summarize, SUMMARY_DELAY_MS);

        observer = new MutationObserver(() => {
            clearTimeout(scanTimer);
            scanTimer = setTimeout(scanPrivateServerRows, 60);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function summarize() {
        if (!enabled) return;
        if (!/\/games\//.test(window.location.pathname)) return;

        if (!diagnostics.cardsSeen) {
            console.info('[Purpura] Private Server Quick Controls: no private server cards found on this page.');
            return;
        }

        if (!diagnostics.injected) {
            console.info(
                '[Purpura] Private Server Quick Controls: found ' + diagnostics.cardsSeen +
                ' candidate card(s) but resolved no vip server id. Paste ' +
                'JSON.stringify(window.__purpuraPSC.diagnostics) to report this.'
            );
            return;
        }

        console.debug('[Purpura] Private Server Quick Controls: decorated ' + diagnostics.injected + ' card(s).');
    }

    function teardown() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        clearTimeout(scanTimer);
        scanTimer = null;

        claimedIds.clear();
        document.querySelectorAll('.purpura-psc-controls').forEach((row) => row.remove());
        document.querySelectorAll(`[${ROW_FLAG}]`).forEach((row) => row.removeAttribute(ROW_FLAG));
    }

    function applySettings(value) {
        const config = value && typeof value === 'object' ? value : {};

        enabled = config.enabled === undefined ? true : config.enabled === true;
        quickLinkEnabled = config.quickLink === undefined ? true : config.quickLink === true;
        friendsToggleEnabled = config.friendsToggle === undefined ? true : config.friendsToggle === true;
        autoAllowOnCreate = config.autoAllowOnCreate === undefined ? true : config.autoAllowOnCreate === true;

        teardown();

        if (enabled) start();
    }

    function loadSettings() {
        window.__PurpuraSettings.ready.then(function () {
            applySettings(window.__PurpuraSettings.get(FEATURE_KEY));
        });
    }

    loadSettings();

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace !== 'sync' || !changes[FEATURE_KEY]) return;
        applySettings(changes[FEATURE_KEY].newValue);
    });

    document.addEventListener(CREATED_EVENT, handlePrivateServerCreated);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            if (enabled) start();
        }, { once: true });
    } else if (enabled) {
        start();
    }
})();
