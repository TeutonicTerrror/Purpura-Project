/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
    'use strict';

    if (window.purpuraRobuxBonusSelectorInitialized) return;
    window.purpuraRobuxBonusSelectorInitialized = true;

    const SETTING_KEY = 'rbon';
    const CARD_ID = 'purpura-robux-bonus-picker';
    const BONUS_URL = 'https://apis.roblox.com/payments-bonus-service/v1/bonus-sessions';

    const FALLBACK_SESSIONS = [
        'd8ed6443-4c80-46b0-924c-2ce353b6c336',
        'c7968d42-475e-4b88-8109-33f4604bb4c9',
        '860a7100-f82a-4071-9e76-90bca21d0584',
        '64dec592-12b9-43f5-8910-325c34a6a140',
        '38eb9903-89c3-4bfd-bc86-d11fa0f5ff8b',
        '5e7a97e6-8f0e-4463-b017-ea0f7ca33829',
        '85317163-5f7e-4f87-b01c-b585f8ed1adb'
    ];
    const CATALOG_DETAILS_URL = 'https://catalog.roblox.com/v1/catalog/items/details';

    let enabled = true;
    let lastUrl = '';
    let options = [];
    let currentSession = '';
    let currentAp = '';
    let rendering = false;

    function settingEnabled(value) {
        if (value && typeof value === 'object') return value.enabled === true;
        return value !== false;
    }

    function isBonusPage() {
        if (!/^\/upgrades\/(paymentmethods|robux)/.test(location.pathname)) return false;
        const params = new URLSearchParams(location.search);
        if (params.get('page') !== 'RobuxRedesign') return false;
        currentSession = params.get('paymentSessionId') || '';
        currentAp = params.get('ap') || '';
        return !!(currentSession && currentAp);
    }

    async function requestJson(url, init) {
        try {
            const response = await fetch(url, {
                credentials: 'include',
                ...init
            });
            if (!response.ok) return null;
            return await response.json();
        } catch {
            return null;
        }
    }

    function fetchBonusSession(sessionId) {
        return requestJson(BONUS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentSessionId: sessionId })
        });
    }

    function readAvatarBonus(payload) {
        return payload && payload.avatarItemPayload ? payload.avatarItemPayload : null;
    }

    function readGamePassBonus(payload) {
        return payload && payload.gamePassPayload ? payload.gamePassPayload : null;
    }

    function addOption(map, option) {

        if (!option || (!option.name && !option.assetId)) return;
        if (map.has(option.key)) return;
        map.set(option.key, option);
    }

    function addSessionOptions(map, sessionId, data) {
        if (!data) return;

        if (sessionId === currentSession) {
            for (const entry of data.productDisplayableBonuses || []) {
                const item = readAvatarBonus((entry.displayableBonuses || []).find(readAvatarBonus));
                if (!item) continue;
                addOption(map, {
                    key: `asset:${item.assetId}`,
                    name: item.displayName || '',
                    assetId: item.assetId,
                    targetAp: String((entry.key && entry.key.productId) || currentAp),
                    targetSession: sessionId
                });
            }
        }

        const bonus = (data.selectedDisplayableBonuses || [])[0];
        const gamePass = readGamePassBonus(bonus);
        if (!gamePass) return;

        addOption(map, {
            key: `gamepass:${bonus.virtualPurchasingProductTargetId}`,
            name: gamePass.gamePassDisplayName || '',
            subtitle: gamePass.experienceDisplayName || '',
            targetAp: currentAp,
            targetSession: sessionId
        });
    }

    async function buildOptions() {
        const map = new Map();

        addSessionOptions(map, currentSession, await fetchBonusSession(currentSession));

        if (map.size < 2) {
            for (const sessionId of FALLBACK_SESSIONS) {
                if (sessionId === currentSession) continue;
                addSessionOptions(map, sessionId, await fetchBonusSession(sessionId));
                if (map.size >= 6) break;
            }
        }

        const missing = Array.from(map.values()).filter(option => !option.name && option.assetId);
        if (missing.length) {
            const details = await requestJson(CATALOG_DETAILS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: missing.map(option => ({ itemType: 'Asset', id: option.assetId })) })
            });
            const names = new Map();
            for (const item of (details && details.data) || []) names.set(item.id, item.name);
            for (const option of missing) {
                const name = names.get(option.assetId);
                if (name) option.name = name;
            }
        }

        return Array.from(map.values()).filter(option => option.name);
    }

    function selectOption(option) {
        const url = new URL(location.href);
        url.searchParams.set('ap', option.targetAp);
        url.searchParams.set('paymentSessionId', option.targetSession);
        location.href = url.toString();
    }

    function findAnchor() {
        const candidates = [
            'main .flex.flex-col.gap-large.stroke-standard',
            'main [data-testid="robux-package-summary"]',
            'main .robux-container',
            '#upgrades-container',
            'main'
        ];
        for (const selector of candidates) {
            const element = document.querySelector(selector);
            if (element) return element;
        }
        return null;
    }

    function optionButton(option) {
        const selected = option.targetSession === currentSession && option.targetAp === currentAp;

        const button = document.createElement('button');
        button.type = 'button';
        button.disabled = selected;
        button.className = 'purpura-robux-bonus-option';
        button.style.cssText = [
            'display:flex', 'align-items:center', 'gap:10px', 'flex:1 1 240px',
            'min-width:0', 'text-align:left', 'padding:10px', 'border-radius:8px',
            'background:rgba(0,0,0,0.04)', 'border:2px solid ' + (selected ? 'var(--color-content-link, #00a2ff)' : 'transparent'),
            'cursor:' + (selected ? 'default' : 'pointer'), 'color:inherit', 'font:inherit'
        ].join(';');

        if (option.assetId) {
            const image = document.createElement('img');
            image.src = `https://www.roblox.com/asset-thumbnail/image?assetId=${option.assetId}&width=150&height=150&format=png`;
            image.alt = option.name;
            image.loading = 'lazy';
            image.style.cssText = 'width:44px;height:44px;object-fit:contain;border-radius:6px;flex:0 0 auto;';
            button.appendChild(image);
        }

        const text = document.createElement('span');
        text.style.cssText = 'display:flex;flex-direction:column;gap:2px;min-width:0;';

        const name = document.createElement('span');
        name.textContent = option.name;
        name.style.cssText = 'font-weight:600;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
        text.appendChild(name);

        const subtitleText = option.subtitle || (selected ? 'Selected' : '');
        if (subtitleText) {
            const subtitle = document.createElement('span');
            subtitle.textContent = subtitleText;
            subtitle.style.cssText = 'font-size:12px;opacity:0.7;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
            text.appendChild(subtitle);
        }

        button.appendChild(text);
        button.addEventListener('click', () => selectOption(option));
        return button;
    }

    function render() {
        if (!enabled || rendering) return;
        const anchor = findAnchor();
        if (!anchor) return;

        rendering = true;
        try {
            const existing = document.getElementById(CARD_ID);
            if (existing) existing.remove();
            if (options.length < 2) return;

            const card = document.createElement('div');
            card.id = CARD_ID;
            card.className = 'purpura-robux-bonus-picker';
            card.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin:12px 0;';

            const title = document.createElement('div');
            title.textContent = 'Choose your bonus item';
            title.style.cssText = 'font-weight:700;font-size:15px;';
            card.appendChild(title);

            const list = document.createElement('div');
            list.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;';
            options.forEach(option => list.appendChild(optionButton(option)));
            card.appendChild(list);

            const hint = document.createElement('div');
            hint.textContent = "Roblox can't guarantee these bonus items will be granted at checkout. Use at your own discretion.";
            hint.style.cssText = 'font-size:12px;opacity:0.7;';
            card.appendChild(hint);

            anchor.insertBefore(card, anchor.firstChild);
        } finally {
            rendering = false;
        }
    }

    async function start() {
        if (!enabled || !isBonusPage()) return;
        if (rendering) return;
        rendering = true;
        try {
            options = await buildOptions();
        } finally {
            rendering = false;
        }
        render();
    }

    let retries = 0;
    let ticker = null;

    function tick() {
        if (!enabled) return;

        if (location.href !== lastUrl) {
            lastUrl = location.href;
            options = [];
            retries = 0;
            const existing = document.getElementById(CARD_ID);
            if (existing) existing.remove();
        }

        if (!isBonusPage()) return;

        if (options.length) {
            if (!document.getElementById(CARD_ID)) render();
            return;
        }

        if (retries > 12) return;
        retries += 1;
        start();
    }

    function startWatching() {
        if (ticker) return;
        lastUrl = location.href;
        ticker = setInterval(tick, 1000);
    }

    window.__PurpuraSettings.ready.then(function () {
        enabled = settingEnabled(window.__PurpuraSettings.get(SETTING_KEY));
        if (!enabled) return;
        startWatching();
        tick();
    });

    chrome.storage.onChanged.addListener(function (changes, area) {
        if (area !== 'sync') return;
        const change = changes[SETTING_KEY];
        if (!change) return;
        enabled = settingEnabled(change.newValue);
        if (enabled) {
            startWatching();
            tick();
            return;
        }
        const existing = document.getElementById(CARD_ID);
        if (existing) existing.remove();
    });
})();
