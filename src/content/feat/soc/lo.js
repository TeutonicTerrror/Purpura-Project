/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
function t(key, substitutions) { return chrome.i18n.getMessage(key, substitutions) || key; }
if (window.purpuraLastOnlineInitialized) return;
window.purpuraLastOnlineInitialized = true;

(function() {
    var style = document.createElement('style');
    style.textContent = ':root{--purpura-lo-online-bg:rgb(57,203,121);--purpura-lo-online-text:white;--purpura-lo-offline-bg:rgba(239,83,80,0.15);--purpura-lo-offline-text:rgb(239,83,80);--purpura-lo-unknown-bg:rgba(0,0,0,0.35);--purpura-lo-unknown-text:white}';
    document.head.appendChild(style);
})();

const STORAGE_KEY = "purpura-last-online-cache-v1";
const SETTING_KEY = "lo";
const PROFILE_URL_RE = /\/users\/(\d+)\/profile(?:\/|$|\?)/;
const BANNED_PROFILE_URL_RE = /\/banned-users\/(\d+)\/profile(?:\/|$|\?)/;

let enabled = true;
let cache = {};
let periodicTimer = null;
let lastUrl = location.href;
let currentUserId = null;
let pillObserver = null;

function readCache() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
    } catch {
        return {};
    }
}

function writeCache() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch {}
}

function formatTimeAgo(ts) {
    const delta = Math.max(0, Date.now() - ts);
    const seconds = Math.floor(delta / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    if (seconds > 0) return `${seconds}s ago`;
    return 'just now';
}

function getProfileUserId() {
    const match = window.location.pathname.match(PROFILE_URL_RE);
    return match ? match[1] : null;
}

function isGhostProfilePage() {
    if (BANNED_PROFILE_URL_RE.test(window.location.pathname)) return true;
    if (document.body?.dataset?.purpuraGhostProfile === '1') return true;
    if (document.querySelector('[data-purpura-ghost-profile="1"]')) return true;
    return false;
}

function buildPill(content, extra) {
    const pill = document.createElement('span');
    pill.id = 'purpura-last-online-pill';
    pill.style.fontSize = '11px';
    pill.style.marginTop = '6px';
    pill.style.marginLeft = '0';
    pill.style.display = 'inline-flex';
    pill.style.alignItems = 'center';
    pill.style.gap = '6px';
    pill.style.padding = '4px 12px';
    pill.style.borderRadius = '999px';
    pill.style.fontWeight = '600';
    pill.style.letterSpacing = '0.02em';
    pill.style.width = 'fit-content';
    pill.style.maxWidth = '100%';
    if (extra?.background) pill.style.background = extra.background;
    if (extra?.color) pill.style.color = extra.color;
    if (typeof content === 'string') {
        pill.textContent = content;
    } else if (content instanceof Node) {
        pill.appendChild(content);
    }
    return pill;
}

function createInteractiveTimestamp(date) {
    const span = document.createElement('span');
    span.textContent = formatTimeAgo(date.getTime());
    span.title = date.toLocaleString();
    return span;
}

function injectPill(targetContainer, pill) {
    if (targetContainer.querySelector('#purpura-last-online-pill')) return;
    const existing = document.getElementById('purpura-last-online-pill');
    if (existing) existing.remove();
    targetContainer.appendChild(pill);
}

async function initLastOnline() {
    const userId = getProfileUserId();
    if (!userId) return;

    const presencesUrl = 'https://presence.roblox.com/v1/presence/users';
    let presenceType = 0;

    try {
        const resp = await fetch(presencesUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ userIds: [Number(userId)] })
        });
        if (resp.ok) {
            const data = await resp.json();
            presenceType = data?.userPresences?.[0]?.userPresenceType ?? 0;
            processPresence(data?.userPresences?.[0]);
        }
    } catch {}

    const record = cache[userId];

    if (pillObserver) pillObserver.disconnect();

    pillObserver = new MutationObserver(() => {
        const target = document.querySelector('.profile-header-overlay .flex-nowrap.gap-small.flex');
        if (!target) return;
        if (target.querySelector('#purpura-last-online-pill')) {
            pillObserver.disconnect();
            return;
        }

        let pill;
        if (presenceType > 0) {
            pill = buildPill('Online', { background: 'var(--purpura-lo-online-bg)', color: 'var(--purpura-lo-online-text)' });
        } else if (record && record.lastOnline != null) {
            const inner = document.createElement('span');
            inner.style.display = 'inline';
            const timeEl = createInteractiveTimestamp(new Date(record.lastOnline));
            inner.appendChild(document.createTextNode('Last seen '));
            inner.appendChild(timeEl);
            pill = buildPill(inner, { background: 'var(--purpura-lo-offline-bg)', color: 'var(--purpura-lo-offline-text)' });
        } else {
            pill = buildPill('Offline', { background: 'var(--purpura-lo-unknown-bg)', color: 'var(--purpura-lo-unknown-text)' });
        }

        injectPill(target, pill);
    });

    pillObserver.observe(document.body, { childList: true, subtree: true });
}

function processPresence(presence) {
    if (!currentUserId) return;

    const record = cache[currentUserId] || { prevPresenceType: null, lastOnline: null, lastSeenOnline: null, lastChecked: null };
    const currentlyOffline = presence?.userPresenceType === 0;
    const currentlyOnline = typeof presence?.userPresenceType === 'number' && presence.userPresenceType > 0;

    if (currentlyOnline) {
        record.lastSeenOnline = Date.now();
    }

    if (record.prevPresenceType !== null && record.prevPresenceType !== 0 && currentlyOffline && record.lastSeenOnline) {
        record.lastOnline = record.lastSeenOnline;
    }

    if (typeof presence?.userPresenceType === 'number') {
        record.prevPresenceType = presence.userPresenceType;
    }
    record.lastChecked = Date.now();
    cache[currentUserId] = record;
    writeCache();
}

async function refreshPresence() {
    if (!enabled || !currentUserId) return;

    const body = { userIds: [Number(currentUserId)] };

    try {
        const res = await fetch('https://presence.roblox.com/v1/presence/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body)
        });
        if (!res.ok) return;

        const data = await res.json();
        const presence = data?.userPresences?.[0];
        processPresence(presence);
    } catch {
    }
}

function isProfilePage() {
    if (isGhostProfilePage()) return false;
    return !!getProfileUserId();
}

function isFriendsPage() {
    return /\/friends(\/|$|\?|#)/.test(location.pathname);
}

async function getAuthenticatedUserId() {
    if (currentUserId) return currentUserId;

    const meta = document.querySelector('meta[name="user-data"]');
    const candidate = meta?.getAttribute('data-userid') || meta?.getAttribute('data-user-id');
    if (candidate) {
        currentUserId = candidate;
        return currentUserId;
    }

    try {
        const res = await fetch('https://users.roblox.com/v1/users/authenticated', {
            method: 'GET',
            credentials: 'include',
        });
        if (!res.ok) return null;
        const data = await res.json();
        if (data?.id) {
            currentUserId = String(data.id);
            return currentUserId;
        }
    } catch {
    }

    return null;
}

async function refreshFriendsListPresence() {
    if (!enabled) return;
    const userId = await getAuthenticatedUserId();
    if (!userId) return;

    try {
        const resp = await fetch(
            `https://friends.roblox.com/v1/users/${userId}/friends?userSort=Default&sortOrder=Asc&limit=100`,
            { headers: { 'Content-Type': 'application/json' }, credentials: 'include' }
        );
        if (!resp.ok) return;
        const data = await resp.json();
        const ids = (data?.data ?? []).map(f => f.id).filter(Boolean);
        if (!ids.length) return;
        const batches = [];
        for (let i = 0; i < ids.length; i += 100) batches.push(ids.slice(i, i + 100));

        for (const batch of batches) {
            const p = await fetch('https://presence.roblox.com/v1/presence/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userIds: batch }),
            });
            if (!p.ok) continue;
            const d = await p.json();
            const presences = d?.userPresences ?? [];
            for (const presence of presences) {
                processPresence(presence);
            }
        }
    } catch {
    }
}

function startPeriodicRefresh() {
    if (periodicTimer) return;
    periodicTimer = setInterval(() => {
        if (!enabled) return;
        if (isProfilePage()) refreshPresence();
        if (isFriendsPage()) refreshFriendsListPresence();
    }, 25000);
}

function stopPeriodicRefresh() {
    if (!periodicTimer) return;
    clearInterval(periodicTimer);
    periodicTimer = null;
}

function applyEnabledState() {
    if (!enabled) {
        stopPeriodicRefresh();
        return;
    }

    if (isGhostProfilePage()) {
        stopPeriodicRefresh();
        return;
    }

    cache = readCache();
    if (isProfilePage()) initLastOnline();
    if (isFriendsPage()) refreshFriendsListPresence();
    startPeriodicRefresh();
}

function handleStorageChange(changes, namespace) {
    if (namespace !== 'sync') return;
    if (!changes[SETTING_KEY]) return;
    enabled = changes[SETTING_KEY].newValue !== false;
    applyEnabledState();
}

function init() {
    currentUserId = isGhostProfilePage() ? null : getProfileUserId();
    applyEnabledState();
}

window.__PurpuraSettings.ready.then(function() {
    enabled = window.__PurpuraSettings.get(SETTING_KEY) !== false;
    cache = readCache();
    init();
});

chrome.storage.onChanged.addListener(handleStorageChange);

new MutationObserver(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        const existing = document.getElementById('purpura-last-online-pill');
        if (existing) existing.remove();
        if (pillObserver) { pillObserver.disconnect(); pillObserver = null; }
        init();
    }
}).observe(document, { childList: true, subtree: true });
})();
