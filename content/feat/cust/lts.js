/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
const t = "lts";
const e = "/v1/themes/1/0";
let n = false;
window.__PurpuraSettings.ready.then(function() {
n = window.__PurpuraSettings.get(t) === true;
if (n) i();
});
chrome.storage.onChanged.addListener((e, r) => {
if (r !== "local") return;
if (!e[t]) return;
n = window.__PurpuraSettings.get(t) === true;
if (n) i();
});
async function r() {
try {
const t = await fetch("https://accountsettings.roblox.com" + e, {
credentials: "include"
});
if (!t.ok) return "Light";
const n = await t.json();
return n.themeType || "Light";
} catch {
return "Light";
}
}
async function a(t) {
try {
const n = await fetch("https://accountsettings.roblox.com" + e, {
method: "PATCH",
credentials: "include",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
themeType: t
})
});
if (!n.ok) {
alert("Failed to update theme! Try again later.");
return;
}
if (t === "Light") {
document.body.classList.remove("dark-theme");
document.body.classList.add("light-theme");
} else {
document.body.classList.remove("light-theme");
document.body.classList.add("dark-theme");
}
try {
const e = localStorage.getItem("theme");
if (e) {
const n = JSON.parse(e);
const r = await o();
if (r && Array.isArray(n.data)) {
const e = n.data.find(t => t[0] === r);
if (e) {
e[1] = t === "Light" ? 0 : 1;
localStorage.setItem("theme", JSON.stringify(n));
}
}
}
} catch {}
} catch {}
}
async function o() {
try {
const t = document.querySelector('meta[name="user-data"]');
const e = t?.getAttribute("data-userid") || t?.getAttribute("data-user-id");
if (e) return Number(e);
const n = await fetch("https://users.roblox.com/v1/users/authenticated", {
credentials: "include"
});
if (!n.ok) return null;
const r = await n.json();
return r?.id || null;
} catch {
return null;
}
}
async function c() {
const t = await r();
const e = document.createElement("div");
e.style.cssText = "display:flex;flex-direction:column;gap:8px;padding:12px 0;";
const n = document.createElement("label");
n.className = "text-title-large";
n.textContent = "Theme";
const o = document.createElement("select");
o.className = "col-xs-12 col-sm-6";
o.style.cssText = "padding:8px 12px;border-radius:8px;border:1px solid var(--purpura-lts-select-border);background:var(--purpura-lts-select-bg);color:white;font-size:14px;";
const c = document.createElement("option");
c.value = "Light";
c.textContent = "Light";
const s = document.createElement("option");
s.value = "Dark";
s.textContent = "Dark";
o.appendChild(c);
o.appendChild(s);
o.value = t;
o.addEventListener("change", () => a(o.value));
e.appendChild(n);
e.appendChild(o);
return e;
}
function s() {
if (document.getElementById("purpura-lts-style")) return;
var t = document.createElement("style");
t.id = "purpura-lts-style";
t.textContent = ":root{--purpura-lts-select-border:rgba(255,255,255,0.15);--purpura-lts-select-bg:rgba(0,0,0,0.3)}";
document.head.appendChild(t);
}
function i() {
if (!window.location.pathname.startsWith("/my/account")) return;
s();
const t = new MutationObserver(() => {
const t = document.querySelectorAll("h2.setting-section-header");
t.forEach(t => {
if (t.textContent.trim() === "Personal") {
const e = t.closest(".setting-section");
if (!e) return;
if (e.querySelector(".purpura-legacy-theme-switcher")) return;
const n = e.querySelector(".section-content") || e;
c().then(t => {
t.classList.add("purpura-legacy-theme-switcher");
n.appendChild(t);
});
}
});
});
t.observe(document.body, {
childList: true,
subtree: true
});
}
})();
