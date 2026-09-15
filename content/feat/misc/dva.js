/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
const e = "dva";
const t = '#carousel-game-details, [data-testid="game-carousel"], .game-carousel';
const n = 'video, .video-preview-wrapper, [data-testid="video-preview-wrapper"], ' + ".carousel-video, .game-preview-video-container, " + 'iframe[src*="youtube-nocookie.com/embed"], iframe[src*="youtube.com/embed"]';
const o = 'iframe[src*="youtube-nocookie.com/embed"], iframe[src*="youtube.com/embed"]';
const r = 4e3;
const i = 6e4;
let a = false;
let c = null;
let u = null;
let s = 0;
let d = null;
const l = new WeakSet;
function f() {
if (Date.now() - s > r) return false;
if (!d || !d.closest) return false;
return !!d.closest(n);
}
function m(e) {
s = Date.now();
d = e.target;
}
function v() {
const e = document.querySelectorAll(t);
for (let t = 0; t < e.length; t++) {
e[t].setAttribute("data-is-video-autoplayed-on-ready", "false");
}
}
function y() {
const e = document.querySelectorAll(t);
for (let t = 0; t < e.length; t++) {
e[t].removeAttribute("data-is-video-autoplayed-on-ready");
}
}
function g(e) {
if (!a) return;
const t = e.target;
if (t && t.tagName === "VIDEO" && !f()) t.pause();
}
function p(e) {
try {
e.contentWindow.postMessage(JSON.stringify({
event: "command",
func: "pauseVideo",
args: ""
}), "*");
} catch (e) {}
}
function b(e) {
if (!a) return;
let t;
try {
t = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
} catch (e) {
return;
}
if (!t || typeof t !== "object") return;
const n = t.event === "infoDelivery" && t.info && t.info.playerState === 1;
if (!n) return;
const r = document.querySelectorAll(o);
let i = false;
for (let t = 0; t < r.length; t++) {
if (r[t].contentWindow === e.source) {
if (!l.has(r[t])) {
p(r[t]);
l.add(r[t]);
}
i = true;
break;
}
}
if (!i) {
for (let e = 0; e < r.length; e++) {
if (!l.has(r[e])) {
p(r[e]);
l.add(r[e]);
}
}
}
}
function w() {
if (c) return;
const e = document.documentElement || document;
c = new MutationObserver(function() {
v();
});
c.observe(e, {
childList: true,
subtree: true
});
u = setTimeout(h, i);
}
function h() {
if (c) {
c.disconnect();
c = null;
}
if (u) {
clearTimeout(u);
u = null;
}
}
function E() {
if (a) {
v();
w();
} else {
h();
y();
}
}
function L() {
chrome.storage.sync.get(e, function(t) {
a = t[e] === true;
E();
});
}
L();
chrome.storage.onChanged.addListener(function(t, n) {
if (n !== "sync" || !t[e]) return;
L();
});
document.addEventListener("pointerdown", m, true);
document.addEventListener("keydown", m, true);
document.addEventListener("touchstart", m, true);
window.addEventListener("message", b);
document.addEventListener("play", g, true);
})();
