/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';
    let enabled = false;
    let configuration = 0;
    let scheduled = false;
    const t = (key, fallback) => chrome.i18n.getMessage(key) || fallback;
    const label = () => t('shareServer_copy', 'Copy Link');

    function scan() {
        if (!enabled || !/^\/games\/\d+(?:\/|$)/.test(location.pathname)) return;
        document.querySelectorAll('.rbx-public-game-server-item').forEach(card => {
            if (card.querySelector('.purpura-share-server')) return;
            const join = card.querySelector('.game-server-join-btn, button[data-gameinstanceid], .btn-full-width');
            if (!join) return;
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'purpura-share-server';
            button.textContent = label();
            button.title = t('settings_shareServerLinks_label', 'Share Server Links');
            button.addEventListener('click', async event => {
                event.preventDefault();
                event.stopPropagation();
                if (!enabled || button.disabled) return;
                const generation = configuration;
                const placeId = Number(location.pathname.match(/^\/games\/(\d+)/)?.[1]);
                button.disabled = true;
                try {
                    const ids = window.__PurpuraServerCardIds;
                    const serverId = ids?.get(card) || await ids?.extract(card);
                    if (!serverId) throw new Error(t('shareServer_missing', 'Server ID is not available yet. Try again.'));
                    if (!enabled || generation !== configuration || !button.isConnected) return;
                    const result = await chrome.runtime.sendMessage({ type: 'PURPURA_SHARE_SERVER_LINK', placeId, serverId });
                    if (!result?.ok) throw new Error(result?.error || 'Unable to create server link.');
                    if (!enabled || generation !== configuration || !button.isConnected) return;
                    try {
                        await navigator.clipboard.writeText(result.url);
                        button.textContent = t('shareServer_copied', 'Copied!');
                    } catch (error) {
                        window.prompt(t('shareServer_manual', 'Copy this public server link:'), result.url);
                    }
                    button.title = result.fallback
                        ? t('shareServer_fallback', 'Copied a full link because short links are unavailable.')
                        : t('shareServer_expiry', 'Short links expire after 30 days. Servers can close sooner.');
                } catch (error) {
                    button.textContent = t('shareServer_retry', 'Try Again');
                    button.title = error.message;
                } finally {
                    if (button.isConnected) {
                        button.disabled = false;
                        setTimeout(() => { if (button.isConnected) button.textContent = label(); }, 2500);
                    }
                }
            });
            join.after(button);
        });
    }

    async function configure() {
        const generation = ++configuration;
        const [settings, restrictions] = await Promise.all([
            chrome.storage.sync.get('ssl'), chrome.storage.local.get('noFeatures'),
        ]);
        if (generation !== configuration) return;
        enabled = settings.ssl !== false && restrictions.noFeatures !== true;
        if (!enabled) document.querySelectorAll('.purpura-share-server').forEach(button => button.remove());
        else scan();
    }

    const observer = new MutationObserver(() => {
        if (!enabled || scheduled) return;
        scheduled = true;
        setTimeout(() => { scheduled = false; scan(); }, 100);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    chrome.storage.onChanged.addListener((changes, area) => {
        if ((area === 'sync' && changes.ssl) || (area === 'local' && changes.noFeatures)) configure().catch(() => {});
    });
    window.addEventListener('popstate', scan);
    window.addEventListener('hashchange', scan);
    const style = document.createElement('style');
    style.textContent = `
        .purpura-share-server { width: 100%; margin-top: 8px; padding: 8px 12px; border: 1px solid #777383; border-radius: 8px; background: #303238; color: #f5f5f7; font: inherit; font-weight: 600; cursor: pointer; }
        :is(.light-theme, .theme-light, [data-theme="light"]) .purpura-share-server { background: #fff; color: #202027; }
        .purpura-share-server:hover:not(:disabled) { border-color: #a78bfa; }
        .purpura-share-server:focus-visible { outline: 2px solid #a78bfa; outline-offset: 3px; }
        .purpura-share-server:disabled { opacity: .6; cursor: wait; }
    `;
    document.head.appendChild(style);
    configure().catch(() => {});
})();
