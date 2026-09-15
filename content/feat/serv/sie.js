/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
"use strict";
if (window.__purpuraServerIdExtractorLoaded) return;
window.__purpuraServerIdExtractorLoaded = true;
const e = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function r(r) {
if (r === null || r === undefined) return null;
const t = String(r).trim();
if (!t) return null;
return e.test(t) ? t : null;
}
function t(e) {
if (!e || typeof e !== "object") return null;
const t = [ e, e.server, e.serverData, e.instance, e.item, e.props, e.children && e.children.props, e.details ];
for (const e of t) {
if (!e || typeof e !== "object") continue;
const t = r(e.id || e.gameId || e.gameInstanceId || e.jobId || e.serverId || e.uuid);
const n = e.accessCode || e.accesscode || null;
const i = e.vipServerId || e.privateServerId || e.vipserverid || null;
if (t || n || i) {
return {
serverId: t,
accessCode: n,
privateServerId: i
};
}
}
return null;
}
function n(e) {
if (!e) return null;
const r = new Set;
const n = [ e ];
let i = null;
let s = null;
let d = 0;
while (n.length && d < 120) {
d += 1;
const e = n.shift();
if (!e || r.has(e)) continue;
r.add(e);
const c = [ e.memoizedProps, e.pendingProps, e.stateNode && e.stateNode.props ];
for (const e of c) {
const r = t(e);
if (!r) continue;
if (!i && r.accessCode) i = r.accessCode;
if (!s && r.privateServerId) s = r.privateServerId;
if (r.serverId) {
return {
serverId: r.serverId,
accessCode: i,
privateServerId: s
};
}
}
if (e.return) n.push(e.return);
if (e.child) n.push(e.child);
if (e.sibling) n.push(e.sibling);
if (e.alternate) n.push(e.alternate);
}
if (i || s) {
return {
serverId: null,
accessCode: i,
privateServerId: s
};
}
return null;
}
function i(e) {
let r = e;
let t = 0;
while (r && t < 5) {
const e = Object.keys(r);
for (const t of e) {
if (t.indexOf("__reactFiber$") === 0 || t.indexOf("__reactInternalInstance$") === 0) {
const e = r[t];
if (e) return e;
}
if (t.indexOf("__reactContainer$") === 0) {
const e = r[t];
if (e && e.current) return e.current;
}
}
r = r.parentElement;
t += 1;
}
return null;
}
window.addEventListener("purpura-extract-serverid-request", function(e) {
const r = e && e.detail && e.detail.extractionId;
if (!r) return;
try {
const e = document.querySelector('[data-purpura-extraction-id="' + r + '"]');
if (!e) {
window.dispatchEvent(new CustomEvent("purpura-serverid-extracted", {
detail: {
extractionId: r,
serverId: null,
error: "element_not_found"
}
}));
return;
}
const t = i(e);
const s = n(t);
window.dispatchEvent(new CustomEvent("purpura-serverid-extracted", {
detail: {
extractionId: r,
serverId: s && s.serverId ? s.serverId : null,
accessCode: s && s.accessCode ? s.accessCode : null,
privateServerId: s && s.privateServerId ? s.privateServerId : null
}
}));
} catch (e) {
window.dispatchEvent(new CustomEvent("purpura-serverid-extracted", {
detail: {
extractionId: r,
serverId: null,
error: e && e.message ? e.message : String(e)
}
}));
}
});
})();
