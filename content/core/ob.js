/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
const e = "ob";
function t() {
return location.pathname === "/home" || location.pathname.startsWith("/home/");
}
async function n() {
try {
const e = await fetch("https://users.roblox.com/v1/users/authenticated", {
credentials: "include"
});
if (!e.ok) return null;
const t = await e.json();
const n = t.id;
if (!n) return null;
const o = await fetch(`https://users.roblox.com/v1/users/${n}`, {
credentials: "include"
});
if (!o.ok) return null;
const r = await o.json();
return r.displayName || r.name || r.username || null;
} catch {
return null;
}
}
function o(t) {
const n = document.createElement("div");
n.id = "purpura-onboarding-overlay";
n.style.cssText = `\n            position: fixed;\n            inset: 0;\n            background: rgba(0,0,0,0.6);\n            z-index: 999999;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            padding: 24px;\n        `;
const o = document.createElement("div");
o.style.cssText = `\n            width: min(550px, 100%);\n            max-height: calc(100vh - 60px);\n            background: #0e0f11;\n            border-radius: 16px;\n            overflow: hidden;\n            display: flex;\n            flex-direction: column;\n            box-shadow: 0 16px 40px rgba(0,0,0,0.55);\n        `;
const r = document.createElement("div");
r.style.cssText = `\n            display: flex;\n            align-items: center;\n            padding: 16px 20px;\n            gap: 10px;\n            border-bottom: 1px solid rgba(255,255,255,0.12);\n        `;
const a = document.createElement("img");
a.src = chrome.runtime.getURL("images/icons/default/Purpura_Default_Logo_128.png");
a.alt = "Purpura Icon";
a.style.cssText = "width: 28px; height: 28px; flex-shrink: 0; border-radius: 6px;";
const i = document.createElement("span");
i.textContent = "Welcome to Purpura!";
i.style.cssText = "font-weight: 700; font-size: 16px; color: #f7f7f8;";
r.appendChild(a);
r.appendChild(i);
const s = document.createElement("div");
s.style.cssText = `\n            padding: 18px 20px;\n            overflow-y: auto;\n            color: rgba(247,247,248,0.9);\n            font-size: 14px;\n            line-height: 1.6;\n        `;
const c = document.createElement("p");
c.textContent = t ? `Welcome to Purpura, ${t}! Glad to have you here.` : "Welcome to Purpura! Glad to have you here.";
c.style.margin = "0 0 12px 0";
const l = document.createElement("p");
l.textContent = "Purpura is a Roblox enhancement suite designed to improve your overall experience and make the website less of a buggy mess.";
l.style.margin = "0 0 12px 0";
const d = document.createElement("p");
d.textContent = 'To get started, click the gear icon in the Roblox navbar, then select "Purpura Settings" to open the settings menu.';
d.style.margin = "0 0 12px 0";
const p = document.createElement("img");
p.src = chrome.runtime.getURL("images/onboarding.png");
p.alt = "Purpura settings button guide";
p.style.cssText = "max-width: 100%; max-height: 220px; width: auto; height: auto; display: block; margin: 12px auto; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15);";
const u = document.createElement("p");
u.textContent = "Enjoy using Purpura!";
u.style.margin = "12px 0 0 0";
u.style.opacity = "0.9";
u.style.textAlign = "center";
u.style.width = "100%";
s.appendChild(c);
s.appendChild(l);
s.appendChild(d);
s.appendChild(p);
s.appendChild(u);
const m = document.createElement("div");
m.style.cssText = `\n            padding: 14px 20px;\n            border-top: 1px solid rgba(255,255,255,0.12);\n            display: flex;\n            justify-content: flex-end;\n            gap: 10px;\n        `;
const x = document.createElement("button");
x.textContent = "Got It!";
x.style.cssText = `\n            padding: 10px 14px;\n            border-radius: 10px;\n            border: 1px solid rgba(255,255,255,0.2);\n            background: rgba(255,255,255,0.08);\n            color: #f7f7f8;\n            cursor: pointer;\n            font-weight: 600;\n        `;
x.addEventListener("click", () => {
chrome.storage.local.set({
[e]: true
}, () => {
n.remove();
});
});
const h = document.createElement("button");
h.setAttribute("aria-label", "Close");
h.style.cssText = `\n            position: absolute;\n            top: 16px;\n            right: 16px;\n            width: 32px;\n            height: 32px;\n            border: none;\n            background: rgba(255,255,255,0.08);\n            border-radius: 50%;\n            cursor: pointer;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n        `;
h.innerHTML = '<span style="color: rgba(247,247,248,0.9); font-size: 16px; line-height: 1;">✕</span>';
h.addEventListener("click", () => {
chrome.storage.local.set({
[e]: true
}, () => {
n.remove();
});
});
o.appendChild(r);
o.appendChild(s);
o.appendChild(m);
o.appendChild(h);
m.appendChild(x);
n.appendChild(o);
return n;
}
async function r() {
if (!t()) return;
window.__PurpuraSettings.ready.then(async function() {
if (window.__PurpuraSettings.get(e)) return;
const t = await n();
const r = o(t);
document.documentElement.appendChild(r);
});
}
function a() {
let e = location.href;
setInterval(() => {
if (location.href !== e) {
e = location.href;
r();
}
}, 500);
}
r();
a();
})();
