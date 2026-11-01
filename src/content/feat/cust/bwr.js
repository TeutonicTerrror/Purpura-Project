/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
if (!window.bloatwareRemoverInitialized) {
    window.bloatwareRemoverInitialized = true;

    const STORAGE_KEY = 'bwr';
    const HIDDEN_ATTR = 'data-bloatware-hidden';

    const CATEGORIES = [
        { key: 'sponsored', apply: hideSponsoredContent },
        { key: 'navigation', apply: hideNavigationElements },
        { key: 'footer', apply: hideFooterLinks },
        { key: 'premium', apply: hidePremiumElements },
        { key: 'faq', apply: hideFaqPanels },
        { key: 'badges', apply: hidePopularityBadges },
        { key: 'plusAds', apply: hideRobloxPlusAdElements },
        { key: 'plusAssets', apply: hideRobloxPlusAssetElements },
        { key: 'phoneUpsell', apply: hidePhoneNumberUpsellCards }
    ];

    let config = null;
    let isEnabled = false;
    let observer = null;
    let styleElement = null;
    let removedElements = [];
    let applyTimeout = null;

    initializeBloatwareRemover();

    function initializeBloatwareRemover() {
        window.__PurpuraSettings.ready.then(function() {
            readConfig();
            if (isEnabled) {
                applyBloatwareRemoval();
                setupObserver();
            }
        });
    }

    function readConfig() {
        config = window.__PurpuraSettings.get(STORAGE_KEY) || null;
        isEnabled = config === true || !!config?.enabled;
    }

    function isCategoryEnabled(key) {
        if (!config || typeof config !== 'object') return true;
        const value = config[key];
        return value === undefined ? true : value === true;
    }

    function markHidden(element, type, selector, text) {
        if (!element || element.hasAttribute(HIDDEN_ATTR)) return;
        element.setAttribute(HIDDEN_ATTR, 'true');
        removedElements.push({
            type: type,
            selector: selector,
            element: element.tagName.toLowerCase(),
            text: text || 'N/A'
        });
    }

    function clearHiddenMarkers() {
        document.querySelectorAll(`[${HIDDEN_ATTR}="true"]`).forEach(element => {
            element.removeAttribute(HIDDEN_ATTR);
        });
        removedElements = [];
    }

    chrome.storage.onChanged.addListener(changes => {
        if (!changes[STORAGE_KEY]) return;
        readConfig();

        if (isEnabled) {
            applyBloatwareRemoval();
            setupObserver();
        } else {
            revertBloatwareRemoval();
            removeObserver();
        }
    });

    function applyBloatwareRemoval() {
        readConfig();

        if (!isEnabled) {
            revertBloatwareRemoval();
            return;
        }

        clearHiddenMarkers();

        createBloatwareCSS();

        CATEGORIES.forEach(category => {
            if (isCategoryEnabled(category.key)) category.apply();
        });

        logBloatwareRemoval();
    }

    function createBloatwareCSS() {
        if (styleElement && styleElement.isConnected) {
            return;
        }

        if (styleElement) {
            styleElement.remove();
        }

        styleElement = document.createElement('style');
        styleElement.id = 'purpura-bloatware-remover';
        styleElement.textContent = `
            [data-bloatware-hidden="true"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                width: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                overflow: hidden !important;
            }
        `;
        document.head.appendChild(styleElement);
    }

    function hideSponsoredContent() {
        const sponsoredSelectors = [
            '[data-testid*="sponsored"]',
            '.sponsored',
            '[class*="sponsored"]',
            '[id*="sponsored"]',
            '.ad-container',
            '.advertisement',
            '[class*="promo"]',
            '[data-ad-slot]',
            '.app-bumper'
        ];

        sponsoredSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                markHidden(element, 'Sponsored Content', selector, element.textContent?.trim().substring(0, 50));
            });
        });
    }

    function hideNavigationElements() {
        const navElements = [
            { selector: '#nav-blog', name: 'Blog Link' },
            { selector: '#nav-shop', name: 'Official Store Button' },
            { selector: '#nav-giftcards', name: 'Gift Cards Link' },
            { selector: '#upgrade-now-button', name: 'Get Premium Button' },
            { selector: 'li.rbx-upgrade-now', name: 'Premium Upgrade Nav Item' }
        ];

        navElements.forEach(({ selector, name }) => {
            const element = document.querySelector(selector);
            if (element && !element.hasAttribute(HIDDEN_ATTR)) {
                markHidden(element.closest('li') || element, 'Navigation Element', selector, name);
            }
        });

        const navLinks = document.querySelectorAll('a.text-nav, button.text-nav');
        navLinks.forEach(link => {
            const text = link.textContent.trim().toLowerCase();
            const href = (link.getAttribute('href') || '').toLowerCase();
            if ((text.includes('blog') || text.includes('official store') || text.includes('gift cards') || text.includes('buy gift cards') || text.includes('premium') || href.includes('blog.roblox.com') || href.includes('/giftcards') || href.includes('/premium/membership'))
                && !link.hasAttribute(HIDDEN_ATTR)) {
                markHidden(link.closest('li') || link, 'Navigation Element (Dynamic)', 'text-based', text.substring(0, 30));
            }
        });
    }

    function hideFooterLinks() {
        const footerSelectors = [
            { selector: 'ul.footer-links', name: 'Footer Links Container' },
            { selector: '.footer-links', name: 'Footer Links' },
            { selector: 'ul.row.footer-links', name: 'Footer Links Row' },
            { selector: 'ul.row.footer-links.flex.flex-wrap', name: 'Footer Links Flexible Row' }
        ];

        footerSelectors.forEach(({ selector, name }) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                markHidden(element, 'Footer Container', selector, name);
            });
        });

        const footerLinks = document.querySelectorAll('.footer-link a, .text-footer-nav');
        const hideTexts = ['about us', 'jobs', 'blog', 'parents', 'gift cards', 'buy gift cards', 'help', 'terms', 'accessibility', 'privacy', 'your privacy choices', 'sitemap'];

        footerLinks.forEach(link => {
            const text = link.textContent.trim().toLowerCase();
            const shouldHide = hideTexts.some(hideText => text.includes(hideText));

            if (shouldHide && !link.hasAttribute(HIDDEN_ATTR)) {
                markHidden(link.closest('li') || link, 'Footer Link', 'text-based', text.substring(0, 30));
            }
        });
    }

    function hidePremiumElements() {
        const premiumSelectors = [
            { selector: '.rbx-upgrade-now', name: 'Premium Upgrade Container' },
            { selector: '#upgrade-now-button', name: 'Upgrade Now Button' },
            { selector: 'a[href*="premium/membership"]', name: 'Premium Membership Link' },
            { selector: '.btn-growth-md.btn-secondary-md', name: 'Premium Button' },
            { selector: 'li.rbx-upgrade-now', name: 'Premium Left Nav Item' },
            { selector: 'a[href*="ctx=leftnav"]', name: 'Premium Left Nav Link' }
        ];

        premiumSelectors.forEach(({ selector, name }) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element.hasAttribute(HIDDEN_ATTR)) return;
                markHidden(element.closest('li') || element, 'Premium Element', selector, name);
            });
        });
    }

    function hideFaqPanels() {
        const faqCards = document.querySelectorAll('[data-slot="card"].brr-section, [data-slot="card"] .brr-section');

        faqCards.forEach(card => {
            const cardElement = card.closest('[data-slot="card"]') || card;
            const heading = cardElement.querySelector('.text-heading-small, [class*="text-heading"]');
            const headingText = (heading?.textContent || '').trim().toLowerCase();
            const hasFaqRows = !!cardElement.querySelector('[aria-controls^="faq-panel-"]');

            if ((headingText.includes('faq') || hasFaqRows) && !cardElement.hasAttribute(HIDDEN_ATTR)) {
                markHidden(cardElement, 'FAQ Panel', '[data-slot="card"].brr-section', (heading?.textContent || 'FAQ').trim().substring(0, 30));
            }
        });
    }

    function hidePopularityBadges() {
        const badges = document.querySelectorAll('.foundation-web-badge, [class*="foundation-web-badge"]');

        badges.forEach(badge => {
            const text = (badge.textContent || '').trim().toLowerCase();
            if (text.includes('popular') && !badge.hasAttribute(HIDDEN_ATTR)) {
                markHidden(badge, 'Popularity Badge', '.foundation-web-badge', text.substring(0, 30));
            }
        });
    }

    function hideRobloxPlusAdElements() {
        const plusNavLinks = document.querySelectorAll(
            '#left-navigation-container .left-nav div a[href="https://www.roblox.com/plus"], ' +
            '#left-navigation-container a[href="/plus"], ' +
            '#left-navigation-container a[href*="roblox.com/plus"], ' +
            '#left-navigation-container .left-nav li:not(.padding-top-xsmall) a[href$="/plus"]'
        );
        plusNavLinks.forEach(link => {
            markHidden(link.closest('li') || link, 'Roblox Plus Advertising', 'sidebar-plus-link', 'Sidebar Plus Link');
        });

        const PLUS_COPY = /join plus|roblox plus|get \d+ robux/i;
        const plusSidebarEntries = document.querySelectorAll(
            '#left-navigation-container [class*="icon-regular-roblox-plus"], ' +
            '#left-navigation-container button'
        );
        plusSidebarEntries.forEach(entry => {
            const hasPlusIcon = entry.matches('[class*="icon-regular-roblox-plus"]');
            const text = (entry.textContent || '').trim();
            if (!hasPlusIcon && !PLUS_COPY.test(text)) return;
            markHidden(
                entry.closest('li') || entry,
                'Roblox Plus Advertising',
                hasPlusIcon ? 'sidebar-plus-icon' : 'sidebar-plus-copy',
                text.substring(0, 40) || 'Sidebar Plus Entry'
            );
        });

        const plusNotes = document.querySelectorAll(
            '#left-navigation-container .left-nav div li.padding-top-xsmall a[href="/plus"], ' +
            '#left-navigation-container li.padding-top-xsmall a[href="/plus"]'
        );
        plusNotes.forEach(note => {
            markHidden(note.closest('li') || note.parentElement, 'Roblox Plus Advertising', 'sidebar-plus-note', 'Sidebar Plus Note');
        });

        document.querySelectorAll('div.buy-robux-content div div div.flex a[href="/plus"]').forEach(link => {
            const container = link.closest('[class*="card"]') || link.parentElement?.parentElement?.parentElement;
            const targetSection = container?.children?.[1] || container;
            markHidden(targetSection, 'Roblox Plus Advertising', 'buy-robux-plus-snippet', 'Buy Robux Plus Section');
        });

        document.querySelectorAll('.subscribe-upsell-container.subscribe-upsell-banner').forEach(banner => {
            markHidden(banner, 'Roblox Plus Advertising', 'subscribe-upsell-banner', 'Subscribe Upsell Banner');
        });
    }

    function hideRobloxPlusAssetElements() {
        document.querySelectorAll('#game-instances .padding-bottom-large .icon-regular-roblox-plus').forEach(icon => {
            markHidden(icon.closest('.padding-bottom-large') || icon, 'Roblox Plus Asset', 'private-server-plus-block', 'Private Server Plus Block');
        });

        document.querySelectorAll('[class*="icon-regular-roblox-plus"]').forEach(icon => {
            if (icon.closest('#left-navigation-container')) return;
            if (icon.hasAttribute(HIDDEN_ATTR) || icon.closest(`[${HIDDEN_ATTR}="true"]`)) return;
            markHidden(icon, 'Roblox Plus Asset', 'plus-icon-asset', 'Roblox Plus Icon');
        });
    }

    function hidePhoneNumberUpsellCards() {
        document.querySelectorAll('#home-page-upsell-card-container, [id*="home-page-upsell-card"], [class*="home-page-upsell-card"]').forEach(card => {
            markHidden(card, 'Phone Upsell Card', '#home-page-upsell-card-container', 'Home Page Upsell Cards');
        });

        const PHONE_UPSELL_COPY = /add (?:a )?phone number|verify (?:your )?phone|phone number verification|confirm your phone/i;
        const homeRoot = document.querySelector('#HomeContainer') || document.querySelector('main.container-main');
        if (!homeRoot) return;

        const cardSelectors = [
            '[class*="phone-number-upsell"]',
            '[class*="phone-verification"]',
            '[data-testid*="phone-upsell" i]'
        ];

        cardSelectors.forEach(selector => {
            homeRoot.querySelectorAll(selector).forEach(card => {
                markHidden(card, 'Phone Upsell Card', selector, (card.textContent || '').trim().substring(0, 50));
            });
        });

        const sectionSelectors = [
            '.game-sort-carousel-wrapper',
            '.home-sort-container',
            '[data-testid="home-page-carousel-container"]',
            '[data-testid*="game-grid" i]'
        ];

        sectionSelectors.forEach(selector => {
            homeRoot.querySelectorAll(selector).forEach(section => {
                const heading = section.querySelector('h2, [data-testid="text-icon-row-text"], [data-testid="section-header-title-subtitle-container"]');
                const text = (heading?.textContent || '').trim();
                if (text && PHONE_UPSELL_COPY.test(text) && !section.hasAttribute(HIDDEN_ATTR)) {
                    markHidden(section, 'Phone Upsell Card', selector, text.substring(0, 50));
                }
            });
        });
    }

    function logBloatwareRemoval() {
    }

    function revertBloatwareRemoval() {
        if (styleElement) {
            styleElement.remove();
            styleElement = null;
        }

        clearHiddenMarkers();
    }

    function setupObserver() {
        if (!isEnabled) return;

        removeObserver();

        observer = new MutationObserver(mutations => {
            let shouldApply = false;

            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const hasTargetElements = node.matches?.('li, a, button, ul, [class*="roblox-plus"]') ||
                                                node.querySelector?.('li, a, button, ul, [class*="roblox-plus"]');
                        if (hasTargetElements) {
                            shouldApply = true;
                        }
                    }
                });
            });

            if (shouldApply) {
                if (applyTimeout) {
                    clearTimeout(applyTimeout);
                }

                applyTimeout = setTimeout(() => {
                    applyTimeout = null;
                    if (isEnabled) {
                        applyBloatwareRemoval();
                    }
                }, 120);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function removeObserver() {
        if (applyTimeout) {
            clearTimeout(applyTimeout);
            applyTimeout = null;
        }

        if (observer) {
            observer.disconnect();
            observer = null;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (isEnabled) {
                setTimeout(applyBloatwareRemoval, 500);
            }
        });
    } else {
        if (isEnabled) {
            setTimeout(applyBloatwareRemoval, 500);
        }
    }
}
