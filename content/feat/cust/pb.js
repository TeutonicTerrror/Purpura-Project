/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
"use strict";
function e(e, t) {
return chrome.i18n.getMessage(e, t) || e;
}
let t = true;
let n = [];
let r = 0;
const o = 5e3;
if (!window.location.href.includes("roblox")) {
return;
}
(function() {
var e = document.createElement("style");
e.textContent = ":root{--purpura-pb-grad-start:#b388ff;--purpura-pb-grad-end:#7c4dff;--purpura-pb-shadow:rgba(0,0,0,0.3);--purpura-pb-border:rgba(255,255,255,0.2)}";
document.head.appendChild(e);
})();
function a(t, n) {
const r = document.getElementById("purpura-page-bind-notification");
if (r) {
r.remove();
}
const o = document.createElement("div");
o.id = "purpura-page-bind-notification";
o.style.cssText = `\n            position: fixed;\n            bottom: 20px;\n            right: 20px;\n            background: linear-gradient(135deg, var(--purpura-pb-grad-start), var(--purpura-pb-grad-end));\n            color: white;\n            padding: 12px 16px;\n            border-radius: 8px;\n            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n            font-size: 14px;\n            font-weight: 500;\n            box-shadow: 0 4px 12px var(--purpura-pb-shadow);\n            z-index: 10000;\n            animation: slideInUp 0.3s ease-out;\n            max-width: 300px;\n            border: 1px solid var(--purpura-pb-border);\n        `;
if (!document.getElementById("purpura-notification-styles")) {
const e = document.createElement("style");
e.id = "purpura-notification-styles";
e.textContent = `\n                @keyframes slideInUp {\n                    from {\n                        transform: translateY(100%);\n                        opacity: 0;\n                    }\n                    to {\n                        transform: translateY(0);\n                        opacity: 1;\n                    }\n                }\n                @keyframes fadeOut {\n                    from {\n                        opacity: 1;\n                        transform: translateY(0);\n                    }\n                    to {\n                        opacity: 0;\n                        transform: translateY(20px);\n                    }\n                }\n            `;
document.head.appendChild(e);
}
o.innerHTML = `\n            <div style="display: flex; align-items: center; gap: 8px;">\n                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">\n                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>\n                </svg>\n                <div>\n                    <div style="font-weight: 600;">${e("pageBinds_title")}</div>\n                    <div style="font-size: 12px; opacity: 0.9;">${e("pageBinds_navigating", [ t ])}</div>\n                </div>\n            </div>\n        `;
document.body.appendChild(o);
setTimeout(() => {
if (o && o.parentNode) {
o.style.animation = "fadeOut 0.3s ease-out";
setTimeout(() => {
if (o && o.parentNode) {
o.remove();
}
}, 300);
}
}, 3e3);
}
function i() {
window.__PurpuraSettings.ready.then(function() {
const e = {
pb: window.__PurpuraSettings.get("pb")
};
const r = [ {
key: "G",
name: "Groups",
url: "https://www.roblox.com/communities/",
enabled: true,
isDefault: true
}, {
key: "I",
name: "Inventory",
url: "https://www.roblox.com/users/{userID}/inventory",
enabled: true,
isDefault: true
}, {
key: "C",
name: "Catalog",
url: "https://www.roblox.com/catalog",
enabled: true,
isDefault: true
}, {
key: "E",
name: "Avatar Editor",
url: "https://www.roblox.com/my/avatar",
enabled: true,
isDefault: true
}, {
key: "F",
name: "Friends",
url: "https://www.roblox.com/users/friends",
enabled: true,
isDefault: true
}, {
key: "S",
name: "Studio",
url: "https://create.roblox.com/",
enabled: true,
isDefault: true
}, {
key: "R",
name: "Games",
url: "https://www.roblox.com/charts",
enabled: true,
isDefault: true
}, {
key: "P",
name: "Purpura Settings",
url: "https://www.roblox.com/my/account?purpura=info#!/info",
enabled: true,
isDefault: true
} ];
const o = e["pb"];
let a;
if (Array.isArray(o)) {
t = true;
a = o;
chrome.storage.sync.set({
pb: {
enabled: true,
binds: o
}
});
} else if (o && typeof o === "object" && Array.isArray(o.binds)) {
t = o.enabled === true;
a = o.binds;
} else {
t = false;
n = [];
return;
}
const i = a.map(e => e && e.key ? e.key.toUpperCase() : "");
const s = r.filter(e => !i.includes(e.key.toUpperCase()));
if (s.length > 0) {
a = [ ...a, ...s ];
chrome.storage.sync.set({
pb: {
enabled: t,
binds: a
}
});
}
n = a.filter(e => e.enabled);
});
}
function s() {
const e = document.activeElement;
if (!e) return false;
const t = [ "INPUT", "TEXTAREA", "SELECT" ];
const n = [ "text", "password", "email", "search", "url", "tel", "number" ];
if (t.includes(e.tagName)) {
if (e.tagName === "INPUT") {
const t = e.type.toLowerCase();
return n.includes(t);
}
return true;
}
if (e.contentEditable === "true") {
return true;
}
const r = e.getAttribute("role");
if (r && [ "textbox", "searchbox", "combobox" ].includes(r.toLowerCase())) {
return true;
}
return false;
}
function u() {
if (window.Roblox && window.Roblox.config && window.Roblox.config.userId) {
return window.Roblox.config.userId.toString();
}
const e = document.querySelector('meta[name="user-data"]');
if (e) {
try {
const t = JSON.parse(e.getAttribute("data-userid"));
if (t && t.UserId) {
return t.UserId.toString();
}
} catch (e) {}
}
const t = window.location.href.match(/\/users\/(\d+)/);
if (t) {
return t[1];
}
const n = document.querySelector('a[href*="/users/"]');
if (n) {
const e = n.href.match(/\/users\/(\d+)/);
if (e) {
return e[1];
}
}
return null;
}
function d(e) {
const t = u();
if (t && e.includes("{userID}")) {
return e.replace("{userID}", t);
}
return e;
}
function l(e) {
if (document._purpuraCapturingKey) {
return;
}
if (!t) {
return;
}
const i = Date.now();
if (i - r < o) {
return;
}
if (s()) {
return;
}
if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) {
return;
}
const u = e.key.toUpperCase();
const l = n.find(e => e.key.toUpperCase() === u);
if (l) {
e.preventDefault();
e.stopPropagation();
r = i;
const t = d(l.url);
a(l.name, t);
setTimeout(() => {
window.location.href = t;
}, 500);
}
}
chrome.storage.onChanged.addListener((e, t) => {
if (t === "sync" && e["pb"]) {
setTimeout(i, 0);
}
});
document.addEventListener("keydown", l, true);
i();
})();
