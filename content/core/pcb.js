/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
"use strict";
if (window.__purpuraBridgeLoaded) return;
window.__purpuraBridgeLoaded = true;
async function e(e, t) {
const s = {
method: t && t.method || "GET",
headers: t && t.headers || {},
credentials: "include",
referrer: t && t.referrer || undefined
};
if (t && t.body !== undefined) s.body = t.body;
const a = await fetch(e, s);
const n = {};
a.headers.forEach((e, t) => n[t] = e);
const r = await a.text();
let d = null;
try {
d = r ? JSON.parse(r) : null;
} catch (e) {
d = null;
}
return {
status: a.status,
ok: a.ok,
statusText: a.statusText,
headers: n,
bodyText: r,
bodyJson: d
};
}
document.addEventListener("purpura-fetch-request", async t => {
const {callbackId: s, url: a, options: n} = t.detail || {};
try {
const t = await e(a, n || {});
if (t.status === 403 && t.headers && t.headers["x-csrf-token"]) {
const r = t.headers["x-csrf-token"];
const d = Object.assign({}, n || {});
d.headers = Object.assign({}, d.headers || {}, {
"X-Csrf-Token": r
});
const c = await e(a, d);
document.dispatchEvent(new CustomEvent("purpura-fetch-response", {
detail: {
callbackId: s,
response: {
attempts: [ t, c ],
final: c
}
}
}));
return;
}
document.dispatchEvent(new CustomEvent("purpura-fetch-response", {
detail: {
callbackId: s,
response: {
attempts: [ t ],
final: t
}
}
}));
} catch (e) {
document.dispatchEvent(new CustomEvent("purpura-fetch-response", {
detail: {
callbackId: s,
error: e && e.message || String(e)
}
}));
}
});
})();
