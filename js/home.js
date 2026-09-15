/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
function t(e, n) {
return chrome.i18n.getMessage(e, n) || e;
}

function localizeHtml() {
document.querySelectorAll("[data-i18n]").forEach(e => {
const n = chrome.i18n.getMessage(e.dataset.i18n);
if (n) e.textContent = n;
});
document.querySelectorAll("[data-i18n-title]").forEach(e => {
const n = chrome.i18n.getMessage(e.dataset.i18nTitle);
if (n) e.title = n;
});
}

document.addEventListener("DOMContentLoaded", async () => {
localizeHtml();
const e = await checkBanStatus();
if (e.banned) {
showBlockingBanScreen(e.reason, e.expiresAt);
return;
}
const n = document.querySelector(".extension-ui");
if (n) {
n.classList.add("verified");
}
loadUserInfo();
loadDebugInfo();
const t = document.getElementById("openSettingsButtonLarge");
if (t) {
t.addEventListener("click", function() {
chrome.tabs.create({
url: "https://www.roblox.com/my/account?purpura=info"
});
});
}
const o = document.getElementById("purpuraStoreButton");
if (o) {
o.addEventListener("click", function() {
chrome.tabs.create({
url: "https://www.roblox.com/games/store-section/7191592908"
});
});
}
const a = document.getElementById("discordBanner");
if (a) {
a.addEventListener("click", function() {
chrome.tabs.create({
url: "https://discord.gg/TT4sgtEkNV"
});
});
}
const i = document.getElementById("robloxBanner");
if (i) {
i.addEventListener("click", function() {
chrome.tabs.create({
url: "https://www.roblox.com/communities/35582394/Purpura-Extension#!/about"
});
});
}
});

async function loadDebugInfo() {
const e = document.getElementById("debugFeatures");
const n = document.getElementById("debugSession");
const o = document.getElementById("debugBrowser");
if (!e || !n || !o) return;
try {
const [a, i] = await Promise.all([ chrome.storage.local.get(null), chrome.storage.sync.get(null) ]);
const r = {
[t("popup_debugServerInfo")]: i["si"]?.enabled ?? true,
[t("popup_debugBotDetector")]: i["bd"] ?? true,
[t("popup_debugPinnedGames")]: i["pg"] ?? false,
[t("popup_debugGameLauncherWidget")]: i["glw"] ?? false,
[t("popup_debugGameLauncherOmnibox")]: i["game-launcher-omnibox"] ?? false,
[t("popup_debugGameOutfits")]: i["go"]?.enabled ?? true,
[t("popup_debugPageBinds")]: i["pb"] ? t("popup_debugConfigured") : t("popup_debugNone"),
[t("popup_debugBloatwareRemover")]: i["bwr"] ?? false,
[t("popup_debugGreetings")]: a["gr"] ?? true,
[t("popup_debugPurpuraCursors")]: a["pcr"]?.enabled ?? false,
[t("popup_debugPurpuraTabs")]: a["pt"]?.enabled ?? false,
[t("popup_debugUncorporatify")]: a["unc"] ?? false,
[t("popup_debugThemeEditor")]: a["rothemerActive"] ?? false
};
const s = {
[t("popup_debugUserId")]: a["robloxUserId"] || t("popup_debugNotDetected"),
[t("popup_debugBannedLabel")]: a["purpuraBanned"] ? `${t("popup_debugYes")}: ${a["purpuraBanReason"]}` : t("popup_debugNo")
};
const d = {
[t("popup_debugPlatform")]: navigator.platform,
[t("popup_debugLanguage")]: navigator.language,
[t("popup_debugCookies")]: navigator.cookieEnabled ? t("popup_debugEnabled") : t("popup_debugDisabled"),
[t("popup_debugOnline")]: navigator.onLine ? t("popup_debugYes") : t("popup_debugNo")
};
const p = (e, n) => {
e.innerHTML = "";
for (const [o, a] of Object.entries(n)) {
const n = document.createElement("div");
n.className = "debug-row";
const i = document.createElement("span");
i.className = "debug-key";
i.textContent = o;
const r = document.createElement("span");
r.className = "debug-value";
if (typeof a === "boolean") {
r.textContent = a ? t("popup_debugEnabled") : t("popup_debugDisabled");
r.classList.add(a ? "enabled" : "disabled");
} else if (a === "Active" || a === "Enabled" || a === "Yes") {
r.textContent = a;
r.classList.add("enabled");
} else if (a === "Inactive" || a === "Disabled" || a === "No" || a === "None") {
r.textContent = a;
r.classList.add("disabled");
} else {
r.textContent = String(a);
}
n.appendChild(i);
n.appendChild(r);
e.appendChild(n);
}
};
p(e, r);
p(n, s);
p(o, d);
} catch (e) {}
}

async function loadUserInfo() {
const e = document.getElementById("userAvatar");
const n = document.getElementById("userDisplayName");
try {
const o = await fetch("https://users.roblox.com/v1/users/authenticated", {
credentials: "include"
});
if (!o.ok) {
if (n) {
n.textContent = t("popup_notLoggedIn");
}
return;
}
const a = await o.json();
if (!a || !a.id) return;
if (n && a.displayName) {
n.textContent = a.displayName;
}
if (e) {
const n = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${a.id}&size=150x150&format=Png&isCircular=true`, {
credentials: "include"
});
if (n.ok) {
const t = await n.json();
if (t.data && t.data[0] && t.data[0].imageUrl) {
e.src = t.data[0].imageUrl;
e.classList.add("loaded");
}
}
}
} catch (e) {
if (n) {
n.textContent = t("popup_notLoggedIn");
}
}
}

async function checkBanStatus() {
try {
const e = await chrome.storage.local.get([ "purpuraBanned", "purpuraBanReason", "purpuraBannedAt" ]);
if (e.purpuraBanned) {
await chrome.storage.local.set({
noFeatures: true,
noFeaturesReason: e.purpuraBanReason
});
return {
banned: true,
reason: e.purpuraBanReason,
bannedAt: e.purpuraBannedAt
};
}
const n = await chrome.runtime.sendMessage({
action: "checkBanStatus"
});
if (n && n.banned) {
await chrome.storage.local.set({
noFeatures: true,
noFeaturesReason: n.reason
});
return {
banned: true,
reason: n.reason,
expiresAt: n.expiresAt
};
}
await chrome.storage.local.set({
noFeatures: false,
noFeaturesReason: null
});
return {
banned: false
};
} catch (e) {
await chrome.storage.local.set({
noFeatures: false,
noFeaturesReason: null
});
return {
banned: false
};
}
}

function showBlockingBanScreen(e, n) {
let o = t("popup_permanent");
if (n) {
const e = new Date(n);
o = e.toLocaleDateString("en-US", {
year: "numeric",
month: "long",
day: "numeric",
hour: "2-digit",
minute: "2-digit"
});
}
document.body.innerHTML = `\n        <div style="\n            position: fixed;\n            top: 0;\n            left: 0;\n            width: 100%;\n            height: 100%;\n            background: linear-gradient(135deg, #1a0000, #2d0000, #1a0000);\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            z-index: 999999;\n        ">\n            <div style="\n                background: linear-gradient(135deg, #3d0000, #1a0000);\n                border: 3px solid #ff4444;\n                border-radius: 16px;\n                padding: 40px;\n                max-width: 450px;\n                text-align: center;\n                box-shadow: 0 8px 32px rgba(255, 68, 68, 0.4), 0 0 60px rgba(255, 68, 68, 0.2);\n            ">\n                <div style="margin-bottom: 24px;">\n                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ff4444" stroke-width="2">\n                        <circle cx="12" cy="12" r="10"/>\n                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>\n                    </svg>\n                </div>\n                <h2 style="color: #ff4444; margin-bottom: 16px; font-size: 28px; font-weight: bold; font-family: 'Segoe UI', sans-serif;">\n                    ${t("popup_accessDenied")}\n                </h2>\n                <p style="color: #ff8888; margin-bottom: 24px; font-size: 16px; line-height: 1.6; font-family: 'Segoe UI', sans-serif;">\n                    ${t("popup_accountBannedFromExtension")}\n                </p>\n                <div style="\n                    background: rgba(255, 68, 68, 0.1);\n                    border: 1px solid rgba(255, 68, 68, 0.3);\n                    border-radius: 12px;\n                    padding: 20px;\n                    margin-bottom: 24px;\n                ">\n                    <div style="margin-bottom: 12px;">\n                        <span style="color: #ff8888; font-weight: bold; font-family: 'Segoe UI', sans-serif;">${t("popup_reason")}:</span>\n                        <p style="color: #ffffff; margin-top: 4px; font-family: 'Segoe UI', sans-serif;">${e || t("popup_noReasonProvided")}</p>\n                    </div>\n                    <div>\n                        <span style="color: #ff8888; font-weight: bold; font-family: 'Segoe UI', sans-serif;">${t("popup_expires")}:</span>\n                        <p style="color: #ffffff; margin-top: 4px; font-family: 'Segoe UI', sans-serif;">${o}</p>\n                    </div>\n                </div>\n                <p style="color: #888888; margin-bottom: 24px; font-size: 14px; font-family: 'Segoe UI', sans-serif;">\n                    ${t("popup_banErrorContact")}\n                </p>\n                <a \n                    href="https://discord.gg/TT4sgtEkNV" \n                    target="_blank"\n                    style="\n                        display: inline-flex;\n                        align-items: center;\n                        gap: 8px;\n                        padding: 12px 24px;\n                        background: linear-gradient(135deg, #5865F2, #4752C4);\n                        border: none;\n                        border-radius: 8px;\n                        color: white;\n                        font-weight: bold;\n                        text-decoration: none;\n                        font-size: 14px;\n                        font-family: 'Segoe UI', sans-serif;\n                    "\n                >\n                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">\n                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>\n                    </svg>\n                    ${t("popup_contactSupportDiscord")}\n                </a>\n            </div>\n        </div>\n    `;
}

async function refreshAllRobloxPages() {
try {
const e = await chrome.tabs.query({
url: "*://*.roblox.com/*"
});
if (e.length > 0) {
for (const n of e) {
try {
await chrome.tabs.reload(n.id);
} catch (e) {}
}
showRefreshNotification(e.length);
}
} catch (e) {}
}

function showRefreshNotification(e) {
const n = document.querySelector(".refresh-notice");
if (n) {
n.remove();
}
const o = document.createElement("div");
o.className = "refresh-notice";
o.style.cssText = `\n        position: fixed;\n        top: 10px;\n        right: 10px;\n        background: linear-gradient(135deg, #4CAF50, #45a049);\n        color: white;\n        padding: 12px 16px;\n        border-radius: 8px;\n        font-size: 14px;\n        font-weight: 600;\n        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);\n        z-index: 10000;\n        max-width: 300px;\n        animation: slideIn 0.3s ease-out;\n    `;
o.innerHTML = `\n        <div style="display: flex; align-items: center; gap: 8px;">\n            <span>🔄</span>\n            <div>\n                <div style="font-weight: 700;">${t("popup_refreshingPages")}</div>\n                <div style="font-size: 12px; opacity: 0.9;">${t("popup_robloxTabsUpdated", [ String(e), e > 1 ? "s" : "" ])}</div>\n            </div>\n        </div>\n    `;
document.body.appendChild(o);
setTimeout(() => {
o.style.animation = "slideOut 0.3s ease-in";
setTimeout(() => {
if (o.parentNode) {
o.parentNode.removeChild(o);
}
}, 300);
}, 3e3);
}

async function getUserId() {
try {
const e = await fetch("https://users.roblox.com/v1/users/authenticated", {
credentials: "include"
});
if (!e.ok) {
if (e.status === 401) {
showNotification(t("popup_loginToRoblox"), "error");
}
return null;
}
const n = await e.json();
if (!n || !n.id) {
showNotification(t("popup_unableGetUserInfo"), "error");
return null;
}
return n.id;
} catch (e) {
showNotification(t("popup_networkError"), "error");
return null;
}
}

function showNotification(e, n = "info") {
const t = document.querySelector(".notification");
if (t) {
t.remove();
}
const o = document.createElement("div");
o.className = `notification ${n}`;
const a = {
success: "linear-gradient(135deg, #10B981, #059669)",
error: "linear-gradient(135deg, #EF4444, #DC2626)",
info: "linear-gradient(135deg, #3B82F6, #2563EB)"
};
o.style.cssText = `\n        position: fixed;\n        top: 10px;\n        right: 10px;\n        background: ${a[n]};\n        color: white;\n        padding: 12px 16px;\n        border-radius: 8px;\n        font-size: 14px;\n        font-weight: 600;\n        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);\n        z-index: 10000;\n        max-width: 300px;\n        animation: slideIn 0.3s ease-out;\n    `;
o.textContent = e;
document.body.appendChild(o);
setTimeout(() => {
o.style.animation = "slideOut 0.3s ease-in";
setTimeout(() => {
if (o.parentNode) {
o.parentNode.removeChild(o);
}
}, 300);
}, 4e3);
}
