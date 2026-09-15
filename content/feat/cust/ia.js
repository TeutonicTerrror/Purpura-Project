/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
"use strict";
if (window.__purpuraInfiniteAvatarLoaded) return;
window.__purpuraInfiniteAvatarLoaded = true;
var r = "ia";
var e = "https://catalog.roblox.com/v1/categories";
var n = null;
var t = null;
function a(r) {
document.dispatchEvent(new CustomEvent("purpura:infinite-avatar", {
detail: r
}));
}
function i() {
if (n) return Promise.resolve(n);
if (t) return t;
t = fetch(e, {
method: "GET",
credentials: "include"
}).then(function(r) {
if (!r.ok) throw new Error("categories request failed");
return r.json();
}).then(function(r) {
n = Array.isArray(r) ? r : [];
return n;
}).catch(function() {
return [];
});
return t;
}
function u(r, e) {
var n = r.find(function(r) {
return r && (r.category === e || r.name === e);
});
return n ? n.assetTypeIds || [] : [];
}
function o(r, e) {
for (var n = 0; n < r.length; n++) {
var t = r[n] && r[n].subcategories || [];
var a = t.find(function(r) {
return r && (r.subcategory === e || r.name === e);
});
if (a) return a.assetTypeIds || [];
}
return [];
}
function c() {
var e = window.__PurpuraSettings.get(r);
var n = e === undefined || e === null ? true : e === true;
a({
enabled: n
});
if (!n) return;
i().then(function(r) {
var e = new Set(u(r, "Accessories"));
o(r, "HairAccessories").forEach(function(r) {
e.add(r);
});
a({
enabled: true,
accessories: Array.from(e),
layered: u(r, "Clothing")
});
});
}
window.__PurpuraSettings.ready.then(c);
chrome.storage.onChanged.addListener(function(e, n) {
if (n === "local" && e[r]) c();
});
})();
