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
    const COPY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>';
    const CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 13 4 4L19 7"/></svg>';
    const RETRY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v5h-5"/></svg>';

    function paint(button, icon, text) {
        button.innerHTML = icon + '<span class="purpura-share-server-label"></span>';
        button.querySelector('.purpura-share-server-label').textContent = text;
    }

    function setMood(button, mood) {
        button.classList.toggle('is-copied', mood === 'copied');
        button.classList.toggle('is-error', mood === 'error');
    }

    function scan() {
        if (!enabled || !/^\/games\/\d+(?:\/|$)/.test(location.pathname)) return;
        document.querySelectorAll('.rbx-public-game-server-item').forEach(card => {
            if (card.querySelector('.purpura-share-server')) return;
            const join = card.querySelector('.game-server-join-btn, button[data-gameinstanceid], .btn-full-width');
            if (!join) return;
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'purpura-share-server';
            button.setAttribute('aria-live', 'polite');
            paint(button, COPY_ICON, label());
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
                        setMood(button, 'copied');
                        paint(button, CHECK_ICON, t('shareServer_copied', 'Copied!'));
                    } catch (error) {
                        window.prompt(t('shareServer_manual', 'Copy this public server link:'), result.url);
                    }
                    button.title = result.fallback
                        ? t('shareServer_fallback', 'Copied a full link because short links are unavailable.')
                        : t('shareServer_expiry', 'Short links expire after 30 days. Servers can close sooner.');
                } catch (error) {
                    setMood(button, 'error');
                    paint(button, RETRY_ICON, t('shareServer_retry', 'Try Again'));
                    button.title = error.message;
                } finally {
                    if (button.isConnected) {
                        button.disabled = false;
                        setTimeout(() => {
                            if (!button.isConnected) return;
                            setMood(button, '');
                            paint(button, COPY_ICON, label());
                        }, 2500);
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
        .purpura-share-server {
            --psl-accent: var(--purpura-playButton, var(--color-action-emphasis-background, #335fff));
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            width: 100%;
            max-width: 100%;
            height: 28px;
            margin-top: 4px;
            padding: 0 12px;
            align-self: stretch;
            border: 1px solid var(--color-border-default, rgba(255, 255, 255, 0.14));
            border-radius: 6px;
            background: transparent;
            color: var(--color-content-muted, #a3a3ad);
            font: inherit;
            font-size: 12.5px;
            font-weight: 500;
            line-height: 1;
            cursor: pointer;
            transition: color 0.15s ease, border-color 0.15s ease, background-color 0.15s ease;
        }
        .purpura-share-server svg { width: 13px; height: 13px; flex: 0 0 auto; }
        .purpura-share-server-label { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
        .purpura-share-server:hover:not(:disabled) {
            color: var(--color-content-default, #f2f2f7);
            border-color: var(--psl-accent);
            background: var(--color-surface-300, rgba(255, 255, 255, 0.08));
        }
        .purpura-share-server:focus-visible { outline: 2px solid var(--psl-accent); outline-offset: 2px; }
        .purpura-share-server:disabled { opacity: 0.7; cursor: progress; }
        :is(.light-theme, .theme-light, [data-theme="light"]) .purpura-share-server {
            color: var(--color-content-muted, #5b5f66);
            border-color: var(--color-border-default, rgba(0, 0, 0, 0.14));
        }
        .purpura-share-server.is-copied { color: var(--psl-accent); border-color: var(--psl-accent); }
        .purpura-share-server.is-error { color: #ff8f8f; border-color: currentColor; }
        :is(.light-theme, .theme-light, [data-theme="light"]) .purpura-share-server.is-error { color: #b42318; }
    `;
    document.head.appendChild(style);
    configure().catch(() => {});
})();
