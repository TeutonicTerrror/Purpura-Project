/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
if (window.purpuraThemeEngineInitialized) return;
window.purpuraThemeEngineInitialized = true;
const e = "thm";
const t = "thmEnabled";
const r = "purpura-theme-style";
const o = "purpura-native-vars";
const n = [ "purpura-theme-purpuraCore", "purpura-theme-midnight", "purpura-theme-muted", "purpura-theme-custom" ];
const a = [];
const i = {
surface0: [ "--color-surface-0" ],
surface100: [ "--color-surface-100" ],
surface200: [ "--color-surface-200" ],
surface300: [ "--color-surface-300" ],
mainText: [ "--color-content-default", "--color-content-emphasis", "--dark-mode-content-default", "--dark-mode-content-emphasis", "--light-mode-content-default", "--light-mode-content-emphasis" ],
secondaryText: [ "--color-content-muted", "--color-content-secondary", "--dark-mode-content-muted", "--dark-mode-content-secondary", "--light-mode-content-muted", "--light-mode-content-secondary" ],
playButton: [ "--color-action-primary-background", "--color-action-primary", "--color-system-primary", "--dark-mode-action-primary-background", "--light-mode-action-primary-background" ]
};
let c = false;
let u = "none";
let d = null;
let l = [];
let s = null;
let m = null;
let p = null;
function b(e) {
if (typeof e === "boolean") return e;
if (e && typeof e === "object") return e.enabled === true;
return false;
}
function f() {
var r = window.__PurpuraSettings.get(t);
c = r === true;
const o = window.__PurpuraSettings.get(e);
if (!o || typeof o !== "object") {
u = "none";
d = null;
l = [];
} else {
u = o.selected || "none";
d = o.customColors && typeof o.customColors === "object" ? o.customColors : null;
l = Array.isArray(o.customThemes) ? o.customThemes : [];
}
}
function h() {
return fetch(chrome.runtime.getURL("data/themes.json")).then(function(e) {
return e.ok ? e.json() : null;
}).catch(function() {
return null;
});
}
function g(e) {
if (!s) return null;
var t = s[e];
return t ? t.colors : null;
}
function v(e) {
if (!s) return null;
var t = s[e];
return t ? t.base : null;
}
function x() {
var e = document.body;
if (!e) return;
n.forEach(function(t) {
e.classList.remove(t);
});
a.forEach(function(t) {
e.classList.remove(t);
});
}
function y() {
if (m && m.isConnected) {
m.parentNode.appendChild(m);
return m;
}
m = document.getElementById(r);
if (!m && document.head) {
m = document.createElement("style");
m.id = r;
document.head.appendChild(m);
}
return m;
}
function k(e) {
var t = y();
if (!t) return;
var r = e;
var o = ":root {";
var n = Object.keys(r);
for (var a = 0; a < n.length; a++) {
var i = n[a];
o += "--purpura-" + i + ":" + r[i] + ";";
}
o += "}";
var c = [ "body.purpura-theme-purpuraCore", "body.purpura-theme-midnight", "body.purpura-theme-muted", "body.purpura-theme-custom" ];
function u(e) {
return c.map(function(t) {
return t + " " + e;
}).join(",");
}
function d(e) {
return c.map(function(t) {
return t + e;
}).join(",");
}
function l(e, t) {
return e !== undefined && e !== null ? t : "";
}
o += "" + l(r.surface0, u("#container,.container-main,.main-content,.content,.page-content,.rbx-body,.game-main-content") + "{background-color:" + r.surface0 + "!important}") + l(r.surface100, u(".container-main .section-content,.section,.card,.game-cards .game-card,.item-card,.rbx-card,.chat-main,.rbx-scrollbar,.profile-about,.avatar-card-body,.notification-stream-body,.settings-sidebar,.settings-content,.game-home-page-container") + "{background-color:" + r.surface100 + "!important}") + l(r.surface200, u(".rbx-menu,.nav-menu,.popover,.dropdown-menu,.context-menu,.modal-dialog,.dialog-modal,.chat-dialog") + "{background-color:" + r.surface200 + "!important}") + l(r.cardBg, u(".rbx-card,.card-item,.list-item,.game-card,.item-tile,.catalog-item-row") + "{background-color:" + r.cardBg + "!important}") + l(r.headerBg, u(".rbx-header,header,#header,.navbar,.nav-container,.game-header,.game-home-header") + "{background-color:" + r.headerBg + "!important}") + l(r.navBg, u("#header,.rbx-header,header,.navbar,.nav-container,#navigation,#navbar,.header-container,.game-nav") + "{background-color:" + r.navBg + "!important}") + l(r.mainText, u("h1,h2,h3,h4,h5,h6,.text,.text-name,.font-header-1,.font-header-2,.rbx-text,.game-name,.item-name,label,.settings-label,.profile-display-name,.username") + "{color:" + r.mainText + "!important}") + l(r.secondaryText, u(".text-secondary,.text-muted,.text-small,.rbx-text-muted,.game-description,.item-description,.description") + "{color:" + r.secondaryText + "!important}") + l(r.tertiaryText, u(".text-tertiary,.text-label,.text-hint,.text-placeholder,.rbx-text-label,::placeholder,.input-hint") + "{color:" + r.tertiaryText + "!important}") + l(r.linkColor, u("a,a:link,.text-link,.rbx-link,.game-link,.rbx-text-nav,.nav-link,.settings-link") + "{color:" + r.linkColor + "!important}") + l(r.linkHover, u("a:hover,.text-link:hover,.rbx-link:hover") + "{color:" + r.linkHover + "!important}") + l(r.playButton, u(".btn-primary,.btn-cta,.rbx-button,.btn-full-width,.game-play-button,.play-button,.btn-play") + "{background-color:" + r.playButton + "!important}") + l(r.buttonBackground, u(".btn-secondary,.btn-default,.rbx-button-secondary,.rbx-btn") + "{background-color:" + r.buttonBackground + "!important;color:" + r.buttonTextColor + "!important}") + l(r.buttonHover, u(".btn-secondary:hover,.btn-default:hover,.rbx-button-secondary:hover,.rbx-btn:hover") + "{background-color:" + r.buttonHover + "!important}") + l(r.buttonActive, u(".btn-secondary:active,.btn-default:active,.rbx-button-secondary:active,.rbx-btn:active,.btn:active") + "{background-color:" + r.buttonActive + "!important}") + l(r.inputBg, u(".input-field,.rbx-input,input[type=text],input[type=search],textarea,.form-control,.search-bar") + "{background-color:" + r.inputBg + "!important;color:" + r.inputText + "!important;border-color:" + r.inputBorder + "!important}") + l(r.borderColor, u(".border,.rbx-border,.divider,.hr,.rbx-divider,.section-divider,.card-divider") + "{border-color:" + r.borderColor + "!important}") + l(r.scrollbarThumb, d("::-webkit-scrollbar-thumb") + "{background-color:" + r.scrollbarThumb + "!important}") + l(r.scrollbarTrack, d("::-webkit-scrollbar-track") + "{background-color:" + r.scrollbarTrack + "!important}") + l(r.surface300, u(".list-item:hover,.game-card:hover,.item-card:hover,.catalog-item-row:hover,.rbx-card:hover,.section-row:hover,.table-row:hover,.rbx-menu-item:hover,.rbx-option:hover") + "{background-color:" + r.surface300 + "!important}") + l(r.surface400, u(".tab-content,.tab-pane,.panel-body,.detail-panel,.info-panel,.sub-section,.nested-section") + "{background-color:" + r.surface400 + "!important}") + l(r.mutedText, u("::placeholder,.text-placeholder,.text-disabled,.rbx-text-disabled,.form-hint,.field-hint,[disabled]") + "{color:" + r.mutedText + "!important}") + l(r.shadow, u(".modal,.dialog,.popover,.dropdown-menu,.context-menu,.tooltip,.card,.rbx-card") + "{box-shadow:0 4px 16px " + r.shadow + "!important}") + l(r.profileBg, u(".profile-header,.profile-header-container,.rbx-profile-header,.section-header,.account-header,.profile-about") + "{background-color:" + r.profileBg + "!important}") + l(r.iconColor, u('.icon-base,.rbx-icon,.rbx-icon-left,.rbx-icon-right,.icon-nav,.icon-arrow,.icon-sort,.icon-status,.icon-game-pass,.rbx-glyph,svg.rbx-icon,span[class*="icon-"]') + "{color:" + r.iconColor + "!important;fill:" + r.iconColor + "!important}") + l(r.surface100, u("#footer-container,.footer-container,footer,#footer,.rbx-footer,.container-footer,.footer-navigation,.legal-footer,.footer-bottom") + "{background-color:" + r.surface100 + "!important;border-top-color:" + r.borderColor + "!important}") + l(r.secondaryText, u("#footer-container .footer-links,ul.footer-links,.footer-links,.footer-link a,.text-footer-nav,.footer-text,.footer-copyright") + "{color:" + r.secondaryText + "!important}") + l(r.linkHover, u(".footer-link a:hover,.text-footer-nav:hover") + "{color:" + r.linkHover + "!important}") + l(r.accent, u(".rbx-tab.active,.nav-tab.active,.tab-active,.rbx-badge,.progress-fill") + "{background-color:" + r.accent + "!important}") + l(r.accentHover, u(".rbx-tab.active:hover,.nav-tab.active:hover,.tab-active:hover") + "{background-color:" + r.accentHover + "!important}") + l(r.accent, u(":focus-visible,.focus-ring") + "{outline-color:" + r.accent + "!important}") + l(r.borderEmphasis, u(".rbx-tab.active,.rbx-card.selected,.rbx-selected,.rbx-current,.rbx-highlight") + "{border-color:" + r.borderEmphasis + "!important}") + l(r.danger, u(".text-error,.error,.rbx-text-error,.alert-error") + "{color:" + r.danger + "!important}") + l(r.success, u(".text-success,.success,.rbx-text-success,.alert-success") + "{color:" + r.success + "!important}") + l(r.warning, u(".text-warning,.warning,.rbx-text-warning") + "{color:" + r.warning + "!important}");
t.textContent = o;
}
function w() {
if (m) {
m.textContent = "";
}
var e = document.getElementById(r);
if (e) e.textContent = "";
var t = document.getElementById(o);
if (t) t.textContent = "";
}
function T(e, t) {
var r = document.getElementById(o);
if (!r && document.head) {
r = document.createElement("style");
r.id = o;
document.head.appendChild(r);
}
var n = "";
n += "." + t + "," + "." + t + " * {";
var a = Object.keys(i);
for (var c = 0; c < a.length; c++) {
var u = a[c];
if (e[u] !== undefined && e[u] !== null) {
var d = i[u];
for (var l = 0; l < d.length; l++) {
n += d[l] + ":" + e[u] + "!important;";
}
}
}
n += "}";
r.textContent = n;
}
function C(e) {
if (!e) return e;
var t = document.body && document.body.classList.contains("light-theme");
var r = {};
var o = Object.keys(e);
for (var n = 0; n < o.length; n++) {
var a = o[n];
if (a.slice(-4) === "Dark" || a.slice(-6) === "Light") {
var i = a.replace(/(Dark|Light)$/, "");
var c = a.slice(-4) === "Dark";
if (t && !c || !t && c) {
r[i] = e[a];
} else if (!(i in r)) {
r[i] = e[a];
}
} else {
r[a] = e[a];
}
}
return r;
}
function _(e) {
if (document.body) {
document.body.classList.add("purpura-theme-custom");
}
var t = C(e);
T(t, "purpura-theme-custom");
k(t);
}
function B(e) {
w();
var t = g(e);
if (t) {
var r = "purpura-theme-" + e;
T(t, r);
k(t);
}
}
function L(e) {
w();
if (e && Object.keys(e).length > 0) {
var t = C(e);
T(t, "purpura-theme-custom");
k(t);
}
}
function E() {
if (!document.body) return;
if (!c || u === "none") {
x();
w();
return;
}
x();
if (u === "custom") {
document.body.classList.add("purpura-theme-custom");
document.body.classList.add("dark-theme");
L(d);
} else if (s && s[u]) {
var e = v(u);
document.body.classList.add("purpura-theme-" + u);
if (e) document.body.classList.add(e);
B(u);
}
}
function S() {
h().then(function(e) {
s = e;
f();
E();
j();
});
if (window.__PurpuraSettings && window.__PurpuraSettings.ready) {
window.__PurpuraSettings.ready.then(function() {
f();
if (s) {
E();
j();
}
});
}
chrome.storage.onChanged.addListener(function(r, o) {
if (o !== "local") return;
if (!r[e] && !r[t]) return;
f();
E();
});
}
function j() {
if (p) return;
if (!document.head) return;
p = new MutationObserver(function(e) {
var t = document.getElementById(r);
var n = document.getElementById(o);
if (!t && !n && c && u !== "none") {
m = null;
E();
return;
}
for (var a = 0; a < e.length; a++) {
var i = e[a].addedNodes;
if (!i) continue;
for (var d = 0; d < i.length; d++) {
var l = i[d];
if (l.nodeType === 1 && (l.tagName === "STYLE" || l.tagName === "LINK") && l.id !== r && l.id !== o) {
if (c && u !== "none") E();
return;
}
}
}
});
p.observe(document.head, {
childList: true
});
}
function P(r) {
u = r;
var o = r !== "none";
if (o) {
c = true;
window.__PurpuraSettings.set(t, true);
}
var n = window.__PurpuraSettings.get(e) || {};
if (typeof n !== "object") n = {};
n.selected = r;
n.enabled = o;
window.__PurpuraSettings.set(e, n);
if (s) E();
}
function I(t) {
d = t;
var r = window.__PurpuraSettings.get(e) || {};
if (typeof r !== "object") r = {};
r.customColors = t;
if (u === "custom") {
L(t);
}
window.__PurpuraSettings.set(e, r);
}
function O(t, r, o, n) {
var a = {
name: t,
description: r || "",
author: o || "Unknown",
colors: n,
createdAt: Date.now()
};
l.push(a);
var i = window.__PurpuraSettings.get(e) || {};
if (typeof i !== "object") i = {};
i.customThemes = l;
window.__PurpuraSettings.set(e, i);
return a;
}
function H(t) {
if (t >= 0 && t < l.length) {
l.splice(t, 1);
var r = window.__PurpuraSettings.get(e) || {};
if (typeof r !== "object") r = {};
r.customThemes = l;
window.__PurpuraSettings.set(e, r);
}
}
function U(e, t, r, o) {
var n = {
version: 1,
type: "purpuraTheme",
name: e,
description: t || "",
author: r || "Unknown",
colors: o
};
var a = new Blob([ JSON.stringify(n, null, 2) ], {
type: "application/json"
});
var i = URL.createObjectURL(a);
var c = document.createElement("a");
var u = e.replace(/[^a-z0-9_-]/gi, "_").substring(0, 50) || "theme";
c.href = i;
c.download = u + ".purpuraTheme";
document.body.appendChild(c);
c.click();
document.body.removeChild(c);
URL.revokeObjectURL(i);
}
function N(e) {
try {
var t = JSON.parse(e);
if (t.type !== "purpuraTheme" || !t.colors || !t.name) {
throw new Error("Invalid .purpuraTheme file");
}
return {
name: t.name,
description: t.description || "",
author: t.author || "Unknown",
colors: t.colors,
version: t.version || 1
};
} catch (e) {
throw new Error("Failed to parse .purpuraTheme file: " + e.message);
}
}
function D() {
return {
enabled: c,
selected: u,
customColors: d,
customThemes: l,
presetData: s
};
}
window.PurpuraThemeEngine = {
setTheme: P,
setCustomColors: I,
applyLivePreview: _,
saveCustomTheme: O,
deleteCustomTheme: H,
exportTheme: U,
importTheme: N,
getState: D,
getPresetColors: g,
apply: E
};
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", S, {
once: true
});
} else {
S();
}
})();
