/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
if (!window.purpuraRobuxConversationsInitialized) {
window.purpuraRobuxConversationsInitialized = true;
const t = .0125;
const e = [ "span.text-robux-lg", "span.text-robux", "span.text-robux-tile", ".text-robux", ".text-robux-tile", ".amount.icon-robux-container", ".robux", ".robux-amount", "#nav-robux-amount", "[data-robux]", "[data-robux-value]", "[data-robux-amount]" ];
let n = null;
let r = false;
let o = false;
function toNumber(t) {
if (t == null) return null;
const e = String(t).trim().replace(/,/g, "").replace(/\s+/g, "");
const n = e.match(/^(-?\d+(?:\.\d+)?)([kKmM])?$/);
if (!n) return null;
const r = Number(n[1]);
if (!Number.isFinite(r)) return null;
const o = n[2];
if (o) {
const t = o.toLowerCase() === "k" ? 1e3 : 1e6;
return r * t;
}
return r;
}
function formatUSD(t) {
return t.toLocaleString("en-US", {
style: "currency",
currency: "USD",
maximumFractionDigits: 2
});
}
function convertRobuxToUsd(e) {
const n = toNumber(e);
return n === null ? null : n * t;
}
function tagRobuxSpan(t) {
if (!t) return;
const e = t.getAttribute("data-robux") || t.getAttribute("data-robux-value") || t.getAttribute("data-robux-amount");
const n = e || t.textContent.trim();
const r = toNumber(n);
if (r === null) return;
const o = convertRobuxToUsd(r);
if (o === null) return;
const a = `(${formatUSD(o)})`;
const u = t.nextElementSibling;
if (u && u.dataset && u.dataset.purpuraRobuxUsdInjected === "1") {
if (u.textContent !== a) {
u.textContent = a;
}
t.dataset.purpuraRobuxUsdInjected = "1";
return;
}
const c = document.createElement("span");
c.className = "text-secondary";
c.style.paddingLeft = "4px";
c.textContent = a;
c.dataset.purpuraRobuxUsdInjected = "1";
t.after(c);
t.dataset.purpuraRobuxUsdInjected = "1";
}
function scanAndInject(t = document) {
if (!r) return;
if (!t) return;
if (t.nodeType !== 1 && t.nodeType !== 9) return;
if (typeof t.querySelectorAll !== "function") return;
try {
t.querySelectorAll(e.join(", ")).forEach(t => tagRobuxSpan(t));
} catch {}
}
function removeInjected() {
document.querySelectorAll("span[data-purpura-robux-usd-injected]").forEach(t => t.remove());
}
function startObserver() {
if (n) return;
n = new MutationObserver(t => {
for (const e of t) {
try {
if (e.type === "characterData") {
const t = e.target.parentElement;
if (t) scanAndInject(t);
continue;
}
if (e.type === "attributes") {
scanAndInject(e.target);
continue;
}
if (!e.addedNodes.length) continue;
scanAndInject(e.target);
e.addedNodes.forEach(t => {
if (t.nodeType === 1) scanAndInject(t);
});
} catch {}
}
});
n.observe(document.body, {
childList: true,
subtree: true,
characterData: true,
attributes: true,
attributeFilter: [ "class", "data-robux", "data-robux-value", "data-robux-amount" ]
});
}
function stopObserver() {
if (!n) return;
n.disconnect();
n = null;
}
function watchNavigation() {
if (o) return;
o = true;
const t = () => setTimeout(() => scanAndInject(), 50);
const e = history.pushState;
const n = history.replaceState;
history.pushState = function() {
const n = e.apply(this, arguments);
t();
return n;
};
history.replaceState = function() {
const e = n.apply(this, arguments);
t();
return e;
};
window.addEventListener("popstate", t);
}
function enable() {
if (r) return;
r = true;
scanAndInject();
startObserver();
watchNavigation();
}
function disable() {
r = false;
stopObserver();
removeInjected();
}
window.__PurpuraSettings.ready.then(function() {
var t = window.__PurpuraSettings.get("rconv");
if (t !== false) enable();
});
chrome.storage.onChanged.addListener(function(t, e) {
if (e !== "sync") return;
var n = t["rconv"];
if (!n) return;
if (n.newValue !== false) {
enable();
} else {
disable();
}
});
}
