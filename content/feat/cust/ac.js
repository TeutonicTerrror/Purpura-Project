/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
"use strict";
if (window.__purpuraAvatarCyclerLoaded) return;
window.__purpuraAvatarCyclerLoaded = true;
var r = "ac";
var a = "purpura_avatar_cycler_ids";
var e = "purpura_avatar_cycler_interval";
var t = "purpura_avatar_cycler_details";
var n = "purpura-avatar-cycler-button";
var o = "purpura-avatar-cycler-overlay";
var u = "";
var c = false;
var i = null;
var p = new Set;
var l = new Map;
var s = null;
var d = null;
var v = null;
var f = false;
function m(r, a) {
return chrome.i18n.getMessage(r, a) || r;
}
function h() {
return window.location.pathname.toLowerCase().indexOf("/my/avatar") !== -1;
}
function x(r) {
if (r === undefined) return true;
return r === true || !!(r && typeof r === "object" && r.enabled === true);
}
function g(r, a) {
a = a || {};
a.credentials = "include";
return fetch(r, a).then(function(r) {
if (!r.ok) throw new Error("HTTP " + r.status);
return r.json();
});
}
function y(r, a) {
var e = document.createElement("button");
e.type = "button";
e.className = a;
e.textContent = r;
return e;
}
function b() {
if (document.getElementById("purpura-avatar-cycler-style")) return;
var r = document.createElement("style");
r.id = "purpura-avatar-cycler-style";
r.textContent = [ "#purpura-avatar-cycler-button{box-sizing:border-box;display:inline-flex!important;align-items:center;justify-content:center;min-height:20px;height:20px;margin-left:5px;padding:0 8px;border:1px solid var(--purpura-surface300,var(--color-stroke-default,rgba(255,255,255,.16)))!important;border-radius:999px!important;background:var(--purpura-surface200,var(--color-surface-200,#2b2c32))!important;color:var(--purpura-mainText,var(--color-content-emphasis,#fff))!important;font-size:10px;font-weight:600;line-height:12px;letter-spacing:.01em;white-space:nowrap;cursor:pointer;box-shadow:0 1px 2px color-mix(in srgb,var(--purpura-surface0,#000) 18%,transparent);transition:background-color .16s ease,border-color .16s ease,box-shadow .16s ease}", "#purpura-avatar-cycler-button:hover{border-color:var(--purpura-surface300,var(--color-stroke-default,rgba(255,255,255,.24)))!important;background:var(--purpura-surface300,var(--color-surface-300,#34353b))!important;box-shadow:0 2px 6px color-mix(in srgb,var(--purpura-surface0,#000) 24%,transparent)}", "#purpura-avatar-cycler-button:active{background:var(--purpura-surface300,var(--color-surface-300,#34353b))!important;box-shadow:inset 0 1px 2px color-mix(in srgb,var(--purpura-surface0,#000) 24%,transparent)}", "#purpura-avatar-cycler-button:focus-visible{outline:2px solid var(--purpura-playButton,var(--color-action-emphasis,#00a2ff));outline-offset:2px}", "#purpura-avatar-cycler-overlay{position:fixed;inset:0;z-index:100000;background:color-mix(in srgb,var(--purpura-surface0,var(--color-surface-0,#000)) 78%,transparent);display:flex;align-items:center;justify-content:center;padding:20px}", "#purpura-avatar-cycler-dialog{display:flex;flex-direction:column;width:min(600px,94vw);height:min(600px,88vh);padding:24px;border:1px solid var(--purpura-surface300,var(--color-stroke-default,rgba(255,255,255,.14)));border-radius:var(--purpura-radius,var(--radius-medium,12px));background:var(--purpura-surface100,var(--color-surface-100,#1f2025));color:var(--purpura-mainText,var(--color-content-emphasis,#fff));box-shadow:0 20px 60px color-mix(in srgb,var(--purpura-surface0,#000) 55%,transparent)}", "#purpura-avatar-cycler-dialog h2{margin:0 0 8px;font-size:22px;color:var(--purpura-mainText,var(--color-content-emphasis,#fff))}", "#purpura-avatar-cycler-dialog p{margin:0;color:var(--purpura-secondaryText,var(--color-content-muted,#a3a3a3));font-size:13px}", ".purpura-ac-settings{display:flex;align-items:center;gap:10px;padding:14px 0 8px}", ".purpura-ac-settings label{font-size:13px;color:var(--purpura-mainText,var(--color-content-emphasis,#fff))}", ".purpura-ac-settings input{width:86px;padding:7px 9px;border:1px solid var(--purpura-surface300,var(--color-stroke-default,rgba(255,255,255,.16)));border-radius:var(--purpura-radius-sm,var(--radius-small,6px));background:var(--purpura-surface200,var(--color-surface-200,#2b2c32));color:var(--purpura-mainText,var(--color-content-emphasis,#fff))}", ".purpura-ac-status{padding:5px 0 12px;font-size:12px;color:var(--purpura-secondaryText,var(--color-content-muted,#a3a3a3))}", ".purpura-ac-list{display:flex;flex-wrap:wrap;align-content:flex-start;justify-content:center;gap:8px;overflow-y:auto;min-height:0;flex:1;padding:4px}", ".purpura-ac-card{position:relative;display:flex;flex-direction:column;align-items:center;width:104px;padding:6px;border:1px solid var(--purpura-surface300,var(--color-stroke-default,rgba(255,255,255,.1)));border-radius:var(--purpura-radius-sm,var(--radius-small,8px));background:var(--purpura-surface200,var(--color-surface-200,rgba(255,255,255,.04)));cursor:pointer;color:var(--purpura-mainText,var(--color-content-emphasis,#fff))}", ".purpura-ac-card:hover,.purpura-ac-card.selected{border-color:var(--purpura-playButton,var(--color-action-emphasis,#00a2ff));background:var(--purpura-surface300,var(--color-surface-300,rgba(0,162,255,.14)))}", ".purpura-ac-card img{width:92px;height:92px;object-fit:cover;border-radius:var(--purpura-radius-sm,var(--radius-small,6px));background:var(--purpura-surface300,var(--color-surface-300,#34353b))}", ".purpura-ac-card span{width:100%;margin-top:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center;font-size:12px}", ".purpura-ac-card input{position:absolute;top:8px;right:8px;width:16px;height:16px;accent-color:var(--purpura-playButton,var(--color-action-emphasis,#00a2ff))}", ".purpura-ac-load{align-self:center;margin:10px 0;padding:8px 14px;height:38px;border:1px solid var(--purpura-surface300,var(--color-stroke-default,rgba(255,255,255,.16)));border-radius:var(--purpura-radius-sm,var(--radius-small,6px));background:var(--purpura-surface200,var(--color-surface-200,#2b2c32));color:var(--purpura-mainText,var(--color-content-emphasis,#fff));cursor:pointer}", ".purpura-ac-load:hover{background:var(--purpura-surface300,var(--color-surface-300,#34353b))}", ".purpura-ac-actions{display:flex;gap:8px;align-items:center;padding-top:14px}", ".purpura-ac-actions button{flex:1 1 0;min-width:0;height:38px;padding:8px 12px;border:1px solid var(--purpura-surface300,var(--color-stroke-default,rgba(255,255,255,.16)));border-radius:var(--purpura-radius-sm,var(--radius-small,7px));background:var(--purpura-surface200,var(--color-surface-200,#2b2c32));color:var(--purpura-mainText,var(--color-content-emphasis,#fff));cursor:pointer;font-weight:600;line-height:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}", ".purpura-ac-actions button:hover{background:var(--purpura-surface300,var(--color-surface-300,#34353b))}", ".purpura-ac-actions .purpura-ac-primary{border-color:var(--purpura-playButton,var(--color-action-emphasis,#00a2ff));background:var(--purpura-playButton,var(--color-action-emphasis,#00a2ff));color:var(--purpura-mainText,var(--color-content-emphasis,#fff))}", ".purpura-ac-actions .purpura-ac-primary:hover{filter:brightness(1.1)}", ".purpura-ac-actions button:disabled{opacity:.5;cursor:not-allowed}", "@media(max-width:600px){#purpura-avatar-cycler-dialog{padding:16px}.purpura-ac-card{width:88px}.purpura-ac-card img{width:76px;height:76px}}" ].join("\n");
(document.head || document.documentElement).appendChild(r);
}
function C(r) {
if (!r.length) return Promise.resolve({});
return g("https://thumbnails.roblox.com/v1/users/outfits?userOutfitIds=" + r.map(encodeURIComponent).join(",") + "&size=150x150&format=Png&isCircular=false").then(function(r) {
var a = {};
(Array.isArray(r.data) ? r.data : []).forEach(function(r) {
if (r && r.targetId && r.imageUrl) a[String(r.targetId)] = r.imageUrl;
});
return a;
}).catch(function() {
return {};
});
}
function _() {
var r = document.getElementById("purpura-ac-status");
if (r) r.textContent = m("avatarCycler_selectStatus", [ String(p.size) ]);
if (d) {
d.disabled = p.size < 2;
d.textContent = p.size < 2 ? m("avatarCycler_selectShort") : m("avatarCycler_setButton", [ String(p.size) ]);
}
if (v) {
v.style.display = f ? "block" : "none";
}
}
function w(r, a) {
var e = Number(r.itemId);
var t = document.createElement("div");
t.className = "purpura-ac-card" + (p.has(e) ? " selected" : "");
t.dataset.outfitId = String(e);
var n = document.createElement("input");
n.type = "checkbox";
n.checked = p.has(e);
n.setAttribute("aria-label", r.itemName || m("avatarCycler_avatar"));
var o = document.createElement("img");
if (a) o.src = a;
o.alt = r.itemName || m("avatarCycler_avatar");
o.loading = "lazy";
o.onerror = function() {
o.style.visibility = "hidden";
};
var u = document.createElement("span");
u.textContent = r.itemName || m("avatarCycler_avatar");
function c() {
if (p.has(e)) p.delete(e); else p.add(e);
n.checked = p.has(e);
t.classList.toggle("selected", n.checked);
_();
}
n.addEventListener("click", function(r) {
r.stopPropagation();
c();
});
t.addEventListener("click", c);
t.appendChild(n);
t.appendChild(o);
t.appendChild(u);
return t;
}
function k(r) {
if (c || !r && u === null) return;
c = true;
var a = document.getElementById("purpura-ac-load-more");
if (a) {
a.disabled = true;
a.textContent = m("avatarCycler_loading");
}
if (r) {
u = "";
if (i) i.textContent = "";
}
var e = new URLSearchParams({
sortOption: "1",
pageLimit: "50",
"itemCategories[0].ItemSubType": "3",
"itemCategories[0].ItemType": "Outfit"
});
if (u) e.set("pageToken", u);
g("https://avatar.roblox.com/v1/avatar-inventory?" + e.toString()).then(function(r) {
var e = Array.isArray(r.avatarInventoryItems) ? r.avatarInventoryItems : [];
var t = e.map(function(r) {
return Number(r.itemId);
}).filter(Boolean);
return C(t).then(function(r) {
e.forEach(function(a) {
if (a && a.itemId && i) i.appendChild(w(a, r[String(a.itemId)]));
});
}).then(function() {
u = r.nextPageToken || null;
if (a) a.style.display = u ? "block" : "none";
});
}).catch(function() {
var r = document.getElementById("purpura-ac-status");
if (r) r.textContent = m("avatarCycler_loadFailed");
}).finally(function() {
c = false;
if (a) {
a.disabled = false;
a.textContent = m("avatarCycler_loadMore");
}
});
}
function E() {
var r = document.getElementById(o);
if (r) r.remove();
document.removeEventListener("keydown", I);
}
function I(r) {
if (r.key === "Escape") E();
}
function S() {
if (document.getElementById(o)) return;
b();
Promise.all([ new Promise(function(a) {
chrome.storage.sync.get([ r, e ], a);
}), new Promise(function(r) {
chrome.storage.local.get([ a, t ], r);
}) ]).then(function(t) {
var n = t[0] || {};
var h = t[1] || {};
p = new Set(Array.isArray(h[a]) ? h[a].map(Number) : []);
f = p.size >= 2;
u = "";
c = false;
l.clear();
var g = document.createElement("div");
g.id = o;
var b = document.createElement("div");
b.id = "purpura-avatar-cycler-dialog";
var C = document.createElement("h2");
C.textContent = m("avatarCycler_title");
var w = document.createElement("p");
w.textContent = m("avatarCycler_description");
var S = document.createElement("div");
S.className = "purpura-ac-settings";
var T = document.createElement("label");
T.textContent = m("avatarCycler_interval");
s = document.createElement("input");
s.type = "number";
s.min = "5";
s.step = "1";
s.value = Math.max(5, Number(n[e]) || 5);
S.appendChild(T);
S.appendChild(s);
var z = document.createElement("div");
z.id = "purpura-ac-status";
z.className = "purpura-ac-status";
i = document.createElement("div");
i.className = "purpura-ac-list";
var B = y(m("avatarCycler_loadMore"), "purpura-ac-load");
B.id = "purpura-ac-load-more";
B.style.display = "none";
B.addEventListener("click", function() {
k(false);
});
var P = document.createElement("div");
P.className = "purpura-ac-actions";
v = y(m("avatarCycler_disable"), "purpura-ac-disable");
v.style.display = x(n[r]) && f ? "block" : "none";
v.addEventListener("click", function() {
p.clear();
f = false;
chrome.storage.local.set({
purpura_avatar_cycler_ids: [],
purpura_avatar_cycler_details: {}
});
i.querySelectorAll(".purpura-ac-card").forEach(function(r) {
r.classList.remove("selected");
var a = r.querySelector("input");
if (a) a.checked = false;
});
_();
});
var N = y(m("avatarCycler_clear"), "purpura-ac-clear");
N.addEventListener("click", function() {
p.clear();
f = false;
chrome.storage.local.set({
purpura_avatar_cycler_ids: [],
purpura_avatar_cycler_details: {}
});
i.querySelectorAll(".purpura-ac-card").forEach(function(r) {
r.classList.remove("selected");
var a = r.querySelector("input");
if (a) a.checked = false;
});
_();
});
d = y(m("avatarCycler_selectShort"), "purpura-ac-primary");
d.disabled = true;
d.addEventListener("click", L);
P.appendChild(v);
P.appendChild(N);
P.appendChild(d);
b.appendChild(C);
b.appendChild(w);
b.appendChild(S);
b.appendChild(z);
b.appendChild(i);
b.appendChild(B);
b.appendChild(P);
g.appendChild(b);
g.addEventListener("click", function(r) {
if (r.target === g) E();
});
document.body.appendChild(g);
document.addEventListener("keydown", I);
_();
k(true);
});
}
function L() {
if (p.size < 2 || !s) return;
var r = Array.from(p);
var a = Math.max(5, parseInt(s.value, 10) || 5);
d.disabled = true;
d.textContent = m("avatarCycler_loadingDetails");
Promise.all(r.map(function(r) {
if (l.has(r)) return Promise.resolve([ r, l.get(r) ]);
return g("https://avatar.roblox.com/v4/outfits/" + encodeURIComponent(r) + "/details").then(function(a) {
l.set(r, a);
return [ r, a ];
});
})).then(function(a) {
var e = {};
a.forEach(function(r) {
e[String(r[0])] = r[1];
});
return new Promise(function(a) {
chrome.storage.local.set({
purpura_avatar_cycler_ids: r,
purpura_avatar_cycler_details: e
}, a);
});
}).then(function() {
return new Promise(function(r) {
chrome.storage.sync.set({
ac: true,
purpura_avatar_cycler_interval: a
}, r);
});
}).then(function() {
f = true;
d.disabled = false;
d.textContent = m("avatarCycler_active");
if (v) v.style.display = "block";
setTimeout(_, 1500);
}).catch(function() {
d.disabled = false;
d.textContent = m("avatarCycler_saveFailed");
_();
});
}
function T(r) {
if (!r || document.getElementById(n) || !h()) return;
var a = document.createElement("li");
a.id = "purpura-avatar-cycler-item";
a.style.cssText = "float:left;margin-left:5px;display:flex;align-items:center;gap:5px;";
var e = y(m("avatarCycler_button"), "btn-secondary-xs");
e.id = n;
e.addEventListener("click", S);
a.appendChild(e);
r.appendChild(a);
}
function z() {
if (!h() || !document.body) return;
b();
var r = new MutationObserver(function() {
if (!h()) return;
var r = document.querySelector(".breadcrumb-container");
if (r) T(r);
});
r.observe(document.body, {
childList: true,
subtree: true
});
var a = document.querySelector(".breadcrumb-container");
if (a) T(a);
}
window.__PurpuraSettings.ready.then(function() {
if (!x(window.__PurpuraSettings.get(r))) return;
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", z, {
once: true
}); else z();
});
chrome.storage.onChanged.addListener(function(a, e) {
if (e !== "sync" || !a[r]) return;
if (x(a[r].newValue)) z(); else {
var t = document.getElementById(n);
if (t) t.remove();
E();
}
});
})();
