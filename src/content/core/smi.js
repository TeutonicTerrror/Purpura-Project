/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
    'use strict';

    const PURPURA_MENU_ID = 'purpura-settings-menu-item';
    const PURPURA_SIDEBAR_ID = 'purpura-settings-sidebar-item';
    const PURPURA_RADIX_SETTINGS_SELECTOR = 'a[role="menuitem"][href="https://www.roblox.com/my/account"]:not([href*="?"])';

    function t(key, substitutions) { return chrome.i18n.getMessage(key, substitutions) || key; }

    function injectPurpuraSidebarItem(ul) {
        if (ul.querySelector(`#${PURPURA_SIDEBAR_ID}`)) {
            return;
        }

        const iconUrl = chrome.runtime.getURL('images/icons/default/Purpura_Default_Logo_48.png');

        const li = document.createElement('li');
        li.id = PURPURA_SIDEBAR_ID;
        li.setAttribute('role', 'tab');
        li.className = 'menu-option';

        const a = document.createElement('a');
        a.className = 'menu-option-content';
        a.href = '/my/account?purpura=info';
        a.style.cssText = 'display: flex; align-items: center; gap: 8px;';

        const img = document.createElement('img');
        img.src = iconUrl;
        img.style.cssText = 'width: 16px; height: 16px; flex-shrink: 0;';
        img.alt = '';

        const label = document.createElement('span');
        label.className = 'font-caption-header';
        label.textContent = t('sdbr_purpuraSettings');

        const subtitle = document.createElement('span');
        subtitle.className = 'rbx-tab-subtitle';

        a.appendChild(img);
        a.appendChild(label);
        a.appendChild(subtitle);
        li.appendChild(a);
        ul.appendChild(li);
    }

    function checkAndInjectSidebar() {
        const ul = document.querySelector('ul.menu-vertical[role="tablist"]');
        if (ul) {
            injectPurpuraSidebarItem(ul);
        }
    }

    function injectPurpuraMenuItem(menu) {
        if (menu.querySelector(`#${PURPURA_MENU_ID}`)) {
            return;
        }

        const iconUrl = chrome.runtime.getURL('images/icons/default/Purpura_Default_Logo_48.png');
        
        const li = document.createElement('li');
        li.id = PURPURA_MENU_ID;
        
        const a = document.createElement('a');
        a.className = 'rbx-menu-item';
        a.href = 'https://www.roblox.com/my/account?purpura=info';
        a.style.cssText = 'display: flex; align-items: center; gap: 8px;';
        
        const img = document.createElement('img');
        img.src = iconUrl;
        img.style.cssText = 'width: 18px; height: 18px;';
        img.alt = 'Purpura';
        
        a.appendChild(img);
        a.appendChild(document.createTextNode(t('sdbr_purpuraSettings')));
        
        li.appendChild(a);
        
        const settingsItem = menu.querySelector('a[href="https://www.roblox.com/my/account"]:not([href*="?"])');
        if (settingsItem && settingsItem.parentElement) {
            menu.insertBefore(li, settingsItem.parentElement);
        } else {
            menu.insertBefore(li, menu.firstChild);
        }
        
        console.log('[Purpura] Settings menu item injected');
    }

    function injectPurpuraRadixMenuItem(item) {
        const group = item.parentElement;
        if (!group || group.querySelector(`#${PURPURA_MENU_ID}`)) {
            return;
        }

        const iconUrl = chrome.runtime.getURL('images/icons/default/Purpura_Default_Logo_48.png');

        const link = item.cloneNode(true);
        link.id = PURPURA_MENU_ID;
        link.href = 'https://www.roblox.com/my/account?purpura=info';

        const title = link.querySelector('.foundation-web-menu-item-title');
        if (title) {
            title.textContent = t('sdbr_purpuraSettings');
        }

        const img = document.createElement('img');
        img.src = iconUrl;
        img.alt = 'Purpura';
        img.style.cssText = 'width: 20px; height: 20px; flex-shrink: 0;';
        link.insertBefore(img, link.firstChild);

        group.insertBefore(link, item);

        console.log('[Purpura] Radix settings menu item injected');
    }

    function checkAndInjectRadixMenu() {
        document.querySelectorAll(PURPURA_RADIX_SETTINGS_SELECTOR).forEach((item) => {
            injectPurpuraRadixMenuItem(item);
        });
    }

    function checkAndInject() {
        const menu = document.getElementById('settings-popover-menu');
        if (menu) {
            injectPurpuraMenuItem(menu);
        }
        checkAndInjectSidebar();
        checkAndInjectRadixMenu();
    }

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.id === 'settings-popover-menu') {
                        injectPurpuraMenuItem(node);
                    } else if (node.querySelector) {
                        const menu = node.querySelector('#settings-popover-menu');
                        if (menu) {
                            injectPurpuraMenuItem(menu);
                        }
                        const ul = node.querySelector('ul.menu-vertical[role="tablist"]');
                        if (ul) {
                            injectPurpuraSidebarItem(ul);
                        }
                    }
                }
            }
        }

        checkAndInject();
    });

    observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
    });
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndInject);
    } else {
        checkAndInject();
    }
    let checkCount = 0;
    const intervalId = setInterval

(() => {
        checkAndInject();
        checkCount++;
        if (checkCount >= 10) {
            clearInterval(intervalId);
        }
    }, 500);
})();
