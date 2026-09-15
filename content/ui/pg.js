/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
if (!window.pinnedGamesInitialized) {
window.pinnedGamesInitialized = true;
(() => {
function e(e, n) {
return chrome.i18n.getMessage(e, n) || e;
}
let n = [];
let t = [];
let o = null;
let r = null;
let a = null;
let i = [];
let s = 0;
let l = 0;
const c = 2e3;
const d = 6e4;
const p = 4 * 60 * 60 * 1e3;
const g = new Map;
const u = 45e3;
const f = new Map;
const m = 5 * 60 * 1e3;
let b = null;
const h = 300;
let x = "dark";
let y = null;
k();
async function v() {
try {
const e = await chrome.runtime.sendMessage({
action: "getRobloxTheme"
});
x = e?.theme || "dark";
} catch (e) {}
w();
if (y) y.disconnect();
y = new MutationObserver(async () => {
try {
const e = await chrome.runtime.sendMessage({
action: "getRobloxTheme"
});
const n = e?.theme || "dark";
if (n !== x) {
x = n;
w();
}
} catch (e) {}
});
const e = {
attributes: true,
attributeFilter: [ "class" ]
};
y.observe(document.documentElement, e);
if (document.body) y.observe(document.body, e);
}
function w() {
const e = x === "light";
let n = document.getElementById("purpura-pinned-games-vars");
if (!n) {
n = document.createElement("style");
n.id = "purpura-pinned-games-vars";
document.head.appendChild(n);
}
n.textContent = `\n            :root {\n                --pg-bg: ${e ? "rgba(255, 255, 255, 0.55)" : "rgba(15, 7, 25, 0.35)"};\n                --pg-card-bg: ${e ? "rgba(255, 255, 255, 0.65)" : "rgba(255, 255, 255, 0.05)"};\n                --pg-card-hover: ${e ? "rgba(255, 255, 255, 0.9)" : "rgba(138, 43, 226, 0.18)"};\n                --pg-text: ${e ? "#0f172a" : "#f8fafc"};\n                --pg-muted: ${e ? "#475569" : "#94a3b8"};\n                --pg-accent: #8A2BE2;\n                --pg-accent-muted: rgba(138, 43, 226, 0.4);\n                --pg-border: ${e ? "rgba(0, 0, 0, 0.14)" : "rgba(138, 43, 226, 0.3)"};\n                --pg-shadow: ${e ? "0 16px 48px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.8), inset 1px 0 0 rgba(255,255,255,0.8)" : "0 12px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1), inset 1px 0 0 rgba(255,255,255,0.1)"};\n                --pg-glass: blur(45px) saturate(${e ? "140%" : "180%"});\n                --pg-input-bg: ${e ? "rgba(0, 0, 0, 0.04)" : "rgba(255, 255, 255, 0.05)"};\n                --pg-tooltip-bg: ${e ? "rgba(255, 255, 255, 0.98)" : "rgba(15, 7, 25, 0.9)"};\n                --pg-chip-count-bg: ${e ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.1)"};\n            }\n            .pinned-games-carousel * { box-sizing: border-box; }\n        `;
K();
}
async function k() {
await window.__PurpuraSettings.ready;
if (!window.__PurpuraSettings.get("pg")) return;
v();
const e = await chrome.storage.local.get([ "pinnedGamesList", "pinnedGamesFolders" ]);
n = e.pinnedGamesList || [];
t = e.pinnedGamesFolders || [];
let o = false;
n.forEach(e => {
if (e.folderId !== undefined && !e.folderIds) {
e.folderIds = e.folderId ? [ e.folderId ] : [];
delete e.folderId;
o = true;
} else if (!e.folderIds) {
e.folderIds = [];
o = true;
}
});
if (o) {
await chrome.storage.local.set({
pinnedGamesList: n
});
}
O();
const r = window.location.href;
if (r.includes("/games/")) {
E();
} else if (D(r)) {
W();
} else if (V(r)) {
J();
}
}
function E() {
const e = document.querySelector(".favorite-follow-vote-share");
if (!e) {
setTimeout(E, 1e3);
return;
}
L(e);
}
function L(t) {
if (t.querySelector(".pin-game-button-container")) return;
const o = t.querySelector(".game-favorite-button-container");
if (!o) return;
const r = ve();
if (!r) return;
const a = document.createElement("li");
a.className = "pin-game-button-container";
a.style.cssText = `\n            display: inline-flex;\n            align-items: center;\n            margin: 0;\n            padding: 0;\n            list-style: none;\n            vertical-align: middle;\n        `;
const i = n.some(e => e.id === r);
a.innerHTML = `\n            <div class="tooltip-container" data-toggle="tooltip" data-original-title="${i ? e("pinnedGames_unpin") : e("pinnedGames_pinAction")}">\n                <button class="btn-secondary-xs btn-min-width pin-game-btn" data-game-id="${r}" style="\n                    background: transparent;\n                    border: none;\n                    color: white;\n                    display: flex;\n                    flex-direction: column;\n                    align-items: center;\n                    justify-content: center;\n                    gap: 4px;\n                    padding: 8px 6px;\n                    border-radius: 3px;\n                    font-size: 12px;\n                    font-weight: 400;\n                    cursor: pointer;\n                    transition: all 0.2s ease;\n                    min-height: 48px;\n                    min-width: 48px;\n                    opacity: 0.8;\n                    margin: 0;\n                ">\n                    <svg class="pin-icon" width="20" height="20" viewBox="0 0 24 24" fill="${i ? "white" : "none"}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n                        <path d="M16 12V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v8L6 14v2h5v6l1-1 1 1v-6h5v-2l-2-2z"/>\n                    </svg>\n                    <span class="btn-text" style="font-size: 12px; line-height: 1; text-align: center; width: 100%; display: block; margin: 0; padding: 0;">${i ? e("pinnedGames_pinned") : e("pinnedGames_pinAction")}</span>\n                </button>\n            </div>\n        `;
const s = a.querySelector(".pin-game-btn");
s.addEventListener("click", () => C(r, s));
s.addEventListener("mouseenter", () => {
s.style.opacity = "1";
s.style.transform = "scale(1.05)";
s.style.transition = "all 0.2s ease";
});
s.addEventListener("mouseleave", () => {
s.style.transform = "scale(1)";
if (s.classList.contains("pinned")) {
s.style.opacity = "1";
} else {
s.style.opacity = "0.8";
}
});
if (typeof $ !== "undefined" && $.fn.tooltip) {
$(tooltipContainer).tooltip();
}
o.parentNode.insertBefore(a, o);
S();
if (i) {
s.classList.add("pinned");
s.style.opacity = "1";
const n = s.querySelector(".pin-icon");
const t = s.querySelector(".btn-text");
const o = s.querySelector(".tooltip-container");
if (n) {
n.setAttribute("fill", "#FFFFFF");
n.setAttribute("stroke", "#FFFFFF");
}
if (t) t.textContent = e("pinnedGames_pinned");
if (o) o.setAttribute("data-original-title", e("pinnedGames_unpin"));
}
}
function S() {
const e = document.createElement("style");
e.textContent = `\n            .favorite-follow-vote-share {\n                display: flex !important;\n                align-items: center !important;\n                gap: 12px !important;\n                flex-wrap: nowrap !important;\n            }\n            \n            #voting-section {\n                display: revert !important;\n                flex: none !important;\n            }\n            \n            .pin-game-button-container,\n            .game-favorite-button-container,\n            .game-follow-button-container {\n                display: inline-flex !important;\n                align-items: center !important;\n                justify-content: center !important;\n                margin: 0 !important;\n                padding: 0 !important;\n                width: auto !important;\n                height: auto !important;\n                min-width: 48px !important;\n                min-height: 48px !important;\n            }\n            \n            .game-favorite-button-container .tooltip-container,\n            .game-follow-button-container .tooltip-container {\n                width: 100% !important;\n                height: 100% !important;\n                display: flex !important;\n                align-items: center !important;\n                justify-content: center !important;\n            }\n            \n            .game-favorite-button-container .favorite-button,\n            .game-follow-button-container .follow-button {\n                width: 100% !important;\n                height: 100% !important;\n                display: flex !important;\n                align-items: center !important;\n                justify-content: center !important;\n                min-width: 48px !important;\n                min-height: 48px !important;\n            }\n            \n            .game-favorite-button-container .favorite-button a,\n            .game-follow-button-container .follow-button a {\n                width: 100% !important;\n                height: 100% !important;\n                display: flex !important;\n                flex-direction: column !important;\n                align-items: center !important;\n                justify-content: center !important;\n                gap: 4px !important;\n                padding: 8px 6px !important;\n                text-decoration: none !important;\n            }\n        `;
if (!document.querySelector("#pinned-games-button-fix-style")) {
e.id = "pinned-games-button-fix-style";
document.head.appendChild(e);
}
}
async function C(t, o) {
const r = await we(t);
if (!r) {
return;
}
const a = n.some(e => e.id === t);
if (a) {
n = n.filter(e => e.id !== t);
o.classList.remove("pinned");
o.style.opacity = "0.8";
const r = o.querySelector(".btn-text");
const a = o.querySelector(".pin-icon");
const i = o.querySelector(".tooltip-container");
if (r) r.textContent = e("pinnedGames_pinAction");
if (a) {
a.setAttribute("fill", "none");
a.setAttribute("stroke", "white");
}
if (i) {
i.setAttribute("data-original-title", e("pinnedGames_pinAction"));
if (typeof $ !== "undefined" && $.fn.tooltip) {
$(i).tooltip("dispose").tooltip();
}
}
} else {
n.push(r);
o.classList.add("pinned");
o.style.opacity = "1";
const t = o.querySelector(".btn-text");
const a = o.querySelector(".pin-icon");
const i = o.querySelector(".tooltip-container");
if (t) t.textContent = e("pinnedGames_pinned");
if (a) {
a.setAttribute("fill", "#FFFFFF");
a.setAttribute("stroke", "#FFFFFF");
}
if (i) {
i.setAttribute("data-original-title", e("pinnedGames_unpin"));
if (typeof $ !== "undefined" && $.fn.tooltip) {
$(i).tooltip("dispose").tooltip();
}
}
}
await chrome.storage.local.set({
pinnedGamesList: n
});
}
async function z(e) {
n = e;
await chrome.storage.local.set({
pinnedGamesList: n
});
}
async function q(e, n = "#8A2BE2") {
const o = {
id: Date.now().toString(),
name: e,
color: n,
gameIds: [],
collapsed: false
};
t.push(o);
await chrome.storage.local.set({
pinnedGamesFolders: t
});
return o;
}
async function T(e) {
const o = t.find(n => n.id === e);
if (!o) return;
n.forEach(n => {
if (n.folderIds) {
n.folderIds = n.folderIds.filter(n => n !== e);
}
});
t = t.filter(n => n.id !== e);
await chrome.storage.local.set({
pinnedGamesFolders: t,
pinnedGamesList: n
});
}
async function I(e, n) {
const o = t.find(n => n.id === e);
if (!o) return;
Object.assign(o, n);
await chrome.storage.local.set({
pinnedGamesFolders: t
});
}
async function G(e, n) {
await j(e, n);
}
async function j(e, t) {
const o = n.find(n => n.id === e);
if (!o) return;
if (!o.folderIds) o.folderIds = [];
if (t === null) {
o.folderIds = [];
} else {
if (o.folderIds.includes(t)) {
o.folderIds = o.folderIds.filter(e => e !== t);
} else {
o.folderIds.push(t);
}
}
await chrome.storage.local.set({
pinnedGamesList: n
});
}
function M(e) {
if (e === null) {
return n;
}
return n.filter(n => n.folderIds && n.folderIds.includes(e));
}
function _(e) {
if (e === null) return "All Games";
const n = t.find(n => n.id === e);
return n ? n.name : "Unknown";
}
async function F(e, t) {
const r = n.find(n => n.id === e);
const a = t !== null && r?.folderIds?.includes(t);
const i = o !== null && a && t === o;
const s = document.querySelector(`[data-game-id="${e}"]`);
if (s && i) {
s.style.transition = "all 0.4s cubic-bezier(0.4, 0, 1, 1)";
s.style.opacity = "0";
s.style.transform = "scale(0.8) translateY(-20px)";
await new Promise(e => setTimeout(e, 400));
s.remove();
}
await j(e, t);
A();
de();
}
function A() {
const e = document.querySelector(".folder-navigation");
if (!e) return;
const n = e.querySelectorAll(".folder-btn");
n.forEach(e => {
const n = e.dataset.folderId === "null" ? null : e.dataset.folderId;
const t = M(n).length;
const o = e.querySelector("span:last-child");
if (o) {
o.textContent = t;
}
});
}
let B = null;
let H = null;
let N = false;
let P = null;
function D(e) {
return e === "https://www.roblox.com/home" || e === "https://www.roblox.com/" || e === "https://www.roblox.com";
}
function V(e) {
return e.startsWith("https://www.roblox.com/charts");
}
function Y() {
if (!P) return;
clearInterval(P);
P = null;
}
function R() {
if (P) return;
P = setInterval(() => {
if (document.visibilityState !== "visible") return;
if (n.length === 0) return;
const e = window.location.href;
if (D(e)) {
if (!document.querySelector(".pinned-games-carousel")) {
const e = document.querySelector(".friend-carousel-container");
if (e) se(e, "afterend");
}
} else if (V(e)) {
if (!document.querySelector(".pinned-games-carousel")) {
const e = document.querySelector(".filters-container");
if (e) se(e, "afterend");
}
}
}, 2200);
}
function O() {
if (N) return;
N = true;
const e = window.location.href;
if (D(e) || V(e)) {
R();
}
let n = window.location.href;
let t = null;
const o = () => {
const e = window.location.href;
if (e === n) return;
n = e;
if (t) clearTimeout(t);
t = setTimeout(() => U(e), 200);
};
const r = history.pushState.bind(history);
history.pushState = function(...e) {
r(...e);
setTimeout(o, 50);
};
const a = history.replaceState.bind(history);
history.replaceState = function(...e) {
a(...e);
setTimeout(o, 50);
};
window.addEventListener("popstate", () => setTimeout(o, 50));
document.addEventListener("visibilitychange", () => {
const e = window.location.href;
if (document.visibilityState === "visible" && (D(e) || V(e))) {
R();
} else if (document.visibilityState !== "visible") {
Y();
}
});
}
function U(e) {
const n = D(e);
const t = V(e);
if (!n && B) {
B.disconnect();
B = null;
}
if (!t && H) {
H.disconnect();
H = null;
}
const o = document.querySelector(".pinned-games-carousel");
if (o) o.remove();
if (r) {
clearInterval(r);
r = null;
}
if (a) {
clearInterval(a);
a = null;
}
if (!n && !t) {
Y();
return;
}
R();
if (n) W(); else if (t) J();
}
function X(e, t, o, r) {
if (r === "home") {
if (B) {
B.disconnect();
B = null;
}
} else {
if (H) {
H.disconnect();
H = null;
}
}
let a = null;
const i = () => {
if (!o()) return;
if (n.length === 0) return;
if (document.querySelector(".pinned-games-carousel")) return;
const t = e();
if (t) {
se(t, "afterend");
return;
}
setTimeout(i, 300);
};
i();
const s = new MutationObserver(r => {
if (!o() || n.length === 0) return;
if (document.querySelector(".pinned-games-carousel")) return;
if (a) return;
a = setTimeout(() => {
a = null;
if (!o() || n.length === 0) return;
if (document.querySelector(".pinned-games-carousel")) return;
const i = e();
if (i) {
se(i, "afterend");
return;
}
for (const e of r) {
for (const n of e.addedNodes) {
if (n.nodeType !== 1) continue;
const e = n.classList?.contains(t) ? n : n.querySelector?.("." + t);
if (e) {
se(e, "afterend");
return;
}
}
}
}, 80);
});
s.observe(document.body, {
childList: true,
subtree: true
});
if (r === "home") B = s; else H = s;
}
function W() {
X(() => document.querySelector(".friend-carousel-container"), "friend-carousel-container", () => D(window.location.href), "home");
}
function J() {
X(() => document.querySelector(".filters-container"), "filters-container", () => V(window.location.href), "charts");
}
function K() {
if (document.getElementById("pgf-styles")) return;
const e = document.createElement("style");
e.id = "pgf-styles";
e.textContent = `            .pgf-nav {\n                display: flex;\n                gap: 8px;\n                align-items: center;\n                margin-bottom: 16px;\n                padding: 6px;\n                background: var(--pg-input-bg);\n                border: 1px solid var(--pg-border);\n                border-radius: 10px;\n                overflow-x: auto;\n                scrollbar-width: none;\n            }\n            .pgf-nav::-webkit-scrollbar { display: none; }\n            .pgf-chip-wrap { position: relative; flex-shrink: 0; }\n            .pgf-chip {\n                display: flex;\n                align-items: center;\n                gap: 6px;\n                padding: 6px 12px;\n                border-radius: 8px;\n                border: 1px solid var(--pg-border);\n                background: var(--pg-card-bg);\n                color: var(--pg-text);\n                font-size: 13px;\n                font-weight: 500;\n                cursor: pointer;\n                white-space: nowrap;\n                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n            }\n            .pgf-chip:hover {\n                background: var(--pg-hover-bg, rgba(138,43,226,0.15));\n                border-color: var(--pg-color, var(--pg-accent));\n                transform: translateY(-1px);\n                box-shadow: 0 4px 12px rgba(0,0,0,0.1);\n            }\n            .pgf-chip.active {\n                background: var(--pg-active-bg, rgba(138,43,226,0.25));\n                border-color: var(--pg-color, var(--pg-accent));\n                color: var(--pg-text);\n                font-weight: 700;\n                box-shadow: inset 0 0 0 1px var(--pg-color, var(--pg-accent));\n            }\n            .pgf-chip-icon { display: flex; align-items: center; flex-shrink: 0; opacity: 0.8; }\n            .pgf-chip-count {\n                background: var(--pg-chip-count-bg);\n                border: 1px solid var(--pg-border);\n                border-radius: 12px;\n                padding: 0 8px;\n                font-size: 11px;\n                font-weight: 800;\n                min-width: 22px;\n                text-align: center;\n                line-height: 20px;\n                height: 20px;\n                opacity: 0.9;\n                color: var(--pg-text);\n            }\n            .pgf-actions {\n                position: absolute;\n                top: -8px;\n                right: -6px;\n                display: none;\n                gap: 3px;\n                z-index: 2;\n            }\n            .pgf-chip-wrap:hover .pgf-actions { display: flex; }\n            .pgf-action-btn {\n                width: 18px;\n                height: 18px;\n                border-radius: 50%;\n                border: 1px solid rgba(255,255,255,0.1);\n                cursor: pointer;\n                display: flex;\n                align-items: center;\n                justify-content: center;\n                font-size: 10px;\n                padding: 0;\n                transition: all 0.2s ease;\n                box-shadow: 0 2px 6px rgba(0,0,0,0.2);\n            }\n            .pgf-action-btn.edit { background: #8b5cf6; color: white; }\n            .pgf-action-btn.del  { background: #ef4444; color: white; }\n            .pgf-action-btn:hover { transform: scale(1.15); filter: brightness(1.1); }\n            .pgf-new-btn {\n                flex-shrink: 0;\n                width: 32px;\n                height: 32px;\n                border-radius: 8px;\n                border: 1px dashed var(--pg-accent-muted);\n                background: var(--pg-input-bg);\n                color: var(--pg-accent);\n                cursor: pointer;\n                display: flex;\n                align-items: center;\n                justify-content: center;\n                transition: all 0.2s ease;\n            }\n            .pgf-new-btn:hover { \n                background: var(--pg-accent-muted); \n                border-color: var(--pg-accent); \n                color: white; \n                transform: rotate(90deg);\n            }\n            .pgf-modal-backdrop {\n                position: fixed;\n                inset: 0;\n                background: rgba(0,0,0,0.5);\n                backdrop-filter: blur(8px);\n                z-index: 100000;\n                display: flex;\n                align-items: center;\n                justify-content: center;\n                animation: pgf-fade 0.3s ease;\n            }\n            .pgf-modal {\n                background: var(--pg-bg);\n                backdrop-filter: var(--pg-glass);\n                border: 1px solid var(--pg-border);\n                border-radius: 20px;\n                padding: 24px;\n                width: 340px;\n                color: var(--pg-text);\n                animation: pgf-up 0.4s cubic-bezier(0.16, 1, 0.3, 1);\n                box-shadow: var(--pg-shadow);\n            }\n            .pgf-modal-title {\n                font-size: 16px;\n                font-weight: 700;\n                color: var(--pg-accent);\n                margin: 0 0 20px;\n                display: flex;\n                align-items: center;\n                gap: 10px;\n            }\n            .pgf-modal-label { font-size: 12px; font-weight: 600; color: var(--pg-muted); margin-bottom: 8px; }\n            .pgf-modal-input {\n                width: 100%;\n                padding: 12px 14px;\n                border-radius: 12px;\n                border: 1px solid var(--pg-border);\n                background: var(--pg-input-bg);\n                color: var(--pg-text);\n                font-size: 14px;\n                outline: none;\n                box-sizing: border-box;\n                margin-bottom: 20px;\n                transition: all 0.2s ease;\n            }\n            .pgf-modal-input:focus { border-color: var(--pg-accent); box-shadow: 0 0 0 2px var(--pg-accent-muted); }\n            .pgf-color-grid { display: grid; grid-template-columns: repeat(6,1fr); gap: 10px; margin-bottom: 24px; }\n            .pgf-swatch {\n                aspect-ratio: 1;\n                border-radius: 10px;\n                cursor: pointer;\n                border: 2px solid transparent;\n                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);\n            }\n            .pgf-swatch:hover { transform: scale(1.15) rotate(5deg); }\n            .pgf-swatch.selected { border-color: var(--pg-text); transform: scale(1.1); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }\n            .pgf-modal-footer { display: flex; gap: 12px; }\n            .pgf-btn {\n                flex: 1;\n                padding: 12px;\n                border-radius: 12px;\n                font-size: 14px;\n                font-weight: 700;\n                border: none;\n                cursor: pointer;\n                transition: all 0.2s ease;\n            }\n            .pgf-btn-primary:hover { transform: translateY(-2px); background: #9d4edd; filter: brightness(1.1); box-shadow: 0 8px 24px var(--pg-accent-muted); }\n            .pgf-btn-ghost:hover { background: rgba(138, 43, 226, 0.12); border-color: var(--pg-accent); color: var(--pg-text); transform: translateY(-1px); }\n            .pgf-btn-danger:hover { transform: translateY(-2px); background: #ef4444; border-color: #ef4444; color: white; box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4); }\n            @keyframes pgf-fade { from { opacity:0; } to { opacity:1; } }\n            @keyframes pgf-up { from { opacity:0; transform:translateY(20px) scale(0.95); } to { opacity:1; transform:none; } }\n            @keyframes pgf-fade-in { 0% { opacity: 0; transform: translateY(12px) scale(0.98); } 100% { opacity: 1; transform: translateY(0) scale(1); } }`;
document.head.appendChild(e);
}
function Q() {
K();
const e = document.createElement("div");
e.className = "pgf-nav";
e.appendChild(Z("All Games", null, "#8A2BE2", M(null).length));
t.forEach(n => e.appendChild(Z(n.name, n.id, n.color, M(n.id).length)));
const n = document.createElement("button");
n.className = "pgf-new-btn";
n.title = "New folder";
n.innerHTML = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>`;
n.addEventListener("click", () => oe());
e.appendChild(n);
return e;
}
function Z(e, n, t, r) {
const a = o === n;
const i = n === null;
const s = i ? "#a78bfa" : t;
const l = ee(s);
const c = document.createElement("div");
c.className = "pgf-chip-wrap";
const d = document.createElement("button");
d.className = `pgf-chip${a ? " active" : ""}${i ? " pgf-chip-all" : ""}`;
d.dataset.folderId = n || "null";
d.style.cssText = `--pgf-color:${s};--pgf-hover-bg:rgba(${l},0.18);--pgf-active-bg:rgba(${l},0.27);`;
const p = `<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="0" y="0" width="5" height="5" rx="1"/><rect x="7" y="0" width="5" height="5" rx="1"/><rect x="0" y="7" width="5" height="5" rx="1"/><rect x="7" y="7" width="5" height="5" rx="1"/></svg>`;
const g = `<svg width="13" height="11" viewBox="0 0 22 18" fill="currentColor"><path d="M9 0H2C.9 0 0 .9 0 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2h-9L9 0z"/></svg>`;
const u = i ? p : g;
d.innerHTML = `<span class="pgf-chip-icon" style="color:${s};">${u}</span><span>${e}</span><span class="pgf-chip-count">${r}</span>`;
d.addEventListener("click", () => ne(n));
c.appendChild(d);
if (n !== null) {
const e = document.createElement("div");
e.className = "pgf-actions";
e.innerHTML = `<button class="pgf-action-btn edit" title="Edit">✎</button><button class="pgf-action-btn del" title="Delete">✕</button>`;
e.querySelector(".edit").addEventListener("click", e => {
e.stopPropagation();
ie(n);
});
e.querySelector(".del").addEventListener("click", e => {
e.stopPropagation();
ae(n);
});
c.appendChild(e);
}
return c;
}
function ee(e) {
const n = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);
return n ? `${parseInt(n[1], 16)}, ${parseInt(n[2], 16)}, ${parseInt(n[3], 16)}` : "138, 43, 226";
}
function ne(e) {
o = e;
de();
}
function te({title: n, nameValue: t, colorValue: o, confirmLabel: r, confirmClass: a, onConfirm: i}) {
const s = [ "#8A2BE2", "#7c3aed", "#2563eb", "#0891b2", "#059669", "#16a34a", "#ca8a04", "#ea580c", "#dc2626", "#db2777", "#9333ea", "#4f46e5" ];
K();
const l = o || s[0];
const c = document.createElement("div");
c.className = "pgf-modal-backdrop";
const d = document.createElement("div");
d.className = "pgf-modal";
d.innerHTML = `\n            <div class="pgf-modal-title">${n}</div>\n            <div class="pgf-modal-label">${e("pinnedGames_folderName")}</div>\n            <input class="pgf-modal-input pgf-name-inp" type="text" value="${t || ""}" placeholder="${e("pinnedGames_folderNamePlaceholder")}" maxlength="30">\n            <div class="pgf-modal-label">${e("pinnedGames_color")}</div>\n            <div class="pgf-color-grid">${s.map(e => `<div class="pgf-swatch${e === l ? " selected" : ""}" data-color="${e}" style="background:${e};"></div>`).join("")}</div>\n            <div class="pgf-modal-footer">\n                <button class="pgf-btn ${a || "pgf-btn-primary"} pgf-confirm-btn">${r}</button>\n                <button class="pgf-btn pgf-btn-ghost pgf-cancel-btn">${e("pinnedGames_cancel")}</button>\n            </div>\n        `;
c.appendChild(d);
document.body.appendChild(c);
let p = l;
d.querySelectorAll(".pgf-swatch").forEach(e => {
e.addEventListener("click", () => {
d.querySelectorAll(".pgf-swatch").forEach(e => e.classList.remove("selected"));
e.classList.add("selected");
p = e.dataset.color;
});
});
const g = d.querySelector(".pgf-name-inp");
g.focus();
g.select();
const u = () => c.remove();
d.querySelector(".pgf-cancel-btn").addEventListener("click", u);
c.addEventListener("click", e => {
if (e.target === c) u();
});
const f = async () => {
const e = g.value.trim();
if (!e) {
g.focus();
return;
}
u();
await i(e, p);
};
d.querySelector(".pgf-confirm-btn").addEventListener("click", f);
g.addEventListener("keydown", e => {
if (e.key === "Enter") f();
if (e.key === "Escape") u();
});
}
function oe(n = null) {
te({
title: e("pinnedGames_newFolder"),
confirmLabel: e("pinnedGames_add"),
onConfirm: async (e, t) => {
const o = await q(e, t);
if (n && o) {
await F(n, o.id);
} else {
de();
}
}
});
}
function re(e, n, t) {
ie(e);
}
function ae(n) {
const r = t.find(e => e.id === n);
if (!r) return;
K();
const a = M(r.id).length;
const i = document.createElement("div");
i.className = "pgf-modal-backdrop";
const s = document.createElement("div");
s.className = "pgf-modal";
s.innerHTML = `\n            <div class="pgf-modal-title" style="color:#f87171;">\n                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>\n                ${e("pinnedGames_deleteFolderTitle")}\n            </div>\n            <div class="pgf-modal-body">${e("pinnedGames_deleteFolderConfirm", [ '<strong style="color:' + r.color + ';">' + r.name + "</strong>" ])}</div>\n            <div class="pgf-modal-sub">${a > 0 ? e("pinnedGames_deleteMovedToAll", [ a, a === 1 ? "" : "s" ]) : e("pinnedGames_deleteFolderEmpty")}</div>\n            <div class="pgf-modal-footer">\n                <button class="pgf-btn pgf-btn-danger pgf-confirm-btn">${e("pinnedGames_delete")}</button>\n                <button class="pgf-btn pgf-btn-ghost pgf-cancel-btn">${e("pinnedGames_cancel")}</button>\n            </div>\n        `;
i.appendChild(s);
document.body.appendChild(i);
const l = () => i.remove();
i.addEventListener("click", e => {
if (e.target === i) l();
});
s.querySelector(".pgf-cancel-btn").addEventListener("click", l);
s.querySelector(".pgf-confirm-btn").addEventListener("click", async () => {
l();
await T(n);
if (o === n) o = null;
de();
});
document.addEventListener("keydown", function e(n) {
if (n.key === "Escape") {
l();
document.removeEventListener("keydown", e);
}
});
}
function ie(n) {
const o = t.find(e => e.id === n);
if (!o) return;
te({
title: e("pinnedGames_editFolder"),
nameValue: o.name,
colorValue: o.color,
confirmLabel: e("pinnedGames_save"),
onConfirm: async (e, t) => {
await I(n, {
name: e,
color: t
});
de();
}
});
}
function se(n, t) {
if (document.querySelector(".pinned-games-carousel")) return;
const r = document.createElement("div");
r.className = "pinned-games-carousel";
r.style.cssText = `\n            margin: 24px 0;\n            padding: 24px;\n            background: var(--pg-bg);\n            backdrop-filter: var(--pg-glass);\n            -webkit-backdrop-filter: var(--pg-glass);\n            border-radius: 20px;\n            border: 1px solid var(--pg-border);\n            box-shadow: var(--pg-shadow);\n            position: relative;\n            overflow: visible;\n            animation: pgf-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);\n            box-sizing: border-box;\n        `;
const a = document.createElement("div");
a.style.cssText = `\n            display: flex;\n            justify-content: space-between;\n            align-items: center;\n            margin-bottom: 12px;\n        `;
const s = document.createElement("div");
s.style.cssText = "display:flex;align-items:center;gap:10px;";
s.innerHTML = `\n            <h3 style="\n                color: var(--pg-accent);\n                margin: 0;\n                font-size: 1.4rem;\n                font-weight: 800;\n                letter-spacing: -0.02em;\n            ">${e("pinnedGames_pinnedGamesHeader")}</h3>\n            <div class="pgf-help-btn" style="\n                position: relative;\n                display: inline-flex;\n                align-items: center;\n                justify-content: center;\n                width: 16px;\n                height: 16px;\n                border-radius: 50%;\n                border: 1px solid var(--pg-border);\n                background: var(--pg-input-bg);\n                color: var(--pg-accent);\n                font-size: 10px;\n                font-weight: 700;\n                cursor: default;\n                flex-shrink: 0;\n                user-select: none;\n            " data-pgf-help>?<div style="\n                display: none;\n                position: absolute;\n                bottom: calc(100% + 10px);\n                left: 50%;\n                transform: translateX(-50%);\n                background: var(--pg-tooltip-bg);\n                backdrop-filter: blur(20px);\n                border: 1px solid var(--pg-border);\n                border-radius: 12px;\n                padding: 10px 14px;\n                font-size: 11px;\n                font-weight: 600;\n                color: var(--pg-text);\n                white-space: nowrap;\n                pointer-events: none;\n                box-shadow: var(--pg-shadow);\n                z-index: 9999;\n                line-height: 1.6;\n            ">${e("pinnedGames_helpText")}</div></div>\n        `;
a.appendChild(s);
const l = s.querySelector("[data-pgf-help]");
const c = l?.querySelector("div");
if (l && c) {
l.addEventListener("mouseenter", () => {
c.style.display = "block";
});
l.addEventListener("mouseleave", () => {
c.style.display = "none";
});
}
const d = document.createElement("button");
d.style.cssText = `\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            width: 28px;\n            height: 28px;\n            border-radius: 8px;\n            border: 1px solid var(--pg-border);\n            background: var(--pg-input-bg);\n            cursor: pointer;\n            padding: 0;\n            color: var(--pg-muted);\n            transition: all 0.2s ease;\n            flex-shrink: 0;\n        `;
d.innerHTML = `<svg class="pgf-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition:transform 0.2s ease;"><polyline points="18 15 12 9 6 15"/></svg>`;
d.addEventListener("mouseenter", () => {
d.style.background = "rgba(138,43,226,0.22)";
d.style.borderColor = "rgba(138,43,226,0.6)";
d.style.color = "white";
});
d.addEventListener("mouseleave", () => {
d.style.background = "rgba(138,43,226,0.08)";
d.style.borderColor = "rgba(138,43,226,0.3)";
d.style.color = "rgba(200,170,255,0.6)";
});
a.appendChild(d);
const p = document.createElement("div");
p.className = "pgf-body";
p.style.cssText = "overflow:hidden;transition:max-height 0.25s ease, opacity 0.2s ease;max-height:2000px;opacity:1;";
let g = false;
const u = (e, n) => {
g = e;
const t = d.querySelector(".pgf-chevron");
if (e) {
if (!n) p.style.transition = "none";
p.style.maxHeight = "0";
p.style.opacity = "0";
r.style.paddingBottom = "12px";
a.style.marginBottom = "0";
if (t) t.style.transform = "rotate(180deg)";
p.style.overflow = "hidden";
} else {
if (!n) p.style.transition = "none";
p.style.maxHeight = "2000px";
p.style.opacity = "1";
r.style.paddingBottom = "20px";
a.style.marginBottom = "12px";
if (t) t.style.transform = "rotate(0deg)";
}
if (n) {
requestAnimationFrame(() => {
p.style.transition = "max-height 0.25s ease, opacity 0.2s ease";
if (!e) {
setTimeout(() => {
if (!g) p.style.overflow = "visible";
}, 250);
}
});
} else {
if (!e) p.style.overflow = "visible";
}
};
window.__PurpuraSettings.ready.then(function() {
u(window.__PurpuraSettings.get("pgfCollapsed") === true, false);
});
d.addEventListener("click", () => {
const e = !g;
u(e, true);
chrome.storage.local.set({
pgfCollapsed: e
});
});
const f = document.createElement("div");
f.style.cssText = `\n            display: flex;\n            align-items: center;\n            gap: 10px;\n            margin-bottom: 16px;\n            background: var(--pg-input-bg);\n            border: 1px solid var(--pg-border);\n            border-radius: 12px;\n            padding: 10px 16px;\n            transition: all 0.2s ease;\n            box-sizing: border-box;\n            width: 100%;\n        `;
f.innerHTML = `\n            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--pg-muted)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">\n                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>\n            </svg>\n            <input type="text" placeholder="${e("pinnedGames_searchPlaceholder")}" style="\n                flex: 1;\n                background: transparent;\n                border: none;\n                outline: none;\n                color: var(--pg-text);\n                font-size: 14px;\n                padding: 0;\n                margin: 0;\n            ">\n            <button style="\n                display: none;\n                background: none;\n                border: none;\n                color: rgba(200,170,255,0.5);\n                cursor: pointer;\n                padding: 0;\n                line-height: 1;\n                font-size: 14px;\n            ">✕</button>\n        `;
const m = f.querySelector("input");
const b = f.querySelector("button");
f.addEventListener("focusin", () => {
f.style.borderColor = "rgba(138,43,226,0.5)";
});
f.addEventListener("focusout", () => {
f.style.borderColor = "rgba(138,43,226,0.18)";
});
m.addEventListener("input", () => {
b.style.display = m.value ? "block" : "none";
});
b.addEventListener("click", () => {
m.value = "";
b.style.display = "none";
m.dispatchEvent(new Event("input"));
m.focus();
});
const h = Q();
h.style.width = "100%";
h.style.boxSizing = "border-box";
const y = document.createElement("div");
y.className = "pinned-games-container";
y.style.cssText = `\n            display: flex;\n            gap: 20px;\n            overflow-x: auto;\n            padding: 50px 10px 10px;\n            margin-top: -30px;\n            scrollbar-width: none;\n        `;
const v = document.createElement("style");
v.textContent = `\n            .pinned-games-container::-webkit-scrollbar {\n                height: 8px;\n            }\n            .pinned-games-container::-webkit-scrollbar-track {\n                background: rgba(255, 255, 255, 0.1);\n                border-radius: 4px;\n            }\n            .pinned-games-container::-webkit-scrollbar-thumb {\n                background: #8A2BE2;\n                border-radius: 4px;\n            }\n            .pinned-games-container::-webkit-scrollbar-thumb:hover {\n                background: #9933FF;\n            }\n            .pinned-games-search::placeholder {\n                color: rgba(255, 255, 255, 0.5);\n            }\n            \n            /* Drag & Drop Animations */\n            .pinned-game-card {\n                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n                animation: fadeInCard 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;\n            }\n            \n            @keyframes fadeInCard {\n                from {\n                    opacity: 0;\n                    transform: translateY(10px) scale(0.95);\n                }\n                to {\n                    opacity: 1;\n                    transform: translateY(0) scale(1);\n                }\n            }\n            \n            .pinned-game-card.dragging {\n                opacity: 0.5;\n                transform: scale(0.95) rotate(2deg);\n                cursor: grabbing !important;\n                box-shadow: 0 8px 32px rgba(138, 43, 226, 0.6);\n                z-index: 1000;\n            }\n            \n            .pinned-game-card.drag-over {\n                transform: scale(1.05) translateY(-5px);\n                border: 2px solid #FFD700;\n                box-shadow: 0 0 20px rgba(255, 215, 0, 0.5), 0 8px 32px rgba(138, 43, 226, 0.4);\n                background: rgba(138, 43, 226, 0.3);\n            }\n            \n            .pinned-game-card.drag-over::before {\n                content: '';\n                position: absolute;\n                top: -4px;\n                left: 50%;\n                transform: translateX(-50%);\n                width: 80%;\n                height: 4px;\n                background: linear-gradient(90deg, transparent, #FFD700, transparent);\n                border-radius: 2px;\n                animation: pulse 1s ease-in-out infinite;\n            }\n            \n            @keyframes pulse {\n                0%, 100% {\n                    opacity: 0.6;\n                    box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);\n                }\n                50% {\n                    opacity: 1;\n                    box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);\n                }\n            }\n            \n            .pinned-game-card.drop-success {\n                animation: dropSuccess 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);\n            }\n            \n            @keyframes dropSuccess {\n                0% {\n                    transform: scale(0.9);\n                }\n                50% {\n                    transform: scale(1.1);\n                    box-shadow: 0 0 30px rgba(76, 175, 80, 0.8);\n                    border-color: #4caf50;\n                }\n                100% {\n                    transform: scale(1);\n                }\n            }\n            \n            .drag-ghost {\n                position: fixed;\n                pointer-events: none;\n                z-index: 10000;\n                opacity: 0.9;\n                transform: rotate(5deg);\n                transition: transform 0.2s ease;\n                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);\n                border: 2px solid #8A2BE2;\n                animation: floatGhost 2s ease-in-out infinite;\n            }\n            \n            @keyframes floatGhost {\n                0%, 100% {\n                    transform: translateY(0px) rotate(5deg);\n                }\n                50% {\n                    transform: translateY(-10px) rotate(3deg);\n                }\n            }\n        `;
document.head.appendChild(v);
i = [];
const w = M(o);
w.forEach(e => {
const n = ue(e);
y.appendChild(n);
i.push({
card: n,
game: e
});
});
if (w.length === 0) {
const n = document.createElement("div");
n.style.cssText = `display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 16px 20px;width:100%;box-sizing:border-box;gap:10px;opacity:0.72;`;
const t = document.createElement("img");
t.src = chrome.runtime.getURL("images/builderman_signature.png");
msg.textContent = e("pinnedGames_buildermanLives");
msg.style.cssText = `font-size:13px;color:var(--pg-muted);font-weight:600;letter-spacing:0.02em;`;
const o = x === "light" ? "grayscale(1) contrast(0.5) opacity(0.15)" : "invert(1) opacity(0.18)";
t.style.cssText = `width:160px;max-width:80%;filter:${o};pointer-events:none;user-select:none;`;
n.appendChild(t);
n.appendChild(msg);
y.appendChild(n);
}
m.addEventListener("input", () => {
const e = m.value.toLowerCase().trim();
let n = false;
i.forEach(({card: t, game: o}) => {
const r = !e || o.name.toLowerCase().includes(e);
t.style.display = r ? "" : "none";
if (r) n = true;
});
const t = y.querySelector(".pgf-search-empty");
if (!n && e) {
if (!t) {
const n = document.createElement("div");
n.className = "pgf-search-empty";
n.style.cssText = `display:flex;align-items:center;justify-content:center;padding:24px 16px;width:100%;box-sizing:border-box;font-size:13px;color:var(--pg-muted);font-weight:600;animation: pgf-fade-in 0.3s ease;`;
n.textContent = `No games match "${e}"`;
y.appendChild(n);
} else {
t.textContent = `No games match "${e}"`;
}
} else if (t) {
t.remove();
}
});
p.appendChild(f);
p.appendChild(h);
p.appendChild(y);
r.appendChild(a);
r.appendChild(p);
n.insertAdjacentElement(t, r);
fe(i);
}
async function le(e) {
try {
const n = await fetch(`https://games.roblox.com/v1/games/${e}/servers/Public?sortOrder=Asc&limit=100`);
if (n.status === 429) {
window.location.href = `roblox://placeid=${e}`;
return;
}
if (!n.ok) {
throw new Error(`Server API request failed: ${n.status}`);
}
const t = await n.json();
if (!t.data || t.data.length === 0) {
window.location.href = `roblox://placeid=${e}`;
return;
}
let o = null;
let r = Infinity;
for (const e of t.data) {
if (e.playing > 0 && e.playing < r) {
r = e.playing;
o = e;
}
}
if (!o) {
for (const e of t.data) {
if (e.playing < e.maxPlayers) {
o = e;
break;
}
}
}
if (o) {
window.location.href = `roblox://placeid=${e}&gameinstanceid=${o.id}`;
} else {
window.location.href = `roblox://placeid=${e}`;
}
} catch (n) {
window.location.href = `roblox://placeid=${e}`;
}
}
async function ce(e, t) {
const o = n.findIndex(n => n.id === e);
const r = n.findIndex(e => e.id === t);
if (o === -1 || r === -1) {
return;
}
const a = [ ...n ];
const i = a.splice(o, 1)[0];
a.splice(r, 0, i);
await z(a);
const s = document.querySelector(".pinned-games-container");
if (s) {
const n = s.querySelector(`[data-game-id="${e}"]`);
const a = s.querySelector(`[data-game-id="${t}"]`);
if (n && a) {
if (o < r) {
a.insertAdjacentElement("afterend", n);
} else {
a.insertAdjacentElement("beforebegin", n);
}
}
}
}
function de() {
if (b) {
clearTimeout(b);
}
b = setTimeout(() => {
const e = document.querySelector(".pinned-games-carousel");
if (e) {
pe(e);
} else {
ge();
}
b = null;
}, h);
}
function pe(e) {
const n = e.querySelector(".pgf-nav");
const t = Q();
if (n) {
n.replaceWith(t);
} else {
e.appendChild(t);
}
const s = e.querySelector(".pinned-games-container");
if (!s) return;
if (r) {
clearInterval(r);
r = null;
}
if (a) {
clearInterval(a);
a = null;
}
s.innerHTML = "";
s.style.animation = "none";
s.offsetHeight;
s.style.animation = "pgf-fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards";
i = [];
const l = M(o);
l.forEach(e => {
const n = ue(e);
s.appendChild(n);
i.push({
game: e,
card: n
});
});
if (l.length === 0) {
const e = document.createElement("div");
e.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;padding:28px 16px 20px;width:100%;box-sizing:border-box;gap:10px;opacity:0.72;";
const n = document.createElement("img");
n.src = chrome.runtime.getURL("images/builderman_signature.png");
const t = x === "light" ? "grayscale(1) contrast(0.5) opacity(0.15)" : "invert(1) opacity(0.18)";
n.style.cssText = `width:160px;max-width:80%;filter:${t};pointer-events:none;user-select:none;`;
const r = document.createElement("span");
r.textContent = o === null ? "The builderman lives here." : "This folder is empty.";
r.style.cssText = "font-size:13px;color:var(--pg-muted);font-weight:600;letter-spacing:0.02em;";
e.appendChild(n);
e.appendChild(r);
s.appendChild(e);
}
const c = e.querySelector('input[type="text"]');
if (c && c.value.trim()) {
const e = c.value.trim().toLowerCase();
i.forEach(({card: n, game: t}) => {
n.style.display = t.name.toLowerCase().includes(e) ? "" : "none";
});
}
fe(i);
}
function ge() {
if (B) {
B.disconnect();
B = null;
}
if (H) {
H.disconnect();
H = null;
}
const e = document.querySelector(".pinned-games-carousel");
if (e) {
e.remove();
}
if (r) {
clearInterval(r);
r = null;
}
if (a) {
clearInterval(a);
a = null;
}
const n = window.location.href;
if (D(n)) {
W();
} else if (V(n)) {
J();
}
}
function ue(n) {
const t = document.createElement("div");
t.className = "pinned-game-card";
t.draggable = true;
t.dataset.gameId = n.id;
t.style.cssText = `\n            min-width: 220px;\n            background: var(--pg-card-bg);\n            border-radius: 16px;\n            padding: 14px;\n            border: 1px solid var(--pg-border);\n            cursor: grab;\n            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);\n            position: relative;\n            box-shadow: 0 4px 12px rgba(0,0,0,0.05);\n        `;
t.innerHTML = `\n            <div class="drag-handle" style="\n                position: absolute;\n                top: 8px;\n                left: 8px;\n                width: 16px;\n                height: 16px;\n                cursor: grab;\n                opacity: 0.6;\n                transition: opacity 0.2s ease;\n                z-index: 2;\n            " title="${e("pinnedGames_dragToReorder")}">\n                <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--pg-muted)">\n                    <path d="M3 5h2v2H3V5zm4 0h2v2H7V5zm4 0h2v2h-2V5zm4 0h2v2h-2V5zm4 0h2v2h-2V5zM3 11h2v2H3v-2zm4 0h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM3 17h2v2H3v-2zm4 0h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/>\n                </svg>\n            </div>\n            <button class="sync-game-btn" style="\n                position: absolute;\n                top: 10px;\n                right: 10px;\n                width: 28px;\n                height: 28px;\n                background: var(--pg-input-bg);\n                border: 1px solid var(--pg-border);\n                border-radius: 8px;\n                cursor: pointer;\n                transition: all 0.2s ease;\n                display: flex;\n                align-items: center;\n                justify-content: center;\n                z-index: 2;\n                padding: 0;\n            ">\n                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(138, 43, 226, 0.9)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">\n                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>\n                </svg>\n                <span class="sync-tooltip" style="\n                    display: none;\n                    position: absolute;\n                    bottom: calc(100% + 8px);\n                    left: 50%;\n                    transform: translateX(-50%);\n                    background: var(--pg-tooltip-bg);\n                    backdrop-filter: blur(20px);\n                    border: 1px solid var(--pg-border);\n                    border-radius: 12px;\n                    padding: 6px 10px;\n                    font-size: 11px;\n                    font-weight: 600;\n                    color: var(--pg-text);\n                    white-space: nowrap;\n                    pointer-events: none;\n                    box-shadow: var(--pg-shadow);\n                    z-index: 9999;\n                ">${e("pinnedGames_syncDetails")}</span>\n            </button>\n            <button class="folder-menu-btn" style="\n                position: absolute;\n                top: 10px;\n                right: 44px;\n                width: 28px;\n                height: 28px;\n                background: var(--pg-input-bg);\n                border: 1px solid var(--pg-border);\n                border-radius: 8px;\n                cursor: pointer;\n                transition: all 0.2s ease;\n                display: flex;\n                align-items: center;\n                justify-content: center;\n                z-index: 2;\n                padding: 0;\n            ">\n                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(138, 43, 226, 0.9)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">\n                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>\n                </svg>\n                <span class="folder-tooltip" style="\n                    display: none;\n                    position: absolute;\n                    bottom: calc(100% + 8px);\n                    left: 50%;\n                    transform: translateX(-50%);\n                    background: var(--pg-tooltip-bg);\n                    backdrop-filter: blur(20px);\n                    border: 1px solid var(--pg-border);\n                    border-radius: 12px;\n                    padding: 6px 10px;\n                    font-size: 11px;\n                    font-weight: 600;\n                    color: var(--pg-text);\n                    white-space: nowrap;\n                    pointer-events: none;\n                    box-shadow: var(--pg-shadow);\n                    z-index: 9999;\n                ">${e("pinnedGames_folders")}</span>\n            </button>\n            <img src="${n.thumbnail}" alt="${n.name}" style="\n                width: 100%;\n                height: 120px;\n                object-fit: cover;\n                border-radius: 10px;\n                margin-bottom: 12px;\n                border: 1px solid var(--pg-border);\n            ">\n            <h4 style="\n                color: var(--pg-text);\n                font-size: 1rem;\n                font-weight: 700;\n                margin-bottom: 4px;\n                white-space: nowrap;\n                overflow: hidden;\n                text-overflow: ellipsis;\n            ">${n.name}</h4>\n            <p style="\n                color: var(--pg-muted);\n                font-size: 0.85rem;\n                font-weight: 500;\n                margin-bottom: 12px;\n            ">${e("pinnedGames_playingCount", [ xe(n.playerCount) ])}</p>\n            <div class="game-actions" style="\n                display: flex;\n                gap: 6px;\n                margin-top: 8px;\n            ">\n                <button class="join-game-btn" style="\n                    position: relative;\n                    flex: 1;\n                    background: var(--pg-accent);\n                    color: white;\n                    border: none;\n                    border-radius: 10px;\n                    padding: 12px 0;\n                    cursor: pointer;\n                    transition: all 0.2s ease;\n                    display: flex;\n                    align-items: center;\n                    justify-content: center;\n                ">\n                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z"/></svg>\n                    <span style="\n                        display: none;\n                        position: absolute;\n                        bottom: calc(100% + 8px);\n                        left: 50%;\n                        transform: translateX(-50%);\n                        background: var(--pg-tooltip-bg);\n                        backdrop-filter: blur(20px);\n                        border: 1px solid var(--pg-border);\n                        border-radius: 12px;\n                        padding: 6px 10px;\n                        font-size: 11px;\n                        font-weight: 600;\n                        color: var(--pg-text);\n                        white-space: nowrap;\n                        pointer-events: none;\n                        box-shadow: var(--pg-shadow);\n                        z-index: 9999;\n                    ">${e("pinnedGames_playTooltip")}</span>\n                </button>\n                <button class="join-smallest-btn" style="\n                    position: relative;\n                    flex: 1;\n                    background: var(--pg-input-bg);\n                    color: var(--pg-accent);\n                    border: 1px solid var(--pg-accent-muted);\n                    border-radius: 10px;\n                    padding: 12px 0;\n                    cursor: pointer;\n                    transition: all 0.2s ease;\n                    display: flex;\n                    align-items: center;\n                    justify-content: center;\n                ">\n                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M4 21c0-4.418 3.582-8 8-8s8 3.582 8 8"/></svg>\n                    <span style="\n                        display: none;\n                        position: absolute;\n                        bottom: calc(100% + 8px);\n                        left: 50%;\n                        transform: translateX(-50%);\n                        background: var(--pg-tooltip-bg);\n                        backdrop-filter: blur(20px);\n                        border: 1px solid var(--pg-border);\n                        border-radius: 12px;\n                        padding: 6px 10px;\n                        font-size: 11px;\n                        font-weight: 600;\n                        color: var(--pg-text);\n                        white-space: nowrap;\n                        pointer-events: none;\n                        box-shadow: var(--pg-shadow);\n                        z-index: 9999;\n                    ">${e("pinnedGames_joinSmallestTooltip")}</span>\n                </button>\n            </div>\n        `;
const o = t.querySelector(".drag-handle");
o.addEventListener("mouseenter", () => {
o.style.opacity = "1";
});
o.addEventListener("mouseleave", () => {
o.style.opacity = "0.6";
});
t.addEventListener("mouseenter", () => {
t.style.background = "var(--pg-card-hover)";
t.style.borderColor = "var(--pg-accent)";
t.style.transform = "translateY(-4px)";
t.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
});
t.addEventListener("mouseleave", () => {
t.style.background = "var(--pg-card-bg)";
t.style.borderColor = "var(--pg-border)";
t.style.transform = "translateY(0)";
t.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
});
const r = t.querySelector(".join-game-btn");
const a = t.querySelector(".join-smallest-btn");
const i = r.querySelector("span");
r.addEventListener("mouseenter", () => {
r.style.transform = "scale(1.05)";
r.style.filter = "brightness(1.1)";
if (i) i.style.display = "block";
});
r.addEventListener("mouseleave", () => {
r.style.transform = "scale(1)";
r.style.filter = "none";
if (i) i.style.display = "none";
});
r.addEventListener("click", e => {
e.stopPropagation();
window.location.href = `roblox://placeid=${n.id}`;
});
const s = a.querySelector("span");
a.addEventListener("mouseenter", () => {
a.style.background = "var(--pg-accent-muted)";
a.style.color = "white";
a.style.transform = "scale(1.05)";
if (s) s.style.display = "block";
});
a.addEventListener("mouseleave", () => {
a.style.background = "var(--pg-input-bg)";
a.style.color = "var(--pg-accent)";
a.style.transform = "scale(1)";
if (s) s.style.display = "none";
});
a.addEventListener("click", e => {
e.stopPropagation();
le(n.id);
});
const l = t.querySelector(".sync-game-btn");
const c = l.querySelector(".sync-tooltip");
l.addEventListener("mouseenter", () => {
l.style.background = "var(--pg-accent)";
l.style.borderColor = "var(--pg-accent)";
const e = l.querySelector("svg");
if (e) {
e.style.stroke = "white";
e.style.transform = "rotate(180deg)";
}
if (c) c.style.display = "block";
});
l.addEventListener("mouseleave", () => {
l.style.background = "var(--pg-input-bg)";
l.style.borderColor = "var(--pg-border)";
const e = l.querySelector("svg");
if (e) {
e.style.stroke = "var(--pg-accent)";
e.style.transform = "rotate(0deg)";
}
if (c) c.style.display = "none";
});
l.addEventListener("click", async e => {
e.stopPropagation();
await ye(n.id, t);
});
const d = t.querySelector(".folder-menu-btn");
const p = d.querySelector(".folder-tooltip");
d.addEventListener("mouseenter", () => {
d.style.background = "var(--pg-accent)";
d.style.borderColor = "var(--pg-accent)";
const e = d.querySelector("svg");
if (e) e.style.stroke = "white";
if (p) p.style.display = "block";
});
d.addEventListener("mouseleave", () => {
d.style.background = "var(--pg-input-bg)";
d.style.borderColor = "var(--pg-border)";
const e = d.querySelector("svg");
if (e) e.style.stroke = "var(--pg-accent)";
if (p) p.style.display = "none";
});
d.addEventListener("click", e => {
e.stopPropagation();
Ee(n.id, d);
});
t.addEventListener("click", e => {
if (e.target.closest(".game-actions")) {
return;
}
window.location.href = `https://www.roblox.com/games/${n.id}/`;
});
t.addEventListener("dragstart", e => {
e.dataTransfer.setData("text/plain", n.id);
t.classList.add("dragging");
const o = t.cloneNode(true);
o.classList.add("drag-ghost");
o.classList.remove("dragging");
o.style.position = "fixed";
o.style.top = "-9999px";
o.style.left = "-9999px";
o.style.width = t.offsetWidth + "px";
o.style.height = t.offsetHeight + "px";
o.style.pointerEvents = "none";
document.body.appendChild(o);
e.dataTransfer.setDragImage(o, t.offsetWidth / 2, t.offsetHeight / 2);
setTimeout(() => {
if (o.parentNode) {
o.remove();
}
}, 0);
document.querySelectorAll(".pinned-game-card").forEach(e => {
if (e !== t) {
e.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
e.style.opacity = "0.6";
}
});
});
t.addEventListener("dragend", e => {
t.classList.remove("dragging");
document.querySelectorAll(".pinned-game-card").forEach(e => {
e.classList.remove("drag-over");
e.style.opacity = "1";
});
document.querySelectorAll(".drag-ghost").forEach(e => e.remove());
});
t.addEventListener("dragover", e => {
e.preventDefault();
t.classList.add("drag-over");
});
t.addEventListener("dragleave", e => {
if (!t.contains(e.relatedTarget)) {
t.classList.remove("drag-over");
}
});
t.addEventListener("drop", e => {
e.preventDefault();
const o = e.dataTransfer.getData("text/plain");
const r = n.id;
t.classList.remove("drag-over");
if (o !== r) {
t.classList.add("drop-success");
setTimeout(() => {
t.classList.remove("drop-success");
}, 600);
ce(o, r);
}
});
return t;
}
function fe(e) {
if (r) {
clearInterval(r);
}
const n = Date.now();
if (n - s > c) {
be(e);
}
r = setInterval(() => {
if (!document.querySelector(".pinned-games-carousel")) {
clearInterval(r);
r = null;
return;
}
be(e);
}, 3e4);
me(e);
}
function me(e) {
if (a) {
clearInterval(a);
}
a = setInterval(async () => {
if (!document.querySelector(".pinned-games-carousel")) {
clearInterval(a);
a = null;
return;
}
for (let n = 0; n < e.length; n++) {
const {card: t, game: o} = e[n];
if (n > 0) {
await new Promise(e => setTimeout(e, 3e3));
}
try {
await ye(o.id, t);
} catch (e) {}
}
}, p);
}
async function be(e) {
const n = Date.now();
if (n - s < c) {
return;
}
if (n - s > d) {
l = 0;
}
if (l > 10) {
return;
}
s = n;
l++;
const t = e.filter(({game: e}) => {
const n = e.universeId || e.id;
const t = g.get(n);
return !t || Date.now() - t.timestamp >= u;
});
if (t.length === 0) {
return;
}
const o = t.map(({game: e}) => e.universeId).filter(e => e);
if (o.length > 0) {
try {
const e = await fetch(`https://games.roblox.com/v1/games?universeIds=${o.join(",")}`);
if (e.status === 429) {
return;
}
if (e.ok) {
const n = await e.json();
if (n.data) {
n.data.forEach(e => {
g.set(e.id, {
count: e.playing || 0,
timestamp: Date.now()
});
});
t.forEach(({card: e, game: n}) => {
if (n.universeId) {
const t = g.get(n.universeId);
if (t) {
const n = e.querySelector("p");
if (n) {
n.textContent = `${xe(t.count)} playing`;
n.style.transition = "color 0.3s ease";
n.style.color = "#4caf50";
setTimeout(() => {
n.style.color = "var(--pg-muted)";
}, 1e3);
}
}
}
});
return;
}
}
} catch (e) {}
}
for (let e = 0; e < Math.min(t.length, 3); e++) {
const {card: n, game: o} = t[e];
if (e > 0) {
await new Promise(e => setTimeout(e, 500));
}
try {
const e = await he(o.id, o.universeId);
const t = n.querySelector("p");
if (t && e !== null) {
t.textContent = `${xe(e)} playing`;
t.style.transition = "color 0.3s ease";
t.style.color = "#4caf50";
setTimeout(() => {
t.style.color = "var(--pg-muted)";
}, 1e3);
}
} catch (e) {}
}
}
async function he(e, n) {
const t = n || e;
const o = g.get(t);
if (o && Date.now() - o.timestamp < u) {
return o.count;
}
try {
let r = n;
if (!r) {
const n = await fetch(`https://apis.roblox.com/universes/v1/places/${e}/universe`);
if (n.status === 429) {
if (o) {
return o.count;
}
return null;
}
const t = await n.json();
r = t.universeId;
}
if (!r) return null;
const a = await fetch(`https://games.roblox.com/v1/games?universeIds=${r}`);
if (a.status === 429) {
if (o) {
return o.count;
}
return null;
}
const i = await a.json();
let s = null;
if (i.data && i.data.length > 0 && i.data[0].playing !== undefined) {
s = i.data[0].playing;
} else {
const e = await fetch(`https://games.roblox.com/v1/games/${r}/servers/Public?sortOrder=Asc&limit=10`);
if (e.status === 429) {
return null;
}
const n = await e.json();
if (n.data && n.data.length > 0) {
s = n.data.reduce((e, n) => e + (n.playing || 0), 0);
} else {
s = 0;
}
}
if (s !== null) {
g.set(t, {
count: s,
timestamp: Date.now()
});
}
return s;
} catch (e) {
return null;
}
}
function xe(e) {
if (typeof e !== "number") return "0";
return e.toLocaleString("en-US");
}
async function ye(e, t) {
const o = t.querySelector(".sync-game-btn");
const r = o.innerHTML;
o.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">\n            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>\n        </svg>`;
o.disabled = true;
o.style.cursor = "wait";
o.style.opacity = "0.7";
if (!document.querySelector("#sync-spin-animation")) {
const e = document.createElement("style");
e.id = "sync-spin-animation";
e.textContent = `\n                @keyframes spin {\n                    from { transform: rotate(0deg); }\n                    to { transform: rotate(360deg); }\n                }\n            `;
document.head.appendChild(e);
}
try {
f.delete(e);
const r = await we(e);
if (!r) {
throw new Error("Failed to fetch game info");
}
const a = n.findIndex(n => n.id === e);
if (a !== -1) {
n[a] = {
...n[a],
name: r.name,
thumbnail: r.thumbnail,
playerCount: r.playerCount,
universeId: r.universeId
};
await chrome.storage.local.set({
pinnedGamesList: n
});
const e = t.querySelector("img");
const i = t.querySelector("h4");
const s = t.querySelector("p");
if (e) {
e.src = r.thumbnail;
}
if (i) {
i.textContent = r.name;
i.title = r.name;
}
if (s) {
s.textContent = `${xe(r.playerCount)} playing`;
s.style.transition = "color 0.3s ease";
s.style.color = "#4caf50";
setTimeout(() => {
s.style.color = "var(--pg-muted)";
}, 1500);
}
o.style.background = "rgba(76, 175, 80, 0.9)";
o.style.borderColor = "#4caf50";
o.style.boxShadow = "0 0 8px rgba(76, 175, 80, 0.5)";
const l = o.querySelector("svg");
if (l) l.style.stroke = "white";
setTimeout(() => {
o.style.background = "rgba(25, 0, 51, 0.8)";
o.style.borderColor = "rgba(138, 43, 226, 0.4)";
o.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.3)";
if (l) l.style.stroke = "rgba(138, 43, 226, 0.9)";
}, 1e3);
}
} catch (e) {
o.style.background = "rgba(244, 67, 54, 0.9)";
o.style.borderColor = "#f44336";
o.style.boxShadow = "0 0 8px rgba(244, 67, 54, 0.5)";
const n = o.querySelector("svg");
if (n) n.style.stroke = "white";
setTimeout(() => {
o.style.background = "rgba(25, 0, 51, 0.8)";
o.style.borderColor = "rgba(138, 43, 226, 0.4)";
o.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.3)";
if (n) n.style.stroke = "rgba(138, 43, 226, 0.9)";
}, 1e3);
} finally {
o.innerHTML = r;
o.disabled = false;
o.style.cursor = "pointer";
o.style.opacity = "1";
}
}
function ve() {
const e = window.location.href.match(/\/games\/(\d+)/);
return e ? e[1] : null;
}
async function we(e) {
const n = f.get(e);
if (n && Date.now() - n.timestamp < m) {
return n.data;
}
try {
const n = await fetch(`https://apis.roblox.com/universes/v1/places/${e}/universe`);
if (n.status === 429) {
return null;
}
const t = await n.json();
if (!t.universeId) {
return null;
}
const o = t.universeId;
const r = await fetch(`https://games.roblox.com/v1/games?universeIds=${o}`);
if (r.status === 429) {
return null;
}
const a = await r.json();
if (a.data && a.data.length > 0) {
const n = a.data[0];
const t = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${o}&size=150x150&format=Png&isCircular=false`);
const r = await t.json();
let i = 0;
if (n.playing) {
i = n.playing;
} else {
try {
const e = await fetch(`https://games.roblox.com/v1/games/${o}/servers/Public?sortOrder=Asc&limit=10`);
const n = await e.json();
if (n.data && n.data.length > 0) {
i = n.data.reduce((e, n) => e + (n.playing || 0), 0);
}
} catch (e) {}
}
const s = {
id: e,
universeId: o,
name: n.name,
thumbnail: r.data?.[0]?.imageUrl || chrome.runtime.getURL("images/icons/default/Purpura_Default_Logo_48.png"),
playerCount: i
};
f.set(e, {
data: s,
timestamp: Date.now()
});
return s;
}
} catch (e) {}
return null;
}
async function ke() {
try {
const e = await fetch("https://users.roblox.com/v1/users/authenticated", {
credentials: "include"
});
if (!e.ok) return null;
const n = await e.json();
return n.id;
} catch (e) {
return null;
}
}
function Ee(o, r) {
const a = document.querySelector(".game-folder-menu");
if (a) a.remove();
K();
const i = n.find(e => e.id === o);
const s = i?.folderIds || [];
const l = r.getBoundingClientRect();
const c = window.innerHeight;
const d = Math.min(300, 56 + t.length * 40 + 52);
const p = c - l.bottom - 8;
const g = p < d && l.top > d;
const u = document.createElement("div");
u.className = "game-folder-menu";
u.style.cssText = `\n            position: fixed;\n            left: ${Math.max(8, Math.min(l.left, window.innerWidth - 220))}px;\n            ${g ? `bottom: ${c - l.top + 10}px;` : `top: ${l.bottom + 10}px;`}\n            background: var(--pg-bg);\n            backdrop-filter: var(--pg-glass);\n            -webkit-backdrop-filter: var(--pg-glass);\n            border: 1px solid var(--pg-border);\n            border-radius: 12px;\n            padding: 8px;\n            z-index: 10001;\n            box-shadow: var(--pg-shadow);\n            max-height: 300px;\n            overflow-y: auto;\n            min-width: 220px;\n            scrollbar-width: none;\n            animation: pgf-up 0.25s cubic-bezier(0.16, 1, 0.3, 1);\n        `;
const f = document.createElement("div");
f.style.cssText = `\n            font-size: 11px;\n            font-weight: 800;\n            color: var(--pg-accent);\n            text-transform: uppercase;\n            letter-spacing: 0.1em;\n            padding: 6px 10px 8px;\n            border-bottom: 1px solid var(--pg-border);\n            margin-bottom: 6px;\n        `;
f.textContent = e("pinnedGames_addToFolder");
u.appendChild(f);
const m = document.createElement("div");
m.style.cssText = `\n            display: flex;\n            align-items: center;\n            gap: 8px;\n            padding: 8px 10px;\n            border-radius: 8px;\n            color: var(--pg-muted);\n            font-size: 13px;\n            cursor: default;\n            user-select: none;\n        `;
m.innerHTML = `\n            <span style="display:flex;align-items:center;color:var(--pg-accent);">\n                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>\n            </span>\n            <span style="flex:1;font-weight:600;margin-left:4px;">${e("pinnedGames_allGames")}</span>\n            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>\n        `;
u.appendChild(m);
if (t.length > 0) {
const e = document.createElement("div");
e.style.cssText = `height:1px;background:var(--pg-border);margin:6px 0;`;
u.appendChild(e);
}
t.forEach(e => {
const n = s.includes(e.id);
const t = ee(e.color);
const r = document.createElement("button");
r.style.cssText = `\n                display: flex;\n                align-items: center;\n                gap: 10px;\n                width: 100%;\n                padding: 8px 10px;\n                background: ${n ? `rgba(${t},0.2)` : "transparent"};\n                border: 1px solid ${n ? `rgba(${t},0.4)` : "transparent"};\n                color: var(--pg-text);\n                text-align: left;\n                cursor: pointer;\n                border-radius: 8px;\n                font-size: 13px;\n                font-weight: ${n ? "700" : "500"};\n                transition: all 0.2s ease;\n                margin-bottom: 4px;\n                box-sizing: border-box;\n            `;
r.innerHTML = `\n                <span style="width:12px;height:12px;border-radius:3px;background:${e.color};flex-shrink:0;display:inline-block;"></span>\n                <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${e.name}</span>\n                ${n ? `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` : `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>`}\n            `;
r.addEventListener("mouseenter", () => {
if (n) {
r.style.background = `rgba(${t},0.32)`;
} else {
r.style.background = `rgba(${t},0.15)`;
r.style.borderColor = `rgba(${t},0.3)`;
}
});
r.addEventListener("mouseleave", () => {
r.style.background = n ? `rgba(${t},0.22)` : "transparent";
r.style.borderColor = n ? `rgba(${t},0.4)` : "transparent";
});
r.addEventListener("click", async () => {
u.remove();
await F(o, e.id);
});
u.appendChild(r);
});
const b = document.createElement("div");
b.style.cssText = `height:1px;background:var(--pg-border);margin:6px 0;`;
u.appendChild(b);
const h = document.createElement("button");
h.style.cssText = `\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            gap: 8px;\n            width: 100%;\n            padding: 10px;\n            background: var(--pg-input-bg);\n            border: 1px dashed var(--pg-accent-muted);\n            color: var(--pg-accent);\n            text-align: center;\n            cursor: pointer;\n            border-radius: 8px;\n            font-size: 13px;\n            font-weight: 700;\n            transition: all 0.2s ease;\n            box-sizing: border-box;\n        `;
h.innerHTML = `\n            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>\n            <span>${e("pinnedGames_newFolder")}</span>\n        `;
h.addEventListener("mouseenter", () => {
h.style.background = "var(--pg-accent)";
h.style.borderColor = "var(--pg-accent)";
h.style.color = "white";
h.style.transform = "translateY(-1px)";
});
h.addEventListener("mouseleave", () => {
h.style.background = "var(--pg-input-bg)";
h.style.borderColor = "var(--pg-accent-muted)";
h.style.color = "var(--pg-accent)";
h.style.transform = "translateY(0)";
});
h.addEventListener("click", () => {
u.remove();
oe(o);
});
u.appendChild(h);
document.body.appendChild(u);
setTimeout(() => {
document.addEventListener("click", function e(n) {
if (!u.contains(n.target) && n.target !== r) {
u.remove();
document.removeEventListener("click", e);
}
});
}, 100);
}
chrome.storage.onChanged.addListener((e, n) => {
if (n === "sync" && e["pinned-games"]) {
if (e["pinned-games"].newValue && !e["pinned-games"].oldValue) {
k();
} else if (!e["pinned-games"].newValue && e["pinned-games"].oldValue) {
document.querySelectorAll(".pin-game-button-container").forEach(e => e.remove());
}
}
});
})();
}
