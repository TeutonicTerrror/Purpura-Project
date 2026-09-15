/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
if (window.purpuraHideDownloadBtnInitialized) return;
window.purpuraHideDownloadBtnInitialized = true;
let n = true;
let e = null;
const t = "hdb";
const o = ".navbar-download-app-item";
const d = `\n        /* Purpura Hide Download Button */\n        ${o} {\n            display: none !important;\n        }\n        a[href*="/download"],\n        a[href*="roblox.com/download"],\n        a[href*="setup.roblox.com"],\n        a[href^="https://www.roblox.com/download"] {\n            display: none !important;\n        }\n    `;
function r() {
const n = document.getElementById("purpura-hide-download-btn");
if (!n || !n.isConnected) {
i();
}
u();
}
function i() {
const n = document.getElementById("purpura-hide-download-btn");
if (n) n.remove();
const e = document.createElement("style");
e.id = "purpura-hide-download-btn";
e.textContent = d;
document.head.appendChild(e);
}
function u() {
document.querySelectorAll(o).forEach(n => {
n.style.display = "none";
});
}
function a() {
const n = document.getElementById("purpura-hide-download-btn");
if (n) n.remove();
document.querySelectorAll(o).forEach(n => {
n.style.display = "";
});
}
function l() {
if (!n) return;
c();
e = new MutationObserver(() => {
if (!document.getElementById("purpura-hide-download-btn")) {
i();
}
u();
});
e.observe(document.body, {
childList: true,
subtree: true
});
}
function c() {
if (e) {
e.disconnect();
e = null;
}
}
function s() {
window.__PurpuraSettings.ready.then(function() {
const e = window.__PurpuraSettings.get(t);
n = e !== false;
if (n) {
r();
l();
}
});
}
chrome.storage.onChanged.addListener((e, o) => {
if (o !== "local") return;
if (!e[t]) return;
const d = window.__PurpuraSettings.get(t);
n = d !== false;
if (n) {
r();
l();
} else {
a();
c();
}
});
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", s);
} else {
s();
}
})();
