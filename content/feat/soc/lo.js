/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
function e(e, t) {
return chrome.i18n.getMessage(e, t) || e;
}
if (window.purpuraLastOnlineInitialized) return;
window.purpuraLastOnlineInitialized = true;
(function() {
var e = document.createElement("style");
e.textContent = ":root{--purpura-lo-online-bg:rgb(57,203,121);--purpura-lo-online-text:white;--purpura-lo-offline-bg:rgba(239,83,80,0.15);--purpura-lo-offline-text:rgb(239,83,80);--purpura-lo-unknown-bg:rgba(0,0,0,0.35);--purpura-lo-unknown-text:white}";
document.head.appendChild(e);
})();
const t = "purpura-last-online-cache-v1";
const n = "lo";
const r = /\/users\/(\d+)\/profile(?:\/|$|\?)/;
const o = /\/banned-users\/(\d+)\/profile(?:\/|$|\?)/;
let i = true;
let s = {};
let l = null;
let u = location.href;
let a = null;
let c = null;
function f() {
try {
return JSON.parse(localStorage.getItem(t) || "{}") || {};
} catch {
return {};
}
}
function p() {
try {
localStorage.setItem(t, JSON.stringify(s));
} catch {}
}
function d(e) {
const t = Math.max(0, Date.now() - e);
const n = Math.floor(t / 1e3);
const r = Math.floor(n / 60);
const o = Math.floor(r / 60);
const i = Math.floor(o / 24);
if (i > 0) return `${i}d ago`;
if (o > 0) return `${o}h ago`;
if (r > 0) return `${r}m ago`;
if (n > 0) return `${n}s ago`;
return "just now";
}
function h() {
const e = window.location.pathname.match(r);
return e ? e[1] : null;
}
function y() {
if (o.test(window.location.pathname)) return true;
if (document.body?.dataset?.purpuraGhostProfile === "1") return true;
if (document.querySelector('[data-purpura-ghost-profile="1"]')) return true;
return false;
}
function m(e, t) {
const n = document.createElement("span");
n.id = "purpura-last-online-pill";
n.style.fontSize = "11px";
n.style.marginTop = "6px";
n.style.marginLeft = "0";
n.style.display = "inline-flex";
n.style.alignItems = "center";
n.style.gap = "6px";
n.style.padding = "4px 12px";
n.style.borderRadius = "999px";
n.style.fontWeight = "600";
n.style.letterSpacing = "0.02em";
n.style.width = "fit-content";
n.style.maxWidth = "100%";
if (t?.background) n.style.background = t.background;
if (t?.color) n.style.color = t.color;
if (typeof e === "string") {
n.textContent = e;
} else if (e instanceof Node) {
n.appendChild(e);
}
return n;
}
function g(e) {
const t = document.createElement("span");
t.textContent = d(e.getTime());
t.title = e.toLocaleString();
return t;
}
function b(e, t) {
if (e.querySelector("#purpura-last-online-pill")) return;
const n = document.getElementById("purpura-last-online-pill");
if (n) n.remove();
e.appendChild(t);
}
async function w() {
const e = h();
if (!e) return;
const t = "https://presence.roblox.com/v1/presence/users";
let n = 0;
try {
const r = await fetch(t, {
method: "POST",
headers: {
"Content-Type": "application/json"
},
credentials: "include",
body: JSON.stringify({
userIds: [ Number(e) ]
})
});
if (r.ok) {
const e = await r.json();
n = e?.userPresences?.[0]?.userPresenceType ?? 0;
v(e?.userPresences?.[0]);
}
} catch {}
const r = s[e];
if (c) c.disconnect();
c = new MutationObserver(() => {
const e = document.querySelector(".profile-header-overlay .flex-nowrap.gap-small.flex");
if (!e) return;
if (e.querySelector("#purpura-last-online-pill")) {
c.disconnect();
return;
}
let t;
if (n > 0) {
t = m("Online", {
background: "var(--purpura-lo-online-bg)",
color: "var(--purpura-lo-online-text)"
});
} else if (r && r.lastOnline != null) {
const e = document.createElement("span");
e.style.display = "inline";
const n = g(new Date(r.lastOnline));
e.appendChild(document.createTextNode("Last seen "));
e.appendChild(n);
t = m(e, {
background: "var(--purpura-lo-offline-bg)",
color: "var(--purpura-lo-offline-text)"
});
} else {
t = m("Offline", {
background: "var(--purpura-lo-unknown-bg)",
color: "var(--purpura-lo-unknown-text)"
});
}
b(e, t);
});
c.observe(document.body, {
childList: true,
subtree: true
});
}
function v(e) {
if (!a) return;
const t = s[a] || {
prevPresenceType: null,
lastOnline: null,
lastSeenOnline: null,
lastChecked: null
};
const n = e?.userPresenceType === 0;
const r = typeof e?.userPresenceType === "number" && e.userPresenceType > 0;
if (r) {
t.lastSeenOnline = Date.now();
}
if (t.prevPresenceType !== null && t.prevPresenceType !== 0 && n && t.lastSeenOnline) {
t.lastOnline = t.lastSeenOnline;
}
if (typeof e?.userPresenceType === "number") {
t.prevPresenceType = e.userPresenceType;
}
t.lastChecked = Date.now();
s[a] = t;
p();
}
async function x() {
if (!i || !a) return;
const e = {
userIds: [ Number(a) ]
};
try {
const t = await fetch("https://presence.roblox.com/v1/presence/users", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
credentials: "include",
body: JSON.stringify(e)
});
if (!t.ok) return;
const n = await t.json();
const r = n?.userPresences?.[0];
v(r);
} catch {}
}
function S() {
if (y()) return false;
return !!h();
}
function O() {
return /\/friends(\/|$|\?|#)/.test(location.pathname);
}
async function T() {
if (a) return a;
const e = document.querySelector('meta[name="user-data"]');
const t = e?.getAttribute("data-userid") || e?.getAttribute("data-user-id");
if (t) {
a = t;
return a;
}
try {
const e = await fetch("https://users.roblox.com/v1/users/authenticated", {
method: "GET",
credentials: "include"
});
if (!e.ok) return null;
const t = await e.json();
if (t?.id) {
a = String(t.id);
return a;
}
} catch {}
return null;
}
async function P() {
if (!i) return;
const e = await T();
if (!e) return;
try {
const t = await fetch(`https://friends.roblox.com/v1/users/${e}/friends?userSort=Default&sortOrder=Asc&limit=100`, {
headers: {
"Content-Type": "application/json"
},
credentials: "include"
});
if (!t.ok) return;
const n = await t.json();
const r = (n?.data ?? []).map(e => e.id).filter(Boolean);
if (!r.length) return;
const o = [];
for (let e = 0; e < r.length; e += 100) o.push(r.slice(e, e + 100));
for (const e of o) {
const t = await fetch("https://presence.roblox.com/v1/presence/users", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
credentials: "include",
body: JSON.stringify({
userIds: e
})
});
if (!t.ok) continue;
const n = await t.json();
const r = n?.userPresences ?? [];
for (const e of r) {
v(e);
}
}
} catch {}
}
function k() {
if (l) return;
l = setInterval(() => {
if (!i) return;
if (S()) x();
if (O()) P();
}, 25e3);
}
function C() {
if (!l) return;
clearInterval(l);
l = null;
}
function I() {
if (!i) {
C();
return;
}
if (y()) {
C();
return;
}
s = f();
if (S()) w();
if (O()) P();
k();
}
function j(e, t) {
if (t !== "sync") return;
if (!e[n]) return;
i = e[n].newValue !== false;
I();
}
function N() {
a = y() ? null : h();
I();
}
window.__PurpuraSettings.ready.then(function() {
i = window.__PurpuraSettings.get(n) !== false;
s = f();
N();
});
chrome.storage.onChanged.addListener(j);
new MutationObserver(() => {
if (location.href !== u) {
u = location.href;
const e = document.getElementById("purpura-last-online-pill");
if (e) e.remove();
if (c) {
c.disconnect();
c = null;
}
N();
}
}).observe(document, {
childList: true,
subtree: true
});
})();
