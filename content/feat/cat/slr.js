/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
function t(t, e) {
return chrome.i18n.getMessage(t, e) || t;
}
if (window.purpuraSaveLotsRobuxInitialized) return;
window.purpuraSaveLotsRobuxInitialized = true;
const e = "slr";
const n = "slr-place-id";
const r = "purpura-save-lots-robux-style";
const o = "purpura-save-lots-robux-button";
const a = "purpura-save-lots-robux-dialog-overlay";
const i = "purpura-save-lots-robux-dialog";
const s = "purpura-save-lots-robux-dialog-title";
const c = "purpura-save-lots-robux-dialog-message";
const u = "purpura-save-lots-robux-dialog-input";
const l = "purpura-save-lots-robux-dialog-actions";
const d = "purpura-save-lots-robux-dialog-btn";
const f = "purpura-save-lots-robux-dialog-error";
const p = ".modal-content, .unified-purchase-dialog-content, .foundation-web-dialog-content";
const m = .4;
const b = .1;
const h = .1;
const g = new Set([ "GET", "POST", "PUT", "PATCH", "DELETE", "HEAD" ]);
let y = false;
let x = null;
let v = 0;
let w = null;
let S = "";
let E = "";
let k = false;
let T = null;
let A = null;
let C = null;
const I = new Map;
const P = new Map;
function N(t) {
if (t === null || t === undefined) return [];
const e = String(t).replace(/\u00A0/g, " ");
const n = e.match(/\d{1,3}(?:,\d{3})+|\d+/g);
if (!n) return [];
return n.map(t => parseInt(t.replace(/,/g, ""), 10)).filter(t => Number.isFinite(t) && t > 0);
}
function $(t) {
if (typeof t === "number" && Number.isFinite(t)) {
return t > 0 ? Math.floor(t) : 0;
}
const e = N(t);
return e.length ? e[0] : 0;
}
function L(t) {
const e = Number(t);
if (!Number.isFinite(e)) return "0";
return e.toLocaleString();
}
function j(t) {
if (!t) return "";
return t.split(/\s+/).filter(function(t) {
if (!t || t === o) return false;
if (t.indexOf("opacity-[") === 0) return false;
if (t.indexOf("group/") === 0) return false;
if (t.indexOf("focus-visible:") === 0) return false;
if (t.indexOf("disabled:") === 0) return false;
if (t.indexOf("cursor-") === 0) return false;
if (t === "clip") return false;
if (t === "bg-action-emphasis" || t === "bg-action-standard" || t === "bg-action-secondary") return false;
if (t === "content-action-emphasis" || t === "content-action-standard") return false;
return true;
}).join(" ");
}
function D(t) {
return String(t || "").toLowerCase() === "gamepass" ? b : m;
}
function q(t) {
if (!Array.isArray(t) || !t.length) return "";
return t.map(t => {
const e = String(t && t.type ? t.type : "").toLowerCase();
const n = String(t && t.id ? t.id : "").trim();
const r = Number(t && t.price);
return `${e}:${n}:${Number.isFinite(r) ? r : 0}`;
}).join("|");
}
function z(t = {}) {
Et();
var e = t.mode === "prompt" ? "prompt" : t.mode === "alert" ? "alert" : "confirm";
var n = typeof t.title === "string" && t.title.trim() ? t.title.trim() : "Robux Saver";
var r = typeof t.message === "string" ? t.message : "";
var o = typeof t.confirmText === "string" && t.confirmText.trim() ? t.confirmText.trim() : e === "alert" ? "OK" : "Continue";
var f = typeof t.cancelText === "string" && t.cancelText.trim() ? t.cancelText.trim() : "Cancel";
var p = typeof t.initialValue === "string" ? t.initialValue : "";
var m = typeof t.placeholder === "string" ? t.placeholder : "";
return new Promise(function(t) {
if (!document.body) {
if (e === "prompt") t(null); else if (e === "confirm") t(false); else t(undefined);
return;
}
var b = document.activeElement instanceof HTMLElement ? document.activeElement : null;
var h = document.createElement("div");
h.className = a;
var g = document.createElement("div");
g.className = i + " mode-" + e;
var y = document.createElement("h3");
y.className = s;
y.textContent = n;
var x = document.createElement("div");
x.className = c;
x.textContent = r;
g.appendChild(y);
g.appendChild(x);
var v = null;
if (e === "prompt") {
v = document.createElement("input");
v.type = "text";
v.className = u;
v.value = p;
v.autocomplete = "off";
v.placeholder = m;
g.appendChild(v);
}
var w = document.createElement("div");
w.className = l;
if (e !== "alert") {
var S = document.createElement("button");
S.type = "button";
S.className = d + " cancel";
S.textContent = f;
S.addEventListener("click", function() {
T(e === "prompt" ? null : false);
});
w.appendChild(S);
}
var E = document.createElement("button");
E.type = "button";
E.className = d + " confirm";
E.textContent = o;
E.addEventListener("click", function() {
if (e === "prompt") {
T(v ? v.value : "");
} else if (e === "confirm") {
T(true);
} else {
T(undefined);
}
});
w.appendChild(E);
g.appendChild(w);
h.appendChild(g);
document.body.appendChild(h);
var k = false;
function T(e) {
if (k) return;
k = true;
document.removeEventListener("keydown", A, true);
if (h.parentNode) {
h.parentNode.removeChild(h);
}
if (b && typeof b.focus === "function") {
b.focus();
}
t(e);
}
function A(t) {
if (!h.isConnected) return;
if (t.key === "Escape") {
t.preventDefault();
T(e === "prompt" ? null : e === "confirm" ? false : undefined);
return;
}
if (t.key === "Enter" && !t.shiftKey) {
t.preventDefault();
if (e === "prompt") {
T(v ? v.value : "");
} else if (e === "confirm") {
T(true);
} else {
T(undefined);
}
}
}
h.addEventListener("click", function(t) {
if (t.target === h) {
T(e === "prompt" ? null : e === "confirm" ? false : undefined);
}
});
document.addEventListener("keydown", A, true);
if (e === "prompt" && v) {
v.focus();
v.select();
} else {
E.focus();
}
});
}
function M(t) {
const e = String(t || "").toLowerCase();
let n = e.match(/\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?catalog\/(\d+)/i);
if (n) {
return {
id: n[1],
type: "asset"
};
}
n = e.match(/\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?bundles\/(\d+)/i);
if (n) {
return {
id: n[1],
type: "bundle"
};
}
n = e.match(/\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?game-pass\/(\d+)/i);
if (n) {
return {
id: n[1],
type: "gamepass"
};
}
return null;
}
function R(t) {
if (!t) return null;
const e = t.closest(".store-card, .item-card, .list-item, .catalog-item-card, .game-pass-item, .cart-item-container")?.querySelector('a[href*="/catalog/"], a[href*="/bundles/"], a[href*="/game-pass/"]');
if (!e) return null;
const n = e.getAttribute("href") || "";
let r = n.match(/\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?catalog\/(\d+)/i);
if (r) return {
id: r[1],
type: "asset"
};
r = n.match(/\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?bundles\/(\d+)/i);
if (r) return {
id: r[1],
type: "bundle"
};
r = n.match(/\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?game-pass\/(\d+)/i);
if (r) return {
id: r[1],
type: "gamepass"
};
return null;
}
function O() {
const t = document.querySelector('meta[name="user-data"]');
if (!t) return null;
const e = t.getAttribute("data-userid");
if (!e || !/^\d+$/.test(e)) return null;
return e;
}
async function G() {
const t = O();
if (t) return t;
const e = await fetch("https://users.roblox.com/v1/users/authenticated", {
credentials: "include"
});
if (!e.ok) {
throw new Error(`Failed to fetch user (${e.status})`);
}
const n = await e.json();
if (!n || !n.id) {
throw new Error("Could not resolve authenticated user ID");
}
return String(n.id);
}
async function F(t) {
if (!t) return null;
const e = await fetch(`https://economy.roblox.com/v1/users/${t}/currency`, {
credentials: "include"
});
if (!e.ok) {
return null;
}
const n = await e.json();
const r = Number(n && n.robux);
if (!Number.isFinite(r)) return null;
return Math.floor(r);
}
function _(t) {
if (!t) return null;
return t.querySelector('[data-testid="purchase-confirm-button"], .modal-button.btn-primary-md, #confirm-btn.btn-primary-md, a#confirm-btn, .modal-footer .btn-primary-md, .foundation-web-button[data-testid="purchase-confirm-button"], button.btn-primary-md, button.btn-primary-lg, .shopping-cart-buy-button, .PurchaseButton');
}
function H(t) {
if (!t) return null;
return t.querySelector('button[aria-label="Close"], .modal-header .close, .foundation-web-dialog-close-container button, .simplemodal-close');
}
function U(t, e) {
if (!t) return null;
const n = e ? e.parentElement : null;
if (n) return n;
return t.querySelector(".modal-footer .modal-buttons, .modal-footer, .dialog-footer, .purchase-modal-footer");
}
function B() {
const t = document.querySelector(".shopping-cart-modal");
if (!t) return [];
const e = [];
t.querySelectorAll(".cart-item-container").forEach(t => {
const n = t.querySelector('.item-details-container a.item-name, a.item-name, a[href*="/catalog/"], a[href*="/bundles/"]');
if (!n) return;
const r = n.getAttribute("href") || "";
let o = "asset";
let a = null;
let i = r.match(/\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?catalog\/(\d+)/i);
if (i) {
a = i[1];
o = "asset";
}
i = r.match(/\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?bundles\/(\d+)/i);
if (i) {
a = i[1];
o = "bundle";
}
const s = (n.textContent || "").trim();
const c = t.querySelector(".text-robux, .item-price, .price, .text-robux-lg");
const u = $(c ? c.textContent : "");
if (!a) return;
e.push({
id: a,
type: o,
name: s,
price: u
});
});
return e;
}
function Y(t, e) {
if (!t) return "";
const n = [];
let r = t;
let o = 0;
while (r && o < 3) {
const t = r.textContent || "";
if (t.trim()) {
n.push(t.trim());
}
if (r === e) break;
r = r.parentElement;
o += 1;
}
return n.join(" ").replace(/\s+/g, " ").trim();
}
function J(t) {
const e = String(t || "").toLowerCase();
return /(\bbalance\b|\bremaining\b|after purchase|you have|\bowned\b|already own|wallet|credit|funds available|top up)/i.test(e);
}
function K(t) {
const e = String(t || "").toLowerCase();
return /(\bprice\b|\btotal\b|\bcost\b|\bpurchase\b|\bbuy\b|robux|r\$)/i.test(e);
}
function V(t, e, n = {}) {
const {requirePriceContext: r = false} = n;
const o = [];
const a = new Set;
t.querySelectorAll(e).forEach(e => {
if (a.has(e)) return;
a.add(e);
const n = (e.textContent || "").trim();
if (!n) return;
const i = Y(e, t);
if (J(i)) return;
if (r && !K(i)) return;
N(n).forEach(t => {
if (t > 0) o.push(t);
});
});
return o;
}
function Q(t, e = 0) {
if (!Array.isArray(t) || !t.length) return 0;
if (e > 0) {
let n = t[0];
let r = Math.abs(n - e);
for (let o = 1; o < t.length; o += 1) {
const a = t[o];
const i = Math.abs(a - e);
if (i < r) {
n = a;
r = i;
}
}
return n;
}
return Math.min(...t);
}
function W(t, e = {}) {
if (!t) return 0;
const n = Number(e.expectedPriceHint) || 0;
const r = $(t.getAttribute("data-purpura-expected-price"));
if (r > 0) return r;
const o = V(t, [ '[data-testid="purchase-total-price"]', '[data-testid*="purchase-total"]', '[data-testid*="price"]', ".purchase-total-price", ".modal-footer .text-robux", ".modal-message .text-robux", ".text-robux-lg", ".text-robux" ].join(", "));
const a = Q(o, n);
if (a > 0) return a;
const i = V(t, ".icon-robux-container, .amount", {
requirePriceContext: true
});
const s = Q(i, n);
if (s > 0) return s;
if (n > 0) {
return n;
}
return 0;
}
function X(t, e) {
if (w && w.name) {
return w.name;
}
const n = t.querySelector(".font-bold, strong, .item-name, .item-name-container h1, .modal-message strong, .modal-message .font-bold");
const r = (n && n.textContent ? n.textContent : "").trim();
if (r) return r;
return e;
}
function Z(t) {
const e = M(window.location.pathname);
let n = e ? e.id : null;
let r = e ? e.type : "asset";
if (!n) {
const e = R(t);
if (e) {
n = e.id;
r = e.type;
}
}
if (!n && w && Date.now() - w.timestamp < 5e3) {
n = w.itemId || n;
if (w.isGamePass) {
r = "gamepass";
}
}
if (!n) {
const e = t.querySelector("[data-item-id], [data-asset-id], [data-product-id]");
if (e) {
n = e.getAttribute("data-item-id") || e.getAttribute("data-asset-id") || n;
}
}
if (!n || !/^\d+$/.test(String(n))) {
return null;
}
if (window.location.pathname.toLowerCase().includes("/games/") && r === "asset") {
r = "gamepass";
}
const o = w && Date.now() - w.timestamp < 5e3 && w.expectedPrice > 0 ? w.expectedPrice : 0;
const a = o > 0 ? o : W(t, {
expectedPriceHint: o
});
if (!a || a <= 0) {
return null;
}
const i = D(r);
const s = Math.floor(a * i);
const c = X(t, r === "gamepass" ? "Game Pass" : "Item");
return {
itemLabel: c,
totalPrice: a,
savings: s,
entries: [ {
id: String(n),
type: r,
price: a
} ],
launchData: `${r}:${n}`
};
}
function tt(t) {
const e = t.querySelectorAll(".modal-multi-item-image-container img");
const n = B();
if (e.length < 2 && n.length < 2) {
return null;
}
if (!n.length) {
return null;
}
const r = [];
const o = [];
let a = 0;
let i = 0;
n.forEach(t => {
if (!t.id) return;
const e = t.type === "bundle" ? "bundle" : "asset";
r.push(`${e}:${t.id}`);
o.push({
id: String(t.id),
type: e,
price: Number(t.price) || 0
});
if (t.price > 0) {
a += t.price;
i += Math.floor(t.price * D(e));
}
});
if (!r.length) {
return null;
}
if (a <= 0) {
a = W(t);
i = Math.floor(a * m);
}
if (a <= 0) {
return null;
}
return {
itemLabel: `${n.length} cart item${n.length === 1 ? "" : "s"}`,
totalPrice: a,
savings: i,
entries: o,
launchData: r.join(",")
};
}
function et(t) {
const e = tt(t);
if (e) return e;
return Z(t);
}
function nt(t, e, n) {
return new Promise(r => {
t.get({
[e]: n
}, t => {
r(t[e]);
});
});
}
function rt(t, e, n) {
return new Promise(r => {
t.set({
[e]: n
}, () => {
r();
});
});
}
function ot(t, e = "GET") {
const n = String(e || "GET").trim().toUpperCase() || "GET";
const r = String(t || n).trim().toUpperCase();
return g.has(r) ? r : n;
}
function at() {
if (k) return;
k = true;
try {
const t = document.querySelector('meta[name="csrf-token"], meta[name="x-csrf-token"]');
const e = document.querySelector('meta[name="x-bound-auth-token"], meta[name="bound-auth-token"]');
if (t && typeof t.content === "string" && t.content.trim()) {
S = t.content.trim();
}
if (e && typeof e.content === "string" && e.content.trim()) {
E = e.content.trim();
}
[ "csrf-token", "x-csrf-token", "rbxBoundAuthToken", "x-bound-auth-token", "boundAuthToken" ].forEach(t => {
try {
const e = window.localStorage?.getItem(t) || window.sessionStorage?.getItem(t) || "";
if (!e || typeof e !== "string" || !e.trim()) return;
const n = e.trim();
if ((t === "csrf-token" || t === "x-csrf-token") && !S) {
S = n;
}
if ((t === "rbxBoundAuthToken" || t === "x-bound-auth-token" || t === "boundAuthToken") && !E) {
E = n;
}
} catch {}
});
} catch {}
}
function it(t) {
return new Promise(e => {
try {
chrome.runtime.sendMessage(t, t => {
if (chrome.runtime.lastError) {
e({
ok: false,
status: 0,
contentType: "",
text: ""
});
return;
}
e(t && typeof t === "object" ? t : {
ok: false,
status: 0,
contentType: "",
text: ""
});
});
} catch {
e({
ok: false,
status: 0,
contentType: "",
text: ""
});
}
});
}
async function st(t, e = {}) {
at();
const n = ot(e.method, "GET");
const r = typeof e.body === "string" ? e.body : e.body !== undefined && e.body !== null ? JSON.stringify(e.body) : "";
const o = e.headers && typeof e.headers === "object" ? e.headers : {};
const a = typeof e.accept === "string" && e.accept ? e.accept : "application/json, text/plain;q=0.9, */*;q=0.8";
const i = () => it({
type: "PURPURA_FETCH_RESOURCE_REQUEST",
url: t,
method: n,
body: r,
accept: a,
csrfToken: n === "GET" || n === "HEAD" ? "" : S,
boundAuthToken: E,
headers: o
});
let s = await i();
if (s && typeof s.csrfToken === "string" && s.csrfToken) {
S = s.csrfToken;
}
if (s && typeof s.boundAuthToken === "string" && s.boundAuthToken) {
E = s.boundAuthToken;
}
if ((!s || !s.ok) && s && s.status === 403 && n !== "GET" && n !== "HEAD") {
s = await i();
if (s && typeof s.csrfToken === "string" && s.csrfToken) {
S = s.csrfToken;
}
if (s && typeof s.boundAuthToken === "string" && s.boundAuthToken) {
E = s.boundAuthToken;
}
}
const c = s && typeof s.text === "string" ? s.text : "";
let u = null;
if (c) {
try {
u = JSON.parse(c);
} catch {}
}
return {
ok: !!(s && s.ok),
status: Number(s && s.status) || 0,
json: u,
text: c
};
}
function ct(t) {
const e = String(t || "").trim();
return /^\d+$/.test(e) ? e : "";
}
async function ut() {
if (T && A) {
return;
}
if (C) {
await C;
return;
}
C = (async () => {
try {
const [t, e] = await Promise.all([ st("https://catalog.roblox.com/v1/asset-to-subcategory", {
method: "GET"
}), st("https://catalog.roblox.com/v1/subcategories", {
method: "GET"
}) ]);
if (t.ok && t.json && typeof t.json === "object") {
T = t.json;
}
if (e.ok && e.json && typeof e.json === "object") {
const t = [ "ClassicShirts", "ClassicPants", "ClassicTShirts" ];
const n = [];
t.forEach(t => {
if (e.json[t] !== undefined) {
n.push(e.json[t]);
}
});
A = n;
}
} catch {} finally {
C = null;
}
})();
await C;
}
async function lt(t, e = "Asset") {
const n = ct(t);
if (!n) return null;
const r = `${e}:${n}`;
if (I.has(r)) {
return I.get(r);
}
let o = null;
try {
const t = await st("https://catalog.roblox.com/v1/catalog/items/details", {
method: "POST",
body: {
items: [ {
itemType: e,
id: parseInt(n, 10)
} ]
},
headers: {
"Content-Type": "application/json"
}
});
if (t.ok && t.json && Array.isArray(t.json.data) && t.json.data.length > 0) {
o = t.json.data[0] || null;
}
} catch {}
I.set(r, o);
return o;
}
async function dt(t) {
const e = String(t && t.type ? t.type : "").toLowerCase();
const n = Number(t && t.price);
if (e === "gamepass") {
return b;
}
if (e !== "asset") {
return m;
}
await ut();
if (!T || !Array.isArray(A)) {
return m;
}
const r = await lt(t && t.id ? t.id : "", "Asset");
const o = Number(r && r.assetType);
if (!Number.isFinite(o)) {
return m;
}
const a = T[String(o)];
if (A.includes(a)) {
return n < 10 ? 0 : h;
}
return m;
}
async function ft(t) {
const e = Array.isArray(t && t.entries) ? t.entries : [];
if (!e.length) {
return Number(t && t.savings) || 0;
}
const n = q(e);
if (n && P.has(n)) {
return P.get(n);
}
let r = 0;
for (const t of e) {
const e = Number(t && t.price);
if (!Number.isFinite(e) || e <= 0) continue;
const n = await dt(t);
r += Math.floor(e * n);
}
if (n) {
P.set(n, r);
}
return r;
}
function pt(t) {
if (t && typeof t === "object") {
return t.enabled === true;
}
return t === true;
}
function mt(t) {
if (t && typeof t === "object") {
return {
enabled: t.enabled === true,
placeId: ct(t.placeId)
};
}
return {
enabled: t === true,
placeId: ""
};
}
async function bt() {
const t = await nt(chrome.storage.sync, e, {
enabled: false,
placeId: ""
});
const r = mt(t);
if (t === true || t === false || t && typeof t === "object" && typeof t.placeId === "boolean") {
await rt(chrome.storage.sync, e, r);
}
if (!r.placeId) {
const t = await nt(chrome.storage.local, n, "");
const e = ct(t);
if (e) {
r.placeId = e;
}
}
return r;
}
async function ht(t) {
const n = await bt();
const r = {
...n,
...t
};
await rt(chrome.storage.sync, e, r);
}
async function gt() {
const t = await bt();
return t.placeId;
}
async function yt() {
const t = await gt();
if (t) return t;
await z({
mode: "alert",
title: "Important Information",
message: "Owner Account: The group owner CANNOT be the same account you are buying items with. The owner should be a secured alt account with 2FA enabled and a strong, unique password. Payouts: Only the group owner account can pay out the saved Robux from the group funds. Pending Robux: After using this feature, the Robux will be pending for approximately one month before they can be paid out.",
confirmText: "I Understand"
});
const e = await z({
mode: "prompt",
title: "Enter Place ID",
message: "Enter the Place ID of your Robux Saver game. See template-place/README.md for setup instructions.",
confirmText: "Save Place ID",
cancelText: "Cancel",
initialValue: ""
});
if (!e) return null;
const r = String(e).trim();
if (!/^\d+$/.test(r)) {
await z({
mode: "alert",
title: "Invalid Place ID",
message: "Invalid Place ID. Please enter numbers only.",
confirmText: "OK"
});
return null;
}
await Promise.all([ ht({
placeId: r
}), rt(chrome.storage.local, n, r) ]);
return r;
}
function xt(t) {
const e = H(t);
if (e) {
e.click();
}
}
function vt(t, e) {
const n = parseInt(t, 10);
if (!Number.isFinite(n) || n <= 0) {
return;
}
const r = {
launchData: e
};
const o = `if (typeof Roblox !== 'undefined' && Roblox.GameLauncher && typeof Roblox.GameLauncher.joinMultiplayerGame === 'function') { Roblox.GameLauncher.joinMultiplayerGame(${n}, false, false, null, null, ${JSON.stringify(r)}); }`;
chrome.runtime.sendMessage({
action: "injectScript",
codeToInject: o
});
}
async function wt(t, e) {
var n = await yt();
if (!n) return;
var r = await ft(e);
if (Number.isFinite(r)) {
e.savings = r;
}
xt(t);
St(e);
var o = 0;
var a = setInterval(function() {
o++;
if (!t.isConnected || o > 50) {
clearInterval(a);
try {
vt(n, e.launchData);
} catch (t) {}
}
}, 50);
}
function St(t) {
if (!document.body) return;
var e = document.createElement("div");
e.className = "purpura-slr-toast";
e.innerHTML = '<span style="font-weight:600">Saving ' + L(t.savings) + ' Robux</span><span style="opacity:0.7;font-size:12px">Launching Roblox...</span>';
e.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:999999;background:var(--modal-background,#252934);color:var(--text-color-primary,#f2f4f8);border:1px solid var(--divider-color,rgba(110,118,138,0.55));border-radius:12px;padding:12px 18px;display:flex;flex-direction:column;gap:2px;font-family:var(--font-family,sans-serif);font-size:14px;box-shadow:0 8px 32px rgba(0,0,0,0.4);animation:purpuraSaveToastIn 0.3s ease-out";
document.body.appendChild(e);
setTimeout(function() {
if (e.parentNode) {
e.style.opacity = "0";
e.style.transition = "opacity 0.2s";
setTimeout(function() {
if (e.parentNode) e.remove();
}, 200);
}
}, 5e3);
}
function Et() {
if (document.getElementById(r)) return;
const t = document.createElement("style");
t.id = r;
t.textContent = `\n            .${o} {\n                cursor: pointer;\n                margin: 0 8px;\n            }\n\n            .${a} {\n                position: fixed;\n                inset: 0;\n                background: rgba(12,14,20,0.68);\n                backdrop-filter: blur(4px);\n                z-index: 100000;\n                display: flex;\n                align-items: center;\n                justify-content: center;\n                padding: 18px;\n                animation: purpuraSaveDialogFadeIn 0.18s ease-out;\n            }\n\n            .${i} {\n                width: min(440px, 100%);\n                border-radius: 12px;\n                border: 1px solid var(--t-border, var(--divider-color, rgba(110,118,138,0.55)));\n                background: var(--t-surface-2, var(--modal-background, var(--t-surface, #1f1f23)));\n                box-shadow: 0 12px 40px rgba(0,0,0,0.3);\n                color: var(--t-text, var(--text-color-primary, #f2f4f8));\n                padding: 24px;\n                font-family: var(--font-family, 'Builder Sans', Arial, sans-serif);\n                animation: purpuraSaveDialogPopIn 0.24s cubic-bezier(.21,1.08,.27,1);\n            }\n\n            .${i}.mode-alert {\n                border-color: rgba(207,164,93,0.68);\n            }\n\n\n            .${s} {\n                margin: 0 0 10px;\n                font-size: 17px;\n                font-weight: 700;\n                line-height: 1.3;\n            }\n\n            .${c} {\n                margin: 0;\n                font-size: 14px;\n                line-height: 1.5;\n                color: var(--text-color-secondary, rgba(215, 221, 236, 0.9));\n                white-space: pre-line;\n            }\n\n            .${u} {\n                width: 100%;\n                margin-top: 10px;\n                border-radius: 10px;\n                border: 1px solid var(--divider-color, rgba(118, 127, 149, 0.6));\n                background: var(--input-background, #1f2330);\n                color: var(--text-color-primary, #f2f4f8);\n                padding: 11px 12px;\n                font-size: 14px;\n                outline: none;\n                transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;\n            }\n\n            .${u}:focus {\n                border-color: var(--primary-button-background, #3a65ff);\n                box-shadow: 0 0 0 3px rgba(58,101,255,0.2);\n            }\n\n            .${f} {\n                margin-top: 8px;\n                color: #ff8c87;\n                font-size: 12px;\n                line-height: 1.35;\n                display: none;\n            }\n\n            .${l} {\n                display: flex;\n                justify-content: flex-end;\n                gap: 9px;\n                margin-top: 18px;\n            }\n\n            .${d} {\n                border: 1px solid transparent;\n                border-radius: 8px;\n                padding: 10px 20px;\n                font-size: 14px;\n                font-weight: 600;\n                cursor: pointer;\n                min-width: 100px;\n                transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease;\n            }\n\n            .${d}:active {\n                transform: scale(0.97);\n            }\n\n            .${d}.cancel {\n                border-color: var(--t-border, var(--divider-color, rgba(118,127,149,0.6)));\n                background: transparent;\n                color: var(--t-text, var(--text-color-primary, #f2f4f8));\n            }\n\n            .${d}.cancel:hover {\n                background: var(--t-surface-hover, rgba(255,255,255,0.06));\n            }\n\n            .${d}.confirm {\n                border-color: transparent;\n                background: var(--t-accent, var(--button-primary-background, #00b06f));\n                color: #ffffff;\n            }\n\n            .${d}.confirm:hover {\n                filter: brightness(1.1);\n            }\n\n            @keyframes purpuraSaveDialogFadeIn {\n                from { opacity: 0; }\n                to { opacity: 1; }\n            }\n\n            @keyframes purpuraSaveDialogPopIn {\n                from { transform: translateY(16px) scale(0.96); opacity: 0; }\n                to { transform: translateY(0) scale(1); opacity: 1; }\n            }\n\n            @keyframes purpuraSaveToastIn {\n                from { transform: translateY(16px); opacity: 0; }\n                to { transform: translateY(0); opacity: 1; }\n            }\n        `;
(document.head || document.documentElement).appendChild(t);
}
function kt() {
document.querySelectorAll(`.${o}`).forEach(function(t) {
t.remove();
});
document.querySelectorAll(".purpura-balance-after").forEach(function(t) {
t.remove();
});
}
function Tt(e) {
if (!e || !document.body.contains(e)) return;
const n = _(e);
function r() {
e.querySelectorAll(`.${o}`).forEach(function(t) {
t.remove();
});
e.querySelectorAll(".purpura-balance-after").forEach(function(t) {
t.remove();
});
}
if (!y || !n) {
r();
return;
}
const a = et(e);
if (!a || !a.launchData) {
r();
return;
}
Et();
var i = e.querySelector(`.${o}`);
if (i) {
var s = i.getAttribute("data-purpura-launch-data");
if (s === a.launchData) return;
i.remove();
}
var c = document.createElement(n.tagName.toLowerCase() || "button");
c.type = "button";
c.className = j(n.className) + " bg-action-emphasis content-action-emphasis " + o;
c.textContent = t("saveLots_saveAmountRobux", [ L(a.savings) ]);
c.setAttribute("data-purpura-launch-data", a.launchData);
c.addEventListener("click", function() {
wt(e, a);
});
n.insertAdjacentElement("afterend", c);
ft(a).then(function(e) {
if (!Number.isFinite(e)) return;
if (!c.isConnected) return;
if (c.getAttribute("data-purpura-launch-data") !== a.launchData) return;
a.savings = e;
c.textContent = t("saveLots_saveAmountRobux", [ L(e) ]);
}).catch(function() {});
}
function At(t = document) {
if (!t || typeof t.querySelectorAll !== "function") return;
const e = [];
if (t.nodeType === 1 && t.matches && t.matches(p)) {
e.push(t);
}
t.querySelectorAll(p).forEach(t => e.push(t));
const n = new Set;
e.forEach(t => {
if (n.has(t)) return;
n.add(t);
Tt(t);
});
}
function Ct() {
if (v) {
clearTimeout(v);
}
v = setTimeout(() => {
v = 0;
At();
}, 60);
}
function It() {
if (x || !document.documentElement) return;
x = new MutationObserver(() => {
if (!y) return;
Ct();
});
x.observe(document.documentElement, {
childList: true,
subtree: true,
attributes: true,
characterData: true
});
}
function Pt() {
if (x) {
x.disconnect();
x = null;
}
if (v) {
clearTimeout(v);
v = 0;
}
}
function Nt(t) {
y = !!t;
if (y) {
Et();
It();
Ct();
return;
}
Pt();
kt();
}
function $t() {
window.__PurpuraSettings.ready.then(function() {
const t = window.__PurpuraSettings.get(e);
Nt(pt(t));
});
}
function Lt() {
const t = () => {
if (y) Ct();
};
const e = history.pushState;
history.pushState = function() {
const n = e.apply(this, arguments);
t();
return n;
};
const n = history.replaceState;
history.replaceState = function() {
const e = n.apply(this, arguments);
t();
return e;
};
window.addEventListener("popstate", t);
window.addEventListener("hashchange", t);
}
function jt(t) {
if (!t) return 0;
const e = $(t.getAttribute("data-expected-price") || t.dataset.expectedPrice || t.getAttribute("data-price") || t.dataset.price || "");
if (e > 0) return e;
const n = [];
if (t.parentElement) n.push(t.parentElement);
const r = t.closest('.item-card-container, .item-card, .item-details-info-header, .item-details-info-content, .game-pass-detail, .purchase-button-container, [data-testid*="purchase"]');
if (r && !n.includes(r)) {
n.push(r);
}
for (const t of n) {
const e = $(t.getAttribute("data-expected-price") || t.dataset.expectedPrice || t.getAttribute("data-price") || t.dataset.price || "");
if (e > 0) return e;
const n = t.querySelectorAll('[data-testid*="price"], .text-robux, .text-robux-lg, .item-price, .price, .icon-robux-container');
for (const e of n) {
const n = Y(e, t);
if (J(n)) continue;
const r = N(e.textContent || "");
if (r.length) {
return r[0];
}
}
}
return 0;
}
function Dt(t) {
const e = t.target;
if (!e || typeof e.closest !== "function") return;
const n = e.closest(".PurchaseButton, .shopping-cart-buy-button, .btn-primary-md, .btn-primary-lg, [data-product-id], [data-item-id], [data-asset-id]");
if (!n) return;
if (n.closest(".modal-dialog, .modal-content, .unified-purchase-dialog-content, .foundation-web-dialog-content")) {
return;
}
const r = R(n);
const o = n.getAttribute("data-item-id") || n.dataset.itemId || n.getAttribute("data-asset-id") || n.dataset.assetId || (r ? r.id : null) || null;
const a = n.getAttribute("data-product-id") || n.dataset.productId || null;
const i = jt(n);
const s = (n.getAttribute("data-item-name") || n.dataset.itemName || "").trim();
let c = false;
if (r && r.type === "gamepass") {
c = true;
}
if (window.location.pathname.toLowerCase().includes("/game-pass/") || window.location.pathname.toLowerCase().includes("/games/")) {
c = true;
}
w = {
timestamp: Date.now(),
itemId: o,
productId: a,
expectedPrice: i,
name: s,
isGamePass: c
};
}
chrome.storage.onChanged.addListener((t, n) => {
if (n !== "sync") return;
if (!Object.prototype.hasOwnProperty.call(t, e)) return;
Nt(pt(window.__PurpuraSettings.get(e)));
});
document.addEventListener("click", Dt, true);
Lt();
$t();
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", () => {
if (y) Ct();
}, {
once: true
});
} else {
if (y) Ct();
}
})();
