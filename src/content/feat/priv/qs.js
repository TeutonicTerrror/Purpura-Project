/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
    const FEATURE_KEY = 'qs';
    function t(key, substitutions) { return chrome.i18n.getMessage(key, substitutions) || key; }
    const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" class="qss-icon">
         <rect x="2" y="3" width="20" height="4" rx="2" stroke-width="1.3"/>
        <circle cx="8" cy="5" r="2.8" stroke-width="1.3"/>

        <rect x="2" y="10" width="20" height="4" rx="2" stroke-width="1.3"/>
        <circle cx="16" cy="12" r="2.8" stroke-width="1.3"/>

       <rect x="2" y="17" width="20" height="4" rx="2" stroke-width="1.3"/>
         <circle cx="6" cy="19" r="2.8" stroke-width="1.3"/>
        </svg>`;
    let enabled = false;
    let menu = null;
    let button = null;
    let open = false;
    let onlineDropdown = null;
    let joinDropdown = null;
    let serverDropdown = null;
    let inventoryDropdown = null;
    let themeDropdown = null;
    let themeIntegrationEnabled = false;
    let themeEditorEnabled = false;
    let presetThemes = null;

    function parseQsConfig(value) {
        if (typeof value === 'boolean') return { enabled: value, themeIntegration: true };
        if (value && typeof value === 'object') return {
            enabled: value.enabled !== false,
            themeIntegration: value.themeIntegration !== false
        };
        return { enabled: true, themeIntegration: true };
    }

    function readThemeEditorState() {
        try {
            themeEditorEnabled = window.__PurpuraSettings ? window.__PurpuraSettings.get('thmEnabled') === true : false;
        } catch { themeEditorEnabled = false; }
    }

    async function fetchPresetThemes() {
        if (presetThemes) return presetThemes;
        try {
            const r = await fetch(chrome.runtime.getURL('data/themes.json'));
            if (r.ok) presetThemes = await r.json();
        } catch { presetThemes = null; }
        return presetThemes;
    }

    function getCustomThemes() {
        try {
            const thm = window.__PurpuraSettings ? window.__PurpuraSettings.get('thm') : null;
            if (thm && Array.isArray(thm.customThemes)) return thm.customThemes;
        } catch {}
        return [];
    }

    function getPurpuraThemeState() {
        try {
            if (window.PurpuraThemeEngine) return window.PurpuraThemeEngine.getState();
        } catch {}
        return null;
    }

    async function buildThemeOptions() {
        const opts = [
            { value: 'Light', label: t('quickStatus_light') },
            { value: 'Dark', label: t('quickStatus_dark') },
            { value: 'SystemDefault', label: t('quickStatus_system') }
        ];
        if (!themeIntegrationEnabled || !themeEditorEnabled) return opts;
        const presets = await fetchPresetThemes();
        const customs = getCustomThemes();
        const presetKeys = presets ? Object.keys(presets).filter(function(key) {
            return key !== 'robloxLight' && key !== 'robloxDark';
        }) : [];
        if (presetKeys.length || customs.length) {
            opts.push({ value: '__purpura_divider__', label: '─── Purpura ───', disabled: true });
        }
        for (const key of presetKeys) {
            opts.push({ value: 'purpura:' + key, label: presets[key].name });
        }
        customs.forEach((ct, i) => {
            opts.push({ value: 'purpura-custom:' + i, label: ct.name || 'Custom Theme ' + (i + 1) });
        });
        return opts;
    }

    function detectCurrentThemeValue() {
        const state = getPurpuraThemeState();
        if (state && state.enabled && state.selected && state.selected !== 'none') {
            if (state.selected === 'custom') {
                const customs = getCustomThemes();
                if (customs.length && state.customColors) {
                    const target = JSON.stringify(state.customColors);
                    for (let i = 0; i < customs.length; i++) {
                        if (JSON.stringify(customs[i].colors) === target) return 'purpura-custom:' + i;
                    }
                }
                return null;
            }
            return 'purpura:' + state.selected;
        }
        return null;
    }

    function applyPurpuraTheme(value) {
        if (!window.PurpuraThemeEngine) return;
        if (value.startsWith('purpura:')) {
            window.PurpuraThemeEngine.setTheme(value.substring(8));
        } else if (value.startsWith('purpura-custom:')) {
            const idx = parseInt(value.substring(15), 10);
            const customs = getCustomThemes();
            if (idx >= 0 && idx < customs.length) {
                window.PurpuraThemeEngine.setCustomColors(customs[idx].colors);
                window.PurpuraThemeEngine.setTheme('custom');
            }
        }
    }

    function disablePurpuraTheme() {
        if (window.PurpuraThemeEngine) window.PurpuraThemeEngine.setTheme('none');
    }

    function getCSSVars() {
        const dark = document.body.classList.contains('dark-theme');
        return {
            bg: dark ? '#191a1f' : '#f0f0f3',
            surface: dark ? '#202227' : '#ffffff',
            text: dark ? '#d5d7dd' : '#1a1c20',
            textDim: dark ? '#bcbec8' : '#6b6f7a',
            textBright: dark ? '#f7f7f8' : '#0d0e12',
            border: dark ? 'rgba(208,217,251,0.12)' : 'rgba(0,0,0,0.10)',
            borderHover: dark ? 'rgba(208,217,251,0.16)' : 'rgba(0,0,0,0.18)',
            shadow: dark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.12)',
            hover: dark ? 'rgba(208,217,251,0.08)' : 'rgba(0,0,0,0.06)',
            active: dark ? 'rgba(51,95,255,0.4)' : 'rgba(51,95,255,0.15)',
            activeText: dark ? '#ebf1ff' : '#1a3ac5'
        };
    }

    function make(tag, props = {}) {
        const el = document.createElement(tag);
        Object.entries(props).forEach(([k, v]) => {
            if (k === 'style') {
                if (typeof v === 'string') el.style.cssText = v;
                else Object.assign(el.style, v);
            } else if (k === 'text') {
                el.textContent = v;
            } else if (k === 'html') {
                el.innerHTML = v;
            } else {
                el.setAttribute(k, v);
            }
        });
        return el;
    }

    function injectStyles() {
        if (document.getElementById('purpura-quick-status-menu-styles')) return;
        const style = document.createElement('style');
        style.id = 'purpura-quick-status-menu-styles';
        style.textContent = `
    #purpura-quick-status-toggle svg, #purpura-quick-status-toggle svg path {
        stroke: rgba(255,255,255,0.85);
        fill: none !important;
        stroke-width: 2;
        stroke-linecap: round;
    }
    #purpura-quick-status-toggle.active svg circle { fill: rgba(255,255,255,0.85) !important; }
    body.light-theme #purpura-quick-status-toggle svg, body.light-theme #purpura-quick-status-toggle svg path,
    body:not(.dark-theme) #purpura-quick-status-toggle svg, body:not(.dark-theme) #purpura-quick-status-toggle svg path {
        stroke: rgba(30,30,35,0.8);
        fill: none !important;
    }
    body.light-theme #purpura-quick-status-toggle.active svg circle,
    body:not(.dark-theme) #purpura-quick-status-toggle.active svg circle { fill: rgba(30,30,35,0.8) !important; }
    .purpura-quick-status-menu {
        position: fixed;
        z-index: 999999;
        width: 400px;
        min-width: 360px;
        border-radius: 14px;
        padding: 18px 16px 14px;
        box-sizing: border-box;
        box-shadow: 0 12px 40px var(--qss-shadow), 0 0 0 1px var(--qss-border);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: var(--qss-bg);
        color: var(--qss-text);
    }

    .purpura-quick-status-menu.hidden { display: none !important; }

    .purpura-quick-status-menu .qss-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 4px;
    }

    .purpura-quick-status-menu .qss-header-left {
        display: flex;
        flex-direction: column;
        gap: 3px;
    }

    .purpura-quick-status-menu .qss-title {
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 0.01em;
        color: var(--qss-textBright);
    }

    .purpura-quick-status-menu .qss-subtext {
        font-size: 11px;
        color: var(--qss-textDim);
        line-height: 1.3;
    }

    .purpura-quick-status-menu .qss-close {
        border: none;
        background: transparent;
        color: var(--qss-textDim);
        cursor: pointer;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border-radius: 8px;
        transition: background 120ms ease, color 120ms ease;
        flex-shrink: 0;
    }

    .purpura-quick-status-menu .qss-close:hover {
        background: var(--qss-hover);
        color: var(--qss-textBright);
    }

    .purpura-quick-status-menu .qss-divider {
        height: 1px;
        background: var(--qss-border);
        margin: 10px 0;
    }

    .purpura-quick-status-menu .qss-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 9px 0;
    }

    .purpura-quick-status-menu .qss-label-wrap {
        display: flex;
        flex-direction: column;
        gap: 1px;
        flex: 1;
        min-width: 0;
    }

    .purpura-quick-status-menu .qss-label {
        font-size: 12.5px;
        font-weight: 600;
        color: var(--qss-text);
    }

    .purpura-quick-status-menu .qss-label-sub {
        font-size: 10.5px;
        color: var(--qss-textDim);
        line-height: 1.2;
    }

    .purpura-quick-status-menu .qss-dropdown {
        position: relative;
        min-width: 176px;
        max-width: 100%;
        flex-shrink: 0;
    }

    .purpura-quick-status-menu .qss-dropdown-btn {
        width: 100%;
        border-radius: 8px;
        border: 1px solid var(--qss-border);
        background: var(--qss-surface);
        color: var(--qss-text);
        padding: 7px 30px 7px 10px;
        font-size: 12px;
        text-align: left;
        display: flex;
        align-items: center;
        cursor: pointer;
        outline: none;
        position: relative;
        transition: border-color 120ms ease, background 120ms ease;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .purpura-quick-status-menu .qss-dropdown-btn::after {
        content: '';
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 5px solid var(--qss-textDim);
        transition: transform 120ms ease;
    }

    .purpura-quick-status-menu .qss-dropdown-btn:hover {
        background: var(--qss-hover);
        border-color: var(--qss-borderHover);
    }

    .purpura-quick-status-menu .qss-dropdown-list {
        position: absolute;
        top: calc(100% + 5px);
        left: 0;
        right: 0;
        background: var(--qss-surface);
        border: 1px solid var(--qss-border);
        border-radius: 10px;
        box-shadow: 0 12px 32px var(--qss-shadow);
        padding: 5px;
        max-height: 240px;
        overflow-y: auto;
        z-index: 1000000;
    }

    .purpura-quick-status-menu .qss-dropdown-list.hidden { display: none; }

    .purpura-quick-status-menu .qss-dropdown-item {
        padding: 8px 10px;
        cursor: pointer;
        transition: background 100ms ease;
        color: var(--qss-text);
        font-size: 12px;
        border-radius: 6px;
    }

    .purpura-quick-status-menu .qss-dropdown-item:hover {
        background: var(--qss-hover);
    }

    .purpura-quick-status-menu .qss-dropdown-item.active {
        background: var(--qss-active);
        color: var(--qss-activeText);
        font-weight: 600;
    }
    .purpura-quick-status-menu .qss-dropdown-separator {
        padding: 6px 10px 4px;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--qss-textDim);
        cursor: default;
        user-select: none;
    }
    #purpura-quick-status-toggle:not(.active):hover circle:nth-of-type(1) { animation: qssl 2.5s ease-in-out infinite; }
    #purpura-quick-status-toggle:not(.active):hover circle:nth-of-type(2) { animation: qssr 2.8s ease-in-out infinite; }
    #purpura-quick-status-toggle:not(.active):hover circle:nth-of-type(3) { animation: qssl 3s ease-in-out infinite; }
    #purpura-quick-status-toggle.active circle:nth-of-type(1) { animation: qssL 0.4s cubic-bezier(.34,1.56,.64,1) forwards; }
    #purpura-quick-status-toggle.active circle:nth-of-type(2) { animation: qssR 0.4s cubic-bezier(.34,1.56,.64,1) forwards; }
    #purpura-quick-status-toggle.active circle:nth-of-type(3) { animation: qssL3 0.4s cubic-bezier(.34,1.56,.64,1) forwards; }
    @keyframes qssl { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-4px); } }
    @keyframes qssr { 0%,100% { transform: translateX(0); } 50% { transform: translateX(4px); } }
    @keyframes qssL { 0% { transform: translateX(0); } 100% { transform: translateX(-6px); } }
    @keyframes qssR { 0% { transform: translateX(0); } 100% { transform: translateX(6px); } }
    @keyframes qssL3 { 0% { transform: translateX(0); } 100% { transform: translateX(-4px); } }
        `;
        document.head.appendChild(style);
    }

    function applyCSSVariables() {
        if (!menu) return;
        const vars = getCSSVars();
        menu.style.setProperty('--qss-bg', vars.bg);
        menu.style.setProperty('--qss-surface', vars.surface);
        menu.style.setProperty('--qss-text', vars.text);
        menu.style.setProperty('--qss-textDim', vars.textDim);
        menu.style.setProperty('--qss-textBright', vars.textBright);
        menu.style.setProperty('--qss-border', vars.border);
        menu.style.setProperty('--qss-borderHover', vars.borderHover);
        menu.style.setProperty('--qss-shadow', vars.shadow);
        menu.style.setProperty('--qss-hover', vars.hover);
        menu.style.setProperty('--qss-active', vars.active);
        menu.style.setProperty('--qss-activeText', vars.activeText);
    }

    let csrfToken = null;
    let settingsCache = null;
    let settingsCacheTime = 0;
    const SETTINGS_CACHE_TTL = 8000;

    async function apiFetch(subdomain, endpoint, options = {}) {
        const method = (options.method || 'GET').toUpperCase();
        const url = `https://${subdomain}.roblox.com${endpoint}`;
        const headers = { ...(options.headers || {}), Accept: 'application/json' };
        if (options.body) {
            headers['Content-Type'] = 'application/json';
        }
        if (method !== 'GET' && method !== 'HEAD' && csrfToken) {
            headers['X-CSRF-TOKEN'] = csrfToken;
        }
        let resp = await fetch(url, {
            method,
            headers,
            credentials: 'include',
            body: options.body ? JSON.stringify(options.body) : undefined
        });
        if (resp.status === 403 && method !== 'GET' && method !== 'HEAD') {
            const newToken = resp.headers.get('x-csrf-token');
            if (newToken) {
                csrfToken = newToken;
                headers['X-CSRF-TOKEN'] = newToken;
                resp = await fetch(url, {
                    method,
                    headers,
                    credentials: 'include',
                    body: options.body ? JSON.stringify(options.body) : undefined
                });
            }
        }
        let data = null;
        try { data = await resp.clone().json(); } catch {}
        return { ok: resp.ok, status: resp.status, data };
    }

    async function readSettings() {
        const now = Date.now();
        if (settingsCache && now - settingsCacheTime < SETTINGS_CACHE_TTL) return settingsCache;
        const r = await apiFetch('apis', '/user-settings-api/v1/user-settings/settings-and-options');
        if (!r.ok) throw new Error(`Read settings failed: ${r.status}`);
        settingsCache = r.data;
        settingsCacheTime = now;
        return r.data;
    }

    async function fetchCurrentTheme() {
        const r = await apiFetch('accountsettings', '/v1/themes/1/0');
        if (r.ok && r.data?.themeType) return r.data.themeType;
        return 'Light';
    }

    async function writeSettings(body) {
        const r = await apiFetch('apis', '/user-settings-api/v1/user-settings', { method: 'POST', body });
        if (!r.ok) throw new Error(`Write settings failed: ${r.status}`);
        settingsCache = null;
        return true;
    }

    // Roblox's navbar markup changes without notice and the icon group no longer
    // always carries the legacy `nav` class, so match the group rather than one
    // exact class list. This mirrors RoValra's navbar button injection.
    const NAVBAR_SELECTORS = [
        'ul.navbar-right.rbx-navbar-icon-group',
        '.navbar-right.rbx-navbar-icon-group',
        '#right-navigation-header .rbx-navbar-icon-group',
        '.rbx-navbar-icon-group'
    ];

    function findNavbar() {
        for (const sel of NAVBAR_SELECTORS) {
            const found = document.querySelector(sel);
            if (found) return found;
        }
        return null;
    }

    function waitForNavbar() {
        return new Promise((resolve) => {
            const found = findNavbar();
            if (found) return resolve(found);
            const obs = new MutationObserver(() => {
                const f = findNavbar();
                if (f) { obs.disconnect(); resolve(f); }
            });
            obs.observe(document.documentElement, { childList: true, subtree: true });
        });
    }

    function createDropdown(options, initialValue, onChange) {
        const wrapper = make('div', { class: 'qss-dropdown' });
        const btn = make('button', { type: 'button', class: 'qss-dropdown-btn', 'aria-haspopup': 'listbox', 'aria-expanded': 'false' });
        const list = make('div', { class: 'qss-dropdown-list hidden', role: 'listbox' });
        let suppressOnChange = true;

        const renderOptions = (value) => {
            list.innerHTML = '';
            options.forEach((opt) => {
                if (opt.disabled) {
                    const sep = make('div', { class: 'qss-dropdown-separator', text: opt.label });
                    list.appendChild(sep);
                    return;
                }
                const item = make('div', { class: 'qss-dropdown-item', role: 'option', 'data-value': opt.value, text: opt.label });
                if (opt.value === value) item.classList.add('active');
                item.addEventListener('click', () => { setValue(opt.value); closeDropdown(); });
                list.appendChild(item);
            });
        };

        const setValue = (value, silent) => {
            const match = options.find((o) => o.value === value && !o.disabled);
            if (!match) return;
            btn.textContent = match.label;
            renderOptions(value);
            if (!suppressOnChange && !silent) onChange(value);
        };

        const setOptions = (newOptions) => { options = newOptions; };

        const openDropdown = () => {
            list.classList.remove('hidden');
            btn.setAttribute('aria-expanded', 'true');
            document.addEventListener('click', outside);
        };

        const closeDropdown = () => {
            list.classList.add('hidden');
            btn.setAttribute('aria-expanded', 'false');
            document.removeEventListener('click', outside);
        };

        const outside = (e) => { if (!wrapper.contains(e.target)) closeDropdown(); };

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            list.classList.contains('hidden') ? openDropdown() : closeDropdown();
        });

        wrapper.appendChild(btn);
        wrapper.appendChild(list);
        setValue(initialValue);
        suppressOnChange = false;
        return { element: wrapper, setValue, setOptions };
    }

    function createMenu() {
        if (menu) return menu;

        menu = make('div', { class: 'purpura-quick-status-menu hidden' });

        const header = make('div', { class: 'qss-header' });
        const title = make('div', { class: 'qss-title', text: t('quickStatus_settingsTitle') });
        const closeBtn = make('button', { class: 'qss-close', 'aria-label': 'Close' });
        closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M10 8.586l3.95-3.95a1 1 0 011.414 1.414L11.414 10l3.95 3.95a1 1 0 01-1.414 1.414L10 11.414l-3.95 3.95a1 1 0 01-1.414-1.414L8.586 10 4.636 6.05a1 1 0 011.414-1.414L10 8.586z" clip-rule="evenodd"/></svg>';
        closeBtn.addEventListener('click', closeMenu);

        const headerLeft = make('div', { class: 'qss-header-left' });
        headerLeft.appendChild(title);
        header.appendChild(headerLeft);
        header.appendChild(closeBtn);

        function row(labelText, subText, input) {
            const rowEl = make('div', { class: 'qss-row' });
            const wrap = make('div', { class: 'qss-label-wrap' });
            wrap.appendChild(make('span', { class: 'qss-label', text: labelText }));
            wrap.appendChild(make('span', { class: 'qss-label-sub', text: subText }));
            rowEl.appendChild(wrap);
            rowEl.appendChild(input);
            return rowEl;
        }

        const onlineOpts = [
            { value: 'AllUsers', label: t('quickStatus_everyone') },
            { value: 'FriendsFollowingAndFollowers', label: t('quickStatus_friendsFollowing') },
            { value: 'FriendsAndFollowing', label: t('quickStatus_friendsFollowingShort') },
            { value: 'Friends', label: t('quickStatus_friends') },
            { value: 'NoOne', label: t('quickStatus_noOne') }
        ];

        const joinOpts = [
            { value: 'All', label: t('quickStatus_allUsers') },
            { value: 'Followers', label: t('quickStatus_followers') },
            { value: 'Following', label: t('quickStatus_following') },
            { value: 'Friends', label: t('quickStatus_friends') },
            { value: 'NoOne', label: t('quickStatus_noOne') }
        ];

        const serverOpts = [
            { value: 'AllUsers', label: t('quickStatus_everyone') },
            { value: 'Friends', label: t('quickStatus_friends') },
            { value: 'NoOne', label: t('quickStatus_noOne') }
        ];

        const inventoryOpts = [
            { value: 'AllUsers', label: t('quickStatus_everyone') },
            { value: 'Friends', label: t('quickStatus_friends') },
            { value: 'NoOne', label: t('quickStatus_noOne') }
        ];

        onlineDropdown = createDropdown(onlineOpts, 'AllUsers', async (val) => {
            try { await writeSettings({ whoCanSeeMyOnlineStatus: val }); } catch {}
        });

        joinDropdown = createDropdown(joinOpts, 'All', async (val) => {
            try { await writeSettings({ whoCanJoinMeInExperiences: val }); } catch {}
        });

        serverDropdown = createDropdown(serverOpts, 'AllUsers', async (val) => {
            try { await writeSettings({ privateServerPrivacy: val }); } catch {}
        });

        inventoryDropdown = createDropdown(inventoryOpts, 'AllUsers', async (val) => {
            try { await writeSettings({ whoCanSeeMyInventory: val }); } catch {}
        });

        const baseThemeOpts = [
            { value: 'Light', label: t('quickStatus_light') },
            { value: 'Dark', label: t('quickStatus_dark') },
            { value: 'SystemDefault', label: t('quickStatus_system') }
        ];

        themeDropdown = createDropdown(baseThemeOpts, 'Light', async (val) => {
            if (val.startsWith('purpura:') || val.startsWith('purpura-custom:')) {
                applyPurpuraTheme(val);
                return;
            }
            disablePurpuraTheme();
            try {
                const r = await apiFetch('accountsettings', '/v1/themes/1/0', { method: 'PATCH', body: { themeType: val } });
                if (r.ok) {
                    document.body.classList.remove('dark-theme', 'light-theme');
                    if (val === 'Light') document.body.classList.add('light-theme');
                    else if (val === 'Dark') document.body.classList.add('dark-theme');
                    try {
                        const stored = localStorage.getItem('theme');
                        if (stored) {
                            const parsed = JSON.parse(stored);
                            const meta = document.querySelector('meta[name="user-data"]');
                            const uid = meta?.getAttribute('data-userid') || meta?.getAttribute('data-user-id');
                            if (uid && Array.isArray(parsed.data)) {
                                const entry = parsed.data.find(e => String(e[0]) === uid);
                                if (entry) {
                                    entry[1] = val === 'Light' ? 0 : val === 'Dark' ? 1 : 2;
                                    localStorage.setItem('theme', JSON.stringify(parsed));
                                }
                            }
                        }
                    } catch {}
                }
            } catch {}
        });

        menu.appendChild(header);
        const d1 = make('div', { class: 'qss-divider' });
        menu.appendChild(d1);
        menu.appendChild(row(t('quickStatus_title'), t('quickStatus_subOnline'), onlineDropdown.element));
        menu.appendChild(row(t('quickStatus_joinStatus'), t('quickStatus_subJoin'), joinDropdown.element));
        menu.appendChild(row(t('quickStatus_privateServer'), t('quickStatus_subServer'), serverDropdown.element));
        menu.appendChild(row(t('quickStatus_inventory'), t('quickStatus_subInventory'), inventoryDropdown.element));
        menu.appendChild(row(t('quickStatus_theme'), t('quickStatus_subTheme'), themeDropdown.element));

        document.body.appendChild(menu);
        applyCSSVariables();
        return menu;
    }

    function positionMenu() {
        if (!button || !menu) return;
        const rect = button.getBoundingClientRect();
        menu.style.visibility = 'hidden';
        menu.classList.remove('hidden');
        const menuRect = menu.getBoundingClientRect();
        const padding = 12;
        const top = rect.bottom + 8;
        let left = rect.left + (rect.width / 2) - (menuRect.width / 2);
        const maxLeft = window.innerWidth - menuRect.width - padding;
        if (left > maxLeft) left = Math.max(padding, maxLeft);
        if (left < padding) left = padding;
        const maxTop = window.innerHeight - menuRect.height - padding;
        const finalTop = top > maxTop ? rect.top - menuRect.height - 8 : top;
        menu.style.top = `${Math.max(padding, finalTop)}px`;
        menu.style.left = `${left}px`;
        menu.style.visibility = '';
    }

    function closeMenu() {
        if (!menu) return;
        menu.classList.add('hidden');
        if (button) { button.setAttribute('aria-expanded', 'false'); button.classList.remove('active'); }
        document.removeEventListener('click', outsideClick);
        open = false;
    }

    function outsideClick(event) {
        if (!button || !menu) return;
        if (!button.contains(event.target) && !menu.contains(event.target)) closeMenu();
    }

    async function openMenu() {
        if (!menu) createMenu();
        if (open) return closeMenu();
        applyCSSVariables();
        settingsCache = null;

        try {
            const settings = await readSettings();
            if (settings?.whoCanSeeMyOnlineStatus?.currentValue) onlineDropdown.setValue(settings.whoCanSeeMyOnlineStatus.currentValue);
            if (settings?.whoCanJoinMeInExperiences?.currentValue) joinDropdown.setValue(settings.whoCanJoinMeInExperiences.currentValue);
            if (settings?.privateServerPrivacy?.currentValue) serverDropdown.setValue(settings.privateServerPrivacy.currentValue);
            if (settings?.whoCanSeeMyInventory?.currentValue) inventoryDropdown.setValue(settings.whoCanSeeMyInventory.currentValue);
        } catch {}

        try {
            readThemeEditorState();
            const opts = await buildThemeOptions();
            themeDropdown.setOptions(opts);
            const purpuraVal = detectCurrentThemeValue();
            if (purpuraVal) {
                themeDropdown.setValue(purpuraVal, true);
            } else {
                const currentThemeVal = await fetchCurrentTheme();
                themeDropdown.setValue(currentThemeVal, true);
            }
        } catch {}

        menu.classList.remove('hidden');
        positionMenu();
        if (button) { button.setAttribute('aria-expanded', 'true'); button.classList.add('active'); }
        open = true;
        document.addEventListener('click', outsideClick);
    }

    function injectButton(navbar) {
        if (document.getElementById('purpura-quick-status-toggle')) return;

        const li = make('li', { id: 'purpura-quick-status-toggle', class: 'navbar-icon-item' });
        button = make('button', {
            type: 'button',
            class: 'btn-uiblox-common-common-notification-bell-md',
            style: 'display:flex;align-items:center;justify-content:center;height:32px;width:32px;padding:0;margin:0;position:relative;',
            'aria-expanded': 'false',
            'aria-label': 'Quick Settings',
            html: `<span class="rbx-menu-item" style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;">${ICON_SVG}</span>`
        });

        button.addEventListener('click', (evt) => {
            evt.stopPropagation();
            openMenu();
        });

        li.appendChild(button);
        const searchIcon = navbar.querySelector('.rbx-navbar-right-search');
        if (searchIcon) navbar.insertBefore(li, searchIcon.nextSibling);
        else navbar.insertBefore(li, navbar.firstChild);
    }

    async function runFeature() {
        injectStyles();
        const navbar = await waitForNavbar();
        injectButton(navbar);

        const themeObserver = new MutationObserver(() => {
            if (menu && !menu.classList.contains('hidden')) applyCSSVariables();
        });
        themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    function updateFromStorage(value) {
        const cfg = parseQsConfig(value);
        themeIntegrationEnabled = cfg.themeIntegration;
        const newEnabled = cfg.enabled;
        if (newEnabled === enabled) return;
        enabled = newEnabled;
        if (enabled) runFeature().catch(() => {});
        else {
            closeMenu();
            const el = document.getElementById('purpura-quick-status-toggle');
            if (el) el.remove();
            const existingMenu = document.querySelector('.purpura-quick-status-menu');
            if (existingMenu) existingMenu.remove();
            menu = null;
            button = null;
        }
    }

    chrome.storage.sync.get([FEATURE_KEY], (result) => {
        const val = window.__PurpuraSettings ? window.__PurpuraSettings.get(FEATURE_KEY) : result[FEATURE_KEY];
        updateFromStorage(val);
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync' && changes[FEATURE_KEY]) {
            updateFromStorage(window.__PurpuraSettings.get(FEATURE_KEY));
        }
        if (namespace === 'local' && (changes['thmEnabled'] || changes['thm'])) {
            readThemeEditorState();
        }
    });
})();