/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
if (!window.purpuraTotalSpentInitialized) {
    window.purpuraTotalSpentInitialized = true;
    function t(key, substitutions) { return chrome.i18n.getMessage(key, substitutions) || key; }

    const STORAGE_KEY = 'tse';
    const CACHE_KEY = 'purpura_tse_cache';
    const ROW_CLASS = 'purpura-tse-row';
    const STYLE_ID = 'purpura-tse-style';
    const API_LIMIT = 100;
    const MAX_PAGES_TO_FETCH = 2000;
    const INCREMENTAL_MAX_PAGES = 5;
    const API_CALL_DELAY_MS = 100;
    const MIN_RESCAN_INTERVAL_MS = 30 * 1000;
    const RATE_LIMIT_BASE_WAIT_MS = 5000;
    const RATE_LIMIT_MAX_WAIT_MS = 30000;
    const RATE_LIMIT_WAIT_LIMIT = 12;
    const TRANSIENT_RETRY_LIMIT = 5;
    const TRANSIENT_RETRY_DELAY_MS = 1000;
    const TRANSIENT_STATUSES = [500, 502, 503, 504];
    const PROGRESS_PAINT_INTERVAL_MS = 120;
    const TRANSACTION_TYPES = ['Purchase', 'Sale'];
    const TRANSACTIONS_API_BASE = 'https://apis.roblox.com/transaction-records/v1/users/';

    const TOTAL_SPENT_TEXT = t('tse_totalSpent');
    const TOTAL_EARNED_TEXT = t('tse_totalEarned');
    const NET_TEXT = t('tse_net');
    const CALCULATING_TEXT = t('tse_calculating');
    const SCANNING_TEXT = t('tse_scanning');
    const ERROR_TEXT = t('tse_error');
    const LIFETIME_TEXT = t('tse_lifetime');
    const AMOUNT_TEXT = t('tse_amount');

    const state = {
        enabled: false,
        observer: null,
        scanTimer: null,
        userId: null,
        activeRunId: 0,
        isScanning: false,
        lastResult: null,
        lastScanAt: 0,
        forceScan: true,
        scannedCount: 0,
        lastPaintAt: 0,
        rateLimitUntil: 0
    };

    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function formatNumber(value) {
        const n = Number(value);
        if (!Number.isFinite(n)) return '0';
        return Math.max(0, Math.round(n)).toLocaleString();
    }

    function getRateLimitDelayMs(meta) {
        const info = meta || {};

        const retryAfter = String(info.retryAfter || '');
        if (retryAfter) {
            const retrySeconds = Number(retryAfter);
            if (Number.isFinite(retrySeconds)) return Math.max(0, retrySeconds * 1000) + 1000;
            const retryAt = Date.parse(retryAfter);
            if (Number.isFinite(retryAt)) return Math.max(0, retryAt - Date.now()) + 1000;
        }

        const remaining = Number(info.rateLimitRemaining);
        const resetVal = Number(info.rateLimitReset);
        if (Number.isFinite(remaining) && remaining <= 1 && Number.isFinite(resetVal) && resetVal > 0) {
            const delayMs = resetVal > 1000000000
                ? Math.max(0, (resetVal * 1000) - Date.now())
                : resetVal * 1000;
            return delayMs + 1000;
        }

        return 0;
    }

    function rateLimitDelayMs(meta, attempt) {
        const explicit = getRateLimitDelayMs(meta);
        if (explicit > 0) return explicit;

        const exponential = RATE_LIMIT_BASE_WAIT_MS * Math.pow(2, Math.max(0, attempt - 1));
        return Math.min(RATE_LIMIT_MAX_WAIT_MS, exponential);
    }

    function proxiedFetch(url) {
        return new Promise(function (resolve) {
            try {
                chrome.runtime.sendMessage({
                    type: 'PURPURA_FETCH_RESOURCE_REQUEST',
                    url,
                    method: 'GET',
                    body: '',
                    accept: 'application/json, text/plain;q=0.9, */*;q=0.8'
                }, function (response) {
                    if (chrome.runtime.lastError || !response) {
                        resolve({ ok: false, status: 0, json: null, meta: {} });
                        return;
                    }

                    let json = null;
                    if (typeof response.text === 'string' && response.text) {
                        try { json = JSON.parse(response.text); } catch { json = null; }
                    }

                    resolve({
                        ok: !!response.ok,
                        status: Number(response.status) || 0,
                        json,
                        meta: {
                            retryAfter: response.retryAfter || '',
                            rateLimitRemaining: response.rateLimitRemaining || '',
                            rateLimitReset: response.rateLimitReset || ''
                        }
                    });
                });
            } catch {
                resolve({ ok: false, status: 0, json: null, meta: {} });
            }
        });
    }

    function isTransactionsPage() {
        return window.location.pathname.toLowerCase().includes('/transactions');
    }

    function ensureStyles() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = ':root{--purpura-tse-error-color:#ff6b6b}' +
            `.${ROW_CLASS} .purpura-tse-error{color:var(--purpura-tse-error-color)}` +
            '.purpura-tse-spinner{display:inline-block;width:12px;height:12px;margin-right:6px;vertical-align:-1px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:purpura-tse-spin .7s linear infinite}' +
            '@keyframes purpura-tse-spin{to{transform:rotate(360deg)}}';

        const root = document.head || document.documentElement;
        if (root) root.appendChild(style);
    }

    function getSummaryTables() {
        let tables = Array.prototype.slice.call(document.querySelectorAll('#transactions-web-app .summary table'));
        if (!tables.length) {
            tables = Array.prototype.slice.call(document.querySelectorAll('table'));
            tables = tables.filter(table => table.querySelector('td.summary-transaction-label, td.summary-transaction-pending-text'));
        }
        if (!tables.length) return null;

        const isSalesTable = table => {
            if (table.querySelector('.summary-transaction-pending-text')) return true;
            const label = table.querySelector('td.summary-transaction-label');
            return !!label && /sales/i.test((label.textContent || '').slice(0, 100));
        };

        const sales = tables.find(isSalesTable) || tables[0];
        const purchases = tables.find(table => table !== sales) || tables[0];

        return { sales, purchases };
    }

    function getOrCreateRow(table, dataKey, label) {
        if (!table) return null;

        let row = table.querySelector(`tr.${ROW_CLASS}[data-purpura-tse="${dataKey}"]`);
        if (row && document.body.contains(row)) return row;

        row = document.createElement('tr');
        row.className = ROW_CLASS;
        row.setAttribute('data-purpura-tse', dataKey);
        row.innerHTML = `
            <td class="summary-transaction-label">${label}</td>
            <td class="amount icon-robux-container"></td>
        `;

        const tbody = table.querySelector('tbody') || table;
        tbody.appendChild(row);
        return row;
    }

    function getOrCreateSectionHeader(table) {
        if (!table) return null;

        let header = table.querySelector(`tr.${ROW_CLASS}[data-purpura-tse="section-header"]`);
        if (header && document.body.contains(header)) return header;

        header = document.createElement('tr');
        header.className = `${ROW_CLASS} border-bottom`;
        header.setAttribute('data-purpura-tse', 'section-header');
        header.innerHTML = `<th class="outgoing-robux-label">${LIFETIME_TEXT}</th><th class="amount">${AMOUNT_TEXT}</th>`;

        const tbody = table.querySelector('tbody') || table;
        const firstDataRow = table.querySelector(`tr.${ROW_CLASS}[data-purpura-tse]`);
        if (firstDataRow) {
            tbody.insertBefore(header, firstDataRow);
        } else {
            tbody.appendChild(header);
        }
        return header;
    }

    function setAmountCell(row, html) {
        if (!row) return;
        const amountCell = row.querySelector('td.amount');
        if (!amountCell) return;
        amountCell.innerHTML = html;
    }

    function setTextCell(row, className, text) {
        if (!row) return;
        const amountCell = row.querySelector('td.amount');
        if (!amountCell) return;
        amountCell.innerHTML = '';
        const span = document.createElement('span');
        span.className = className;
        span.textContent = text;
        amountCell.appendChild(span);
    }

    function setLoadingCell(row, text) {
        if (!row) return;
        const amountCell = row.querySelector('td.amount');
        if (!amountCell) return;
        amountCell.innerHTML = '';
        const spinner = document.createElement('span');
        spinner.className = 'purpura-tse-spinner';
        const label = document.createElement('span');
        label.className = 'text-secondary';
        label.textContent = text;
        amountCell.appendChild(spinner);
        amountCell.appendChild(label);
    }

    function renderRobux(row, value) {
        setAmountCell(row, `<span class="icon-robux-16x16"></span><span class="text-robux">${formatNumber(value)}</span>`);
    }

    function paintLoadingText(text) {
        const tables = getSummaryTables();
        if (!tables) return;
        getOrCreateSectionHeader(tables.purchases);
        getOrCreateSectionHeader(tables.sales);
        setLoadingCell(getOrCreateRow(tables.purchases, 'spent', TOTAL_SPENT_TEXT), text);
        setLoadingCell(getOrCreateRow(tables.sales, 'earned', TOTAL_EARNED_TEXT), text);
        setLoadingCell(getOrCreateRow(tables.sales, 'net', NET_TEXT), text);
    }

    function buildProgressText() {
        return t('tse_progressCount', [formatNumber(state.scannedCount)]);
    }

    function paintProgress(force) {
        if (!state.isScanning) return;

        const now = Date.now();
        if (!force && now - state.lastPaintAt < PROGRESS_PAINT_INTERVAL_MS) return;
        state.lastPaintAt = now;

        if (state.rateLimitUntil > now) {
            const seconds = Math.max(1, Math.ceil((state.rateLimitUntil - now) / 1000));
            paintLoadingText(t('tse_rateLimited', [String(seconds)]));
            return;
        }

        paintLoadingText(buildProgressText());
    }

    async function waitWithProgress(ms, runId) {
        let remaining = Math.max(0, ms);
        paintProgress(true);

        while (remaining > 0 && runId === state.activeRunId) {
            const step = Math.min(500, remaining);
            await wait(step);
            remaining -= step;
            paintProgress(true);
        }
    }

    function renderLoadingRows(scanning) {
        paintLoadingText(scanning ? SCANNING_TEXT : CALCULATING_TEXT);
    }

    function renderResultRows(result, warning) {
        const tables = getSummaryTables();
        if (!tables) return;
        getOrCreateSectionHeader(tables.purchases);
        getOrCreateSectionHeader(tables.sales);
        const rows = [
            getOrCreateRow(tables.purchases, 'spent', TOTAL_SPENT_TEXT),
            getOrCreateRow(tables.sales, 'earned', TOTAL_EARNED_TEXT),
            getOrCreateRow(tables.sales, 'net', NET_TEXT)
        ];
        renderRobux(rows[0], result.spent);
        renderRobux(rows[1], result.earned);
        renderRobux(rows[2], result.net);
        applyRowWarning(rows, warning);
    }

    function applyRowWarning(rows, warning) {
        for (const row of rows) {
            if (!row) continue;
            if (warning) row.setAttribute('title', warning);
            else row.removeAttribute('title');
        }
    }

    function renderErrorRows(message) {
        const tables = getSummaryTables();
        if (!tables) return;
        getOrCreateSectionHeader(tables.purchases);
        getOrCreateSectionHeader(tables.sales);
        const safeMessage = message && typeof message === 'string' ? message : 'Unknown error';
        const spentRow = getOrCreateRow(tables.purchases, 'spent', TOTAL_SPENT_TEXT);
        const earnedRow = getOrCreateRow(tables.sales, 'earned', TOTAL_EARNED_TEXT);
        const netRow = getOrCreateRow(tables.sales, 'net', NET_TEXT);
        setTextCell(spentRow, 'purpura-tse-error', `${ERROR_TEXT}: ${safeMessage}`);
        setTextCell(earnedRow, 'purpura-tse-error', `${ERROR_TEXT}: ${safeMessage}`);
        setTextCell(netRow, 'purpura-tse-error', `${ERROR_TEXT}: ${safeMessage}`);
        applyRowWarning([spentRow, earnedRow, netRow], safeMessage);
    }

    async function fetchAuthenticatedUserId() {
        if (state.userId) return state.userId;

        const response = await fetch('https://users.roblox.com/v1/users/authenticated', {
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch user (${response.status})`);
        }
        const data = await response.json();
        if (!data || !data.id) {
            throw new Error('Could not resolve authenticated user ID');
        }
        state.userId = data.id;
        return state.userId;
    }

    async function fetchTransactionType(userId, transactionType, runId, options) {
        const opts = options || {};
        const seenHashes = opts.seen instanceof Set ? opts.seen : new Set();
        const stopWhenSeen = opts.stopWhenSeen === true;
        const maxPages = Number(opts.maxPages) > 0 ? Number(opts.maxPages) : MAX_PAGES_TO_FETCH;
        const reportProgress = typeof opts.onProgress === 'function' ? opts.onProgress : null;

        const transactions = [];
        let currentCursor = '';
        let pagesFetched = 0;
        let scanned = 0;
        let rateLimitWaits = 0;
        let transientRetries = 0;
        const seenCursors = new Set();

        while (pagesFetched < maxPages && runId === state.activeRunId) {
            if (currentCursor) {
                if (seenCursors.has(currentCursor)) break;
                seenCursors.add(currentCursor);
            }

            const endpoint = new URL(`${TRANSACTIONS_API_BASE}${userId}/transactions`);
            endpoint.searchParams.set('limit', String(API_LIMIT));
            endpoint.searchParams.set('transactionType', transactionType);
            if (transactionType === 'Purchase') {
                endpoint.searchParams.set('itemPricingType', 'PaidAndLimited');
            }
            if (currentCursor) {
                endpoint.searchParams.set('cursor', currentCursor);
            }

            const response = await proxiedFetch(endpoint.toString());
            if (runId !== state.activeRunId) return transactions;

            if (response.status === 429) {
                rateLimitWaits += 1;
                if (rateLimitWaits > RATE_LIMIT_WAIT_LIMIT) {
                    throw new Error(t('tse_rateLimitedError'));
                }

                const waitMs = rateLimitDelayMs(response.meta, rateLimitWaits);
                state.rateLimitUntil = Date.now() + waitMs;
                await waitWithProgress(waitMs, runId);
                if (runId !== state.activeRunId) return transactions;
                state.rateLimitUntil = 0;
                continue;
            }

            if (!response.ok) {
                if (response.status === 0 || TRANSIENT_STATUSES.indexOf(response.status) !== -1) {
                    transientRetries += 1;
                    if (transientRetries <= TRANSIENT_RETRY_LIMIT) {
                        await wait(TRANSIENT_RETRY_DELAY_MS * transientRetries);
                        if (runId !== state.activeRunId) return transactions;
                        continue;
                    }
                }
                throw new Error(`Transactions request failed (${response.status})`);
            }

            rateLimitWaits = 0;
            transientRetries = 0;
            pagesFetched += 1;

            const data = response.json;
            const pageData = Array.isArray(data && data.data) ? data.data : [];
            if (!pageData.length) break;

            let foundKnown = false;
            for (const transaction of pageData) {
                const hash = transaction && transaction.idHash != null ? String(transaction.idHash) : '';
                if (hash && seenHashes.has(hash)) {
                    foundKnown = true;
                    continue;
                }
                if (hash) seenHashes.add(hash);
                transactions.push(transaction);
            }

            scanned += pageData.length;
            if (reportProgress) reportProgress(scanned);

            const nextCursor = data && data.nextPageCursor;
            if (!nextCursor) break;
            currentCursor = nextCursor;

            if (stopWhenSeen && foundKnown) break;

            const headroomDelay = getRateLimitDelayMs(response.meta);
            if (headroomDelay > 0) {
                state.rateLimitUntil = Date.now() + headroomDelay;
                await waitWithProgress(headroomDelay, runId);
                if (runId !== state.activeRunId) return transactions;
                state.rateLimitUntil = 0;
                continue;
            }

            await wait(API_CALL_DELAY_MS);
        }

        return transactions;
    }

    function computeTotals(transactions) {
        let spent = 0;
        let earned = 0;

        for (const transaction of transactions) {
            if (!transaction || !transaction.transactionType) continue;
            const amount = Number(transaction.currency && transaction.currency.amount) || 0;
            if (!Number.isFinite(amount)) continue;

            if (transaction.transactionType === 'Purchase') {
                spent += Math.abs(amount);
            } else if (transaction.transactionType === 'Sale') {
                earned += Math.abs(amount);
            }
        }

        return {
            spent: Math.round(spent),
            earned: Math.round(earned),
            net: Math.round(earned - spent),
            calculatedAt: Date.now()
        };
    }

    function readCache() {
        return new Promise(function (resolve) {
            chrome.storage.local.get(CACHE_KEY, function (data) {
                const cache = data && data[CACHE_KEY];
                if (!cache || !cache.userId) return resolve(null);
                if (String(cache.userId) !== String(state.userId)) return resolve(null);
                if (!cache.result) return resolve(null);
                resolve(cache);
            });
        });
    }

    function writeCache(result, seen) {
        return new Promise(function (resolve) {
            chrome.storage.local.set({
                [CACHE_KEY]: {
                    userId: state.userId,
                    timestamp: Date.now(),
                    result,
                    seen: {
                        Purchase: Array.from(seen.Purchase || []),
                        Sale: Array.from(seen.Sale || [])
                    }
                }
            }, resolve);
        });
    }

    function rowsPresent(tables) {
        if (!tables) return false;
        const has = (table, key) => !!table.querySelector(`tr.${ROW_CLASS}[data-purpura-tse="${key}"]`);
        return has(tables.purchases, 'section-header') && has(tables.sales, 'section-header') &&
            has(tables.purchases, 'spent') && has(tables.sales, 'earned') && has(tables.sales, 'net');
    }

    async function runScan() {
        if (!state.enabled || !isTransactionsPage() || state.isScanning) return;
        ensureStyles();

        const tables = getSummaryTables();
        if (!tables) return;

        try {
            await fetchAuthenticatedUserId();
        } catch (error) {
            state.lastScanAt = Date.now();
            renderErrorRows((error && error.message) ? error.message : 'Unknown error');
            return;
        }

        const cache = await readCache();
        if (cache && cache.result) state.lastResult = cache.result;

        const recentlyAttempted = state.lastScanAt > 0 && (Date.now() - state.lastScanAt) < MIN_RESCAN_INTERVAL_MS;
        if (!state.forceScan && recentlyAttempted && rowsPresent(tables)) {
            return;
        }
        state.forceScan = false;

        state.activeRunId += 1;
        const runId = state.activeRunId;
        state.isScanning = true;
        state.scannedCount = 0;
        state.lastPaintAt = 0;
        state.rateLimitUntil = 0;
        renderLoadingRows(false);

        const previous = cache && cache.result ? cache.result : { spent: 0, earned: 0, net: 0 };
        const incremental = !!(cache && cache.result);
        const seen = {
            Purchase: new Set(cache && cache.seen && Array.isArray(cache.seen.Purchase) ? cache.seen.Purchase : []),
            Sale: new Set(cache && cache.seen && Array.isArray(cache.seen.Sale) ? cache.seen.Sale : [])
        };

        let scannedBefore = 0;

        try {
            const newTransactions = [];
            for (const type of TRANSACTION_TYPES) {
                if (runId !== state.activeRunId) return;
                const pageData = await fetchTransactionType(state.userId, type, runId, {
                    seen: seen[type],
                    stopWhenSeen: incremental,
                    maxPages: incremental ? INCREMENTAL_MAX_PAGES : MAX_PAGES_TO_FETCH,
                    onProgress: function (scanned) {
                        state.scannedCount = scannedBefore + scanned;
                        paintProgress(false);
                    }
                });
                if (runId !== state.activeRunId) return;
                scannedBefore = state.scannedCount;
                state.rateLimitUntil = 0;
                paintProgress(true);
                newTransactions.push(...pageData);
            }

            if (runId !== state.activeRunId) return;

            const delta = computeTotals(newTransactions);
            const spent = Math.round((Number(previous.spent) || 0) + delta.spent);
            const earned = Math.round((Number(previous.earned) || 0) + delta.earned);
            const result = {
                spent,
                earned,
                net: Math.round(earned - spent),
                calculatedAt: Date.now()
            };

            await writeCache(result, seen);
            state.lastResult = result;
            state.lastScanAt = Date.now();
            renderResultRows(result);
        } catch (error) {
            if (runId === state.activeRunId) {
                state.lastScanAt = Date.now();
                const message = (error && error.message) ? error.message : 'Unknown error';
                if (state.lastResult) {
                    renderResultRows(state.lastResult, message);
                } else {
                    renderErrorRows(message);
                }
            }
        } finally {
            if (runId === state.activeRunId) {
                state.isScanning = false;
                state.rateLimitUntil = 0;
            }
        }
    }

    function scheduleScan(force) {
        if (!state.enabled || !isTransactionsPage()) return;
        if (force === true) state.forceScan = true;
        if (state.scanTimer) clearTimeout(state.scanTimer);
        state.scanTimer = setTimeout(function () {
            state.scanTimer = null;
            runScan();
        }, 100);
    }

    function startObserver(force) {
        if (state.observer || !document.body) {
            scheduleScan(force);
            return;
        }
        state.observer = new MutationObserver(function () {
            scheduleScan(false);
        });
        state.observer.observe(document.body, { childList: true, subtree: true, attributes: true });
        scheduleScan(force);
    }

    function stopObserver() {
        if (state.observer) {
            state.observer.disconnect();
            state.observer = null;
        }
        if (state.scanTimer) {
            clearTimeout(state.scanTimer);
            state.scanTimer = null;
        }
        state.activeRunId += 1;
        state.isScanning = false;
        state.forceScan = true;
    }

    function onRouteOrStateChange() {
        if (!state.enabled || !isTransactionsPage()) {
            stopObserver();
            return;
        }
        startObserver(true);
    }

    function setEnabled(enabled) {
        state.enabled = !!enabled;
        onRouteOrStateChange();
    }

    function installNavigationHooks() {
        const notify = () => {
            setTimeout(onRouteOrStateChange, 0);
        };
        const originalPushState = history.pushState;
        history.pushState = function () {
            const result = originalPushState.apply(this, arguments);
            notify();
            return result;
        };
        const originalReplaceState = history.replaceState;
        history.replaceState = function () {
            const result = originalReplaceState.apply(this, arguments);
            notify();
            return result;
        };
        window.addEventListener('popstate', onRouteOrStateChange);
        window.addEventListener('pageshow', onRouteOrStateChange);
        document.addEventListener('visibilitychange', function () {
            if (!document.hidden) onRouteOrStateChange();
        });
    }

    chrome.storage.onChanged.addListener(function (changes, areaName) {
        if (areaName !== 'sync') return;
        if (!Object.prototype.hasOwnProperty.call(changes, STORAGE_KEY)) return;
        setEnabled(!!changes[STORAGE_KEY].newValue);
    });

    installNavigationHooks();

    window.__PurpuraSettings.ready.then(function () {
        setEnabled(!!window.__PurpuraSettings.get(STORAGE_KEY));
    });
}
