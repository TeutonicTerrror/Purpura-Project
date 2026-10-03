/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
if (!window.purpuraUnpendingRobuxInitialized) {
    window.purpuraUnpendingRobuxInitialized = true;
    function t(key, substitutions) { return chrome.i18n.getMessage(key, substitutions) || key; }

    const STORAGE_KEY = 'up';
    const TARGET_SELECTOR = 'td.summary-transaction-pending-text.text-disabled';
    const ESTIMATOR_ROW_CLASS = 'purpura-unpending-row';
    const ESTIMATOR_STYLE_ID = 'purpura-unpending-style';
    const API_LIMIT = 100;
    const MAX_PAGES_TO_FETCH = 2000;
    const MAX_PAGES_WITHOUT_PENDING = 5;
    const API_CALL_DELAY_MS = 50;
    const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

    const LABEL_TEXT = t('unpending_label');
    const LOADING_TEXT = t('unpending_calculating');
    const GATHERING_TEXT = t('unpending_gathering');
    const RATE_LIMIT_TEXT = t('unpending_rateLimit');
    const TOOLTIP_TEXT = t('unpending_tooltip');
    const INSUFFICIENT_DATA_TEXT = t('unpending_insufficient');
    const INSUFFICIENT_DATA_TOOLTIP = t('unpending_insufficientTooltip');

    const state = {
        enabled: false,
        observer: null,
        userId: null,
        activeRunId: 0,
        cache: null,
        scanTimer: null
    };

    function setAmountCellText(amountCell, className, text) {
        if (!amountCell) return;
        amountCell.innerHTML = '';
        const span = document.createElement('span');
        span.className = className;
        span.textContent = text;
        amountCell.appendChild(span);
    }

    function isTransactionsPage() {
        return window.location.pathname.toLowerCase().includes('/transactions');
    }

    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function parseTimestamp(timestampStr) {
        if (!timestampStr) return null;
        const dt = new Date(timestampStr);
        if (Number.isNaN(dt.getTime())) return null;
        return dt;
    }

    function formatNumber(value) {
        const n = Number(value);
        if (!Number.isFinite(n)) return '0';
        return Math.max(0, Math.round(n)).toLocaleString();
    }

    function getRateLimitDelayMs(headers) {
        let delayMs = 2000;
        const resetHeader = headers.get('x-ratelimit-reset');
        if (!resetHeader) return delayMs;

        const resetVal = Number(resetHeader);
        if (Number.isNaN(resetVal)) return delayMs;

        if (resetVal > 1000000000) {
            delayMs = Math.max(0, (resetVal * 1000) - Date.now()) + 1000;
        } else {
            delayMs = (resetVal * 1000) + 1000;
        }

        return delayMs;
    }

    function ensureStyles() {
        if (document.getElementById(ESTIMATOR_STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = ESTIMATOR_STYLE_ID;
        style.textContent = ':root{--purpura-up-error-color:#ff6b6b}' +
            `.${ESTIMATOR_ROW_CLASS} .purpura-unpending-help {
                cursor: help;
                margin-left: 2px;
            }

            .${ESTIMATOR_ROW_CLASS} .purpura-unpending-error {
                color: var(--purpura-up-error-color);
            }
        `;

        const root = document.head || document.documentElement;
        if (root) {
            root.appendChild(style);
        }
    }

    function removeEstimatorRows() {
        document.querySelectorAll(`tr.${ESTIMATOR_ROW_CLASS}`).forEach(row => row.remove());
        document.querySelectorAll('[data-purpura-unpending-processing]').forEach(el => el.removeAttribute('data-purpura-unpending-processing'));
        document.querySelectorAll('[data-purpura-unpending-processed]').forEach(el => el.removeAttribute('data-purpura-unpending-processed'));
    }

    function ensureEstimatorRow(pendingRow) {
        if (!pendingRow || !pendingRow.parentElement || !document.body.contains(pendingRow)) return null;

        ensureStyles();

        const container = pendingRow.parentElement;
        let row = container.querySelector(`tr.${ESTIMATOR_ROW_CLASS}`);

        if (!row) {
            row = document.createElement('tr');
            row.className = ESTIMATOR_ROW_CLASS;
            row.innerHTML = `
                <td class="summary-transaction-pending-text text-disabled unpending-sales">
                    <span>${LABEL_TEXT}</span>
                    <span class="tooltip-container">
                        <span class="icon-clock purpura-unpending-help" aria-hidden="true"></span>
                    </span>
                </td>
                <td class="amount icon-robux-container"></td>
            `;
        }

        if (row.nextElementSibling !== pendingRow) {
            container.insertBefore(row, pendingRow);
        }

        return row;
    }

    function setTooltip(row, text) {
        if (!row) return;
        const help = row.querySelector('.purpura-unpending-help');
        if (help) {
            help.title = text;
        }
    }

    function renderLoading(pendingRow, mode) {
        const row = ensureEstimatorRow(pendingRow);
        if (!row) return;

        setTooltip(row, TOOLTIP_TEXT);

        const amountCell = row.querySelector('td.amount');
        if (!amountCell) return;

        const text = mode === 'rate_limited'
            ? RATE_LIMIT_TEXT
            : (mode === 'gathering' ? GATHERING_TEXT : LOADING_TEXT);

        setAmountCellText(amountCell, 'text-secondary', text);
    }

    function renderError(pendingRow, message) {
        const row = ensureEstimatorRow(pendingRow);
        if (!row) return;

        setTooltip(row, TOOLTIP_TEXT);

        const amountCell = row.querySelector('td.amount');
        if (!amountCell) return;

        const safeMessage = message && typeof message === 'string' ? message : 'Unknown error';
        setAmountCellText(amountCell, 'purpura-unpending-error', `Error: ${safeMessage}`);
    }

    function renderFinal(pendingRow, result) {
        const row = ensureEstimatorRow(pendingRow);
        if (!row) return;

        const amountCell = row.querySelector('td.amount');
        if (!amountCell) return;

        if (!result || !result.hasEnoughData) {
            setTooltip(row, INSUFFICIENT_DATA_TOOLTIP);
            setAmountCellText(amountCell, 'text-secondary', INSUFFICIENT_DATA_TEXT);
            return;
        }

        setTooltip(row, TOOLTIP_TEXT);
        amountCell.innerHTML = `
            <span class="icon-robux-16x16"></span>
            <span class="text-robux">${formatNumber(result.amount)}~</span>
        `;
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

    async function fetchTransactions(userId, statusCallback, runId) {
        const allTransactionsData = [];
        const transactionConfigs = [
            { type: 'Sale', itemPricingType: 'PaidAndLimited' },
            { type: 'GroupPayout' }
        ];

        for (const config of transactionConfigs) {
            let currentCursor = '';
            let pagesFetched = 0;
            let consecutivePagesWithoutPendingSales = 0;

            while (pagesFetched < MAX_PAGES_TO_FETCH && runId === state.activeRunId) {
                pagesFetched += 1;

                const endpoint = new URL(`https://economy.roblox.com/v2/users/${userId}/transactions`);
                endpoint.searchParams.set('limit', String(API_LIMIT));
                endpoint.searchParams.set('transactionType', config.type);
                if (config.itemPricingType) {
                    endpoint.searchParams.set('itemPricingType', config.itemPricingType);
                }
                if (currentCursor) {
                    endpoint.searchParams.set('cursor', currentCursor);
                }

                const response = await fetch(endpoint.toString(), {
                    credentials: 'include'
                });

                if (runId !== state.activeRunId) {
                    return allTransactionsData;
                }

                if (response.status === 429) {
                    if (typeof statusCallback === 'function') {
                        statusCallback('rate_limited');
                    }
                    const delayMs = getRateLimitDelayMs(response.headers);
                    await wait(delayMs);
                    pagesFetched -= 1;
                    continue;
                }

                if (!response.ok) {
                    throw new Error(`Transactions request failed (${response.status})`);
                }

                if (typeof statusCallback === 'function' && pagesFetched > 1) {
                    statusCallback('gathering');
                }

                const data = await response.json();
                const pageData = Array.isArray(data?.data) ? data.data : [];

                if (!pageData.length) {
                    break;
                }

                const foundPendingSale = pageData.some(transaction => (
                    Object.prototype.hasOwnProperty.call(transaction, 'isPending') && transaction.isPending
                ));

                if (foundPendingSale) {
                    consecutivePagesWithoutPendingSales = 0;
                } else {
                    consecutivePagesWithoutPendingSales += 1;
                    if (consecutivePagesWithoutPendingSales >= MAX_PAGES_WITHOUT_PENDING) {
                        break;
                    }
                }

                allTransactionsData.push(...pageData);

                const nextCursor = data?.nextPageCursor;
                if (!nextCursor) {
                    break;
                }

                currentCursor = nextCursor;

                const remainingHeader = response.headers.get('x-ratelimit-remaining');
                if (remainingHeader) {
                    const remaining = Number(remainingHeader);
                    if (!Number.isNaN(remaining) && remaining <= 1) {
                        const delayMs = getRateLimitDelayMs(response.headers);
                        await wait(delayMs);
                        continue;
                    }
                }

                await wait(API_CALL_DELAY_MS);
            }
        }

        return allTransactionsData;
    }

    function inferPendingDuration(transactionsList) {
        if (!Array.isArray(transactionsList) || transactionsList.length === 0) {
            return null;
        }

        let minDaysObserved = Number.POSITIVE_INFINITY;
        let completedCount = 0;
        const nowMs = Date.now();

        for (const transaction of transactionsList) {
            if (!Object.prototype.hasOwnProperty.call(transaction, 'isPending') || transaction.isPending) {
                continue;
            }

            const createdDt = parseTimestamp(transaction.created);
            if (!createdDt) {
                continue;
            }

            const daysDifference = (nowMs - createdDt.getTime()) / (1000 * 60 * 60 * 24);
            const daysRoundedUp = Math.ceil(daysDifference);

            if (daysRoundedUp >= 1) {
                minDaysObserved = Math.min(minDaysObserved, daysRoundedUp);
                completedCount += 1;
            }
        }

        if (!Number.isFinite(minDaysObserved) || completedCount < 2) {
            return null;
        }

        return minDaysObserved;
    }

    function calculateUnpendingRobux(transactionsList, pendingDaysToUse) {
        if (!Array.isArray(transactionsList) || transactionsList.length === 0) {
            return { amount: 0, hasEnoughData: false };
        }

        if (!transactionsList.some(transaction => transaction && transaction.isPending)) {
            return { amount: 0, hasEnoughData: true };
        }

        if (pendingDaysToUse === null) {
            return { amount: 0, hasEnoughData: false };
        }

        let totalUnpendingTomorrow = 0;
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setUTCDate(now.getUTCDate() + 1);
        const tomorrowUTCDateString = tomorrow.toISOString().split('T')[0];

        for (const transaction of transactionsList) {
            if (Object.prototype.hasOwnProperty.call(transaction, 'isPending') && !transaction.isPending) {
                continue;
            }

            const createdDt = parseTimestamp(transaction.created);
            const amount = Number(transaction?.currency?.amount || 0);

            if (!createdDt || !Number.isFinite(amount) || amount <= 0) {
                continue;
            }

            const estimatedUnpendingDt = new Date(createdDt);
            estimatedUnpendingDt.setUTCDate(createdDt.getUTCDate() + pendingDaysToUse);

            if (estimatedUnpendingDt.toISOString().split('T')[0] === tomorrowUTCDateString) {
                totalUnpendingTomorrow += amount;
            }
        }

        return {
            amount: Math.max(0, Math.round(totalUnpendingTomorrow)),
            hasEnoughData: true
        };
    }

    function getCachedResults() {
        if (!state.cache) return null;
        if (!state.userId) return null;
        if (state.cache.userId !== state.userId) return null;
        if ((Date.now() - state.cache.timestamp) > CACHE_TTL_MS) return null;
        return state.cache.result;
    }

    function setCachedResults(result) {
        state.cache = {
            userId: state.userId,
            timestamp: Date.now(),
            result
        };
    }

    function getPendingTarget() {
        return document.querySelector(TARGET_SELECTOR);
    }

    function getPendingRow(targetElement) {
        if (!targetElement) return null;
        const row = targetElement.closest('tr');
        if (row) return row;

        let parent = targetElement.parentElement;
        while (parent && parent.tagName !== 'TR') {
            parent = parent.parentElement;
        }

        return parent;
    }

    async function processTarget(targetElement) {
        if (!state.enabled || !isTransactionsPage() || !targetElement) {
            return;
        }

        if (targetElement.getAttribute('data-purpura-unpending-processing') === '1') {
            return;
        }

        if (targetElement.getAttribute('data-purpura-unpending-processed') === '1') {
            return;
        }

        targetElement.setAttribute('data-purpura-unpending-processing', '1');

        const runId = state.activeRunId;
        const pendingRow = getPendingRow(targetElement);
        if (!pendingRow) {
            targetElement.removeAttribute('data-purpura-unpending-processing');
            return;
        }

        renderLoading(pendingRow, 'loading');

        try {
            await fetchAuthenticatedUserId();
            if (runId !== state.activeRunId) {
                return;
            }

            const cached = getCachedResults();
            if (cached) {
                renderFinal(pendingRow, cached);
                targetElement.setAttribute('data-purpura-unpending-processed', '1');
                return;
            }

            const statusCallback = (status) => {
                if (runId !== state.activeRunId) return;
                renderLoading(pendingRow, status);
            };

            const transactions = await fetchTransactions(state.userId, statusCallback, runId);
            if (runId !== state.activeRunId) {
                return;
            }

            const pendingDaysToUse = inferPendingDuration(transactions);
            const unpendingResult = calculateUnpendingRobux(transactions, pendingDaysToUse);
            const finalResults = {
                amount: unpendingResult.amount,
                hasEnoughData: unpendingResult.hasEnoughData,
                pendingDays: pendingDaysToUse,
                calculatedAt: Date.now()
            };

            setCachedResults(finalResults);
            renderFinal(pendingRow, finalResults);
            targetElement.setAttribute('data-purpura-unpending-processed', '1');
        } catch (error) {
            const message = (error && error.message) ? error.message : 'Unknown error';
            if (runId === state.activeRunId) {
                renderError(pendingRow, message);
            }
        } finally {
            targetElement.removeAttribute('data-purpura-unpending-processing');
        }
    }

    function scheduleScan() {
        if (!state.enabled || !isTransactionsPage()) return;
        if (state.scanTimer) {
            clearTimeout(state.scanTimer);
        }

        state.scanTimer = setTimeout(() => {
            state.scanTimer = null;
            const target = getPendingTarget();
            if (target) {
                processTarget(target);
            }
        }, 80);
    }

    function startObserver() {
        if (state.observer || !document.body) {
            scheduleScan();
            return;
        }

        state.observer = new MutationObserver(() => {
            scheduleScan();
        });

        state.observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true
        });

        scheduleScan();
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
    }

    function onRouteOrStateChange() {
        if (!state.enabled) {
            stopObserver();
            removeEstimatorRows();
            return;
        }

        if (!isTransactionsPage()) {
            stopObserver();
            removeEstimatorRows();
            return;
        }

        startObserver();
    }

    function setEnabled(enabled) {
        state.enabled = !!enabled;
        state.activeRunId += 1;
        onRouteOrStateChange();
    }

    function installNavigationHooks() {
        const notify = () => {
            setTimeout(onRouteOrStateChange, 0);
        };

        const originalPushState = history.pushState;
        history.pushState = function() {
            const result = originalPushState.apply(this, arguments);
            notify();
            return result;
        };

        const originalReplaceState = history.replaceState;
        history.replaceState = function() {
            const result = originalReplaceState.apply(this, arguments);
            notify();
            return result;
        };

        window.addEventListener('popstate', onRouteOrStateChange);
        window.addEventListener('pageshow', onRouteOrStateChange);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                onRouteOrStateChange();
            }
        });
    }

    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== 'sync') return;
        if (!Object.prototype.hasOwnProperty.call(changes, STORAGE_KEY)) return;
        setEnabled(!!changes[STORAGE_KEY].newValue);
    });

    installNavigationHooks();

    window.__PurpuraSettings.ready.then(function() {
        setEnabled(!!window.__PurpuraSettings.get(STORAGE_KEY));
    });
}
