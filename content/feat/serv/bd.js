/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
function initBotDetector() {
function t(t, e) {
return chrome.i18n.getMessage(t, e) || t;
}
function e() {
if (document.getElementById("purpura-bd-vars")) return;
var t = document.createElement("style");
t.id = "purpura-bd-vars";
t.textContent = ":root{" + "--purpura-bd-error:#ef4444;--purpura-bd-success:#34d399;--purpura-bd-warning:#f59e0b;" + "--purpura-bd-accent-light:#7C3AED;--purpura-bd-muted-light:#475569}";
document.head.appendChild(t);
}
e();
try {
if (window.PurpuraBotDetector?.cleanup) window.PurpuraBotDetector.cleanup();
} catch {}
let n = null;
const r = 3e3;
const a = 1;
const o = 100;
const s = 3;
const i = 25;
const c = 4;
const l = 5;
const u = 6e4;
const p = 1e3;
const d = 3e3;
const b = 500;
const g = 45e3;
const m = window.location.pathname.match(/games\/(\d+)/)?.[1];
if (!m) return;
const h = `purpura_bot_cache_${m}`;
const f = `purpura_bot_ui_${m}`;
function y(t) {
const e = document.createElement("div");
e.innerHTML = t.trim();
return e.firstElementChild;
}
function v() {
try {
return JSON.parse(localStorage.getItem(h) || "{}");
} catch {
return {};
}
}
function x(t) {
try {
localStorage.setItem(h, JSON.stringify(t));
} catch {}
}
function w() {
try {
return JSON.parse(localStorage.getItem(f) || "{}");
} catch {
return {};
}
}
function S(t) {
try {
localStorage.setItem(f, JSON.stringify(t));
} catch {}
}
function D(t) {
try {
const e = document.createElement("canvas");
const n = e.getContext("2d");
e.width = e.height = 8;
n.drawImage(t, 0, 0, 8, 8);
const r = n.getImageData(0, 0, 8, 8).data;
let a = "";
for (let t = 0; t < r.length; t += 4) {
const e = (r[t] + r[t + 1] + r[t + 2]) / 3;
a += e < 128 ? "0" : "1";
}
return a;
} catch (t) {
return null;
}
}
function C(t, e) {
if (!t || !e || t.length !== e.length) return Infinity;
let n = 0;
for (let r = 0; r < t.length; r++) if (t[r] !== e[r]) n++;
return n;
}
async function P(t) {
try {
const e = await fetch(`https://apis.roblox.com/universes/v1/places/${t}/universe`);
if (!e.ok) return null;
const n = await e.json();
const r = n.universeId;
const a = await fetch(`https://games.roblox.com/v1/games?universeIds=${r}`);
if (!a.ok) return {
universeId: r
};
const o = await a.json();
if (!o?.data?.length) return {
universeId: r
};
const s = o.data[0];
return {
name: s.name,
universeId: r,
playing: typeof s.playing === "number" ? s.playing : 0
};
} catch (t) {
return null;
}
}
async function _(t, e) {
if (!t || t.length === 0) return [];
const n = [];
let r = 0;
const a = t.length;
for (let o = 0; o < t.length; o += i * 4) {
const s = t.slice(o, o + i * 4);
for (let t = 0; t < s.length; t += i) {
const o = s.slice(t, t + i);
const c = o.map(t => ({
requestId: t.slice(0, 12),
token: t,
type: "AvatarHeadshot",
size: "150x150",
format: "Png",
isCircular: false
}));
try {
if (t > 0) await new Promise(t => setTimeout(t, p));
const e = await fetch("https://thumbnails.roblox.com/v1/batch", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify(c)
});
if (e.status === 429) {
break;
}
if (!e.ok) continue;
const r = await e.json();
if (r && Array.isArray(r.data)) {
r.data.forEach(t => {
if (t.state === "Completed" && t.imageUrl) n.push(t.imageUrl);
});
}
} catch (t) {}
r += o.length;
if (e) e(Math.min(r, a), a);
}
if (o + i * 4 < t.length) {
await new Promise(t => setTimeout(t, d));
}
}
return n;
}
function k(t) {
return new Promise(e => {
const n = new Image;
n.crossOrigin = "anonymous";
n.onload = () => e(D(n));
n.onerror = () => e(null);
n.src = t;
});
}
async function L(t) {
let e = [];
let n = "";
for (let t = 0; t < a; t++) {
try {
if (t > 0) await new Promise(t => setTimeout(t, p));
const r = await fetch(`https://games.roblox.com/v1/games/${m}/servers/Public?sortOrder=Asc&limit=100${n ? `&cursor=${n}` : ""}`, {
credentials: "include"
});
if (r.status === 429) {
break;
}
if (!r.ok) {
break;
}
const a = await r.json();
if (a && Array.isArray(a.data)) e.push(...a.data);
n = a.nextPageCursor || "";
if (!n) break;
} catch (t) {
break;
}
}
e = e.slice(0, o);
const r = e.reduce((t, e) => t + (e.playing || 0), 0);
const i = [];
for (const t of e) {
if (t.playerTokens && t.playerTokens.length > 0) {
const e = t.playerTokens.slice(0, s);
i.push(...e);
} else if (t.playerList && Array.isArray(t.playerList)) {
const e = t.playerList.filter(t => t && t.playerToken).map(t => t.playerToken).slice(0, s);
i.push(...e);
}
}
const u = i.slice(0, b);
const d = await _(u, t);
if (!d || d.length < c) {
return {
success: false,
reason: d ? `not_enough_thumbnails (${d.length}/${c})` : "thumb_fetch_failed",
serversCount: e.length,
imageCount: d ? d.length : 0,
totalServerPlayers: r,
tokensCollected: u.length
};
}
const g = d.map(t => k(t));
const h = (await Promise.all(g)).filter(Boolean);
if (h.length === 0) {
return {
success: false,
reason: "no_hashes",
serversCount: e.length,
imageCount: d.length,
totalServerPlayers: r
};
}
const f = {};
h.forEach(t => f[t] = (f[t] || 0) + 1);
const y = Object.keys(f);
const v = [];
const x = new Array(y.length).fill(false);
for (let t = 0; t < y.length; t++) {
if (x[t]) continue;
const e = y[t];
const n = new Set([ e ]);
x[t] = true;
for (let r = t + 1; r < y.length; r++) {
if (x[r]) continue;
const t = y[r];
const a = C(e, t);
if (a <= l) {
n.add(t);
x[r] = true;
}
}
v.push(n);
}
let w = h.length;
let S = 0;
v.forEach(t => {
let e = 0;
t.forEach(t => {
e += f[t] || 0;
});
if (e >= 2) S += e;
});
const D = Number((S / w * 100).toFixed(2));
return {
success: true,
totalPlayers: w,
totalBots: S,
botPercentage: D,
serversCount: e.length,
time: Date.now(),
totalServerPlayers: r,
imageUrls: d
};
}
function $() {
const t = [ ".game-description-container", "[class*='game-description-container']", ".game-description", "[class*='game-description']" ];
for (const e of t) {
const t = document.querySelector(e);
if (t) {
return t;
}
}
return null;
}
function B() {
return new Promise(t => {
const e = $();
if (e) {
t(e);
return;
}
const n = Date.now();
const r = new MutationObserver(() => {
const e = $();
if (e) {
r.disconnect();
t(e);
} else if (Date.now() - n > g) {
r.disconnect();
t(null);
}
});
r.observe(document.body, {
childList: true,
subtree: true
});
setTimeout(() => {
r.disconnect();
t(null);
}, g);
});
}
function E(e) {
const n = document.querySelector(".purpura-bot-card");
if (n) return null;
const r = $();
if (!r || !r.parentElement) return null;
const a = document.createElement("div");
a.className = "purpura-bot-card";
a.classList.toggle("light-mode", e.isLight);
a.classList.toggle("dark-mode", !e.isLight);
const o = document.createElement("style");
o.setAttribute("data-purpura-bot-style", "1");
o.textContent = `\n            .purpura-bot-card {\n                --pb-bg: #121215;\n                --pb-text: #d5d7dd;\n                --pb-muted: #9ca3af;\n                --pb-accent: #c084fc;\n                --pb-border: rgba(255,255,255,0.03);\n                --pb-shadow: 0 8px 30px rgba(0,0,0,0.6);\n                --pb-card-bg: #1a1a1d;\n                --pb-btn-bg: #1a1a1d;\n                --pb-btn-hover: #232328;\n                \n                background: var(--pb-bg);\n                color: var(--pb-text);\n                border-radius: 12px;\n                padding: 18px;\n                margin-bottom: 16px;\n                font-family: 'Inter', 'Segoe UI', Arial, sans-serif;\n                box-shadow: var(--pb-shadow);\n                border: 1px solid var(--pb-border);\n                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);\n                max-width: 780px;\n            }\n\n            .purpura-bot-card.light-mode {\n                --pb-bg: rgba(255, 255, 255, 0.7);\n                --pb-text: #0F172A;\n                --pb-muted: #475569;\n                --pb-accent: #A855F7;\n                --pb-border: rgba(168, 85, 247, 0.15);\n                --pb-shadow: 0 10px 40px rgba(0,0,0,0.06), inset 0 0 0 1.5px rgba(255, 255, 255, 0.5);\n                --pb-card-bg: rgba(255, 255, 255, 0.4);\n                --pb-btn-bg: rgba(168, 85, 247, 0.1);\n                --pb-btn-hover: rgba(168, 85, 247, 0.15);\n                \n                backdrop-filter: blur(40px) saturate(200%);\n                -webkit-backdrop-filter: blur(40px) saturate(200%);\n                border-top: 4px solid var(--pb-accent);\n            }\n\n            .purpura-bot-card.purpura-flash { \n                box-shadow: 0 0 0 6px rgba(168, 85, 247, 0.12), var(--pb-shadow);\n                transform: translateY(-2px); \n            }\n            \n            .purpura-bot-card .purpura-section { margin-bottom: 12px; }\n            .purpura-bot-card .purpura-section h4 { \n                color: var(--pb-accent); \n                margin: 0 0 8px 0; \n                font-size: 12px; \n                font-weight: 800; \n                text-transform: uppercase;\n                letter-spacing: 0.8px;\n            }\n            \n            .purpura-hidden { display:none !important; }\n            \n            .purpura-database-btn { \n                background: var(--pb-btn-bg); \n                color: var(--pb-accent); \n                border: 1px solid var(--pb-border); \n                padding: 12px 24px; \n                border-radius: 10px; \n                font-weight: 700; \n                font-size: 14px; \n                cursor: pointer; \n                transition: all 0.2s ease; \n                width: 100%; \n                font-family: inherit;\n            }\n            \n            .purpura-database-btn:hover { \n                background: var(--pb-btn-hover); \n                border-color: var(--pb-accent); \n                transform: translateY(-1px);\n                box-shadow: 0 4px 12px rgba(168, 85, 247, 0.15);\n            }\n            \n            .purpura-thumbnail-modal { \n                --pb-bg: #121215;\n                --pb-text: #d5d7dd;\n                --pb-muted: #9ca3af;\n                --pb-accent: #c084fc;\n                --pb-border: rgba(255,255,255,0.1);\n                --pb-card-bg: #0f0f12;\n\n                position: fixed; \n                inset: 0;\n                background: rgba(0,0,0,0.75); \n                backdrop-filter: blur(12px);\n                z-index: 999999; \n                display: flex; \n                align-items: center; \n                justify-content: center; \n                padding: 40px;\n                animation: purpuraModalFade 0.4s cubic-bezier(0.16, 1, 0.3, 1);\n            }\n\n            .purpura-thumbnail-modal.light-mode {\n                --pb-bg: rgba(255, 255, 255, 0.3);\n                --pb-text: #0F172A;\n                --pb-muted: #475569;\n                --pb-accent: #A855F7;\n                --pb-border: rgba(255, 255, 255, 0.3);\n                --pb-card-bg: rgba(255, 255, 255, 0.2);\n                \n                backdrop-filter: blur(12px) saturate(180%);\n                -webkit-backdrop-filter: blur(12px) saturate(180%);\n            }\n\n            .purpura-thumbnail-modal.light-mode .purpura-thumbnail-container {\n                box-shadow: \n                    0 8px 32px rgba(0, 0, 0, 0.1),\n                    inset 0 1px 0 rgba(255, 255, 255, 0.5),\n                    inset 0 -1px 0 rgba(255, 255, 255, 0.1),\n                    inset 0 0 40px 20px rgba(255, 255, 255, 2);\n                position: relative;\n                border-top: none;\n            }\n\n            .purpura-thumbnail-modal.light-mode .purpura-thumbnail-container::before {\n                content: '';\n                position: absolute;\n                top: 0;\n                left: 0;\n                right: 0;\n                height: 1px;\n                background: linear-gradient(\n                    90deg,\n                    transparent,\n                    rgba(255, 255, 255, 0.8),\n                    transparent\n                );\n                z-index: 10;\n            }\n\n            .purpura-thumbnail-modal.light-mode .purpura-thumbnail-container::after {\n                content: '';\n                position: absolute;\n                top: 0;\n                left: 0;\n                width: 1px;\n                height: 100%;\n                background: linear-gradient(\n                    180deg,\n                    rgba(255, 255, 255, 0.8),\n                    transparent,\n                    rgba(255, 255, 255, 0.3)\n                );\n                z-index: 10;\n            }\n\n            @keyframes purpuraModalFade {\n                from { opacity: 0; }\n                to { opacity: 1; }\n            }\n\n            @keyframes purpuraContainerScale {\n                from { transform: scale(0.95); opacity: 0; }\n                to { transform: scale(1); opacity: 1; }\n            }\n            \n            .purpura-thumbnail-container { \n                background: var(--pb-bg); \n                border-radius: 28px; \n                padding: 32px; \n                width: 100%;\n                max-width: 1000px;\n                height: 100%;\n                max-height: 800px;\n                display: flex;\n                flex-direction: column;\n                overflow: hidden; \n                border: 1px solid var(--pb-border);\n                box-shadow: 0 40px 100px rgba(0,0,0,0.5);\n                animation: purpuraContainerScale 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;\n            }\n\n            .purpura-thumbnail-modal.light-mode .purpura-thumbnail-container {\n                box-shadow: \n                    0 40px 100px rgba(0,0,0,0.1),\n                    inset 0 1px 0 rgba(255, 255, 255, 0.5),\n                    inset 0 -1px 0 rgba(255, 255, 255, 0.1),\n                    inset 0 0 40px 20px rgba(255, 255, 255, 2);\n            }\n            \n            .purpura-thumbnail-header { \n                display: flex; \n                justify-content: space-between; \n                align-items: center; \n                margin-bottom: 20px; \n                padding-bottom: 16px; \n                border-bottom: 1.5px solid var(--pb-border); \n                flex-shrink: 0;\n            }\n            \n            .purpura-thumbnail-header h3 { \n                margin: 0; \n                font-size: 20px; \n                color: var(--pb-accent); \n                font-weight: 800; \n                letter-spacing: -0.5px;\n            }\n\n            .purpura-thumbnail-scrollable {\n                flex: 1;\n                overflow-y: auto;\n                overscroll-behavior: contain;\n                padding-right: 12px;\n                margin-right: -12px;\n            }\n\n            .purpura-thumbnail-scrollable::-webkit-scrollbar {\n                width: 6px;\n            }\n\n            .purpura-thumbnail-scrollable::-webkit-scrollbar-track {\n                background: transparent;\n            }\n\n            .purpura-thumbnail-scrollable::-webkit-scrollbar-thumb {\n                background: var(--pb-accent);\n                border-radius: 10px;\n            }\n            \n            .purpura-close-btn { \n                background: rgba(239, 68, 68, 0.1); \n                color: var(--purpura-bd-error); \n                border: 1px solid rgba(239, 68, 68, 0.1); \n                width: 36px;\n                height: 36px;\n                display: flex;\n                align-items: center;\n                justify-content: center;\n                border-radius: 50%; \n                cursor: pointer; \n                transition: all 0.3s ease; \n                padding: 0;\n            }\n            \n            .purpura-close-btn:hover { \n                background: var(--purpura-bd-error); \n                color: #fff; \n                transform: rotate(90deg) scale(1.1);\n            }\n            \n            .purpura-close-btn svg {\n                width: 18px;\n                height: 18px;\n            }\n            \n            .purpura-thumbnail-grid { \n                display: grid; \n                grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); \n                gap: 12px; \n                padding-bottom: 20px;\n            }\n            \n            .purpura-thumbnail-grid img { \n                width: 100%; \n                aspect-ratio: 1;\n                object-fit: cover; \n                border-radius: 14px; \n                background: var(--pb-card-bg); \n                border: 1.5px solid var(--pb-border); \n                transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); \n                cursor: pointer; \n            }\n            \n            .purpura-thumbnail-grid img:hover { \n                transform: scale(1.12) translateY(-4px); \n                border-color: var(--pb-accent); \n                box-shadow: 0 12px 24px rgba(168, 85, 247, 0.25); \n                z-index: 2; \n            }\n        `;
document.head.appendChild(o);
const s = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="var(--pb-accent)" d="M12 2a1 1 0 0 1 1 1v2.07A7.002 7.002 0 0 1 19 12v5h1a1 1 0 1 1 0 2h-1v1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-1H4a1 1 0 1 1 0-2h1v-5a7.002 7.002 0 0 1 6-6.93V3a1 1 0 0 1 1-1zm-5 9a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm10 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-7 6h6v-1H10v1z"/></svg>';
const i = (t = 0) => `<svg width="18" height="18" viewBox="0 0 24 24" style="transform:rotate(${t}deg);transition:transform 180ms ease;"><path fill="var(--pb-accent)" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>`;
const c = y(`<div style="display:flex; align-items:center; justify-content:space-between;"><div class="purpura-collapser" title="Click to collapse/expand" style="display:flex; align-items:center; gap:8px;">${s}<div style="display:flex;flex-direction:column;"><div style="font-weight:800; color:var(--pb-accent); font-size:15px; letter-spacing:-0.3px;">${t("botDetector_title")}</div><div id="purpura-subtitle" style="font-size:12px; color:var(--pb-muted); margin-top:1px; font-weight:500;">${t("botDetector_scanning")}</div></div></div><div id="purpura-toggle" style="display:flex; align-items:center;">${i(0)}</div></div>`);
const l = e?.name ? e.name : t("botDetector_unknown");
const u = e && typeof e.playing === "number" && e.playing > 0 ? e.playing.toLocaleString() : t("botDetector_calculating");
const p = y(`<div class="purpura-body"><div class="purpura-section"><h4>${t("botDetector_gameInfo")}</h4><div id="purpura-gameinfo" style="color:var(--pb-text);"><div><strong>${t("botDetector_gameName")}</strong> <span id="purpura-game-name">${l}</span></div><div><strong>${t("botDetector_playercount")}</strong> <span id="purpura-game-players">${u}</span></div></div></div><div class="purpura-section"><h4>${t("botDetector_message")}</h4><div id="purpura-msg" style="font-weight:700; color:var(--pb-text);">${t("botDetector_analyzing")}</div></div><div class="purpura-section"><h4>${t("botDetector_percentEstimation")}</h4><div id="purpura-percent" style="font-weight:700; color:var(--pb-text);">-</div></div><div class="purpura-section"><h4>${t("botDetector_dataset")}</h4><div id="purpura-data" style="color:var(--pb-text);">-</div></div><div class="purpura-section purpura-hidden" id="purpura-database-section"><h4>${t("botDetector_viewAnalysisData")}</h4><button class="purpura-database-btn" id="purpura-database-btn">${t("botDetector_viewDatabase")}</button></div><div class="purpura-section"><h4>${t("botDetector_extraNotes")}</h4><div style="color:var(--pb-muted); font-size:13px;">${t("botDetector_note1")} <br>${t("botDetector_note2")}</div></div></div>`);
a.appendChild(c);
a.appendChild(p);
r.parentElement.insertBefore(a, r);
const d = a.querySelector("#purpura-toggle");
const b = a.querySelector(".purpura-collapser");
const g = w();
function m(t) {
const e = a.querySelector(".purpura-body");
e.classList.toggle("purpura-hidden", t);
d.innerHTML = i(t ? 180 : 0);
S({
collapsed: t
});
}
b.addEventListener("click", () => m(!a.querySelector(".purpura-body").classList.contains("purpura-hidden")));
d.addEventListener("click", () => m(!a.querySelector(".purpura-body").classList.contains("purpura-hidden")));
if (g && g.collapsed) m(true);
return {
subtitle: a.querySelector("#purpura-subtitle"),
msg: a.querySelector("#purpura-msg"),
percent: a.querySelector("#purpura-percent"),
data: a.querySelector("#purpura-data"),
gameNameSpan: a.querySelector("#purpura-game-name"),
gamePlayersSpan: a.querySelector("#purpura-game-players"),
databaseBtn: a.querySelector("#purpura-database-btn"),
databaseSection: a.querySelector("#purpura-database-section"),
card: a,
styleTag: o
};
}
function T(t) {
t.classList.add("purpura-flash");
setTimeout(() => t.classList.remove("purpura-flash"), 1e3);
}
async function z() {
await new Promise(t => setTimeout(t, r));
const t = await new Promise(t => {
const e = window.__PurpuraSettings.get("bd");
if (typeof e === "boolean") t(e); else if (e && typeof e === "object") t(e.enabled !== false); else t(true);
});
if (!t) {
return;
}
const e = await P(m);
const a = await B();
if (!a) {
return;
}
const o = await chrome.runtime.sendMessage({
action: "getRobloxTheme"
});
const s = o?.theme === "light";
const i = E({
...e || {},
isLight: s
});
if (!i) {
return;
}
if (n) n.disconnect();
n = new MutationObserver(async () => {
const t = await chrome.runtime.sendMessage({
action: "getRobloxTheme"
});
const e = t?.theme === "light";
const n = document.querySelector(".purpura-bot-card");
if (n) {
n.classList.toggle("light-mode", e);
n.classList.toggle("dark-mode", !e);
}
});
n.observe(document.documentElement, {
attributes: true,
attributeFilter: [ "class" ]
});
if (document.body) n.observe(document.body, {
attributes: true,
attributeFilter: [ "class" ]
});
return q(i, e || {});
}
async function q(e, r) {
let a = null;
const o = await new Promise(t => {
const e = window.__PurpuraSettings.get("bd");
if (e && typeof e === "object") t(e); else t({});
});
const s = o.showDatabase !== false;
const i = o.roundToWholeNumbers !== false;
if (s) {
const t = v();
if (t && t.success && t.imageUrls) {
e.databaseSection.classList.remove("purpura-hidden");
}
}
function c(e, n, r) {
if (i) {
return t("botDetector_percentBots", [ String(Math.round(e)) ]);
} else {
return t("botDetector_percentBots", [ String(e) ]);
}
}
async function l(e) {
if (!e || e.length === 0) {
alert(t("botDetector_noThumbnailData"));
return;
}
const n = await chrome.runtime.sendMessage({
action: "getRobloxTheme"
});
const r = n?.theme === "light";
const a = y(`<div class="purpura-thumbnail-modal ${r ? "light-mode" : "dark-mode"}">\n                <div class="purpura-thumbnail-container">\n                    <div class="purpura-thumbnail-header">\n                        <div>\n                            <h3 style="color: ${r ? "var(--purpura-bd-accent-light)" : "var(--pb-accent)"}">${t("botDetector_analysisDatabase")} <span style="font-size: 13px; color: ${r ? "var(--purpura-bd-muted-light)" : "var(--pb-muted)"}; font-weight: 600; margin-left: 8px;">${t("botDetector_samples", [ String(e.length) ])}</span></h3>\n                        </div>\n                        <button class="purpura-close-btn">\n                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>\n                        </button>\n                    </div>\n                    <div class="purpura-thumbnail-scrollable">\n                        <div class="purpura-thumbnail-grid"></div>\n                    </div>\n                </div>\n            </div>`);
const o = a.querySelector(".purpura-thumbnail-grid");
e.forEach(t => {
const e = document.createElement("img");
e.src = t;
e.alt = "Player thumbnail";
o.appendChild(e);
});
const s = window.innerWidth - document.documentElement.clientWidth;
document.documentElement.style.overflow = "hidden";
document.body.style.overflow = "hidden";
if (s > 0) {
document.body.style.paddingRight = `${s}px`;
}
const i = t => {
if (!a.querySelector(".purpura-thumbnail-scrollable").contains(t.target)) {
t.preventDefault();
}
};
a.addEventListener("wheel", i, {
passive: false
});
a.addEventListener("touchmove", i, {
passive: false
});
const c = () => {
a.remove();
document.documentElement.style.overflow = "";
document.body.style.overflow = "";
document.body.style.paddingRight = "";
a.removeEventListener("wheel", i);
a.removeEventListener("touchmove", i);
};
const l = a.querySelector(".purpura-close-btn");
l.addEventListener("click", c);
a.addEventListener("click", t => {
if (t.target === a) c();
});
document.body.appendChild(a);
}
if (e.databaseBtn) {
e.databaseBtn.addEventListener("click", () => {
const t = v();
if (t && t.imageUrls) {
l(t.imageUrls);
} else {
alert("No thumbnail data available. Please wait for a scan to complete.");
}
});
}
const p = v();
if (p && p.success) {
e.subtitle.textContent = t("botDetector_lastScan", [ new Date(p.time).toLocaleString() ]);
e.msg.textContent = p.message || t("botDetector_cachedResults");
e.msg.style.color = p.msgColor || "var(--pb-text)";
e.percent.textContent = c(p.botPercentage, p.totalPlayers, p.totalBots);
e.data.textContent = t("botDetector_analyzedCached", [ String(p.totalPlayers), String(p.serversCount) ]);
if (typeof p.totalServerPlayers === "number") {
const n = Math.max(p.totalServerPlayers || 0, r?.playing || 0);
e.gameNameSpan.textContent = r?.name || t("botDetector_unknown");
e.gamePlayersSpan.textContent = n ? n.toLocaleString() : t("botDetector_unknown");
}
} else {
if (r?.name) e.gameNameSpan.textContent = r.name;
e.gamePlayersSpan.textContent = typeof r?.playing === "number" && r.playing > 0 ? r.playing.toLocaleString() : t("botDetector_calculating");
}
async function d() {
e.subtitle.textContent = t("botDetector_scanningProgress", [ "0", String(b) ]);
try {
const n = await L((n, r) => {
e.subtitle.textContent = t("botDetector_scanningProgress", [ String(n), String(r) ]);
});
if (!n.success) {
const a = v();
if (a && a.success) {
e.subtitle.textContent = t("botDetector_cachedFallback", [ n.reason ]);
e.msg.textContent = a.message || t("botDetector_cachedResults");
e.msg.style.color = a.msgColor || "var(--pb-text)";
e.percent.textContent = c(a.botPercentage, a.totalPlayers, a.totalBots);
e.data.textContent = t("botDetector_analyzedCached", [ String(a.totalPlayers), String(a.serversCount) ]);
if (typeof a.totalServerPlayers === "number") e.gamePlayersSpan.textContent = Math.max(a.totalServerPlayers || 0, r?.playing || 0).toLocaleString();
} else {
e.subtitle.textContent = t("botDetector_scanFailed", [ n.reason || t("botDetector_unknown") ]);
e.msg.textContent = t("botDetector_couldNotGatherData");
e.msg.style.color = "var(--purpura-bd-error)";
e.percent.textContent = "-";
e.data.textContent = t("botDetector_triedScanning", [ String(n.serversCount || 0), String(n.imageCount || 0) ]);
e.gamePlayersSpan.textContent = r?.playing && r.playing > 0 ? r.playing.toLocaleString() : t("botDetector_calculating");
}
return;
}
let a = "";
let o = "var(--purpura-bd-success)";
if (n.botPercentage > 20) {
a = "This game has a lot of bots detected.";
o = "var(--purpura-bd-error)";
} else if (n.botPercentage > 10) {
a = "This game has some bots but mostly real players.";
o = "var(--purpura-bd-warning)";
} else {
a = "This game seems mostly bot-free.";
}
e.subtitle.textContent = t("botDetector_lastScan", [ new Date(n.time).toLocaleString() ]);
e.msg.textContent = a;
e.msg.style.color = o;
e.percent.textContent = c(n.botPercentage, n.totalPlayers, n.totalBots);
e.data.textContent = t("botDetector_analyzed", [ String(n.totalPlayers), String(n.serversCount) ]);
const i = r && typeof r.playing === "number" ? r.playing : 0;
const l = typeof n.totalServerPlayers === "number" ? n.totalServerPlayers : 0;
const u = Math.max(i, l) || (i || l || "Unknown");
e.gameNameSpan.textContent = r?.name || t("botDetector_unknown");
e.gamePlayersSpan.textContent = typeof u === "number" ? u.toLocaleString() : t("botDetector_unknown");
x({
...n,
message: a,
msgColor: o,
totalServerPlayers: n.totalServerPlayers,
imageUrls: n.imageUrls
});
if (s && n.imageUrls && n.imageUrls.length > 0) {
e.databaseSection.classList.remove("purpura-hidden");
}
T(e.card);
} catch (n) {
const a = v();
if (a && a.success) {
e.subtitle.textContent = t("botDetector_cachedError");
e.msg.textContent = a.message || t("botDetector_cachedResults");
e.msg.style.color = a.msgColor || "var(--pb-text)";
e.percent.textContent = c(a.botPercentage, a.totalPlayers, a.totalBots);
e.data.textContent = t("botDetector_analyzedCached", [ String(a.totalPlayers), String(a.serversCount) ]);
if (typeof a.totalServerPlayers === "number") e.gamePlayersSpan.textContent = Math.max(a.totalServerPlayers || 0, r?.playing || 0).toLocaleString();
} else {
e.subtitle.textContent = t("botDetector_scanError");
e.msg.textContent = t("botDetector_couldNotScan");
e.msg.style.color = "var(--purpura-bd-error)";
e.percent.textContent = "-";
e.data.textContent = t("botDetector_noCachedData");
e.gamePlayersSpan.textContent = r?.playing && r.playing > 0 ? r.playing.toLocaleString() : t("botDetector_calculating");
}
}
}
await d();
a = setInterval(d, u);
const g = (t, n) => {
if (n === "sync" && t["bd"]) {
const t = window.__PurpuraSettings.get("bd");
if (t && typeof t === "object") {
const n = t.showDatabase === true;
const r = t.roundToWholeNumbers === true;
if (n !== (o.showDatabase === true)) {
if (n) {
const t = v();
if (t && t.success && t.imageUrls && t.imageUrls.length > 0) {
e.databaseSection.classList.remove("purpura-hidden");
}
} else {
e.databaseSection.classList.add("purpura-hidden");
}
o.showDatabase = n;
}
if (r !== (o.roundToWholeNumbers === true)) {
o.roundToWholeNumbers = r;
const t = v();
if (t && t.success) {
e.percent.textContent = c(t.botPercentage, t.totalPlayers, t.totalBots);
}
}
}
}
};
chrome.storage.onChanged.addListener(g);
const m = () => {
try {
if (a) clearInterval(a);
} catch {}
try {
chrome.storage.onChanged.removeListener(g);
} catch {}
try {
if (n) n.disconnect();
} catch {}
try {
if (e && e.card) e.card.remove();
} catch {}
try {
const t = document.head.querySelector('style[data-purpura-bot-style="1"]');
if (t) t.remove();
} catch {}
try {
const t = document.querySelector(".purpura-thumbnail-modal");
if (t) t.remove();
} catch {}
try {
if (window.PurpuraBotDetector?.cleanup === m) window.PurpuraBotDetector.cleanup = null;
} catch {}
};
window.PurpuraBotDetector = window.PurpuraBotDetector || {};
window.PurpuraBotDetector.cleanup = m;
return m;
}
z().catch(() => {});
return () => {
try {
if (window.PurpuraBotDetector?.cleanup) window.PurpuraBotDetector.cleanup();
} catch {}
};
}

chrome.storage.sync.get([ "bd" ], t => {
const e = window.__PurpuraSettings ? window.__PurpuraSettings.get("bd") : t["bd"];
let n = true;
if (typeof e === "boolean") n = e; else if (e && typeof e === "object") n = e.enabled !== false;
if (n) initBotDetector();
});

chrome.storage.onChanged.addListener((t, e) => {
if (e === "sync" && t["bd"]) {
const e = window.__PurpuraSettings ? window.__PurpuraSettings.get("bd") : t["bd"].newValue;
let n = false;
if (typeof e === "boolean") n = e; else if (e && typeof e === "object") n = e.enabled !== false;
if (n) {
try {
if (window.PurpuraBotDetector?.cleanup) window.PurpuraBotDetector.cleanup();
} catch {}
initBotDetector();
} else {
try {
if (window.PurpuraBotDetector?.cleanup) window.PurpuraBotDetector.cleanup();
} catch {}
}
}
});
