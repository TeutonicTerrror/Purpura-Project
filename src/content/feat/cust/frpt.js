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

    const state = {
        enabled: false,
        injectedThemeClass: null,
        themeSectionObserver: null,
        sectionFinder: null,
        accountThemeRequest: null,
        cacheKey: CACHE_KEY_PREFIX + 'anonymous',
        pickedTheme: null
    };

    const hbaClient = new window.PurpuraHBAClient({ onSite: true });

    function getThemeClass(accountTheme) {
        return typeof accountTheme !== 'string' || !/^[A-Za-z0-9]+$/.test(accountTheme)
            ? null
            : `${accountTheme.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}-theme`;
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

    function removeInjectedThemeClass() {
        if (state.injectedThemeClass && document.body) {
            document.body.classList.remove(state.injectedThemeClass);
        }
        state.injectedThemeClass = null;
    }

    const MODE_THEME_CLASSES = ['dark-theme', 'light-theme'];

    function appThemeClasses() {
        if (!document.body) return [];
        return Array.from(document.body.classList).filter(name => name.endsWith('-theme') && MODE_THEME_CLASSES.indexOf(name) === -1);
    }

    function applyAccountTheme(accountTheme) {
        if (!document.body) return;
        const themeClass = getThemeClass(accountTheme);
        appThemeClasses().forEach(name => {
            if (name !== themeClass) document.body.classList.remove(name);
        });
        state.injectedThemeClass = null;
        if (!themeClass) return;
        if (!document.body.classList.contains(themeClass)) document.body.classList.add(themeClass);
        state.injectedThemeClass = themeClass;
    }

    function releaseAllThemeClasses() {
        if (!document.body) return;
        appThemeClasses().forEach(name => document.body.classList.remove(name));
        state.injectedThemeClass = null;
    }

    function addThemeNotice(themeSection) {
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

    function observeThemeSection(themeSection) {
        if (state.themeSectionObserver) state.themeSectionObserver.disconnect();
        const ensureNotice = () => addThemeNotice(themeSection);
        ensureNotice();
        state.themeSectionObserver = new MutationObserver(ensureNotice);
        state.themeSectionObserver.observe(themeSection, { childList: true, subtree: true });
    }

    function watchThemeSection() {
        if (!/\/my\/account(\?|#|$)/.test(location.href)) return;
        const findSection = () => document.querySelector(THEME_SECTION_SELECTOR);
        const section = findSection();
        if (section) {
            observeThemeSection(section);
            return;
        }
        if (state.sectionFinder) return;
        state.sectionFinder = new MutationObserver(() => {
            const found = findSection();
            if (found) {
                observeThemeSection(found);
                state.sectionFinder.disconnect();
                state.sectionFinder = null;
            }
        });
        state.sectionFinder.observe(document.documentElement, { childList: true, subtree: true });
    }

    function stopSectionObservers() {
        if (state.themeSectionObserver) {
            state.themeSectionObserver.disconnect();
            state.themeSectionObserver = null;
        }
        if (state.sectionFinder) {
            state.sectionFinder.disconnect();
            state.sectionFinder = null;
        }
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
                if (state.pickedTheme) announceKnownTheme(state.pickedTheme);
                resolve(state.pickedTheme);
            });
        });
    }

    function savePickedTheme(theme) {
        const value = typeof theme === 'string' ? theme : '';
        state.pickedTheme = value || null;
        announceKnownTheme(value);
        return new Promise(resolve => {
            chrome.storage.local.set({ [pickedThemeKey()]: value }, resolve);
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

        const authenticatedUserId = await getAuthenticatedUserId();
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

        if (state.pickedTheme && settingsData.accountTheme !== state.pickedTheme) {
            if (state.enabled) applyAccountTheme(state.pickedTheme);
            return;
        }

        const cached = await getCachedSettings();
        const accountThemeChanged = !cached || cached.settings.accountTheme !== settingsData.accountTheme;
        const cacheExpired = !cached || cached.expiresAt <= Date.now();
        if (!accountThemeChanged && !cacheExpired) return;

        await setCachedSettings(settingsData);
        if (state.enabled) applyAccountTheme(settingsData.accountTheme);
    }

    async function loadCachedAccountTheme() {
        const cached = await getCachedSettings();
        if (!cached || typeof cached.settings.accountTheme !== 'string') return false;
        applyAccountTheme(cached.settings.accountTheme);
        return true;
    }

    async function requestAccountTheme() {
        if (state.accountThemeRequest) return state.accountThemeRequest;
        state.accountThemeRequest = (async () => {
            const settingsData = await proxiedFetch(`${USER_SETTINGS_ENDPOINT}?_PurpuraRequest=${Date.now()}`);
            if (settingsData) {
                await handleUserSettingsResponse(settingsData);
                return;
            }

            try {
                const response = await fetchUserSettings();
                if (response.ok) await handleUserSettingsResponse(await response.json());
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
            return;
        }
        if (!(await loadCachedAccountTheme())) await requestAccountTheme();
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
            stopSectionObservers();
            return;
        }

        if (state.enabled) {
            loadAccountTheme().catch(() => {});
            watchThemeSection();
        } else {
            removeInjectedThemeClass();
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
        savePickedTheme(theme).then(() => {
            if (theme) applyAccountTheme(theme);
            else releaseAllThemeClasses();
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
