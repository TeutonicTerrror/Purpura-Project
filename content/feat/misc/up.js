/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
if (!window.purpuraUnpendingRobuxInitialized) {
window.purpuraUnpendingRobuxInitialized = true;
function t(e, t) {
return chrome.i18n.getMessage(e, t) || e;
}
const e = "up";
const n = "td.summary-transaction-pending-text.text-disabled";
const r = "purpura-unpending-row";
const a = "purpura-unpending-style";
const i = 100;
const o = 2e3;
const s = 5;
const u = 50;
const c = 24 * 60 * 60 * 1e3;
const l = t("unpending_label");
const d = t("unpending_calculating");
const p = t("unpending_gathering");
const f = t("unpending_rateLimit");
const m = t("unpending_tooltip");
const g = t("unpending_insufficient");
const h = t("unpending_insufficientTooltip");
const b = {
enabled: false,
observer: null,
userId: null,
activeRunId: 0,
cache: null,
scanTimer: null
};
function setAmountCellText(e, t, n) {
if (!e) return;
e.innerHTML = "";
const r = document.createElement("span");
r.className = t;
r.textContent = n;
e.appendChild(r);
}
function isTransactionsPage() {
return window.location.pathname.toLowerCase().includes("/transactions");
}
function wait(e) {
return new Promise(t => setTimeout(t, e));
}
function parseTimestamp(e) {
if (!e) return null;
const t = new Date(e);
if (Number.isNaN(t.getTime())) return null;
return t;
}
function formatNumber(e) {
const t = Number(e);
if (!Number.isFinite(t)) return "0";
return Math.max(0, Math.round(t)).toLocaleString();
}
function getRateLimitDelayMs(e) {
let t = 2e3;
const n = e.get("x-ratelimit-reset");
if (!n) return t;
const r = Number(n);
if (Number.isNaN(r)) return t;
if (r > 1e9) {
t = Math.max(0, r * 1e3 - Date.now()) + 1e3;
} else {
t = r * 1e3 + 1e3;
}
return t;
}
function ensureStyles() {
if (document.getElementById(a)) return;
const e = document.createElement("style");
e.id = a;
e.textContent = ":root{--purpura-up-error-color:#ff6b6b}" + `.${r} .purpura-unpending-help {\n                cursor: help;\n                margin-left: 2px;\n            }\n\n            .${r} .purpura-unpending-error {\n                color: var(--purpura-up-error-color);\n            }\n        `;
const t = document.head || document.documentElement;
if (t) {
t.appendChild(e);
}
}
function removeEstimatorRows() {
document.querySelectorAll(`tr.${r}`).forEach(e => e.remove());
document.querySelectorAll("[data-purpura-unpending-processing]").forEach(e => e.removeAttribute("data-purpura-unpending-processing"));
document.querySelectorAll("[data-purpura-unpending-processed]").forEach(e => e.removeAttribute("data-purpura-unpending-processed"));
}
function ensureEstimatorRow(e) {
if (!e || !e.parentElement || !document.body.contains(e)) return null;
ensureStyles();
const t = e.parentElement;
let n = t.querySelector(`tr.${r}`);
if (!n) {
n = document.createElement("tr");
n.className = r;
n.innerHTML = `\n                <td class="summary-transaction-pending-text text-disabled unpending-sales">\n                    <span>${l}</span>\n                    <span class="tooltip-container">\n                        <span class="icon-clock purpura-unpending-help" aria-hidden="true"></span>\n                    </span>\n                </td>\n                <td class="amount icon-robux-container"></td>\n            `;
}
if (n.nextElementSibling !== e) {
t.insertBefore(n, e);
}
return n;
}
function setTooltip(e, t) {
if (!e) return;
const n = e.querySelector(".purpura-unpending-help");
if (n) {
n.title = t;
}
}
function renderLoading(e, t) {
const n = ensureEstimatorRow(e);
if (!n) return;
setTooltip(n, m);
const r = n.querySelector("td.amount");
if (!r) return;
const a = t === "rate_limited" ? f : t === "gathering" ? p : d;
setAmountCellText(r, "text-secondary", a);
}
function renderError(e, t) {
const n = ensureEstimatorRow(e);
if (!n) return;
setTooltip(n, m);
const r = n.querySelector("td.amount");
if (!r) return;
const a = t && typeof t === "string" ? t : "Unknown error";
setAmountCellText(r, "purpura-unpending-error", `Error: ${a}`);
}
function renderFinal(e, t) {
const n = ensureEstimatorRow(e);
if (!n) return;
const r = n.querySelector("td.amount");
if (!r) return;
if (!t || !t.hasEnoughData) {
setTooltip(n, h);
setAmountCellText(r, "text-secondary", g);
return;
}
setTooltip(n, m);
r.innerHTML = `\n            <span class="icon-robux-16x16"></span>\n            <span class="text-robux">${formatNumber(t.amount)}~</span>\n        `;
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
async function fetchTransactions(e, t, n) {
const r = [];
const a = [ {
type: "Sale",
itemPricingType: "PaidAndLimited"
}, {
type: "GroupPayout"
} ];
for (const c of a) {
let a = "";
let l = 0;
let d = 0;
while (l < o && n === b.activeRunId) {
l += 1;
const o = new URL(`https://economy.roblox.com/v2/users/${e}/transactions`);
o.searchParams.set("limit", String(i));
o.searchParams.set("transactionType", c.type);
if (c.itemPricingType) {
o.searchParams.set("itemPricingType", c.itemPricingType);
}
if (a) {
o.searchParams.set("cursor", a);
}
const p = await fetch(o.toString(), {
credentials: "include"
});
if (n !== b.activeRunId) {
return r;
}
if (p.status === 429) {
if (typeof t === "function") {
t("rate_limited");
}
const e = getRateLimitDelayMs(p.headers);
await wait(e);
l -= 1;
continue;
}
if (!p.ok) {
throw new Error(`Transactions request failed (${p.status})`);
}
if (typeof t === "function" && l > 1) {
t("gathering");
}
const f = await p.json();
const m = Array.isArray(f?.data) ? f.data : [];
if (!m.length) {
break;
}
const g = m.some(e => Object.prototype.hasOwnProperty.call(e, "isPending") && e.isPending);
if (g) {
d = 0;
} else {
d += 1;
if (d >= s) {
break;
}
}
r.push(...m);
const h = f?.nextPageCursor;
if (!h) {
break;
}
a = h;
const y = p.headers.get("x-ratelimit-remaining");
if (y) {
const e = Number(y);
if (!Number.isNaN(e) && e <= 1) {
const e = getRateLimitDelayMs(p.headers);
await wait(e);
continue;
}
}
await wait(u);
}
}
return r;
}
function inferPendingDuration(e) {
if (!Array.isArray(e) || e.length === 0) {
return null;
}
let t = Number.POSITIVE_INFINITY;
let n = 0;
const r = Date.now();
for (const a of e) {
if (!Object.prototype.hasOwnProperty.call(a, "isPending") || a.isPending) {
continue;
}
const e = parseTimestamp(a.created);
if (!e) {
continue;
}
const i = (r - e.getTime()) / (1e3 * 60 * 60 * 24);
const o = Math.ceil(i);
if (o >= 1) {
t = Math.min(t, o);
n += 1;
}
}
if (!Number.isFinite(t) || n < 2) {
return null;
}
return t;
}
function calculateUnpendingRobux(e, t) {
if (!Array.isArray(e) || e.length === 0) {
return {
amount: 0,
hasEnoughData: false
};
}
if (!e.some(e => e && e.isPending)) {
return {
amount: 0,
hasEnoughData: true
};
}
if (t === null) {
return {
amount: 0,
hasEnoughData: false
};
}
let n = 0;
const r = new Date;
const a = new Date(r);
a.setUTCDate(r.getUTCDate() + 1);
const i = a.toISOString().split("T")[0];
for (const r of e) {
if (Object.prototype.hasOwnProperty.call(r, "isPending") && !r.isPending) {
continue;
}
const e = parseTimestamp(r.created);
const a = Number(r?.currency?.amount || 0);
if (!e || !Number.isFinite(a) || a <= 0) {
continue;
}
const o = new Date(e);
o.setUTCDate(e.getUTCDate() + t);
if (o.toISOString().split("T")[0] === i) {
n += a;
}
}
return {
amount: Math.max(0, Math.round(n)),
hasEnoughData: true
};
}
function getCachedResults() {
if (!b.cache) return null;
if (!b.userId) return null;
if (b.cache.userId !== b.userId) return null;
if (Date.now() - b.cache.timestamp > c) return null;
return b.cache.result;
}
function setCachedResults(e) {
b.cache = {
userId: b.userId,
timestamp: Date.now(),
result: e
};
}
function getPendingTarget() {
return document.querySelector(n);
}
function getPendingRow(e) {
if (!e) return null;
const t = e.closest("tr");
if (t) return t;
let n = e.parentElement;
while (n && n.tagName !== "TR") {
n = n.parentElement;
}
return n;
}
async function processTarget(e) {
if (!b.enabled || !isTransactionsPage() || !e) {
return;
}
if (e.getAttribute("data-purpura-unpending-processing") === "1") {
return;
}
if (e.getAttribute("data-purpura-unpending-processed") === "1") {
return;
}
e.setAttribute("data-purpura-unpending-processing", "1");
const t = b.activeRunId;
const n = getPendingRow(e);
if (!n) {
e.removeAttribute("data-purpura-unpending-processing");
return;
}
renderLoading(n, "loading");
try {
await fetchAuthenticatedUserId();
if (t !== b.activeRunId) {
return;
}
const r = getCachedResults();
if (r) {
renderFinal(n, r);
e.setAttribute("data-purpura-unpending-processed", "1");
return;
}
const a = e => {
if (t !== b.activeRunId) return;
renderLoading(n, e);
};
const i = await fetchTransactions(b.userId, a, t);
if (t !== b.activeRunId) {
return;
}
const o = inferPendingDuration(i);
const s = calculateUnpendingRobux(i, o);
const u = {
amount: s.amount,
hasEnoughData: s.hasEnoughData,
pendingDays: o,
calculatedAt: Date.now()
};
setCachedResults(u);
renderFinal(n, u);
e.setAttribute("data-purpura-unpending-processed", "1");
} catch (e) {
const r = e && e.message ? e.message : "Unknown error";
if (t === b.activeRunId) {
renderError(n, r);
}
} finally {
e.removeAttribute("data-purpura-unpending-processing");
}
}
function scheduleScan() {
if (!b.enabled || !isTransactionsPage()) return;
if (b.scanTimer) {
clearTimeout(b.scanTimer);
}
b.scanTimer = setTimeout(() => {
b.scanTimer = null;
const e = getPendingTarget();
if (e) {
processTarget(e);
}
}, 80);
}
function startObserver() {
if (b.observer || !document.body) {
scheduleScan();
return;
}
b.observer = new MutationObserver(() => {
scheduleScan();
});
b.observer.observe(document.body, {
childList: true,
subtree: true,
characterData: true,
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
}
function onRouteOrStateChange() {
if (!b.enabled) {
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
function setEnabled(e) {
b.enabled = !!e;
b.activeRunId += 1;
onRouteOrStateChange();
}
function installNavigationHooks() {
const e = () => {
setTimeout(onRouteOrStateChange, 0);
};
const t = history.pushState;
history.pushState = function() {
const n = t.apply(this, arguments);
e();
return n;
};
const n = history.replaceState;
history.replaceState = function() {
const t = n.apply(this, arguments);
e();
return t;
};
window.addEventListener("popstate", onRouteOrStateChange);
window.addEventListener("pageshow", onRouteOrStateChange);
document.addEventListener("visibilitychange", () => {
if (!document.hidden) {
onRouteOrStateChange();
}
});
}
chrome.storage.onChanged.addListener((t, n) => {
if (n !== "sync") return;
if (!Object.prototype.hasOwnProperty.call(t, e)) return;
setEnabled(!!t[e].newValue);
});
installNavigationHooks();
window.__PurpuraSettings.ready.then(function() {
setEnabled(!!window.__PurpuraSettings.get(e));
});
}
