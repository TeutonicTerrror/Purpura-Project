/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
"use strict";
if (window.purpuraStreamerModeInitialized) return;
window.purpuraStreamerModeInitialized = true;
let e = false;
let t = null;
let n = null;
let r = null;
const o = "purpura-streamer-name-mask";
const a = "data-purpura-streamer-mask";
function s(t) {
e = t;
try {
sessionStorage.setItem("purpura_streamermode", String(t));
} catch {}
document.dispatchEvent(new CustomEvent("purpura-streamer-mode", {
detail: t
}));
if (t) {
i();
C();
} else {
_();
c();
}
}
function i() {
if (document.getElementById("purpura-streamer-mode-styles")) return;
const e = document.createElement("style");
e.id = "purpura-streamer-mode-styles";
e.textContent = `\n            .rbx-header-content .rbx-navbar-account .text-robux-lg,\n            .rbx-header-content .rbx-navbar-account .icon-robux-16x16,\n            .nav-robux-amount,\n            .rbx-menu-item .text-robux,\n            .rbx-menu-item .icon-robux,\n            [class*="robux"]:not(.robux-menu-btn),\n            .currency-counter,\n            .text-robux,\n            .icon-robux,\n            #nav-robux,\n            #nav-robux-amount,\n            .avatar-name,\n            .profile-display-name,\n            .profile-name,\n            .text-overflow.ng-binding,\n            .profile-header-title,\n            [data-testid="display-name"],\n            .header-title,\n            .username,\n            .display-name,\n            .settings-text-span-visible,\n            .avatar-card-label:not(:has(.avatar-status-link)),\n            a[href*="/users/profile"]:has(.thumbnail-2d-container) .text-truncate-end,\n            a[href*="/users/profile"]:has(.thumbnail-2d-container) .text-no-wrap,\n            a[href*="/users/"]:not([href*="/users/profile"])[href*="/profile"] .age-bracket-label-username,\n            a[href*="/users/"]:not([href*="/users/profile"])[href*="/profile"] .friends-carousel-display-name,\n            a[href*="/users/"]:not([href*="/users/profile"])[href*="/profile"] .friends-carousel-user-name,\n            #profile-header-title-container-name,\n            .stylistic-alts-username,\n            .friend-tile-is-playing,\n            .friend-tile-game-name,\n            .purpura-streamer-name-mask {\n                filter: blur(8px) !important;\n                user-select: none !important;\n                pointer-events: none !important;\n            }\n        `;
document.head.appendChild(e);
}
function c() {
const e = document.getElementById("purpura-streamer-mode-styles");
if (e) {
e.remove();
}
}
function u(e) {
return String(e).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
async function l() {
try {
const e = await fetch("https://users.roblox.com/v1/users/authenticated", {
credentials: "include"
});
if (!e.ok) return [];
const t = await e.json();
const n = new Set;
for (const e of [ t?.name, t?.displayName, t?.username ]) {
if (typeof e !== "string") continue;
const t = e.trim();
if (t.length < 2) continue;
n.add(t);
}
return Array.from(n);
} catch {
return [];
}
}
async function d() {
if (n) return n;
if (!r) {
r = (async () => {
const e = await l();
const t = e.map(u).filter(Boolean).sort((e, t) => t.length - e.length).join("|");
n = t ? new RegExp(t, "i") : null;
})().finally(() => {
r = null;
});
}
await r;
return n;
}
function f(e) {
if (!(e instanceof Text)) return false;
const t = e.parentElement;
if (!(t instanceof Element)) return false;
if (t.closest("script,style,noscript,textarea,input,select,option")) return false;
if (t.closest(`span[${a}="1"]`)) return false;
return true;
}
function m() {
document.querySelectorAll(`.${o}:not([${a}="1"])`).forEach(e => {
e.classList.remove(o);
});
}
const p = new WeakMap;
const h = new WeakMap;
const x = "•";
function y() {
return [ ".settings-text-span-visible", ".text-robux", ".icon-robux", "#nav-robux", "#nav-robux-amount", ".nav-robux-amount", ".currency-counter" ];
}
const b = y().join(",");
function E(t) {
if (!e || !n) return;
if (!f(t)) return;
const r = typeof t.nodeValue === "string" ? t.nodeValue : "";
if (!r.trim()) return;
if (!n.test(r)) return;
const s = new RegExp(n.source, "gi");
const i = document.createDocumentFragment();
let c = 0;
let u;
let l = false;
while ((u = s.exec(r)) !== null) {
const e = u.index;
const t = e + u[0].length;
if (e > c) {
i.appendChild(document.createTextNode(r.slice(c, e)));
}
const n = document.createElement("span");
n.className = o;
n.setAttribute(a, "1");
const d = r.slice(e, t);
h.set(n, d);
n.textContent = d.replace(/[^\s]/g, x);
i.appendChild(n);
c = t;
l = true;
if (s.lastIndex <= e) {
s.lastIndex = e + 1;
}
}
if (!l) return;
if (c < r.length) {
i.appendChild(document.createTextNode(r.slice(c)));
}
t.replaceWith(i);
}
function g(t) {
if (!e) return;
const n = t && t.nodeType === Node.ELEMENT_NODE ? t : document;
const r = n.querySelectorAll ? n.querySelectorAll(b) : [];
for (const e of r) {
if (e.closest(".purpura-streamer-name-mask")) continue;
if (p.has(e)) continue;
p.set(e, e.innerHTML);
const t = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
let n;
while (n = t.nextNode()) {
const e = n.nodeValue || "";
if (e.trim()) {
n.nodeValue = e.replace(/[^\s]/g, x);
}
}
}
}
function T() {
const e = document.querySelectorAll(b);
for (const t of e) {
if (p.has(t)) {
t.innerHTML = p.get(t);
p.delete(t);
}
}
}
function N(t) {
if (!e) return;
const n = t && t.nodeType === Node.ELEMENT_NODE ? t : document.body;
if (!n) return;
const r = n.matches && n.matches(".friend-tile-dropdown-button") ? [ n ] : Array.from(n.querySelectorAll(".friend-tile-dropdown-button"));
for (const e of r) {
if (e.querySelector(`span[${a}="1"]`)) continue;
const t = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
let n;
while (n = t.nextNode()) {
const e = n.nodeValue || "";
const t = e.match(/^(\s*Chat with\s+)(.+)$/i);
if (!t) continue;
const r = t[1];
const s = t[2];
const i = document.createDocumentFragment();
i.appendChild(document.createTextNode(r));
const c = document.createElement("span");
c.className = o;
c.setAttribute(a, "1");
h.set(c, s);
c.textContent = s.replace(/[^\s]/g, x);
i.appendChild(c);
n.replaceWith(i);
break;
}
}
}
function w(t) {
if (!e) return;
const r = t && t.nodeType ? t : document.body;
if (!r) return;
if (n) {
const e = [];
if (r.nodeType === Node.TEXT_NODE) {
e.push(r);
} else {
const t = document.createTreeWalker(r, NodeFilter.SHOW_TEXT);
let n;
while (n = t.nextNode()) {
e.push(n);
}
}
for (const t of e) {
E(t);
}
}
if (r.nodeType === Node.ELEMENT_NODE) {
N(r);
g(r);
}
}
function v() {
if (t || !document.body) return;
t = new MutationObserver(e => {
for (const t of e) {
if (t.type === "characterData") {
const e = t.target && t.target.parentElement;
if (e) w(e);
continue;
}
for (const e of t.addedNodes) {
if (e.nodeType === Node.ELEMENT_NODE) {
w(e);
} else if (e.nodeType === Node.TEXT_NODE && e.parentElement) {
w(e.parentElement);
}
}
}
});
t.observe(document.body, {
childList: true,
subtree: true,
characterData: true
});
}
function S() {
if (t) {
t.disconnect();
t = null;
}
}
async function C() {
const t = await d();
if (!e || !t) return;
m();
g();
w(document.body);
v();
}
function _() {
S();
document.querySelectorAll(`span.${o}[${a}="1"]`).forEach(e => {
e.replaceWith(document.createTextNode(h.get(e) || e.textContent || ""));
});
m();
document.querySelectorAll(`.${o}`).forEach(e => {
e.classList.remove(o);
});
T();
if (document.body) {
document.body.normalize();
}
}
function k() {
window.__PurpuraSettings.ready.then(function() {
const t = window.__PurpuraSettings.get("stm") === true;
if (t !== e) {
s(t);
} else if (t) {
C();
}
});
}
k();
chrome.storage.onChanged.addListener((e, t) => {
if (t === "local" && e["stm"]) {
k();
}
});
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", k);
} else {
k();
}
})();
