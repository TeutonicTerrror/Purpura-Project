/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
"use strict";
function e(e, n) {
return chrome.i18n.getMessage(e, n) || e;
}
if (window.purpuraQuickPlayInitialized) return;
window.purpuraQuickPlayInitialized = true;
let n = false;
const t = {
activePlaceId: null,
activeGameCardLink: null,
privateServerList: new Map,
privateServersContainer: null,
dropdownPanel: null,
hideOverlayTimer: null,
isLoadingPrivateServers: false,
currentNextPageCursor: null
};
function r(e) {
if (typeof chrome !== "undefined" && chrome.runtime) {
chrome.runtime.sendMessage({
action: "injectScript",
codeToInject: e
});
}
}
function a(e, n = null) {
if (!e) return;
const t = `if (typeof Roblox?.GameLauncher?.joinGameInstance === 'function') { ${n ? `Roblox.GameLauncher.joinGameInstance(parseInt('${e}', 10), '${n}')` : `Roblox.GameLauncher.joinGameInstance(parseInt('${e}', 10))`}; }`;
r(t);
}
function i(e, n, t) {
if (!e || !n || !t) {
return;
}
const a = `if (typeof Roblox?.GameLauncher?.joinPrivateGame === 'function') { \n            Roblox.GameLauncher.joinPrivateGame(parseInt('${e}', 10), '${n}', '${t}'); \n        }`;
r(a);
}
function o() {
const e = window.location.pathname;
return e === "/home" || e === "/charts";
}
function s(e) {
const n = e.match(/\/games\/(\d+)\//);
return n ? n[1] : null;
}
async function p(e, n) {
const t = `https://${e}.roblox.com${n}`;
try {
const e = await fetch(t, {
credentials: "include",
headers: {
"Content-Type": "application/json"
}
});
return e;
} catch (e) {
return null;
}
}
function u() {
if (document.getElementById("purpura-private-servers-dropdown")) return;
const e = document.createElement("div");
e.id = "purpura-private-servers-dropdown";
e.className = "purpura-ps-dropdown";
e.setAttribute("data-state", "closed");
const n = document.createElement("div");
n.className = "purpura-ps-list";
e.appendChild(n);
document.body.appendChild(e);
t.dropdownPanel = e;
t.privateServersContainer = n;
e.addEventListener("mouseenter", () => {
clearTimeout(t.hideOverlayTimer);
});
e.addEventListener("mouseleave", () => {
t.hideOverlayTimer = setTimeout(m, 200);
});
n.addEventListener("scroll", e => {
if (t.isLoadingPrivateServers || !t.currentNextPageCursor || !t.activePlaceId) return;
const {scrollTop: n, scrollHeight: r, clientHeight: a} = e.target;
if (r - n - a < 50) {
l(t.activePlaceId, true, t.currentNextPageCursor);
}
});
}
async function l(e, n = false, r = null) {
if (t.isLoadingPrivateServers) return;
t.isLoadingPrivateServers = true;
try {
if (!n) {
t.privateServersContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:80px;text-align:center;padding:10px;color:#888;font-size:14px;">Loading...</div>';
if (t.privateServerList.has(e)) {
const n = t.privateServerList.get(e);
c(e, n.servers, n.nextPageCursor, false);
t.isLoadingPrivateServers = false;
return;
}
}
const a = await p("games", `/v1/games/${e}/private-servers?limit=50&sortOrder=Desc${r ? `&cursor=${r}` : ""}`);
if (!a || !a.ok) {
throw new Error("Failed to fetch private servers");
}
const i = await a.json();
const o = i.data || [];
if (n) {
const n = t.privateServerList.get(e) || {
servers: [],
nextPageCursor: null
};
n.servers.push(...o);
n.nextPageCursor = i.nextPageCursor;
c(e, o, i.nextPageCursor, true);
} else {
t.privateServerList.set(e, {
servers: o,
nextPageCursor: i.nextPageCursor
});
c(e, o, i.nextPageCursor, false);
}
} catch (e) {
t.privateServersContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:80px;text-align:center;padding:10px;color:#888;font-size:14px;">Failed to load servers</div>';
} finally {
t.isLoadingPrivateServers = false;
}
}
function c(e, n, r, a) {
if (!a) {
t.privateServersContainer.innerHTML = "";
}
t.currentNextPageCursor = r;
const o = n.filter(e => e.accessCode);
if (!o.length && !a) {
const e = document.createElement("div");
e.textContent = "No active private servers found";
e.style.cssText = "display:flex;align-items:center;justify-content:center;min-height:80px;text-align:center;padding:10px;color:#888;font-size:14px;";
t.privateServersContainer.appendChild(e);
return;
}
const s = document.createDocumentFragment();
o.forEach(n => {
const t = document.createElement("div");
t.className = "purpura-ps-item";
const r = document.createElement("div");
r.className = "purpura-ps-info";
const a = document.createElement("span");
a.className = "purpura-ps-name";
a.textContent = n.name;
a.title = n.name;
const o = document.createElement("span");
o.className = "purpura-ps-players";
o.textContent = `${n.players?.length || 0} / ${n.maxPlayers}`;
r.appendChild(a);
r.appendChild(o);
const p = document.createElement("button");
p.className = "purpura-ps-join-btn";
p.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg>';
p.title = "Join Server";
p.onclick = t => {
t.preventDefault();
t.stopPropagation();
i(e, n.accessCode, n.vipServerId);
m();
};
t.appendChild(r);
t.appendChild(p);
s.appendChild(t);
});
t.privateServersContainer.appendChild(s);
}
function d(e, n) {
const r = e.closest(".game-card-link") || e;
if (t.activeGameCardLink === r) {
m();
return;
}
if (t.activeGameCardLink) {
t.activeGameCardLink.classList.remove("purpura-quick-play-active");
}
t.activeGameCardLink = r;
t.activePlaceId = n;
r.classList.add("purpura-quick-play-active");
const a = t.dropdownPanel;
if (!a) return;
const i = e.getBoundingClientRect();
const o = 320;
a.style.width = `${o}px`;
let s = i.left + i.width / 2 - o / 2;
s = Math.max(10, Math.min(s, document.documentElement.clientWidth - o - 10));
const p = document.documentElement.clientHeight;
const u = 350;
const c = p - i.bottom - 5;
const d = i.top - 5;
const f = a.querySelector(".purpura-ps-list");
if (c >= u || c >= d) {
const e = i.bottom + 5;
a.style.top = `${e}px`;
a.style.bottom = "auto";
a.className = "purpura-ps-dropdown open-down";
if (f) {
const e = Math.max(80, Math.min(u, p - i.bottom - 20));
f.style.maxHeight = `${e}px`;
}
} else {
const e = p - i.top + 5;
a.style.bottom = `${e}px`;
a.style.top = "auto";
a.className = "purpura-ps-dropdown open-up";
if (f) {
const e = Math.max(80, Math.min(u, i.top - 20));
f.style.maxHeight = `${e}px`;
}
}
a.style.left = `${s}px`;
a.classList.add("visible");
a.setAttribute("data-state", "open");
l(n);
}
function m() {
if (t.dropdownPanel && t.dropdownPanel.matches(":hover")) return;
if (!t.dropdownPanel || !t.dropdownPanel.classList.contains("visible")) return;
if (t.activeGameCardLink) {
t.activeGameCardLink.classList.remove("purpura-quick-play-active");
}
t.dropdownPanel.classList.remove("visible");
t.dropdownPanel.setAttribute("data-state", "closed");
t.activeGameCardLink = null;
t.activePlaceId = null;
t.currentNextPageCursor = null;
const e = t.dropdownPanel.querySelector(".purpura-ps-list");
if (e) e.style.maxHeight = "350px";
}
function f() {
if (document.getElementById("purpura-quick-play-styles")) return;
const e = document.createElement("style");
e.id = "purpura-quick-play-styles";
e.textContent = `\n            .game-card-link {\n                position: relative;\n            }\n\n            [data-purpura-quick-play]:hover {\n                padding-bottom: 38px !important;\n            }\n\n            [data-purpura-quick-play] {\n                transition: padding-bottom 0.25s ease;\n            }\n\n            .purpura-quick-play-buttons {\n                position: absolute;\n                bottom: 0;\n                left: 0;\n                right: 0;\n                display: flex;\n                gap: 4px;\n                padding: 0 4px 4px;\n                opacity: 0;\n                transform: translateY(8px);\n                transition: opacity 0.25s ease, transform 0.25s ease;\n                pointer-events: none;\n                z-index: 15;\n            }\n\n            .game-card-link:hover .purpura-quick-play-buttons {\n                opacity: 1;\n                transform: translateY(0);\n                pointer-events: all;\n            }\n\n            .purpura-qp-btn {\n                flex: 1;\n                height: 34px;\n                border: none;\n                cursor: pointer;\n                font-weight: 600;\n                font-size: 12px;\n                color: #ffffff;\n                display: flex;\n                align-items: center;\n                justify-content: center;\n                gap: 6px;\n                transition: all 0.25s ease;\n                position: relative;\n                overflow: hidden;\n                border-radius: 8px;\n                font-family: 'Segoe UI', system-ui, sans-serif;\n            }\n\n            .purpura-qp-btn::before {\n                content: '';\n                position: absolute;\n                inset: 0;\n                background: linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%);\n                opacity: 0;\n                transition: opacity 0.25s ease;\n            }\n\n            .purpura-qp-btn:hover::before {\n                opacity: 1;\n            }\n\n            .purpura-qp-btn svg {\n                width: 14px;\n                height: 14px;\n                flex-shrink: 0;\n                transition: transform 0.25s ease;\n            }\n\n            .purpura-qp-play {\n                background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);\n            }\n\n            .purpura-qp-play:hover {\n                background: linear-gradient(135deg, #9d74f7 0%, #8b5cf6 100%);\n                transform: translateY(-2px);\n                box-shadow: 0 4px 14px rgba(139, 92, 246, 0.35);\n            }\n\n            .purpura-qp-play:hover svg {\n                transform: scale(1.1);\n            }\n\n            .purpura-qp-servers {\n                background: linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%);\n            }\n\n            .purpura-qp-servers:hover {\n                background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);\n                transform: translateY(-2px);\n                box-shadow: 0 4px 14px rgba(109, 40, 217, 0.35);\n            }\n\n            .purpura-qp-servers:hover svg {\n                transform: scale(1.1);\n            }\n\n            .purpura-ps-dropdown {\n                position: fixed;\n                background: rgba(22, 23, 28, 0.98);\n                border: 1px solid rgba(139, 92, 246, 0.15);\n                border-radius: 12px;\n                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(139, 92, 246, 0.08);\n                z-index: 10000;\n                opacity: 0;\n                transition: opacity 0.2s ease, transform 0.2s ease;\n                pointer-events: none;\n                backdrop-filter: blur(16px);\n            }\n\n            .purpura-ps-dropdown.open-down { transform: translateY(-5px); }\n            .purpura-ps-dropdown.open-up {\n                transform: scaleY(0);\n                transform-origin: bottom center;\n            }\n\n            .purpura-ps-dropdown.visible {\n                opacity: 1;\n                transform: translateY(0) scaleY(1);\n                pointer-events: all;\n            }\n\n            .purpura-ps-list {\n                max-height: 350px;\n                min-height: 80px;\n                overflow-y: auto;\n                overflow-x: hidden;\n                padding: 8px;\n            }\n\n            .purpura-ps-list::-webkit-scrollbar {\n                display: none;\n            }\n\n            .purpura-ps-list {\n                scrollbar-width: none;\n                -ms-overflow-style: none;\n            }\n\n            .purpura-ps-item {\n                display: flex;\n                align-items: center;\n                gap: 10px;\n                padding: 9px 10px;\n                margin-bottom: 3px;\n                background: rgba(139, 92, 246, 0.04);\n                border: 1px solid rgba(139, 92, 246, 0.06);\n                border-radius: 8px;\n                transition: background 0.2s ease, border-color 0.2s ease;\n            }\n\n            .purpura-ps-item:hover {\n                background: rgba(139, 92, 246, 0.08);\n                border-color: rgba(139, 92, 246, 0.12);\n            }\n\n            .purpura-ps-info {\n                flex: 1;\n                display: flex;\n                flex-direction: column;\n                gap: 4px;\n                min-width: 0;\n            }\n\n            .purpura-ps-name {\n                color: #ffffff;\n                font-weight: 500;\n                font-size: 14px;\n                white-space: nowrap;\n                overflow: hidden;\n                text-overflow: ellipsis;\n            }\n\n            .purpura-ps-players {\n                color: #888;\n                font-size: 12px;\n            }\n\n            .purpura-ps-join-btn {\n                width: 32px;\n                height: 32px;\n                border: none;\n                background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);\n                border-radius: 8px;\n                cursor: pointer;\n                display: flex;\n                align-items: center;\n                justify-content: center;\n                transition: all 0.2s ease;\n                flex-shrink: 0;\n            }\n\n            .purpura-ps-join-btn svg {\n                width: 14px;\n                height: 14px;\n                transition: transform 0.2s ease;\n            }\n\n            .purpura-ps-join-btn:hover {\n                background: linear-gradient(135deg, #9d74f7 0%, #8b5cf6 100%);\n                transform: scale(1.08);\n                box-shadow: 0 3px 10px rgba(139, 92, 246, 0.3);\n            }\n\n            .purpura-ps-join-btn:hover svg {\n                transform: scale(1.1);\n            }\n        `;
document.head.appendChild(e);
}
function v(n) {
if (n.querySelector(".purpura-quick-play-buttons")) return;
const r = s(n.href);
if (!r) return;
const i = document.createElement("div");
i.className = "purpura-quick-play-buttons";
const o = document.createElement("button");
o.className = "purpura-qp-btn purpura-qp-play";
o.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg><span>${e("quickPlay_play")}</span>`;
o.title = "Quick Play";
o.addEventListener("click", e => {
e.preventDefault();
e.stopPropagation();
a(r);
});
const p = document.createElement("button");
p.className = "purpura-qp-btn purpura-qp-servers";
p.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg><span>${e("quickPlay_servers")}</span>`;
p.title = "Private Servers";
p.addEventListener("click", e => {
e.preventDefault();
e.stopPropagation();
d(p, r);
});
i.appendChild(o);
i.appendChild(p);
n.appendChild(i);
n.addEventListener("mouseenter", () => {
if (t.dropdownPanel?.classList.contains("visible") && t.activeGameCardLink === n) {
clearTimeout(t.hideOverlayTimer);
}
});
n.addEventListener("mouseleave", () => {
if (t.activeGameCardLink === n) {
t.hideOverlayTimer = setTimeout(m, 200);
}
});
}
function g() {
if (!n) return;
const e = document.querySelectorAll('.game-card-link[href*="/games/"]:not([data-purpura-quick-play])');
e.forEach(e => {
e.setAttribute("data-purpura-quick-play", "true");
v(e);
});
}
let h = null;
function x() {
const e = new MutationObserver(() => {
if (n && o()) {
clearTimeout(h);
h = setTimeout(g, 50);
}
});
e.observe(document.body, {
childList: true,
subtree: true
});
return e;
}
function y() {
window.__PurpuraSettings.ready.then(function() {
var e = window.__PurpuraSettings.get("qp");
var t = e === undefined ? true : e === true;
if (t !== n) {
n = t;
if (n && o()) {
f();
u();
g();
} else if (!n) {
if (L) {
L.disconnect();
L = null;
}
if (k) {
clearTimeout(k);
k = null;
}
document.querySelectorAll(".purpura-quick-play-buttons").forEach(e => e.remove());
document.querySelectorAll("[data-purpura-quick-play]").forEach(e => {
e.removeAttribute("data-purpura-quick-play");
});
document.getElementById("purpura-private-servers-dropdown")?.remove();
}
}
});
}
y();
chrome.storage.onChanged.addListener((e, n) => {
if (n === "sync" && e["qp"]) {
y();
}
});
function b() {
if (!document.head || !document.body) return;
if (!o()) return;
f();
u();
g();
n = true;
L = x();
}
function w() {
if (window.__purpuraQPSPAWatcher) return;
window.__purpuraQPSPAWatcher = true;
let e = window.location.href;
const t = () => {
const t = window.location.href;
if (t === e) return;
e = t;
if (n && o()) {
g();
}
};
const r = history.pushState.bind(history);
history.pushState = function(...e) {
r(...e);
setTimeout(t, 50);
};
const a = history.replaceState.bind(history);
history.replaceState = function(...e) {
a(...e);
setTimeout(t, 50);
};
window.addEventListener("popstate", () => setTimeout(t, 50));
}
let k = null;
function C() {
function e(t) {
k = setTimeout(() => {
k = null;
if (n && o()) {
const n = document.querySelectorAll('.game-card-link[href*="/games/"]:not([data-purpura-quick-play])');
if (n.length > 0) {
g();
} else if (t < 1e3) {
e(t + 400);
}
}
}, t);
}
e(200);
}
let L = null;
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", () => {
b();
w();
C();
});
} else {
b();
w();
C();
}
window.addEventListener("beforeunload", () => {
if (L) {
L.disconnect();
}
if (k) {
clearTimeout(k);
}
});
})();
