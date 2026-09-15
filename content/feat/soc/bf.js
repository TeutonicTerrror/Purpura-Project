/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
if (window.purpuraBulkUnfriendInitialized) return;
window.purpuraBulkUnfriendInitialized = true;
var e = "bf";
var r = true;
var t = false;
var n = [];
(function() {
var e = document.createElement("style");
e.textContent = ":root{--purpura-bf-chip-bg:#2a2a2e;--purpura-bf-chip-text:#e0e0e0;--purpura-bf-danger:#c0392b;--purpura-bf-danger-hover:#e74c3c;--purpura-bf-danger-light:#d32f2f;--purpura-bf-overlay:rgba(0,0,0,0.6);--purpura-bf-overlay-heavy:rgba(0,0,0,0.7);--purpura-bf-modal-bg:#1e1e24;--purpura-bf-modal-shadow:rgba(0,0,0,0.4);--purpura-bf-border:rgba(255,255,255,0.06);--purpura-bf-border-light:rgba(255,255,255,0.04);--purpura-bf-text-emphasis:#f0f0f0;--purpura-bf-text-muted:#8a8a90;--purpura-bf-text-primary:#ddd;--purpura-bf-btn-cancel-bg:rgba(255,255,255,0.06);--purpura-bf-btn-cancel-hover:rgba(255,255,255,0.1);--purpura-bf-progress-track:rgba(74,77,85,0.5);--purpura-bf-focus-ring:#fff;--purpura-bf-white:#fff;--purpura-bf-surface:rgba(39,41,48,1)}.purpura-unfriend-radio{width:24px;height:24px;border:none;background:none;cursor:pointer;padding:0;margin:0;outline:none;display:flex;align-items:center;justify-content:center}.purpura-unfriend-radio .icon-radio-check-circle,.purpura-unfriend-radio .icon-radio-check-circle-filled{font-size:24px;line-height:1}.purpura-bulk-toggle:hover{filter:brightness(1.2)}.purpura-bulk-toggle:active{filter:brightness(0.9)}.purpura-bulk-toggle:focus-visible{outline:2px solid var(--purpura-bf-focus-ring);outline-offset:2px}.purpura-unfriend-action-btn:hover{filter:brightness(1.1)}.purpura-unfriend-action-btn:active{filter:brightness(0.85)}.purpura-unfriend-action-btn:focus-visible{outline:2px solid var(--purpura-bf-focus-ring);outline-offset:2px}";
document.head.appendChild(e);
})();
function a() {
var e = document.querySelector('meta[name="csrf-token"]');
if (e) return e.getAttribute("content");
if (window.Roblox && window.Roblox.XsrfToken) {
try {
var r = window.Roblox.XsrfToken.getToken();
if (r) return r;
} catch (e) {}
}
var t = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
if (t) return decodeURIComponent(t[1]);
return "";
}
var i = null;
var o = null;
var u = null;
var d = null;
function c() {
if (document.querySelector(".purpura-bulk-toggle")) return;
var e = document.querySelector(".chip-filters-container");
if (!e) return;
var r = document.createElement("button");
r.className = "purpura-bulk-toggle";
r.textContent = t ? "Exit Bulk Mode" : "Bulk Unfriend";
r.style.cssText = "border:none;border-radius:32px;padding:6px 16px;font-size:14px;font-weight:500;cursor:pointer;background:var(--purpura-bf-chip-bg);color:var(--purpura-bf-chip-text);transition:background 0.15s;line-height:1.4;";
r.addEventListener("click", function() {
p();
});
u = r;
var n = document.createElement("button");
n.className = "purpura-unfriend-action-btn";
n.style.cssText = "display:none;border:none;border-radius:32px;padding:6px 16px;font-size:14px;font-weight:500;cursor:pointer;background:var(--purpura-bf-danger);color:var(--purpura-bf-white);line-height:1.4;";
n.textContent = "Unfriend";
n.addEventListener("click", function() {
g();
});
d = n;
var a = document.createElement("div");
a.style.cssText = "display:flex;align-items:center;gap:8px;margin-top:12px;";
a.appendChild(r);
a.appendChild(n);
e.insertAdjacentElement("afterend", a);
h();
}
function l() {
if (i) return;
i = new MutationObserver(function() {
if (!r) return;
if (!o) {
o = setTimeout(function() {
o = null;
c();
if (t) b();
}, 200);
}
});
i.observe(document.body, {
childList: true,
subtree: true
});
}
function s() {
if (i) {
i.disconnect();
i = null;
}
clearTimeout(o);
o = null;
}
function p() {
t = !t;
n = [];
if (u) {
u.textContent = t ? "Exit Bulk Mode" : "Bulk Unfriend";
}
b();
h();
}
function f() {
var e = document.querySelectorAll(".avatar-card-caption");
for (var r = 0; r < e.length; r++) {
var t = e[r];
var n = t.closest(".avatar-card, li.list-item");
if (!n) continue;
var a = t.querySelector('a.avatar-name, a[href*="/users/"]');
var i = a ? (a.href.match(/\/users\/(\d+)/) || [])[1] : null;
if (!i) continue;
var o = n.querySelector(".purpura-unfriend-radio");
var u = n.querySelectorAll("a, button, svg, span, img");
for (var d = 0; d < u.length; d++) {
if (!u[d].classList.contains("purpura-unfriend-radio") && !u[d].closest(".purpura-unfriend-radio")) {
u[d].style.pointerEvents = "none";
}
}
n.style.pointerEvents = "auto";
n.style.cursor = "pointer";
if (!n._purpuraClickHandler) {
(function(e) {
n._purpuraClickHandler = function(r) {
var t = e.querySelector(".purpura-unfriend-radio");
if (t && !r.target.closest(".purpura-unfriend-radio")) {
t.click();
}
};
})(n);
n.addEventListener("click", n._purpuraClickHandler);
}
}
}
function v() {
var e = document.querySelectorAll(".avatar-card-caption");
for (var r = 0; r < e.length; r++) {
var t = e[r];
var n = t.closest(".avatar-card, li.list-item");
if (!n) continue;
n.style.pointerEvents = "";
n.style.cursor = "";
var a = n.querySelectorAll("a, button, svg, span, img");
for (var i = 0; i < a.length; i++) {
a[i].style.pointerEvents = "";
}
if (n._purpuraClickHandler) {
n.removeEventListener("click", n._purpuraClickHandler);
delete n._purpuraClickHandler;
}
}
}
function b() {
var e = document.querySelectorAll(".purpura-unfriend-radio");
for (var r = 0; r < e.length; r++) {
e[r].remove();
}
var a = document.querySelectorAll(".avatar-card-caption");
for (var i = 0; i < a.length; i++) {
var o = a[i];
if (!t) continue;
var u = o.querySelector('a.avatar-name, a[href*="/users/"]');
var d = u ? (u.href.match(/\/users\/(\d+)/) || [])[1] : null;
if (!d) continue;
var c = false;
for (var l = 0; l < n.length; l++) {
if (n[l].id === d) {
c = true;
break;
}
}
var s = document.createElement("button");
s.type = "button";
s.className = "purpura-unfriend-radio";
s.setAttribute("role", "checkbox");
s.setAttribute("aria-checked", String(c));
s.style.cssText = "position:absolute;top:8px;left:8px;z-index:999;pointer-events:auto;";
var p = document.createElement("span");
p.className = c ? "icon-radio-check-circle-filled" : "icon-radio-check-circle";
p.style.pointerEvents = "none";
s.appendChild(p);
s.dataset.friendId = d;
s.dataset.friendName = u.textContent.trim();
s.addEventListener("click", function(e) {
e.stopPropagation();
var r = this.getAttribute("aria-checked") === "true";
var t = !r;
this.setAttribute("aria-checked", String(t));
var a = this.querySelector("span");
if (a) a.className = t ? "icon-radio-check-circle-filled" : "icon-radio-check-circle";
var i = this.dataset.friendId;
var o = this.dataset.friendName;
if (t) {
var u = false;
for (var d = 0; d < n.length; d++) {
if (n[d].id === i) {
u = true;
break;
}
}
if (!u) n.push({
id: i,
name: o
});
} else {
var c = [];
for (var l = 0; l < n.length; l++) {
if (n[l].id !== i) c.push(n[l]);
}
n = c;
}
h();
});
var b = o.closest(".avatar-card, li.list-item") || o.parentNode;
b.style.position = "relative";
b.appendChild(s);
}
if (t) {
f();
} else {
v();
}
}
function h() {
if (!d) return;
if (t && n.length > 0) {
d.style.display = "";
d.textContent = "Unfriend (" + n.length + ")";
} else {
d.style.display = "none";
}
}
function g() {
var e = document.createElement("div");
e.className = "purpura-confirm-overlay";
e.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:var(--purpura-bf-overlay);z-index:99999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);";
var r = document.createElement("div");
r.style.cssText = "background:var(--purpura-bf-modal-bg);border-radius:16px;box-shadow:0 8px 40px var(--purpura-bf-modal-shadow);max-width:440px;width:90%;max-height:80vh;overflow:hidden;display:flex;flex-direction:column;";
var t = document.createElement("div");
t.style.cssText = "padding:20px 24px 16px;border-bottom:1px solid var(--purpura-bf-border);";
var a = document.createElement("h2");
a.textContent = "Unfriend " + n.length + " user" + (n.length > 1 ? "s" : "") + "?";
a.style.cssText = "color:var(--purpura-bf-text-emphasis);font-size:17px;font-weight:600;margin:0;line-height:1.3;";
var i = document.createElement("div");
i.textContent = "This cannot be undone. You can always re-add them later.";
i.style.cssText = "color:var(--purpura-bf-text-muted);font-size:13px;margin-top:6px;";
t.appendChild(a);
t.appendChild(i);
r.appendChild(t);
var o = document.createElement("div");
o.style.cssText = "max-height:260px;overflow-y:auto;padding:8px 24px;";
n.forEach(function(r) {
var t = document.createElement("div");
t.style.cssText = "display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--purpura-bf-border-light);";
var a = document.createElement("span");
a.textContent = r.name;
a.style.cssText = "color:var(--purpura-bf-text-primary);font-size:14px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;";
t.appendChild(a);
var i = document.createElement("button");
i.textContent = "✕";
i.style.cssText = "background:none;border:none;color:var(--purpura-bf-text-muted);cursor:pointer;font-size:15px;padding:4px 8px;border-radius:6px;transition:all 0.15s;line-height:1;margin-left:8px;flex-shrink:0;";
i.addEventListener("mouseenter", function() {
this.style.background = "var(--purpura-bf-btn-cancel-bg)";
this.style.color = "var(--purpura-bf-danger-hover)";
});
i.addEventListener("mouseleave", function() {
this.style.background = "none";
this.style.color = "var(--purpura-bf-text-muted)";
});
i.addEventListener("click", function() {
n = n.filter(function(e) {
return e.id !== r.id;
});
var t = document.querySelector('.purpura-unfriend-radio[data-friend-id="' + r.id + '"]');
if (t) {
t.setAttribute("aria-checked", "false");
var a = t.querySelector("span");
if (a) a.className = "icon-radio-check-circle";
}
e.remove();
if (n.length > 0) g();
h();
});
t.appendChild(i);
o.appendChild(t);
});
r.appendChild(o);
var u = document.createElement("div");
u.style.cssText = "padding:16px 24px;border-top:1px solid var(--purpura-bf-border);display:flex;gap:10px;justify-content:flex-end;";
var d = document.createElement("button");
d.textContent = "Cancel";
d.style.cssText = "border:none;border-radius:8px;padding:8px 20px;font-size:14px;font-weight:500;cursor:pointer;background:var(--purpura-bf-btn-cancel-bg);color:var(--purpura-bf-text-primary);transition:background 0.15s;line-height:1.4;";
d.addEventListener("mouseenter", function() {
this.style.background = "var(--purpura-bf-btn-cancel-hover)";
});
d.addEventListener("mouseleave", function() {
this.style.background = "var(--purpura-bf-btn-cancel-bg)";
});
d.addEventListener("click", function() {
e.remove();
});
u.appendChild(d);
var c = document.createElement("button");
var l = n.length === 1 ? "Unfriend " + n[0].name : "Unfriend " + n.length + " users";
c.textContent = l;
c.style.cssText = "border:none;border-radius:8px;padding:8px 20px;font-size:14px;font-weight:600;cursor:pointer;background:var(--purpura-bf-danger);color:var(--purpura-bf-white);transition:background 0.15s;line-height:1.4;";
c.addEventListener("mouseenter", function() {
this.style.background = "var(--purpura-bf-danger-hover)";
});
c.addEventListener("mouseleave", function() {
this.style.background = "var(--purpura-bf-danger)";
});
c.addEventListener("click", function() {
e.remove();
m();
});
u.appendChild(c);
r.appendChild(u);
e.appendChild(r);
document.body.appendChild(e);
}
function m() {
var e = n.length;
var r = 0;
var t = document.createElement("div");
t.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:var(--purpura-bf-overlay-heavy);z-index:99999;display:flex;align-items:center;justify-content:center;";
var i = document.createElement("div");
i.style.cssText = "background:var(--purpura-bf-surface);border-radius:12px;padding:24px;text-align:center;max-width:400px;width:90%;";
var o = document.createElement("div");
o.style.cssText = "color:var(--purpura-bf-text-emphasis);font-size:16px;margin-bottom:12px;";
o.textContent = "Unfriending...";
i.appendChild(o);
var u = document.createElement("div");
u.style.cssText = "width:100%;height:8px;background:var(--purpura-bf-progress-track);border-radius:4px;overflow:hidden;";
var d = document.createElement("div");
d.style.cssText = "width:0%;height:100%;background:var(--purpura-bf-danger-light);border-radius:4px;transition:width 0.3s;";
u.appendChild(d);
i.appendChild(u);
t.appendChild(i);
document.body.appendChild(t);
var c = {};
function l(r, t) {
if (r >= n.length) {
o.textContent = "Done! Refreshing...";
d.style.width = "100%";
setTimeout(function() {
location.reload();
}, 2e3);
return;
}
var i = n[r];
o.textContent = "Unfriending " + i.name + " (" + (r + 1) + "/" + e + ")";
d.style.width = (r + 1) / e * 100 + "%";
chrome.runtime.sendMessage({
action: "unfriendUser",
userId: i.id,
csrfToken: a()
}, function(e) {
var t = e && (e.ok || e.status >= 200 && e.status < 300);
if (!t) {
var n = c[i.id] || 0;
if (n < 2) {
c[i.id] = n + 1;
o.textContent = "Retrying " + i.name + "... (attempt " + (n + 1) + "/" + 2 + ")";
setTimeout(function() {
l(r, i.id);
}, 1e3 * (n + 1));
return;
}
}
setTimeout(function() {
l(r + 1);
}, 400);
});
}
l(0);
}
function x() {
var e = document.querySelector('.avatar-cards, .friends-list, [data-testid="friends-list"]');
if (e) {
var r = new MutationObserver(function(e) {
if (!t) return;
for (var r = 0; r < e.length; r++) {
var n = e[r];
var a = n.target;
if (a.classList && a.classList.contains("purpura-unfriend-radio")) return;
if (a.closest && a.closest(".purpura-unfriend-radio")) return;
for (var i = 0; i < n.addedNodes.length; i++) {
var o = n.addedNodes[i];
if (o.nodeType !== 1) continue;
if (o.classList && o.classList.contains("purpura-unfriend-radio")) return;
if (o.querySelector && o.querySelector(".purpura-unfriend-radio")) return;
}
for (var u = 0; u < n.removedNodes.length; u++) {
var d = n.removedNodes[u];
if (d.nodeType !== 1) continue;
if (d.classList && d.classList.contains("purpura-unfriend-radio")) return;
if (d.querySelector && d.querySelector(".purpura-unfriend-radio")) return;
}
}
b();
});
r.observe(e, {
childList: true,
subtree: true
});
}
}
window.__PurpuraSettings.ready.then(function() {
r = window.__PurpuraSettings.get(e) !== false;
if (r) {
c();
l();
x();
}
});
chrome.storage.onChanged.addListener(function(n, a) {
if (a === "sync" && n[e]) {
r = n[e].newValue !== false;
if (!r && t) {
t = false;
b();
var i = document.querySelector(".purpura-unfriend-action-btn");
if (i) i.remove();
var o = document.querySelector(".purpura-bulk-toggle");
if (o) o.remove();
s();
}
}
});
})();
