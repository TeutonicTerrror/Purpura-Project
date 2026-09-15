/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
"use strict";
if (window.__purpuraR6WarningRemoverLoaded) return;
window.__purpuraR6WarningRemoverLoaded = true;
var e = "r6w";
var t = ".avatar-type-contents-container .MuiToggleButtonGroup-root";
var r = '.MuiToggleButtonGroup-root, [role="group"]';
var n = 'div[role="presentation"].MuiDialog-root';
var o = 'div[role="dialog"].foundation-web-dialog-content';
var a = '.MuiDialog-root, div[role="dialog"], [data-state="open"].foundation-web-dialog-content';
var i = ".toggle-three-dee";
var c = "purpuraR6Patched";
var u = true;
var l = 0;
var f = null;
var s = null;
var d = location.href;
function h() {
return window.location.pathname.toLowerCase().indexOf("/my/avatar") !== -1;
}
function v(e) {
if (e === undefined) return true;
return e === true;
}
function y() {
var e = document.querySelector(i) || document.querySelector('[class*="toggle-three"]') || document.querySelector('button[class*="toggle"]');
if (!e) return;
var t = (e.textContent || "").trim();
e.click();
setTimeout(function() {
try {
if ((e.textContent || "").trim() !== t) e.click();
} catch (e) {}
}, 150);
}
function m(e) {
if (!e || e.dataset[c]) return;
e.dataset[c] = "true";
var t = e.querySelectorAll("button");
t.forEach(function(e) {
e.addEventListener("click", function() {
l = Date.now();
t.forEach(function(t) {
var r = t === e;
t.setAttribute("aria-pressed", String(r));
if (r) t.classList.add("selected", "Mui-selected"); else t.classList.remove("selected", "Mui-selected");
});
}, {
capture: true
});
});
}
document.addEventListener("click", function(e) {
var t = e.target && e.target.closest ? e.target.closest("button") : null;
if (!t) return;
if (!h() || !u) return;
var r = (t.textContent || "").trim();
var n = r.toUpperCase();
var o = n === "R6" || n === "R15";
var a = t.closest(".MuiToggleButtonGroup-root") || t.closest('[role="group"]') || t.closest(".avatar-type-contents-container");
var i = false;
if (a) {
var c = a.querySelectorAll ? a.querySelectorAll("button") : [];
if (c.length >= 2) i = true;
if (a.closest && a.closest(".avatar-type-contents-container")) i = true;
}
if (o || i) {
if (o) {
l = Date.now();
return;
}
if (a && a.closest && a.closest(".avatar-type-contents-container")) {
l = Date.now();
} else if (o) {
l = Date.now();
}
}
}, true);
function p(e) {
var t = e.querySelectorAll("button");
for (var r = 0; r < t.length; r++) {
if ((t[r].textContent || "").trim().toLowerCase() === "switch") return t[r];
}
var n = (e.textContent || "").toLowerCase();
var o = n.indexOf("r6 characters have limitations") !== -1 || n.indexOf("r6") !== -1 && n.indexOf("warning") !== -1;
if (o && t.length >= 2) {
return t[t.length - 1];
}
if (t.length) return t[t.length - 1];
return null;
}
function g(e) {
if (!e) return false;
var t = (e.textContent || "").toLowerCase();
if (t.indexOf("r6 characters have limitations") !== -1) return true;
if (t.indexOf("r6") !== -1 && t.indexOf("unsupported items will be removed") !== -1) return true;
if (t.indexOf("switch") !== -1 && t.indexOf("r6") !== -1) return true;
var r = false;
var n = e.querySelectorAll("button");
for (var o = 0; o < n.length; o++) if ((n[o].textContent || "").trim().toLowerCase() === "switch") {
r = true;
break;
}
if (r && t.indexOf("warning") !== -1) return true;
return false;
}
function S(e) {
if (!e || !e.isConnected) return;
if (!g(e)) return;
if (Date.now() - l > 1500) return;
var t = p(e);
if (!t) return;
try {
var r = e.closest("[data-radix-portal]") || e.closest('div[role="presentation"]') || e;
if (r && r !== e) {
r.style.visibility = "hidden";
r.style.opacity = "0";
r.style.pointerEvents = "none";
}
e.style.visibility = "hidden";
e.style.opacity = "0";
e.style.pointerEvents = "none";
var n = document.querySelector('[data-radix-portal] [data-state="open"].foundation-web-dialog-content');
if (n && n !== e) {
try {
n.style.visibility = "hidden";
} catch (e) {}
}
} catch (e) {}
try {
t.click();
} catch (e) {}
setTimeout(function() {
y();
}, 200);
}
function q(e) {
var n = [];
function o(t) {
try {
if (e && e.nodeType === 1 && e.matches && e.matches(t)) n.push(e);
var r = e && e.querySelectorAll ? e.querySelectorAll(t) : document.querySelectorAll(t);
r.forEach(function(e) {
n.push(e);
});
} catch (e) {}
}
o(t);
if (!n.length) o(r);
return n;
}
function w(e) {
var t = [];
function r(r) {
try {
if (e && e.nodeType === 1 && e.matches && e.matches(r)) t.push(e);
var n = e && e.querySelectorAll ? e.querySelectorAll(r) : document.querySelectorAll(r);
n.forEach(function(e) {
t.push(e);
});
} catch (e) {}
}
r(n);
r(o);
var i = [];
try {
document.querySelectorAll(a).forEach(function(e) {
i.push(e);
});
} catch (e) {}
i.forEach(function(e) {
if (t.indexOf(e) === -1) t.push(e);
});
if (e && e.nodeType === 1 && e.matches) {
try {
if (e.matches(a) && t.indexOf(e) === -1) t.push(e);
} catch (e) {}
try {
if (e.matches(o) && t.indexOf(e) === -1) t.push(e);
} catch (e) {}
}
if (e && e.querySelectorAll) {
try {
e.querySelectorAll(o + "," + a).forEach(function(e) {
if (t.indexOf(e) === -1) t.push(e);
});
} catch (e) {}
}
return t;
}
function A(e) {
if (!u || !h()) return;
q(e).forEach(m);
w(e).forEach(S);
if (!e) {
document.querySelectorAll(t).forEach(m);
if (!document.querySelector(t)) {
document.querySelectorAll(r).forEach(function(e) {
if (e.closest && e.closest(".avatar-type-contents-container")) m(e);
});
}
document.querySelectorAll(n).forEach(S);
document.querySelectorAll(o).forEach(S);
if (!document.querySelector(n) && !document.querySelector(o)) {
document.querySelectorAll(a).forEach(function(e) {
if (g(e)) S(e);
});
}
}
}
var E = 0;
function x() {
if (E) clearTimeout(E);
E = setTimeout(function() {
E = 0;
A(document);
}, 80);
}
function b() {
if (f || !document.documentElement) return;
f = new MutationObserver(function(e) {
if (!u || !h()) return;
var i = false;
for (var c = 0; c < e.length; c++) {
var l = e[c];
if (!l.addedNodes || !l.addedNodes.length) continue;
for (var f = 0; f < l.addedNodes.length; f++) {
var s = l.addedNodes[f];
if (!s || s.nodeType !== 1) continue;
var d = false;
var v = false;
try {
if (s.matches && (s.matches(n) || s.matches(o) || s.matches(a))) d = true; else if (s.querySelector && (s.querySelector(n) || s.querySelector(o) || s.querySelector(a) || s.querySelector('[role="dialog"]'))) d = true;
} catch (e) {}
try {
if (s.matches && (s.matches(t) || s.matches(r) || s.matches(".avatar-type-contents-container"))) v = true; else if (s.querySelector && (s.querySelector(t) || s.querySelector(".avatar-type-contents-container"))) v = true;
} catch (e) {}
if (d || v) {
A(s);
if (d) {
if (s.matches) {
try {
if (s.matches(n) || s.matches(o) || s.matches('[role="dialog"]')) S(s);
} catch (e) {}
}
var y = [];
try {
if (s.querySelectorAll) {
s.querySelectorAll(n + "," + o + "," + a + ', div[role="dialog"]').forEach(function(e) {
y.push(e);
});
}
} catch (e) {}
for (var m = 0; m < y.length; m++) S(y[m]);
if (s.matches && s.matches("[data-radix-portal]")) {
var p = s.querySelectorAll ? s.querySelectorAll('div[role="dialog"]') : [];
for (var g = 0; g < p.length; g++) S(p[g]);
}
}
}
i = true;
}
}
if (i) x();
});
f.observe(document.documentElement, {
childList: true,
subtree: true
});
}
function C() {
if (f) {
f.disconnect();
f = null;
}
if (E) {
clearTimeout(E);
E = 0;
}
}
function L() {
var e = location.href;
if (e === d) return;
d = e;
if (u && h()) x();
}
function O() {
if (s) return;
s = setInterval(L, 600);
}
function T() {
if (s) {
clearInterval(s);
s = null;
}
}
function _(e) {
u = !!e;
if (u) {
if (!h()) return;
b();
O();
x();
return;
}
C();
T();
document.querySelectorAll("[" + "data-" + c.toLowerCase() + "]").forEach(function(e) {
try {
delete e.dataset[c];
} catch (t) {
e.removeAttribute("data-" + c);
}
});
document.querySelectorAll("[data-purpuraR6Patched]").forEach(function(e) {
e.removeAttribute("data-purpuraR6Patched");
});
}
function M() {
function t() {
window.__PurpuraSettings.ready.then(function() {
var t = window.__PurpuraSettings.get(e);
_(v(t));
});
}
if (!window.__PurpuraSettings) {
var r = 0;
var n = setInterval(function() {
if (window.__PurpuraSettings) {
clearInterval(n);
t();
} else if (++r > 50) clearInterval(n);
}, 100);
return;
}
t();
}
M();
chrome.storage.onChanged.addListener(function(t, r) {
if (r !== "sync" || !t[e]) return;
M();
});
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", function() {
if (u && h()) {
b();
O();
x();
}
}, {
once: true
});
} else if (u && h()) {
b();
O();
x();
}
var R = history.pushState.bind(history);
history.pushState = function() {
var e = R.apply(this, arguments);
L();
return e;
};
var D = history.replaceState.bind(history);
history.replaceState = function() {
var e = D.apply(this, arguments);
L();
return e;
};
window.addEventListener("popstate", L);
})();
