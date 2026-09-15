/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
"use strict";
function t(t, e) {
return chrome.i18n.getMessage(t, e) || t;
}
let e = true;
let n = false;
let r = null;
let a = "dark";
let o = null;
let i = null;
let s = false;
async function u() {
try {
const t = await chrome.runtime.sendMessage({
action: "getRobloxTheme"
});
const e = t?.theme || "dark";
if (e !== a) {
a = e;
c();
}
} catch (t) {}
}
function c() {
var t = a === "light";
var e = t ? {
"--go-bg": "#f5f5f7",
"--go-surface": "#ffffff",
"--go-surface-secondary": "#ebebed",
"--go-border": "#d8d8dc",
"--go-text": "#111113",
"--go-text-muted": "#6b6b72",
"--go-accent": "#7c3aed",
"--go-accent-hover": "#8b5cf6",
"--go-success-bg": "#f0fdf4",
"--go-success-border": "#16a34a",
"--go-error-bg": "#fef2f2",
"--go-error-border": "#dc2626",
"--go-warning-bg": "#fffbeb",
"--go-warning-border": "rgba(180, 83, 9, 0.3)",
"--go-warning-text": "#b45309",
"--go-shadow": "0 1px 3px rgba(0, 0, 0, 0.06)",
"--go-shadow-hover": "0 4px 14px rgba(124, 58, 237, 0.15)",
"--go-scrollbar": "#c8c8cc",
"--go-no-thumb-text": "#888"
} : {
"--go-bg": "var(--background-color, #232527)",
"--go-surface": "var(--background-secondary-color, #393b3d)",
"--go-surface-secondary": "rgba(255, 255, 255, 0.03)",
"--go-border": "transparent",
"--go-text": "var(--text-color, #fff)",
"--go-text-muted": "var(--text-secondary-color, #bbb)",
"--go-accent": "#8b5cf6",
"--go-accent-hover": "#7c3aed",
"--go-success-bg": "rgba(34, 197, 94, 0.1)",
"--go-success-border": "#22c55e",
"--go-error-bg": "rgba(239, 68, 68, 0.1)",
"--go-error-border": "#ef4444",
"--go-warning-bg": "rgba(251, 191, 36, 0.1)",
"--go-warning-border": "rgba(251, 191, 36, 0.3)",
"--go-warning-text": "#fbbf24",
"--go-shadow": "none",
"--go-shadow-hover": "0 4px 12px rgba(139, 92, 246, 0.2)",
"--go-scrollbar": "rgba(255, 255, 255, 0.15)",
"--go-no-thumb-text": "#888"
};
let n = document.getElementById("purpura-outfits-theme-vars");
if (!n) {
n = document.createElement("style");
n.id = "purpura-outfits-theme-vars";
document.head.appendChild(n);
}
let r = ":root {";
for (const [t, n] of Object.entries(e)) {
r += `${t}: ${n};`;
}
r += "}";
n.textContent = r;
}
async function p() {
if (o) return;
await u();
c();
o = new MutationObserver(() => {
u();
});
const t = {
attributes: true,
attributeFilter: [ "class" ]
};
o.observe(document.documentElement, t);
if (document.body) o.observe(document.body, t);
}
function d() {
return /^\/games\/\d+/.test(window.location.pathname);
}
async function l() {
try {
const t = await fetch("https://users.roblox.com/v1/users/authenticated", {
credentials: "include"
});
if (t.ok) {
const e = await t.json();
return e.id;
}
} catch (t) {}
return null;
}
async function f() {
if (r) return r;
try {
const t = document.querySelector('meta[name="csrf-token"]');
if (t?.dataset?.token) {
r = t.dataset.token;
return r;
}
const e = await fetch("https://auth.roblox.com/v1/logout", {
method: "POST",
credentials: "include"
});
if (e.ok || e.status === 403) {
r = e.headers.get("x-csrf-token");
}
return r;
} catch (t) {
return null;
}
}
async function g(t, e) {
var n = e || {};
n.credentials = "include";
if (!n.headers) n.headers = {};
n.headers["Content-Type"] = "application/json";
return fetch(t, n);
}
async function m(t, e, n) {
if (n === undefined) n = 3;
var a = await f();
var o = await fetch(t, {
method: "POST",
headers: {
"Content-Type": "application/json",
"X-CSRF-TOKEN": a || ""
},
credentials: "include",
body: JSON.stringify(e)
});
if (o.status === 403 && n > 0) {
var i = o.headers.get("x-csrf-token");
if (i) {
r = i;
}
await new Promise(function(t) {
setTimeout(t, 500);
});
return m(t, e, n - 1);
}
if (o.status === 429 && n > 0) {
await new Promise(function(t) {
setTimeout(t, 1e3);
});
return m(t, e, n - 1);
}
return o;
}
async function v(t) {
var e = [];
var n = null;
var r = 3;
while (true) {
var a = "https://avatar.roblox.com/v2/avatar/users/" + t + "/outfits?outfitType=1&page=1&itemsPerPage=100&isEditable=true";
if (n) a += "&cursor=" + n;
try {
var o = await g(a);
if (o.status === 429 && r > 0) {
r--;
await new Promise(function(t) {
setTimeout(t, 1e3);
});
continue;
}
if (!o.ok) break;
var i = await o.json();
if (i.data) e = e.concat(i.data);
n = i.nextPageCursor;
if (!n) break;
r = 3;
} catch (t) {
break;
}
}
return e;
}
var b = false;
async function h(t) {
if (b) {
return {
ok: false,
error: "already_wearing"
};
}
b = true;
try {
var e = await m("https://avatar.roblox.com/v3/outfits/" + t + "/details", {});
if (!e.ok) {
var n = "Failed to fetch outfit details";
try {
var r = await e.json();
if (r && r.message) n = r.message;
} catch (t) {}
return {
ok: false,
error: n
};
}
var a = await e.json();
var o = [];
if (a.scale) {
var i = await m("https://avatar.roblox.com/v1/avatar/set-scales", a.scale);
o.push(i.ok);
}
if (a.bodyColors) {
var s = a.bodyColors.brickColorId !== undefined ? "https://avatar.roblox.com/v1/avatar/set-body-colors" : "https://avatar.roblox.com/v2/avatar/set-body-colors";
var i = await m(s, a.bodyColors);
o.push(i.ok);
}
if (a.playerAvatarType) {
var i = await m("https://avatar.roblox.com/v1/avatar/set-player-avatar-type", {
playerAvatarType: a.playerAvatarType
});
o.push(i.ok);
}
if (a.assets && a.assets.length > 0) {
var u = a.assets.map(function(t) {
return typeof t === "object" ? t.id : t;
});
var i = await m("https://avatar.roblox.com/v2/avatar/set-wearing-assets", {
assets: u
});
o.push(i.ok);
if (!i.ok) {
var c = a.assets.map(function(t) {
if (typeof t === "object") return t;
return {
id: t
};
});
var p = await m("https://avatar.roblox.com/v2/avatar/set-wearing-assets", {
assets: c
});
o.push(p.ok);
}
}
return {
ok: o.length === 0 || o.every(function(t) {
return t;
})
};
} catch (t) {
return {
ok: false,
error: t.message
};
} finally {
b = false;
}
}
function x() {
if (document.getElementById("purpura-outfits-styles")) return;
const t = document.createElement("style");
t.id = "purpura-outfits-styles";
t.textContent = `\n            #horizontal-tabs {\n                display: flex !important;\n                flex-wrap: nowrap !important;\n                width: 100% !important;\n            }\n            \n            #horizontal-tabs .rbx-tab {\n                flex: 1 1 auto !important;\n                min-width: 0 !important;\n            }\n            \n            #horizontal-tabs .rbx-tab-heading {\n                white-space: nowrap !important;\n                overflow: hidden !important;\n                text-overflow: ellipsis !important;\n                padding: 10px 8px !important;\n            }\n            \n            .purpura-outfits-tab {\n                position: relative;\n            }\n            \n            .purpura-outfits-panel {\n                display: none;\n                padding: 20px;\n                background: var(--go-bg);\n                border: 1px solid var(--go-border);\n                border-radius: 8px;\n                margin-top: 12px;\n            }\n            \n            .purpura-outfits-panel.active {\n                display: block;\n            }\n            \n            .purpura-outfits-header {\n                display: flex;\n                justify-content: space-between;\n                align-items: center;\n                margin-bottom: 16px;\n            }\n            \n            .purpura-outfits-title {\n                font-size: 18px;\n                font-weight: 600;\n                color: var(--go-text);\n                display: flex;\n                align-items: center;\n                gap: 8px;\n            }\n            \n            .purpura-outfits-count {\n                font-size: 13px;\n                color: var(--go-text-muted);\n                font-weight: 400;\n            }\n            \n            .purpura-outfits-grid {\n                display: grid;\n                grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));\n                gap: 12px;\n            }\n            \n            .purpura-outfit-card {\n                background: var(--go-surface);\n                border-radius: 8px;\n                padding: 12px;\n                cursor: pointer;\n                transition: all 0.2s ease;\n                border: 2px solid var(--go-border);\n                text-align: center;\n                box-shadow: var(--go-shadow);\n            }\n            \n            .purpura-outfit-card:hover {\n                border-color: var(--go-accent);\n                transform: translateY(-2px);\n                box-shadow: var(--go-shadow-hover);\n                background: var(--go-surface-secondary);\n            }\n            \n            .purpura-outfit-card.equipping {\n                opacity: 0.7;\n                pointer-events: none;\n            }\n            \n            .purpura-outfit-card.success {\n                border-color: var(--go-success-border);\n                background: var(--go-success-bg);\n            }\n            \n            .purpura-outfit-card.error {\n                border-color: var(--go-error-border);\n                background: var(--go-error-bg);\n            }\n            \n            .purpura-outfit-thumbnail {\n                width: 100%;\n                aspect-ratio: 1;\n                border-radius: 6px;\n                background: var(--go-surface-secondary);\n                margin-bottom: 8px;\n                overflow: hidden;\n            }\n            \n            .purpura-outfit-thumbnail img {\n                width: 100%;\n                height: 100%;\n                object-fit: cover;\n            }\n            \n            .purpura-outfit-name {\n                font-size: 12px;\n                font-weight: 500;\n                color: var(--go-text);\n                overflow: hidden;\n                text-overflow: ellipsis;\n                white-space: nowrap;\n            }\n            \n            .purpura-outfit-status {\n                font-size: 11px;\n                margin-top: 4px;\n                color: var(--go-text-muted);\n            }\n            \n            .purpura-outfits-empty {\n                text-align: center;\n                padding: 40px 20px;\n                color: var(--go-text-muted);\n            }\n            \n            .purpura-outfits-empty-text {\n                font-size: 14px;\n                margin-bottom: 8px;\n            }\n            \n            .purpura-outfits-empty-subtext {\n                font-size: 12px;\n                opacity: 0.7;\n            }\n            \n            .purpura-outfits-loading {\n                text-align: center;\n                padding: 40px 20px;\n                color: var(--go-text-muted);\n            }\n            \n            .purpura-outfits-loading-spinner {\n                width: 32px;\n                height: 32px;\n                border: 3px solid var(--go-surface-secondary);\n                border-top-color: var(--go-accent);\n                border-radius: 50%;\n                animation: purpura-spin 0.8s linear infinite;\n                margin: 0 auto 12px;\n            }\n            \n            @keyframes purpura-spin {\n                to { transform: rotate(360deg); }\n            }\n            \n            .purpura-outfits-refresh {\n                background: linear-gradient(135deg, var(--go-accent) 0%, var(--go-accent-hover) 100%);\n                color: white;\n                border: none;\n                padding: 8px 16px;\n                border-radius: 6px;\n                font-size: 12px;\n                font-weight: 500;\n                cursor: pointer;\n                transition: all 0.2s ease;\n                display: flex;\n                align-items: center;\n                gap: 6px;\n            }\n            \n            .purpura-outfits-refresh:hover {\n                transform: translateY(-1px);\n                box-shadow: 0 4px 12px var(--go-shadow-hover);\n            }\n            \n            .purpura-outfits-refresh:active {\n                transform: translateY(0);\n            }\n            \n            .purpura-outfits-rate-limited {\n                text-align: center;\n                padding: 40px 20px;\n                background: var(--go-error-bg);\n                border: 2px solid var(--go-error-border);\n                border-radius: 8px;\n            }\n            \n            .purpura-outfits-rate-limited-title {\n                font-size: 16px;\n                font-weight: 600;\n                color: var(--go-error-border);\n                margin-bottom: 8px;\n            }\n            \n            .purpura-outfits-rate-limited-text {\n                font-size: 13px;\n                color: var(--go-text-muted);\n                margin-bottom: 16px;\n            }\n            \n            .purpura-outfits-retry-btn {\n                background: linear-gradient(135deg, var(--go-error-border) 0%, var(--go-error-border) 100%);\n                color: white;\n                border: none;\n                padding: 10px 20px;\n                border-radius: 6px;\n                font-size: 13px;\n                font-weight: 500;\n                cursor: pointer;\n                transition: all 0.2s ease;\n            }\n            \n            .purpura-outfits-retry-btn:hover {\n                transform: translateY(-1px);\n                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);\n            }\n            \n            .purpura-outfit-card.no-thumbnail .purpura-outfit-thumbnail {\n                display: flex;\n                align-items: center;\n                justify-content: center;\n                background: var(--go-surface-secondary);\n            }\n            \n            .purpura-outfits-warning {\n                background: var(--go-warning-bg);\n                border: 1px solid var(--go-warning-border);\n                border-radius: 6px;\n                padding: 10px 14px;\n                margin-bottom: 16px;\n                display: flex;\n                align-items: center;\n                gap: 10px;\n                font-size: 12px;\n                color: var(--go-warning-text);\n            }\n            \n        `;
document.head.appendChild(t);
}
function y() {
const e = document.createElement("div");
e.id = "purpura-outfits-panel";
e.className = "purpura-outfits-panel";
e.innerHTML = `\n            <div class="purpura-outfits-header">\n                <div class="purpura-outfits-title">\n                    ${t("gameOutfits_outfits")}\n                    <span class="purpura-outfits-count"></span>\n                </div>\n                <button class="purpura-outfits-refresh" id="purpura-refresh-outfits" title="Try to avoid doing this too much, may cause heavy rate limiting.">\n                    Refresh\n                </button>\n            </div>\n            <div class="purpura-outfits-content">\n                <div class="purpura-outfits-loading">\n                    <div class="purpura-outfits-loading-spinner"></div>\n                    <div>${t("gameOutfits_loading")}</div>\n                </div>\n            </div>\n        `;
return e;
}
async function w(t) {
const e = {};
let n = false;
for (let r = 0; r < t.length; r += 100) {
const a = t.slice(r, r + 100);
const o = a.join(",");
let i = 3;
let s = false;
while (i > 0 && !s) {
try {
const t = await g(`https://thumbnails.roblox.com/v1/users/outfits?userOutfitIds=${o}&size=150x150&format=Png&isCircular=false`);
if (t.status === 429) {
i--;
if (i > 0) {
await new Promise(t => setTimeout(t, 1e3));
continue;
}
n = true;
break;
}
if (t.ok) {
const n = await t.json();
if (n.data) {
n.data.forEach(t => {
if (t.imageUrl) {
e[t.targetId] = t.imageUrl;
}
});
}
s = true;
} else {
s = true;
}
} catch (t) {
i--;
if (i > 0) {
await new Promise(t => setTimeout(t, 1e3));
continue;
}
n = true;
break;
}
}
if (r + 100 < t.length) {
await new Promise(t => setTimeout(t, 200));
}
}
return {
thumbnailMap: e,
wasRateLimited: n
};
}
function k(t, e) {
const n = t.querySelector(".purpura-outfits-content");
n.innerHTML = `\n            <div class="purpura-outfits-rate-limited">\n                <div class="purpura-outfits-rate-limited-title">Rate Limited by Roblox</div>\n                <div class="purpura-outfits-rate-limited-text">\n                    You've made too many requests. Please wait a moment before trying again.<br>\n                    This is a Roblox API limitation, not a Purpura issue.\n                </div>\n                <button class="purpura-outfits-retry-btn">Try Again</button>\n            </div>\n        `;
n.querySelector(".purpura-outfits-retry-btn").addEventListener("click", () => {
n.innerHTML = `\n                <div class="purpura-outfits-loading">\n                    <div class="purpura-outfits-loading-spinner"></div>\n                    <div>Loading outfits...</div>\n                </div>\n            `;
e();
});
}
async function L(e, n, r) {
const a = n.querySelector(".purpura-outfits-content");
const o = n.querySelector(".purpura-outfits-count");
o.textContent = `(${e.length})`;
if (e.length === 0) {
a.innerHTML = `\n                <div class="purpura-outfits-empty">\n                    <div class="purpura-outfits-empty-text">No outfits found</div>\n                    <div class="purpura-outfits-empty-subtext">Create outfits in the Avatar Editor to see them here</div>\n                </div>\n            `;
return;
}
const i = e.map(t => t.id);
const {thumbnailMap: s, wasRateLimited: u} = await w(i);
const c = document.createElement("div");
c.className = "purpura-outfits-grid";
let p = "";
if (u) {
p = `\n                <div class="purpura-outfits-warning">\n                    <span>Thumbnails unavailable due to rate limiting. Outfits still work!</span>\n                </div>\n            `;
}
e.forEach(e => {
const n = document.createElement("div");
n.className = "purpura-outfit-card";
n.dataset.outfitId = e.id;
const r = s[e.id];
if (!r) {
n.classList.add("no-thumbnail");
}
if (r) {
n.innerHTML = `\n                    <div class="purpura-outfit-thumbnail">\n                        <img src="${s[e.id]}" alt="${e.name}">\n                    </div>\n                    <div class="purpura-outfit-name" title="${e.name}">${e.name}</div>\n                    <div class="purpura-outfit-status">Click to equip</div>\n                `;
} else {
n.innerHTML = `\n                    <div class="purpura-outfit-thumbnail">\n                        <div style="font-size: 14px; color: var(--go-no-thumb-text); font-weight: 500;">No Image</div>\n                    </div>\n                    <div class="purpura-outfit-name" title="${e.name}">${e.name}</div>\n                    <div class="purpura-outfit-status">Click to equip</div>\n                `;
}
n.addEventListener("click", async () => {
if (n.classList.contains("equipping")) return;
n.classList.add("equipping");
n.querySelector(".purpura-outfit-status").textContent = "Equipping...";
const r = await h(e.id);
n.classList.remove("equipping");
if (r.ok) {
n.classList.add("success");
n.querySelector(".purpura-outfit-status").textContent = t("gameOutfits_equipped");
setTimeout(() => {
n.classList.remove("success");
n.querySelector(".purpura-outfit-status").textContent = "Click to equip";
}, 2e3);
} else {
n.classList.add("error");
n.querySelector(".purpura-outfit-status").textContent = t("gameOutfits_failed");
setTimeout(() => {
n.classList.remove("error");
n.querySelector(".purpura-outfit-status").textContent = "Click to equip";
}, 2e3);
}
});
c.appendChild(n);
});
a.innerHTML = p;
a.appendChild(c);
}
async function T(t) {
const e = () => T(t);
const n = await l();
if (!n) {
const e = t.querySelector(".purpura-outfits-content");
e.innerHTML = `\n                <div class="purpura-outfits-empty">\n                    <div class="purpura-outfits-empty-text">Please log in</div>\n                    <div class="purpura-outfits-empty-subtext">You need to be logged in to view your outfits</div>\n                </div>\n            `;
return;
}
const r = await v(n);
await L(r, t, e);
}
function q() {
if (n) return;
const e = document.querySelector("#horizontal-tabs");
if (!e) return;
if (document.getElementById("tab-purpura-outfits")) {
n = true;
return;
}
x();
const r = document.createElement("li");
r.id = "tab-purpura-outfits";
r.className = "rbx-tab purpura-outfits-tab";
r.innerHTML = `\n            <a class="rbx-tab-heading" href="#purpura-outfits">\n                <span class="text-lead">${t("gameOutfits_outfits")}</span>\n            </a>\n        `;
const a = document.getElementById("tab-game-instances");
if (a) {
a.after(r);
} else {
e.appendChild(r);
}
const o = y();
const i = document.querySelector(".tab-content") || document.querySelector(".rbx-tabs-content");
if (i) {
i.appendChild(o);
} else {
const t = e.closest(".game-about-container") || e.parentElement;
if (t) {
t.appendChild(o);
}
}
r.addEventListener("click", t => {
t.preventDefault();
e.querySelectorAll(".rbx-tab").forEach(t => t.classList.remove("active"));
document.querySelectorAll(".tab-pane, .purpura-outfits-panel").forEach(t => {
t.classList.remove("active", "in");
});
r.classList.add("active");
o.classList.add("active");
if (!o.dataset.loaded) {
o.dataset.loaded = "true";
T(o);
}
});
e.querySelectorAll(".rbx-tab:not(#tab-purpura-outfits)").forEach(t => {
t.addEventListener("click", () => {
r.classList.remove("active");
o.classList.remove("active");
});
});
o.querySelector("#purpura-refresh-outfits").addEventListener("click", () => {
o.querySelector(".purpura-outfits-content").innerHTML = `\n                <div class="purpura-outfits-loading">\n                    <div class="purpura-outfits-loading-spinner"></div>\n                    <div>Loading outfits...</div>\n                </div>\n            `;
T(o);
});
n = true;
}
function C() {
const t = document.getElementById("tab-purpura-outfits");
const e = document.getElementById("purpura-outfits-panel");
const r = document.getElementById("purpura-outfits-styles");
if (t) t.remove();
if (e) e.remove();
if (r) r.remove();
n = false;
}
function E() {
if (s) return;
if (!d() || !e) return;
s = true;
const t = setInterval(() => {
const e = document.querySelector("#horizontal-tabs");
if (e) {
clearInterval(t);
q();
}
}, 500);
setTimeout(() => clearInterval(t), 1e4);
p();
}
function S() {
s = false;
C();
}
chrome.storage.sync.get([ "go" ], t => {
const n = window.__PurpuraSettings ? window.__PurpuraSettings.get("go") : t["go"];
if (typeof n === "object") {
e = n.enabled !== undefined ? n.enabled : true;
} else {
e = n !== undefined ? n : true;
}
if (e && d()) {
E();
}
});
chrome.storage.onChanged.addListener((t, n) => {
if (n !== "sync" || !t["go"]) return;
const r = window.__PurpuraSettings ? window.__PurpuraSettings.get("go") : t["go"].newValue;
if (typeof r === "object") {
e = r.enabled !== undefined ? r.enabled : true;
} else {
e = r;
}
S();
if (e && d()) {
E();
}
});
let P = location.href;
new MutationObserver(() => {
const t = location.href;
if (t !== P) {
P = t;
n = false;
setTimeout(() => {
E();
}, 1e3);
}
}).observe(document, {
subtree: true,
childList: true
});
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", E);
} else {
E();
}
})();
