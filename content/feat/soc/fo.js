/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
if (window.purpuraFriendOriginInitialized) return;
window.purpuraFriendOriginInitialized = true;
(function() {
var e = document.createElement("style");
e.textContent = ":root{--purpura-fo-label-color:rgba(255,255,255,0.5)}";
document.head.appendChild(e);
})();
var e = "fo";
var r = true;
var n = {
0: "Unknown",
1: "Search",
2: "In-Game",
3: "Profile",
4: "QQ Contacts",
5: "WeChat Contacts",
6: "QR Code",
7: "Profile Share",
8: "Phone Contacts",
9: "Friend Link",
10: "People You May Know"
};
var t = {};
var i = false;
var o = false;
var a = null;
var u = null;
function l(e) {
var r = e && e.href || "";
var n = r.match(/\/users\/(\d+)/);
return n ? n[1] : null;
}
function c(e) {
return new Date(e).toLocaleDateString(undefined, {
year: "numeric",
month: "short",
day: "numeric"
});
}
function f(e) {
return n[e] || null;
}
function s() {
var e = document.querySelector('meta[name="csrf-token"]');
if (e) return e.getAttribute("content");
if (window.Roblox && window.Roblox.XsrfToken) {
try {
var r = window.Roblox.XsrfToken.getToken();
if (r) return r;
} catch (e) {}
}
var n = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
if (n) return decodeURIComponent(n[1]);
return "";
}
function d(e, r, n) {
var t = document.createElement("div");
t.className = "avatar-card-label text-overflow purpura-friend-origin-label";
t.dataset.friendId = n;
t.style.cssText = "font-size:11px;color:var(--purpura-fo-label-color);margin-top:2px;line-height:1.3;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:100%;";
var i = [];
var o = f(r);
if (o && o !== "Unknown") {
i.push(o);
}
if (e) {
i.push(c(e));
}
if (!i.length) return null;
var a = i.join(" · ");
if (!o || o === "Unknown") a = "Friends since " + a;
t.textContent = a;
t.title = a;
return t;
}
function v(e) {
var r = l(e);
if (!r) return;
var n = t[r];
if (!n || !n.since && (n.origin === null || n.origin === undefined)) {
return;
}
var i = e.closest(".avatar-card-caption");
if (!i) return;
var o = i.querySelector(".purpura-friend-origin-label");
if (o) {
if (o.dataset.friendId === r) return;
o.remove();
}
var a = d(n.since, n.origin, r);
if (!a) return;
var u = i.querySelector(".avatar-status-container");
if (u && u.parentNode) {
u.parentNode.insertBefore(a, u);
} else {
i.appendChild(a);
}
}
function h() {
if (!r) return;
var e = document.querySelectorAll(".avatar-card-caption a.avatar-name");
if (!e.length) {
e = document.querySelectorAll('[href*="/users/"][href*="/profile"]');
}
for (var n = 0; n < e.length; n++) {
v(e[n]);
}
}
var p = null;
function m() {
if (u) u.disconnect();
u = new MutationObserver(function() {
if (!r) return;
if (!p) {
p = setTimeout(function() {
p = null;
h();
}, 200);
}
});
var e = document.querySelector('.avatar-cards, .friends-list, [data-testid="friends-list"]');
if (e) {
u.observe(e, {
childList: true,
subtree: true
});
} else {
u.observe(document.body, {
childList: true,
subtree: true
});
}
}
function w() {
if (u) {
u.disconnect();
u = null;
}
clearTimeout(p);
p = null;
}
function g() {
var e = document.querySelectorAll(".purpura-friend-origin-label");
for (var r = 0; r < e.length; r++) {
e[r].remove();
}
}
async function y() {
if (o) return;
o = true;
try {
var e = s();
var r = await new Promise(function(r) {
chrome.runtime.sendMessage({
action: "fetchAllFriendInsights",
csrfToken: e
}, function(e) {
r(e);
});
});
i = true;
if (r && typeof r === "object") {
t = r;
}
} catch (e) {} finally {
o = false;
}
}
function b() {
if (r) {
if (!i && !o) {
y().then(function() {
h();
m();
});
} else {
h();
m();
}
} else {
w();
g();
}
}
window.__PurpuraSettings.ready.then(function() {
r = window.__PurpuraSettings.get(e) !== false;
b();
});
chrome.storage.onChanged.addListener(function(n, t) {
if (t === "sync" && n[e]) {
r = n[e].newValue !== false;
b();
}
});
})();
