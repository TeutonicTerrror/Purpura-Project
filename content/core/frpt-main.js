/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
"use strict";
if (window.__PURPURA_FRPT_INTERCEPTOR__) return;
window.__PURPURA_FRPT_INTERCEPTOR__ = true;
const t = "https://apis.roblox.com/guac-v2/v1/bundles/account-settings-ui";
const e = "https://apis.roblox.com/user-settings-api/v1/user-settings";
const r = "purpura_freeRobloxPlusThemes";
let n = false;
try {
n = sessionStorage.getItem(r) === "true";
} catch {}
document.addEventListener("purpura:frpt-enabled", t => {
n = t.detail === true;
try {
sessionStorage.setItem(r, String(n));
} catch {}
});
function s(e) {
try {
const r = new URL(e, window.location.origin);
const n = new URL(t);
return r.origin === n.origin && r.pathname === n.pathname;
} catch {
return false;
}
}
function o(t) {
try {
const r = new URL(t, window.location.origin);
const n = new URL(e);
return r.origin === n.origin && r.pathname === n.pathname;
} catch {
return false;
}
}
function p(t) {
return !t || typeof t !== "object" || Array.isArray(t) || t.appThemesAccess === "Enabled" ? false : (t.appThemesAccess = "Enabled", 
true);
}
function i(t) {
if (!t || typeof t !== "object" || Array.isArray(t)) return;
document.dispatchEvent(new CustomEvent("purpura:user-settings-response", {
detail: t
}));
}
function c(t, e) {
const r = new Headers(t.headers);
r.delete("content-length");
r.delete("content-encoding");
return new Response(JSON.stringify(e), {
status: t.status,
statusText: t.statusText,
headers: r
});
}
const u = window.fetch;
window.fetch = async function(...t) {
const e = t[0];
const r = typeof e === "string" ? e : e instanceof Request ? e.url : "";
let a = await u(...t);
if (n && s(r)) {
try {
const t = await a.clone().json();
if (p(t)) a = c(a, t);
} catch {}
}
if (typeof r === "string" && o(r)) {
a.clone().json().then(i).catch(() => {});
}
return a;
};
const a = XMLHttpRequest.prototype.open;
const f = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.open = function(t, e, ...r) {
this._purpura_frpt_account_settings_ui = typeof e === "string" && s(e);
this._purpura_frpt_url = typeof e === "string" ? e : "";
return a.apply(this, [ t, e, ...r ]);
};
XMLHttpRequest.prototype.send = function(...t) {
const e = this;
if (e._purpura_frpt_account_settings_ui && n) {
Object.defineProperty(e, "responseText", {
configurable: true,
get: function() {
if (e._purpura_frpt_cached_response) return e._purpura_frpt_cached_response;
const t = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, "responseText").get.call(this);
if (this.readyState !== 4) return t;
try {
const r = JSON.parse(t);
p(r);
return e._purpura_frpt_cached_response = JSON.stringify(r);
} catch {
return t;
}
}
});
Object.defineProperty(e, "response", {
configurable: true,
get: function() {
if (this.responseType === "json") {
try {
return JSON.parse(this.responseText);
} catch {
return Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, "response").get.call(this);
}
}
return this.responseText;
}
});
}
e.addEventListener("load", function() {
if (typeof e._purpura_frpt_url === "string" && o(e._purpura_frpt_url)) {
try {
i(JSON.parse(e.responseText));
} catch {}
}
});
return f.apply(this, t);
};
})();
