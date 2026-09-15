/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
"use strict";
var e;
var n;
e = new Promise(function(e) {
n = e;
});
function s(e) {
return undefined;
}
function c(e, n) {
return Promise.resolve();
}
var r = {
get: s,
set: c,
ready: e,
STORAGE_MAP: {}
};
window.__PurpuraSettings = r;
try {
const a = {
bd: "sync",
ps: "sync",
qs: "sync",
explr: "sync",
pg: "sync",
go: "sync",
qp: "sync",
glw: "sync",
fm: "sync",
lo: "sync",
as: "sync",
ia: "sync",
ac: "sync",
nr: "sync",
rconv: "sync",
biv: "sync",
up: "sync",
tse: "sync",
slr: "sync",
rr: "sync",
pb: "sync",
si: "sync",
spc: "sync",
sap: "local",
bc: "local",
bcAutoRefresh: "local",
lts: "sync",
gr: "local",
"spc-legacy": "sync",
thm: "local",
thmEnabled: "local",
frpt: "sync",
ghos: "local",
hpt: "local",
unc: "local",
uncConfig: "local",
pcr: "local",
pt: "local",
sdbr: "local",
bwr: "local",
rat: "local",
stm: "local",
lb: "local",
bsn: "sync",
es: "sync",
qse: "sync",
dva: "sync",
rae: "sync",
ob: "local",
pinnedGamesList: "local",
pinnedGamesFolders: "local",
pgfCollapsed: "local",
widgetPosition: "local",
recentGames: "local",
widgetSortMode: "local",
r6w: "sync",
pfl: "sync",
oilp: "sync"
};
const t = {};
let o = false;
async function l() {
try {
var e = chrome.runtime.getURL("data/default_settings.json");
var n = await fetch(e);
if (n.ok) return await n.json();
} catch (e) {}
return {
bd: {
enabled: true,
showDatabase: true,
roundToWholeNumbers: true
},
ps: true,
qs: true,
explr: true,
ac: true,
bc: true,
bcAutoRefresh: true,
spc: {
enabled: false,
mode: "offline"
},
si: {
enabled: true,
info: {
region: true,
ping: true,
fps: true,
serverVersion: false,
serverId: false
}
}
};
}
function i(e) {
return a[e] === "local" ? chrome.storage.local : chrome.storage.sync;
}
u().catch(function() {
n();
});
async function u() {
var e = await l();
var s = await Promise.all([ new Promise(function(e) {
chrome.storage.sync.get(null, e);
}), new Promise(function(e) {
chrome.storage.local.get(null, e);
}) ]);
var c = s[0] || {};
var r = s[1] || {};
if (r.rae !== undefined && c.rae === undefined) {
c.rae = r.rae;
chrome.storage.sync.set({
rae: r.rae
});
}
if (c.qse !== undefined && c.es === undefined) {
c.es = c.qse;
chrome.storage.sync.set({
es: c.qse
});
}
var i = {};
var u = {};
var f = new Set;
Object.keys(a).forEach(function(e) {
f.add(e);
});
Object.keys(e).forEach(function(e) {
f.add(e);
});
f.forEach(function(n) {
var s = a[n] || "sync";
var o = s === "sync" ? c[n] : r[n];
if (o !== undefined) {
t[n] = o;
} else if (e[n] !== undefined) {
t[n] = e[n];
if (s === "sync") {
i[n] = e[n];
} else {
u[n] = e[n];
}
}
});
if (t["es"] === undefined && t["qse"] !== undefined) {
t["es"] = t["qse"];
if (a["es"] === "sync") i["es"] = t["qse"]; else u["es"] = t["qse"];
}
if (t["rae"] === true) {
t["rae"] = false;
i["rae"] = false;
}
if (Object.keys(i).length) chrome.storage.sync.set(i);
if (Object.keys(u).length) chrome.storage.local.set(u);
o = true;
n();
}
function f(e) {
return t[e];
}
function y(e) {
return t[e];
}
function d(e, n) {
t[e] = n;
var s = i(e);
var c = {};
c[e] = n;
return new Promise(function(e) {
s.set(c, e);
});
}
chrome.storage.onChanged.addListener(function(e, n) {
Object.keys(e).forEach(function(s) {
var c = a[s] || "sync";
if (n === c) {
t[s] = e[s].newValue;
}
});
});
window.__PurpuraSettings = {
get: f,
getRaw: y,
set: d,
ready: e,
STORAGE_MAP: a
};
} catch (g) {
n();
}
})();
