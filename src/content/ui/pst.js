/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
    'use strict';
    function t(key, substitutions) { return chrome.i18n.getMessage(key, substitutions) || key; }

    if (window.purpuraStoreInjected) return;
    window.purpuraStoreInjected = true;

    // The Purpura Store replaces Roblox's store section UI, so it must only run
    // on the official Purpura store page. Running it on every game store hid the
    // real store cards and broke game pass purchases.
    const STORE_PATH = '/games/store-section/7191592908';
    const isStorePage = () => window.location.pathname.replace(/\/+$/, '') === STORE_PATH;

    const LOGO_URL = chrome.runtime.getURL('images/icons/default/Purpura_Default_Logo_128.png');

    function injectStyles() {
        if (document.getElementById('purpura-store-styles')) return;

        const style = document.createElement('style');
        style.id = 'purpura-store-styles';
        style.textContent = `
            .game-store-section-header,
            .btr-store-header,
            ul.breadcrumb,
            .store-header,
            .container-header h3 {
                display: none !important;
            }

            .store-cards {
                display: none !important;
            }

            .content {
                border-radius: 16px;
                padding: 40px 32px 48px !important;
                position: relative;
                overflow: visible !important;
            }

            .content::before {
                content: '';
                position: absolute;
                inset: 0;
                background: radial-gradient(ellipse 80% 40% at 50% 0%, rgba(139,92,246,0.13) 0%, transparent 65%);
                pointer-events: none;
                z-index: 0;
                border-radius: inherit;
            }

            .purpura-store-banner {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                padding: 40px 20px 32px;
                position: relative;
                z-index: 1;
                animation: purpuraFadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both;
            }

            .purpura-store-logo {
                width: 140px;
                height: 140px;
                margin-bottom: 24px;
                display: block;
                filter: drop-shadow(0 0 24px rgba(168, 85, 247, 0.4));
                animation: purpuraFloat 6s ease-in-out infinite;
            }

            .purpura-store-title {
                font-family: 'Inter', sans-serif, system-ui;
                font-size: 48px;
                font-weight: 700;
                color: #f5f3ff;
                -webkit-text-fill-color: #f5f3ff;
                letter-spacing: -1px;
                margin: 0 0 12px;
                line-height: 1.15;
            }

            .purpura-store-subtitle {
                font-family: 'Inter', sans-serif, system-ui;
                font-size: 18px;
                color: #6b7280;
                max-width: 500px;
                line-height: 1.65;
                margin: 0;
            }

            .purpura-checkout-hub {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 16px;
                position: relative;
                z-index: 1;
                width: 100%;
                max-width: 550px;
                margin: 0 auto;
                animation: purpuraFadeIn 0.7s 0.1s cubic-bezier(0.2, 0.8, 0.2, 1) both;
            }

            .purpura-select-wrapper {
                position: relative;
                width: 100%;
                z-index: 2;
            }

            .purpura-donation-select {
                appearance: none;
                -webkit-appearance: none;
                width: 100%;
                background: rgba(255,255,255,0.04);
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 16px;
                padding: 20px 52px 20px 24px;
                color: #ede9fe;
                font-size: 20px;
                font-family: 'Inter', sans-serif;
                font-weight: 600;
                cursor: pointer;
                transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
                text-align: left;
                display: flex;
                align-items: center;
                box-sizing: border-box;
            }

            .purpura-donation-select:hover {
                border-color: rgba(139,92,246,0.4);
                background: rgba(139,92,246,0.07);
            }

            .purpura-donation-select:focus, .purpura-select-wrapper.is-open .purpura-donation-select {
                outline: none;
                border-color: #8b5cf6;
                box-shadow: 0 0 0 3px rgba(139,92,246,0.18);
            }

            .purpura-options-list {
                position: absolute;
                bottom: calc(100% + 8px);
                left: 0;
                width: 100%;
                background: rgba(18, 12, 28, 0.95);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(139,92,246,0.3);
                border-radius: 16px;
                box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05);
                opacity: 0;
                visibility: hidden;
                transform: translateY(10px);
                transition: opacity 0.2s, transform 0.2s, visibility 0.2s;
                z-index: 100;
                max-height: 280px;
                overflow-y: auto;
                padding: 8px;
                box-sizing: border-box;
            }

            .purpura-select-wrapper.is-open .purpura-options-list {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }

            .purpura-select-wrapper.is-open .purpura-select-arrow svg {
                transform: rotate(180deg);
            }

            .purpura-select-arrow svg {
                transition: transform 0.2s;
            }

            .purpura-option {
                padding: 14px 18px;
                color: #ede9fe;
                font-family: 'Inter', sans-serif;
                font-size: 18px;
                font-weight: 500;
                border-radius: 10px;
                cursor: pointer;
                transition: background 0.15s, color 0.15s;
                text-align: left;
            }

            .purpura-option:hover {
                background: rgba(139,92,246,0.2);
                color: #fff;
            }

            .purpura-option.selected {
                background: rgba(139,92,246,0.35);
                color: #fff;
                font-weight: 600;
            }

            .purpura-options-list::-webkit-scrollbar {
                width: 6px;
            }
            .purpura-options-list::-webkit-scrollbar-track {
                background: transparent;
            }
            .purpura-options-list::-webkit-scrollbar-thumb {
                background: rgba(139,92,246,0.3);
                border-radius: 10px;
            }
            .purpura-options-list::-webkit-scrollbar-thumb:hover {
                background: rgba(139,92,246,0.5);
            }

            .purpura-select-arrow {
                position: absolute;
                right: 24px;
                top: 50%;
                transform: translateY(-50%);
                pointer-events: none;
                color: #a78bfa;
                display: flex;
                align-items: center;
            }

            .purpura-checkout-btn {
                width: 100%;
                background: linear-gradient(135deg, #7c3aed, #6d28d9) !important;
                color: #fff !important;
                border: none !important;
                border-radius: 16px !important;
                padding: 18px 24px !important;
                font-size: 20px !important;
                font-family: 'Inter', sans-serif !important;
                font-weight: 700 !important;
                letter-spacing: 0.2px !important;
                cursor: pointer !important;
                box-shadow: 0 1px 0 rgba(255,255,255,0.1) inset, 0 4px 16px rgba(109,40,217,0.35) !important;
                transition: opacity 0.15s, transform 0.15s !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 12px !important;
                height: auto !important;
                line-height: normal !important;
            }

            .purpura-checkout-btn:hover {
                opacity: 0.88 !important;
                transform: scale(1.015) !important;
            }

            .purpura-checkout-btn:active {
                transform: scale(0.98) !important;
            }

            .purpura-checkout-btn.is-owned {
                opacity: 0.4 !important;
                cursor: not-allowed !important;
            }

            @keyframes purpuraFadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            @keyframes purpuraFloat {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-6px); }
            }
        `;
        document.head.appendChild(style);
    }

    function injectBanner(container) {
        if (document.getElementById('purpura-store-banner-container')) return;

        const banner = document.createElement('div');
        banner.id = 'purpura-store-banner-container';
        banner.className = 'purpura-store-banner';

        const logo = document.createElement('img');
        logo.src = LOGO_URL;
        logo.className = 'purpura-store-logo';
        logo.alt = 'Purpura';

        const title = document.createElement('h1');
        title.className = 'purpura-store-title';
        title.textContent = t('store_supportTitle');

        const subtitle = document.createElement('p');
        subtitle.className = 'purpura-store-subtitle';
        subtitle.textContent = t('store_supportDesc');

        banner.appendChild(logo);
        banner.appendChild(title);
        banner.appendChild(subtitle);

        container.parentElement.insertBefore(banner, container);
    }

    function getPassId(item) {
        const a = item.querySelector('a.gear-passes-asset');
        if (!a) return null;
        const m = a.getAttribute('href').match(/\/game-pass\/(\d+)\//);
        return m ? parseInt(m[1], 10) : null;
    }

    function buildHub(container) {
        const items = container.querySelectorAll(
            '.list-item.real-game-pass:not(.rbx-gear-passes-item-add)'
        );
        if (!items.length) return false;

        const passData = [];
        items.forEach(item => {
            const priceEl = item.querySelector('.text-robux');
            const nameEl = item.querySelector('.store-card-name');
            const passId = getPassId(item);
            const isOwned = !!item.querySelector('.store-card-footer h5');

            if (priceEl && passId) {
                const rawText = priceEl.textContent.trim();
                const price = parseInt(rawText.replace(/,/g, ''), 10);
                const name = nameEl ? nameEl.getAttribute('title') || nameEl.textContent.trim() : `Donate ${rawText}`;
                if (!isNaN(price)) {
                    passData.push({ price, rawText, name, passId, isOwned });
                }
            }
        });

        if (!passData.length) return false;

        const existing = document.getElementById('purpura-checkout-hub');
        if (existing && existing.dataset.passCount === passData.length.toString()) return true;
        if (existing) existing.remove();

        passData.sort((a, b) => a.price - b.price);

        const hub = document.createElement('div');
        hub.id = 'purpura-checkout-hub';
        hub.className = 'purpura-checkout-hub';
        hub.dataset.passCount = passData.length.toString();

        const selectWrapper = document.createElement('div');
        selectWrapper.className = 'purpura-select-wrapper';

        const selectTrigger = document.createElement('div');
        selectTrigger.className = 'purpura-donation-select';
        selectTrigger.tabIndex = 0;

        const optionsList = document.createElement('div');
        optionsList.className = 'purpura-options-list';

        let activeOptionIndex = 0;

        passData.forEach((pass, i) => {
            const option = document.createElement('div');
            option.className = 'purpura-option';
            if (i === 0) option.classList.add('selected');
            option.textContent = t('store_donateAmount', [pass.rawText]);
            
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                activeOptionIndex = i;
                updateSelection();
                closeDropdown();
            });
            optionsList.appendChild(option);
        });

        const arrow = document.createElement('div');
        arrow.className = 'purpura-select-arrow';
        arrow.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`;

        selectTrigger.appendChild(document.createTextNode(''));
        selectTrigger.appendChild(arrow);

        selectWrapper.appendChild(selectTrigger);
        selectWrapper.appendChild(optionsList);

        const btn = document.createElement('button');
        btn.className = 'purpura-checkout-btn';

        function syncBtn() {
            const pass = passData[activeOptionIndex];
            if (!pass) return;

            if (pass.isOwned) {
                btn.textContent = t('store_alreadyDonated');
            } else {
                btn.textContent = t('store_donateAmount', [pass.rawText]);
            }
            btn.classList.toggle('is-owned', pass.isOwned);
        }

        function updateSelection() {
            const pass = passData[activeOptionIndex];
            if (!pass) return;
            
            selectTrigger.childNodes[0].nodeValue = t('store_donateAmount', [pass.rawText]);
            
            Array.from(optionsList.children).forEach((opt, idx) => {
                opt.classList.toggle('selected', idx === activeOptionIndex);
            });
            syncBtn();
        }

        function toggleDropdown() {
            selectWrapper.classList.toggle('is-open');
        }

        function closeDropdown() {
            selectWrapper.classList.remove('is-open');
        }

        selectTrigger.addEventListener('click', toggleDropdown);

        document.addEventListener('click', (e) => {
            if (!selectWrapper.contains(e.target)) closeDropdown();
        });

        updateSelection();

        btn.addEventListener('click', () => {
            const pass = passData[activeOptionIndex];
            if (!pass || pass.isOwned) return;

            if (window.RobloxItemPurchase && window.RobloxItemPurchase.startGamepassPurchaseFlow) {
                window.RobloxItemPurchase.startGamepassPurchaseFlow({
                    productId: pass.passId,
                    assetName: pass.name,
                    sellerName: '',
                    expectedSellerId: 0,
                    expectedPrice: pass.price,
                    imageUrl: '',
                    iconAssetId: pass.passId,
                    discountInformation: null
                });
            } else {
                const pbtn = container.querySelector(
                    `.list-item.real-game-pass a[href*="/game-pass/${pass.passId}/"] ~ .store-card-caption .PurchaseButton, ` +
                    `.list-item.real-game-pass:has(a[href*="/game-pass/${pass.passId}/"]) .PurchaseButton`
                );
                if (pbtn) pbtn.click();
            }
        });

        hub.appendChild(selectWrapper);
        hub.appendChild(btn);

        container.parentElement.insertBefore(hub, container);
        return true;
    }

    function run() {
        const container = document.querySelector('#rbx-passes-container') ||
            document.querySelector('.store-cards') ||
            document.querySelector('.game-store-section-content');
        if (!container) return false;

        injectBanner(container);
        return buildHub(container);
    }

    function init() {
        injectStyles();

        let hasBuilt = run();

        let debounce;
        const observer = new MutationObserver(() => {
            if (!hasBuilt) {
                hasBuilt = run();
                if (hasBuilt) return;
            }

            clearTimeout(debounce);
            debounce = setTimeout(() => {
                hasBuilt = run() || hasBuilt;
            }, 100);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Roblox navigates to the store section client side, so also boot whenever
    // the route changes into the Purpura store instead of only once on load.
    let started = false;

    function boot() {
        if (started || !isStorePage()) return;
        started = true;
        init();
    }

    function watchRoute() {
        let lastHref = window.location.href;
        const onRouteChange = () => {
            if (window.location.href === lastHref) return;
            lastHref = window.location.href;
            boot();
        };

        for (const method of ['pushState', 'replaceState']) {
            const original = history[method].bind(history);
            history[method] = function (...args) {
                const result = original(...args);
                setTimeout(onRouteChange, 0);
                return result;
            };
        }

        window.addEventListener('popstate', () => setTimeout(onRouteChange, 0));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { boot(); watchRoute(); });
    } else {
        boot();
        watchRoute();
    }
})();