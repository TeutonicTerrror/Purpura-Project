/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
if (window.__purpuraEnhancedSearchLoaded) return;
window.__purpuraEnhancedSearchLoaded = true;
var e = "es";
var t = "navbar-search-input";
var r = "purpura-enhanced-search-result";
var n = "ul.new-dropdown-menu";
var a = [ "#navbar-search-input", "#navbar-universal-search input", '[data-testid="navigation-search-input-field"]', '[data-testid="search-input"]', ".navbar-search input" ];
var i = null;
var s = null;
var l = "";
var u = 0;
var o = null;
var c = null;
var d = false;
var p = true;
var f = 0;
var m = new Map;
function h(e, t) {
var r = 0;
return function() {
var n = arguments;
var a = this;
clearTimeout(r);
r = setTimeout(function() {
e.apply(a, n);
}, t);
};
}
function v(e) {
return String(e == null ? "" : e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function y(e) {
e = Number(e) || 0;
if (e >= 1e9) return (e / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
if (e >= 1e6) return (e / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
if (e >= 1e3) return (e / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
return String(e);
}
function g() {
var e = document.activeElement;
if (!e) return false;
var t = e.tagName;
return t === "INPUT" || t === "TEXTAREA" || t === "SELECT" || e.isContentEditable === true;
}
function b() {
for (var e = 0; e < a.length; e++) {
var t = document.querySelector(a[e]);
if (t) return t;
}
return null;
}
function w() {
var e = b();
if (e) {
e.focus();
return true;
}
return false;
}
function x() {
try {
var t = window.__PurpuraSettings.get(e);
if (t === true) return {
enabled: true,
userSearch: true,
gameSearch: true,
friendSearch: true,
focusKey: true
};
if (t === false) return {
enabled: false,
userSearch: false,
gameSearch: false,
friendSearch: false,
focusKey: false
};
if (t && typeof t === "object") {
if (t.enabled === true && t.focusKey === undefined) t.focusKey = true;
if (t.enabled === true && t.userSearch === undefined) t.userSearch = true;
if (t.enabled === true && t.gameSearch === undefined) t.gameSearch = true;
if (t.enabled === true && t.friendSearch === undefined) t.friendSearch = true;
return t;
}
} catch (e) {}
return {
enabled: false,
userSearch: true,
gameSearch: true,
friendSearch: true,
focusKey: true
};
}
function R() {
try {
var t = window.__PurpuraSettings.get(e);
if (t === true) return true;
if (t && typeof t === "object") return t.enabled === true;
return t === true;
} catch (e) {
return false;
}
}
function L() {
var e = x();
return e.enabled === true && e.userSearch !== false;
}
function S() {
var e = x();
return e.enabled === true && e.gameSearch !== false;
}
function C() {
var e = x();
return e.enabled === true && e.friendSearch !== false;
}
function E() {
var e = x();
return e.enabled === true && e.focusKey !== false;
}
function I() {
try {
var e = window.__PurpuraSettings.get("qp");
return e === true || e === undefined;
} catch (e) {
return true;
}
}
function _() {
if (document.getElementById("purpura-es-styles")) return;
var e = document.createElement("style");
e.id = "purpura-es-styles";
e.textContent = ".purpura-es-qp-buttons{display:flex;gap:6px;align-items:center;flex-shrink:0;padding-right:12px}.purpura-qp-btn{flex-shrink:0;width:36px;height:36px;border:none;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fff;transition:all 0.2s ease}.purpura-qp-btn svg{width:16px;height:16px}.purpura-qp-play{background:linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%)}.purpura-qp-play:hover{background:linear-gradient(135deg,#9d74f7 0%,#8b5cf6 100%);transform:translateY(-1px);box-shadow:0 4px 14px rgba(139,92,246,0.35)}.purpura-qp-servers{background:linear-gradient(135deg,#6d28d9 0%,#5b21b6 100%)}.purpura-qp-servers:hover{background:linear-gradient(135deg,#7c3aed 0%,#6d28d9 100%);transform:translateY(-1px);box-shadow:0 4px 14px rgba(109,40,217,0.35)}.purpura-es-ps-dropdown{position:fixed;background:rgba(22,23,28,0.98);border:1px solid rgba(139,92,246,0.15);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.5);z-index:10000;opacity:0;transition:opacity 0.2s ease,transform 0.2s ease;pointer-events:none;backdrop-filter:blur(16px);width:320px;transform:translateY(-5px)}.purpura-es-ps-dropdown.visible{opacity:1;transform:translateY(0);pointer-events:all}.purpura-es-ps-list{max-height:300px;min-height:60px;overflow-y:auto;padding:8px;scrollbar-width:none}.purpura-es-ps-list::-webkit-scrollbar{display:none}.purpura-es-ps-item{display:flex;align-items:center;gap:10px;padding:9px 10px;margin-bottom:3px;background:rgba(139,92,246,0.04);border:1px solid rgba(139,92,246,0.06);border-radius:8px}.purpura-es-ps-item:hover{background:rgba(139,92,246,0.08);border-color:rgba(139,92,246,0.12)}.purpura-es-ps-info{flex:1;display:flex;flex-direction:column;gap:4px;min-width:0}.purpura-es-ps-name{color:#fff;font-weight:500;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.purpura-es-ps-players{color:#888;font-size:12px}.purpura-es-ps-join{width:32px;height:32px;border:none;background:linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%);border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}.purpura-es-ps-join:hover{background:linear-gradient(135deg,#9d74f7 0%,#8b5cf6 100%);transform:scale(1.05)}.purpura-es-ps-join svg{width:14px;height:14px}";
document.head.appendChild(e);
}
var N = new Map;
var P = null;
var k = null;
var q = null;
function T() {
if (document.getElementById("purpura-es-ps-dropdown")) {
P = document.getElementById("purpura-es-ps-dropdown");
return;
}
var e = document.createElement("div");
e.id = "purpura-es-ps-dropdown";
e.className = "purpura-es-ps-dropdown";
var t = document.createElement("div");
t.className = "purpura-es-ps-list";
e.appendChild(t);
document.body.appendChild(e);
P = e;
e.addEventListener("mouseenter", function() {
clearTimeout(q);
});
e.addEventListener("mouseleave", function() {
q = setTimeout(j, 200);
});
}
function j() {
if (!P || !P.classList.contains("visible")) return;
if (P.matches(":hover")) return;
P.classList.remove("visible");
k = null;
}
function G(e, t, r, n) {
if (!P) return;
var a = P.querySelector(".purpura-es-ps-list");
if (!a) return;
if (!n) a.innerHTML = "";
var i = t.filter(function(e) {
return e.accessCode;
});
if (!i.length && !n) {
var s = document.createElement("div");
s.textContent = "No active private servers found";
s.style.cssText = "display:flex;align-items:center;justify-content:center;min-height:60px;text-align:center;padding:10px;color:#888;font-size:13px";
a.appendChild(s);
return;
}
var l = document.createDocumentFragment();
i.forEach(function(t) {
var r = document.createElement("div");
r.className = "purpura-es-ps-item";
var n = document.createElement("div");
n.className = "purpura-es-ps-info";
var a = document.createElement("span");
a.className = "purpura-es-ps-name";
a.textContent = t.name;
a.title = t.name;
var i = document.createElement("span");
i.className = "purpura-es-ps-players";
i.textContent = (t.players ? t.players.length : 0) + " / " + t.maxPlayers;
n.appendChild(a);
n.appendChild(i);
var s = document.createElement("button");
s.className = "purpura-es-ps-join";
s.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg>';
s.title = "Join Server";
s.onclick = function(r) {
r.preventDefault();
r.stopPropagation();
var n = "if(typeof Roblox!=='undefined'&&Roblox.GameLauncher&&typeof Roblox.GameLauncher.joinPrivateGame==='function'){Roblox.GameLauncher.joinPrivateGame(parseInt('" + e + "',10),'" + String(t.accessCode).replace(/'/g, "\\'") + "','" + String(t.vipServerId).replace(/'/g, "\\'") + "');}";
try {
chrome.runtime.sendMessage({
action: "injectScript",
codeToInject: n
});
} catch (e) {}
j();
};
r.appendChild(n);
r.appendChild(s);
l.appendChild(r);
});
a.appendChild(l);
}
function D(e) {
if (!P) return;
var t = P.querySelector(".purpura-es-ps-list");
if (t) t.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:60px;padding:10px;color:#888;font-size:13px">Loading...</div>';
if (N.has(e)) {
var r = N.get(e);
G(e, r.servers, r.nextCursor, false);
return;
}
fetch("https://games.roblox.com/v1/games/" + encodeURIComponent(e) + "/private-servers?limit=50&sortOrder=Desc", {
credentials: "include"
}).then(function(e) {
if (!e.ok) throw new Error("" + e.status);
return e.json();
}).then(function(t) {
var r = t && t.data ? t.data : [];
N.set(e, {
servers: r,
nextCursor: t.nextPageCursor || null
});
G(e, r, t.nextPageCursor || null, false);
}).catch(function() {
if (t) t.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:60px;padding:10px;color:#888;font-size:13px">Failed to load servers</div>';
});
}
function U(e, t) {
T();
_();
if (!P) return;
if (k === t && P.classList.contains("visible")) {
j();
return;
}
k = t;
var r = e.getBoundingClientRect();
var n = 320;
P.style.width = n + "px";
var a = r.left + r.width / 2 - n / 2;
a = Math.max(8, Math.min(a, document.documentElement.clientWidth - n - 8));
var i = document.documentElement.clientHeight;
var s = 300;
var l = i - r.bottom - 8;
var u = r.top - 8;
var o = P.querySelector(".purpura-es-ps-list");
if (l >= s || l >= u) {
P.style.top = r.bottom + 8 + "px";
P.style.bottom = "auto";
if (o) o.style.maxHeight = Math.max(80, Math.min(s, i - r.bottom - 16)) + "px";
} else {
P.style.bottom = i - r.top + 8 + "px";
P.style.top = "auto";
if (o) o.style.maxHeight = Math.max(80, Math.min(s, r.top - 16)) + "px";
}
P.style.left = a + "px";
P.classList.add("visible");
D(t);
}
function A() {
return document.querySelector(n);
}
function M(e, t) {
return !!e && !(t && t.aborted) && (o === e || c === e);
}
function B(e) {
return {
query: e,
userResult: null,
gameResult: null,
friendResults: [],
userDone: false,
gameDone: e.length < 2,
committed: false
};
}
function F(e, t, r) {
if (!e) return;
if (e.committed) {
if (t === "userResult") window._purpuraLastUserResult = r;
if (t === "gameResult") window._purpuraLastGameResult = r;
if (t === "friendResults") window._purpuraLastFriendResults = r;
return;
}
e[t] = r;
}
function O(e, t) {
if (!e) return null;
if (e.committed) {
if (t === "userResult") return window._purpuraLastUserResult || null;
if (t === "gameResult") return window._purpuraLastGameResult || null;
if (t === "friendResults") return window._purpuraLastFriendResults || [];
}
return e[t];
}
function V(e) {
if (!e || o !== e && c !== e) return;
if (e.committed) {
ee();
return;
}
if (!e.userDone || !e.gameDone) return;
c = e;
o = null;
e.committed = true;
window._purpuraLastUserResult = e.userResult;
window._purpuraLastGameResult = e.gameResult;
window._purpuraLastFriendResults = e.friendResults;
u = 0;
ee(true);
}
function H(e, t, r) {
var n = "https://" + e + ".roblox.com" + t;
var a = {
credentials: "include"
};
if (r && r.method) a.method = r.method;
if (r && r.body) {
a.headers = {
"Content-Type": "application/json"
};
a.body = typeof r.body === "string" ? r.body : JSON.stringify(r.body);
}
if (r && r.signal) a.signal = r.signal;
return fetch(n, a);
}
function K(e, t, r) {
var n = r && r.retries != null ? r.retries : 2;
var a = r && r.signal ? r.signal : null;
var i = r && r.method ? r.method : "GET";
var s = r && r.body ? r.body : undefined;
function l(r) {
return H(e, t, {
method: i,
body: s,
signal: a
}).then(function(e) {
if (e.status === 499) {
var t = new Error("aborted");
t.name = "AbortError";
throw t;
}
if (e.status === 429 && r > 0) return new Promise(function(e) {
setTimeout(e, 800);
}).then(function() {
return l(r - 1);
});
if (!e.ok) throw new Error("HTTP " + e.status);
return e.json();
}).catch(function(e) {
if (e.name === "AbortError") throw e;
if (r > 0) return new Promise(function(e) {
setTimeout(e, 600);
}).then(function() {
return l(r - 1);
});
throw e;
});
}
return l(n);
}
function z(e, t, r, n) {
if (!e || !e.length) return Promise.resolve(new Map);
var a = new Map;
var i = [];
for (var s = 0; s < e.length; s++) {
var l = t + ":" + (r || "48x48") + ":" + Number(e[s].id);
if (m.has(l)) a.set(Number(e[s].id), m.get(l)); else i.push(e[s]);
}
if (!i.length) return Promise.resolve(a);
var u = [];
for (var o = 0; o < i.length; o += 50) u.push(i.slice(o, o + 50));
var c = u.map(function(e) {
var i = e.map(function(e) {
return e.id;
}).join(",");
var s = "";
var l = "thumbnails";
if (t === "AvatarHeadshot") s = "/v1/users/avatar-headshot?userIds=" + encodeURIComponent(i) + "&size=" + encodeURIComponent(r || "48x48") + "&format=Png&isCircular=true&returnPolicy=PlaceHolder"; else if (t === "GameIcon") s = "/v1/games/icons?universeIds=" + encodeURIComponent(i) + "&returnPolicy=PlaceHolder&size=" + encodeURIComponent(r || "50x50") + "&format=Png&isCircular=false"; else s = "/v1/users/avatar-headshot?userIds=" + encodeURIComponent(i) + "&size=" + encodeURIComponent(r || "48x48") + "&format=Png&isCircular=true&returnPolicy=PlaceHolder";
return H(l, s, n ? {
signal: n
} : {}).then(function(e) {
if (!e.ok) throw new Error("thumb " + e.status);
return e.json();
}).then(function(n) {
(n.data || []).forEach(function(e) {
var n = Number(e.targetId);
var i = {
targetId: n,
imageUrl: e.imageUrl || "",
state: e.state || "Completed"
};
a.set(n, i);
m.set(t + ":" + (r || "48x48") + ":" + n, i);
if (e.imageUrl) try {
var s = new Image;
s.src = e.imageUrl;
} catch (e) {}
});
e.forEach(function(e) {
var n = Number(e.id);
if (!a.has(n)) {
var i = {
targetId: n,
imageUrl: "",
state: "Blocked"
};
a.set(n, i);
m.set(t + ":" + (r || "48x48") + ":" + n, i);
}
});
}).catch(function() {
e.forEach(function(e) {
var n = Number(e.id);
if (!a.has(n)) {
var i = {
targetId: n,
imageUrl: "",
state: "Blocked"
};
a.set(n, i);
m.set(t + ":" + (r || "48x48") + ":" + n, i);
}
});
});
});
return Promise.all(c).then(function() {
return a;
});
}
function W(e) {
if (!e) return null;
if (e.userPresenceType === 2 && e.lastLocation) return "Playing " + e.lastLocation;
if (e.userPresenceType === 1) return "Online";
if (e.userPresenceType === 3) return "In Studio";
return null;
}
function J(e, t) {
if (!e) return;
var r = t ? "if(typeof Roblox!=='undefined'&&Roblox.GameLauncher&&typeof Roblox.GameLauncher.joinGameInstance==='function'){Roblox.GameLauncher.joinGameInstance(parseInt('" + e + "',10),'" + String(t).replace(/'/g, "\\'") + "');}" : "if(typeof Roblox!=='undefined'&&Roblox.GameLauncher&&typeof Roblox.GameLauncher.joinGameInstance==='function'){Roblox.GameLauncher.joinGameInstance(parseInt('" + e + "',10));}";
try {
chrome.runtime.sendMessage({
action: "injectScript",
codeToInject: r
});
} catch (e) {}
}
function Y(e) {
var t = parseInt(e, 10);
if (!t) return;
var r = "roblox-player:1+launchmode:play+placelauncherurl:" + encodeURIComponent("https://assetgame.roblox.com/game/PlaceLauncher.ashx?request=RequestFollowUser&userId=" + t + "&is30=false");
var n = "if(typeof Roblox!=='undefined'&&Roblox.GameLauncher&&typeof Roblox.GameLauncher.followPlayerIntoGame==='function'){Roblox.GameLauncher.followPlayerIntoGame(" + t + ");}else{window.location.href='" + r.replace(/'/g, "\\'") + "';}";
try {
chrome.runtime.sendMessage({
action: "injectScript",
codeToInject: n
});
} catch (e) {
window.location.href = r;
}
}
function $(e, t, n, a) {
var i = document.createElement("li");
i.className = "navbar-search-option rbx-clickable-li improved-search " + r;
i.dataset.userId = String(e.id);
var s = document.createElement("div");
s.style.display = "flex";
s.style.alignItems = "center";
s.style.padding = "6px 0px";
s.style.gap = "12px";
s.style.maxHeight = "56px";
var l = document.createElement("a");
l.href = "https://www.roblox.com/users/" + e.id + "/profile";
l.style.display = "flex";
l.style.alignItems = "center";
l.style.gap = "12px";
l.style.flex = "1";
l.style.minWidth = "0";
l.style.textDecoration = "none";
l.style.color = "inherit";
var u = document.createElement("span");
u.className = "thumbnail-2d-container";
u.style.position = "relative";
u.style.height = "48px";
u.style.width = "48px";
u.style.borderRadius = "50%";
u.style.flexShrink = "0";
u.style.overflow = "visible";
u.style.display = "inline-flex";
u.style.alignItems = "center";
u.style.justifyContent = "center";
var o = null;
var c = t && t.imageUrl ? t.imageUrl : null;
if (c) {
o = document.createElement("img");
o.src = c;
o.alt = e.displayName || e.name || "";
o.style.width = "100%";
o.style.height = "100%";
o.style.borderRadius = "50%";
o.style.objectFit = "cover";
u.appendChild(o);
} else {
var d = document.createElement("span");
d.className = "thumbnail-2d-container shimmer";
d.style.display = "block";
d.style.width = "100%";
d.style.height = "100%";
d.style.borderRadius = "50%";
u.appendChild(d);
}
if (n && n.userPresenceType) {
var p = "";
var f = "";
if (n.userPresenceType === 1) {
p = "online";
f = "rgb(0,162,255)";
} else if (n.userPresenceType === 2) {
p = "ingame";
f = "rgb(2,183,87)";
} else if (n.userPresenceType === 3) {
p = "ingame";
f = "rgb(246,136,2)";
}
if (p) {
var m = document.createElement("span");
m.className = p + " avatar-status";
m.style.position = "absolute";
m.style.bottom = "0px";
m.style.right = "0px";
m.style.width = "12px";
m.style.height = "12px";
m.style.backgroundColor = f;
m.style.borderRadius = "50%";
m.style.border = "2px solid var(--color-surface-100, #232527)";
u.appendChild(m);
}
}
var h = document.createElement("div");
h.style.display = "flex";
h.style.flexDirection = "column";
h.style.justifyContent = "center";
h.style.overflow = "hidden";
h.style.width = "100%";
var v = document.createElement("div");
v.className = "game-card-name";
v.title = e.displayName || e.name || "";
v.style.fontSize = "16px";
v.style.fontWeight = "500";
v.style.whiteSpace = "nowrap";
v.style.overflow = "hidden";
v.style.textOverflow = "ellipsis";
v.style.display = "flex";
v.style.alignItems = "center";
var y = document.createElement("span");
y.textContent = e.displayName || e.name || "";
y.style.whiteSpace = "nowrap";
y.style.overflow = "hidden";
y.style.textOverflow = "ellipsis";
v.appendChild(y);
if (e.hasVerifiedBadge) {
var g = document.createElement("span");
g.textContent = " ✓";
g.title = "Verified";
g.style.marginLeft = "5px";
g.style.flexShrink = "0";
g.style.color = "rgb(0,162,255)";
g.style.fontSize = "12px";
v.appendChild(g);
}
var b = document.createElement("div");
b.className = "game-card-info";
b.style.fontSize = "12px";
b.style.color = "var(--color-content-muted, #8a8e91)";
b.style.whiteSpace = "nowrap";
b.style.overflow = "hidden";
b.style.textOverflow = "ellipsis";
var w = "@" + (e.name || "");
var x = W(n);
if (x) w = x; else if (a) w = "@" + (e.name || "") + " · Friend";
b.textContent = w;
h.appendChild(v);
h.appendChild(b);
l.appendChild(u);
l.appendChild(h);
s.appendChild(l);
if (n && n.userPresenceType === 2 && n.gameId) {
var R = document.createElement("div");
R.style.display = "flex";
R.style.gap = "6px";
R.style.alignItems = "center";
R.style.flexShrink = "0";
R.style.paddingRight = "12px";
var L = document.createElement("button");
L.type = "button";
L.setAttribute("aria-label", a ? "Join friend" : "Join game");
L.innerHTML = '<span class="icon-common-play" style="width:30px;height:30px;display:inline-block;"></span>';
L.style.backgroundColor = "var(--purpura-playButton, #7c3aed)";
L.style.border = "none";
L.style.borderRadius = "8px";
L.style.width = "36px";
L.style.height = "36px";
L.style.cursor = "pointer";
L.style.display = "flex";
L.style.alignItems = "center";
L.style.justifyContent = "center";
L.style.flexShrink = "0";
L.onmousedown = function(e) {
e.preventDefault();
e.stopPropagation();
};
L.onclick = function(t) {
t.preventDefault();
t.stopPropagation();
if (a) Y(e.id); else J(n.rootPlaceId, n.gameId);
};
R.appendChild(L);
s.appendChild(R);
}
i.appendChild(s);
return i;
}
function Q(e, t, n, a, i) {
var s = document.createElement("li");
s.className = "navbar-search-option rbx-clickable-li improved-search " + r;
var l = document.createElement("div");
l.style.display = "flex";
l.style.alignItems = "center";
l.style.padding = "6px 0px";
l.style.gap = "12px";
l.style.maxHeight = "56px";
var u = document.createElement("a");
u.className = "new-navbar-search-anchor";
u.href = "https://www.roblox.com/games/" + e.rootPlaceId + "/";
u.style.display = "flex";
u.style.alignItems = "center";
u.style.gap = "12px";
u.style.flex = "1";
u.style.minWidth = "0";
u.style.textDecoration = "none";
u.style.color = "inherit";
var o = document.createElement("span");
o.className = "thumbnail-2d-container";
o.style.height = "48px";
o.style.width = "48px";
o.style.borderRadius = "8px";
o.style.flexShrink = "0";
o.style.display = "block";
o.style.overflow = "hidden";
if (t) {
var c = document.createElement("img");
c.src = t;
c.alt = e.name || "";
c.style.height = "100%";
c.style.width = "100%";
c.style.borderRadius = "8px";
c.style.objectFit = "cover";
o.appendChild(c);
} else {
var p = document.createElement("span");
p.className = "thumbnail-2d-container shimmer";
p.style.display = "block";
p.style.height = "100%";
p.style.width = "100%";
p.style.borderRadius = "8px";
o.appendChild(p);
}
var f = document.createElement("div");
f.style.display = "flex";
f.style.flexDirection = "column";
f.style.justifyContent = "center";
f.style.overflow = "hidden";
f.style.width = "100%";
var m = document.createElement("div");
m.className = "game-card-name";
m.title = e.name || "";
m.textContent = e.name || "";
m.style.fontSize = "16px";
m.style.fontWeight = "500";
m.style.whiteSpace = "nowrap";
m.style.overflow = "hidden";
m.style.textOverflow = "ellipsis";
var h = document.createElement("div");
h.className = "game-card-info";
h.style.display = "flex";
h.style.alignItems = "center";
h.style.gap = "4px";
h.style.marginTop = "4px";
h.style.fontSize = "12px";
if (n == null || i == null) {
var v = document.createElement("span");
v.className = "thumbnail-2d-container shimmer";
v.style.display = "block";
v.style.width = "115px";
v.style.height = "12px";
v.style.borderRadius = "4px";
h.appendChild(v);
} else {
var y = document.createElement("span");
y.className = "info-label icon-votes-gray";
h.appendChild(y);
var g = document.createElement("span");
g.className = "info-label vote-percentage-label";
g.textContent = a + "%";
g.style.marginLeft = "2px";
h.appendChild(g);
var b = document.createElement("span");
b.className = "info-label icon-playing-counts-gray";
b.style.marginLeft = "8px";
h.appendChild(b);
var w = document.createElement("span");
w.className = "info-label playing-counts-label";
w.textContent = n;
w.style.marginLeft = "2px";
h.appendChild(w);
}
f.appendChild(m);
f.appendChild(h);
u.appendChild(o);
u.appendChild(f);
l.appendChild(u);
var x = document.createElement("div");
x.style.display = "flex";
x.style.gap = "6px";
x.style.alignItems = "center";
x.style.flexShrink = "0";
x.style.paddingRight = "12px";
x.className = "purpura-es-qp-buttons";
x.style.display = d && S() ? "flex" : "none";
var R = document.createElement("button");
R.type = "button";
R.className = "purpura-qp-btn purpura-qp-play";
R.setAttribute("aria-label", "Play");
R.innerHTML = '<span class="icon-common-play" style="width:30px;height:30px;display:inline-block;"></span>';
R.style.backgroundColor = "var(--purpura-playButton, #7c3aed)";
R.style.border = "none";
R.style.borderRadius = "8px";
R.style.width = "36px";
R.style.height = "36px";
R.style.cursor = "pointer";
R.style.display = "flex";
R.style.alignItems = "center";
R.style.justifyContent = "center";
R.style.flexShrink = "0";
R.style.color = "#fff";
R.onmousedown = function(e) {
e.preventDefault();
e.stopPropagation();
};
R.onclick = function(t) {
t.preventDefault();
t.stopPropagation();
J(e.rootPlaceId);
};
var L = document.createElement("button");
L.type = "button";
L.className = "purpura-qp-btn purpura-qp-servers";
L.setAttribute("aria-label", "Servers");
L.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>';
L.style.backgroundColor = "#6d28d9";
L.style.border = "none";
L.style.borderRadius = "8px";
L.style.width = "36px";
L.style.height = "36px";
L.style.cursor = "pointer";
L.style.display = "flex";
L.style.alignItems = "center";
L.style.justifyContent = "center";
L.style.flexShrink = "0";
L.style.color = "#fff";
L.onmousedown = function(e) {
e.preventDefault();
e.stopPropagation();
};
L.onclick = function(t) {
t.preventDefault();
t.stopPropagation();
U(L, e.rootPlaceId);
};
x.appendChild(R);
x.appendChild(L);
l.appendChild(x);
s.appendChild(l);
return s;
}
function X(e) {
if (!e) return false;
var t = e.querySelectorAll("li.navbar-search-option");
for (var n = 0; n < t.length; n++) {
var a = t[n];
if (a.classList.contains(r)) continue;
var i = false;
for (var s = 0; s < a.classList.length; s++) {
var l = a.classList[s];
if (l !== "navbar-search-option" && l !== "rbx-clickable-li" && l !== "new-selected" && l !== "improved-search") {
i = true;
break;
}
}
if (i) return true;
}
return false;
}
function Z() {
var e = A();
if (!e) return;
var t = Array.prototype.slice.call(e.querySelectorAll("li.navbar-search-option"));
if (!t.length) return;
if (X(e)) {
u = 0;
var n = e.querySelectorAll("." + r);
for (var a = 0; a < n.length; a++) n[a].classList.toggle("new-selected", a === 0);
return;
}
if (u < 0) u = t.length - 1;
if (u >= t.length) u = 0;
for (var i = 0; i < t.length; i++) t[i].classList.toggle("new-selected", i === u);
}
function ee(e) {
var t = A();
if (!t) return;
t.querySelectorAll("." + r).forEach(function(e) {
e.remove();
});
if (window._purpuraLastGameResult) t.prepend(window._purpuraLastGameResult);
if (window._purpuraLastFriendResults && window._purpuraLastFriendResults.length) {
var n = window._purpuraLastFriendResults.slice().reverse();
for (var a = 0; a < n.length; a++) t.prepend(n[a]);
}
if (window._purpuraLastUserResult) t.prepend(window._purpuraLastUserResult);
if (e) u = 0;
Z();
}
function te() {
var e = A();
if (!e || e.querySelector("." + r)) return;
if (window._purpuraLastGameResult) e.prepend(window._purpuraLastGameResult);
if (window._purpuraLastFriendResults && window._purpuraLastFriendResults.length) {
var t = window._purpuraLastFriendResults.slice().reverse();
for (var n = 0; n < t.length; n++) e.prepend(t[n]);
}
if (window._purpuraLastUserResult) e.prepend(window._purpuraLastUserResult);
Z();
}
function re() {
var e = A();
if (!e) return;
e.querySelectorAll("." + r).forEach(function(e) {
e.remove();
});
Z();
}
function ne(e, t) {
var r = (e || "").toLowerCase();
if (!r) return Promise.resolve([]);
return new Promise(function(e) {
chrome.storage.local.get([ "purpura_friends_cache", "purpura_friends_cache_time" ], function(n) {
var a = Date.now();
var i = n.purpura_friends_cache;
var s = n.purpura_friends_cache_time || 0;
var l = i && Array.isArray(i) && a - s < 3e5;
if (l) {
var u = [];
for (var o = 0; o < i.length && u.length < 5; o++) {
var c = i[o];
var d = (c.username || c.name || "").toLowerCase();
var p = (c.displayName || c.combinedName || "").toLowerCase();
var f = (c.combinedName || "").toLowerCase();
if (d.indexOf(r) !== -1 || p.indexOf(r) !== -1 || f.indexOf(r) !== -1) u.push(c);
}
e(u);
return;
}
var m = null;
try {
var h = document.querySelector('meta[name="user-data"]');
m = h ? h.getAttribute("data-userid") : null;
} catch (e) {}
m = m ? String(m) : "";
if (!m || m === "0") {
e([]);
return;
}
if (t && t.aborted) {
e([]);
return;
}
fetch("https://friends.roblox.com/v1/users/" + encodeURIComponent(m) + "/friends?limit=100&sortOrder=Asc", {
credentials: "include",
signal: t
}).then(function(e) {
if (!e.ok) throw new Error("friends " + e.status);
return e.json();
}).then(function(t) {
var n = t && t.data ? t.data : [];
var a = [];
for (var i = 0; i < n.length; i++) {
var s = n[i];
a.push({
id: s.id,
username: s.name,
name: s.name,
displayName: s.displayName,
combinedName: s.displayName,
hasVerifiedBadge: !!s.hasVerifiedBadge,
isBanned: false
});
}
try {
chrome.storage.local.set({
purpura_friends_cache: a,
purpura_friends_cache_time: Date.now()
});
} catch (e) {}
var l = [];
for (var u = 0; u < a.length && l.length < 5; u++) {
var o = a[u];
var c = (o.username || "").toLowerCase();
var d = (o.displayName || "").toLowerCase();
if (c.indexOf(r) !== -1 || d.indexOf(r) !== -1) l.push(o);
}
e(l);
}).catch(function() {
e([]);
});
});
});
}
function ae(e, t) {
if (i) try {
i.abort();
} catch (e) {}
i = new AbortController;
var r = i.signal;
var n = null;
var a = false;
function s() {
if (a) return;
a = true;
t.userDone = true;
V(t);
}
var l = L();
var u = C();
if (!l) {
F(t, "userResult", null);
s();
}
if (l) {
K("users", "/v1/usernames/users", {
method: "POST",
body: {
usernames: [ e ],
excludeBannedUsers: false
},
signal: r,
retries: 2
}).then(function(a) {
if (!M(t, r)) return;
n = a && a.data && a.data[0] ? a.data[0] : null;
if (n) {
F(t, "userResult", $({
id: n.id,
name: n.name,
displayName: n.displayName,
hasVerifiedBadge: !!n.hasVerifiedBadge,
isBanned: false
}, null, null, false));
} else {
F(t, "userResult", null);
}
s();
if (n) {
Promise.all([ z([ {
id: n.id
} ], "AvatarHeadshot", "48x48", r), K("presence", "/v1/presence/users", {
method: "POST",
body: {
userIds: [ n.id ]
},
signal: r,
retries: 2
}).catch(function() {
return null;
}) ]).then(function(e) {
if (!M(t, r)) return;
var a = e[0];
var i = e[1] && e[1].userPresences ? e[1].userPresences[0] : null;
F(t, "userResult", $({
id: n.id,
name: n.name,
displayName: n.displayName,
hasVerifiedBadge: !!n.hasVerifiedBadge,
isBanned: false
}, a.get(Number(n.id)) || null, i, false));
if (t.committed) ee();
}).catch(function() {});
}
setTimeout(function() {
if (!u) {
F(t, "friendResults", []);
if (t.committed) ee();
return;
}
ne(e, r).then(function(e) {
if (!M(t, r) || !e.length) {
if (!e.length) {
F(t, "friendResults", []);
if (t.committed) ee();
}
return;
}
var n = e.map(function(e) {
return {
id: e.id,
name: e.username,
displayName: e.combinedName || e.displayName,
hasVerifiedBadge: !!e.isVerified,
isBanned: !!e.isDeleted
};
});
z(n.map(function(e) {
return {
id: e.id
};
}), "AvatarHeadshot", "48x48", r).then(function(e) {
if (!M(t, r)) return;
var a = O(t, "userResult");
var i = a && a.dataset ? a.dataset.userId : null;
var s = [];
for (var l = 0; l < n.length; l++) {
var u = n[l];
if (i && String(i) === String(u.id)) continue;
s.push($(u, e.get(Number(u.id)) || null, null, true));
}
F(t, "friendResults", s);
K("presence", "/v1/presence/users", {
method: "POST",
body: {
userIds: n.map(function(e) {
return e.id;
})
},
signal: r,
retries: 2
}).then(function(a) {
if (!M(t, r)) return;
var i = new Map;
(a && a.userPresences || []).forEach(function(e) {
i.set(e.userId, e);
});
var s = O(t, "userResult");
var l = s && s.dataset ? s.dataset.userId : null;
var u = [];
for (var o = 0; o < n.length; o++) {
var c = n[o];
if (l && String(l) === String(c.id)) continue;
u.push($(c, e.get(Number(c.id)) || null, i.get(Number(c.id)) || null, true));
}
F(t, "friendResults", u);
if (t.committed) ee();
}).catch(function() {});
if (t.committed) ee();
}).catch(function() {
F(t, "friendResults", []);
if (t.committed) ee();
});
}).catch(function() {
F(t, "friendResults", []);
if (t.committed) ee();
});
}, 0);
}).catch(function(e) {
if (e && e.name === "AbortError") return;
if (M(t, r)) {
F(t, "userResult", null);
F(t, "friendResults", []);
s();
}
});
}
if (!l && u) {
s();
ne(e, r).then(function(e) {
if (!M(t, r) || !e.length) {
if (!e.length) {
F(t, "friendResults", []);
if (t.committed) ee();
}
return;
}
var n = e.map(function(e) {
return {
id: e.id,
name: e.username,
displayName: e.combinedName || e.displayName,
hasVerifiedBadge: !!e.isVerified,
isBanned: !!e.isDeleted
};
});
z(n.map(function(e) {
return {
id: e.id
};
}), "AvatarHeadshot", "48x48", r).then(function(e) {
if (!M(t, r)) return;
var a = O(t, "userResult");
var i = a && a.dataset ? a.dataset.userId : null;
var s = [];
for (var l = 0; l < n.length; l++) {
var u = n[l];
if (i && String(i) === String(u.id)) continue;
s.push($(u, e.get(Number(u.id)) || null, null, true));
}
F(t, "friendResults", s);
K("presence", "/v1/presence/users", {
method: "POST",
body: {
userIds: n.map(function(e) {
return e.id;
})
},
signal: r,
retries: 2
}).then(function(a) {
if (!M(t, r)) return;
var i = new Map;
(a && a.userPresences || []).forEach(function(e) {
i.set(e.userId, e);
});
var s = O(t, "userResult");
var l = s && s.dataset ? s.dataset.userId : null;
var u = [];
for (var o = 0; o < n.length; o++) {
var c = n[o];
if (l && String(l) === String(c.id)) continue;
u.push($(c, e.get(Number(c.id)) || null, i.get(Number(c.id)) || null, true));
}
F(t, "friendResults", u);
if (t.committed) ee();
}).catch(function() {});
if (t.committed) ee();
}).catch(function() {
F(t, "friendResults", []);
if (t.committed) ee();
});
}).catch(function() {
F(t, "friendResults", []);
if (t.committed) ee();
});
} else if (!l) {
F(t, "friendResults", []);
if (t.committed) ee();
}
}
function ie(e, t) {
if (!S()) {
F(t, "gameResult", null);
t.gameDone = true;
V(t);
return;
}
if (s) try {
s.abort();
} catch (e) {}
s = new AbortController;
var r = s.signal;
var n = null;
try {
var a = document.querySelector('meta[name="user-data"]');
n = a ? a.getAttribute("data-userid") || "0" : "0";
} catch (e) {
n = "0";
}
K("apis", "/search-api/omni-search?searchQuery=" + encodeURIComponent(e) + "&sessionid=" + encodeURIComponent(n || "0") + "&pageType=Game", {
signal: r,
retries: 2
}).then(function(e) {
if (!M(t, r)) return;
var n = e && e.searchResults ? e.searchResults.find(function(e) {
return e.contentGroupType === "Game" && e.contents && e.contents.length;
}) : null;
if (!n) {
F(t, "gameResult", null);
t.gameDone = true;
V(t);
return;
}
var a = n.contents[0];
F(t, "gameResult", Q(a, null, null, null, null));
t.gameDone = true;
V(t);
setTimeout(function() {
Promise.all([ z([ {
id: a.universeId
} ], "GameIcon", "50x50", r), K("games", "/v1/games/votes?universeIds=" + a.universeId, {
signal: r,
retries: 2
}).catch(function() {
return null;
}) ]).then(function(e) {
if (!M(t, r)) return;
var n = e[0];
var i = e[1];
var s = i && i.data && i.data[0] ? i.data[0] : {
upVotes: 0,
downVotes: 0
};
var l = (s.upVotes || 0) + (s.downVotes || 0);
var u = l ? Math.floor(s.upVotes / l * 100) : 0;
var o = n.get(Number(a.universeId));
var c = o && o.imageUrl ? o.imageUrl : "";
F(t, "gameResult", Q(a, c, y(a.playerCount || 0), u, l));
if (t.committed) ee();
}).catch(function() {});
}, 0);
}).catch(function(e) {
if (e && e.name === "AbortError") return;
if (M(t, r)) {
F(t, "gameResult", null);
t.gameDone = true;
V(t);
}
});
}
function se(e) {
if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
if (g()) return;
if (!R() || !p) return;
e.preventDefault();
w();
}
function le() {
d = I();
p = E();
_();
T();
var e = h(function(e, t) {
ie(e, t);
}, 300);
var t = h(function(e, t) {
ae(e, t);
}, 100);
function n() {
var a = b();
if (!a) {
if (f) return;
f = setInterval(function() {
var e = b();
if (e) {
clearInterval(f);
f = 0;
n();
}
}, 400);
return;
}
var d = function(r) {
if (!R()) return;
var n = (a.value || "").trim();
if (!r && n === l) return;
if (r && n === l && (window._purpuraLastUserResult || window._purpuraLastGameResult || window._purpuraLastFriendResults && window._purpuraLastFriendResults.length)) {
te();
return;
}
l = n;
if (i) try {
i.abort("new");
} catch (e) {}
if (s) try {
s.abort("new");
} catch (e) {}
if (n.length < 1) {
o = null;
c = null;
u = 0;
window._purpuraLastUserResult = null;
window._purpuraLastGameResult = null;
window._purpuraLastFriendResults = [];
ee(true);
return;
}
var d = B(n);
o = d;
var p = L() || C();
var f = S();
if (p) t(n, d); else {
d.userDone = true;
F(d, "userResult", null);
F(d, "friendResults", []);
}
if (f) {
if (n.length >= 2) e(n, d); else {
d.gameDone = true;
V(d);
}
} else {
F(d, "gameResult", null);
d.gameDone = true;
V(d);
}
};
a.addEventListener("input", function() {
d(false);
});
a.addEventListener("focus", function() {
d(true);
});
a.addEventListener("keydown", function(e) {
if (!R()) return;
var t = A();
var r = t && (t.offsetParent !== null || t.classList.contains("show"));
if (X(t)) return;
if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Tab") {
if (!r) return;
var n = t.querySelectorAll("li.navbar-search-option");
if (!n.length) return;
e.preventDefault();
e.stopImmediatePropagation();
if (e.key === "ArrowDown" || e.key === "Tab" && !e.shiftKey) u++; else u--;
Z();
} else if (e.key === "Enter") {
if (!r) return;
var a = t.querySelector("li.navbar-search-option.new-selected");
if (a) {
var i = a.querySelector("a");
if (i && i.href) {
e.preventDefault();
e.stopImmediatePropagation();
e.stopPropagation();
i.click();
if (window.location.href !== i.href) window.location.href = i.href;
}
}
}
});
a.addEventListener("keyup", function(e) {
if (!R() || e.key !== "Enter") return;
var t = A();
var r = t && (t.offsetParent !== null || t.classList.contains("show"));
if (r && X(t)) return;
var n = false;
if (r) {
var i = t.querySelector("li.navbar-search-option.new-selected");
if (i) {
var s = i.querySelector("a");
if (s) {
n = true;
}
}
}
if (!n) {
var l = a.value || "";
if (l.trim().length) {}
}
}, true);
var p = A();
if (p) {
var m = new MutationObserver(function(e) {
for (var t = 0; t < e.length; t++) {
var n = e[t];
if (n.type !== "attributes" || n.attributeName !== "class") continue;
var a = n.target;
if (!a.classList.contains("navbar-search-option") || !a.classList.contains(r)) continue;
var i = Array.prototype.slice.call(p.querySelectorAll("li.navbar-search-option"));
var s = i.indexOf(a);
if (s === -1) continue;
if (s === u && !a.classList.contains("new-selected")) a.classList.add("new-selected");
if (s !== u && a.classList.contains("new-selected")) a.classList.remove("new-selected");
}
});
m.observe(p, {
attributes: true,
subtree: true,
attributeFilter: [ "class" ]
});
}
var h = setInterval(function() {
var e = A();
if (e && !e.__purpuraMenuObserved) {
e.__purpuraMenuObserved = true;
if (R()) te();
var t = new MutationObserver(function(t) {
for (var n = 0; n < t.length; n++) {
var a = t[n];
if (a.type !== "attributes" || a.attributeName !== "class") continue;
var i = a.target;
if (!i.classList || !i.classList.contains("navbar-search-option") || !i.classList.contains(r)) continue;
var s = Array.prototype.slice.call(e.querySelectorAll("li.navbar-search-option"));
var l = s.indexOf(i);
if (l === -1) continue;
if (l === u && !i.classList.contains("new-selected")) i.classList.add("new-selected");
if (l !== u && i.classList.contains("new-selected")) i.classList.remove("new-selected");
}
});
t.observe(e, {
attributes: true,
subtree: true,
attributeFilter: [ "class" ]
});
}
}, 500);
setTimeout(function() {
clearInterval(h);
}, 3e4);
}
n();
}
document.addEventListener("keydown", se, true);
function ue(t, r) {
if (r !== "sync") return;
if (t[e]) {
var n = t[e].newValue;
var a = false;
if (n === true) a = true; else if (n && typeof n === "object") a = n.enabled === true;
if (!a) {
l = "";
o = null;
c = null;
window._purpuraLastUserResult = null;
window._purpuraLastGameResult = null;
window._purpuraLastFriendResults = [];
re();
} else {
var u = t[e].oldValue;
if (u === true) u = {
enabled: true,
userSearch: true,
gameSearch: true,
friendSearch: true,
focusKey: true
};
if (u === false || u == null || typeof u !== "object") u = {
enabled: false,
userSearch: true,
gameSearch: true,
friendSearch: true,
focusKey: true
};
if (n === true) n = {
enabled: true,
userSearch: true,
gameSearch: true,
friendSearch: true,
focusKey: true
};
var f = n.userSearch !== false;
var m = u.userSearch !== false;
var h = n.friendSearch !== false;
var v = u.friendSearch !== false;
var y = n.gameSearch !== false;
var g = u.gameSearch !== false;
if (!f && m) {
window._purpuraLastUserResult = null;
re();
if (i) try {
i.abort();
} catch (e) {}
}
if (!h && v) {
window._purpuraLastFriendResults = [];
re();
if (i) try {
i.abort();
} catch (e) {}
}
if (!y && g) {
window._purpuraLastGameResult = null;
re();
if (s) try {
s.abort();
} catch (e) {}
o = null;
c = null;
var w = document.querySelectorAll(".purpura-es-qp-buttons");
for (var x = 0; x < w.length; x++) w[x].style.display = "none";
if (P) P.classList.remove("visible");
}
if (f && !m || h && !v || y && !g) {
if (l) {
var R = b();
if (R && (R.value || "").trim() === l) {
var E = B(l);
o = E;
var I = L() || C();
var _ = S();
if (I) ae(l, E); else {
E.userDone = true;
F(E, "userResult", null);
F(E, "friendResults", []);
}
if (_) {
if (l.length >= 2) ie(l, E); else {
E.gameDone = true;
V(E);
}
} else {
F(E, "gameResult", null);
E.gameDone = true;
V(E);
}
}
}
}
if (g !== y && window._purpuraLastGameResult) {
var N = window._purpuraLastGameResult.querySelector(".purpura-es-qp-buttons");
if (N) N.style.display = d && y ? "flex" : "none";
if (c) ee();
}
var k = n.focusKey !== false;
var q = u.focusKey !== false;
if (k !== q) {
p = k;
}
}
}
if (t["qp"]) {
d = t["qp"].newValue === true || t["qp"].newValue && typeof t["qp"].newValue === "object" && t["qp"].newValue.enabled === true;
if (window._purpuraLastGameResult) {
var T = window._purpuraLastGameResult.querySelector(".purpura-es-qp-buttons");
var j = d && S();
if (T) T.style.display = j ? "flex" : "none";
if (c) ee();
}
}
}
window.__PurpuraSettings.ready.then(function() {
chrome.storage.onChanged.addListener(ue);
d = I();
p = E();
_();
le();
});
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", function() {
if (window.__PurpuraSettings && window.__PurpuraSettings.ready) return;
setTimeout(function() {
if (R()) le();
}, 800);
}, {
once: true
});
}
})();
