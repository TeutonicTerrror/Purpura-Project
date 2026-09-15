/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
!function() {
const e = "fm";
function t() {
if (document.getElementById("purpura-friends-styles")) return;
var e = document.createElement("style");
e.id = "purpura-friends-styles", document.head.appendChild(e);
n = r();
o();
s();
}
function r() {
var e = document.documentElement;
if (e.classList.contains("dark-theme") || e.getAttribute("data-theme") === "dark") return "dark";
if (e.classList.contains("light-theme") || e.getAttribute("data-theme") === "light") return "light";
if (document.body) {
if (document.body.classList.contains("dark-theme") || document.body.classList.contains("theme-dark")) return "dark";
if (document.body.classList.contains("light-theme") || document.body.classList.contains("theme-light")) return "light";
}
return "dark";
}
var n = "dark", a = null;
function o() {
var e = document.getElementById("purpura-friends-styles");
if (!e) return;
var t = n === "light", r = t ? "--pfm-bg:rgba(245,243,240,0.9);--pfm-surface:rgba(255,255,255,0.8);--pfm-surface-2:rgba(0,0,0,.03);--pfm-border:rgba(124,111,142,.12);--pfm-border-hi:rgba(124,111,142,.22);--pfm-text:#2e2a35;--pfm-muted:rgba(62,55,72,.55);--pfm-dim:rgba(0,0,0,.2);--pfm-accent:#7c6f8e;--pfm-accent-lo:rgba(124,111,142,.12);--pfm-danger:#ef4444;--pfm-danger-lo:rgba(239,68,68,.12);--pfm-success:#22c55e;--pfm-success-lo:rgba(34,197,94,.12);--pfm-radius:10px;--pfm-btn-bg:#ffffff;--pfm-btn-border:rgba(124,111,142,.18);--pfm-btn-text:#2e2a35;--pfm-btn-hover-bg:rgba(124,111,142,.06);--pfm-btn-hover-border:#7c6f8e;--pfm-btn-hover-text:#7c6f8e" : "--pfm-bg:rgba(18,15,28,0.92);--pfm-surface:rgba(30,25,48,0.75);--pfm-surface-2:rgba(255,255,255,.04);--pfm-border:rgba(168,85,247,.12);--pfm-border-hi:rgba(168,85,247,.22);--pfm-text:#e8e8f0;--pfm-muted:rgba(255,255,255,.5);--pfm-dim:rgba(255,255,255,.2);--pfm-accent:#a855f7;--pfm-accent-lo:rgba(168,85,247,.12);--pfm-danger:#ef4444;--pfm-danger-lo:rgba(239,68,68,.12);--pfm-success:#22c55e;--pfm-success-lo:rgba(34,197,94,.12);--pfm-radius:10px;--pfm-btn-bg:rgba(30,25,48,.75);--pfm-btn-border:rgba(168,85,247,.15);--pfm-btn-text:#e8e8f0;--pfm-btn-hover-bg:rgba(168,85,247,.08);--pfm-btn-hover-border:#a855f7;--pfm-btn-hover-text:#a855f7";
e.textContent = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');:root{" + r + "}" + "#purpura-friends-manager-btn{padding:0 14px;height:34px;border-radius:8px;border:1px solid var(--pfm-btn-border);background:var(--pfm-btn-bg);color:var(--pfm-btn-text);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px;font-family:system-ui,-apple-system,sans-serif;font-size:12px;font-weight:500;white-space:nowrap;transition:color .15s,border-color .15s,background .15s;flex-shrink:0}#purpura-friends-manager-btn:hover{color:var(--pfm-btn-hover-text);border-color:var(--pfm-btn-hover-border);background:var(--pfm-btn-hover-bg)}#purpura-friends-manager-modal{position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.45);backdrop-filter:blur(16px);display:flex;align-items:center;justify-content:center;font-family:Inter,system-ui,-apple-system,sans-serif}.pfm-shell{width:880px;max-width:92vw;max-height:82vh;display:flex;flex-direction:column;background:var(--pfm-bg);backdrop-filter:blur(20px) saturate(180%);-webkit-backdrop-filter:blur(20px) saturate(180%);border:1px solid var(--pfm-border);border-radius:14px;box-shadow:0 24px 64px rgba(0,0,0,.4);overflow:hidden;color:var(--pfm-text)}.pfm-header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--pfm-border);background:var(--pfm-surface);flex-shrink:0}.pfm-title{font-size:14px;font-weight:600;color:var(--pfm-text);display:flex;align-items:center;gap:8px}.pfm-title svg{color:var(--pfm-accent)}.pfm-header-actions{display:flex;gap:4px}.pfm-icon-btn{width:30px;height:30px;border-radius:var(--pfm-radius);border:1px solid transparent;background:transparent;color:var(--pfm-muted);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.15s}.pfm-icon-btn:hover{color:var(--pfm-text);background:var(--pfm-surface-2);border-color:var(--pfm-border)}.pfm-icon-btn.pfm-close:hover{color:var(--pfm-danger);background:var(--pfm-danger-lo);border-color:var(--pfm-danger)}.pfm-tabs{display:flex;gap:0;border-bottom:1px solid var(--pfm-border);background:var(--pfm-surface);padding:0 18px;flex-shrink:0}.pfm-tab{display:flex;align-items:center;gap:6px;padding:10px 14px;border:none;border-bottom:2px solid transparent;margin-bottom:-1px;background:transparent;color:var(--pfm-muted);font-family:inherit;font-size:12px;font-weight:500;cursor:pointer;transition:.15s}.pfm-tab:hover{color:var(--pfm-text)}.pfm-tab.pfm-tab-active{color:var(--pfm-accent);border-bottom-color:var(--pfm-accent)}.pfm-tab-count{padding:1px 7px;border-radius:4px;background:var(--pfm-surface-2);font-size:10px;font-family:monospace;color:var(--pfm-muted);min-width:20px;text-align:center}.pfm-tab.pfm-tab-active .pfm-tab-count{background:var(--pfm-accent-lo);color:var(--pfm-accent)}.pfm-toolbar{display:flex;align-items:center;gap:8px;padding:10px 18px;border-bottom:1px solid var(--pfm-border);background:var(--pfm-bg);flex-shrink:0}.pfm-search-wrap{position:relative;flex:1;max-width:280px}.pfm-search-icon{position:absolute;left:9px;top:50%;transform:translateY(-50%);display:flex;color:var(--pfm-muted);pointer-events:none}.pfm-search{width:100%;padding:6px 9px 6px 32px;border-radius:6px;border:1px solid var(--pfm-border);background:var(--pfm-surface);color:var(--pfm-text);font-family:inherit;font-size:12px;outline:none;box-sizing:border-box;transition:border-color .15s}.pfm-search::placeholder{color:var(--pfm-dim)}.pfm-search:focus{border-color:var(--pfm-accent)}.pfm-toolbar-sep{width:1px;height:22px;background:var(--pfm-border);flex-shrink:0}.pfm-list-wrap{flex:1;min-height:0;overflow-y:auto;padding:12px 18px}.pfm-list-wrap::-webkit-scrollbar{width:5px}.pfm-list-wrap::-webkit-scrollbar-track{background:transparent}.pfm-list-wrap::-webkit-scrollbar-thumb{background:var(--pfm-dim);border-radius:3px}.pfm-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px}.pfm-card-label{display:flex;align-items:center;gap:8px;padding:8px;border-radius:var(--pfm-radius);border:1px solid var(--pfm-border);background:var(--pfm-surface);cursor:pointer;transition:.15s;user-select:none}.pfm-card-label:hover{border-color:var(--pfm-border-hi);background:var(--pfm-surface-2);transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.08)}.pfm-card-label.pfm-card-checked{border-color:var(--pfm-accent);background:var(--pfm-accent-lo)}.pfm-cb-wrap input{accent-color:var(--pfm-accent);cursor:pointer}.pfm-avatar{border-radius:50%;flex-shrink:0;background:var(--pfm-surface-2)}.pfm-card-info{min-width:0;flex:1}.pfm-display-name{font-size:12px;font-weight:600;color:var(--pfm-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pfm-username{font-size:10px;color:var(--pfm-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pfm-userid{font-size:9px;color:var(--pfm-dim);font-family:monospace;margin-top:1px}.pfm-footer{display:flex;align-items:center;justify-content:space-between;padding:10px 18px;border-top:1px solid var(--pfm-border);background:var(--pfm-surface);flex-shrink:0}.pfm-status{font-size:11px;color:var(--pfm-muted);font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pfm-footer-actions{display:flex;gap:6px}.pfm-action-btn{display:flex;align-items:center;gap:5px;padding:6px 12px;border-radius:6px;border:1px solid var(--pfm-border);background:var(--pfm-surface-2);color:var(--pfm-muted);font-family:inherit;font-size:11px;font-weight:500;cursor:pointer;transition:.15s;white-space:nowrap}.pfm-action-btn:hover{color:var(--pfm-accent);background:var(--pfm-accent-lo);border-color:var(--pfm-accent)}.pfm-action-btn.pfm-btn-danger:hover{color:var(--pfm-danger);background:var(--pfm-danger-lo);border-color:var(--pfm-danger)}.pfm-action-btn.pfm-btn-success:hover{color:var(--pfm-success);background:var(--pfm-success-lo);border-color:var(--pfm-success)}";
}
function s() {
a && a.disconnect();
a = new MutationObserver(function() {
var e = r();
e !== n && (n = e, o());
});
a.observe(document.documentElement, {
attributes: !0,
attributeFilter: [ "class", "data-theme" ]
}), document.body && a.observe(document.body, {
attributes: !0,
attributeFilter: [ "class", "data-theme" ]
});
}
const i = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 11C19.2091 11 21 9.20914 21 7C21 4.79086 19.2091 3 17 3C14.7909 3 13 4.79086 13 7C13 9.20914 14.7909 11 17 11Z"/><path d="M7 11C9.20914 11 11 9.20914 11 7C11 4.79086 9.20914 3 7 3C4.79086 3 3 4.79086 3 7C3 9.20914 4.79086 11 7 11Z"/><path d="M1 21C1 17.6863 3.68629 15 7 15H17C20.3137 15 23 17.6863 23 21"/></svg>', c = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>', d = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>', l = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>', p = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>', f = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>', u = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/><path d="M8 11c2.21 0 4-1.79 4-4S10.21 3 8 3 4 4.79 4 7s1.79 4 4 4z"/><path d="M2 21c0-3.31 2.69-6 6-6h8c3.31 0 6 2.69 6 6"/><line x1="10" y1="21" x2="14" y2="21"/></svg>', m = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>', b = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>', h = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>', g = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
function v() {
return document.querySelector("meta[name='csrf-token']")?.getAttribute("data-token") || "";
}
function x(e, t) {
const r = function() {
let e = document.getElementById("purpura-friends-tooltip");
return e || (e = document.createElement("div"), e.id = "purpura-friends-tooltip", 
document.body.appendChild(e), e);
}();
r.textContent = t;
const n = e.getBoundingClientRect();
r.style.left = `${n.left + n.width / 2}px`, r.style.top = n.top - 8 + "px", r.style.opacity = "1";
}
function y() {
const e = document.getElementById("purpura-friends-tooltip");
e && (e.style.opacity = "0");
}
function k(e = document) {
e.querySelectorAll("[data-tooltip]").forEach(e => {
e._tooltipAttached || (e._tooltipAttached = !0, e.addEventListener("mouseenter", () => x(e, e.getAttribute("data-tooltip") || "")), 
e.addEventListener("mouseleave", y));
});
}
function w(e, t = {}) {
return fetch(e, {
credentials: "include",
...t
}).then(e => e.ok ? e.json() : null).catch(() => null);
}
async function C(e) {
const t = [];
let r = "";
for (;;) {
const n = new URL(`https://friends.roblox.com/v1/users/${e}/friends`);
n.searchParams.set("limit", "100"), n.searchParams.set("sortOrder", "Asc"), r && n.searchParams.set("cursor", r);
const a = await w(n.href);
if (!a?.data?.length) break;
if (t.push(...a.data), !a.nextPageCursor) break;
r = a.nextPageCursor;
}
return t;
}
async function q(e) {
if (!e.length) return {};
const t = await w("https://users.roblox.com/v1/users", {
method: "POST",
headers: {
"Content-Type": "application/json",
"X-CSRF-Token": v()
},
body: JSON.stringify({
userIds: e
})
});
return (t?.data || []).reduce((e, t) => (e[t.id] = {
name: t.name,
displayName: t.displayName
}, e), {});
}
async function S(e) {
if (!e.length) return {};
const t = new URL("https://thumbnails.roblox.com/v1/users/avatar-headshot");
t.searchParams.set("userIds", e.join(",")), t.searchParams.set("size", "48x48"), 
t.searchParams.set("format", "Png"), t.searchParams.set("isCircular", "true");
const r = await w(t.href);
return (r?.data || []).reduce((e, t) => (e[t.targetId] = t.imageUrl, e), {});
}
async function $(e, t, r, n) {
const a = function(e) {
return Array.from(e.querySelectorAll("input[type=checkbox]:checked")).map(e => Number(e.dataset.rgUser));
}(r);
if (!a.length) return void (n.textContent = "> select at least one friend first");
n.textContent = `> ${e.toLowerCase()} ${a.length} friend(s)…`;
let o = v(), s = 0, i = 0;
for (let e of a) {
let n = !1;
for (let a = 0; a < 2 && !n; a++) {
const a = await fetch(`https://friends.roblox.com/v1/users/${e}/${t}`, {
method: "POST",
credentials: "include",
headers: {
"Content-Type": "application/json",
"X-CSRF-Token": o
}
}).catch(() => null);
if (a && a.ok) {
n = !0, s++, r.querySelector(`input[data-rg-user="${e}"]`)?.closest(".pfm-card")?.remove();
break;
}
if (403 !== a?.status) break;
o = a?.headers?.get("x-csrf-token") || document.querySelector("meta[name='csrf-token']")?.getAttribute("data-token") || o;
}
n || i++;
}
n.textContent = s && !i ? `> done -- ${s} succeeded` : s ? `> done -- ${s} ok, ${i} failed` : "> failed";
}
function L(e) {
return new Promise(t => setTimeout(t, e));
}
async function E(e, t, r, n) {
const a = function(e) {
return Array.from(e.querySelectorAll("input[type=checkbox]:checked")).map(e => ({
requestId: e.dataset.rgRequest,
userId: e.dataset.rgSender
}));
}(r);
if (!a.length) return void (n.textContent = "> select at least one request first");
n.textContent = `> ${e.toLowerCase()} ${a.length} request(s)…`;
let o = v();
let s = 0, i = 0;
for (const {requestId: e, userId: n} of a) {
const a = n || e;
if (!a) {
i++;
continue;
}
const c = `https://friends.roblox.com/v1/users/${a}/${t}-friend-request`;
let d = 0, l = !1;
for (;d < 5 && !l; ) {
const n = await fetch(c, {
method: "POST",
credentials: "include",
headers: {
"Content-Type": "application/json",
"X-CSRF-Token": o
}
}).catch(() => null);
if (n?.ok) {
l = !0, s++, r.querySelector(`input[data-rg-request="${e}"]`)?.closest(".pfm-card")?.remove();
break;
}
if (n?.status === 403) {
const e = n.headers.get("x-csrf-token");
if (e) o = e;
d++;
} else if (429 !== n?.status) {
if (d++, d < 4) {
const n = await fetch(`https://friends.roblox.com/v1/friend-requests/${e}/${t}`, {
method: "POST",
credentials: "include",
headers: {
"Content-Type": "application/json",
"X-CSRF-Token": o
}
}).catch(() => null);
if (n?.ok) {
l = !0, s++, r.querySelector(`input[data-rg-request="${e}"]`)?.closest(".pfm-card")?.remove();
break;
}
}
await L(120);
} else await L(300 * (d + 1)), d++;
}
l || i++, await L(100);
}
n.textContent = s && !i ? `> done -- ${s} succeeded` : s ? `> done -- ${s} ok, ${i} failed` : "> failed";
}
async function I() {
const e = [];
let t = "";
for (;;) {
const r = new URL("https://friends.roblox.com/v1/my/friends/requests");
r.searchParams.set("limit", "100"), t && r.searchParams.set("cursor", t);
const n = await w(r.href);
if (!n?.data?.length) break;
if (e.push(...n.data), !n.nextPageCursor) break;
t = n.nextPageCursor;
}
return e;
}
async function j(e, r, n) {
t();
const a = function() {
const e = document.getElementById("purpura-friends-manager-modal");
if (e) return e;
const t = document.createElement("div");
return t.id = "purpura-friends-manager-modal", t.innerHTML = `\n <div class="pfm-shell">\n <div class="pfm-header">\n <div class="pfm-title">\n <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>\n Friends Manager\n </div>\n <div class="pfm-header-actions">\n <button id="purpura-friends-manager-refresh" class="pfm-icon-btn" data-tooltip="Refresh">${d}</button>\n <button id="purpura-friends-manager-close" class="pfm-icon-btn pfm-close" data-tooltip="Close">${l}</button>\n </div>\n </div>\n\n <div class="pfm-tabs">\n <button id="purpura-friends-manager-tab-friends" class="pfm-tab pfm-tab-active">\n ${i} Friends <span class="pfm-tab-count" id="pfm-count-friends">--</span>\n </button>\n <button id="purpura-friends-manager-tab-requests" class="pfm-tab">\n ${c} Requests <span class="pfm-tab-count" id="pfm-count-requests">--</span>\n </button>\n </div>\n\n <div class="pfm-toolbar">\n <div class="pfm-search-wrap">\n <span class="pfm-search-icon">${g}</span>\n <input id="purpura-friends-manager-search" class="pfm-search" placeholder="Filter by name, username or ID…" />\n </div>\n <div class="pfm-toolbar-sep"></div>\n <button id="purpura-friends-manager-select-all" class="pfm-icon-btn" data-tooltip="Select all">${p}</button>\n <button id="purpura-friends-manager-deselect-all" class="pfm-icon-btn" data-tooltip="Deselect all">${f}</button>\n </div>\n\n <div class="pfm-list-wrap">\n <div id="purpura-friends-manager-list" class="pfm-list"></div>\n </div>\n\n <div class="pfm-footer">\n <div id="purpura-friends-manager-status" class="pfm-status"></div>\n <div class="pfm-footer-actions">\n <button id="purpura-friends-manager-action-1" class="pfm-action-btn"></button>\n <button id="purpura-friends-manager-action-2" class="pfm-action-btn pfm-btn-danger"></button>\n </div>\n </div>\n </div>\n `, 
document.body.appendChild(t), document.documentElement.style.overflow = "hidden", 
document.body.style.overflow = "hidden", document.body.style.overscrollBehavior = "none", 
(() => {
const e = () => {
const e = document.getElementById("purpura-friends-tooltip");
e && (e.style.opacity = "0", e.remove()), document.documentElement.style.overflow = "", 
document.body.style.overflow = "", document.body.style.overscrollBehavior = "", 
document.removeEventListener("keydown", r, !0), t.remove();
}, r = t => {
"Escape" === t.key && (t.preventDefault(), e());
};
document.addEventListener("keydown", r, !0), t.addEventListener("click", r => {
r.target === t && e();
}), t.querySelector("#purpura-friends-manager-close").onclick = e;
})(), t;
}(), o = a.querySelector("#purpura-friends-manager-list"), s = a.querySelector("#purpura-friends-manager-status"), v = a.querySelector("#purpura-friends-manager-tab-friends"), x = a.querySelector("#purpura-friends-manager-tab-requests"), y = a.querySelector("#purpura-friends-manager-action-1"), w = a.querySelector("#purpura-friends-manager-action-2"), L = a.querySelector("#purpura-friends-manager-search"), j = a.querySelector("#purpura-friends-manager-select-all"), M = a.querySelector("#purpura-friends-manager-deselect-all"), A = a.querySelector("#purpura-friends-manager-refresh"), B = a.querySelector("#pfm-count-friends"), P = a.querySelector("#pfm-count-requests");
B.textContent = r.length, P.textContent = n.length, k(a);
let T = "friends";
const R = {
list: r,
thumbs: {},
users: {}
}, N = {
list: n,
thumbs: {},
users: {}
}, z = () => {
const e = (L.value || "").trim().toLowerCase();
o.querySelectorAll(".pfm-card").forEach(t => {
t.style.display = !e || t.textContent.toLowerCase().includes(e) ? "" : "none";
});
}, H = e => {
o.querySelectorAll(".pfm-card").forEach(t => {
if ("none" === t.style.display) return;
const r = t.querySelector("input[type=checkbox]");
r && (r.checked = e, t.classList.toggle("pfm-card-checked", e));
});
};
A.onclick = async () => {
s.textContent = "> refreshing…";
const [t, r] = await Promise.all([ C(e), I() ]);
R.list = t, N.list = r, B.textContent = t.length, P.textContent = r.length, D();
}, L.oninput = z, j.onclick = () => H(!0), M.onclick = () => H(!1);
var O = e;
const U = e => {
T = e, v.classList.toggle("pfm-tab-active", "friends" === e), x.classList.toggle("pfm-tab-active", "requests" === e), 
D();
}, D = async () => {
if (o.innerHTML = "", s.textContent = "> loading…", "friends" === T) {
const e = R.list.map(e => e.id);
const t = e.filter(e => !(e in R.users || e in N.users || e in R.thumbs));
if (t.length) {
const [e, r] = await Promise.all([ S(t), q(t) ]);
Object.assign(R.thumbs, e);
Object.assign(R.users, r);
}
R.list.length ? R.list.forEach(e => o.appendChild(function(e, t, r) {
const n = r?.displayName || e.displayName || e.name || "Unknown", a = r?.name || e.name || n || "unknown", o = document.createElement("div");
o.className = "pfm-card", o.innerHTML = `\n <label class="pfm-card-label">\n <div class="pfm-cb-wrap"><input type="checkbox" data-rg-user="${e.id}"></div>\n <img class="pfm-avatar" src="${t || "https://www.roblox.com/assets/thumbnail-defaults/default_avatar-7bfbc0c323e67e3d.png"}" width="38" height="38">\n <div class="pfm-card-info">\n <div class="pfm-display-name">${n}</div>\n <div class="pfm-username">@${a}</div>\n <div class="pfm-userid">${e.id}</div>\n </div>\n </label>\n `;
const s = o.querySelector("input");
return o.addEventListener("click", e => {
e.preventDefault(), s.checked = !s.checked, o.classList.toggle("pfm-card-checked", s.checked);
}), s.addEventListener("change", () => o.classList.toggle("pfm-card-checked", s.checked)), 
o;
}(e, R.thumbs[e.id], R.users[e.id]))) : o.innerHTML = '<div class="pfm-empty">No friends found</div>', 
y.innerHTML = `${u} Unfriend`, y.setAttribute("data-tooltip", "Unfriend selected users"), 
w.innerHTML = `${m} Block`, w.setAttribute("data-tooltip", "Block selected users"), 
y.onclick = async () => {
await $("Unfriending", "unfriend", o, s);
var e = await C(O);
R.list = e;
B.textContent = e.length;
D();
}, w.onclick = async () => {
await $("Blocking", "block", o, s);
var e = await C(O);
R.list = e;
B.textContent = e.length;
D();
};
} else {
const e = N.list.map(e => e.friendRequest?.senderId || e.senderId).filter(Boolean);
const t = e.filter(e => !(e in N.users || e in R.users || e in N.thumbs));
if (t.length) {
const [e, r] = await Promise.all([ S(t), q(t) ]);
Object.assign(N.thumbs, e);
Object.assign(N.users, r);
}
N.list.length ? N.list.forEach(e => {
const t = e.friendRequest?.senderId || e.senderId;
o.appendChild(function(e, t, r) {
const n = e.id || e.requestId || e.friendRequest?.id || "", a = e.friendRequest?.senderId || e.senderId || "", o = r?.displayName || e.friendRequest?.senderDisplayName || e.senderDisplayName || "Unknown", s = r?.name || e.friendRequest?.senderUsername || e.senderUsername || o || "unknown", i = document.createElement("div");
i.className = "pfm-card", i.innerHTML = `\n <label class="pfm-card-label">\n <div class="pfm-cb-wrap"><input type="checkbox" data-rg-request="${n}" data-rg-sender="${a}"></div>\n <img class="pfm-avatar" src="${t || "https://www.roblox.com/assets/thumbnail-defaults/default_avatar-7bfbc0c323e67e3d.png"}" width="38" height="38">\n <div class="pfm-card-info">\n <div class="pfm-display-name">${o}</div>\n <div class="pfm-username">@${s}</div>\n <div class="pfm-userid">${a}</div>\n </div>\n </label>\n `;
const c = i.querySelector("input");
return i.addEventListener("click", e => {
e.preventDefault(), c.checked = !c.checked, i.classList.toggle("pfm-card-checked", c.checked);
}), c.addEventListener("change", () => i.classList.toggle("pfm-card-checked", c.checked)), 
i;
}(e, N.thumbs[t], N.users[t]));
}) : o.innerHTML = '<div class="pfm-empty">No pending requests</div>', y.innerHTML = `${b} Accept`, 
y.setAttribute("data-tooltip", "Accept selected requests"), w.innerHTML = `${h} Decline`, 
w.setAttribute("data-tooltip", "Decline selected requests"), y.onclick = async () => {
var e = Array.from(o.querySelectorAll("input[type=checkbox]:checked")).map(function(e) {
return {
requestId: e.dataset.rgRequest,
userId: e.dataset.rgSender
};
});
await E("Accepting", "accept", o, s);
for (var t = 0; t < e.length; t++) {
var r = e[t];
var n = r.userId;
var a = o.querySelector('input[data-rg-request="' + r.requestId + '"]')?.closest(".pfm-card");
if (!n || a) continue;
var i = N.users[n];
var c = N.thumbs[n];
if (i) {
R.users[n] = i;
R.thumbs[n] = c || null;
var d = {
id: Number(n),
name: i.name,
displayName: i.displayName
};
R.list.push(d);
N.list = N.list.filter(function(e) {
var t = e.friendRequest ? e.friendRequest.senderId : e.senderId;
return String(t) !== String(n);
});
}
}
B.textContent = R.list.length;
P.textContent = N.list.length;
D();
}, w.onclick = async () => {
await E("Declining", "decline", o, s);
var e = await I();
N.list = e;
P.textContent = e.length;
D();
};
}
w.className = "pfm-action-btn pfm-btn-danger", k(a), z(), s.textContent = "";
};
v.onclick = () => U("friends"), x.onclick = () => U("requests"), U("friends");
}
async function M() {
var e = location.hostname;
if (!((/\.roblox\.com$/i.test(e) || "roblox.com" === e) && /\/users\/.*\/friends/i.test(location.pathname))) return;
if (document.getElementById("purpura-friends-manager-btn")) return;
t();
var r = document.querySelector(".chip-filters-container");
if (!r) return;
var n = document.createElement("button");
n.id = "purpura-friends-manager-btn", n.setAttribute("data-tooltip", "Open Friends Manager"), 
n.innerHTML = i + " Manager";
n.onclick = async function() {
try {
var e = await fetch("https://users.roblox.com/v1/users/authenticated", {
credentials: "include"
}).then(function(e) {
return e.ok ? e.json() : null;
}).then(function(e) {
return e && e.id ? String(e.id) : null;
}).catch(function() {
return null;
});
if (!e) return;
var t = await Promise.all([ C(e), I() ]);
await j(e, t[0], t[1]);
} catch (t) {}
};
r.insertAdjacentElement("afterend", n);
k(n);
}
var A;
A || (A = window.__PurpuraSettings.ready.then(function() {
return window.__PurpuraSettings.get("fm") === !0;
}));
!async function() {
if (!1 === await A) return;
if (!((/\.roblox\.com$/i.test(location.hostname) || "roblox.com" === location.hostname) && /\/users\/.*\/friends/i.test(location.pathname))) return;
new MutationObserver(M).observe(document, {
childList: !0,
subtree: !0
}), setTimeout(M, 500);
}();
}();
