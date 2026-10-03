/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
if (window.purpuraMostPlayedTogetherInitialized) return;
window.purpuraMostPlayedTogetherInitialized = true;

(function() {
    var style = document.createElement('style');
    style.textContent = ':root{--purpura-mpt-label-color:rgba(255,255,255,0.5)}';
    document.head.appendChild(style);
})();

var SETTING_KEY = 'mpt';
var enabled = true;

var gameNamesMap = {};
var insightsMap = {};
var fetched = false;
var fetching = false;
var cardsObserver = null;


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

function getUserIdFromUrl(el) {
    var href = (el && el.href) || '';
    var match = href.match(/\/users\/(\d+)/);
    return match ? match[1] : null;
}

function createLabel(gameName, friendName, friendId) {
    var label = document.createElement('div');
    label.className = 'avatar-card-label text-overflow purpura-mpt-label';
    label.dataset.friendId = friendId;
    label.style.cssText = 'font-size:11px;color:var(--purpura-mpt-label-color);margin-top:2px;line-height:1.3;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%;';

    var text = 'Most played: ' + gameName;
    label.textContent = text;
    label.title = 'Your most played game with ' + (friendName || 'this friend') + ' is ' + gameName + '.';
    return label;
}

function injectLabelIntoCard(cardLink) {
    var friendId = getUserIdFromUrl(cardLink);
    if (!friendId) return;

    var cardCaption = cardLink.closest('.avatar-card-caption');
    if (!cardCaption) return;

    var existingLabel = cardCaption.querySelector('.purpura-mpt-label');
    if (existingLabel) {
        if (existingLabel.dataset.friendId === friendId) return;
        existingLabel.remove();
    }

    var gameName = gameNamesMap[friendId];
    if (!gameName) return;

    var friendName = cardLink.textContent.trim();
    var label = createLabel(gameName, friendName, friendId);
    if (!label) return;

    cardCaption.appendChild(label);
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

async function fetchGameNames() {
    var pendingIds = [];
    var keys = Object.keys(insightsMap);
    for (var i = 0; i < keys.length; i++) {
        var friendId = keys[i];
        var data = insightsMap[friendId];
        if (data && data.mostFrequentUniverseId && !gameNamesMap[friendId]) {
            pendingIds.push({ friendId: friendId, universeId: data.mostFrequentUniverseId });
        }
    }

    for (var j = 0; j < pendingIds.length; j++) {
        var item = pendingIds[j];
        try {
            var result = await new Promise(function(resolve) {
                chrome.runtime.sendMessage({
                    action: 'fetchGameDetails',
                    universeId: item.universeId
                }, function(response) {
                    resolve(response || { name: '', thumbnail: '' });
                });
            });

            if (result && result.name) {
                gameNamesMap[item.friendId] = result.name;
            }
        } catch(e) {
        }

        if (j % 10 === 0 && j > 0) {
            await new Promise(function(r) { setTimeout(r, 200); });
        }
    }

}

async function fetchAllFriendInsights() {
    if (fetching) return;
    fetching = true;

    try {
        var result = await new Promise(function(resolve) {
            chrome.runtime.sendMessage({
                action: 'fetchAllFriendInsights',
                csrfToken: getPageCsrfToken()
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
    var labels = document.querySelectorAll('.purpura-mpt-label');
    for (var i = 0; i < labels.length; i++) {
        labels[i].remove();
    }
    gameNamesMap = {};
}

function applyEnabledState() {
    if (enabled) {
        if (!fetched && !fetching) {
            fetchAllFriendInsights().then(function() {
                return fetchGameNames();
            }).then(function() {
                processVisibleCards();
                startCardsObserver();
            });
        } else if (fetched) {
            processVisibleCards();
            startCardsObserver();
        }
    } else {
        stopCardsObserver();
        cleanupLabels();
    }
}

var isProfilePage = /\/users\/\d+\/profile/.test(location.pathname);

window.__PurpuraSettings.ready.then(function() {
    enabled = window.__PurpuraSettings.get(SETTING_KEY) !== false;
    if (isProfilePage) {
        initProfilePage();
    } else {
        applyEnabledState();
    }
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync' && changes[SETTING_KEY]) {
        enabled = changes[SETTING_KEY].newValue !== false;
        if (isProfilePage) {
            if (enabled) {
                initProfilePage();
            } else {
                stopProfileObserver();
                cleanupProfilePill();
            }
        } else {
            applyEnabledState();
        }
    }
});

function getProfileUserId() {
    var match = location.pathname.match(/\/users\/(\d+)\/profile/);
    return match ? match[1] : null;
}

function createProfilePill(gameName, thumbnailUrl, rootPlaceId) {
    var pill = document.createElement('a');
    pill.href = 'https://www.roblox.com/games/' + rootPlaceId;
    pill.target = '_blank';
    pill.style.cssText = 'text-decoration:none;color:inherit;';
    pill.className = 'purpura-mpt-profile-pill relative clip flex justify-center items-center radius-circle stroke-none padding-left-medium padding-right-medium height-800 text-label-medium bg-shift-300 content-action-utility group/interactable cursor-pointer focus-visible:outline-focus disabled:outline-none';
    pill.title = 'Most played together: ' + gameName;

    var presentation = document.createElement('div');
    presentation.setAttribute('role', 'presentation');
    presentation.className = 'absolute inset-[0] transition-colors group-hover/interactable:bg-[var(--color-state-hover)] group-active/interactable:bg-[var(--color-state-press)] group-disabled/interactable:bg-none';
    pill.appendChild(presentation);

    if (thumbnailUrl) {
        var img = document.createElement('img');
        img.src = thumbnailUrl;
        Object.assign(img.style, { width: '20px', height: '20px', borderRadius: '50%', marginRight: '6px', objectFit: 'cover', position: 'relative', zIndex: '1' });
        pill.appendChild(img);
    }

    var span = document.createElement('span');
    span.className = 'padding-y-xsmall text-no-wrap text-truncate-end';
    span.textContent = gameName;
    if (thumbnailUrl) Object.assign(span.style, { position: 'relative', zIndex: '1' });
    pill.appendChild(span);

    return pill;
}

var profilePillInjected = false;
var profilePillLoading = false;
function injectProfilePill(container) {
    if (profilePillInjected || profilePillLoading) return;
    if (container.querySelector('.purpura-mpt-profile-pill')) {
        profilePillInjected = true;
        return;
    }

    var userId = getProfileUserId();
    if (!userId) return;

    profilePillLoading = true;
    var timedOut = false;
    var pillTimeout = setTimeout(function() {
        timedOut = true;
        profilePillLoading = false;
    }, 10000);

    chrome.runtime.sendMessage({
        action: 'fetchProfileInsights',
        userId: userId,
        csrfToken: getPageCsrfToken()
    }, function(response) {
        if (timedOut) return;
        clearTimeout(pillTimeout);
        if (!response || !response.mostFrequentUniverseId) {
            profilePillLoading = false;
            return;
        }

        chrome.runtime.sendMessage({
            action: 'fetchGameDetails',
            universeId: response.mostFrequentUniverseId
        }, function(gameData) {
            clearTimeout(pillTimeout);
            profilePillLoading = false;
            if (!gameData || !gameData.name) return;

            profilePillInjected = true;
            var pill = createProfilePill(gameData.name, gameData.thumbnail, gameData.rootPlaceId || response.mostFrequentUniverseId);
            var lastOnlinePill = container.querySelector('#purpura-last-online-pill');
            if (lastOnlinePill) {
                container.insertBefore(pill, lastOnlinePill);
            } else {
                container.append(pill);
            }
        });
    });
}

var profileObserver = null;
var profileObserverTimer = null;
function initProfilePage() {
    if (!enabled) { stopProfileObserver(); cleanupProfilePill(); return; }

    profileObserver = new MutationObserver(function() {
        if (!enabled) return;
        if (!profileObserverTimer) {
            profileObserverTimer = setTimeout(function() {
                profileObserverTimer = null;
                var container = document.querySelector('.profile-header-overlay .flex-nowrap.gap-small.flex');
                if (container) {
                    injectProfilePill(container);
                }
            }, 200);
        }
    });

    profileObserver.observe(document.body, { childList: true, subtree: true });

    var existingContainer = document.querySelector('.profile-header-overlay .flex-nowrap.gap-small.flex');
    if (existingContainer) {
        injectProfilePill(existingContainer);
    }
}

function stopProfileObserver() {
    if (profileObserver) { profileObserver.disconnect(); profileObserver = null; }
    clearTimeout(profileObserverTimer);
    profileObserverTimer = null;
}

function cleanupProfilePill() {
    var pill = document.querySelector('.purpura-mpt-profile-pill');
    if (pill) pill.remove();
    profilePillInjected = false;
    profilePillLoading = false;
}
})();
