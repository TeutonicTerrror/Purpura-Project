/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function(e) {
"use strict";
const t = {
sync: {
"bot-detector": "bd",
"status-spoofer": "spc",
"offline-mode": "spc-legacy",
"server-info": "si",
"game-launcher-widget": "glw",
"game-launcher-omnibox": "glw-omnibox",
"game-outfits": "go",
"pinned-games": "pg",
"quick-play": "qp",
"purpuras-selection": "ps",
"page-binds": "pb",
"avatar-search": "as",
"infinite-avatar": "ia",
"sticky-avatar-preview": "sap",
"save-lots-robux": "slr",
"quick-status-switcher": "qs",
"quick-settings": "qs",
"quick-settings-manager": "qs",
"no-rent": "nr",
"robux-conversions": "rconv",
"bundle-item-viewer": "biv",
"friends-manager": "fm",
"last-online": "lo",
"better-continue": "bc",
"legacy-theme-switcher": "lts",
"save-lots-robux-place-id": "__slr_placeId__"
},
local: {
"ghost-profiles": "ghos",
uncooperatify: "unc",
uncoorporatifyConfig: "uncConfig",
"unpending-robux": "up",
greetings: "gr",
"greetings-enabled": "gr",
purpuraCursor: "pcr",
"purpura-cursors": "pcr",
purpuraTabs: "pt",
"purpura-tabs": "pt",
homePageTweaks: "hpt",
"home-page-tweaks": "hpt",
bloatwareRemover: "bwr",
"bloatware-remover": "bwr",
reworkedSidebar: "sdbr",
"reworked-sidebar": "sdbr",
"redesigned-avatar-editor": "rae",
"roblox-age-theme": "rat",
"streamer-mode": "stm",
"login-banner": "lb",
purpuraOnboardingShown: "ob",
"purpura-last-online-cache-v1": "lo"
}
};
const r = {
si: {
enabled: true,
info: {
region: true,
ping: true,
fps: true,
serverVersion: false,
serverId: false
}
},
bd: {
enabled: true,
showDatabase: true,
roundToWholeNumbers: true
},
go: {
enabled: true,
launchPopup: false
},
pb: {
enabled: false,
binds: []
},
hpt: {
enabled: true,
todaysGamePicks: true,
continuePlaying: false,
recommendedGames: true,
favoriteGames: false,
standoutGames: true,
friends: false
},
ghos: {
enabled: false,
webRequestPermission: false
},
bwr: {
enabled: false
},
pcr: {
enabled: false,
preset: "default",
cursor: "auto",
name: "Default",
type: "preset",
trailEffects: false
},
pt: {
enabled: false,
favicon: {
type: "purpura"
},
titleFormat: "{n} Purpura"
},
sdbr: {
enabled: false
},
slr: {
enabled: false,
placeId: ""
},
rat: {
enabled: false,
theme: "Normal Roblox"
},
spc: {
enabled: false,
mode: "offline"
},
uncConfig: {
enabled: true,
sections: {
charts: true,
marketplace: true,
create: true,
groups: true
}
}
};
const n = {
sync: [],
local: [ "fix-memory-leak", "blm", "betterLightMode", "better-light-mode" ]
};
const s = new Set([ "savedThemes", "rothemerActive", "selectedTheme", "purpuraDefaultSettings", "purpura_studio_api_keys", "purpura_ghost_api_keys", "robloxUserId", "sessionKey", "sessionExpiry", "noFeatures", "noFeaturesReason", "pinnedGamesList", "pinnedGamesFolders" ]);
function a(e) {
return new Promise(t => {
try {
e.get(null, e => t(e || {}));
} catch {
t({});
}
});
}
function o(e, t) {
return new Promise(r => {
if (!t || !Object.keys(t).length) {
r();
return;
}
try {
e.set(t, () => r());
} catch {
r();
}
});
}
function i(e, t) {
return new Promise(r => {
if (!t || !t.length) {
r();
return;
}
try {
e.remove(t, () => r());
} catch {
r();
}
});
}
function u(e) {
return JSON.parse(JSON.stringify(e));
}
function c(e, t) {
return JSON.stringify(e) === JSON.stringify(t);
}
function l(e) {
return e.replace(/-([a-z])/g, (e, t) => t.toUpperCase());
}
function f(e) {
const t = {
...e
};
for (const [r, n] of Object.entries(e)) {
const e = l(r);
if (e !== r && t[e] === undefined) {
t[e] = n;
}
}
return t;
}
async function d() {
try {
const e = await new Promise(e => {
chrome.storage.local.get([ "purpuraDefaultSettings" ], e);
});
if (e.purpuraDefaultSettings && typeof e.purpuraDefaultSettings === "object") {
return {
...r,
...e.purpuraDefaultSettings
};
}
} catch {}
try {
const e = chrome.runtime.getURL("data/default_settings.json");
const t = await fetch(e);
if (t.ok) {
const e = await t.json();
return {
...r,
...e
};
}
} catch {}
return {
...r
};
}
function p(e, t) {
if (Object.prototype.hasOwnProperty.call(t, e)) {
return t[e];
}
return r[e];
}
function b(e) {
return e && typeof e === "object" && !Array.isArray(e);
}
function g(e, t, r) {
if (t === undefined || t === null) {
return undefined;
}
const n = p(e, r);
if (typeof t === "boolean") {
if (b(n)) {
const e = u(n);
e.enabled = t;
return e;
}
return t;
}
if (Array.isArray(t)) {
if (e === "pb") {
const e = b(n) ? u(n) : {
enabled: true,
binds: []
};
e.enabled = true;
e.binds = t;
return e;
}
return t;
}
if (typeof t === "object" && b(n)) {
const e = {
...u(n),
...t
};
if (Object.prototype.hasOwnProperty.call(n, "enabled") && !Object.prototype.hasOwnProperty.call(t, "enabled")) {
e.enabled = true;
}
return e;
}
return t;
}
function y(e, t, r, n) {
const s = g(e, t, n);
const a = g(e, r, n);
if (typeof s === "boolean" || typeof a === "boolean") {
return a !== undefined ? a : s;
}
if (Array.isArray(s) || Array.isArray(a)) {
return a !== undefined ? a : s;
}
if (b(s) || b(a)) {
const t = p(e, n);
const r = b(t) ? u(t) : {};
return {
...r,
...s || {},
...a || {}
};
}
return a !== undefined ? a : s;
}
function m(e, t, r, n) {
const s = y("slr", t.slr !== undefined ? t.slr : e.slr, {
placeId: String(r ?? "")
}, n);
t.slr = s;
}
async function h(e, r) {
const u = e === "sync" ? chrome.storage.sync : chrome.storage.local;
const l = f(t[e] || {});
const d = await a(u);
const p = {};
const b = [];
let h = 0;
const w = {
...d
};
for (const [e, t] of Object.entries(l)) {
if (!(e in w) || w[e] === undefined) {
continue;
}
const n = w[e];
if (t === "__slr_placeId__") {
const t = p.slr !== undefined ? p.slr : w.slr;
m(w, p, n, r);
if (!c(t, p.slr)) {
h++;
}
b.push(e);
delete w[e];
continue;
}
const s = g(t, n, r);
const a = p[t] !== undefined ? p[t] : w[t];
let o;
if (a === undefined) {
o = s;
} else {
o = y(t, a, s, r);
}
if (!c(a, o)) {
h++;
}
p[t] = o;
w[t] = o;
b.push(e);
delete w[e];
}
Object.assign(w, p);
const v = new Set([ ...Object.keys(r), ...Object.values(t.sync || {}), ...Object.values(t.local || {}), ...Object.keys(w) ]);
for (const e of v) {
if (s.has(e) || e === "__slr_placeId__") {
continue;
}
if (!(e in w) || w[e] === undefined) {
continue;
}
const t = p[e] !== undefined ? p[e] : w[e];
const n = g(e, t, r);
if (n === undefined || c(t, n)) {
continue;
}
p[e] = n;
w[e] = n;
h++;
}
await o(u, p);
await i(u, [ ...b, ...n[e] || [] ]);
return h;
}
async function w() {
const e = await d();
let t = 0;
t += await h("sync", e);
t += await h("local", e);
return {
migrated: t,
success: true
};
}
e.PurpuraStorageMigrate = {
migrateStorageKeys: w
};
})(typeof globalThis !== "undefined" ? globalThis : window);
