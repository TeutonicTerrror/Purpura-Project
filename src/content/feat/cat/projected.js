/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    let enabled = false;
    let path = '';
    let generation = 0;
    let configuration = 0;
    let state = 'loading';
    let nextAttempt = 0;
    let pending = false;
    const text = (key, fallback) => chrome.i18n.getMessage(key) || fallback;
    function ensureStyle() {
        if (document.getElementById('purpura-projected-style')) return;
        const style = document.createElement('style');
        style.id = 'purpura-projected-style';
        style.textContent = [
            '.purpura-projected-warning{--pw-border:var(--purpura-warning,#d97706);--pw-link:var(--purpura-linkColor,#4f8ef7);--pw-text:var(--purpura-mainText,inherit);--pw-bg:rgba(217,119,6,0.08);padding:12px;margin:12px 0;border:1px solid var(--pw-border);border-radius:8px;color:var(--pw-text);background:var(--pw-bg);}',
            'html.light-theme .purpura-projected-warning,body.light-theme .purpura-projected-warning{--pw-border:var(--purpura-warning,#b45309);--pw-link:var(--purpura-linkColor,#2563eb);--pw-bg:rgba(180,83,9,0.07);}',
            '.purpura-projected-link{color:var(--pw-link)!important;text-decoration:none;font-weight:500;cursor:pointer;}',
            '.purpura-projected-link:hover{color:var(--purpura-linkHover,var(--pw-link))!important;text-decoration:underline;}'
        ].join('');
        (document.head || document.documentElement).appendChild(style);
    }
    function clear() { document.getElementById('purpura-projected-warning')?.remove(); }
    function render() {
        if (!enabled || state !== 'projected') { clear(); return; }
        const host = document.querySelector('#item-details, .item-details, #item-details-section, [data-testid="item-details"], #item-container, #item-thumbnail-container-frontend, [data-testid="item-thumbnail-container"]');
        if (!host) return;
        const existing = document.getElementById('purpura-projected-warning');
        if (existing) return;
        clear();
        const warning = document.createElement('div');
        warning.id = 'purpura-projected-warning';
        warning.setAttribute('role', 'note');
        warning.setAttribute('data-state', state);
        ensureStyle();
        warning.className = 'purpura-projected-warning';
        warning.textContent = text('projected_warning', 'Projected item: its RAP may be inflated. Verify its value before trading') + ' ';
        const link = document.createElement('a');
        const match = /^\/catalog\/([1-9]\d*)/.exec(path);
        link.href = `https://www.rolimons.com/item/${match[1]}`;
        link.target = '_blank'; link.rel = 'noopener noreferrer';
        link.textContent = '(Source)';
        link.className = 'purpura-projected-link';
        warning.appendChild(link);
        warning.appendChild(document.createTextNode('.'));
        host.prepend(warning);
    }
    async function update() {
        if (path !== location.pathname) {
            path = location.pathname; generation++; pending = false; state = 'loading'; nextAttempt = 0;
            clear();
        }
        const match = /^\/catalog\/([1-9]\d*)(?:\/|$)/.exec(path);
        if (!enabled || !match) return;
        render();
        if (pending || Date.now() < nextAttempt) return;
        const current = generation;
        const requestedPath = path;
        pending = true;
        nextAttempt = Date.now() + 120000;
        try {
            const id = Number(match[1]);
            const result = await chrome.runtime.sendMessage({ type: 'PURPURA_ITEM_VALUES', ids: [id] });
            if (current !== generation || requestedPath !== location.pathname || !enabled) return;
            if (!result?.ok) {
                state = 'unavailable'; nextAttempt = Date.now() + 30000;
            } else {
                const row = result.items?.[id];
                state = row?.projected === true ? 'projected' : row?.projected === false ? 'clear' : 'unavailable';
            }
            render();
        } catch (error) {
            if (current === generation && requestedPath === location.pathname && enabled) {
                state = 'unavailable'; nextAttempt = Date.now() + 30000; render();
            }
        } finally { if (current === generation) pending = false; }
    }
    async function configure() {
        const current = ++configuration;
        const [sync, local] = await Promise.all([chrome.storage.sync.get('pwi'), chrome.storage.local.get('noFeatures')]);
        if (current !== configuration) return;
        enabled = sync.pwi !== false && local.noFeatures !== true;
        generation++; pending = false; nextAttempt = 0; state = 'loading';
        clear();
        await update();
    }
    chrome.storage.onChanged.addListener((changes, area) => {
        if ((area === 'sync' && changes.pwi) || (area === 'local' && changes.noFeatures)) configure().catch(() => {});
    });
    setInterval(() => update().catch(() => {}), 1000);
    configure().catch(() => {});
})();
