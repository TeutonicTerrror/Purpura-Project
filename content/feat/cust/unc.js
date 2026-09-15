/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
let configLoggedThisSession = false;

const selectors = {
navGame: ".nav.rbx-navbar.hidden-xs.hidden-sm.col-md-5.col-lg-4 > li:nth-of-type(1) > .font-header-2.nav-menu-title.text-header.charts-rename-exp-treatment",
chartsHeader: "h1",
chartsLink: 'a.font-header-2.nav-menu-title.text-header[href="/charts"]',
chartsGamesLink: 'a.font-header-2.nav-menu-title.text-header[href="/charts"]',
navCatalog: ".nav.rbx-navbar.hidden-xs.hidden-sm.col-md-5.col-lg-4 > li:nth-of-type(2) > .font-header-2.nav-menu-title.text-header",
catalogLink: '.heading > [href*="/catalog"]',
marketplaceLink: 'a.font-header-2.nav-menu-title.text-header[href="/catalog"]',
marketplaceCatalogLink: 'a.font-header-2.nav-menu-title.text-header[href="/catalog"]',
marketplacePricingHeader: ".container-header > h1",
createLink: 'a#header-develop-sm-link.font-header-2.nav-menu-title.text-header[href="https://create.roblox.com/"]',
createStudioLink: 'a#header-develop-md-link.font-header-2.nav-menu-title.text-header[href="https://create.roblox.com/"]',
navGroups: "#nav-group > .font-header-2.dynamic-ellipsis-item",
groupsHeader: ".container-header.see-all-container-header.ng-scope > h1.ng-binding",
createGroup: ".dnd-groups-list-container.groups-list > .col-xs-12.col-sm-3 > .menu-vertical-container > .btn-secondary-md.btn-full-width",
buttonTextContainer: "span.web-blox-css-tss-1283320-Button-textContainer",
profileSocialCountLabel: "span.profile-header-social-count-label",
dynamicEllipsisItem: "span.font-header-2.dynamic-ellipsis-item",
textLead: "span.text-lead",
friendsSearchInput: "input.friends-filter-searchbar-input",
chatSearchInput: "input.input-field.chat-search-input",
moreInfoIcon: "span.icon-moreinfo",
serverListHeader: "h2.server-list-header",
friendsInServerLabel: ".text.friends-in-server-label"
};

const originalValues = new Map;

let observer;

let currentConfig = {
enabled: false,
sections: {
charts: true,
marketplace: true,
create: true,
groups: true
}
};

function safeQuerySelector(e) {
try {
return document.querySelector(e);
} catch (e) {
return null;
}
}

const REPLACEMENTS_BY_SECTION = {
marketplace: [ {
from: /\bMarketplace Item Pricing\b/g,
to: "Catalog Item Pricing"
}, {
from: /\bMarketplace\b/g,
to: "Catalog"
} ],
charts: [ {
from: /\bCharts\b/g,
to: "Games"
} ],
create: [ {
from: /\bCreate\b/g,
to: "Studio"
} ],
groups: []
};

function getActiveReplacements() {
const e = Object.entries(currentConfig.sections).filter(([, e]) => e).map(([e]) => e);
const t = [];
for (const n of e) {
const e = REPLACEMENTS_BY_SECTION[n];
if (Array.isArray(e)) {
t.push(...e.map(e => ({
...e,
section: n
})));
}
}
return t;
}

function isAvatarEditorPage() {
const e = window.location.pathname.toLowerCase();
return e === "/my/avatar" || e.startsWith("/my/avatar/");
}

function shouldSkipCreateReplacement(e, t) {
if (!isAvatarEditorPage()) return false;
const n = String(t || "").trim();
if (!/\bCreate\b/i.test(n)) return false;
if (/\bCreate New Character\b/i.test(n) || /\bNew Character\b/i.test(n)) {
return true;
}
if (!e || typeof e.closest !== "function") return false;
const a = [ ".btn-secondary-xs.btn-float-right", ".MuiDialogTitle-root", ".web-blox-css-tss-1283320-Button-textContainer", '[class*="avatar" i]', '[id*="avatar" i]' ].join(", ");
if (typeof e.matches === "function" && e.matches(a)) return true;
return !!e.closest(a);
}

function isInsideSettingsContent(e) {
if (!isSettingsPage() || !e || !e.parentElement) return false;
const t = document.querySelector(".content, #content, .content-inner, #content-inner");
if (!t) return false;
return t.contains(e);
}

function applyTextReplacements(e, t) {
const n = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, null, false);
let a;
while (a = n.nextNode()) {
if (isInsideSettingsContent(a)) continue;
const e = a.parentElement && a.parentElement.tagName;
if (e === "SCRIPT" || e === "STYLE" || e === "NOSCRIPT" || e === "TEMPLATE") continue;
const n = originalValues.has(a) ? originalValues.get(a).text : a.nodeValue;
let r = n;
for (const e of t) {
if (e.section === "create" && shouldSkipCreateReplacement(a.parentElement, n)) {
continue;
}
r = r.replace(e.from, e.to);
}
if (r !== a.nodeValue) {
if (!originalValues.has(a)) {
originalValues.set(a, {
text: n
});
}
a.nodeValue = r;
}
}
}

function applyAttributeReplacements(e) {
const t = document.querySelectorAll("[placeholder],[title],[aria-label]");
t.forEach(t => {
if (isInsideSettingsContent(t)) return;
const n = originalValues.get(t) || {};
let a = false;
const r = r => {
const o = t.getAttribute(r);
if (!o) return;
const i = n[r] ?? o;
let s = i;
for (const n of e) {
if (n.section === "create" && shouldSkipCreateReplacement(t, i)) {
continue;
}
s = s.replace(n.from, n.to);
}
if (s !== o) {
if (!n[r]) {
n[r] = o;
}
t.setAttribute(r, s);
a = true;
}
};
r("placeholder");
r("title");
r("aria-label");
if (a) {
originalValues.set(t, n);
}
});
}

const SETTINGS_PAGE_PURPURA_PARAM = "purpura";

function isSettingsPage() {
return new URLSearchParams(window.location.search).has(SETTINGS_PAGE_PURPURA_PARAM);
}

function isInsideSettingsContent(e) {
if (!isSettingsPage() || !e || !e.parentElement) return false;
const t = document.querySelector(".content, #content, .content-inner, #content-inner");
if (!t) return false;
return t.contains(e);
}

function applyChanges() {
if (!currentConfig.enabled) return;
revertChanges();
const e = getActiveReplacements();
if (!e.length) return;
applyTextReplacements(document.body, e);
applyAttributeReplacements(e);
const t = document.querySelectorAll(selectors.moreInfoIcon);
t.forEach(e => {
if (!originalValues.has(e)) {
originalValues.set(e, {
styleDisplay: e.style.display || ""
});
}
e.style.display = "none";
});
}

function revertChanges() {
for (const [e, t] of originalValues) {
if (!e.isConnected) continue;
if (e.nodeType === Node.TEXT_NODE) {
e.nodeValue = t.text;
continue;
}
if (e.nodeType === Node.ELEMENT_NODE) {
if (t.text) {
e.textContent = t.text;
}
if (t.placeholder) {
e.setAttribute("placeholder", t.placeholder);
}
if (t.title) {
e.setAttribute("title", t.title);
}
if (t["aria-label"]) {
e.setAttribute("aria-label", t["aria-label"]);
}
if (t.styleDisplay !== undefined && e.classList.contains("icon-moreinfo")) {
e.style.display = t.styleDisplay;
}
}
}
originalValues.clear();
}

async function loadConfiguration() {
try {
const e = {
unc: window.__PurpuraSettings.get("unc"),
uncConfig: window.__PurpuraSettings.get("uncConfig")
};
if (e.unc !== undefined) {
currentConfig.enabled = Boolean(e.unc);
}
if (e.uncConfig) {
currentConfig = {
...currentConfig,
...e.uncConfig
};
}
configLoggedThisSession = true;
} catch (e) {
try {
const e = localStorage.getItem("unc");
const t = localStorage.getItem("uncConfig");
if (e !== null) {
currentConfig.enabled = e === "true";
}
if (t) {
const e = JSON.parse(t);
currentConfig = {
...currentConfig,
...e
};
}
} catch (e) {}
}
}

function initObserver() {
observer = new MutationObserver(e => {
if (!e.some(e => e.addedNodes.length || e.removedNodes.length)) return;
loadConfiguration().then(() => {
currentConfig.enabled ? applyChanges() : revertChanges();
}).catch(() => {
const e = localStorage.getItem("unc") === "true";
if (e) {
currentConfig.enabled = true;
applyChanges();
} else {
revertChanges();
}
});
});
observer.observe(document.documentElement, {
childList: true,
subtree: true,
attributes: false,
characterData: false
});
}

loadConfiguration().then(() => {
if (currentConfig.enabled) applyChanges();
initObserver();
}).catch(e => {
const t = localStorage.getItem("unc") === "true";
if (t) {
currentConfig.enabled = true;
applyChanges();
}
initObserver();
});

try {
chrome.storage.onChanged.addListener(e => {
if (e.unc || e.uncConfig) {
loadConfiguration().then(() => {
currentConfig.enabled ? applyChanges() : revertChanges();
});
}
});
} catch (e) {}
