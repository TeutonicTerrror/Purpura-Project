/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
"use strict";
if (window.PurpuraHBAClient) return;
const t = "x-bound-auth-token";
const e = 'meta[name="hardware-backed-authentication-data"]';
const n = 'meta[name="user-data"]';
const a = /name="hardware-backed-authentication-data"(\s|.)+?data-is-secure-authentication-intent-enabled="(.+?)"(\s|.)+?data-is-bound-auth-token-enabled="(.+?)"(\s|.)+?data-bound-auth-token-whitelist="(.+?)"(\s|.)+?data-bound-auth-token-exemptlist="(.+?)"(\s|.)+?data-hba-indexed-db-name="(.+?)"(\s|.)+?data-hba-indexed-db-obj-store-name="(.+?)"(\s|.)+?data-hba-indexed-db-key-name="(.+?)"(\s|.)+?data-hba-indexed-db-version="(.+?)"/;
const r = /<meta[^name=]name="user-data"/;
const i = "https://www.roblox.com/charts";
const s = ".roblox.com";
const o = [ "/account-switcher/v1/switch" ];
const c = {
name: "ECDSA",
hash: {
name: "SHA-256"
}
};
function d(t) {
const e = /&(nbsp|amp|quot|lt|gt);/g;
const n = {
nbsp: " ",
amp: "&",
quot: '"',
lt: "<",
gt: ">"
};
return t.replace(e, function(t, e) {
return n[e];
}).replace(/&#(\d+);/gi, function(t, e) {
const n = parseInt(e, 10);
return String.fromCharCode(n);
});
}
async function u(t) {
const e = (new TextEncoder).encode(t);
const n = await crypto.subtle.digest(c.hash.name, e);
return l(n);
}
function l(t) {
let e = "";
const n = new Uint8Array(t);
for (let t = 0; t < n.byteLength; t++) e += String.fromCharCode(n[t]);
return btoa(e);
}
async function h(t, e) {
const n = await crypto.subtle.sign(c, t, (new TextEncoder).encode(e));
return l(n);
}
function b(t) {
return new Promise(e => {
const n = indexedDB.open(t);
n.onsuccess = () => {
n.result.close();
e(true);
};
n.onupgradeneeded = t => {
t.target?.transaction?.abort();
e(false);
};
});
}
async function f(t, e, n) {
let a = 1;
if ("databases" in indexedDB) {
const e = (await indexedDB.databases()).find(e => e.name === t);
if (!e) return null;
e?.version && (a = e.version);
} else if (!await b(t)) {
return null;
}
return new Promise((r, i) => {
const s = indexedDB.open(t, a);
s.onsuccess = () => {
try {
const t = s.result;
const a = t.transaction(e, "readonly");
const o = a.objectStore(e).get(n);
o.onsuccess = () => {
r(o.result);
};
o.onerror = () => {
i(s.error);
};
a.oncomplete = () => {
t.close();
};
} catch (t) {
i(t);
}
};
s.onerror = () => {
i(s.error);
};
});
}
function y(t) {
const e = {};
for (const n in t) {
const a = t[n];
a != null && (e[n] = a);
}
return e;
}
class p {
fetch(t, e) {
const n = new Headers(y(this.headers));
if (e?.headers) {
const t = new Headers(e.headers);
for (const [e, a] of t) n.set(e, a);
}
this.cookie && n.set("cookie", this.cookie);
const a = {
...e,
headers: n
};
this.onSite && (a.credentials = "include");
return (this._fetchFn ?? fetch)(t, a);
}
async generateBaseHeadersFromUnsignedBAT(e, n, a) {
if (!await this.isUrlIncludedInWhitelist(e, n)) return {};
const r = await this.signBATData(a);
return r ? {
[t]: r
} : {};
}
async generateBaseHeaders(e, n, a, r) {
if (!await this.isUrlIncludedInWhitelist(e, a)) return {};
const i = await this.generateBAT(e.toString(), n, r);
return i ? {
[t]: i
} : {};
}
async generateSAIObject(t) {
const e = await this.getCryptoKeyPair();
if (!e?.privateKey) return null;
const n = l(await crypto.subtle.exportKey("spki", e.publicKey));
const a = Math.floor(Date.now() / 1e3);
const r = [ n, a, t ].join("|");
const i = await h(e.privateKey, r);
return {
clientPublicKey: n,
clientEpochTimestamp: a,
saiSignature: i,
serverNonce: t
};
}
async getTokenMetadata(t) {
if (!t && await this.cachedTokenMetadata) return this.cachedTokenMetadata;
const i = (async () => {
let i;
let s;
let o;
let c;
let u;
let l;
let h;
let b;
let f;
let y;
const p = "DOMParser" in globalThis && "document" in globalThis;
if (t || !p || !document.querySelector?.(e) || !document.querySelector?.(n) && document?.readyState === "loading") {
const t = await this.fetch(this.urls.fetchTokenMetadataUrl).then(t => t.text()).catch(() => {});
if (!t) return null;
if (p) {
y = (new DOMParser).parseFromString(t, "text/html");
} else {
const e = t.match(a);
if (!e) return null;
try {
f = r.test(t);
i = e[2] === "true";
s = e[4] === "true";
try {
o = JSON.parse(d(e[6]))?.Whitelist?.map(t => ({
...t,
sampleRate: Number(t.sampleRate)
}));
} catch (t) {
o = [];
}
try {
c = JSON.parse(d(e[8]))?.Exemptlist;
} catch (t) {
c = [];
}
u = e[10];
l = e[12];
h = e[14];
b = parseInt(e[16], 10) || 1;
} catch (t) {
return this.cachedTokenMetadata = undefined, null;
}
}
} else {
y = document;
}
if (y) {
const t = y.querySelector?.(e);
if (!t) return null;
try {
f = !!y.querySelector?.(n);
i = t.getAttribute("data-is-secure-authentication-intent-enabled") === "true";
s = t.getAttribute("data-is-bound-auth-token-enabled") === "true";
try {
o = JSON.parse(t.getAttribute("data-bound-auth-token-whitelist"))?.Whitelist?.map(t => ({
...t,
sampleRate: Number(t.sampleRate)
}));
} catch (t) {
o = [];
}
try {
c = JSON.parse(t.getAttribute("data-bound-auth-token-exemptlist"))?.Exemptlist;
} catch (t) {
c = [];
}
u = t.getAttribute("data-hba-indexed-db-name");
l = t.getAttribute("data-hba-indexed-db-obj-store-name");
h = t.getAttribute("data-hba-indexed-db-key-name");
b = parseInt(t.getAttribute("data-hba-indexed-db-version"), 10) || 1;
} catch (t) {
return this.cachedTokenMetadata = undefined, null;
}
}
const m = {
isSecureAuthenticationIntentEnabled: i,
isBoundAuthTokenEnabledForAllUrls: s,
boundAuthTokenWhitelist: o,
boundAuthTokenExemptlist: c,
hbaIndexedDbName: u,
hbaIndexedDbObjStoreName: l,
hbaIndexedDbKeyName: h,
hbaIndexedDbVersion: b,
isAuthenticated: f
};
return this.cachedTokenMetadata = m, m;
})();
return this.cachedTokenMetadata = i, i;
}
async getCryptoKeyPair(t) {
if (this.suppliedCryptoKeyPair) return this.suppliedCryptoKeyPair;
if (!t && await this.cryptoKeyPair) return this.cryptoKeyPair;
if (!("indexedDB" in globalThis)) return null;
const e = (async () => {
const e = await this.getTokenMetadata(t);
if (!e) return null;
try {
const t = await f(e.hbaIndexedDbName, e.hbaIndexedDbObjStoreName, e.hbaIndexedDbKeyName);
return this.cryptoKeyPair = t ?? undefined, t;
} catch (t) {
return this.cryptoKeyPair = undefined, null;
}
})();
return this.cryptoKeyPair = e, e;
}
async signBATData([t, e, n, a]) {
const r = await this.getCryptoKeyPair();
if (!r?.privateKey) return null;
const i = await Promise.all([ h(r.privateKey, n), h(r.privateKey, a) ]);
return [ "v1", t, e, i[0], i[1] ].join("|");
}
async generateUnsignedBAT(t, e = "GET", n) {
const a = Math.floor(Date.now() / 1e3).toString();
let r;
if (typeof n === "object") r = JSON.stringify(n); else if (typeof n === "string") r = n;
const i = await u(r);
const s = [ i, a, t.toString(), e.toUpperCase() ].join("|");
const o = [ "", a, t.toString(), e.toUpperCase() ].join("|");
return [ i, a, s, o ];
}
async generateBAT(t, e = "GET", n) {
return (await this.getCryptoKeyPair())?.privateKey ? await this.signBATData(await this.generateUnsignedBAT(t, e, n)) : null;
}
async isUrlIncludedInWhitelist(t, e) {
const n = t.toString();
if (!n.toString().includes(this.urls.matchRobloxBaseUrl)) return false;
if (this.onSite && this.urls.currentUrl) {
try {
if (!new URL(n, this.urls.currentUrl).href.includes(this.urls.matchRobloxBaseUrl)) return false;
} catch (t) {}
}
if (this.urls.forceBATUrls.some(t => n.includes(t))) return true;
const a = await this.getTokenMetadata();
return !e || !(a?.isAuthenticated || this.isAuthenticated) ? false : !!a && (a.isBoundAuthTokenEnabledForAllUrls || !!a.boundAuthTokenWhitelist?.some(t => n.includes(t.apiSite) && Math.floor(Math.random() * 100) < t.sampleRate)) && !a.boundAuthTokenExemptlist?.some(t => n.includes(t.apiSite));
}
constructor({fetch: t, headers: e, onSite: n, keys: a, urls: r, cookie: c} = {}) {
this._fetchFn = undefined;
this.cachedTokenMetadata = undefined;
this.headers = {};
this.cryptoKeyPair = undefined;
this.onSite = false;
this.suppliedCryptoKeyPair = undefined;
this.cookie = undefined;
this.isAuthenticated = undefined;
this.urls = {
fetchTokenMetadataUrl: i,
matchRobloxBaseUrl: s,
forceBATUrls: o
};
if (t) this._fetchFn = t;
if (e) this.headers = e instanceof Headers ? Object.fromEntries(e) : e;
if (r) {
for (const t in r) this.urls[t] = r[t];
}
if (n) {
this.onSite = n;
if (globalThis?.location?.href && !r?.currentUrl) this.urls.currentUrl = globalThis.location.href;
}
if (a) this.suppliedCryptoKeyPair = a;
if (c) this.cookie = c;
}
}
window.PurpuraHBAClient = p;
})();
