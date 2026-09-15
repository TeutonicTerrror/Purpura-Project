/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
if (window.purpuraMostPlayedTogetherInitialized) return;
window.purpuraMostPlayedTogetherInitialized = true;
(function() {
var e = document.createElement("style");
e.textContent = ":root{--purpura-mpt-label-color:rgba(255,255,255,0.5)}";
document.head.appendChild(e);
})();
var e = "mpt";
var t = true;
var r = {};
var n = {};
var a = false;
var i = false;
var o = null;
function l() {
var e = document.querySelector('meta[name="csrf-token"]');
if (e) return e.getAttribute("content");
if (window.Roblox && window.Roblox.XsrfToken) {
try {
var t = window.Roblox.XsrfToken.getToken();
if (t) return t;
} catch (e) {}
}
var r = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
if (r) return decodeURIComponent(r[1]);
return "";
}
function u(e) {
var t = e && e.href || "";
var r = t.match(/\/users\/(\d+)/);
return r ? r[1] : null;
}
function s(e, t, r) {
var n = document.createElement("div");
n.className = "avatar-card-label text-overflow purpura-mpt-label";
n.dataset.friendId = r;
n.style.cssText = "font-size:11px;color:var(--purpura-mpt-label-color);margin-top:2px;line-height:1.3;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%;";
var a = "Most played: " + e;
n.textContent = a;
n.title = "Your most played game with " + (t || "this friend") + " is " + e + ".";
return n;
}
function c(e) {
var t = u(e);
if (!t) return;
var n = e.closest(".avatar-card-caption");
if (!n) return;
var a = n.querySelector(".purpura-mpt-label");
if (a) {
if (a.dataset.friendId === t) return;
a.remove();
}
var i = r[t];
if (!i) return;
var o = e.textContent.trim();
var l = s(i, o, t);
if (!l) return;
n.appendChild(l);
}
function f() {
if (!t) return;
var e = document.querySelectorAll(".avatar-card-caption a.avatar-name");
if (!e.length) {
e = document.querySelectorAll('[href*="/users/"][href*="/profile"]');
}
for (var r = 0; r < e.length; r++) {
c(e[r]);
}
}
async function d() {
var e = [];
var t = Object.keys(n);
for (var a = 0; a < t.length; a++) {
var i = t[a];
var o = n[i];
if (o && o.mostFrequentUniverseId && !r[i]) {
e.push({
friendId: i,
universeId: o.mostFrequentUniverseId
});
}
}
for (var l = 0; l < e.length; l++) {
var u = e[l];
try {
var s = await new Promise(function(e) {
chrome.runtime.sendMessage({
action: "fetchGameDetails",
universeId: u.universeId
}, function(t) {
e(t || {
name: "",
thumbnail: ""
});
});
});
if (s && s.name) {
r[u.friendId] = s.name;
}
} catch (e) {}
if (l % 10 === 0 && l > 0) {
await new Promise(function(e) {
setTimeout(e, 200);
});
}
}
}
async function m() {
if (i) return;
i = true;
try {
var e = await new Promise(function(e) {
chrome.runtime.sendMessage({
action: "fetchAllFriendInsights",
csrfToken: l()
}, function(t) {
e(t);
});
});
a = true;
if (e && typeof e === "object") {
n = e;
}
} catch (e) {} finally {
i = false;
}
}
var p = null;
function v() {
if (o) o.disconnect();
o = new MutationObserver(function() {
if (!t) return;
if (!p) {
p = setTimeout(function() {
p = null;
f();
}, 200);
}
});
var e = document.querySelector('.avatar-cards, .friends-list, [data-testid="friends-list"]');
if (e) {
o.observe(e, {
childList: true,
subtree: true
});
} else {
o.observe(document.body, {
childList: true,
subtree: true
});
}
}
function h() {
if (o) {
o.disconnect();
o = null;
}
clearTimeout(p);
p = null;
}
function g() {
var e = document.querySelectorAll(".purpura-mpt-label");
for (var t = 0; t < e.length; t++) {
e[t].remove();
}
r = {};
}
function b() {
if (t) {
if (!a && !i) {
m().then(function() {
return d();
}).then(function() {
f();
v();
});
} else if (a) {
f();
v();
}
} else {
h();
g();
}
}
var y = /\/users\/\d+\/profile/.test(location.pathname);
window.__PurpuraSettings.ready.then(function() {
t = window.__PurpuraSettings.get(e) !== false;
if (y) {
k();
} else {
b();
}
});
chrome.storage.onChanged.addListener(function(r, n) {
if (n === "sync" && r[e]) {
t = r[e].newValue !== false;
if (y) {
if (t) {
k();
} else {
M();
P();
}
} else {
b();
}
}
});
function w() {
var e = location.pathname.match(/\/users\/(\d+)\/profile/);
return e ? e[1] : null;
}
function x(e, t, r) {
var n = document.createElement("a");
n.href = "https://www.roblox.com/games/" + r;
n.target = "_blank";
n.style.cssText = "text-decoration:none;color:inherit;";
n.className = "purpura-mpt-profile-pill relative clip flex justify-center items-center radius-circle stroke-none padding-left-medium padding-right-medium height-800 text-label-medium bg-shift-300 content-action-utility group/interactable cursor-pointer focus-visible:outline-focus disabled:outline-none";
n.title = "Most played together: " + e;
var a = document.createElement("div");
a.setAttribute("role", "presentation");
a.className = "absolute inset-[0] transition-colors group-hover/interactable:bg-[var(--color-state-hover)] group-active/interactable:bg-[var(--color-state-press)] group-disabled/interactable:bg-none";
n.appendChild(a);
if (t) {
var i = document.createElement("img");
i.src = t;
Object.assign(i.style, {
width: "20px",
height: "20px",
borderRadius: "50%",
marginRight: "6px",
objectFit: "cover",
position: "relative",
zIndex: "1"
});
n.appendChild(i);
}
var o = document.createElement("span");
o.className = "padding-y-xsmall text-no-wrap text-truncate-end";
o.textContent = e;
if (t) Object.assign(o.style, {
position: "relative",
zIndex: "1"
});
n.appendChild(o);
return n;
}
var I = false;
var T = false;
function q(e) {
if (I || T) return;
if (e.querySelector(".purpura-mpt-profile-pill")) {
I = true;
return;
}
var t = w();
if (!t) return;
T = true;
var r = false;
var n = setTimeout(function() {
r = true;
T = false;
}, 1e4);
chrome.runtime.sendMessage({
action: "fetchProfileInsights",
userId: t,
csrfToken: l()
}, function(t) {
if (r) return;
clearTimeout(n);
if (!t || !t.mostFrequentUniverseId) {
T = false;
return;
}
chrome.runtime.sendMessage({
action: "fetchGameDetails",
universeId: t.mostFrequentUniverseId
}, function(r) {
clearTimeout(n);
T = false;
if (!r || !r.name) return;
I = true;
var a = x(r.name, r.thumbnail, r.rootPlaceId || t.mostFrequentUniverseId);
var i = e.querySelector("#purpura-last-online-pill");
if (i) {
e.insertBefore(a, i);
} else {
e.append(a);
}
});
});
}
var S = null;
var C = null;
function k() {
if (!t) {
M();
P();
return;
}
S = new MutationObserver(function() {
if (!t) return;
if (!C) {
C = setTimeout(function() {
C = null;
var e = document.querySelector(".profile-header-overlay .flex-nowrap.gap-small.flex");
if (e) {
q(e);
}
}, 200);
}
});
S.observe(document.body, {
childList: true,
subtree: true
});
var e = document.querySelector(".profile-header-overlay .flex-nowrap.gap-small.flex");
if (e) {
q(e);
}
}
function M() {
if (S) {
S.disconnect();
S = null;
}
clearTimeout(C);
C = null;
}
function P() {
var e = document.querySelector(".purpura-mpt-profile-pill");
if (e) e.remove();
I = false;
T = false;
}
})();
