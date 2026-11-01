/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */

(function () {
    'use strict';
    const ALARM = 'purpura-recent-servers';
    const KEY = 'purpuraRecentServers';
    const MAX_PER_PLACE = 10;
    const MAX_TOTAL = 150;
    const USER_TTL = 10 * 60 * 1000;
    let running = false;
    let cachedUser = null;
    const validId = value => Number.isSafeInteger(value) && value > 0 && value <= 9e15;
    const validGameId = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

    async function enabled() {
        const [sync, local] = await Promise.all([chrome.storage.sync.get('rs'), chrome.storage.local.get('noFeatures')]);
        return sync.rs !== false && local.noFeatures !== true;
    }

    async function json(url, init) {
        const response = await fetch(url, { credentials: 'include', signal: AbortSignal.timeout(8000), ...init });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
    }

    async function userId() {
        if (cachedUser && Date.now() - cachedUser.at < USER_TTL) return cachedUser.id;
        const user = await json('https://users.roblox.com/v1/users/authenticated');
        if (!validId(user?.id)) return null;
        cachedUser = { id: user.id, at: Date.now() };
        return user.id;
    }

    function prune(list) {
        list.sort((a, b) => b.lastSeen - a.lastSeen);
        const counts = new Map();
        const kept = [];
        for (const entry of list) {
            const group = entry.userId + ':' + entry.rootPlaceId;
            const count = counts.get(group) || 0;
            if (count >= MAX_PER_PLACE) continue;
            counts.set(group, count + 1);
            kept.push(entry);
            if (kept.length >= MAX_TOTAL) break;
        }
        return kept;
    }

    async function check() {
        if (running) return;
        running = true;
        try {
            if (!await enabled()) return;
            const uid = await userId();
            if (!uid) return;
            const data = await json('https://presence.roblox.com/v1/presence/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIds: [uid] })
            });
            const presence = data?.userPresences?.find(item => item?.userId === uid) || data?.userPresences?.[0];
            if (presence?.userPresenceType !== 2 || !validGameId(presence.gameId)) return;
            const placeId = Number(presence.placeId);
            if (!validId(placeId)) return;
            const rootPlaceId = validId(Number(presence.rootPlaceId)) ? Number(presence.rootPlaceId) : placeId;
            const universeId = validId(Number(presence.universeId)) ? Number(presence.universeId) : null;
            const gameId = presence.gameId.toLowerCase();
            const now = Date.now();
            if (!await enabled()) return;
            const stored = (await chrome.storage.local.get(KEY))[KEY];
            const list = Array.isArray(stored)
                ? stored.filter(entry => entry && validGameId(entry.gameId) && validId(entry.userId) && validId(entry.placeId) && Number.isFinite(entry.lastSeen))
                : [];
            const existing = list.find(entry => entry.gameId === gameId && entry.userId === uid);
            if (existing) {
                existing.lastSeen = now;
                existing.placeId = placeId;
                existing.rootPlaceId = rootPlaceId;
                if (universeId) existing.universeId = universeId;
                if (typeof presence.lastLocation === 'string' && presence.lastLocation) existing.name = presence.lastLocation.slice(0, 120);
            } else {
                list.push({
                    userId: uid,
                    gameId,
                    placeId,
                    rootPlaceId,
                    universeId,
                    name: typeof presence.lastLocation === 'string' ? presence.lastLocation.slice(0, 120) : '',
                    firstSeen: now,
                    lastSeen: now
                });
            }
            await chrome.storage.local.set({ [KEY]: prune(list) });
        } catch (error) {
        } finally {
            running = false;
        }
    }

    async function schedule() {
        if (await enabled()) {
            const existing = await chrome.alarms.get(ALARM);
            if (!existing) await chrome.alarms.create(ALARM, { periodInMinutes: 0.5 });
            check();
        } else {
            await chrome.alarms.clear(ALARM);
        }
    }

    chrome.alarms.onAlarm.addListener(alarm => { if (alarm.name === ALARM) check(); });
    chrome.runtime.onStartup.addListener(() => schedule().catch(() => {}));
    chrome.runtime.onInstalled.addListener(() => schedule().catch(() => {}));
    chrome.storage.onChanged.addListener((changes, area) => {
        if ((area === 'sync' && changes.rs) || (area === 'local' && changes.noFeatures)) schedule().catch(() => {});
    });
    schedule().catch(() => {});
})();
