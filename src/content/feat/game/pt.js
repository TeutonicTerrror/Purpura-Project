/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
'use strict';


// Roblox's navbar markup changes without notice and the icon group no longer
// always carries the legacy `nav` class, so match the group rather than one
// exact class list. This mirrors RoValra's navbar button injection.
var ICON_GROUP_SELECTORS = [
    'ul.navbar-right.rbx-navbar-icon-group',
    '.navbar-right.rbx-navbar-icon-group',
    '#right-navigation-header .rbx-navbar-icon-group',
    '.rbx-navbar-icon-group'
];

function findIconGroup() {
    for (var i = 0; i < ICON_GROUP_SELECTORS.length; i++) {
        var group = document.querySelector(ICON_GROUP_SELECTORS[i]);
        if (group) return group;
    }
    return null;
}

var topBarRetries = 0;
var topBarObserver = null;
function injectTopBarButton() {
    if (document.getElementById('purpura-pt-topbar-btn')) {
        if (topBarObserver) { topBarObserver.disconnect(); topBarObserver = null; }
        return;
    }
    var iconGroup = findIconGroup();
    if (!iconGroup) {
        if (topBarRetries++ < 30) setTimeout(injectTopBarButton, 1000);
        return;
    }
    if (topBarObserver) { topBarObserver.disconnect(); topBarObserver = null; }
    var li = document.createElement('li');
    li.id = 'purpura-pt-topbar-btn';
    li.className = 'navbar-icon-item';
    li.title = 'Play Time Tracker';
    li.style.display = 'flex';
    li.style.alignItems = 'center';
    li.style.justifyContent = 'center';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'purpura-pt-navbar-btn btn-uiblox-common-common-notification-bell-md';
    btn.setAttribute('aria-label', 'Play Time Tracker');
    btn.style.cssText = 'display:flex;align-items:center;justify-content:center;height:32px;width:32px;padding:0;margin:0;background:none;border:none;cursor:pointer;color:inherit;line-height:0;position:relative';
    btn.innerHTML = '<span class="rbx-menu-item" style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>';
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = '/purpura-time';
    });
    li.appendChild(btn);

    var searchIcon = iconGroup.querySelector('.rbx-navbar-right-search');
    if (searchIcon) {
        iconGroup.insertBefore(li, searchIcon.nextSibling);
        return;
    }
    var qsToggle = document.getElementById('purpura-quick-status-toggle');
    if (qsToggle) {
        iconGroup.insertBefore(li, qsToggle);
    } else {
        iconGroup.insertBefore(li, iconGroup.firstChild);
    }
}

function watchForIconGroup() {
    if (topBarObserver || document.getElementById('purpura-pt-topbar-btn')) return;
    topBarObserver = new MutationObserver(function() {
        if (findIconGroup()) injectTopBarButton();
    });
    topBarObserver.observe(document.documentElement, { childList: true, subtree: true });
}

async function init() {
    if (window.purpuraPlaytimeInitialized) return;
    window.purpuraPlaytimeInitialized = true;

    if (typeof window.__PurpuraSettings === 'undefined' || !window.__PurpuraSettings) {
        setTimeout(init, 200);
        return;
    }

    await window.__PurpuraSettings.ready;
    var enabled = window.__PurpuraSettings.get('plt');
    if (!enabled) return;

    watchForIconGroup();
    injectTopBarButton();
}

function onSettingsChange(changes) {
    if (changes && changes.plt !== undefined) {
        if (changes.plt.newValue) {
            init();
        } else {
            var tbb = document.getElementById('purpura-pt-topbar-btn');
            if (tbb) tbb.remove();
            if (topBarObserver) { topBarObserver.disconnect(); topBarObserver = null; }
            topBarRetries = 0;
            window.purpuraPlaytimeInitialized = false;
        }
    }
}

if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.onChanged.addListener(function(changes, area) {
        if (area === 'sync') onSettingsChange(changes);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(init, 1000); });
} else {
    setTimeout(init, 1000);
}

})();
