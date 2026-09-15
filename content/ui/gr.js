/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function e() {
function t(e, t) {
return chrome.i18n.getMessage(e, t) || e;
}
let r = false;
let n = false;
const a = {
1089239338: {
text: "TeutonicTerror? Where have I heard that before...",
rarity: "secret"
},
287525063: {
text: "Coral mode: Cliggy Edition.",
rarity: "epic"
},
5191689634: {
text: "Drpeppercarries is better than you.",
rarity: "legendary"
}
};
const o = {
secret: "0.1%",
legendary: "3%",
epic: "14%",
common: "82.9%",
seasonal: "0%"
};
const s = [ {
text: "Today is a great day.",
rarity: "common"
}, {
text: "We ball.",
rarity: "common"
}, {
text: "Not a bad day to exist.",
rarity: "common"
}, {
text: "You got this.",
rarity: "common"
}, {
text: "Let's try not to mess this up.",
rarity: "common"
}, {
text: "Could be worse.",
rarity: "common"
}, {
text: "Send it.",
rarity: "common"
}, {
text: "Tonight we storm the dark kingdom.",
rarity: "common"
}, {
text: "Purpura > Other Extensions.",
rarity: "epic"
}, {
text: "Something big is brewing.",
rarity: "epic"
}, {
text: "What if we-- Ah nevermind...",
rarity: "epic"
}, {
text: "The odds are looking decent.",
rarity: "epic"
}, {
text: "This run might go crazy.",
rarity: "epic"
}, {
text: "Main character energy.",
rarity: "legendary"
}, {
text: "Today's the day.",
rarity: "legendary"
}, {
text: "Dr Pepper is the best pop.",
rarity: "legendary"
}, {
text: "Jesse we need to cook.",
rarity: "legendary"
}, {
text: "Something legendary just started.",
rarity: "legendary"
}, {
text: "You weren't supposed to see this.",
rarity: "secret"
}, {
text: "I know what kind of man you are.",
rarity: "secret"
}, {
text: "This is pretty rare man. Took a long time.",
rarity: "secret"
}, {
text: "Alright… go do something incredibly stupid.",
rarity: "secret"
}, {
text: "How did we get here?",
rarity: "secret"
}, {
text: "Remember kids, stay in School. It makes you better at Mine---I mean Roblox.",
rarity: "secret"
}, {
text: "TeutonicTerror? Where have I heard that before...",
rarity: "secret"
} ];
function i() {
const e = Math.random() * 100;
if (e <= .1) return "secret";
if (e <= 3.1) return "legendary";
if (e <= 17.1) return "epic";
return "common";
}
function l() {
const e = Math.floor(Math.random() * s.length);
return s[e];
}
function p(e) {
const t = `purpura-rarity-${e}`;
const r = window.localStorage.getItem(t);
if (a[e]) {
const n = a[e];
const o = n.rarity || r || i();
if (!r) window.localStorage.setItem(t, o);
return {
message: n.text,
rarity: o
};
}
const n = l();
return {
message: n.text,
rarity: n.rarity
};
}
async function c() {
try {
const e = await fetch("https://users.roblox.com/v1/users/authenticated", {
credentials: "include"
});
if (!e.ok) return null;
const t = await e.json();
return t.id;
} catch (e) {
return null;
}
}
async function d() {
if (!r) return;
if (window.location.pathname !== "/home") return;
if (n) {
if (document.querySelector(".purpura-greeting-wrapper")) return;
n = false;
}
const e = document.querySelector('h1[data-purpura-id="purpura-home-h1"]') || document.querySelector("h1");
if (!e) return;
n = true;
const a = await c();
if (!a) return;
const s = await chrome.runtime.sendMessage({
action: "getRobloxTheme"
});
const i = s?.theme === "light";
const [l, d] = await Promise.all([ fetch(`https://users.roblox.com/v1/users/${a}`).then(e => e.ok ? e.json() : {}), fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${a}&size=150x150&format=png&isCircular=false`).then(e => e.ok ? e.json() : {}) ]);
const u = l?.name || l?.username || `User ${a}`;
const g = l?.displayName || u;
const h = d?.data?.[0]?.imageUrl || "";
const y = (new Date).getHours();
const x = y < 12 ? t("greetings_morning") : y < 18 ? t("greetings_afternoon") : t("greetings_evening");
const m = `${x}, ${u}`;
const b = (() => {
const e = new Date;
return e.getMonth() === 11 && e.getDate() === 25;
})();
const f = (() => {
const e = new Date;
return e.getMonth() === 9 && e.getDate() === 31;
})();
const w = (() => {
const e = new Date;
return e.getMonth() === 0 && e.getDate() === 1;
})();
let {message: v, rarity: $} = p(String(a));
if (b) {
v = "Merry Christmas, you filthy animal.";
$ = "seasonal";
} else if (f) {
const e = [ "Spooky scary skeletons are out tonight..", "Stranger things have happened than this..." ];
v = e[Math.floor(Math.random() * e.length)];
$ = "seasonal";
} else if (w) {
v = "The ball dropped.";
$ = "seasonal";
}
const L = {
secret: "rgba(255, 140, 60, 0.8)",
legendary: "rgba(255, 215, 0, 0.8)",
epic: "rgba(179, 136, 255, 0.8)",
common: "rgba(179, 136, 255, 0.6)",
seasonal: "rgba(255, 0, 0, 0.8)"
};
const k = L[$] || L.common;
document.querySelectorAll(".purpura-greeting-wrapper").forEach(e => e.remove());
const S = document.createElement("div");
S.className = "purpura-greeting-wrapper";
S.style.margin = i ? "0 0 24px" : "0 0 20px";
if (i) {
S.style.animation = "purpuraFadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards";
}
S.innerHTML = `\n      <div class="section" style="display:flex;flex-direction:column;">\n        <div class="col-xs-12 container-header" style="display:flex;align-items:center;margin-bottom:${i ? "18px" : "15px"};">\n          <a class="avatar" style="margin-right:${i ? "18px" : "15px"};width:128px;height:128px;" href="https://www.roblox.com/users/${a}/profile">\n            <span style="width:128px;height:128px;display:inline-block;background:none;border:none;">\n              <thumbnail-2d class="avatar-card-image">\n                <span class="thumbnail-2d-container" thumbnail-type="AvatarHeadshot">\n                  <img src="${h}" alt="${g}" title="${g}" style="width:128px;height:128px;display:block;border-radius:50%;">\n                </span>\n              </thumbnail-2d>\n            </span>\n          </a>\n          <div style="display:flex;flex-direction:column;justify-content:center;">\n            <h1 style="display:flex;align-items:center;margin:0;font-size:${i ? "24px" : "20px"};font-weight:${i ? "800" : "700"};${i ? "letter-spacing:-0.5px;" : ""}">\n              <a href="https://www.roblox.com/users/${a}/profile" class="user-name-container" style="text-decoration:none;color:inherit;margin-right:12px;">${m}</a>\n            </h1>\n            <a href="https://www.roblox.com/users/${a}/profile" class="user-name-container" style="text-decoration:none;color:var(--rbx-text-color);${i ? "opacity:0.7;margin-top:4px;font-size:15px;font-weight:500;" : "margin-top:6px;"}">${i ? `@${u}` : g}</a>\n          </div>\n        </div>\n        <div class="purpura-message rarity-${$}" style="position:relative;display:flex;align-items:center;gap:${i ? "14px" : "12px"};padding:${i ? "16px 20px" : "12px 14px"};border-radius:${i ? "20px" : "16px"};background:${i ? "rgba(255,255,255,0.75)" : "rgba(20,20,28,0.9)"};${i ? "backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);" : ""}box-shadow:${i ? "0 10px 30px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.02)" : "0 10px 30px rgba(0,0,0,0.2)"};border:1px solid ${i ? "rgba(0,0,0,0.06)" : k};">\n          <span class="purpura-badge" style="position:relative;z-index:1;flex-shrink:0;padding:6px ${i ? "14px" : "12px"};border-radius:999px;font-size:11px;font-weight:${i ? "800" : "700"};text-transform:uppercase;letter-spacing:${i ? "1.5px" : "1.2px"};display:flex;align-items:center;gap:${i ? "8px" : "6px"};transition:all 0.3s ease;"></span>\n          <span class="purpura-message-text" style="position:relative;z-index:1;font-weight:700;font-size:${i ? "17px" : "16px"};line-height:${i ? "1.4" : "1.2"};color:${i ? "#191b1d" : "#fff"};${i ? "letter-spacing:-0.2px;" : ""}"></span>\n        </div>\n      </div>\n    `;
const C = S.querySelector(".purpura-message");
const M = S.querySelector(".purpura-badge");
const T = S.querySelector(".purpura-message-text");
T.textContent = v;
const E = $ === "seasonal" ? b ? "100%" : "0%" : o[$] || "??%";
if (i) {
C.style.borderLeft = `6px solid ${k}`;
}
const D = {
secret: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C11.4477 2 11 2.44772 11 3V7.09C7.97 7.55 5.5 9.41 4.24 12.06C3.23 13.98 3.5 16.2 4.92 17.66L12 24L19.08 17.66C20.5 16.2 20.78 13.98 19.76 12.06C18.5 9.41 16.03 7.55 13 7.09V3C13 2.44772 12.5523 2 12 2Z" fill="currentColor"/></svg>',
legendary: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L14.09 8.26L20.97 8.27L15.45 12.14L17.54 18.4L12 14.77L6.46 18.4L8.55 12.14L3.03 8.27L9.91 8.26L12 2Z" fill="currentColor"/></svg>',
epic: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15 8H21L16.5 12.5L18.5 19L12 15.5L5.5 19L7.5 12.5L3 8H9L12 2Z" fill="currentColor"/></svg>'
};
switch ($) {
case "secret":
M.innerHTML = `${D.secret}<span>SECRET RARE</span>`;
M.style.background = i ? "rgba(255, 140, 60, 0.12)" : "rgba(255, 140, 60, 0.15)";
M.style.border = `1px solid ${i ? "rgba(255, 140, 60, 0.4)" : "rgba(255, 140, 60, 0.5)"}`;
M.style.color = i ? "#d35400" : "#FFB14B";
break;

case "legendary":
M.innerHTML = `${D.legendary}<span>LEGENDARY</span>`;
M.style.background = i ? "rgba(241, 196, 15, 0.15)" : "linear-gradient(90deg, rgba(255,215,0,0.3), rgba(255,140,0,0.3))";
M.style.border = `1px solid ${i ? "rgba(241, 196, 15, 0.5)" : "rgba(255,215,0,0.6)"}`;
M.style.color = i ? "#9a7d0a" : "#FFD700";
break;

case "epic":
M.innerHTML = `${D.epic}<span>EPIC</span>`;
M.style.background = i ? "rgba(155, 89, 182, 0.12)" : "linear-gradient(90deg, rgba(138,43,226,0.3), rgba(179,136,255,0.3))";
M.style.border = `1px solid ${i ? "rgba(155, 89, 182, 0.4)" : "rgba(179,136,255,0.6)"}`;
M.style.color = i ? "#7d3c98" : "#b388ff";
break;

case "seasonal":
M.textContent = "SEASONAL";
M.style.background = i ? "rgba(231, 76, 60, 0.12)" : "rgba(255, 0, 0, 0.15)";
M.style.border = `1px solid ${i ? "rgba(231, 76, 60, 0.4)" : "rgba(255, 0, 0, 0.6)"}`;
M.style.color = i ? "#c0392b" : "#ff4d4d";
break;

default:
M.textContent = "COMMON";
M.style.background = i ? "rgba(149, 165, 166, 0.12)" : "rgba(179, 136, 255, 0.15)";
M.style.border = `1px solid ${i ? "rgba(149, 165, 166, 0.4)" : "rgba(179, 136, 255, 0.3)"}`;
M.style.color = i ? "#7f8c8d" : "#b388ff";
break;
}
const z = i ? "rgba(255, 255, 255, 0.95)" : "rgba(15, 15, 25, 0.95)";
const I = i ? "#393b3d" : "rgba(255, 255, 255, 0.95)";
const A = i ? "0 8px 20px rgba(0, 0, 0, 0.1)" : "0 8px 20px rgba(0, 0, 0, 0.4)";
S.style.setProperty("--purpura-tooltip-bg", z);
S.style.setProperty("--purpura-tooltip-color", I);
S.style.setProperty("--purpura-tooltip-shadow", A);
M.setAttribute("data-purpura-tooltip", t("greetings_chance", [ E ]));
if (!document.querySelector("#purpura-console-styles")) {
const e = document.createElement("style");
e.id = "purpura-console-styles";
e.textContent = `\n        .purpura-badge[data-purpura-tooltip] {\n          position: relative;\n          cursor: help;\n        }\n        .purpura-badge[data-purpura-tooltip]::after {\n          content: attr(data-purpura-tooltip);\n          position: absolute;\n          bottom: 100%;\n          left: 50%;\n          transform: translateX(-50%) translateY(-8px);\n          padding: 6px 10px;\n          border-radius: 10px;\n          background: var(--purpura-tooltip-bg, rgba(15, 15, 25, 0.95));\n          color: var(--purpura-tooltip-color, rgba(255, 255, 255, 0.95));\n          font-size: 11px;\n          white-space: nowrap;\n          box-shadow: var(--purpura-tooltip-shadow, 0 8px 20px rgba(0, 0, 0, 0.4));\n          opacity: 0;\n          transition: opacity 130ms ease-in-out;\n          pointer-events: none;\n          z-index: 999;\n        }\n        .purpura-badge[data-purpura-tooltip]:hover::after {\n          opacity: 1;\n        }\n        @keyframes purpuraFadeInUp {\n          from {\n            opacity: 0;\n            transform: translateY(16px);\n            filter: blur(4px);\n          }\n          to {\n            opacity: 1;\n            transform: translateY(0);\n            filter: blur(0);\n          }\n        }\n      `;
document.head.appendChild(e);
}
e.parentNode.insertBefore(S, e);
}
function u() {
document.querySelectorAll(".purpura-greeting-wrapper").forEach(e => e.remove());
n = false;
}
function g() {
window.__PurpuraSettings.ready.then(function() {
var e = window.__PurpuraSettings.get("gr");
var t = e !== undefined ? Boolean(e) : true;
if (t !== r) {
r = t;
if (r) {
n = false;
d();
} else {
u();
}
}
});
}
g();
chrome.storage.onChanged.addListener((e, t) => {
if (t === "local" && e.gr) {
g();
}
});
function h() {
const e = () => {
n = false;
d();
};
const t = history.pushState;
const r = history.replaceState;
history.pushState = function() {
t.apply(history, arguments);
e();
};
history.replaceState = function() {
r.apply(history, arguments);
e();
};
window.addEventListener("popstate", e);
}
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", d);
} else {
d();
}
h();
let y;
let x = null;
function m() {
const e = document.body.classList.contains("light-theme") || !document.body.classList.contains("dark-theme") && document.documentElement.classList.contains("light-theme");
if (x !== null && x !== e) {
u();
}
x = e;
}
const b = new MutationObserver(() => {
m();
clearTimeout(y);
y = setTimeout(d, 100);
});
b.observe(document.body, {
childList: true,
subtree: true,
attributes: true,
attributeFilter: [ "class" ]
});
})();
