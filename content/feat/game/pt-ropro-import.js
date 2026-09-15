/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
"use strict";
function e(e, r) {
var t = chrome.i18n.getMessage(e, r);
return t || e;
}
var r = "purpura_playtime";
var t = 500;
var i = null;
var o = '(async () => {\nconsole.group("%cRoPro Playtime Export", "color:#8b5cf6;font-weight:bold;");\nconst userId = (await chrome.storage.sync.get("rpUserID")).rpUserID;\nconst verification = Object.values(\n(await chrome.storage.sync.get("userVerification")).userVerification\n)[0];\nconst headers = {\n"ropro-id": userId,\n"ropro-verification": verification\n};\nif (!headers["ropro-id"]) {\nthrow new Error(\n"Unable to access RoPro\'s authentication data.\\n\\n" +\n"Make sure RoPro is installed and you\'re running this script from the RoPro service worker."\n);\n}\nconst timeRanges = [7, 30, 365, 999];\nconst requests = timeRanges.map(async (time) => {\nconst response = await fetch(\n`https://api.ropro.io/getMostPlayedUniverse.php?time=${time}`,\n{\nmethod: "POST",\nheaders,\ncredentials: "include"\n}\n);\nif (!response.ok) {\nconst text = await response.text().catch(() => "");\nif (\ntext.includes("<!DOCTYPE") ||\ntext.toLowerCase().includes("cloudflare")\n) {\nthrow new Error(\n"RoPro\'s API is currently unavailable or is being protected by Cloudflare. Please try again in a few minutes."\n);\n}\nthrow new Error(\n`Failed to fetch ${time}-day playtime data (HTTP ${response.status}).`\n);\n}\nconst text = await response.text();\nlet data;\ntry {\ndata = JSON.parse(text);\n} catch {\nif (\ntext.includes("<!DOCTYPE") ||\ntext.toLowerCase().includes("cloudflare")\n) {\nthrow new Error(\n"RoPro\'s API is currently unavailable or is being protected by Cloudflare. Please try again in a few minutes."\n);\n}\nthrow new Error(\n`RoPro returned an unexpected response while fetching ${time}-day playtime data.`\n);\n}\nreturn { time, data };\n});\nconst results = await Promise.all(requests);\nconst games = {};\nfor (const { time, data } of results) {\nfor (const game of data) {\nif (!games[game.id]) {\ngames[game.id] = {\nid: game.id,\ntime_played: {\n7: 0,\n30: 0,\n365: 0,\n999: 0\n}\n};\n}\ngames[game.id].time_played[time] = game.time_played;\n}\n}\nconst gameList = Object.values(games);\nconsole.log(`✅ Export complete! Found ${gameList.length} games.`);\nconsole.log("📋 Right-click the array below and select \'Copy object\' to export it.");\nconsole.log(gameList);\nconsole.groupEnd();\n})().catch((error) => {\nconsole.groupEnd();\nconsole.error("❌ Export failed");\nconsole.error(error.message);\n});';
function n(e, r) {
return new Promise(function(t) {
chrome.storage.local.get([ e ], function(i) {
t(i[e] !== undefined ? i[e] : r);
});
});
}
function a(e, r) {
return new Promise(function(t) {
var i = {};
i[e] = r;
chrome.storage.local.set(i, t);
});
}
function s(e) {
if (!e || e < 1) return "0m";
var r = Math.floor(e / 60);
var t = Math.floor(e % 60);
if (r > 0 && t > 0) return r + "h " + t + "m";
if (r > 0) return r + "h";
return t + "m";
}
function p(r) {
var i;
try {
i = JSON.parse(r);
} catch (r) {
return {
error: e("settings_playtime_import_errInvalidJson")
};
}
if (!Array.isArray(i)) return {
error: e("settings_playtime_import_errNotArray")
};
if (i.length === 0) return {
error: e("settings_playtime_import_errNoGames")
};
var o = [];
for (var n = 0; n < i.length; n++) {
var a = i[n];
if (!a || typeof a !== "object" || Array.isArray(a)) {
return {
error: e("settings_playtime_import_errEntry", [ String(n) ])
};
}
if (!("id" in a) || !("time_played" in a)) {
return {
error: e("settings_playtime_import_errMissingFields", [ String(n) ])
};
}
var s = a.time_played;
var p = null;
if (typeof s === "number") {
p = s;
} else if (s && typeof s === "object" && !Array.isArray(s)) {
if (typeof s[999] === "number") {
p = s[999];
} else {
var l = -1;
var c = [ 365, 30, 7 ];
for (var d = 0; d < c.length; d++) {
if (typeof s[c[d]] === "number" && s[c[d]] > l) l = s[c[d]];
}
if (l >= 0) p = l;
}
}
if (p === null || p < 0 || !isFinite(p)) {
return {
error: e("settings_playtime_import_errBadTime", [ String(n) ])
};
}
var u = a.id;
var m = false;
if (typeof u === "number" && isFinite(u) && u >= 0) m = true; else if (typeof u === "string" && /^\d+$/.test(u)) m = true;
if (!m) {
return {
error: e("settings_playtime_import_errBadId", [ String(n) ])
};
}
if (p > 0 && p <= 1e6) {
o.push({
id: String(u),
minutes: Math.round(p)
});
if (o.length >= t) break;
}
}
if (o.length === 0) return {
error: e("settings_playtime_import_errNoPlaytime")
};
return {
games: o
};
}
async function l(e) {
var r = {};
var t = [];
for (var i = 0; i < e.length; i++) {
if (t.indexOf(e[i]) === -1) t.push(e[i]);
}
for (var o = 0; o < t.length; o += 50) {
var n = t.slice(o, o + 50);
try {
var a = await fetch("https://games.roblox.com/v1/games?universeIds=" + n.join(","));
if (a.ok) {
var s = await a.json();
if (s && s.data) {
for (var p = 0; p < s.data.length; p++) {
var l = s.data[p];
if (l && l.id && l.name) r[String(l.id)] = l.name;
}
}
}
} catch (e) {}
}
return r;
}
async function c(e) {
var t = await n(r, {
games: {}
});
if (!t.games) t.games = {};
var i = 0;
var o = 0;
var s = {};
for (var p = 0; p < e.games.length; p++) {
var c = e.games[p].id;
var d = e.games[p].minutes;
var u = t.games[c];
if (u) {
if (d > (u.totalMinutes || 0)) {
u.totalMinutes = d;
i++;
o += d;
}
if (!u.name || u.name === "Unknown Game" || /^Game \d+$/.test(u.name)) {
s[c] = u;
}
} else {
t.games[c] = {
universeId: c,
rootPlaceId: null,
name: "Game " + c,
totalMinutes: d,
lastPlayed: 0,
sessions: 0,
firstPlayedAt: Date.now()
};
s[c] = t.games[c];
i++;
o += d;
}
}
var m = await l(Object.keys(s));
for (var g in s) {
if (m[g]) s[g].name = m[g];
}
await a(r, t);
return {
gamesImported: i,
totalMinutesImported: o
};
}
async function d(e) {
try {
await navigator.clipboard.writeText(e);
return true;
} catch (i) {
try {
var r = document.createElement("textarea");
r.value = e;
r.style.position = "fixed";
r.style.opacity = "0";
r.style.pointerEvents = "none";
document.body.appendChild(r);
r.select();
var t = document.execCommand("copy");
r.remove();
return t;
} catch (e) {
return false;
}
}
}
function u() {
if (document.getElementById("purpura-ri-styles")) return;
var e = document.createElement("style");
e.id = "purpura-ri-styles";
e.textContent = "" + "#purpura-ri-overlay{" + "--ri-bg:#0b0c12;" + "--ri-bg-2:#111219;" + "--ri-bg-3:#161720;" + "--ri-text:#f0eeff;" + "--ri-text-2:#a89ec4;" + "--ri-text-3:#6d6487;" + "--ri-accent:#9b6dff;" + "--ri-accent-hover:#b088ff;" + "--ri-accent-glow:rgba(155,109,255,0.15);" + "--ri-border:rgba(255,255,255,0.07);" + "--ri-border-2:rgba(255,255,255,0.12);" + "--ri-success:#4ade80;" + "--ri-ease:cubic-bezier(0.22,1,0.36,1);" + "}" + '#purpura-ri-overlay{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(5,4,10,0.6);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);color:var(--ri-text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;opacity:0;transition:opacity 0.18s ease}' + "#purpura-ri-overlay.ri-visible{opacity:1}" + "#purpura-ri-overlay *{box-sizing:border-box}" + ".ri-modal{position:relative;width:520px;max-width:100%;max-height:calc(100vh - 32px);overflow-y:auto;background:var(--ri-bg);border:1px solid var(--ri-border-2);border-radius:14px;padding:20px;box-shadow:0 24px 80px rgba(0,0,0,0.5);transform:translateY(14px) scale(0.97);transition:transform 0.22s var(--ri-ease)}" + "#purpura-ri-overlay.ri-visible .ri-modal{transform:none}" + ".ri-modal-close{position:absolute;top:10px;right:10px;width:26px;height:26px;border-radius:7px;border:1px solid transparent;background:none;color:var(--ri-text-2);font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.15s}" + ".ri-gist-link{display:inline-block;margin-top:6px;font-size:11px;color:var(--ri-accent-hover);text-decoration:none;border-bottom:1px solid var(--ri-accent);transition:opacity 0.15s}" + ".ri-gist-link:hover{opacity:0.8}" + ".ri-modal-close:hover{background:var(--ri-bg-3);color:var(--ri-text);border-color:var(--ri-border)}" + ".ri-modal-title{font-size:17px;font-weight:700;margin:0 0 4px;letter-spacing:-0.3px}" + ".ri-modal-desc{font-size:12px;color:var(--ri-text-2);line-height:1.5;margin:0 0 14px}" + ".ri-steps{display:flex;flex-direction:column;gap:12px}" + ".ri-step{display:flex;gap:10px}" + ".ri-step-num{width:22px;height:22px;border-radius:50%;background:var(--ri-accent-glow);border:1px solid var(--ri-accent);color:var(--ri-accent-hover);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;margin-top:1px}" + ".ri-step-content{flex:1;min-width:0}" + ".ri-step-title{font-size:13px;font-weight:600;margin-bottom:3px}" + ".ri-step-desc{font-size:12px;color:var(--ri-text-2);line-height:1.5}" + ".ri-step-desc code{background:var(--ri-bg-3);border:1px solid var(--ri-border);padding:1px 5px;border-radius:4px;font-size:11px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}" + ".ri-step-desc strong{color:var(--ri-text)}" + ".ri-step-desc a{color:var(--ri-accent-hover);text-decoration:none;border-bottom:1px solid var(--ri-accent);transition:opacity 0.15s}" + ".ri-step-desc a:hover{opacity:0.8}" + ".ri-code-wrap{position:relative;margin-top:8px}" + ".ri-code{display:block;background:var(--ri-bg-3);border:1px solid var(--ri-border);border-radius:8px;padding:10px 10px 38px;font-size:10px;line-height:1.5;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--ri-text-2);word-break:break-all;max-height:110px;overflow-y:auto;white-space:pre-wrap}" + ".ri-copy-btn{position:absolute;bottom:8px;right:8px;padding:5px 10px;border-radius:6px;border:1px solid var(--ri-border-2);background:var(--ri-bg);color:var(--ri-text);font-size:11px;font-weight:600;cursor:pointer;transition:all 0.15s}" + ".ri-copy-btn:hover{border-color:var(--ri-accent);color:var(--ri-accent-hover)}" + ".ri-copy-btn.copied{border-color:var(--ri-success);color:var(--ri-success)}" + ".ri-textarea{width:100%;box-sizing:border-box;margin-top:8px;background:var(--ri-bg-3);border:1px solid var(--ri-border-2);border-radius:8px;padding:10px;color:var(--ri-text);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;line-height:1.5;resize:vertical;min-height:54px;transition:border-color 0.15s}" + ".ri-textarea:focus{outline:none;border-color:var(--ri-accent);box-shadow:0 0 0 3px var(--ri-accent-glow)}" + ".ri-textarea::placeholder{color:var(--ri-text-3)}" + ".ri-error{font-size:11px;color:#f87171;margin-top:6px;min-height:14px}" + ".ri-modal-footer{display:flex;justify-content:flex-end;gap:8px;margin-top:16px;padding-top:14px;border-top:1px solid var(--ri-border)}" + ".ri-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 16px;border-radius:9px;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.18s;border:1px solid transparent}" + ".ri-btn-ghost{background:var(--ri-bg-3);border-color:var(--ri-border-2);color:var(--ri-text-2)}" + ".ri-btn-ghost:hover{color:var(--ri-text);border-color:var(--ri-border-2);transform:translateY(-1px)}" + ".ri-btn-primary{background:linear-gradient(135deg,var(--ri-accent),#7c4dff);color:#fff;box-shadow:0 4px 18px var(--ri-accent-glow)}" + ".ri-btn-primary:hover{filter:brightness(1.1);transform:translateY(-1px);box-shadow:0 8px 24px var(--ri-accent-glow)}" + ".ri-btn-primary:disabled{opacity:0.6;cursor:default;transform:none}" + ".ri-toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:2147483001;display:flex;align-items:center;gap:10px;background:var(--ri-bg);border:1px solid var(--ri-border-2);border-left:3px solid var(--ri-success);border-radius:12px;padding:12px 18px;font-size:13px;color:var(--ri-text);box-shadow:0 12px 40px rgba(0,0,0,0.4);animation:ri-toast-in 0.3s var(--ri-ease)}" + "@keyframes ri-toast-in{from{opacity:0;transform:translate(-50%,-10px)}to{opacity:1;transform:translate(-50%,0)}}" + "@media(prefers-reduced-motion:reduce){#purpura-ri-overlay,.ri-modal,.ri-toast{animation:none;transition:none}}";
document.head.appendChild(e);
}
function m() {
return "" + '<div class="ri-modal">' + '<button type="button" class="ri-modal-close" id="purpura-ri-close" aria-label="Close">✕</button>' + '<h2 class="ri-modal-title">' + e("settings_playtime_import_title") + "</h2>" + '<p class="ri-modal-desc">' + e("settings_playtime_import_desc") + "</p>" + '<div class="ri-steps">' + '<div class="ri-step">' + '<span class="ri-step-num">1</span>' + '<div class="ri-step-content">' + '<div class="ri-step-title">' + e("settings_playtime_import_step1Title") + "</div>" + '<div class="ri-step-desc">' + e("settings_playtime_import_step1Desc") + "</div>" + "</div>" + "</div>" + '<div class="ri-step">' + '<span class="ri-step-num">2</span>' + '<div class="ri-step-content">' + '<div class="ri-step-title">' + e("settings_playtime_import_step2Title") + "</div>" + '<div class="ri-step-desc">' + e("settings_playtime_import_step2Desc") + "</div>" + '<div class="ri-code-wrap">' + '<code class="ri-code" id="purpura-ri-script-code"></code>' + '<button type="button" class="ri-copy-btn" id="purpura-ri-copy">' + e("settings_playtime_import_copy") + "</button>" + "</div>" + '<a class="ri-gist-link" href="https://gist.github.com/TeutonicTerrror/6a666e571e7562df35dd6539728c1178" target="_blank" rel="noopener noreferrer">' + e("settings_playtime_import_gist") + "</a>" + "</div>" + "</div>" + '<div class="ri-step">' + '<span class="ri-step-num">3</span>' + '<div class="ri-step-content">' + '<div class="ri-step-title">' + e("settings_playtime_import_step3Title") + "</div>" + '<div class="ri-step-desc">' + e("settings_playtime_import_step3Desc") + "</div>" + '<textarea id="purpura-ri-data" class="ri-textarea" rows="3" placeholder=\'[{"id":"123","time_played":{"999":120}},...]\'></textarea>' + '<div class="ri-error" id="purpura-ri-error"></div>' + "</div>" + "</div>" + "</div>" + '<div class="ri-modal-footer">' + '<button type="button" class="ri-btn ri-btn-ghost" id="purpura-ri-cancel">' + e("settings_playtime_import_cancel") + "</button>" + '<button type="button" class="ri-btn ri-btn-primary" id="purpura-ri-submit">' + e("settings_playtime_import_submit") + "</button>" + "</div>" + "</div>";
}
function g() {
if (document.getElementById("purpura-ri-overlay")) return;
u();
var r = document.createElement("div");
r.id = "purpura-ri-overlay";
r.className = "ri-overlay";
r.innerHTML = m();
var t = r.querySelector("#purpura-ri-script-code");
if (t) t.textContent = o;
document.body.appendChild(r);
requestAnimationFrame(function() {
r.classList.add("ri-visible");
});
function n(e) {
if (e.key === "Escape") a();
}
function a() {
if (r.getAttribute("data-importing") === "true") return;
if (i === n) {
document.removeEventListener("keydown", n);
i = null;
}
r.classList.remove("ri-visible");
setTimeout(function() {
if (r.parentNode) r.parentNode.removeChild(r);
}, 200);
}
i = n;
document.addEventListener("keydown", n);
r.addEventListener("click", function(e) {
if (e.target === r) a();
});
var s = r.querySelector("#purpura-ri-close");
if (s) s.addEventListener("click", a);
var p = r.querySelector("#purpura-ri-cancel");
if (p) p.addEventListener("click", a);
var l = r.querySelector("#purpura-ri-copy");
if (l) {
l.addEventListener("click", function() {
d(o).then(function(r) {
l.textContent = r ? e("settings_playtime_import_copied") : e("settings_playtime_import_copyFailed");
l.classList.add("copied");
setTimeout(function() {
l.textContent = e("settings_playtime_import_copy");
l.classList.remove("copied");
}, 2e3);
});
});
}
var c = r.querySelector("#purpura-ri-submit");
if (c) c.addEventListener("click", v);
}
async function v() {
var r = document.getElementById("purpura-ri-data");
var t = document.getElementById("purpura-ri-error");
var o = document.getElementById("purpura-ri-submit");
if (!r || !t || !o) return;
var n = (r.value || "").trim();
if (!n) {
t.textContent = e("settings_playtime_import_errEmpty");
return;
}
var a = p(n);
if (a.error) {
t.textContent = a.error;
return;
}
t.textContent = "";
o.disabled = true;
o.textContent = e("settings_playtime_import_importing");
var s = document.getElementById("purpura-ri-overlay");
if (s) s.setAttribute("data-importing", "true");
try {
var l = await c(a);
if (i) {
document.removeEventListener("keydown", i);
i = null;
}
if (s) {
s.classList.remove("ri-visible");
setTimeout(function() {
if (s.parentNode) s.parentNode.removeChild(s);
}, 200);
}
try {
window.dispatchEvent(new CustomEvent("purpura:playtime-imported", {
detail: {
games: l.gamesImported,
minutes: l.totalMinutesImported
}
}));
} catch (e) {}
f(l.gamesImported, l.totalMinutesImported);
} catch (r) {
if (s) s.removeAttribute("data-importing");
t.textContent = e("settings_playtime_import_errFailed");
o.disabled = false;
o.textContent = e("settings_playtime_import_submit");
}
}
function f(r, t) {
var i = document.getElementById("purpura-ri-toast");
if (i) i.remove();
var o = document.createElement("div");
o.id = "purpura-ri-toast";
o.className = "ri-toast";
o.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--ri-success);flex-shrink:0"><polyline points="20 6 9 17 4 12"/></svg>' + "<span>" + e("settings_playtime_import_toast", [ String(r), s(t) ]) + "</span>";
document.body.appendChild(o);
setTimeout(function() {
if (o.parentNode) o.parentNode.removeChild(o);
}, 8e3);
}
window.__PurpuraRoProImport = {
open: g
};
})();
