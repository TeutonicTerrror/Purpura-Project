/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
if (!window.bloatwareRemoverInitialized) {
    window.bloatwareRemoverInitialized = true;

    let isEnabled = false;
    let observer = null;
    let styleElement = null;
    let removedElements = [];
    let applyTimeout = null;

    initializeBloatwareRemover();

    function initializeBloatwareRemover() {
        window.__PurpuraSettings.ready.then(function() {
            const config = window.__PurpuraSettings.get('bwr');
            isEnabled = config?.enabled || false;
            
            if (isEnabled) {
                applyBloatwareRemoval();
                setupObserver();
            }
        });
    }

    chrome.storage.onChanged.addListener(changes => {
        if (changes.bwr) {
            const newConfig = window.__PurpuraSettings.get('bwr');
            isEnabled = newConfig?.enabled || false;
            
            if (isEnabled) {
                applyBloatwareRemoval();
                setupObserver();
            } else {
                revertBloatwareRemoval();
                removeObserver();
            }
        }
    });

    function applyBloatwareRemoval() {
        removedElements = []; 
        
        createBloatwareCSS();
        
        hideSponsoredContent();
        
        hideNavigationElements();
        
        hideFooterLinks();
        
        hidePremiumElements();

        hideFaqPanels();

        hidePopularityBadges();

        hideRobloxPlusAdElements();
        
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
            /* Purpura Bloatware Remover Styles */
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
                if (!element.hasAttribute('data-bloatware-hidden')) {
                    element.setAttribute('data-bloatware-hidden', 'true');
                    removedElements.push({
                        type: 'Sponsored Content',
                        selector: selector,
                        element: element.tagName.toLowerCase(),
                        text: element.textContent?.trim().substring(0, 50) || 'N/A'
                    });
                }
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
            if (element && !element.hasAttribute('data-bloatware-hidden')) {
                const targetElement = element.closest('li') || element;
                targetElement.setAttribute('data-bloatware-hidden', 'true');
                removedElements.push({
                    type: 'Navigation Element',
                    selector: selector,
                    element: targetElement.tagName.toLowerCase(),
                    text: name
                });
            }
        });

        const navLinks = document.querySelectorAll('a.text-nav, button.text-nav');
        navLinks.forEach(link => {
            const text = link.textContent.trim().toLowerCase();
            const href = (link.getAttribute('href') || '').toLowerCase();
            if ((text.includes('blog') || text.includes('official store') || text.includes('gift cards') || text.includes('buy gift cards') || text.includes('premium') || href.includes('blog.roblox.com') || href.includes('/giftcards') || href.includes('/premium/membership')) 
                && !link.hasAttribute('data-bloatware-hidden')) {
                const targetElement = link.closest('li') || link;
                targetElement.setAttribute('data-bloatware-hidden', 'true');
                removedElements.push({
                    type: 'Navigation Element (Dynamic)',
                    selector: 'text-based',
                    element: targetElement.tagName.toLowerCase(),
                    text: text.substring(0, 30)
                });
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
                if (!element.hasAttribute('data-bloatware-hidden')) {
                    element.setAttribute('data-bloatware-hidden', 'true');
                    removedElements.push({
                        type: 'Footer Container',
                        selector: selector,
                        element: element.tagName.toLowerCase(),
                        text: name
                    });
                }
            });
        });

        const footerLinks = document.querySelectorAll('.footer-link a, .text-footer-nav');
        const hideTexts = ['about us', 'jobs', 'blog', 'parents', 'gift cards', 'buy gift cards', 'help', 'terms', 'accessibility', 'privacy', 'your privacy choices', 'sitemap'];
        
        footerLinks.forEach(link => {
            const text = link.textContent.trim().toLowerCase();
            const shouldHide = hideTexts.some(hideText => text.includes(hideText));
            
            if (shouldHide && !link.hasAttribute('data-bloatware-hidden')) {
                const targetElement = link.closest('li') || link;
                targetElement.setAttribute('data-bloatware-hidden', 'true');
                removedElements.push({
                    type: 'Footer Link',
                    selector: 'text-based',
                    element: targetElement.tagName.toLowerCase(),
                    text: text.substring(0, 30)
                });
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
                if (!element.hasAttribute('data-bloatware-hidden')) {
                    const targetElement = element.closest('li') || element;
                    targetElement.setAttribute('data-bloatware-hidden', 'true');
                    removedElements.push({
                        type: 'Premium Element',
                        selector: selector,
                        element: targetElement.tagName.toLowerCase(),
                        text: name
                    });
                }
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

            if ((headingText.includes('faq') || hasFaqRows) && !cardElement.hasAttribute('data-bloatware-hidden')) {
                cardElement.setAttribute('data-bloatware-hidden', 'true');
                removedElements.push({
                    type: 'FAQ Panel',
                    selector: '[data-slot="card"].brr-section',
                    element: cardElement.tagName.toLowerCase(),
                    text: (heading?.textContent || 'FAQ').trim().substring(0, 30)
                });
            }
        });
    }

    function hidePopularityBadges() {
        const badges = document.querySelectorAll('.foundation-web-badge, [class*="foundation-web-badge"]');

        badges.forEach(badge => {
            const text = (badge.textContent || '').trim().toLowerCase();
            if (text.includes('popular') && !badge.hasAttribute('data-bloatware-hidden')) {
                badge.setAttribute('data-bloatware-hidden', 'true');
                removedElements.push({
                    type: 'Popularity Badge',
                    selector: '.foundation-web-badge',
                    element: badge.tagName.toLowerCase(),
                    text: text.substring(0, 30)
                });
            }
        });
    }

    function hideRobloxPlusAdElements() {
        // Remove the Roblox Plus link from the sidebar navigation
        const plusNavLinks = document.querySelectorAll(
            '#left-navigation-container .left-nav div a[href="https://www.roblox.com/plus"], ' +
            '#left-navigation-container a[href="/plus"], ' +
            '#left-navigation-container a[href*="roblox.com/plus"]'
        );
        plusNavLinks.forEach(link => {
            const target = link.closest('li') || link;
            if (!target.hasAttribute('data-bloatware-hidden')) {
                target.setAttribute('data-bloatware-hidden', 'true');
                removedElements.push({
                    type: 'Roblox Plus Ad',
                    selector: 'sidebar-plus-link',
                    element: target.tagName.toLowerCase(),
                    text: 'Sidebar Plus Link'
                });
            }
        });

        // Replace or remove the plus subscription note in sidebar
        const plusNotes = document.querySelectorAll(
            '#left-navigation-container .left-nav div li.padding-top-xsmall a[href="/plus"]'
        );
        plusNotes.forEach(note => {
            const parent = note.closest('li') || note.parentElement;
            if (!parent.hasAttribute('data-bloatware-hidden')) {
                parent.setAttribute('data-bloatware-hidden', 'true');
                removedElements.push({
                    type: 'Roblox Plus Ad',
                    selector: 'sidebar-plus-note',
                    element: parent.tagName.toLowerCase(),
                    text: 'Sidebar Plus Note'
                });
            }
        });

        // Remove the Roblox Plus snippet in the Buy Robux page
        const plusBuyRobuxSections = document.querySelectorAll(
            'div.buy-robux-content div div div.flex a[href="/plus"]'
        );
        plusBuyRobuxSections.forEach(link => {
            const container = link.closest('[class*="card"]') || link.parentElement?.parentElement?.parentElement;
            const targetSection = container?.children?.[1] || container;
            if (targetSection && !targetSection.hasAttribute('data-bloatware-hidden')) {
                targetSection.setAttribute('data-bloatware-hidden', 'true');
                removedElements.push({
                    type: 'Roblox Plus Ad',
                    selector: 'buy-robux-plus-snippet',
                    element: targetSection.tagName.toLowerCase(),
                    text: 'Buy Robux Plus Section'
                });
            }
        });
    }

    function logBloatwareRemoval() {
    }

    function revertBloatwareRemoval() {
        if (styleElement) {
            styleElement.remove();
            styleElement = null;
        }
        
        const hiddenElements = document.querySelectorAll('[data-bloatware-hidden="true"]');
        hiddenElements.forEach(element => {
            element.removeAttribute('data-bloatware-hidden');
        });
        
        removedElements = [];
    }

    function setupObserver() {
        if (!isEnabled) return;
        
        removeObserver(); 
        
        
        observer = new MutationObserver(mutations => {
            let shouldApply = false;
            
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const hasTargetElements = node.matches?.('li, a, button, ul') || 
                                                node.querySelector?.('li, a, button, ul');
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
