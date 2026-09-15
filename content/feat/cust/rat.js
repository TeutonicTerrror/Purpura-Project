/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
const e = "rat";
const t = [ "age-roblox-theme", "age-kids-theme", "age-startmode-theme" ];
const o = {
"Normal Roblox": "age-roblox-theme",
"Roblox Kids": "age-kids-theme",
"Roblox Select": "age-startmode-theme"
};
let n = false;
let s = "Normal Roblox";
let a = null;
async function l() {
await window.__PurpuraSettings.ready;
const t = window.__PurpuraSettings.get(e);
if (t && typeof t === "object") {
n = !!t.enabled;
s = t.theme || "Normal Roblox";
} else {
n = false;
s = "Normal Roblox";
}
if (n) {
r(s);
d();
}
}
chrome.storage.onChanged.addListener((t, o) => {
if (o !== "local") return;
if (!t[e]) return;
const a = window.__PurpuraSettings.get(e);
const l = n;
const u = !!(a && a.enabled);
if (u) {
const e = a && a.theme || "Normal Roblox";
n = true;
s = e;
r(e);
d();
} else if (l && !u) {
n = false;
i();
c();
}
});
function r(e) {
const n = o[e] || "age-roblox-theme";
document.body.classList.remove(...t);
document.body.classList.add(n);
}
function i() {
document.body.classList.remove(...t);
}
function d() {
if (a) return;
a = new MutationObserver(() => {
if (!n) return;
const e = o[s] || "age-roblox-theme";
if (!document.body.classList.contains(e)) {
document.body.classList.remove(...t);
document.body.classList.add(e);
}
});
a.observe(document.body, {
attributes: true,
attributeFilter: [ "class" ]
});
}
function c() {
if (a) {
a.disconnect();
a = null;
}
}
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", l);
} else {
l();
}
})();
