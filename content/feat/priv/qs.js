/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
const t = "qs";
function e(t, e) {
return chrome.i18n.getMessage(t, e) || t;
}
const n = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" class="qss-icon">\n         <rect x="2" y="3" width="20" height="4" rx="2" stroke-width="1.3"/>\n        <circle cx="8" cy="5" r="2.8" stroke-width="1.3"/>\n\n        <rect x="2" y="10" width="20" height="4" rx="2" stroke-width="1.3"/>\n        <circle cx="16" cy="12" r="2.8" stroke-width="1.3"/>\n\n       <rect x="2" y="17" width="20" height="4" rx="2" stroke-width="1.3"/>\n         <circle cx="6" cy="19" r="2.8" stroke-width="1.3"/>\n        </svg>`;
let s = false;
let r = null;
let a = null;
let i = false;
let o = null;
let u = null;
let l = null;
let c = null;
let d = null;
let p = false;
let h = false;
let f = null;
function g(t) {
if (typeof t === "boolean") return {
enabled: t,
themeIntegration: true
};
if (t && typeof t === "object") return {
enabled: t.enabled !== false,
themeIntegration: t.themeIntegration !== false
};
return {
enabled: true,
themeIntegration: true
};
}
function m() {
try {
h = window.__PurpuraSettings ? window.__PurpuraSettings.get("thmEnabled") === true : false;
} catch {
h = false;
}
}
async function b() {
if (f) return f;
try {
const t = await fetch(chrome.runtime.getURL("data/themes.json"));
if (t.ok) f = await t.json();
} catch {
f = null;
}
return f;
}
function v() {
try {
const t = window.__PurpuraSettings ? window.__PurpuraSettings.get("thm") : null;
if (t && Array.isArray(t.customThemes)) return t.customThemes;
} catch {}
return [];
}
function y() {
try {
if (window.PurpuraThemeEngine) return window.PurpuraThemeEngine.getState();
} catch {}
return null;
}
async function q() {
const t = [ {
value: "Light",
label: e("quickStatus_light")
}, {
value: "Dark",
label: e("quickStatus_dark")
}, {
value: "SystemDefault",
label: e("quickStatus_system")
} ];
if (!p || !h) return t;
const n = await b();
const s = v();
const r = n ? Object.keys(n).filter(function(t) {
return t !== "robloxLight" && t !== "robloxDark";
}) : [];
if (r.length || s.length) {
t.push({
value: "__purpura_divider__",
label: "─── Purpura ───",
disabled: true
});
}
for (const e of r) {
t.push({
value: "purpura:" + e,
label: n[e].name
});
}
s.forEach((e, n) => {
t.push({
value: "purpura-custom:" + n,
label: e.name || "Custom Theme " + (n + 1)
});
});
return t;
}
function x() {
const t = y();
if (t && t.enabled && t.selected && t.selected !== "none") {
if (t.selected === "custom") {
const e = v();
if (e.length && t.customColors) {
const n = JSON.stringify(t.customColors);
for (let t = 0; t < e.length; t++) {
if (JSON.stringify(e[t].colors) === n) return "purpura-custom:" + t;
}
}
return null;
}
return "purpura:" + t.selected;
}
return null;
}
function w(t) {
if (!window.PurpuraThemeEngine) return;
if (t.startsWith("purpura:")) {
window.PurpuraThemeEngine.setTheme(t.substring(8));
} else if (t.startsWith("purpura-custom:")) {
const e = parseInt(t.substring(15), 10);
const n = v();
if (e >= 0 && e < n.length) {
window.PurpuraThemeEngine.setCustomColors(n[e].colors);
window.PurpuraThemeEngine.setTheme("custom");
}
}
}
function k() {
if (window.PurpuraThemeEngine) window.PurpuraThemeEngine.setTheme("none");
}
function S() {
const t = document.body.classList.contains("dark-theme");
return {
bg: t ? "#191a1f" : "#f0f0f3",
surface: t ? "#202227" : "#ffffff",
text: t ? "#d5d7dd" : "#1a1c20",
textDim: t ? "#bcbec8" : "#6b6f7a",
textBright: t ? "#f7f7f8" : "#0d0e12",
border: t ? "rgba(208,217,251,0.12)" : "rgba(0,0,0,0.10)",
borderHover: t ? "rgba(208,217,251,0.16)" : "rgba(0,0,0,0.18)",
shadow: t ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.12)",
hover: t ? "rgba(208,217,251,0.08)" : "rgba(0,0,0,0.06)",
active: t ? "rgba(51,95,255,0.4)" : "rgba(51,95,255,0.15)",
activeText: t ? "#ebf1ff" : "#1a3ac5"
};
}
function _(t, e = {}) {
const n = document.createElement(t);
Object.entries(e).forEach(([t, e]) => {
if (t === "style") {
if (typeof e === "string") n.style.cssText = e; else Object.assign(n.style, e);
} else if (t === "text") {
n.textContent = e;
} else if (t === "html") {
n.innerHTML = e;
} else {
n.setAttribute(t, e);
}
});
return n;
}
function C() {
if (document.getElementById("purpura-quick-status-menu-styles")) return;
const t = document.createElement("style");
t.id = "purpura-quick-status-menu-styles";
t.textContent = `\n    #purpura-quick-status-toggle svg, #purpura-quick-status-toggle svg path {\n        stroke: rgba(255,255,255,0.85);\n        fill: none !important;\n        stroke-width: 2;\n        stroke-linecap: round;\n    }\n    #purpura-quick-status-toggle.active svg circle { fill: rgba(255,255,255,0.85) !important; }\n    body.light-theme #purpura-quick-status-toggle svg, body.light-theme #purpura-quick-status-toggle svg path,\n    body:not(.dark-theme) #purpura-quick-status-toggle svg, body:not(.dark-theme) #purpura-quick-status-toggle svg path {\n        stroke: rgba(30,30,35,0.8);\n        fill: none !important;\n    }\n    body.light-theme #purpura-quick-status-toggle.active svg circle,\n    body:not(.dark-theme) #purpura-quick-status-toggle.active svg circle { fill: rgba(30,30,35,0.8) !important; }\n    .purpura-quick-status-menu {\n        position: fixed;\n        z-index: 999999;\n        width: 400px;\n        min-width: 360px;\n        border-radius: 14px;\n        padding: 18px 16px 14px;\n        box-sizing: border-box;\n        box-shadow: 0 12px 40px var(--qss-shadow), 0 0 0 1px var(--qss-border);\n        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;\n        background: var(--qss-bg);\n        color: var(--qss-text);\n    }\n\n    .purpura-quick-status-menu.hidden { display: none !important; }\n\n    .purpura-quick-status-menu .qss-header {\n        display: flex;\n        align-items: flex-start;\n        justify-content: space-between;\n        gap: 12px;\n        margin-bottom: 4px;\n    }\n\n    .purpura-quick-status-menu .qss-header-left {\n        display: flex;\n        flex-direction: column;\n        gap: 3px;\n    }\n\n    .purpura-quick-status-menu .qss-title {\n        font-size: 14px;\n        font-weight: 700;\n        letter-spacing: 0.01em;\n        color: var(--qss-textBright);\n    }\n\n    .purpura-quick-status-menu .qss-subtext {\n        font-size: 11px;\n        color: var(--qss-textDim);\n        line-height: 1.3;\n    }\n\n    .purpura-quick-status-menu .qss-close {\n        border: none;\n        background: transparent;\n        color: var(--qss-textDim);\n        cursor: pointer;\n        width: 30px;\n        height: 30px;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        padding: 0;\n        border-radius: 8px;\n        transition: background 120ms ease, color 120ms ease;\n        flex-shrink: 0;\n    }\n\n    .purpura-quick-status-menu .qss-close:hover {\n        background: var(--qss-hover);\n        color: var(--qss-textBright);\n    }\n\n    .purpura-quick-status-menu .qss-divider {\n        height: 1px;\n        background: var(--qss-border);\n        margin: 10px 0;\n    }\n\n    .purpura-quick-status-menu .qss-row {\n        display: flex;\n        align-items: center;\n        justify-content: space-between;\n        gap: 12px;\n        padding: 9px 0;\n    }\n\n    .purpura-quick-status-menu .qss-label-wrap {\n        display: flex;\n        flex-direction: column;\n        gap: 1px;\n        flex: 1;\n        min-width: 0;\n    }\n\n    .purpura-quick-status-menu .qss-label {\n        font-size: 12.5px;\n        font-weight: 600;\n        color: var(--qss-text);\n    }\n\n    .purpura-quick-status-menu .qss-label-sub {\n        font-size: 10.5px;\n        color: var(--qss-textDim);\n        line-height: 1.2;\n    }\n\n    .purpura-quick-status-menu .qss-dropdown {\n        position: relative;\n        min-width: 176px;\n        max-width: 100%;\n        flex-shrink: 0;\n    }\n\n    .purpura-quick-status-menu .qss-dropdown-btn {\n        width: 100%;\n        border-radius: 8px;\n        border: 1px solid var(--qss-border);\n        background: var(--qss-surface);\n        color: var(--qss-text);\n        padding: 7px 30px 7px 10px;\n        font-size: 12px;\n        text-align: left;\n        display: flex;\n        align-items: center;\n        cursor: pointer;\n        outline: none;\n        position: relative;\n        transition: border-color 120ms ease, background 120ms ease;\n        white-space: nowrap;\n        overflow: hidden;\n        text-overflow: ellipsis;\n    }\n\n    .purpura-quick-status-menu .qss-dropdown-btn::after {\n        content: '';\n        position: absolute;\n        right: 10px;\n        top: 50%;\n        transform: translateY(-50%);\n        width: 0;\n        height: 0;\n        border-left: 4px solid transparent;\n        border-right: 4px solid transparent;\n        border-top: 5px solid var(--qss-textDim);\n        transition: transform 120ms ease;\n    }\n\n    .purpura-quick-status-menu .qss-dropdown-btn:hover {\n        background: var(--qss-hover);\n        border-color: var(--qss-borderHover);\n    }\n\n    .purpura-quick-status-menu .qss-dropdown-list {\n        position: absolute;\n        top: calc(100% + 5px);\n        left: 0;\n        right: 0;\n        background: var(--qss-surface);\n        border: 1px solid var(--qss-border);\n        border-radius: 10px;\n        box-shadow: 0 12px 32px var(--qss-shadow);\n        padding: 5px;\n        max-height: 240px;\n        overflow-y: auto;\n        z-index: 1000000;\n    }\n\n    .purpura-quick-status-menu .qss-dropdown-list.hidden { display: none; }\n\n    .purpura-quick-status-menu .qss-dropdown-item {\n        padding: 8px 10px;\n        cursor: pointer;\n        transition: background 100ms ease;\n        color: var(--qss-text);\n        font-size: 12px;\n        border-radius: 6px;\n    }\n\n    .purpura-quick-status-menu .qss-dropdown-item:hover {\n        background: var(--qss-hover);\n    }\n\n    .purpura-quick-status-menu .qss-dropdown-item.active {\n        background: var(--qss-active);\n        color: var(--qss-activeText);\n        font-weight: 600;\n    }\n    .purpura-quick-status-menu .qss-dropdown-separator {\n        padding: 6px 10px 4px;\n        font-size: 10px;\n        font-weight: 700;\n        text-transform: uppercase;\n        letter-spacing: 0.5px;\n        color: var(--qss-textDim);\n        cursor: default;\n        user-select: none;\n    }\n    #purpura-quick-status-toggle:not(.active):hover circle:nth-of-type(1) { animation: qssl 2.5s ease-in-out infinite; }\n    #purpura-quick-status-toggle:not(.active):hover circle:nth-of-type(2) { animation: qssr 2.8s ease-in-out infinite; }\n    #purpura-quick-status-toggle:not(.active):hover circle:nth-of-type(3) { animation: qssl 3s ease-in-out infinite; }\n    #purpura-quick-status-toggle.active circle:nth-of-type(1) { animation: qssL 0.4s cubic-bezier(.34,1.56,.64,1) forwards; }\n    #purpura-quick-status-toggle.active circle:nth-of-type(2) { animation: qssR 0.4s cubic-bezier(.34,1.56,.64,1) forwards; }\n    #purpura-quick-status-toggle.active circle:nth-of-type(3) { animation: qssL3 0.4s cubic-bezier(.34,1.56,.64,1) forwards; }\n    @keyframes qssl { 0%,100% { transform: translateX(0); } 50% { transform: translateX(-4px); } }\n    @keyframes qssr { 0%,100% { transform: translateX(0); } 50% { transform: translateX(4px); } }\n    @keyframes qssL { 0% { transform: translateX(0); } 100% { transform: translateX(-6px); } }\n    @keyframes qssR { 0% { transform: translateX(0); } 100% { transform: translateX(6px); } }\n    @keyframes qssL3 { 0% { transform: translateX(0); } 100% { transform: translateX(-4px); } }\n        `;
document.head.appendChild(t);
}
function L() {
if (!r) return;
const t = S();
r.style.setProperty("--qss-bg", t.bg);
r.style.setProperty("--qss-surface", t.surface);
r.style.setProperty("--qss-text", t.text);
r.style.setProperty("--qss-textDim", t.textDim);
r.style.setProperty("--qss-textBright", t.textBright);
r.style.setProperty("--qss-border", t.border);
r.style.setProperty("--qss-borderHover", t.borderHover);
r.style.setProperty("--qss-shadow", t.shadow);
r.style.setProperty("--qss-hover", t.hover);
r.style.setProperty("--qss-active", t.active);
r.style.setProperty("--qss-activeText", t.activeText);
}
let E = null;
let P = null;
let T = 0;
const O = 8e3;
async function A(t, e, n = {}) {
const s = (n.method || "GET").toUpperCase();
const r = `https://${t}.roblox.com${e}`;
const a = {
...n.headers || {},
Accept: "application/json"
};
if (n.body) {
a["Content-Type"] = "application/json";
}
if (s !== "GET" && s !== "HEAD" && E) {
a["X-CSRF-TOKEN"] = E;
}
let i = await fetch(r, {
method: s,
headers: a,
credentials: "include",
body: n.body ? JSON.stringify(n.body) : undefined
});
if (i.status === 403 && s !== "GET" && s !== "HEAD") {
const t = i.headers.get("x-csrf-token");
if (t) {
E = t;
a["X-CSRF-TOKEN"] = t;
i = await fetch(r, {
method: s,
headers: a,
credentials: "include",
body: n.body ? JSON.stringify(n.body) : undefined
});
}
}
let o = null;
try {
o = await i.clone().json();
} catch {}
return {
ok: i.ok,
status: i.status,
data: o
};
}
async function I() {
const t = Date.now();
if (P && t - T < O) return P;
const e = await A("apis", "/user-settings-api/v1/user-settings/settings-and-options");
if (!e.ok) throw new Error(`Read settings failed: ${e.status}`);
P = e.data;
T = t;
return e.data;
}
async function M() {
const t = await A("accountsettings", "/v1/themes/1/0");
if (t.ok && t.data?.themeType) return t.data.themeType;
return "Light";
}
async function D(t) {
const e = await A("apis", "/user-settings-api/v1/user-settings", {
method: "POST",
body: t
});
if (!e.ok) throw new Error(`Write settings failed: ${e.status}`);
P = null;
return true;
}
function F() {
return new Promise(t => {
const e = ".nav.navbar-right.rbx-navbar-icon-group";
const n = document.querySelector(e);
if (n) return t(n);
const s = new MutationObserver(() => {
const n = document.querySelector(e);
if (n) {
s.disconnect();
t(n);
}
});
s.observe(document.documentElement, {
childList: true,
subtree: true
});
});
}
function j(t, e, n) {
const s = _("div", {
class: "qss-dropdown"
});
const r = _("button", {
type: "button",
class: "qss-dropdown-btn",
"aria-haspopup": "listbox",
"aria-expanded": "false"
});
const a = _("div", {
class: "qss-dropdown-list hidden",
role: "listbox"
});
let i = true;
const o = e => {
a.innerHTML = "";
t.forEach(t => {
if (t.disabled) {
const e = _("div", {
class: "qss-dropdown-separator",
text: t.label
});
a.appendChild(e);
return;
}
const n = _("div", {
class: "qss-dropdown-item",
role: "option",
"data-value": t.value,
text: t.label
});
if (t.value === e) n.classList.add("active");
n.addEventListener("click", () => {
u(t.value);
d();
});
a.appendChild(n);
});
};
const u = (e, s) => {
const a = t.find(t => t.value === e && !t.disabled);
if (!a) return;
r.textContent = a.label;
o(e);
if (!i && !s) n(e);
};
const l = e => {
t = e;
};
const c = () => {
a.classList.remove("hidden");
r.setAttribute("aria-expanded", "true");
document.addEventListener("click", p);
};
const d = () => {
a.classList.add("hidden");
r.setAttribute("aria-expanded", "false");
document.removeEventListener("click", p);
};
const p = t => {
if (!s.contains(t.target)) d();
};
r.addEventListener("click", t => {
t.stopPropagation();
a.classList.contains("hidden") ? c() : d();
});
s.appendChild(r);
s.appendChild(a);
u(e);
i = false;
return {
element: s,
setValue: u,
setOptions: l
};
}
function B() {
if (r) return r;
r = _("div", {
class: "purpura-quick-status-menu hidden"
});
const t = _("div", {
class: "qss-header"
});
const n = _("div", {
class: "qss-title",
text: e("quickStatus_settingsTitle")
});
const s = _("button", {
class: "qss-close",
"aria-label": "Close"
});
s.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M10 8.586l3.95-3.95a1 1 0 011.414 1.414L11.414 10l3.95 3.95a1 1 0 01-1.414 1.414L10 11.414l-3.95 3.95a1 1 0 01-1.414-1.414L8.586 10 4.636 6.05a1 1 0 011.414-1.414L10 8.586z" clip-rule="evenodd"/></svg>';
s.addEventListener("click", z);
const a = _("div", {
class: "qss-header-left"
});
a.appendChild(n);
t.appendChild(a);
t.appendChild(s);
function i(t, e, n) {
const s = _("div", {
class: "qss-row"
});
const r = _("div", {
class: "qss-label-wrap"
});
r.appendChild(_("span", {
class: "qss-label",
text: t
}));
r.appendChild(_("span", {
class: "qss-label-sub",
text: e
}));
s.appendChild(r);
s.appendChild(n);
return s;
}
const p = [ {
value: "AllUsers",
label: e("quickStatus_everyone")
}, {
value: "FriendsFollowingAndFollowers",
label: e("quickStatus_friendsFollowing")
}, {
value: "FriendsAndFollowing",
label: e("quickStatus_friendsFollowingShort")
}, {
value: "Friends",
label: e("quickStatus_friends")
}, {
value: "NoOne",
label: e("quickStatus_noOne")
} ];
const h = [ {
value: "All",
label: e("quickStatus_allUsers")
}, {
value: "Followers",
label: e("quickStatus_followers")
}, {
value: "Following",
label: e("quickStatus_following")
}, {
value: "Friends",
label: e("quickStatus_friends")
}, {
value: "NoOne",
label: e("quickStatus_noOne")
} ];
const f = [ {
value: "AllUsers",
label: e("quickStatus_everyone")
}, {
value: "Friends",
label: e("quickStatus_friends")
}, {
value: "NoOne",
label: e("quickStatus_noOne")
} ];
const g = [ {
value: "AllUsers",
label: e("quickStatus_everyone")
}, {
value: "Friends",
label: e("quickStatus_friends")
}, {
value: "NoOne",
label: e("quickStatus_noOne")
} ];
o = j(p, "AllUsers", async t => {
try {
await D({
whoCanSeeMyOnlineStatus: t
});
} catch {}
});
u = j(h, "All", async t => {
try {
await D({
whoCanJoinMeInExperiences: t
});
} catch {}
});
l = j(f, "AllUsers", async t => {
try {
await D({
privateServerPrivacy: t
});
} catch {}
});
c = j(g, "AllUsers", async t => {
try {
await D({
whoCanSeeMyInventory: t
});
} catch {}
});
const m = [ {
value: "Light",
label: e("quickStatus_light")
}, {
value: "Dark",
label: e("quickStatus_dark")
}, {
value: "SystemDefault",
label: e("quickStatus_system")
} ];
d = j(m, "Light", async t => {
if (t.startsWith("purpura:") || t.startsWith("purpura-custom:")) {
w(t);
return;
}
k();
try {
const e = await A("accountsettings", "/v1/themes/1/0", {
method: "PATCH",
body: {
themeType: t
}
});
if (e.ok) {
document.body.classList.remove("dark-theme", "light-theme");
if (t === "Light") document.body.classList.add("light-theme"); else if (t === "Dark") document.body.classList.add("dark-theme");
try {
const e = localStorage.getItem("theme");
if (e) {
const n = JSON.parse(e);
const s = document.querySelector('meta[name="user-data"]');
const r = s?.getAttribute("data-userid") || s?.getAttribute("data-user-id");
if (r && Array.isArray(n.data)) {
const e = n.data.find(t => String(t[0]) === r);
if (e) {
e[1] = t === "Light" ? 0 : t === "Dark" ? 1 : 2;
localStorage.setItem("theme", JSON.stringify(n));
}
}
}
} catch {}
}
} catch {}
});
r.appendChild(t);
const b = _("div", {
class: "qss-divider"
});
r.appendChild(b);
r.appendChild(i(e("quickStatus_title"), e("quickStatus_subOnline"), o.element));
r.appendChild(i(e("quickStatus_joinStatus"), e("quickStatus_subJoin"), u.element));
r.appendChild(i(e("quickStatus_privateServer"), e("quickStatus_subServer"), l.element));
r.appendChild(i(e("quickStatus_inventory"), e("quickStatus_subInventory"), c.element));
r.appendChild(i(e("quickStatus_theme"), e("quickStatus_subTheme"), d.element));
document.body.appendChild(r);
L();
return r;
}
function V() {
if (!a || !r) return;
const t = a.getBoundingClientRect();
r.style.visibility = "hidden";
r.classList.remove("hidden");
const e = r.getBoundingClientRect();
const n = 12;
const s = t.bottom + 8;
let i = t.left + t.width / 2 - e.width / 2;
const o = window.innerWidth - e.width - n;
if (i > o) i = Math.max(n, o);
if (i < n) i = n;
const u = window.innerHeight - e.height - n;
const l = s > u ? t.top - e.height - 8 : s;
r.style.top = `${Math.max(n, l)}px`;
r.style.left = `${i}px`;
r.style.visibility = "";
}
function z() {
if (!r) return;
r.classList.add("hidden");
if (a) {
a.setAttribute("aria-expanded", "false");
a.classList.remove("active");
}
document.removeEventListener("click", N);
i = false;
}
function N(t) {
if (!a || !r) return;
if (!a.contains(t.target) && !r.contains(t.target)) z();
}
async function X() {
if (!r) B();
if (i) return z();
L();
P = null;
try {
const t = await I();
if (t?.whoCanSeeMyOnlineStatus?.currentValue) o.setValue(t.whoCanSeeMyOnlineStatus.currentValue);
if (t?.whoCanJoinMeInExperiences?.currentValue) u.setValue(t.whoCanJoinMeInExperiences.currentValue);
if (t?.privateServerPrivacy?.currentValue) l.setValue(t.privateServerPrivacy.currentValue);
if (t?.whoCanSeeMyInventory?.currentValue) c.setValue(t.whoCanSeeMyInventory.currentValue);
} catch {}
try {
m();
const t = await q();
d.setOptions(t);
const e = x();
if (e) {
d.setValue(e, true);
} else {
const t = await M();
d.setValue(t, true);
}
} catch {}
r.classList.remove("hidden");
V();
if (a) {
a.setAttribute("aria-expanded", "true");
a.classList.add("active");
}
i = true;
document.addEventListener("click", N);
}
function H(t) {
if (document.getElementById("purpura-quick-status-toggle")) return;
const e = _("li", {
id: "purpura-quick-status-toggle",
class: "navbar-icon-item"
});
a = _("button", {
type: "button",
class: "btn-uiblox-common-common-notification-bell-md",
style: "display:flex;align-items:center;justify-content:center;height:32px;width:32px;padding:0;margin:0;position:relative;",
"aria-expanded": "false",
"aria-label": "Quick Settings",
html: `<span class="rbx-menu-item" style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;">${n}</span>`
});
a.addEventListener("click", t => {
t.stopPropagation();
X();
});
e.appendChild(a);
const s = t.querySelector(".rbx-navbar-right-search");
if (s) t.insertBefore(e, s.nextSibling); else t.insertBefore(e, t.firstChild);
}
async function J() {
C();
const t = await F();
H(t);
const e = new MutationObserver(() => {
if (r && !r.classList.contains("hidden")) L();
});
e.observe(document.body, {
attributes: true,
attributeFilter: [ "class" ]
});
}
function U(t) {
const e = g(t);
p = e.themeIntegration;
const n = e.enabled;
if (n === s) return;
s = n;
if (s) J().catch(() => {}); else {
z();
const t = document.getElementById("purpura-quick-status-toggle");
if (t) t.remove();
const e = document.querySelector(".purpura-quick-status-menu");
if (e) e.remove();
r = null;
a = null;
}
}
chrome.storage.sync.get([ t ], e => {
const n = window.__PurpuraSettings ? window.__PurpuraSettings.get(t) : e[t];
U(n);
});
chrome.storage.onChanged.addListener((e, n) => {
if (n === "sync" && e[t]) {
U(window.__PurpuraSettings.get(t));
}
if (n === "local" && (e["thmEnabled"] || e["thm"])) {
m();
}
});
})();
