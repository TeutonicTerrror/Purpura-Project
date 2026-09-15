/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
if (!window.purpuraTotalSpentInitialized) {
window.purpuraTotalSpentInitialized = true;
function t(e, t) {
return chrome.i18n.getMessage(e, t) || e;
}
const e = "tse";
const r = "purpura_tse_cache";
const n = "purpura-tse-row";
const s = "purpura-tse-style";
const a = 100;
const o = 2e3;
const u = 60;
const c = 60 * 60 * 1e3;
const i = [ "Purchase", "Sale" ];
const l = t("tse_totalSpent");
const d = t("tse_totalEarned");
const f = t("tse_net");
const m = t("tse_calculating");
const p = t("tse_scanning");
const h = t("tse_error");
const g = t("tse_lifetime");
const y = t("tse_amount");
const b = {
enabled: false,
observer: null,
scanTimer: null,
userId: null,
activeRunId: 0,
isScanning: false,
renderedKey: null
};
function wait(e) {
return new Promise(t => setTimeout(t, e));
}
function formatNumber(e) {
const t = Number(e);
if (!Number.isFinite(t)) return "0";
return Math.max(0, Math.round(t)).toLocaleString();
}
function getRateLimitDelayMs(e) {
let t = 2e3;
const r = e.get("x-ratelimit-reset");
if (!r) return t;
const n = Number(r);
if (Number.isNaN(n)) return t;
if (n > 1e9) {
t = Math.max(0, n * 1e3 - Date.now()) + 1e3;
} else {
t = n * 1e3 + 1e3;
}
return t;
}
function isTransactionsPage() {
return window.location.pathname.toLowerCase().includes("/transactions");
}
function ensureStyles() {
if (document.getElementById(s)) return;
const e = document.createElement("style");
e.id = s;
e.textContent = ":root{--purpura-tse-error-color:#ff6b6b}" + `.${n} .purpura-tse-error{color:var(--purpura-tse-error-color)}`;
const t = document.head || document.documentElement;
if (t) t.appendChild(e);
}
function getSummaryTables() {
let e = Array.prototype.slice.call(document.querySelectorAll("#transactions-web-app .summary table"));
if (!e.length) {
e = Array.prototype.slice.call(document.querySelectorAll("table"));
e = e.filter(e => e.querySelector("td.summary-transaction-label, td.summary-transaction-pending-text"));
}
if (!e.length) return null;
const t = e => {
if (e.querySelector(".summary-transaction-pending-text")) return true;
const t = e.querySelector("td.summary-transaction-label");
return !!t && /sales/i.test((t.textContent || "").slice(0, 100));
};
const r = e.find(t) || e[0];
const n = e.find(e => e !== r) || e[0];
return {
sales: r,
purchases: n
};
}
function getOrCreateRow(e, t, r) {
if (!e) return null;
let s = e.querySelector(`tr.${n}[data-purpura-tse="${t}"]`);
if (s && document.body.contains(s)) return s;
s = document.createElement("tr");
s.className = n;
s.setAttribute("data-purpura-tse", t);
s.innerHTML = `\n            <td class="summary-transaction-label">${r}</td>\n            <td class="amount icon-robux-container"></td>\n        `;
const a = e.querySelector("tbody") || e;
a.appendChild(s);
return s;
}
function getOrCreateSectionHeader(e) {
if (!e) return null;
let t = e.querySelector(`tr.${n}[data-purpura-tse="section-header"]`);
if (t && document.body.contains(t)) return t;
t = document.createElement("tr");
t.className = `${n} border-bottom`;
t.setAttribute("data-purpura-tse", "section-header");
t.innerHTML = `<th class="outgoing-robux-label">${g}</th><th class="amount">${y}</th>`;
const r = e.querySelector("tbody") || e;
const s = e.querySelector(`tr.${n}[data-purpura-tse]`);
if (s) {
r.insertBefore(t, s);
} else {
r.appendChild(t);
}
return t;
}
function setAmountCell(e, t) {
if (!e) return;
const r = e.querySelector("td.amount");
if (!r) return;
r.innerHTML = t;
}
function setTextCell(e, t, r) {
if (!e) return;
const n = e.querySelector("td.amount");
if (!n) return;
n.innerHTML = "";
const s = document.createElement("span");
s.className = t;
s.textContent = r;
n.appendChild(s);
}
function renderRobux(e, t) {
setAmountCell(e, `<span class="icon-robux-16x16"></span><span class="text-robux">${formatNumber(t)}</span>`);
}
function renderLoadingRows(e) {
const t = getSummaryTables();
if (!t) return;
getOrCreateSectionHeader(t.purchases);
getOrCreateSectionHeader(t.sales);
const r = e ? p : m;
setTextCell(getOrCreateRow(t.purchases, "spent", l), "text-secondary", r);
setTextCell(getOrCreateRow(t.sales, "earned", d), "text-secondary", r);
setTextCell(getOrCreateRow(t.sales, "net", f), "text-secondary", r);
}
function renderResultRows(e) {
const t = getSummaryTables();
if (!t) return;
getOrCreateSectionHeader(t.purchases);
getOrCreateSectionHeader(t.sales);
renderRobux(getOrCreateRow(t.purchases, "spent", l), e.spent);
renderRobux(getOrCreateRow(t.sales, "earned", d), e.earned);
renderRobux(getOrCreateRow(t.sales, "net", f), e.net);
b.renderedKey = String(e.calculatedAt || 0);
}
function renderErrorRows(e) {
const t = getSummaryTables();
if (!t) return;
getOrCreateSectionHeader(t.purchases);
getOrCreateSectionHeader(t.sales);
const r = e && typeof e === "string" ? e : "Unknown error";
setTextCell(getOrCreateRow(t.purchases, "spent", l), "purpura-tse-error", `${h}: ${r}`);
setTextCell(getOrCreateRow(t.sales, "earned", d), "purpura-tse-error", `${h}: ${r}`);
setTextCell(getOrCreateRow(t.sales, "net", f), "purpura-tse-error", `${h}: ${r}`);
b.renderedKey = "error";
}
async function fetchAuthenticatedUserId() {
if (b.userId) return b.userId;
const e = await fetch("https://users.roblox.com/v1/users/authenticated", {
credentials: "include"
});
if (!e.ok) {
throw new Error(`Failed to fetch user (${e.status})`);
}
const t = await e.json();
if (!t || !t.id) {
throw new Error("Could not resolve authenticated user ID");
}
b.userId = t.id;
return b.userId;
}
async function fetchTransactionType(e, t, r) {
const n = [];
let s = "";
let c = 0;
const i = new Set;
while (c < o && r === b.activeRunId) {
c += 1;
if (s) {
if (i.has(s)) break;
i.add(s);
}
const o = new URL(`https://economy.roblox.com/v2/users/${e}/transactions`);
o.searchParams.set("limit", String(a));
o.searchParams.set("transactionType", t);
if (s) {
o.searchParams.set("cursor", s);
}
const l = await fetch(o.toString(), {
credentials: "include"
});
if (r !== b.activeRunId) return n;
if (l.status === 429) {
const e = getRateLimitDelayMs(l.headers);
await wait(e);
c -= 1;
continue;
}
if (!l.ok) {
throw new Error(`Transactions request failed (${l.status})`);
}
const d = await l.json();
const f = Array.isArray(d && d.data) ? d.data : [];
if (!f.length) break;
n.push(...f);
const m = d && d.nextPageCursor;
if (!m) break;
s = m;
const p = l.headers.get("x-ratelimit-remaining");
if (p) {
const e = Number(p);
if (!Number.isNaN(e) && e <= 1) {
await wait(getRateLimitDelayMs(l.headers));
continue;
}
}
await wait(u);
}
return n;
}
function computeTotals(e) {
let t = 0;
let r = 0;
for (const n of e) {
if (!n || !n.transactionType) continue;
const e = Number(n.currency && n.currency.amount) || 0;
if (!Number.isFinite(e)) continue;
if (n.transactionType === "Purchase") {
t += Math.abs(e);
} else if (n.transactionType === "Sale") {
r += Math.abs(e);
}
}
return {
spent: Math.round(t),
earned: Math.round(r),
net: Math.round(r - t),
calculatedAt: Date.now()
};
}
function getCachedResults() {
return new Promise(function(e) {
chrome.storage.local.get(r, function(t) {
const n = t && t[r];
if (!n || !n.userId) return e(null);
if (n.userId !== b.userId) return e(null);
if (Date.now() - n.timestamp > c) return e(null);
e(n.result);
});
});
}
function setCachedResults(e) {
chrome.storage.local.set({
[r]: {
userId: b.userId,
timestamp: Date.now(),
result: e
}
});
}
function rowsPresent(e) {
if (!e) return false;
const t = (e, t) => !!e.querySelector(`tr.${n}[data-purpura-tse="${t}"]`);
return t(e.purchases, "section-header") && t(e.sales, "section-header") && t(e.purchases, "spent") && t(e.sales, "earned") && t(e.sales, "net");
}
function renderIfNeeded(e) {
const t = String(e && e.calculatedAt || 0);
const r = getSummaryTables();
if (b.renderedKey !== t || !rowsPresent(r)) {
renderResultRows(e);
}
}
async function runScan() {
if (!b.enabled || !isTransactionsPage() || b.isScanning) return;
ensureStyles();
const e = getSummaryTables();
if (!e) return;
try {
await fetchAuthenticatedUserId();
} catch (e) {
if (b.renderedKey !== "error") {
renderErrorRows(e && e.message ? e.message : "Unknown error");
}
return;
}
const t = await getCachedResults();
if (t) {
renderIfNeeded(t);
return;
}
if (b.renderedKey === "error") return;
b.activeRunId += 1;
const r = b.activeRunId;
b.isScanning = true;
renderLoadingRows(true);
try {
const e = [];
for (const t of i) {
if (r !== b.activeRunId) return;
const n = await fetchTransactionType(b.userId, t, r);
e.push(...n);
}
if (r !== b.activeRunId) return;
const t = computeTotals(e);
setCachedResults(t);
renderResultRows(t);
} catch (e) {
if (r === b.activeRunId) {
renderErrorRows(e && e.message ? e.message : "Unknown error");
}
} finally {
if (r === b.activeRunId) {
b.isScanning = false;
}
}
}
function scheduleScan() {
if (!b.enabled || !isTransactionsPage()) return;
if (b.scanTimer) clearTimeout(b.scanTimer);
b.scanTimer = setTimeout(function() {
b.scanTimer = null;
runScan();
}, 100);
}
function startObserver() {
if (b.observer || !document.body) {
scheduleScan();
return;
}
b.observer = new MutationObserver(function() {
scheduleScan();
});
b.observer.observe(document.body, {
childList: true,
subtree: true,
attributes: true
});
scheduleScan();
}
function stopObserver() {
if (b.observer) {
b.observer.disconnect();
b.observer = null;
}
if (b.scanTimer) {
clearTimeout(b.scanTimer);
b.scanTimer = null;
}
b.activeRunId += 1;
b.isScanning = false;
}
function onRouteOrStateChange() {
if (!b.enabled || !isTransactionsPage()) {
stopObserver();
return;
}
startObserver();
}
function setEnabled(e) {
b.enabled = !!e;
onRouteOrStateChange();
}
function installNavigationHooks() {
const e = () => {
setTimeout(onRouteOrStateChange, 0);
};
const t = history.pushState;
history.pushState = function() {
const r = t.apply(this, arguments);
e();
return r;
};
const r = history.replaceState;
history.replaceState = function() {
const t = r.apply(this, arguments);
e();
return t;
};
window.addEventListener("popstate", onRouteOrStateChange);
window.addEventListener("pageshow", onRouteOrStateChange);
document.addEventListener("visibilitychange", function() {
if (!document.hidden) onRouteOrStateChange();
});
}
chrome.storage.onChanged.addListener(function(t, r) {
if (r !== "sync") return;
if (!Object.prototype.hasOwnProperty.call(t, e)) return;
setEnabled(!!t[e].newValue);
});
installNavigationHooks();
window.__PurpuraSettings.ready.then(function() {
setEnabled(!!window.__PurpuraSettings.get(e));
});
}
