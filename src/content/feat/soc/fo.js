/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
if (window.purpuraFriendOriginInitialized) return;
window.purpuraFriendOriginInitialized = true;

(function() {
    var style = document.createElement('style');
    style.textContent = ':root{--purpura-fo-label-color:rgba(255,255,255,0.5)}';
    document.head.appendChild(style);
})();

var SETTING_KEY = 'fo';
var enabled = true;

var ORIGIN_MAP = {
    0: 'Unknown',
    1: 'Search',
    2: 'In-Game',
    3: 'Profile',
    4: 'QQ Contacts',
    5: 'WeChat Contacts',
    6: 'QR Code',
    7: 'Profile Share',
    8: 'Phone Contacts',
    9: 'Friend Link',
    10: 'People You May Know'
};

var insightsMap = {};
var fetched = false;
var fetching = false;
var observer = null;
var cardsObserver = null;


function getUserIdFromUrl(el) {
    var href = (el && el.href) || '';
    var match = href.match(/\/users\/(\d+)/);
    return match ? match[1] : null;
}

function formatDate(ts) {
    return new Date(ts).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}

function getOriginText(originId) {
    return ORIGIN_MAP[originId] || null;
}

function getPageCsrfToken() {
    var meta = document.querySelector('meta[name="csrf-token"]');
    if (meta) return meta.getAttribute('content');
    if (window.Roblox && window.Roblox.XsrfToken) {
        try { var t = window.Roblox.XsrfToken.getToken(); if (t) return t; } catch(e) {}
    }
    var match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
    return '';
}

function createLabel(since, origin, friendId) {
    var label = document.createElement('div');
    label.className = 'avatar-card-label text-overflow purpura-friend-origin-label';
    label.dataset.friendId = friendId;
    label.style.cssText = 'font-size:11px;color:var(--purpura-fo-label-color);margin-top:2px;line-height:1.3;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%;';

    var parts = [];
    var originText = getOriginText(origin);
    if (originText && originText !== 'Unknown') {
        parts.push(originText);
    }
    if (since) {
        parts.push(formatDate(since));
    }

    if (!parts.length) return null;
    var text = parts.join(' \u00b7 ');
    if (!originText || originText === 'Unknown') text = 'Friends since ' + text;
    label.textContent = text;
    label.title = text;
    return label;
}

function injectLabelIntoCard(cardLink) {
    var friendId = getUserIdFromUrl(cardLink);
    if (!friendId) return;

    var data = insightsMap[friendId];
    if (!data || (!data.since && (data.origin === null || data.origin === undefined))) {
        return;
    }

    var cardCaption = cardLink.closest('.avatar-card-caption');
    if (!cardCaption) return;

    var existingLabel = cardCaption.querySelector('.purpura-friend-origin-label');
    if (existingLabel) {
        if (existingLabel.dataset.friendId === friendId) return;
        existingLabel.remove();
    }

    var label = createLabel(data.since, data.origin, friendId);
    if (!label) return;

    var statusContainer = cardCaption.querySelector('.avatar-status-container');
    if (statusContainer && statusContainer.parentNode) {
        statusContainer.parentNode.insertBefore(label, statusContainer);
    } else {
        cardCaption.appendChild(label);
    }
}

function processVisibleCards() {
    if (!enabled) return;

    var links = document.querySelectorAll('.avatar-card-caption a.avatar-name');
    if (!links.length) {
        links = document.querySelectorAll('[href*="/users/"][href*="/profile"]');
    }

    for (var i = 0; i < links.length; i++) {
        injectLabelIntoCard(links[i]);
    }
}

var processTimer = null;
function startCardsObserver() {
    if (cardsObserver) cardsObserver.disconnect();
    cardsObserver = new MutationObserver(function() {
        if (!enabled) return;
        if (!processTimer) {
            processTimer = setTimeout(function() {
                processTimer = null;
                processVisibleCards();
            }, 200);
        }
    });

    var container = document.querySelector('.avatar-cards, .friends-list, [data-testid="friends-list"]');
    if (container) {
        cardsObserver.observe(container, { childList: true, subtree: true });
    } else {
        cardsObserver.observe(document.body, { childList: true, subtree: true });
    }
}

function stopCardsObserver() {
    if (cardsObserver) { cardsObserver.disconnect(); cardsObserver = null; }
    clearTimeout(processTimer);
    processTimer = null;
}

function cleanupLabels() {
    var labels = document.querySelectorAll('.purpura-friend-origin-label');
    for (var i = 0; i < labels.length; i++) {
        labels[i].remove();
    }
}

async function fetchAllFriendInsights() {
    if (fetching) return;
    fetching = true;

    try {
        var csrf = getPageCsrfToken();
        var result = await new Promise(function(resolve) {
            chrome.runtime.sendMessage({
                action: 'fetchAllFriendInsights',
                csrfToken: csrf
            }, function(response) {
                resolve(response);
            });
        });

        fetched = true;
        if (result && typeof result === 'object') {
            insightsMap = result;
        }
    } catch(e) {
    } finally {
        fetching = false;
    }
}

function applyEnabledState() {
    if (enabled) {
        if (!fetched && !fetching) {
            fetchAllFriendInsights().then(function() {
                processVisibleCards();
                startCardsObserver();
            });
        } else {
            processVisibleCards();
            startCardsObserver();
        }
    } else {
        stopCardsObserver();
        cleanupLabels();
    }
}

window.__PurpuraSettings.ready.then(function() {
    enabled = window.__PurpuraSettings.get(SETTING_KEY) !== false;
    applyEnabledState();
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync' && changes[SETTING_KEY]) {
        enabled = changes[SETTING_KEY].newValue !== false;
        applyEnabledState();
    }
});
})();
