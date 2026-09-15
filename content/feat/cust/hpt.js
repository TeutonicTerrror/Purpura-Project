/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
if (!window.homePageTweaksInitialized) {
window.homePageTweaksInitialized = true;
const e = "purpura-home-page-tweaks-style";
const t = "data-purpura-type";
const o = '[data-testid="text-icon-row-text"],.container-header h2,[data-testid="section-header-title-subtitle-container"],.people-list-header h2,h2.container-header,a[aria-label],div[aria-label],h3';
const n = '.game-sort-carousel-wrapper,[data-testid="home-page-game-grid"],[data-testid*="game-grid" i],.home-game-grid,.game-grid-container,[data-testid="game-carousel"],.friend-carousel-container,.game-carousel,.home-sort-container,[data-testid="home-page-carousel-container"],.react-friends-carousel-container,.pinned-games-carousel';
const a = {
continuePlaying: "Continue Playing",
todaysGamePicks: "Today's Picks",
recommendedGames: "Recommended For You",
favoriteGames: "Favorite Games",
standoutGames: "Standout Games",
pinnedGames: "Pinned Games",
friends: "Friends",
gamesMissing: "Games You're Missing",
peopleYouMayKnow: "People You May Know",
underratedGames: "Underrated Games"
};
let r = {};
let s = null;
let i = location.href;
let d = false;
let l = false;
let u = null;
let c = [];
let m = null;
let f = null;
let p = null;
let h = "dark";
let y = null;
let g = true;
function getHomeTheme() {
const e = document.documentElement;
if (e.classList.contains("dark-theme") || e.getAttribute("data-theme") === "dark") return "dark";
if (e.classList.contains("light-theme") || e.getAttribute("data-theme") === "light") return "light";
if (document.body) {
if (document.body.classList.contains("dark-theme") || document.body.classList.contains("theme-dark")) return "dark";
if (document.body.classList.contains("light-theme") || document.body.classList.contains("theme-light")) return "light";
}
return "dark";
}
let b = null;
function setupHomeThemeObserver() {
if (y) y.disconnect();
if (b) {
clearInterval(b);
b = null;
}
h = getHomeTheme();
y = new MutationObserver(() => {
const e = getHomeTheme();
if (e !== h) {
h = e;
updateLayoutModalTheme();
updateLayoutButtonTheme();
fixGameCardTextColors();
}
});
const e = {
attributes: true,
attributeFilter: [ "class", "data-theme" ]
};
y.observe(document.documentElement, e);
if (document.body) {
y.observe(document.body, e);
} else {
const t = setInterval(() => {
if (document.body) {
clearInterval(t);
if (y) {
y.observe(document.body, e);
const t = getHomeTheme();
if (t !== h) {
h = t;
updateLayoutModalTheme();
updateLayoutButtonTheme();
fixGameCardTextColors();
}
}
}
}, 50);
b = t;
}
}
function updateLayoutModalTheme() {
const e = document.getElementById("purpura-home-layout-modal");
if (!e) return;
const t = h === "light";
const o = e.querySelector("div");
if (!o) return;
const n = t ? {
bg: "#ffffff",
border: "rgba(0,0,0,0.12)",
text: "#111113",
text2: "#4b4b55",
text3: "#8a8a95",
card: "rgba(0,0,0,0.03)",
cardBorder: "rgba(0,0,0,0.08)",
accent: "#7c3aed",
sliderOff: "#c8c8d0",
btnBg: "rgba(0,0,0,0.04)",
btnBorder: "rgba(0,0,0,0.1)",
btnText: "#4b4b55",
overlay: "rgba(17,17,19,0.40)",
shadow: "0 24px 64px rgba(0,0,0,0.15)"
} : {
bg: "#1a1b26",
border: "rgba(255,255,255,0.12)",
text: "#f0eeff",
text2: "#a89ec4",
text3: "#6d6487",
card: "rgba(255,255,255,0.04)",
cardBorder: "rgba(255,255,255,0.08)",
accent: "#9b6dff",
sliderOff: "#2a2b36",
btnBg: "rgba(255,255,255,0.06)",
btnBorder: "rgba(255,255,255,0.1)",
btnText: "#a89ec4",
overlay: "rgba(0,0,0,0.6)",
shadow: "0 24px 64px rgba(0,0,0,0.6)"
};
o.style.background = n.bg;
o.style.border = "1px solid " + n.border;
o.style.color = n.text;
o.style.boxShadow = n.shadow;
e.style.background = n.overlay;
o.querySelectorAll("h3").forEach(e => {
e.style.color = n.text;
});
o.querySelectorAll("p").forEach(e => {
e.style.color = n.text3;
});
o.querySelectorAll("li").forEach(e => {
e.style.background = n.card;
e.style.border = "1px solid " + n.cardBorder;
});
o.querySelectorAll("li > span:first-of-type").forEach(e => {
e.style.color = n.text3;
});
o.querySelectorAll("li > span:nth-of-type(2)").forEach(e => {
e.style.color = n.text;
});
o.querySelectorAll("li input[type=checkbox]").forEach(e => {
const t = e.nextElementSibling;
if (t) t.style.background = e.checked ? n.accent : n.sliderOff;
});
const a = o.querySelectorAll("button:not([id])");
a.forEach(e => {
if (e.textContent === "×") {
e.style.background = n.card;
e.style.border = "1px solid " + n.cardBorder;
e.style.color = n.text2;
}
});
}
function defaultConfig() {
return {
enabled: true,
todaysGamePicks: false,
continuePlaying: false,
recommendedGames: false,
favoriteGames: false,
friends: false,
standoutGames: false,
pinnedGames: false,
gamesMissing: false,
peopleYouMayKnow: false,
underratedGames: false,
homeLayout: [ "friends", "pinnedGames", "continuePlaying", "recommendedGames", "favoriteGames", "todaysGamePicks", "standoutGames", "gamesMissing", "peopleYouMayKnow", "underratedGames" ],
homePageButton: false
};
}
function onHomePage() {
const e = location.pathname.toLowerCase();
const t = e === "/" || e === "/home" || e.startsWith("/home/") || /\/[a-z]{2}(?:-[a-z]{2})?\/home(?:\/|$)/i.test(e);
if (t) return true;
try {
const e = document.querySelector('a[href*="/home"],a[data-testid="nav-home"]');
if (e && (e.classList.contains("active") || e.parentElement && e.parentElement.classList.contains("active"))) return true;
} catch (e) {}
return false;
}
function findSectionRoot(e) {
if (!e) return null;
const t = e.closest(n);
if (t) return t;
let o = e.parentElement;
let a = 0;
while (o && o !== document.body && a < 8) {
if (o.classList.contains("home-sort-header-container") || o.classList.contains("css-ibw9t7-sectionHeader") || o.hasAttribute("data-testid") && o.getAttribute("data-testid").includes("header")) {
return o.parentElement;
}
o = o.parentElement;
a++;
}
return e.parentElement;
}
function getTypeFromLabel(e) {
if (!e) return "unknown";
e = e.toLowerCase();
if (e.includes("continue playing") || e === "continue") return "continuePlaying";
if (e.includes("friend")) return "friends";
if (e.includes("favorite") || e.includes("favourite")) return "favoriteGames";
if (e.includes("standout")) return "standoutGames";
if (e.includes("recommended") || e.includes("for you")) return "recommendedGames";
if (e.includes("picks") || e.includes("today") || e.includes("choice") || e.includes("featured")) return "todaysGamePicks";
if (e.includes("pinned") || e.includes("pin ")) return "pinnedGames";
if (e.includes("missing")) return "gamesMissing";
if (e.includes("people you may know")) return "peopleYouMayKnow";
if (e.includes("underrated")) return "underratedGames";
return "unknown";
}
function buildCssRules() {
const e = [];
const o = [ "friends", "continuePlaying", "todaysGamePicks", "recommendedGames", "favoriteGames", "standoutGames", "pinnedGames", "gamesMissing", "peopleYouMayKnow", "underratedGames" ];
o.forEach(o => {
if (r[o]) {
e.push(`[${t}="${o}"]{display:none!important;}`);
}
});
e.push('html.light-theme .info-label,html[data-theme="light"] .info-label,body.light-theme .info-label,body[data-theme="light"] .info-label,body.theme-light .info-label{color:#393939!important;}');
return e.join("\n");
}
function updateStyleElement() {
let t = document.getElementById(e);
const o = r.enabled && onHomePage() ? buildCssRules() : "";
if (!o) {
if (t) t.remove();
return;
}
const n = document.head || document.documentElement;
if (!t) {
t = document.createElement("style");
t.id = e;
n.appendChild(t);
}
if (t.textContent !== o) t.textContent = o;
}
function debounceApply() {
if (u) clearTimeout(u);
u = setTimeout(applyTweaks, 250);
}
function initializeHomePageTweaks() {
r = defaultConfig();
setupNavigationListener();
setupVisibilityListener();
setupHomeThemeObserver();
if (r.enabled && onHomePage()) {
setupObserver();
applyTweaksWithRetry();
}
window.__PurpuraSettings.ready.then(function() {
const e = {
hpt: window.__PurpuraSettings.get("hpt")
};
r = Object.assign(defaultConfig(), e.hpt || {});
if (typeof r.homeLayout === "string") {
try {
r.homeLayout = JSON.parse(r.homeLayout);
} catch (e) {
r.homeLayout = defaultConfig().homeLayout;
}
}
if (!Array.isArray(r.homeLayout)) r.homeLayout = defaultConfig().homeLayout;
if (r.pinnedGames === undefined) r.pinnedGames = false;
if (!r.homeLayout.includes("pinnedGames")) {
r.homeLayout.push("pinnedGames");
saveConfig();
}
if (!r.homeLayout.includes("favoriteGames")) {
const e = r.homeLayout.indexOf("recommendedGames");
if (e >= 0) {
r.homeLayout.splice(e + 1, 0, "favoriteGames");
} else {
r.homeLayout.push("favoriteGames");
}
saveConfig();
}
if (!r.homeLayout.includes("gamesMissing")) {
r.homeLayout.push("gamesMissing");
saveConfig();
}
if (!r.homeLayout.includes("peopleYouMayKnow")) {
r.homeLayout.push("peopleYouMayKnow");
saveConfig();
}
if (!r.homeLayout.includes("underratedGames")) {
r.homeLayout.push("underratedGames");
saveConfig();
}
if (r.enabled && onHomePage()) {
setupObserver();
applyTweaksWithRetry();
} else if (!r.enabled) {
cleanup();
}
});
}
function fixGameCardTextColors() {
if (h !== "light" || !r.enabled || !onHomePage()) return;
const e = document.querySelectorAll(".info-label");
e.forEach(e => {
e.style.setProperty("color", "#393939", "important");
});
}
function cleanup() {
clearRetryTimers();
removeObserver();
removeLayoutButton();
hideLayoutModal();
updateStyleElement();
if (document.body) document.body.removeAttribute("data-purpura-home");
}
function clearRetryTimers() {
c.forEach(e => clearTimeout(e));
c = [];
}
function applyTweaksWithRetry() {
clearRetryTimers();
applyTweaks();
[ 500, 1e3, 1500, 2500, 3500, 5e3, 8e3 ].forEach(e => {
c.push(setTimeout(applyTweaks, e));
});
}
chrome.storage.onChanged.addListener(e => {
if (e.hpt) {
r = Object.assign(defaultConfig(), window.__PurpuraSettings.get("hpt") || {});
if (typeof r.homeLayout === "string") {
try {
r.homeLayout = JSON.parse(r.homeLayout);
} catch (e) {
r.homeLayout = defaultConfig().homeLayout;
}
}
if (!Array.isArray(r.homeLayout)) r.homeLayout = defaultConfig().homeLayout;
if (r.pinnedGames === undefined) r.pinnedGames = false;
if (!r.homeLayout.includes("pinnedGames")) {
r.homeLayout.push("pinnedGames");
saveConfig();
}
if (!r.homeLayout.includes("favoriteGames")) {
const e = r.homeLayout.indexOf("recommendedGames");
if (e >= 0) {
r.homeLayout.splice(e + 1, 0, "favoriteGames");
} else {
r.homeLayout.push("favoriteGames");
}
saveConfig();
}
if (!r.homeLayout.includes("gamesMissing")) {
r.homeLayout.push("gamesMissing");
saveConfig();
}
if (!r.homeLayout.includes("peopleYouMayKnow")) {
r.homeLayout.push("peopleYouMayKnow");
saveConfig();
}
if (!r.homeLayout.includes("underratedGames")) {
r.homeLayout.push("underratedGames");
saveConfig();
}
if (r.enabled && onHomePage()) {
setupObserver();
applyTweaksWithRetry();
} else {
cleanup();
}
}
});
function checkUrlChange() {
if (location.href !== i) {
i = location.href;
if (onHomePage() && r.enabled) {
setupObserver();
applyTweaksWithRetry();
} else {
cleanup();
}
}
}
function setupNavigationListener() {
if (d) return;
d = true;
const e = history.pushState;
const t = history.replaceState;
history.pushState = function() {
e.apply(history, arguments);
setTimeout(checkUrlChange, 0);
};
history.replaceState = function() {
t.apply(history, arguments);
setTimeout(checkUrlChange, 0);
};
window.addEventListener("popstate", checkUrlChange);
window.addEventListener("hashchange", checkUrlChange);
window.addEventListener("pageshow", checkUrlChange);
setInterval(checkUrlChange, 2e3);
}
function setupVisibilityListener() {
if (l) return;
l = true;
document.addEventListener("visibilitychange", () => {
if (!document.hidden && r.enabled && onHomePage()) {
setupObserver();
debounceApply();
}
});
}
function setupObserver() {
if (s) return;
s = new MutationObserver(e => {
if (!r.enabled || !onHomePage()) return;
let t = false;
let o = false;
for (const n of e) {
if (n.addedNodes.length > 0) {
t = true;
for (const e of n.addedNodes) {
if (e.nodeType === 1 && (e.classList.contains("pinned-games-carousel") || e.querySelector(".pinned-games-carousel"))) {
o = true;
break;
}
}
if (o) break;
}
}
if (o) {
applyTweaks();
return;
}
if (t) {
debounceApply();
}
});
const e = document.documentElement;
if (e) {
s.observe(e, {
childList: true,
subtree: true
});
}
}
function removeObserver() {
if (s) {
s.disconnect();
s = null;
}
}
function applyLayoutOrder() {
if (!r.homeLayout || !Array.isArray(r.homeLayout) || r.homeLayout.length === 0) return false;
const e = {};
r.homeLayout.forEach(o => {
const n = document.querySelectorAll(`[${t}="${o}"]`);
if (n.length > 0) e[o] = Array.from(n);
});
const o = [];
const n = new Set;
r.homeLayout.forEach(t => {
(e[t] || []).forEach(e => {
if (!n.has(e)) {
o.push(e);
n.add(e);
}
});
});
if (o.length === 0) return false;
o.forEach(e => {
const o = e.getAttribute(t);
e.style.removeProperty("order");
if (r[o]) {
e.style.setProperty("display", "none", "important");
} else {
if (e.style.display === "none") e.style.removeProperty("display");
}
});
if (o.length < 2) return true;
for (let e = 1; e < o.length; e++) {
const t = o[e - 1];
const n = o[e];
if (n.previousElementSibling !== t && t.parentElement) {
try {
t.insertAdjacentElement("afterend", n);
} catch (e) {}
}
}
return true;
}
function applyTweaks() {
updateStyleElement();
fixGameCardTextColors();
if (!r.enabled || !onHomePage()) return;
if (!document.body) return;
document.body.setAttribute("data-purpura-home", "true");
var e = document.querySelectorAll(o);
for (var n = 0; n < e.length; n++) {
var a = e[n];
if (a.closest && a.closest('button, [role="button"]')) continue;
var s = (a.textContent || a.getAttribute("aria-label") || "").toLowerCase();
var i = getTypeFromLabel(s);
if (i !== "unknown") {
var d = findSectionRoot(a);
if (d && !d.hasAttribute(t)) {
d.setAttribute(t, i);
}
}
}
const l = document.querySelector(".pinned-games-carousel:not([" + t + "])");
if (l) {
l.setAttribute(t, "pinnedGames");
}
var u = [ "gamesMissing", "peopleYouMayKnow", "underratedGames" ];
for (var c = 0; c < u.length; c++) {
var m = u[c];
if (document.querySelectorAll("[" + t + '="' + m + '"]').length === 0) {
var f = document.querySelectorAll("h2");
for (var p = 0; p < f.length; p++) {
var h = f[p];
if (h.closest && h.closest('.game-card, [data-testid*="game-tile" i]')) continue;
if (getTypeFromLabel(h.textContent || "") === m) {
var d = findSectionRoot(h);
if (d && d.getAttribute(t) !== m) {
d.setAttribute(t, m);
break;
}
}
}
}
}
const y = applyLayoutOrder();
injectLayoutButton();
return y;
}
function getLayoutButtonColors() {
const e = h === "light";
return {
bg: e ? "#2563eb" : "#8b5cf6",
shadow: e ? "rgba(37,99,235,0.3)" : "rgba(139,92,246,0.4)",
hoverShadow: e ? "rgba(37,99,235,0.45)" : "rgba(139,92,246,0.55)"
};
}
function updateLayoutButtonTheme() {
if (!m || !m.isConnected) return;
const e = getLayoutButtonColors();
m.style.background = e.bg;
m.style.boxShadow = "0 4px 16px " + e.shadow;
}
function injectLayoutButton() {
if (!r.homePageButton || !onHomePage()) {
removeLayoutButton();
return;
}
if (!document.body) return;
if (m && m.isConnected) {
updateLayoutButtonTheme();
return;
}
if (m) m = null;
const e = getLayoutButtonColors();
m = document.createElement("button");
m.id = "purpura-home-layout-btn";
m.textContent = "☰ Layout";
m.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:9999;padding:10px 18px;background:" + e.bg + ";color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 4px 16px " + e.shadow + ";font-family:-apple-system,BlinkMacSystemFont,sans-serif;transition:transform 0.15s,box-shadow 0.15s,background 0.25s;";
m.addEventListener("mouseenter", () => {
m.style.transform = "translateY(-2px)";
m.style.boxShadow = "0 6px 20px " + getLayoutButtonColors().hoverShadow;
});
m.addEventListener("mouseleave", () => {
m.style.transform = "";
m.style.boxShadow = "0 4px 16px " + getLayoutButtonColors().shadow;
});
m.addEventListener("click", showLayoutModal);
document.body.appendChild(m);
}
function removeLayoutButton() {
if (m) {
m.remove();
m = null;
}
}
function onLayoutModalKeydown(e) {
if (e.key === "Escape") hideLayoutModal();
}
function showLayoutModal() {
if (!document.body) return;
hideLayoutModal();
document.addEventListener("keydown", onLayoutModalKeydown);
f = document.createElement("div");
f.id = "purpura-home-layout-modal";
const e = h === "light";
f.style.cssText = "position:fixed;inset:0;z-index:100000;background:" + (e ? "rgba(17,17,19,0.40)" : "rgba(0,0,0,0.6)") + ";display:flex;align-items:center;justify-content:center;";
const t = document.createElement("div");
t.style.cssText = "background:" + (e ? "#ffffff" : "#1a1b26") + ";border:1px solid " + (e ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)") + ";border-radius:18px;padding:24px;width:420px;max-width:92vw;max-height:80vh;overflow-y:auto;color:" + (e ? "#111113" : "#f0eeff") + ";font-family:-apple-system,BlinkMacSystemFont,sans-serif;box-shadow:" + (e ? "0 24px 64px rgba(0,0,0,0.15)" : "0 24px 64px rgba(0,0,0,0.6)") + ";";
const o = document.createElement("div");
o.style.cssText = "display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;";
const n = document.createElement("h3");
n.textContent = "Home Layout";
n.style.cssText = "margin:0;font-size:18px;font-weight:700;color:" + (e ? "#111113" : "#f0eeff") + ";";
const s = document.createElement("button");
s.textContent = "×";
s.style.cssText = "background:" + (e ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.08)") + ";border:1px solid " + (e ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)") + ";color:" + (e ? "#4b4b55" : "#a89ec4") + ";width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;";
s.addEventListener("click", hideLayoutModal);
o.appendChild(n);
o.appendChild(s);
const i = document.createElement("p");
i.textContent = "Drag sections to reorder. Toggle to show or hide.";
i.style.cssText = "font-size:12px;color:" + (e ? "#8a8a95" : "#6d6487") + ";margin:0 0 12px 0;";
const d = document.createElement("ul");
d.style.cssText = "list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px;";
const l = [ ...r.homeLayout && Array.isArray(r.homeLayout) ? r.homeLayout : defaultConfig().homeLayout ];
if (!l.includes("pinnedGames")) {
const e = l.indexOf("friends");
if (e >= 0) {
l.splice(e + 1, 0, "pinnedGames");
} else {
l.push("pinnedGames");
}
r.homeLayout = l;
saveConfig();
}
if (!l.includes("favoriteGames")) {
const e = l.indexOf("recommendedGames");
if (e >= 0) {
l.splice(e + 1, 0, "favoriteGames");
} else {
l.push("favoriteGames");
}
r.homeLayout = l;
saveConfig();
}
t.appendChild(o);
t.appendChild(i);
t.appendChild(d);
f.appendChild(t);
f.addEventListener("click", function(e) {
if (e.target === f) hideLayoutModal();
});
document.body.appendChild(f);
const u = window.__PurpuraSettings.get("pg") === true;
l.forEach(t => {
if (t === "pinnedGames" && !u) return;
const o = a[t] || t;
const n = r[t] === true;
const s = document.createElement("li");
s.draggable = true;
s.dataset.type = t;
s.style.cssText = "display:flex;align-items:center;gap:10px;padding:10px 12px;background:" + (e ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.04)") + ";border:1px solid " + (e ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)") + ";border-radius:10px;cursor:grab;transition:border-color 0.15s,background 0.15s;";
if (n) s.style.opacity = "0.45";
const i = document.createElement("span");
i.textContent = "≡";
i.style.cssText = "color:" + (e ? "#8a8a95" : "#6d6487") + ";font-size:18px;cursor:grab;user-select:none;flex-shrink:0;";
const l = document.createElement("span");
l.textContent = o;
l.style.cssText = "flex:1;font-size:14px;font-weight:500;color:" + (e ? "#111113" : "#f0eeff") + ";";
const c = document.createElement("label");
c.style.cssText = "position:relative;display:inline-block;width:36px;height:20px;flex-shrink:0;cursor:pointer;";
const m = document.createElement("input");
m.type = "checkbox";
m.checked = !n;
m.style.cssText = "opacity:0;width:0;height:0;";
const f = document.createElement("span");
f.style.cssText = "position:absolute;inset:0;background:" + (m.checked ? e ? "#7c3aed" : "#9b6dff" : e ? "#c8c8d0" : "#2a2b36") + ";border-radius:99px;transition:background 0.25s;";
const y = document.createElement("span");
y.style.cssText = "position:absolute;height:14px;width:14px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:transform 0.3s;";
if (m.checked) y.style.transform = "translateX(16px)";
m.addEventListener("change", function() {
r[t] = !this.checked;
s.style.opacity = this.checked ? "1" : "0.45";
f.style.background = this.checked ? h === "light" ? "#7c3aed" : "#9b6dff" : h === "light" ? "#c8c8d0" : "#2a2b36";
y.style.transform = this.checked ? "translateX(16px)" : "";
saveConfig();
});
c.appendChild(m);
c.appendChild(f);
f.appendChild(y);
s.appendChild(i);
s.appendChild(l);
s.appendChild(c);
s.addEventListener("dragstart", function(e) {
p = this;
this.style.opacity = "0.5";
e.dataTransfer.effectAllowed = "move";
});
s.addEventListener("dragend", function() {
const e = r[t] === true;
this.style.opacity = e ? "0.45" : "1";
p = null;
const o = Array.from(d.querySelectorAll("li"));
o.forEach(e => e.style.borderTop = "");
});
s.addEventListener("dragover", function(e) {
e.preventDefault();
e.dataTransfer.dropEffect = "move";
});
s.addEventListener("dragenter", function(e) {
e.preventDefault();
if (this !== p) {
this.style.borderTop = "2px solid " + (h === "light" ? "#7c3aed" : "#9b6dff");
}
});
s.addEventListener("dragleave", function() {
this.style.borderTop = "";
});
s.addEventListener("drop", function(e) {
e.stopPropagation();
this.style.borderTop = "";
if (p && p !== this) {
const t = Array.from(d.querySelectorAll("li"));
const o = t.indexOf(p);
const n = t.indexOf(this);
try {
if (o < n) {
this.parentNode.insertBefore(p, this.nextSibling);
} else {
this.parentNode.insertBefore(p, this);
}
} catch (e) {}
const a = Array.from(d.querySelectorAll("li")).map(e => e.dataset.type);
r.homeLayout = a;
saveConfig();
}
});
d.appendChild(s);
});
}
function hideLayoutModal() {
document.removeEventListener("keydown", onLayoutModalKeydown);
if (f) {
f.remove();
f = null;
}
}
function saveConfig() {
window.__PurpuraSettings.set("hpt", r);
}
initializeHomePageTweaks();
}
