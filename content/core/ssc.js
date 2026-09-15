/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
let e = false;
let t = "off";
let n = null;
const r = "Purpura Streamer Mode is enabled. This data is hidden.";
const s = "Purpura Streamer Mode is active. Disable to view.";
try {
e = sessionStorage.getItem("purpura_streamermode") === "true";
} catch {}
function i() {
if (e) return true;
try {
const t = sessionStorage.getItem("purpura_streamermode");
if (t === "true") {
e = true;
return true;
}
return false;
} catch {
return false;
}
}
const o = window.fetch;
const a = XMLHttpRequest.prototype.open;
const u = XMLHttpRequest.prototype.send;
function c() {
return crypto.randomUUID?.() || "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, e => {
const t = Math.random() * 16 | 0;
const n = e === "x" ? t : t & 3 | 8;
return n.toString(16);
});
}
const d = "https://apis.roblox.com/user-heartbeats-api/pulse";
async function f() {
const e = {
clientSideTimestampEpochMs: Date.now(),
locationInfo: {
studioLocationInfo: {
placeId: 0
}
},
sessionInfo: {
sessionId: c()
}
};
try {
await o(d, {
method: "POST",
credentials: "include",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify(e)
});
} catch {}
}
function p(e) {
t = e;
if (n) {
clearInterval(n);
n = null;
}
if (e === "offline" || e === "studio") {
f();
n = setInterval(f, 6e4);
}
}
function l(t) {
e = t;
}
function y(e) {
if (!e || typeof e !== "string") return null;
if (e.includes("/my/settings/json")) return "settings";
if (e.includes("v1/phone")) return "phone";
if (e.includes("v1/birthdate")) return "birthdate";
if (e.includes("verified-age")) return "age";
if (e.includes("account-country")) return "country";
if (e.includes("age-group")) return "agegroup";
if (e.includes("sessions")) return "sessions";
if (e.includes("v1/emails")) return "email";
return null;
}
function h(e, t) {
if (!e || typeof e !== "object") return e;
switch (t) {
case "settings":
e.UserEmail = r;
e.UserEmailVerified = true;
e.PreviousUserNames = r;
break;

case "email":
e.verifiedEmail = r;
break;

case "phone":
e.countryCode = r;
e.prefix = r;
e.phone = r;
break;

case "birthdate":
e.birthMonth = 0;
e.birthDay = 0;
e.birthYear = 0;
break;

case "age":
e.verifiedAge = 0;
e.isSeventeenPlus = false;
break;

case "country":
if (e.value) {
e.value.countryName = r;
e.value.localizedName = r;
e.value.countryId = 1;
}
break;

case "agegroup":
e.ageGroupTranslationKey = r;
break;

case "sessions":
if (e.sessions) {
e.sessions.forEach(e => {
if (e.location) {
e.location.city = "";
e.location.subdivision = "";
e.location.country = s;
}
if (e.agent) {
e.agent.os = "Hidden";
e.agent.type = "App";
}
e.lastAccessedIp = "Hidden";
e.lastAccessedTimestampEpochMilliseconds = "0";
});
}
break;
}
return e;
}
async function x(e, t) {
if (!e.ok) return e;
try {
const n = e.clone();
const r = await n.json();
h(r, t);
return new Response(JSON.stringify(r), {
status: e.status,
statusText: e.statusText,
headers: e.headers
});
} catch {
return e;
}
}
window.fetch = async function(e, n) {
const r = typeof e === "string" ? e : e instanceof Request ? e.url : "";
if (t !== "off" && r.includes("user-heartbeats-api")) {
return o(e, n);
}
if (i()) {
if (r.includes("presence")) {
const t = n ? {
...n
} : {};
if (!t.method || t.method === "GET") {
return o(e, n);
}
try {
const n = t.body ? JSON.parse(typeof t.body === "string" ? t.body : "") : {};
const r = {
...n
};
if (r.userIds) r.userIds = [];
t.body = JSON.stringify(r);
return o(e, t);
} catch {
return o(e, n);
}
}
const t = y(r);
if (t) {
const r = await o(e, n);
return x(r, t);
}
}
return o(e, n);
};
XMLHttpRequest.prototype.open = function(e, t) {
this._purpura_url = typeof t === "string" ? t : "";
return a.apply(this, arguments);
};
XMLHttpRequest.prototype.send = function() {
if (i() && this._purpura_url) {
const e = y(this._purpura_url);
if (e) {
const t = this;
const n = t.onreadystatechange;
t.addEventListener("readystatechange", function n() {
if (t.readyState === 4 && t.status >= 200 && t.status < 300) {
try {
const n = JSON.parse(t.responseText);
h(n, e);
const r = JSON.stringify(n);
Object.defineProperty(t, "responseText", {
configurable: true,
get: () => r
});
Object.defineProperty(t, "response", {
configurable: true,
get: () => r
});
} catch {}
}
});
}
}
return u.apply(this, arguments);
};
document.addEventListener("purpura-status-spoofer", e => {
p(e.detail.mode);
});
document.addEventListener("purpura-streamer-mode", e => {
l(e.detail);
});
p("off");
})();
