/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    'use strict';
    const ALARM = 'purpura-outbound-protection';
    let running = false;
    const validId = value => Number.isSafeInteger(value) && value > 0 && value <= 9e15;
    const amount = value => Number.isSafeInteger(value) && value >= 0;
    function threshold(value) {
        if (typeof value !== 'number' && typeof value !== 'string') return null;
        if (typeof value === 'string' && !/^\d+(?:\.\d+)?$/.test(value.trim())) return null;
        const number = Number(value);
        return Number.isFinite(number) && number > 0 && number <= 100 ? number : null;
    }
    function fresh(data) {
        return data?.source === 'Rolimon’s' && Number.isFinite(data.fetchedAt) &&
            data.fetchedAt <= Date.now() && Date.now() - data.fetchedAt <= 180000 && data.items && typeof data.items === 'object';
    }
    function loss(trade, userId, data) {
        if (!fresh(data) || trade?.status !== 'Open' || !validId(trade.tradeId ?? trade.id)) return null;
        const offers = [trade.participantAOffer, trade.participantBOffer];
        if (offers.some(offer => !validId(offer?.user?.id) || !amount(offer.robux) || !Array.isArray(offer.items) || offer.items.length > 4)) return null;
        const ours = offers.filter(offer => offer.user.id === userId);
        const theirs = offers.filter(offer => offer.user.id !== userId);
        if (ours.length !== 1 || theirs.length !== 1) return null;
        function total(offer, incoming) {
            let sum = incoming ? Math.floor(offer.robux * 0.7) : offer.robux;
            for (const item of offer.items) {
                const id = Number(item.itemTarget?.targetId ?? item.assetId);
                if (!validId(id) || (item.itemTarget && item.itemTarget.itemType !== 'Asset')) return null;
                const row = data.items[id];
                const value = row?.value === null ? row?.rap : row?.value;
                if (!row || !amount(value)) return null;
                sum += value;
                if (!Number.isSafeInteger(sum)) return null;
            }
            return sum;
        }
        const sent = total(ours[0], false);
        const received = total(theirs[0], true);
        if (sent === null || received === null || sent <= 0) return null;
        return Math.max(0, (sent - received) / sent * 100);
    }
    async function json(url, credentials = 'include') {
        const response = await fetch(url, { credentials, cache: 'no-store', signal: AbortSignal.timeout(8000) });
        if (!response.ok) throw new Error(`Service unavailable (${response.status}): ${new URL(url).hostname}`);
        return response.json();
    }
    async function itemData(ids) {
        if (!Array.isArray(ids) || !ids.length || ids.length > 100 || ids.some(id => !validId(id))) throw new Error('Invalid items');
        const data = await json(`https://api.purpura.page/v1/items?ids=${[...new Set(ids)].join(',')}`, 'omit');
        if (!fresh(data)) throw new Error('Item data is missing or stale');
        return data;
    }
    async function config() {
        const [sync, local] = await Promise.all([chrome.storage.sync.get('otp'), chrome.storage.local.get('noFeatures')]);
        return local.noFeatures !== true && sync.otp?.enabled === true && threshold(sync.otp.threshold) !== null ? sync.otp : null;
    }
    async function authenticated() {
        const user = await json('https://users.roblox.com/v1/users/authenticated');
        if (!validId(user.id)) throw new Error('Not authenticated');
        return user.id;
    }
    async function check() {
        if (running) return;
        running = true;
        try {
            const settings = await config();
            if (!settings) return;
            const userId = await authenticated();
            const trades = await json('https://trades.roblox.com/v1/trades/outbound?limit=10&sortOrder=Desc');
            if (!Array.isArray(trades.data)) return;
            for (const row of trades.data.slice(0, 10)) {
                if (!validId(row.id)) continue;
                const trade = await json(`https://trades.roblox.com/v2/trades/${row.id}`);
                if ((trade.tradeId ?? trade.id) !== row.id) continue;
                const ids = [trade.participantAOffer, trade.participantBOffer].flatMap(offer =>
                    Array.isArray(offer?.items) ? offer.items.map(item => Number(item.itemTarget?.targetId ?? item.assetId)) : []);
                if (!ids.length) continue;
                const values = await itemData(ids);
                const initialLoss = loss(trade, userId, values);
                if (initialLoss === null || initialLoss < threshold(settings.threshold)) continue;
                const latestSettings = await config();
                if (!latestSettings || threshold(latestSettings.threshold) !== threshold(settings.threshold) || await authenticated() !== userId) return;
                const outbound = await json('https://trades.roblox.com/v1/trades/outbound?limit=10&sortOrder=Desc');
                if (!outbound.data?.some(item => item.id === row.id)) continue;
                const latestTrade = await json(`https://trades.roblox.com/v2/trades/${row.id}`);
                if ((latestTrade.tradeId ?? latestTrade.id) !== row.id) continue;
                const latestLoss = loss(latestTrade, userId, values);
                if (latestLoss === null || latestLoss < threshold(latestSettings.threshold)) continue;
                const finalSettings = await config();
                if (!finalSettings || threshold(finalSettings.threshold) !== threshold(latestSettings.threshold) || !fresh(values)) return;
                const url = `https://trades.roblox.com/v1/trades/${row.id}/decline`;
                let response = await fetch(url, { method: 'POST', credentials: 'include', signal: AbortSignal.timeout(8000) });
                const csrf = response.headers.get('x-csrf-token');
                if (response.status === 403 && csrf) {
                    const beforeRetry = await config();
                    if (!beforeRetry || threshold(beforeRetry.threshold) !== threshold(latestSettings.threshold) || !fresh(values) || await authenticated() !== userId) return;
                    const retryOutbound = await json('https://trades.roblox.com/v1/trades/outbound?limit=10&sortOrder=Desc');
                    if (!retryOutbound.data?.some(item => item.id === row.id)) continue;
                    const retryTrade = await json(`https://trades.roblox.com/v2/trades/${row.id}`);
                    const retryLoss = loss(retryTrade, userId, values);
                    if ((retryTrade.tradeId ?? retryTrade.id) !== row.id || retryLoss === null || retryLoss < threshold(beforeRetry.threshold)) continue;
                    const retrySettings = await config();
                    if (!retrySettings || threshold(retrySettings.threshold) !== threshold(beforeRetry.threshold)) return;
                    response = await fetch(url, { method: 'POST', credentials: 'include', headers: { 'x-csrf-token': csrf }, signal: AbortSignal.timeout(8000) });
                }
                if (!response.ok) throw new Error('Trade cancellation failed');
                await chrome.storage.local.set({ purpuraTradeProtectionStatus: { userId, tradeId: row.id, lossPercent: latestLoss, checkedAt: Date.now(), cancelled: true } });
            }
        } catch (error) {
            await chrome.storage.local.set({ purpuraTradeProtectionStatus: { checkedAt: Date.now(), cancelled: false, error: error.message } });
        } finally { running = false; }
    }
    async function schedule() {
        if (await config()) {
            const existing = await chrome.alarms.get(ALARM);
            if (!existing) await chrome.alarms.create(ALARM, { periodInMinutes: 0.5 });
        } else await chrome.alarms.clear(ALARM);
    }
    chrome.alarms.onAlarm.addListener(alarm => { if (alarm.name === ALARM) check(); });
    chrome.runtime.onStartup.addListener(() => schedule().catch(() => {}));
    chrome.runtime.onInstalled.addListener(() => schedule().catch(() => {}));
    chrome.storage.onChanged.addListener((changes, area) => {
        if ((area === 'sync' && changes.otp) || (area === 'local' && changes.noFeatures)) schedule().catch(() => {});
    });
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request?.type !== 'PURPURA_ITEM_VALUES') return;
        (async () => {
            try {
                const [sync, local] = await Promise.all([chrome.storage.sync.get('pwi'), chrome.storage.local.get('noFeatures')]);
                if (sync.pwi === false || local.noFeatures === true) throw new Error('Projected warnings disabled');
                sendResponse({ ok: true, ...await itemData(request.ids) });
            } catch (error) {
                await chrome.storage.local.set({ purpuraProjectedLookupStatus: { checkedAt: Date.now(), error: error.message } });
                sendResponse({ ok: false, error: error.message });
            }
        })();
        return true;
    });
    globalThis.PurpuraTrading = { threshold, loss, fresh, check };
    schedule().catch(() => {});
})();
