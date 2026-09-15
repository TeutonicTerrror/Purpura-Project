/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
"use strict";
if (window.purpuraRemainingRobuxInitialized) return;
window.purpuraRemainingRobuxInitialized = true;
const t = "rr";
const e = "purpura-remaining-robux-style";
const n = "purpura-remaining-robux-container";
const r = ".modal-content, .unified-purchase-dialog-content, .foundation-web-dialog-content";
let i = false;
let o = null;
let a = 0;
let c = null;
let u = 0;
const s = 3e4;
const l = new Map;
let d = 0;
function f(t, e) {
const n = Math.floor(e);
l.set(t, n);
d = n;
}
(function t() {
const e = window.fetch;
window.fetch = function(t, n) {
const r = typeof t === "string" ? t : t instanceof Request ? t.url : "";
const o = e(t, n);
o.then(function(t) {
if (!t || !t.ok) return;
try {
if (r.includes("/marketplace-items/v1/items/details")) {
t.clone().json().then(function(t) {
if (t && Array.isArray(t.data)) {
for (var e = 0; e < t.data.length; e++) {
var n = t.data[e];
var r = n.price || n.lowestPrice || n.priceInRobux || 0;
if (r > 0 && n.id) {
f("item-" + n.id, r);
}
}
}
if (d > 0 && i) C();
}).catch(function() {});
} else if (r.includes("/game-passes/v1/game-passes/") && r.includes("/product-info")) {
var e = r.match(/\/game-passes\/(\d+)/);
if (e) {
var n = e[1];
t.clone().json().then(function(t) {
var e = t && (t.PriceInRobux || t.priceInRobux || t.price || 0);
if (e > 0) {
f("gamepass-" + n, e);
if (i) C();
}
}).catch(function() {});
}
} else if (r.includes("economy.roblox.com") && r.includes("/assets/") && r.includes("/details")) {
var e = r.match(/\/assets\/(\d+)/);
if (e) {
var o = e[1];
t.clone().json().then(function(t) {
var e = t && (t.PriceInRobux || t.price || 0);
if (e > 0) {
f("item-" + o, e);
if (i) C();
}
}).catch(function() {});
}
} else if (r.includes("/v1/catalog/items/") && r.includes("/details")) {
var e = r.match(/\/items\/(\d+)\/details/);
if (e) {
var a = e[1];
t.clone().json().then(function(t) {
var e = t && (t.PriceInRobux || t.price || t.priceInRobux || 0);
if (e > 0) {
f("item-" + a, e);
if (i) C();
}
}).catch(function() {});
}
}
} catch (t) {}
}).catch(function() {});
return o;
};
})();
function m() {
const t = window.location.pathname;
if (!t) return null;
let e = t.match(/\/catalog\/(\d+)/);
if (e) return {
type: "item",
id: e[1]
};
e = t.match(/\/game-pass\/(\d+)/);
if (e) return {
type: "gamepass",
id: e[1]
};
return null;
}
function p(t) {
if (!t) return null;
const e = [ "data-item-id", "data-asset-id", "data-product-id", "data-gamepass-id", "data-itemid", "data-assetid", "data-productid", "data-gamepassid" ];
for (const n of e) {
const e = t.getAttribute(n);
if (e && /^\d+$/.test(e)) {
return {
type: n.includes("gamepass") ? "gamepass" : "item",
id: e
};
}
}
const n = t.querySelectorAll('img[src*="asset"], img[src*="game-pass"], img[src*="avatar"], img[src*="catalog"]');
for (const t of n) {
const e = t.getAttribute("src") || "";
const n = e.match(/\/(?:asset|game-pass|avatar|item)s?\/(\d+)/i) || e.match(/[?&]id=(\d+)/);
if (n) return {
type: "item",
id: n[1]
};
}
return null;
}
function h(t) {
const e = m();
if (e) {
const t = e.type === "gamepass" ? "gamepass-" + e.id : "item-" + e.id;
const n = l.get(t);
if (n && n > 0) return n;
}
const n = p(t);
if (n) {
const t = n.type === "gamepass" ? "gamepass-" + n.id : "item-" + n.id;
const e = l.get(t);
if (e && e > 0) return e;
}
return d;
}
function g(t) {
if (typeof t === "number" && Number.isFinite(t)) {
return t > 0 ? Math.floor(t) : 0;
}
const e = String(t || "").replace(/\u00A0/g, " ");
const n = e.match(/\d{1,3}(?:,\d{3})+|\d+/g);
if (!n) return 0;
return n.map(t => parseInt(t.replace(/,/g, ""), 10)).filter(t => Number.isFinite(t) && t > 0).reduce((t, e) => e < t ? e : t, Infinity);
}
function y(t) {
const e = Number(t);
if (!Number.isFinite(e)) return "0";
return e.toLocaleString();
}
function x(t) {
if (!t) return null;
var e = t.querySelector("#rbx-unified-purchase-heading, .purchase-heading, .modal-header h2, .dialog-header h2");
if (e) {
var n = e.querySelector(".text-robux, .text-robux-lg, .text-robux-md");
if (n) {
var r = g(n.textContent);
if (r > 0) return r;
}
}
var i = t.querySelector('#user-balance, [data-testid*="user-balance"], .user-balance');
if (i) {
var o = i.querySelector(".text-robux, .text-robux-lg");
if (o) {
var r = g(o.textContent);
if (r > 0) return r;
}
}
return null;
}
async function b() {
const t = document.querySelector('meta[name="user-data"]');
if (t) {
const e = t.getAttribute("data-userid");
if (e && /^\d+$/.test(e)) return e;
}
try {
const t = await fetch("https://users.roblox.com/v1/users/authenticated", {
credentials: "include"
});
if (!t.ok) return null;
const e = await t.json();
return e && e.id ? String(e.id) : null;
} catch {
return null;
}
}
var v = null;
async function w() {
if (c !== null && Date.now() - u < s) {
return c;
}
if (v) return v;
v = (async () => {
try {
const t = await b();
if (!t) return c;
const e = await fetch(`https://economy.roblox.com/v1/users/${t}/currency`, {
credentials: "include"
});
if (!e.ok) return c;
const n = await e.json();
const r = Number(n && n.robux);
if (Number.isFinite(r)) {
c = Math.floor(r);
u = Date.now();
return c;
}
return c;
} catch {
return c;
} finally {
v = null;
}
})();
return v;
}
function S(t) {
if (!t) return 0;
const e = h(t);
if (e > 0) return e;
const n = t.querySelector("#rbx-unified-purchase-heading, .purchase-heading, .modal-header h2, .dialog-header h2");
const r = t.querySelector('[data-testid="purchase-total-price"], [data-testid*="purchase-total"], [data-testid*="price"], .purchase-total-price');
if (r) {
const t = g(r.textContent);
if (t > 0) return t;
}
const i = t.querySelectorAll(".text-robux-lg, .text-robux, .text-robux-md");
for (const t of i) {
if (n && n.contains(t)) continue;
const e = g(t.textContent);
if (e > 0) return e;
}
const o = t.querySelectorAll(".icon-robux-container, .amount");
for (const t of o) {
if (n && n.contains(t)) continue;
const e = g(t.textContent);
if (e > 0) return e;
}
return 0;
}
function q(t) {
if (!i || !t || !document.body.contains(t)) return;
const e = S(t);
if (!e || e <= 0) return;
const r = t.querySelector(".min-w-0.flex.flex-col.gap-small, " + ".purchase-info-container, " + ".modal-message, " + ".modal-body, " + ".foundation-web-dialog-body");
if (!r) return;
let o = t.querySelector(`.${n}`);
if (!o) {
o = document.createElement("div");
o.className = n;
o.style.cssText = "width:100%;margin-top:8px;padding-top:8px;border-top:1px solid var(--purpura-rr-divider);";
r.appendChild(o);
}
const a = () => {
if (!i || !o.isConnected) return;
const e = S(t);
if (!e || e <= 0) return;
const n = c !== null ? c - e : null;
if (n === null) {
o.innerHTML = `\n                    <span class="text-body-medium" style="color:var(--purpura-rr-text-secondary);font-size:13px;">\n                        Loading your Robux balance...\n                    </span>`;
} else {
o.innerHTML = `\n                    <span class="text-body-medium" style="color:var(--purpura-rr-text-secondary);font-size:13px;">\n                        Your balance after this transaction will be\n                        <span class="icon-robux-16x16" style="vertical-align: middle; position: relative; top: -1px;"></span>\n                        <span class="text-robux" style="${n < 0 ? "color:var(--purpura-rr-negative);" : ""}font-weight:600;">\n                            ${y(n)}\n                        </span>\n                    </span>`;
}
};
var u = x(t);
if (u !== null) {
c = u;
a();
return;
}
a();
w().then(function(t) {
if (t !== null) c = t;
if (o.isConnected) a();
});
}
function R() {
if (document.getElementById(e)) return;
const t = document.createElement("style");
t.id = e;
t.textContent = ":root{--purpura-rr-divider:rgba(110,118,138,0.35);--purpura-rr-text-secondary:rgba(215,221,236,0.9);--purpura-rr-negative:#d32f2f}" + `.${n} {\n                animation: purpuraRemainingRobuxFadeIn 0.18s ease-out;\n            }\n\n            @keyframes purpuraRemainingRobuxFadeIn {\n                from { opacity: 0; transform: translateY(4px); }\n                to { opacity: 1; transform: translateY(0); }\n            }\n        `;
(document.head || document.documentElement).appendChild(t);
}
function A(t = document) {
if (!t || typeof t.querySelectorAll !== "function") return;
document.querySelectorAll(`.${n}`).forEach(t => {
if (!t.isConnected || !t.closest(r)) {
t.remove();
}
});
const e = [];
if (t.nodeType === 1 && t.matches && t.matches(r)) {
e.push(t);
}
t.querySelectorAll(r).forEach(t => e.push(t));
const i = new Set;
e.forEach(t => {
if (i.has(t)) return;
i.add(t);
q(t);
});
}
function C() {
if (a) clearTimeout(a);
a = setTimeout(() => {
a = 0;
A();
}, 60);
}
function I() {
if (o || !document.documentElement) return;
o = new MutationObserver(() => {
if (!i) return;
C();
});
o.observe(document.documentElement, {
childList: true,
subtree: true
});
}
function E() {
if (o) {
o.disconnect();
o = null;
}
if (a) {
clearTimeout(a);
a = 0;
}
}
function $(t) {
i = !!t;
if (i) {
R();
I();
C();
return;
}
E();
document.querySelectorAll(`.${n}`).forEach(t => t.remove());
c = null;
u = 0;
}
function L() {
window.__PurpuraSettings.ready.then(function() {
const e = window.__PurpuraSettings.get(t);
$(e === true);
});
}
chrome.storage.onChanged.addListener((e, n) => {
if (n !== "sync") return;
if (!Object.prototype.hasOwnProperty.call(e, t)) return;
L();
});
L();
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", () => {
if (i) C();
}, {
once: true
});
} else {
if (i) C();
}
})();
