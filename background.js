/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
const SESSION_TTL_DEFAULT_MS = 14 * 24 * 60 * 60 * 1e3;

const STUDIO_API_KEY_STORAGE_KEY = "purpura_studio_api_keys";

const STUDIO_API_KEY_LEGACY_STORAGE_KEY = "purpura_ghost_api_keys";

const STUDIO_API_KEY_NAME = "Purpura API key";

const STUDIO_API_KEY_DESCRIPTION = `Purpura API key, used for local API requests only.\nNever used outside your local device.`;

const STUDIO_API_KEY_NAME_COMPAT = new Set([ "Purpura API key" ]);

const STUDIO_API_KEY_DESCRIPTION_COMPAT = new Set([ "Purpura API key, used for local API requests only.", "Purpura API key, used for local API requests only.\nNever used outside your local device." ]);

let studioApiKeyInFlight = null;

let studioApiCsrfToken = "";

function normalizeStudioApiHttpMethod(e, t = "GET") {
const r = String(t || "GET").trim().toUpperCase() || "GET";
const n = String(e || r).trim().toUpperCase();
return new Set([ "GET", "POST", "PUT", "PATCH", "DELETE", "HEAD" ]).has(n) ? n : r;
}

function isManagedStudioApiKeyEntry(e) {
if (!e || typeof e !== "object") return false;
const t = e.cloudAuthUserConfiguredProperties;
if (!t || typeof t !== "object") return false;
const r = typeof t.name === "string" ? t.name.trim() : "";
const n = typeof t.description === "string" ? t.description.trim() : "";
if (!r || !n) return false;
return STUDIO_API_KEY_NAME_COMPAT.has(r) && STUDIO_API_KEY_DESCRIPTION_COMPAT.has(n);
}

async function getStudioApiKeyStorageMap() {
const e = await chrome.storage.local.get([ STUDIO_API_KEY_STORAGE_KEY, STUDIO_API_KEY_LEGACY_STORAGE_KEY ]);
const t = e[STUDIO_API_KEY_STORAGE_KEY] && typeof e[STUDIO_API_KEY_STORAGE_KEY] === "object" ? {
...e[STUDIO_API_KEY_STORAGE_KEY]
} : {};
const r = e[STUDIO_API_KEY_LEGACY_STORAGE_KEY] && typeof e[STUDIO_API_KEY_LEGACY_STORAGE_KEY] === "object" ? e[STUDIO_API_KEY_LEGACY_STORAGE_KEY] : {};
let n = false;
for (const [e, a] of Object.entries(r)) {
if (!(e in t)) {
t[e] = a;
n = true;
}
}
if (n) {
await chrome.storage.local.set({
[STUDIO_API_KEY_STORAGE_KEY]: t
});
}
return t;
}

async function setStudioApiKeyStorageMap(e) {
await chrome.storage.local.set({
[STUDIO_API_KEY_STORAGE_KEY]: e && typeof e === "object" ? e : {}
});
}

async function getStudioApiAuthenticatedUserId() {
try {
const e = await fetch("https://users.roblox.com/v1/users/authenticated", {
credentials: "include"
});
if (!e.ok) return "";
const t = await e.json();
const r = Number(t && t.id);
return Number.isFinite(r) && r > 0 ? String(r) : "";
} catch (e) {
return "";
}
}

async function refreshStudioApiCsrfToken() {
try {
const e = new Headers;
if (studioApiCsrfToken) {
e.set("X-CSRF-TOKEN", studioApiCsrfToken);
}
const t = await fetch("https://auth.roblox.com/v2/logout", {
method: "POST",
credentials: "include",
headers: e
});
const r = t.headers.get("x-csrf-token");
if (typeof r === "string" && r) {
studioApiCsrfToken = r;
}
} catch (e) {}
return studioApiCsrfToken;
}

async function fetchStudioApiJson(e, t = {}) {
const r = normalizeStudioApiHttpMethod(t.method, "GET");
const n = new Headers;
n.set("Accept", "application/json, text/plain;q=0.9, */*;q=0.8");
n.set("Referer", "https://www.roblox.com/");
if (t.headers && typeof t.headers === "object") {
Object.entries(t.headers).forEach(([e, t]) => {
if (typeof e === "string" && e && typeof t === "string" && t) {
n.set(e, t);
}
});
}
const a = typeof t.body === "string" ? t.body : t.body !== undefined && t.body !== null ? JSON.stringify(t.body) : "";
const o = r === "GET" || r === "HEAD" ? undefined : a || undefined;
if (o && !n.has("content-type")) {
n.set("content-type", "application/json");
}
if (r !== "GET" && r !== "HEAD") {
if (!studioApiCsrfToken) {
await refreshStudioApiCsrfToken();
}
if (studioApiCsrfToken) {
n.set("X-CSRF-TOKEN", studioApiCsrfToken);
}
}
let s = await fetch(e, {
method: r,
credentials: "include",
headers: n,
body: o
});
const i = s.headers.get("x-csrf-token");
if (typeof i === "string" && i) {
studioApiCsrfToken = i;
}
if (s.status === 403 && r !== "GET" && r !== "HEAD") {
if (!studioApiCsrfToken) {
await refreshStudioApiCsrfToken();
}
if (studioApiCsrfToken) {
n.set("X-CSRF-TOKEN", studioApiCsrfToken);
s = await fetch(e, {
method: r,
credentials: "include",
headers: n,
body: o
});
const t = s.headers.get("x-csrf-token");
if (typeof t === "string" && t) {
studioApiCsrfToken = t;
}
}
}
const c = await s.text();
let u = null;
if (c) {
try {
u = JSON.parse(c);
} catch (e) {}
}
return {
ok: s.ok,
status: s.status,
json: u,
text: c
};
}

async function ensureStudioApiKey(e = false) {
if (studioApiKeyInFlight) {
return studioApiKeyInFlight;
}
studioApiKeyInFlight = (async () => {
const t = await getStudioApiAuthenticatedUserId();
if (!t) {
return {
ok: false,
apiKey: "",
userId: "",
reason: "not-authenticated"
};
}
const r = await getStudioApiKeyStorageMap();
const n = r[t];
if (!e && n && typeof n.apiKey === "string" && n.apiKey) {
return {
ok: true,
apiKey: n.apiKey,
userId: t,
source: "cached"
};
}
const a = await fetchStudioApiJson("https://apis.roblox.com/cloud-authentication/v1/canUseApiKeys", {
method: "POST",
body: {},
headers: {
"Content-Type": "application/json"
}
});
if (!a.ok || !(a.json && a.json.canUseApiKeys === true)) {
return {
ok: false,
apiKey: "",
userId: t,
reason: "cannot-use-api-keys"
};
}
const o = await fetchStudioApiJson("https://apis.roblox.com/cloud-authentication/v1/apiKeys", {
method: "POST",
body: {
cursor: "",
limit: 10,
reverse: false
},
headers: {
"Content-Type": "application/json"
}
});
if (!o.ok || !o.json) {
return {
ok: false,
apiKey: "",
userId: t,
reason: "list-failed"
};
}
const s = Array.isArray(o.json.cloudAuthInfo) ? o.json.cloudAuthInfo : [];
const i = s.find(isManagedStudioApiKeyEntry);
let c = null;
if (i && i.id) {
const e = await fetchStudioApiJson(`https://apis.roblox.com/cloud-authentication/v1/apiKey/${i.id}/regenerate`, {
method: "POST",
body: {},
headers: {
"Content-Type": "application/json"
}
});
if (e.ok && e.json) {
c = e.json;
}
}
if (!c) {
const e = await fetchStudioApiJson("https://apis.roblox.com/cloud-authentication/v1/apiKey", {
method: "POST",
body: {
cloudAuthUserConfiguredProperties: {
name: STUDIO_API_KEY_NAME,
description: STUDIO_API_KEY_DESCRIPTION,
isEnabled: true,
allowedCidrs: [ "0.0.0.0/0" ],
scopes: []
}
},
headers: {
"Content-Type": "application/json"
}
});
if (!e.ok || !e.json) {
return {
ok: false,
apiKey: "",
userId: t,
reason: "create-failed"
};
}
c = e.json;
}
if (!c || typeof c.apikeySecret !== "string" || !c.apikeySecret) {
return {
ok: false,
apiKey: "",
userId: t,
reason: "missing-secret"
};
}
r[t] = {
apiKey: c.apikeySecret,
id: c.cloudAuthInfo && c.cloudAuthInfo.id ? c.cloudAuthInfo.id : i && i.id ? i.id : "",
timestamp: Date.now()
};
await setStudioApiKeyStorageMap(r);
return {
ok: true,
apiKey: c.apikeySecret,
userId: t,
source: i ? "regenerated" : "created"
};
})();
try {
return await studioApiKeyInFlight;
} catch (e) {
return {
ok: false,
apiKey: "",
userId: "",
reason: "exception"
};
} finally {
studioApiKeyInFlight = null;
}
}

async function invalidateStudioApiKey() {
const e = await getStudioApiAuthenticatedUserId();
if (!e) return {
ok: false
};
const t = await getStudioApiKeyStorageMap();
if (!(e in t)) {
return {
ok: true
};
}
delete t[e];
await setStudioApiKeyStorageMap(t);
return {
ok: true
};
}

function initializeStudioApiKey() {
ensureStudioApiKey(false).catch(() => {});
}

function purpuraAvatarCyclerApi(e) {
const t = e.method || "GET";
const r = Object.assign({
Accept: "application/json"
}, e.headers || {});
const n = e.body === undefined ? undefined : JSON.stringify(e.body);
if (n) r["Content-Type"] = "application/json";
return fetch("https://" + e.subdomain + ".roblox.com" + e.endpoint, {
method: t,
headers: r,
body: n,
credentials: "include"
}).then(async a => {
if (a.status === 403 && t !== "GET" && t !== "HEAD") {
const o = a.headers.get("x-csrf-token");
if (o) {
r["X-CSRF-TOKEN"] = o;
return fetch("https://" + e.subdomain + ".roblox.com" + e.endpoint, {
method: t,
headers: r,
body: n,
credentials: "include"
});
}
}
return a;
});
}

async function purpuraAvatarCyclerRequestWithRetry(e) {
let t;
for (let r = 0; r < 4; r += 1) {
t = await purpuraAvatarCyclerApi(e);
if (t.ok) return t;
if (t.status !== 429 && t.status < 500) return t;
if (r < 3) await new Promise(e => setTimeout(e, 1e3));
}
return t;
}

function purpuraAvatarCyclerNormalizeBodyColors(e, t) {
const r = [ t && t.bodyColor3s, e && e.bodyColor3s, t && t.bodyColors, e && e.bodyColors, t && t.avatarDefinition && t.avatarDefinition.bodyColors, e && e.avatarDefinition && e.avatarDefinition.bodyColors ];
const n = [ [ "headColor3", "headColor", "headColor3Id", "headColorId" ], [ "torsoColor3", "torsoColor", "torsoColor3Id", "torsoColorId" ], [ "rightArmColor3", "rightArmColor", "rightArmColor3Id", "rightArmColorId" ], [ "leftArmColor3", "leftArmColor", "leftArmColor3Id", "leftArmColorId" ], [ "rightLegColor3", "rightLegColor", "rightLegColor3Id", "rightLegColorId" ], [ "leftLegColor3", "leftLegColor", "leftLegColor3Id", "leftLegColorId" ] ];
const a = {};
const o = {};
n.forEach(([e, t, n, s]) => {
let i;
for (const a of r) {
if (!a || typeof a !== "object") continue;
i = a[e] ?? a[t] ?? a[n] ?? a[s];
if (i !== undefined && i !== null && i !== "") break;
}
if (i === undefined || i === null || i === "") return;
a[e] = i;
o[t] = typeof i === "string" ? i.replace(/^#/, "") : i;
});
return Object.keys(a).length ? {
bodyColor3s: a,
bodyColors: o
} : null;
}

function purpuraAvatarCyclerSetBodyColors(e, t) {
const r = purpuraAvatarCyclerNormalizeBodyColors(e, t);
if (!r) return Promise.resolve({
ok: true
});
return purpuraAvatarCyclerRequestWithRetry({
subdomain: "avatar",
endpoint: "/v2/avatar/set-body-colors",
method: "POST",
body: r.bodyColor3s
}).then(e => {
if (e && e.ok) return e;
return purpuraAvatarCyclerRequestWithRetry({
subdomain: "avatar",
endpoint: "/v1/avatar/set-body-colors",
method: "POST",
body: r.bodyColors
});
});
}

async function purpuraAvatarCyclerWear(e) {
const t = typeof e === "object" && e !== null ? e.itemId : e;
if (!t) return false;
let r = null;
const n = await chrome.storage.local.get([ "purpura_avatar_cycler_details" ]);
r = n.purpura_avatar_cycler_details && n.purpura_avatar_cycler_details[String(t)];
if (!r) {
const e = await purpuraAvatarCyclerRequestWithRetry({
subdomain: "avatar",
endpoint: "/v4/outfits/" + encodeURIComponent(t) + "/details"
});
if (!e.ok) return false;
r = await e.json();
}
const a = r.outfitModel || r;
const o = [ ...Array.isArray(a.assets) ? a.assets : [] ];
const s = [];
const i = r.outfitConfigurations && r.outfitConfigurations.background && r.outfitConfigurations.background.backgroundAsset;
if (i && i.id) {
s.push(purpuraAvatarCyclerRequestWithRetry({
subdomain: "avatar",
endpoint: "/v4/avatar",
method: "PATCH",
body: {
updateTypes: [ "UpdateBackground" ],
avatarDefinition: {
updateAvatarConfig: {
backgroundRequestModel: {
id: i.id
}
}
}
}
}));
}
if (o.length) {
s.push(purpuraAvatarCyclerRequestWithRetry({
subdomain: "avatar",
endpoint: "/v2/avatar/set-wearing-assets",
method: "POST",
body: {
assets: o
}
}));
}
if (a.playerAvatarType) {
s.push(purpuraAvatarCyclerRequestWithRetry({
subdomain: "avatar",
endpoint: "/v1/avatar/set-player-avatar-type",
method: "POST",
body: {
playerAvatarType: a.playerAvatarType
}
}));
}
if (a.scale) {
s.push(purpuraAvatarCyclerRequestWithRetry({
subdomain: "avatar",
endpoint: "/v1/avatar/set-scales",
method: "POST",
body: a.scale
}));
}
const c = purpuraAvatarCyclerSetBodyColors(r, a);
if (c) s.push(c);
const u = await Promise.all(s);
return u.every(e => e && e.ok);
}

function purpuraAvatarCyclerUpdate() {
Promise.all([ new Promise(e => chrome.storage.sync.get([ "ac", "purpura_avatar_cycler_interval" ], e)), new Promise(e => chrome.storage.local.get([ "purpura_avatar_cycler_ids" ], e)) ]).then(e => {
const t = e[0] || {};
const r = e[1] || {};
if (purpuraAvatarCyclerTimer) {
clearInterval(purpuraAvatarCyclerTimer);
purpuraAvatarCyclerTimer = null;
}
const n = t.ac === undefined || t.ac === true || t.ac && t.ac.enabled === true;
const a = Array.isArray(r.purpura_avatar_cycler_ids) ? r.purpura_avatar_cycler_ids : [];
if (!n || a.length < 2) return;
purpuraAvatarCyclerIndex = 0;
const o = Math.max(5, parseInt(t.purpura_avatar_cycler_interval, 10) || 5);
const s = () => {
const e = a[purpuraAvatarCyclerIndex];
purpuraAvatarCyclerIndex = (purpuraAvatarCyclerIndex + 1) % a.length;
purpuraAvatarCyclerWear(e).catch(() => {});
};
s();
purpuraAvatarCyclerTimer = setInterval(s, o * 1e3);
}).catch(() => {});
}

let purpuraAvatarCyclerTimer = null;

let purpuraAvatarCyclerIndex = 0;

chrome.storage.onChanged.addListener((e, t) => {
if (t === "sync" && (e.ac || e.purpura_avatar_cycler_interval) || t === "local" && (e.purpura_avatar_cycler_ids || e.purpura_avatar_cycler_details)) {
purpuraAvatarCyclerUpdate();
}
});

function injectInfiniteAvatarPatch() {
if (window.__purpuraIaInjected) return;
window.__purpuraIaInjected = true;
var e = [ 8, 41, 42, 43, 44, 45, 46, 47, 57, 58 ];
var t = [ 64, 65, 66, 67, 68, 69, 70, 71, 72 ];
var r = "__purpuraInfiniteAvatarPatched";
var n = 10;
var a = 10;
var o = true;
function s(s) {
if (!s || s[r]) return;
s[r] = true;
var i = s.getAdvancedAccessoryLimit;
s.getAdvancedAccessoryLimit = function(r) {
var n = Number(r);
if (o && (e.indexOf(n) !== -1 || t.indexOf(n) !== -1)) {
return 100;
}
return typeof i === "function" ? i.apply(this, arguments) : 10;
};
var c = s.addAssetToAvatar;
if (typeof c !== "function") return;
s.addAssetToAvatar = function(r, s) {
if (!o) return c.apply(this, arguments);
var i = c.apply(this, arguments).filter(function(r) {
var n = r && r.assetType ? Number(r.assetType.id) : 0;
return e.indexOf(n) === -1 && t.indexOf(n) === -1;
});
var u = [ r ].concat(Array.isArray(s) ? s : []);
var l = {};
var d = [];
var f = [];
u.forEach(function(r) {
if (!r || !r.id || l[r.id]) return;
var n = r.assetType ? Number(r.assetType.id) : 0;
if (e.indexOf(n) !== -1) {
d.push(r);
l[r.id] = true;
} else if (t.indexOf(n) !== -1) {
f.push(r);
l[r.id] = true;
}
});
return i.concat(d.slice(0, n), f.slice(0, a));
};
}
function i() {
var e = window.Roblox;
if (e) {
var t = e.AvatarAccoutrementService;
s(t);
try {
var r = Object.getOwnPropertyDescriptor(e, "AvatarAccoutrementService");
if (!r || r.configurable) {
var n = t;
Object.defineProperty(e, "AvatarAccoutrementService", {
configurable: true,
enumerable: true,
get: function() {
return n;
},
set: function(e) {
n = e;
s(e);
}
});
}
} catch (e) {}
return true;
}
var a;
try {
Object.defineProperty(window, "Roblox", {
configurable: true,
enumerable: true,
get: function() {
return a;
},
set: function(e) {
a = e;
if (e && typeof e === "object") {
var t = e.AvatarAccoutrementService;
s(t);
try {
Object.defineProperty(e, "AvatarAccoutrementService", {
configurable: true,
enumerable: true,
get: function() {
return t;
},
set: function(e) {
t = e;
s(e);
}
});
} catch (e) {}
}
}
});
} catch (e) {}
return false;
}
var c = 0;
var u = setInterval(function() {
if (i() || ++c > 40) clearInterval(u);
}, 250);
}

chrome.runtime.onMessage.addListener((e, t, r) => {
if (e.action === "updateOfflineMode") {
chrome.declarativeNetRequest.updateEnabledRulesets(e.enabled ? {
enableRulesetIds: [ "offline_mode" ]
} : {
disableRulesetIds: [ "offline_mode" ]
}).then(() => {
r({
success: true
});
}).catch(e => {
r({
success: false,
error: e.message
});
});
return true;
}
if (e.action === "openChangelog") {
chrome.tabs.create({
url: chrome.runtime.getURL("new.html")
});
} else if (e.action === "checkWebRequestPermission") {
chrome.permissions.contains({
permissions: [ "webRequest" ]
}, e => {
r({
has: e
});
});
return true;
} else if (e.action === "requestWebRequestPermission") {
chrome.permissions.request({
permissions: [ "webRequest" ]
}, e => {
r({
granted: e
});
});
return true;
} else if (e.action === "removeWebRequestPermission") {
chrome.permissions.remove({
permissions: [ "webRequest" ]
}, e => {
r({
removed: e
});
});
return true;
} else if (e.action === "getGhostProfileRedirect") {
const e = t && t.tab ? t.tab.id : null;
const n = e !== null ? ghostProfilesState.redirects.get(e) : null;
if (e !== null) {
ghostProfilesState.redirects.delete(e);
}
r({
userId: n || null
});
return true;
} else if (e.action === "setStatusSpooferMode") {
const t = normalizeStatusSpooferMode(e.mode);
updateStatusSpooferRules(t);
r({
success: true
});
return true;
} else if (e.action === "injectScript") {
if (t.tab && t.tab.id && e.codeToInject) {
chrome.scripting.executeScript({
target: {
tabId: t.tab.id
},
world: "MAIN",
func: e => {
const t = document.createElement("script");
t.textContent = e;
(document.head || document.documentElement).appendChild(t);
t.remove();
},
args: [ e.codeToInject ]
}).catch(() => {});
}
return true;
} else if (e.action === "injectInfiniteAvatarPatch") {
if (t.tab && t.tab.id) {
chrome.scripting.executeScript({
target: {
tabId: t.tab.id
},
world: "MAIN",
func: injectInfiniteAvatarPatch
}).catch(() => {});
}
return true;
} else if (e.action === "updateContent") {
chrome.tabs.query({
url: "*://*.roblox.com/*"
}, t => {
t.forEach(t => {
chrome.scripting.executeScript({
target: {
tabId: t.id
},
func: e => {
if (e) {
applyChanges();
} else {
revertChanges();
}
},
args: [ e.enabled ]
});
});
});
} else if (e.action === "getServerRegion") {
getSimpleServerRegion(e.serverId, e.placeId).then(e => {
r(e);
}).catch(e => {
r({
region: "??",
regionName: "Unknown",
location: null,
error: e.message
});
});
return true;
} else if (e.action === "getAllServerRegions") {
getAllServerRegions(e.placeId).then(e => {
r(e);
}).catch(e => {
r({
regions: {}
});
});
return true;
} else if (e.action === "searchGames") {
searchGamesInBackground(e.query).then(e => {
r(e);
}).catch(e => {
r({
error: e.message,
results: []
});
});
return true;
} else if (e.action === "getDefaultSettings") {
const e = chrome.runtime.getURL("data/default_settings.json");
fetch(e).then(async e => {
if (!e.ok) throw new Error("Failed to load");
const t = await e.json();
r({
defaultSettings: t
});
}).catch(() => {
r({
defaultSettings: {}
});
});
return true;
} else if (e.action === "fetchAvatarInventory") {
fetchAvatarInventory(e.userId).then(e => {
r(e);
}).catch(e => {
r({
error: e.message,
items: []
});
});
return true;
} else if (e.action === "purpuraEnsureStudioApiKey") {
ensureStudioApiKey(e.forceRefresh === true).then(e => {
r(e);
}).catch(() => {
r({
ok: false,
apiKey: "",
userId: ""
});
});
return true;
} else if (e.action === "purpuraInvalidateStudioApiKey") {
invalidateStudioApiKey().then(e => {
r(e);
}).catch(() => {
r({
ok: false
});
});
return true;
} else if (e.action === "getRobloxTheme") {
const n = e.tabId || (t.tab ? t.tab.id : null);
if (n) {
getRobloxTheme(n).then(e => r({
theme: e
}));
} else {
r({
theme: "light"
});
}
return true;
} else if (e.action === "resetReviewCriteria") {
chrome.storage.local.get([ "purpuraFirstInstalled" ], e => {
chrome.storage.local.set({
purpuraFirstInstalled: e.purpuraFirstInstalled || Date.now(),
purpuraRobloxVisits: 0,
purpuraSettingsOpenedCount: 0,
purpuraReviewPromptShown: false,
purpuraReviewPromptDismissed: false,
purpuraReviewPromptLastShown: null,
purpuraReviewEligible: false
});
});
r({
success: true
});
return true;
} else if (e.action === "reviewCompleted") {
chrome.storage.local.set({
purpuraReviewCompleted: true
});
r({
success: true
});
return true;
} else if (e.action === "fetchProfileInsights") {
fetchProfileInsightsBg(e.userId, e.csrfToken).then(function(e) {
r(e);
}).catch(function(e) {
r(null);
});
return true;
} else if (e.action === "fetchAllFriendInsights") {
fetchAllFriendInsightsBg(e.csrfToken).then(function(e) {
r(e);
}).catch(function(e) {
r({});
});
return true;
} else if (e.action === "fetchGameDetails") {
fetchGameDetailsBg(e.universeId).then(function(e) {
r(e);
}).catch(function(e) {
r({
name: "",
thumbnail: ""
});
});
return true;
} else if (e.action === "unfriendUser") {
unfriendUserBg(e.userId, e.csrfToken).then(function(e) {
r(e);
}).catch(function(e) {
r({
ok: false,
error: e.message
});
});
return true;
}
});

const INVENTORY_CACHE_TTL_MS = 1e3 * 60 * 2;

const THUMBNAIL_CACHE_TTL_MS = 1e3 * 60 * 15;

async function fetchProfileInsightsBg(e, t) {
try {
var r = "https://apis.roblox.com/profile-insights-api/v1/multiProfileInsights";
var n = JSON.stringify({
userIds: [ String(e) ],
rankingStrategy: "tc_info_boost"
});
var a = JSON.stringify({
userIds: [ String(e) ],
rankingStrategy: "profile_info_boost"
});
var o = {
"Content-Type": "application/json"
};
var s = t || studioApiCsrfToken;
if (!s) {
await refreshStudioApiCsrfToken();
s = studioApiCsrfToken;
}
if (s) o["X-CSRF-TOKEN"] = s;
var i = await fetch(r, {
method: "POST",
headers: o,
body: n
});
if (i.status === 403) {
var c = i.headers.get("x-csrf-token");
if (c) {
studioApiCsrfToken = c;
o["X-CSRF-TOKEN"] = c;
i = await fetch(r, {
method: "POST",
headers: o,
body: n
});
}
}
var u = null;
if (i.ok) {
var l = await i.json();
var d = l.userInsights || l.data || [];
if (!Array.isArray(d)) d = [ d ];
if (d.length) u = parseInsightEntryBg(d[0]);
}
var f = await fetch(r, {
method: "POST",
headers: o,
body: a
});
if (f.status === 403) {
var p = f.headers.get("x-csrf-token");
if (p) {
studioApiCsrfToken = p;
o["X-CSRF-TOKEN"] = p;
f = await fetch(r, {
method: "POST",
headers: o,
body: a
});
}
}
if (f.ok) {
var g = await f.json();
var h = g.userInsights || g.data || [];
if (!Array.isArray(h)) h = [ h ];
if (h.length) {
var m = parseInsightEntryBg(h[0]);
if (!u) {
u = m;
} else {
if (m.since && !u.since) u.since = m.since;
if (m.origin !== null && m.origin !== undefined && (u.origin === null || u.origin === undefined)) u.origin = m.origin;
if (m.mostFrequentUniverseId && !u.mostFrequentUniverseId) u.mostFrequentUniverseId = m.mostFrequentUniverseId;
}
}
}
return u;
} catch (e) {
return null;
}
}

function parseInsightEntryBg(e) {
var t = {
since: null,
origin: null,
mostFrequentUniverseId: null
};
var r = e.profileInsights || e.userInsights || e.insights || e.data || [];
if (!Array.isArray(r)) r = [ r ];
for (var n = 0; n < r.length; n++) {
var a = r[n];
if (!a) continue;
if (a.friendshipAgeInsight && a.friendshipAgeInsight.friendsSinceDateTime) {
var o = a.friendshipAgeInsight.friendsSinceDateTime.seconds;
if (o) t.since = o * 1e3;
}
if (a.friendRequestOriginInsight) {
var s = a.friendRequestOriginInsight.friendRequestOriginSource;
if (s !== undefined && s !== null) t.origin = s;
}
if (a.playedTogetherInsight && a.playedTogetherInsight.mostFrequentUniverseId) {
t.mostFrequentUniverseId = a.playedTogetherInsight.mostFrequentUniverseId;
}
}
return t;
}

async function fetchAllFriendInsightsBg(e) {
try {
var t = await fetch("https://users.roblox.com/v1/users/authenticated", {
credentials: "include"
});
if (!t.ok) return {};
var r = await t.json();
var n = String(r.id);
var a = [];
var o = null;
do {
var s = "https://friends.roblox.com/v1/users/" + n + "/friends?limit=200";
if (o) s += "&cursor=" + encodeURIComponent(o);
var i = await fetch(s, {
credentials: "include"
});
if (!i.ok) break;
var c = await i.json();
var u = c.data || [];
for (var l = 0; l < u.length; l++) {
a.push(String(u[l].id));
}
o = c.nextPageCursor || null;
} while (o);
if (!a.length) return {};
var d = {
"Content-Type": "application/json"
};
var f = e || studioApiCsrfToken;
if (!f) {
await refreshStudioApiCsrfToken();
f = studioApiCsrfToken;
}
if (f) d["X-CSRF-TOKEN"] = f;
var p = JSON.stringify({
userIds: a,
rankingStrategy: "tc_info_boost"
});
var g = await fetch("https://apis.roblox.com/profile-insights-api/v1/multiProfileInsights", {
method: "POST",
headers: d,
body: p
});
if (g.status === 403) {
var h = g.headers.get("x-csrf-token");
if (h) {
studioApiCsrfToken = h;
d["X-CSRF-TOKEN"] = h;
g = await fetch("https://apis.roblox.com/profile-insights-api/v1/multiProfileInsights", {
method: "POST",
headers: d,
body: p
});
}
}
var m = {};
if (g.ok) {
var y = await g.json();
mergeInsightsIntoResult(y, m);
}
var S = JSON.stringify({
userIds: a,
rankingStrategy: "profile_info_boost"
});
var v = await fetch("https://apis.roblox.com/profile-insights-api/v1/multiProfileInsights", {
method: "POST",
headers: d,
body: S
});
if (v.status === 403) {
var I = v.headers.get("x-csrf-token");
if (I) {
studioApiCsrfToken = I;
d["X-CSRF-TOKEN"] = I;
v = await fetch("https://apis.roblox.com/profile-insights-api/v1/multiProfileInsights", {
method: "POST",
headers: d,
body: S
});
}
}
if (v.ok) {
var w = await v.json();
mergeInsightsIntoResult(w, m);
}
return m;
} catch (e) {
return {};
}
}

function mergeInsightsIntoResult(e, t) {
var r = e.userInsights || e.data || [];
if (!Array.isArray(r)) r = [ r ];
for (var n = 0; n < r.length; n++) {
var a = r[n];
if (!a) continue;
var o = String(a.targetUser || a.userId || a.id || "");
if (!o) continue;
var s = parseInsightEntryBg(a);
if (!t[o]) {
t[o] = s;
} else {
if (s.since && !t[o].since) t[o].since = s.since;
if (s.origin !== null && s.origin !== undefined && (t[o].origin === null || t[o].origin === undefined)) {
t[o].origin = s.origin;
}
if (s.mostFrequentUniverseId && !t[o].mostFrequentUniverseId) {
t[o].mostFrequentUniverseId = s.mostFrequentUniverseId;
}
}
}
}

async function unfriendUserBg(e, t) {
try {
var r = {
"Content-Type": "application/json"
};
var n = t || studioApiCsrfToken;
if (!n) {
await refreshStudioApiCsrfToken();
n = studioApiCsrfToken;
}
if (n) r["X-CSRF-TOKEN"] = n;
var a = await fetch("https://friends.roblox.com/v1/users/" + encodeURIComponent(e) + "/unfriend", {
method: "POST",
credentials: "include",
headers: r
});
if (a.status === 403) {
var o = a.headers.get("x-csrf-token");
if (o) {
studioApiCsrfToken = o;
r["X-CSRF-TOKEN"] = o;
a = await fetch("https://friends.roblox.com/v1/users/" + encodeURIComponent(e) + "/unfriend", {
method: "POST",
credentials: "include",
headers: r
});
}
}
return {
ok: a.ok,
status: a.status
};
} catch (e) {
return {
ok: false,
error: e.message
};
}
}

var gameDetailsCache = {};

async function fetchGameDetailsBg(e) {
try {
var t = String(e);
if (gameDetailsCache[t]) return gameDetailsCache[t];
var r = await fetch("https://games.roblox.com/v1/games?universeIds=" + encodeURIComponent(e));
if (!r.ok) return {
name: "",
thumbnail: ""
};
var n = await r.json();
var a = n.data || [];
var o = a.length ? a[0].name || "" : "";
var s = a.length ? a[0].rootPlaceId || "" : "";
var i = await fetch("https://thumbnails.roblox.com/v1/games/icons?universeIds=" + encodeURIComponent(e) + "&size=150x150&format=Png&isCircular=false");
var c = "";
if (i.ok) {
var u = await i.json();
var l = u.data || [];
c = l.length ? l[0].imageUrl || "" : "";
}
var d = {
name: o,
thumbnail: c,
rootPlaceId: String(s)
};
gameDetailsCache[t] = d;
return d;
} catch (e) {
return {
name: "",
thumbnail: "",
rootPlaceId: ""
};
}
}

async function fetchAvatarInventory(e) {
if (!e) return {
error: "no userId",
items: []
};
const t = `purpura_inventory_${e}`;
const r = await new Promise(e => chrome.storage.local.get([ t ], e));
const n = r[t];
const a = Date.now();
if (n && a - n.ts < INVENTORY_CACHE_TTL_MS) {
return {
items: n.items,
fromCache: true
};
}
let o = [];
try {
let e = null;
do {
const t = new URL("https://avatar.roblox.com/v1/avatar-inventory");
t.searchParams.set("sortOption", "2");
t.searchParams.set("pageLimit", "50");
if (e) t.searchParams.set("cursor", e);
const r = await fetch(t.toString(), {
credentials: "include"
});
if (!r.ok) break;
const n = await r.json();
if (Array.isArray(n.data)) {
o.push(...n.data);
}
e = n.nextPageCursor || n.nextPageToken || null;
} while (e);
const r = o.map(e => {
const t = e.assetId || e.id;
const r = e.name || e.displayName || e.assetName || "";
const n = e.assetType && (e.assetType.name || e.assetType) || e.type || "";
const a = e.thumbnailUrl || e.imageUrl || e.iconUrl || "";
const o = !!(e.isEquipped || e.isActive);
return {
assetId: t,
name: r,
assetType: n,
thumbnail: a,
isEquipped: o
};
});
await new Promise(e => chrome.storage.local.set({
[t]: {
ts: a,
items: r
}
}, e));
return {
items: r,
fromCache: false
};
} catch (e) {
return {
error: e.message,
items: []
};
}
}

async function getRobloxTheme(e) {
try {
const t = await chrome.scripting.executeScript({
target: {
tabId: e
},
func: () => document.documentElement.classList.contains("dark-theme") || document.body.classList.contains("dark-theme") ? "dark" : "light"
});
return t?.[0]?.result || "light";
} catch {
return "light";
}
}

async function searchGamesInBackground(e) {
try {
const t = crypto.randomUUID();
const r = await fetch(`https://apis.roblox.com/search-api/omni-search?SearchQuery=${encodeURIComponent(e)}&SessionId=${t}`, {
method: "GET",
headers: {
Accept: "application/json"
}
});
if (!r.ok) {
throw new Error(`Search failed: ${r.status}`);
}
const n = await r.json();
const a = [];
if (n.searchResults) {
for (const e of n.searchResults) {
if (e.contentGroupType === "Game" && e.contents) {
a.push(...e.contents);
}
}
}
if (a.length === 0) {
return {
results: []
};
}
const o = a.map(e => e.universeId).filter(e => e);
if (o.length === 0) {
return {
results: []
};
}
const s = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${o.join(",")}&size=150x150&format=Png&isCircular=false`);
let i = {};
if (s.ok) {
const e = await s.json();
const t = e.data || [];
t.forEach(e => {
if (e.targetId && e.imageUrl) {
i[e.targetId] = e.imageUrl;
}
});
}
const c = a.slice(0, 10).map(e => {
const t = i[e.universeId] || "";
return {
id: e.rootPlaceId,
universeId: e.universeId,
name: e.name,
playerCount: e.playerCount || 0,
thumbnail: t
};
});
return {
results: c
};
} catch (e) {
return {
error: e.message,
results: []
};
}
}

async function getSessionKey() {
const e = await chrome.storage.local.get([ "sessionKey" ]);
return e.sessionKey || null;
}

async function setSessionKey(e) {
await chrome.storage.local.set({
sessionKey: e
});
}

async function clearSessionKey() {
await chrome.storage.local.remove([ "sessionKey", "sessionExpiry" ]);
}

async function getRobloxUserId() {
try {
const e = await chrome.storage.local.get([ "robloxUserId" ]);
if (e.robloxUserId) {
return e.robloxUserId;
}
const t = await fetch("https://users.roblox.com/v1/users/authenticated", {
credentials: "include"
});
if (!t.ok) return null;
const r = await t.json();
if (r.id) {
await chrome.storage.local.set({
robloxUserId: r.id
});
return r.id;
}
return null;
} catch (e) {
return null;
}
}

let serverIpMap = null;

let regionCache = new Map;

let lastRequestTime = 0;

const REQUEST_THROTTLE_MS = 500;

async function loadServerListData() {
try {
const e = chrome.runtime.getURL("data/ServerList.json");
const t = await fetch(e);
if (!t.ok) throw new Error(`HTTP error! status: ${t.status}`);
const r = await t.json();
if (Array.isArray(r)) {
serverIpMap = r;
} else {
serverIpMap = r;
}
} catch (e) {
serverIpMap = [];
}
}

async function getSimpleServerRegion(e, t) {
if (regionCache.has(e)) {
return regionCache.get(e);
}
try {
if (!serverIpMap) {
await loadServerListData();
}
const r = await chrome.tabs.query({
url: "*://*.roblox.com/*"
});
if (r.length === 0) {
const t = {
region: "??",
regionName: "Unknown",
location: null
};
regionCache.set(e, t);
return t;
}
const n = r[0];
const a = await chrome.scripting.executeScript({
target: {
tabId: n.id
},
func: async (e, t) => {
async function r() {
try {
const e = await fetch("https://auth.roblox.com/v2/logout", {
method: "POST",
credentials: "include"
});
return e.headers.get("x-csrf-token");
} catch {
return null;
}
}
const n = await r();
if (!n) {
return {
error: "Failed to get CSRF token"
};
}
try {
const r = await fetch(`https://gamejoin.roblox.com/v1/join-game-instance`, {
method: "POST",
headers: {
Accept: "application/json",
"Content-Type": "application/json",
"X-Csrf-Token": n
},
body: JSON.stringify({
placeId: parseInt(t, 10),
isTeleport: false,
gameId: e,
gameJoinAttemptId: crypto.randomUUID(),
isPlayTogetherGame: false
}),
credentials: "include"
});
if (!r.ok) {
return {
error: `HTTP ${r.status}`
};
}
const a = await r.json();
const o = a?.joinScript?.DataCenterId;
if (o) {
return {
dataCenterId: o,
success: true
};
}
const s = a?.joinScript?.UdmuxEndpoints?.[0]?.Address;
if (s) {
return {
ipAddress: s,
success: true
};
}
return {
error: "No region data in response"
};
} catch (e) {
return {
error: e.message
};
}
},
args: [ e, t ]
});
const o = a?.[0]?.result;
if (!o || o.error) {
const t = {
region: "??",
regionName: "Unknown",
location: null
};
regionCache.set(e, t);
return t;
}
let s = "??";
let i = "Unknown";
let c = null;
let u = null;
if (o.dataCenterId) {
const e = serverIpMap.find(e => e.dataCenterId === o.dataCenterId);
if (e && e.location) {
const t = e.location;
const r = t.country;
if (t.latLong && t.latLong.length === 2) {
c = parseFloat(t.latLong[0]);
u = parseFloat(t.latLong[1]);
}
if (r === "US" && t.region) {
const e = getStateCodeFromRegion(t.region);
s = `US-${e}`;
i = `${t.city || t.region}, ${t.region}`;
} else if (r) {
s = r;
i = getRegionDisplayName(r);
}
}
} else if (o.ipAddress) {
const e = o.ipAddress.split(".").slice(0, 3).join(".") + ".0";
const t = serverIpMap.find(t => t.ip === e);
if (t) {
const e = t?.country?.code;
c = t?.latitude;
u = t?.longitude;
if (e === "US" && t.region?.code) {
const e = t.region.code.replace(/-\d+$/, "");
s = `US-${e}`;
i = `${t.region.name || e}, USA`;
} else if (e) {
s = e;
i = getRegionDisplayName(e);
}
}
}
const l = {
region: s,
regionName: i,
location: typeof c === "number" && typeof u === "number" ? {
latitude: c,
longitude: u
} : null
};
regionCache.set(e, l);
return l;
} catch (e) {
const t = {
region: "??",
regionName: "Unknown",
location: null,
error: e.message
};
return t;
}
}

async function getCsrfToken(e) {
try {
const t = await chrome.scripting.executeScript({
target: {
tabId: e
},
func: async () => {
const e = document.querySelector('meta[name="csrf-token"]');
if (e) {
const t = e.getAttribute("content");
if (t) return t;
}
if (window.Roblox && window.Roblox.XsrfToken) {
try {
const e = window.Roblox.XsrfToken.getToken();
if (e) return e;
} catch (e) {}
}
const t = document.querySelector('input[name="__RequestVerificationToken"], input[name="csrf-token"]');
if (t) {
const e = t.value;
if (e) return e;
}
if (window.__CSRF_TOKEN__) {
return window.__CSRF_TOKEN__;
}
const r = document.querySelectorAll("script");
for (let e of r) {
if (e.textContent && e.textContent.includes("csrf") || e.textContent.includes("token")) {
const t = e.textContent.match(/["']([a-zA-Z0-9+/=]{40,})["']/);
if (t && t[1]) {
return t[1];
}
}
}
try {
const e = await fetch("https://auth.roblox.com/v2/logout", {
method: "POST",
credentials: "include"
});
const t = e.headers.get("x-csrf-token");
if (t) return t;
} catch (e) {}
try {
const e = await fetch("https://catalog.roblox.com/v1/search/items/details", {
method: "POST",
credentials: "include",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({})
});
const t = e.headers.get("x-csrf-token");
if (t) return t;
} catch (e) {}
return null;
}
});
const r = t?.[0]?.result || null;
return r;
} catch (e) {
return null;
}
}

async function getAllServerRegions(e) {
try {
if (!serverIpMap) {
await loadServerListData();
}
const t = await fetch(`https://games.roblox.com/v1/games/${e}/servers/Public?limit=100`, {
method: "GET",
headers: {
Accept: "application/json"
}
});
if (!t.ok) {
throw new Error(`Failed to fetch servers: ${t.status}`);
}
const r = await t.json();
const n = r.data || [];
if (n.length === 0) {
return {
regions: {}
};
}
const a = await chrome.tabs.query({
url: "*://*.roblox.com/*"
});
if (a.length === 0) {
return {
regions: {}
};
}
const o = a[0];
const s = await chrome.scripting.executeScript({
target: {
tabId: o.id
},
func: async () => {
try {
const e = await fetch("https://auth.roblox.com/v2/logout", {
method: "POST",
credentials: "include"
});
return e.headers.get("x-csrf-token");
} catch {
return null;
}
}
});
const i = s?.[0]?.result;
if (!i) {
return {
regions: {}
};
}
const c = {};
const u = 10;
for (let t = 0; t < n.length; t += u) {
const r = n.slice(t, t + u);
const a = r.map(async t => {
const r = t.id;
if (regionCache.has(r)) {
return {
serverId: r,
data: regionCache.get(r)
};
}
try {
const t = new Promise((e, t) => setTimeout(() => t(new Error("timeout")), 3e3));
const n = chrome.scripting.executeScript({
target: {
tabId: o.id
},
func: async (e, t, r) => {
try {
const n = new AbortController;
const a = setTimeout(() => n.abort(), 2500);
const o = await fetch(`https://gamejoin.roblox.com/v1/join-game-instance`, {
method: "POST",
headers: {
"Content-Type": "application/json",
"X-Csrf-Token": r
},
body: JSON.stringify({
placeId: parseInt(t, 10),
isTeleport: false,
gameId: e,
gameJoinAttemptId: crypto.randomUUID()
}),
credentials: "include",
signal: n.signal
});
clearTimeout(a);
if (!o.ok) {
return {
error: true,
status: o.status
};
}
const s = await o.json();
const i = s?.joinScript?.DataCenterId;
const c = s?.joinScript?.UdmuxEndpoints?.[0]?.Address;
return {
dataCenterId: i,
ipAddress: c,
fullResponse: s
};
} catch (e) {
return {
error: true,
errorMsg: e.message
};
}
},
args: [ r, e, i ]
});
const a = await Promise.race([ n, t ]);
const s = a?.[0]?.result;
if (s && !s.error) {
return {
serverId: r,
data: s
};
}
} catch (e) {}
return {
serverId: r,
data: null
};
});
const s = await Promise.all(a);
for (const {serverId: e, data: t} of s) {
if (!t) {
continue;
}
let r = "??";
let n = "Unknown";
let a = null;
let o = null;
if (t.dataCenterId) {
const e = serverIpMap.find(e => e.dataCenterId === t.dataCenterId);
if (e && e.location) {
const t = e.location;
const s = t.country;
if (t.latLong && t.latLong.length === 2) {
a = parseFloat(t.latLong[0]);
o = parseFloat(t.latLong[1]);
}
if (s === "US" && t.region) {
const e = getStateCodeFromRegion(t.region);
r = `US-${e}`;
n = `${t.city || t.region}, ${t.region}`;
} else if (s) {
r = s;
n = getRegionDisplayName(s);
}
}
}
if (n === "Unknown" || r === "??") {
n = "N/A";
r = "N/A";
}
const s = {
region: r,
regionName: n,
location: typeof a === "number" && typeof o === "number" ? {
latitude: a,
longitude: o
} : null
};
c[e] = s;
regionCache.set(e, s);
}
if (t + u < n.length) {
await new Promise(e => setTimeout(e, 500));
}
}
return {
regions: c
};
} catch (e) {
return {
regions: {}
};
}
}

function getStateCodeFromRegion(e) {
const t = {
Alabama: "AL",
Alaska: "AK",
Arizona: "AZ",
Arkansas: "AR",
California: "CA",
Colorado: "CO",
Connecticut: "CT",
Delaware: "DE",
Florida: "FL",
Georgia: "GA",
Hawaii: "HI",
Idaho: "ID",
Illinois: "IL",
Indiana: "IN",
Iowa: "IA",
Kansas: "KS",
Kentucky: "KY",
Louisiana: "LA",
Maine: "ME",
Maryland: "MD",
Massachusetts: "MA",
Michigan: "MI",
Minnesota: "MN",
Mississippi: "MS",
Missouri: "MO",
Montana: "MT",
Nebraska: "NE",
Nevada: "NV",
"New Hampshire": "NH",
"New Jersey": "NJ",
"New Mexico": "NM",
"New York": "NY",
"North Carolina": "NC",
"North Dakota": "ND",
Ohio: "OH",
Oklahoma: "OK",
Oregon: "OR",
Pennsylvania: "PA",
"Rhode Island": "RI",
"South Carolina": "SC",
"South Dakota": "SD",
Tennessee: "TN",
Texas: "TX",
Utah: "UT",
Vermont: "VT",
Virginia: "VA",
Washington: "WA",
"West Virginia": "WV",
Wisconsin: "WI",
Wyoming: "WY"
};
return t[e] || e.substring(0, 2).toUpperCase();
}

function getRegionDisplayName(e) {
const t = {
SG: "Singapore",
DE: "Germany",
FR: "France",
JP: "Japan",
BR: "Brazil",
NL: "Netherlands",
"US-CA": "California, USA",
"US-VA": "Virginia, USA",
"US-IL": "Illinois, USA",
"US-TX": "Texas, USA",
"US-FL": "Florida, USA",
"US-NY": "New York, USA",
"US-WA": "Washington, USA",
"US-NJ": "New Jersey, USA",
"US-OR": "Oregon, USA",
"US-OH": "Ohio, USA",
AU: "Australia",
GB: "United Kingdom",
IN: "India"
};
return t[e] || e;
}

async function getServerRegion(e) {
if (regionCache.has(e)) {
return regionCache.get(e);
}
const t = Date.now();
const r = t - lastRequestTime;
if (r < REQUEST_THROTTLE_MS) {
const e = REQUEST_THROTTLE_MS - r;
await new Promise(t => setTimeout(t, e));
}
lastRequestTime = Date.now();
try {
if (!serverIpMap) {
await loadServerListData();
}
const t = await chrome.tabs.query({
url: "*://*.roblox.com/*"
});
if (t.length === 0) {
const t = {
region: "??",
regionName: "Unknown",
location: null,
error: "No Roblox tabs"
};
regionCache.set(e, t);
return t;
}
const r = t[0];
let n;
try {
n = await chrome.scripting.executeScript({
target: {
tabId: r.id
},
func: async e => {
if (!e) {
return {
error: "No server ID provided"
};
}
async function t() {
try {
const e = await fetch("https://auth.roblox.com/v2/logout", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
credentials: "include"
});
const t = e.headers.get("x-csrf-token");
if (t) {
return t;
} else {
const e = document.querySelector('meta[name="csrf-token"]');
if (e) {
return e.getAttribute("content");
}
return null;
}
} catch (e) {
const t = document.querySelector('meta[name="csrf-token"]');
if (t) {
return t.getAttribute("content");
}
return null;
}
}
function r(e) {
const t = {
Alabama: "AL",
Alaska: "AK",
Arizona: "AZ",
Arkansas: "AR",
California: "CA",
Colorado: "CO",
Connecticut: "CT",
Delaware: "DE",
Florida: "FL",
Georgia: "GA",
Hawaii: "HI",
Idaho: "ID",
Illinois: "IL",
Indiana: "IN",
Iowa: "IA",
Kansas: "KS",
Kentucky: "KY",
Louisiana: "LA",
Maine: "ME",
Maryland: "MD",
Massachusetts: "MA",
Michigan: "MI",
Minnesota: "MN",
Mississippi: "MS",
Missouri: "MO",
Montana: "MT",
Nebraska: "NE",
Nevada: "NV",
"New Hampshire": "NH",
"New Jersey": "NJ",
"New Mexico": "NM",
"New York": "NY",
"North Carolina": "NC",
"North Dakota": "ND",
Ohio: "OH",
Oklahoma: "OK",
Oregon: "OR",
Pennsylvania: "PA",
"Rhode Island": "RI",
"South Carolina": "SC",
"South Dakota": "SD",
Tennessee: "TN",
Texas: "TX",
Utah: "UT",
Vermont: "VT",
Virginia: "VA",
Washington: "WA",
"West Virginia": "WV",
Wisconsin: "WI",
Wyoming: "WY"
};
return t[e] || e.substring(0, 2).toUpperCase();
}
const n = window.location.href;
let a = null;
const o = /https:\/\/www\.roblox\.com\/(?:[a-z]{2}\/)?games\/(\d+)/;
const s = n.match(o);
if (s && s[1]) {
a = parseInt(s[1], 10);
} else {
return {
error: "Could not extract placeId from URL"
};
}
try {
const e = await fetch("https://users.roblox.com/v1/users/authenticated", {
credentials: "include"
});
if (!e.ok) {
return {
error: "User not logged in to Roblox"
};
}
const t = await e.json();
} catch (e) {
return {
error: "Failed to verify login status"
};
}
try {
const e = await fetch("https://www.roblox.com/", {
credentials: "include"
});
} catch (e) {}
try {
let r = await t();
if (!r) {
return {
error: "Failed to get CSRF token"
};
}
let n;
let o = false;
let s = 0;
const i = 3;
do {
o = false;
if (s > 0) {
await new Promise(e => setTimeout(e, 1e3 + s * 500));
}
n = await fetch(`https://gamejoin.roblox.com/v1/join-game-instance`, {
method: "POST",
headers: {
Accept: "application/json, text/plain, */*",
"Accept-Language": "en-US,en;q=0.9",
"Cache-Control": "no-cache",
"Content-Type": "application/json",
Pragma: "no-cache",
Referer: `https://www.roblox.com/games/${a}/`,
Origin: "https://www.roblox.com",
"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
"X-Csrf-Token": r,
"Sec-Ch-Ua": '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
"Sec-Ch-Ua-Mobile": "?0",
"Sec-Ch-Ua-Platform": '"Windows"',
"Sec-Fetch-Dest": "empty",
"Sec-Fetch-Mode": "cors",
"Sec-Fetch-Site": "same-site"
},
body: JSON.stringify({
placeId: parseInt(a, 10),
isTeleport: false,
gameId: e,
gameJoinAttemptId: crypto.randomUUID(),
isPlayTogetherGame: false
}),
credentials: "include"
});
if (n.status === 403 && n.headers.get("x-csrf-token") && s < i) {
r = await t();
if (!r) {
return {
error: "Failed to refresh CSRF token"
};
}
o = true;
s++;
} else if (n.status === 429 && s < i) {
o = true;
s++;
} else if (n.status >= 500 && s < i) {
o = true;
s++;
} else if (!n.ok) {
return {
error: `Request failed: ${n.status}`
};
}
} while (o);
const c = await n.json();
if (c?.message && c.message.includes("Unable to join Game")) {
if (c?.joinScript?.DataCenterId) {}
}
if (c?.joinScript?.DataCenterId) {
const e = c.joinScript.DataCenterId;
return {
dataCenterId: e,
success: true,
serverInfo: c,
method: "datacenter"
};
}
if (c?.joinScript?.UdmuxEndpoints?.[0]?.Address) {
let e = c.joinScript.UdmuxEndpoints[0].Address;
e = e.split(".").slice(0, 3).join(".") + ".0";
return {
ipAddress: e,
success: true,
serverInfo: c,
method: "ip"
};
}
return {
error: "No region data available",
serverInfo: c
};
} catch (e) {
return {
error: e.message
};
}
},
args: [ e ]
});
} catch (e) {
return {
region: "??",
regionName: "Unknown",
location: null,
error: `Script execution failed: ${e.message}`
};
}
const a = n?.[0]?.result;
if (!a || a.error) {
return {
region: "??",
regionName: "Unknown",
location: null,
error: a?.error || "Failed to get server info"
};
}
let o = "??";
let s = "Unknown";
let i = null;
let c = null;
if (a.success && a.dataCenterId) {
if (serverIpMap && Array.isArray(serverIpMap)) {
const e = serverIpMap.find(e => e.dataCenterId === a.dataCenterId);
if (e) {
const t = e.location?.country;
if (e.location?.latLong && e.location.latLong.length === 2) {
i = parseFloat(e.location.latLong[0]);
c = parseFloat(e.location.latLong[1]);
}
if (t === "US" && e.location?.region) {
let r = getStateCodeFromRegion(e.location.region);
if (r) {
o = `US-${r}`;
s = `${e.location.region}, USA`;
} else {
o = t;
s = getRegionDisplayName(t);
}
} else if (t) {
o = t;
s = getRegionDisplayName(t);
}
}
}
} else if (a.success && a.method === "ip" && a.ipAddress) {
let e = a.ipAddress;
if (serverIpMap && Array.isArray(serverIpMap)) {
const t = serverIpMap.find(t => t.ip === e);
if (t) {
const e = t?.country?.code;
i = t?.latitude;
c = t?.longitude;
if (e === "US" && t.region?.code) {
let e = t.region.code.replace(/-\d+$/, "");
o = `US-${e}`;
s = `${t.region.name || e}, USA`;
} else if (e) {
o = e;
s = getRegionDisplayName(e);
}
}
}
}
let u = null;
if (a.serverInfo?.joinScript?.SessionId) {
try {
const e = JSON.parse(a.serverInfo.joinScript.SessionId || "{}");
const t = e?.Latitude;
const r = e?.Longitude;
if (typeof t === "number" && typeof r === "number") {
u = {
latitude: t,
longitude: r
};
}
} catch (e) {}
}
const l = {
region: o,
regionName: s,
location: typeof i === "number" && typeof c === "number" ? {
latitude: i,
longitude: c
} : null,
userLocation: u,
dataCenterId: a.dataCenterId
};
regionCache.set(e, l);
return l;
} catch (e) {
return {
region: "??",
regionName: "Unknown",
location: null,
error: e.message
};
}
}

loadServerListData();

chrome.declarativeNetRequest.updateDynamicRules({
removeRuleIds: [ 1 ],
addRules: [ {
id: 1,
priority: 1,
action: {
type: "modifyHeaders",
requestHeaders: [ {
header: "User-Agent",
operation: "set",
value: "Roblox/WinInet"
} ]
},
condition: {
urlFilter: "https://gamejoin.roblox.com/v1/join-game-instance",
resourceTypes: [ "xmlhttprequest" ]
}
} ]
}).catch(() => {});

const ICON_PATHS = {
default: {
16: "images/icons/default/Purpura_Default_Logo_16.png",
48: "images/icons/default/Purpura_Default_Logo_48.png",
128: "images/icons/default/Purpura_Default_Logo_128.png"
},
newYears: {
16: "images/icons/newYears/Purpura_NewYears_Logo_16.png",
48: "images/icons/newYears/Purpura_NewYears_Logo_48.png",
128: "images/icons/newYears/Purpura_NewYears_Logo_128.png"
},
lunarNewYear: {
16: "images/icons/lunarNewYear/Purpura_LunarNewYear_Logo_16.png",
48: "images/icons/lunarNewYear/Purpura_LunarNewYear_Logo_48.png",
128: "images/icons/lunarNewYear/Purpura_LunarNewYear_Logo_128.png"
},
valentines: {
16: "images/icons/valentines/Purpura_Valentines_Logo_16.png",
48: "images/icons/valentines/Purpura_Valentines_Logo_48.png",
128: "images/icons/valentines/Purpura_Valentines_Logo_128.png"
},
blackHistory: {
16: "images/icons/blackHistory/Purpura_BlackHistory_Logo_16.png",
48: "images/icons/blackHistory/Purpura_BlackHistory_Logo_48.png",
128: "images/icons/blackHistory/Purpura_BlackHistory_Logo_128.png"
},
stPatricksDay: {
16: "images/icons/stPatricksDay/Purpura_StPatricks_Logo_16.png",
48: "images/icons/stPatricksDay/Purpura_StPatricks_Logo_48.png",
128: "images/icons/stPatricksDay/Purpura_StPatricks_Logo_128.png"
},
womensDay: {
16: "images/icons/womensDay/Purpura_WomensDay_Logo_16.png",
48: "images/icons/womensDay/Purpura_WomensDay_Logo_48.png",
128: "images/icons/womensDay/Purpura_WomensDay_Logo_128.png"
},
easter: {
16: "images/icons/easter/Purpura_Easter_Logo_16.png",
48: "images/icons/easter/Purpura_Easter_Logo_48.png",
128: "images/icons/easter/Purpura_Easter_Logo_128.png"
},
pride: {
16: "images/icons/pride/Purpura_Pride_Logo_16.png",
48: "images/icons/pride/Purpura_Pride_Logo_48.png",
128: "images/icons/pride/Purpura_Pride_Logo_128.png"
},
halloween: {
16: "images/icons/halloween/Purpura_Halloween_Logo_16.png",
48: "images/icons/halloween/Purpura_Halloween_Logo_48.png",
128: "images/icons/halloween/Purpura_Halloween_Logo_128.png"
},
diwali: {
16: "images/icons/diwali/Purpura_Diwali_Logo_16.png",
48: "images/icons/diwali/Purpura_Diwali_Logo_48.png",
128: "images/icons/diwali/Purpura_Diwali_Logo_128.png"
},
hanukkah: {
16: "images/icons/hanukkah/Purpura_Hanukkah_Logo_16.png",
48: "images/icons/hanukkah/Purpura_Hanukkah_Logo_48.png",
128: "images/icons/hanukkah/Purpura_Hanukkah_Logo_128.png"
},
christmas: {
16: "images/icons/christmas/Purpura_Christmas_Logo_16.png",
48: "images/icons/christmas/Purpura_Christmas_Logo_48.png",
128: "images/icons/christmas/Purpura_Christmas_Logo_128.png"
}
};

function calculateEaster(e) {
const t = e % 19;
const r = Math.floor(e / 100);
const n = e % 100;
const a = Math.floor(r / 4);
const o = r % 4;
const s = Math.floor((r + 8) / 25);
const i = Math.floor((r - s + 1) / 3);
const c = (19 * t + r - a - i + 15) % 30;
const u = Math.floor(n / 4);
const l = n % 4;
const d = (32 + 2 * o + 2 * u - c - l) % 7;
const f = Math.floor((t + 11 * c + 22 * d) / 451);
const p = Math.floor((c + d - 7 * f + 114) / 31);
const g = (c + d - 7 * f + 114) % 31 + 1;
return {
month: p,
day: g
};
}

function buildSeasons() {
const e = (new Date).getFullYear();
const t = calculateEaster(e);
const r = new Date(e, t.month - 1, t.day - 3);
const n = new Date(e, t.month - 1, t.day + 1);
return [ {
name: "newYears",
start: [ 12, 28 ],
end: [ 1, 2 ]
}, {
name: "lunarNewYear",
start: [ 1, 22 ],
end: [ 2, 15 ]
}, {
name: "valentines",
start: [ 2, 7 ],
end: [ 2, 15 ]
}, {
name: "blackHistory",
start: [ 2, 1 ],
end: [ 2, 28 ]
}, {
name: "stPatricksDay",
start: [ 3, 15 ],
end: [ 3, 18 ]
}, {
name: "womensDay",
start: [ 3, 6 ],
end: [ 3, 10 ]
}, {
name: "easter",
start: [ r.getMonth() + 1, r.getDate() ],
end: [ n.getMonth() + 1, n.getDate() ]
}, {
name: "pride",
start: [ 6, 1 ],
end: [ 6, 30 ]
}, {
name: "halloween",
start: [ 10, 17 ],
end: [ 11, 1 ]
}, {
name: "diwali",
start: [ 10, 15 ],
end: [ 11, 15 ]
}, {
name: "hanukkah",
start: [ 11, 25 ],
end: [ 12, 30 ]
}, {
name: "christmas",
start: [ 12, 18 ],
end: [ 12, 25 ]
} ];
}

let SEASONS = buildSeasons();

function isDateInRange(e, t, [r, n], [a, o]) {
const s = (new Date).getFullYear();
const i = new Date(s, r - 1, n);
let c = new Date(s, a - 1, o);
if (c < i) c.setFullYear(s + 1);
const u = new Date(s, e - 1, t);
return u >= i && u <= c;
}

function getSeasonalIcon() {
const e = new Date;
const t = e.getMonth() + 1;
const r = e.getDate();
for (const e of SEASONS) {
if (isDateInRange(t, r, e.start, e.end)) {
return ICON_PATHS[e.name];
}
}
return ICON_PATHS.default;
}

function updateExtensionIcon() {
SEASONS = buildSeasons();
const e = getSeasonalIcon();
chrome.action.setIcon({
path: e
});
}

updateExtensionIcon();

const nextMidnight = new Date;

nextMidnight.setHours(24, 0, 0, 0);

setTimeout(() => {
updateExtensionIcon();
setInterval(updateExtensionIcon, 24 * 60 * 60 * 1e3);
}, nextMidnight.getTime() - Date.now());

chrome.runtime.onMessage.addListener((e, t, r) => {
if (e.action === "getSeasonalIconUrl") {
const e = getSeasonalIcon();
r({
iconUrl: chrome.runtime.getURL(e[48])
});
return true;
}
});

function escapeXml(e) {
return e.replace(/[<>&'"]/g, e => {
switch (e) {
case "<":
return "&lt;";

case ">":
return "&gt;";

case "&":
return "&amp;";

case "'":
return "&apos;";

case '"':
return "&quot;";

default:
return e;
}
});
}

function formatPlayerCount(e) {
if (typeof e !== "number") return "0";
if (e >= 1e6) return (e / 1e6).toFixed(1) + "M";
if (e >= 1e3) return (e / 1e3).toFixed(1) + "K";
return e.toLocaleString("en-US");
}

async function cacheDefaultSettings() {
try {
const e = chrome.runtime.getURL("data/default_settings.json");
const t = await fetch(e);
if (!t.ok) return;
const r = await t.json();
chrome.storage.local.set({
purpuraDefaultSettings: r
});
} catch (e) {}
}

cacheDefaultSettings();

try {
importScripts("content/core/sk-migrate.js");
} catch (e) {
console.warn("[Purpura] Storage migration script unavailable:", e);
}

async function runPurpuraStorageMigration() {
if (!self.PurpuraStorageMigrate || typeof self.PurpuraStorageMigrate.migrateStorageKeys !== "function") {
return {
migrated: 0,
success: false,
error: "migration_unavailable"
};
}
try {
return await self.PurpuraStorageMigrate.migrateStorageKeys();
} catch (e) {
return {
migrated: 0,
success: false,
error: e.message
};
}
}

function updateStatusSpooferRules(e) {
const t = e === "offline";
chrome.declarativeNetRequest.updateEnabledRulesets(t ? {
enableRulesetIds: [ "offline_mode" ]
} : {
disableRulesetIds: [ "offline_mode" ]
});
}

function normalizeStatusSpooferMode(e) {
if (typeof e === "object" && e !== null) {
if (e.enabled !== true) return "off";
return normalizeStatusSpooferMode(e.mode);
}
if (e === true) return "offline";
if (e === false || e === undefined || e === null) return "off";
const t = String(e).toLowerCase();
if (t === "offline" || t === "studio" || t === "in-studio" || t === "off") return t === "in-studio" ? "studio" : t;
return "off";
}

chrome.runtime.onInstalled.addListener(() => {
(async () => {
const e = chrome.runtime.getManifest().version;
const {lastSeenVersion: t} = await chrome.storage.local.get("lastSeenVersion");
if (e !== t) {
chrome.tabs.create({
url: chrome.runtime.getURL("new.html")
});
await chrome.storage.local.set({
lastSeenVersion: e
});
}
})().catch(() => {});
runPurpuraStorageMigration().catch(() => {});
(async () => {
const e = await chrome.storage.local.get([ "purpuraFirstInstalled", "purpuraRobloxVisits", "purpuraSettingsOpenedCount", "purpuraReviewPromptShown", "purpuraReviewPromptDismissed", "purpuraReviewCompleted" ]);
if (!e.purpuraFirstInstalled) {
await chrome.storage.local.set({
purpuraFirstInstalled: Date.now(),
purpuraRobloxVisits: 0,
purpuraSettingsOpenedCount: 0,
purpuraReviewPromptShown: false,
purpuraReviewPromptDismissed: false,
purpuraReviewPromptLastShown: null,
purpuraReviewCompleted: false
});
}
})().catch(() => {});
fetch(chrome.runtime.getURL("data/default_settings.json")).then(e => e.ok ? e.json() : {}).then(e => {
if (!e || !Object.keys(e).length) return;
const t = new Set([ "ghos", "hpt", "unc", "uncConfig", "pcr", "pt", "thm", "thmEnabled", "rat", "lts", "sdbr", "bwr", "stm", "lb", "rae", "ob", "gr", "sap" ]);
const r = new Set([ "spc-legacy" ]);
const n = {};
const a = {};
chrome.storage.sync.get(Object.keys(e), o => {
chrome.storage.local.get(Object.keys(e), s => {
for (const [i, c] of Object.entries(e)) {
if (r.has(i)) continue;
const e = t.has(i) ? s[i] : o[i];
if (e !== undefined) continue;
if (t.has(i)) {
a[i] = c;
} else {
n[i] = c;
}
}
if (Object.keys(n).length) chrome.storage.sync.set(n);
if (Object.keys(a).length) chrome.storage.local.set(a);
});
});
}).catch(() => {});
chrome.storage.sync.get([ "spc", "spc-legacy" ], e => {
let t = "off";
if (e["spc"] !== undefined) {
t = normalizeStatusSpooferMode(e["spc"]);
if (typeof e["spc"] !== "object" || e["spc"] === null) {
const e = t !== "off";
chrome.storage.sync.set({
spc: {
enabled: e,
mode: t === "off" ? "offline" : t
}
});
}
} else if (e["spc-legacy"] !== undefined) {
t = normalizeStatusSpooferMode(e["spc-legacy"]);
chrome.storage.sync.set({
spc: {
enabled: !!e["spc-legacy"],
mode: "offline"
}
});
}
updateStatusSpooferRules(t);
});
cacheDefaultSettings();
initializeStudioApiKey();
});

chrome.runtime.onStartup.addListener(() => {
runPurpuraStorageMigration().catch(() => {});
chrome.storage.sync.get([ "spc", "spc-legacy" ], e => {
let t = "off";
if (e["spc"] !== undefined) {
t = normalizeStatusSpooferMode(e["spc"]);
if (typeof e["spc"] !== "object" || e["spc"] === null) {
const e = t !== "off";
chrome.storage.sync.set({
spc: {
enabled: e,
mode: t === "off" ? "offline" : t
}
});
}
} else if (e["spc-legacy"] !== undefined) {
t = normalizeStatusSpooferMode(e["spc-legacy"]);
chrome.storage.sync.set({
spc: {
enabled: !!e["spc-legacy"],
mode: "offline"
}
});
}
updateStatusSpooferRules(t);
});
cacheDefaultSettings();
initializeStudioApiKey();
});

chrome.storage.onChanged.addListener((e, t) => {
if (t !== "sync") return;
if (e["spc"]) {
updateStatusSpooferRules(normalizeStatusSpooferMode(e["spc"].newValue));
} else if (e["spc-legacy"]) {
const t = !!e["spc-legacy"].newValue;
const r = t ? "offline" : "off";
updateStatusSpooferRules(r);
chrome.storage.sync.set({
spc: {
enabled: t,
mode: "offline"
}
});
}
});

const ghostProfilesState = {
redirects: new Map
};

function handleGhostProfilesRedirect(e) {
if (!e || typeof e.url !== "string") return;
const t = e.url.match(/\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?users\/(\d+)\/profile/i);
if (!t || !t[1]) return;
if (typeof e.tabId !== "number") return;
ghostProfilesState.redirects.set(e.tabId, t[1]);
}

function updateGhostProfilesListener() {
if (!chrome.webRequest) return;
chrome.storage.local.get([ "ghos" ], e => {
const t = e["ghos"] || {};
const r = !!t.enabled;
const n = !!t.webRequestPermission;
const a = () => {
if (chrome.webRequest.onBeforeRedirect.hasListener(handleGhostProfilesRedirect)) {
chrome.webRequest.onBeforeRedirect.removeListener(handleGhostProfilesRedirect);
}
};
if (!r || !n) {
a();
return;
}
chrome.permissions.contains({
permissions: [ "webRequest" ]
}, e => {
if (!e) {
a();
return;
}
if (!chrome.webRequest.onBeforeRedirect.hasListener(handleGhostProfilesRedirect)) {
chrome.webRequest.onBeforeRedirect.addListener(handleGhostProfilesRedirect, {
urls: [ "*://www.roblox.com/users/*/profile*", "*://www.roblox.comprofile*" ]
});
}
});
});
}

chrome.storage.onChanged.addListener((e, t) => {
if (t !== "local") return;
if (e["ghos"]) {
updateGhostProfilesListener();
}
});

chrome.permissions.onAdded.addListener(() => {
updateGhostProfilesListener();
});

chrome.permissions.onRemoved.addListener(() => {
updateGhostProfilesListener();
});

updateGhostProfilesListener();

initializeStudioApiKey();

function purpuraRemadeNormalizeMethod(e, t = "GET") {
const r = String(t || "GET").trim().toUpperCase() || "GET";
const n = String(e || r).trim().toUpperCase();
return new Set([ "GET", "POST", "PUT", "PATCH", "DELETE", "HEAD" ]).has(n) ? n : r;
}

function purpuraRemadeArrayBufferToBase64(e) {
const t = new Uint8Array(e);
const r = 32768;
let n = "";
for (let e = 0; e < t.length; e += r) {
const a = t.subarray(e, e + r);
n += String.fromCharCode(...a);
}
return btoa(n);
}

chrome.runtime.onMessage.addListener((e, t, r) => {
if (!e || e.type !== "PURPURA_FETCH_RESOURCE_REQUEST") {
return;
}
(async () => {
try {
const t = new Headers;
if (typeof e.csrfToken === "string" && e.csrfToken) {
t.set("X-CSRF-TOKEN", e.csrfToken);
}
if (typeof e.boundAuthToken === "string" && e.boundAuthToken) {
t.set("x-bound-auth-token", e.boundAuthToken);
}
t.set("Accept", e.accept || "text/plain, application/json;q=0.9, */*;q=0.8");
t.set("Referer", "https://www.roblox.com/");
if (e.headers && typeof e.headers === "object") {
Object.entries(e.headers).forEach(([e, r]) => {
if (typeof e === "string" && e && typeof r === "string" && r) {
t.set(e, r);
}
});
}
const n = purpuraRemadeNormalizeMethod(e.method, "GET");
const a = typeof e.body === "string" && e.body.length > 0 ? e.body : undefined;
const o = n === "GET" || n === "HEAD" ? undefined : a;
if (o && !t.has("content-type")) {
t.set("content-type", "application/json");
}
if (e.useStudioApiKey === true) {
const e = await ensureStudioApiKey(false);
if (e && e.ok && typeof e.apiKey === "string" && e.apiKey) {
t.set("x-api-key", e.apiKey);
}
}
const s = () => fetch(e.url, {
method: n,
credentials: "include",
headers: t,
body: o
});
let i = await s();
if (e.useStudioApiKey === true && (i.status === 401 || i.status === 403)) {
await invalidateStudioApiKey();
const e = await ensureStudioApiKey(true);
if (e && e.ok && typeof e.apiKey === "string" && e.apiKey) {
t.set("x-api-key", e.apiKey);
i = await s();
}
}
if (e.responseType === "arraybuffer") {
const e = await i.arrayBuffer();
r({
ok: i.ok,
status: i.status,
contentType: i.headers.get("content-type") || "",
csrfToken: i.headers.get("x-csrf-token") || "",
boundAuthToken: i.headers.get("x-bound-auth-token") || "",
base64: purpuraRemadeArrayBufferToBase64(e)
});
return;
}
r({
ok: i.ok,
status: i.status,
contentType: i.headers.get("content-type") || "",
csrfToken: i.headers.get("x-csrf-token") || "",
boundAuthToken: i.headers.get("x-bound-auth-token") || "",
text: await i.text()
});
} catch (e) {
r({
ok: false,
status: 0,
contentType: "",
text: e?.message || String(e)
});
}
})();
chrome.tabs.onUpdated.addListener((e, t, r) => {
if (t.status !== "complete") return;
if (!r.url || !r.url.includes("roblox.com")) return;
if (r.url.includes("create.roblox.com") || r.url.includes("devforum.roblox.com")) return;
chrome.storage.local.get([ "purpuraFirstInstalled", "purpuraRobloxVisits", "purpuraSettingsOpened", "purpuraReviewPromptShown", "purpuraReviewCompleted" ], e => {
if (e.purpuraReviewPromptShown || e.purpuraReviewCompleted) return;
const t = 7 * 24 * 60 * 60 * 1e3;
const n = e.purpuraFirstInstalled && Date.now() - e.purpuraFirstInstalled >= t;
const a = (e.purpuraRobloxVisits || 0) + 1;
const o = {
purpuraRobloxVisits: a
};
const s = (e.purpuraSettingsOpenedCount || 0) + (r.url.includes("purpura=") ? 1 : 0);
if (r.url.includes("purpura=")) {
o.purpuraSettingsOpenedCount = s;
}
if (n && a >= 15 && s >= 2) {
o.purpuraReviewEligible = true;
}
chrome.storage.local.set(o);
});
});
return true;
});

chrome.runtime.onMessage.addListener((e, t, r) => {
if (e.type === "GET_USER_ID") {
getRobloxUserId().then(e => {
if (!e) {}
r({
userId: e
});
}).catch(e => {
r({
userId: null
});
});
return true;
}
});

(function() {
"use strict";
var e = "purpura_playtime";
var t = "purpura_playtime_daily";
var r = "purpura_playtime_sessions";
var n = "purpura_playtime_tracking";
var a = "purpura_playtime_userid";
var o = "purpura-playtime-poll";
var s = .5;
var i = 3e4;
var c = 2 * 60 * 1e3;
var u = 500;
var l = 90;
var d = false;
var f = null;
var p = null;
var g = false;
var h = null;
function m(e, t) {
return new Promise(function(r) {
chrome.storage.local.get([ e ], function(n) {
r(n[e] !== undefined ? n[e] : t);
});
});
}
function y(e, t) {
return new Promise(function(r) {
var n = {};
n[e] = t;
chrome.storage.local.set(n, r);
});
}
function S(e) {
var t = new Date(e || Date.now());
return t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");
}
async function v() {
if (f) return f;
var e = await m(a, null);
if (e) {
f = parseInt(e, 10);
return f;
}
try {
var t = await fetch("https://users.roblox.com/v1/users/authenticated", {
credentials: "include"
});
if (t.ok) {
var r = await t.json();
if (r && r.id) {
f = r.id;
await y(a, f);
return f;
}
}
} catch (e) {}
return null;
}
async function I(e) {
try {
var t = await fetch("https://presence.roblox.com/v1/presence/users", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
userIds: [ e ]
})
});
if (!t.ok) return null;
var r = await t.json();
if (r.userPresences && r.userPresences.length > 0) {
return r.userPresences[0];
}
} catch (e) {}
return null;
}
async function w(e) {
try {
var t = await fetch("https://games.roblox.com/v1/games/multiget-place-details?placeIds=" + encodeURIComponent(e));
if (!t.ok) return null;
var r = await t.json();
if (r && r.length > 0 && r[0].universeId) {
return r[0].universeId;
}
} catch (e) {}
return null;
}
async function A(n, a, o, s) {
if (!n || !s || s === "Unknown Game") return;
var c = Date.now();
var d = c - n;
if (d < i) return;
var f = Math.max(1, Math.round(d / 6e4));
var p = await m(e, {
games: {}
});
var g = await m(t, []);
var h = await m(r, []);
if (!p.games) p.games = {};
var v = a || "unknown_" + n;
var I = p.games[v] || {
universeId: a,
rootPlaceId: o || null,
name: s,
totalMinutes: 0,
lastPlayed: 0,
sessions: 0,
firstPlayedAt: c
};
I.totalMinutes += f;
I.lastPlayed = c;
I.sessions = (I.sessions || 0) + 1;
if (o && !I.rootPlaceId) I.rootPlaceId = o;
if (s && s !== "Unknown Game") I.name = s;
p.games[v] = I;
var w = S(n);
var A = g.find(function(e) {
return e.date === w;
});
if (!A) {
A = {
date: w,
totalMinutes: 0,
games: {}
};
g.unshift(A);
}
A.totalMinutes += f;
A.games[v] = (A.games[v] || 0) + f;
if (g.length > l) g = g.slice(0, l);
h.unshift({
id: n + "-" + Math.random().toString(36).substring(2, 8),
universeId: a,
rootPlaceId: o || null,
gameName: s,
startTime: n,
endTime: c,
durationMinutes: f
});
if (h.length > u) h = h.slice(0, u);
await Promise.all([ y(e, p), y(t, g), y(r, h) ]);
}
async function b() {
if (g) return;
g = true;
try {
await C();
if (!d) return;
var e = await v();
if (!e) return;
var t = Date.now();
var r = await I(e);
if (!r) {
if (p && p.lastSeenAt && t - p.lastSeenAt >= c) {
var a = p;
p = null;
await y(n, null);
await A(a.sessionStart, a.universeId, a.rootPlaceId, a.gameName);
}
return;
}
var o = r.userPresenceType;
if (o !== 2) {
if (p) {
var s = p;
p = null;
await y(n, null);
await A(s.sessionStart, s.universeId, s.rootPlaceId, s.gameName);
}
return;
}
var i = r.placeId || null;
var u = r.universeId || null;
if (!u && i) {
u = await w(i);
if (!u) u = i;
}
var l = r.lastLocation || null;
var f = r.rootPlaceId || null;
var h = false;
if (p) {
if (u && p.universeId) {
h = String(u) === String(p.universeId);
} else if (i && p.placeId) {
h = String(i) === String(p.placeId);
} else {
h = true;
}
}
if (p && p.lastSeenAt && t - p.lastSeenAt >= c) {
var m = p;
p = null;
await y(n, null);
await A(m.sessionStart, m.universeId, m.rootPlaceId, m.gameName);
}
if (!p || !h) {
if (p) {
var S = p;
p = null;
await y(n, null);
await A(S.sessionStart, S.universeId, S.rootPlaceId, S.gameName);
}
p = {
sessionStart: t,
lastSeenAt: t,
universeId: u,
placeId: i,
rootPlaceId: f,
gameName: l || "Unknown Game"
};
await y(n, p);
return;
}
var b = false;
p.lastSeenAt = t;
if (u && p.universeId !== u) {
p.universeId = u;
b = true;
}
if (i && p.placeId !== i) {
p.placeId = i;
b = true;
}
if (f && p.rootPlaceId !== f) {
p.rootPlaceId = f;
b = true;
}
if (l && l !== "Unknown Game" && p.gameName !== l) {
p.gameName = l;
b = true;
}
if (b || p.lastSeenAt === t) await y(n, p);
} catch (e) {} finally {
g = false;
}
}
async function _() {
var e = await new Promise(function(e) {
chrome.storage.sync.get([ "plt" ], function(t) {
e(t);
});
});
d = !!(e.plt && e.plt.enabled !== false);
p = await m(n, null);
if (p && !p.lastSeenAt) {
p = null;
await y(n, null);
}
}
function C() {
if (!h) {
h = _().catch(function() {});
}
return h;
}
chrome.storage.onChanged.addListener(function(e, t) {
if (t === "sync" && e.plt) {
d = !!(e.plt.newValue && e.plt.newValue.enabled !== false);
}
});
chrome.runtime.onMessage.addListener(function(e, t, r) {
if (!e || e.action !== "refreshPlaytimePresence") return;
b().then(function() {
r({
success: true,
enabled: d
});
}).catch(function() {
r({
success: false,
enabled: d
});
});
return true;
});
chrome.alarms.create(o, {
periodInMinutes: s
});
chrome.alarms.onAlarm.addListener(function(e) {
if (e.name === o) {
b();
}
});
h = _().catch(function() {});
h.then(function() {
b();
});
purpuraAvatarCyclerUpdate();
})();
