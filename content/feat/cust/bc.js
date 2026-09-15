/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
"use strict";
const e = "bc";
const t = "bcAutoRefresh";
const n = "purpura-game-launch-success";
const r = 4e3;
const a = [ 2500, 7e3, 15e3 ];
const i = [ 0, 400, 1200, 3e3 ];
const o = 2;
const s = [ ".game-sort-carousel-wrapper", '[data-testid="game-carousel"]', ".game-carousel", ".home-page-carousel" ].join(",");
const c = "a.game-card-link[href]";
let l = false;
let u = false;
let d = false;
let f = null;
let h = 0;
let m = 0;
let p = 0;
let g = [];
let w = null;
function y(e) {
return window.__PurpuraSettings && typeof window.__PurpuraSettings.get === "function" ? window.__PurpuraSettings.get(e) : undefined;
}
function E() {
const e = window.location.pathname.toLowerCase();
return e === "/home" || e.startsWith("/home/") || /^\/[a-z]{2}(?:-[a-z]{2})?\/home(?:\/|$)/i.test(e) || e === "/";
}
function v(e) {
const t = String(e ?? "").trim();
return /^\d+$/.test(t) && t !== "0" ? t : "";
}
function S(e) {
return new Set([ e?.universeId, e?.universe_id, e?.id, e?.rootPlaceId, e?.root_place_id, e?.placeId, e?.place_id, e?.rootPlace?.id ].map(v).filter(Boolean));
}
function I(e) {
return v(e?.universeId ?? e?.universe_id ?? e?.id);
}
function b(e) {
return v(e?.rootPlaceId ?? e?.root_place_id ?? e?.placeId ?? e?.place_id ?? e?.rootPlace?.id);
}
function _(e) {
return (Array.isArray(e) ? e : []).map(e => I(e) || b(e)).filter(Boolean).join(",");
}
function A(e) {
const t = new Set;
if (!(e instanceof Element)) return t;
const n = e => {
const n = v(e);
if (n) t.add(n);
};
const r = [ e, ...e.querySelectorAll("[data-universe-id], [data-universeid], [data-game-id], [data-gameid], " + "[data-place-id], [data-root-place-id], [data-rootplaceid]") ];
r.forEach(e => {
n(e.id);
n(e.dataset?.universeId);
n(e.dataset?.universeid);
n(e.dataset?.gameId);
n(e.dataset?.gameid);
n(e.dataset?.placeId);
n(e.dataset?.rootPlaceId);
n(e.dataset?.rootplaceid);
n(e.dataset?.purpuraContinueUniverseId);
});
const a = e.matches("a[href]") ? [ e ] : [ ...e.querySelectorAll("a[href]") ];
a.forEach(e => {
try {
const t = new URL(e.href, window.location.origin);
[ "universeId", "universe-id", "gameId", "placeId", "rootPlaceId" ].forEach(e => n(t.searchParams.get(e)));
const r = t.pathname.match(/\/games\/(\d+)/i);
if (r) n(r[1]);
} catch (e) {}
});
return t;
}
function C(e) {
if (!(e instanceof Element)) return {
cards: [],
parent: null
};
const t = [ ...e.querySelectorAll(c) ];
const n = new Map;
t.forEach(t => {
let r = t;
let a = r.parentElement;
while (a && e.contains(a)) {
if (!n.has(a)) n.set(a, new Set);
n.get(a).add(r);
if (a === e) break;
r = a;
a = a.parentElement;
}
});
let r = null;
let a = [];
n.forEach((e, t) => {
if (e.size > a.length) {
r = t;
a = [ ...e ];
}
});
return {
cards: a,
parent: r
};
}
function L(e) {
return String(e || "").replace(/\s+/g, " ").trim().toLowerCase();
}
function P(e, t) {
const {cards: n} = C(e);
if (!n.length) return 0;
const r = e.querySelector('a[data-testid="section-header-title-subtitle-container"], h1, h2, h3, ' + ".container-header, .game-sort-header-container");
const a = L(r?.textContent);
let i = 0;
if (a === "continue" || a === "continue playing") i += 1e3; else if (a.startsWith("continue ")) i += 500;
n.forEach(e => {
if ([ ...A(e) ].some(e => t.has(e))) i += 10;
});
return i;
}
function q(e, t) {
if (w?.isConnected) return w;
const n = new Set;
[ ...e, ...t ].forEach(e => {
S(e).forEach(e => n.add(e));
});
let r = null;
let a = 0;
document.querySelectorAll(s).forEach(e => {
const t = P(e, n);
if (t > a) {
r = e;
a = t;
}
});
if (r && a > 0) {
w = r;
w.dataset.purpuraContinueCarousel = "true";
}
return w;
}
function x(e, t) {
if (!(t instanceof Element)) return null;
const n = I(e);
const r = b(e) || n;
if (!n && !r) return null;
const a = t.cloneNode(true);
a.classList.add("purpura-live-continue-card");
a.dataset.purpuraContinueUniverseId = n || r;
a.querySelectorAll("[id]").forEach(e => e.removeAttribute("id"));
const i = a.matches("a[href]") ? a : a.querySelector('a.game-card-link, a[href*="/games/"]');
if (i) {
i.href = `https://www.roblox.com/games/${r}/`;
i.dataset.purpuraContinueUniverseId = n || r;
}
if (e?.name) {
const t = a.querySelector('.game-card-name, .game-name-title, [data-testid*="game-name" i]');
if (t) t.textContent = e.name;
if (i) i.setAttribute("aria-label", e.name);
}
const o = e?.thumbnailUrl || e?.thumbnail?.url || e?.imageUrl;
if (o) {
const t = a.querySelector("img");
if (t) {
t.src = o;
t.alt = e.name || "";
}
}
return a;
}
function U(e, t) {
let n = e;
while (n && t.contains(n)) {
if (n.scrollWidth > n.clientWidth + 1) {
n.scrollLeft = 0;
return;
}
n = n.parentElement;
}
}
function M(e, t) {
if (!l || !u || !E() || !e.length) return false;
const n = q(t, e);
if (!n) return false;
let {cards: r, parent: a} = C(n);
if (!r.length || !a) return false;
const i = new Set;
r.forEach(e => {
if (!e.classList.contains("purpura-live-continue-card")) {
A(e).forEach(e => i.add(e));
}
});
r.filter(e => e.classList.contains("purpura-live-continue-card")).filter(e => [ ...A(e) ].some(e => i.has(e))).forEach(e => e.remove());
({cards: r, parent: a} = C(n));
const s = new Set;
t.forEach(e => S(e).forEach(e => s.add(e)));
if (s.size && !r.some(e => [ ...A(e) ].some(e => s.has(e)))) {
w = null;
return false;
}
const c = Math.min(e.length, Math.max(r.length, 1));
const d = e.slice(0, c);
const f = new Map;
r.forEach(e => {
A(e).forEach(t => {
if (!f.has(t)) f.set(t, e);
});
});
const h = new Set;
const m = [];
let p = 0;
d.forEach(e => {
const t = [ ...S(e) ].map(e => f.get(e)).find(e => e && !h.has(e));
let n = t;
if (!n && p < o) {
n = x(e, r[0]);
if (n) {
a.appendChild(n);
r.push(n);
p += 1;
}
}
if (n) {
h.add(n);
m.push(n);
}
});
if (!m.length) return false;
const g = getComputedStyle(a).display;
if ([ "flex", "inline-flex", "grid", "inline-grid" ].includes(g)) {
m.forEach((e, t) => {
e.style.order = String(t);
});
r.filter(e => !h.has(e)).forEach((e, t) => {
e.style.order = String(d.length + t);
});
} else {
const e = document.createDocumentFragment();
m.forEach(t => e.appendChild(t));
a.insertBefore(e, a.firstChild);
}
U(a, n);
return true;
}
function j(e, t) {
const n = ++p;
let r = false;
i.forEach(a => {
setTimeout(() => {
if (!r && n === p) {
r = M(e, t);
}
}, a);
});
}
async function k() {
const e = await fetch("https://apis.roblox.com/search-landing-page-api/v1?sessionId=Purpura", {
credentials: "include",
cache: "no-store",
headers: {
Accept: "application/json"
}
});
if (!e.ok) return null;
const t = await e.json();
const n = Array.isArray(t.sorts) ? t.sorts.find(e => e.sortId === "RecentlyVisited") : null;
return Array.isArray(n?.games) ? n.games : null;
}
async function z(e = false) {
if (!l || !u || !E()) {
return {
changed: false,
refreshed: false
};
}
if (f) return f;
const t = Date.now();
if (!e && t - h < r) {
return {
changed: false,
refreshed: false
};
}
h = t;
f = (async () => {
try {
const e = await k();
if (!e) return {
changed: false,
refreshed: false
};
const t = g;
const n = _(t) !== _(e);
g = e;
j(e, t);
return {
changed: n,
refreshed: true
};
} catch (e) {
return {
changed: false,
refreshed: false
};
} finally {
f = null;
}
})();
return f;
}
function W() {
if (!l || !u || !E()) return;
const e = ++m;
const t = _(g);
const n = r => {
if (e !== m || !l || !u || !E()) return;
if (_(g) !== t) return;
setTimeout(async () => {
if (e !== m || !E()) return;
const t = await z(true);
if (!t.changed && r + 1 < a.length) {
n(r + 1);
}
}, a[r]);
};
n(0);
}
function B() {
if (l && u && E() && !document.hidden) {
z();
}
}
function R() {
if (d) return;
d = true;
document.addEventListener(n, W);
document.addEventListener("visibilitychange", B);
window.addEventListener("focus", B);
}
window.__PurpuraSettings.ready.then(function() {
l = y(e) === true;
u = y(t) !== false;
R();
if (l) V();
});
chrome.storage.onChanged.addListener((n, r) => {
if (r !== "local") return;
let a = false;
if (n[e]) {
a = true;
l = n[e].newValue === true;
if (l) V(); else {
m += 1;
p += 1;
}
}
if (n[t]) {
a = true;
u = n[t].newValue !== false;
if (!u) {
m += 1;
p += 1;
}
}
if (a) B();
});
async function V() {
R();
try {
const e = await k();
if (!e || !l) return;
g = e;
const t = new MutationObserver(() => {
const n = q([], e);
if (n && M(e, [])) t.disconnect();
});
t.observe(document.body || document.documentElement, {
childList: true,
subtree: true
});
j(e, []);
} catch (e) {}
}
})();
