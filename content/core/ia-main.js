/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
var AccessoryAssetTypes = [ 8, 41, 42, 43, 44, 45, 46, 47 ], LayeredAssetTypes = [ 64, 65, 66, 67, 68, 69, 70, 71, 72, 41 ];

(function() {
"use strict";
if (window.__PURPURA_IA_INTERCEPTOR_SETUP__) return;
window.__PURPURA_IA_INTERCEPTOR_SETUP__ = true;
var e = false;
document.addEventListener("purpura:infinite-avatar", function(s) {
var r = s.detail;
if (!r) return;
if (typeof r.enabled === "boolean") {
window.purpuraInfiniteAvatarEnabled = r.enabled;
e = r.enabled;
}
if (Array.isArray(r.accessories)) AccessoryAssetTypes = r.accessories;
if (Array.isArray(r.layered)) LayeredAssetTypes = r.layered;
});
var s = function(s) {
if (!s || s.__purpura_patched) return;
s.__purpura_patched = true;
var r = s.getAdvancedAccessoryLimit;
s.getAdvancedAccessoryLimit = function(s) {
if (e) {
var t = Number(s);
if (AccessoryAssetTypes.includes(t) || LayeredAssetTypes.includes(t)) return 100;
}
return r ? r.call(this, s) : 10;
};
var t = s.addAssetToAvatar;
s.addAssetToAvatar = function(s, r) {
if (!e) return t.apply(this, arguments);
var a = t.apply(this, arguments).filter(function(e) {
var s = e && e.assetType ? e.assetType.id : undefined;
return !AccessoryAssetTypes.includes(s) && !LayeredAssetTypes.includes(s);
});
var n = [ s ].concat(r);
var i = [], c = new Set;
for (var d = 0; d < n.length; d++) {
var u = n[d];
if (u && u.id && !c.has(u.id)) {
var y = u.assetType ? u.assetType.id : undefined;
if (AccessoryAssetTypes.includes(y) || LayeredAssetTypes.includes(y)) {
i.push(u);
c.add(u.id);
}
}
}
var o = {
accessory: 0,
layered: 0
}, p = {
accessory: 10,
layered: 10
};
for (var A = 0; A < i.length; A++) {
var l = i[A];
var f = l.assetType ? l.assetType.id : undefined;
AccessoryAssetTypes.includes(f) ? o.accessory < p.accessory && (a.push(l), o.accessory++) : LayeredAssetTypes.includes(f) && o.layered < p.layered && (a.push(l), 
o.layered++);
}
return a;
};
};
(function() {
var e = window.Roblox;
var r = function(e) {
var r = e.AvatarAccoutrementService;
r && s(r);
Object.defineProperty(e, "AvatarAccoutrementService", {
configurable: true,
enumerable: true,
get: function() {
return r;
},
set: function(e) {
r = e;
s(e);
}
});
};
e ? r(e) : Object.defineProperty(window, "Roblox", {
configurable: true,
enumerable: true,
get: function() {
return e;
},
set: function(s) {
e = s;
s && typeof s === "object" && r(s);
}
});
var t = function() {
var e = arguments;
var s = e[0], r = e[1];
var t = 0, a = 0;
var n = AccessoryAssetTypes.includes(s.assetType.id), i = LayeredAssetTypes.includes(s.assetType.id), c = [];
for (var d = r.toReversed(), u = 0; u < d.length; u++) {
var y = d[u], o = true;
AccessoryAssetTypes.includes(y.assetType.id) && (t++, t >= 10 && n && (o = false));
LayeredAssetTypes.includes(y.assetType.id) && (a++, a >= 10 && i && (o = false));
!n && !i && s.assetType.id === y.assetType.id && (o = false);
o && c.push(y);
}
return c.reverse(), c.push(s), c;
};
var a = Object.defineProperty;
Object.defineProperty = function(e, s, r) {
if (s === "__esModule") setTimeout(function() {
if (Object.keys(e).includes("addAssetToAvatar")) {
var s = Object.getOwnPropertyDescriptor(e, "addAssetToAvatar").get, r = s();
Object.defineProperty(e, "addAssetToAvatar", {
get: function() {
return function() {
var e = arguments[0], s = AccessoryAssetTypes.includes(e.assetType.id), a = LayeredAssetTypes.includes(e.assetType.id), n = s || a;
return window.purpuraInfiniteAvatarEnabled && n ? t.apply(null, arguments) : r.apply(this, arguments);
};
},
configurable: true
});
}
}, 1);
return s === "addAssetToAvatar" && (r.configurable = true), a.call(Object, e, s, r);
};
})();
})();
