/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
if (window.purpuraChatEligibilityInitialized) return;
window.purpuraChatEligibilityInitialized = true;
(function() {
var t = document.createElement("style");
t.textContent = ":root{--purpura-ce-tooltip-bg:#1a1b1f;--purpura-ce-tooltip-text:#e0e0e0;--purpura-ce-tooltip-border:rgba(255,255,255,0.08);--purpura-ce-tooltip-shadow:rgba(0,0,0,0.35);--purpura-ce-canchat-bg:#1a2a1a;--purpura-ce-canchat-border:rgba(57,203,121,0.3);--purpura-ce-canchat-text:#a0e8b8;--purpura-ce-cannot-bg:#2a1a1a;--purpura-ce-cannot-border:rgba(239,83,80,0.3);--purpura-ce-cannot-text:#f0a0a0;--purpura-ce-agecheck-bg:#2a2410;--purpura-ce-agecheck-border:rgba(245,158,11,0.3);--purpura-ce-agecheck-text:#f0c860}";
document.head.appendChild(t);
})();
var t = "ce";
var e = true;
var r = 300;
var a = null;
var n = null;
var i = null;
function o() {
if (a) return;
a = document.createElement("div");
a.id = "purpura-chat-eligibility-tooltip";
a.style.cssText = [ "position:fixed;z-index:100000;padding:8px 14px;border-radius:8px;", "font-size:13px;font-weight:500;line-height:1.3;white-space:nowrap;", "pointer-events:none;opacity:0;transition:opacity 0.15s;", 'font-family:"DM Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;', "box-shadow:0 4px 16px var(--purpura-ce-tooltip-shadow);", "background:var(--purpura-ce-tooltip-bg);color:var(--purpura-ce-tooltip-text);border:1px solid var(--purpura-ce-tooltip-border);" ].join("");
document.body.appendChild(a);
}
function c(t, e, r) {
o();
if (!a) return;
var n = {
canChat: {
bg: "var(--purpura-ce-canchat-bg)",
border: "var(--purpura-ce-canchat-border)",
text: "var(--purpura-ce-canchat-text)"
},
cannotChat: {
bg: "var(--purpura-ce-cannot-bg)",
border: "var(--purpura-ce-cannot-border)",
text: "var(--purpura-ce-cannot-text)"
},
ageCheck: {
bg: "var(--purpura-ce-agecheck-bg)",
border: "var(--purpura-ce-agecheck-border)",
text: "var(--purpura-ce-agecheck-text)"
}
};
var c = n[r] || n.cannotChat;
a.textContent = e;
a.style.background = c.bg;
a.style.borderColor = c.border;
a.style.color = c.text;
a.style.opacity = "1";
p(t);
if (!i) {
i = p.bind(null, t);
window.addEventListener("scroll", i, {
passive: true
});
}
}
function u() {
if (n) {
clearTimeout(n);
n = null;
}
if (a) a.style.opacity = "0";
if (i) {
window.removeEventListener("scroll", i);
i = null;
}
}
function p(t) {
if (!a) return;
var e = t.getBoundingClientRect();
var r = e.top - a.offsetHeight - 6;
var n = e.left + e.width / 2 - a.offsetWidth / 2;
if (r < 8) r = e.bottom + 6;
if (n < 8) n = 8;
if (n + a.offsetWidth > window.innerWidth - 8) {
n = window.innerWidth - a.offsetWidth - 8;
}
a.style.top = r + "px";
a.style.left = n + "px";
}
function l() {
var t = window.location.pathname.match(/\/users\/(\d+)/);
return t ? t[1] : null;
}
function s() {
var t = [];
var e = document.querySelector(".profile-header-overlay");
if (!e) return t;
var r = e.querySelectorAll('button, a, [role="button"]');
for (var a = 0; a < r.length; a++) {
var n = r[a];
var i = (n.textContent || "").toLowerCase().trim();
var o = (n.getAttribute("aria-label") || "").toLowerCase();
var c = (n.getAttribute("data-testid") || "").toLowerCase();
if (i === "chat" || o.indexOf("chat") !== -1 || c.indexOf("chat") !== -1) {
t.push(n);
}
}
return t;
}
function d(t) {
if (!t) return {
type: "cannotChat",
text: "Chat unavailable"
};
var e = (t.getAttribute("aria-label") || "").toLowerCase();
var r = document.querySelector(".profile-header-overlay");
var a = r ? r.textContent || "" : "";
var n = /age.check|verify.*age|age.*verif|complete.*age.*(check|verif)/i.test(a);
var i = /privacy.*settings|cannot.*chat|chat.*unavail|restricted/i.test(e) || /privacy.*settings|cannot.*chat|chat.*unavail/i.test(a);
if (t.disabled || t.getAttribute("aria-disabled") === "true") {
if (n || /age/i.test(e)) {
return {
type: "ageCheck",
text: "Age verification required to chat"
};
}
return {
type: "cannotChat",
text: "Cannot chat -- restricted by privacy settings"
};
}
if (i) {
if (n || /age/i.test(e)) {
return {
type: "ageCheck",
text: "Age verification required to chat"
};
}
return {
type: "cannotChat",
text: "Cannot chat -- restricted by privacy settings"
};
}
if (/chat/i.test(e)) {
return {
type: "canChat",
text: "You can chat with this user"
};
}
var o = t.getBoundingClientRect();
if (o.width > 0 && o.height > 0 && t.textContent && /chat/i.test(t.textContent)) {
return {
type: "canChat",
text: "You can chat with this user"
};
}
return {
type: "canChat",
text: "You can chat with this user"
};
}
function h(t) {
for (var e = 0; e < t.length; e++) {
var a = t[e];
if (a.dataset.purpuraChatTooltip === "1") continue;
a.dataset.purpuraChatTooltip = "1";
var i = d(a);
a.addEventListener("mouseenter", function(t, e) {
return function() {
if (n) clearTimeout(n);
n = setTimeout(function() {
c(t, e.text, e.type);
}, r);
};
}(a, i));
a.addEventListener("mouseleave", function() {
u();
});
a.addEventListener("click", function() {
u();
});
}
}
function f() {
if (!e) return;
var t = s();
if (t.length) {
h(t);
}
}
var v = null;
var g = location.href;
function b() {
if (v) v.disconnect();
v = new MutationObserver(function() {
f();
});
v.observe(document.body, {
childList: true,
subtree: true
});
f();
}
function y() {
if (v) {
v.disconnect();
v = null;
}
}
function x() {
if (e) {
b();
} else {
y();
u();
if (a && a.parentNode) a.remove();
a = null;
}
}
window.__PurpuraSettings.ready.then(function() {
e = window.__PurpuraSettings.get(t) !== false;
if (/\/users\/\d+/.test(window.location.pathname)) {
x();
}
});
chrome.storage.onChanged.addListener(function(r, a) {
if (a === "sync" && r[t]) {
e = r[t].newValue !== false;
x();
}
});
new MutationObserver(function() {
if (location.href !== g) {
g = location.href;
y();
u();
if (/\/users\/\d+/.test(window.location.pathname)) {
x();
} else {
if (a && a.parentNode) a.remove();
a = null;
}
}
}).observe(document, {
childList: true,
subtree: true
});
})();
