/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
if (window.__pgx0) return;
window.__pgx0 = 1;
const e = /^(?:\/[a-z]{2}(?:-[a-z]{2})?)?\/banned-users\/(\d+)\/profile/i;
const t = "ghost-profile-native-style";
const r = "purpura-ghost-pre-mask";
const n = {
"&": "&amp;",
"<": "&lt;",
">": "&gt;",
'"': "&quot;",
"'": "&#39;"
};
const o = chrome.runtime.getURL("images/roblox.svg");
let a = false;
let i = false;
let s = "";
let l = 0;
let c = 0;
let d = "";
let p = "";
let u = false;
const m = e => String(e ?? "").replace(/[&<>"']/g, e => n[e]);
const f = e => Number.isFinite(Number(e)) ? Number(e) : 0;
const g = e => f(e).toLocaleString();
const h = e => {
const t = String(e ?? "").trim();
if (!t) return "";
const r = Date.parse(t);
if (!Number.isFinite(r)) return "";
return new Date(r).toLocaleDateString(undefined, {
year: "numeric",
month: "long",
day: "numeric"
});
};
const b = () => {
const t = window.location.pathname || "";
return e.test(t) || t.includes("/request-error");
};
const y = () => {
if (!b()) return;
if (document.getElementById(r)) return;
const e = document.createElement("style");
e.id = r;
e.textContent = ".error-page-container,.request-error-page,.request-error-page-content{opacity:0 !important;pointer-events:none !important}";
(document.head || document.documentElement).appendChild(e);
window.setTimeout(() => {
const e = document.getElementById(r);
if (e) e.remove();
}, 5e3);
};
const v = () => {
const e = document.getElementById(r);
if (e) e.remove();
};
const x = () => {
if (u) return;
u = true;
try {
const e = document.querySelector('meta[name="csrf-token"], meta[name="x-csrf-token"]')?.content;
const t = document.querySelector('meta[name="x-bound-auth-token"], meta[name="bound-auth-token"]')?.content;
if (typeof e === "string" && e.trim()) d = e.trim();
if (typeof t === "string" && t.trim()) p = t.trim();
const r = [ "rbxBoundAuthToken", "x-bound-auth-token", "boundAuthToken", "csrf-token", "x-csrf-token" ];
r.forEach(e => {
try {
const t = window.localStorage?.getItem(e) || window.sessionStorage?.getItem(e) || "";
if (!t || typeof t !== "string" || !t.trim()) return;
if (e.toLowerCase().includes("csrf")) {
if (!d) d = t.trim();
} else if (!p) {
p = t.trim();
}
} catch {}
});
} catch {}
};
const w = e => new Promise(t => {
try {
chrome.runtime.sendMessage(e, e => {
if (chrome.runtime.lastError) {
t({
ok: false,
status: 0,
contentType: "",
text: ""
});
return;
}
t(e && typeof e === "object" ? e : {
ok: false,
status: 0,
contentType: "",
text: ""
});
});
} catch {
t({
ok: false,
status: 0,
contentType: "",
text: ""
});
}
});
const A = async (e, t = "GET", r = null, n = null) => {
x();
const o = String(t || "GET").toUpperCase();
const a = typeof r === "string" ? r : r ? JSON.stringify(r) : "";
const i = () => w({
type: "PURPURA_FETCH_RESOURCE_REQUEST",
url: e,
method: o,
body: a,
accept: "application/json, text/plain;q=0.9, */*;q=0.8",
csrfToken: o !== "GET" ? d : "",
boundAuthToken: p,
headers: n && typeof n === "object" ? n : {}
});
try {
let e = await i();
if (e && typeof e.csrfToken === "string" && e.csrfToken) d = e.csrfToken;
if (e && typeof e.boundAuthToken === "string" && e.boundAuthToken) p = e.boundAuthToken;
if ((!e || !e.ok) && e && e.status === 403 && o !== "GET" && d) {
e = await i();
if (e && typeof e.csrfToken === "string" && e.csrfToken) d = e.csrfToken;
if (e && typeof e.boundAuthToken === "string" && e.boundAuthToken) p = e.boundAuthToken;
}
const t = typeof e?.text === "string" ? e.text : "";
let r = null;
try {
r = t ? JSON.parse(t) : null;
} catch {}
return {
ok: !!e?.ok,
status: Number(e?.status) || 0,
json: r,
text: t
};
} catch {
return {
ok: false,
status: 0,
json: null,
text: ""
};
}
};
const j = e => new Promise(t => setTimeout(t, e));
const k = e => typeof e === "string" ? e.trim() : "";
const $ = e => {
const t = Number(e?.status) || 0;
if (t === 401 || t === 403) return true;
const r = /unauth|forbidden|invalid|obstruct|revok|denied|expired|api[ -]?key/i;
const n = e && e.json && typeof e.json === "object" ? e.json : null;
if (n) {
const e = [ n.code, n.error, n.message, n.title ];
for (const t of e) {
const e = k(String(t ?? ""));
if (e && r.test(e)) return true;
}
if (Array.isArray(n.errors)) {
for (const e of n.errors) {
const t = k(String(e && e.message ? e.message : ""));
if (t && r.test(t)) return true;
}
}
}
const o = k(e && typeof e.text === "string" ? e.text : "");
return !!(o && r.test(o));
};
async function T(e = false) {
return await new Promise(t => {
try {
chrome.runtime.sendMessage({
action: "purpuraEnsureStudioApiKey",
forceRefresh: e === true
}, e => {
if (chrome.runtime.lastError || !e || e.ok !== true || typeof e.apiKey !== "string" || !e.apiKey) {
t("");
return;
}
t(e.apiKey);
});
} catch {
t("");
}
});
}
async function I() {
await new Promise(e => {
try {
chrome.runtime.sendMessage({
action: "purpuraInvalidateStudioApiKey"
}, () => e(true));
} catch {
e(true);
}
});
}
const U = e => {
const t = e && e.json && Array.isArray(e.json.data) ? e.json.data[0] : null;
if (!t) return null;
return {
state: typeof t.state === "string" ? t.state : "Unknown",
imageUrl: typeof t.imageUrl === "string" ? t.imageUrl : "",
targetId: t.targetId
};
};
async function C(e, t = 3, r = 250) {
let n = null;
for (let o = 0; o < t; o++) {
let a = false;
for (const t of e) {
const e = await A(t);
const r = U(e);
if (!r) continue;
if (r.state === "Completed" && r.imageUrl) return r;
if ((r.state === "Pending" || r.state === "InReview") && !n) n = r; else if (!n) n = r;
if (r.state === "Pending" || r.state === "InReview") a = true;
}
if (o < t - 1 && (a || !n)) await j(r);
}
return n || {
state: "Blocked",
imageUrl: "",
targetId: null
};
}
const E = e => e ? e.replace(/AvatarHeadshot/g, "Avatar").replace(/150\/150/g, "420/420").replace(/\/Png\/?$/, "/Png/noFilter").replace(/\/isCircular$/, "/noFilter") : "";
function S(e) {
return [ `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${e}&size=352x352&format=Png&returnPolicy=PlaceHolder&isCircular=false`, `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${e}&size=150x150&format=Png&returnPolicy=PlaceHolder&isCircular=false` ];
}
function P(e) {
return [ `https://thumbnails.roblox.com/v1/users/avatar?userIds=${e}&size=720x720&format=Png&isCircular=false`, `https://thumbnails.roblox.com/v1/users/avatar?userIds=${e}&size=420x420&format=Png&isCircular=false` ];
}
async function N(e) {
let t = await T();
if (!t) return {
targetId: e,
state: "Blocked",
imageUrl: "",
thumbnailType: "AvatarHeadshot"
};
let r = false;
for (let n = 0; n < 4; n++) {
try {
const o = await A(`https://apis.roblox.com/cloud/v2/users/${e}:generateThumbnail`, `GET`, null, {
"x-api-key": t
});
const a = o && o.json ? o.json : null;
if (o.ok && a && a.done && a.response && a.response.imageUri) {
return {
targetId: e,
state: "Completed",
imageUrl: a.response.imageUri,
thumbnailType: "AvatarHeadshot"
};
}
if ($(o)) {
await I();
if (r) break;
t = await T(true);
r = true;
if (!t) break;
continue;
}
if (o.ok && a && a.done === false && n < 3) {
await j(900);
continue;
}
} catch {}
break;
}
return {
targetId: e,
state: "Blocked",
imageUrl: "",
thumbnailType: "AvatarHeadshot"
};
}
async function L(e) {
const t = await C(S(e), 4, 450);
if (t && t.state === "Completed" && t.imageUrl) {
return {
targetId: e,
state: "Completed",
imageUrl: t.imageUrl,
thumbnailType: "AvatarHeadshot"
};
}
const r = await N(e);
if (r && r.state === "Completed" && r.imageUrl) {
return r;
}
const n = await M(e);
if (n && n.state === "Completed" && n.imageUrl) {
return n;
}
const o = await C(P(e), 2, 300);
if (o && o.state === "Completed" && o.imageUrl) {
return {
targetId: e,
state: "Completed",
imageUrl: o.imageUrl,
thumbnailType: "AvatarHeadshotFallback"
};
}
return {
targetId: e,
state: "Blocked",
imageUrl: "",
thumbnailType: "AvatarHeadshot"
};
}
async function M(e) {
let t = [];
try {
const r = await A(`https://avatar.roblox.com/v2/avatar/users/${e}/avatar`);
const n = Array.isArray(r?.json?.assets) ? r.json.assets : [];
const o = new Set([ 17, 18, 79 ]);
const a = n.map(e => ({
id: Number(e?.id),
type: Number(e?.assetType?.id ?? e?.assetType)
})).filter(e => Number.isFinite(e.id) && e.id > 0);
const i = a.filter(e => o.has(e.type)).map(e => e.id);
t = [ ...new Set(i) ].slice(0, 8);
} catch {}
if (!t.length) return {
targetId: e,
state: "Blocked",
imageUrl: "",
thumbnailType: "AvatarAsset"
};
try {
const r = await A(`https://thumbnails.roblox.com/v1/assets?assetIds=${t.join(",")}&size=150x150&format=Png&returnPolicy=PlaceHolder`);
const n = Array.isArray(r?.json?.data) ? r.json.data : [];
const o = new Map;
n.forEach(e => {
if (e && e.targetId != null) o.set(String(e.targetId), e);
});
for (const r of t) {
const t = o.get(String(r));
if (t && t.state === "Completed" && typeof t.imageUrl === "string" && t.imageUrl) {
return {
targetId: e,
state: "Completed",
imageUrl: t.imageUrl,
thumbnailType: "AvatarAsset"
};
}
}
} catch {}
return {
targetId: e,
state: "Blocked",
imageUrl: "",
thumbnailType: "AvatarAsset"
};
}
function B(e) {
return {
state: "Pending",
thumbnailType: "Avatar",
finalUpdate: (async () => {
try {
const t = await A(`https://avatar.roblox.com/v2/avatar/users/${e}/avatar`);
if (t.ok && t.json) {
const e = t.json;
const r = {
thumbnailConfig: {
thumbnailId: 1,
thumbnailType: "2d",
size: "420x420"
},
avatarDefinition: {
assets: (Array.isArray(e.assets) ? e.assets : []).map(e => ({
id: e.id,
name: e.name,
assetType: e.assetType,
currentVersionId: e.currentVersionId
})),
bodyColors: {
headColor: e.bodyColor3s?.headColor3,
torsoColor: e.bodyColor3s?.torsoColor3,
rightArmColor: e.bodyColor3s?.rightArmColor3,
leftArmColor: e.bodyColor3s?.leftArmColor3,
rightLegColor: e.bodyColor3s?.rightLegColor3,
leftLegColor: e.bodyColor3s?.leftLegColor3
},
scales: e.scales,
playerAvatarType: {
playerAvatarType: e.playerAvatarType
}
}
};
const n = await A("https://avatar.roblox.com/v1/avatar/render", "POST", r);
if (n.ok && n.json && typeof n.json.imageUrl === "string" && n.json.imageUrl) {
return {
state: "Completed",
imageUrl: n.json.imageUrl,
thumbnailType: "Avatar"
};
}
}
const r = await C(P(e), 2);
if (r && r.state === "Completed" && r.imageUrl) {
return {
state: "Completed",
imageUrl: r.imageUrl,
thumbnailType: "Avatar"
};
}
const n = await N(e);
if (n && n.state === "Completed" && n.imageUrl) {
return {
state: "Completed",
imageUrl: E(n.imageUrl) || n.imageUrl,
thumbnailType: "Avatar"
};
}
} catch {}
return null;
})()
};
}
const H = () => window.__PurpuraSettings.ready.then(function() {
var e = window.__PurpuraSettings.get("ghos");
if (typeof e === "boolean") {
return {
enabled: e,
webRequestPermission: false
};
}
if (e && typeof e === "object") {
return {
enabled: e.enabled !== false,
webRequestPermission: e.webRequestPermission === true
};
}
return {
enabled: true,
webRequestPermission: false
};
});
const R = () => new Promise(e => chrome.runtime.sendMessage({
action: "checkWebRequestPermission"
}, t => e(!!(t && t.has))));
const F = () => new Promise(e => chrome.runtime.sendMessage({
action: "getGhostProfileRedirect"
}, t => e(t && t.userId ? String(t.userId) : null)));
function _() {
const e = document.getElementById(`${t}-extra`);
if (e) e.remove();
let r = document.getElementById(t);
if (!r) {
r = document.createElement("style");
r.id = t;
(document.head || document.documentElement).appendChild(r);
}
r.textContent = ".ghost-profile-loading{display:flex;justify-content:center;align-items:center;height:400px}.profile-platform-container .profile-tabs{border-bottom:1px solid var(--purpura-border-color,rgba(255,255,255,.16));margin-bottom:24px}.profile-platform-container .profile-tab{display:flex;justify-content:center;align-items:center;padding:12px 0;color:var(--purpura-gray-text-color,#9ea6b3) !important;text-decoration:none;border-bottom:.5px solid rgba(0,0,0,0);transition:color .18s ease,border-color .18s ease,padding .18s ease}.profile-platform-container .profile-tab:hover{color:var(--purpura-main-text-color,#fff) !important;box-shadow:none;border-bottom:.5px solid var(--purpura-main-text-color,#fff)}.profile-platform-container .profile-tab.active{color:var(--purpura-main-text-color,#fff) !important;box-shadow:none;border-bottom:3px solid var(--purpura-main-text-color,#fff);padding-bottom:9.5px}.profile-platform-container .tab-pane{display:none !important}.profile-platform-container .tab-pane.active{display:block !important}.profile-platform-container .profile-tab-content-wrapper>.tab-pane{display:none}.profile-platform-container .profile-tab-content-wrapper>.tab-pane.active{display:block}.ghost-stat-placeholder{width:60px;height:20px;border-radius:10px;display:inline-block;vertical-align:middle}#content.content{background:none !important;background-color:rgba(0,0,0,0) !important}.ghost-scroll-btn{position:absolute;z-index:10;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.6) !important;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;color:#fff;opacity:1;transition:opacity .25s ease;pointer-events:auto}.ghost-scroll-btn.left{left:5px}.ghost-scroll-btn.right{right:5px}.ghost-scroll-btn.ghost-btn-disabled{opacity:.25 !important;cursor:default;pointer-events:auto}";
let n = document.getElementById(`${t}-cards`);
if (!n) {
n = document.createElement("style");
n.id = `${t}-cards`;
(document.head || document.documentElement).appendChild(n);
}
n.textContent = ".ghost-item-card{text-align:left;width:100% !important;height:100%}.ghost-item-card-link{text-decoration:none;color:inherit}.ghost-item-thumb-container{position:relative;background-color:var(--purpura-button-background-color,rgba(208,217,251,.12));background-image:linear-gradient(180deg,rgba(255,255,255,.06),rgba(0,0,0,.08));border-radius:8px;aspect-ratio:1/1;margin-bottom:8px;overflow:hidden}.ghost-item-thumb{width:100% !important;height:100% !important;object-fit:contain;border-radius:8px;padding:8px;display:block}.ghost-item-name{font-size:14px;font-weight:500;color:var(--purpura-main-text-color,#f7f7f8);display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;word-break:break-word;min-height:2.6em;line-height:1.3}.ghost-item-rap{font-size:12px;font-weight:600;color:var(--purpura-secondary-text-color,#d5d7dd);display:flex;align-items:center;height:20px;gap:4px}.ghost-item-rap .icon-robux-16x16{margin-right:2px;flex-shrink:0}.ghost-item-thumb-container .icon-label{position:absolute;bottom:-1px;left:-1px;z-index:2}";
}
function z() {
return document.getElementById("content") || document.querySelector("#container-main .content") || document.body;
}
function q(e) {
if (!e) return;
e.setAttribute("data-purpura-ghost-profile", "1");
e.innerHTML = '<div class="ghost-profile-loading"><div class="spinner spinner-default"></div></div>';
}
function D(e, t) {
const r = document.getElementById(e);
if (!r) return;
r.textContent = g(t);
r.classList.remove("shimmer", "ghost-stat-placeholder");
}
function O(e, t, r, n, o = "") {
const a = String(o || "").trim();
const i = /^\d[\d,]*\s*R\$$/.test(a);
const s = i ? a.replace(/\s*R\$$/, "") : a;
const l = a ? `<div class="ghost-item-rap">${i ? `<span class="icon-robux-16x16"></span><span>${m(s)}</span>` : `<span>${m(a)}</span>`}</div>` : "";
return `<div class="css-nhhfrx-carouselItem" data-purpura-item="${m(e)}" style="width:150px;flex-shrink:0;"><div class="ghost-item-card"><a class="ghost-item-card-link" href="${r}"><div class="ghost-item-thumb-container"><span class="thumbnail-2d-container radius-medium" style="width:100%;height:100%;display:block;background:var(--purpura-button-background-color,rgba(208,217,251,.12));border-radius:8px;overflow:hidden;">${n ? `<img class="ghost-item-thumb" src="${m(n)}" alt="${m(t)}">` : ""}</span></div><div class="ghost-item-name">${m(t)}</div>${l}</a></div></div>`;
}
function V(e, t, r, n, o = "") {
return `<li class="list-item game-card game-tile" data-purpura-item="${m(e)}"><a class="game-card-link" href="${r}"><div class="game-card-thumb-container"><span class="thumbnail-2d-container" style="width:100%;height:100%;display:block;overflow:hidden;border-radius:8px;background:var(--purpura-button-background-color);">${n ? `<img class="game-card-thumb" src="${m(n)}" alt="${m(t)}" style="width:100%;height:100%;object-fit:cover;display:block;">` : ""}</span></div><div class="game-card-name" title="${m(t)}">${m(t)}</div><div class="game-card-info"><span class="info-label icon-playing-counts-gray"></span><span class="info-label playing-counts-label">${m(o)}</span></div></a></li>`;
}
function G(e, t, r) {
if (!e) return;
let n = false;
e.addEventListener("error", () => {
if (!n && t) {
n = true;
e.src = t;
return;
}
if (typeof r === "function") r();
});
}
function J(t) {
const r = z();
if (!r) return;
v();
_();
r.setAttribute("data-purpura-ghost-profile", "1");
const n = h(t.created);
const o = m((t.displayName || "?").charAt(0).toUpperCase() || "?");
document.title = `${t.displayName} (@${t.name}) - Roblox`;
if (!e.test(window.location.pathname)) {
window.history.replaceState({}, "", `/banned-users/${t.id}/profile`);
}
r.innerHTML = `<div class="profile-platform-container" data-profile-type="User" data-profile-id="${t.id}" data-purpura-ghost-profile="1" style="width:970px;margin:0 auto;">\n            <div class="sg-system-feedback"><div class="alert-system-feedback"><div class="alert"><span class="alert-content"></span></div></div></div>\n\n            <div class="relative flex flex-col items-center" style="height:300px;width:100%;">\n                <div class="profile-avatar-gradient" style="width:100%;height:300px;">\n                    <div style="background:var(--purpura-profile-main-gradient,linear-gradient(180deg,#2f3b56 0%,#1b2333 100%));width:100vw;margin-left:calc(50% - 50vw);height:300px;margin-top:-24px;position:relative;background-color:var(--purpura-profile-header-bg,#1b2333);padding:0 12px;"></div>\n                    <div class="cover-gradient-overlay" style="position:absolute;bottom:0;width:100vw;margin-left:calc(50% - 50vw);left:0;height:64px;z-index:10;pointer-events:none;mask-image:linear-gradient(rgba(255,255,255,0) 0%, rgba(255,255,255,.5) 40%, rgba(255,255,255,.8) 60%, #fff 100%);background:var(--purpura-profile-overlay-gradient,transparent);"></div>\n                </div>\n                <div class="thumbnail-holder" style="position:absolute;top:-25px;left:0;right:0;bottom:0;z-index:1;display:flex;justify-content:center;align-items:center;pointer-events:none;overflow:hidden;height:300px;">\n                    <div class="thumbnail-3d-container" style="width:100%;height:100%;display:flex;justify-content:center;align-items:center;">\n                        <div id="ghost-profile-avatar-wrapper" class="avatar-thumbnail-container" style="display:flex;justify-content:center;align-items:center;width:100%;height:100%;max-width:100%;max-height:100%;"></div>\n                    </div>\n                </div>\n            </div>\n\n            <div style="width:100%;position:relative;margin-top:-64px;z-index:20;">\n                <div id="user-profile-header-bg" style="max-width:1140px;margin:0 auto;">\n                    <div class="user-profile-header flex flex-col gap-large" style="padding:0 15px;">\n                        <div class="user-profile-header-info flex justify-between items-center">\n                            <div class="flex gap-medium items-center min-width-0">\n                                <div id="ghost-profile-avatar-container" class="user-profile-header-details-avatar-container avatar-headshot-lg" style="width:120px;height:120px;min-width:120px;">\n                                    <div class="avatar avatar-card-fullbody">\n                                        <div id="ghost-profile-headshot-placeholder"></div>\n                                        <div class="avatar-status"><span data-testid="presence-icon" class="offline icon-offline" title="Banned User"></span></div>\n                                    </div>\n                                </div>\n                                <div class="flex flex-col min-width-0">\n                                    <span class="items-center gap-xsmall flex min-width-0"><span id="profile-header-title-container-name" class="text-heading-large min-width-0 text-truncate-end text-no-wrap">${m(t.displayName)}${t.isVerified ? '<span style="font-size:14px;margin-left:6px;color:var(--purpura-playbutton-color,var(--purpura-main-text-color));">&#10003;</span>' : ""}</span></span>\n                                    <div class="min-width-0"><span class="stylistic-alts-username text-truncate-end text-no-wrap block">@${m(t.name)}</span></div>\n                                </div>\n                            </div>\n                        </div>\n\n                        <div id="ghost-profile-stat-pills" class="flex-nowrap gap-small flex">\n                            <a href="/users/${t.id}/friends#!/friends" class="relative clip group/interactable focus-visible:outline-focus cursor-pointer relative flex justify-center items-center radius-circle stroke-none padding-left-medium padding-right-medium height-800 text-label-medium bg-shift-300 content-action-utility" style="text-decoration:none;"><div role="presentation" class="absolute inset-[0] transition-colors group-hover/interactable:bg-[var(--color-state-hover)] group-active/interactable:bg-[var(--color-state-press)]"></div><span class="padding-y-xsmall text-no-wrap text-truncate-end"><span id="ghost-profile-friends-count" class="shimmer ghost-stat-placeholder"></span> Connections</span></a>\n                            <a href="/users/${t.id}/friends#!/followers" class="relative clip group/interactable focus-visible:outline-focus cursor-pointer relative flex justify-center items-center radius-circle stroke-none padding-left-medium padding-right-medium height-800 text-label-medium bg-shift-300 content-action-utility" style="text-decoration:none;"><div role="presentation" class="absolute inset-[0] transition-colors group-hover/interactable:bg-[var(--color-state-hover)] group-active/interactable:bg-[var(--color-state-press)]"></div><span class="padding-y-xsmall text-no-wrap text-truncate-end"><span id="ghost-profile-followers-count" class="shimmer ghost-stat-placeholder"></span> Followers</span></a>\n                            <a href="/users/${t.id}/friends#!/following" class="relative clip group/interactable focus-visible:outline-focus cursor-pointer relative flex justify-center items-center radius-circle stroke-none padding-left-medium padding-right-medium height-800 text-label-medium bg-shift-300 content-action-utility" style="text-decoration:none;"><div role="presentation" class="absolute inset-[0] transition-colors group-hover/interactable:bg-[var(--color-state-hover)] group-active/interactable:bg-[var(--color-state-press)]"></div><span class="padding-y-xsmall text-no-wrap text-truncate-end"><span id="ghost-profile-following-count" class="shimmer ghost-stat-placeholder"></span> Following</span></a>\n                        </div>\n\n                        <div><pre class="content-default text-body-medium description-content" style="white-space:pre-wrap;word-break:break-word;">${m(t.description || "")}</pre></div>\n                        ${n ? `<div id="ghost-profile-join-date" class="content-default text-body-medium" style="margin-top:4px;display:flex;gap:4px;align-items:center;"><span style="color:var(--purpura-main-text-color);">Joined:</span><span>${m(n)}</span></div>` : ""}\n                    </div>\n                </div>\n            </div>\n\n            <div style="max-width:1140px;margin:0 auto;padding:0 15px;">\n                <ul class="profile-tabs flex">\n                    <li class="justify-center flex fill"><a id="ghost-profile-tab-about-link" href="#ghost-profile-about-content" class="profile-tab active justify-center text-label-medium flex fill">About</a></li>\n                    <li class="justify-center flex fill"><a id="ghost-profile-tab-creations-link" href="#ghost-profile-creations-content" class="profile-tab justify-center text-label-medium flex fill">Creations</a></li>\n                </ul>\n                <div class="profile-tab-content-wrapper padding-top-xxlarge">\n                    <div id="ghost-profile-about-content" class="tab-pane active">\n                        <div id="ghost-profile-sections-container">\n                            <div id="ghost-profile-wearing-container"></div>\n                            <div id="ghost-profile-store-container"></div>\n                            <div id="ghost-profile-favorites-container"></div>\n                            <div id="ghost-profile-friends-container"></div>\n                            <div id="ghost-profile-groups-container"></div>\n                            <div id="ghost-profile-badges-container"></div>\n                        </div>\n                    </div>\n                    <div id="ghost-profile-creations-content" class="tab-pane">\n                        <div class="profile-game section container-list"><div class="container-header"><h3>Experiences</h3></div><div class="game-grid"><ul id="ghost-profile-creations-list" class="hlist game-cards" style="display:flex;flex-wrap:wrap;gap:12px;list-style:none;padding:0;"></ul></div></div>\n                    </div>\n                </div>\n            </div>\n        </div>`;
const a = r.querySelectorAll(".profile-tab");
const i = r.querySelectorAll(".tab-pane");
a.forEach(e => e.addEventListener("click", t => {
t.preventDefault();
const r = (e.getAttribute("href") || "").replace("#", "");
a.forEach(e => e.classList.remove("active"));
i.forEach(e => {
e.classList.remove("active");
e.style.display = "none";
});
e.classList.add("active");
const n = document.getElementById(r);
if (n) {
n.classList.add("active");
n.style.display = "block";
}
}));
const s = document.getElementById("ghost-profile-headshot-placeholder");
const l = document.getElementById("ghost-profile-avatar-wrapper");
const c = E;
const d = (e, t = false) => {
if (!s) return null;
s.innerHTML = `<span class="thumbnail-2d-container avatar-card-image" style="width:120px;height:120px;display:block;overflow:hidden;border-radius:50%;background:var(--purpura-button-background-color);"><img src="${m(e || "")}" alt="${o}" style="width:100%;height:100%;object-fit:cover;${t ? "object-position:center 20%;" : ""}display:block;"></span>`;
return s.querySelector("img");
};
const p = e => {
if (!l) return null;
l.innerHTML = `<img id="pg_avatar_big_img" src="${m(e || "")}" alt="${o}" style="height:290px;max-height:290px;width:auto;object-fit:contain;display:block;filter:drop-shadow(0 12px 20px rgba(0,0,0,.28));">`;
return document.getElementById("pg_avatar_big_img");
};
const u = () => {
const e = document.getElementById("pg_avatar_big_img");
const t = e && typeof e.getAttribute === "function" ? e.getAttribute("src") || "" : "";
if (t) {
const e = d(t, false);
G(e, "", () => {});
return;
}
if (s) {
s.innerHTML = '<span class="thumbnail-2d-container icon-broken avatar-card-image" style="width:120px;height:120px;display:block;overflow:hidden;border-radius:50%;background:var(--purpura-button-background-color);"></span>';
}
};
const f = () => {
if (l) {
l.innerHTML = '<span class="thumbnail-2d-container icon-broken" style="width:260px;height:260px;display:block;border-radius:12px;background:var(--purpura-button-background-color);opacity:.75;"></span>';
}
};
const g = () => {
const e = B(t.id);
const r = e && e.finalUpdate;
if (!r) {
f();
return;
}
r.then(e => {
if (e && e.imageUrl) {
p(e.imageUrl);
const t = d(e.imageUrl, false);
G(t, "", () => u());
return;
}
f();
}).catch(() => f());
};
const b = () => {
const e = document.getElementById("pg_avatar_big_img");
const r = e && typeof e.getAttribute === "function" ? e.getAttribute("src") || "" : "";
if (r) {
const e = d(r, false);
G(e, "", () => u());
return;
}
const n = t.avatarUrl || c(t.headshotUrl || "") || "";
if (n) {
const e = d(n, false);
G(e, "", () => u());
return;
}
C(P(t.id), 2, 300).then(e => {
if (e && e.state === "Completed" && e.imageUrl) {
const t = d(e.imageUrl, false);
G(t, "", () => u());
return;
}
u();
}).catch(() => u());
};
const y = d(t.avatarUrl || c(t.headshotUrl || "") || t.headshotUrl || "", false);
const x = p(t.avatarUrl || c(t.headshotUrl || "") || "");
if (y) {
G(y, "", () => {
b();
});
} else {
b();
}
if (x) {
G(x, "", () => {
g();
});
} else {
g();
}
if (t.avatarState !== "Completed" || !t.avatarUrl) {
g();
b();
}
}
function K(e, t, r, n = "display:flex;flex-wrap:wrap;gap:12px;") {
const o = document.getElementById(e);
if (!o) return null;
o.innerHTML = `<div class="profile-favorite-experiences" style="margin-top:24px;"><div class="profile-carousel"><div class="css-17g81zd-collectionCarouselContainer"><div style="margin-bottom:12px;"><h2 class="content-emphasis text-heading-small padding-none inline-block" style="margin:0;">${m(t)}</h2></div><div id="${r}" style="${n}"></div></div></div></div>`;
return document.getElementById(r);
}
function W(e) {
if (!e || typeof e !== "object") return null;
const t = [ e.lowestPrice, e.price, e.priceInRobux, e.robuxPrice, e.expectedPrice, e.product && e.product.priceInRobux, e.itemRestrictions && e.itemRestrictions.priceInRobux ];
for (const e of t) {
const t = Number(e);
if (Number.isFinite(t) && t >= 0) return t;
}
return null;
}
function Q(e) {
if (!e || typeof e !== "object") return "";
if (typeof e.itemType === "string" && e.itemType.trim()) return e.itemType.trim();
if (typeof e.itemTypeName === "string" && e.itemTypeName.trim()) return e.itemTypeName.trim();
if (e.assetType && typeof e.assetType.name === "string" && e.assetType.name.trim()) return e.assetType.name.trim();
if (typeof e.assetType === "string" && e.assetType.trim()) return e.assetType.trim();
if (Number.isFinite(Number(e.assetType))) return `Type ${Number(e.assetType)}`;
return "";
}
function Y(e) {
const t = Number(e);
const r = {
1: "Image",
2: "T-Shirt",
3: "Audio",
4: "Mesh",
5: "Lua",
8: "Hat",
9: "Place",
10: "Model",
11: "Shirt",
12: "Pants",
13: "Decal",
17: "Head",
18: "Face",
19: "Gear",
24: "Animation",
40: "MeshPart",
41: "Hair Accessory",
42: "Face Accessory",
43: "Neck Accessory",
44: "Shoulder Accessory",
45: "Front Accessory",
46: "Back Accessory",
47: "Waist Accessory",
64: "Emote Animation",
65: "Video",
66: "T-Shirt Accessory",
67: "Shirt Accessory",
68: "Pants Accessory",
69: "Jacket Accessory",
70: "Sweater Accessory",
71: "Shorts Accessory",
72: "Left Shoe Accessory",
73: "Right Shoe Accessory",
74: "Dress Skirt Accessory",
75: "Eyebrow Accessory",
76: "Eyelash Accessory"
};
return r[t] || "Asset";
}
function Z(e, t) {
return document.querySelector(".profile-platform-container")?.dataset.profileId === String(e) && !!document.getElementById(t);
}
async function X(e) {
const [t, r, n] = await Promise.all([ A(`https://friends.roblox.com/v1/users/${e}/friends/count`), A(`https://friends.roblox.com/v1/users/${e}/followers/count`), A(`https://friends.roblox.com/v1/users/${e}/followings/count`) ]);
D("ghost-profile-friends-count", t && t.json && typeof t.json.count === "number" ? t.json.count : 0);
D("ghost-profile-followers-count", r && r.json && typeof r.json.count === "number" ? r.json.count : 0);
D("ghost-profile-following-count", n && n.json && typeof n.json.count === "number" ? n.json.count : 0);
}
async function ee(e) {
if (!Z(e, "ghost-profile-wearing-container")) return;
const t = await A(`https://avatar.roblox.com/v1/users/${e}/currently-wearing`);
const r = t && t.json && Array.isArray(t.json.assetIds) ? [ ...new Set(t.json.assetIds.map(e => Number(e)).filter(e => Number.isFinite(e))) ].slice(0, 16) : [];
if (!r.length) {
const e = document.getElementById("ghost-profile-wearing-container");
if (e) e.remove();
return;
}
const n = await A(`https://thumbnails.roblox.com/v1/assets?assetIds=${r.join(",")}&size=150x150&format=Png&isCircular=false`);
if (!Z(e, "ghost-profile-wearing-container")) return;
const o = K("ghost-profile-wearing-container", "Currently Wearing", "ghost-profile-wearing-list", "display:flex;flex-wrap:wrap;gap:12px;");
if (!o) return;
const a = new Map;
const i = n && n.json && Array.isArray(n.json.data) ? n.json.data : [];
i.forEach(e => {
if (e && e.targetId != null) a.set(String(e.targetId), e.imageUrl || "");
});
const s = new Map;
const l = await Promise.all(r.map(e => A(`https://economy.roblox.com/v2/assets/${e}/details`)));
l.forEach((e, t) => {
const n = r[t];
const o = e && e.ok && e.json ? e.json : null;
if (!o) return;
const a = typeof o.Name === "string" && o.Name.trim() ? o.Name.trim() : "";
const i = Number.isFinite(Number(o.PriceInRobux)) ? Number(o.PriceInRobux) : null;
s.set(String(n), {
name: a,
value: i
});
});
o.innerHTML = "";
r.forEach(e => {
const t = String(e);
const r = s.get(t) || {};
const n = r.name || `Asset ${t}`;
const i = r.value == null ? "Offsale" : Number(r.value) === 0 ? "Free" : `${g(r.value)} R$`;
const l = i;
o.insertAdjacentHTML("beforeend", O(`wear_${t}`, n, `https://www.roblox.com/catalog/${t}/-`, a.get(t) || "", l));
});
}
async function te(e, t) {
if (!Z(e, "ghost-profile-store-container")) return;
const r = await A(`https://catalog.roblox.com/v2/search/items/details?taxonomy=${encodeURIComponent("tZsUsd2BqGViQrJ9Vs3Wah")}&creatorName=${encodeURIComponent(t)}&salesTypeFilter=1&limit=10`);
const n = r && r.json && Array.isArray(r.json.data) ? r.json.data.slice(0, 8) : [];
if (!n.length) {
const e = document.getElementById("ghost-profile-store-container");
if (e) e.remove();
return;
}
const o = n.map(e => e && e.id).filter(e => Number.isFinite(Number(e)));
const a = o.length ? await A(`https://thumbnails.roblox.com/v1/assets?assetIds=${o.join(",")}&size=150x150&format=Png&isCircular=false`) : null;
if (!Z(e, "ghost-profile-store-container")) return;
const i = K("ghost-profile-store-container", "Store", "ghost-profile-store-list", "display:flex;flex-wrap:wrap;gap:12px;");
if (!i) return;
const s = new Map;
const l = a && a.json && Array.isArray(a.json.data) ? a.json.data : [];
l.forEach(e => {
if (e && e.targetId != null) s.set(String(e.targetId), e.imageUrl || "");
});
i.innerHTML = "";
n.forEach(e => {
const t = String(e.id || "");
if (!t) return;
const r = e.name || `Item ${t}`;
const n = e.lowestPrice ? `${g(e.lowestPrice)} R$` : "Item";
i.insertAdjacentHTML("beforeend", O(`st_${t}`, r, `https://www.roblox.com/catalog/${t}/-`, s.get(t) || "", n));
});
}
async function re(e) {
if (!Z(e, "ghost-profile-favorites-container")) return;
const t = await A(`https://games.roblox.com/v2/users/${e}/favorite/games?limit=10&sortOrder=Desc`);
const r = t && t.json && Array.isArray(t.json.data) ? t.json.data.slice(0, 8) : [];
if (!r.length) {
const e = document.getElementById("ghost-profile-favorites-container");
if (e) e.remove();
return;
}
const n = r.map(e => e && e.rootPlace && e.rootPlace.id).filter(e => Number.isFinite(Number(e)));
const o = n.length ? await A(`https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${n.join(",")}&size=150x150&format=Png&isCircular=false`) : null;
if (!Z(e, "ghost-profile-favorites-container")) return;
const a = K("ghost-profile-favorites-container", "Favorites", "ghost-profile-favorites-list", "display:flex;gap:12px;overflow-x:auto;padding-bottom:10px;");
if (!a) return;
const i = new Map;
const s = o && o.json && Array.isArray(o.json.data) ? o.json.data : [];
s.forEach(e => {
if (e && e.targetId != null) i.set(String(e.targetId), e.imageUrl || "");
});
a.innerHTML = "";
r.forEach(e => {
const t = e && e.rootPlace && e.rootPlace.id ? String(e.rootPlace.id) : "";
const r = e && e.name ? e.name : "Untitled";
const n = t ? `https://www.roblox.com/games/${t}/-` : `https://www.roblox.com/games/${e.id || 0}/-`;
a.insertAdjacentHTML("beforeend", O(`fv_${t || e.id || 0}`, r, n, t ? i.get(t) || "" : "", "Experience"));
});
}
async function ne(e) {
if (!Z(e, "ghost-profile-friends-container")) return;
const t = await A(`https://friends.roblox.com/v1/users/${e}/friends/find?userSort=2&limit=9`);
const r = t && t.json && Array.isArray(t.json.PageItems) ? t.json.PageItems.filter(e => e && Number(e.id) > 0).slice(0, 9) : [];
if (!r.length) {
const e = document.getElementById("ghost-profile-friends-container");
if (e) e.remove();
return;
}
const n = r.map(e => Number(e.id));
const [o, a] = await Promise.all([ A("https://apis.roblox.com/user-profile-api/v1/user/profiles/get-profiles", "POST", {
userIds: n,
fields: [ "names.combinedName", "isVerified", "names.username" ]
}), A(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${n.join(",")}&size=150x150&format=Png&isCircular=false`) ]);
if (!Z(e, "ghost-profile-friends-container")) return;
const i = K("ghost-profile-friends-container", "Connections", "ghost-profile-friends-list", "display:flex;gap:45px;overflow-x:auto;padding-bottom:10px;");
if (!i) return;
const s = new Map;
const l = o && o.json && Array.isArray(o.json.profileDetails) ? o.json.profileDetails : [];
l.forEach(e => {
if (e && e.userId != null) s.set(String(e.userId), e);
});
const c = new Map;
const d = a && a.json && Array.isArray(a.json.data) ? a.json.data : [];
d.forEach(e => {
if (e && e.targetId != null) c.set(String(e.targetId), e.imageUrl || "");
});
i.innerHTML = "";
r.forEach(e => {
const t = String(e.id);
const r = s.get(t);
const n = r && r.names && r.names.combinedName ? r.names.combinedName : e.name || `User ${t}`;
const o = r && r.names && r.names.username ? `@${r.names.username}` : "Friend";
i.insertAdjacentHTML("beforeend", O(`fr_${t}`, n, `https://www.roblox.com/users/${t}/profile`, c.get(t) || "", o));
});
}
async function oe(e) {
if (!Z(e, "ghost-profile-groups-container")) return;
const t = await A(`https://groups.roblox.com/v1/users/${e}/groups/roles?includeLocked=true`);
const r = t && t.json && Array.isArray(t.json.data) ? t.json.data.slice(0, 10) : [];
if (!r.length) {
const e = document.getElementById("ghost-profile-groups-container");
if (e) e.remove();
return;
}
const n = r.map(e => e && e.group && e.group.id).filter(e => Number.isFinite(Number(e)));
const o = n.length ? await A(`https://thumbnails.roblox.com/v1/groups/icons?groupIds=${n.join(",")}&size=150x150&format=Png&isCircular=false`) : null;
if (!Z(e, "ghost-profile-groups-container")) return;
const a = K("ghost-profile-groups-container", "Communities", "ghost-profile-groups-list", "display:flex;gap:12px;overflow-x:auto;padding-bottom:10px;");
if (!a) return;
const i = new Map;
const s = o && o.json && Array.isArray(o.json.data) ? o.json.data : [];
s.forEach(e => {
if (e && e.targetId != null) i.set(String(e.targetId), e.imageUrl || "");
});
a.innerHTML = "";
r.forEach(e => {
const t = e && e.group && e.group.id ? String(e.group.id) : "";
if (!t) return;
const r = e.group.name || `Group ${t}`;
const n = e.role && e.role.name ? e.role.name : "Role";
a.insertAdjacentHTML("beforeend", O(`gr_${t}`, r, `https://www.roblox.com/groups/${t}/-`, i.get(t) || "", n));
});
}
async function ae(e) {
if (!Z(e, "ghost-profile-badges-container")) return;
const t = await A(`https://badges.roblox.com/v1/users/${e}/badges?limit=10&sortOrder=Desc`);
const r = t && t.json && Array.isArray(t.json.data) ? t.json.data.slice(0, 10) : [];
if (!r.length) {
const e = document.getElementById("ghost-profile-badges-container");
if (e) e.remove();
return;
}
const n = r.map(e => e && e.id).filter(e => Number.isFinite(Number(e)));
const o = n.length ? await A(`https://thumbnails.roblox.com/v1/badges/icons?badgeIds=${n.join(",")}&size=150x150&format=Png&isCircular=false`) : null;
if (!Z(e, "ghost-profile-badges-container")) return;
const a = K("ghost-profile-badges-container", "Badges", "ghost-profile-badges-list", "display:flex;gap:20px;overflow-x:auto;padding-bottom:10px;");
if (!a) return;
const i = new Map;
const s = o && o.json && Array.isArray(o.json.data) ? o.json.data : [];
s.forEach(e => {
if (e && e.targetId != null) i.set(String(e.targetId), e.imageUrl || "");
});
a.innerHTML = "";
r.forEach(e => {
const t = String(e.id || "");
if (!t) return;
const r = e.name || `Badge ${t}`;
a.insertAdjacentHTML("beforeend", O(`bd_${t}`, r, `https://www.roblox.com/badges/${t}/-`, i.get(t) || "", "Badge"));
});
}
async function ie(e) {
if (!Z(e, "ghost-profile-creations-list")) return;
const t = await A(`https://games.roblox.com/v2/users/${e}/games?accessFilter=Public&limit=50&sortOrder=Asc`);
const r = t && t.json && Array.isArray(t.json.data) ? t.json.data : [];
const n = document.getElementById("ghost-profile-creations-list");
if (!n) return;
if (!r.length) {
n.innerHTML = '<p class="no-results-message">No experiences found.</p>';
return;
}
const o = r.map(e => e && e.rootPlace && e.rootPlace.id).filter(e => Number.isFinite(Number(e)));
const a = o.length ? await A(`https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${o.join(",")}&size=150x150&format=Png&isCircular=false`) : null;
if (!Z(e, "ghost-profile-creations-list")) return;
const i = new Map;
const s = a && a.json && Array.isArray(a.json.data) ? a.json.data : [];
s.forEach(e => {
if (e && e.targetId != null) i.set(String(e.targetId), e.imageUrl || "");
});
n.innerHTML = "";
r.forEach(e => {
const t = e && e.rootPlace && e.rootPlace.id ? String(e.rootPlace.id) : "";
const r = e && e.name ? e.name : "Untitled";
const o = t ? `https://www.roblox.com/games/${t}/-` : `https://www.roblox.com/games/${e.id || 0}/-`;
const a = e && typeof e.playing === "number" ? `${g(e.playing)} playing` : "Experience";
n.insertAdjacentHTML("beforeend", V(`gm_${t || e.id || 0}`, r, o, t ? i.get(t) || "" : "", a));
});
}
async function se(e) {
const t = Number(e);
if (!Number.isFinite(t) || t <= 0) return null;
const [r, n, o, a, i] = await Promise.all([ A(`https://users.roblox.com/v1/users/${t}`), A("https://apis.roblox.com/user-profile-api/v1/user/profiles/get-profiles", "POST", {
userIds: [ t ],
fields: [ "names.combinedName", "isVerified", "names.username" ]
}), C(S(t), 4), C(P(t), 4), L(t) ]);
const s = n && n.json && Array.isArray(n.json.profileDetails) ? n.json.profileDetails[0] : null;
const l = r && r.ok && r.json ? r.json : null;
if (l && l.isBanned === false) {
window.location.replace(`https://www.roblox.com/users/${t}/profile`);
return null;
}
const c = i && i.state === "Completed" && typeof i.imageUrl === "string" ? i.imageUrl : "";
const d = o && o.state === "Completed" && typeof o.imageUrl === "string" ? o.imageUrl : "";
const p = c || d;
const u = c ? i.thumbnailType || "AvatarHeadshot" : d ? "AvatarHeadshot" : "";
const m = a && a.state === "Completed" && typeof a.imageUrl === "string" ? a.imageUrl : "";
const f = c && i && i.thumbnailType !== "AvatarAsset" ? E(c) || c : "";
const g = d ? E(d) || d : "";
const h = m || f || g;
const b = p ? "Completed" : o && o.state ? o.state : "Blocked";
const y = h ? "Completed" : a && a.state ? a.state : "Blocked";
return {
id: l && Number.isFinite(Number(l.id)) ? Number(l.id) : t,
name: l && l.name || s && s.names && s.names.username || "Account Forgotten",
displayName: l && l.displayName || s && s.names && s.names.combinedName || l && l.name || "Account Forgotten",
description: l && typeof l.description === "string" ? l.description : "",
created: l && l.created || "",
isVerified: !!(s && s.isVerified),
headshotUrl: p || "",
headshotType: u,
avatarUrl: h || "",
headshotState: b,
avatarState: y
};
}
async function le(e) {
const t = ++l;
const r = z();
if (!r) return;
q(r);
const n = await se(e);
if (t !== l) return;
if (!n) return;
J(n);
await Promise.all([ X(n.id), ee(n.id), te(n.id, n.name), re(n.id), ne(n.id), oe(n.id), ae(n.id), ie(n.id) ]);
}
async function ce() {
const t = window.location.pathname.match(e);
if (t && t[1]) return t[1];
const r = (document.title || "").toLowerCase();
const n = window.location.pathname.includes("/request-error") || r.includes("page not found") || !!document.querySelector(".error-page-container");
if (!n) return null;
return await F();
}
async function de() {
if (a) {
i = true;
return;
}
a = true;
try {
do {
i = false;
const t = await H();
if (!t.enabled) {
v();
continue;
}
const r = window.location.pathname.match(e);
const n = r && r[1] ? String(r[1]) : null;
if (!n) {
if (!t.webRequestPermission) {
v();
continue;
}
if (!await R()) {
v();
continue;
}
}
const o = n || await ce();
if (!o) {
v();
continue;
}
const a = `${o}|${window.location.pathname}|${window.location.search}`;
const l = document.querySelector(`.profile-platform-container[data-profile-id="${o}"]`);
if (a === s && l) continue;
await le(o);
s = a;
} while (i);
} finally {
a = false;
}
}
function pe() {
if (c) clearTimeout(c);
c = window.setTimeout(() => {
de();
}, 70);
}
const ue = history.pushState.bind(history);
history.pushState = function() {
const e = ue(...arguments);
pe();
return e;
};
const me = history.replaceState.bind(history);
history.replaceState = function() {
const e = me(...arguments);
pe();
return e;
};
window.addEventListener("popstate", pe);
window.addEventListener("hashchange", pe);
y();
de();
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", de, {
once: true
});
}
})();
