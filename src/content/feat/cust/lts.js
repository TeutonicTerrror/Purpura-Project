/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    const STORAGE_KEY = 'lts';
    const ENDPOINT_THEME = '/v1/themes/1/0';

    let enabled = false;

    window.__PurpuraSettings.ready.then(function() {
        enabled = window.__PurpuraSettings.get(STORAGE_KEY) === true;
        if (enabled) initThemeSwitcher();
    });

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'local') return;
        if (!changes[STORAGE_KEY]) return;
        enabled = window.__PurpuraSettings.get(STORAGE_KEY) === true;
        if (enabled) initThemeSwitcher();
    });

    async function getCurrentTheme() {
        try {
            const resp = await fetch('https://accountsettings.roblox.com' + ENDPOINT_THEME, { credentials: 'include' });
            if (!resp.ok) return 'Light';
            const data = await resp.json();
            return data.themeType || 'Light';
        } catch {
            return 'Light';
        }
    }

    async function setTheme(themeValue) {
        try {
            const resp = await fetch('https://accountsettings.roblox.com' + ENDPOINT_THEME, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ themeType: themeValue })
            });
            if (!resp.ok) {
                alert('Failed to update theme! Try again later.');
                return;
            }
            if (themeValue === 'Light') {
                document.body.classList.remove('dark-theme');
                document.body.classList.add('light-theme');
            } else {
                document.body.classList.remove('light-theme');
                document.body.classList.add('dark-theme');
            }
            try {
                const stored = localStorage.getItem('theme');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    const userId = await getAuthenticatedUserId();
                    if (userId && Array.isArray(parsed.data)) {
                        const entry = parsed.data.find(e => e[0] === userId);
                        if (entry) {
                            entry[1] = themeValue === 'Light' ? 0 : 1;
                            localStorage.setItem('theme', JSON.stringify(parsed));
                        }
                    }
                }
            } catch {}
        } catch {}
    }

    async function getAuthenticatedUserId() {
        try {
            const meta = document.querySelector('meta[name="user-data"]');
            const candidate = meta?.getAttribute('data-userid') || meta?.getAttribute('data-user-id');
            if (candidate) return Number(candidate);
            const resp = await fetch('https://users.roblox.com/v1/users/authenticated', { credentials: 'include' });
            if (!resp.ok) return null;
            const data = await resp.json();
            return data?.id || null;
        } catch {
            return null;
        }
    }

    async function buildDropdown() {
        const current = await getCurrentTheme();

        const container = document.createElement('div');
        container.style.cssText = 'display:flex;flex-direction:column;gap:8px;padding:12px 0;';

        const label = document.createElement('label');
        label.className = 'text-title-large';
        label.textContent = 'Theme';

        const select = document.createElement('select');
        select.className = 'col-xs-12 col-sm-6';
        select.style.cssText = 'padding:8px 12px;border-radius:8px;border:1px solid var(--purpura-lts-select-border);background:var(--purpura-lts-select-bg);color:white;font-size:14px;';

        const lightOpt = document.createElement('option');
        lightOpt.value = 'Light';
        lightOpt.textContent = 'Light';
        const darkOpt = document.createElement('option');
        darkOpt.value = 'Dark';
        darkOpt.textContent = 'Dark';

        select.appendChild(lightOpt);
        select.appendChild(darkOpt);
        select.value = current;

        select.addEventListener('change', () => setTheme(select.value));

        container.appendChild(label);
        container.appendChild(select);
        return container;
    }

    function ensureStyles() {
        if (document.getElementById('purpura-lts-style')) return;
        var style = document.createElement('style');
        style.id = 'purpura-lts-style';
        style.textContent = ':root{--purpura-lts-select-border:rgba(255,255,255,0.15);--purpura-lts-select-bg:rgba(0,0,0,0.3)}';
        document.head.appendChild(style);
    }

    function initThemeSwitcher() {
        if (!window.location.pathname.startsWith('/my/account')) return;
        ensureStyles();

        const pageObserver = new MutationObserver(() => {
            const headers = document.querySelectorAll('h2.setting-section-header');
            headers.forEach(header => {
                if (header.textContent.trim() === 'Personal') {
                    const section = header.closest('.setting-section');
                    if (!section) return;
                    if (section.querySelector('.purpura-legacy-theme-switcher')) return;

                    const content = section.querySelector('.section-content') || section;
                    buildDropdown().then(el => {
                        el.classList.add('purpura-legacy-theme-switcher');
                        content.appendChild(el);
                    });
                }
            });
        });
        pageObserver.observe(document.body, { childList: true, subtree: true });
    }
})();
