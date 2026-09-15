/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
var t = document.createElement("script");
t.src = chrome.runtime.getURL("content/core/ssi.js");
document.documentElement.appendChild(t);
t.onload = function() {
t.remove();
};
})();

chrome.storage.local.get("stm", function(t) {
var e = !!(t && t.stm === true);
try {
sessionStorage.setItem("purpura_streamermode", String(e));
} catch (t) {}
document.dispatchEvent(new CustomEvent("purpura-streamer-mode", {
detail: e
}));
});

if (!window.purpuraLoadedLogged) {
window.purpuraLoadedLogged = true;
async function gatherDebugData() {
const [t, e] = await Promise.all([ new Promise(t => chrome.storage.local.get(null, t)), new Promise(t => chrome.storage.sync.get(null, t)) ]);
const r = {
"Bot Detector": e["bd"]?.enabled ?? true,
"  └ Database": e["bd"]?.showDatabase ?? true,
"  └ Round Numbers": e["bd"]?.roundToWholeNumbers ?? true,
"Server Info": e["si"]?.enabled ?? true,
"Pinned Games": e["pg"] ?? false,
"Game Launcher Widget": e["glw"] ?? false,
"Game Outfits": e["go"]?.enabled ?? true,
"Purpura's Selection": e["ps"] ?? true,
"Quick Play": e["qp"] ?? true,
"Reworked Sidebar": t["sdbr"]?.enabled ?? false,
"  └ Trade Button": t["sdbr"]?.tradeButton ?? false,
"Better Continue": t["bc"] ?? false,
"Page Binds": e["pb"] ? "Configured" : "None",
"Home Page Tweaks": t["hpt"]?.enabled ?? false,
Uncorporatify: t["unc"] ?? false,
"Purpura Cursors": t["pcr"]?.enabled ?? false,
"  └ Trail Effects": t["pcr"]?.trailEffects ?? true,
"Purpura Tabs": t["pt"]?.enabled ?? false,
"Theme Editor": t["rothemerActive"] ?? false,
"Free Roblox Plus Themes": e["frpt"] ?? false,
"Bloatware Remover": t["bwr"]?.enabled ?? false,
Greetings: t["gr"] ?? true,
"Friends Manager": e["fm"] ?? false,
"No Rent": e["nr"] ?? true,
"Robux Conversations": e["rconv"] ?? true,
"Bundle Item Viewer": e["biv"] ?? true,
"Item Explorer": e["explr"] ?? true,
"Ghost Profiles": t["ghos"]?.enabled ?? true,
"Last Online": e["lo"] ?? true,
"Avatar Search": e["as"] ?? true,
"Infinite Avatar": e["ia"] ?? false,
"Redesigned Avatar Editor": e["rae"]?.enabled ?? false,
"Streamer Mode": t["stm"] ?? false,
"Status Spoofer": e["spc"]?.enabled ?? false,
"Unpending Robux": e["up"] ?? false,
"Save Lots Robux": e["slr"]?.enabled ?? false,
"Remaining Robux": e["rr"] ?? true,
"Roblox Age Theme": t["rat"]?.enabled ?? false,
"Hide Download Button": t["hdb"] ?? true,
"Legacy Theme Switcher": t["lts"] ?? false,
"Quick Status Switcher": e["qs"] ?? false,
"Login Security Banner": t["lb"] ?? false,
"Sticky Avatar Preview": t["sap"] ?? false
};
const n = {
"User ID": t["robloxUserId"] || "Not detected",
"User Agent": navigator.userAgent,
Platform: navigator.platform,
Language: navigator.language,
Cookies: navigator.cookieEnabled ? "Enabled" : "Disabled",
Online: navigator.onLine ? "Yes" : "No",
Viewport: `${window.innerWidth}x${window.innerHeight}`
};
return {
featureConfig: r,
browserInfo: n
};
}
document.addEventListener("purpura-copy-debug-request", async () => {
try {
const {featureConfig: t, browserInfo: e} = await gatherDebugData();
const r = (t, e) => {
let r = `${t}\n${"─".repeat(30)}\n`;
for (const [t, n] of Object.entries(e)) {
r += `${t}: ${n}\n`;
}
return r;
};
const n = [ "═══════════════════════════════════", "       PURPURA DEBUG INFO", "═══════════════════════════════════", "", r("🔧 Feature Configuration", t), r("🌐 Browser Info", e) ].join("\n");
document.dispatchEvent(new CustomEvent("purpura-copy-debug-response", {
detail: {
debugText: n
}
}));
} catch (t) {
document.dispatchEvent(new CustomEvent("purpura-copy-debug-response", {
detail: {
error: true
}
}));
}
});
const t = document.createElement("script");
t.src = chrome.runtime.getURL("content/core/ppa.js");
(document.head || document.documentElement).appendChild(t);
t.onload = () => t.remove();
(async function t() {
try {
const {featureConfig: t, browserInfo: e} = await gatherDebugData();
console.groupCollapsed("%cPurpura Extension Loaded", "color: #b388ff; font-weight: bold; font-size: 16px; background: #2e003e; padding: 6px 12px; border-radius: 8px;");
console.group("%c🔧 Feature Configuration", "color: #4caf50; font-weight: bold; font-size: 14px;");
console.table(t);
console.groupEnd();
console.group("%c🌐 Browser Info", "color: #2196f3; font-weight: bold; font-size: 14px;");
console.table(e);
console.groupEnd();
console.groupEnd();
} catch (t) {}
})();
async function runStorageMigration() {
if (!globalThis.PurpuraStorageMigrate || typeof globalThis.PurpuraStorageMigrate.migrateStorageKeys !== "function") {
return {
migrated: 0,
success: false,
error: "migration_unavailable"
};
}
return globalThis.PurpuraStorageMigrate.migrateStorageKeys();
}
runStorageMigration().catch(() => {});
document.addEventListener("purpura-migrate-keys", async () => {
try {
const t = await runStorageMigration();
document.dispatchEvent(new CustomEvent("purpura-migrate-keys-response", {
detail: t
}));
} catch (t) {
document.dispatchEvent(new CustomEvent("purpura-migrate-keys-response", {
detail: {
error: t.message,
success: false,
migrated: 0
}
}));
}
});
}

(function() {
var t = "purpura-kofi-abc";
var e = "https://ko-fi.com/teutonic";
var r = "https://storage.ko-fi.com/cdn/cup-border.png";
function n() {
var t = document.documentElement;
if (t.classList.contains("dark-theme") || t.getAttribute("data-theme") === "dark") return "dark";
if (t.classList.contains("light-theme") || t.getAttribute("data-theme") === "light") return "light";
if (document.body) {
if (document.body.classList.contains("dark-theme") || document.body.classList.contains("theme-dark")) return "dark";
if (document.body.classList.contains("light-theme") || document.body.classList.contains("theme-light")) return "light";
}
return "dark";
}
var o = {
dark: {
a: "linear-gradient(135deg,#1a1a2e 0%,#2d1b3d 50%,#1a1a2e 100%)",
b: "linear-gradient(135deg,#2d1b3d 0%,#3d2950 50%,#2d1b3d 100%)",
c: "rgba(179,136,255,0.2)",
d: "rgba(179,136,255,0.4)",
e: "#f0e6ff",
f: "#ffffff",
g: "0 1px 3px rgba(0,0,0,0.3)",
h: "0 2px 8px rgba(179,136,255,0.15)",
i: "rgba(179,136,255,0.08)"
},
light: {
a: "linear-gradient(135deg,#f5f0ff 0%,#ede4f7 50%,#f5f0ff 100%)",
b: "linear-gradient(135deg,#ede4f7 0%,#e0d4ef 50%,#ede4f7 100%)",
c: "rgba(179,136,255,0.3)",
d: "rgba(179,136,255,0.5)",
e: "#3d2950",
f: "#1a1a2e",
g: "0 1px 3px rgba(0,0,0,0.1)",
h: "0 2px 8px rgba(179,136,255,0.2)",
i: "rgba(179,136,255,0.12)"
}
};
var a = "dark", i = null, s = null, l = null;
function p(t, e) {
var r = o[t] || o.dark;
if (!i) return;
if (e) {
i.style.setProperty("background", r.b, "important");
i.style.setProperty("border-color", r.d, "important");
i.style.setProperty("box-shadow", r.h, "important");
i.style.setProperty("color", r.f, "important");
i.style.setProperty("transform", "translateY(-1px)", "important");
if (s) {
s.style.setProperty("background", "linear-gradient(90deg,transparent 0%," + r.i + " 50%,transparent 100%)", "important");
s.style.setProperty("opacity", "1", "important");
}
} else {
i.style.setProperty("background", r.a, "important");
i.style.setProperty("border-color", r.c, "important");
i.style.setProperty("box-shadow", r.g, "important");
i.style.setProperty("color", r.e, "important");
i.style.setProperty("transform", "translateY(0)", "important");
if (s) {
s.style.setProperty("background", "linear-gradient(90deg,transparent 0%," + r.i + " 50%,transparent 100%)", "important");
s.style.setProperty("opacity", "0", "important");
}
}
}
function u(t) {
a = t || n();
p(a, false);
}
function d() {
if (document.getElementById(t)) return null;
var n = document.createElement("li");
n.id = t;
n.setAttribute("role", "none");
var o = document.createElement("a");
o.href = e;
o.target = "_blank";
o.rel = "noopener noreferrer";
o.setAttribute("role", "menuitem");
o.setAttribute("style", "display:flex !important;align-items:center !important;gap:10px !important;padding:10px 16px !important;border-radius:10px !important;font-family:system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif !important;font-size:14px !important;font-weight:600 !important;line-height:20px !important;text-decoration:none !important;cursor:pointer !important;transition:all 0.25s ease !important;margin:6px 8px !important;opacity:1 !important;visibility:visible !important;position:relative !important;z-index:2147483647 !important;pointer-events:auto !important;user-select:none !important;overflow:hidden !important");
i = o;
var l = document.createElement("div");
l.setAttribute("style", "position:absolute !important;inset:0 !important;pointer-events:none !important;transition:opacity 0.3s ease !important;opacity:0 !important");
s = l;
o.insertBefore(l, o.firstChild);
o.onmouseenter = function() {
p(a, true);
};
o.onmouseleave = function() {
p(a, false);
};
var u = document.createElement("span");
u.setAttribute("style", "display:flex !important;align-items:center !important;justify-content:center !important;width:20px !important;height:20px !important;flex-shrink:0 !important;");
var d = document.createElement("img");
d.src = r;
d.alt = "";
d.setAttribute("style", "height:18px !important;width:auto !important;display:block !important;flex-shrink:0 !important;filter:brightness(1.2) !important");
u.appendChild(d);
var c = document.createElement("span");
c.textContent = "Support Purpura";
c.setAttribute("style", "flex:1 !important;font-weight:600 !important;font-size:14px !important;line-height:20px !important;color:inherit !important");
o.appendChild(u);
o.appendChild(c);
n.appendChild(o);
return n;
}
function c(e) {
var r = e.tagName === "UL" ? e : e.querySelector("ul");
if (!r) return false;
if (document.getElementById(t)) return true;
var n = d();
if (!n) return true;
var o = r.lastElementChild;
if (o && o.tagName === "LI") r.insertBefore(n, o.nextSibling); else r.appendChild(n);
return true;
}
function m() {
var t = document.getElementById("left-navigation-container");
if (t && c(t)) return true;
var e = document.querySelector("#left-navigation-container ul, .left-nav ul");
if (e && c(e.parentElement || e)) return true;
return false;
}
if (m()) {
g();
return;
}
var f = new MutationObserver(function() {
if (m()) {
f.disconnect();
g();
}
});
f.observe(document.body || document.documentElement, {
childList: true,
subtree: true
});
function g() {
u(n());
if (l) l.disconnect();
l = new MutationObserver(function() {
u(n());
});
var t = {
attributes: true,
attributeFilter: [ "class", "data-theme" ]
};
l.observe(document.documentElement, t);
if (document.body) l.observe(document.body, t);
}
function b(t) {
if (!t || !t.style) return;
var e = t.style;
e.setProperty("display", "flex", "important");
e.setProperty("visibility", "visible", "important");
e.setProperty("opacity", "1", "important");
e.setProperty("filter", "none", "important");
e.setProperty("clipPath", "none", "important");
e.setProperty("transform", "none", "important");
e.setProperty("overflow", "visible", "important");
e.setProperty("maxHeight", "none", "important");
e.setProperty("maxWidth", "none", "important");
e.setProperty("height", "auto", "important");
e.setProperty("width", "auto", "important");
e.setProperty("position", "relative", "important");
e.setProperty("left", "auto", "important");
e.setProperty("top", "auto", "important");
e.setProperty("pointerEvents", "auto", "important");
e.setProperty("zIndex", "2147483647", "important");
e.setProperty("contentVisibility", "visible", "important");
e.setProperty("isolation", "auto", "important");
e.setProperty("scale", "1", "important");
e.setProperty("translate", "none", "important");
e.setProperty("rotate", "none", "important");
}
var y = setInterval(function() {
var e = document.getElementById(t);
if (!e) {
m();
return;
}
var r = e.querySelector("a");
if (getComputedStyle(e).display === "none" || e.offsetHeight === 0) {
e.removeAttribute("style");
e.setAttribute("style", "display:block !important");
}
b(r);
var n = getComputedStyle(r);
if (n.display === "none" || n.visibility === "hidden" || parseFloat(n.opacity) < .5 || parseFloat(n.height || "0") < 5 || parseFloat(n.width || "0") < 5) {
b(r);
r.style.setProperty("display", "flex", "important");
r.style.setProperty("visibility", "visible", "important");
r.style.setProperty("opacity", "1", "important");
}
}, 1e3);
setTimeout(function() {
clearInterval(y);
}, 12e4);
})();
