/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
if (!window.bloatwareRemoverInitialized) {
window.bloatwareRemoverInitialized = true;
let e = false;
let t = null;
let o = null;
let a = [];
let r = null;
initializeBloatwareRemover();
function initializeBloatwareRemover() {
window.__PurpuraSettings.ready.then(function() {
const t = window.__PurpuraSettings.get("bwr");
e = t?.enabled || false;
if (e) {
applyBloatwareRemoval();
setupObserver();
}
});
}
chrome.storage.onChanged.addListener(t => {
if (t.bwr) {
const t = window.__PurpuraSettings.get("bwr");
e = t?.enabled || false;
if (e) {
applyBloatwareRemoval();
setupObserver();
} else {
revertBloatwareRemoval();
removeObserver();
}
}
});
function applyBloatwareRemoval() {
a = [];
createBloatwareCSS();
hideSponsoredContent();
hideNavigationElements();
hideFooterLinks();
hidePremiumElements();
hideFaqPanels();
hidePopularityBadges();
hideRobloxPlusAdElements();
logBloatwareRemoval();
}
function createBloatwareCSS() {
if (o && o.isConnected) {
return;
}
if (o) {
o.remove();
}
o = document.createElement("style");
o.id = "purpura-bloatware-remover";
o.textContent = `\n            /* Purpura Bloatware Remover Styles */\n            [data-bloatware-hidden="true"] {\n                display: none !important;\n                visibility: hidden !important;\n                opacity: 0 !important;\n                height: 0 !important;\n                width: 0 !important;\n                margin: 0 !important;\n                padding: 0 !important;\n                border: none !important;\n                overflow: hidden !important;\n            }\n        `;
document.head.appendChild(o);
}
function hideSponsoredContent() {
const e = [ '[data-testid*="sponsored"]', ".sponsored", '[class*="sponsored"]', '[id*="sponsored"]', ".ad-container", ".advertisement", '[class*="promo"]', "[data-ad-slot]", ".app-bumper" ];
e.forEach(e => {
const t = document.querySelectorAll(e);
t.forEach(t => {
if (!t.hasAttribute("data-bloatware-hidden")) {
t.setAttribute("data-bloatware-hidden", "true");
a.push({
type: "Sponsored Content",
selector: e,
element: t.tagName.toLowerCase(),
text: t.textContent?.trim().substring(0, 50) || "N/A"
});
}
});
});
}
function hideNavigationElements() {
const e = [ {
selector: "#nav-blog",
name: "Blog Link"
}, {
selector: "#nav-shop",
name: "Official Store Button"
}, {
selector: "#nav-giftcards",
name: "Gift Cards Link"
}, {
selector: "#upgrade-now-button",
name: "Get Premium Button"
}, {
selector: "li.rbx-upgrade-now",
name: "Premium Upgrade Nav Item"
} ];
e.forEach(({selector: e, name: t}) => {
const o = document.querySelector(e);
if (o && !o.hasAttribute("data-bloatware-hidden")) {
const r = o.closest("li") || o;
r.setAttribute("data-bloatware-hidden", "true");
a.push({
type: "Navigation Element",
selector: e,
element: r.tagName.toLowerCase(),
text: t
});
}
});
const t = document.querySelectorAll("a.text-nav, button.text-nav");
t.forEach(e => {
const t = e.textContent.trim().toLowerCase();
const o = (e.getAttribute("href") || "").toLowerCase();
if ((t.includes("blog") || t.includes("official store") || t.includes("gift cards") || t.includes("buy gift cards") || t.includes("premium") || o.includes("blog.roblox.com") || o.includes("/giftcards") || o.includes("/premium/membership")) && !e.hasAttribute("data-bloatware-hidden")) {
const o = e.closest("li") || e;
o.setAttribute("data-bloatware-hidden", "true");
a.push({
type: "Navigation Element (Dynamic)",
selector: "text-based",
element: o.tagName.toLowerCase(),
text: t.substring(0, 30)
});
}
});
}
function hideFooterLinks() {
const e = [ {
selector: "ul.footer-links",
name: "Footer Links Container"
}, {
selector: ".footer-links",
name: "Footer Links"
}, {
selector: "ul.row.footer-links",
name: "Footer Links Row"
}, {
selector: "ul.row.footer-links.flex.flex-wrap",
name: "Footer Links Flexible Row"
} ];
e.forEach(({selector: e, name: t}) => {
const o = document.querySelectorAll(e);
o.forEach(o => {
if (!o.hasAttribute("data-bloatware-hidden")) {
o.setAttribute("data-bloatware-hidden", "true");
a.push({
type: "Footer Container",
selector: e,
element: o.tagName.toLowerCase(),
text: t
});
}
});
});
const t = document.querySelectorAll(".footer-link a, .text-footer-nav");
const o = [ "about us", "jobs", "blog", "parents", "gift cards", "buy gift cards", "help", "terms", "accessibility", "privacy", "your privacy choices", "sitemap" ];
t.forEach(e => {
const t = e.textContent.trim().toLowerCase();
const r = o.some(e => t.includes(e));
if (r && !e.hasAttribute("data-bloatware-hidden")) {
const o = e.closest("li") || e;
o.setAttribute("data-bloatware-hidden", "true");
a.push({
type: "Footer Link",
selector: "text-based",
element: o.tagName.toLowerCase(),
text: t.substring(0, 30)
});
}
});
}
function hidePremiumElements() {
const e = [ {
selector: ".rbx-upgrade-now",
name: "Premium Upgrade Container"
}, {
selector: "#upgrade-now-button",
name: "Upgrade Now Button"
}, {
selector: 'a[href*="premium/membership"]',
name: "Premium Membership Link"
}, {
selector: ".btn-growth-md.btn-secondary-md",
name: "Premium Button"
}, {
selector: "li.rbx-upgrade-now",
name: "Premium Left Nav Item"
}, {
selector: 'a[href*="ctx=leftnav"]',
name: "Premium Left Nav Link"
} ];
e.forEach(({selector: e, name: t}) => {
const o = document.querySelectorAll(e);
o.forEach(o => {
if (!o.hasAttribute("data-bloatware-hidden")) {
const r = o.closest("li") || o;
r.setAttribute("data-bloatware-hidden", "true");
a.push({
type: "Premium Element",
selector: e,
element: r.tagName.toLowerCase(),
text: t
});
}
});
});
}
function hideFaqPanels() {
const e = document.querySelectorAll('[data-slot="card"].brr-section, [data-slot="card"] .brr-section');
e.forEach(e => {
const t = e.closest('[data-slot="card"]') || e;
const o = t.querySelector('.text-heading-small, [class*="text-heading"]');
const r = (o?.textContent || "").trim().toLowerCase();
const n = !!t.querySelector('[aria-controls^="faq-panel-"]');
if ((r.includes("faq") || n) && !t.hasAttribute("data-bloatware-hidden")) {
t.setAttribute("data-bloatware-hidden", "true");
a.push({
type: "FAQ Panel",
selector: '[data-slot="card"].brr-section',
element: t.tagName.toLowerCase(),
text: (o?.textContent || "FAQ").trim().substring(0, 30)
});
}
});
}
function hidePopularityBadges() {
const e = document.querySelectorAll('.foundation-web-badge, [class*="foundation-web-badge"]');
e.forEach(e => {
const t = (e.textContent || "").trim().toLowerCase();
if (t.includes("popular") && !e.hasAttribute("data-bloatware-hidden")) {
e.setAttribute("data-bloatware-hidden", "true");
a.push({
type: "Popularity Badge",
selector: ".foundation-web-badge",
element: e.tagName.toLowerCase(),
text: t.substring(0, 30)
});
}
});
}
function hideRobloxPlusAdElements() {
const e = document.querySelectorAll('#left-navigation-container .left-nav div a[href="https://www.roblox.com/plus"], ' + '#left-navigation-container a[href="/plus"], ' + '#left-navigation-container a[href*="roblox.com/plus"]');
e.forEach(e => {
const t = e.closest("li") || e;
if (!t.hasAttribute("data-bloatware-hidden")) {
t.setAttribute("data-bloatware-hidden", "true");
a.push({
type: "Roblox Plus Ad",
selector: "sidebar-plus-link",
element: t.tagName.toLowerCase(),
text: "Sidebar Plus Link"
});
}
});
const t = document.querySelectorAll('#left-navigation-container .left-nav div li.padding-top-xsmall a[href="/plus"]');
t.forEach(e => {
const t = e.closest("li") || e.parentElement;
if (!t.hasAttribute("data-bloatware-hidden")) {
t.setAttribute("data-bloatware-hidden", "true");
a.push({
type: "Roblox Plus Ad",
selector: "sidebar-plus-note",
element: t.tagName.toLowerCase(),
text: "Sidebar Plus Note"
});
}
});
const o = document.querySelectorAll('div.buy-robux-content div div div.flex a[href="/plus"]');
o.forEach(e => {
const t = e.closest('[class*="card"]') || e.parentElement?.parentElement?.parentElement;
const o = t?.children?.[1] || t;
if (o && !o.hasAttribute("data-bloatware-hidden")) {
o.setAttribute("data-bloatware-hidden", "true");
a.push({
type: "Roblox Plus Ad",
selector: "buy-robux-plus-snippet",
element: o.tagName.toLowerCase(),
text: "Buy Robux Plus Section"
});
}
});
}
function logBloatwareRemoval() {}
function revertBloatwareRemoval() {
if (o) {
o.remove();
o = null;
}
const e = document.querySelectorAll('[data-bloatware-hidden="true"]');
e.forEach(e => {
e.removeAttribute("data-bloatware-hidden");
});
a = [];
}
function setupObserver() {
if (!e) return;
removeObserver();
t = new MutationObserver(t => {
let o = false;
t.forEach(e => {
e.addedNodes.forEach(e => {
if (e.nodeType === Node.ELEMENT_NODE) {
const t = e.matches?.("li, a, button, ul") || e.querySelector?.("li, a, button, ul");
if (t) {
o = true;
}
}
});
});
if (o) {
if (r) {
clearTimeout(r);
}
r = setTimeout(() => {
r = null;
if (e) {
applyBloatwareRemoval();
}
}, 120);
}
});
t.observe(document.body, {
childList: true,
subtree: true
});
}
function removeObserver() {
if (r) {
clearTimeout(r);
r = null;
}
if (t) {
t.disconnect();
t = null;
}
}
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", () => {
if (e) {
setTimeout(applyBloatwareRemoval, 500);
}
});
} else {
if (e) {
setTimeout(applyBloatwareRemoval, 500);
}
}
}
