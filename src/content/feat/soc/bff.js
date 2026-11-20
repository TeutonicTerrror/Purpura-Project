/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
if (window.purpuraBestFriendsInitialized) return;
window.purpuraBestFriendsInitialized = true;

var SETTING_KEY = 'bff';
var STAR_SETTING_KEY = 'bffStar';
var STORAGE_KEY = 'purpuraBestFriends';
var STYLE_ID = 'purpura-bff-style';
var STAR_CLASS = 'purpura-bff-star';
var PINNED_CLASS = 'purpura-pinned-friend';
var ADD_CLASS = 'purpura-add-friends-item';
var LIST_CLASS = 'purpura-pinned-list';
var ENABLED_CLASS = 'purpura-bff-on';
var USER_LINK_SELECTOR = 'a[href*="/users/"]';
var CARD_SELECTOR = '.friends-carousel-tile, .avatar-card';
var CAROUSEL_TILE_CLASS = 'friends-carousel-tile';
var EXCLUDED_CONTAINER_SELECTOR = '.roseal-friends-carousel-container';
var AUTHENTICATED_URL = 'https://users.roblox.com/v1/users/authenticated';
var FRIENDS_URL = 'https://friends.roblox.com/v1/users/';
var STAR_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.6l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.62l-5.88 3.09 1.12-6.55L2.48 9.52l6.58-.96z"/></svg>';

var enabled = true;
var carouselStars = true;
var bestFriends = [];
var friendIds = null;
var friendRequest = null;
var friendRequestFailed = false;
var observer = null;
var scanTimer = null;

function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
        '.' + STAR_CLASS + '{position:absolute;top:6px;right:6px;z-index:6;display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;padding:0;margin:0;border:0;background:none;color:rgba(255,255,255,.6);cursor:pointer;filter:drop-shadow(0 1px 2px rgba(0,0,0,.65));opacity:.9;transition:color .15s ease,transform .15s ease,opacity .15s ease}' +
        '.' + STAR_CLASS + ' svg{width:18px;height:18px;display:block;pointer-events:none}' +
        '.' + STAR_CLASS + ' path{fill:none;stroke:currentColor;stroke-width:1.8;stroke-linejoin:round;stroke-linecap:round}' +
        '.' + STAR_CLASS + ':hover{color:#fff;opacity:1;transform:scale(1.15)}' +
        '.' + STAR_CLASS + ':active{transform:scale(.95)}' +
        '.' + STAR_CLASS + ':focus-visible{outline:1px solid currentColor;outline-offset:2px}' +
        '.' + STAR_CLASS + '.is-on{color:#ffce54;opacity:1;filter:drop-shadow(0 1px 3px rgba(0,0,0,.7))}' +
        '.' + STAR_CLASS + '.is-on path{fill:currentColor}' +
        'html.light-theme .' + STAR_CLASS + ',body.light-theme .' + STAR_CLASS + ',html[data-theme="light"] .' + STAR_CLASS + '{color:rgba(46,42,53,.5);filter:drop-shadow(0 1px 1px rgba(255,255,255,.75))}' +
        'html.light-theme .' + STAR_CLASS + ':hover,body.light-theme .' + STAR_CLASS + ':hover,html[data-theme="light"] .' + STAR_CLASS + ':hover{color:#2e2a35}' +
        'html.light-theme .' + STAR_CLASS + '.is-on,body.light-theme .' + STAR_CLASS + '.is-on,html[data-theme="light"] .' + STAR_CLASS + '.is-on{color:#e0a800}' +
        'html.' + ENABLED_CLASS + ' .' + PINNED_CLASS + '{order:-1 !important}' +
        'html.' + ENABLED_CLASS + ' .' + ADD_CLASS + '{order:-2 !important}' +
        'html.' + ENABLED_CLASS + ' .avatar-cards.' + LIST_CLASS + '{display:grid !important;grid-template-columns:repeat(3,minmax(0,1fr)) !important;grid-auto-flow:row dense;align-items:start;gap:0}' +
        'html.' + ENABLED_CLASS + ' .avatar-cards.' + LIST_CLASS + '>.list-item{float:none !important;width:auto !important}' +
        'html.' + ENABLED_CLASS + ' .avatar-cards.' + LIST_CLASS + ':before,html.' + ENABLED_CLASS + ' .avatar-cards.' + LIST_CLASS + ':after{display:none !important;content:none !important}' +
        '@media (max-width:991px){html.' + ENABLED_CLASS + ' .avatar-cards.' + LIST_CLASS + '{grid-template-columns:repeat(2,minmax(0,1fr)) !important}}' +
        '@media (max-width:767px){html.' + ENABLED_CLASS + ' .avatar-cards.' + LIST_CLASS + '{grid-template-columns:minmax(0,1fr) !important}}';
    document.head.appendChild(style);
}

function getUserId(node) {
    if (!node || !node.querySelector) return null;
    var link = node.querySelector(USER_LINK_SELECTOR);
    if (!link) return null;
    var match = (link.getAttribute('href') || '').match(/\/users\/(\d+)/);
    return match ? match[1] : null;
}

function countPeople(node) {
    if (!node || !node.querySelectorAll) return 0;
    var links = node.querySelectorAll(USER_LINK_SELECTOR);
    var ids = [];
    for (var i = 0; i < links.length; i++) {
        var match = (links[i].getAttribute('href') || '').match(/\/users\/(\d+)/);
        if (!match) continue;
        if (ids.indexOf(match[1]) === -1) {
            ids.push(match[1]);
            if (ids.length > 1) return 2;
        }
    }
    return ids.length;
}

function resolveUnit(link) {
    var node = link.parentElement;
    while (node && node.parentElement && node.parentElement !== document.body) {
        if (countPeople(node.parentElement) !== 1) return node;
        node = node.parentElement;
    }
    return node && countPeople(node) === 1 ? node : null;
}

function getOrderTarget(node) {
    if (!node || !window.getComputedStyle) return null;
    var current = node;
    for (var depth = 0; current && current.parentElement && depth < 6; depth++) {
        if (countPeople(current) > 1) return null;
        var display = '';
        try {
            display = window.getComputedStyle(current.parentElement).display || '';
        } catch (e) {
            display = '';
        }
        if (display.indexOf('flex') !== -1 || display.indexOf('grid') !== -1) return current;
        current = current.parentElement;
    }
    return null;
}

function isFlexLike(element) {
    if (!element || !window.getComputedStyle) return false;
    var display = window.getComputedStyle(element).display || '';
    return display.indexOf('flex') !== -1 || display.indexOf('grid') !== -1;
}

function compareDomOrder(a, b) {
    var position = a.compareDocumentPosition(b);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
}

function collectGroups() {
    var links = document.querySelectorAll(USER_LINK_SELECTOR);
    var parents = [];
    var groups = [];
    for (var i = 0; i < links.length; i++) {
        var unit = resolveUnit(links[i]);
        if (!unit || !getUserId(unit)) continue;
        var parent = unit.parentElement;
        if (!parent) continue;
        var index = parents.indexOf(parent);
        if (index === -1) {
            parents.push(parent);
            groups.push([]);
            index = groups.length - 1;
        }
        if (groups[index].indexOf(unit) === -1) groups[index].push(unit);
    }
    for (var j = 0; j < groups.length; j++) {
        if (groups[j].length > 1) groups[j].sort(compareDomOrder);
    }
    return groups;
}

function persist() {
    try {
        var payload = {};
        payload[STORAGE_KEY] = bestFriends.slice();
        chrome.storage.local.set(payload);
    } catch (e) {
    }
}

function toggleBestFriend(friendId) {
    var index = bestFriends.indexOf(friendId);
    if (index === -1) bestFriends.push(friendId);
    else bestFriends.splice(index, 1);
    persist();
    scan();
}

function loadFriendIds() {
    if (friendRequest || friendRequestFailed || typeof fetch !== 'function') return;
    friendRequest = fetch(AUTHENTICATED_URL, { credentials: 'include' })
        .then(function(response) {
            return response && response.ok ? response.json() : null;
        })
        .then(function(user) {
            if (!user || !user.id) return null;
            return fetch(FRIENDS_URL + encodeURIComponent(user.id) + '/friends?limit=200', { credentials: 'include' });
        })
        .then(function(response) {
            return response && response.ok ? response.json() : null;
        })
        .then(function(data) {
            if (!data || !Array.isArray(data.data)) {
                friendRequestFailed = true;
                return;
            }
            var ids = {};
            for (var i = 0; i < data.data.length; i++) {
                if (data.data[i] && data.data[i].id != null) ids[String(data.data[i].id)] = true;
            }
            friendIds = ids;
            if (enabled) scheduleScan();
        })
        .catch(function() {
            friendRequestFailed = true;
        });
}

function isStarrable(card, userId) {
    if (card.classList.contains(CAROUSEL_TILE_CLASS)) return true;
    if (friendRequestFailed) return false;
    if (!friendIds) {
        loadFriendIds();
        return false;
    }
    return friendIds[userId] === true;
}

function findOwnStar(card) {
    for (var i = 0; i < card.children.length; i++) {
        if (card.children[i].classList && card.children[i].classList.contains(STAR_CLASS)) {
            return card.children[i];
        }
    }
    return null;
}

function updateStar(star, marked) {
    var label = marked ? 'Remove from best friends' : 'Add to best friends';
    star.classList.toggle('is-on', marked);
    star.setAttribute('aria-pressed', String(marked));
    star.setAttribute('aria-label', label);
    star.title = label;
}

function createStar(card, friendId) {
    var star = document.createElement('button');
    star.type = 'button';
    star.className = STAR_CLASS;
    star.innerHTML = STAR_SVG;
    updateStar(star, bestFriends.indexOf(friendId) !== -1);
    star.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        toggleBestFriend(friendId);
    });
    if (window.getComputedStyle) {
        var position = window.getComputedStyle(card).position;
        if (!position || position === 'static') card.style.position = 'relative';
    }
    card.appendChild(star);
    return star;
}

function syncStars(cards) {
    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        if (card.classList.contains('avatar-card') && card.closest('.' + CAROUSEL_TILE_CLASS)) continue;
        var friendId = getUserId(card);
        var star = findOwnStar(card);
        if (!friendId || !isStarrable(card, friendId) || (!carouselStars && card.classList.contains(CAROUSEL_TILE_CLASS))) {
            if (star) star.remove();
            continue;
        }
        if (star) updateStar(star, bestFriends.indexOf(friendId) !== -1);
        else createStar(card, friendId);
    }
}

function reorderGroup(units) {
    if (units.length < 2 || !bestFriends.length) return;

    var ranked = [];
    var anyBest = false;
    for (var i = 0; i < units.length; i++) {
        var rank = bestFriends.indexOf(getUserId(units[i]));
        if (rank !== -1) anyBest = true;
        ranked.push({ node: units[i], rank: rank === -1 ? Number.MAX_SAFE_INTEGER : rank, index: i });
    }
    if (!anyBest) return;

    ranked.sort(function(a, b) {
        if (a.rank === b.rank) return a.index - b.index;
        return a.rank < b.rank ? -1 : 1;
    });

    var desired = [];
    var same = true;
    for (var j = 0; j < ranked.length; j++) {
        desired.push(ranked[j].node);
        if (ranked[j].node !== units[j]) same = false;
    }
    if (same) return;

    var parent = units[0].parentElement;
    if (!parent) return;
    var anchor = units[0].previousSibling;
    for (var k = 0; k < desired.length; k++) {
        parent.insertBefore(desired[k], anchor ? anchor.nextSibling : parent.firstChild);
        anchor = desired[k];
    }
}

function markAddTiles() {
    var tiles = document.querySelectorAll('.' + CAROUSEL_TILE_CLASS);
    for (var i = 0; i < tiles.length; i++) {
        var isAdd = Boolean(tiles[i].querySelector('.add-friends-icon-container'));
        var target = isAdd ? getOrderTarget(tiles[i]) : null;
        tiles[i].classList.toggle(ADD_CLASS, isAdd);
        if (target && target !== tiles[i]) target.classList.toggle(ADD_CLASS, isAdd);
    }
}

function applyGroups(groups) {
    var excluded = Boolean(document.querySelector(EXCLUDED_CONTAINER_SELECTOR));
    for (var i = 0; i < groups.length; i++) {
        var units = groups[i];
        if (units.length < 2) continue;
        var pinnedCount = 0;
        for (var j = 0; j < units.length; j++) {
            var unit = units[j];
            var marked = bestFriends.indexOf(getUserId(unit)) !== -1;
            if (marked) pinnedCount++;
            var target = getOrderTarget(unit);
            var card = unit.matches && unit.matches(CARD_SELECTOR) ? unit : unit.querySelector(CARD_SELECTOR);
            unit.classList.toggle(PINNED_CLASS, marked);
            if (target && target !== unit) target.classList.toggle(PINNED_CLASS, marked);
            if (card && card !== unit && card !== target) card.classList.toggle(PINNED_CLASS, marked);
        }
        if (excluded) continue;
        var parent = units[0].parentElement;
        if (!parent) continue;
        if (parent.classList && parent.classList.contains('avatar-cards')) {
            parent.classList.toggle(LIST_CLASS, pinnedCount > 0);
            if (pinnedCount) continue;
        }
        if (!isFlexLike(parent)) reorderGroup(units);
    }
}

function scan() {
    if (!enabled || !document.body) return;
    ensureStyles();
    document.documentElement.classList.add(ENABLED_CLASS);
    syncStars(document.querySelectorAll(CARD_SELECTOR));
    var groups = collectGroups();
    applyGroups(groups);
    markAddTiles();
}

function scheduleScan() {
    if (scanTimer) return;
    scanTimer = setTimeout(function() {
        scanTimer = null;
        scan();
    }, 120);
}

function startObserver() {
    if (observer) return;
    observer = new MutationObserver(function() {
        if (enabled) scheduleScan();
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

function stopObserver() {
    if (observer) { observer.disconnect(); observer = null; }
    clearTimeout(scanTimer);
    scanTimer = null;
}

function removeUi() {
    document.documentElement.classList.remove(ENABLED_CLASS);
    var stars = document.querySelectorAll('.' + STAR_CLASS);
    for (var i = 0; i < stars.length; i++) stars[i].remove();
    var pinned = document.querySelectorAll('.' + PINNED_CLASS + ',.' + ADD_CLASS);
    for (var j = 0; j < pinned.length; j++) pinned[j].classList.remove(PINNED_CLASS, ADD_CLASS);
    var lists = document.querySelectorAll('.' + LIST_CLASS);
    for (var k = 0; k < lists.length; k++) lists[k].classList.remove(LIST_CLASS);
}

function applyEnabledState() {
    if (enabled) {
        scan();
        startObserver();
    } else {
        stopObserver();
        removeUi();
    }
}

function normalizeList(value) {
    if (!Array.isArray(value)) return [];
    var out = [];
    for (var i = 0; i < value.length; i++) {
        var id = String(value[i]);
        if (id && out.indexOf(id) === -1) out.push(id);
    }
    return out;
}

window.__PurpuraSettings.ready.then(function() {
    enabled = window.__PurpuraSettings.get(SETTING_KEY) !== false;
    carouselStars = window.__PurpuraSettings.get(STAR_SETTING_KEY) !== false;
    try {
        chrome.storage.local.get([STORAGE_KEY], function(result) {
            bestFriends = normalizeList(result && result[STORAGE_KEY]);
            applyEnabledState();
        });
    } catch (e) {
        bestFriends = [];
        applyEnabledState();
    }
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync' && changes[SETTING_KEY]) {
        enabled = changes[SETTING_KEY].newValue !== false;
        applyEnabledState();
    } else if (namespace === 'sync' && changes[STAR_SETTING_KEY]) {
        carouselStars = changes[STAR_SETTING_KEY].newValue !== false;
        if (enabled) scan();
    } else if (namespace === 'local' && changes[STORAGE_KEY]) {
        bestFriends = normalizeList(changes[STORAGE_KEY].newValue);
        if (enabled) scan();
    }
});
})();
