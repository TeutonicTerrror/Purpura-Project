/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
function e(e, n) {
return chrome.i18n.getMessage(e, n) || e;
}
const n = "onb";
function t() {
return location.pathname === "/home" || location.pathname.startsWith("/home/");
}
function o() {
const t = document.createElement("div");
t.id = "purpura-onboarding-overlay";
t.style.cssText = `\n            position: fixed;\n            inset: 0;\n            background: rgba(0,0,0,0.6);\n            z-index: 999999;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            padding: 24px;\n        `;
const o = document.createElement("div");
o.style.cssText = `\n            width: min(550px, 100%);\n            max-height: calc(100vh - 60px);\n            background: #0e0f11;\n            border-radius: 16px;\n            overflow: hidden;\n            display: flex;\n            flex-direction: column;\n            box-shadow: 0 16px 40px rgba(0,0,0,0.55);\n        `;
const i = document.createElement("div");
i.style.cssText = `\n            display: flex;\n            align-items: center;\n            padding: 16px 20px;\n            gap: 10px;\n            border-bottom: 1px solid rgba(255,255,255,0.12);\n        `;
const r = document.createElement("img");
r.src = chrome.runtime.getURL("images/icons/default/Purpura_Default_Logo_128.png");
r.alt = "Purpura Icon";
r.style.cssText = "width: 28px; height: 28px; flex-shrink: 0; border-radius: 6px;";
const a = document.createElement("span");
a.textContent = e("onboarding_welcome");
a.style.cssText = "font-weight: 700; font-size: 16px; color: #f7f7f8;";
i.appendChild(r);
i.appendChild(a);
const d = document.createElement("div");
d.style.cssText = `\n            padding: 18px 20px;\n            overflow-y: auto;\n            color: rgba(247,247,248,0.9);\n            font-size: 14px;\n            line-height: 1.6;\n        `;
const s = document.createElement("p");
s.textContent = e("onboarding_desc");
s.style.margin = "0 0 12px 0";
const c = document.createElement("ul");
c.style.cssText = "margin: 0 0 16px 18px; padding: 0; line-height: 1.6;";
const l = document.createElement("li");
l.style.marginBottom = "8px";
l.textContent = e("onboarding_step1");
c.appendChild(l);
d.appendChild(s);
d.appendChild(c);
const p = document.createElement("img");
p.src = chrome.runtime.getURL("images/onboarding.png");
p.alt = "Purpura settings button guide";
p.style.cssText = "max-width: 100%; max-height: 220px; width: auto; height: auto; display: block; margin: 12px auto; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15);";
d.appendChild(p);
const x = document.createElement("div");
x.style.cssText = `\n            padding: 14px 20px;\n            border-top: 1px solid rgba(255,255,255,0.12);\n            display: flex;\n            justify-content: flex-end;\n            gap: 10px;\n        `;
const u = document.createElement("button");
u.textContent = e("onboarding_gotIt");
u.style.cssText = `\n            padding: 10px 14px;\n            border-radius: 10px;\n            border: 1px solid rgba(255,255,255,0.2);\n            background: rgba(255,255,255,0.08);\n            color: #f7f7f8;\n            cursor: pointer;\n            font-weight: 600;\n        `;
u.addEventListener("click", () => {
chrome.storage.local.set({
[n]: true
}, () => {
t.remove();
});
});
const g = document.createElement("button");
g.setAttribute("aria-label", "Close");
g.style.cssText = `\n            position: absolute;\n            top: 16px;\n            right: 16px;\n            width: 32px;\n            height: 32px;\n            border: none;\n            background: rgba(255,255,255,0.08);\n            border-radius: 50%;\n            cursor: pointer;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n        `;
g.innerHTML = '<span style="color: rgba(247,247,248,0.9); font-size: 16px; line-height: 1;">✕</span>';
g.addEventListener("click", () => {
chrome.storage.local.set({
[n]: true
}, () => {
t.remove();
});
});
o.appendChild(i);
o.appendChild(d);
o.appendChild(x);
o.appendChild(g);
x.appendChild(u);
t.appendChild(o);
return t;
}
function i() {
if (!t()) return;
chrome.storage.local.get([ n ], e => {
if (e[n]) return;
const t = o();
document.documentElement.appendChild(t);
});
}
function r() {
let e = location.href;
setInterval(() => {
if (location.href !== e) {
e = location.href;
i();
}
}, 500);
}
i();
r();
})();
