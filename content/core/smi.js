/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
"use strict";
const e = "purpura-settings-menu-item";
const t = "purpura-settings-sidebar-item";
function n(e) {
if (e.querySelector(`#${t}`)) {
return;
}
const n = chrome.runtime.getURL("images/icons/default/Purpura_Default_Logo_48.png");
const o = document.createElement("li");
o.id = t;
o.setAttribute("role", "tab");
o.className = "menu-option";
const r = document.createElement("a");
r.className = "menu-option-content";
r.href = "/my/account?purpura=info";
r.style.cssText = "display: flex; align-items: center; gap: 8px;";
const c = document.createElement("img");
c.src = n;
c.style.cssText = "width: 16px; height: 16px; flex-shrink: 0;";
c.alt = "";
const s = document.createElement("span");
s.className = "font-caption-header";
s.textContent = "Purpura Settings";
const i = document.createElement("span");
i.className = "rbx-tab-subtitle";
r.appendChild(c);
r.appendChild(s);
r.appendChild(i);
o.appendChild(r);
e.appendChild(o);
}
function o() {
const e = document.querySelector('ul.menu-vertical[role="tablist"]');
if (e) {
n(e);
}
}
function r(t) {
if (t.querySelector(`#${e}`)) {
return;
}
const n = chrome.runtime.getURL("images/icons/default/Purpura_Default_Logo_48.png");
const o = document.createElement("li");
o.id = e;
const r = document.createElement("a");
r.className = "rbx-menu-item";
r.href = "https://www.roblox.com/my/account?purpura=info";
r.style.cssText = "display: flex; align-items: center; gap: 8px;";
const c = document.createElement("img");
c.src = n;
c.style.cssText = "width: 18px; height: 18px;";
c.alt = "Purpura";
r.appendChild(c);
r.appendChild(document.createTextNode("Purpura Settings"));
o.appendChild(r);
const s = t.querySelector('a[href="https://www.roblox.com/my/account"]:not([href*="?"])');
if (s && s.parentElement) {
t.insertBefore(o, s.parentElement);
} else {
t.insertBefore(o, t.firstChild);
}
console.log("[Purpura] Settings menu item injected");
}
function c() {
const e = document.getElementById("settings-popover-menu");
if (e) {
r(e);
}
o();
}
const s = new MutationObserver(e => {
for (const t of e) {
for (const e of t.addedNodes) {
if (e.nodeType === Node.ELEMENT_NODE) {
if (e.id === "settings-popover-menu") {
r(e);
} else if (e.querySelector) {
const t = e.querySelector("#settings-popover-menu");
if (t) {
r(t);
}
const o = e.querySelector('ul.menu-vertical[role="tablist"]');
if (o) {
n(o);
}
}
}
}
}
c();
});
s.observe(document.body || document.documentElement, {
childList: true,
subtree: true
});
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", c);
} else {
c();
}
let i = 0;
const a = setInterval(() => {
c();
i++;
if (i >= 10) {
clearInterval(a);
}
}, 500);
})();
