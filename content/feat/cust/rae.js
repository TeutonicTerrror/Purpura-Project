/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
if (window.purpuraAeditorIntegrated) return;
window.purpuraAeditorIntegrated = true;
const e = "rae";
const t = "content/feat/cust/aeditor";
const n = "purpura-aeditor-style";
const r = "purpura-aeditor-script";
const o = "purpura-aeditor-host";
let u = false;
let s = false;
let i = false;
let a = null;
let c = null;
let d = null;
let l = null;
let f = null;
let p = 0;
let m = "";
function h(e) {
return (e || "").replace(/\/+$/, "") || "/";
}
function y() {
return h(window.location.pathname);
}
function g() {
return y().startsWith("/my/avatar");
}
function E() {
return document.documentElement.classList.contains("dark-theme") || document.body?.classList.contains("dark-theme") ? "dark" : "light";
}
const b = "purpura-hide-rules";
function T() {
if (document.getElementById(b)) return;
const e = document.createElement("style");
e.id = b;
e.textContent = "#footer-container,#container-main{display:none!important}";
document.head.appendChild(e);
}
function w() {
window.postMessage({
type: "PURPURA_THEME",
theme: E()
}, "*");
}
function k() {
window.postMessage({
type: "PURPURA_THREE_URLS",
threeUrl: chrome.runtime.getURL(`${t}/three/three.min.js`),
gltfLoaderUrl: chrome.runtime.getURL(`${t}/three/GLTFLoader.js`),
mtlLoaderUrl: chrome.runtime.getURL(`${t}/three/MTLLoader.js`),
orbitControlsUrl: chrome.runtime.getURL(`${t}/three/OrbitControls.js`),
objLoaderUrl: chrome.runtime.getURL(`${t}/three/OBJLoader.js`)
}, "*");
}
function R() {
const e = [];
const t = (t, n) => {
if (typeof n === "string" && n.trim()) {
e.push({
kind: t,
value: n.trim()
});
}
};
try {
const e = document.querySelector('meta[name="csrf-token"], meta[name="x-csrf-token"]')?.content;
const n = document.querySelector('meta[name="x-bound-auth-token"], meta[name="bound-auth-token"]')?.content;
t("csrf", e);
t("bound", n);
[ "rbxBoundAuthToken", "x-bound-auth-token", "boundAuthToken", "csrf-token", "x-csrf-token" ].forEach(e => {
try {
const n = window.localStorage?.getItem(e) || window.sessionStorage?.getItem(e);
if (e.toLowerCase().includes("csrf")) {
t("csrf", n);
} else {
t("bound", n);
}
} catch (e) {}
});
} catch (e) {}
let n = "";
let r = "";
e.forEach(e => {
if (!n && e.kind === "csrf") n = e.value;
if (!r && e.kind === "bound") r = e.value;
});
window.postMessage({
type: "PURPURA_AUTH_HEADERS",
csrfToken: n,
boundAuthToken: r
}, "*");
}
function U(e, t = "GET") {
const n = String(t || "GET").trim().toUpperCase() || "GET";
const r = String(e || n).trim().toUpperCase();
const o = new Set([ "GET", "POST", "PUT", "PATCH", "DELETE", "HEAD" ]);
return o.has(r) ? r : n;
}
function S(e, t) {
return t === true;
}
async function A(e) {
if (!e || typeof e.requestId !== "string" || typeof e.url !== "string") return;
const t = U(e.method, "GET");
const n = typeof e.body === "string" && e.body.length > 0 ? e.body : undefined;
const r = t === "GET" || t === "HEAD" ? undefined : n;
const o = S(e.url, e.usePageFetch);
if (!o) {
try {
const n = await chrome.runtime.sendMessage({
type: "PURPURA_FETCH_RESOURCE_REQUEST",
requestId: e.requestId,
url: e.url,
method: t,
body: typeof e.body === "string" ? e.body : "",
accept: e.accept || "text/plain, application/json;q=0.9, */*;q=0.8",
csrfToken: typeof e.csrfToken === "string" ? e.csrfToken : "",
boundAuthToken: typeof e.boundAuthToken === "string" ? e.boundAuthToken : ""
});
window.postMessage({
type: "PURPURA_FETCH_RESOURCE_RESPONSE",
requestId: e.requestId,
ok: Boolean(n?.ok),
status: Number(n?.status) || 0,
contentType: n?.contentType || "",
csrfToken: n?.csrfToken || "",
boundAuthToken: n?.boundAuthToken || "",
text: n?.text || ""
}, "*");
} catch (t) {
window.postMessage({
type: "PURPURA_FETCH_RESOURCE_RESPONSE",
requestId: e.requestId,
ok: false,
status: 0,
contentType: "",
text: t?.message || String(t)
}, "*");
}
return;
}
try {
const n = new Headers;
if (e.accept) n.set("Accept", String(e.accept));
if (typeof e.csrfToken === "string" && e.csrfToken) n.set("x-csrf-token", e.csrfToken);
if (typeof e.boundAuthToken === "string" && e.boundAuthToken) n.set("x-bound-auth-token", e.boundAuthToken);
if (typeof e.contentType === "string" && e.contentType) n.set("Content-Type", e.contentType);
const o = await fetch(e.url, {
method: t,
credentials: "include",
mode: "cors",
referrer: window.location.href,
headers: n,
body: r
});
const u = await o.text();
window.postMessage({
type: "PURPURA_FETCH_RESOURCE_RESPONSE",
requestId: e.requestId,
ok: o.ok,
status: o.status,
contentType: o.headers.get("content-type") || "",
csrfToken: o.headers.get("x-csrf-token") || "",
boundAuthToken: o.headers.get("x-bound-auth-token") || "",
text: u
}, "*");
} catch (t) {
window.postMessage({
type: "PURPURA_FETCH_RESOURCE_RESPONSE",
requestId: e.requestId,
ok: false,
status: 0,
contentType: "",
text: t?.message || String(t)
}, "*");
}
}
function _() {
if (s) return;
s = true;
window.addEventListener("message", e => {
const t = e.data;
if (!t || typeof t.type !== "string") return;
if (t.type === "PURPURA_FETCH_RESOURCE_REQUEST") {
A(t);
}
});
}
function P() {
if (document.getElementById(n)) return;
const e = document.createElement("link");
e.id = n;
e.rel = "stylesheet";
e.href = chrome.runtime.getURL(`${t}/react/index.css`);
document.head.appendChild(e);
}
function v() {
const e = document.getElementById("content") || document.getElementById("container") || document.querySelector(".main-content") || document.querySelector(".content") || document.querySelector("main");
if (!e) return false;
T();
if (!document.getElementById("purpura-rae-style")) {
var t = document.createElement("style");
t.id = "purpura-rae-style";
t.textContent = ":root{--purpura-rae-host-bg-dark:#121215;--purpura-rae-host-bg-light:#ffffff}";
document.head.appendChild(t);
}
if (!document.getElementById(o)) {
e.style.display = "none";
const t = document.createElement("div");
t.id = o;
t.style.width = "100%";
t.style.minHeight = "100vh";
t.style.paddingTop = "64px";
t.style.boxSizing = "border-box";
t.style.position = "relative";
t.style.zIndex = "1";
t.style.backgroundColor = E() === "dark" ? "var(--purpura-rae-host-bg-dark)" : "var(--purpura-rae-host-bg-light)";
t.setAttribute("data-lpignore", "true");
t.setAttribute("data-1p-ignore", "true");
t.setAttribute("data-bwignore", "true");
const n = document.createElement("div");
n.id = "app";
n.setAttribute("data-lpignore", "true");
n.setAttribute("data-1p-ignore", "true");
n.setAttribute("data-bwignore", "true");
t.appendChild(n);
(document.body || e.parentElement).appendChild(t);
}
const n = document.getElementsByTagName("title")[0];
if (n) n.innerText = "Purpura Avatar Editor";
return true;
}
function C() {
if (f) {
clearInterval(f);
f = null;
}
}
function I() {
C();
p = 0;
const e = () => {
w();
k();
R();
};
e();
f = setInterval(() => {
p += 1;
e();
if (p >= 4) {
C();
}
}, 350);
}
function L() {
const e = document.getElementById(r);
if (e) {
if (e.dataset.loaded === "1") {
if (!i) {
i = true;
I();
} else {
w();
}
return;
}
e.addEventListener("load", () => {
e.dataset.loaded = "1";
i = true;
I();
}, {
once: true
});
return;
}
const n = document.createElement("script");
n.id = r;
n.src = chrome.runtime.getURL(`${t}/react/index.js`);
n.defer = true;
n.addEventListener("load", () => {
n.dataset.loaded = "1";
i = true;
I();
}, {
once: true
});
document.head.appendChild(n);
}
function x() {
if (!c) {
c = new MutationObserver(() => {
w();
});
c.observe(document.documentElement, {
attributes: true,
attributeFilter: [ "class" ],
subtree: false
});
}
if (document.body) {
if (!d) {
d = new MutationObserver(() => {
w();
});
}
d.observe(document.body, {
attributes: true,
attributeFilter: [ "class" ],
subtree: false
});
} else if (!l) {
l = new MutationObserver(() => {
if (!document.body) return;
if (!d) {
d = new MutationObserver(() => {
w();
});
}
d.observe(document.body, {
attributes: true,
attributeFilter: [ "class" ],
subtree: false
});
l.disconnect();
l = null;
});
l.observe(document.documentElement, {
childList: true,
subtree: true
});
}
}
function q() {
if (a) {
a.disconnect();
a = null;
}
if (c) {
c.disconnect();
c = null;
}
if (d) {
d.disconnect();
d = null;
}
if (l) {
l.disconnect();
l = null;
}
C();
}
function O() {
if (!u || !g()) return;
if (!v()) return;
_();
P();
L();
x();
if (a) {
a.disconnect();
a = null;
}
m = y();
}
function B() {
if (a) return;
a = new MutationObserver(() => {
if (!u || !g()) return;
if (m === y() && document.getElementById(o)) return;
O();
});
a.observe(document.documentElement, {
childList: true,
subtree: true
});
}
function H(e) {
e = false;
const t = u;
u = e;
if (!u) {
q();
if (t && g()) {
window.location.reload();
}
return;
}
if (!g()) {
q();
return;
}
_();
O();
if (!document.getElementById(o)) {
B();
}
}
function M() {
m = "";
if (!g()) {
const e = document.getElementById(b);
if (e) e.remove();
}
if (u && g()) {
O();
if (!document.getElementById(o)) {
B();
}
}
}
const F = history.pushState;
history.pushState = function(...e) {
const t = F.apply(this, e);
M();
return t;
};
const j = history.replaceState;
history.replaceState = function(...e) {
const t = j.apply(this, e);
M();
return t;
};
window.addEventListener("popstate", M);
window.__PurpuraSettings.ready.then(function() {
H(false);
try {
if (window.__PurpuraSettings.get(e) === true) window.__PurpuraSettings.set(e, false);
} catch (e) {}
});
chrome.storage.onChanged.addListener((t, n) => {
if (n !== "sync" && n !== "local") return;
if (!t[e]) return;
if (window.__PurpuraSettings.get(e) === true) try {
window.__PurpuraSettings.set(e, false);
} catch (e) {}
H(false);
});
})();
