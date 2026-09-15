/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
"use strict";
function t(t, e) {
var a = chrome.i18n.getMessage(t, e);
return a || t;
}
if (window.location.pathname !== "/purpura-time") return;
if (document.getElementById("purpura-time-root")) return;
var e = "purpura_playtime";
var a = "purpura_playtime_daily";
var r = "purpura_playtime_sessions";
var s = "purpura_playtime_tracking";
var n = null;
var i = null;
var o = false;
var p = false;
function l(t, e) {
return new Promise(function(a) {
chrome.storage.local.get([ t ], function(r) {
a(r[t] !== undefined ? r[t] : e);
});
});
}
function c(t, e) {
return new Promise(function(a) {
var r = {};
r[t] = e;
chrome.storage.local.set(r, a);
});
}
function d(t) {
if (!t || t < 1) return "0m";
var e = Math.floor(t / 60);
var a = Math.floor(t % 60);
if (e > 0 && a > 0) return e + "h " + a + "m";
if (e > 0) return e + "h";
return a + "m";
}
function u(t) {
var e = Math.max(0, Math.floor(t / 1e3));
if (e < 60) return e + "s";
return d(e / 60);
}
function m(t) {
var e = new Date(t);
var a = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
return a[e.getMonth()] + " " + e.getDate();
}
function g(t) {
var e = new Date(t || Date.now());
return e.getFullYear() + "-" + String(e.getMonth() + 1).padStart(2, "0") + "-" + String(e.getDate()).padStart(2, "0");
}
function v(t) {
var e = g();
var a = 0;
for (var r = 0; r < t.length; r++) {
if (g(t[r].startTime) === e) a += t[r].durationMinutes;
}
return a;
}
function f(t) {
var e = Date.now() - 7 * 24 * 60 * 60 * 1e3;
var a = 0;
for (var r = 0; r < t.length; r++) {
if (t[r].startTime >= e) a += t[r].durationMinutes;
}
return a;
}
function x(t) {
var e = new Date;
var a = new Date(e.getFullYear(), e.getMonth(), 1).getTime();
var r = 0;
for (var s = 0; s < t.length; s++) {
if (t[s].startTime >= a) r += t[s].durationMinutes;
}
return r;
}
function h(t) {
var e = 0;
var a = t.games || {};
for (var r in a) {
if (a.hasOwnProperty(r) && a[r].name !== "Unknown Game") e += a[r].totalMinutes;
}
return e;
}
function b(t, e) {
e = e || 10;
var a = Object.values(t.games || {}).filter(function(t) {
return t.name !== "Unknown Game";
});
a.sort(function(t, e) {
return e.totalMinutes - t.totalMinutes;
});
return a.slice(0, e);
}
function w(t) {
if (t && t.sessionStart) {
return {
startTime: t.sessionStart,
gameName: t.gameName || "Unknown Game",
universeId: t.universeId,
rootPlaceId: t.rootPlaceId
};
}
return null;
}
function y(t) {
if (!t) return "";
return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function k(t, e, a) {
var r = b(t, 10);
var s = h(t);
var n = v(e);
var i = f(e);
var o = x(e);
var p = w(a);
var l = Object.values(t.games || {}).filter(function(t) {
return t.name !== "Unknown Game";
}).length;
var c = e.length > 0 ? Math.round(e.reduce(function(t, e) {
return t + e.durationMinutes;
}, 0) / e.length) : 0;
var g = "";
g += '<div class="pt-hero-stats">';
g += '<div class="pt-stat-card">';
g += '<span class="pt-stat-value">' + d(n) + "</span>";
g += '<span class="pt-stat-label">Today</span>';
g += "</div>";
g += '<div class="pt-stat-card">';
g += '<span class="pt-stat-value">' + d(i) + "</span>";
g += '<span class="pt-stat-label">This Week</span>';
g += "</div>";
g += '<div class="pt-stat-card">';
g += '<span class="pt-stat-value">' + d(o) + "</span>";
g += '<span class="pt-stat-label">This Month</span>';
g += "</div>";
g += '<div class="pt-stat-card">';
g += '<span class="pt-stat-value">' + d(s) + "</span>";
g += '<span class="pt-stat-label">All Time</span>';
g += "</div>";
g += '<div class="pt-stat-card">';
g += '<span class="pt-stat-value">' + l + "</span>";
g += '<span class="pt-stat-label">Games Played</span>';
g += "</div>";
g += "</div>";
if (p) {
var k = Date.now() - p.startTime;
g += '<div class="pt-session-banner" id="pt-session-banner">';
g += '<div class="pt-session-indicator"></div>';
g += '<span class="pt-session-text">Playing <strong>' + y(p.gameName) + '</strong> -- <strong id="pt-session-elapsed">' + u(k) + "</strong> this session</span>";
g += "</div>";
}
g += '<div class="pt-content-grid">';
g += '<div class="pt-section">';
g += '<h2 class="pt-section-title">Top Games</h2>';
if (r.length > 0) {
var M = r[0].totalMinutes;
g += '<div class="pt-games-table">';
g += '<div class="pt-games-header">';
g += '<span class="pt-games-col-rank">#</span>';
g += '<span class="pt-games-col-name">Game</span>';
g += '<span class="pt-games-col-time">Time</span>';
g += '<span class="pt-games-col-sessions">Sessions</span>';
g += "</div>";
for (var T = 0; T < r.length; T++) {
var P = r[T];
var _ = M > 0 ? P.totalMinutes / M * 100 : 0;
g += '<div class="pt-game-row">';
g += '<span class="pt-games-col-rank">' + (T + 1) + "</span>";
g += '<span class="pt-games-col-name">';
g += '<span class="pt-game-name-text">' + y(P.name || "Unknown Game") + "</span>";
g += '<span class="pt-game-bar"><span class="pt-game-bar-fill" style="width:' + _ + '%"></span></span>';
g += "</span>";
g += '<span class="pt-games-col-time">' + d(P.totalMinutes) + "</span>";
g += '<span class="pt-games-col-sessions">' + (P.sessions || "—") + "</span>";
g += "</div>";
}
g += "</div>";
} else {
g += '<div class="pt-empty">';
g += '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
g += '<p>No playtime data yet.</p><p class="pt-empty-sub">Start playing a game and your playtime will appear here.</p>';
g += "</div>";
}
g += "</div>";
g += '<div class="pt-sidebar">';
g += '<div class="pt-section pt-section-sm">';
g += '<h3 class="pt-section-title">Quick Stats</h3>';
g += '<div class="pt-quick-stats">';
g += '<div class="pt-quick-stat"><span class="pt-qs-label">Total Sessions</span><span class="pt-qs-value">' + e.length + "</span></div>";
g += '<div class="pt-quick-stat"><span class="pt-qs-label">Avg Session</span><span class="pt-qs-value">' + d(c) + "</span></div>";
g += '<div class="pt-quick-stat"><span class="pt-qs-label">Games Played</span><span class="pt-qs-value">' + l + "</span></div>";
if (r.length > 0) {
g += '<div class="pt-quick-stat"><span class="pt-qs-label">Most Played</span><span class="pt-qs-value pt-qs-truncate" title="' + y(r[0].name) + '">' + y(r[0].name) + "</span></div>";
}
g += "</div>";
g += "</div>";
g += '<div class="pt-section pt-section-sm">';
g += '<h3 class="pt-section-title">Recent Sessions</h3>';
if (e.length > 0) {
g += '<div class="pt-session-list">';
var q = Math.min(e.length, 8);
for (var z = 0; z < q; z++) {
var I = e[z];
g += '<div class="pt-session-row">';
g += '<span class="pt-session-game">' + y(I.gameName || "Unknown Game") + "</span>";
g += '<span class="pt-session-meta">' + m(I.startTime) + " -- " + d(I.durationMinutes) + "</span>";
g += "</div>";
}
if (e.length > 8) {
g += '<div class="pt-session-more">+ ' + (e.length - 8) + " more sessions</div>";
}
g += "</div>";
} else {
g += '<div class="pt-empty pt-empty-sm"><p>No sessions recorded yet.</p></div>';
}
g += "</div>";
g += "</div>";
g += "</div>";
return g;
}
function M() {
if (document.getElementById("purpura-pt-dash-styles")) return;
var t = document.createElement("style");
t.id = "purpura-pt-dash-styles";
t.textContent = "" + "#purpura-time-root{" + "--t-surface:var(--color-surface-0,#0b0c12);" + "--t-surface-2:var(--color-surface-100,#111219);" + "--t-surface-3:var(--color-surface-200,#161720);" + "--t-text:var(--color-content-default,#f0eeff);" + "--t-text-2:var(--color-content-muted,#a89ec4);" + "--t-text-3:var(--color-content-tertiary,#6d6487);" + "--t-accent:#9b6dff;" + "--t-accent-hover:#b088ff;" + "--t-accent-glow:rgba(155,109,255,0.15);" + "--t-border:var(--color-divider,rgba(255,255,255,0.07));" + "--t-border-2:rgba(255,255,255,0.12);" + "--t-success:#4ade80;" + "--t-radius:12px;" + "--t-ease:cubic-bezier(0.22,1,0.36,1);" + "display:block;position:relative;z-index:1;width:100%;min-height:100vh;" + "color:var(--t-text);" + 'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;' + "}" + "#purpura-time-root *{box-sizing:border-box}" + ".pt-container{max-width:1100px;margin:0 auto;padding:32px 24px 60px}" + ".pt-header{display:flex;align-items:center;gap:16px;margin-bottom:36px;padding-bottom:24px;border-bottom:1px solid var(--t-border)}" + ".pt-logo{width:44px;height:44px;border-radius:10px;flex-shrink:0}" + ".pt-header-info h1{font-size:28px;font-weight:700;letter-spacing:-0.5px;margin:0 0 2px;background:linear-gradient(135deg,#c4a7ff,#9b6dff 50%,#7c4dff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}" + ".pt-header-info p{color:var(--t-text-2);font-size:14px;margin:0}" + ".pt-hero-stats{display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin-bottom:24px}" + ".pt-stat-card{background:var(--t-surface-2);border:1px solid var(--t-border);border-radius:var(--t-radius);padding:20px 24px;text-align:center;transition:border-color 0.2s,transform 0.15s}" + ".pt-stat-card:hover{border-color:var(--t-accent-glow);transform:translateY(-1px)}" + ".pt-stat-value{display:block;font-size:28px;font-weight:700;color:var(--t-text);margin-bottom:4px}" + ".pt-stat-label{display:block;font-size:12px;font-weight:500;color:var(--t-text-2);text-transform:uppercase;letter-spacing:0.5px}" + ".pt-session-banner{display:flex;align-items:center;gap:10px;background:var(--t-surface-2);border:1px solid var(--t-border);border-left:3px solid var(--t-success);border-radius:var(--t-radius);padding:14px 20px;margin-bottom:24px}" + ".pt-session-indicator{width:10px;height:10px;border-radius:50%;background:var(--t-success);animation:pt-pulse 2s infinite;flex-shrink:0}" + "@keyframes pt-pulse{0%,100%{opacity:1}50%{opacity:0.4}}" + ".pt-session-text{font-size:14px;color:var(--t-text)}" + ".pt-content-grid{display:grid;grid-template-columns:1fr 340px;gap:24px;align-items:start}" + ".pt-section{background:var(--t-surface-2);border:1px solid var(--t-border);border-radius:var(--t-radius);padding:24px}" + ".pt-section-sm{padding:20px}" + ".pt-section-title{font-size:16px;font-weight:600;color:var(--t-text);margin:0 0 16px}" + ".pt-games-table{width:100%}" + ".pt-games-header{display:grid;grid-template-columns:36px 1fr 80px 80px;gap:12px;padding:0 0 12px;border-bottom:1px solid var(--t-border);font-size:11px;font-weight:600;color:var(--t-text-3);text-transform:uppercase;letter-spacing:0.5px}" + ".pt-game-row{display:grid;grid-template-columns:36px 1fr 80px 80px;gap:12px;padding:10px 0;border-bottom:1px solid var(--t-border);align-items:center;font-size:14px;transition:background 0.15s}" + ".pt-game-row:last-child{border-bottom:none}" + ".pt-game-row:hover{background:rgba(255,255,255,0.02)}" + ".pt-games-col-rank{font-weight:700;color:var(--t-text-2);text-align:center}" + ".pt-game-name-text{display:block;color:var(--t-text);font-weight:500;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" + ".pt-game-bar{display:block;height:4px;background:var(--t-border-2);border-radius:2px;overflow:hidden}" + ".pt-game-bar-fill{display:block;height:100%;background:linear-gradient(90deg,var(--t-accent),var(--t-accent-hover));border-radius:2px;transition:width 0.6s var(--t-ease)}" + ".pt-games-col-time{font-weight:600;color:var(--t-text);text-align:right}" + ".pt-games-col-sessions{color:var(--t-text-2);text-align:right}" + ".pt-sidebar{display:flex;flex-direction:column;gap:16px}" + ".pt-quick-stats{display:flex;flex-direction:column;gap:10px}" + ".pt-quick-stat{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--t-border)}" + ".pt-quick-stat:last-child{border-bottom:none}" + ".pt-qs-label{font-size:13px;color:var(--t-text-2)}" + ".pt-qs-value{font-size:13px;font-weight:600;color:var(--t-text);text-align:right}" + ".pt-qs-truncate{max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" + ".pt-session-list{display:flex;flex-direction:column;gap:0}" + ".pt-session-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--t-border);gap:12px}" + ".pt-session-row:last-child{border-bottom:none}" + ".pt-session-game{font-size:13px;font-weight:500;color:var(--t-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}" + ".pt-session-meta{font-size:12px;color:var(--t-text-3);white-space:nowrap;flex-shrink:0}" + ".pt-session-more{font-size:12px;color:var(--t-text-3);text-align:center;padding-top:8px}" + ".pt-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;color:var(--t-text-2);text-align:center;gap:12px}" + ".pt-empty-sm{padding:20px}" + ".pt-empty p{font-size:15px;font-weight:500;margin:0}" + ".pt-empty-sub{font-size:13px;color:var(--t-text-3);margin:0}" + ".pt-empty svg{opacity:0.3}" + ".pt-footer{display:flex;justify-content:center;align-items:center;gap:24px;margin-top:32px;padding-top:20px;border-top:1px solid var(--t-border)}" + ".pt-footer-link{font-size:13px;color:var(--t-text-3);text-decoration:none;transition:color 0.15s}" + ".pt-footer-link:hover{color:var(--t-accent)}" + ".pt-header-actions{margin-left:auto;display:flex;align-items:center;gap:10px}" + ".pt-import-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:10px;border:1px solid var(--t-border-2);background:var(--t-surface-3);color:var(--t-text);font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;transition:border-color 0.2s,background 0.2s,transform 0.15s,box-shadow 0.2s}" + ".pt-import-btn:hover{border-color:var(--t-accent);background:var(--t-accent-glow);color:var(--t-accent-hover);transform:translateY(-1px);box-shadow:0 4px 16px var(--t-accent-glow)}" + ".pt-import-btn:active{transform:translateY(0)}" + "@media(max-width:768px){.pt-hero-stats{grid-template-columns:repeat(3,1fr)}.pt-content-grid{grid-template-columns:1fr}.pt-games-header,.pt-game-row{grid-template-columns:28px 1fr 60px 60px;gap:8px}.pt-header{flex-wrap:wrap}.pt-header-actions{margin-left:0}}";
document.head.appendChild(t);
}
function T(t) {
if (n) {
clearInterval(n);
n = null;
}
if (!t) return;
var e = document.getElementById("pt-session-elapsed");
if (!e) return;
function a() {
e.textContent = u(Date.now() - t);
}
a();
n = setInterval(a, 1e3);
}
async function P(t, s, n) {
var i = false;
for (var o in t.games) {
if (t.games.hasOwnProperty(o) && (!t.games[o].name || t.games[o].name === "Unknown Game" || !t.games[o].totalMinutes)) {
delete t.games[o];
i = true;
}
}
var p = s.filter(function(t) {
return t.gameName && t.gameName !== "Unknown Game" && t.startTime && t.durationMinutes > 0;
});
if (p.length !== s.length) {
s = p;
i = true;
}
if (i) {
await Promise.all([ c(e, t), c(r, s), c(a, n) ]);
}
return {
data: t,
sessions: s
};
}
async function _() {
M();
var n = chrome.runtime.getURL("images/icons/default/Purpura_Default_Logo_128.png");
var o = "" + '<div id="purpura-time-root">' + '<div class="pt-container">' + '<header class="pt-header">' + '<img class="pt-logo" src="' + n + '" alt="Purpura">' + '<div class="pt-header-info">' + "<h1>Play Time Tracker</h1>" + "<p>Your Roblox playtime, tracked locally.</p>" + "</div>" + '<div class="pt-header-actions">' + '<button type="button" class="pt-import-btn" id="pt-import-btn" title="' + t("settings_playtime_import_btnTitle") + '">' + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' + t("settings_playtime_import_title") + "</button>" + "</div>" + "</header>" + '<div id="pt-dashboard-content">' + '<div class="pt-empty"><p>Loading your stats...</p></div>' + "</div>" + "</div>" + "</div>";
var p = document.querySelector(".content");
if (p) {
p.innerHTML = o;
} else {
document.body.innerHTML = o;
}
await q();
var c = await l(e, {
games: {}
});
var d = await l(a, []);
var u = await l(r, []);
var m = await l(s, {});
var g = await P(c, u, d);
c = g.data;
u = g.sessions;
u.sort(function(t, e) {
return e.startTime - t.startTime;
});
var v = document.getElementById("pt-dashboard-content");
v.innerHTML = k(c, u, m);
var f = w(m);
T(f ? f.startTime : null);
var x = document.getElementById("pt-import-btn");
if (x) x.addEventListener("click", function() {
if (window.__PurpuraRoProImport) window.__PurpuraRoProImport.open();
});
window.addEventListener("purpura:playtime-imported", function() {
z();
});
if ((window.location.search || "").indexOf("ropro-import=1") !== -1 && window.__PurpuraRoProImport) {
setTimeout(function() {
window.__PurpuraRoProImport.open();
}, 400);
}
if (i) clearInterval(i);
i = setInterval(I, 1e4);
}
async function q() {
if (o || !chrome.runtime || !chrome.runtime.sendMessage) return;
o = true;
try {
await new Promise(function(t) {
chrome.runtime.sendMessage({
action: "refreshPlaytimePresence"
}, function() {
t();
});
});
} catch (t) {} finally {
o = false;
}
}
async function z() {
var t = await l(e, {
games: {}
});
var a = await l(r, []);
a.sort(function(t, e) {
return e.startTime - t.startTime;
});
var n = await l(s, {});
var i = document.getElementById("pt-dashboard-content");
if (i) i.innerHTML = k(t, a, n);
var o = w(n);
T(o ? o.startTime : null);
}
async function I() {
if (!document.getElementById("pt-dashboard-content") || p) return;
p = true;
try {
await q();
await z();
} finally {
p = false;
}
}
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", _);
} else {
_();
}
})();
