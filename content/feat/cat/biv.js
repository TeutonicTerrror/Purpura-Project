/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
if (!window.purpuraBundleItemViewerInitialized) {
window.purpuraBundleItemViewerInitialized = true;
let e = null;
let t = null;
let n = false;
let r = null;
let l = null;
let o = null;
let i = location.href;
let a = false;
let c = "dark";
const s = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M20 6h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/></svg>';
function getTheme() {
const e = document.documentElement;
if (e.classList.contains("dark-theme") || e.getAttribute("data-theme") === "dark") return "dark";
if (e.classList.contains("light-theme") || e.getAttribute("data-theme") === "light") return "light";
if (document.body) {
if (document.body.classList.contains("dark-theme") || document.body.classList.contains("theme-dark")) return "dark";
if (document.body.classList.contains("light-theme") || document.body.classList.contains("theme-light")) return "light";
}
return "dark";
}
function getColors() {
const e = c === "dark";
return {
bg: e ? "linear-gradient(135deg, rgba(139,92,246,0.10), rgba(99,50,200,0.06))" : "linear-gradient(135deg, rgba(51,95,255,0.06), rgba(30,70,220,0.03))",
border: e ? "rgba(139,92,246,0.2)" : "rgba(51,95,255,0.15)",
text: e ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.75)",
accent: e ? "#8b5cf6" : "#335fff",
accentBg: e ? "#8b5cf6" : "#335fff",
btnText: "#fff"
};
}
function applyBannerColors() {
const e = document.querySelector(".purpura-bundle-banner");
if (!e) return;
const t = getColors();
const n = e.firstElementChild;
if (!n) return;
n.style.background = t.bg;
n.style.borderColor = t.border;
const r = n.querySelector(".pbb-text");
if (r) r.style.color = t.text;
const l = n.querySelector('a[href*="bundles/"]');
if (l) l.style.color = t.accent;
const o = n.querySelector(".pbb-view-btn");
if (o) o.style.background = t.accentBg;
const i = n.querySelector("svg");
if (i) i.style.stroke = t.accent;
}
function startThemeObserver() {
if (r) r.disconnect();
r = new MutationObserver(() => {
const e = getTheme();
if (e !== c) {
c = e;
applyBannerColors();
}
});
const e = {
attributes: true,
attributeFilter: [ "class" ]
};
r.observe(document.documentElement, e);
if (document.body) r.observe(document.body, e);
}
function isCatalogPage() {
return window.location.pathname.includes("/catalog/");
}
function getItemId() {
const e = window.location.pathname.match(/\/catalog\/(\d+)/);
return e ? e[1] : null;
}
function cleanup() {
if (o) {
clearInterval(o);
o = null;
}
if (r) {
r.disconnect();
r = null;
}
document.querySelectorAll(".purpura-bundle-banner").forEach(e => e.remove());
e = null;
t = null;
n = false;
}
function showBundleInfo(t, n) {
if (e !== n) return;
if (!t || !t.length) return;
document.querySelectorAll(".purpura-bundle-banner").forEach(e => e.remove());
const r = document.querySelector(".item-details-container, .catalog-page-content, .container-main");
if (!r) return;
const l = getColors();
const o = document.createElement("div");
o.className = "purpura-bundle-banner";
o.setAttribute("data-biv-item", n);
o.style.cssText = "text-align:center;margin:4px 0 12px;";
if (t.length > 1) {
o.innerHTML = `\n                <div style="display:inline-flex;align-items:center;gap:8px;padding:8px 14px;background:${l.bg};border:1px solid ${l.border};border-radius:8px;">\n                    ${s}\n                    <span class="pbb-text" style="font-size:13px;color:${l.text};">This item is part of <strong>${t.length} bundles</strong>.</span>\n                </div>\n            `;
} else {
const e = t[0];
const n = `https://www.roblox.com/bundles/${e.id}/${encodeURIComponent(e.name || "View Bundle")}`;
o.innerHTML = `\n                <div style="display:inline-flex;align-items:center;gap:8px;padding:8px 14px;background:${l.bg};border:1px solid ${l.border};border-radius:8px;">\n                    ${s}\n                    <span class="pbb-text" style="font-size:13px;color:${l.text};">\n                        Part of bundle\n                        <a href="${n}" target="_blank" style="color:${l.accent};font-weight:600;text-decoration:none;">${e.name || "View Bundle"}</a>\n                    </span>\n                    <a href="${n}" target="_blank" class="pbb-view-btn" style="flex-shrink:0;padding:4px 10px;background:${l.accentBg};color:${l.btnText};border-radius:6px;font-size:11px;font-weight:600;text-decoration:none;">View</a>\n                </div>\n            `;
}
const i = r.firstChild;
if (i) {
r.insertBefore(o, i);
} else {
r.appendChild(o);
}
if (t.length === 1) {
fetchBundleThumbnail(t[0].id, n);
}
}
async function fetchBundleThumbnail(t, n) {
try {
const r = await fetch(`https://thumbnails.roblox.com/v1/bundles/thumbnails?bundleIds=${t}&size=150x150&format=Png&isCircular=false`, {
credentials: "include"
});
if (!r.ok || e !== n) return;
const l = await r.json();
if (e !== n) return;
const o = l.data && l.data[0];
if (o && o.imageUrl && o.state === "Completed") {
const e = document.querySelector(".purpura-bundle-banner");
if (e) {
const t = e.querySelector("svg");
if (t) {
t.outerHTML = '<img src="' + o.imageUrl + '" alt="" style="width:20px;height:20px;object-fit:contain;border-radius:4px;flex-shrink:0;">';
}
}
}
} catch (e) {}
}
function fetchBundles(n) {
return fetch("https://catalog.roblox.com/v1/assets/" + n + "/bundles?limit=10", {
credentials: "include"
}).then(function(r) {
if (!r.ok) return;
if (e !== n) return;
return r.json().then(function(r) {
if (e !== n) return;
if (!r.data || r.data.length === 0) return;
t = r.data;
});
}).catch(function() {});
}
function startContainerObserver(n) {
if (o) {
clearInterval(o);
o = null;
}
let r = 0;
const l = 30;
o = setInterval(function() {
if (e !== n) {
clearInterval(o);
o = null;
return;
}
const i = document.querySelector(".item-details-container, .catalog-page-content, .container-main");
if (i && t) {
clearInterval(o);
o = null;
showBundleInfo(t, n);
return;
}
if (++r >= l) {
clearInterval(o);
o = null;
}
}, 200);
}
function init() {
c = getTheme();
startThemeObserver();
const r = getItemId();
if (!r || !isCatalogPage()) {
e = null;
t = null;
n = false;
return;
}
if (e === r && t) {
showBundleInfo(t, r);
return;
}
if (e === r && n) {
startContainerObserver(r);
return;
}
e = r;
t = null;
n = true;
fetchBundles(r).then(function() {
if (e !== r) return;
n = false;
if (!t) return;
showBundleInfo(t, r);
startContainerObserver(r);
});
}
function onUrlChange() {
var e = location.href;
if (e === i) return;
i = e;
cleanup();
if (a) init();
}
function startUrlPolling() {
if (l) return;
l = setInterval(onUrlChange, 600);
}
function stopUrlPolling() {
if (l) {
clearInterval(l);
l = null;
}
}
window.__PurpuraSettings.ready.then(function() {
var e = window.__PurpuraSettings.get("biv");
a = typeof e === "object" ? e.enabled !== false : e !== false;
if (a) {
init();
startUrlPolling();
}
});
chrome.storage.onChanged.addListener(function(e, t) {
if (t !== "sync") return;
var n = e["biv"];
if (!n) return;
var r = window.__PurpuraSettings.get("biv");
a = typeof r === "object" ? r.enabled !== false : r !== false;
if (a) {
stopUrlPolling();
cleanup();
init();
startUrlPolling();
} else {
stopUrlPolling();
cleanup();
}
});
}
