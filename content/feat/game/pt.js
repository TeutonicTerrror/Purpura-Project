/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
"use strict";
var e = 0;
function t() {
if (document.getElementById("purpura-pt-topbar-btn")) return;
var n = document.querySelector(".nav.navbar-right.rbx-navbar-icon-group");
if (!n) {
if (e++ < 30) setTimeout(t, 1e3);
return;
}
var i = document.createElement("li");
i.id = "purpura-pt-topbar-btn";
i.className = "navbar-icon-item";
i.title = "Play Time Tracker";
i.style.display = "flex";
i.style.alignItems = "center";
i.style.justifyContent = "center";
var r = document.createElement("button");
r.type = "button";
r.className = "purpura-pt-navbar-btn";
r.setAttribute("aria-label", "Play Time Tracker");
r.style.cssText = "display:flex;align-items:center;justify-content:center;height:32px;width:32px;padding:0;margin:0;background:none;border:none;cursor:pointer;color:inherit;line-height:0;position:relative";
r.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
r.addEventListener("click", function(e) {
e.preventDefault();
e.stopPropagation();
window.location.href = "/purpura-time";
});
i.appendChild(r);
var a = document.getElementById("purpura-quick-status-toggle");
if (a) {
n.insertBefore(i, a);
} else {
n.appendChild(i);
}
}
async function n() {
if (window.purpuraPlaytimeInitialized) return;
window.purpuraPlaytimeInitialized = true;
if (typeof window.__PurpuraSettings === "undefined" || !window.__PurpuraSettings) {
setTimeout(n, 200);
return;
}
await window.__PurpuraSettings.ready;
var e = window.__PurpuraSettings.get("plt");
if (!e) return;
t();
}
function i(e) {
if (e && e.plt !== undefined) {
if (e.plt.newValue) {
n();
} else {
var t = document.getElementById("purpura-pt-topbar-btn");
if (t) t.remove();
window.purpuraPlaytimeInitialized = false;
}
}
}
if (typeof chrome !== "undefined" && chrome.storage) {
chrome.storage.onChanged.addListener(function(e, t) {
if (t === "sync") i(e);
});
}
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", function() {
setTimeout(n, 1e3);
});
} else {
setTimeout(n, 1e3);
}
})();
