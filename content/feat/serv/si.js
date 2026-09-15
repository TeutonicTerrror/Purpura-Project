/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
"use strict";
function e(e, t) {
return chrome.i18n.getMessage(e, t) || e;
}
let t = true;
let n = {
region: true,
ping: true,
fps: true
};
let r = null;
let i = 0;
let o = 0;
const a = 5e3;
const s = 1e3;
const l = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const u = "purpura-serverid-extractor-script";
const c = 5e3;
const p = [ 0, 180, 500, 1e3, 1800, 3e3 ];
let d = null;
let f = [];
let m = false;
function g() {
const e = window.location.pathname;
const t = window.location.hash;
if (!e.includes("/games/")) {
return false;
}
return t.includes("#!/game-instances") || t.includes("#!game-instances");
}
function v() {
if (g() && t) {
w();
if (!r) {
h();
}
} else if (!g()) {
I();
y();
}
}
function h() {
if (r) {
clearInterval(r);
}
if (d) {
clearTimeout(d);
d = null;
}
r = setInterval(() => {
v();
}, c);
d = setTimeout(() => {
d = null;
v();
A();
}, 600);
}
function y() {
if (r) {
clearInterval(r);
r = null;
}
if (d) {
clearTimeout(d);
d = null;
}
S();
}
function x(e) {
if (typeof e === "boolean") {
return {
enabled: e,
info: {
region: true,
ping: true,
fps: true,
serverVersion: true,
serverId: true
}
};
} else if (typeof e === "object" && e !== null) {
return {
enabled: e.enabled !== false,
info: {
region: e.info?.region !== false,
ping: e.info?.ping !== false,
fps: e.info?.fps !== false,
serverVersion: e.info?.serverVersion !== false,
serverId: e.info?.serverId !== false
}
};
}
return {
enabled: true,
info: {
region: true,
ping: true,
fps: true,
serverVersion: true,
serverId: true
}
};
}
chrome.storage.sync.get([ "si" ], e => {
const r = window.__PurpuraSettings ? window.__PurpuraSettings.get("si") : e["si"];
const i = x(r);
t = i.enabled;
n = i.info;
if (t) {
v();
h();
}
});
chrome.storage.onChanged.addListener((e, r) => {
if (r === "sync" && e["si"]) {
const r = x(window.__PurpuraSettings ? window.__PurpuraSettings.get("si") : e["si"].newValue);
t = r.enabled;
n = r.info;
if (t) {
I();
v();
h();
} else {
I();
y();
}
}
});
let b = location.href;
new MutationObserver(() => {
const e = location.href;
if (e !== b) {
b = e;
setTimeout(() => {
if (t) {
v();
A();
}
}, 1e3);
}
}).observe(document, {
subtree: true,
childList: true
});
window.addEventListener("hashchange", () => {
if (!t) return;
v();
A();
});
window.addEventListener("popstate", () => {
if (!t) return;
v();
A();
});
function w() {
Q();
k();
ne();
A();
}
function I() {
const e = document.querySelectorAll(".purpura-server-region");
e.forEach(e => e.remove());
S();
}
function S() {
if (!f.length) return;
f.forEach(e => clearTimeout(e));
f = [];
}
function A() {
S();
if (!t || !g()) return;
p.forEach(e => {
const n = setTimeout(() => {
if (!t || !g()) return;
k();
if (document.querySelector('[data-purpura-pending="true"]')) {
te();
}
}, e);
f.push(n);
});
}
function k() {
const e = Date.now();
if (e - o < s) {
return;
}
o = e;
const t = document.querySelectorAll(".rbx-public-game-server-item, li.rbx-public-game-server-item");
let n = false;
t.forEach((e, t) => {
if (e.querySelector(".purpura-server-region")) {
return;
}
let r = e.querySelector(".server-player-count-gauge");
if (!r) {
r = e.querySelector(".gauge, .server-gauge, .player-count-gauge");
}
if (!r) {
r = e.querySelector('[class*="gauge"]');
}
if (r) {
ee(e, r);
n = true;
}
});
if (n || document.querySelector('[data-purpura-pending="true"]')) {
setTimeout(() => {
te();
}, 500);
}
}
let C = {};
let N = {};
let T = {};
let _ = {};
let E = false;
let P = 0;
let M = "idle";
let U = {};
async function V() {
if (M === "complete") return U;
if (M === "loading") {
return new Promise(e => {
const t = setInterval(() => {
if (M === "complete" || M === "failed") {
clearInterval(t);
e(U);
}
}, 100);
});
}
M = "loading";
try {
const e = chrome.runtime.getURL("data/ServerList.json");
const t = await fetch(e);
if (t.ok) {
const e = await t.json();
const n = {};
if (Array.isArray(e)) {
e.forEach(e => {
if (e.dataCenterIds && Array.isArray(e.dataCenterIds) && e.location) {
e.dataCenterIds.forEach(t => {
n[t] = e.location;
});
} else if (e.dataCenterId && e.location) {
n[e.dataCenterId] = e.location;
}
});
}
U = n;
}
} catch (e) {}
M = "complete";
return U;
}
function L() {
if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(e) {
const t = Math.random() * 16 | 0;
const n = e === "x" ? t : t & 3 | 8;
return n.toString(16);
});
}
let q = null;
async function D() {
if (q) return q;
try {
const e = document.querySelector('meta[name="csrf-token"]');
if (e) {
const t = e.getAttribute("content") || e.getAttribute("data-token");
if (t) {
q = t;
return q;
}
}
} catch (e) {}
try {
const e = await fetch("https://auth.roblox.com/v2/logout", {
method: "POST",
credentials: "include"
});
const t = e.headers.get("x-csrf-token");
if (t) {
q = t;
return t;
}
} catch (e) {}
return null;
}
function j(e) {
if (!e) return undefined;
return Object.prototype.hasOwnProperty.call(T, e) ? T[e] : undefined;
}
function $() {
const e = document.querySelectorAll(".rbx-public-game-server-item, li.rbx-public-game-server-item");
let t = false;
e.forEach(e => {
if (!e.querySelector(".purpura-server-region")) return;
e.setAttribute("data-purpura-pending", "true");
t = true;
});
if (t) {
setTimeout(() => te(), 50);
}
}
async function O(e) {
if (!e) return null;
if (Object.prototype.hasOwnProperty.call(T, e)) {
return T[e];
}
if (_[e] === "loading") {
return undefined;
}
_[e] = "loading";
try {
const t = await D();
const n = await W("https://develop.roblox.com/v1/assets/latest-versions", {
method: "POST",
headers: {
Accept: "application/json",
"Content-Type": "application/json",
"X-Csrf-Token": t || ""
},
body: JSON.stringify({
assetIds: [ parseInt(e, 10) ],
versionStatus: "Published"
}),
referrer: "https://www.roblox.com/",
timeout: 8e3
});
const r = n && n.final;
if (!r || !r.ok) {
T[e] = null;
_[e] = "complete";
return null;
}
const i = r.bodyJson || {};
let o = null;
if (Array.isArray(i.results) && i.results.length > 0) {
const e = i.results[0] || {};
o = e.versionNumber || e.version || e.assetVersionNumber || null;
}
if (!o && Array.isArray(i.data) && i.data.length > 0) {
const e = i.data[0] || {};
o = e.versionNumber || e.version || e.assetVersionNumber || null;
}
if (!o && Array.isArray(i.assetVersionNumbers) && i.assetVersionNumbers.length > 0) {
const e = i.assetVersionNumbers[0];
o = typeof e === "object" ? e.versionNumber || e.version || e.assetVersionNumber || null : e;
}
if (!o && i.versionNumber) {
o = i.versionNumber;
}
T[e] = o ? String(o) : null;
_[e] = "complete";
return T[e];
} catch (t) {
T[e] = null;
_[e] = "complete";
return null;
}
}
function R(e) {
if (!e) return;
if (Object.prototype.hasOwnProperty.call(T, e)) return;
if (_[e] === "loading") return;
O(e).then(() => {
$();
}).catch(() => {
$();
});
}
function B(e) {
if (!e) return null;
const t = e.country || null;
const n = e.city || null;
const r = e.region || null;
if (t === "US" && r && n) {
const e = K(r);
const t = String(n).replace(/\s+/g, "").toUpperCase();
return `US-${e}-${t}`;
} else if (t === "US" && r) {
const e = K(r);
return `US-${e}`;
}
return String(t).toUpperCase();
}
function F(e) {
const t = {
US: "unitedstates.png",
SG: "singapore.png",
DE: "germany.png",
FR: "france.png",
JP: "japan.png",
BR: "brazil.png",
NL: "netherlands.png",
AU: "australia.png",
GB: "unitedkingdom.png",
IN: "india.png"
};
const n = t[e];
if (n) {
return chrome.runtime.getURL(`images/flags/${n}`);
}
return null;
}
function H(t) {
if (!t) return e("serverInfo_unknown");
const n = t.country || null;
const r = t.city || null;
const i = t.region || null;
if (n === "US" && r && i) {
return `${r}, ${i}`;
} else if (n === "US" && i) {
return `${i}, USA`;
}
const o = {
SG: "Singapore",
DE: "Germany",
FR: "France",
JP: "Japan",
BR: "Brazil",
NL: "Netherlands",
AU: "Australia",
GB: "United Kingdom",
IN: "India",
KR: "South Korea",
HK: "Hong Kong",
CA: "Canada",
MX: "Mexico",
AR: "Argentina",
CL: "Chile",
CO: "Colombia",
PE: "Peru",
ES: "Spain",
IT: "Italy",
PL: "Poland",
RU: "Russia",
TR: "Turkey",
ZA: "South Africa",
EG: "Egypt",
AE: "United Arab Emirates",
SA: "Saudi Arabia",
IL: "Israel",
SE: "Sweden",
NO: "Norway",
FI: "Finland",
DK: "Denmark",
BE: "Belgium",
AT: "Austria",
CH: "Switzerland",
CZ: "Czech Republic",
PT: "Portugal",
GR: "Greece",
RO: "Romania",
HU: "Hungary",
BG: "Bulgaria",
HR: "Croatia",
SK: "Slovakia",
SI: "Slovenia",
LT: "Lithuania",
LV: "Latvia",
EE: "Estonia",
IE: "Ireland",
NZ: "New Zealand",
TH: "Thailand",
VN: "Vietnam",
MY: "Malaysia",
PH: "Philippines",
ID: "Indonesia",
PK: "Pakistan",
BD: "Bangladesh",
UA: "Ukraine"
};
return o[n] || n || e("serverInfo_unknown");
}
function K(e) {
const t = {
Alabama: "AL",
Alaska: "AK",
Arizona: "AZ",
Arkansas: "AR",
California: "CA",
Colorado: "CO",
Connecticut: "CT",
Delaware: "DE",
Florida: "FL",
Georgia: "GA",
Hawaii: "HI",
Idaho: "ID",
Illinois: "IL",
Indiana: "IN",
Iowa: "IA",
Kansas: "KS",
Kentucky: "KY",
Louisiana: "LA",
Maine: "ME",
Maryland: "MD",
Massachusetts: "MA",
Michigan: "MI",
Minnesota: "MN",
Mississippi: "MS",
Missouri: "MO",
Montana: "MT",
Nebraska: "NE",
Nevada: "NV",
"New Hampshire": "NH",
"New Jersey": "NJ",
"New Mexico": "NM",
"New York": "NY",
"North Carolina": "NC",
"North Dakota": "ND",
Ohio: "OH",
Oklahoma: "OK",
Oregon: "OR",
Pennsylvania: "PA",
"Rhode Island": "RI",
"South Carolina": "SC",
"South Dakota": "SD",
Tennessee: "TN",
Texas: "TX",
Utah: "UT",
Vermont: "VT",
Virginia: "VA",
Washington: "WA",
"West Virginia": "WV",
Wisconsin: "WI",
Wyoming: "WY"
};
if (!e) return "";
return t[e] || String(e).substring(0, 2).toUpperCase();
}
function G(e) {
if (e === null || e === undefined) return null;
const t = String(e).trim();
if (!t) return null;
return l.test(t) ? t : null;
}
function z(e) {
if (!e) return null;
const t = [ "data-purpura-serverid", "data-gameid", "data-game-id", "data-gameinstanceid", "data-game-instance-id" ];
for (const n of t) {
const t = G(e.getAttribute(n));
if (t) return t;
}
const n = [ "[data-gameinstanceid]", "[data-game-instance-id]", "[data-placeid][data-gameinstanceid]", ".game-server-join-btn[data-gameinstanceid]" ];
for (const t of n) {
const n = e.querySelector(t);
if (!n) continue;
const r = G(n.getAttribute("data-gameinstanceid") || n.getAttribute("data-game-instance-id"));
if (r) return r;
}
return null;
}
function J(e, t = 1200) {
return new Promise(n => {
if (!e) {
n(null);
return;
}
Q();
const r = `purpura_extract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
e.setAttribute("data-purpura-extraction-id", r);
let i = false;
let o = null;
const a = () => {
if (i) return;
i = true;
window.removeEventListener("purpura-serverid-extracted", s);
e.removeAttribute("data-purpura-extraction-id");
if (o) {
clearTimeout(o);
o = null;
}
};
const s = t => {
const i = t && t.detail;
if (!i || i.extractionId !== r) return;
a();
const o = G(i.serverId);
if (o) {
e.setAttribute("data-purpura-serverid", o);
n(o);
return;
}
n(z(e));
};
window.addEventListener("purpura-serverid-extracted", s);
window.dispatchEvent(new CustomEvent("purpura-extract-serverid-request", {
detail: {
extractionId: r
}
}));
o = setTimeout(() => {
a();
n(z(e));
}, t);
});
}
function W(e, t) {
return new Promise((n, r) => {
const i = "purpura_fetch_" + Math.random().toString(36).substr(2, 9);
const o = e => {
const t = e.detail;
if (t && t.callbackId === i) {
document.removeEventListener("purpura-fetch-response", o);
clearTimeout(s);
if (t.error) {
r(new Error(t.error));
} else {
n(t.response);
}
}
};
document.addEventListener("purpura-fetch-response", o);
const a = new CustomEvent("purpura-fetch-request", {
detail: {
callbackId: i,
url: e,
options: t
}
});
document.dispatchEvent(a);
const s = setTimeout(() => {
document.removeEventListener("purpura-fetch-response", o);
r(new Error("timeout"));
}, t.timeout || 8e3);
});
}
function Q() {
if (document.getElementById(u)) {
return;
}
const e = document.head || document.documentElement;
if (!e) {
return;
}
const t = document.createElement("script");
t.id = u;
t.src = chrome.runtime.getURL("content/feat/serv/sie.js");
t.async = false;
e.appendChild(t);
}
async function Z(t, n, r = 8e3) {
if (!t || !n) return {
regionCode: "N/A",
reason: "missing_params"
};
await V();
try {
const i = await D();
const o = await W("https://gamejoin.roblox.com/v1/join-game-instance", {
method: "POST",
headers: {
Accept: "application/json",
"Content-Type": "application/json",
"X-Csrf-Token": i || ""
},
body: JSON.stringify({
placeId: parseInt(n, 10),
gameId: t,
gameJoinAttemptId: L()
}),
referrer: "https://www.roblox.com/",
timeout: r
});
if (o && o.final) {
const n = o.final;
if (!n.ok) return {
regionCode: "N/A",
reason: `HTTP ${n.status}`
};
const r = n.bodyJson || n.bodyText;
let i = r && r.joinScript;
if (typeof i === "string") {
try {
i = JSON.parse(i);
} catch (e) {
i = null;
}
}
const a = i?.GameId || i?.gameId || t;
const s = i?.PlaceVersion || i?.placeVersion;
const l = i?.DataCenterId || i?.dataCenterId || i?.DataCenterID;
if (r && r.status) {
if (r.status === 5) return {
regionCode: "Inactive",
regionName: e("serverInfo_inactive"),
reason: "inactive",
gameId: a,
placeVersion: s
};
if (r.status === 12) return {
regionCode: "Private",
regionName: e("serverInfo_private"),
reason: "private_purchase",
gameId: a,
placeVersion: s
};
if (r.status === 22 && !l) return {
regionCode: "Full",
regionName: e("serverInfo_full"),
reason: "full_server",
isQueued: true,
gameId: a,
placeVersion: s
};
}
if (!l) return {
regionCode: "N/A",
reason: "no_dataCenterId",
gameId: a,
placeVersion: s
};
const u = U[l] || null;
if (!u) return {
regionCode: "N/A",
reason: `dcid_${l}_not_found`,
gameId: a,
placeVersion: s
};
return {
regionCode: B(u),
regionName: H(u),
location: u,
dataCenterId: l,
gameId: a,
placeVersion: s
};
}
return {
regionCode: "N/A",
reason: "no_response"
};
} catch (e) {
return {
regionCode: "N/A",
reason: e.message
};
}
}
async function Y(e, t = 0) {
const n = Date.now();
if (n - P < 2e3) {
await new Promise(e => setTimeout(e, 2e3 - (n - P)));
}
P = Date.now();
try {
let n = `https://games.roblox.com/v1/games/${e}/servers/Public?limit=100&excludeFullGames=false`;
let r = await fetch(n);
if (r.status === 429) {
if (t < 2) {
await new Promise(e => setTimeout(e, 5e3 + t * 2e3));
return Y(e, t + 1);
}
return null;
}
if (r.ok) {
const e = await r.json();
if (e && e.data && e.data.length > 0) {
return e.data;
}
}
} catch (e) {}
return null;
}
async function X(e, t) {
const n = {};
const r = t.filter(e => !N[e]);
if (r.length === 0) {
const e = {};
t.forEach(t => {
if (N[t]) {
e[t] = N[t];
}
});
return e;
}
const i = 12;
for (let t = 0; t < r.length; t += i) {
const o = r.slice(t, t + i);
const a = o.map(async t => {
try {
const n = await Z(t, e);
return {
serverId: t,
regionCode: n.regionCode || "N/A",
regionName: n.regionName || "N/A",
isQueued: n.isQueued || false,
gameId: n.gameId,
placeVersion: n.placeVersion
};
} catch (e) {
return {
serverId: t,
regionCode: "N/A",
regionName: "N/A",
isQueued: false
};
}
});
const s = await Promise.all(a);
s.forEach(({serverId: e, regionCode: t, regionName: r, isQueued: i, gameId: o, placeVersion: a}) => {
const s = {
region: t,
regionName: r,
isQueued: i,
gameId: o || e,
placeVersion: a
};
n[e] = s;
N[e] = s;
});
if (t + i < r.length) {
await new Promise(e => setTimeout(e, 300));
}
}
t.forEach(e => {
if (N[e] && !n[e]) {
n[e] = N[e];
}
});
return n;
}
function ee(r, i) {
if (!t) {
return;
}
if (r.querySelector(".purpura-server-region")) {
return;
}
const o = n.region !== false;
const a = n.ping !== false;
const s = n.fps !== false;
const l = n.serverVersion === true;
const u = n.serverId === true;
if (!o && !a && !s && !l && !u) {
return;
}
let c = document.createElement("div");
c.className = "purpura-server-region";
c.style.cssText = `\n            display: flex !important;\n            flex-direction: column !important;\n            align-items: stretch !important;\n            gap: 5px !important;\n            margin: 6px 0 3px 0 !important;\n            padding: 0 !important;\n            background: transparent !important;\n            border: none !important;\n            border-radius: 0 !important;\n            font-family: 'Segoe UI', Tahoma, sans-serif !important;\n            position: relative !important;\n            z-index: 10 !important;\n            width: 100% !important;\n        `;
const p = chrome.runtime.getURL("images/flags/unknown.png");
let d = "";
if (o) {
d += `\n            <div class="purpura-region-container" style="\n                display: flex !important;\n                align-items: center !important;\n                gap: 6px !important;\n                padding: 6px 10px !important;\n                background: linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%) !important;\n                border-left: 3px solid #8b5cf6 !important;\n                border-radius: 5px !important;\n                transition: all 0.2s ease !important;\n                backdrop-filter: blur(8px) !important;\n            ">\n                <img class='purpura-region-flag' src='${p}' alt='Unknown' style="\n                    width: 22px !important;\n                    height: 16px !important;\n                    border-radius: 2px !important;\n                    object-fit: cover !important;\n                    box-shadow: 0 1px 3px rgba(0,0,0,0.25) !important;\n                    display: block !important;\n                    flex-shrink: 0 !important;\n                ">\n                <span class='purpura-region' style="\n                    font-size: 12px !important;\n                    font-weight: 600 !important;\n                    color: #a78bfa !important;\n                    letter-spacing: 0.2px !important;\n                    flex: 1 !important;\n                    white-space: nowrap !important;\n                    overflow: hidden !important;\n                    text-overflow: ellipsis !important;\n                ">${e("serverInfo_na")}</span>\n            </div>`;
}
if (a || s) {
const t = a && s ? "1fr 1fr" : "1fr";
d += `\n            <div style="\n                display: grid !important;\n                grid-template-columns: ${t} !important;\n                gap: 5px !important;\n            ">`;
if (a) {
d += `\n                <div style="\n                    display: flex !important;\n                    align-items: center !important;\n                    gap: 5px !important;\n                    padding: 5px 8px !important;\n                    background: rgba(59, 130, 246, 0.08) !important;\n                    border-radius: 4px !important;\n                    transition: all 0.2s ease !important;\n                ">\n                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" style="flex-shrink: 0;">\n                        <path stroke="#60a5fa" stroke-linecap="round" stroke-linejoin="round" d="M7 12.2499c0.7235 0 1.31 -0.5865 1.31 -1.31S7.7235 9.62988 7 9.62988c-0.72349 0 -1.31 0.58652 -1.31 1.31002 0 0.7235 0.58651 1.31 1.31 1.31Z" stroke-width="1"></path>\n                        <path stroke="#60a5fa" stroke-linecap="round" stroke-linejoin="round" d="M4.53 7.99989c0.32517 -0.33383 0.71392 -0.59916 1.14329 -0.78032 0.42937 -0.18117 0.89068 -0.2745 1.35671 -0.2745 0.46603 0 0.92734 0.09333 1.35671 0.2745 0.42937 0.18116 0.81811 0.44649 1.14329 0.78032" stroke-width="1"></path>\n                        <path stroke="#60a5fa" stroke-linecap="round" stroke-linejoin="round" d="M2.35999 6.31011c0.60871 -0.61226 1.33246 -1.09814 2.12962 -1.4297 0.79716 -0.33155 1.65201 -0.50224 2.51538 -0.50224 0.86336 0 1.71821 0.17069 2.51537 0.50224 0.79714 0.33156 1.52094 0.81744 2.12964 1.4297" stroke-width="1"></path>\n                        <path stroke="#60a5fa" stroke-linecap="round" stroke-linejoin="round" d="M0.5 4.44997c0.85343 -0.85388 1.86674 -1.53123 2.98204 -1.99337C4.59733 1.99446 5.79275 1.75659 7 1.75659c1.20725 0 2.40267 0.23787 3.518 0.70001 1.1153 0.46214 2.1286 1.13949 2.982 1.99337" stroke-width="1"></path>\n                    </svg>\n                    <span class='purpura-ping' style="\n                        font-size: 12px !important;\n                        font-weight: 600 !important;\n                        color: #60a5fa !important;\n                        white-space: nowrap !important;\n                    ">${e("serverInfo_na")}</span>\n                </div>`;
}
if (s) {
d += `\n                <div style="\n                    display: flex !important;\n                    align-items: center !important;\n                    gap: 5px !important;\n                    padding: 5px 8px !important;\n                    background: rgba(34, 197, 94, 0.08) !important;\n                    border-radius: 4px !important;\n                    transition: all 0.2s ease !important;\n                ">\n                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style="flex-shrink: 0;">\n                        <rect x="4" y="4" width="6" height="6" fill="#22c55e" rx="1"/>\n                        <rect x="14" y="4" width="6" height="6" fill="#22c55e" rx="1"/>\n                        <rect x="4" y="14" width="6" height="6" fill="#22c55e" rx="1"/>\n                        <rect x="14" y="14" width="6" height="6" fill="#22c55e" rx="1"/>\n                    </svg>\n                    <span class='purpura-fps' style="\n                        font-size: 12px !important;\n                        font-weight: 600 !important;\n                        color: #22c55e !important;\n                        white-space: nowrap !important;\n                    ">${e("serverInfo_na")}</span>\n                </div>`;
}
d += `</div>`;
}
if (l || u) {
const t = l && u ? "1fr 1fr" : "1fr";
d += `\n            <div style="\n                display: grid !important;\n                grid-template-columns: ${t} !important;\n                gap: 4px !important;\n                margin-top: 3px !important;\n            ">`;
if (l) {
d += `\n                <div style="\n                    display: flex !important;\n                    align-items: center !important;\n                    gap: 4px !important;\n                    padding: 3px 6px !important;\n                    background: rgba(148, 163, 184, 0.06) !important;\n                    border-radius: 3px !important;\n                    transition: all 0.2s ease !important;\n                ">\n                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style="flex-shrink: 0;">\n                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>\n                        <polyline points="14 2 14 8 20 8" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>\n                    </svg>\n                    <span class='purpura-server-version' style="\n                        font-size: 10px !important;\n                        font-weight: 500 !important;\n                        color: #94a3b8 !important;\n                        white-space: nowrap !important;\n                        opacity: 0.8 !important;\n                    ">${e("serverInfo_na")}</span>\n                </div>`;
}
if (u) {
d += `\n                <div style="\n                    display: flex !important;\n                    align-items: center !important;\n                    gap: 4px !important;\n                    padding: 3px 6px !important;\n                    background: rgba(148, 163, 184, 0.06) !important;\n                    border-radius: 3px !important;\n                    transition: all 0.2s ease !important;\n                ">\n                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style="flex-shrink: 0;">\n                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>\n                        <line x1="9" y1="9" x2="15" y2="9" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>\n                        <line x1="9" y1="15" x2="15" y2="15" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>\n                    </svg>\n                    <span class='purpura-server-id' style="\n                        font-size: 10px !important;\n                        font-weight: 500 !important;\n                        color: #94a3b8 !important;\n                        white-space: nowrap !important;\n                        overflow: hidden !important;\n                        text-overflow: ellipsis !important;\n                        opacity: 0.8 !important;\n                        cursor: pointer !important;\n                        transition: opacity 0.15s ease !important;\n                    ">${e("serverInfo_na")}</span>\n                </div>`;
}
d += `</div>`;
}
c.innerHTML = d;
if (i.nextSibling) {
i.parentNode.insertBefore(c, i.nextSibling);
} else if (i.parentNode) {
i.parentNode.appendChild(c);
} else {
r.appendChild(c);
}
const f = r.querySelector(".game-server-join-btn, .btn-full-width.game-server-join-btn, .btn-common-play-game-lg");
if (f) {
f.style.setProperty("margin-top", "4px", "important");
}
r.setAttribute("data-purpura-pending", "true");
}
async function te() {
if (E) {
return;
}
E = true;
try {
const t = (window.location.href.match(/roblox\.com\/games\/(\d+)/) || [])[1];
if (!t) {
E = false;
return;
}
if (!C[t]) {
const e = await Y(t);
if (e) {
C[t] = e;
}
}
const r = n.serverVersion === true;
const i = r ? j(t) : null;
if (r && i === undefined) {
R(t);
}
const o = Array.from(document.querySelectorAll('[data-purpura-pending="true"]'));
const a = Array.isArray(C[t]) ? C[t] : [];
const s = new Map;
a.forEach(e => {
const t = G(e && e.id);
if (t) {
s.set(t, e);
}
});
const l = [];
const u = new Map;
const c = await Promise.all(o.map(async (e, t) => {
let n = z(e);
if (!n) {
n = await J(e);
}
if (!n && a[t]) {
n = G(a[t].id);
}
if (!n) {
const t = (parseInt(e.getAttribute("data-purpura-id-attempts") || "0", 10) || 0) + 1;
e.setAttribute("data-purpura-id-attempts", String(t));
if (t >= 4) {
e.removeAttribute("data-purpura-pending");
}
return null;
}
e.setAttribute("data-purpura-serverid", n);
e.removeAttribute("data-purpura-id-attempts");
return {
serverId: n,
serverElement: e,
index: t,
serverData: s.get(n) || a[t] || null
};
}));
c.forEach(e => {
if (!e || !e.serverId) {
return;
}
if (!u.has(e.serverId)) {
u.set(e.serverId, {
element: e.serverElement,
index: e.index,
serverData: e.serverData
});
}
if (!N[e.serverId] && !l.includes(e.serverId)) {
l.push(e.serverId);
}
});
const p = l.length > 0 ? await X(t, l) : {};
for (const [n, {element: r, index: o, serverData: a}] of u) {
const s = r.querySelector(".purpura-server-region");
if (s) {
const r = p[n] || N[n];
const l = a || C[t] && C[t][o] || null;
const u = s.querySelector(".purpura-region");
const c = s.querySelector(".purpura-region-flag");
const d = s.querySelector(".purpura-region-container");
if (u && r) {
const t = r.region || "";
const i = t === "Full" || t === "Inactive" || t === "Private" || t === "N/A";
const o = r.regionName || r.region || e("serverInfo_na");
u.textContent = o;
if (i) {
u.title = t === "Full" ? e("serverInfo_fullTooltip") : t === "Inactive" ? e("serverInfo_inactiveTooltip") : t === "Private" ? e("serverInfo_privateTooltip") : e("serverInfo_naTooltip");
if (c) {
c.src = chrome.runtime.getURL("images/flags/unknown.png");
c.style.display = "block";
c.alt = "Unknown";
}
} else {
u.title = `Server ID: ${n}`;
const e = t.includes("-") ? t.split("-")[0] : t;
const r = F(e);
if (r && c) {
c.src = r;
c.style.display = "block";
c.alt = e;
} else if (c) {
c.src = chrome.runtime.getURL("images/flags/unknown.png");
c.style.display = "block";
c.alt = "Unknown";
}
}
if (d) d.style.display = "flex";
} else {
if (u) {
u.textContent = "N/A";
u.title = "Region unavailable";
}
if (c) {
c.src = chrome.runtime.getURL("images/flags/unknown.png");
c.style.display = "block";
c.alt = "Unknown";
}
if (d) d.style.display = "flex";
}
const f = s.querySelector(".purpura-ping");
const m = s.querySelector(".purpura-fps");
const g = s.querySelector(".purpura-server-version");
const v = s.querySelector(".purpura-server-id");
if (r) {
if (g) {
const e = r.placeVersion || l && (l.placeVersion || l.place_version) || i;
if (e) {
g.textContent = `v${e}`;
g.title = `Place Version: ${e}`;
} else if (i === undefined && r.region !== "Full") {
g.textContent = "…";
g.title = "Fetching version...";
} else {
g.textContent = "N/A";
g.title = r.region === "Full" ? "Version unavailable for full server" : "Version unavailable";
}
}
if (v) {
const e = G(r.gameId) || n;
if (e) {
const t = e.length > 12 ? e.substring(0, 12) + "..." : e;
const n = parseInt(v.getAttribute("data-purpura-copy-timeout") || "", 10);
if (n) {
clearTimeout(n);
v.removeAttribute("data-purpura-copy-timeout");
}
v.setAttribute("data-purpura-copy-text", t);
v.textContent = t;
v.title = `Server ID: ${e} (Click to copy)`;
v.style.cursor = "pointer";
v.onclick = async n => {
n.stopPropagation();
try {
await navigator.clipboard.writeText(`Server ID: ${e}`);
const n = parseInt(v.getAttribute("data-purpura-copy-timeout") || "", 10);
if (n) {
clearTimeout(n);
}
const r = v.getAttribute("data-purpura-copy-text") || t;
v.textContent = "Copied!";
v.style.color = "#22c55e";
const i = window.setTimeout(() => {
if (!v.isConnected) return;
v.textContent = v.getAttribute("data-purpura-copy-text") || r;
v.style.color = "#94a3b8";
v.removeAttribute("data-purpura-copy-timeout");
}, 1500);
v.setAttribute("data-purpura-copy-timeout", String(i));
} catch (e) {}
};
} else {
v.textContent = "N/A";
v.title = "Server ID unavailable";
v.style.cursor = "default";
const e = parseInt(v.getAttribute("data-purpura-copy-timeout") || "", 10);
if (e) {
clearTimeout(e);
v.removeAttribute("data-purpura-copy-timeout");
}
v.onclick = null;
}
}
}
if (l) {
const t = l;
const n = typeof t.ping === "number" ? Math.floor(t.ping * 100) / 100 : null;
const r = typeof t.fps === "number" ? Math.floor(t.fps * 100) / 100 : null;
if (f) {
if (n !== null) {
f.textContent = `${Math.round(n)}ms`;
let t = e("serverInfo_excellent");
if (n >= 180) t = e("serverInfo_poor"); else if (n >= 120) t = e("serverInfo_average"); else if (n >= 60) t = e("serverInfo_good");
f.title = e("serverInfo_pingQualityTooltip", [ t ]);
} else {
f.textContent = e("serverInfo_na");
f.title = e("serverInfo_pingUnavailableTooltip");
}
}
if (m) {
if (r !== null) {
m.textContent = `${Math.round(r)} FPS`;
let t = e("serverInfo_excellent");
if (r < 30) t = e("serverInfo_poor"); else if (r < 45) t = e("serverInfo_average"); else if (r < 60) t = e("serverInfo_good");
m.title = e("serverInfo_performanceTooltip", [ t ]);
} else {
m.textContent = e("serverInfo_na");
m.title = e("serverInfo_fpsUnavailableTooltip");
}
}
} else {
if (f) {
f.textContent = e("serverInfo_na");
f.title = e("serverInfo_pingUnavailableTooltip");
}
if (m) {
m.textContent = e("serverInfo_na");
m.title = e("serverInfo_fpsUnavailableTooltip");
}
}
}
r.removeAttribute("data-purpura-pending");
}
} catch (e) {} finally {
E = false;
}
}
function ne() {
if (m) {
return;
}
m = true;
const e = [ document.querySelector("#game-instances-container"), document.querySelector(".rbx-game-server-item-container"), document.querySelector(".game-instances-container"), document.querySelector(".tab-content"), document.body ].filter(e => e !== null);
if (e.length === 0) {
e.push(document.body);
}
e.forEach((e, t) => {
const n = new MutationObserver(e => {
let t = false;
e.forEach(e => {
e.addedNodes.forEach(e => {
if (e.nodeType === 1) {
if (e.classList && e.classList.contains("rbx-public-game-server-item")) {
t = true;
} else if (e.querySelector && e.querySelector(".rbx-public-game-server-item")) {
t = true;
} else if (e.querySelector && e.querySelector('[class*="gauge"]')) {
t = true;
}
}
});
if (e.type === "attributes" && e.target.classList && e.target.classList.contains("rbx-public-game-server-item")) {
t = true;
}
});
if (t) {
setTimeout(() => k(), 150);
}
});
n.observe(e, {
childList: true,
subtree: true,
attributes: true,
attributeFilter: [ "class", "style" ]
});
});
}
function re() {
if (!t) {
return;
}
v();
A();
}
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", () => {
re();
});
} else {
re();
}
})();
