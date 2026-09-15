/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
const n = "spc";
const t = "spc-legacy";
function e(n) {
if (typeof n === "object" && n !== null) {
if (n.enabled !== true) return "off";
return e(n.mode);
}
if (n === true) return "offline";
if (n === false || n === undefined || n === null) return "off";
const t = String(n).toLowerCase();
if (t === "offline" || t === "studio" || t === "in-studio" || t === "off") return t === "in-studio" ? "studio" : t;
return "off";
}
function o(n) {
document.dispatchEvent(new CustomEvent("purpura-status-spoofer", {
detail: {
mode: n
}
}));
}
function i() {
window.__PurpuraSettings.ready.then(function() {
const i = window.__PurpuraSettings.get(n);
if (i !== undefined) {
o(e(i));
return;
}
const u = window.__PurpuraSettings.get(t);
const r = e(u);
const f = {
enabled: !!u,
mode: "offline"
};
window.__PurpuraSettings.set(n, f).then(function() {
o(r);
});
});
chrome.storage.onChanged.addListener((i, u) => {
if (u !== "sync") return;
if (i[n]) {
o(e(window.__PurpuraSettings.get(n)));
}
if (i[t]) {
const i = !!window.__PurpuraSettings.get(t);
const u = e(i ? "offline" : "off");
const r = {
enabled: i,
mode: "offline"
};
window.__PurpuraSettings.set(n, r);
o(u);
}
});
}
i();
})();
