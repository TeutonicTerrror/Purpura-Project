/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
"use strict";
if (window.__purpuraOilpLoaded) return;
window.__purpuraOilpLoaded = true;
var e = "oilp";
var t = "purpura-oilp-style";
var r = "purpura-oilp-icon";
var a = "purpura-oilp-tip";
var n = "purpura-oilp-text";
var i = "purpuraOilp";
var o = "purpuraOilpDetail";
var l = true;
var c = null;
var u = 0;
var s = null;
var f = location.href;
var d = new Set;
var p = new Map;
var m = new Map;
var v = new Map;
var h = new Map;
var g = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>';
function y(e) {
if (e === undefined) return true;
return e === true;
}
function x(e) {
e = e || window.location.href;
try {
var t = new URL(e, window.location.origin);
var r = t.searchParams.get("PlaceId");
if (r) return r;
var a = t.pathname.match(/^(?:\/[a-z]{2}(?:-[a-z]{2})?)?\/(?:games|catalog|bundles|hidden-catalog|looks|library|game-pass|private-games)\/(\d+)/i);
if (a && a[1]) return a[1];
} catch (e) {}
var n = String(e).match(/\/(?:games|catalog|bundles|hidden-catalog|looks|library|game-pass|private-games)\/(\d+)/);
return n ? n[1] : null;
}
function w(e) {
if (!e) return "Asset";
return e.toLowerCase().indexOf("/bundles/") !== -1 ? "Bundle" : "Asset";
}
function b(e) {
return e && (e.isOffSale === true || e.noPriceStatus === "OffSale" || e.priceStatus === "Off Sale" || e.isPurchasable === false);
}
function S() {
if (document.getElementById(t)) return;
var e = document.createElement("style");
e.id = t;
e.textContent = "." + r + "{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;margin-left:6px;vertical-align:middle;border-radius:50%;background:var(--purpura-surface200,var(--color-surface-200,#2b2c32));color:var(--purpura-secondaryText,var(--color-content-muted,#a3a3a3));cursor:help;flex-shrink:0;position:relative} ." + a + "{position:absolute;left:50%;bottom:100%;transform:translateX(-50%);margin-bottom:8px;min-width:200px;max-width:300px;padding:10px 12px;border-radius:8px;background:var(--purpura-surface100,var(--color-surface-100,#1f2025));border:1px solid var(--purpura-surface300,var(--color-stroke-default,rgba(255,255,255,.14)));color:var(--purpura-mainText,var(--color-content-emphasis,#fff));font-size:12px;line-height:1.45;box-shadow:0 8px 24px rgba(0,0,0,.35);z-index:9999;display:none;white-space:normal} ." + r + ":hover ." + a + ",." + r + ":focus-within ." + a + "{display:block} ." + n + "{margin-top:5px;font-size:12px;color:var(--purpura-secondaryText,var(--color-content-muted,#a3a3a3));display:flex;align-items:center;gap:4px;flex-wrap:wrap;line-height:1.45} ." + n + " .icon-robux-16x16{flex-shrink:0;vertical-align:middle;display:inline-block!important;transform:scale(0.75);transform-origin:center center;margin:0 -3px 0 -2px} ." + a + " .purpura-oilp-line{display:flex;align-items:center;gap:4px;flex-wrap:wrap;line-height:1.5} ." + a + " .purpura-oilp-amount{display:inline-flex;align-items:center;gap:1px;font-weight:600;white-space:nowrap;line-height:1;vertical-align:middle;margin-left:1px} ." + a + " .purpura-oilp-amount .icon-robux-16x16{flex-shrink:0;vertical-align:middle;display:inline-block!important;transform:scale(0.75);transform-origin:center center;margin:0 -3px 0 -2px}";
(document.head || document.documentElement).appendChild(e);
}
function E(e, t, r) {
var a = t ? t + ".roblox.com" : "www.roblox.com";
var n = "https://" + a + e;
var i = {
credentials: "include"
};
if (r && r.method) i.method = r.method;
if (r && r.body) {
i.headers = {
"Content-Type": "application/json"
};
i.body = typeof r.body === "string" ? r.body : JSON.stringify(r.body);
}
return fetch(n, i).then(function(e) {
if (!e.ok) throw new Error("HTTP " + e.status);
return e.json();
});
}
function C(e) {
return '<span class="purpura-oilp-amount"><span class="icon-robux-16x16"></span>' + Number(e).toLocaleString() + "</span>";
}
function q(e) {
try {
var t = new Date(e);
if (isNaN(t.getTime()) || t.getFullYear() < 2e3) return null;
return t.toLocaleDateString(undefined, {
year: "numeric",
month: "long",
day: "numeric"
});
} catch (e) {
return null;
}
}
function A(e, t, n) {
if (!e || e.querySelector("." + r)) return;
S();
var i = document.createElement("div");
i.className = r;
i.setAttribute("tabindex", "0");
i.setAttribute("role", "img");
i.setAttribute("aria-label", "Previous Price");
i.innerHTML = g;
var o = n && q(n);
var l = o ? q(n) : null;
var c = C(t);
var u = document.createElement("div");
u.className = a;
if (l) {
var s = chrome.i18n.getMessage("oilp_lastOnSale") || "Last on sale";
var f = chrome.i18n.getMessage("oilp_for") || "for";
u.innerHTML = '<div class="purpura-oilp-line">' + s + " " + l + " " + f + " " + c + "</div>";
} else {
var d = chrome.i18n.getMessage("oilp_previousPrice") || "Previous Price:";
u.innerHTML = '<div class="purpura-oilp-line">' + d + " " + c + "</div>";
}
i.appendChild(u);
e.appendChild(i);
}
function O(e, t, r) {
if (!e || e.querySelector("." + n)) return;
S();
var a = document.createElement("div");
a.className = n;
var i = r && q(r);
var o = i ? q(r) : null;
if (o) {
var l = chrome.i18n.getMessage("oilp_lastOnSale") || "Last on sale";
var c = chrome.i18n.getMessage("oilp_for") || "for";
a.appendChild(document.createTextNode(l + " " + o + " " + c + " "));
} else {
var u = chrome.i18n.getMessage("oilp_previousPrice") || "Previous Price:";
a.appendChild(document.createTextNode(u + " "));
}
var s = document.createElement("span");
s.className = "icon-robux-16x16";
a.appendChild(s);
var f = document.createElement("span");
f.textContent = Number(t).toLocaleString();
f.style.fontWeight = "600";
a.appendChild(f);
e.appendChild(a);
}
function L(e, t) {
var a = p.get(t);
var n = m.get(t);
var i = v.get(t);
if (!n || a === undefined || a === null || a <= 1) return;
if (e.matches && e.matches(".price-container-text")) {
O(e, a, i);
return;
}
var o = e.querySelector(".text-overflow.item-card-price, .item-card-price");
if (!o) {
var l = e.querySelector(".item-card-caption");
if (l) {
var c = document.createElement("div");
c.className = "text-overflow item-card-price font-header-2 text-subheader margin-top-none";
var u = document.createElement("span");
u.className = "text text-label text-robux-tile";
u.textContent = chrome.i18n.getMessage("oilp_offSale") || "Off Sale";
c.appendChild(u);
l.appendChild(c);
o = c;
}
}
if (o && !o.querySelector("." + r)) A(o, a, i);
}
function P(e) {
if (!e || !e.isConnected) return;
if (e.dataset[i]) return;
var t = e.querySelector(".item-card-link") || e.querySelector('a[href*="/catalog/"]') || e.querySelector('a[href*="/bundles/"]') || e.querySelector('a[href*="/library/"]');
if (!t) return;
var a = t.getAttribute("href") || "";
var n = a.match(/\/(?:catalog|bundles|hidden-catalog|looks|library|game-pass|private-games)\/(\d+)/i);
if (!n) return;
var o = parseInt(n[1], 10);
if (!o) return;
var l = e.querySelector(".text-overflow.item-card-price, .item-card-price");
var c = false;
if (!l) c = true; else {
var u = (l.textContent || "").trim().toLowerCase();
var s = !!l.querySelector(".icon-robux-tile, .icon-robux, .icon-robux-16x16");
if (!s || u.indexOf("off sale") !== -1 || u.indexOf("offsale") !== -1) c = true;
}
if (!c) return;
if (p.has(o) && m.get(o)) {
L(e, o);
e.dataset[i] = "done";
return;
}
if (e.querySelector("." + r)) {
e.dataset[i] = "done";
return;
}
if (!h.has(o)) h.set(o, []);
var f = h.get(o);
if (f.indexOf(e) === -1) f.push(e);
T(o, w(a));
}
function T(e, t) {
var r = e + "|" + t;
if (d.has(r)) return;
d.add(r);
E("/v1/catalog/items/" + encodeURIComponent(e) + "/details?itemType=" + t, "catalog").then(function(t) {
if (!t) return;
var r = t.price != null ? t.price : t.lowestPrice;
if (r != null) p.set(e, r);
m.set(e, b(t));
if (t.offSaleDeadline) v.set(e, t.offSaleDeadline);
if (h.has(e)) {
var a = h.get(e);
h.delete(e);
a.forEach(function(t) {
if (t && t.isConnected) L(t, e);
if (t) t.dataset[i] = "done";
});
}
}).catch(function() {
if (h.has(e)) {
var t = h.get(e);
t.forEach(function(e) {
if (e) e.dataset[i] = "fail";
});
}
}).finally(function() {
d.delete(r);
});
}
function _(e) {
if (!e || e.dataset[o]) return;
e.dataset[o] = "true";
var t = x();
if (!t) return;
var r = parseInt(t, 10);
if (!r) return;
var a = window.location.pathname.toLowerCase().indexOf("/bundles/") !== -1 ? "Bundle" : "Asset";
var n = r + "|" + a;
if (d.has(n)) {
if (!h.has(r)) h.set(r, []);
var i = h.get(r);
if (i.indexOf(e) === -1) i.push(e);
return;
}
var l = p.has(r) && p.get(r) > 1;
var c = v.has(r);
if (l && c) {
L(e, r);
return;
}
d.add(n);
if (!h.has(r)) h.set(r, []);
var u = h.get(r);
if (u.indexOf(e) === -1) u.push(e);
E("/v1/catalog/items/" + encodeURIComponent(r) + "/details?itemType=" + a, "catalog").then(function(t) {
if (!t) return;
var a = t.price != null ? t.price : t.lowestPrice;
if (a != null) p.set(r, a);
m.set(r, b(t));
if (t.offSaleDeadline) v.set(r, t.offSaleDeadline);
var n = m.get(r);
var i = p.get(r);
if (n && i != null && i > 1) {
if (h.has(r)) {
var o = h.get(r);
h.delete(r);
o.forEach(function(e) {
if (e && e.isConnected) L(e, r);
});
} else {
L(e, r);
}
} else {
h.delete(r);
}
}).catch(function() {
h.delete(r);
}).finally(function() {
d.delete(n);
});
}
function I(e) {
if (!l) return;
S();
var t = [];
if (e && e.nodeType === 1) {
if (e.matches && e.matches(".item-card")) t.push(e);
if (e.querySelectorAll) e.querySelectorAll(".item-card").forEach(function(e) {
t.push(e);
});
}
if ((!e || t.length === 0) && !e) {
document.querySelectorAll(".item-card").forEach(function(e) {
t.push(e);
});
} else if (e && e.querySelectorAll && t.length === 0) {
e.querySelectorAll(".item-card").forEach(function(e) {
t.push(e);
});
}
t.forEach(P);
}
function M(e) {
if (!l) return;
S();
var t = [];
if (e && e.nodeType === 1) {
if (e.matches && e.matches(".price-container-text")) t.push(e);
if (e.querySelectorAll) e.querySelectorAll(".price-container-text").forEach(function(e) {
t.push(e);
});
if (e.querySelectorAll) e.querySelectorAll(".item-price-value.icon-text-wrapper.clearfix.icon-robux-price-container").forEach(function(e) {
var r = e.closest(".price-container-text") || e.parentElement;
if (r && t.indexOf(r) === -1) t.push(r);
});
} else if (!e) {
document.querySelectorAll(".price-container-text").forEach(function(e) {
t.push(e);
});
}
t.forEach(_);
var r = document.getElementById("offsale-since-date");
if (r) r.style.display = "none";
}
function k(e) {
if (!l) return;
I(e);
M(e);
if (!e) {
var t = document.getElementById("offsale-since-date");
if (t) t.style.display = "none";
}
}
function N() {
if (u) clearTimeout(u);
u = setTimeout(function() {
u = 0;
k(document);
}, 120);
}
function B() {
if (c || !document.documentElement) return;
c = new MutationObserver(function(e) {
if (!l) return;
var t = false;
for (var r = 0; r < e.length; r++) {
var a = e[r];
if (a.addedNodes && a.addedNodes.length) {
t = true;
break;
}
if (a.target && a.target.id === "offsale-since-date") t = true;
}
if (t) N();
var n = document.getElementById("offsale-since-date");
if (n && n.style.display !== "none") n.style.display = "none";
});
c.observe(document.documentElement, {
childList: true,
subtree: true
});
}
function z() {
if (c) {
c.disconnect();
c = null;
}
if (u) {
clearTimeout(u);
u = 0;
}
}
function D() {
var e = location.href;
if (e === f) return;
f = e;
if (l) N();
}
function H() {
if (s) return;
s = setInterval(D, 800);
}
function j() {
if (s) {
clearInterval(s);
s = null;
}
}
function R(e) {
l = !!e;
if (l) {
S();
B();
H();
N();
return;
}
z();
j();
document.querySelectorAll("." + r).forEach(function(e) {
e.remove();
});
document.querySelectorAll("." + n).forEach(function(e) {
e.remove();
});
document.querySelectorAll("[data-" + i + "]").forEach(function(e) {
try {
delete e.dataset[i];
} catch (t) {
e.removeAttribute("data-" + i);
}
});
document.querySelectorAll("[data-" + o + "]").forEach(function(e) {
try {
delete e.dataset[o];
} catch (t) {
e.removeAttribute("data-" + o);
}
});
h.clear();
if (document.getElementById(t)) document.getElementById(t).remove();
var a = document.getElementById("offsale-since-date");
if (a) a.style.display = "";
}
function U() {
function t() {
window.__PurpuraSettings.ready.then(function() {
R(y(window.__PurpuraSettings.get(e)));
});
}
if (!window.__PurpuraSettings) {
var r = 0;
var a = setInterval(function() {
if (window.__PurpuraSettings) {
clearInterval(a);
t();
} else if (++r > 50) clearInterval(a);
}, 100);
return;
}
t();
}
U();
chrome.storage.onChanged.addListener(function(t, r) {
if (r !== "sync" || !t[e]) return;
U();
});
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", function() {
if (l) N();
}, {
once: true
});
} else if (l) N();
B();
H();
var F = history.pushState.bind(history);
history.pushState = function() {
var e = F.apply(this, arguments);
D();
return e;
};
var J = history.replaceState.bind(history);
history.replaceState = function() {
var e = J.apply(this, arguments);
D();
return e;
};
window.addEventListener("popstate", D);
})();
