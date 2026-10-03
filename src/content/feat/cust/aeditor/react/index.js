/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
const e = {
Recent: {
Recent: [ 2, 8, 11, 12, 17, 18, 19, 27, 28, 29, 30, 31, 41, 42, 43, 44, 45, 46, 47, 48, 50, 51, 52, 53, 54, 55, 61, 64, 65, 66, 67, 68, 69, 70, 71, 72, 76, 77, 78, 79, 85, 86, 87 ]
},
Avatars: {
Created: [ -100 ],
Purchased: [ -101 ]
},
Accessories: {
All: [ 8, 19, 41, 42, 43, 44, 45, 46, 47 ],
Head: [ 8 ],
Hair: [ 41 ],
Face: [ 42 ],
Neck: [ 43 ],
Shoulders: [ 44 ],
Front: [ 45 ],
Back: [ 46 ],
Waist: [ 47 ],
Gear: [ 19 ]
},
Clothing: {
All: [ 2, 11, 12, 64, 65, 66, 67, 68, 69, 70, 71, 72 ],
Shirts: [ 64, 65 ],
"Classic Shirts": [ 11 ],
Pants: [ 66 ],
"Classic Pants": [ 12 ],
"T-Shirts": [ 2 ],
Tops: [ 64, 65, 68 ],
Outerwear: [ 67 ],
Bottoms: [ 66, 69, 72 ],
Shoes: [ 70, 71 ]
},
Head: {
"Dynamic Heads": [ 79 ],
Adjustment: [ 79, 17, 18 ],
Heads: [ 17 ],
Faces: []
},
Body: {
"Skin Tone": [],
Scale: [],
Torso: [ 27 ],
"Left Arm": [ 29 ],
"Right Arm": [ 28 ],
"Left Leg": [ 30 ],
"Right Leg": [ 31 ]
},
Makeup: {
Eyebrows: [ 76 ],
Eyelashes: [ 77 ],
Lip: [ 86 ],
Face: [ 85 ],
Eye: [ 87 ]
},
Animations: {
All: [ 48, 50, 51, 52, 53, 54, 55, 61 ],
Emotes: [ 61 ],
Idle: [ 51 ],
Walk: [ 55 ],
Run: [ 53 ],
Jump: [ 52 ],
Fall: [ 50 ],
Swim: [ 54 ],
Climb: [ 48 ]
}
}, t = Object.keys(e), n = new Set([ "Shirt", "Pants", "TShirt", "TShirtAccessory", "ShirtAccessory", "PantsAccessory", "JacketAccessory", "SweaterAccessory", "ShortsAccessory", "DressSkirtAccessory", "LeftShoeAccessory", "RightShoeAccessory", "Head", "Face", "Torso", "LeftArm", "RightArm", "LeftLeg", "RightLeg", "ClimbAnimation", "FallAnimation", "IdleAnimation", "JumpAnimation", "RunAnimation", "SwimAnimation", "WalkAnimation", "MoodAnimation" ]), r = 20, a = 100, o = "purpura_custom_skin_tones_v1", s = "purpura_custom_skin_tone_names_v1", i = {
2: "TShirt",
8: "Hat",
11: "Shirt",
12: "Pants",
17: "Head",
18: "Face",
19: "Gear",
27: "Torso",
28: "RightArm",
29: "LeftArm",
30: "LeftLeg",
31: "RightLeg",
32: "Package",
41: "HairAccessory",
42: "FaceAccessory",
43: "NeckAccessory",
44: "ShoulderAccessory",
45: "FrontAccessory",
46: "BackAccessory",
47: "WaistAccessory",
48: "ClimbAnimation",
50: "FallAnimation",
51: "IdleAnimation",
52: "JumpAnimation",
53: "RunAnimation",
54: "SwimAnimation",
55: "WalkAnimation",
61: "EmoteAnimation",
64: "TShirtAccessory",
65: "ShirtAccessory",
66: "PantsAccessory",
67: "JacketAccessory",
68: "SweaterAccessory",
69: "ShortsAccessory",
70: "LeftShoeAccessory",
71: "RightShoeAccessory",
72: "DressSkirtAccessory",
76: "EyebrowAccessory",
77: "EyelashAccessory",
78: "MoodAnimation",
79: "DynamicHead",
85: "FaceSticker",
86: "LipAccessory",
87: "EyeAccessory"
}, c = new Map, l = {
361: "564236",
192: "694028",
217: "7c5c46",
153: "957977",
359: "af9483",
352: "c7ac78",
5: "d7c59a",
101: "da867a",
1007: "a34b4b",
1014: "aa5500",
38: "a05f35",
18: "cc8e69",
125: "eab892",
1030: "ffcc99",
133: "d5733d",
106: "da8541",
105: "e29b40",
1017: "ffaf00",
24: "f5cd30",
334: "f8d96d",
226: "fdea8d",
141: "27462d",
1021: "3a7d15",
28: "287f47",
37: "4b974b",
310: "5b9a4c",
317: "7c9c6b",
119: "a4bd47",
135: "74869d",
1020: "00ffff",
1023: "8c5b9f",
1001: "f8f8f8"
}, d = [ "height", "width", "head", "depth", "proportion", "bodyType" ], u = [ "FFF2E2", "FCE5CD", "F8D5B5", "F1C49F", "E9B68F", "DDA67E", "D29973", "C88F67", "B87E57", "A66E47", "975F3C", "875235", "78472D", "693D26", "5B341F", "4E2C1A", "412516", "361F12", "2D190F", "24140C", "EAD0B6", "DBB591", "CFA07A", "B8855B", "A16C46", "8A5636", "70442A", "5B3621", "4A2B1A", "3A2214", "F8EFEA", "E8D4C4" ], m = [ "Porcelain Mist", "Ivory Cloud", "Almond Silk", "Honey Linen", "Warm Sand", "Sunlit Beige", "Caramel Glow", "Maple Tan", "Copper Dune", "Amber Earth", "Terracotta Warm", "Cocoa Bronze", "Walnut Shade", "Chestnut Deep", "Mocha Umber", "Espresso Veil", "Mahogany Night", "Obsidian Cocoa", "Umber Noir", "Midnight Bark", "Blush Almond", "Rose Beige", "Golden Wheat", "Burnished Sienna", "Bronze Clay", "Rustic Cinnamon", "Deep Hazel", "Ember Walnut", "Auburn Soil", "Dark Ember", "Fair Linen", "Soft Pearl" ], y = {
height: 1,
width: 1,
head: 1,
depth: 1,
proportion: 0,
bodyType: 0
}, p = 9e3, f = 320;

let h = {
user: null,
avatarType: "R15",
currentOutfitId: 0,
avatarDefinition: null,
avatarPreviewUrl: "",
previewBust: Date.now(),
csrfToken: "",
boundAuthToken: "",
loadingProfile: !0,
loadingInventory: !1,
saving: !1,
toastOpen: !1,
toastMessage: "",
toastDetails: "",
toastClosing: !1,
actionDialog: null,
activeCategory: "Accessories",
activeSubcategory: "All",
searchTerm: "",
wornAssetIds: [],
wornAssetTypeById: {},
wornAssetMetaById: {},
inventoryItems: [],
inventoryTypeIds: [],
inventoryTypeIndex: 0,
inventoryTypeCursors: {},
inventoryHasMore: !0,
inventoryKey: "",
inventorySeenIds: new Set,
recentlyEquippedTimestamps: {},
recentItemMetadata: {},
recentContextMenu: null,
customSkinTones: [],
customSkinToneNames: {},
preferredSkinTone: "",
previousScaleSnapshot: null,
preview3DLoading: !1,
previewRateLimited: !1,
previewMode: "3d"
}, v = null, g = null, b = "", w = 0, A = null, C = null, T = null;

const x = new Set;

let S = !1;

function k() {
try {
const e = localStorage.getItem("purpura_recently_equipped"), t = e ? JSON.parse(e) : {}, n = {};
Object.entries(t || {}).forEach(([e, t]) => {
const r = I(e), a = Number(t);
if (!r || !Number.isFinite(a) || a <= 0) return;
const o = N(r.entityType, r.id);
o && (!n[o] || a > n[o]) && (n[o] = a);
}), h.recentlyEquippedTimestamps = n;
const r = localStorage.getItem("purpura_recent_item_meta_v2"), a = r ? JSON.parse(r) : {};
h.recentItemMetadata = a && "object" == typeof a ? a : {}, L();
} catch (e) {
h.recentlyEquippedTimestamps = {}, h.recentItemMetadata = {};
}
}

function E() {
try {
localStorage.setItem("purpura_recently_equipped", JSON.stringify(h.recentlyEquippedTimestamps)), 
localStorage.setItem("purpura_recent_item_meta_v2", JSON.stringify(h.recentItemMetadata));
} catch (e) {}
}

function N(e, t) {
const n = String(e || "").toLowerCase(), r = Number(t);
return "asset" !== n && "outfit" !== n || !Number.isFinite(r) || r <= 0 ? "" : `${n}:${r}`;
}

function I(e) {
const t = String(e || "").trim();
if (!t) return null;
const n = t.match(/^(asset|outfit):(\d+)$/i);
if (n) {
const e = String(n[1] || "").toLowerCase(), t = Number(n[2] || 0);
if (Number.isFinite(t) && t > 0) return {
entityType: e,
id: t
};
}
const r = Number(t);
return Number.isFinite(r) && r > 0 ? {
entityType: "asset",
id: r
} : null;
}

function $(e = 20) {
return Object.entries(h.recentlyEquippedTimestamps).map(([e, t]) => {
const n = I(e), r = Number(t);
if (!n || !Number.isFinite(r) || r <= 0) return null;
const a = N(n.entityType, n.id);
return a ? {
key: a,
id: n.id,
entityType: n.entityType,
timestamp: r,
meta: h.recentItemMetadata[a] || {}
} : null;
}).filter(Boolean).sort((e, t) => Number(t.timestamp) - Number(e.timestamp)).slice(0, e);
}

function L() {
const e = $(r), t = {}, n = {};
e.forEach(e => {
t[e.key] = e.timestamp, e.meta && "object" == typeof e.meta && (n[e.key] = e.meta);
}), h.recentlyEquippedTimestamps = t, h.recentItemMetadata = n;
}

function M(e, t, n = null) {
const r = N(e, t);
r && (h.recentlyEquippedTimestamps[r] = Date.now(), n && "object" == typeof n && (h.recentItemMetadata[r] = {
name: String(n.name || ""),
type: String(n.type || ""),
thumbnailUrl: String(n.thumbnailUrl || "")
}), L(), E());
}

function R(e, t = null) {
M("asset", e, {
name: t?.name || "",
type: t?.type || "",
thumbnailUrl: t?.thumbnailUrl || ""
});
}

function F(e) {
const t = Number(e?.userOutfitId || e?.id || e?.outfitId || 0);
!Number.isFinite(t) || t <= 0 || M("outfit", t, {
name: String(e?.name || `Outfit ${t}`),
type: "Avatar Outfit",
thumbnailUrl: String(e?.thumbnailUrl || "")
});
}

function U(e) {
const t = Date.now(), n = {}, r = {};
e.forEach((e, a) => {
n[e] = t - a, h.recentItemMetadata[e] && (r[e] = h.recentItemMetadata[e]);
}), h.recentlyEquippedTimestamps = n, h.recentItemMetadata = r, E();
}

function B(e) {
const t = $(r).map(e => e.key), n = t.filter(t => t !== e);
return n.length !== t.length && (U(n), !0);
}

function P(e, t) {
const n = $(r).map(e => e.key), a = n.indexOf(e);
if (a < 0) return !1;
let o = a;
if ("up" === t ? o = Math.max(0, a - 1) : "down" === t ? o = Math.min(n.length - 1, a + 1) : "top" === t ? o = 0 : "bottom" === t && (o = n.length - 1), 
o === a) return !1;
const [s] = n.splice(a, 1);
return n.splice(o, 0, s), U(n), !0;
}

async function D(e, t) {
let n = !1;
"remove" === e ? n = B(t) : "move-up" === e ? n = P(t, "up") : "move-down" === e ? n = P(t, "down") : "move-top" === e ? n = P(t, "top") : "move-bottom" === e && (n = P(t, "bottom"));
const r = xt();
h.recentContextMenu = null, n && "Recent" === h.activeCategory && await jt(), St(r);
}

function O() {
if ("Recent" !== h.activeCategory) return;
const e = h.inventoryItems.filter(e => {
const t = /^Asset\s+\d+$/i.test(String(e?.name || "")), n = "Asset" === String(e?.type || "Asset");
return t && n && e?.recentKey;
}).map(e => e.recentKey).filter(Boolean);
if (!e.length) return;
let t = !1;
e.forEach(e => {
e in h.recentlyEquippedTimestamps && (delete h.recentlyEquippedTimestamps[e], delete h.recentItemMetadata[e], 
t = !0);
}), t && (L(), E());
}

function j(e = 20) {
return $(e).filter(e => "asset" === e.entityType).map(e => e.id);
}

function H() {
try {
const e = localStorage.getItem("purpura_preview_mode");
"2d" !== e && "3d" !== e || (h.previewMode = e);
} catch (e) {}
}

function _() {
try {
localStorage.setItem("purpura_preview_mode", h.previewMode);
} catch (e) {}
}

function q() {
try {
const e = localStorage.getItem(o), t = e ? JSON.parse(e) : [];
Array.isArray(t) ? h.customSkinTones = [ ...new Set(t.map(e => zt(e))) ].slice(0, 64) : h.customSkinTones = [];
} catch (e) {
h.customSkinTones = [];
}
try {
const e = localStorage.getItem(s), t = e ? JSON.parse(e) : {};
if (t && "object" == typeof t) {
const e = {};
Object.entries(t).forEach(([t, n]) => {
const r = zt(t), a = String(n || "").trim();
r && (e[r] = a || `#${r}`);
}), h.customSkinToneNames = e;
} else h.customSkinToneNames = {};
} catch (e) {
h.customSkinToneNames = {};
}
}

function z() {
try {
localStorage.setItem(o, JSON.stringify(h.customSkinTones));
} catch (e) {}
}

function W() {
try {
localStorage.setItem(s, JSON.stringify(h.customSkinToneNames));
} catch (e) {}
}

async function J(e) {
const t = zt(e);
try {
const e = await Re(`https://api.purpura.page/v1/colors/id?hex=${encodeURIComponent(t)}`, {
method: "GET",
accept: "application/json, text/plain;q=0.9, */*;q=0.8",
usePageFetch: !1
}), n = Number(e?.status || 0), r = String(e?.text || "").trim();
if ((e?.ok || 200 === n) && r.startsWith("{")) {
const e = JSON.parse(r), n = String(e?.name?.value || "").trim();
if (n) return n;
}
} catch (e) {}
const n = u.indexOf(t);
return n >= 0 && m[n] ? m[n] : `#${t}`;
}

function G(e) {
const t = zt(e);
return u.includes(t);
}

function V(e) {
const t = zt(e);
if (!t || G(t) || x.has(t)) return;
const n = String(h.customSkinToneNames[t] || "").trim().toUpperCase();
n && n !== t && n !== `#${t}` || (x.add(t), Q());
}

function K() {
h.customSkinTones.forEach(e => {
G(e) || V(e);
});
}

async function Q() {
if (S) return;
const e = x.values().next();
if (!e || e.done) return;
const t = String(e.value || "");
if (t) {
S = !0, x.delete(t);
try {
const e = await J(t);
h.customSkinToneNames[t] = e, W(), ne() && St(xt());
} catch (e) {
h.customSkinToneNames[t] || (h.customSkinToneNames[t] = `#${t}`, W());
} finally {
S = !1, x.size > 0 && Q();
}
} else x.delete(e.value);
}

function Z(e) {
const t = zt(e);
if (G(t)) return t;
const n = [ ...new Set(h.customSkinTones.map(e => zt(e)).filter(e => Boolean(e) && !G(e))) ], r = !n.includes(t), a = r ? [ t, ...n ].slice(0, 64) : n;
return JSON.stringify(a) !== JSON.stringify(h.customSkinTones) && (h.customSkinTones = a, 
z()), V(t), t;
}

function Y(e) {
return String(e).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function X(e) {
return `#${zt(e)}`;
}

function ee() {
if ("Body" === h.activeCategory && ("Scale" === h.activeSubcategory || "Skin Tone" === h.activeSubcategory || "Skin Color" === h.activeSubcategory)) return [];
const t = e[h.activeCategory] || {};
return t[h.activeSubcategory] || t.All || [];
}

function te() {
return "Body" === h.activeCategory && "Scale" === h.activeSubcategory;
}

function ne() {
return "Body" === h.activeCategory && ("Skin Tone" === h.activeSubcategory || "Skin Color" === h.activeSubcategory);
}

function re() {
let e = [ ...h.inventoryItems ];
const t = h.searchTerm.trim().toLowerCase();
return t && (e = e.filter(e => String(e.name || "").toLowerCase().includes(t))), 
"Recent" === h.activeCategory && e.sort((e, t) => {
const n = e.recentKey || N("asset", e.id), r = t.recentKey || N("asset", t.id), a = Number(h.recentlyEquippedTimestamps[n] || 0);
return Number(h.recentlyEquippedTimestamps[r] || 0) - a;
}), e;
}

function ae() {
const t = e[h.activeCategory] || {};
Object.hasOwn(t, h.activeSubcategory) || (h.activeSubcategory = Object.keys(t)[0] || "All");
}

function oe() {
if (b) return b;
return "light" === new URLSearchParams(window.location.search).get("theme") ? "light" : "dark";
}

function se() {
document.documentElement.setAttribute("data-theme", oe());
}

let ie = null, ce = null, le = null, de = null, ue = null, me = null, ye = null, pe = null, fe = !1, he = "", ve = "", ge = "", be = "", we = "", Ae = 0, Ce = "", Te = 0, xe = null;

const Se = new Map, ke = new Map;

let Ee = "", PePromise = null;

async function Ne() {
let e = 0;
for (;!fe && e < 100; ) await new Promise(e => setTimeout(e, 50)), e++;
if (!fe) throw new Error("Three.js URLs not received from extension after 5 seconds");
}

function Ie(e, t) {
if (!t || "object" != typeof t) return "";
const n = t.obj || t.objUrl || t.modelUrl || "";
if (!n || "string" != typeof n) return "";
if (/^https?:\/\//i.test(n)) return n;
try {
return `${new URL(e).origin}/${n}`;
} catch (e) {
return n;
}
}

function $e(e, t) {
const n = [], r = t?.obj || t?.objUrl || t?.modelUrl || "";
if (!r || "string" != typeof r) return n;
try {
const t = new URL(e), a = t.search || "", o = r.replace(/^\/+/, "");
if (/^https?:\/\//i.test(r)) n.push(r), a && !r.includes("?") && n.push(`${r}${a}`); else {
n.push(`${t.origin}/${o}${a}`), n.push(`${t.origin}/${o}`);
for (let e = 0; e <= 7; e += 1) {
const t = `https://t${e}.rbxcdn.com`;
n.push(`${t}/${o}${a}`), n.push(`${t}/${o}`);
}
}
} catch (e) {
n.push(r);
}
return [ ...new Set(n.filter(Boolean)) ];
}

function Le(e) {
const t = (e || "").trim();
return t.startsWith("<?xml") || t.startsWith("<Error>") && t.includes("AccessDenied");
}

function Me(e, t = "GET") {
const n = String(t || "GET").trim().toUpperCase() || "GET", r = String(e || n).trim().toUpperCase();
return new Set([ "GET", "POST", "PUT", "PATCH", "DELETE", "HEAD" ]).has(r) ? r : n;
}

function Re(e, t = {}) {
return new Promise((n, r) => {
const a = `${Date.now()}-${Math.random().toString(16).slice(2)}`, o = Me(t.method, "GET"), s = "string" == typeof t.body ? t.body : "", i = "string" == typeof t.csrfToken ? t.csrfToken : h.csrfToken || "", c = "string" == typeof t.boundAuthToken ? t.boundAuthToken : h.boundAuthToken || "", l = window.setTimeout(() => {
ke.delete(a), r(new Error(`Timed out fetching resource: ${e}`));
}, 15e3);
ke.set(a, {
resolve: e => {
window.clearTimeout(l), n(e);
},
reject: e => {
window.clearTimeout(l), r(e);
}
}), window.parent.postMessage({
type: "PURPURA_FETCH_RESOURCE_REQUEST",
requestId: a,
url: e,
method: o,
body: s,
accept: t.accept || "text/plain, application/json;q=0.9, */*;q=0.8",
contentType: t.contentType || "",
usePageFetch: !0 === t.usePageFetch,
csrfToken: i,
boundAuthToken: c
}, "*");
});
}

async function Fe(e) {
try {
const t = await Re(e);
if (t && t.ok && t.text && !Le(t.text)) return t.text;
} catch (e) {}
return "";
}

async function Ue(e, t = "") {
if (!e || "string" != typeof e) return "";
const n = e.trim();
if (/^https?:\/\//i.test(n)) return n;
const r = n.replace(/^\/+/, ""), a = [ `https://assetdelivery.roblox.com/v2/asset/?hash=${encodeURIComponent(r)}`, `https://assetdelivery.roblox.com/v1/asset/?hash=${encodeURIComponent(r)}` ];
for (const e of a) try {
const t = await Re(e, {
accept: "application/json, text/plain;q=0.9, */*;q=0.8"
});
if (!t || !t.ok) continue;
const n = (t.text || "").trim();
if (!n) continue;
if (n.startsWith("{")) {
const e = JSON.parse(n), t = e?.location || e?.url || e?.assetUrl || e?.locations?.[0]?.location || e?.locations?.[0]?.url || "";
if (t && "string" == typeof t) return t;
}
if (/^https?:\/\//i.test(n)) return n.split("\n")[0].trim();
if (n.includes("\nv ") || n.startsWith("v ")) return Se.set(e, n), e;
} catch (e) {}
try {
if (t) {
return `${new URL(t).origin}/${r}`;
}
} catch (e) {}
return `https://t2.rbxcdn.com/${r}`;
}

async function Be(e) {
if (!e) return "";
const t = e.split("?")[0].toLowerCase();
if (t.endsWith(".obj") || t.endsWith(".gltf") || t.endsWith(".glb")) return e;
try {
const t = await Re(e), n = t?.text || "";
if (n.trim().startsWith("{")) {
const t = JSON.parse(n), r = $e(e, t);
for (const e of r) try {
const t = await Fe(e);
if (!t || t.trim().startsWith("{") || Le(t)) continue;
return Se.set(e, t), e;
} catch (e) {}
const a = Ie(e, t);
if (a) return a;
}
} catch (e) {}
return e;
}

async function Pe() {
if (window.THREE) return window.THREE;
if (window.__purpuraAeditorThreePromise) return window.__purpuraAeditorThreePromise;
if (PePromise) return PePromise;
await Ne();
if (window.THREE) return window.THREE;
if (window.__purpuraAeditorThreePromise) return window.__purpuraAeditorThreePromise;
PePromise = new Promise((e, t) => {
let n = !1;
const r = () => {
if (!window.THREE) return !1;
e(window.THREE);
return !0;
}, a = () => {
if (n) return;
n = !0;
if (r()) return;
const s = document.getElementById("purpura-aeditor-three-core") || document.querySelector(`script[src="${he}"]`) || document.querySelector('script[src*="three.min.js"]');
if (s) {
s.addEventListener("load", () => {
r() || (window.__purpuraAeditorThreePromise = null, PePromise = null, t(new Error("Detected existing Three script but no THREE global after load")));
}, {
once: !0
});
return;
}
const i = document.createElement("script");
i.id = "purpura-aeditor-three-core", i.src = he, i.addEventListener("load", () => {
i.dataset.loaded = "1", window.__purpuraAeditorThreePromise = Promise.resolve(window.THREE), 
r() || t(new Error("Three.js loaded but global was not available"));
}, {
once: !0
}), i.addEventListener("error", () => {
window.__purpuraAeditorThreePromise = null, PePromise = null, t(new Error("Failed to load Three.js from " + he));
}, {
once: !0
}), document.head.appendChild(i);
};
if (r()) return;
const o = document.getElementById("purpura-aeditor-three-core") || document.querySelector(`script[src="${he}"]`) || document.querySelector('script[src*="three.min.js"]');
if (o) {
o.addEventListener("load", () => {
r() || a();
}, {
once: !0
}), setTimeout(() => {
r() || a();
}, 5e3);
return;
}
a();
});
window.__purpuraAeditorThreePromise = PePromise;
return PePromise;
}

async function De() {
const e = await Pe();
return e.GLTFLoader ? e.GLTFLoader : new Promise((t, n) => {
const r = document.createElement("script");
r.src = ve, r.onload = () => {
e.GLTFLoader ? t(e.GLTFLoader) : n(new Error("GLTFLoader script loaded but class not attached to THREE"));
}, r.onerror = e => {
n(new Error("Failed to load GLTFLoader from " + ve));
}, document.head.appendChild(r);
});
}

async function Oe() {
const e = await Pe();
return e.OrbitControls ? e.OrbitControls : new Promise((t, n) => {
const r = document.createElement("script");
r.src = be, r.onload = () => {
e.OrbitControls ? t(e.OrbitControls) : n(new Error("OrbitControls script loaded but class not attached to THREE"));
}, r.onerror = e => {
n(new Error("Failed to load OrbitControls from " + be));
}, document.head.appendChild(r);
});
}

async function je() {
const e = await Pe();
return e.OBJLoader ? e.OBJLoader : new Promise((t, n) => {
const r = document.createElement("script");
r.src = we, r.onload = () => {
e.OBJLoader ? t(e.OBJLoader) : n(new Error("OBJLoader script loaded but class not attached to THREE"));
}, r.onerror = e => {
n(new Error("Failed to load OBJLoader from " + we));
}, document.head.appendChild(r);
});
}

async function He() {
const e = await Pe();
return e.MTLLoader ? e.MTLLoader : new Promise((t, n) => {
const r = document.createElement("script");
r.src = ge, r.onload = () => {
e.MTLLoader ? t(e.MTLLoader) : n(new Error("MTLLoader script loaded but class not attached to THREE"));
}, r.onerror = e => {
n(new Error("Failed to load MTLLoader from " + ge));
}, document.head.appendChild(r);
});
}

function _e(e = 429) {
const t = new Error(`Avatar-3D preview rate limited (${e})`);
return t.code = "PURPURA_AVATAR3D_RATE_LIMITED", t.status = e, t;
}

async function qe(e) {
const t = async e => {
for (let t = 0; t < 12; t += 1) {
try {
const t = await Re(e, {
accept: "application/json, text/plain;q=0.9, */*;q=0.8"
});
if (!t?.ok) {
if (429 === Number(t?.status)) throw _e(t.status);
await new Promise(e => setTimeout(e, 1e3));
continue;
}
const n = t.text || "";
if (!n.trim().startsWith("{")) {
await new Promise(e => setTimeout(e, 1e3));
continue;
}
const r = JSON.parse(n), a = Array.isArray(r?.data) ? r.data[0] : r, o = String(a?.state || "").toLowerCase(), s = a?.imageUrl || "";
if ("blocked" === o || "error" === o || "failed" === o) throw _e(429);
if ("completed" === o && s) {
const t = await Re(s, {
accept: "application/json, text/plain;q=0.9, */*;q=0.8"
});
if (!t?.ok && 429 === Number(t?.status)) throw _e(t.status);
const n = t?.text || "";
if (t?.ok && n.trim().startsWith("{")) {
const t = JSON.parse(n);
return t.__metadataUrl = s, t.__sourceEndpoint = e, t;
}
}
} catch (e) {
if ("PURPURA_AVATAR3D_RATE_LIMITED" === e?.code) throw e;
}
await new Promise(e => setTimeout(e, 1e3));
}
return null;
};
try {
const n = [ `https://thumbnails.roblox.com/v1/users/avatar-3d?userId=${encodeURIComponent(e)}`, `https://thumbnails.roblox.com/v1/users/avatar-3d?userIds=${encodeURIComponent(e)}` ];
for (const e of n) {
const n = await t(e);
if (n) return n;
}
} catch (e) {
if ("PURPURA_AVATAR3D_RATE_LIMITED" === e?.code) throw e;
}
return null;
}

function ze(e) {
const t = [], n = e?.itemLabel ? `${String(e.itemLabel)} - ` : "", r = (e, r) => {
r && t.push({
n: `${n}${String(e)}`,
u: String(r)
});
};
r("avatar-3d endpoint", e?.sourceEndpoint), r("avatar-3d metadata", e?.metadataUrl), 
r("avatar model (obj)", e?.objUrl), r("avatar materials (mtl)", e?.mtlUrl), Array.isArray(e?.textureUrls) && e.textureUrls.forEach((e, t) => {
r(`avatar texture ${t + 1}`, e);
});
const a = new Map;
t.forEach(e => {
/^https?:\/\//i.test(e.u) && !a.has(e.u) && a.set(e.u, e.n);
});
const o = [ ...a.entries() ].map(([e, t]) => ({
n: t,
u: e
}));
if (!o.length) return;
const s = o.map(e => `${e.n}:${e.u}`).join("|");
if (s !== Ee) {
Ee = s;
try {
if (window.parent && window.parent !== window) return void window.parent.postMessage({
type: "PURPURA_RENDER_SOURCE_URLS",
entries: o,
urls: o.map(e => e.u)
}, "*");
} catch (e) {}
o.forEach(e => {});
}
}

function We(e) {
const t = String(e || "").trim().replace(/^\/+/, "");
if (!t) return "";
let n = 31;
const r = Math.min(38, t.length);
for (let e = 0; e < r; e += 1) n ^= t.charCodeAt(e);
return `https://t${Math.abs(n % 8)}.rbxcdn.com/${t}`;
}

function Je(e) {
if (!e) return "";
try {
const t = new URL(e, "https://t0.rbxcdn.com/");
return (t.pathname.split("/").pop() || "").split("?")[0].trim();
} catch (t) {
const n = String(e);
return (n.split("/").pop()?.split("?")[0] || "").trim();
}
}

function Ge(e) {
if ("string" == typeof e) {
const t = e.trim();
if (/^#[0-9a-fA-F]{6}$/.test(t)) return t.slice(1).toLowerCase();
if (/^[0-9a-fA-F]{6}$/.test(t)) return t.toLowerCase();
}
if (e && "object" == typeof e) {
const t = e.r ?? e.R ?? e.red, n = e.g ?? e.G ?? e.green, r = e.b ?? e.B ?? e.blue;
if (Number.isFinite(t) && Number.isFinite(n) && Number.isFinite(r)) {
const e = e => e <= 1 ? Math.max(0, Math.min(255, Math.round(255 * e))) : Math.max(0, Math.min(255, Math.round(e)));
return `${e(t).toString(16).padStart(2, "0")}${e(n).toString(16).padStart(2, "0")}${e(r).toString(16).padStart(2, "0")}`;
}
}
return "";
}

function Ve(e) {
const t = Number(e);
return !Number.isFinite(t) || t <= 0 ? "" : c.get(t) || "";
}

function Ke(e, t) {
const n = Number(e);
if (!Number.isFinite(n) || n <= 0) return;
const r = Ge(t);
r && c.set(n, r);
}

function Qe() {
Object.entries(l).forEach(([e, t]) => {
c.has(Number(e)) || Ke(e, t);
});
}

function Ze(e) {
return e ? Array.isArray(e) ? e : Array.isArray(e.palette) ? e.palette : Array.isArray(e.colors) ? e.colors : Array.isArray(e.bodyColorsPalette) ? e.bodyColorsPalette : [] : [];
}

function Ye(e) {
let t = 0;
return [ e?.bodyColorsPalette, e?.bodyColorPalette, e?.avatarBodyColorPalette, e?.bodyColorRules, e?.bodyColors, e?.appearance?.bodyColorsPalette ].forEach(e => {
Ze(e).forEach(e => {
const n = Number(e?.brickColorId ?? e?.colorId ?? e?.id ?? e?.brickColor?.brickColorId ?? e?.brickColor?.id ?? 0);
if (!Number.isFinite(n) || n <= 0) return;
const r = Ge(e?.hexColor) || Ge(e?.colorHex) || Ge(e?.hex) || Ge(e?.color) || Ge(e?.displayColor) || Ge(e?.color3) || Ge(e?.rgb) || Ge(e?.brickColor?.hexColor) || Ge(e?.brickColor?.color) || "";
if (!r) return;
const a = c.has(n);
c.set(n, r), a || (t += 1);
});
}), t;
}

async function Xe() {
try {
Qe();
Ye(await Mt("https://avatar.roblox.com/v1/avatar-rules"));
} catch (e) {
Qe();
}
}

function et(e, t = "ffffff") {
if ("number" == typeof e) {
const t = Ve(e);
if (t) return t;
}
if ("string" == typeof e) {
const t = Number(e);
if (Number.isFinite(t) && t > 0) {
const e = Ve(t);
if (e) return e;
}
}
const n = Ge(e);
return n || t;
}

function tt(e) {
const t = {
head: 1,
height: 1,
bodyType: 0,
width: 1,
depth: 1,
proportion: 0,
...e?.scales || {}
}, n = e?.bodyColor3s || {}, r = e?.bodyColors || {}, a = et(n.torsoColor3 ?? n.torsoColor ?? r.torsoColor ?? r.torsoColorId, "f2d5c7"), o = {
headColor: et(n.headColor3 ?? n.headColor ?? r.headColor ?? r.headColorId, a),
rightArmColor: et(n.rightArmColor3 ?? n.rightArmColor ?? r.rightArmColor ?? r.rightArmColorId, a),
leftLegColor: et(n.leftLegColor3 ?? n.leftLegColor ?? r.leftLegColor ?? r.leftLegColorId, a),
leftArmColor: et(n.leftArmColor3 ?? n.leftArmColor ?? r.leftArmColor ?? r.leftArmColorId, a),
rightLegColor: et(n.rightLegColor3 ?? n.rightLegColor ?? r.rightLegColor ?? r.rightLegColorId, a),
torsoColor: a
}, s = Array.isArray(e?.assets) ? e.assets.map(e => {
const t = Number(e?.id);
if (!t) return null;
const n = {
id: t
};
"string" == typeof e?.name && e.name.trim() && (n.name = e.name.trim());
const r = Number(e?.currentVersionId || e?.versionId || 0);
Number.isFinite(r) && r > 0 && (n.currentVersionId = r);
const a = Number(e?.assetType?.id ?? e?.assetTypeId ?? e?.assetType ?? 0), o = Et(e?.assetType?.name ?? e?.assetTypeName ?? a);
return (Number.isFinite(a) && a > 0 || o && "Asset" !== o) && (n.assetType = {}, 
Number.isFinite(a) && a > 0 && (n.assetType.id = a), o && (n.assetType.name = o)), 
e?.meta && "object" == typeof e.meta && (n.meta = e.meta), n;
}).filter(Boolean) : [];
return {
scales: t,
bodyColors: o,
playerAvatarType: {
playerAvatarType: e?.playerAvatarType || "R15"
},
assets: s
};
}

function nt(e) {
return e && "object" == typeof e ? Object.keys(e).sort().map(t => `${t}:${JSON.stringify(e[t])}`).join("|") : "";
}

function rt(e) {
return `${String(e?.playerAvatarType || "R15")}|${Array.isArray(e?.assets) ? e.assets.map(e => Number(e?.id) || 0).filter(Boolean).sort((e, t) => e - t).join(",") : ""}|${nt(e?.bodyColor3s || e?.bodyColors || {})}|${nt(e?.scales || {})}`;
}

function cloneAssetMeta(e) {
if (!e || "object" != typeof e || Array.isArray(e)) return null;
try {
return JSON.parse(JSON.stringify(e));
} catch (t) {
return null;
}
}

function collectAssetMetaById(e) {
const t = {};
return (Array.isArray(e) ? e : []).forEach(e => {
const n = Number(e?.id || e?.assetId || 0);
if (!Number.isFinite(n) || n <= 0) return;
const r = cloneAssetMeta(e?.meta);
r && (t[n] = r);
}), t;
}

function buildWearingAssetPayload(e, t = null, n = !0) {
const r = Number(e);
if (!Number.isFinite(r) || r <= 0) return null;
const a = {
id: r
}, o = cloneAssetMeta(t && "object" == typeof t ? t : n ? h.wornAssetMetaById?.[r] : null);
return o && (a.meta = o), a;
}

function at(e) {
Ce = rt(e || {});
const t = Array.isArray(e?.assets) ? e.assets.map(e => e.id).filter(Boolean) : [], n = {};
Array.isArray(e?.assets) && e.assets.forEach(e => {
e?.id && (n[e.id] = Et(e.assetType ?? e.assetTypeId ?? e?.assetType?.id));
}), h.avatarType = e?.playerAvatarType || "R15", h.currentOutfitId = Number(e?.currentOutfitId || e?.outfitId || e?.id || 0) || 0;
const a = e?.scales || {};
if (h.previousScaleSnapshot = d.reduce((e, t) => (e[t] = Ht(a[t], y[t]), e), {}), 
h.avatarDefinition = tt(e || {}), h.wornAssetIds = t, h.wornAssetTypeById = n, h.wornAssetMetaById = collectAssetMetaById(h.avatarDefinition?.assets), h.preferredSkinTone || (h.preferredSkinTone = zt(h.avatarDefinition?.bodyColors?.headColor || "F2D5C7")), 
0 === Object.keys(h.recentlyEquippedTimestamps).length && t.length > 0) {
const e = Date.now();
t.slice(0, r).forEach((t, n) => {
const r = N("asset", t);
r && (h.recentlyEquippedTimestamps[r] = e - n);
}), L(), E();
}
}

function ot(e, t = 16777215) {
const n = String(e || "").replace(/^#/, "");
return /^[0-9a-fA-F]{6}$/.test(n) ? Number.parseInt(n, 16) : t;
}

function st(e, t, n) {
if (!e || !t || "function" != typeof t.traverse) return;
const r = String(n?.bodyColors?.headColor || "").replace(/^#/, ""), a = ot(r, 14926498), o = ot(String(n?.bodyColors?.leftArmColor || n?.bodyColors?.rightArmColor || n?.bodyColors?.torsoColor || n?.bodyColors?.headColor || "").replace(/^#/, ""), a), s = (new e.Box3).setFromObject(t), i = s.getCenter(new e.Vector3), c = s.getSize(new e.Vector3), l = Math.max(c.y, .001), d = Math.max(c.x, .001), u = new e.Vector3, m = new e.Box3, y = new Map, p = [], f = new Set, h = [];
let v = 0, g = 0;
const b = (e, t) => {
if (!Array.isArray(e) || e.length < 1) return 0;
const n = Math.max(0, Math.min(1, Number(t) || 0)), r = Math.floor((e.length - 1) * n);
return e[Math.max(0, Math.min(e.length - 1, r))];
}, w = (t, n = 1) => {
if (!Array.isArray(t) || t.length < 1) return;
const r = [];
t.sort((e, t) => Number(t.score || 0) - Number(e.score || 0) || e.horizontalDistance - t.horizontalDistance).forEach(e => {
e && e.material && e.material.color && (r.some(t => t.node === e.node && t.material === e.material) || r.length >= n || r.push(e));
}), r.forEach(t => (t => {
if (!t || !t.material || !t.material.color) return;
const n = Number(t.sharedCount || 1);
let r = t.material;
if (n > 1) if (Array.isArray(t.node.material)) {
const e = t.material.clone(), n = [ ...t.node.material ];
n[t.materialIndex] = e, t.node.material = n, r = e;
} else {
const e = t.material.clone();
t.node.material = e, r = e;
}
r && r.color && !f.has(r) && (r.transparent = !1, r.opacity = 1, "alphaTest" in r && (r.alphaTest = 0), 
"depthWrite" in r && (r.depthWrite = !0), r.alphaMap && (r.alphaMap = null), e && void 0 !== e.NormalBlending && "blending" in r && (r.blending = e.NormalBlending), 
e && void 0 !== e.FrontSide && "side" in r && (r.side = e.FrontSide), "metalness" in r && (r.metalness = 0), 
"roughness" in r && (r.roughness = Math.max(.72, Number(r.roughness || 0))), "shininess" in r && (r.shininess = Math.min(20, Number(r.shininess || 0))), 
r.specular && "function" == typeof r.specular.setHex && r.specular.setHex(1118481), 
r.emissive && "function" == typeof r.emissive.setHex && r.emissive.setHex(0), r.color.setHex(o), 
r.needsUpdate = !0, f.add(r), h.push({
node: t.nodeName,
material: t.materialName,
sharedCount: n
}));
})(t));
};
t.traverse(t => {
if (!t?.isMesh || !t.material) return;
v += 1, t.getWorldPosition(u);
const n = Math.hypot(u.x - i.x, u.z - i.z);
m.setFromObject(t);
const r = m.getSize(new e.Vector3), a = r.y <= .68 * l && r.x <= 1.05 * d;
(Array.isArray(t.material) ? t.material : [ t.material ]).forEach((e, r) => {
if (g += 1, !e || !e.color) return;
(e => {
if (!e) return;
const t = Number(y.get(e) || 0);
y.set(e, t + 1);
})(e);
const o = `${e.name || ""} ${t.name || ""}`.toLowerCase(), s = (e => /(hair|hat|cap|helmet|horn|glasses|beard|accessor|shoulder|waist|back|front|neck|shoe|earring|handle|tool|sword|bag|decal|sticker)/.test(e))(o), i = /(head|face|skin|dynamic|dynhead|facial)/.test(o), c = Math.max(e.color.r, e.color.g, e.color.b), l = Math.min(e.color.r, e.color.g, e.color.b), d = e.color.b - e.color.r, m = e.color.b - e.color.g, f = d > .06 && m > .03, h = c - l < .08 && c > .1 && c < .92, v = Boolean(e.map), b = Number(e.opacity), w = Number.isFinite(b) ? b : 1, A = Boolean(e.transparent) || w < .96, C = (e => /(eye|iris|pupil|cornea|sclera|teeth|tooth|tongue|mouth|lip|lash|brow|eyebrow|eyelash|tear|highlight|spec|gloss|glass)/.test(e))(o), T = (e => /(torso|leftarm|rightarm|leftleg|rightleg|upperarm|lowerarm|upperleg|lowerleg|pants|pant|shirt|jacket|sweater|hoodie|shorts|dress|skirt|shoe|waist|back|front|layered|tshirt|tee)/.test(e))(o);
p.push({
node: t,
nodeName: t.name || "(unnamed)",
material: e,
materialIndex: r,
materialName: e.name || "(unnamed)",
token: o,
y: Number(u.y),
horizontalDistance: n,
isLikelyAccessory: s,
isNamedHeadMaterial: i,
isBlueFallbackMaterial: f,
isNeutralMaterial: h,
isHeadSized: a,
hasTextureMap: v,
isLikelyTransparent: A,
isLikelyFacialDetail: C,
isLikelyClothingOrBody: T
});
});
}), p.forEach(e => {
e.sharedCount = Number(y.get(e.material) || 1);
});
const A = p.filter(e => !e.isLikelyAccessory), C = A.map(e => Number(e.y)).filter(e => Number.isFinite(e)).sort((e, t) => e - t), T = C.length > 1 ? C[C.length - 1] - C[0] : 0, x = T > .02, S = b(C, .62), k = b(C, .8), E = e => {
let t = 0;
t += 1.6 * Math.max(0, 1 - e.horizontalDistance / Math.max(d, .001)), e.isNamedHeadMaterial && (t += 5), 
e.isHeadSized && (t += .9), (e.isBlueFallbackMaterial || e.isNeutralMaterial) && (t += .35), 
1 === e.sharedCount ? t += 1.5 : e.sharedCount > 6 && (t -= 2.2);
const n = (e => {
const t = String(e || "").toLowerCase().match(/player(\d+)|part(\d+)|mesh(\d+)/i);
if (!t) return 0;
const n = Number(t[1] || t[2] || t[3] || 0);
return Number.isFinite(n) && n > 0 ? n : 0;
})(e.nodeName);
if (1 === n ? t += 1.2 : n > 1 && n <= 3 && (t += .45), e.isLikelyClothingOrBody && (t -= 1.6), 
x) {
t += 1.1 * Math.max(0, Math.min(1, (e.y - S) / Math.max(.3 * l, 1e-4)));
}
return t;
}, N = A.map(e => ({
...e,
score: E(e)
})).sort((e, t) => Number(t.score || 0) - Number(e.score || 0)), I = N.filter(e => !(e.isLikelyFacialDetail || e.isLikelyTransparent || e.isLikelyAccessory || e.isLikelyClothingOrBody) && !(e.hasTextureMap && !e.isNamedHeadMaterial)), $ = I.filter(e => !(!e.isNamedHeadMaterial || !e.isHeadSized) && (!x || e.y >= S - .08 * l)), L = I.filter(e => !!e.isNamedHeadMaterial && (!x || e.y >= S - .14 * l)), M = I.filter(e => !!e.isHeadSized && (!(e.horizontalDistance > Math.max(.45 * d, .12)) && (!x || e.y >= k - .08 * l))), R = I.filter(e => e.isNamedHeadMaterial).slice(0, 1);
$.length > 0 && w($, Math.min(2, $.length)), 0 === f.size && L.length > 0 && w(L, Math.min(2, L.length)), 
0 === f.size && M.length > 0 && w(M, 1), 0 === f.size && R.length > 0 && w(R, 1);
const F = N.slice(0, 24).map(e => ({
node: e.nodeName,
material: e.materialName,
token: e.token,
score: Number(e.score.toFixed(3)),
sharedCount: e.sharedCount,
headSized: e.isHeadSized,
accessory: e.isLikelyAccessory,
clothing: e.isLikelyClothingOrBody,
namedHead: e.isNamedHeadMaterial,
blueFallback: e.isBlueFallbackMaterial,
neutral: e.isNeutralMaterial,
y: Number(e.y.toFixed(3)),
distance: Number(e.horizontalDistance.toFixed(3))
}));
Number(T.toFixed(4)), Number(S.toFixed(4)), Number(k.toFixed(4)), p.length, I.length, 
$.length, L.length, M.length, R.length, f.size;
}

function it(e, t, n) {
const r = new e.Group, a = t?.scales || {}, o = t?.bodyColors || {}, s = t?.playerAvatarType?.playerAvatarType || "R15", i = Number(a.bodyType ?? 0) || 0, c = Number(a.height ?? 1) || 1, l = Number(a.width ?? 1) || 1, d = Number(a.depth ?? 1) || 1, u = Number(a.proportion ?? 0) || 0, m = "R6" === s ? 2 : 1.8, y = "R6" === s ? 2 : 2.2, p = "R6" === s ? 1 : .9, f = "R6" === s ? .6 : .45, h = "R6" === s ? .6 : .45, v = "R6" === s ? 1.5 : 1.6, g = 1.35 * (Number(a.head ?? 1) || 1), b = ot(o.torsoColor, 9079434), w = ot(o.headColor, b), A = ot(o.leftArmColor, b), C = ot(o.leftLegColor, b), T = (t, n, a, o, s, i = 0, c = 0, l = 0) => {
const d = new e.Mesh(t, new e.MeshStandardMaterial({
color: n,
roughness: .85,
metalness: .05
}));
return d.position.set(a, o, s), d.rotation.set(i, c, l), r.add(d), d;
};
T(new e.BoxGeometry(m * l, y * c, p * d), b, 0, v + y * c / 2, 0), T(new e.SphereGeometry(g * l / 2, 24, 18), w, 0, v + y * c + .55 * g, 0);
const x = v + y * c * .75, S = v / 2, k = m * l * .75, E = m * l * .3;
return T(new e.BoxGeometry(f * l, v * c, h * d), A, -k, x, 0), T(new e.BoxGeometry(f * l, v * c, h * d), A, k, x, 0), 
T(new e.BoxGeometry(f * l, v * c, h * d), C, -E, S, 0), T(new e.BoxGeometry(f * l, v * c, h * d), C, E, S, 0), 
r.rotation.y = .15, r.position.y = .1 * u - .35 + .08 * i, n?.camera?.position && (r.userData.renderCamera = n.camera), 
r;
}

function ct() {
"3d" !== h.previewMode || h.previewRateLimited || Date.now() - Ae < 2500 || pe || (pe = pt().finally(() => {
pe = null;
}));
}

function lt(e) {
h.preview3DLoading = Boolean(e);
const t = document.getElementById("preview-loading-overlay");
t && t.classList.toggle("active", "3d" === h.previewMode && h.preview3DLoading);
}

function dt(e) {
h.previewRateLimited = Boolean(e), !h.previewRateLimited && xe && (window.clearTimeout(xe), 
xe = null);
const t = document.getElementById("preview-rate-limited-overlay");
t && t.classList.toggle("active", "3d" === h.previewMode && h.previewRateLimited);
}

function ut() {
"3d" === h.previewMode && (xe && window.clearTimeout(xe), xe = window.setTimeout(() => {
xe = null, "3d" === h.previewMode && (!h.user || h.loadingProfile || h.saving ? ut() : (dt(!1), 
ct()));
}, 3e4));
}

function mt() {
const e = new Error("3D preview init superseded by a newer init request");
return e.code = "PURPURA_PREVIEW_INIT_CANCELLED", e;
}

function yt(e) {
if (e !== Te) throw mt();
}

async function pt() {
if ("3d" !== h.previewMode) return void lt(!1);
const e = ++Te;
dt(!1), lt(!0);
try {
let t = document.getElementById("avatar-canvas-3d");
if (!t) return void ft();
if ("2d" === t.dataset.mode) {
const e = t.cloneNode(!1);
e.id = "avatar-canvas-3d", t.replaceWith(e), t = e;
}
if (yt(e), le && le.domElement !== t && (vt(), yt(e)), le && le.domElement === t) return;
try {
const n = await Pe();
yt(e);
const r = await je();
yt(e);
const a = await He();
yt(e);
const o = await Oe();
yt(e);
const s = t.parentElement, i = s?.clientWidth || 420, c = s?.clientHeight || 420;
if (i < 50 || c < 50) return Ae = Date.now(), void ft();
t.width = i, t.height = c, ie = new n.Scene, ie.background = null, ce = new n.PerspectiveCamera(75, i / c, .1, 1e3), 
ce.position.z = 3, le = new n.WebGLRenderer({
canvas: t,
antialias: !0,
alpha: !0,
powerPreference: "high-performance"
}), le.setSize(i, c, !1), le.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)), 
"outputEncoding" in le && n.sRGBEncoding && (le.outputEncoding = n.sRGBEncoding), 
"toneMapping" in le && void 0 !== n.ACESFilmicToneMapping && (le.toneMapping = n.ACESFilmicToneMapping, 
le.toneMappingExposure = .98), ue = new o(ce, le.domElement), ue.autoRotate = !0, 
ue.autoRotateSpeed = 2, ue.enableDamping = !0, ue.dampingFactor = .05;
const l = new n.DirectionalLight(16777215, 1.05);
l.position.set(4.5, 7.5, 6.5), ie.add(l);
const d = new n.DirectionalLight(14412031, .45);
d.position.set(-5.5, 2.8, 3.2), ie.add(d);
const u = new n.DirectionalLight(15725823, .35);
u.position.set(.5, 5.5, -7.5), ie.add(u);
const m = new n.HemisphereLight(16317439, 6254471, .35);
ie.add(m);
const y = new n.AmbientLight(16777215, .28);
ie.add(y), function t() {
e === Te && (me = requestAnimationFrame(t), ue && ue.update(), le && ie && ce && le.render(ie, ce));
}();
try {
const t = await qe(h.user?.id);
if (yt(e), !t) throw new Error("No avatar-3d metadata returned");
const o = String(t.obj || "").trim(), s = String(t.mtl || "").trim();
if (!o || !s) throw new Error("avatar-3d metadata missing obj/mtl hash");
const i = We(o), c = We(s), l = Array.isArray(t.textures) ? t.textures.map(e => String(e || "").trim()).filter(Boolean) : [], d = l.map(e => We(e)).filter(Boolean);
ze({
itemLabel: h.user?.name ? `${h.user.name} avatar preview` : "avatar preview",
sourceEndpoint: t.__sourceEndpoint || "",
metadataUrl: t.__metadataUrl || "",
objUrl: i,
mtlUrl: c,
textureUrls: d
});
const u = new n.LoadingManager;
u.setURLModifier(e => {
const t = Je(e);
if (!t) return e;
if (l.includes(t)) return We(t);
const n = t.split(".")[0];
return l.includes(n) || /^(?:1DAY-)?[a-f0-9]{32}$/i.test(n) ? We(n) : e;
});
const m = await new Promise((e, t) => {
const n = new a(u), r = setTimeout(() => t(new Error("MTL load timeout")), 12e3);
n.load(c, t => {
clearTimeout(r), e(t);
}, void 0, e => {
clearTimeout(r), t(e);
});
});
yt(e), m.preload(), Object.values(m.materials || {}).forEach(e => {
e && (e.transparent = !1, e.opacity = 1, e.alphaMap && (e.alphaMap = null), e.needsUpdate = !0);
}), de && ie && ie.remove(de);
const y = await new Promise((e, t) => {
const n = new r(u);
n.setMaterials(m);
const a = setTimeout(() => t(new Error("OBJ load timeout")), 12e3);
n.load(i, t => {
clearTimeout(a), e(t);
}, void 0, e => {
clearTimeout(a), t(e);
});
});
if (yt(e), de = y, !de || !de.children || de.children.length < 1) throw new Error("Loaded OBJ was empty");
if (st(n, de, h.avatarDefinition), !ie || !ce || !ue) throw new Error("3D preview state was disposed before model attach");
ie.add(de);
const p = (new n.Box3).setFromObject(de), f = p.getCenter(new n.Vector3), v = (e, t) => {
const n = Number(e);
return Number.isFinite(n) ? n : t;
}, g = new n.Vector3(v((Number(t?.aabb?.min?.x) + Number(t?.aabb?.max?.x)) / 2, f.x), v((Number(t?.aabb?.min?.y) + Number(t?.aabb?.max?.y)) / 2, f.y), v((Number(t?.aabb?.min?.z) + Number(t?.aabb?.max?.z)) / 2, f.z)), b = p.getSize(new n.Vector3), w = Math.max(b.x, b.y, b.z, 1), A = ce.fov * (Math.PI / 180), C = 1.55 * Math.abs(w / 2 / Math.tan(A / 2));
ce.position.set(g.x, g.y + .12 * b.y, g.z + Math.max(C, 6)), ce.near = .01, ce.far = Math.max(300, 8 * C), 
ce.updateProjectionMatrix(), ue.target.set(g.x, g.y, g.z), ue.update();
} catch (e) {
if ("PURPURA_PREVIEW_INIT_CANCELLED" === e?.code) return;
if ("PURPURA_AVATAR3D_RATE_LIMITED" === e?.code) return Ae = Date.now(), vt(), void ft();
Ae = Date.now(), vt(), ft();
}
} catch (e) {
if ("PURPURA_PREVIEW_INIT_CANCELLED" === e?.code) return;
Ae = Date.now(), vt(), ft();
}
} catch (e) {
if ("PURPURA_PREVIEW_INIT_CANCELLED" === e?.code) return;
Ae = Date.now(), vt(), ft();
} finally {
e === Te && lt(!1);
}
}

function ft() {
"3d" === h.previewMode && (lt(!1), dt(!0), ut());
}

function ht(e) {
if (("2d" === e || "3d" === e) && h.previewMode !== e) {
if (h.previewMode = e, _(), "2d" === h.previewMode) return lt(!1), dt(!1), vt(), 
void St(xt());
dt(!1), Ae = 0, St(xt()), ct();
}
}

function vt() {
if (Te += 1, lt(!1), me && (cancelAnimationFrame(me), me = null), ye && (cancelAnimationFrame(ye), 
ye = null), le) {
try {
const e = "function" == typeof le.getContext ? le.getContext() : null;
"function" == typeof le.forceContextLoss && le.forceContextLoss();
const t = e && "function" == typeof e.getExtension ? e.getExtension("WEBGL_lose_context") : null;
t && "function" == typeof t.loseContext && t.loseContext();
} catch (e) {}
le.dispose(), le = null;
}
ie && ("function" == typeof ie.traverse && ie.traverse(e => {
if (!e?.isMesh) return;
e.geometry?.dispose?.();
(Array.isArray(e.material) ? e.material : [ e.material ]).forEach(e => {
e && (e.map?.dispose?.(), e.alphaMap?.dispose?.(), e.normalMap?.dispose?.(), e.roughnessMap?.dispose?.(), 
e.metalnessMap?.dispose?.(), e.emissiveMap?.dispose?.(), e.dispose?.());
});
}), ie.clear(), ie = null), ce && (ce = null), ue && (ue.dispose(), ue = null), 
de && ("function" == typeof de.traverse && de.traverse(e => {
if (!e || !e.material) return;
(Array.isArray(e.material) ? e.material : [ e.material ]).forEach(e => {
e.map && e.map.dispose?.(), e.dispose?.();
});
}), de = null);
const e = document.getElementById("avatar-canvas-3d");
if (e) {
const t = e.getContext("2d");
t && t.clearRect(0, 0, e.width, e.height);
}
}

function gt() {
C && (window.clearTimeout(C), C = null), T && (window.clearTimeout(T), T = null);
}

function bt() {
gt(), h.toastOpen && (C = window.setTimeout(() => {
h.toastOpen && (h.toastClosing = !0, bn(), T = window.setTimeout(() => {
At(), bn();
}, f));
}, p));
}

function wt(e, t = "") {
gt(), h.toastOpen = !0, h.toastClosing = !1, h.toastMessage = e, h.toastDetails = t, 
bt();
}

function At() {
gt(), h.toastOpen = !1, h.toastClosing = !1, h.toastMessage = "", h.toastDetails = "";
}

function Ct(e = {
confirmed: !1,
value: ""
}) {
if (h.actionDialog = null, A) {
const t = A;
A = null, t({
confirmed: Boolean(e?.confirmed),
value: String(e?.value || "")
});
}
}

function Tt(e = {}) {
return A && (A({
confirmed: !1,
value: ""
}), A = null), new Promise(t => {
A = t, h.actionDialog = {
mode: "prompt" === e.mode ? "prompt" : "confirm",
title: String(e.title || "Confirm Action"),
message: String(e.message || ""),
confirmText: String(e.confirmText || "Confirm"),
cancelText: String(e.cancelText || "Cancel"),
defaultValue: String(e.defaultValue || ""),
placeholder: String(e.placeholder || "")
}, St(xt());
});
}

function xt() {
const e = document.querySelector(".inventory-scroll-root");
return e ? e.scrollTop : 0;
}

function St(e) {
bn();
const t = document.querySelector(".inventory-scroll-root");
t && (t.scrollTop = e);
}

function kt(e) {
const t = Number(e);
return !Number.isFinite(t) || t <= 0 ? "Asset" : i[t] || "Asset";
}

function Et(e) {
if (!e) return "Asset";
if ("number" == typeof e) return kt(e);
if ("string" == typeof e) {
const t = Number(e);
return Number.isFinite(t) && t > 0 ? kt(t) : "asset" === e.toLowerCase() ? "Asset" : e;
}
const t = Number(e.id ?? e.assetTypeId ?? e.AssetTypeId ?? 0);
if (Number.isFinite(t) && t > 0) {
const e = kt(t);
if ("Asset" !== e) return e;
}
const n = e.name ?? e.type ?? e.displayName ?? "";
return "string" == typeof n && n.trim() ? n : "Asset";
}

function Nt(e) {
return String(e || "").replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("_", " ").trim().split(/\s+/).filter(Boolean).map(e => e.charAt(0).toUpperCase() + e.slice(1).toLowerCase()).join(" ");
}

function It(e) {
const t = String(e || "Asset");
switch (t) {
case "Shirt":
return "Shirt (Classic)";

case "Pants":
return "Pants (Classic)";

case "TShirt":
return "T-Shirt (Classic)";

case "TShirtAccessory":
return "T-Shirt";

case "ShirtAccessory":
return "Shirt";

case "PantsAccessory":
return "Pants";

case "LeftShoeAccessory":
case "RightShoeAccessory":
return "Shoes";

case "DynamicHead":
return "Dynamic Head";

case "MoodAnimation":
return "Mood Animation";
}
return t.endsWith("Accessory") ? Nt(t.replace(/Accessory$/, "")) : t.endsWith("Animation") ? `${Nt(t.replace(/Animation$/, ""))} Animation` : Nt(t);
}

function $t(e) {
switch (e) {
case "Shirt":
return "classic-shirt";

case "Pants":
return "classic-pants";

case "TShirt":
return "classic-tshirt";

case "TShirtAccessory":
case "ShirtAccessory":
case "SweaterAccessory":
case "JacketAccessory":
return "layered-top";

case "PantsAccessory":
case "ShortsAccessory":
case "DressSkirtAccessory":
return "layered-bottom";

case "LeftShoeAccessory":
case "RightShoeAccessory":
return "layered-shoes";

case "Head":
case "DynamicHead":
return "head";

case "Face":
return "face";

case "Torso":
return "torso";

case "LeftArm":
return "left-arm";

case "RightArm":
return "right-arm";

case "LeftLeg":
return "left-leg";

case "RightLeg":
return "right-leg";

case "Hat":
return "hat";

case "Gear":
return "gear";

case "HairAccessory":
return "hair";

case "FaceAccessory":
return "face-accessory";

case "NeckAccessory":
return "neck";

case "ShoulderAccessory":
return "shoulder";

case "FrontAccessory":
return "front";

case "BackAccessory":
return "back";

case "WaistAccessory":
return "waist";

case "EyebrowAccessory":
return "eyebrow";

case "EyelashAccessory":
return "eyelash";

case "LipAccessory":
return "lip";

case "FaceSticker":
return "face-sticker";

case "EyeAccessory":
return "eye";

case "ClimbAnimation":
return "climb";

case "FallAnimation":
return "fall";

case "IdleAnimation":
return "idle";

case "JumpAnimation":
return "jump";

case "RunAnimation":
return "run";

case "SwimAnimation":
return "swim";

case "WalkAnimation":
return "walk";

case "EmoteAnimation":
return "emote";

case "MoodAnimation":
return "mood";

default:
return e;
}
}

function Lt(e) {
return (e?.details || e?.message || "").toString().includes("LimitExceeded");
}

async function Mt(e, t = {}) {
const n = await fetch(e, {
credentials: "include",
...t
});
if (!n.ok) throw new Error(`Request failed (${n.status}): ${e}`);
return n.json();
}

async function Rt() {
const e = "https://avatar.roblox.com/v1/avatar";
try {
const t = await Re(e, {
method: "GET",
accept: "application/json, text/plain;q=0.9, */*;q=0.8",
usePageFetch: !0
});
"string" == typeof t?.csrfToken && t.csrfToken && (h.csrfToken = t.csrfToken), "string" == typeof t?.boundAuthToken && t.boundAuthToken && (h.boundAuthToken = t.boundAuthToken);
const n = Number(t?.status) || 0, r = String(t?.text || "");
if (!t?.ok) {
let t = r || `Request failed (${n})`;
try {
const e = JSON.parse(r), n = Array.isArray(e?.errors) ? e.errors : [];
n.length > 0 && (t = `api error - errors: ${JSON.stringify(n)}`);
} catch (e) {}
const a = new Error(`Request failed (${n}): ${e}`);
throw a.details = t, a;
}
return r ? JSON.parse(r) : {};
} catch (t) {
try {
return await Mt(e);
} catch (e) {
throw !e.details && t?.message && (e.details = t.message), e;
}
}
}

function Ft() {
const e = h.avatarDefinition || {}, t = e?.bodyColors || {}, n = e?.scales && "object" == typeof e.scales ? {
...e.scales
} : {}, r = {
headColor3: zt(t.headColor || "F2D5C7"),
torsoColor3: zt(t.torsoColor || t.headColor || "F2D5C7"),
rightArmColor3: zt(t.rightArmColor || t.torsoColor || t.headColor || "F2D5C7"),
leftArmColor3: zt(t.leftArmColor || t.torsoColor || t.headColor || "F2D5C7"),
rightLegColor3: zt(t.rightLegColor || t.torsoColor || t.headColor || "F2D5C7"),
leftLegColor3: zt(t.leftLegColor || t.torsoColor || t.headColor || "F2D5C7")
}, a = e => {
if (!e || "object" != typeof e) return 0;
let t = 0;
"string" == typeof e.name && e.name.trim() && (t += 1);
const n = Number(e.currentVersionId || e.versionId || 0);
Number.isFinite(n) && n > 0 && (t += 1);
const r = Number(e.assetType?.id ?? e.assetTypeId ?? e.assetType ?? 0), a = String(e.assetType?.name || e.assetTypeName || "").trim();
e?.meta && "object" == typeof e.meta && !Array.isArray(e.meta) && (t += 1);
return (Number.isFinite(r) && r > 0 || a) && (t += 1), t;
}, o = new Map, s = (e, t = "") => {
const n = ((e, t = "") => {
const n = Number(e?.id || e?.assetId || 0);
if (!Number.isFinite(n) || n <= 0) return null;
const r = {
id: n
}, a = String(e?.name || "").trim();
a && (r.name = a);
const o = Number(e?.currentVersionId || e?.versionId || 0);
Number.isFinite(o) && o > 0 && (r.currentVersionId = o);
const s = Et(e?.assetType?.name || e?.assetTypeName || e?.assetType?.id || e?.assetTypeId || t || h.wornAssetTypeById[n] || ""), i = Number(e?.assetType?.id ?? e?.assetTypeId ?? e?.assetType ?? 0);
const c = cloneAssetMeta(e?.meta) || cloneAssetMeta(h.wornAssetMetaById[n]);
return (Number.isFinite(i) && i > 0 || s && "Asset" !== s) && (r.assetType = {}, 
Number.isFinite(i) && i > 0 && (r.assetType.id = i), s && (r.assetType.name = s)), 
r && c && (r.meta = c), 
r;
})(e, t);
if (!n) return;
const r = o.get(n.id);
(!r || a(n) >= a(r)) && o.set(n.id, n);
};
Array.isArray(e?.assets) && e.assets.forEach(e => {
s(e, h.wornAssetTypeById[Number(e?.id || 0)] || "");
}), Array.isArray(h.wornAssetIds) && h.wornAssetIds.forEach(e => {
const t = Number(e || 0);
!Number.isFinite(t) || t <= 0 || s({
id: t
}, h.wornAssetTypeById[t] || "");
});
const i = [ ...o.values() ], c = i.map(e => e.id);
return {
playerAvatarType: h.avatarType || e?.playerAvatarType?.playerAvatarType || "R15",
scales: n,
bodyColor3s: r,
bodyColors: {
headColor3: `#${r.headColor3}`,
torsoColor3: `#${r.torsoColor3}`,
rightArmColor3: `#${r.rightArmColor3}`,
leftArmColor3: `#${r.leftArmColor3}`,
rightLegColor3: `#${r.rightLegColor3}`,
leftLegColor3: `#${r.leftLegColor3}`
},
assetIds: c,
assets: i.map(e => {
const t = {
id: e.id
}, n = cloneAssetMeta(e?.meta);
return n && (t.meta = n), t;
}),
richAssets: i
};
}

async function Ut(e, t, n = {}) {
const r = !0 === n.includeBoundAuth, a = Me(n.method, "POST"), o = "GET" !== a && "HEAD" !== a, s = o && void 0 !== t, i = s ? JSON.stringify(t || {}) : "", c = s ? "application/json" : "";
let l = h.csrfToken || "", d = h.boundAuthToken || "";
if (!l && o) try {
const e = await Re("https://auth.roblox.com/v2/logout", {
method: "POST",
accept: "application/json, text/plain;q=0.9, */*;q=0.8",
usePageFetch: !0,
csrfToken: "fetch",
boundAuthToken: r ? d : ""
});
"string" == typeof e?.csrfToken && e.csrfToken && (l = e.csrfToken, h.csrfToken = e.csrfToken), 
"string" == typeof e?.boundAuthToken && e.boundAuthToken && (d = e.boundAuthToken, 
h.boundAuthToken = e.boundAuthToken);
} catch (e) {}
if (!l && o) try {
const e = new Headers({
"X-CSRF-TOKEN": "fetch"
});
r && d && e.set("x-bound-auth-token", d);
const t = await fetch("https://auth.roblox.com/v2/logout", {
method: "POST",
credentials: "include",
headers: e
}), n = t.headers.get("x-csrf-token"), a = t.headers.get("x-bound-auth-token");
n && (l = n, h.csrfToken = n), a && (d = a, h.boundAuthToken = a);
} catch (e) {}
for (let t = 0; t < 2; t += 1) {
const n = {
method: a,
body: i,
contentType: c,
accept: "application/json, text/plain;q=0.9, */*;q=0.8",
csrfToken: l || (o ? "fetch" : ""),
boundAuthToken: r ? d : ""
};
let s;
try {
s = await Re(e, {
...n,
usePageFetch: !0
});
} catch (e) {
s = {
ok: !1,
status: 0,
contentType: "",
text: e?.message || String(e)
};
}
if (!s?.ok && 0 === Number(s?.status || 0)) try {
const t = await Re(e, {
...n,
usePageFetch: !1
});
t && (t.ok || Number(t.status) > 0) && (s = t);
} catch (e) {
s?.text || (s = {
...s,
text: e?.message || String(e)
});
}
"string" == typeof s?.csrfToken && s.csrfToken && (l = s.csrfToken, h.csrfToken = s.csrfToken), 
"string" == typeof s?.boundAuthToken && s.boundAuthToken && (d = s.boundAuthToken, 
h.boundAuthToken = s.boundAuthToken);
const u = Number(s?.status) || 0;
if (403 === u && t < 1 && o) continue;
const m = String(s?.text || "");
let y = {};
if (m) try {
y = JSON.parse(m);
} catch (e) {
y = {};
}
if (!s?.ok) {
const t = Array.isArray(y?.errors) ? y.errors : [], n = t.length > 0 ? `api error - errors: ${JSON.stringify(t)}` : m || `Request failed (${u})`, r = new Error(`Request failed (${u}): ${e}`);
throw r.details = n, r;
}
return y;
}
throw new Error("Roblox API request failed.");
}

async function Bt(e) {
const t = await Mt(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${encodeURIComponent(e)}&size=420x420&format=Png&isCircular=false&returnPolicy=PlaceHolder`);
return !t || !Array.isArray(t.data) || t.data.length < 1 ? "" : t.data[0].imageUrl || "";
}

async function Pt(e) {
const t = e.map(e => e.id).filter(Boolean);
if (!t.length) return e;
const n = await Mt(`https://thumbnails.roblox.com/v1/assets?assetIds=${t.join(",")}&returnPolicy=PlaceHolder&size=250x250&format=Png&isCircular=false`), r = new Map;
return n && Array.isArray(n.data) && n.data.forEach(e => {
r.set(e.targetId, e.imageUrl || "");
}), e.map(e => ({
...e,
thumbnailUrl: r.get(e.id) || e.thumbnailUrl || ""
}));
}

async function Dt(e) {
const t = e.map(e => e.id).filter(Boolean);
if (!t.length) return e;
const n = new Map, r = [ "150x150", "420x420" ];
for (let e = 0; e < t.length; e += 50) {
const a = t.slice(e, e + 50);
let o = null;
for (let e = 0; e < r.length; e += 1) {
const t = r[e];
try {
o = await Mt(`https://thumbnails.roblox.com/v1/users/outfits?userOutfitIds=${a.join(",")}&size=${t}&format=Png&isCircular=false`);
break;
} catch (t) {
if (e === r.length - 1) throw t;
}
}
o && Array.isArray(o.data) && o.data.forEach(e => {
n.set(e.targetId, e.imageUrl || "");
});
}
return e.map(e => ({
...e,
thumbnailUrl: n.get(e.id) || e.thumbnailUrl || ""
}));
}

async function Ot(e) {
const t = Number(e);
if (!Number.isFinite(t) || t <= 0) return null;
try {
const e = await Mt(`https://economy.roblox.com/v2/assets/${t}/details`), n = e?.Name || e?.name || e?.AssetName || e?.assetName || "", r = Et(e?.AssetType?.Name || e?.assetType?.name || e?.AssetTypeId || e?.assetTypeId || e?.AssetType || e?.assetType);
if (n || "Asset" !== r) return {
id: t,
name: n || `Asset ${t}`,
type: r,
thumbnailUrl: ""
};
} catch (e) {}
try {
const e = await Mt(`https://catalog.roblox.com/v1/assets/${t}/details`), n = e?.name || e?.Name || "", r = Et(e?.assetType?.name || e?.assetTypeName || e?.assetTypeId || e?.assetType?.id);
if (n || "Asset" !== r) return {
id: t,
name: n || `Asset ${t}`,
type: r,
thumbnailUrl: ""
};
} catch (e) {}
return null;
}

async function jt() {
const e = $(r);
if (!e.length) return h.inventoryItems = [], void (h.inventoryHasMore = !1);
const t = new Map, n = new Map, a = e.filter(e => "asset" === e.entityType), o = e.filter(e => "outfit" === e.entityType), s = a.map(e => e.id).filter(Boolean);
for (let e = 0; e < s.length; e += 20) {
const n = s.slice(e, e + 20);
try {
const e = await Ut("https://catalog.roblox.com/v1/catalog/items/details", {
items: n.map(e => ({
itemType: "Asset",
id: e
}))
}, {
method: "POST"
});
e && Array.isArray(e.data) && e.data.forEach(e => {
const n = Number(e?.id || e?.targetId || 0);
if (!n) return;
const r = Et(e?.assetType?.name || e?.assetTypeName || e?.assetType?.id || e?.assetTypeId || e?.itemType || "Asset");
t.set(n, {
id: n,
name: e?.name || `Asset ${n}`,
type: r,
thumbnailUrl: ""
});
});
} catch (e) {}
}
const i = s.filter(e => {
const n = t.get(e);
if (!n) return !0;
return /^Asset\s+\d+$/i.test(String(n.name || "")) || "Asset" === String(n.type || "Asset");
});
const p = await Promise.all(i.map(async e => ({
id: e,
details: await Ot(e)
}))), f = new Map(p.filter(e => e?.details).map(e => [ e.id, e.details ]));
i.forEach(e => {
const n = f.get(e);
if (!n) return;
const r = t.get(e);
t.set(e, {
id: e,
name: n.name || r?.name || `Asset ${e}`,
type: n.type || r?.type || h.wornAssetTypeById[e] || "Asset",
thumbnailUrl: r?.thumbnailUrl || ""
});
});
const c = a.map(e => {
const r = t.get(e.id), a = e.meta || {}, o = {
id: e.id,
name: r?.name || String(a.name || `Asset ${e.id}`),
type: r?.type || String(a.type || h.wornAssetTypeById[e.id] || "Asset"),
thumbnailUrl: r?.thumbnailUrl || String(a.thumbnailUrl || ""),
recentKey: e.key
};
return n.set(e.key, o), o;
});
let l = c;
if (l.length > 0) try {
l = await Pt(l);
} catch (e) {
l = c;
}
l.forEach(e => {
e.recentKey && n.set(e.recentKey, e);
});
const d = o.map(e => {
const t = e.meta || {}, n = Number(e.id);
return {
id: n,
userOutfitId: n,
outfitId: n,
name: String(t.name || `Outfit ${n}`),
type: "Outfit",
thumbnailUrl: String(t.thumbnailUrl || ""),
recentKey: e.key
};
});
let u = d;
if (u.length > 0) {
const e = u.filter(e => !e.thumbnailUrl);
if (e.length > 0) try {
const t = await Dt(e), n = new Map(t.map(e => [ e.id, e.thumbnailUrl || "" ]));
u = u.map(e => ({
...e,
thumbnailUrl: e.thumbnailUrl || n.get(e.id) || ""
}));
} catch (e) {
u = d;
}
}
u.forEach(e => {
e.recentKey && n.set(e.recentKey, e);
});
const m = e.map(e => n.get(e.key)).filter(Boolean).filter(e => {
const t = /^Asset\s+\d+$/i.test(String(e?.name || "")), n = "Asset" === String(e?.type || "Asset");
return !t || !n || (e?.recentKey && (delete h.recentlyEquippedTimestamps[e.recentKey], 
delete h.recentItemMetadata[e.recentKey]), !1);
});
let y = !1;
m.forEach(e => {
if (!e?.recentKey) return;
const t = {
name: String(e.name || ""),
type: String(e.type || ""),
thumbnailUrl: String(e.thumbnailUrl || "")
}, n = h.recentItemMetadata[e.recentKey] || {};
n.name === t.name && n.type === t.type && n.thumbnailUrl === t.thumbnailUrl || (h.recentItemMetadata[e.recentKey] = t, 
y = !0);
}), y && E(), h.inventoryItems = m, h.inventorySeenIds = new Set(h.inventoryItems.map(e => e.id)), 
h.inventoryHasMore = !1;
}

function Ht(e, t) {
const n = Number(e);
return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : t;
}

function _t(e) {
const t = y[e] ?? 0;
return Ht(h.previousScaleSnapshot?.[e], t);
}

function qt(e) {
const t = {
head: 1,
height: 1,
width: 1,
depth: 1,
proportion: 0,
bodyType: 0
}[e] ?? 0;
return Ht(h.avatarDefinition?.scales?.[e], t);
}

function zt(e) {
const t = String(e || "").replace(/^#/, "").trim();
return /^[0-9a-fA-F]{6}$/.test(t) ? t.toUpperCase() : "F2D5C7";
}

function Wt(e) {
const t = zt(e), n = zt(h.preferredSkinTone || t), r = u.map((e, t) => ({
tone: zt(e),
name: m[t] || "Skin Tone",
type: "Skin Color",
source: "preset"
})), a = h.customSkinTones.map(e => zt(e)).filter(e => !u.includes(e)).map(e => ({
tone: e,
name: String(h.customSkinToneNames[e] || "").trim() || `#${e}`,
type: "Skin Color",
source: "custom"
})), o = new Map;
[ ...a, ...r ].forEach(e => {
e && e.tone && !o.has(e.tone) && o.set(e.tone, e);
});
let s = o.get(n) || o.get(t) || null;
if (!s) {
const e = String(h.customSkinToneNames[n] || "").trim();
s = {
tone: n,
name: e || `#${n}`,
type: "Skin Color",
source: "custom"
};
}
const i = [ s, ...Array.from(o.values()).filter(e => e.tone !== s.tone) ];
return {
selectedTone: s.tone,
entries: i
};
}

async function Jt() {
if (!h.user || h.saving) return;
const e = {};
d.forEach(t => {
const n = document.getElementById(`scale-${t}`), r = document.getElementById(`scale-number-${t}`), a = r ? r.value : n?.value;
e[t] = Ht(a, qt(t));
}), h.saving = !0, At();
const t = xt();
St(t);
try {
try {
await Ut("https://avatar.roblox.com/v1/avatar/set-scales", e, {
includeBoundAuth: !0
});
} catch (t) {
await Ut("https://avatar.roblox.com/v2/avatar/set-scales", e, {
includeBoundAuth: !0
});
}
at(await Rt()), await en(h.user.id), "3d" === h.previewMode && vt();
} catch (e) {
wt("Could not update body scale.", e.details || e.message || "Unknown error");
} finally {
h.saving = !1, St(t);
}
}

async function Gt(e) {
if (!h.user || h.saving) return;
const t = zt(e);
h.preferredSkinTone = t;
const n = {
headColor3: `#${t}`,
torsoColor3: `#${t}`,
rightArmColor3: `#${t}`,
leftArmColor3: `#${t}`,
rightLegColor3: `#${t}`,
leftLegColor3: `#${t}`
}, r = {
headColor: t,
torsoColor: t,
rightArmColor: t,
leftArmColor: t,
rightLegColor: t,
leftLegColor: t
};
h.saving = !0, At();
const a = xt();
St(a);
try {
try {
await pn("https://avatar.roblox.com/v2/avatar/set-body-colors", n);
} catch (e) {
await pn("https://avatar.roblox.com/v1/avatar/set-body-colors", r);
}
at(await Rt()), await en(h.user.id), "3d" === h.previewMode && vt();
} catch (e) {
wt("Could not update skin tone.", e.details || e.message || "Unknown error");
} finally {
h.saving = !1, St(a);
}
}

function Vt(e, t = 0) {
const n = e.assetId;
if (!n) return null;
let r = Et(e.assetType ?? e.assetTypeId ?? e.assetType?.id ?? e.assetTypeName);
"Asset" === r && Number(t) > 0 && (r = kt(t));
return {
id: n,
name: e.name || e.assetName || e.itemName || e.displayName || `Asset ${n}`,
type: r,
thumbnailUrl: ""
};
}

function Kt(e) {
const t = Number(e?.userOutfitId || e?.id || e?.outfitId || 0), n = Number(e?.outfitId || e?.id || t || 0), r = t || n;
return !Number.isFinite(r) || r <= 0 ? null : {
id: r,
userOutfitId: Number.isFinite(t) && t > 0 ? t : r,
outfitId: Number.isFinite(n) && n > 0 ? n : r,
name: e.name || `Outfit ${r}`,
type: "Outfit",
thumbnailUrl: e.thumbnail || ""
};
}

function Qt() {
return `${h.activeCategory}::${h.activeSubcategory}`;
}

function Zt(e, t = "") {
const n = h.inventoryTypeIds[h.inventoryTypeIndex];
if (-100 === n || -101 === n) {
const r = -100 === n, o = Number.parseInt(String(t || "1"), 10), s = new URLSearchParams({
itemsPerPage: String(a),
page: Number.isFinite(o) && o > 0 ? String(o) : "1",
isEditable: r ? "true" : "false"
});
return `https://avatar.roblox.com/v1/users/${encodeURIComponent(e)}/outfits?${s.toString()}`;
}
const r = new URLSearchParams({
sortOrder: "Desc",
limit: "100"
});
return t && r.set("cursor", t), `https://inventory.roblox.com/v2/users/${e}/inventory/${n}?${r.toString()}`;
}

function Yt() {
const e = ee();
h.inventoryItems = [], h.inventoryTypeIds = [ ...e ], h.inventoryTypeIndex = 0, 
h.inventoryTypeCursors = Object.fromEntries(e.map(e => [ e, "" ])), h.inventoryHasMore = e.length > 0, 
h.inventorySeenIds = new Set, h.inventoryKey = Qt(), w += 1, h.loadingInventory = !1;
}

async function Xt(e = !1) {
if (!h.user) return;
if (h.inventoryKey === Qt() || Yt(), h.loadingInventory) {
if (!e) return;
w += 1, h.loadingInventory = !1;
}
if (!e && !h.inventoryHasMore) return;
const t = ++w, n = h.inventoryKey, r = () => t !== w || n !== h.inventoryKey || n !== Qt();
h.loadingInventory = !0;
const o = xt();
St(o);
try {
if (r()) return;
if (te() || ne()) return h.inventoryItems = [], h.inventoryHasMore = !1, void (h.inventoryTypeIndex = h.inventoryTypeIds.length);
if ("Recent" === h.activeCategory) return await jt(), void (h.inventoryTypeIndex = h.inventoryTypeIds.length);
let e = !1, t = 0;
for (;h.inventoryHasMore && !e && t < 4; ) {
if (r()) return;
if (t += 1, h.inventoryTypeIndex >= h.inventoryTypeIds.length) {
h.inventoryHasMore = !1;
break;
}
const n = h.inventoryTypeIds[h.inventoryTypeIndex], o = h.inventoryTypeCursors[n] || "", s = Zt(h.user.id, o);
let i;
try {
i = await Mt(s);
} catch (e) {
if (r()) return;
h.inventoryTypeIndex += 1, h.inventoryHasMore = h.inventoryTypeIndex < h.inventoryTypeIds.length;
continue;
}
if (r()) return;
let c = [], l = "";
const d = -100 === n || -101 === n;
if (d) {
c = (Array.isArray(i.data) ? i.data : Array.isArray(i.outfits) ? i.outfits : Array.isArray(i.userOutfits) ? i.userOutfits : []).map(Kt).filter(Boolean);
const e = Number.parseInt(String(i.page || o || "1"), 10), t = Number.isFinite(e) && e > 0 ? e : 1, n = i.nextPageCursor || i.nextCursor || i.nextPage || i.nextPageNumber || "", r = Number(i.totalPages || i.pages || 0), s = Number(i.total || i.totalItems || i.totalCount || 0), d = Number(i.itemsPerPage || a);
if ("string" == typeof n && n) l = n; else if (Number.isFinite(n) && n > 0) l = String(n); else if (Number.isFinite(r) && r > 0) l = t < r ? String(t + 1) : ""; else if (Number.isFinite(s) && s > 0 && Number.isFinite(d) && d > 0) {
l = t < Math.ceil(s / d) ? String(t + 1) : "";
} else l = c.length >= a ? String(t + 1) : "";
} else c = Array.isArray(i.data) ? i.data.map(e => Vt(e, n)).filter(Boolean) : [], 
l = i.nextPageCursor || "";
const u = c.filter(e => !h.inventorySeenIds.has(e.id) && (h.inventorySeenIds.add(e.id), 
!0));
let m = u;
if (u.length > 0) try {
m = d ? await Dt(u) : await Pt(u);
} catch (e) {
m = u;
}
if (r()) return;
h.inventoryItems = [ ...h.inventoryItems, ...m ], e = m.length > 0, h.inventoryTypeCursors[n] = l, 
l || (h.inventoryTypeIndex += 1), h.inventoryHasMore = h.inventoryTypeIndex < h.inventoryTypeIds.length;
}
} catch (e) {
r() || (wt("Failed to load inventory for this section.", e.message || "Unknown inventory error"), 
h.inventoryHasMore = !1);
} finally {
t === w && (h.loadingInventory = !1, St(o));
}
}

async function en(e) {
const t = h.avatarPreviewUrl;
try {
h.avatarPreviewUrl = await Bt(e);
} catch (e) {}
return h.previewBust = Date.now(), h.avatarPreviewUrl !== t;
}

function tn() {
g && window.clearInterval(g), g = window.setInterval(async () => {
if (!h.user || h.loadingProfile || h.saving || document.hidden) return;
let e = !1;
try {
const t = await Rt(), n = rt(t);
n && n !== Ce && (at(t), e = !0);
} catch (e) {}
let t = !1;
"2d" === h.previewMode && (t = await en(h.user.id)), e || "2d" === h.previewMode && t ? "3d" === h.previewMode ? (vt(), 
e && St(xt()), ct()) : St(xt()) : "3d" !== h.previewMode || le || ct();
}, 6e3);
}

async function nn() {
h.loadingProfile = !0, At(), k(), q(), K(), H(), bn();
try {
const [e, t] = await Promise.all([ Mt("https://users.roblox.com/v1/users/authenticated"), Rt(), Xe() ]);
h.user = e, at(t), await en(e.id), tn(), vt(), ae(), Yt(), await Xt(!0);
} catch (e) {
wt("Could not load Roblox avatar data. Make sure you are logged in and reload.");
} finally {
h.loadingProfile = !1, bn();
}
}

async function rn(e) {
if (h.user && !h.saving && ("R15" === e || "R6" === e)) {
h.saving = !0, At(), bn();
try {
try {
await Ut("https://avatar.roblox.com/v2/avatar/set-player-avatar-type", {
playerAvatarType: e
}, {
includeBoundAuth: !0
});
} catch (t) {
await Ut("https://avatar.roblox.com/v1/avatar/set-player-avatar-type", {
playerAvatarType: e
}, {
includeBoundAuth: !0
});
}
at(await Rt()), await en(h.user.id), vt();
} catch (e) {
wt("Could not change avatar type.", e.details || e.message || "Unknown error");
} finally {
h.saving = !1, bn();
}
}
}

async function an(e) {
if (h.saving || !h.user) return;
h.saving = !0, At();
const t = xt();
St(t);
try {
const t = h.inventoryItems.find(t => t.id === e) || null, r = new Set(h.wornAssetIds), a = r.has(e), s = cloneAssetMeta(t?.meta);
if (a) r.delete(e); else {
if (t && n.has(t.type) && Object.entries(h.wornAssetTypeById).forEach(([n, a]) => {
const o = Number(n);
o !== e && a === t.type && r.delete(o);
}), t) {
const n = $t(t.type);
Object.entries(h.wornAssetTypeById).forEach(([t, a]) => {
const o = Number(t);
o !== e && $t(a) === n && r.delete(o);
});
}
r.add(e);
}
let o = new Set(r);
try {
await Ut("https://avatar.roblox.com/v2/avatar/set-wearing-assets", {
assets: [ ...o ].map(t => buildWearingAssetPayload(t, t === e ? s : null)).filter(Boolean)
}, {
includeBoundAuth: !0
});
} catch (n) {
if (!Lt(n) || !t) throw n;
const r = $t(t.type);
Object.entries(h.wornAssetTypeById).forEach(([t, n]) => {
const a = Number(t);
a !== e && $t(n) === r && o.delete(a);
}), await Ut("https://avatar.roblox.com/v2/avatar/set-wearing-assets", {
assets: [ ...o ].map(t => buildWearingAssetPayload(t, t === e ? s : null)).filter(Boolean)
}, {
includeBoundAuth: !0
});
}
const i = await Rt();
at(i), Array.isArray(i.assets) || (h.wornAssetIds = [ ...o ], h.wornAssetMetaById = [ ...o ].reduce((t, n) => {
const r = cloneAssetMeta(n === e ? s : h.wornAssetMetaById[n]);
return r && (t[n] = r), t;
}, {})), await en(h.user.id), 
a || R(e, t), vt();
} catch (e) {
wt("Could not apply outfit change for this item.", e.details || e.message || "Unknown error");
} finally {
h.saving = !1, St(t);
}
}

async function on(e) {
const t = Number(e);
if (!h.user || h.saving || !Number.isFinite(t) || t <= 0) return;
h.saving = !0, At();
const n = xt();
St(n);
try {
const e = h.inventoryItems.find(e => [ e?.userOutfitId, e?.id, e?.outfitId ].map(e => Number(e || 0)).includes(t)), n = [ {
url: `https://avatar.roblox.com/v1/outfits/${t}/wear`,
body: void 0
}, {
url: `https://avatar.roblox.com/v1/outfits/${t}/wear`,
body: {}
}, {
url: "https://avatar.roblox.com/v1/avatar/set-current-outfit",
body: {
userOutfitId: t
}
}, {
url: "https://avatar.roblox.com/v1/avatar/set-outfit",
body: {
userOutfitId: t
}
}, {
url: "https://avatar.roblox.com/v1/avatar/set-current-outfit",
body: {
outfitId: t
}
}, {
url: "https://avatar.roblox.com/v1/avatar/set-outfit",
body: {
outfitId: t
}
} ];
let r = !1, a = null;
for (const e of n) try {
await pn(e.url, e.body), r = !0;
break;
} catch (e) {
a = e;
}
if (!r) {
const e = [ `https://avatar.roblox.com/v1/outfits/${t}/details`, `https://avatar.roblox.com/v1/outfits/${t}` ], n = async () => {
let t = null;
for (const n of e) try {
const e = await Re(n, {
method: "GET",
accept: "application/json, text/plain;q=0.9, */*;q=0.8",
usePageFetch: !0
});
if ("string" == typeof e?.csrfToken && e.csrfToken && (h.csrfToken = e.csrfToken), 
"string" == typeof e?.boundAuthToken && e.boundAuthToken && (h.boundAuthToken = e.boundAuthToken), 
!e?.ok) {
t = new Error(`Request failed (${Number(e?.status) || 0}): ${n}`), t.details = String(e?.text || "");
continue;
}
const r = String(e?.text || "").trim();
if (!r.startsWith("{")) continue;
return JSON.parse(r);
} catch (e) {
t = e;
}
throw t || new Error("Could not load outfit details.");
};
try {
const e = await n(), t = (Array.isArray(e?.assets) ? e.assets : Array.isArray(e?.outfit?.assets) ? e.outfit.assets : []).map(e => {
const t = Number(e?.id || e?.assetId || 0);
return Number.isFinite(t) && t > 0 ? buildWearingAssetPayload(t, e?.meta, !1) : null;
}).filter(Boolean);
let a = !1;
t.length > 0 && (await pn("https://avatar.roblox.com/v2/avatar/set-wearing-assets", {
assets: t
}), a = !0);
const o = e?.scales || e?.scale || e?.outfit?.scales || e?.outfit?.scale || null;
if (o && "object" == typeof o) {
const e = d.reduce((e, t) => (void 0 === o[t] || null === o[t] || (e[t] = Ht(o[t], y[t])), 
e), {});
if (Object.keys(e).length > 0) {
try {
await pn("https://avatar.roblox.com/v1/avatar/set-scales", e);
} catch (t) {
await pn("https://avatar.roblox.com/v2/avatar/set-scales", e);
}
a = !0;
}
}
const s = e?.bodyColor3s || e?.bodyColors || e?.outfit?.bodyColor3s || e?.outfit?.bodyColors || null;
if (s && "object" == typeof s) {
const e = et(s.torsoColor3 ?? s.torsoColor ?? s.torsoColorId, "f2d5c7").toUpperCase(), t = et(s.headColor3 ?? s.headColor ?? s.headColorId, e).toUpperCase(), n = et(s.rightArmColor3 ?? s.rightArmColor ?? s.rightArmColorId, e).toUpperCase(), r = et(s.leftArmColor3 ?? s.leftArmColor ?? s.leftArmColorId, e).toUpperCase(), o = et(s.rightLegColor3 ?? s.rightLegColor ?? s.rightLegColorId, e).toUpperCase(), i = et(s.leftLegColor3 ?? s.leftLegColor ?? s.leftLegColorId, e).toUpperCase(), c = {
headColor3: `#${t}`,
torsoColor3: `#${e}`,
rightArmColor3: `#${n}`,
leftArmColor3: `#${r}`,
rightLegColor3: `#${o}`,
leftLegColor3: `#${i}`
}, l = {
headColor: t,
torsoColor: e,
rightArmColor: n,
leftArmColor: r,
rightLegColor: o,
leftLegColor: i
};
try {
await pn("https://avatar.roblox.com/v2/avatar/set-body-colors", c);
} catch (e) {
await pn("https://avatar.roblox.com/v1/avatar/set-body-colors", l);
}
a = !0;
}
a && (r = !0);
} catch (e) {
a = e;
}
}
if (!r) throw a || new Error("Could not wear selected outfit.");
const o = await Rt();
at(o), h.currentOutfitId = Number(o?.currentOutfitId || t) || t, F({
id: t,
userOutfitId: t,
outfitId: t,
name: e?.name || `Outfit ${t}`,
thumbnailUrl: e?.thumbnailUrl || ""
}), await en(h.user.id), "3d" === h.previewMode && vt();
} catch (e) {
wt("Could not apply this avatar outfit.", e.details || e.message || "Unknown error");
} finally {
h.saving = !1, St(n);
}
}

function sn(e = "", t = {}) {
const n = Ft(), r = !1 !== t.includeName, a = String(e || "").trim(), o = Array.isArray(n?.assetIds) ? n.assetIds : [], s = Array.isArray(n?.assets) && n.assets.length > 0 ? n.assets : [], i = {
assets: s.length > 0 ? s : void 0,
assetIds: o.length > 0 ? o : void 0,
bodyColors: n?.bodyColors || void 0,
scales: n?.scales || void 0,
scale: n?.scales || void 0,
playerAvatarType: n?.playerAvatarType || h.avatarType
};
return r && a && (i.name = a), i;
}

function cn(e = "") {
const t = Ft();
return {
name: String(e || "").trim(),
bodyColor3s: t?.bodyColor3s || void 0,
assets: Array.isArray(t?.richAssets) && t.richAssets.length > 0 ? t.richAssets : t?.assets,
scale: t?.scales || void 0,
playerAvatarType: t?.playerAvatarType || h.avatarType
};
}

function ln(e = {}) {
const t = Ft(), n = e?.bodyColor3s && "object" == typeof e.bodyColor3s ? e.bodyColor3s : {}, r = t?.bodyColor3s && "object" == typeof t.bodyColor3s ? t.bodyColor3s : {}, a = {
headColor3: zt(n.headColor3 ?? n.headColor ?? r.headColor3),
torsoColor3: zt(n.torsoColor3 ?? n.torsoColor ?? r.torsoColor3),
rightArmColor3: zt(n.rightArmColor3 ?? n.rightArmColor ?? r.rightArmColor3),
leftArmColor3: zt(n.leftArmColor3 ?? n.leftArmColor ?? r.leftArmColor3),
rightLegColor3: zt(n.rightLegColor3 ?? n.rightLegColor ?? r.rightLegColor3),
leftLegColor3: zt(n.leftLegColor3 ?? n.leftLegColor ?? r.leftLegColor3)
}, o = e?.scale && "object" == typeof e.scale ? e.scale : e?.scales && "object" == typeof e.scales ? e.scales : {}, s = t?.scales && "object" == typeof t.scales ? t.scales : {}, i = d.reduce((e, t) => (e[t] = Ht(o?.[t] ?? s?.[t], y[t] ?? 0), 
e), {}), c = e => {
const t = Number(e?.id || e?.assetId || 0);
if (!Number.isFinite(t) || t <= 0) return null;
const n = {
id: t
}, r = String(e?.name || "").trim();
r && (n.name = r);
const a = Number(e?.currentVersionId || e?.versionId || 0);
Number.isFinite(a) && a > 0 && (n.currentVersionId = a);
const o = Number(e?.assetType?.id ?? e?.assetTypeId ?? e?.assetType ?? 0), s = Et(e?.assetType?.name || e?.assetTypeName || o || h.wornAssetTypeById[t] || "");
const i = cloneAssetMeta(e?.meta) || cloneAssetMeta(h.wornAssetMetaById[t]);
return (Number.isFinite(o) && o > 0 || s && "Asset" !== s) && (n.assetType = {}, 
Number.isFinite(o) && o > 0 && (n.assetType.id = o), s && "Asset" !== s && (n.assetType.name = s)), 
i && (n.meta = i), 
n;
}, l = Array.isArray(e?.assets) ? e.assets : [], u = Array.isArray(t?.richAssets) ? t.richAssets : Array.isArray(t?.assets) ? t.assets : [];
let m = l.map(c).filter(Boolean);
return m.length < 1 && (m = u.map(c).filter(Boolean)), m.length < 1 && Array.isArray(t?.assetIds) && (m = t.assetIds.map(e => c({
id: e
})).filter(Boolean)), {
bodyColor3s: a,
assets: m,
scale: i
};
}

async function dn() {
try {
return await pn("https://avatar.roblox.com/v2/avatar/avatar", void 0, {
method: "GET"
});
} catch (e) {
try {
return await Rt();
} catch (t) {
throw t.details || !e?.details && !e?.message || (t.details = e.details || e.message), 
t;
}
}
}

async function un(e) {
const t = Number(e);
if (!h.user || h.saving || !Number.isFinite(t) || t <= 0) return;
if (!(await Tt({
mode: "confirm",
title: "Update Avatar Outfit",
message: "Update this outfit with your current avatar appearance?",
confirmText: "Update",
cancelText: "Cancel"
})).confirmed) return;
h.saving = !0, At();
const n = xt();
St(n);
try {
const e = ln(await dn());
if (!Array.isArray(e.assets) || e.assets.length < 1) throw new Error("Could not build update payload from current avatar.");
await pn(`https://avatar.roblox.com/v3/outfits/${t}`, e, {
method: "PATCH"
}), "Avatars" === h.activeCategory && "Created" === h.activeSubcategory && (Yt(), 
await Xt(!0));
} catch (e) {
wt("Could not update this avatar outfit.", e.details || e.message || "Unknown error");
} finally {
h.saving = !1, St(n);
}
}

async function mn(e) {
const t = Number(e);
if (!h.user || h.saving || !Number.isFinite(t) || t <= 0) return;
if (!(await Tt({
mode: "confirm",
title: "Delete Avatar Outfit",
message: "Delete this avatar outfit? This cannot be undone.",
confirmText: "Delete",
cancelText: "Cancel"
})).confirmed) return;
h.saving = !0, At();
const n = xt();
St(n);
try {
const e = [ {
url: `https://avatar.roblox.com/v1/outfits/${t}`,
method: "DELETE",
body: void 0
}, {
url: `https://avatar.roblox.com/v1/outfits/${t}/delete`,
method: "POST",
body: {}
}, {
url: "https://avatar.roblox.com/v1/outfits/delete",
method: "POST",
body: {
userOutfitId: t
}
} ];
let n = !1, r = null;
for (const t of e) try {
await pn(t.url, t.body, {
method: t.method
}), n = !0;
break;
} catch (e) {
r = e;
}
if (!n) throw r || new Error("Could not delete avatar outfit.");
const a = N("outfit", t);
a && (delete h.recentlyEquippedTimestamps[a], delete h.recentItemMetadata[a], E()), 
"Avatars" === h.activeCategory && "Created" === h.activeSubcategory && (Yt(), await Xt(!0));
} catch (e) {
wt("Could not delete this avatar outfit.", e.details || e.message || "Unknown error");
} finally {
h.saving = !1, St(n);
}
}

async function yn() {
if (!h.user || h.saving) return;
const e = `Avatar ${(new Date).toISOString().slice(0, 10)}`, t = await Tt({
mode: "prompt",
title: "Design Avatar Outfit",
message: "Choose a name for your new avatar outfit.",
confirmText: "Establish",
cancelText: "Cancel",
defaultValue: e,
placeholder: "Avatar name"
});
if (!t.confirmed) return;
const n = String(t.value || "").trim() || e;
h.saving = !0, At();
const r = xt();
St(r);
try {
const e = cn(n), t = sn(n, {
includeName: !0
}), r = [ {
endpoint: "https://avatar.roblox.com/v3/outfits/create",
body: e
}, {
endpoint: "https://avatar.roblox.com/v3/outfits/create",
body: {
name: n,
bodyColor3s: e.bodyColor3s,
assets: t.assets,
scale: e.scale,
playerAvatarType: e.playerAvatarType
}
}, {
endpoint: "https://avatar.roblox.com/v2/outfits/create",
body: {
name: n,
assets: t.assets,
assetIds: t.assetIds,
bodyColors: t.bodyColors,
scales: t.scales,
playerAvatarType: t.playerAvatarType
}
}, {
endpoint: "https://avatar.roblox.com/v1/outfits/create",
body: {
name: n,
assets: t.assets,
assetIds: t.assetIds,
bodyColors: t.bodyColors,
scales: t.scales,
playerAvatarType: t.playerAvatarType
}
}, {
endpoint: "https://avatar.roblox.com/v1/outfits",
body: {
name: n,
assets: t.assets,
assetIds: t.assetIds,
bodyColors: t.bodyColors,
scales: t.scales,
playerAvatarType: t.playerAvatarType
}
} ];
let a = null, o = null;
for (const e of r) try {
a = await pn(e.endpoint, e.body);
break;
} catch (e) {
o = e;
}
if (!a) throw o || new Error("Could not make new avatar outfit.");
"Avatars" === h.activeCategory && "Created" === h.activeSubcategory && (Yt(), await Xt(!0));
} catch (e) {
wt("Could not create a new avatar.", e.details || e.message || "Unknown error");
} finally {
h.saving = !1, St(r);
}
}

async function pn(e, t, n = {}) {
let r = null;
for (const a of [ !0, !1 ]) try {
return await Ut(e, t, {
...n,
includeBoundAuth: a
});
} catch (e) {
r = e;
}
throw r || new Error("Roblox API request failed.");
}

function fn() {
const n = Object.keys(e[h.activeCategory] || {}), r = n.length > 1, a = "Avatars" === h.activeCategory && "Created" === h.activeSubcategory;
const o = n.map(e => `<button class="bar-button ${h.activeSubcategory === e ? "bar-button-selected" : ""}" data-subcategory="${e}">${e}</button>`).join("");
return `\n    <div class="bar-category">\n      ${t.map(e => `<button class="bar-button ${h.activeCategory === e ? "bar-button-selected" : ""}" data-category="${e}">${e}</button>`).join("")}\n    </div>\n    ${r ? a ? `<div class="bar-row">\n      <div class="bar-category bar-double-margin bar-subcategory-wrap">\n        ${o}\n      </div>\n      <button id="create-avatar-outfit" class="avatar-create-button" type="button" title="New Avatar Outfit" aria-label="New Avatar Outfit" ${h.saving ? "disabled" : ""}><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg></button>\n    </div>` : `<div class="bar-category bar-double-margin">\n      ${o}\n    </div>` : ""}\n  `;
}

function hn() {
const e = {
height: "Height",
width: "Width",
head: "Head",
depth: "Depth",
proportion: "Proportion",
bodyType: "Body Type"
};
return `\n    <div class="body-controls-panel">\n      <p class="body-controls-title">Scale</p>\n      <p class="body-controls-subtitle">Adjust your avatar body scale and save.</p>\n      ${d.map(t => {
const n = qt(t), r = _t(t);
return `\n            <label class="body-scale-row" for="scale-${t}">\n              <span class="body-scale-label">${e[t] || t}</span>\n              <div class="body-scale-inputs">\n                <input\n                  id="scale-${t}"\n                  class="body-scale-slider"\n                  type="range"\n                  min="0"\n                  max="1"\n                  step="0.01"\n                  value="${n.toFixed(2)}"\n                  ${h.saving ? "disabled" : ""}\n                />\n                <input\n                  id="scale-number-${t}"\n                  class="body-scale-number"\n                  type="number"\n                  min="0"\n                  max="1"\n                  step="0.01"\n                  value="${n.toFixed(2)}"\n                  ${h.saving ? "disabled" : ""}\n                />\n              </div>\n              <span class="body-scale-value" id="scale-value-${t}">${n.toFixed(2)}</span>\n              <button class="body-scale-revert" data-scale-revert="${t}" ${h.saving ? "disabled" : ""}>Prev ${r.toFixed(2)}</button>\n            </label>\n          `;
}).join("")}\n      <button id="save-body-scale" class="body-control-save" ${h.saving ? "disabled" : ""}>Save Scale</button>\n    </div>\n  `;
}

function vn() {
const e = Wt(h.avatarDefinition?.bodyColors?.headColor || "F2D5C7"), t = e.selectedTone, n = h.searchTerm.trim().toLowerCase(), r = e.entries.filter(e => !n || `${e.name} ${e.type} ${e.tone}`.toLowerCase().includes(n));
return r.length < 1 ? '<p class="status-line">No skin color matches your search.</p>' : `\n    <div class="skin-tone-custom-row">\n      <label class="skin-tone-custom-label" for="custom-skin-tone-hex">Custom Hex</label>\n      <div class="skin-tone-custom-controls">\n        <input id="custom-skin-tone-hex" class="skin-tone-custom-input" type="text" maxlength="7" placeholder="#564236" value="#${t}" ${h.saving ? "disabled" : ""} />\n        <input id="custom-skin-tone-picker" class="skin-tone-custom-picker" type="color" value="#${t}" ${h.saving ? "disabled" : ""} />\n        <button id="apply-custom-skin-tone" class="skin-tone-custom-apply" type="button" ${h.saving ? "disabled" : ""}>Apply</button>\n      </div>\n    </div>\n    <div class="item-container skin-tone-item-container">\n      ${r.map(e => {
const n = t === e.tone;
return `\n            <article class="item skin-tone-item">\n              <button\n                class="item-image skin-tone-item-image ${n ? "equipped" : ""}"\n                data-skin-tone="${e.tone}"\n                title="${Y(e.name)}"\n                ${h.saving ? "disabled" : ""}\n              >\n                <div class="skin-tone-item-fill" style="background:#${e.tone};"></div>\n                <span class="worn-item-check" ${n ? "" : 'style="opacity:0"'}>✓</span>\n              </button>\n              <div class="item-name">${Y(e.name)}</div>\n              <div class="item-subtext">${Y(`${e.type} | #${e.tone}`)}</div>\n            </article>\n          `;
}).join("")}\n    </div>\n  `;
}

function gn() {
if (te()) return hn();
if (ne()) return vn();
const e = re();
return "Head" === h.activeCategory && "Faces" === h.activeSubcategory ? '\n      <div class="empty-state empty-state-illustrated">\n        <svg class="empty-icon gravestone-icon" width="100%" viewBox="0 0 680 480" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n          <style>\n            .stone-fill { fill: #7a7a7a; }\n            .stone-dark { fill: #5c5c5c; }\n            .stone-light { fill: #9e9e9e; }\n            .ground { fill: #4a5a3a; }\n            .grass { fill: #5c7048; }\n            .moss { fill: #6b7c4e; opacity: 0.5; }\n            .engraved { fill: none; stroke: #444; stroke-width: 1.2; }\n            .text-stone { font-family: Georgia, serif; fill: #3a3a3a; text-anchor: middle; }\n            .crack { stroke: #555; stroke-width: 0.8; fill: none; opacity: 0.6; }\n          </style>\n          <rect x="160" y="390" width="360" height="60" rx="4" class="ground"/>\n          <ellipse cx="220" cy="390" rx="20" ry="8" class="grass"/>\n          <ellipse cx="270" cy="388" rx="14" ry="6" class="grass"/>\n          <ellipse cx="400" cy="389" rx="18" ry="7" class="grass"/>\n          <ellipse cx="460" cy="390" rx="22" ry="8" class="grass"/>\n          <ellipse cx="340" cy="391" rx="10" ry="5" class="grass"/>\n          <rect x="230" y="370" width="220" height="32" rx="3" class="stone-dark"/>\n          <rect x="232" y="370" width="216" height="6" rx="2" class="stone-light" opacity="0.4"/>\n          <path d="M255 370 L255 140 Q255 100 295 95 L340 88 L385 95 Q425 100 425 140 L425 370 Z" fill="#4e4e4e"/>\n          <path d="M250 370 L250 142 Q250 100 290 94 L340 86 L390 94 Q430 100 430 142 L430 370 Z" class="stone-fill"/>\n          <path d="M250 370 L250 142 Q250 100 290 94 L305 92 L305 370 Z" fill="#8c8c8c" opacity="0.35"/>\n          <path d="M270 350 L270 165 Q270 130 305 120 L340 115 L375 120 Q410 130 410 165 L410 350 Z" class="engraved"/>\n          <rect x="332" y="128" width="16" height="52" rx="2" fill="#555"/>\n          <rect x="316" y="144" width="48" height="14" rx="2" fill="#555"/>\n          <ellipse cx="260" cy="280" rx="12" ry="18" class="moss"/>\n          <ellipse cx="420" cy="310" rx="10" ry="14" class="moss"/>\n          <ellipse cx="265" cy="350" rx="8" ry="10" class="moss"/>\n          <path d="M385 200 L380 230 L383 255 L378 290" class="crack"/>\n          <text x="340" y="205" class="text-stone" font-size="15" font-weight="700" letter-spacing="2">R.I.P</text>\n          <text x="340" y="232" class="text-stone" font-size="13" font-style="italic">Here Lies</text>\n          <text x="340" y="255" class="text-stone" font-size="16" font-weight="700" letter-spacing="1">Classic Faces</text>\n          <line x1="285" y1="264" x2="395" y2="264" stroke="#555" stroke-width="0.8"/>\n          <text x="340" y="283" class="text-stone" font-size="11">2004 - 2026</text>\n          <text x="340" y="308" class="text-stone" font-size="10" font-style="italic">&quot;Removed by Roblox.&quot;</text>\n        </svg>\n        <p class="empty-title">2D Faces Removed</p>\n        <p class="status-line">Roblox removed classic faces in favor of Dynamic Heads.</p>\n      </div>\n    ' : h.loadingProfile ? '<p class="status-line">Loading profile...</p>' : "Recent" !== h.activeCategory || 0 !== e.length || h.loadingInventory ? 0 !== e.length || h.loadingInventory ? `\n    <div class="item-container">\n      ${e.map(e => {
const t = "Outfit" === e.type, n = Number(e.userOutfitId || e.id || e.outfitId || 0), r = t ? h.currentOutfitId === n || h.currentOutfitId === Number(e.id) || h.currentOutfitId === Number(e.outfitId) : h.wornAssetIds.includes(e.id), a = t && "Avatars" === h.activeCategory, o = t ? a ? "" : "Avatar Outfit" : It(e.type), s = t ? `data-outfit-id="${n}"` : `data-asset-id="${e.id}"`, i = t && "Avatars" === h.activeCategory && "Created" === h.activeSubcategory;
return `\n            <article class="item">\n              <button class="item-image ${r ? "equipped" : ""}" ${s} ${"Recent" === h.activeCategory && e.recentKey ? `data-recent-key="${Y(e.recentKey)}"` : ""} ${h.saving ? "disabled" : ""}>\n                ${e.thumbnailUrl ? `<img src="${Y(e.thumbnailUrl)}" alt="${Y(e.name)}" />` : '<div class="item-loading"></div>'}\n                <span class="worn-item-check" ${r ? "" : 'style="opacity:0"'}>✓</span>\n              </button>\n              <div class="item-name">${Y(e.name)}</div>\n              ${o ? `<div class="item-subtext">${Y(o)}</div>` : ""}\n              ${i ? `<div class="item-actions-row">\n                    <button class="item-secondary-action" type="button" data-avatar-outfit-update="${n}" ${h.saving ? "disabled" : ""}>Update</button>\n                    <button class="item-secondary-action danger" type="button" data-avatar-outfit-delete="${n}" ${h.saving ? "disabled" : ""}>Delete</button>\n                  </div>` : ""}\n            </article>\n          `;
}).join("")}\n      ${h.loadingInventory ? '<div class="grid-loading">Loading more...</div>' : ""}\n      <div id="inventory-sentinel" class="inventory-sentinel"></div>\n    </div>\n  ` : '\n      <div class="empty-state empty-state-illustrated">\n        <svg class="empty-file-icon" width="100%" viewBox="0 0 680 340" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n          <path d="M255 40 L375 40 L425 90 L425 250 Q425 258 417 258 L263 258 Q255 258 255 250 Z" fill="#252536" stroke="#3f3f5c" stroke-width="1.5"/>\n          <path d="M375 40 L425 90 L375 90 Z" fill="#1c1c2b" stroke="#3f3f5c" stroke-width="1.5"/>\n\n          <rect x="278" y="110" width="108" height="8" rx="3" fill="#3a3a56"/>\n          <rect x="278" y="127" width="86" height="8" rx="3" fill="#3a3a56"/>\n          <rect x="278" y="144" width="98" height="8" rx="3" fill="#2e2e48"/>\n          <rect x="278" y="161" width="60" height="8" rx="3" fill="#28283e" opacity="0.6"/>\n          <rect x="278" y="178" width="80" height="8" rx="3" fill="#24243a" opacity="0.3"/>\n\n          <text x="340" y="296" font-family="\'Helvetica Neue\', Arial, sans-serif" font-size="20" font-weight="700" fill="#e0ddf5" text-anchor="middle">File not found</text>\n          <text x="340" y="318" font-family="\'Helvetica Neue\', Arial, sans-serif" font-size="13" fill="#55527a" text-anchor="middle">You do not own any asset of this type.</text>\n        </svg>\n      </div>\n    ' : '\n      <div class="empty-state empty-state-illustrated">\n        <svg class="recent-empty-icon" width="100%" viewBox="0 0 680 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n          <defs>\n            <style>\n              .th { font-family: sans-serif; font-size: 14px; font-weight: 500; fill: #888; }\n            </style>\n          </defs>\n          <circle cx="340" cy="80" r="32" fill="none" stroke="#ccc" stroke-width="2.5"/>\n          <line x1="362" y1="103" x2="380" y2="121" stroke="#ccc" stroke-width="2.5" stroke-linecap="round"/>\n          <text x="340" y="148" text-anchor="middle" class="th">No recent items recorded.</text>\n        </svg>\n      </div>\n    ';
}

function bn() {
O();
const e = document.getElementById("app"), t = "3d" === h.previewMode && le?.domElement ? le.domElement : null, n = h.avatarPreviewUrl ? `${h.avatarPreviewUrl}${h.avatarPreviewUrl.includes("?") ? "&" : "?"}t=${h.previewBust}` : "", r = h.recentContextMenu ? Math.max(8, Math.min(Number(h.recentContextMenu.x || 0), window.innerWidth - 196)) : 0, a = h.recentContextMenu ? Math.max(8, Math.min(Number(h.recentContextMenu.y || 0), window.innerHeight - 236)) : 0, o = "3d" === h.previewMode ? "Switch to 2D" : "Switch to 3D", s = "3d" === h.previewMode ? "2D" : "3D";
if (e.innerHTML = `\n    <main class="main">\n      <section class="main-left">\n        <div class="main-left-top">\n          <button class="left-top-button icon-button" id="reload-all" type="button" title="Refresh" aria-label="Refresh">\n            <svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true">\n              <path d="M20 11a8 8 0 1 0-2.34 5.66" />\n              <path d="M20 4v7h-7" />\n            </svg>\n          </button>\n        </div>\n        <div class="avatar-preview">\n          ${"2d" === h.previewMode ? n ? `<img class="avatar-preview-image" src="${Y(n)}" alt="Avatar snapshot" />` : '<div class="avatar-preview-image avatar-preview-image-empty"></div>' : ""}\n          <canvas id="avatar-canvas-3d" class="${"3d" === h.previewMode ? "" : "preview-surface-hidden"}"></canvas>\n          <div id="preview-loading-overlay" class="preview-loading-overlay ${"3d" === h.previewMode && h.preview3DLoading ? "active" : ""}" aria-hidden="true">\n            <div class="preview-loading-dots">\n              <span class="preview-loading-dot"></span>\n              <span class="preview-loading-dot"></span>\n              <span class="preview-loading-dot"></span>\n            </div>\n          </div>\n          <div id="preview-rate-limited-overlay" class="preview-rate-limited-overlay ${"3d" === h.previewMode && h.previewRateLimited ? "active" : ""}" aria-live="polite">\n            <div class="preview-rate-limited-face">:(</div>\n            <div class="preview-rate-limited-title">Rate Limited</div>\n            <div class="preview-rate-limited-subtitle">Trying again in 10 seconds...</div>\n          </div>\n          <button class="preview-mode-toggle" id="preview-mode-toggle" type="button" title="${o}" aria-label="${o}">\n            ${s}\n          </button>\n        </div>\n        <div class="preview-meta">\n          <span>${Y(h.user?.name || "Avatar")}</span>\n          <div class="avatar-type-selector">\n            <button class="avatar-type-btn ${"R15" === h.avatarType ? "avatar-type-active" : ""}" data-avatar-type="R15">R15</button>\n            <button class="avatar-type-btn ${"R6" === h.avatarType ? "avatar-type-active" : ""}" data-avatar-type="R6">R6</button>\n          </div>\n        </div>\n      </section>\n\n      <section class="main-right">\n        ${fn()}\n        <div class="search-row">\n          <input id="inventory-search" class="inventory-search" type="text" placeholder="Search this category" value="${Y(h.searchTerm)}" autocomplete="off" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" />\n        </div>\n        <div class="container inventory-scroll-root">\n          ${gn()}\n        </div>\n      </section>\n    </main>\n    ${h.toastOpen ? `\n      <div class="error-popup ${h.toastClosing ? "closing" : ""}" role="alert">\n        <button class="error-popup-close" id="error-popup-close" aria-label="Close error">x</button>\n        <div class="error-popup-title">${Y(h.toastMessage)}</div>\n        ${h.toastDetails ? `<pre class="error-popup-details">${Y(h.toastDetails)}</pre>` : ""}\n      </div>\n    ` : ""}\n    ${h.recentContextMenu ? `\n      <button id="recent-context-menu-backdrop" class="recent-context-menu-backdrop" aria-label="Close menu"></button>\n      <div id="recent-context-menu" class="recent-context-menu" style="left:${r}px;top:${a}px;" role="menu" aria-label="Recent item actions">\n        <button class="recent-context-menu-item" data-recent-action="move-top" data-recent-key="${Y(h.recentContextMenu.key)}" role="menuitem">Move to Top</button>\n        <button class="recent-context-menu-item" data-recent-action="move-up" data-recent-key="${Y(h.recentContextMenu.key)}" role="menuitem">Move Up</button>\n        <button class="recent-context-menu-item" data-recent-action="move-down" data-recent-key="${Y(h.recentContextMenu.key)}" role="menuitem">Move Down</button>\n        <button class="recent-context-menu-item" data-recent-action="move-bottom" data-recent-key="${Y(h.recentContextMenu.key)}" role="menuitem">Move to Bottom</button>\n        <hr class="recent-context-menu-divider" />\n        <button class="recent-context-menu-item danger" data-recent-action="remove" data-recent-key="${Y(h.recentContextMenu.key)}" role="menuitem">Remove from Recents</button>\n      </div>\n    ` : ""}\n    ${h.actionDialog ? `\n      <button id="action-dialog-backdrop" class="action-dialog-backdrop" aria-label="Close dialog"></button>\n      <div id="action-dialog" class="action-dialog" role="dialog" aria-modal="true" aria-label="${Y(h.actionDialog.title || "Action")}">\n        <div class="action-dialog-title">${Y(h.actionDialog.title || "Action")}</div>\n        ${h.actionDialog.message ? `<p class="action-dialog-message">${Y(h.actionDialog.message)}</p>` : ""}\n        ${"prompt" === h.actionDialog.mode ? `<input id="action-dialog-input" class="action-dialog-input" type="text" value="${Y(h.actionDialog.defaultValue || "")}" placeholder="${Y(h.actionDialog.placeholder || "")}" maxlength="80" autocomplete="off" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" />` : ""}\n        <div class="action-dialog-actions">\n          <button id="action-dialog-cancel" class="action-dialog-button secondary" type="button">${Y(h.actionDialog.cancelText || "Cancel")}</button>\n          <button id="action-dialog-confirm" class="action-dialog-button primary" type="button">${Y(h.actionDialog.confirmText || "Confirm")}</button>\n        </div>\n      </div>\n    ` : ""}\n  `, 
"3d" === h.previewMode && t) {
const e = document.getElementById("avatar-canvas-3d");
if (e && e !== t) {
t.id = "avatar-canvas-3d", t.className = e.className, e.replaceWith(t);
const n = t.parentElement, r = Math.max(n?.clientWidth || 420, 1), a = Math.max(n?.clientHeight || 420, 1);
t.width = r, t.height = a, le && le.setSize(r, a, !1), ce && (ce.aspect = r / a, 
ce.updateProjectionMatrix());
}
}
e.querySelectorAll("input").forEach(e => {
e.hasAttribute("name") || e.setAttribute("name", ""), e.setAttribute("autocomplete", "off"), 
e.setAttribute("data-lpignore", "true"), e.setAttribute("data-1p-ignore", "true"), 
e.setAttribute("data-bwignore", "true");
});
document.querySelectorAll("[data-category]").forEach(e => {
e.addEventListener("click", async () => {
const t = e.dataset.category;
t && t !== h.activeCategory && (h.activeCategory = t, h.recentContextMenu = null, 
ae(), Yt(), bn(), await Xt(!0));
});
}), document.querySelectorAll("[data-subcategory]").forEach(e => {
e.addEventListener("click", async () => {
const t = e.dataset.subcategory;
t && t !== h.activeSubcategory && (h.activeSubcategory = t, h.recentContextMenu = null, 
h.searchTerm = "", Yt(), bn(), await Xt(!0));
});
});
const i = document.getElementById("inventory-search");
i && i.addEventListener("input", () => {
const e = xt(), t = Number.isFinite(i.selectionStart) ? i.selectionStart : (i.value || "").length, n = Number.isFinite(i.selectionEnd) ? i.selectionEnd : t;
h.searchTerm = i.value || "", St(e);
const r = document.getElementById("inventory-search");
if (r) {
r.focus({
preventScroll: !0
});
const e = Math.max(0, Math.min(t, r.value.length)), a = Math.max(e, Math.min(n, r.value.length));
r.setSelectionRange(e, a);
}
}), document.querySelectorAll("[data-asset-id]").forEach(e => {
e.addEventListener("click", () => {
const t = Number(e.dataset.assetId);
Number.isNaN(t) || an(t);
});
}), document.querySelectorAll("[data-outfit-id]").forEach(e => {
e.addEventListener("click", () => {
const t = Number(e.dataset.outfitId);
Number.isNaN(t) || on(t);
});
}), document.querySelectorAll("[data-avatar-outfit-update]").forEach(e => {
e.addEventListener("click", t => {
t.preventDefault(), t.stopPropagation();
const n = Number(e.dataset.avatarOutfitUpdate);
Number.isNaN(n) || un(n);
});
}), document.querySelectorAll("[data-avatar-outfit-delete]").forEach(e => {
e.addEventListener("click", t => {
t.preventDefault(), t.stopPropagation();
const n = Number(e.dataset.avatarOutfitDelete);
Number.isNaN(n) || mn(n);
});
}), document.querySelectorAll("[data-recent-key]").forEach(e => {
e.addEventListener("contextmenu", t => {
t.preventDefault();
const n = e.dataset.recentKey;
n && "Recent" === h.activeCategory && (h.recentContextMenu = {
key: n,
x: t.clientX,
y: t.clientY
}, St(xt()));
});
}), document.querySelectorAll(".body-scale-slider").forEach(e => {
e.addEventListener("input", () => {
const t = (e.id || "").replace("scale-", ""), n = document.getElementById(`scale-value-${t}`), r = document.getElementById(`scale-number-${t}`);
if (n) {
const t = Number(e.value);
n.textContent = Number.isFinite(t) ? t.toFixed(2) : "0.00", r && (r.value = Number.isFinite(t) ? t.toFixed(2) : "0.00");
}
});
}), document.querySelectorAll(".body-scale-number").forEach(e => {
e.addEventListener("input", () => {
const t = (e.id || "").replace("scale-number-", ""), n = document.getElementById(`scale-value-${t}`), r = document.getElementById(`scale-${t}`), a = Ht(e.value, qt(t));
r && (r.value = a.toFixed(2)), n && (n.textContent = a.toFixed(2));
});
}), document.querySelectorAll("[data-scale-revert]").forEach(e => {
e.addEventListener("click", () => {
const t = e.dataset.scaleRevert;
if (!t) return;
const n = _t(t), r = document.getElementById(`scale-${t}`), a = document.getElementById(`scale-number-${t}`), o = document.getElementById(`scale-value-${t}`);
r && (r.value = n.toFixed(2)), a && (a.value = n.toFixed(2)), o && (o.textContent = n.toFixed(2));
});
});
const c = document.getElementById("save-body-scale");
c && c.addEventListener("click", () => {
Jt();
}), document.querySelectorAll("[data-skin-tone]").forEach(e => {
e.addEventListener("click", () => {
const t = e.dataset.skinTone;
t && Gt(t);
});
});
const l = document.getElementById("custom-skin-tone-hex"), d = document.getElementById("custom-skin-tone-picker"), u = document.getElementById("apply-custom-skin-tone");
l && d && (l.addEventListener("input", () => {
const e = l.value || "", t = `#${String(e).replace(/[^0-9a-fA-F]/g, "").replace(/^#+/, "").slice(0, 6)}`;
l.value = t, /^#[0-9a-fA-F]{6}$/.test(t) && (d.value = X(t));
}), d.addEventListener("input", () => {
l.value = `#${zt(d.value || "")}`;
}));
const m = () => {
const e = l?.value || d?.value || "";
e && (Z(e), Gt(e));
};
u && u.addEventListener("click", () => {
m();
}), l && l.addEventListener("keydown", e => {
"Enter" === e.key && (e.preventDefault(), m());
});
const y = document.getElementById("reload-all");
y && y.addEventListener("click", () => {
nn();
});
const p = document.getElementById("recent-context-menu-backdrop");
p && p.addEventListener("click", () => {
h.recentContextMenu = null, St(xt());
}), document.querySelectorAll("[data-recent-action]").forEach(e => {
e.addEventListener("click", async () => {
const t = e.dataset.recentAction, n = e.dataset.recentKey;
t && n && await D(t, n);
});
});
const f = document.getElementById("create-avatar-outfit");
f && f.addEventListener("click", () => {
yn();
});
const v = document.getElementById("preview-mode-toggle");
v && v.addEventListener("click", () => {
ht("3d" === h.previewMode ? "2d" : "3d");
}), document.querySelectorAll("[data-avatar-type]").forEach(e => {
e.addEventListener("click", () => {
const t = e.dataset.avatarType;
t && t !== h.avatarType && rn(t);
});
});
const g = document.getElementById("error-popup-close");
g && g.addEventListener("click", () => {
At(), bn();
});
const b = document.getElementById("action-dialog-backdrop"), w = document.getElementById("action-dialog-cancel"), A = document.getElementById("action-dialog-confirm"), C = document.getElementById("action-dialog-input"), T = e => {
Ct({
confirmed: e,
value: C ? String(C.value || "") : ""
}), St(xt());
};
b && b.addEventListener("click", () => {
T(!1);
}), w && w.addEventListener("click", () => {
T(!1);
}), A && A.addEventListener("click", () => {
T(!0);
}), C && (C.focus({
preventScroll: !0
}), C.setSelectionRange(C.value.length, C.value.length), C.addEventListener("keydown", e => {
"Enter" === e.key && (e.preventDefault(), T(!0)), "Escape" === e.key && (e.preventDefault(), 
T(!1));
})), wn(), lt(h.preview3DLoading), dt(h.previewRateLimited), !h.user || h.loadingProfile || "3d" !== h.previewMode || le || ct();
}

function wn() {
v && (v.disconnect(), v = null);
const e = document.getElementById("inventory-sentinel"), t = document.querySelector(".inventory-scroll-root");
e && t && (v = new IntersectionObserver(e => {
const t = e[0];
t && t.isIntersecting && Xt(!1);
}, {
root: t,
threshold: .2
}), v.observe(e));
}

se(), window.addEventListener("message", e => {
const t = e.data;
if (t) {
if ("PURPURA_FETCH_RESOURCE_RESPONSE" === t.type) {
const e = ke.get(t.requestId);
if (!e) return;
return ke.delete(t.requestId), void e.resolve({
ok: Boolean(t.ok),
status: Number(t.status) || 0,
contentType: t.contentType || "",
csrfToken: t.csrfToken || "",
boundAuthToken: t.boundAuthToken || "",
text: t.text || ""
});
}
"PURPURA_THEME" === t.type && (b = "light" === t.theme ? "light" : "dark", se()), 
"PURPURA_THREE_URLS" === t.type && (he = t.threeUrl, ve = t.gltfLoaderUrl, ge = t.mtlLoaderUrl, 
be = t.orbitControlsUrl, we = t.objLoaderUrl, fe = !0), "PURPURA_AUTH_HEADERS" === t.type && ("string" == typeof t.csrfToken && t.csrfToken && (h.csrfToken = t.csrfToken), 
"string" == typeof t.boundAuthToken && t.boundAuthToken && (h.boundAuthToken = t.boundAuthToken));
}
}), bn(), nn();
})();