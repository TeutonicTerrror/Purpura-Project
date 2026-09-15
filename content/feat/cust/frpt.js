/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
"use strict";
if (window.purpuraFreeRobloxPlusThemesInitialized) return;
window.purpuraFreeRobloxPlusThemesInitialized = true;
function e(e) {
return chrome.i18n.getMessage(e) || e;
}
const t = "frpt";
const n = "purpura_freeRobloxPlusThemes";
const r = "purpura_frpt_cache";
const s = 300 * 1e3;
const o = ".app-theme-section";
const c = "purpura-frpt-notice";
const i = e("frpt_notice");
const u = chrome.runtime.getURL("images/icons/default/Purpura_Default_Logo_128.png");
const a = "x-bound-auth-token";
const l = {
enabled: false,
injectedThemeClass: null,
themeSectionObserver: null,
sectionFinder: null,
accountThemeRequest: null
};
const d = new window.PurpuraHBAClient({
onSite: true
});
function m(e) {
return typeof e !== "string" || !/^[A-Za-z0-9]+$/.test(e) ? null : `${e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}-theme`;
}
function f() {
return new Promise(e => {
if (document.body) return e();
const t = new MutationObserver(() => {
if (document.body) {
t.disconnect();
e();
}
});
t.observe(document.documentElement, {
childList: true
});
});
}
function h() {
if (l.injectedThemeClass && document.body) {
document.body.classList.remove(l.injectedThemeClass);
}
l.injectedThemeClass = null;
}
function p(e) {
const t = m(e);
if (!t || !document.body) return;
if (l.injectedThemeClass && l.injectedThemeClass !== t) {
document.body.classList.remove(l.injectedThemeClass);
l.injectedThemeClass = null;
}
if (!document.body.classList.contains(t)) {
document.body.classList.add(t);
l.injectedThemeClass = t;
}
}
function b(e) {
if (!(e instanceof Element) || e.querySelector(`#${c}`)) return;
const t = document.createElement("p");
t.id = c;
t.className = "flex items-center gap-small text-body-medium content-muted margin-none";
const n = document.createElement("img");
n.src = u;
n.alt = "Purpura";
n.width = 24;
n.height = 24;
n.className = "shrink-0 radius-small";
const r = document.createElement("span");
r.textContent = i;
t.appendChild(n);
t.appendChild(r);
(e.querySelector('[role="group"]') || e).before(t);
}
function w(e) {
if (l.themeSectionObserver) l.themeSectionObserver.disconnect();
const t = () => b(e);
t();
l.themeSectionObserver = new MutationObserver(t);
l.themeSectionObserver.observe(e, {
childList: true,
subtree: true
});
}
function g() {
if (!/\/my\/account(\?|#|$)/.test(location.href)) return;
const e = () => document.querySelector(o);
const t = e();
if (t) {
w(t);
return;
}
if (l.sectionFinder) return;
l.sectionFinder = new MutationObserver(() => {
const t = e();
if (t) {
w(t);
l.sectionFinder.disconnect();
l.sectionFinder = null;
}
});
l.sectionFinder.observe(document.documentElement, {
childList: true,
subtree: true
});
}
function y() {
if (l.themeSectionObserver) {
l.themeSectionObserver.disconnect();
l.themeSectionObserver = null;
}
if (l.sectionFinder) {
l.sectionFinder.disconnect();
l.sectionFinder = null;
}
}
function T() {
return new Promise(e => {
chrome.storage.local.get(r, t => {
const n = t && t[r];
if (!n || !n.settings || n.expiresAt <= Date.now()) return e(null);
e(n);
});
});
}
function v(e) {
return new Promise(t => {
chrome.storage.local.set({
[r]: {
settings: e,
expiresAt: Date.now() + s
}
}, t);
});
}
function S() {
const e = document.querySelector('meta[name="user-data"]');
const t = e ? e.getAttribute("data-userid") || "" : "";
const n = parseInt(t, 10);
return Number.isNaN(n) || n <= 0 ? null : n;
}
async function C() {
const e = "https://apis.roblox.com";
const t = "/user-settings-api/v1/user-settings";
let n = `${e}${t}?_PurpuraRequest=${Date.now()}`;
const r = "GET";
const s = new Headers;
s.set("Accept", "application/json");
const o = await S();
try {
const e = await d.generateBaseHeaders(n, r, !!o, undefined);
if (e[a]) s.set(a, e[a]);
} catch {}
return fetch(n, {
method: r,
headers: s,
credentials: "include",
cache: "no-store"
});
}
async function P(e) {
if (!e || typeof e !== "object") return;
const t = await T();
const n = !t || t.settings.accountTheme !== e.accountTheme;
const r = !t || t.expiresAt <= Date.now();
if (!n && !r) return;
await v(e);
if (l.enabled) p(e.accountTheme);
}
async function _() {
const e = await T();
if (!e || typeof e.settings.accountTheme !== "string") return false;
p(e.settings.accountTheme);
return true;
}
async function O() {
if (l.accountThemeRequest) return l.accountThemeRequest;
l.accountThemeRequest = C().then(async e => {
if (e.ok) await P(await e.json());
}).finally(() => {
l.accountThemeRequest = null;
});
return l.accountThemeRequest;
}
async function j() {
await f();
if (!await _()) await O();
}
function E() {
return !!(window.__PurpuraSettings && window.__PurpuraSettings.get("thmEnabled"));
}
function L(e) {
l.enabled = e === true;
try {
sessionStorage.setItem(n, String(l.enabled));
} catch {}
document.dispatchEvent(new CustomEvent("purpura:frpt-enabled", {
detail: l.enabled
}));
if (l.enabled && E()) {
h();
y();
return;
}
if (l.enabled) {
j().catch(() => {});
g();
} else {
h();
y();
}
}
chrome.storage.onChanged.addListener((e, n) => {
if (n === "local" && Object.prototype.hasOwnProperty.call(e, "thmEnabled")) {
if (l.enabled) L(true);
return;
}
if (n !== "sync") return;
if (!Object.prototype.hasOwnProperty.call(e, t)) return;
L(!!e[t].newValue);
});
document.addEventListener("purpura:user-settings-response", e => {
if (!l.enabled) return;
P(e.detail).catch(() => {});
});
window.__PurpuraSettings.ready.then(function() {
L(!!window.__PurpuraSettings.get(t));
});
})();
