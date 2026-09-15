/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
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
}, t = Object.keys(e), r = new Set([ "Shirt", "Pants", "TShirt", "TShirtAccessory", "ShirtAccessory", "PantsAccessory", "JacketAccessory", "SweaterAccessory", "ShortsAccessory", "DressSkirtAccessory", "LeftShoeAccessory", "RightShoeAccessory", "Head", "Face", "Torso", "LeftArm", "RightArm", "LeftLeg", "RightLeg", "ClimbAnimation", "FallAnimation", "IdleAnimation", "JumpAnimation", "RunAnimation", "SwimAnimation", "WalkAnimation", "MoodAnimation" ]), n = 20, a = 100, o = "purpura_custom_skin_tones_v1", s = "purpura_custom_skin_tone_names_v1", i = {
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
}, g = null, v = null, b = "", w = 0, A = null, C = null, T = null;
const x = new Set;
let S = !1;
function E() {
try {
const e = localStorage.getItem("purpura_recently_equipped"), t = e ? JSON.parse(e) : {}, r = {};
Object.entries(t || {}).forEach(([e, t]) => {
const n = I(e), a = Number(t);
if (!n || !Number.isFinite(a) || a <= 0) return;
const o = N(n.entityType, n.id);
o && (!r[o] || a > r[o]) && (r[o] = a);
}), h.recentlyEquippedTimestamps = r;
const n = localStorage.getItem("purpura_recent_item_meta_v2"), a = n ? JSON.parse(n) : {};
h.recentItemMetadata = a && "object" == typeof a ? a : {}, L();
} catch (e) {
h.recentlyEquippedTimestamps = {}, h.recentItemMetadata = {};
}
}
function k() {
try {
localStorage.setItem("purpura_recently_equipped", JSON.stringify(h.recentlyEquippedTimestamps)), 
localStorage.setItem("purpura_recent_item_meta_v2", JSON.stringify(h.recentItemMetadata));
} catch (e) {}
}
function N(e, t) {
const r = String(e || "").toLowerCase(), n = Number(t);
return "asset" !== r && "outfit" !== r || !Number.isFinite(n) || n <= 0 ? "" : `${r}:${n}`;
}
function I(e) {
const t = String(e || "").trim();
if (!t) return null;
const r = t.match(/^(asset|outfit):(\d+)$/i);
if (r) {
const e = String(r[1] || "").toLowerCase(), t = Number(r[2] || 0);
if (Number.isFinite(t) && t > 0) return {
entityType: e,
id: t
};
}
const n = Number(t);
return Number.isFinite(n) && n > 0 ? {
entityType: "asset",
id: n
} : null;
}
function $(e = 20) {
return Object.entries(h.recentlyEquippedTimestamps).map(([e, t]) => {
const r = I(e), n = Number(t);
if (!r || !Number.isFinite(n) || n <= 0) return null;
const a = N(r.entityType, r.id);
return a ? {
key: a,
id: r.id,
entityType: r.entityType,
timestamp: n,
meta: h.recentItemMetadata[a] || {}
} : null;
}).filter(Boolean).sort((e, t) => Number(t.timestamp) - Number(e.timestamp)).slice(0, e);
}
function L() {
const e = $(n), t = {}, r = {};
e.forEach(e => {
t[e.key] = e.timestamp, e.meta && "object" == typeof e.meta && (r[e.key] = e.meta);
}), h.recentlyEquippedTimestamps = t, h.recentItemMetadata = r;
}
function M(e, t, r = null) {
const n = N(e, t);
n && (h.recentlyEquippedTimestamps[n] = Date.now(), r && "object" == typeof r && (h.recentItemMetadata[n] = {
name: String(r.name || ""),
type: String(r.type || ""),
thumbnailUrl: String(r.thumbnailUrl || "")
}), L(), k());
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
function B(e) {
const t = Date.now(), r = {}, n = {};
e.forEach((e, a) => {
r[e] = t - a, h.recentItemMetadata[e] && (n[e] = h.recentItemMetadata[e]);
}), h.recentlyEquippedTimestamps = r, h.recentItemMetadata = n, k();
}
function U(e) {
const t = $(n).map(e => e.key), r = t.filter(t => t !== e);
return r.length !== t.length && (B(r), !0);
}
function P(e, t) {
const r = $(n).map(e => e.key), a = r.indexOf(e);
if (a < 0) return !1;
let o = a;
if ("up" === t ? o = Math.max(0, a - 1) : "down" === t ? o = Math.min(r.length - 1, a + 1) : "top" === t ? o = 0 : "bottom" === t && (o = r.length - 1), 
o === a) return !1;
const [s] = r.splice(a, 1);
return r.splice(o, 0, s), B(r), !0;
}
async function D(e, t) {
let r = !1;
"remove" === e ? r = U(t) : "move-up" === e ? r = P(t, "up") : "move-down" === e ? r = P(t, "down") : "move-top" === e ? r = P(t, "top") : "move-bottom" === e && (r = P(t, "bottom"));
const n = Nt();
h.recentContextMenu = null, r && "Recent" === h.activeCategory && await zt(), It(n);
}
function O() {
if ("Recent" !== h.activeCategory) return;
const e = h.inventoryItems.filter(e => {
const t = /^Asset\s+\d+$/i.test(String(e?.name || "")), r = "Asset" === String(e?.type || "Asset");
return t && r && e?.recentKey;
}).map(e => e.recentKey).filter(Boolean);
if (!e.length) return;
let t = !1;
e.forEach(e => {
e in h.recentlyEquippedTimestamps && (delete h.recentlyEquippedTimestamps[e], delete h.recentItemMetadata[e], 
t = !0);
}), t && (L(), k());
}
function _(e = 20) {
return $(e).filter(e => "asset" === e.entityType).map(e => e.id);
}
function H() {
try {
const e = localStorage.getItem("purpura_preview_mode");
"2d" !== e && "3d" !== e || (h.previewMode = e);
} catch (e) {}
}
function j() {
try {
localStorage.setItem("purpura_preview_mode", h.previewMode);
} catch (e) {}
}
function q() {
try {
const e = localStorage.getItem(o), t = e ? JSON.parse(e) : [];
Array.isArray(t) ? h.customSkinTones = [ ...new Set(t.map(e => Vt(e))) ].slice(0, 64) : h.customSkinTones = [];
} catch (e) {
h.customSkinTones = [];
}
try {
const e = localStorage.getItem(s), t = e ? JSON.parse(e) : {};
if (t && "object" == typeof t) {
const e = {};
Object.entries(t).forEach(([t, r]) => {
const n = Vt(t), a = String(r || "").trim();
n && (e[n] = a || `#${n}`);
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
const t = Vt(e);
try {
const e = await Fe(`https://www.thecolorapi.com/id?hex=${encodeURIComponent(t)}`, {
method: "GET",
accept: "application/json, text/plain;q=0.9, */*;q=0.8",
usePageFetch: !1
}), r = Number(e?.status || 0), n = String(e?.text || "").trim();
if ((e?.ok || 200 === r) && n.startsWith("{")) {
const e = JSON.parse(n), t = String(e?.name?.value || "").trim();
if (t) return t;
}
} catch (e) {}
const r = u.indexOf(t);
return r >= 0 && m[r] ? m[r] : `#${t}`;
}
function G(e) {
const t = Vt(e);
return u.includes(t);
}
function V(e) {
const t = Vt(e);
if (!t || G(t) || x.has(t)) return;
const r = String(h.customSkinToneNames[t] || "").trim().toUpperCase();
r && r !== t && r !== `#${t}` || (x.add(t), Q());
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
h.customSkinToneNames[t] = e, W(), re() && It(Nt());
} catch (e) {
h.customSkinToneNames[t] || (h.customSkinToneNames[t] = `#${t}`, W());
} finally {
S = !1, x.size > 0 && Q();
}
} else x.delete(e.value);
}
function Z(e) {
const t = Vt(e);
if (G(t)) return t;
const r = [ ...new Set(h.customSkinTones.map(e => Vt(e)).filter(e => Boolean(e) && !G(e))) ], n = !r.includes(t), a = n ? [ t, ...r ].slice(0, 64) : r;
return JSON.stringify(a) !== JSON.stringify(h.customSkinTones) && (h.customSkinTones = a, 
z()), V(t), t;
}
function Y(e) {
return String(e).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
function X(e) {
return `#${Vt(e)}`;
}
function ee() {
if ("Body" === h.activeCategory && ("Scale" === h.activeSubcategory || "Skin Tone" === h.activeSubcategory || "Skin Color" === h.activeSubcategory)) return [];
const t = e[h.activeCategory] || {};
return t[h.activeSubcategory] || t.All || [];
}
function te() {
return "Body" === h.activeCategory && "Scale" === h.activeSubcategory;
}
function re() {
return "Body" === h.activeCategory && ("Skin Tone" === h.activeSubcategory || "Skin Color" === h.activeSubcategory);
}
function ne() {
let e = [ ...h.inventoryItems ];
const t = h.searchTerm.trim().toLowerCase();
return t && (e = e.filter(e => String(e.name || "").toLowerCase().includes(t))), 
"Recent" === h.activeCategory && e.sort((e, t) => {
const r = e.recentKey || N("asset", e.id), n = t.recentKey || N("asset", t.id), a = Number(h.recentlyEquippedTimestamps[r] || 0);
return Number(h.recentlyEquippedTimestamps[n] || 0) - a;
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
let ie = null, ce = null, le = null, de = null, ue = null, me = null, ye = null, pe = null, fe = !1, he = "", ge = "", ve = "", be = "", we = "", Ae = 0, Ce = "", Te = 0, xe = null;
const Se = new Map, Ee = new Map;
let ke = "", Ne = null;
async function Ie() {
let e = 0;
for (;!fe && e < 100; ) await new Promise(e => setTimeout(e, 50)), e++;
if (!fe) throw new Error("Three.js URLs not received from extension after 5 seconds");
}
function $e(e, t) {
if (!t || "object" != typeof t) return "";
const r = t.obj || t.objUrl || t.modelUrl || "";
if (!r || "string" != typeof r) return "";
if (/^https?:\/\//i.test(r)) return r;
try {
return `${new URL(e).origin}/${r}`;
} catch (e) {
return r;
}
}
function Le(e, t) {
const r = [], n = t?.obj || t?.objUrl || t?.modelUrl || "";
if (!n || "string" != typeof n) return r;
try {
const t = new URL(e), a = t.search || "", o = n.replace(/^\/+/, "");
if (/^https?:\/\//i.test(n)) r.push(n), a && !n.includes("?") && r.push(`${n}${a}`); else {
r.push(`${t.origin}/${o}${a}`), r.push(`${t.origin}/${o}`);
for (let e = 0; e <= 7; e += 1) {
const t = `https://t${e}.rbxcdn.com`;
r.push(`${t}/${o}${a}`), r.push(`${t}/${o}`);
}
}
} catch (e) {
r.push(n);
}
return [ ...new Set(r.filter(Boolean)) ];
}
function Me(e) {
const t = (e || "").trim();
return t.startsWith("<?xml") || t.startsWith("<Error>") && t.includes("AccessDenied");
}
function Re(e, t = "GET") {
const r = String(t || "GET").trim().toUpperCase() || "GET", n = String(e || r).trim().toUpperCase();
return new Set([ "GET", "POST", "PUT", "PATCH", "DELETE", "HEAD" ]).has(n) ? n : r;
}
function Fe(e, t = {}) {
return new Promise((r, n) => {
const a = `${Date.now()}-${Math.random().toString(16).slice(2)}`, o = Re(t.method, "GET"), s = "string" == typeof t.body ? t.body : "", i = "string" == typeof t.csrfToken ? t.csrfToken : h.csrfToken || "", c = "string" == typeof t.boundAuthToken ? t.boundAuthToken : h.boundAuthToken || "", l = window.setTimeout(() => {
Ee.delete(a), n(new Error(`Timed out fetching resource: ${e}`));
}, 15e3);
Ee.set(a, {
resolve: e => {
window.clearTimeout(l), r(e);
},
reject: e => {
window.clearTimeout(l), n(e);
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
async function Be(e) {
try {
const t = await Fe(e);
if (t && t.ok && t.text && !Me(t.text)) return t.text;
} catch (e) {}
return "";
}
async function Ue(e, t = "") {
if (!e || "string" != typeof e) return "";
const r = e.trim();
if (/^https?:\/\//i.test(r)) return r;
const n = r.replace(/^\/+/, ""), a = [ `https://assetdelivery.roblox.com/v2/asset/?hash=${encodeURIComponent(n)}`, `https://assetdelivery.roblox.com/v1/asset/?hash=${encodeURIComponent(n)}` ];
for (const t of a) try {
const e = await Fe(t, {
accept: "application/json, text/plain;q=0.9, */*;q=0.8"
});
if (!e || !e.ok) continue;
const r = (e.text || "").trim();
if (!r) continue;
if (r.startsWith("{")) {
const e = JSON.parse(r), t = e?.location || e?.url || e?.assetUrl || e?.locations?.[0]?.location || e?.locations?.[0]?.url || "";
if (t && "string" == typeof t) return t;
}
if (/^https?:\/\//i.test(r)) return r.split("\n")[0].trim();
if (r.includes("\nv ") || r.startsWith("v ")) return Se.set(t, r), t;
} catch (e) {}
try {
if (t) {
return `${new URL(t).origin}/${n}`;
}
} catch (e) {}
return `https://t2.rbxcdn.com/${n}`;
}
async function Pe(e) {
if (!e) return "";
const t = e.split("?")[0].toLowerCase();
if (t.endsWith(".obj") || t.endsWith(".gltf") || t.endsWith(".glb")) return e;
try {
const t = await Fe(e), r = t?.text || "";
if (r.trim().startsWith("{")) {
const t = JSON.parse(r), n = Le(e, t);
for (const t of n) try {
const e = await Be(t);
if (!e || e.trim().startsWith("{") || Me(e)) continue;
return Se.set(t, e), t;
} catch (e) {}
const a = $e(e, t);
if (a) return a;
}
} catch (e) {}
return e;
}
async function De() {
if (window.THREE) return window.THREE;
if (window.__purpuraAeditorThreePromise) return window.__purpuraAeditorThreePromise;
if (Ne) return Ne;
await Ie();
if (window.THREE) return window.THREE;
if (window.__purpuraAeditorThreePromise) return window.__purpuraAeditorThreePromise;
Ne = new Promise((e, t) => {
let r = !1;
const n = () => {
if (!window.THREE) return !1;
e(window.THREE);
return !0;
}, a = () => {
if (r) return;
r = !0;
if (n()) return;
const e = document.getElementById("purpura-aeditor-three-core") || document.querySelector(`script[src="${he}"]`) || document.querySelector('script[src*="three.min.js"]');
if (e) {
e.addEventListener("load", () => {
n() || (window.__purpuraAeditorThreePromise = null, Ne = null, t(new Error("Detected existing Three script but no THREE global after load")));
}, {
once: !0
});
return;
}
const a = document.createElement("script");
a.id = "purpura-aeditor-three-core", a.src = he, a.addEventListener("load", () => {
a.dataset.loaded = "1", window.__purpuraAeditorThreePromise = Promise.resolve(window.THREE), 
n() || t(new Error("Three.js loaded but global was not available"));
}, {
once: !0
}), a.addEventListener("error", () => {
window.__purpuraAeditorThreePromise = null, Ne = null, t(new Error("Failed to load Three.js from " + he));
}, {
once: !0
}), document.head.appendChild(a);
};
if (n()) return;
const o = document.getElementById("purpura-aeditor-three-core") || document.querySelector(`script[src="${he}"]`) || document.querySelector('script[src*="three.min.js"]');
if (o) {
o.addEventListener("load", () => {
n() || a();
}, {
once: !0
}), setTimeout(() => {
n() || a();
}, 5e3);
return;
}
a();
});
window.__purpuraAeditorThreePromise = Ne;
return Ne;
}
async function Oe() {
const e = await De();
return e.GLTFLoader ? e.GLTFLoader : new Promise((t, r) => {
const n = document.createElement("script");
n.src = ge, n.onload = () => {
e.GLTFLoader ? t(e.GLTFLoader) : r(new Error("GLTFLoader script loaded but class not attached to THREE"));
}, n.onerror = e => {
r(new Error("Failed to load GLTFLoader from " + ge));
}, document.head.appendChild(n);
});
}
async function _e() {
const e = await De();
return e.OrbitControls ? e.OrbitControls : new Promise((t, r) => {
const n = document.createElement("script");
n.src = be, n.onload = () => {
e.OrbitControls ? t(e.OrbitControls) : r(new Error("OrbitControls script loaded but class not attached to THREE"));
}, n.onerror = e => {
r(new Error("Failed to load OrbitControls from " + be));
}, document.head.appendChild(n);
});
}
async function He() {
const e = await De();
return e.OBJLoader ? e.OBJLoader : new Promise((t, r) => {
const n = document.createElement("script");
n.src = we, n.onload = () => {
e.OBJLoader ? t(e.OBJLoader) : r(new Error("OBJLoader script loaded but class not attached to THREE"));
}, n.onerror = e => {
r(new Error("Failed to load OBJLoader from " + we));
}, document.head.appendChild(n);
});
}
async function je() {
const e = await De();
return e.MTLLoader ? e.MTLLoader : new Promise((t, r) => {
const n = document.createElement("script");
n.src = ve, n.onload = () => {
e.MTLLoader ? t(e.MTLLoader) : r(new Error("MTLLoader script loaded but class not attached to THREE"));
}, n.onerror = e => {
r(new Error("Failed to load MTLLoader from " + ve));
}, document.head.appendChild(n);
});
}
function qe(e = 429) {
const t = new Error(`Avatar-3D preview rate limited (${e})`);
return t.code = "PURPURA_AVATAR3D_RATE_LIMITED", t.status = e, t;
}
async function ze(e) {
const t = async e => {
for (let t = 0; t < 12; t += 1) {
try {
const t = await Fe(e, {
accept: "application/json, text/plain;q=0.9, */*;q=0.8"
});
if (!t?.ok) {
if (429 === Number(t?.status)) throw qe(t.status);
await new Promise(e => setTimeout(e, 1e3));
continue;
}
const r = t.text || "";
if (!r.trim().startsWith("{")) {
await new Promise(e => setTimeout(e, 1e3));
continue;
}
const n = JSON.parse(r), a = Array.isArray(n?.data) ? n.data[0] : n, o = String(a?.state || "").toLowerCase(), s = a?.imageUrl || "";
if ("blocked" === o || "error" === o || "failed" === o) throw qe(429);
if ("completed" === o && s) {
const t = await Fe(s, {
accept: "application/json, text/plain;q=0.9, */*;q=0.8"
});
if (!t?.ok && 429 === Number(t?.status)) throw qe(t.status);
const r = t?.text || "";
if (t?.ok && r.trim().startsWith("{")) {
const t = JSON.parse(r);
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
const r = [ `https://thumbnails.roblox.com/v1/users/avatar-3d?userId=${encodeURIComponent(e)}`, `https://thumbnails.roblox.com/v1/users/avatar-3d?userIds=${encodeURIComponent(e)}` ];
for (const e of r) {
const r = await t(e);
if (r) return r;
}
} catch (e) {
if ("PURPURA_AVATAR3D_RATE_LIMITED" === e?.code) throw e;
}
return null;
}
function We(e) {
const t = [], r = e?.itemLabel ? `${String(e.itemLabel)} - ` : "", n = (e, n) => {
n && t.push({
n: `${r}${String(e)}`,
u: String(n)
});
};
n("avatar-3d endpoint", e?.sourceEndpoint), n("avatar-3d metadata", e?.metadataUrl), 
n("avatar model (obj)", e?.objUrl), n("avatar materials (mtl)", e?.mtlUrl), Array.isArray(e?.textureUrls) && e.textureUrls.forEach((e, t) => {
n(`avatar texture ${t + 1}`, e);
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
if (s !== ke) {
ke = s;
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
function Je(e) {
const t = String(e || "").trim().replace(/^\/+/, "");
if (!t) return "";
let r = 31;
const n = Math.min(38, t.length);
for (let e = 0; e < n; e += 1) r ^= t.charCodeAt(e);
return `https://t${Math.abs(r % 8)}.rbxcdn.com/${t}`;
}
function Ge(e) {
if (!e) return "";
try {
const t = new URL(e, "https://t0.rbxcdn.com/");
return (t.pathname.split("/").pop() || "").split("?")[0].trim();
} catch (t) {
const r = String(e);
return (r.split("/").pop()?.split("?")[0] || "").trim();
}
}
function Ve(e) {
if ("string" == typeof e) {
const t = e.trim();
if (/^#[0-9a-fA-F]{6}$/.test(t)) return t.slice(1).toLowerCase();
if (/^[0-9a-fA-F]{6}$/.test(t)) return t.toLowerCase();
}
if (e && "object" == typeof e) {
const t = e.r ?? e.R ?? e.red, r = e.g ?? e.G ?? e.green, n = e.b ?? e.B ?? e.blue;
if (Number.isFinite(t) && Number.isFinite(r) && Number.isFinite(n)) {
const e = e => e <= 1 ? Math.max(0, Math.min(255, Math.round(255 * e))) : Math.max(0, Math.min(255, Math.round(e)));
return `${e(t).toString(16).padStart(2, "0")}${e(r).toString(16).padStart(2, "0")}${e(n).toString(16).padStart(2, "0")}`;
}
}
return "";
}
function Ke(e) {
const t = Number(e);
return !Number.isFinite(t) || t <= 0 ? "" : c.get(t) || "";
}
function Qe(e, t) {
const r = Number(e);
if (!Number.isFinite(r) || r <= 0) return;
const n = Ve(t);
n && c.set(r, n);
}
function Ze() {
Object.entries(l).forEach(([e, t]) => {
c.has(Number(e)) || Qe(e, t);
});
}
function Ye(e) {
return e ? Array.isArray(e) ? e : Array.isArray(e.palette) ? e.palette : Array.isArray(e.colors) ? e.colors : Array.isArray(e.bodyColorsPalette) ? e.bodyColorsPalette : [] : [];
}
function Xe(e) {
let t = 0;
return [ e?.bodyColorsPalette, e?.bodyColorPalette, e?.avatarBodyColorPalette, e?.bodyColorRules, e?.bodyColors, e?.appearance?.bodyColorsPalette ].forEach(e => {
Ye(e).forEach(e => {
const r = Number(e?.brickColorId ?? e?.colorId ?? e?.id ?? e?.brickColor?.brickColorId ?? e?.brickColor?.id ?? 0);
if (!Number.isFinite(r) || r <= 0) return;
const n = Ve(e?.hexColor) || Ve(e?.colorHex) || Ve(e?.hex) || Ve(e?.color) || Ve(e?.displayColor) || Ve(e?.color3) || Ve(e?.rgb) || Ve(e?.brickColor?.hexColor) || Ve(e?.brickColor?.color) || "";
if (!n) return;
const a = c.has(r);
c.set(r, n), a || (t += 1);
});
}), t;
}
async function et() {
try {
Ze();
Xe(await Ut("https://avatar.roblox.com/v1/avatar-rules"));
} catch (e) {
Ze();
}
}
function tt(e, t = "ffffff") {
if ("number" == typeof e) {
const t = Ke(e);
if (t) return t;
}
if ("string" == typeof e) {
const t = Number(e);
if (Number.isFinite(t) && t > 0) {
const e = Ke(t);
if (e) return e;
}
}
const r = Ve(e);
return r || t;
}
function rt(e) {
const t = {
head: 1,
height: 1,
bodyType: 0,
width: 1,
depth: 1,
proportion: 0,
...e?.scales || {}
}, r = e?.bodyColor3s || {}, n = e?.bodyColors || {}, a = tt(r.torsoColor3 ?? r.torsoColor ?? n.torsoColor ?? n.torsoColorId, "f2d5c7"), o = {
headColor: tt(r.headColor3 ?? r.headColor ?? n.headColor ?? n.headColorId, a),
rightArmColor: tt(r.rightArmColor3 ?? r.rightArmColor ?? n.rightArmColor ?? n.rightArmColorId, a),
leftLegColor: tt(r.leftLegColor3 ?? r.leftLegColor ?? n.leftLegColor ?? n.leftLegColorId, a),
leftArmColor: tt(r.leftArmColor3 ?? r.leftArmColor ?? n.leftArmColor ?? n.leftArmColorId, a),
rightLegColor: tt(r.rightLegColor3 ?? r.rightLegColor ?? n.rightLegColor ?? n.rightLegColorId, a),
torsoColor: a
}, s = Array.isArray(e?.assets) ? e.assets.map(e => {
const t = Number(e?.id);
if (!t) return null;
const r = {
id: t
};
"string" == typeof e?.name && e.name.trim() && (r.name = e.name.trim());
const n = Number(e?.currentVersionId || e?.versionId || 0);
Number.isFinite(n) && n > 0 && (r.currentVersionId = n);
const a = Number(e?.assetType?.id ?? e?.assetTypeId ?? e?.assetType ?? 0), o = Lt(e?.assetType?.name ?? e?.assetTypeName ?? a);
return (Number.isFinite(a) && a > 0 || o && "Asset" !== o) && (r.assetType = {}, 
Number.isFinite(a) && a > 0 && (r.assetType.id = a), o && (r.assetType.name = o)), 
e?.meta && "object" == typeof e.meta && (r.meta = e.meta), r;
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
function at(e) {
return `${String(e?.playerAvatarType || "R15")}|${Array.isArray(e?.assets) ? e.assets.map(e => Number(e?.id) || 0).filter(Boolean).sort((e, t) => e - t).join(",") : ""}|${nt(e?.bodyColor3s || e?.bodyColors || {})}|${nt(e?.scales || {})}`;
}
function ot(e) {
if (!e || "object" != typeof e || Array.isArray(e)) return null;
try {
return JSON.parse(JSON.stringify(e));
} catch (e) {
return null;
}
}
function st(e) {
const t = {};
return (Array.isArray(e) ? e : []).forEach(e => {
const r = Number(e?.id || e?.assetId || 0);
if (!Number.isFinite(r) || r <= 0) return;
const n = ot(e?.meta);
n && (t[r] = n);
}), t;
}
function it(e, t = null, r = !0) {
const n = Number(e);
if (!Number.isFinite(n) || n <= 0) return null;
const a = {
id: n
}, o = ot(t && "object" == typeof t ? t : r ? h.wornAssetMetaById?.[n] : null);
return o && (a.meta = o), a;
}
function ct(e) {
Ce = at(e || {});
const t = Array.isArray(e?.assets) ? e.assets.map(e => e.id).filter(Boolean) : [], r = {};
Array.isArray(e?.assets) && e.assets.forEach(e => {
e?.id && (r[e.id] = Lt(e.assetType ?? e.assetTypeId ?? e?.assetType?.id));
}), h.avatarType = e?.playerAvatarType || "R15", h.currentOutfitId = Number(e?.currentOutfitId || e?.outfitId || e?.id || 0) || 0;
const a = e?.scales || {};
if (h.previousScaleSnapshot = d.reduce((e, t) => (e[t] = Wt(a[t], y[t]), e), {}), 
h.avatarDefinition = rt(e || {}), h.wornAssetIds = t, h.wornAssetTypeById = r, h.wornAssetMetaById = st(h.avatarDefinition?.assets), 
h.preferredSkinTone || (h.preferredSkinTone = Vt(h.avatarDefinition?.bodyColors?.headColor || "F2D5C7")), 
0 === Object.keys(h.recentlyEquippedTimestamps).length && t.length > 0) {
const e = Date.now();
t.slice(0, n).forEach((t, r) => {
const n = N("asset", t);
n && (h.recentlyEquippedTimestamps[n] = e - r);
}), L(), k();
}
}
function lt(e, t = 16777215) {
const r = String(e || "").replace(/^#/, "");
return /^[0-9a-fA-F]{6}$/.test(r) ? Number.parseInt(r, 16) : t;
}
function dt(e, t, r) {
if (!e || !t || "function" != typeof t.traverse) return;
const n = String(r?.bodyColors?.headColor || "").replace(/^#/, ""), a = lt(n, 14926498), o = lt(String(r?.bodyColors?.leftArmColor || r?.bodyColors?.rightArmColor || r?.bodyColors?.torsoColor || r?.bodyColors?.headColor || "").replace(/^#/, ""), a), s = (new e.Box3).setFromObject(t), i = s.getCenter(new e.Vector3), c = s.getSize(new e.Vector3), l = Math.max(c.y, .001), d = Math.max(c.x, .001), u = new e.Vector3, m = new e.Box3, y = new Map, p = [], f = new Set, h = [];
let g = 0, v = 0;
const b = (e, t) => {
if (!Array.isArray(e) || e.length < 1) return 0;
const r = Math.max(0, Math.min(1, Number(t) || 0)), n = Math.floor((e.length - 1) * r);
return e[Math.max(0, Math.min(e.length - 1, n))];
}, w = (t, r = 1) => {
if (!Array.isArray(t) || t.length < 1) return;
const n = [];
t.sort((e, t) => Number(t.score || 0) - Number(e.score || 0) || e.horizontalDistance - t.horizontalDistance).forEach(e => {
e && e.material && e.material.color && (n.some(t => t.node === e.node && t.material === e.material) || n.length >= r || n.push(e));
}), n.forEach(t => (t => {
if (!t || !t.material || !t.material.color) return;
const r = Number(t.sharedCount || 1);
let n = t.material;
if (r > 1) if (Array.isArray(t.node.material)) {
const e = t.material.clone(), r = [ ...t.node.material ];
r[t.materialIndex] = e, t.node.material = r, n = e;
} else {
const e = t.material.clone();
t.node.material = e, n = e;
}
n && n.color && !f.has(n) && (n.transparent = !1, n.opacity = 1, "alphaTest" in n && (n.alphaTest = 0), 
"depthWrite" in n && (n.depthWrite = !0), n.alphaMap && (n.alphaMap = null), e && void 0 !== e.NormalBlending && "blending" in n && (n.blending = e.NormalBlending), 
e && void 0 !== e.FrontSide && "side" in n && (n.side = e.FrontSide), "metalness" in n && (n.metalness = 0), 
"roughness" in n && (n.roughness = Math.max(.72, Number(n.roughness || 0))), "shininess" in n && (n.shininess = Math.min(20, Number(n.shininess || 0))), 
n.specular && "function" == typeof n.specular.setHex && n.specular.setHex(1118481), 
n.emissive && "function" == typeof n.emissive.setHex && n.emissive.setHex(0), n.color.setHex(o), 
n.needsUpdate = !0, f.add(n), h.push({
node: t.nodeName,
material: t.materialName,
sharedCount: r
}));
})(t));
};
t.traverse(t => {
if (!t?.isMesh || !t.material) return;
g += 1, t.getWorldPosition(u);
const r = Math.hypot(u.x - i.x, u.z - i.z);
m.setFromObject(t);
const n = m.getSize(new e.Vector3), a = n.y <= .68 * l && n.x <= 1.05 * d;
(Array.isArray(t.material) ? t.material : [ t.material ]).forEach((e, n) => {
if (v += 1, !e || !e.color) return;
(e => {
if (!e) return;
const t = Number(y.get(e) || 0);
y.set(e, t + 1);
})(e);
const o = `${e.name || ""} ${t.name || ""}`.toLowerCase(), s = (e => /(hair|hat|cap|helmet|horn|glasses|beard|accessor|shoulder|waist|back|front|neck|shoe|earring|handle|tool|sword|bag|decal|sticker)/.test(e))(o), i = /(head|face|skin|dynamic|dynhead|facial)/.test(o), c = Math.max(e.color.r, e.color.g, e.color.b), l = Math.min(e.color.r, e.color.g, e.color.b), d = e.color.b - e.color.r, m = e.color.b - e.color.g, f = d > .06 && m > .03, h = c - l < .08 && c > .1 && c < .92, g = Boolean(e.map), b = Number(e.opacity), w = Number.isFinite(b) ? b : 1, A = Boolean(e.transparent) || w < .96, C = (e => /(eye|iris|pupil|cornea|sclera|teeth|tooth|tongue|mouth|lip|lash|brow|eyebrow|eyelash|tear|highlight|spec|gloss|glass)/.test(e))(o), T = (e => /(torso|leftarm|rightarm|leftleg|rightleg|upperarm|lowerarm|upperleg|lowerleg|pants|pant|shirt|jacket|sweater|hoodie|shorts|dress|skirt|shoe|waist|back|front|layered|tshirt|tee)/.test(e))(o);
p.push({
node: t,
nodeName: t.name || "(unnamed)",
material: e,
materialIndex: n,
materialName: e.name || "(unnamed)",
token: o,
y: Number(u.y),
horizontalDistance: r,
isLikelyAccessory: s,
isNamedHeadMaterial: i,
isBlueFallbackMaterial: f,
isNeutralMaterial: h,
isHeadSized: a,
hasTextureMap: g,
isLikelyTransparent: A,
isLikelyFacialDetail: C,
isLikelyClothingOrBody: T
});
});
}), p.forEach(e => {
e.sharedCount = Number(y.get(e.material) || 1);
});
const A = p.filter(e => !e.isLikelyAccessory), C = A.map(e => Number(e.y)).filter(e => Number.isFinite(e)).sort((e, t) => e - t), T = C.length > 1 ? C[C.length - 1] - C[0] : 0, x = T > .02, S = b(C, .62), E = b(C, .8), k = e => {
let t = 0;
t += 1.6 * Math.max(0, 1 - e.horizontalDistance / Math.max(d, .001)), e.isNamedHeadMaterial && (t += 5), 
e.isHeadSized && (t += .9), (e.isBlueFallbackMaterial || e.isNeutralMaterial) && (t += .35), 
1 === e.sharedCount ? t += 1.5 : e.sharedCount > 6 && (t -= 2.2);
const r = (e => {
const t = String(e || "").toLowerCase().match(/player(\d+)|part(\d+)|mesh(\d+)/i);
if (!t) return 0;
const r = Number(t[1] || t[2] || t[3] || 0);
return Number.isFinite(r) && r > 0 ? r : 0;
})(e.nodeName);
if (1 === r ? t += 1.2 : r > 1 && r <= 3 && (t += .45), e.isLikelyClothingOrBody && (t -= 1.6), 
x) {
t += 1.1 * Math.max(0, Math.min(1, (e.y - S) / Math.max(.3 * l, 1e-4)));
}
return t;
}, N = A.map(e => ({
...e,
score: k(e)
})).sort((e, t) => Number(t.score || 0) - Number(e.score || 0)), I = N.filter(e => !(e.isLikelyFacialDetail || e.isLikelyTransparent || e.isLikelyAccessory || e.isLikelyClothingOrBody) && !(e.hasTextureMap && !e.isNamedHeadMaterial)), $ = I.filter(e => !(!e.isNamedHeadMaterial || !e.isHeadSized) && (!x || e.y >= S - .08 * l)), L = I.filter(e => !!e.isNamedHeadMaterial && (!x || e.y >= S - .14 * l)), M = I.filter(e => !!e.isHeadSized && (!(e.horizontalDistance > Math.max(.45 * d, .12)) && (!x || e.y >= E - .08 * l))), R = I.filter(e => e.isNamedHeadMaterial).slice(0, 1);
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
Number(T.toFixed(4)), Number(S.toFixed(4)), Number(E.toFixed(4)), p.length, I.length, 
$.length, L.length, M.length, R.length, f.size;
}
function ut(e, t, r) {
const n = new e.Group, a = t?.scales || {}, o = t?.bodyColors || {}, s = t?.playerAvatarType?.playerAvatarType || "R15", i = Number(a.bodyType ?? 0) || 0, c = Number(a.height ?? 1) || 1, l = Number(a.width ?? 1) || 1, d = Number(a.depth ?? 1) || 1, u = Number(a.proportion ?? 0) || 0, m = "R6" === s ? 2 : 1.8, y = "R6" === s ? 2 : 2.2, p = "R6" === s ? 1 : .9, f = "R6" === s ? .6 : .45, h = "R6" === s ? .6 : .45, g = "R6" === s ? 1.5 : 1.6, v = 1.35 * (Number(a.head ?? 1) || 1), b = lt(o.torsoColor, 9079434), w = lt(o.headColor, b), A = lt(o.leftArmColor, b), C = lt(o.leftLegColor, b), T = (t, r, a, o, s, i = 0, c = 0, l = 0) => {
const d = new e.Mesh(t, new e.MeshStandardMaterial({
color: r,
roughness: .85,
metalness: .05
}));
return d.position.set(a, o, s), d.rotation.set(i, c, l), n.add(d), d;
};
T(new e.BoxGeometry(m * l, y * c, p * d), b, 0, g + y * c / 2, 0), T(new e.SphereGeometry(v * l / 2, 24, 18), w, 0, g + y * c + .55 * v, 0);
const x = g + y * c * .75, S = g / 2, E = m * l * .75, k = m * l * .3;
return T(new e.BoxGeometry(f * l, g * c, h * d), A, -E, x, 0), T(new e.BoxGeometry(f * l, g * c, h * d), A, E, x, 0), 
T(new e.BoxGeometry(f * l, g * c, h * d), C, -k, S, 0), T(new e.BoxGeometry(f * l, g * c, h * d), C, k, S, 0), 
n.rotation.y = .15, n.position.y = .1 * u - .35 + .08 * i, r?.camera?.position && (n.userData.renderCamera = r.camera), 
n;
}
function mt() {
"3d" !== h.previewMode || h.previewRateLimited || Date.now() - Ae < 2500 || pe || (pe = vt().finally(() => {
pe = null;
}));
}
function yt(e) {
h.preview3DLoading = Boolean(e);
const t = document.getElementById("preview-loading-overlay");
t && t.classList.toggle("active", "3d" === h.previewMode && h.preview3DLoading);
}
function pt(e) {
h.previewRateLimited = Boolean(e), !h.previewRateLimited && xe && (window.clearTimeout(xe), 
xe = null);
const t = document.getElementById("preview-rate-limited-overlay");
t && t.classList.toggle("active", "3d" === h.previewMode && h.previewRateLimited);
}
function ft() {
"3d" === h.previewMode && (xe && window.clearTimeout(xe), xe = window.setTimeout(() => {
xe = null, "3d" === h.previewMode && (!h.user || h.loadingProfile || h.saving ? ft() : (pt(!1), 
mt()));
}, 3e4));
}
function ht() {
const e = new Error("3D preview init superseded by a newer init request");
return e.code = "PURPURA_PREVIEW_INIT_CANCELLED", e;
}
function gt(e) {
if (e !== Te) throw ht();
}
async function vt() {
if ("3d" !== h.previewMode) return void yt(!1);
const e = ++Te;
pt(!1), yt(!0);
try {
let t = document.getElementById("avatar-canvas-3d");
if (!t) return void bt();
if ("2d" === t.dataset.mode) {
const e = t.cloneNode(!1);
e.id = "avatar-canvas-3d", t.replaceWith(e), t = e;
}
if (gt(e), le && le.domElement !== t && (At(), gt(e)), le && le.domElement === t) return;
try {
const r = await De();
gt(e);
const n = await He();
gt(e);
const a = await je();
gt(e);
const o = await _e();
gt(e);
const s = t.parentElement, i = s?.clientWidth || 420, c = s?.clientHeight || 420;
if (i < 50 || c < 50) return Ae = Date.now(), void bt();
t.width = i, t.height = c, ie = new r.Scene, ie.background = null, ce = new r.PerspectiveCamera(75, i / c, .1, 1e3), 
ce.position.z = 3, le = new r.WebGLRenderer({
canvas: t,
antialias: !0,
alpha: !0,
powerPreference: "high-performance"
}), le.setSize(i, c, !1), le.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)), 
"outputEncoding" in le && r.sRGBEncoding && (le.outputEncoding = r.sRGBEncoding), 
"toneMapping" in le && void 0 !== r.ACESFilmicToneMapping && (le.toneMapping = r.ACESFilmicToneMapping, 
le.toneMappingExposure = .98), ue = new o(ce, le.domElement), ue.autoRotate = !0, 
ue.autoRotateSpeed = 2, ue.enableDamping = !0, ue.dampingFactor = .05;
const l = new r.DirectionalLight(16777215, 1.05);
l.position.set(4.5, 7.5, 6.5), ie.add(l);
const d = new r.DirectionalLight(14412031, .45);
d.position.set(-5.5, 2.8, 3.2), ie.add(d);
const u = new r.DirectionalLight(15725823, .35);
u.position.set(.5, 5.5, -7.5), ie.add(u);
const m = new r.HemisphereLight(16317439, 6254471, .35);
ie.add(m);
const y = new r.AmbientLight(16777215, .28);
ie.add(y), function t() {
e === Te && (me = requestAnimationFrame(t), ue && ue.update(), le && ie && ce && le.render(ie, ce));
}();
try {
const t = await ze(h.user?.id);
if (gt(e), !t) throw new Error("No avatar-3d metadata returned");
const o = String(t.obj || "").trim(), s = String(t.mtl || "").trim();
if (!o || !s) throw new Error("avatar-3d metadata missing obj/mtl hash");
const i = Je(o), c = Je(s), l = Array.isArray(t.textures) ? t.textures.map(e => String(e || "").trim()).filter(Boolean) : [], d = l.map(e => Je(e)).filter(Boolean);
We({
itemLabel: h.user?.name ? `${h.user.name} avatar preview` : "avatar preview",
sourceEndpoint: t.__sourceEndpoint || "",
metadataUrl: t.__metadataUrl || "",
objUrl: i,
mtlUrl: c,
textureUrls: d
});
const u = new r.LoadingManager;
u.setURLModifier(e => {
const t = Ge(e);
if (!t) return e;
if (l.includes(t)) return Je(t);
const r = t.split(".")[0];
return l.includes(r) || /^(?:1DAY-)?[a-f0-9]{32}$/i.test(r) ? Je(r) : e;
});
const m = await new Promise((e, t) => {
const r = new a(u), n = setTimeout(() => t(new Error("MTL load timeout")), 12e3);
r.load(c, t => {
clearTimeout(n), e(t);
}, void 0, e => {
clearTimeout(n), t(e);
});
});
gt(e), m.preload(), Object.values(m.materials || {}).forEach(e => {
e && (e.transparent = !1, e.opacity = 1, e.alphaMap && (e.alphaMap = null), e.needsUpdate = !0);
}), de && ie && ie.remove(de);
const y = await new Promise((e, t) => {
const r = new n(u);
r.setMaterials(m);
const a = setTimeout(() => t(new Error("OBJ load timeout")), 12e3);
r.load(i, t => {
clearTimeout(a), e(t);
}, void 0, e => {
clearTimeout(a), t(e);
});
});
if (gt(e), de = y, !de || !de.children || de.children.length < 1) throw new Error("Loaded OBJ was empty");
if (dt(r, de, h.avatarDefinition), !ie || !ce || !ue) throw new Error("3D preview state was disposed before model attach");
ie.add(de);
const p = (new r.Box3).setFromObject(de), f = p.getCenter(new r.Vector3), g = (e, t) => {
const r = Number(e);
return Number.isFinite(r) ? r : t;
}, v = new r.Vector3(g((Number(t?.aabb?.min?.x) + Number(t?.aabb?.max?.x)) / 2, f.x), g((Number(t?.aabb?.min?.y) + Number(t?.aabb?.max?.y)) / 2, f.y), g((Number(t?.aabb?.min?.z) + Number(t?.aabb?.max?.z)) / 2, f.z)), b = p.getSize(new r.Vector3), w = Math.max(b.x, b.y, b.z, 1), A = ce.fov * (Math.PI / 180), C = 1.55 * Math.abs(w / 2 / Math.tan(A / 2));
ce.position.set(v.x, v.y + .12 * b.y, v.z + Math.max(C, 6)), ce.near = .01, ce.far = Math.max(300, 8 * C), 
ce.updateProjectionMatrix(), ue.target.set(v.x, v.y, v.z), ue.update();
} catch (e) {
if ("PURPURA_PREVIEW_INIT_CANCELLED" === e?.code) return;
if ("PURPURA_AVATAR3D_RATE_LIMITED" === e?.code) return Ae = Date.now(), At(), void bt();
Ae = Date.now(), At(), bt();
}
} catch (e) {
if ("PURPURA_PREVIEW_INIT_CANCELLED" === e?.code) return;
Ae = Date.now(), At(), bt();
}
} catch (e) {
if ("PURPURA_PREVIEW_INIT_CANCELLED" === e?.code) return;
Ae = Date.now(), At(), bt();
} finally {
e === Te && yt(!1);
}
}
function bt() {
"3d" === h.previewMode && (yt(!1), pt(!0), ft());
}
function wt(e) {
if (("2d" === e || "3d" === e) && h.previewMode !== e) {
if (h.previewMode = e, j(), "2d" === h.previewMode) return yt(!1), pt(!1), At(), 
void It(Nt());
pt(!1), Ae = 0, It(Nt()), mt();
}
}
function At() {
if (Te += 1, yt(!1), me && (cancelAnimationFrame(me), me = null), ye && (cancelAnimationFrame(ye), 
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
function Ct() {
C && (window.clearTimeout(C), C = null), T && (window.clearTimeout(T), T = null);
}
function Tt() {
Ct(), h.toastOpen && (C = window.setTimeout(() => {
h.toastOpen && (h.toastClosing = !0, Cr(), T = window.setTimeout(() => {
St(), Cr();
}, f));
}, p));
}
function xt(e, t = "") {
Ct(), h.toastOpen = !0, h.toastClosing = !1, h.toastMessage = e, h.toastDetails = t, 
Tt();
}
function St() {
Ct(), h.toastOpen = !1, h.toastClosing = !1, h.toastMessage = "", h.toastDetails = "";
}
function Et(e = {
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
function kt(e = {}) {
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
}, It(Nt());
});
}
function Nt() {
const e = document.querySelector(".inventory-scroll-root");
return e ? e.scrollTop : 0;
}
function It(e) {
Cr();
const t = document.querySelector(".inventory-scroll-root");
t && (t.scrollTop = e);
}
function $t(e) {
const t = Number(e);
return !Number.isFinite(t) || t <= 0 ? "Asset" : i[t] || "Asset";
}
function Lt(e) {
if (!e) return "Asset";
if ("number" == typeof e) return $t(e);
if ("string" == typeof e) {
const t = Number(e);
return Number.isFinite(t) && t > 0 ? $t(t) : "asset" === e.toLowerCase() ? "Asset" : e;
}
const t = Number(e.id ?? e.assetTypeId ?? e.AssetTypeId ?? 0);
if (Number.isFinite(t) && t > 0) {
const e = $t(t);
if ("Asset" !== e) return e;
}
const r = e.name ?? e.type ?? e.displayName ?? "";
return "string" == typeof r && r.trim() ? r : "Asset";
}
function Mt(e) {
return String(e || "").replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("_", " ").trim().split(/\s+/).filter(Boolean).map(e => e.charAt(0).toUpperCase() + e.slice(1).toLowerCase()).join(" ");
}
function Rt(e) {
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
return t.endsWith("Accessory") ? Mt(t.replace(/Accessory$/, "")) : t.endsWith("Animation") ? `${Mt(t.replace(/Animation$/, ""))} Animation` : Mt(t);
}
function Ft(e) {
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
function Bt(e) {
return (e?.details || e?.message || "").toString().includes("LimitExceeded");
}
async function Ut(e, t = {}) {
const r = await fetch(e, {
credentials: "include",
...t
});
if (!r.ok) throw new Error(`Request failed (${r.status}): ${e}`);
return r.json();
}
async function Pt() {
const e = "https://avatar.roblox.com/v1/avatar";
try {
const t = await Fe(e, {
method: "GET",
accept: "application/json, text/plain;q=0.9, */*;q=0.8",
usePageFetch: !0
});
"string" == typeof t?.csrfToken && t.csrfToken && (h.csrfToken = t.csrfToken), "string" == typeof t?.boundAuthToken && t.boundAuthToken && (h.boundAuthToken = t.boundAuthToken);
const r = Number(t?.status) || 0, n = String(t?.text || "");
if (!t?.ok) {
let t = n || `Request failed (${r})`;
try {
const e = JSON.parse(n), r = Array.isArray(e?.errors) ? e.errors : [];
r.length > 0 && (t = `api error - errors: ${JSON.stringify(r)}`);
} catch (e) {}
const a = new Error(`Request failed (${r}): ${e}`);
throw a.details = t, a;
}
return n ? JSON.parse(n) : {};
} catch (t) {
try {
return await Ut(e);
} catch (e) {
throw !e.details && t?.message && (e.details = t.message), e;
}
}
}
function Dt() {
const e = h.avatarDefinition || {}, t = e?.bodyColors || {}, r = e?.scales && "object" == typeof e.scales ? {
...e.scales
} : {}, n = {
headColor3: Vt(t.headColor || "F2D5C7"),
torsoColor3: Vt(t.torsoColor || t.headColor || "F2D5C7"),
rightArmColor3: Vt(t.rightArmColor || t.torsoColor || t.headColor || "F2D5C7"),
leftArmColor3: Vt(t.leftArmColor || t.torsoColor || t.headColor || "F2D5C7"),
rightLegColor3: Vt(t.rightLegColor || t.torsoColor || t.headColor || "F2D5C7"),
leftLegColor3: Vt(t.leftLegColor || t.torsoColor || t.headColor || "F2D5C7")
}, a = e => {
if (!e || "object" != typeof e) return 0;
let t = 0;
"string" == typeof e.name && e.name.trim() && (t += 1);
const r = Number(e.currentVersionId || e.versionId || 0);
Number.isFinite(r) && r > 0 && (t += 1);
const n = Number(e.assetType?.id ?? e.assetTypeId ?? e.assetType ?? 0), a = String(e.assetType?.name || e.assetTypeName || "").trim();
e?.meta && "object" == typeof e.meta && !Array.isArray(e.meta) && (t += 1);
return (Number.isFinite(n) && n > 0 || a) && (t += 1), t;
}, o = new Map, s = (e, t = "") => {
const r = ((e, t = "") => {
const r = Number(e?.id || e?.assetId || 0);
if (!Number.isFinite(r) || r <= 0) return null;
const n = {
id: r
}, a = String(e?.name || "").trim();
a && (n.name = a);
const o = Number(e?.currentVersionId || e?.versionId || 0);
Number.isFinite(o) && o > 0 && (n.currentVersionId = o);
const s = Lt(e?.assetType?.name || e?.assetTypeName || e?.assetType?.id || e?.assetTypeId || t || h.wornAssetTypeById[r] || ""), i = Number(e?.assetType?.id ?? e?.assetTypeId ?? e?.assetType ?? 0);
const c = ot(e?.meta) || ot(h.wornAssetMetaById[r]);
return (Number.isFinite(i) && i > 0 || s && "Asset" !== s) && (n.assetType = {}, 
Number.isFinite(i) && i > 0 && (n.assetType.id = i), s && (n.assetType.name = s)), 
n && c && (n.meta = c), n;
})(e, t);
if (!r) return;
const n = o.get(r.id);
(!n || a(r) >= a(n)) && o.set(r.id, r);
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
scales: r,
bodyColor3s: n,
bodyColors: {
headColor3: `#${n.headColor3}`,
torsoColor3: `#${n.torsoColor3}`,
rightArmColor3: `#${n.rightArmColor3}`,
leftArmColor3: `#${n.leftArmColor3}`,
rightLegColor3: `#${n.rightLegColor3}`,
leftLegColor3: `#${n.leftLegColor3}`
},
assetIds: c,
assets: i.map(e => {
const t = {
id: e.id
}, r = ot(e?.meta);
return r && (t.meta = r), t;
}),
richAssets: i
};
}
async function Ot(e, t, r = {}) {
const n = !0 === r.includeBoundAuth, a = Re(r.method, "POST"), o = "GET" !== a && "HEAD" !== a, s = o && void 0 !== t, i = s ? JSON.stringify(t || {}) : "", c = s ? "application/json" : "";
let l = h.csrfToken || "", d = h.boundAuthToken || "";
if (!l && o) try {
const e = await Fe("https://auth.roblox.com/v2/logout", {
method: "POST",
accept: "application/json, text/plain;q=0.9, */*;q=0.8",
usePageFetch: !0,
csrfToken: "fetch",
boundAuthToken: n ? d : ""
});
"string" == typeof e?.csrfToken && e.csrfToken && (l = e.csrfToken, h.csrfToken = e.csrfToken), 
"string" == typeof e?.boundAuthToken && e.boundAuthToken && (d = e.boundAuthToken, 
h.boundAuthToken = e.boundAuthToken);
} catch (e) {}
if (!l && o) try {
const e = new Headers({
"X-CSRF-TOKEN": "fetch"
});
n && d && e.set("x-bound-auth-token", d);
const t = await fetch("https://auth.roblox.com/v2/logout", {
method: "POST",
credentials: "include",
headers: e
}), r = t.headers.get("x-csrf-token"), a = t.headers.get("x-bound-auth-token");
r && (l = r, h.csrfToken = r), a && (d = a, h.boundAuthToken = a);
} catch (e) {}
for (let t = 0; t < 2; t += 1) {
const r = {
method: a,
body: i,
contentType: c,
accept: "application/json, text/plain;q=0.9, */*;q=0.8",
csrfToken: l || (o ? "fetch" : ""),
boundAuthToken: n ? d : ""
};
let s;
try {
s = await Fe(e, {
...r,
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
const t = await Fe(e, {
...r,
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
const t = Array.isArray(y?.errors) ? y.errors : [], r = t.length > 0 ? `api error - errors: ${JSON.stringify(t)}` : m || `Request failed (${u})`, n = new Error(`Request failed (${u}): ${e}`);
throw n.details = r, n;
}
return y;
}
throw new Error("Roblox API request failed.");
}
async function _t(e) {
const t = await Ut(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${encodeURIComponent(e)}&size=420x420&format=Png&isCircular=false&returnPolicy=PlaceHolder`);
return !t || !Array.isArray(t.data) || t.data.length < 1 ? "" : t.data[0].imageUrl || "";
}
async function Ht(e) {
const t = e.map(e => e.id).filter(Boolean);
if (!t.length) return e;
const r = await Ut(`https://thumbnails.roblox.com/v1/assets?assetIds=${t.join(",")}&returnPolicy=PlaceHolder&size=250x250&format=Png&isCircular=false`), n = new Map;
return r && Array.isArray(r.data) && r.data.forEach(e => {
n.set(e.targetId, e.imageUrl || "");
}), e.map(e => ({
...e,
thumbnailUrl: n.get(e.id) || e.thumbnailUrl || ""
}));
}
async function jt(e) {
const t = e.map(e => e.id).filter(Boolean);
if (!t.length) return e;
const r = new Map, n = [ "150x150", "420x420" ];
for (let e = 0; e < t.length; e += 50) {
const a = t.slice(e, e + 50);
let o = null;
for (let e = 0; e < n.length; e += 1) {
const r = n[e];
try {
o = await Ut(`https://thumbnails.roblox.com/v1/users/outfits?userOutfitIds=${a.join(",")}&size=${r}&format=Png&isCircular=false`);
break;
} catch (t) {
if (e === n.length - 1) throw t;
}
}
o && Array.isArray(o.data) && o.data.forEach(e => {
r.set(e.targetId, e.imageUrl || "");
});
}
return e.map(e => ({
...e,
thumbnailUrl: r.get(e.id) || e.thumbnailUrl || ""
}));
}
async function qt(e) {
const t = Number(e);
if (!Number.isFinite(t) || t <= 0) return null;
try {
const e = await Ut(`https://economy.roblox.com/v2/assets/${t}/details`), r = e?.Name || e?.name || e?.AssetName || e?.assetName || "", n = Lt(e?.AssetType?.Name || e?.assetType?.name || e?.AssetTypeId || e?.assetTypeId || e?.AssetType || e?.assetType);
if (r || "Asset" !== n) return {
id: t,
name: r || `Asset ${t}`,
type: n,
thumbnailUrl: ""
};
} catch (e) {}
try {
const e = await Ut(`https://catalog.roblox.com/v1/assets/${t}/details`), r = e?.name || e?.Name || "", n = Lt(e?.assetType?.name || e?.assetTypeName || e?.assetTypeId || e?.assetType?.id);
if (r || "Asset" !== n) return {
id: t,
name: r || `Asset ${t}`,
type: n,
thumbnailUrl: ""
};
} catch (e) {}
return null;
}
async function zt() {
const e = $(n);
if (!e.length) return h.inventoryItems = [], void (h.inventoryHasMore = !1);
const t = new Map, r = new Map, a = e.filter(e => "asset" === e.entityType), o = e.filter(e => "outfit" === e.entityType), s = a.map(e => e.id).filter(Boolean);
for (let r = 0; r < s.length; r += 20) {
const n = s.slice(r, r + 20);
try {
const e = await Ot("https://catalog.roblox.com/v1/catalog/items/details", {
items: n.map(e => ({
itemType: "Asset",
id: e
}))
}, {
method: "POST"
});
e && Array.isArray(e.data) && e.data.forEach(e => {
const r = Number(e?.id || e?.targetId || 0);
if (!r) return;
const n = Lt(e?.assetType?.name || e?.assetTypeName || e?.assetType?.id || e?.assetTypeId || e?.itemType || "Asset");
t.set(r, {
id: r,
name: e?.name || `Asset ${r}`,
type: n,
thumbnailUrl: ""
});
});
} catch (e) {}
}
const i = s.filter(e => {
const r = t.get(e);
if (!r) return !0;
return /^Asset\s+\d+$/i.test(String(r.name || "")) || "Asset" === String(r.type || "Asset");
});
const c = await Promise.all(i.map(async e => ({
id: e,
details: await qt(e)
}))), l = new Map(c.filter(e => e?.details).map(e => [ e.id, e.details ]));
i.forEach(e => {
const r = l.get(e);
if (!r) return;
const n = t.get(e);
t.set(e, {
id: e,
name: r.name || n?.name || `Asset ${e}`,
type: r.type || n?.type || h.wornAssetTypeById[e] || "Asset",
thumbnailUrl: n?.thumbnailUrl || ""
});
});
const d = a.map(e => {
const n = t.get(e.id), a = e.meta || {}, o = {
id: e.id,
name: n?.name || String(a.name || `Asset ${e.id}`),
type: n?.type || String(a.type || h.wornAssetTypeById[e.id] || "Asset"),
thumbnailUrl: n?.thumbnailUrl || String(a.thumbnailUrl || ""),
recentKey: e.key
};
return r.set(e.key, o), o;
});
let u = d;
if (u.length > 0) try {
u = await Ht(u);
} catch (e) {
u = d;
}
u.forEach(e => {
e.recentKey && r.set(e.recentKey, e);
});
const m = o.map(e => {
const t = e.meta || {}, r = Number(e.id);
return {
id: r,
userOutfitId: r,
outfitId: r,
name: String(t.name || `Outfit ${r}`),
type: "Outfit",
thumbnailUrl: String(t.thumbnailUrl || ""),
recentKey: e.key
};
});
let y = m;
if (y.length > 0) {
const t = y.filter(e => !e.thumbnailUrl);
if (t.length > 0) try {
const e = await jt(t), r = new Map(e.map(e => [ e.id, e.thumbnailUrl || "" ]));
y = y.map(e => ({
...e,
thumbnailUrl: e.thumbnailUrl || r.get(e.id) || ""
}));
} catch (e) {
y = m;
}
}
y.forEach(e => {
e.recentKey && r.set(e.recentKey, e);
});
const p = e.map(e => r.get(e.key)).filter(Boolean).filter(e => {
const t = /^Asset\s+\d+$/i.test(String(e?.name || "")), r = "Asset" === String(e?.type || "Asset");
return !t || !r || (e?.recentKey && (delete h.recentlyEquippedTimestamps[e.recentKey], 
delete h.recentItemMetadata[e.recentKey]), !1);
});
let f = !1;
p.forEach(e => {
if (!e?.recentKey) return;
const t = {
name: String(e.name || ""),
type: String(e.type || ""),
thumbnailUrl: String(e.thumbnailUrl || "")
}, r = h.recentItemMetadata[e.recentKey] || {};
r.name === t.name && r.type === t.type && r.thumbnailUrl === t.thumbnailUrl || (h.recentItemMetadata[e.recentKey] = t, 
f = !0);
}), f && k(), h.inventoryItems = p, h.inventorySeenIds = new Set(h.inventoryItems.map(e => e.id)), 
h.inventoryHasMore = !1;
}
function Wt(e, t) {
const r = Number(e);
return Number.isFinite(r) ? Math.max(0, Math.min(1, r)) : t;
}
function Jt(e) {
const t = y[e] ?? 0;
return Wt(h.previousScaleSnapshot?.[e], t);
}
function Gt(e) {
const t = {
head: 1,
height: 1,
width: 1,
depth: 1,
proportion: 0,
bodyType: 0
}[e] ?? 0;
return Wt(h.avatarDefinition?.scales?.[e], t);
}
function Vt(e) {
const t = String(e || "").replace(/^#/, "").trim();
return /^[0-9a-fA-F]{6}$/.test(t) ? t.toUpperCase() : "F2D5C7";
}
function Kt(e) {
const t = Vt(e), r = Vt(h.preferredSkinTone || t), n = u.map((e, t) => ({
tone: Vt(e),
name: m[t] || "Skin Tone",
type: "Skin Color",
source: "preset"
})), a = h.customSkinTones.map(e => Vt(e)).filter(e => !u.includes(e)).map(e => ({
tone: e,
name: String(h.customSkinToneNames[e] || "").trim() || `#${e}`,
type: "Skin Color",
source: "custom"
})), o = new Map;
[ ...a, ...n ].forEach(e => {
e && e.tone && !o.has(e.tone) && o.set(e.tone, e);
});
let s = o.get(r) || o.get(t) || null;
if (!s) {
const e = String(h.customSkinToneNames[r] || "").trim();
s = {
tone: r,
name: e || `#${r}`,
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
async function Qt() {
if (!h.user || h.saving) return;
const e = {};
d.forEach(t => {
const r = document.getElementById(`scale-${t}`), n = document.getElementById(`scale-number-${t}`), a = n ? n.value : r?.value;
e[t] = Wt(a, Gt(t));
}), h.saving = !0, St();
const t = Nt();
It(t);
try {
try {
await Ot("https://avatar.roblox.com/v1/avatar/set-scales", e, {
includeBoundAuth: !0
});
} catch (t) {
await Ot("https://avatar.roblox.com/v2/avatar/set-scales", e, {
includeBoundAuth: !0
});
}
ct(await Pt()), await ar(h.user.id), "3d" === h.previewMode && At();
} catch (e) {
xt("Could not update body scale.", e.details || e.message || "Unknown error");
} finally {
h.saving = !1, It(t);
}
}
async function Zt(e) {
if (!h.user || h.saving) return;
const t = Vt(e);
h.preferredSkinTone = t;
const r = {
headColor3: `#${t}`,
torsoColor3: `#${t}`,
rightArmColor3: `#${t}`,
leftArmColor3: `#${t}`,
rightLegColor3: `#${t}`,
leftLegColor3: `#${t}`
}, n = {
headColor: t,
torsoColor: t,
rightArmColor: t,
leftArmColor: t,
rightLegColor: t,
leftLegColor: t
};
h.saving = !0, St();
const a = Nt();
It(a);
try {
try {
await gr("https://avatar.roblox.com/v2/avatar/set-body-colors", r);
} catch (e) {
await gr("https://avatar.roblox.com/v1/avatar/set-body-colors", n);
}
ct(await Pt()), await ar(h.user.id), "3d" === h.previewMode && At();
} catch (e) {
xt("Could not update skin tone.", e.details || e.message || "Unknown error");
} finally {
h.saving = !1, It(a);
}
}
function Yt(e, t = 0) {
const r = e.assetId;
if (!r) return null;
let n = Lt(e.assetType ?? e.assetTypeId ?? e.assetType?.id ?? e.assetTypeName);
"Asset" === n && Number(t) > 0 && (n = $t(t));
return {
id: r,
name: e.name || e.assetName || e.itemName || e.displayName || `Asset ${r}`,
type: n,
thumbnailUrl: ""
};
}
function Xt(e) {
const t = Number(e?.userOutfitId || e?.id || e?.outfitId || 0), r = Number(e?.outfitId || e?.id || t || 0), n = t || r;
return !Number.isFinite(n) || n <= 0 ? null : {
id: n,
userOutfitId: Number.isFinite(t) && t > 0 ? t : n,
outfitId: Number.isFinite(r) && r > 0 ? r : n,
name: e.name || `Outfit ${n}`,
type: "Outfit",
thumbnailUrl: e.thumbnail || ""
};
}
function er() {
return `${h.activeCategory}::${h.activeSubcategory}`;
}
function tr(e, t = "") {
const r = h.inventoryTypeIds[h.inventoryTypeIndex];
if (-100 === r || -101 === r) {
const n = -100 === r, o = Number.parseInt(String(t || "1"), 10), s = new URLSearchParams({
itemsPerPage: String(a),
page: Number.isFinite(o) && o > 0 ? String(o) : "1",
isEditable: n ? "true" : "false"
});
return `https://avatar.roblox.com/v1/users/${encodeURIComponent(e)}/outfits?${s.toString()}`;
}
const n = new URLSearchParams({
sortOrder: "Desc",
limit: "100"
});
return t && n.set("cursor", t), `https://inventory.roblox.com/v2/users/${e}/inventory/${r}?${n.toString()}`;
}
function rr() {
const e = ee();
h.inventoryItems = [], h.inventoryTypeIds = [ ...e ], h.inventoryTypeIndex = 0, 
h.inventoryTypeCursors = Object.fromEntries(e.map(e => [ e, "" ])), h.inventoryHasMore = e.length > 0, 
h.inventorySeenIds = new Set, h.inventoryKey = er(), w += 1, h.loadingInventory = !1;
}
async function nr(e = !1) {
if (!h.user) return;
if (h.inventoryKey === er() || rr(), h.loadingInventory) {
if (!e) return;
w += 1, h.loadingInventory = !1;
}
if (!e && !h.inventoryHasMore) return;
const t = ++w, r = h.inventoryKey, n = () => t !== w || r !== h.inventoryKey || r !== er();
h.loadingInventory = !0;
const o = Nt();
It(o);
try {
if (n()) return;
if (te() || re()) return h.inventoryItems = [], h.inventoryHasMore = !1, void (h.inventoryTypeIndex = h.inventoryTypeIds.length);
if ("Recent" === h.activeCategory) return await zt(), void (h.inventoryTypeIndex = h.inventoryTypeIds.length);
let t = !1, r = 0;
for (;h.inventoryHasMore && !t && r < 4; ) {
if (n()) return;
if (r += 1, h.inventoryTypeIndex >= h.inventoryTypeIds.length) {
h.inventoryHasMore = !1;
break;
}
const o = h.inventoryTypeIds[h.inventoryTypeIndex], s = h.inventoryTypeCursors[o] || "", i = tr(h.user.id, s);
let c;
try {
c = await Ut(i);
} catch (e) {
if (n()) return;
h.inventoryTypeIndex += 1, h.inventoryHasMore = h.inventoryTypeIndex < h.inventoryTypeIds.length;
continue;
}
if (n()) return;
let l = [], d = "";
const u = -100 === o || -101 === o;
if (u) {
l = (Array.isArray(c.data) ? c.data : Array.isArray(c.outfits) ? c.outfits : Array.isArray(c.userOutfits) ? c.userOutfits : []).map(Xt).filter(Boolean);
const e = Number.parseInt(String(c.page || s || "1"), 10), t = Number.isFinite(e) && e > 0 ? e : 1, r = c.nextPageCursor || c.nextCursor || c.nextPage || c.nextPageNumber || "", n = Number(c.totalPages || c.pages || 0), o = Number(c.total || c.totalItems || c.totalCount || 0), i = Number(c.itemsPerPage || a);
if ("string" == typeof r && r) d = r; else if (Number.isFinite(r) && r > 0) d = String(r); else if (Number.isFinite(n) && n > 0) d = t < n ? String(t + 1) : ""; else if (Number.isFinite(o) && o > 0 && Number.isFinite(i) && i > 0) {
d = t < Math.ceil(o / i) ? String(t + 1) : "";
} else d = l.length >= a ? String(t + 1) : "";
} else l = Array.isArray(c.data) ? c.data.map(e => Yt(e, o)).filter(Boolean) : [], 
d = c.nextPageCursor || "";
const m = l.filter(e => !h.inventorySeenIds.has(e.id) && (h.inventorySeenIds.add(e.id), 
!0));
let y = m;
if (m.length > 0) try {
y = u ? await jt(m) : await Ht(m);
} catch (e) {
y = m;
}
if (n()) return;
h.inventoryItems = [ ...h.inventoryItems, ...y ], t = y.length > 0, h.inventoryTypeCursors[o] = d, 
d || (h.inventoryTypeIndex += 1), h.inventoryHasMore = h.inventoryTypeIndex < h.inventoryTypeIds.length;
}
} catch (e) {
n() || (xt("Failed to load inventory for this section.", e.message || "Unknown inventory error"), 
h.inventoryHasMore = !1);
} finally {
t === w && (h.loadingInventory = !1, It(o));
}
}
async function ar(e) {
const t = h.avatarPreviewUrl;
try {
h.avatarPreviewUrl = await _t(e);
} catch (e) {}
return h.previewBust = Date.now(), h.avatarPreviewUrl !== t;
}
function or() {
v && window.clearInterval(v), v = window.setInterval(async () => {
if (!h.user || h.loadingProfile || h.saving || document.hidden) return;
let e = !1;
try {
const t = await Pt(), r = at(t);
r && r !== Ce && (ct(t), e = !0);
} catch (e) {}
let t = !1;
"2d" === h.previewMode && (t = await ar(h.user.id)), e || "2d" === h.previewMode && t ? "3d" === h.previewMode ? (At(), 
e && It(Nt()), mt()) : It(Nt()) : "3d" !== h.previewMode || le || mt();
}, 6e3);
}
async function sr() {
h.loadingProfile = !0, St(), E(), q(), K(), H(), Cr();
try {
const [e, t] = await Promise.all([ Ut("https://users.roblox.com/v1/users/authenticated"), Pt(), et() ]);
h.user = e, ct(t), await ar(e.id), or(), At(), ae(), rr(), await nr(!0);
} catch (e) {
xt("Could not load Roblox avatar data. Make sure you are logged in and reload.");
} finally {
h.loadingProfile = !1, Cr();
}
}
async function ir(e) {
if (h.user && !h.saving && ("R15" === e || "R6" === e)) {
h.saving = !0, St(), Cr();
try {
try {
await Ot("https://avatar.roblox.com/v2/avatar/set-player-avatar-type", {
playerAvatarType: e
}, {
includeBoundAuth: !0
});
} catch (t) {
await Ot("https://avatar.roblox.com/v1/avatar/set-player-avatar-type", {
playerAvatarType: e
}, {
includeBoundAuth: !0
});
}
ct(await Pt()), await ar(h.user.id), At();
} catch (e) {
xt("Could not change avatar type.", e.details || e.message || "Unknown error");
} finally {
h.saving = !1, Cr();
}
}
}
async function cr(e) {
if (h.saving || !h.user) return;
h.saving = !0, St();
const t = Nt();
It(t);
try {
const t = h.inventoryItems.find(t => t.id === e) || null, n = new Set(h.wornAssetIds), a = n.has(e), o = ot(t?.meta);
if (a) n.delete(e); else {
if (t && r.has(t.type) && Object.entries(h.wornAssetTypeById).forEach(([r, a]) => {
const o = Number(r);
o !== e && a === t.type && n.delete(o);
}), t) {
const r = Ft(t.type);
Object.entries(h.wornAssetTypeById).forEach(([t, a]) => {
const o = Number(t);
o !== e && Ft(a) === r && n.delete(o);
});
}
n.add(e);
}
let s = new Set(n);
try {
await Ot("https://avatar.roblox.com/v2/avatar/set-wearing-assets", {
assets: [ ...s ].map(t => it(t, t === e ? o : null)).filter(Boolean)
}, {
includeBoundAuth: !0
});
} catch (r) {
if (!Bt(r) || !t) throw r;
const n = Ft(t.type);
Object.entries(h.wornAssetTypeById).forEach(([t, r]) => {
const a = Number(t);
a !== e && Ft(r) === n && s.delete(a);
}), await Ot("https://avatar.roblox.com/v2/avatar/set-wearing-assets", {
assets: [ ...s ].map(t => it(t, t === e ? o : null)).filter(Boolean)
}, {
includeBoundAuth: !0
});
}
const i = await Pt();
ct(i), Array.isArray(i.assets) || (h.wornAssetIds = [ ...s ], h.wornAssetMetaById = [ ...s ].reduce((t, r) => {
const n = ot(r === e ? o : h.wornAssetMetaById[r]);
return n && (t[r] = n), t;
}, {})), await ar(h.user.id), a || R(e, t), At();
} catch (e) {
xt("Could not apply outfit change for this item.", e.details || e.message || "Unknown error");
} finally {
h.saving = !1, It(t);
}
}
async function lr(e) {
const t = Number(e);
if (!h.user || h.saving || !Number.isFinite(t) || t <= 0) return;
h.saving = !0, St();
const r = Nt();
It(r);
try {
const r = h.inventoryItems.find(e => [ e?.userOutfitId, e?.id, e?.outfitId ].map(e => Number(e || 0)).includes(t)), n = [ {
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
let a = !1, o = null;
for (const t of n) try {
await gr(t.url, t.body), a = !0;
break;
} catch (e) {
o = e;
}
if (!a) {
const r = [ `https://avatar.roblox.com/v1/outfits/${t}/details`, `https://avatar.roblox.com/v1/outfits/${t}` ], n = async () => {
let e = null;
for (const t of r) try {
const r = await Fe(t, {
method: "GET",
accept: "application/json, text/plain;q=0.9, */*;q=0.8",
usePageFetch: !0
});
if ("string" == typeof r?.csrfToken && r.csrfToken && (h.csrfToken = r.csrfToken), 
"string" == typeof r?.boundAuthToken && r.boundAuthToken && (h.boundAuthToken = r.boundAuthToken), 
!r?.ok) {
e = new Error(`Request failed (${Number(r?.status) || 0}): ${t}`), e.details = String(r?.text || "");
continue;
}
const n = String(r?.text || "").trim();
if (!n.startsWith("{")) continue;
return JSON.parse(n);
} catch (t) {
e = t;
}
throw e || new Error("Could not load outfit details.");
};
try {
const r = await n(), o = (Array.isArray(r?.assets) ? r.assets : Array.isArray(r?.outfit?.assets) ? r.outfit.assets : []).map(e => {
const t = Number(e?.id || e?.assetId || 0);
return Number.isFinite(t) && t > 0 ? it(t, e?.meta, !1) : null;
}).filter(Boolean);
let s = !1;
o.length > 0 && (await gr("https://avatar.roblox.com/v2/avatar/set-wearing-assets", {
assets: o
}), s = !0);
const i = r?.scales || r?.scale || r?.outfit?.scales || r?.outfit?.scale || null;
if (i && "object" == typeof i) {
const e = d.reduce((e, t) => (void 0 === i[t] || null === i[t] || (e[t] = Wt(i[t], y[t])), 
e), {});
if (Object.keys(e).length > 0) {
try {
await gr("https://avatar.roblox.com/v1/avatar/set-scales", e);
} catch (t) {
await gr("https://avatar.roblox.com/v2/avatar/set-scales", e);
}
s = !0;
}
}
const c = r?.bodyColor3s || r?.bodyColors || r?.outfit?.bodyColor3s || r?.outfit?.bodyColors || null;
if (c && "object" == typeof c) {
const t = tt(c.torsoColor3 ?? c.torsoColor ?? c.torsoColorId, "f2d5c7").toUpperCase(), r = tt(c.headColor3 ?? c.headColor ?? c.headColorId, t).toUpperCase(), n = tt(c.rightArmColor3 ?? c.rightArmColor ?? c.rightArmColorId, t).toUpperCase(), a = tt(c.leftArmColor3 ?? c.leftArmColor ?? c.leftArmColorId, t).toUpperCase(), o = tt(c.rightLegColor3 ?? c.rightLegColor ?? c.rightLegColorId, t).toUpperCase(), i = tt(c.leftLegColor3 ?? c.leftLegColor ?? c.leftLegColorId, t).toUpperCase(), l = {
headColor3: `#${r}`,
torsoColor3: `#${t}`,
rightArmColor3: `#${n}`,
leftArmColor3: `#${a}`,
rightLegColor3: `#${o}`,
leftLegColor3: `#${i}`
}, d = {
headColor: r,
torsoColor: t,
rightArmColor: n,
leftArmColor: a,
rightLegColor: o,
leftLegColor: i
};
try {
await gr("https://avatar.roblox.com/v2/avatar/set-body-colors", l);
} catch (e) {
await gr("https://avatar.roblox.com/v1/avatar/set-body-colors", d);
}
s = !0;
}
s && (a = !0);
} catch (e) {
o = e;
}
}
if (!a) throw o || new Error("Could not wear selected outfit.");
const s = await Pt();
ct(s), h.currentOutfitId = Number(s?.currentOutfitId || t) || t, F({
id: t,
userOutfitId: t,
outfitId: t,
name: r?.name || `Outfit ${t}`,
thumbnailUrl: r?.thumbnailUrl || ""
}), await ar(h.user.id), "3d" === h.previewMode && At();
} catch (e) {
xt("Could not apply this avatar outfit.", e.details || e.message || "Unknown error");
} finally {
h.saving = !1, It(r);
}
}
function dr(e = "", t = {}) {
const r = Dt(), n = !1 !== t.includeName, a = String(e || "").trim(), o = Array.isArray(r?.assetIds) ? r.assetIds : [], s = Array.isArray(r?.assets) && r.assets.length > 0 ? r.assets : [], i = {
assets: s.length > 0 ? s : void 0,
assetIds: o.length > 0 ? o : void 0,
bodyColors: r?.bodyColors || void 0,
scales: r?.scales || void 0,
scale: r?.scales || void 0,
playerAvatarType: r?.playerAvatarType || h.avatarType
};
return n && a && (i.name = a), i;
}
function ur(e = "") {
const t = Dt();
return {
name: String(e || "").trim(),
bodyColor3s: t?.bodyColor3s || void 0,
assets: Array.isArray(t?.richAssets) && t.richAssets.length > 0 ? t.richAssets : t?.assets,
scale: t?.scales || void 0,
playerAvatarType: t?.playerAvatarType || h.avatarType
};
}
function mr(e = {}) {
const t = Dt(), r = e?.bodyColor3s && "object" == typeof e.bodyColor3s ? e.bodyColor3s : {}, n = t?.bodyColor3s && "object" == typeof t.bodyColor3s ? t.bodyColor3s : {}, a = {
headColor3: Vt(r.headColor3 ?? r.headColor ?? n.headColor3),
torsoColor3: Vt(r.torsoColor3 ?? r.torsoColor ?? n.torsoColor3),
rightArmColor3: Vt(r.rightArmColor3 ?? r.rightArmColor ?? n.rightArmColor3),
leftArmColor3: Vt(r.leftArmColor3 ?? r.leftArmColor ?? n.leftArmColor3),
rightLegColor3: Vt(r.rightLegColor3 ?? r.rightLegColor ?? n.rightLegColor3),
leftLegColor3: Vt(r.leftLegColor3 ?? r.leftLegColor ?? n.leftLegColor3)
}, o = e?.scale && "object" == typeof e.scale ? e.scale : e?.scales && "object" == typeof e.scales ? e.scales : {}, s = t?.scales && "object" == typeof t.scales ? t.scales : {}, i = d.reduce((e, t) => (e[t] = Wt(o?.[t] ?? s?.[t], y[t] ?? 0), 
e), {}), c = e => {
const t = Number(e?.id || e?.assetId || 0);
if (!Number.isFinite(t) || t <= 0) return null;
const r = {
id: t
}, n = String(e?.name || "").trim();
n && (r.name = n);
const a = Number(e?.currentVersionId || e?.versionId || 0);
Number.isFinite(a) && a > 0 && (r.currentVersionId = a);
const o = Number(e?.assetType?.id ?? e?.assetTypeId ?? e?.assetType ?? 0), s = Lt(e?.assetType?.name || e?.assetTypeName || o || h.wornAssetTypeById[t] || "");
const i = ot(e?.meta) || ot(h.wornAssetMetaById[t]);
return (Number.isFinite(o) && o > 0 || s && "Asset" !== s) && (r.assetType = {}, 
Number.isFinite(o) && o > 0 && (r.assetType.id = o), s && "Asset" !== s && (r.assetType.name = s)), 
i && (r.meta = i), r;
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
async function yr() {
try {
return await gr("https://avatar.roblox.com/v2/avatar/avatar", void 0, {
method: "GET"
});
} catch (e) {
try {
return await Pt();
} catch (t) {
throw t.details || !e?.details && !e?.message || (t.details = e.details || e.message), 
t;
}
}
}
async function pr(e) {
const t = Number(e);
if (!h.user || h.saving || !Number.isFinite(t) || t <= 0) return;
if (!(await kt({
mode: "confirm",
title: "Update Avatar Outfit",
message: "Update this outfit with your current avatar appearance?",
confirmText: "Update",
cancelText: "Cancel"
})).confirmed) return;
h.saving = !0, St();
const r = Nt();
It(r);
try {
const e = mr(await yr());
if (!Array.isArray(e.assets) || e.assets.length < 1) throw new Error("Could not build update payload from current avatar.");
await gr(`https://avatar.roblox.com/v3/outfits/${t}`, e, {
method: "PATCH"
}), "Avatars" === h.activeCategory && "Created" === h.activeSubcategory && (rr(), 
await nr(!0));
} catch (e) {
xt("Could not update this avatar outfit.", e.details || e.message || "Unknown error");
} finally {
h.saving = !1, It(r);
}
}
async function fr(e) {
const t = Number(e);
if (!h.user || h.saving || !Number.isFinite(t) || t <= 0) return;
if (!(await kt({
mode: "confirm",
title: "Delete Avatar Outfit",
message: "Delete this avatar outfit? This cannot be undone.",
confirmText: "Delete",
cancelText: "Cancel"
})).confirmed) return;
h.saving = !0, St();
const r = Nt();
It(r);
try {
const r = [ {
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
let n = !1, a = null;
for (const t of r) try {
await gr(t.url, t.body, {
method: t.method
}), n = !0;
break;
} catch (e) {
a = e;
}
if (!n) throw a || new Error("Could not delete avatar outfit.");
const o = N("outfit", t);
o && (delete h.recentlyEquippedTimestamps[o], delete h.recentItemMetadata[o], k()), 
"Avatars" === h.activeCategory && "Created" === h.activeSubcategory && (rr(), await nr(!0));
} catch (e) {
xt("Could not delete this avatar outfit.", e.details || e.message || "Unknown error");
} finally {
h.saving = !1, It(r);
}
}
async function hr() {
if (!h.user || h.saving) return;
const e = `Avatar ${(new Date).toISOString().slice(0, 10)}`, t = await kt({
mode: "prompt",
title: "Design Avatar Outfit",
message: "Choose a name for your new avatar outfit.",
confirmText: "Establish",
cancelText: "Cancel",
defaultValue: e,
placeholder: "Avatar name"
});
if (!t.confirmed) return;
const r = String(t.value || "").trim() || e;
h.saving = !0, St();
const n = Nt();
It(n);
try {
const t = ur(r), n = dr(r, {
includeName: !0
}), a = [ {
endpoint: "https://avatar.roblox.com/v3/outfits/create",
body: t
}, {
endpoint: "https://avatar.roblox.com/v3/outfits/create",
body: {
name: r,
bodyColor3s: t.bodyColor3s,
assets: n.assets,
scale: t.scale,
playerAvatarType: t.playerAvatarType
}
}, {
endpoint: "https://avatar.roblox.com/v2/outfits/create",
body: {
name: r,
assets: n.assets,
assetIds: n.assetIds,
bodyColors: n.bodyColors,
scales: n.scales,
playerAvatarType: n.playerAvatarType
}
}, {
endpoint: "https://avatar.roblox.com/v1/outfits/create",
body: {
name: r,
assets: n.assets,
assetIds: n.assetIds,
bodyColors: n.bodyColors,
scales: n.scales,
playerAvatarType: n.playerAvatarType
}
}, {
endpoint: "https://avatar.roblox.com/v1/outfits",
body: {
name: r,
assets: n.assets,
assetIds: n.assetIds,
bodyColors: n.bodyColors,
scales: n.scales,
playerAvatarType: n.playerAvatarType
}
} ];
let o = null, s = null;
for (const t of a) try {
o = await gr(t.endpoint, t.body);
break;
} catch (e) {
s = e;
}
if (!o) throw s || new Error("Could not make new avatar outfit.");
"Avatars" === h.activeCategory && "Created" === h.activeSubcategory && (rr(), await nr(!0));
} catch (e) {
xt("Could not create a new avatar.", e.details || e.message || "Unknown error");
} finally {
h.saving = !1, It(n);
}
}
async function gr(e, t, r = {}) {
let n = null;
for (const a of [ !0, !1 ]) try {
return await Ot(e, t, {
...r,
includeBoundAuth: a
});
} catch (e) {
n = e;
}
throw n || new Error("Roblox API request failed.");
}
function vr() {
const r = Object.keys(e[h.activeCategory] || {}), n = r.length > 1, a = "Avatars" === h.activeCategory && "Created" === h.activeSubcategory;
const o = r.map(e => `<button class="bar-button ${h.activeSubcategory === e ? "bar-button-selected" : ""}" data-subcategory="${e}">${e}</button>`).join("");
return `\n    <div class="bar-category">\n      ${t.map(e => `<button class="bar-button ${h.activeCategory === e ? "bar-button-selected" : ""}" data-category="${e}">${e}</button>`).join("")}\n    </div>\n    ${n ? a ? `<div class="bar-row">\n      <div class="bar-category bar-double-margin bar-subcategory-wrap">\n        ${o}\n      </div>\n      <button id="create-avatar-outfit" class="avatar-create-button" type="button" title="New Avatar Outfit" aria-label="New Avatar Outfit" ${h.saving ? "disabled" : ""}><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg></button>\n    </div>` : `<div class="bar-category bar-double-margin">\n      ${o}\n    </div>` : ""}\n  `;
}
function br() {
const e = {
height: "Height",
width: "Width",
head: "Head",
depth: "Depth",
proportion: "Proportion",
bodyType: "Body Type"
};
return `\n    <div class="body-controls-panel">\n      <p class="body-controls-title">Scale</p>\n      <p class="body-controls-subtitle">Adjust your avatar body scale and save.</p>\n      ${d.map(t => {
const r = Gt(t), n = Jt(t);
return `\n            <label class="body-scale-row" for="scale-${t}">\n              <span class="body-scale-label">${e[t] || t}</span>\n              <div class="body-scale-inputs">\n                <input\n                  id="scale-${t}"\n                  class="body-scale-slider"\n                  type="range"\n                  min="0"\n                  max="1"\n                  step="0.01"\n                  value="${r.toFixed(2)}"\n                  ${h.saving ? "disabled" : ""}\n                />\n                <input\n                  id="scale-number-${t}"\n                  class="body-scale-number"\n                  type="number"\n                  min="0"\n                  max="1"\n                  step="0.01"\n                  value="${r.toFixed(2)}"\n                  ${h.saving ? "disabled" : ""}\n                />\n              </div>\n              <span class="body-scale-value" id="scale-value-${t}">${r.toFixed(2)}</span>\n              <button class="body-scale-revert" data-scale-revert="${t}" ${h.saving ? "disabled" : ""}>Prev ${n.toFixed(2)}</button>\n            </label>\n          `;
}).join("")}\n      <button id="save-body-scale" class="body-control-save" ${h.saving ? "disabled" : ""}>Save Scale</button>\n    </div>\n  `;
}
function wr() {
const e = Kt(h.avatarDefinition?.bodyColors?.headColor || "F2D5C7"), t = e.selectedTone, r = h.searchTerm.trim().toLowerCase(), n = e.entries.filter(e => !r || `${e.name} ${e.type} ${e.tone}`.toLowerCase().includes(r));
return n.length < 1 ? '<p class="status-line">No skin color matches your search.</p>' : `\n    <div class="skin-tone-custom-row">\n      <label class="skin-tone-custom-label" for="custom-skin-tone-hex">Custom Hex</label>\n      <div class="skin-tone-custom-controls">\n        <input id="custom-skin-tone-hex" class="skin-tone-custom-input" type="text" maxlength="7" placeholder="#564236" value="#${t}" ${h.saving ? "disabled" : ""} />\n        <input id="custom-skin-tone-picker" class="skin-tone-custom-picker" type="color" value="#${t}" ${h.saving ? "disabled" : ""} />\n        <button id="apply-custom-skin-tone" class="skin-tone-custom-apply" type="button" ${h.saving ? "disabled" : ""}>Apply</button>\n      </div>\n    </div>\n    <div class="item-container skin-tone-item-container">\n      ${n.map(e => {
const r = t === e.tone;
return `\n            <article class="item skin-tone-item">\n              <button\n                class="item-image skin-tone-item-image ${r ? "equipped" : ""}"\n                data-skin-tone="${e.tone}"\n                title="${Y(e.name)}"\n                ${h.saving ? "disabled" : ""}\n              >\n                <div class="skin-tone-item-fill" style="background:#${e.tone};"></div>\n                <span class="worn-item-check" ${r ? "" : 'style="opacity:0"'}>✓</span>\n              </button>\n              <div class="item-name">${Y(e.name)}</div>\n              <div class="item-subtext">${Y(`${e.type} | #${e.tone}`)}</div>\n            </article>\n          `;
}).join("")}\n    </div>\n  `;
}
function Ar() {
if (te()) return br();
if (re()) return wr();
const e = ne();
return "Head" === h.activeCategory && "Faces" === h.activeSubcategory ? '\n      <div class="empty-state empty-state-illustrated">\n        <svg class="empty-icon gravestone-icon" width="100%" viewBox="0 0 680 480" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n          <style>\n            .stone-fill { fill: #7a7a7a; }\n            .stone-dark { fill: #5c5c5c; }\n            .stone-light { fill: #9e9e9e; }\n            .ground { fill: #4a5a3a; }\n            .grass { fill: #5c7048; }\n            .moss { fill: #6b7c4e; opacity: 0.5; }\n            .engraved { fill: none; stroke: #444; stroke-width: 1.2; }\n            .text-stone { font-family: Georgia, serif; fill: #3a3a3a; text-anchor: middle; }\n            .crack { stroke: #555; stroke-width: 0.8; fill: none; opacity: 0.6; }\n          </style>\n          <rect x="160" y="390" width="360" height="60" rx="4" class="ground"/>\n          <ellipse cx="220" cy="390" rx="20" ry="8" class="grass"/>\n          <ellipse cx="270" cy="388" rx="14" ry="6" class="grass"/>\n          <ellipse cx="400" cy="389" rx="18" ry="7" class="grass"/>\n          <ellipse cx="460" cy="390" rx="22" ry="8" class="grass"/>\n          <ellipse cx="340" cy="391" rx="10" ry="5" class="grass"/>\n          <rect x="230" y="370" width="220" height="32" rx="3" class="stone-dark"/>\n          <rect x="232" y="370" width="216" height="6" rx="2" class="stone-light" opacity="0.4"/>\n          <path d="M255 370 L255 140 Q255 100 295 95 L340 88 L385 95 Q425 100 425 140 L425 370 Z" fill="#4e4e4e"/>\n          <path d="M250 370 L250 142 Q250 100 290 94 L340 86 L390 94 Q430 100 430 142 L430 370 Z" class="stone-fill"/>\n          <path d="M250 370 L250 142 Q250 100 290 94 L305 92 L305 370 Z" fill="#8c8c8c" opacity="0.35"/>\n          <path d="M270 350 L270 165 Q270 130 305 120 L340 115 L375 120 Q410 130 410 165 L410 350 Z" class="engraved"/>\n          <rect x="332" y="128" width="16" height="52" rx="2" fill="#555"/>\n          <rect x="316" y="144" width="48" height="14" rx="2" fill="#555"/>\n          <ellipse cx="260" cy="280" rx="12" ry="18" class="moss"/>\n          <ellipse cx="420" cy="310" rx="10" ry="14" class="moss"/>\n          <ellipse cx="265" cy="350" rx="8" ry="10" class="moss"/>\n          <path d="M385 200 L380 230 L383 255 L378 290" class="crack"/>\n          <text x="340" y="205" class="text-stone" font-size="15" font-weight="700" letter-spacing="2">R.I.P</text>\n          <text x="340" y="232" class="text-stone" font-size="13" font-style="italic">Here Lies</text>\n          <text x="340" y="255" class="text-stone" font-size="16" font-weight="700" letter-spacing="1">Classic Faces</text>\n          <line x1="285" y1="264" x2="395" y2="264" stroke="#555" stroke-width="0.8"/>\n          <text x="340" y="283" class="text-stone" font-size="11">2004 - 2026</text>\n          <text x="340" y="308" class="text-stone" font-size="10" font-style="italic">&quot;Removed by Roblox.&quot;</text>\n        </svg>\n        <p class="empty-title">2D Faces Removed</p>\n        <p class="status-line">Roblox removed classic faces in favor of Dynamic Heads.</p>\n      </div>\n    ' : h.loadingProfile ? '<p class="status-line">Loading profile...</p>' : "Recent" !== h.activeCategory || 0 !== e.length || h.loadingInventory ? 0 !== e.length || h.loadingInventory ? `\n    <div class="item-container">\n      ${e.map(e => {
const t = "Outfit" === e.type, r = Number(e.userOutfitId || e.id || e.outfitId || 0), n = t ? h.currentOutfitId === r || h.currentOutfitId === Number(e.id) || h.currentOutfitId === Number(e.outfitId) : h.wornAssetIds.includes(e.id), a = t && "Avatars" === h.activeCategory, o = t ? a ? "" : "Avatar Outfit" : Rt(e.type), s = t ? `data-outfit-id="${r}"` : `data-asset-id="${e.id}"`, i = t && "Avatars" === h.activeCategory && "Created" === h.activeSubcategory;
return `\n            <article class="item">\n              <button class="item-image ${n ? "equipped" : ""}" ${s} ${"Recent" === h.activeCategory && e.recentKey ? `data-recent-key="${Y(e.recentKey)}"` : ""} ${h.saving ? "disabled" : ""}>\n                ${e.thumbnailUrl ? `<img src="${Y(e.thumbnailUrl)}" alt="${Y(e.name)}" />` : '<div class="item-loading"></div>'}\n                <span class="worn-item-check" ${n ? "" : 'style="opacity:0"'}>✓</span>\n              </button>\n              <div class="item-name">${Y(e.name)}</div>\n              ${o ? `<div class="item-subtext">${Y(o)}</div>` : ""}\n              ${i ? `<div class="item-actions-row">\n                    <button class="item-secondary-action" type="button" data-avatar-outfit-update="${r}" ${h.saving ? "disabled" : ""}>Update</button>\n                    <button class="item-secondary-action danger" type="button" data-avatar-outfit-delete="${r}" ${h.saving ? "disabled" : ""}>Delete</button>\n                  </div>` : ""}\n            </article>\n          `;
}).join("")}\n      ${h.loadingInventory ? '<div class="grid-loading">Loading more...</div>' : ""}\n      <div id="inventory-sentinel" class="inventory-sentinel"></div>\n    </div>\n  ` : '\n      <div class="empty-state empty-state-illustrated">\n        <svg class="empty-file-icon" width="100%" viewBox="0 0 680 340" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n          <path d="M255 40 L375 40 L425 90 L425 250 Q425 258 417 258 L263 258 Q255 258 255 250 Z" fill="#252536" stroke="#3f3f5c" stroke-width="1.5"/>\n          <path d="M375 40 L425 90 L375 90 Z" fill="#1c1c2b" stroke="#3f3f5c" stroke-width="1.5"/>\n\n          <rect x="278" y="110" width="108" height="8" rx="3" fill="#3a3a56"/>\n          <rect x="278" y="127" width="86" height="8" rx="3" fill="#3a3a56"/>\n          <rect x="278" y="144" width="98" height="8" rx="3" fill="#2e2e48"/>\n          <rect x="278" y="161" width="60" height="8" rx="3" fill="#28283e" opacity="0.6"/>\n          <rect x="278" y="178" width="80" height="8" rx="3" fill="#24243a" opacity="0.3"/>\n\n          <text x="340" y="296" font-family="\'Helvetica Neue\', Arial, sans-serif" font-size="20" font-weight="700" fill="#e0ddf5" text-anchor="middle">File not found</text>\n          <text x="340" y="318" font-family="\'Helvetica Neue\', Arial, sans-serif" font-size="13" fill="#55527a" text-anchor="middle">You do not own any asset of this type.</text>\n        </svg>\n      </div>\n    ' : '\n      <div class="empty-state empty-state-illustrated">\n        <svg class="recent-empty-icon" width="100%" viewBox="0 0 680 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n          <defs>\n            <style>\n              .th { font-family: sans-serif; font-size: 14px; font-weight: 500; fill: #888; }\n            </style>\n          </defs>\n          <circle cx="340" cy="80" r="32" fill="none" stroke="#ccc" stroke-width="2.5"/>\n          <line x1="362" y1="103" x2="380" y2="121" stroke="#ccc" stroke-width="2.5" stroke-linecap="round"/>\n          <text x="340" y="148" text-anchor="middle" class="th">No recent items recorded.</text>\n        </svg>\n      </div>\n    ';
}
function Cr() {
O();
const e = document.getElementById("app"), t = "3d" === h.previewMode && le?.domElement ? le.domElement : null, r = h.avatarPreviewUrl ? `${h.avatarPreviewUrl}${h.avatarPreviewUrl.includes("?") ? "&" : "?"}t=${h.previewBust}` : "", n = h.recentContextMenu ? Math.max(8, Math.min(Number(h.recentContextMenu.x || 0), window.innerWidth - 196)) : 0, a = h.recentContextMenu ? Math.max(8, Math.min(Number(h.recentContextMenu.y || 0), window.innerHeight - 236)) : 0, o = "3d" === h.previewMode ? "Switch to 2D" : "Switch to 3D", s = "3d" === h.previewMode ? "2D" : "3D";
if (e.innerHTML = `\n    <main class="main">\n      <section class="main-left">\n        <div class="main-left-top">\n          <button class="left-top-button icon-button" id="reload-all" type="button" title="Refresh" aria-label="Refresh">\n            <svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true">\n              <path d="M20 11a8 8 0 1 0-2.34 5.66" />\n              <path d="M20 4v7h-7" />\n            </svg>\n          </button>\n        </div>\n        <div class="avatar-preview">\n          ${"2d" === h.previewMode ? r ? `<img class="avatar-preview-image" src="${Y(r)}" alt="Avatar snapshot" />` : '<div class="avatar-preview-image avatar-preview-image-empty"></div>' : ""}\n          <canvas id="avatar-canvas-3d" class="${"3d" === h.previewMode ? "" : "preview-surface-hidden"}"></canvas>\n          <div id="preview-loading-overlay" class="preview-loading-overlay ${"3d" === h.previewMode && h.preview3DLoading ? "active" : ""}" aria-hidden="true">\n            <div class="preview-loading-dots">\n              <span class="preview-loading-dot"></span>\n              <span class="preview-loading-dot"></span>\n              <span class="preview-loading-dot"></span>\n            </div>\n          </div>\n          <div id="preview-rate-limited-overlay" class="preview-rate-limited-overlay ${"3d" === h.previewMode && h.previewRateLimited ? "active" : ""}" aria-live="polite">\n            <div class="preview-rate-limited-face">:(</div>\n            <div class="preview-rate-limited-title">Rate Limited</div>\n            <div class="preview-rate-limited-subtitle">Trying again in 10 seconds...</div>\n          </div>\n          <button class="preview-mode-toggle" id="preview-mode-toggle" type="button" title="${o}" aria-label="${o}">\n            ${s}\n          </button>\n        </div>\n        <div class="preview-meta">\n          <span>${Y(h.user?.name || "Avatar")}</span>\n          <div class="avatar-type-selector">\n            <button class="avatar-type-btn ${"R15" === h.avatarType ? "avatar-type-active" : ""}" data-avatar-type="R15">R15</button>\n            <button class="avatar-type-btn ${"R6" === h.avatarType ? "avatar-type-active" : ""}" data-avatar-type="R6">R6</button>\n          </div>\n        </div>\n      </section>\n\n      <section class="main-right">\n        ${vr()}\n        <div class="search-row">\n          <input id="inventory-search" class="inventory-search" type="text" placeholder="Search this category" value="${Y(h.searchTerm)}" autocomplete="off" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" />\n        </div>\n        <div class="container inventory-scroll-root">\n          ${Ar()}\n        </div>\n      </section>\n    </main>\n    ${h.toastOpen ? `\n      <div class="error-popup ${h.toastClosing ? "closing" : ""}" role="alert">\n        <button class="error-popup-close" id="error-popup-close" aria-label="Close error">x</button>\n        <div class="error-popup-title">${Y(h.toastMessage)}</div>\n        ${h.toastDetails ? `<pre class="error-popup-details">${Y(h.toastDetails)}</pre>` : ""}\n      </div>\n    ` : ""}\n    ${h.recentContextMenu ? `\n      <button id="recent-context-menu-backdrop" class="recent-context-menu-backdrop" aria-label="Close menu"></button>\n      <div id="recent-context-menu" class="recent-context-menu" style="left:${n}px;top:${a}px;" role="menu" aria-label="Recent item actions">\n        <button class="recent-context-menu-item" data-recent-action="move-top" data-recent-key="${Y(h.recentContextMenu.key)}" role="menuitem">Move to Top</button>\n        <button class="recent-context-menu-item" data-recent-action="move-up" data-recent-key="${Y(h.recentContextMenu.key)}" role="menuitem">Move Up</button>\n        <button class="recent-context-menu-item" data-recent-action="move-down" data-recent-key="${Y(h.recentContextMenu.key)}" role="menuitem">Move Down</button>\n        <button class="recent-context-menu-item" data-recent-action="move-bottom" data-recent-key="${Y(h.recentContextMenu.key)}" role="menuitem">Move to Bottom</button>\n        <hr class="recent-context-menu-divider" />\n        <button class="recent-context-menu-item danger" data-recent-action="remove" data-recent-key="${Y(h.recentContextMenu.key)}" role="menuitem">Remove from Recents</button>\n      </div>\n    ` : ""}\n    ${h.actionDialog ? `\n      <button id="action-dialog-backdrop" class="action-dialog-backdrop" aria-label="Close dialog"></button>\n      <div id="action-dialog" class="action-dialog" role="dialog" aria-modal="true" aria-label="${Y(h.actionDialog.title || "Action")}">\n        <div class="action-dialog-title">${Y(h.actionDialog.title || "Action")}</div>\n        ${h.actionDialog.message ? `<p class="action-dialog-message">${Y(h.actionDialog.message)}</p>` : ""}\n        ${"prompt" === h.actionDialog.mode ? `<input id="action-dialog-input" class="action-dialog-input" type="text" value="${Y(h.actionDialog.defaultValue || "")}" placeholder="${Y(h.actionDialog.placeholder || "")}" maxlength="80" autocomplete="off" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" />` : ""}\n        <div class="action-dialog-actions">\n          <button id="action-dialog-cancel" class="action-dialog-button secondary" type="button">${Y(h.actionDialog.cancelText || "Cancel")}</button>\n          <button id="action-dialog-confirm" class="action-dialog-button primary" type="button">${Y(h.actionDialog.confirmText || "Confirm")}</button>\n        </div>\n      </div>\n    ` : ""}\n  `, 
"3d" === h.previewMode && t) {
const e = document.getElementById("avatar-canvas-3d");
if (e && e !== t) {
t.id = "avatar-canvas-3d", t.className = e.className, e.replaceWith(t);
const r = t.parentElement, n = Math.max(r?.clientWidth || 420, 1), a = Math.max(r?.clientHeight || 420, 1);
t.width = n, t.height = a, le && le.setSize(n, a, !1), ce && (ce.aspect = n / a, 
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
ae(), rr(), Cr(), await nr(!0));
});
}), document.querySelectorAll("[data-subcategory]").forEach(e => {
e.addEventListener("click", async () => {
const t = e.dataset.subcategory;
t && t !== h.activeSubcategory && (h.activeSubcategory = t, h.recentContextMenu = null, 
h.searchTerm = "", rr(), Cr(), await nr(!0));
});
});
const i = document.getElementById("inventory-search");
i && i.addEventListener("input", () => {
const e = Nt(), t = Number.isFinite(i.selectionStart) ? i.selectionStart : (i.value || "").length, r = Number.isFinite(i.selectionEnd) ? i.selectionEnd : t;
h.searchTerm = i.value || "", It(e);
const n = document.getElementById("inventory-search");
if (n) {
n.focus({
preventScroll: !0
});
const e = Math.max(0, Math.min(t, n.value.length)), a = Math.max(e, Math.min(r, n.value.length));
n.setSelectionRange(e, a);
}
}), document.querySelectorAll("[data-asset-id]").forEach(e => {
e.addEventListener("click", () => {
const t = Number(e.dataset.assetId);
Number.isNaN(t) || cr(t);
});
}), document.querySelectorAll("[data-outfit-id]").forEach(e => {
e.addEventListener("click", () => {
const t = Number(e.dataset.outfitId);
Number.isNaN(t) || lr(t);
});
}), document.querySelectorAll("[data-avatar-outfit-update]").forEach(e => {
e.addEventListener("click", t => {
t.preventDefault(), t.stopPropagation();
const r = Number(e.dataset.avatarOutfitUpdate);
Number.isNaN(r) || pr(r);
});
}), document.querySelectorAll("[data-avatar-outfit-delete]").forEach(e => {
e.addEventListener("click", t => {
t.preventDefault(), t.stopPropagation();
const r = Number(e.dataset.avatarOutfitDelete);
Number.isNaN(r) || fr(r);
});
}), document.querySelectorAll("[data-recent-key]").forEach(e => {
e.addEventListener("contextmenu", t => {
t.preventDefault();
const r = e.dataset.recentKey;
r && "Recent" === h.activeCategory && (h.recentContextMenu = {
key: r,
x: t.clientX,
y: t.clientY
}, It(Nt()));
});
}), document.querySelectorAll(".body-scale-slider").forEach(e => {
e.addEventListener("input", () => {
const t = (e.id || "").replace("scale-", ""), r = document.getElementById(`scale-value-${t}`), n = document.getElementById(`scale-number-${t}`);
if (r) {
const t = Number(e.value);
r.textContent = Number.isFinite(t) ? t.toFixed(2) : "0.00", n && (n.value = Number.isFinite(t) ? t.toFixed(2) : "0.00");
}
});
}), document.querySelectorAll(".body-scale-number").forEach(e => {
e.addEventListener("input", () => {
const t = (e.id || "").replace("scale-number-", ""), r = document.getElementById(`scale-value-${t}`), n = document.getElementById(`scale-${t}`), a = Wt(e.value, Gt(t));
n && (n.value = a.toFixed(2)), r && (r.textContent = a.toFixed(2));
});
}), document.querySelectorAll("[data-scale-revert]").forEach(e => {
e.addEventListener("click", () => {
const t = e.dataset.scaleRevert;
if (!t) return;
const r = Jt(t), n = document.getElementById(`scale-${t}`), a = document.getElementById(`scale-number-${t}`), o = document.getElementById(`scale-value-${t}`);
n && (n.value = r.toFixed(2)), a && (a.value = r.toFixed(2)), o && (o.textContent = r.toFixed(2));
});
});
const c = document.getElementById("save-body-scale");
c && c.addEventListener("click", () => {
Qt();
}), document.querySelectorAll("[data-skin-tone]").forEach(e => {
e.addEventListener("click", () => {
const t = e.dataset.skinTone;
t && Zt(t);
});
});
const l = document.getElementById("custom-skin-tone-hex"), d = document.getElementById("custom-skin-tone-picker"), u = document.getElementById("apply-custom-skin-tone");
l && d && (l.addEventListener("input", () => {
const e = l.value || "", t = `#${String(e).replace(/[^0-9a-fA-F]/g, "").replace(/^#+/, "").slice(0, 6)}`;
l.value = t, /^#[0-9a-fA-F]{6}$/.test(t) && (d.value = X(t));
}), d.addEventListener("input", () => {
l.value = `#${Vt(d.value || "")}`;
}));
const m = () => {
const e = l?.value || d?.value || "";
e && (Z(e), Zt(e));
};
u && u.addEventListener("click", () => {
m();
}), l && l.addEventListener("keydown", e => {
"Enter" === e.key && (e.preventDefault(), m());
});
const y = document.getElementById("reload-all");
y && y.addEventListener("click", () => {
sr();
});
const p = document.getElementById("recent-context-menu-backdrop");
p && p.addEventListener("click", () => {
h.recentContextMenu = null, It(Nt());
}), document.querySelectorAll("[data-recent-action]").forEach(e => {
e.addEventListener("click", async () => {
const t = e.dataset.recentAction, r = e.dataset.recentKey;
t && r && await D(t, r);
});
});
const f = document.getElementById("create-avatar-outfit");
f && f.addEventListener("click", () => {
hr();
});
const g = document.getElementById("preview-mode-toggle");
g && g.addEventListener("click", () => {
wt("3d" === h.previewMode ? "2d" : "3d");
}), document.querySelectorAll("[data-avatar-type]").forEach(e => {
e.addEventListener("click", () => {
const t = e.dataset.avatarType;
t && t !== h.avatarType && ir(t);
});
});
const v = document.getElementById("error-popup-close");
v && v.addEventListener("click", () => {
St(), Cr();
});
const b = document.getElementById("action-dialog-backdrop"), w = document.getElementById("action-dialog-cancel"), A = document.getElementById("action-dialog-confirm"), C = document.getElementById("action-dialog-input"), T = e => {
Et({
confirmed: e,
value: C ? String(C.value || "") : ""
}), It(Nt());
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
})), Tr(), yt(h.preview3DLoading), pt(h.previewRateLimited), !h.user || h.loadingProfile || "3d" !== h.previewMode || le || mt();
}
function Tr() {
g && (g.disconnect(), g = null);
const e = document.getElementById("inventory-sentinel"), t = document.querySelector(".inventory-scroll-root");
e && t && (g = new IntersectionObserver(e => {
const t = e[0];
t && t.isIntersecting && nr(!1);
}, {
root: t,
threshold: .2
}), g.observe(e));
}
se(), window.addEventListener("message", e => {
const t = e.data;
if (t) {
if ("PURPURA_FETCH_RESOURCE_RESPONSE" === t.type) {
const e = Ee.get(t.requestId);
if (!e) return;
return Ee.delete(t.requestId), void e.resolve({
ok: Boolean(t.ok),
status: Number(t.status) || 0,
contentType: t.contentType || "",
csrfToken: t.csrfToken || "",
boundAuthToken: t.boundAuthToken || "",
text: t.text || ""
});
}
"PURPURA_THEME" === t.type && (b = "light" === t.theme ? "light" : "dark", se()), 
"PURPURA_THREE_URLS" === t.type && (he = t.threeUrl, ge = t.gltfLoaderUrl, ve = t.mtlLoaderUrl, 
be = t.orbitControlsUrl, we = t.objLoaderUrl, fe = !0), "PURPURA_AUTH_HEADERS" === t.type && ("string" == typeof t.csrfToken && t.csrfToken && (h.csrfToken = t.csrfToken), 
"string" == typeof t.boundAuthToken && t.boundAuthToken && (h.boundAuthToken = t.boundAuthToken));
}
}), Cr(), sr();
})();
