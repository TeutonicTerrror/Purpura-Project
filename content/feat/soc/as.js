/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
"use strict";
if (window.purpuraAvatarSearchInitialized) return;
window.purpuraAvatarSearchInitialized = true;
let e = {
enabled: true,
filters: true
};
let t = null;
let a = null;
let r = new Map;
let n = new WeakMap;
let i = new Set;
let s = {
min: {
active: false,
value: null
},
max: {
active: false,
value: null
}
};
let o = "all";
let u = {
active: false,
name: ""
};
let l = "";
let c = 0;
let p = null;
let d = new Set;
let f = null;
let m = [];
let g = null;
let h = new WeakSet;
let b = false;
let x = null;
const v = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
function y() {
if (document.getElementById("purpura-as-vars")) return;
var e = document.createElement("style");
e.id = "purpura-as-vars";
e.textContent = ":root{" + "--purpura-as-accent:#9b6dff;" + "--purpura-as-accent-light:#b89dff;" + "--purpura-as-accent-hover:#8a5cef;" + "--purpura-as-accent-bg:rgba(155,109,255,0.12);" + "--purpura-as-accent-glow:rgba(155,109,255,0.15);" + "--purpura-as-accent-border:rgba(155,109,255,0.4);" + "--purpura-as-surface-1:#1a1b1f;" + "--purpura-as-surface-2:#25262a;" + "--purpura-as-text:#f0f0f0;" + "--purpura-as-text-muted:#999;" + "--purpura-as-stroke:rgba(255,255,255,0.1);" + "--purpura-as-stroke-light:rgba(255,255,255,0.08);" + "--purpura-as-stroke-lighter:rgba(255,255,255,0.07);" + "--purpura-as-toggle-knob:#fff;" + "--purpura-as-toggle-knob-shadow:rgba(0,0,0,0.3);" + "--purpura-as-dropdown-shadow:rgba(0,0,0,0.5);" + "--purpura-as-toggle-bg:#2a2b36;" + "--purpura-as-placeholder:#888;" + "--purpura-as-btn-text:#fff;" + "--purpura-as-loading-bg:rgba(0,0,0,0.8);" + "--purpura-as-loading-text:white}";
document.head.appendChild(e);
}
function w(e) {
if (typeof e === "boolean") return {
enabled: e,
filters: true
};
if (e && typeof e === "object") return {
enabled: e.enabled !== false,
filters: e.filters !== false
};
return {
enabled: true,
filters: true
};
}
function E() {
y();
if (document.getElementById("purpura-avatar-fx-styles")) return;
const e = document.createElement("style");
e.id = "purpura-avatar-fx-styles";
e.textContent = `\n            .purpura-fx-hidden { display: none !important; }\n            .purpura-filtering-enabled .list-item { display: none; }\n            .purpura-filtering-enabled .list-item.purpura-show { display: inline-block !important; vertical-align: top; }\n            #purpura-fx-container { position: relative; margin: 12px 0; z-index: auto; display: flex; align-items: center; gap: 10px; flex-wrap: nowrap; }\n            #purpura-fx-toggle-btn {\n                display: inline-flex; align-items: center; gap: 6px;\n                padding: 7px 14px; background: var(--purpura-as-surface-1);\n                border: 1px solid var(--purpura-as-stroke);\n                border-radius: 6px; color: var(--purpura-as-text);\n                font-size: 13px; cursor: pointer; transition: border-color 0.2s, background 0.2s;\n                white-space: nowrap; font-family: inherit;\n            }\n            #purpura-fx-toggle-btn:hover { border-color: var(--purpura-as-accent-border); background: var(--purpura-as-surface-2); }\n            #purpura-fx-toggle-btn.filter-applied { border-color: var(--purpura-as-accent); background: var(--purpura-as-accent-bg); color: var(--purpura-as-accent-light); }\n            #purpura-fx-toggle-btn .purpura-fx-chevron { font-size: 10px; transition: transform 0.2s; opacity: 0.6; }\n            #purpura-fx-toggle-btn[data-state="open"] .purpura-fx-chevron { transform: rotate(180deg); }\n            #purpura-fx-dropdown {\n                position: absolute; top: calc(100% + 4px); left: 0; min-width: 340px;\n                background: var(--purpura-as-surface-2);\n                border: 1px solid var(--purpura-as-stroke);\n                border-radius: 10px; z-index: 10010;\n                box-shadow: 0 12px 32px var(--purpura-as-dropdown-shadow);\n                display: none; overflow: hidden;\n            }\n            #purpura-fx-dropdown[data-state="open"] { display: block; }\n            .purpura-fx-dropdown-header {\n                padding: 14px 18px; display: flex; align-items: center; justify-content: space-between;\n                border-bottom: 1px solid var(--purpura-as-stroke-light);\n            }\n            .purpura-fx-dropdown-header h3 { margin: 0; font-size: 15px; font-weight: 600; color: var(--purpura-as-text); }\n            .purpura-fx-close-btn {\n                background: none; border: none; color: var(--purpura-as-text-muted);\n                cursor: pointer; font-size: 18px; padding: 2px 6px; border-radius: 4px; line-height: 1;\n            }\n            .purpura-fx-close-btn:hover { background: var(--purpura-as-stroke-light); color: var(--purpura-as-text); }\n            .purpura-fx-options { padding: 14px 18px; display: flex; flex-direction: column; gap: 12px; max-height: 60vh; overflow-y: auto; }\n            .purpura-fx-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }\n            .purpura-fx-row > label { font-size: 13px; color: var(--purpura-as-text); flex-shrink: 0; font-weight: 500; }\n            .purpura-fx-input {\n                background: var(--purpura-as-surface-1); border: 1px solid var(--purpura-as-stroke);\n                border-radius: 6px; padding: 6px 10px; color: var(--purpura-as-text);\n                font-size: 13px; width: 160px; transition: border-color 0.2s; font-family: inherit;\n            }\n            .purpura-fx-input:focus { outline: none; border-color: var(--purpura-as-accent); box-shadow: 0 0 0 2px var(--purpura-as-accent-glow); }\n            .purpura-fx-input[type="number"] { width: 100px; }\n            .purpura-fx-select {\n                background: var(--purpura-as-surface-1); border: 1px solid var(--purpura-as-stroke);\n                border-radius: 6px; padding: 6px 10px; color: var(--purpura-as-text);\n                font-size: 13px; cursor: pointer; font-family: inherit; width: 160px;\n            }\n            .purpura-fx-select:focus { outline: none; border-color: var(--purpura-as-accent); }\n            .purpura-fx-toggle {\n                position: relative; width: 36px; height: 20px; flex-shrink: 0;\n                background: var(--purpura-as-toggle-bg); border-radius: 99px;\n                cursor: pointer; transition: background 0.25s; border: 1px solid var(--purpura-as-stroke-lighter);\n            }\n            .purpura-fx-toggle::before {\n                content: ''; position: absolute; left: 3px; top: 2px;\n                width: 14px; height: 14px; border-radius: 50%; background: var(--purpura-as-toggle-knob);\n                transition: transform 0.3s cubic-bezier(0.34, 1.3, 0.64, 1);\n                box-shadow: 0 1px 3px var(--purpura-as-toggle-knob-shadow);\n            }\n            .purpura-fx-toggle[data-checked="true"] { background: var(--purpura-as-accent); border-color: transparent; }\n            .purpura-fx-toggle[data-checked="true"]::before { transform: translateX(16px); }\n            .purpura-fx-apply-btn {\n                margin-top: 4px; padding: 9px 16px; width: 100%;\n                background: var(--purpura-as-accent); color: var(--purpura-as-btn-text); border: none; border-radius: 6px;\n                font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s; font-family: inherit;\n            }\n            .purpura-fx-apply-btn:hover { background: var(--purpura-as-accent-hover); }\n            .purpura-fx-apply-btn:active { transform: scale(0.98); }\n            #purpura-fx-search-bar {\n                flex-grow: 1; width: auto; margin: 0;\n                background: var(--purpura-as-surface-1); border: 1px solid var(--purpura-as-stroke);\n                border-radius: 6px; padding: 7px 12px; color: var(--purpura-as-text);\n                font-size: 13px; font-family: inherit; transition: border-color 0.2s;\n            }\n            #purpura-fx-search-bar:focus { outline: none; border-color: var(--purpura-as-accent); box-shadow: 0 0 0 2px var(--purpura-as-accent-glow); }\n            #purpura-fx-search-bar::placeholder { color: var(--purpura-as-placeholder); }\n            #purpura-filter-loading {\n                position: absolute; top: 60px; right: 20px;\n                background: var(--purpura-as-loading-bg); color: var(--purpura-as-loading-text);\n                padding: 5px 12px; border-radius: 6px; z-index: 2000;\n                font-size: 12px; pointer-events: none; font-family: inherit;\n            }\n        `;
document.head.appendChild(e);
}
function k(e) {
const t = document.createElement("div");
t.className = "purpura-fx-row";
const a = document.createElement("label");
a.textContent = e.label;
t.appendChild(a);
let r;
switch (e.type) {
case "text":
case "number":
{
const t = document.createElement("input");
t.id = e.id;
t.type = e.type;
t.className = "purpura-fx-input";
t.placeholder = e.placeholder || "";
if (e.min !== undefined) t.min = e.min;
if (e.type === "number") {
t.addEventListener("keydown", e => {
if (e.key === "e" || e.key === "E") e.preventDefault();
});
}
r = t;
break;
}

case "select":
{
const t = document.createElement("select");
t.id = e.id;
t.className = "purpura-fx-select";
e.options.forEach(e => {
const a = document.createElement("option");
a.value = e.value;
a.textContent = e.label;
t.appendChild(a);
});
if (e.initialValue) t.value = e.initialValue;
r = t;
break;
}

case "toggle":
{
const t = document.createElement("div");
t.className = "purpura-fx-toggle";
t.id = e.id;
t.setAttribute("data-checked", "false");
t.setAttribute("role", "checkbox");
t.setAttribute("aria-checked", "false");
t.addEventListener("click", () => {
const e = t.getAttribute("data-checked") === "true";
t.setAttribute("data-checked", String(!e));
t.setAttribute("aria-checked", String(!e));
});
r = t;
break;
}
}
if (r) t.appendChild(r);
return t;
}
function A(e, t) {
E();
const a = document.createElement("div");
a.id = "purpura-fx-container";
if (e) {
const e = document.createElement("div");
e.style.position = "relative";
e.style.flexShrink = "0";
const t = document.createElement("button");
t.id = "purpura-fx-toggle-btn";
t.type = "button";
t.setAttribute("data-state", "closed");
const r = document.createElement("span");
r.textContent = "Filter Items";
t.appendChild(r);
const n = document.createElement("span");
n.className = "purpura-fx-chevron";
n.textContent = "▼";
t.appendChild(n);
const i = document.createElement("div");
i.id = "purpura-fx-dropdown";
i.setAttribute("data-state", "closed");
i.addEventListener("click", e => e.stopPropagation());
const s = document.createElement("div");
s.className = "purpura-fx-dropdown-header";
const o = document.createElement("h3");
o.textContent = "Filter Items";
s.appendChild(o);
const u = document.createElement("button");
u.className = "purpura-fx-close-btn";
u.innerHTML = "&times;";
u.addEventListener("click", () => {
i.setAttribute("data-state", "closed");
t.setAttribute("data-state", "closed");
t.classList.remove("filter-button-active");
});
s.appendChild(u);
i.appendChild(s);
const l = document.createElement("div");
l.className = "purpura-fx-options";
const c = [ {
id: "purpura-creator-name",
type: "text",
label: "Creator Name",
placeholder: "Creator name..."
}, {
id: "purpura-min-price",
type: "number",
label: "Min Price",
min: 0,
placeholder: "0"
}, {
id: "purpura-max-price",
type: "number",
label: "Max Price",
min: 0,
placeholder: "∞"
}, {
id: "purpura-availability",
type: "select",
label: "Availability",
initialValue: "all",
options: [ {
value: "all",
label: "Show All"
}, {
value: "onsale",
label: "Onsale Only"
}, {
value: "offsale",
label: "Offsale Only"
} ]
}, {
id: "purpura-filter-itemsWithEffects",
type: "toggle",
label: "Effects"
}, {
id: "purpura-filter-limited",
type: "toggle",
label: "Limiteds"
} ];
c.forEach(e => {
const t = k(e);
if (t) l.appendChild(t);
});
const p = document.createElement("button");
p.className = "purpura-fx-apply-btn";
p.textContent = "Apply Filter";
p.addEventListener("click", async () => {
await j();
i.setAttribute("data-state", "closed");
t.setAttribute("data-state", "closed");
t.classList.remove("filter-button-active");
});
l.appendChild(p);
i.appendChild(l);
e.appendChild(t);
e.appendChild(i);
a.appendChild(e);
t.addEventListener("click", e => {
e.stopPropagation();
const a = i.getAttribute("data-state") === "open";
i.setAttribute("data-state", a ? "closed" : "open");
t.setAttribute("data-state", a ? "closed" : "open");
t.classList.toggle("filter-button-active", !a);
});
x = e => {
if (!a.contains(e.target) && i.getAttribute("data-state") === "open") {
i.setAttribute("data-state", "closed");
t.setAttribute("data-state", "closed");
t.classList.remove("filter-button-active");
}
};
document.addEventListener("click", x);
}
if (t) {
const e = document.createElement("input");
e.id = "purpura-fx-search-bar";
e.type = "text";
e.placeholder = "Search items...";
e.addEventListener("input", () => R());
a.appendChild(e);
}
return a;
}
function S(e) {
if (!e) return false;
const t = window.getComputedStyle(e);
if (t.display === "none" || t.visibility === "hidden") return false;
const a = e.getBoundingClientRect();
return a.width > 0 && a.height > 0;
}
function L() {
return document.getElementById("avatar-react-container") || document.body;
}
function C() {
const e = document.querySelector(".tab-pane.active");
if (e && e.querySelector("ul.item-cards-stackable, li.list-item")) return e;
const t = L();
const a = Array.from(t.querySelectorAll("ul.item-cards-stackable")).find(e => S(e) && !e.closest("#purpura-fx-container"));
return a ? a.closest('.tab-pane, [role="tabpanel"], [data-testid*="tab"]') || a.parentElement : e || null;
}
function I(e) {
e = e || C();
if (!e) return null;
return Array.from(e.querySelectorAll("ul.item-cards-stackable")).find(e => S(e) && !e.closest("#purpura-fx-container")) || e.querySelector("ul.item-cards-stackable") || null;
}
function N(e) {
e = e || C();
return window.location.hash || e && e.id || e && e.getAttribute("aria-labelledby") || e && e.dataset && e.dataset.category || "";
}
function B(e) {
const t = e.querySelector("[data-thumbnail-target-id]");
const a = t && t.getAttribute("data-thumbnail-target-id") || e.getAttribute("data-item-id") || e.dataset && e.dataset.itemId || e.dataset && e.dataset.assetId;
const r = parseInt(a, 10);
if (r) return r;
const n = e.querySelector('a[href*="/catalog/"], a[href*="/library/"]');
const i = n && n.href && n.href.match(/\/(?:catalog|library)\/(\d+)/);
return i ? parseInt(i[1], 10) : null;
}
function O(e) {
const t = e.querySelector("[data-thumbnail-type]");
return t && t.getAttribute("data-thumbnail-type") || "Asset";
}
function q(e) {
const t = e.querySelector('[data-item-name], .item-card-name, .item-card-thumb-container, a[href*="/catalog/"]');
return t && (t.dataset && t.dataset.itemName || t.getAttribute("data-item-name") || t.textContent) || "";
}
function z() {
const e = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
return e ? decodeURIComponent(e[1]) : "";
}
async function T(e) {
if (!e.length) return;
const t = 50;
for (let a = 0; a < e.length; a += t) {
const n = e.slice(a, a + t);
const i = n.map(e => ({
id: e,
itemType: "Asset"
}));
try {
const e = await fetch("https://catalog.roblox.com/v1/catalog/items/details", {
method: "POST",
headers: {
"Content-Type": "application/json",
"X-CSRF-TOKEN": z()
},
body: JSON.stringify({
items: i
})
});
if (!e.ok) continue;
const t = await e.json();
if (t && t.data) {
t.data.forEach(e => {
const t = r.get(e.id);
if (t) {
t.isLimited = e.itemRestrictions && (e.itemRestrictions.includes("Limited") || e.itemRestrictions.includes("LimitedUnique") || e.itemRestrictions.includes("Collectible"));
t.name = e.name;
t.searchName = (e.name || "").toLowerCase();
t.price = e.price;
t.creatorName = e.creatorName;
t.creatorSearchName = (e.creatorName || "").toLowerCase();
t.isOffsale = (e.priceStatus === "Off Sale" || e.isOffSale === true) && !t.isLimited;
t.isValid = true;
}
});
}
} catch (e) {}
}
}
async function M(e) {
if (!e.length) return [];
const t = e.map(e => ({
assetId: e,
requestId: e.toString()
}));
try {
const a = await fetch("https://assetdelivery.roblox.com/v2/assets/batch", {
method: "POST",
headers: {
"Content-Type": "application/json",
"X-CSRF-TOKEN": z()
},
body: JSON.stringify(t)
});
if (!a.ok) return e.map(e => ({
assetId: e,
effects: new Set,
isValid: false
}));
const r = await a.json();
const n = new Map;
if (Array.isArray(r)) {
r.forEach(e => {
if (e.locations && e.locations[0] && e.locations[0].location) {
n.set(parseInt(e.requestId, 10), e.locations[0].location);
}
});
}
const i = await Promise.all(e.map(async e => {
const t = n.get(e);
if (!t) return {
assetId: e,
effects: new Set,
isValid: false
};
try {
const a = new AbortController;
const r = setTimeout(() => a.abort(), 8e3);
const n = await fetch(t, {
signal: a.signal
});
clearTimeout(r);
if (!n.ok) return {
assetId: e,
effects: new Set,
isValid: false
};
const i = await n.arrayBuffer();
const s = i.slice(0, 131072);
const o = new TextDecoder("latin1").decode(s);
const u = new Set;
if (o.includes("ParticleEmitter") || o.includes("Sparkles") || o.includes('"Fire"') || o.includes('className="Fire"')) {
u.add("itemsWithEffects");
}
if (o.includes("SurfaceAppearance") || o.includes("MaterialVariant") || o.includes("MetalnessMap") || o.includes("RoughnessMap") || o.includes("NormalMap")) {
u.add("surfaceAppearance");
}
return {
assetId: e,
effects: u,
isValid: true
};
} catch (t) {
return {
assetId: e,
effects: new Set,
isValid: false
};
}
}));
return i;
} catch (t) {
return e.map(e => ({
assetId: e,
effects: new Set,
isValid: false
}));
}
}
async function V(e, t) {
if (!e.length) return;
const a = i.has("itemsWithEffects");
for (let n = 0; n < e.length; n += 100) {
if (t !== c) return;
const i = e.slice(n, n + 100);
const s = [];
const o = [];
i.forEach(e => {
const t = r.get(e);
if (!t) {
r.set(e, {
assetId: e,
effects: new Set,
effectsChecked: false,
isValid: false,
isLimited: false,
isOffsale: false,
name: "Loading...",
searchName: "",
price: null,
creatorName: "Loading...",
creatorSearchName: ""
});
s.push(e);
if (a) o.push(e);
} else {
if (!t.isValid) s.push(e);
if (a && !t.effectsChecked) o.push(e);
}
});
if (s.length) {
await T(s);
}
if (o.length) {
try {
const e = await M(o);
if (t !== c) return;
e.forEach(e => {
const t = r.get(e.assetId);
if (t) {
if (e.isValid) t.effects = e.effects;
t.effectsChecked = true;
}
});
} catch (e) {}
}
if (t === c) R();
}
}
function F() {
if (i.size > 0 || s.min.active || s.max.active || o !== "all" || u.active) return true;
const e = document.getElementById("purpura-fx-search-bar");
return !!(e && e.value.length > 0);
}
function P(e, t, a) {
if (a && !(t && t.searchName ? t.searchName : e.searchName).includes(a)) return false;
const r = i.size > 0 || s.min.active || s.max.active || u.active || o !== "all";
if (!r) return true;
if (e.isOutfit) return false;
if (!t || !t.isValid) return false;
if (i.size > 0) {
for (const e of i) {
if (e === "limited") {
if (!t.isLimited) return false;
} else if (!t.effects.has(e)) {
return false;
}
}
}
if (s.min.active || s.max.active) {
const e = t.price;
if (typeof e !== "number" || s.min.active && e < s.min.value || s.max.active && e > s.max.value) return false;
}
if (o !== "all") {
if (o === "onsale" && t.isOffsale) return false;
if (o === "offsale" && !t.isOffsale) return false;
}
if (u.active && (!t.creatorSearchName || !t.creatorSearchName.includes(u.name.toLowerCase()))) return false;
return true;
}
function R() {
if (b) return;
b = true;
if (p) cancelAnimationFrame(p);
p = requestAnimationFrame(W);
}
function W() {
b = false;
p = null;
const e = document.getElementById("purpura-filter-loading");
if (e) e.style.display = "none";
const t = C();
if (!t) return;
const a = document.getElementById("purpura-fx-search-bar");
const i = a ? a.value.trim().toLowerCase() : "";
const s = F();
const o = I(t);
if (o) {
if (s) o.classList.add("purpura-filtering-enabled"); else o.classList.remove("purpura-filtering-enabled");
}
const u = t.getElementsByClassName("list-item");
for (let e = 0, t = u.length; e < t; e++) {
const t = u[e];
const a = n.get(t);
if (!a) continue;
if (!s) {
if (t.classList.contains("purpura-fx-hidden")) t.classList.remove("purpura-fx-hidden");
t.classList.add("purpura-show");
if (a.img && a.img.dataset.purpuraSrc) {
a.img.src = a.img.dataset.purpuraSrc;
delete a.img.dataset.purpuraSrc;
}
continue;
}
const o = a.isOutfit ? null : r.get(a.id);
const l = P(a, o, i);
const c = a.img;
if (l) {
t.classList.add("purpura-show");
t.classList.remove("purpura-fx-hidden");
if (c && c.dataset.purpuraSrc) {
c.src = c.dataset.purpuraSrc;
delete c.dataset.purpuraSrc;
}
} else {
t.classList.remove("purpura-show");
if (c) {
const e = c.src;
if (e && !e.startsWith("data:")) {
c.dataset.purpuraSrc = e;
c.src = v;
}
}
}
}
}
async function j() {
const e = c;
U();
i.clear();
document.querySelectorAll("#purpura-fx-dropdown .purpura-fx-toggle").forEach(e => {
const t = e.id.replace("purpura-filter-", "");
if (e.getAttribute("data-checked") === "true") {
i.add(t);
}
});
const t = document.getElementById("purpura-creator-name");
const a = t ? t.value.trim() : "";
u = a ? {
active: true,
name: a
} : {
active: false,
name: ""
};
const l = document.getElementById("purpura-min-price");
const p = document.getElementById("purpura-max-price");
const d = parseInt(l ? l.value : "", 10);
const f = parseInt(p ? p.value : "", 10);
s.min = !isNaN(d) && d >= 0 ? {
active: true,
value: d
} : {
active: false,
value: null
};
s.max = !isNaN(f) && f >= 0 ? {
active: true,
value: f
} : {
active: false,
value: null
};
const m = document.getElementById("purpura-availability");
o = m && m.value || "all";
D();
R();
const g = C();
const h = new Set;
if (g) {
g.querySelectorAll(".list-item").forEach(e => {
const t = n.get(e);
if (t && t.id && !t.isOutfit) {
const e = r.get(t.id);
if (!e || !e.isValid) {
h.add(t.id);
} else if (i.has("itemsWithEffects") && !e.effectsChecked) {
h.add(t.id);
}
}
});
}
try {
if (h.size > 0) {
await V(Array.from(h), e);
}
} catch (e) {} finally {
if (e === c) R();
}
}
function D() {
const e = document.getElementById("purpura-fx-toggle-btn");
if (!e) return;
const t = i.size + (s.min.active ? 1 : 0) + (s.max.active ? 1 : 0) + (o !== "all" ? 1 : 0) + (u.active ? 1 : 0);
const a = e.querySelector("span");
if (a) a.textContent = "Filter Items";
e.classList.toggle("filter-applied", t > 0);
}
function X() {
const t = C();
if (!t) return;
if (document.getElementById("purpura-aeditor-host")) return;
const a = N(t);
if (a !== l) K();
let r = document.getElementById("purpura-fx-container");
if (r && (r.dataset.category !== a || r.parentElement !== t)) {
r.remove();
r = null;
}
if (t.id === "scale" || t.id === "bodyColors") {
if (r) r.remove();
return;
}
const n = t.id === "costumes";
const i = e.filters && !n;
const s = e.enabled;
if (!i && !s) {
if (r) r.remove();
return;
}
if (!r) {
r = A(i, s);
r.dataset.category = a;
const e = r.querySelector("#purpura-creator-name");
if (e) {
[ "keydown", "keypress", "keyup", "input", "change", "focus", "focusin", "click", "mousedown" ].forEach(t => {
e.addEventListener(t, e => e.stopPropagation());
});
}
if (n) r.style.maxWidth = "calc(100% - 170px)";
t.prepend(r);
}
if (i || s) {
D();
const e = I(t);
if (e) {
H(e);
}
}
}
function _(e) {
e = e || 100;
if (g) clearTimeout(g);
g = setTimeout(() => {
g = null;
X();
R();
}, e);
}
function K() {
c++;
m.forEach(e => {
if (e) e.disconnect();
});
m = [];
if (f) {
clearTimeout(f);
f = null;
}
d.clear();
if (p) {
cancelAnimationFrame(p);
p = null;
}
if (g) {
clearTimeout(g);
g = null;
}
r = new Map;
n = new WeakMap;
h = new WeakSet;
i.clear();
s = {
min: {
active: false,
value: null
},
max: {
active: false,
value: null
}
};
o = "all";
u = {
active: false,
name: ""
};
l = N();
document.querySelectorAll(".purpura-filtering-enabled").forEach(e => {
e.classList.remove("purpura-filtering-enabled");
});
const e = document.getElementById("purpura-fx-container");
if (e) e.remove();
if (x) {
document.removeEventListener("click", x);
x = null;
}
}
function H(e) {
if (h.has(e)) return;
h.add(e);
if (F()) e.classList.add("purpura-filtering-enabled");
e.querySelectorAll("li.list-item").forEach(t => J(t, e));
const t = new MutationObserver(t => {
t.forEach(t => {
t.addedNodes.forEach(t => {
if (t.nodeType !== 1) return;
if (t.tagName === "LI" && t.classList.contains("list-item")) {
J(t, e);
} else if (t.querySelectorAll) {
t.querySelectorAll("li.list-item").forEach(t => J(t, e));
}
});
});
});
t.observe(e, {
childList: true,
subtree: true
});
m.push(t);
}
function J(e, t) {
if (!t.contains(e)) return;
if (n.has(e)) return;
const a = e.querySelector(".item-card-thumb img, [data-thumbnail-target-id] img, img");
const i = B(e);
if (!i) return;
const s = O(e);
const o = q(e);
const u = s === "Outfit";
n.set(e, {
id: i,
searchName: o.toLowerCase(),
img: a,
isOutfit: u
});
if (!u) {
const e = r.get(i);
if (!e && !d.has(i)) {
d.add(i);
if (!f) {
f = setTimeout(() => {
const e = Array.from(d);
d.clear();
f = null;
V(e, c);
}, 150);
}
}
}
if (F()) {
const t = document.getElementById("purpura-fx-search-bar");
const s = t ? t.value.trim().toLowerCase() : "";
const o = n.get(e);
const l = u ? null : r.get(i);
if (P(o, l, s)) {
e.classList.add("purpura-show");
e.classList.remove("purpura-fx-hidden");
} else {
e.classList.remove("purpura-show");
if (a) {
const e = a.src;
if (e && !e.startsWith("data:")) {
a.dataset.purpuraSrc = e;
a.src = v;
}
}
}
} else {
e.classList.add("purpura-show");
}
}
function U() {
let e = document.getElementById("purpura-filter-loading");
if (e) {
e.style.display = "block";
} else {
e = document.createElement("div");
e.id = "purpura-filter-loading";
e.textContent = "Filtering...";
const t = C();
if (t) {
if (!t.style.position || t.style.position === "static") t.style.position = "relative";
t.prepend(e);
}
}
}
function G() {
if (t) t.disconnect();
K();
if (a) {
clearInterval(a);
a = null;
}
if (e.enabled || e.filters) {
t = new MutationObserver(() => {
if (!(e.enabled || e.filters)) return;
const t = window.location.pathname.includes("/my/avatar") || window.location.pathname.includes("/avatar");
if (!t) return;
if (document.getElementById("purpura-aeditor-host")) return;
_(100);
});
t.observe(document.body, {
childList: true,
subtree: true
});
const r = window.location.pathname.includes("/my/avatar") || window.location.pathname.includes("/avatar");
if (r && !document.getElementById("purpura-aeditor-host")) {
setTimeout(() => {
X();
R();
}, 500);
}
if (!a) {
a = setInterval(() => {
if (!(e.enabled || e.filters)) return;
const t = window.location.pathname.includes("/my/avatar") || window.location.pathname.includes("/avatar");
if (t && !document.getElementById("purpura-fx-container") && !document.getElementById("purpura-aeditor-host")) {
X();
}
}, 1e3);
}
} else {
if (a) {
clearInterval(a);
a = null;
}
}
}
function Q() {
window.__PurpuraSettings.ready.then(function() {
const t = window.__PurpuraSettings.get("as");
const a = w(t);
const r = a.enabled !== e.enabled || a.filters !== e.filters;
e = a;
if (r) G();
});
}
Q();
chrome.storage.onChanged.addListener((e, t) => {
if (t === "sync" && e["as"]) {
Q();
}
});
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", G);
} else {
G();
}
window.addEventListener("beforeunload", () => {
if (t) t.disconnect();
if (a) clearInterval(a);
if (f) clearTimeout(f);
if (p) cancelAnimationFrame(p);
if (g) clearTimeout(g);
m.forEach(e => {
if (e) e.disconnect();
});
});
})();
