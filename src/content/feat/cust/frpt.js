/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
    'use strict';

    if (window.purpuraFreeRobloxPlusThemesInitialized) return;
    window.purpuraFreeRobloxPlusThemesInitialized = true;

    function t(key) { return chrome.i18n.getMessage(key) || key; }

    const STORAGE_KEY = 'frpt';
    const SESSION_KEY = 'purpura_freeRobloxPlusThemes';
    const CACHE_KEY_PREFIX = 'purpura_frpt_cache_';
    const PICKED_THEME_PREFIX = 'purpura_frpt_picked_';
    const USER_SETTINGS_ENDPOINT = 'https://apis.roblox.com/user-settings-api/v1/user-settings';
    const CACHE_TTL_MS = 300 * 1000;
    const THEME_SECTION_SELECTOR = '.app-theme-section';
    const NOTICE_ID = 'purpura-frpt-notice';
    const NOTICE_TEXT = t('frpt_notice');
    const LOGO_URL = chrome.runtime.getURL('images/icons/default/Purpura_Default_Logo_128.png');
    const TOKEN_HEADER_NAME = 'x-bound-auth-token';
    const MODE_THEME_CLASSES = ['dark-theme', 'light-theme'];
    const PICK_ADOPT_WINDOW_MS = 5000;
    const ACCOUNT_PAGE_PATTERN = /\/my\/account(\?|#|$)/;

    const ROBLOX_THEME_PRESETS = [
        { setting: 'Classic', value: 'classic' },
        { setting: 'CircuitRush', value: 'circuit-rush' },
        { setting: 'CosmicDust', value: 'cosmic-dust' },
        { setting: 'ElectricLime', value: 'electric-lime' },
        { setting: 'HyperPlum', value: 'hyper-plum' },
        { setting: 'InfernoBlast', value: 'inferno-blast' },
        { setting: 'KineticEnergy', value: 'kinetic-energy' },
        { setting: 'LavaGlow', value: 'lava-glow' },
        { setting: 'NebulaDrift', value: 'nebula-drift' },
        { setting: 'NitroFrost', value: 'nitro-frost' },
        { setting: 'PixelPop', value: 'pixel-pop' },
        { setting: 'PolarFreeze', value: 'polar-freeze' },
        { setting: 'QuantumPulse', value: 'quantum-pulse' },
        { setting: 'StarBurst', value: 'star-burst' },
        { setting: 'SuperCharge', value: 'super-charge' }
    ];

    const PRESET_VALUES = new Set(ROBLOX_THEME_PRESETS.map(p => p.value));

    function getPresetClasses(preset) {
        return PRESET_VALUES.has(preset) ? [`theme-${preset}`, `${preset}-theme`] : [];
    }

    const ALL_PRESET_CLASSES = ROBLOX_THEME_PRESETS.flatMap(p => getPresetClasses(p.value));

    const state = {
        enabled: false,
        appliedPresetClasses: [],
        bodyClassObserver: null,
        themeSectionObserver: null,
        accountThemeRequest: null,
        cacheKey: CACHE_KEY_PREFIX + 'anonymous',
        pickedTheme: null,
        pickRequestedAt: 0,
        restoreTimer: null
    };

    const hbaClient = new window.PurpuraHBAClient({ onSite: true });

    function toKebabTheme(accountTheme) {
        if (typeof accountTheme !== 'string' || !accountTheme.trim()) return null;
        const trimmed = accountTheme.trim();
        if (trimmed === 'Default' || trimmed === 'None') return null;
        if (/^[a-z0-9-]+$/.test(trimmed) && PRESET_VALUES.has(trimmed)) {
            return trimmed;
        }
        if (!/^[A-Za-z0-9]+$/.test(trimmed)) return null;
        const kebab = trimmed.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
        if (MODE_THEME_CLASSES.indexOf(`${kebab}-theme`) !== -1) return null;
        return kebab;
    }

    function getThemeClasses(accountTheme) {
        const kebab = toKebabTheme(accountTheme);
        if (!kebab) return [];
        if (PRESET_VALUES.has(kebab)) return getPresetClasses(kebab);
        return [`theme-${kebab}`, `${kebab}-theme`];
    }

    function getThemeClass(accountTheme) {
        const kebab = toKebabTheme(accountTheme);
        return kebab ? `${kebab}-theme` : null;
    }

    function waitForBody() {
        return new Promise(resolve => {
            if (document.body) return resolve();
            const observer = new MutationObserver(() => {
                if (document.body) {
                    observer.disconnect();
                    resolve();
                }
            });
            observer.observe(document.documentElement, { childList: true });
        });
    }

    function isOurPresetClass(className) {
        return state.appliedPresetClasses.indexOf(className) !== -1;
    }

    function hasCompetingPresetClasses() {
        const body = document.body;
        if (!body) return false;
        return ALL_PRESET_CLASSES.some(
            className => !isOurPresetClass(className) && body.classList.contains(className)
        );
    }

    function presetOnBody() {
        const body = document.body;
        if (!body) return null;
        const classNames = typeof body.className === 'string' ? body.className : '';
        let winner = null;
        let winnerAt = -1;
        for (let i = 0; i < ROBLOX_THEME_PRESETS.length; i++) {
            const preset = ROBLOX_THEME_PRESETS[i];
            const presetClasses = getPresetClasses(preset.value);
            for (let j = 0; j < presetClasses.length; j++) {
                if (!body.classList.contains(presetClasses[j])) continue;
                const at = classNames.indexOf(presetClasses[j]);
                if (at > winnerAt) {
                    winnerAt = at;
                    winner = preset;
                }
            }
        }
        return winner;
    }

    function adoptThemeOnBody() {
        const preset = presetOnBody();
        if (!preset) return false;

        const classes = getPresetClasses(preset.value);
        const previous = state.appliedPresetClasses;
        const changed = classes.join(' ') !== previous.join(' ');
        if (changed && document.body) {
            const stale = previous.filter(className => classes.indexOf(className) === -1);
            if (stale.length) document.body.classList.remove(...stale);
        }
        state.appliedPresetClasses = classes;
        if (changed && state.pickedTheme !== preset.setting) savePickedTheme(preset.setting);
        return changed;
    }

    function restorePresetClasses() {
        const body = document.body;
        if (!body || !state.enabled || !state.appliedPresetClasses.length) return;
        for (let i = 0; i < state.appliedPresetClasses.length; i++) {
            const cls = state.appliedPresetClasses[i];
            if (!body.classList.contains(cls)) body.classList.add(cls);
        }
    }

    function schedulePresetRestore() {
        if (state.restoreTimer) return;
        state.restoreTimer = setTimeout(() => {
            state.restoreTimer = null;
            if (!state.enabled || !state.appliedPresetClasses.length) return;
            if (Date.now() - state.pickRequestedAt < PICK_ADOPT_WINDOW_MS && hasCompetingPresetClasses()) {
                adoptThemeOnBody();
                return;
            }
            restorePresetClasses();
        }, 30);
    }

    function syncPresetClassesOnBody() {
        if (!state.enabled || !state.appliedPresetClasses.length) return;

        const pickIsFresh = Date.now() - state.pickRequestedAt < PICK_ADOPT_WINDOW_MS;
        if (pickIsFresh && hasCompetingPresetClasses()) {
            adoptThemeOnBody();
            return;
        }

        const body = document.body;
        if (!body) return;
        for (let i = 0; i < state.appliedPresetClasses.length; i++) {
            if (!body.classList.contains(state.appliedPresetClasses[i])) {
                schedulePresetRestore();
                return;
            }
        }
    }

    function observeBodyClasses() {
        if (state.bodyClassObserver || !document.body) return;
        state.bodyClassObserver = new MutationObserver(syncPresetClassesOnBody);
        state.bodyClassObserver.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    function removeInjectedThemeClass() {
        if (state.restoreTimer) {
            clearTimeout(state.restoreTimer);
            state.restoreTimer = null;
        }
        if (state.bodyClassObserver) {
            state.bodyClassObserver.disconnect();
            state.bodyClassObserver = null;
        }
        const body = document.body;
        if (body && state.appliedPresetClasses.length) {
            body.classList.remove(...state.appliedPresetClasses);
        }
        state.appliedPresetClasses = [];
    }

    function applyAccountTheme(accountTheme) {
        if (!document.body) return;
        const classes = getThemeClasses(accountTheme);
        if (!classes.length) {
            removeInjectedThemeClass();
            return;
        }

        if (classes.join(' ') === state.appliedPresetClasses.join(' ')) {
            observeBodyClasses();
            restorePresetClasses();
            return;
        }

        if (state.bodyClassObserver) {
            state.bodyClassObserver.disconnect();
            state.bodyClassObserver = null;
        }
        if (state.appliedPresetClasses.length) {
            document.body.classList.remove(...state.appliedPresetClasses);
        }

        state.appliedPresetClasses = classes;
        observeBodyClasses();
        restorePresetClasses();
    }

    function addThemeNotice(themeSection) {
        if (!state.enabled) return;
        if (!(themeSection instanceof Element) || themeSection.querySelector(`#${NOTICE_ID}`)) return;

        const notice = document.createElement('p');
        notice.id = NOTICE_ID;
        notice.className = 'flex items-center gap-small text-body-medium content-muted margin-none';

        const logo = document.createElement('img');
        logo.src = LOGO_URL;
        logo.alt = 'Purpura';
        logo.width = 24;
        logo.height = 24;
        logo.className = 'shrink-0 radius-small';

        const text = document.createElement('span');
        text.textContent = NOTICE_TEXT;

        notice.appendChild(logo);
        notice.appendChild(text);

        (themeSection.querySelector('[role="group"]') || themeSection).before(notice);
    }

    function ensureThemeNotices() {
        if (!state.enabled) return;
        const sections = document.querySelectorAll(THEME_SECTION_SELECTOR);
        for (let i = 0; i < sections.length; i++) addThemeNotice(sections[i]);
    }

    function removeThemeNotices() {
        document.querySelectorAll(`#${NOTICE_ID}`).forEach(notice => notice.remove());
    }

    let noticeFlushScheduled = false;

    function scheduleThemeNoticeFlush() {
        if (noticeFlushScheduled) return;
        noticeFlushScheduled = true;
        setTimeout(() => {
            noticeFlushScheduled = false;
            ensureThemeNotices();
        }, 0);
    }

    function watchThemeSection() {
        if (!ACCOUNT_PAGE_PATTERN.test(location.href)) return;
        ensureThemeNotices();
        if (state.themeSectionObserver) return;
        state.themeSectionObserver = new MutationObserver(scheduleThemeNoticeFlush);
        state.themeSectionObserver.observe(document.documentElement, { childList: true, subtree: true });
    }

    function stopSectionObservers() {
        if (state.themeSectionObserver) {
            state.themeSectionObserver.disconnect();
            state.themeSectionObserver = null;
        }
        noticeFlushScheduled = false;
    }

    function resolveCacheKey() {
        const userId = getAuthenticatedUserId();
        state.cacheKey = CACHE_KEY_PREFIX + (userId || 'anonymous');
    }

    function pickedThemeKey() {
        return PICKED_THEME_PREFIX + state.cacheKey.slice(CACHE_KEY_PREFIX.length);
    }

    function announceKnownTheme(theme) {
        document.dispatchEvent(new CustomEvent('purpura:frpt-theme-known', { detail: typeof theme === 'string' ? theme : '' }));
    }

    function loadPickedTheme() {
        return new Promise(resolve => {
            chrome.storage.local.get(pickedThemeKey(), data => {
                const stored = data && data[pickedThemeKey()];
                state.pickedTheme = typeof stored === 'string' && stored ? stored : null;
                announceKnownTheme(state.pickedTheme || '');
                resolve(state.pickedTheme);
            });
        });
    }

    function savePickedTheme(theme) {
        const raw = typeof theme === 'string' ? theme.trim() : '';
        const cleared = !raw || raw === 'Default' || raw === 'None' || !getThemeClass(raw);
        state.pickedTheme = cleared ? null : raw;
        announceKnownTheme(state.pickedTheme || '');
        return new Promise(resolve => {
            chrome.storage.local.set({ [pickedThemeKey()]: state.pickedTheme || '' }, resolve);
        });
    }

    function getCachedSettings() {
        return new Promise(resolve => {
            chrome.storage.local.get(state.cacheKey, data => {
                const cache = data && data[state.cacheKey];
                if (!cache || !cache.settings || cache.expiresAt <= Date.now()) return resolve(null);
                resolve(cache);
            });
        });
    }

    function setCachedSettings(settingsData) {
        return new Promise(resolve => {
            chrome.storage.local.set({
                [state.cacheKey]: {
                    settings: settingsData,
                    expiresAt: Date.now() + CACHE_TTL_MS
                }
            }, resolve);
        });
    }

    function getAuthenticatedUserId() {
        const meta = document.querySelector('meta[name="user-data"]');
        const raw = meta ? (meta.getAttribute('data-userid') || '') : '';
        const id = parseInt(raw, 10);
        return Number.isNaN(id) || id <= 0 ? null : id;
    }

    function proxiedFetch(url) {
        return new Promise(resolve => {
            try {
                chrome.runtime.sendMessage({
                    type: 'PURPURA_FETCH_RESOURCE_REQUEST',
                    url,
                    method: 'GET',
                    body: '',
                    accept: 'application/json'
                }, response => {
                    if (chrome.runtime.lastError || !response || !response.ok || typeof response.text !== 'string') {
                        resolve(null);
                        return;
                    }
                    try {
                        resolve(JSON.parse(response.text));
                    } catch {
                        resolve(null);
                    }
                });
            } catch {
                resolve(null);
            }
        });
    }

    async function fetchUserSettings() {
        const baseUrl = 'https://apis.roblox.com';
        const endpoint = '/user-settings-api/v1/user-settings';
        let fullUrl = `${baseUrl}${endpoint}?_PurpuraRequest=${Date.now()}`;

        const method = 'GET';
        const headers = new Headers();
        headers.set('Accept', 'application/json');

        const authenticatedUserId = getAuthenticatedUserId();
        try {
            const batHeaders = await hbaClient.generateBaseHeaders(fullUrl, method, !!authenticatedUserId, undefined);
            if (batHeaders[TOKEN_HEADER_NAME]) headers.set(TOKEN_HEADER_NAME, batHeaders[TOKEN_HEADER_NAME]);
        } catch {
        }

        return fetch(fullUrl, {
            method,
            headers,
            credentials: 'include',
            cache: 'no-store'
        });
    }

    async function handleUserSettingsResponse(settingsData) {
        if (!settingsData || typeof settingsData !== 'object') return;

        const serverTheme = typeof settingsData.accountTheme === 'string' ? settingsData.accountTheme : '';
        const serverHasPlusTheme = !!getThemeClass(serverTheme) && serverTheme !== 'Classic';

        if (serverHasPlusTheme && state.pickedTheme && state.pickedTheme !== serverTheme) {
            await savePickedTheme(serverTheme);
        }

        const effectiveTheme = state.pickedTheme || serverTheme;

        const cached = await getCachedSettings();
        const accountThemeChanged = !cached || cached.settings.accountTheme !== settingsData.accountTheme;
        const cacheExpired = !cached || cached.expiresAt <= Date.now();
        if (accountThemeChanged || cacheExpired) {
            await setCachedSettings(settingsData);
        }

        if (state.enabled) applyAccountTheme(effectiveTheme);
    }

    async function loadCachedAccountTheme() {
        const cached = await getCachedSettings();
        if (!cached || typeof cached.settings.accountTheme !== 'string') return false;
        applyAccountTheme(state.pickedTheme || cached.settings.accountTheme);
        return true;
    }

    async function requestAccountTheme() {
        if (state.accountThemeRequest) return state.accountThemeRequest;
        state.accountThemeRequest = (async () => {
            const proxied = await proxiedFetch(`${USER_SETTINGS_ENDPOINT}?_PurpuraRequest=${Date.now()}`);
            if (proxied) {
                await handleUserSettingsResponse(proxied);
                return;
            }

            try {
                const response = await fetchUserSettings();
                if (response && response.ok) await handleUserSettingsResponse(await response.json());
            } catch {}
        })().finally(() => {
            state.accountThemeRequest = null;
        });
        return state.accountThemeRequest;
    }

    async function loadAccountTheme() {
        await waitForBody();
        resolveCacheKey();
        await loadPickedTheme();
        if (state.pickedTheme) {
            applyAccountTheme(state.pickedTheme);
        } else {
            await loadCachedAccountTheme();
        }
        await requestAccountTheme();
    }

    function isThemeEditorActive() {
        return !!(window.__PurpuraSettings && window.__PurpuraSettings.get('thmEnabled'));
    }

    function setEnabled(value) {
        state.enabled = value === true;

        try {
            sessionStorage.setItem(SESSION_KEY, String(state.enabled));
        } catch {}
        document.dispatchEvent(new CustomEvent('purpura:frpt-enabled', { detail: state.enabled }));

        if (state.enabled && isThemeEditorActive()) {
            removeInjectedThemeClass();
            removeThemeNotices();
            stopSectionObservers();
            return;
        }

        if (state.enabled) {
            watchThemeSection();
            loadAccountTheme().catch(() => {});
        } else {
            removeInjectedThemeClass();
            removeThemeNotices();
            stopSectionObservers();
        }
    }

    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local' && Object.prototype.hasOwnProperty.call(changes, 'thmEnabled')) {
            if (state.enabled) setEnabled(true);
            return;
        }
        if (areaName !== 'sync') return;
        if (!Object.prototype.hasOwnProperty.call(changes, STORAGE_KEY)) return;
        setEnabled(!!changes[STORAGE_KEY].newValue);
    });

    document.addEventListener('purpura:frpt-theme-picked', (event) => {
        const theme = event.detail && typeof event.detail.theme === 'string' ? event.detail.theme : null;
        if (!state.enabled || theme === null) return;
        state.pickRequestedAt = Date.now();
        resolveCacheKey();
        savePickedTheme(theme).then(() => {
            if (state.pickedTheme) applyAccountTheme(state.pickedTheme);
            else removeInjectedThemeClass();
        });
    });

    document.addEventListener('purpura:user-settings-response', (event) => {
        if (!state.enabled) return;
        resolveCacheKey();
        handleUserSettingsResponse(event.detail).catch(() => {});
    });

    window.__PurpuraSettings.ready.then(function () {
        setEnabled(!!window.__PurpuraSettings.get(STORAGE_KEY));
    });
})();
