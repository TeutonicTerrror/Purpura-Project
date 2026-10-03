/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
let configLoggedThisSession = false; 
const CREATE_LINK_SELECTOR = 'a#header-develop-md-link[href^="https://create.roblox.com"]';

const selectors = {
    navGame: '.nav.rbx-navbar.hidden-xs.hidden-sm.col-md-5.col-lg-4 > li:nth-of-type(1) > .font-header-2.nav-menu-title.text-header.charts-rename-exp-treatment',
    chartsHeader: 'h1',
    chartsLink: 'a.font-header-2.nav-menu-title.text-header[href="/charts"]',
    chartsGamesLink: 'a.font-header-2.nav-menu-title.text-header[href="/charts"]',
    
    navCatalog: '.nav.rbx-navbar.hidden-xs.hidden-sm.col-md-5.col-lg-4 > li:nth-of-type(2) > .font-header-2.nav-menu-title.text-header',
    catalogLink: '.heading > [href*="/catalog"]',
    marketplaceLink: 'a.font-header-2.nav-menu-title.text-header[href="/catalog"]',
    marketplaceCatalogLink: 'a.font-header-2.nav-menu-title.text-header[href="/catalog"]',
    marketplacePricingHeader: '.container-header > h1',
    
    createLink: 'a#header-develop-sm-link.font-header-2.nav-menu-title.text-header[href="https://create.roblox.com/"]',
    createStudioLink: 'a#header-develop-md-link.font-header-2.nav-menu-title.text-header[href="https://create.roblox.com/"]',
    
    navGroups: '#nav-group > .font-header-2.dynamic-ellipsis-item',
    groupsHeader: '.container-header.see-all-container-header.ng-scope > h1.ng-binding',
    createGroup: '.dnd-groups-list-container.groups-list > .col-xs-12.col-sm-3 > .menu-vertical-container > .btn-secondary-md.btn-full-width',
    
    buttonTextContainer: 'span.web-blox-css-tss-1283320-Button-textContainer',
    profileSocialCountLabel: 'span.profile-header-social-count-label',
    dynamicEllipsisItem: 'span.font-header-2.dynamic-ellipsis-item',
    textLead: 'span.text-lead',
    friendsSearchInput: 'input.friends-filter-searchbar-input',
    chatSearchInput: 'input.input-field.chat-search-input',
    moreInfoIcon: 'span.icon-moreinfo',
    serverListHeader: 'h2.server-list-header',
    friendsInServerLabel: '.text.friends-in-server-label'
};

const originalValues = new Map();
let observer;
let currentConfig = {
    enabled: false,
    sections: {
        charts: true,
        marketplace: true,
        create: true,
        groups: true
    }
};

function safeQuerySelector(selector) {
    try {
        return document.querySelector(selector);
    } catch (e) {
        return null;
    }
}

const REPLACEMENTS_BY_SECTION = {
    marketplace: [
        {from: /\bMarketplace Item Pricing\b/g, to: 'Catalog Item Pricing'},
        {from: /\bMarketplace\b/g, to: 'Catalog'}
    ],
    charts: [
        {from: /\bCharts\b/g, to: 'Games'}
    ],
    create: [
        {from: /\bCreate\b/g, to: 'Studio'}
    ],

    groups: []
};

function getActiveReplacements() {
    const enabledSections = Object.entries(currentConfig.sections)
        .filter(([, enabled]) => enabled)
        .map(([section]) => section);

    const replacements = [];
    for (const section of enabledSections) {
        const list = REPLACEMENTS_BY_SECTION[section];
        if (Array.isArray(list)) {
            replacements.push(...list.map(item => ({ ...item, section })));
        }
    }
    return replacements;
}

function shouldSkipCreateReplacement(element) {
    if (!element || typeof element.closest !== 'function') return true;
    return !element.closest(CREATE_LINK_SELECTOR);
}

function isInsideSettingsContent(node) {
    if (!isSettingsPage() || !node || !node.parentElement) return false;
    const contentElement = document.querySelector('.content, #content, .content-inner, #content-inner');
    if (!contentElement) return false;
    return contentElement.contains(node);
}

function applyTextReplacements(root, replacements) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walker.nextNode()) {
        if (isInsideSettingsContent(node)) continue;

        const parentTag = node.parentElement && node.parentElement.tagName;
        if (parentTag === 'SCRIPT' || parentTag === 'STYLE' || parentTag === 'NOSCRIPT' || parentTag === 'TEMPLATE') continue;

        const baseText = originalValues.has(node) ? originalValues.get(node).text : node.nodeValue;
        let updated = baseText;
        for (const replacement of replacements) {
            if (replacement.section === 'create' && shouldSkipCreateReplacement(node.parentElement)) {
                continue;
            }
            updated = updated.replace(replacement.from, replacement.to);
        }
        if (updated !== node.nodeValue) {
            if (!originalValues.has(node)) {
                originalValues.set(node, {text: baseText});
            }
            node.nodeValue = updated;
        }
    }
}

function applyAttributeReplacements(replacements) {
    const elements = document.querySelectorAll('[placeholder],[title],[aria-label]');
    elements.forEach(el => {
        if (isInsideSettingsContent(el)) return;

        const data = originalValues.get(el) || {};
        let changed = false;

        const updateAttr = (attr) => {
            const value = el.getAttribute(attr);
            if (!value) return;
            const baseValue = data[attr] ?? value;
            let updated = baseValue;
            for (const replacement of replacements) {
                if (replacement.section === 'create' && shouldSkipCreateReplacement(el)) {
                    continue;
                }
                updated = updated.replace(replacement.from, replacement.to);
            }
            if (updated !== value) {
                if (!data[attr]) {
                    data[attr] = value;
                }
                el.setAttribute(attr, updated);
                changed = true;
            }
        };

        updateAttr('placeholder');
        updateAttr('title');
        updateAttr('aria-label');

        if (changed) {
            originalValues.set(el, data);
        }
    });
}

const SETTINGS_PAGE_PURPURA_PARAM = 'purpura';

function isSettingsPage() {
    return new URLSearchParams(window.location.search).has(SETTINGS_PAGE_PURPURA_PARAM);
}

function isInsideSettingsContent(node) {
    if (!isSettingsPage() || !node || !node.parentElement) return false;
    const contentElement = document.querySelector('.content, #content, .content-inner, #content-inner');
    if (!contentElement) return false;
    return contentElement.contains(node);
}

function applyChanges() {
    if (!currentConfig.enabled) return;

    revertChanges();

    const replacements = getActiveReplacements();
    if (!replacements.length) return;

    applyTextReplacements(document.body, replacements);
    applyAttributeReplacements(replacements);

    const moreInfoIcons = document.querySelectorAll(selectors.moreInfoIcon);
    moreInfoIcons.forEach(icon => {
        if (!originalValues.has(icon)) {
            originalValues.set(icon, {styleDisplay: icon.style.display || ''});
        }
        icon.style.display = 'none';
    });
}

function revertChanges() {
    for (const [node, value] of originalValues) {
        if (!node.isConnected) continue;
        if (node.nodeType === Node.TEXT_NODE) {
            node.nodeValue = value.text;
            continue;
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
            if (value.text) {
                node.textContent = value.text;
            }
            if (value.placeholder) {
                node.setAttribute('placeholder', value.placeholder);
            }
            if (value.title) {
                node.setAttribute('title', value.title);
            }
            if (value['aria-label']) {
                node.setAttribute('aria-label', value['aria-label']);
            }
            if (value.styleDisplay !== undefined && node.classList.contains('icon-moreinfo')) {
                node.style.display = value.styleDisplay;
            }
        }
    }
    originalValues.clear();
}

async function loadConfiguration() {
    try {
        const data = { unc: window.__PurpuraSettings.get('unc'), uncConfig: window.__PurpuraSettings.get('uncConfig') };
        
        if (data.unc !== undefined) {
            currentConfig.enabled = Boolean(data.unc);
        }
        
        if (data.uncConfig) {
            currentConfig = { ...currentConfig, ...data.uncConfig };
        }
        
        configLoggedThisSession = true;
    } catch (error) {
        try {
            const legacyEnabled = localStorage.getItem('unc');
            const savedConfig = localStorage.getItem('uncConfig');
            
            if (legacyEnabled !== null) {
                currentConfig.enabled = legacyEnabled === 'true';
            }
            
            if (savedConfig) {
                const parsed = JSON.parse(savedConfig);
                currentConfig = { ...currentConfig, ...parsed };
            }
        } catch (localError) {
        }
    }
}

function initObserver() {
    observer = new MutationObserver(mutations => {
        if (!mutations.some(m => m.addedNodes.length || m.removedNodes.length)) return;
        
        loadConfiguration().then(() => {
            currentConfig.enabled ? applyChanges() : revertChanges();
        }).catch(() => {

            const enabled = localStorage.getItem('unc') === 'true';
            if (enabled) {
                currentConfig.enabled = true;
                applyChanges();
            } else {
                revertChanges();
            }
        });
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
    });
}

loadConfiguration().then(() => {
    if (currentConfig.enabled) applyChanges();
    initObserver();
}).catch(error => {
    const enabled = localStorage.getItem('unc') === 'true';
    if (enabled) {
        currentConfig.enabled = true;
        applyChanges();
    }
    initObserver();
});

try {
    chrome.storage.onChanged.addListener(changes => {
        if (changes.unc || changes.uncConfig) {
            loadConfiguration().then(() => {
                currentConfig.enabled ? applyChanges() : revertChanges();
            });
        }
    });
} catch (error) {
}