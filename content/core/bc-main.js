/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
"use strict";
if (window.__purpuraBetterContinueLaunchBridge) return;
window.__purpuraBetterContinueLaunchBridge = true;
const t = "https://metrics.roblox.com/v1/games/report-event";
const e = "purpura-game-launch-success";
function n(e) {
return typeof e === "string" && e.includes(t) && e.includes("GameLaunchSuccessWeb_Win32");
}
function r(t) {
if (!n(t)) return;
document.dispatchEvent(new CustomEvent(e, {
detail: {
url: t
}
}));
}
const o = window.fetch;
if (typeof o === "function") {
window.fetch = function(...t) {
const e = t[0];
const n = typeof e === "string" ? e : e && typeof e.url === "string" ? e.url : "";
const u = o.apply(this, t);
if (u && typeof u.then === "function") {
u.then(() => r(n)).catch(() => {});
}
return u;
};
}
const u = XMLHttpRequest.prototype.open;
const i = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.open = function(t, e, ...n) {
this.__purpuraBetterContinueUrl = typeof e === "string" ? e : "";
return u.apply(this, [ t, e, ...n ]);
};
XMLHttpRequest.prototype.send = function(...t) {
this.addEventListener("load", () => {
r(this.__purpuraBetterContinueUrl || "");
}, {
once: true
});
return i.apply(this, t);
};
})();
