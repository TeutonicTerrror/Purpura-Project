/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
if (window.location.pathname !== "/purpura-themes") return;
if (document.getElementById("purpura-themes-root")) return;
var e = '#purpura-themes-root{--t-surface:var(--color-surface-0, #0b0c12);--t-surface-2:var(--color-surface-100, #111219);--t-surface-3:var(--color-surface-200, #161720);--t-text:var(--color-content-default, #f0eeff);--t-text-2:var(--color-content-muted, #a89ec4);--t-text-3:var(--color-content-tertiary, #6d6487);--t-accent:#9b6dff;--t-accent-hover:#b088ff;--t-accent-glow:rgba(155,109,255,0.15);--t-border:var(--color-divider, rgba(255,255,255,0.07));--t-border-2:rgba(255,255,255,0.12);--t-danger:#f87171;--t-success:#4ade80;--t-radius:10px;--t-radius-lg:14px;--t-ease:cubic-bezier(0.22,1,0.36,1)}*,*::before,*::after{box-sizing:border-box}#purpura-themes-root{font-family:inherit;color:var(--t-text);display:block;position:relative;z-index:1}.themes-root{max-width:960px;margin:0 auto;padding:32px 24px}.themes-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;background:transparent}.themes-header-left{display:flex;align-items:center;gap:14px}.themes-logo{width:48px;height:48px;border-radius:10px}.themes-header-left h1{font-size:32px;font-weight:700;letter-spacing:-0.5px;margin:0;background:linear-gradient(135deg,#c4a7ff,#9b6dff 50%,#7c4dff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}.themes-tabs{display:flex;gap:4px;margin-bottom:24px;background:var(--t-surface-2);padding:4px;border-radius:var(--t-radius);border:1px solid var(--t-border);width:fit-content}.themes-tab{padding:8px 20px;border:none;background:transparent;color:var(--t-text-2);font-size:13px;font-weight:600;border-radius:8px;cursor:pointer;transition:all 0.15s var(--t-ease);font-family:inherit}.themes-tab:hover{color:var(--t-text)}.themes-tab.active{background:var(--t-accent-glow);color:var(--t-accent)}.themes-main{min-height:400px}.themes-panel{display:none}.themes-panel.active{display:block;animation:t-panel-in 0.22s var(--t-ease) forwards}@keyframes t-panel-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}.themes-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}.themes-card{background:var(--t-surface-2);border:1px solid var(--t-border);border-radius:var(--t-radius-lg);padding:20px;cursor:pointer;transition:all 0.2s var(--t-ease);position:relative;overflow:hidden}.themes-card:hover{border-color:rgba(155,109,255,0.35);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.3)}.themes-card.active{border-color:var(--t-accent);box-shadow:0 0 0 2px var(--t-accent-glow)}.themes-card.active::after{content:"Active";position:absolute;top:12px;right:12px;font-size:10px;font-weight:700;color:var(--t-accent);background:var(--t-accent-glow);padding:3px 8px;border-radius:99px;text-transform:uppercase;letter-spacing:0.5px}.themes-card-robox{position:absolute;bottom:12px;right:12px;font-size:9px;font-weight:700;color:var(--t-text-2);background:var(--t-surface-3);padding:2px 7px;border-radius:99px;text-transform:uppercase;letter-spacing:0.5px;border:1px solid var(--t-border)}.themes-card-preview{display:flex;gap:3px;margin-bottom:14px}.themes-card-swatch{width:28px;height:28px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);flex-shrink:0}.themes-card-name{font-size:15px;font-weight:700;color:var(--t-text);margin:0 0 4px}.themes-card-desc{font-size:12px;color:var(--t-text-2);margin:0 0 6px;line-height:1.45}.themes-card-author{font-size:11px;color:var(--t-text-3);font-style:italic}.themes-card-actions{display:flex;gap:8px;margin-top:12px}.themes-card-loading{padding:40px;text-align:center;color:var(--t-text-2);font-size:14px;grid-column:1/-1}.themes-custom-layout{display:flex;gap:20px;align-items:flex-start}.themes-custom-sidebar{width:220px;flex-shrink:0}.themes-custom-sidebar h3{font-size:15px;font-weight:700;margin:0 0 10px;color:var(--t-text)}.themes-custom-list{display:flex;flex-direction:column;gap:4px;margin-bottom:14px;max-height:400px;overflow-y:auto}.themes-custom-item{padding:10px 12px;background:var(--t-surface-2);border:1px solid var(--t-border);border-radius:var(--t-radius);cursor:pointer;transition:all 0.15s var(--t-ease);font-size:13px;font-weight:500;color:var(--t-text-2);display:flex;align-items:center;justify-content:space-between}.themes-custom-item:hover{background:var(--t-surface-3);color:var(--t-text)}.themes-custom-item.active{background:var(--t-accent-glow);color:var(--t-text);border-color:rgba(155,109,255,0.3)}.themes-custom-item-delete{width:20px;height:20px;border-radius:50%;background:rgba(248,113,113,0.12);border:none;color:var(--t-danger);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;opacity:0;transition:opacity 0.15s;flex-shrink:0}.themes-custom-item:hover .themes-custom-item-delete{opacity:1}.themes-custom-item-delete:hover{background:rgba(248,113,113,0.25)}.themes-custom-actions{display:flex;flex-direction:column;gap:6px}.themes-btn{padding:9px 14px;border-radius:var(--t-radius);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.15s var(--t-ease);border:none}.themes-btn:active{transform:scale(0.97)}.themes-btn-outline{background:transparent;border:1px solid var(--t-border-2);color:var(--t-text-2)}.themes-btn-outline:hover{background:var(--t-accent-glow);border-color:rgba(155,109,255,0.35);color:var(--t-text)}.themes-btn-primary{background:var(--t-accent);color:#fff;box-shadow:0 2px 10px rgba(155,109,255,0.35)}.themes-btn-primary:hover{background:#8a5df0;box-shadow:0 4px 16px rgba(155,109,255,0.45)}.themes-btn-danger{background:rgba(248,113,113,0.12);color:var(--t-danger);border:1px solid rgba(248,113,113,0.2)}.themes-btn-danger:hover{background:rgba(248,113,113,0.22);border-color:rgba(248,113,113,0.35)}.themes-custom-editor{flex:1;min-width:0;min-height:380px;background:var(--t-surface-2);border:1px solid var(--t-border);border-radius:var(--t-radius-lg);padding:24px}.themes-editor-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;min-height:300px;color:var(--t-text-3);gap:12px}.themes-editor-empty p{font-size:14px;margin:0}.themes-editor-meta{display:flex;gap:12px;margin-bottom:18px;flex-wrap:wrap}.themes-form-group{display:flex;flex-direction:column;gap:4px;flex:1;min-width:140px}.themes-form-group label{font-size:11px;font-weight:700;color:var(--t-text-3);text-transform:uppercase;letter-spacing:0.5px}.themes-form-group input{width:100%;padding:8px 10px;border-radius:8px;border:1px solid var(--t-border-2);background:var(--t-surface);color:var(--t-text);font-size:13px;font-family:inherit;transition:border-color 0.15s}.themes-form-group input:focus{outline:none;border-color:var(--t-accent);box-shadow:0 0 0 3px var(--t-accent-glow)}.themes-editor-tabs{display:flex;gap:2px;margin-bottom:16px}.themes-editor-tab{padding:6px 14px;border:none;background:transparent;color:var(--t-text-3);font-size:12px;font-weight:600;cursor:pointer;border-bottom:2px solid transparent;transition:all 0.15s;font-family:inherit}.themes-editor-tab:hover{color:var(--t-text-2)}.themes-editor-tab.active{color:var(--t-accent);border-bottom-color:var(--t-accent)}.themes-editor-fields{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;margin-bottom:20px}.theme-color-field{display:flex;flex-direction:column;gap:6px;padding:10px 12px;background:var(--t-surface);border:1px solid var(--t-border);border-radius:var(--t-radius);transition:border-color 0.15s}.theme-color-field:hover{border-color:rgba(155,109,255,0.25)}.theme-color-top{display:flex;align-items:center;gap:8px}.theme-color-top label{font-size:12px;color:var(--t-text-2);flex:1;min-width:0;overflow:visible;white-space:normal;line-height:1.35;font-weight:500;text-transform:none;letter-spacing:0}.theme-color-rgb{font-size:11px;color:var(--t-text-3);font-family:monospace;min-width:110px;text-align:right;flex-shrink:0}.theme-color-top input[type=color]{-webkit-appearance:none;appearance:none;width:32px;height:24px;border-radius:6px;border:1px solid var(--t-border-2);cursor:pointer;padding:0;background:transparent;flex-shrink:0}.theme-color-top input[type=color]::-webkit-color-swatch-wrapper{padding:0}.theme-color-top input[type=color]::-webkit-color-swatch{border-radius:4px;border:1px solid rgba(255,255,255,0.08)}.theme-color-opacity{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--t-text-3)}.theme-color-opacity span:first-child{min-width:50px;flex-shrink:0}.theme-color-opacity input[type=range]{-webkit-appearance:none;appearance:none;flex:1;height:4px;border-radius:2px;background:var(--t-surface-3);outline:none;cursor:pointer}.theme-color-opacity input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:14px;height:14px;border-radius:50%;background:var(--t-accent);cursor:pointer;border:2px solid var(--t-surface);transition:transform 0.1s;margin-top:-5px}.theme-color-opacity input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.15)}.theme-color-opacity-val{min-width:36px;text-align:right;font-family:monospace;flex-shrink:0}.themes-editor-actions{display:flex;gap:8px;flex-wrap:wrap}.themes-empty-state{padding:20px;text-align:center;color:var(--t-text-3);font-size:13px;font-style:italic}.themes-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--t-accent);color:#fff;padding:10px 20px;border-radius:99px;font-size:13px;font-weight:600;z-index:999999;animation:t-toast-in 0.25s var(--t-ease) forwards}@keyframes t-toast-in{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
var t = {
surfaces: [ {
key: "surface0",
label: "Surface 0",
def: "#121215"
}, {
key: "surface100",
label: "Surface 100",
def: "#191a1f"
}, {
key: "surface200",
label: "Surface 200",
def: "#272930"
}, {
key: "surface300",
label: "Surface 300",
def: "#45494d"
}, {
key: "mainText",
label: "Main Text Color",
def: "#f7f7f8"
}, {
key: "secondaryText",
label: "Secondary Text Color",
def: "#d5d7dd"
}, {
key: "playButton",
label: "Playbutton Color",
def: "#335fff"
} ]
};
var r = {};
function a(e) {
e.forEach(function(e) {
if (e.key) {
r[e.key] = e.def;
}
});
}
Object.values(t).forEach(a);
var o = -1;
var n = null;
var i = "Dark";
function s() {
return window.PurpuraThemeEngine ? window.PurpuraThemeEngine.getState() : {
selected: "none",
enabled: false,
customColors: null,
customThemes: [],
presetData: null
};
}
function c(e) {
if (!e) return "";
return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
}
function d(e) {
var t = document.querySelector(".themes-toast");
if (t) t.remove();
var r = document.createElement("div");
r.className = "themes-toast";
r.textContent = e;
document.body.appendChild(r);
setTimeout(function() {
r.remove();
}, 2500);
}
function l() {
return fetch("https://accountsettings.roblox.com/v1/themes/1/0", {
credentials: "include"
}).then(function(e) {
return e.ok ? e.json() : {
themeType: "Dark"
};
}).then(function(e) {
return e.themeType || "Dark";
}).catch(function() {
return "Dark";
});
}
function m(e) {
function t(t) {
var r = {
"Content-Type": "application/json"
};
if (t) r["X-CSRF-Token"] = t;
return fetch("https://accountsettings.roblox.com/v1/themes/1/0", {
method: "PATCH",
credentials: "include",
headers: r,
body: JSON.stringify({
themeType: e
})
});
}
function r() {
i = e;
if (e === "Light") {
document.body.classList.remove("dark-theme");
document.body.classList.add("light-theme");
} else {
document.body.classList.remove("light-theme");
document.body.classList.add("dark-theme");
}
try {
var t = localStorage.getItem("theme");
if (t) {
var r = JSON.parse(t);
var a = document.querySelector('meta[name="user-data"]');
var o = a ? a.getAttribute("data-userid") || a.getAttribute("data-user-id") : null;
if (o && Array.isArray(r.data)) {
var n = r.data.find(function(e) {
return e[0] === Number(o);
});
if (n) {
n[1] = e === "Light" ? 0 : 1;
localStorage.setItem("theme", JSON.stringify(r));
}
}
}
} catch (e) {}
h();
}
t(null).then(function(e) {
if (e.ok) {
r();
return;
}
if (e.status === 403) {
var a = e.headers.get("X-CSRF-Token");
if (a) {
return t(a).then(function(e) {
if (e.ok) r();
});
}
}
}).catch(function() {});
}
function u() {
var e = s();
var t = e.presetData;
var r = e.selected !== "none";
var a = "";
var o = !r && i === "Light";
var n = !r && i === "Dark";
var d = [ {
key: "robloxLight",
roboxTheme: "Light",
active: o
}, {
key: "robloxDark",
roboxTheme: "Dark",
active: n
} ];
d.forEach(function(e) {
var r = t ? t[e.key] : null;
var o = r ? r.name : "Roblox " + e.roboxTheme;
var n = "";
var i = "Roblox";
var s = r ? Object.keys(r.colors).slice(0, 5) : [];
var d = s.map(function(e) {
return '<div class="themes-card-swatch" style="background:' + r.colors[e] + '"></div>';
}).join("");
if (!d) d = '<div class="themes-card-swatch" style="background:#888"></div>';
a += '<div class="themes-card' + (e.active ? " active" : "") + '">';
a += '<span class="themes-card-robox">Roblox</span>';
a += '<div class="themes-card-preview">' + d + "</div>";
a += '<div class="themes-card-name">' + c(o) + "</div>";
a += '<div class="themes-card-desc">' + c(n) + "</div>";
a += '<div class="themes-card-author">by ' + c(i) + "</div>";
a += '<div class="themes-card-actions">';
a += '<button class="themes-btn themes-btn-primary btn-robox-theme" data-robox-theme="' + e.roboxTheme + '">' + (e.active ? "Active" : "Apply") + "</button>";
a += "</div></div>";
});
return a;
}
function p(e) {
if (!e) return;
e.querySelectorAll(".btn-robox-theme").forEach(function(e) {
e.addEventListener("click", function() {
var t = e.getAttribute("data-robox-theme");
m(t);
});
});
}
function h() {
var e = s();
var t = document.getElementById("shippedCards");
if (!t) return;
var r = e.presetData;
if (!r) {
t.innerHTML = '<div class="themes-card-loading">Loading presets...</div>';
return;
}
var a = Object.keys(r);
var o = u();
a.forEach(function(t) {
if (t === "robloxLight" || t === "robloxDark") return;
var a = r[t];
var n = Object.keys(a.colors).slice(0, 5);
var i = n.map(function(e) {
return '<div class="themes-card-swatch" style="background:' + a.colors[e] + '"></div>';
}).join("");
var s = e.selected === t ? " active" : "";
o += '<div class="themes-card' + s + '" data-preset="' + t + '">';
o += '<div class="themes-card-preview">' + i + "</div>";
o += '<div class="themes-card-name">' + c(a.name) + "</div>";
o += '<div class="themes-card-desc">' + c(a.description) + "</div>";
o += '<div class="themes-card-author">by ' + c(a.author) + "</div>";
o += '<div class="themes-card-actions">';
o += '<button class="themes-btn themes-btn-primary btn-apply-preset" data-preset="' + t + '">' + (e.selected === t ? "Applied" : "Apply") + "</button>";
if (e.selected === t) o += '<button class="themes-btn themes-btn-outline btn-unequip">Unequip</button>';
o += "</div></div>";
});
if (e.selected === "custom") o += '<div style="margin-top:12px"><button class="themes-btn themes-btn-outline btn-unequip">Unequip Custom Theme</button></div>';
t.innerHTML = o;
f();
p(t);
}
function f() {
var e = document.getElementById("shippedCards");
if (!e) return;
e.querySelectorAll(".btn-apply-preset").forEach(function(e) {
e.addEventListener("click", function() {
var t = e.getAttribute("data-preset");
if (window.PurpuraThemeEngine) {
window.PurpuraThemeEngine.setTheme(t);
}
setTimeout(h, 200);
});
});
e.querySelectorAll(".btn-unequip").forEach(function(e) {
e.addEventListener("click", function() {
if (window.PurpuraThemeEngine) {
window.PurpuraThemeEngine.setTheme("none");
}
setTimeout(h, 200);
});
});
}
function v() {
var e = s();
var t = document.getElementById("customThemeList");
if (!t) return;
var r = e.customThemes || [];
if (r.length === 0) {
t.innerHTML = '<div class="themes-empty-state">No custom themes yet</div>';
return;
}
var a = "";
r.forEach(function(t, r) {
var n = e.selected === "custom" && o === r ? " active" : "";
a += '<div class="themes-custom-item' + n + '" data-index="' + r + '">';
a += "<span>" + c(t.name) + "</span>";
a += '<button class="themes-custom-item-delete" data-index="' + r + '" title="Delete">x</button>';
a += "</div>";
});
t.innerHTML = a;
t.querySelectorAll(".themes-custom-item").forEach(function(e) {
e.addEventListener("click", function(t) {
if (t.target.classList.contains("themes-custom-item-delete")) return;
g(parseInt(e.getAttribute("data-index")));
});
});
t.querySelectorAll(".themes-custom-item-delete").forEach(function(e) {
e.addEventListener("click", function(t) {
t.stopPropagation();
y(parseInt(e.getAttribute("data-index")));
});
});
}
function g(e) {
var t = s();
var r = t.customThemes || [];
if (e < 0 || e >= r.length) return;
o = e;
n = JSON.parse(JSON.stringify(r[e].colors));
document.getElementById("editorName").value = r[e].name || "";
document.getElementById("editorDesc").value = r[e].description || "";
document.getElementById("editorAuthor").value = r[e].author || "";
document.getElementById("btnDeleteTheme").style.display = "";
w();
L();
v();
}
function b() {
o = -1;
n = JSON.parse(JSON.stringify(r));
document.getElementById("editorName").value = "";
document.getElementById("editorDesc").value = "";
document.getElementById("editorAuthor").value = "";
document.getElementById("btnDeleteTheme").style.display = "none";
w();
L();
}
function x() {
var e = document.getElementById("editorName").value.trim() || "Custom Theme";
var t = document.getElementById("editorDesc").value.trim();
var r = document.getElementById("editorAuthor").value.trim() || "Unknown";
if (!window.PurpuraThemeEngine) {
d("Theme engine not ready");
return;
}
if (o >= 0) {
var a = s();
var i = a.customThemes || [];
if (o < i.length) {
i[o].name = e;
i[o].description = t;
i[o].author = r;
i[o].colors = JSON.parse(JSON.stringify(n));
var c = window.PurpuraThemeEngine.getState();
window.__PurpuraSettings.set("thm", Object.assign(c, {
customThemes: i
}));
}
} else {
window.PurpuraThemeEngine.saveCustomTheme(e, t, r, n);
o = (window.PurpuraThemeEngine.getState().customThemes || []).length - 1;
}
window.PurpuraThemeEngine.setCustomColors(n);
window.PurpuraThemeEngine.setTheme("custom");
d("Theme saved!");
v();
}
function y(e) {
if (!confirm("Delete this theme?")) return;
var t = s();
var r = t.customThemes || [];
var a = t.selected === "custom" && r[e] && JSON.stringify(r[e].colors) === JSON.stringify(t.customColors);
window.PurpuraThemeEngine.deleteCustomTheme(e);
if (o === e) k();
if (a) {
window.PurpuraThemeEngine.setTheme("none");
setTimeout(h, 200);
}
if (o > e) o--; else if (o === e) o = -1;
v();
d("Theme deleted");
}
function w() {
document.getElementById("editorEmpty").style.display = "none";
document.getElementById("editorForm").style.display = "";
}
function k() {
document.getElementById("editorEmpty").style.display = "";
document.getElementById("editorForm").style.display = "none";
o = -1;
n = null;
}
function E(e) {
return {
r: parseInt(e.slice(1, 3), 16),
g: parseInt(e.slice(3, 5), 16),
b: parseInt(e.slice(5, 7), 16)
};
}
function T(e) {
if (!e) return "#000000";
if (e.length === 7 && e[0] === "#") return e;
if (e.length === 4 && e[0] === "#") return e;
if (e.slice(0, 4) === "rgb(" || e.slice(0, 5) === "rgba(") {
var t = e.match(/[\d.]+/g);
if (t && t.length >= 3) {
return "#" + [ parseInt(t[0]), parseInt(t[1]), parseInt(t[2]) ].map(function(e) {
var t = Math.max(0, Math.min(255, e)).toString(16);
return t.length === 1 ? "0" + t : t;
}).join("");
}
}
return "#000000";
}
function I(e) {
if (!e) return {
hex: "#000000",
opacity: 100
};
if (e.slice(0, 5) === "rgba(") {
var t = e.match(/[\d.]+/g);
if (t && t.length >= 4) {
return {
hex: T(e),
opacity: Math.round(parseFloat(t[3]) * 100)
};
}
}
if (e.slice(0, 4) === "rgb(") {
return {
hex: T(e),
opacity: 100
};
}
return {
hex: T(e),
opacity: 100
};
}
function S(e, t) {
if (t >= 100) return e;
var r = E(e);
return "rgba(" + r.r + "," + r.g + "," + r.b + "," + t / 100 + ")";
}
function L() {
var e = document.getElementById("editorFields");
if (!e) return;
var r = t.surfaces;
var a = "";
r.forEach(function(e) {
var t = n ? n[e.key] : e.def;
if (!t) t = e.def;
var r = I(t);
var o = E(r.hex);
var i = "rgb(" + o.r + ", " + o.g + ", " + o.b + ")";
a += '<div class="theme-color-field">';
a += '<div class="theme-color-top">';
a += "<label>" + c(e.label) + "</label>";
a += '<span class="theme-color-rgb">' + i + "</span>";
a += '<input type="color" value="' + r.hex + '" data-color-key="' + e.key + '">';
a += "</div>";
a += '<div class="theme-color-opacity">';
a += "<span>Opacity</span>";
a += '<input type="range" min="0" max="100" value="' + r.opacity + '" data-opacity-key="' + e.key + '">';
a += '<span class="theme-color-opacity-val" data-opacity-display="' + e.key + '">' + r.opacity + "%</span>";
a += "</div>";
a += "</div>";
});
e.innerHTML = a;
e.querySelectorAll("input[type=color]").forEach(function(t) {
t.addEventListener("input", function() {
var r = t.getAttribute("data-color-key");
var a = e.querySelector('input[data-opacity-key="' + r + '"]');
var o = a ? parseInt(a.value) : 100;
var i = S(t.value, o);
n[r] = i;
var s = E(t.value);
var c = t.closest(".theme-color-field").querySelector(".theme-color-rgb");
if (c) c.textContent = "rgb(" + s.r + ", " + s.g + ", " + s.b + ")";
if (window.PurpuraThemeEngine) window.PurpuraThemeEngine.applyLivePreview(n);
});
});
e.querySelectorAll("input[type=range]").forEach(function(t) {
t.addEventListener("input", function() {
var r = t.getAttribute("data-opacity-key");
var a = e.querySelector('input[data-color-key="' + r + '"]');
var o = a ? a.value : "#000000";
var i = parseInt(t.value);
var s = S(o, i);
n[r] = s;
var c = e.querySelector('[data-opacity-display="' + r + '"]');
if (c) c.textContent = i + "%";
if (window.PurpuraThemeEngine) window.PurpuraThemeEngine.applyLivePreview(n);
});
});
}
function B() {
if (!n) {
d("No theme to export");
return;
}
var e = document.getElementById("editorName").value.trim() || "Custom Theme";
var t = document.getElementById("editorDesc").value.trim();
var r = document.getElementById("editorAuthor").value.trim() || "Unknown";
window.PurpuraThemeEngine.exportTheme(e, t, r, n);
d("Theme exported!");
}
function C(e) {
var t = new FileReader;
t.onload = function() {
try {
var e = window.PurpuraThemeEngine.importTheme(t.result);
n = e.colors;
o = -1;
document.getElementById("editorName").value = e.name;
document.getElementById("editorDesc").value = e.description || "";
document.getElementById("editorAuthor").value = e.author || "";
document.getElementById("btnDeleteTheme").style.display = "none";
w();
L();
d("Theme imported: " + e.name);
} catch (e) {
d("Import failed: " + e.message);
}
};
t.readAsText(e);
}
function A() {
document.title = "Themes - Roblox";
var t = document.querySelector(".main-content") || document.querySelector(".content") || document.querySelector(".container-main") || document.querySelector("#container") || document.querySelector("main") || document.querySelector(".page-content");
var a = document.createElement("style");
a.id = "purpura-themes-css";
a.textContent = e;
(document.head || document.documentElement).appendChild(a);
var s = chrome.runtime.getURL("images/icons/default/Purpura_Default_Logo_48.png");
var c = document.createElement("div");
c.id = "purpura-themes-root";
c.innerHTML = '<div class="themes-root">' + '<header class="themes-header"><div class="themes-header-left"><img class="themes-logo" src="' + s + '" alt="Purpura"><h1>Themes</h1></div></header>' + '<nav class="themes-tabs" id="themesTabs"><button class="themes-tab active" data-tab="shipped">Shipped</button><button class="themes-tab" data-tab="custom">Custom</button></nav>' + '<main class="themes-main">' + '<section class="themes-panel active" id="panelShipped"><div class="themes-cards" id="shippedCards"><div class="themes-card-loading">Loading presets...</div></div></section>' + '<section class="themes-panel" id="panelCustom"><div class="themes-custom-layout"><div class="themes-custom-sidebar"><h3>My Themes</h3><div class="themes-custom-list" id="customThemeList"><div class="themes-empty-state">No custom themes yet</div></div><div class="themes-custom-actions"><button class="themes-btn themes-btn-outline" id="btnNewTheme">+ New Theme</button><button class="themes-btn themes-btn-outline" id="btnImportTheme">Import .purpuraTheme</button><input type="file" id="importFileInput" accept=".purpuraTheme" style="display:none"></div></div><div class="themes-custom-editor" id="customEditor"><div class="themes-editor-empty" id="editorEmpty"><p>Select or create a custom theme to start editing</p></div><div class="themes-editor-form" id="editorForm" style="display:none"><div class="themes-editor-meta"><div class="themes-form-group"><label>Theme Name</label><input type="text" id="editorName" placeholder="Custom Theme" maxlength="50"></div><div class="themes-form-group"><label>Description</label><input type="text" id="editorDesc" placeholder="Pick colors or paste RGB values. Changes apply live to the page behind this editor." maxlength="120"></div><div class="themes-form-group"><label>Author</label><input type="text" id="editorAuthor" placeholder="You" maxlength="50"></div></div><div class="themes-editor-tabs"><button class="themes-editor-tab active" data-editor-tab="surfaces">ROBLOX</button></div><div class="themes-editor-fields" id="editorFields"></div><div class="themes-editor-actions"><button class="themes-btn themes-btn-primary" id="btnSaveTheme">Save Theme</button><button class="themes-btn themes-btn-outline" id="btnExportTheme">Export .purpuraTheme</button><button class="themes-btn themes-btn-outline" id="btnResetTheme">Reset</button><button class="themes-btn themes-btn-danger" id="btnDeleteTheme" style="display:none">Delete</button></div></div></div></div></section>' + "</main></div>";
if (t) {
t.style.backgroundColor = "transparent";
t.innerHTML = "";
t.appendChild(c);
} else {
document.body.appendChild(c);
}
l().then(function(e) {
i = e;
h();
});
h();
v();
document.getElementById("themesTabs").addEventListener("click", function(e) {
var t = e.target.closest(".themes-tab");
if (!t) return;
var r = t.getAttribute("data-tab");
document.querySelectorAll(".themes-tab").forEach(function(e) {
e.classList.toggle("active", e === t);
});
var a = "panel" + r.charAt(0).toUpperCase() + r.slice(1);
document.querySelectorAll(".themes-panel").forEach(function(e) {
e.classList.toggle("active", e.id === a);
});
});
document.getElementById("btnNewTheme").addEventListener("click", b);
document.getElementById("btnSaveTheme").addEventListener("click", x);
document.getElementById("btnExportTheme").addEventListener("click", B);
document.getElementById("btnDeleteTheme").addEventListener("click", function() {
if (o >= 0) y(o);
});
document.getElementById("btnImportTheme").addEventListener("click", function() {
document.getElementById("importFileInput").click();
});
document.getElementById("importFileInput").addEventListener("change", function(e) {
if (e.target.files && e.target.files[0]) C(e.target.files[0]);
e.target.value = "";
});
document.getElementById("btnResetTheme").addEventListener("click", function() {
if (!confirm("Reset all colors to Roblox defaults?")) return;
n = JSON.parse(JSON.stringify(r));
L();
if (window.PurpuraThemeEngine) window.PurpuraThemeEngine.applyLivePreview(n);
d("Colors reset to defaults");
});
var m = 0;
var u = setInterval(function() {
if (window.PurpuraThemeEngine) {
clearInterval(u);
h();
v();
} else if (++m > 40) {
clearInterval(u);
}
}, 100);
chrome.storage.onChanged.addListener(function(e, t) {
if (t !== "local") return;
if (e.thm || e.thmEnabled) {
h();
v();
}
});
}
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", A);
} else {
A();
}
})();
