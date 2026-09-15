/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
"use strict";
const e = "ps";
const t = "purpuras-selection-container";
(function() {
var e = document.createElement("style");
e.textContent = ":root{--purpura-ps-genre-pill-bg:rgba(0,0,0,0.75);--purpura-ps-genre-pill-text:#fff;--purpura-ps-light-color:#393939}";
document.head.appendChild(e);
})();
const n = [ {
name: "Welcome to Bloxburg",
genre: "Roleplay",
placeId: 185655149
}, {
name: "Bee Swarm Simulator",
genre: "Simulator",
placeId: 1537690962
}, {
name: "Vesteria",
genre: "RPG",
placeId: 2376885433
}, {
name: "Bite By Night",
genre: "Horror",
placeId: 70845479499574
}, {
name: "PHIGHTING!",
genre: "FPS",
placeId: 7138009149
}, {
name: "Parkour Reborn",
genre: "Obby",
placeId: 11639495622
}, {
name: "Theme Park Tycoon 2",
genre: "Tycoon",
placeId: 69184822
}, {
name: "Jujutsu Shenanigans",
genre: "PvP",
placeId: 9391468976
}, {
name: "All Star Tower Defense",
genre: "Tower Defense",
placeId: 4996049426
}, {
name: "The Wild West",
genre: "Survival",
placeId: 2317712696
}, {
name: "Dress To Impress",
genre: "Fashion",
placeId: 15101393044
}, {
name: "HOURS",
genre: "Strategy",
placeId: 5732973455
}, {
name: "Racket Rivals",
genre: "Sports",
placeId: 90906407195271
}, {
name: "Break In 2",
genre: "Story",
placeId: 13864661e3
}, {
name: "Build A Boat For Treasure",
genre: "Creative Inspiration",
placeId: 537413528
}, {
name: "Possessor",
genre: "Murder Mystery",
placeId: 14841485778
}, {
name: "BedWars",
genre: "Team Fighting",
placeId: 6872265039
}, {
name: "Guts & Blackpowder",
genre: "Mature Audiences",
placeId: 12334109280
}, {
name: "Mad City: Chapter 2",
genre: "Prison",
placeId: 1224212277
}, {
name: "Fantastic Frontier",
genre: "Meme-ified",
placeId: 510411669
}, {
name: "REx Reincarnated",
genre: "Experimental",
placeId: 8549934015
}, {
name: "Aftermath",
genre: "Best Paid Experience",
placeId: 15327728308
}, {
name: "Cube Combination",
genre: "Puzzle",
placeId: 9798463281
}, {
name: "Super Doomspire",
genre: "Battle Royale",
placeId: 3725149043
}, {
name: "Arcade Island",
genre: "Retro",
placeId: 2185497593
}, {
name: "Battleboards",
genre: "Unique Concept",
placeId: 3422469965
} ];
let a = false;
let r = false;
let i = null;
let o = null;
function l(e) {
const t = e.slice();
for (let e = t.length - 1; e > 0; e--) {
const n = Math.floor(Math.random() * (e + 1));
[t[e], t[n]] = [ t[n], t[e] ];
}
return t;
}
function s(e) {
if (e >= 1e6) {
return (e / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
}
if (e >= 1e3) {
return (e / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
}
return String(e);
}
async function c() {
return new Promise(t => {
const n = window.__PurpuraSettings.get(e);
t(n === undefined || n === true || !!n);
});
}
function d() {
return window.location.href.startsWith("https://www.roblox.com/charts");
}
function u() {
return !!document.getElementById(t);
}
function m() {
const e = document.querySelector(".pinned-games-carousel");
if (e) return {
anchor: e,
position: "afterend"
};
const t = document.querySelector(".games-list-container");
if (t) return {
anchor: t,
position: "beforebegin"
};
const n = document.querySelector(".filters-container");
if (n) return {
anchor: n,
position: "afterend"
};
return null;
}
async function p(e) {
try {
const t = await fetch(`https://games.roblox.com/v1/games/multiget-place-details?placeIds=${e.join("&placeIds=")}`, {
credentials: "include"
});
if (!t.ok) return {};
const n = await t.json();
const a = {};
for (const e of n) {
a[e.placeId] = e.universeId;
}
return a;
} catch (e) {
return {};
}
}
async function f(e) {
if (e.length === 0) return {};
const t = {};
const n = e.join(",");
try {
const [e, a] = await Promise.all([ fetch(`https://games.roblox.com/v1/games?universeIds=${n}`, {
credentials: "include"
}), fetch(`https://games.roblox.com/v1/games/votes?universeIds=${n}`, {
credentials: "include"
}) ]);
if (e.ok) {
const n = await e.json();
for (const e of n.data) {
t[e.id] = {
name: e.name,
playing: e.playing || 0,
votePercent: 0
};
}
}
if (a.ok) {
const e = await a.json();
for (const n of e.data) {
const e = n.upVotes + n.downVotes;
const a = e > 0 ? Math.round(n.upVotes / e * 100) : 0;
if (t[n.id]) {
t[n.id].votePercent = a;
} else {
t[n.id] = {
name: "",
playing: 0,
votePercent: a
};
}
}
}
} catch (e) {}
return t;
}
async function h(e) {
if (e.length === 0) return {};
try {
const t = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${e.join(",")}&returnPolicy=PlaceHolder&size=256x256&format=Webp&isCircular=false`);
if (!t.ok) return {};
const n = await t.json();
const a = {};
for (const e of n.data) {
if (e.state === "Completed" && e.imageUrl) {
a[e.targetId] = e.imageUrl;
}
}
return a;
} catch (e) {
return {};
}
}
function g() {
if (document.getElementById("purpura-genre-pill-styles")) return;
const e = document.createElement("style");
e.id = "purpura-genre-pill-styles";
e.textContent = `\n            html.light-theme .game-card-info .info-label,\n            html.light-theme [data-testid="game-tile-stats"] .info-label,\n            html.light-theme .game-card-container .info-label,\n            html.light-theme .game-tile .info-label,\n            html.light-theme .game-card .info-label,\n            html[data-theme="light"] .game-card-info .info-label,\n            html[data-theme="light"] [data-testid="game-tile-stats"] .info-label,\n            html[data-theme="light"] .game-card-container .info-label,\n            body.light-theme .game-card-info .info-label,\n            body[data-theme="light"] .game-card-info .info-label,\n            body.theme-light .game-card-info .info-label {\n                color: var(--purpura-ps-light-color) !important;\n            }\n            .purpura-genre-pill {\n                position: absolute;\n                bottom: 4px;\n                right: 4px;\n                background: var(--purpura-ps-genre-pill-bg);\n                color: var(--purpura-ps-genre-pill-text);\n                font-size: 10px;\n                font-weight: 600;\n                padding: 2px 6px;\n                border-radius: 4px;\n                line-height: 14px;\n                white-space: nowrap;\n                pointer-events: none;\n                z-index: 1;\n                backdrop-filter: blur(4px);\n                -webkit-backdrop-filter: blur(4px);\n            }\n        `;
document.head.appendChild(e);
}
function b(e, n, a) {
g();
const r = document.createElement("div");
r.className = "games-list-container";
r.id = t;
const i = document.createElement("div");
i.className = "home-sort-header-container";
i.style.marginBottom = "16px";
const o = document.createElement("div");
o.className = "css-ibw9t7-sectionHeader";
o.setAttribute("data-testid", "section-header");
const l = document.createElement("div");
l.className = "css-1h1fine-titleSubtitleContainer";
l.setAttribute("data-testid", "section-header-title-subtitle-container");
const c = document.createElement("div");
c.className = "css-j5e4nw-textIconRow";
c.setAttribute("aria-label", "Purpura's Selection");
c.setAttribute("data-testid", "text-icon-row");
const d = document.createElement("span");
d.className = "css-4izgel-textIconRowText css-59f5rs-textOverride";
d.setAttribute("data-testid", "text-icon-row-text");
d.setAttribute("data-sdui-text", "true");
d.textContent = "Purpura's Selection";
c.appendChild(d);
l.appendChild(c);
o.appendChild(l);
i.appendChild(o);
r.appendChild(i);
const u = document.createElement("div");
u.setAttribute("data-testid", "game-carousel");
u.className = "horizontal-scroller games-list dynamic-layout-sizing-disabled new-scroll-arrows";
const m = document.createElement("div");
m.className = "clearfix horizontal-scroll-window";
const p = document.createElement("div");
p.className = "horizontally-scrollable";
p.style.left = "-948px";
const f = document.createElement("ul");
f.className = "hlist games game-cards game-tile-list games-page-carousel";
const h = 158;
const b = 6;
const v = b;
function y(e, t, a, r) {
const i = document.createElement("li");
i.className = "list-item game-card game-tile";
const o = document.createElement("div");
o.className = "game-card-container";
o.setAttribute("data-testid", "game-tile");
const l = document.createElement("a");
l.className = "game-card-link";
l.href = `https://www.roblox.com/games/${e.placeId}/`;
l.tabIndex = r < 5 ? 0 : -1;
l.setAttribute("aria-hidden", r < 5 ? "false" : "true");
if (e.universeId) l.id = String(e.universeId);
const c = document.createElement("div");
c.className = "game-card-thumb-container";
c.style.position = "relative";
const d = document.createElement("span");
d.className = "thumbnail-2d-container game-card-thumb";
const u = document.createElement("img");
const m = e.universeId ? n[e.universeId] : null;
if (m) {
u.src = m;
}
u.alt = a;
u.title = a;
d.appendChild(u);
c.appendChild(d);
const p = document.createElement("span");
p.className = "purpura-genre-pill";
p.textContent = e.genre;
c.appendChild(p);
l.appendChild(c);
const f = document.createElement("div");
f.className = "game-card-name game-name-title";
f.title = a;
f.textContent = a;
l.appendChild(f);
const h = document.createElement("div");
h.className = "game-card-info";
h.setAttribute("data-testid", "game-tile-stats");
const g = document.createElement("span");
g.className = "info-label icon-votes-gray";
h.appendChild(g);
const b = document.createElement("span");
b.className = "info-label vote-percentage-label";
b.textContent = t ? t.votePercent + "%" : "--";
h.appendChild(b);
const v = document.createElement("span");
v.className = "info-label icon-playing-counts-gray";
h.appendChild(v);
const y = document.createElement("span");
y.className = "info-label playing-counts-label";
y.textContent = t ? s(t.playing) : "--";
h.appendChild(y);
l.appendChild(h);
o.appendChild(l);
i.appendChild(o);
return i;
}
const I = Math.max(0, e.length - v);
for (let t = I; t < e.length; t++) {
const n = e[t];
const r = n.universeId ? a[n.universeId] : null;
const i = r && r.name ? r.name : n.name;
const o = y(n, r, i, t);
o.setAttribute("aria-hidden", "true");
f.appendChild(o);
}
const w = e.length - I;
for (let t = 0; t < e.length; t++) {
const n = e[t];
const r = n.universeId ? a[n.universeId] : null;
const i = r && r.name ? r.name : n.name;
const o = y(n, r, i, t);
f.appendChild(o);
}
for (let t = 0; t < v && t < e.length; t++) {
const e = f.children[w + t].cloneNode(true);
e.setAttribute("aria-hidden", "true");
f.appendChild(e);
}
p.appendChild(f);
m.appendChild(p);
u.appendChild(m);
const x = document.createElement("div");
x.setAttribute("data-testid", "game-carousel-scroll-bar");
x.className = "scroller-new prev";
x.setAttribute("aria-disabled", "true");
x.setAttribute("role", "button");
x.setAttribute("tabindex", "0");
const C = document.createElement("span");
C.className = "icon-chevron-heavy-left";
x.appendChild(C);
const E = document.createElement("div");
E.setAttribute("data-testid", "game-carousel-scroll-bar");
E.className = "scroller-new next";
E.setAttribute("aria-disabled", "false");
E.setAttribute("role", "button");
E.setAttribute("tabindex", "0");
const A = document.createElement("span");
A.className = "icon-chevron-heavy-right";
E.appendChild(A);
u.appendChild(x);
u.appendChild(E);
r.appendChild(u);
const N = v * h;
const S = e.length * h;
const P = (e.length + v) * h;
let M = N;
p.style.left = `-${M}px`;
function T() {
const t = e.length > b;
x.setAttribute("aria-disabled", t ? "false" : "true");
E.setAttribute("aria-disabled", t ? "false" : "true");
}
let B = null;
let k = 0;
let R = 0;
let j = 0;
function F(e) {
if (B) {
cancelAnimationFrame(B);
B = null;
p.style.left = `-${M}px`;
}
const t = h * 3;
const n = e === "next" ? M + t : M - t;
k = M;
R = n;
j = performance.now();
function a(e) {
const t = e - j;
const n = Math.min(t / 350, 1);
const r = 1 - Math.pow(1 - n, 3);
let i = k + (R - k) * r;
if (i >= P) {
i -= S;
k -= S;
R -= S;
} else if (i < 0) {
i += S;
k += S;
R += S;
}
p.style.transition = "none";
p.style.left = `-${i}px`;
M = i;
if (n < 1) {
B = requestAnimationFrame(a);
} else {
B = null;
T();
}
}
B = requestAnimationFrame(a);
}
x.addEventListener("click", () => F("prev"));
E.addEventListener("click", () => F("next"));
T();
return r;
}
async function v(e) {
const t = e.map(e => e.placeId);
const n = await p(t);
for (const t of e) {
t.universeId = n[t.placeId] || null;
}
const a = Object.values(n).filter(Boolean);
const [r, i] = await Promise.all([ h(a), f(a) ]);
return {
thumbnailMap: r,
statsMap: i
};
}
async function y() {
if (a || u()) {
a = true;
return;
}
if (!d()) return;
const e = await c();
if (!e) return;
const t = m();
if (!t) return;
a = true;
const r = l(n);
const {thumbnailMap: i, statsMap: o} = await v(r);
if (!d()) {
a = false;
return;
}
if (u()) return;
const s = m();
if (!s) {
a = false;
return;
}
const p = b(r, i, o);
s.anchor.insertAdjacentElement(s.position, p);
}
let I = null;
function w() {
if (i) return;
i = new MutationObserver(() => {
if (!d() || a || u()) return;
if (o) return;
o = setTimeout(() => {
o = null;
if (!d() || a || u()) return;
if (m()) {
y();
}
}, 150);
});
i.observe(document.body || document.documentElement, {
childList: true,
subtree: true
});
function e(t) {
I = setTimeout(() => {
I = null;
if (!a && !u() && d() && m()) {
y();
} else if (t < 1e3 && !a && !u() && d()) {
e(t + 400);
}
}, t);
}
e(300);
}
function x() {
if (i) {
i.disconnect();
i = null;
}
if (o) {
clearTimeout(o);
o = null;
}
if (I) {
clearTimeout(I);
I = null;
}
}
function C() {
const e = document.getElementById(t);
if (e) e.remove();
a = false;
}
function E() {
if (r) return;
r = true;
let e = window.location.href;
const t = () => {
const t = window.location.href;
if (t === e) return;
e = t;
if (d()) {
C();
x();
w();
y();
} else {
C();
x();
}
};
const n = history.pushState.bind(history);
history.pushState = function(...e) {
n(...e);
setTimeout(t, 100);
};
const a = history.replaceState.bind(history);
history.replaceState = function(...e) {
a(...e);
setTimeout(t, 100);
};
window.addEventListener("popstate", () => setTimeout(t, 100));
}
chrome.storage.onChanged.addListener((t, n) => {
if (n !== "sync") return;
if (!(e in t)) return;
const a = window.__PurpuraSettings.get(e);
if (a === false) {
C();
x();
} else if (d()) {
C();
w();
y();
}
});
async function A() {
E();
if (d()) {
w();
y();
}
}
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", A);
} else {
A();
}
})();
