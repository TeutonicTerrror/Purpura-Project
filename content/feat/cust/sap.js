/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
"use strict";
const t = "sap";
const e = "purpura-sticky-avatar";
let a = false;
let n = null;
let r = null;
let i = null;
function o() {
return window.location.pathname.startsWith("/my/avatar");
}
function u() {
if (document.getElementById(e)) return;
n = document.createElement("style");
n.id = e;
n.textContent = [ 'body.purpura-sticky-avatar-active #avatar-react-container > div:not([role="status"]) { display:flex !important; align-items:flex-start !important; min-height:100vh !important; }', "body.purpura-sticky-avatar-active .avatar-editor-header { display:none !important; }", "body.purpura-sticky-avatar-active #avatar-react-container .section-content.remove-panel { position:sticky !important; top:56px !important; align-self:flex-start !important; flex-shrink:0 !important; float:none !important; z-index:1 !important; }", "body.purpura-sticky-avatar-active .left-wrapper-placeholder { position:sticky !important; top:56px !important; align-self:flex-start !important; flex-shrink:0 !important; float:none !important; width:277px !important; }", "body.purpura-sticky-avatar-active .left-wrapper { float:none !important; width:277px !important; height:auto !important; }", "body.purpura-sticky-avatar-active .right-panel.six-column { flex:1 1 auto !important; float:none !important; min-width:0 !important; width:auto !important; }" ].join("\n");
(document.head || document.documentElement).appendChild(n);
}
function c() {
if (n) {
n.remove();
n = null;
}
var t = document.getElementById(e);
if (t) t.remove();
if (document.body) document.body.classList.remove("purpura-sticky-avatar-active");
}
function d() {
if (!a || !o() || !document.body) return;
u();
document.body.classList.add("purpura-sticky-avatar-active");
}
function s() {
if (r) r.disconnect();
var t = document.getElementById("avatar-react-container");
if (!t) {
r = new MutationObserver(function() {
t = document.getElementById("avatar-react-container");
if (t) {
r.disconnect();
d();
s();
}
});
r.observe(document.body || document.documentElement, {
childList: true,
subtree: true
});
return;
}
r = new MutationObserver(function() {
d();
});
r.observe(t, {
childList: true,
subtree: true,
attributes: true,
attributeFilter: [ "class", "style" ]
});
}
function l() {
if (i) {
clearTimeout(i);
i = null;
}
if (!a || !o()) {
if (!o()) c();
return;
}
if (!document.body) {
i = setTimeout(l, 100);
return;
}
d();
s();
}
function p() {
chrome.storage.local.get([ t ], function(e) {
var n = e[t];
a = n === undefined || n === true || !!(n && n.enabled === true);
l();
});
}
chrome.storage.onChanged.addListener(function(e, n) {
if (n !== "local" || !e[t]) return;
var r = e[t].newValue;
a = r === true || !!(r && r.enabled === true);
a ? l() : c();
});
var m = history.pushState;
history.pushState = function() {
m.apply(this, arguments);
setTimeout(l, 300);
};
window.addEventListener("popstate", function() {
setTimeout(l, 300);
});
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", l); else l();
p();
})();
