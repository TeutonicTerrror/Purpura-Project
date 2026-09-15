/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
if (!window.purpuraTabsInitialized) {
window.purpuraTabsInitialized = true;
let e = null;
let t = null;
initializePurpuraTabs();
function initializePurpuraTabs() {
window.__PurpuraSettings.ready.then(function() {
var e = window.__PurpuraSettings.getRaw("pt");
if (e === undefined) {
const e = {
enabled: true,
favicon: {
type: "purpura",
url: chrome.runtime.getURL("images/icons/default/Purpura_Default_Logo_48.png"),
data: null
},
titleFormat: "{n} Purpura"
};
applyPurpuraChanges(e);
setupTitleObserver(e);
window.__PurpuraSettings.set("pt", e);
return;
}
if (e.enabled) {
applyPurpuraChanges(e);
setupTitleObserver(e);
} else {
revertPurpuraChanges();
removeTitleObserver();
}
});
}
chrome.storage.onChanged.addListener(e => {
if (e.pt) {
const t = e.pt.newValue;
if (t?.enabled) {
applyPurpuraChanges(t);
setupTitleObserver(t);
} else {
revertPurpuraChanges();
removeTitleObserver();
}
}
});
const r = {
default: "",
purpura: chrome.runtime.getURL("images/icons/default/Purpura_Default_Logo_48.png"),
newYears: chrome.runtime.getURL("images/icons/newYears/Purpura_NewYears_Logo_48.png"),
lunarNewYear: chrome.runtime.getURL("images/icons/lunarNewYear/Purpura_LunarNewYear_Logo_48.png"),
valentines: chrome.runtime.getURL("images/icons/valentines/Purpura_Valentines_Logo_48.png"),
blackHistory: chrome.runtime.getURL("images/icons/blackHistory/Purpura_BlackHistory_Logo_48.png"),
stPatricksDay: chrome.runtime.getURL("images/icons/stPatricksDay/Purpura_StPatricks_Logo_48.png"),
womensDay: chrome.runtime.getURL("images/icons/womensDay/Purpura_WomensDay_Logo_48.png"),
easter: chrome.runtime.getURL("images/icons/easter/Purpura_Easter_Logo_48.png"),
pride: chrome.runtime.getURL("images/icons/pride/Purpura_Pride_Logo_48.png"),
halloween: chrome.runtime.getURL("images/icons/halloween/Purpura_Halloween_Logo_48.png"),
diwali: chrome.runtime.getURL("images/icons/diwali/Purpura_Diwali_Logo_48.png"),
hanukkah: chrome.runtime.getURL("images/icons/hanukkah/Purpura_Hanukkah_Logo_48.png"),
christmas: chrome.runtime.getURL("images/icons/christmas/Purpura_Christmas_Logo_48.png")
};
function applyPurpuraChanges(e) {
let t = "/favicon.ico";
const n = e.favicon?.type || "purpura";
if (n === "custom" && e.favicon?.data) {
t = e.favicon.data;
} else if (n === "default") {
t = "/favicon.ico";
} else {
t = r[n] || r.purpura;
}
let i = document.querySelector("link[rel~='icon']") || document.createElement("link");
i.rel = "icon";
i.type = "image/png";
i.href = t;
document.head.appendChild(i);
applyTitleFormat(e);
}
function applyTitleFormat(e) {
let t = e.titleFormat || "{n} Purpura";
let r = document.title || "Roblox";
const n = extractOriginalTitle(r);
if (t.includes("{title}")) {
t = t.replace("{title}", n);
}
if (t.includes("{n}")) {
t = t.replace("{n}", "( ✦ )");
} else {
t = t.replace(/ \( ✦ \)/g, "");
r = r.replace(/ \( ✦ \)/g, "");
}
if (r !== t) {
document.title = t;
}
}
function extractOriginalTitle(e) {
if (!e || typeof e !== "string") {
return "Roblox";
}
return e.replace(/ \(w\/ Purpura\).*$/, "").replace(/^.*\|\s*/, "").replace(/^🎮\s*/, "").replace(/\s*\( ✦ \).*$/, "").replace(/^.*Purpura\s*/, "").replace(/^\s*\( ✦ \)\s*/, "").trim() || "Roblox";
}
function revertPurpuraChanges() {
const e = document.querySelector("link[rel~='icon']");
if (e) {
e.href = "/favicon.ico";
}
const t = extractOriginalTitle(document.title);
document.title = t;
}
function setupTitleObserver(r) {
t = r;
removeTitleObserver();
const n = generateExpectedTitle(r);
let i = false;
let o = false;
const a = Object.getOwnPropertyDescriptor(HTMLTitleElement.prototype, "textContent");
const l = Object.getOwnPropertyDescriptor(HTMLTitleElement.prototype, "innerText");
const u = Object.getOwnPropertyDescriptor(Document.prototype, "title").set;
const c = Object.getOwnPropertyDescriptor(Document.prototype, "title").get;
const s = document.querySelector("title");
o = true;
if (s) {
s.textContent = n;
}
u.call(document, n);
if (a && a.set) {
Object.defineProperty(HTMLTitleElement.prototype, "textContent", {
set: function(e) {
if (!o || i) {
a.set.call(this, e);
} else {
a.set.call(this, n);
}
},
get: a.get,
configurable: true
});
}
if (l && l.set) {
Object.defineProperty(HTMLTitleElement.prototype, "innerText", {
set: function(e) {
if (!o || i) {
l.set.call(this, e);
} else {
l.set.call(this, n);
}
},
get: l.get,
configurable: true
});
}
Object.defineProperty(document, "title", {
set: function(e) {
if (!o || i) {
u.call(this, e);
} else {
u.call(this, n);
}
},
get: function() {
return o ? n : c.call(this);
},
configurable: true
});
const p = new MutationObserver(e => {
if (o && !i) {
e.forEach(e => {
if (e.type === "childList" || e.type === "characterData") {
const e = document.querySelector("title");
if (e && e.textContent !== n) {
i = true;
e.textContent = n;
setTimeout(() => {
i = false;
}, 1);
}
}
});
}
});
if (s) {
p.observe(s, {
childList: true,
characterData: true,
subtree: true
});
}
const g = setInterval(() => {
if (o && !i) {
const e = document.querySelector("title");
if (e && e.textContent !== n) {
i = true;
e.textContent = n;
setTimeout(() => {
i = false;
}, 1);
}
if (c.call(document) !== n) {
i = true;
u.call(document, n);
setTimeout(() => {
i = false;
}, 1);
}
}
}, 1);
e = {
disconnect: () => p.disconnect(),
nuclearWatcher: g,
originalTitleElementSetter: a,
originalInnerTextSetter: l,
originalDocumentTitleSetter: u,
originalDocumentTitleGetter: c,
titleLocked: true,
unlock: () => {
o = false;
}
};
}
function generateExpectedTitle(e, t = null) {
let r = e.titleFormat || "{n} Purpura";
if (t) {
const e = extractOriginalTitle(t);
if (r.includes("{title}")) {
r = r.replace("{title}", e);
}
} else {
if (r.includes("{title}")) {
r = r.replace("{title}", "Roblox");
}
}
if (r.includes("{n}")) {
r = r.replace("{n}", "( ✦ )");
}
return r;
}
function removeTitleObserver() {
if (e) {
e.disconnect();
if (e.nuclearWatcher) {
clearInterval(e.nuclearWatcher);
}
if (e.originalTitleElementSetter) {
Object.defineProperty(HTMLTitleElement.prototype, "textContent", e.originalTitleElementSetter);
}
if (e.originalInnerTextSetter) {
Object.defineProperty(HTMLTitleElement.prototype, "innerText", e.originalInnerTextSetter);
}
if (e.originalDocumentTitleSetter) {
Object.defineProperty(document, "title", {
set: e.originalDocumentTitleSetter,
get: e.originalDocumentTitleGetter,
configurable: true
});
}
if (e.unlock) {
e.unlock();
}
e = null;
}
t = null;
}
}
