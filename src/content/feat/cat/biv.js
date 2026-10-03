/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
if (!window.purpuraBundleItemViewerInitialized) {
    window.purpuraBundleItemViewerInitialized = true;

    let currentItemId = null;
    let currentBundles = null;
    let fetchInFlight = false;
    let themeObserver = null;
    let urlPollInterval = null;
    let containerPollInterval = null;
    let lastUrl = location.href;
    let enabled = false;
    let currentTheme = 'dark';

    const BAG_ICON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M20 6h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg>';

    function getTheme() {
        const root = document.documentElement;
        if (root.classList.contains('dark-theme') || root.getAttribute('data-theme') === 'dark') return 'dark';
        if (root.classList.contains('light-theme') || root.getAttribute('data-theme') === 'light') return 'light';
        if (document.body) {
            if (document.body.classList.contains('dark-theme') || document.body.classList.contains('theme-dark')) return 'dark';
            if (document.body.classList.contains('light-theme') || document.body.classList.contains('theme-light')) return 'light';
        }
        return 'dark';
    }

    function getColors() {
        const dark = currentTheme === 'dark';
        return {
            bg: dark ? 'linear-gradient(135deg, rgba(139,92,246,0.10), rgba(99,50,200,0.06))' : 'linear-gradient(135deg, rgba(51,95,255,0.06), rgba(30,70,220,0.03))',
            border: dark ? 'rgba(139,92,246,0.2)' : 'rgba(51,95,255,0.15)',
            text: dark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)',
            accent: dark ? '#8b5cf6' : '#335fff',
            accentBg: dark ? '#8b5cf6' : '#335fff',
            btnText: '#fff'
        };
    }

    function applyBannerColors() {
        const banner = document.querySelector('.purpura-bundle-banner');
        if (!banner) return;
        const c = getColors();
        const inner = banner.firstElementChild;
        if (!inner) return;
        inner.style.background = c.bg;
        inner.style.borderColor = c.border;
        const textEl = inner.querySelector('.pbb-text');
        if (textEl) textEl.style.color = c.text;
        const nameLink = inner.querySelector('a[href*="bundles/"]');
        if (nameLink) nameLink.style.color = c.accent;
        const viewBtn = inner.querySelector('.pbb-view-btn');
        if (viewBtn) viewBtn.style.background = c.accentBg;
        const svgEl = inner.querySelector('svg');
        if (svgEl) svgEl.style.stroke = c.accent;
    }

    function startThemeObserver() {
        if (themeObserver) themeObserver.disconnect();
        themeObserver = new MutationObserver(() => {
            const newTheme = getTheme();
            if (newTheme !== currentTheme) {
                currentTheme = newTheme;
                applyBannerColors();
            }
        });
        const opts = { attributes: true, attributeFilter: ['class'] };
        themeObserver.observe(document.documentElement, opts);
        if (document.body) themeObserver.observe(document.body, opts);
    }

    function isCatalogPage() {
        return window.location.pathname.includes('/catalog/');
    }

    function getItemId() {
        const match = window.location.pathname.match(/\/catalog\/(\d+)/);
        return match ? match[1] : null;
    }

    function cleanup() {
        if (containerPollInterval) {
            clearInterval(containerPollInterval);
            containerPollInterval = null;
        }
        if (themeObserver) {
            themeObserver.disconnect();
            themeObserver = null;
        }
        document.querySelectorAll('.purpura-bundle-banner').forEach(el => el.remove());
        currentItemId = null;
        currentBundles = null;
        fetchInFlight = false;
    }

    function showBundleInfo(bundles, itemId) {
        if (currentItemId !== itemId) return;
        if (!bundles || !bundles.length) return;

        // Remove any existing banner
        document.querySelectorAll('.purpura-bundle-banner').forEach(el => el.remove());

        const target = document.querySelector('.item-details-container, .catalog-page-content, .container-main');
        if (!target) return;

        const c = getColors();
        const banner = document.createElement('div');
        banner.className = 'purpura-bundle-banner';
        banner.setAttribute('data-biv-item', itemId);
        banner.style.cssText = 'text-align:center;margin:4px 0 12px;';

        if (bundles.length > 1) {
            banner.innerHTML = `
                <div style="display:inline-flex;align-items:center;gap:8px;padding:8px 14px;background:${c.bg};border:1px solid ${c.border};border-radius:8px;">
                    ${BAG_ICON}
                    <span class="pbb-text" style="font-size:13px;color:${c.text};">This item is part of <strong>${bundles.length} bundles</strong>.</span>
                </div>
            `;
        } else {
            const bundle = bundles[0];
            const bundleUrl = `https://www.roblox.com/bundles/${bundle.id}/${encodeURIComponent(bundle.name || 'View Bundle')}`;

            banner.innerHTML = `
                <div style="display:inline-flex;align-items:center;gap:8px;padding:8px 14px;background:${c.bg};border:1px solid ${c.border};border-radius:8px;">
                    ${BAG_ICON}
                    <span class="pbb-text" style="font-size:13px;color:${c.text};">
                        Part of bundle
                        <a href="${bundleUrl}" target="_blank" style="color:${c.accent};font-weight:600;text-decoration:none;">${bundle.name || 'View Bundle'}</a>
                    </span>
                    <a href="${bundleUrl}" target="_blank" class="pbb-view-btn" style="flex-shrink:0;padding:4px 10px;background:${c.accentBg};color:${c.btnText};border-radius:6px;font-size:11px;font-weight:600;text-decoration:none;">View</a>
                </div>
            `;
        }

        const firstChild = target.firstChild;
        if (firstChild) {
            target.insertBefore(banner, firstChild);
        } else {
            target.appendChild(banner);
        }

        if (bundles.length === 1) {
            fetchBundleThumbnail(bundles[0].id, itemId);
        }
    }

    async function fetchBundleThumbnail(bundleId, itemId) {
        try {
            const response = await fetch(
                `https://thumbnails.roblox.com/v1/bundles/thumbnails?bundleIds=${bundleId}&size=150x150&format=Png&isCircular=false`,
                { credentials: 'include' }
            );
            if (!response.ok || currentItemId !== itemId) return;
            const data = await response.json();
            if (currentItemId !== itemId) return;
            const thumb = data.data && data.data[0];
            if (thumb && thumb.imageUrl && thumb.state === 'Completed') {
                const banner = document.querySelector('.purpura-bundle-banner');
                if (banner) {
                    const svg = banner.querySelector('svg');
                    if (svg) {
                        svg.outerHTML = '<img src="' + thumb.imageUrl + '" alt="" style="width:20px;height:20px;object-fit:contain;border-radius:4px;flex-shrink:0;">';
                    }
                }
            }
        } catch (e) {}
    }

    function fetchBundles(itemId) {
        return fetch(
            'https://catalog.roblox.com/v1/assets/' + itemId + '/bundles?limit=10',
            { credentials: 'include' }
        ).then(function(response) {
            if (!response.ok) return;
            if (currentItemId !== itemId) return;
            return response.json().then(function(data) {
                if (currentItemId !== itemId) return;
                if (!data.data || data.data.length === 0) return;
                currentBundles = data.data;
            });
        }).catch(function() {});
    }

    function startContainerObserver(itemId) {
        // Clear any previous observer
        if (containerPollInterval) {
            clearInterval(containerPollInterval);
            containerPollInterval = null;
        }

        let attempts = 0;
        const maxAttempts = 30;
        containerPollInterval = setInterval(function() {
            if (currentItemId !== itemId) {
                clearInterval(containerPollInterval);
                containerPollInterval = null;
                return;
            }
            const c = document.querySelector('.item-details-container, .catalog-page-content, .container-main');
            if (c && currentBundles) {
                clearInterval(containerPollInterval);
                containerPollInterval = null;
                showBundleInfo(currentBundles, itemId);
                return;
            }
            if (++attempts >= maxAttempts) {
                clearInterval(containerPollInterval);
                containerPollInterval = null;
            }
        }, 200);
    }

    function init() {
        currentTheme = getTheme();
        startThemeObserver();

        const itemId = getItemId();
        if (!itemId || !isCatalogPage()) {
            currentItemId = null;
            currentBundles = null;
            fetchInFlight = false;
            return;
        }

        // Don't re-fetch if we already have data for this item
        if (currentItemId === itemId && currentBundles) {
            showBundleInfo(currentBundles, itemId);
            return;
        }

        // Don't start a new fetch if one is already in-flight for this item
        if (currentItemId === itemId && fetchInFlight) {
            startContainerObserver(itemId);
            return;
        }

        currentItemId = itemId;
        currentBundles = null;
        fetchInFlight = true;

        // Fetch data first, then watch for container to appear (handles React async render)
        fetchBundles(itemId).then(function() {
            if (currentItemId !== itemId) return;
            fetchInFlight = false;
            if (!currentBundles) return;
            showBundleInfo(currentBundles, itemId);
            startContainerObserver(itemId);
        });
    }

    function onUrlChange() {
        var newUrl = location.href;
        if (newUrl === lastUrl) return;
        lastUrl = newUrl;
        cleanup();
        if (enabled) init();
    }

    // Use polling to detect URL changes (more reliable than pushState hooks with React SPA)
    function startUrlPolling() {
        if (urlPollInterval) return;
        urlPollInterval = setInterval(onUrlChange, 600);
    }

    function stopUrlPolling() {
        if (urlPollInterval) {
            clearInterval(urlPollInterval);
            urlPollInterval = null;
        }
    }

    window.__PurpuraSettings.ready.then(function() {
        var v = window.__PurpuraSettings.get('biv');
        enabled = typeof v === 'object' ? (v.enabled !== false) : (v !== false);
        if (enabled) {
            init();
            startUrlPolling();
        }
    });

    chrome.storage.onChanged.addListener(function(changes, area) {
        if (area !== 'sync') return;
        var change = changes['biv'];
        if (!change) return;
        var v = window.__PurpuraSettings.get('biv');
        enabled = typeof v === 'object' ? (v.enabled !== false) : (v !== false);
        if (enabled) {
            stopUrlPolling();
            cleanup();
            init();
            startUrlPolling();
        } else {
            stopUrlPolling();
            cleanup();
        }
    });
}
