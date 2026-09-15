/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
"use strict";
if (window.purpuraCursorInitialized) return;
window.purpuraCursorInitialized = true;
let t = "auto";
let e = "default";
let r = null;
let n = false;
let a = null;
let o = null;
const s = {
default: {
cursor: "auto"
},
purpura: {
cursor: "url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Cdefs%3E%3ClinearGradient id='ag' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23f0e6ff'/%3E%3Cstop offset='100%25' stop-color='%23a78bfa'/%3E%3C/linearGradient%3E%3Cfilter id='gw' x='-40%25' y='-40%25' width='180%25' height='180%25'%3E%3CfeGaussianBlur in='SourceGraphic' stdDeviation='1.5' result='b'/%3E%3CfeMerge%3E%3CfeMergeNode in='b'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Cg filter='url(%23gw)'%3E%3Cpath d='M4 2L4 22L9 15L13 24L16 22L12 13L20 13Z' fill='url(%23ag)' stroke='%232d1060' stroke-width='1' stroke-linejoin='round'/%3E%3C/g%3E%3C/svg%3E\") 4 2, auto"
},
dot: {
cursor: "url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='4' fill='white' stroke='black' stroke-width='1.5'/%3E%3C/svg%3E\") 8 8, auto"
},
bolt: {
cursor: "url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='32' viewBox='0 0 22 32'%3E%3Cdefs%3E%3Cfilter id='gw' x='-50%25' y='-50%25' width='200%25' height='200%25'%3E%3CfeGaussianBlur in='SourceGraphic' stdDeviation='2' result='b'/%3E%3CfeMerge%3E%3CfeMergeNode in='b'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3ClinearGradient id='blg' x1='0%25' y1='0%25' x2='50%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23ffffff'/%3E%3Cstop offset='35%25' stop-color='%237dd3fc'/%3E%3Cstop offset='100%25' stop-color='%23facc15'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d='M15 2L5 17H12L7 30L22 13H14Z' fill='%237dd3fc' opacity='0.5' filter='url(%23gw)'/%3E%3Cpath d='M15 2L5 17H12L7 30L22 13H14Z' fill='url(%23blg)' stroke='%23bfdbfe' stroke-width='0.75' stroke-linejoin='round'/%3E%3C/svg%3E\") 15 2, auto"
},
ghost: {
cursor: "url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='28' viewBox='0 0 22 28'%3E%3Cpath d='M11 2C5.5 2 2 6.5 2 12v14l2.5-2.5 2.5 2.5 2.5-2.5 2.5 2.5 2.5-2.5 2.5 2.5V12C20 6.5 16.5 2 11 2Z' fill='white' stroke='%23111' stroke-width='1.5'/%3E%3Ccircle cx='8' cy='12' r='1.5' fill='%23333'/%3E%3Ccircle cx='14' cy='12' r='1.5' fill='%23333'/%3E%3C/svg%3E\") 11 2, auto"
},
nova: {
cursor: "url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Cdefs%3E%3ClinearGradient id='ng' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23fef9c3'/%3E%3Cstop offset='100%25' stop-color='%23f59e0b'/%3E%3C/linearGradient%3E%3CradialGradient id='ngc' cx='50%25' cy='50%25'%3E%3Cstop offset='0%25' stop-color='%23fff7d6'/%3E%3Cstop offset='100%25' stop-color='%23fbbf24'/%3E%3C/radialGradient%3E%3Cfilter id='nf' x='-50%25' y='-50%25' width='200%25' height='200%25'%3E%3CfeGaussianBlur in='SourceGraphic' stdDeviation='2' result='b'/%3E%3CfeMerge%3E%3CfeMergeNode in='b'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Ccircle cx='14' cy='14' r='7' fill='%23fde68a' opacity='0.2'/%3E%3Cg stroke='url(%23ng)' stroke-linecap='round'%3E%3Cline x1='14' y1='3' x2='14' y2='10' stroke-width='2'/%3E%3Cline x1='14' y1='18' x2='14' y2='25' stroke-width='2'/%3E%3Cline x1='3' y1='14' x2='10' y2='14' stroke-width='2'/%3E%3Cline x1='18' y1='14' x2='25' y2='14' stroke-width='2'/%3E%3Cline x1='5.8' y1='5.8' x2='10.5' y2='10.5' stroke-width='1.5'/%3E%3Cline x1='17.5' y1='17.5' x2='22.2' y2='22.2' stroke-width='1.5'/%3E%3Cline x1='22.2' y1='5.8' x2='17.5' y2='10.5' stroke-width='1.5'/%3E%3Cline x1='5.8' y1='22.2' x2='10.5' y2='17.5' stroke-width='1.5'/%3E%3C/g%3E%3Ccircle cx='14' cy='14' r='3.5' fill='url(%23ngc)' filter='url(%23nf)'/%3E%3C/svg%3E\") 14 14, auto"
}
};
function i(t) {
return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(t)));
}
function p(t) {
if (!t) return "auto";
if (t.type === "custom" && t.cursor) return t.cursor;
const e = s[t.preset];
if (e) {
if (e.cursor === "auto") return "auto";
const t = e.cursor.match(/url\("data:image\/svg\+xml;charset=utf8,(.+?)"\)/);
if (t) {
const r = decodeURIComponent(t[1]);
const n = e.cursor.replace(/.*"\)\s*(\d+\s+\d+).*/, "$1") || "0 0";
return "url(" + i(r) + ") " + n + ", auto";
}
return e.cursor;
}
return t.cursor || "auto";
}
function c() {
window.__PurpuraSettings.ready.then(function() {
const t = window.__PurpuraSettings.get("pcr");
if (t) {
n = t.enabled === true;
const r = p(t);
if (n) {
x(r);
e = t.preset || "default";
u(e, t.trailEffects !== false);
}
}
});
chrome.runtime.onMessage.addListener((t, e, r) => {
if (t.type === "updateCursor") {
if (n) {
x(t.cursor);
}
r({
success: true
});
}
});
chrome.storage.onChanged.addListener((t, r) => {
if (r === "local" && t.pcr) {
const t = window.__PurpuraSettings.get("pcr");
if (t) {
n = t.enabled === true;
const r = p(t);
if (n && r !== "auto") {
x(r);
e = t.preset || "default";
u(e, t.trailEffects !== false);
} else {
x("auto");
d();
if (o) {
o();
o = null;
}
document.documentElement.classList.remove("purpura-cursor-override");
}
}
}
});
}
function d() {
const t = document.getElementById("purpura-vfx-host");
if (t) {
t.style.display = "none";
t.replaceChildren();
}
if (a) {
a();
a = null;
}
}
function u(t, e) {
d();
if (!n) return;
if (e === false) return;
l();
if (t === "purpura") f(); else if (t === "nova") g(); else if (t === "ghost") m(); else if (t === "bolt") h(); else if (t === "dot") v();
}
function l() {
if (document.getElementById("purpura-pcr-vars")) return;
var t = document.createElement("style");
t.id = "purpura-pcr-vars";
t.textContent = ":root{" + "--purpura-pcr-purpura-1:#e9d5ff;--purpura-pcr-purpura-2:#c4b5fd;--purpura-pcr-purpura-3:#a78bfa;" + "--purpura-pcr-purpura-4:#f0e6ff;--purpura-pcr-purpura-5:#ddd6fe;--purpura-pcr-purpura-6:#ede9fe;" + "--purpura-pcr-ghost-glow-start:rgba(180,255,210,0.55);--purpura-pcr-ghost-glow-end:rgba(180,255,210,0.1);" + "--purpura-pcr-ghost-color-1:rgba(210,255,230,0.55);--purpura-pcr-ghost-color-2:rgba(200,240,255,0.5);" + "--purpura-pcr-ghost-color-3:rgba(230,220,255,0.5);--purpura-pcr-ghost-color-4:rgba(255,255,255,0.45);" + "--purpura-pcr-dot-rgb:255,255,255;" + "--purpura-pcr-bolt-1:#ffffff;--purpura-pcr-bolt-2:#e0f0ff;--purpura-pcr-bolt-3:#7dd3fc;" + "--purpura-pcr-bolt-4:#facc15;--purpura-pcr-bolt-5:#fde68a;--purpura-pcr-bolt-6:#bfdbfe;" + "--purpura-pcr-bolt-arc-glow-1:#7dd3fc;--purpura-pcr-bolt-arc-glow-2:#bfdbfe;" + "--purpura-pcr-bolt-flash-center:rgba(255,255,255,0.9);--purpura-pcr-bolt-flash-mid:rgba(125,211,252,0.5);" + "--purpura-pcr-nova-1:#fef9c3;--purpura-pcr-nova-2:#fde68a;--purpura-pcr-nova-3:#fbbf24;--purpura-pcr-nova-4:#f59e0b;" + "--purpura-pcr-nova-5:#fef08a;--purpura-pcr-nova-6:#fcd34d;--purpura-pcr-nova-7:#fff7d6;--purpura-pcr-nova-8:#fffbeb;" + "--purpura-pcr-nova-ring-border:rgba(251,191,36,0.75);--purpura-pcr-nova-ring-glow-1:rgba(251,191,36,0.4);" + "--purpura-pcr-nova-ring-glow-2:rgba(254,243,199,0.2);--purpura-pcr-nova-flare-center:rgba(255,251,235,0.95);" + "--purpura-pcr-nova-flare-mid:rgba(251,191,36,0.6);--purpura-pcr-nova-flare-glow-1:rgba(251,191,36,0.7);" + "--purpura-pcr-nova-flare-glow-2:rgba(254,243,199,0.3)}";
document.head.appendChild(t);
}
function f() {
l();
const t = document.createElement("div");
t.id = "purpura-vfx-host";
t.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647;overflow:hidden;";
const e = document.createElement("style");
e.textContent = `\n            @keyframes purpura-spark {\n                0%   { opacity: 0.9; transform: translate(-50%,-50%) scale(1) translateY(0); }\n                100% { opacity: 0;   transform: translate(-50%,-50%) scale(0.1) translateY(-18px); }\n            }\n            .purpura-spark {\n                position: fixed;\n                border-radius: 50%;\n                pointer-events: none;\n                animation: purpura-spark 0.55s ease-out forwards;\n            }\n        `;
t.appendChild(e);
document.body.appendChild(t);
const r = [ "var(--purpura-pcr-purpura-1)", "var(--purpura-pcr-purpura-2)", "var(--purpura-pcr-purpura-3)", "var(--purpura-pcr-purpura-4)", "var(--purpura-pcr-purpura-5)", "var(--purpura-pcr-purpura-6)" ];
let n = -999, o = -999;
const s = e => {
const a = e.clientX - n, s = e.clientY - o;
if (a * a + s * s < 120) return;
n = e.clientX;
o = e.clientY;
const i = 2 + Math.floor(Math.random() * 2);
for (let n = 0; n < i; n++) {
const n = document.createElement("div");
n.className = "purpura-spark";
const a = 3 + Math.random() * 4;
n.style.cssText = `\n                    left:${e.clientX + (Math.random() - .5) * 14}px;\n                    top:${e.clientY + (Math.random() - .5) * 14}px;\n                    width:${a}px;\n                    height:${a}px;\n                    background:${r[Math.floor(Math.random() * r.length)]};\n                    animation-duration:${.38 + Math.random() * .3}s;\n                    animation-delay:${Math.random() * .04}s;\n                `;
t.appendChild(n);
n.addEventListener("animationend", () => n.remove(), {
once: true
});
}
};
document.addEventListener("mousemove", s);
a = () => {
document.removeEventListener("mousemove", s);
t.remove();
};
}
function m() {
const t = document.createElement("div");
t.id = "purpura-vfx-host";
t.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647;";
const e = document.createElement("style");
e.textContent = `\n            @keyframes ghost-silhouette {\n                0%   { opacity: var(--start-opacity); transform: translate(-50%, 0px)   scale(1);    filter: blur(0px) drop-shadow(0 0 6px var(--purpura-pcr-ghost-glow-start)); }\n                70%  { opacity: calc(var(--start-opacity) * 0.4); }\n                100% { opacity: 0;                                transform: translate(-50%, -60px) scale(0.6);  filter: blur(3px) drop-shadow(0 0 2px var(--purpura-pcr-ghost-glow-end)); }\n            }\n            .ghost-silhouette {\n                position: fixed;\n                pointer-events: none;\n                animation: ghost-silhouette var(--dur) ease-out forwards;\n            }\n        `;
t.appendChild(e);
document.body.appendChild(t);
const r = "M10,0 C4.477,0 0,4.477 0,10 L0,26 Q2.5,22.5 5,26 Q7.5,22.5 10,26 Q12.5,22.5 15,26 Q17.5,22.5 20,26 L20,10 C20,4.477 15.523,0 10,0 Z";
const n = [ "var(--purpura-pcr-ghost-color-1)", "var(--purpura-pcr-ghost-color-2)", "var(--purpura-pcr-ghost-color-3)", "var(--purpura-pcr-ghost-color-4)" ];
let o = -999, s = -999;
const i = e => {
const a = e.clientX - o, i = e.clientY - s;
if (a * a + i * i < 200) return;
o = e.clientX;
s = e.clientY;
const p = 10 + Math.random() * 6;
const c = n[Math.floor(Math.random() * n.length)];
const d = (1.8 + Math.random() * .8).toFixed(2) + "s";
const u = .5 + Math.random() * .25;
const l = (Math.random() - .5) * 6;
const f = document.createElementNS("http://www.w3.org/2000/svg", "svg");
f.setAttribute("viewBox", "0 0 20 26");
f.setAttribute("width", p);
f.setAttribute("height", p * 1.3);
f.classList.add("ghost-silhouette");
f.style.cssText = `\n                left: ${e.clientX + l}px;\n                top: ${e.clientY}px;\n                --dur: ${d};\n                --start-opacity: ${u};\n            `;
const m = document.createElementNS("http://www.w3.org/2000/svg", "path");
m.setAttribute("d", r);
m.setAttribute("fill", c);
f.appendChild(m);
t.appendChild(f);
f.addEventListener("animationend", () => f.remove(), {
once: true
});
};
document.addEventListener("mousemove", i);
a = () => {
document.removeEventListener("mousemove", i);
t.remove();
};
}
function v() {
const t = document.createElement("div");
t.id = "purpura-vfx-host";
t.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647;overflow:hidden;";
const e = document.createElement("style");
e.textContent = `\n            @keyframes dot-streak-fade {\n                0%   { opacity: var(--start-op); }\n                100% { opacity: 0; }\n            }\n            .dot-streak {\n                position: fixed;\n                pointer-events: none;\n                border-radius: 9999px;\n                transform-origin: center center;\n                animation: dot-streak-fade var(--dur) ease-out forwards;\n            }\n        `;
t.appendChild(e);
document.body.appendChild(t);
let r = -999, n = -999;
const o = "var(--purpura-pcr-dot-rgb)";
const s = e => {
const a = e.clientX - r;
const s = e.clientY - n;
const i = a * a + s * s;
if (i < 18) return;
const p = Math.atan2(s, a);
const c = Math.sqrt(i);
const d = Math.min(c * 1.1, 36) + 8;
const u = 5 + Math.random() * 3;
const l = document.createElement("div");
l.className = "dot-streak";
const f = (.35 + Math.random() * .2).toFixed(2) + "s";
const m = (.55 + Math.random() * .3).toFixed(2);
l.style.cssText = `\n                left: ${(r + e.clientX) / 2}px;\n                top: ${(n + e.clientY) / 2}px;\n                width: ${d}px;\n                height: ${u}px;\n                background: rgba(${o}, 0.65);\n                box-shadow: 0 0 ${u * 2}px rgba(${o}, 0.7), 0 0 ${u * 5}px rgba(${o}, 0.25);\n                transform: translate(-50%, -50%) rotate(${p}rad);\n                --dur: ${f};\n                --start-op: ${m};\n            `;
t.appendChild(l);
l.addEventListener("animationend", () => l.remove(), {
once: true
});
r = e.clientX;
n = e.clientY;
};
document.addEventListener("mousemove", s);
a = () => {
document.removeEventListener("mousemove", s);
t.remove();
};
}
function h() {
const t = document.createElement("div");
t.id = "purpura-vfx-host";
t.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647;overflow:hidden;";
const e = document.createElement("style");
e.textContent = `\n            @keyframes bolt-spark {\n                0%   { opacity: 1;   transform: translate(-50%,-50%) scale(1) translate(0,0); }\n                100% { opacity: 0;   transform: translate(-50%,-50%) scale(0) translate(var(--bx),var(--by)); }\n            }\n            @keyframes bolt-arc {\n                0%   { opacity: 0.9; transform: translate(-50%,-50%) scaleX(1); }\n                100% { opacity: 0;   transform: translate(-50%,-50%) scaleX(0.1); }\n            }\n            @keyframes bolt-flash {\n                0%   { opacity: 0.7; transform: translate(-50%,-50%) scale(1); }\n                50%  { opacity: 1;   transform: translate(-50%,-50%) scale(1.6); }\n                100% { opacity: 0;   transform: translate(-50%,-50%) scale(0.3); }\n            }\n            .bolt-spark {\n                position: fixed;\n                border-radius: 50%;\n                pointer-events: none;\n                animation: bolt-spark 0.35s ease-out forwards;\n            }\n            .bolt-arc {\n                position: fixed;\n                height: 2px;\n                border-radius: 1px;\n                pointer-events: none;\n                transform-origin: left center;\n                animation: bolt-arc 0.25s ease-out forwards;\n            }\n            .bolt-flash {\n                position: fixed;\n                border-radius: 50%;\n                pointer-events: none;\n                animation: bolt-flash 0.2s ease-out forwards;\n            }\n        `;
t.appendChild(e);
document.body.appendChild(t);
const r = [ "var(--purpura-pcr-bolt-1)", "var(--purpura-pcr-bolt-2)", "var(--purpura-pcr-bolt-3)", "var(--purpura-pcr-bolt-4)", "var(--purpura-pcr-bolt-5)", "var(--purpura-pcr-bolt-6)" ];
let n = -999, o = -999;
const s = e => {
const a = e.clientX - n, s = e.clientY - o;
const i = a * a + s * s;
if (i < 60) return;
n = e.clientX;
o = e.clientY;
const p = Math.min(Math.sqrt(i), 60);
const c = 2 + Math.floor(p / 12);
for (let n = 0; n < c; n++) {
const n = document.createElement("div");
n.className = "bolt-spark";
const a = 2 + Math.random() * 4;
const o = Math.random() * Math.PI * 2;
const s = 6 + Math.random() * 14;
const i = Math.cos(o) * s;
const p = Math.sin(o) * s;
const c = r[Math.floor(Math.random() * r.length)];
n.style.cssText = `\n                    left:${e.clientX + (Math.random() - .5) * 10}px;\n                    top:${e.clientY + (Math.random() - .5) * 10}px;\n                    width:${a}px;\n                    height:${a}px;\n                    background:${c};\n                    box-shadow:0 0 ${a * 2}px ${c}, 0 0 ${a * 4}px ${c};\n                    --bx:${i}px;\n                    --by:${p}px;\n                    animation-duration:${.2 + Math.random() * .2}s;\n                `;
t.appendChild(n);
n.addEventListener("animationend", () => n.remove(), {
once: true
});
}
if (Math.random() < .4) {
const n = document.createElement("div");
n.className = "bolt-arc";
const o = Math.atan2(s, a) + (Math.random() - .5) * .8;
const i = 12 + Math.random() * 20;
n.style.cssText = `\n                    left:${e.clientX}px;\n                    top:${e.clientY}px;\n                    width:${i}px;\n                    background:${r[Math.floor(Math.random() * 3)]};\n                    box-shadow:0 0 4px var(--purpura-pcr-bolt-arc-glow-1), 0 0 8px var(--purpura-pcr-bolt-arc-glow-2);\n                    transform-origin:left center;\n                    transform:translate(-50%,-50%) rotate(${o}rad);\n                    animation-duration:${.15 + Math.random() * .1}s;\n                `;
t.appendChild(n);
n.addEventListener("animationend", () => n.remove(), {
once: true
});
}
if (p > 30 && Math.random() < .3) {
const r = document.createElement("div");
r.className = "bolt-flash";
const n = 10 + Math.random() * 10;
r.style.cssText = `\n                    left:${e.clientX}px;\n                    top:${e.clientY}px;\n                    width:${n}px;\n                    height:${n}px;\n                    background:radial-gradient(circle, var(--purpura-pcr-bolt-flash-center) 0%, var(--purpura-pcr-bolt-flash-mid) 50%, transparent 70%);\n                    animation-duration:${.15 + Math.random() * .1}s;\n                `;
t.appendChild(r);
r.addEventListener("animationend", () => r.remove(), {
once: true
});
}
};
document.addEventListener("mousemove", s);
a = () => {
document.removeEventListener("mousemove", s);
t.remove();
};
}
function g() {
const t = document.createElement("div");
t.id = "purpura-vfx-host";
t.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647;";
document.body.appendChild(t);
const e = document.createElement("style");
e.textContent = `\n            @keyframes nova-ember {\n                0%   { opacity: var(--so); transform: translate(-50%,-50%) scale(1) translate(0px,0px); }\n                100% { opacity: 0;         transform: translate(-50%,-50%) scale(0.2) translate(var(--nx),var(--ny)); }\n            }\n            .nova-ember {\n                position: fixed;\n                border-radius: 50%;\n                pointer-events: none;\n                animation: nova-ember var(--nd) ease-out forwards;\n            }\n            @keyframes nova-ray {\n                from { opacity: 0.85; height: var(--rl); }\n                to   { opacity: 0;    height: 0; }\n            }\n            .nova-ray {\n                position: absolute;\n                border-radius: 9999px;\n                pointer-events: none;\n                transform-origin: bottom center;\n                animation: nova-ray var(--nd) ease-out forwards;\n            }\n            @keyframes nova-ring {\n                0%   { opacity: 0.75; transform: translate(-50%,-50%) scale(0.15); }\n                100% { opacity: 0;    transform: translate(-50%,-50%) scale(3); }\n            }\n            .nova-ring {\n                position: fixed;\n                border-radius: 50%;\n                pointer-events: none;\n                animation: nova-ring 0.6s ease-out forwards;\n            }\n            @keyframes nova-flare {\n                0%   { opacity: 0.9; transform: translate(-50%,-50%) scale(0.4); }\n                40%  { opacity: 1;   transform: translate(-50%,-50%) scale(1.4); }\n                100% { opacity: 0;   transform: translate(-50%,-50%) scale(0.2); }\n            }\n            .nova-flare {\n                position: fixed;\n                border-radius: 50%;\n                pointer-events: none;\n                animation: nova-flare 0.22s ease-out forwards;\n            }\n        `;
t.appendChild(e);
const r = [ "var(--purpura-pcr-nova-1)", "var(--purpura-pcr-nova-2)", "var(--purpura-pcr-nova-3)", "var(--purpura-pcr-nova-4)", "var(--purpura-pcr-nova-5)", "var(--purpura-pcr-nova-6)", "var(--purpura-pcr-nova-7)", "var(--purpura-pcr-nova-8)" ];
let n = -999, o = -999, s = 0;
const i = e => {
const a = e.clientX, i = e.clientY;
const p = a - n, c = i - o;
const d = p * p + c * c;
if (d < 22) return;
s++;
const u = Math.sqrt(d);
const l = 2 + Math.floor(u / 16);
for (let e = 0; e < Math.min(l, 5); e++) {
const e = document.createElement("div");
e.className = "nova-ember";
const n = 2.5 + Math.random() * 5;
const o = Math.random() * Math.PI * 2;
const s = 14 + Math.random() * 26;
const p = r[Math.floor(Math.random() * r.length)];
const c = (.45 + Math.random() * .35).toFixed(2);
e.style.cssText = `\n                    left:${a + (Math.random() - .5) * 8}px;\n                    top:${i + (Math.random() - .5) * 8}px;\n                    width:${n}px;\n                    height:${n}px;\n                    background:${p};\n                    box-shadow:0 0 ${n * 2.5}px ${p}, 0 0 ${n * 5}px ${r[0]};\n                    --nx:${(Math.cos(o) * s).toFixed(1)}px;\n                    --ny:${(Math.sin(o) * s).toFixed(1)}px;\n                    --nd:${c}s;\n                    --so:${(.7 + Math.random() * .25).toFixed(2)};\n                `;
t.appendChild(e);
e.addEventListener("animationend", () => e.remove(), {
once: true
});
}
if (d > 180) {
const e = 3 + Math.floor(Math.random() * 4);
for (let n = 0; n < e; n++) {
const o = n / e * Math.PI * 2 + Math.random() * .5;
const s = 8 + Math.random() * 18;
const p = 1.2 + Math.random() * 1.5;
const c = (.25 + Math.random() * .2).toFixed(2);
const d = r[Math.floor(Math.random() * r.length)];
const u = document.createElement("div");
u.style.cssText = `position:fixed;left:${a}px;top:${i}px;width:0;height:0;overflow:visible;pointer-events:none;`;
const l = document.createElement("div");
l.className = "nova-ray";
l.style.cssText = `\n                        width:${p}px;\n                        height:${s}px;\n                        left:${-p / 2}px;\n                        top:${-s}px;\n                        background:linear-gradient(to top, ${d}, transparent);\n                        box-shadow:0 0 4px ${d};\n                        transform:rotate(${o.toFixed(3)}rad);\n                        --rl:${s}px;\n                        --nd:${c}s;\n                    `;
u.appendChild(l);
t.appendChild(u);
l.addEventListener("animationend", () => u.remove(), {
once: true
});
}
}
if (s % 7 === 0) {
const e = document.createElement("div");
e.className = "nova-ring";
const r = 10 + Math.random() * 8;
e.style.cssText = `\n                    left:${a}px; top:${i}px;\n                    width:${r}px; height:${r}px;\n                    border: 1.5px solid var(--purpura-pcr-nova-ring-border);\n                    box-shadow: 0 0 6px var(--purpura-pcr-nova-ring-glow-1), inset 0 0 4px var(--purpura-pcr-nova-ring-glow-2);\n                `;
t.appendChild(e);
e.addEventListener("animationend", () => e.remove(), {
once: true
});
}
if (u > 28 && Math.random() < .35) {
const e = document.createElement("div");
e.className = "nova-flare";
const r = 14 + Math.random() * 12;
e.style.cssText = `\n                    left:${a}px; top:${i}px;\n                    width:${r}px; height:${r}px;\n                    background:radial-gradient(circle, var(--purpura-pcr-nova-flare-center) 0%, var(--purpura-pcr-nova-flare-mid) 40%, transparent 70%);\n                    box-shadow:0 0 10px var(--purpura-pcr-nova-flare-glow-1), 0 0 20px var(--purpura-pcr-nova-flare-glow-2);\n                `;
t.appendChild(e);
e.addEventListener("animationend", () => e.remove(), {
once: true
});
}
n = a;
o = i;
};
document.addEventListener("mousemove", i);
a = () => {
document.removeEventListener("mousemove", i);
t.remove();
};
}
function x(e) {
if (t === e) return;
if (o) {
o();
o = null;
}
t = e;
if (r) {
r.remove();
r = null;
}
if (e === "auto") {
document.documentElement.classList.remove("purpura-cursor-override");
return;
}
r = document.createElement("style");
r.id = "purpura-cursor-style";
r.textContent = `\n            /* Universal cursor override with maximum specificity */\n            *, *:hover, *:active, *:focus, *:visited, *::before, *::after {\n                cursor: ${e} !important;\n            }\n            \n            /* Specific overrides for interactive elements */\n            a, button, input[type="button"], input[type="submit"], \n            .btn, [role="button"], [onclick], .clickable, .interactive {\n                cursor: ${e} !important;\n            }\n            \n            /* Text input areas */\n            input[type="text"], input[type="password"], input[type="email"],\n            textarea, [contenteditable="true"] {\n                cursor: ${e} !important;\n            }\n            \n            /* Game canvas and interactive areas */\n            canvas, #game-instances, .game-container, .game-viewport {\n                cursor: ${e} !important;\n            }\n            \n            /* Drag and drop elements - critical for fixing drag cursor reversion */\n            [draggable="true"], [draggable], .draggable, .drag-handle,\n            .sortable-item, .ui-draggable, .ui-sortable {\n                cursor: ${e} !important;\n            }\n            \n            /* Force override during drag operations */\n            *:active, *[style*="cursor"], *[data-cursor] {\n                cursor: ${e} !important;\n            }\n            \n            /* Roblox specific selectors */\n            .rbx-tab, .tab-content, .game-card, .game-tile,\n            .avatar-card, .item-card, .catalog-item, .notification,\n            .dropdown, .modal, .dialog, .menu, .tooltip {\n                cursor: ${e} !important;\n            }\n            \n            /* Override all possible cursor states */\n            html.purpura-cursor-override *,\n            html.purpura-cursor-override *:active,\n            html.purpura-cursor-override *:hover,\n            html.purpura-cursor-override *:focus,\n            html.purpura-cursor-override *:visited,\n            html.purpura-cursor-override *[dragging="true"] {\n                cursor: ${e} !important;\n            }\n        `;
document.head.appendChild(r);
document.documentElement.classList.add("purpura-cursor-override");
const n = t => {
const r = t && t.target;
if (!r || !r.style || typeof r.style.setProperty !== "function") return;
r.style.setProperty("cursor", e, "important");
};
document.addEventListener("dragstart", n, true);
document.addEventListener("drag", n, true);
document.addEventListener("dragend", n, true);
o = () => {
document.removeEventListener("dragstart", n, true);
document.removeEventListener("drag", n, true);
document.removeEventListener("dragend", n, true);
};
}
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", c);
} else {
c();
}
})();
