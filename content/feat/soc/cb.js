/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
if (window.__purpuraContributorBadgeLoaded) return;
window.__purpuraContributorBadgeLoaded = true;
var e = chrome.runtime.getURL("images/purpura_contributor_badge.svg");
var t = chrome.runtime.getURL("images/purpura_tester_badge.svg");
var r = chrome.runtime.getURL("data/contributors.json");
var n = chrome.runtime.getURL("data/testers.json");
var a = {
contributor: {
url: e,
text: "Purpura Contributor",
color: "#A855F7",
border: "rgba(168,85,247,0.35)",
bg: "#1a1b1f"
},
tester: {
url: t,
text: "Purpura Tester",
color: "#3FC7E8",
border: "rgba(14,165,196,0.35)",
bg: "#111a1f"
}
};
var i = "purpura-contributor-badge";
var o = "purpura-tester-badge";
var u = "data-purpura-badges";
var l = "data-purpura-cb";
var s = "data-purpura-cb-user";
var c = "#profile-header-title-container-name";
var d = "data-purpura-cb-observed";
var p = "purpura-cb-style";
var f = "purpura-cb-shine-style";
var m = "purpura-cb-tooltip";
var h = null;
var v = null;
var b = null;
var g = null;
var y = false;
function x() {
if (h) return Promise.resolve(h);
if (b) return b;
b = fetch(r, {
cache: "no-cache"
}).then(function(e) {
return e.ok ? e.json() : [];
}).then(function(e) {
var t = new Set;
(Array.isArray(e) ? e : []).forEach(function(e) {
var r = String(e).trim();
if (r) t.add(r);
});
h = t;
return t;
}).catch(function() {
h = new Set;
return h;
});
return b;
}
function w() {
if (v) return Promise.resolve(v);
if (g) return g;
g = fetch(n, {
cache: "no-cache"
}).then(function(e) {
return e.ok ? e.json() : [];
}).then(function(e) {
var t = new Set;
(Array.isArray(e) ? e : []).forEach(function(e) {
var r = String(e).trim();
if (r) t.add(r);
});
v = t;
return t;
}).catch(function() {
v = new Set;
return v;
});
return g;
}
function E() {
return Promise.all([ x(), w() ]);
}
function A(e) {
try {
var t = e || window.location.href;
var r = t.match(/\/users\/(\d+)(?:\/|$|\?|#)/i);
return r ? r[1] : null;
} catch (e) {
return null;
}
}
function k(e) {
var t = [];
if (h && h.has(String(e))) t.push("contributor");
if (v && v.has(String(e))) t.push("tester");
return t;
}
function C() {
if (document.getElementById(p)) return;
var r = document.createElement("style");
r.id = p;
var n = 'url("' + e.replace(/\"/g, '\\"') + '") center/contain no-repeat';
var a = 'url("' + t.replace(/\"/g, '\\"') + '") center/contain no-repeat';
r.textContent = [ "." + i + "{position:relative;display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;cursor:pointer;flex-shrink:0;}", "." + o + "{position:relative;display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;cursor:pointer;flex-shrink:0;}", "." + i + "-icon,." + o + "-icon{width:33px;height:33px;display:block;object-fit:contain;pointer-events:none;}", "." + i + "-wrap,." + o + "-wrap{position:relative;display:inline-flex;align-items:center;overflow:visible;}", ".purpura-badges{display:inline-flex;align-items:center;gap:16px;margin-left:8px;vertical-align:middle;}", ".purpura-cb-shine{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:2;}", "." + i + " .purpura-cb-shine{-webkit-mask:" + n + ";mask:" + n + ";}", "." + o + " .purpura-cb-shine{-webkit-mask:" + a + ";mask:" + a + ";}", ".purpura-cb-shine-bar{position:absolute;top:0;left:-100%;width:50%;height:100%;background:linear-gradient(to right,transparent,rgba(255,255,255,0.85),transparent);transform:skewX(-25deg);animation:purpura-cb-shine 5s infinite;}", "." + o + " .purpura-cb-shine-bar{animation-delay:-2.5s;}", "." + m + "{position:fixed;z-index:99999;padding:6px 10px;border-radius:8px;font-size:12px;font-weight:600;line-height:1.2;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity 0.15s;box-shadow:0 8px 24px rgba(0,0,0,0.4);transform:translateX(-50%);}", "." + m + ".visible{opacity:1;}" ].join("\n");
document.head.appendChild(r);
}
function M() {
if (document.getElementById(f)) return;
var e = document.createElement("style");
e.id = f;
e.textContent = [ "@keyframes purpura-cb-shine{0%{left:-100%}40%{left:200%}100%{left:200%}}", "@keyframes purpura-cb-sparkle{0%,100%{opacity:0;transform:scale(0.35) rotate(45deg)}35%{opacity:1;transform:scale(1) rotate(45deg)}65%{opacity:0.85;transform:scale(0.8) rotate(45deg)}}" ].join("\n");
document.head.appendChild(e);
}
function S(e, t) {
e.style.top = "";
e.style.right = "";
e.style.bottom = "";
e.style.left = "";
var r = Math.round(Math.random() * 64 + 18) + "%";
var n = Math.round(Math.random() * 76 + 12) + "%";
var a = Math.round(Math.random() * 4) - 7 + "px";
var i = Math.round(Math.random() * 4) - 3 + "px";
var o = Math.floor(Math.random() * 4);
if (t === "right" && o === 1) o = [ 0, 2, 3 ][Math.floor(Math.random() * 3)];
if (t === "left" && o === 3) o = [ 0, 1, 2 ][Math.floor(Math.random() * 3)];
switch (o) {
case 0:
e.style.top = i;
e.style.left = n;
break;

case 1:
e.style.right = a;
e.style.top = r;
break;

case 2:
e.style.bottom = i;
e.style.left = n;
break;

default:
e.style.left = a;
e.style.top = r;
break;
}
}
function L(e, t, r, n) {
M();
r = r || 0;
[ {
size: "4px",
delay: 0
}, {
size: "3px",
delay: .55
}, {
size: "3px",
delay: 1.1
}, {
size: "4px",
delay: 1.65
} ].forEach(function(a) {
var i = document.createElement("span");
i.style.position = "absolute";
i.style.width = a.size;
i.style.height = a.size;
i.style.background = "currentColor";
i.style.border = "1px solid color-mix(in srgb, currentColor 55%, white)";
i.style.boxShadow = "0 0 5px currentColor";
i.style.pointerEvents = "none";
i.style.zIndex = "3";
var o = (a.delay + r) % 2.2;
i.style.animation = "purpura-cb-sparkle 2.2s ease-in-out 0s infinite";
i.style.animationDelay = "-" + o.toFixed(2) + "s";
e.style.color = t;
S(i, n);
i.addEventListener("animationiteration", function() {
S(i, n);
});
e.appendChild(i);
});
}
function j(e, t) {
if (y) return;
y = true;
setTimeout(function() {
y = false;
}, 1800);
try {
var r = e.getBoundingClientRect();
var n = document.createElement("div");
Object.assign(n.style, {
position: "fixed",
left: r.left + r.width / 2 + "px",
top: r.top + r.height / 2 + "px",
width: "1px",
height: "1px",
zIndex: "10000",
pointerEvents: "none"
});
document.body.appendChild(n);
for (var a = 0; a < 36; a++) {
var i = document.createElement("img");
i.src = t;
Object.assign(i.style, {
position: "absolute",
width: "14px",
height: "14px",
opacity: "0"
});
var o = Math.random() * 2 * Math.PI;
var u = Math.random() * 90 + 40;
var l = Math.random() * 1200 + 900;
i.animate([ {
transform: "translate(-50%,-50%) rotate(0deg)",
opacity: 1
}, {
transform: "translate(calc(-50% + " + Math.cos(o) * u + "px), calc(-50% + " + Math.sin(o) * u + "px)) rotate(720deg)",
opacity: 0
} ], {
duration: l,
easing: "ease-out",
fill: "forwards"
});
n.appendChild(i);
}
setTimeout(function() {
n.parentNode && n.parentNode.removeChild(n);
}, 3e3);
} catch (e) {}
}
var q = null;
var z = null;
function N(e, t, r, n) {
C();
if (!q) {
q = document.createElement("div");
q.className = m;
document.body.appendChild(q);
}
q.textContent = t;
q.style.background = n;
q.style.color = "#e8e0ff";
q.style.border = "1px solid " + r;
var a = e.getBoundingClientRect();
q.style.left = a.left + a.width / 2 + "px";
q.style.top = a.top - 8 + "px";
q.style.transform = "translate(-50%, -100%)";
requestAnimationFrame(function() {
q.classList.add("visible");
});
}
function P() {
if (z) {
clearTimeout(z);
z = null;
}
if (q) q.classList.remove("visible");
}
function _(e, t) {
e.addEventListener("mouseenter", function() {
if (z) clearTimeout(z);
z = setTimeout(function() {
N(e, t.text, t.border, t.bg);
}, 120);
});
e.addEventListener("mouseleave", P);
e.addEventListener("click", P);
}
function T(e, t) {
var r = a[e];
C();
M();
var n = e === "tester";
var u = n ? o : i;
var s = document.createElement("span");
s.className = u + "-wrap";
s.setAttribute(l, e);
var c = document.createElement("img");
c.className = u + "-icon";
c.src = r.url;
c.alt = r.text;
c.setAttribute("aria-label", r.text);
c.draggable = false;
s.appendChild(c);
var d = document.createElement("span");
d.className = "purpura-cb-shine";
d.setAttribute("aria-hidden", "true");
var p = document.createElement("span");
p.className = "purpura-cb-shine-bar";
d.appendChild(p);
s.appendChild(d);
var f = !t ? null : n ? "left" : "right";
L(s, r.color, n ? .275 : 0, f);
_(s, r);
c.addEventListener("click", function(e) {
e.stopPropagation();
j(c, r.url);
});
s.addEventListener("click", function(e) {
if (e.target === s) {
e.stopPropagation();
j(c, r.url);
}
});
s.classList.add(n ? o : i);
return s;
}
function B(e, t) {
if (!e || !e.parentElement) return false;
var r = e.parentElement;
var n = r.querySelector("[" + u + "]");
var a = n ? Array.from(n.querySelectorAll("[" + l + "]")).map(function(e) {
return e.getAttribute(l);
}).sort().join(",") : "";
var i = t.slice().sort().join(",");
if (n && a === i) return true;
if (n) n.remove();
r.querySelectorAll("[" + l + "]").forEach(function(e) {
if (!e.closest("[" + u + "]")) e.remove();
});
var o = document.createElement("span");
o.className = "purpura-badges";
o.setAttribute(u, "1");
var c = t.length > 1;
t.forEach(function(e) {
o.appendChild(T(e, c));
});
e.after(o);
r.setAttribute(s, A() || "");
return true;
}
async function I() {
await E();
var e = A();
var t = e ? k(e) : [];
if (!t.length) {
document.querySelectorAll("[" + u + "]").forEach(function(e) {
e.remove();
});
document.querySelectorAll("[" + l + "]").forEach(function(e) {
e.remove();
});
document.querySelectorAll("[" + d + "]").forEach(function(e) {
e.removeAttribute(d);
e.removeAttribute(s);
});
return;
}
var r = document.querySelector(c);
if (!r) return;
var n = r.parentElement;
if (!n) return;
var a = n.getAttribute(d) === "1";
var i = n.getAttribute(s) || "";
var o = !!n.querySelector("[" + u + "]");
if (a && i === String(e) && o) {
var p = Array.from(n.querySelector("[" + u + "]").querySelectorAll("[" + l + "]")).map(function(e) {
return e.getAttribute(l);
}).sort().join(",");
if (p === t.slice().sort().join(",")) return;
}
B(r, t);
n.setAttribute(d, "1");
n.setAttribute(s, String(e));
}
var R = null;
var F = null;
function O() {
if (F) return;
F = setTimeout(function() {
F = null;
I();
}, 120);
}
function U() {
if (R) return;
R = new MutationObserver(O);
R.observe(document.documentElement, {
childList: true,
subtree: true
});
var e = location.href;
setInterval(function() {
if (location.href !== e) {
e = location.href;
O();
}
}, 600);
}
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", function() {
U();
I();
}, {
once: true
});
} else {
U();
I();
}
E().then(function() {
O();
});
})();
