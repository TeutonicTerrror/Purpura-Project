/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
if (window.purpuraNoRentInitialized) return;
window.purpuraNoRentInitialized = true;
const t = "nr";
const e = "purpura-no-rent-style";
const n = "data-purpura-no-rent-hidden";
const r = ".timed-options-row-container";
const o = ".icon-actions-info-sm.item-hold-icon";
const i = "data-purpura-no-rent-size";
const c = ".shopping-cart-buy-button.item-purchase-btns-container";
const u = "button.shopping-cart-buy-button.btn-growth-lg.PurchaseButton, button.btn-primary-lg";
let a = true;
let s = null;
let d = 0;
const p = new Map;
function f() {
if (document.getElementById(e)) return;
const t = document.createElement("style");
t.id = e;
t.textContent = `.timed-options-container{display:none !important;}.timed-options-row-container .row-label{display:none !important;}[${n}="1"]{display:none !important;}[${i}="1"]{width:388.67px !important;height:51.33px !important;min-width:388.67px !important;min-height:51.33px !important;display:inline-flex !important;align-items:center !important;justify-content:center !important;}`;
(document.head || document.documentElement).appendChild(t);
}
function l() {
const t = document.getElementById(e);
if (t) t.remove();
}
function m() {
document.querySelectorAll(`[${n}="1"]`).forEach(t => t.removeAttribute(n));
document.querySelectorAll(`[${i}="1"]`).forEach(t => t.removeAttribute(i));
}
function h() {
const t = Array.from(p.entries());
t.forEach(([t, e]) => {
if (!t || !e) {
p.delete(t);
return;
}
const n = e.parentNode;
if (n && t.isConnected) {
n.insertBefore(t, e);
}
if (e.parentNode) {
e.parentNode.removeChild(e);
}
p.delete(t);
});
}
function y(t) {
if (a) {
t.setAttribute(n, "1");
return;
}
t.removeAttribute(n);
}
function b(t) {
const e = t.querySelector(c);
if (!e) {
if (!a) t.removeAttribute(n);
return;
}
const r = t.closest(".price-container-text") || t.closest(".price-row-container") || t.parentElement;
const o = r && r.querySelector(".price-info.row-content");
if (!o) {
if (!a) t.removeAttribute(n);
return;
}
if (a) {
if (!o.contains(e)) {
if (!p.has(e) && e.parentNode) {
const t = document.createComment("purpura-no-rent-purchase-anchor");
e.parentNode.insertBefore(t, e);
p.set(e, t);
}
o.appendChild(e);
}
t.setAttribute(n, "1");
return;
}
t.removeAttribute(n);
}
function w(t = document) {
if (!t || typeof t.querySelectorAll !== "function") return;
const e = [];
if (t.nodeType === 1 && t.matches && t.matches(".timed-options-container")) {
e.push(t);
}
t.querySelectorAll(".timed-options-container").forEach(t => e.push(t));
e.forEach(t => y(t));
const c = [];
if (t.nodeType === 1 && t.matches && t.matches(r)) {
c.push(t);
}
t.querySelectorAll(r).forEach(t => c.push(t));
c.forEach(t => b(t));
const s = [];
if (t.nodeType === 1 && t.matches && t.matches(o)) {
s.push(t);
}
t.querySelectorAll(o).forEach(t => s.push(t));
s.forEach(t => {
const e = t.closest(".row-label");
const r = e || t;
if (a) {
r.setAttribute(n, "1");
if (r !== t) t.removeAttribute(n);
return;
}
r.removeAttribute(n);
t.removeAttribute(n);
});
const d = [];
if (t.nodeType === 1 && t.matches && t.matches(u)) {
d.push(t);
}
t.querySelectorAll(u).forEach(t => d.push(t));
d.forEach(t => {
const e = (t.textContent || "").trim().toLowerCase();
const n = e === "buy" || e === "add to cart";
if (a && n) {
t.setAttribute(i, "1");
return;
}
t.removeAttribute(i);
});
}
function v() {
if (d) clearTimeout(d);
d = window.setTimeout(() => {
d = 0;
w();
}, 0);
}
function A(t) {
a = !!t;
if (a) {
f();
w();
v();
return;
}
h();
m();
l();
}
function E() {
function e() {
window.__PurpuraSettings.ready.then(function() {
var e = window.__PurpuraSettings.get(t);
var n = typeof e === "boolean" ? e : true;
A(n);
});
}
if (!window.__PurpuraSettings) {
var n = 0;
var r = setInterval(function() {
if (window.__PurpuraSettings) {
clearInterval(r);
e();
} else if (++n > 50) {
clearInterval(r);
}
}, 100);
return;
}
e();
}
function g() {
if (s || !document.documentElement) return;
s = new MutationObserver(t => {
if (!a) return;
for (const e of t) {
if (e.type === "childList" && e.addedNodes.length) {
v();
return;
}
if (e.type === "characterData") {
v();
return;
}
}
});
s.observe(document.documentElement, {
childList: true,
subtree: true,
characterData: true
});
}
function S() {
const t = () => {
if (a) v();
};
const e = history.pushState.bind(history);
history.pushState = function() {
const n = e(...arguments);
t();
return n;
};
const n = history.replaceState.bind(history);
history.replaceState = function() {
const e = n(...arguments);
t();
return e;
};
window.addEventListener("popstate", t);
window.addEventListener("hashchange", t);
}
A(a);
E();
g();
S();
chrome.storage.onChanged.addListener((e, n) => {
if (n !== "sync" || !e[t]) return;
E();
});
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", () => {
if (a) v();
}, {
once: true
});
} else if (a) {
v();
}
})();
