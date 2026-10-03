/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    const STORAGE_KEY = 'lb';

    let enabled = false;

    (function() {
        var style = document.createElement('style');
        style.textContent = ':root{--purpura-lb-accent:#22c55e;--purpura-lb-text:#e0e7ff;--purpura-lb-bg-start:rgba(34,197,94,0.10);--purpura-lb-bg-end:rgba(22,163,74,0.05);--purpura-lb-border:rgba(34,197,94,0.25)}';
        document.head.appendChild(style);
    })();

    window.__PurpuraSettings.ready.then(function() {
        enabled = window.__PurpuraSettings.get(STORAGE_KEY) === true;
        if (enabled) attemptInject();
    });

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'local') return;
        if (!changes[STORAGE_KEY]) return;
        enabled = window.__PurpuraSettings.get(STORAGE_KEY) === true;
        if (enabled) attemptInject();
    });

    function attemptInject() {
        const host = window.location.hostname;
        if (host !== 'www.roblox.com' && host !== 'roblox.com') return;

        let pollTimer = null;
        let pageObserver = null;

        function stop() {
            if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
            if (pageObserver && typeof pageObserver.disconnect === 'function') { pageObserver.disconnect(); pageObserver = null; }
        }

        function inject() {
            const wrapper = document.querySelector('.login-content-wrapper');
            if (!wrapper) return;
            if (document.getElementById('purpura-login-banner')) { stop(); return; }

            const banner = document.createElement('div');
            banner.id = 'purpura-login-banner';
            const isSignup = window.location.pathname.toLowerCase().includes('createaccount');
            banner.innerHTML = `
                <div style="display:flex;align-items:center;gap:12px;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--purpura-lb-accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <span style="flex:1;font-size:14px;font-weight:500;line-height:1.5;color:var(--purpura-lb-text);">
                        ${isSignup
                            ? 'You are on the real Roblox signup page. If you do not see this banner, you are likely on a fake website or a phishing site.'
                            : 'You are on the real Roblox login page. If you do not see this banner, you are likely on a fake website or a phishing site.'
                        }
                    </span>
                </div>
            `;
            Object.assign(banner.style, {
                background: 'linear-gradient(135deg, var(--purpura-lb-bg-start), var(--purpura-lb-bg-end))',
                border: '1px solid var(--purpura-lb-border)',
                borderRadius: '12px',
                padding: '14px 20px',
                marginBottom: '20px',
                textAlign: 'left'
            });
            wrapper.prepend(banner);
            stop();
        }

        pollTimer = setInterval(inject, 150);
        pageObserver = new MutationObserver(inject);
        pageObserver.observe(document.body, { childList: true, subtree: true });
    }
})();
