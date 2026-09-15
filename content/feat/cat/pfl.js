/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
"use strict";
if (window.__purpuraPriceFloorLoaded) return;
window.__purpuraPriceFloorLoaded = true;
var e = "pfl";
var r = ".item-price-value.icon-text-wrapper.clearfix.icon-robux-price-container";
var t = "purpura-price-floor-icon";
var n = "purpura-price-floor-tip";
var a = "purpura-price-floor-style";
var i = true;
var o = null;
var u = 0;
var l = null;
var c = location.href;
var s = new Map;
var p = new WeakMap;
var f = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>';
function d(e) {
if (e === undefined) return true;
return e === true;
}
function m(e) {
e = e || window.location.href;
try {
var r = new URL(e, window.location.origin);
var t = r.searchParams.get("PlaceId");
if (t) return t;
var n = r.pathname.match(/^(?:\/[a-z]{2}(?:-[a-z]{2})?)?\/(?:games|catalog|bundles|hidden-catalog|looks|library|game-pass|private-games)\/(\d+)/i);
if (n && n[1]) return n[1];
} catch (e) {}
var a = String(e).match(/\/(?:games|catalog|bundles|hidden-catalog|looks|library|game-pass|private-games)\/(\d+)/);
return a ? a[1] : null;
}
function v() {
return window.location.pathname.toLowerCase().indexOf("/bundles/") !== -1 ? "Bundle" : "Asset";
}
function h() {
if (document.getElementById(a)) return;
var e = document.createElement("style");
e.id = a;
e.textContent = "." + t + "{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;margin-left:6px;vertical-align:middle;border-radius:50%;background:var(--purpura-surface200,var(--color-surface-200,#2b2c32));color:var(--purpura-secondaryText,var(--color-content-muted,#a3a3a3));cursor:help;flex-shrink:0;position:relative} ." + t + "{vertical-align:text-bottom} ." + n + "{position:absolute;left:50%;bottom:100%;transform:translateX(-50%);margin-bottom:8px;min-width:220px;max-width:300px;padding:10px 12px;border-radius:8px;background:var(--purpura-surface100,var(--color-surface-100,#1f2025));border:1px solid var(--purpura-surface300,var(--color-stroke-default,rgba(255,255,255,.14)));color:var(--purpura-mainText,var(--color-content-emphasis,#fff));font-size:12px;line-height:1.45;box-shadow:0 8px 24px rgba(0,0,0,.35);z-index:9999;display:none;white-space:normal;line-height:1.45} ." + t + ":hover ." + n + ",." + t + ":focus-within ." + n + "{display:block} ." + n + " .purpura-pfl-line{display:flex;align-items:center;gap:4px;flex-wrap:wrap;line-height:1.5} ." + n + " .purpura-pfl-label{font-weight:600} ." + n + " .purpura-pfl-amount{display:inline-flex;align-items:center;gap:1px;font-weight:600;white-space:nowrap;line-height:1;vertical-align:middle;margin-left:1px} ." + n + " .purpura-pfl-amount .icon-robux-16x16{flex-shrink:0;vertical-align:middle;display:inline-block!important;transform:scale(0.75);transform-origin:center center;margin:0 -3px 0 -2px} ." + n + " .purpura-pfl-status{margin-top:4px} ." + n + " .purpura-pfl-muted{color:var(--purpura-secondaryText,var(--color-content-muted,#a3a3a3));font-size:11px;display:block;margin-top:6px;line-height:1.4}";
(document.head || document.documentElement).appendChild(e);
}
function g(e, r) {
var t = r ? r + ".roblox.com" : "www.roblox.com";
var n = "https://" + t + e;
return fetch(n, {
credentials: "include"
}).then(function(e) {
if (!e.ok) throw new Error("HTTP " + e.status);
return e.json();
});
}
function y(e, r) {
var t = r ? e.bundleType : e.assetType;
var n = e.taxonomy || [];
var a = n.some(function(e) {
return e && e.taxonomyName === "Full Masks";
});
var i = n.some(function(e) {
return e && e.taxonomyName === "Heads";
});
if (i) t = 2;
if (!t && !a) return null;
var o = !!e.isPBR;
var u = n.some(function(e) {
return e && e.taxonomyName === "Bodysuit";
});
var l = e.itemRestrictions && e.itemRestrictions.indexOf("Collectible") !== -1 ? 1 : 2;
var c = r ? "bundleType" : "assetType";
var s = "collectibleItemType=" + l + "&creationType=1&isPbr=" + o + "&isBodysuit=" + u;
if (a) s += "&categoryId=full_mask%7Cm4.1fullmask_20260224%7C6"; else s += "&" + c + "=" + t;
return s;
}
function b(e) {
return '<span class="purpura-pfl-amount"><span class="icon-robux-16x16"></span>' + Number(e).toLocaleString() + "</span>";
}
function x(e, r, a, i) {
if (e.querySelector("." + t)) return;
var o = document.createElement("div");
o.className = t;
if (!i) o.style.verticalAlign = "text-bottom";
o.setAttribute("tabindex", "0");
o.setAttribute("role", "img");
o.setAttribute("aria-label", chrome.i18n.getMessage("settings_priceFloor_label") || "Price Floor");
o.innerHTML = f;
var u = chrome.i18n.getMessage("priceFloor_label") || "Price Floor";
var l = chrome.i18n.getMessage("priceFloor_description") || "The minimum price this item can be listed for. Roblox adjusts it based on the item type and configuration.";
var c = "";
if (typeof a === "number" && !isNaN(a)) {
var s = a - r;
var p = s > 0 ? "above" : s < 0 ? "below" : "at";
var d = chrome.i18n.getMessage("priceFloor_statusTypes_" + p) || p;
if (p === "at") {
c = d;
} else {
var m = Math.abs(s);
var v = chrome.i18n.getMessage("priceFloor_difference") || "{{diff}}";
var h = v.replace("{{diff}}", b(m));
var g = chrome.i18n.getMessage("priceFloor_status") || "{{difference}} {{status}}";
c = g.replace("{{status}}", d).replace("{{difference}}", h);
}
}
var y = document.createElement("div");
y.className = n;
y.innerHTML = '<div class="purpura-pfl-line"><span class="purpura-pfl-label">' + u + "</span>" + b(r) + "</div>" + (c ? '<div class="purpura-pfl-line purpura-pfl-status">' + c + "</div>" : "") + '<span class="purpura-pfl-muted">' + l + "</span>";
o.appendChild(y);
e.appendChild(o);
e.classList.add("purpura-price-floor-container");
}
function w(e, r) {
var n = s.get(e) || [];
s.delete(e);
n.forEach(function(n) {
if (!n) return;
p.set(n, e);
if (!r || !n.isConnected || n.querySelector("." + t)) return;
x(n, r.floor, r.currentPrice, !!n.querySelector(".original-price"));
});
}
function S(e, r, t) {
var n = t === "Bundle";
g("/v1/catalog/items/" + encodeURIComponent(r) + "/details?itemType=" + t, "catalog").then(function(e) {
if (!e) return null;
var r = y(e, n);
if (!r) return null;
return g("/v1/items/price-floor?" + r, "itemconfiguration").then(function(r) {
if (!r || typeof r.priceFloor !== "number") return null;
return {
floor: r.priceFloor,
currentPrice: e.lowestPrice
};
});
}).catch(function() {
return null;
}).then(function(r) {
w(e, r);
});
}
function _(e) {
if (!e || !e.isConnected) return;
if (e.querySelector("." + t)) return;
var r = m();
if (!r) return;
var n = r + "|" + v();
if (p.get(e) === n) return;
var a = s.get(n);
if (a) {
a.push(e);
return;
}
s.set(n, [ e ]);
S(n, r, v());
}
function T(e) {
if (!i) return;
h();
var t = [];
if (e && e.nodeType === 1 && e.matches && e.matches(r)) t.push(e);
if (e && e.querySelectorAll) e.querySelectorAll(r).forEach(function(e) {
t.push(e);
}); else if (!e) document.querySelectorAll(r).forEach(function(e) {
t.push(e);
});
t.forEach(_);
if (!t.length && !e) {
document.querySelectorAll(r).forEach(_);
}
}
function E() {
if (u) clearTimeout(u);
u = setTimeout(function() {
u = 0;
T(document);
}, 120);
}
function k() {
if (o || !document.documentElement) return;
o = new MutationObserver(function(e) {
if (!i) return;
for (var r = 0; r < e.length; r++) {
var n = e[r];
if (n.addedNodes && n.addedNodes.length) {
E();
return;
}
var a = n.removedNodes || [];
for (var o = 0; o < a.length; o++) {
var u = a[o];
if (u.nodeType !== 1) continue;
var l = u.classList && u.classList.contains(t);
if (!l && u.querySelector) l = !!u.querySelector("." + t);
if (l) {
p.delete(n.target);
E();
return;
}
}
}
});
o.observe(document.documentElement, {
childList: true,
subtree: true
});
}
function M() {
if (o) {
o.disconnect();
o = null;
}
if (u) {
clearTimeout(u);
u = 0;
}
}
function P() {
var e = location.href;
if (e === c) return;
c = e;
if (i) E();
}
function C() {
if (l) return;
l = setInterval(P, 800);
}
function L() {
if (l) {
clearInterval(l);
l = null;
}
}
function F(e) {
i = !!e;
if (i) {
h();
k();
C();
E();
return;
}
M();
L();
s.clear();
p = new WeakMap;
document.querySelectorAll("." + t).forEach(function(e) {
e.remove();
});
if (document.getElementById(a)) document.getElementById(a).remove();
}
function I() {
function r() {
window.__PurpuraSettings.ready.then(function() {
F(d(window.__PurpuraSettings.get(e)));
});
}
if (!window.__PurpuraSettings) {
var t = 0;
var n = setInterval(function() {
if (window.__PurpuraSettings) {
clearInterval(n);
r();
} else if (++t > 50) clearInterval(n);
}, 100);
return;
}
r();
}
I();
chrome.storage.onChanged.addListener(function(r, t) {
if (t !== "sync" || !r[e]) return;
I();
});
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", function() {
if (i) E();
}, {
once: true
});
} else if (i) E();
k();
C();
var q = history.pushState.bind(history);
history.pushState = function() {
var e = q.apply(this, arguments);
P();
return e;
};
var N = history.replaceState.bind(history);
history.replaceState = function() {
var e = N.apply(this, arguments);
P();
return e;
};
window.addEventListener("popstate", P);
})();
