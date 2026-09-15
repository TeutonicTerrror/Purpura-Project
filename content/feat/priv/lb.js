/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
const e = "lb";
let n = false;
(function() {
var e = document.createElement("style");
e.textContent = ":root{--purpura-lb-accent:#22c55e;--purpura-lb-text:#e0e7ff;--purpura-lb-bg-start:rgba(34,197,94,0.10);--purpura-lb-bg-end:rgba(22,163,74,0.05);--purpura-lb-border:rgba(34,197,94,0.25)}";
document.head.appendChild(e);
})();
window.__PurpuraSettings.ready.then(function() {
n = window.__PurpuraSettings.get(e) === true;
if (n) t();
});
chrome.storage.onChanged.addListener((r, o) => {
if (o !== "local") return;
if (!r[e]) return;
n = window.__PurpuraSettings.get(e) === true;
if (n) t();
});
function t() {
const e = window.location.hostname;
if (e !== "www.roblox.com" && e !== "roblox.com") return;
let n = null;
let t = null;
function r() {
if (n) {
clearInterval(n);
n = null;
}
if (t && typeof t.disconnect === "function") {
t.disconnect();
t = null;
}
}
function o() {
const e = document.querySelector(".login-content-wrapper");
if (!e) return;
if (document.getElementById("purpura-login-banner")) {
r();
return;
}
const n = document.createElement("div");
n.id = "purpura-login-banner";
const t = window.location.pathname.toLowerCase().includes("createaccount");
n.innerHTML = `\n                <div style="display:flex;align-items:center;gap:12px;">\n                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--purpura-lb-accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">\n                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>\n                    </svg>\n                    <span style="flex:1;font-size:14px;font-weight:500;line-height:1.5;color:var(--purpura-lb-text);">\n                        ${t ? "You are on the real Roblox signup page. If you do not see this banner, you are likely on a fake website or a phishing site." : "You are on the real Roblox login page. If you do not see this banner, you are likely on a fake website or a phishing site."}\n                    </span>\n                </div>\n            `;
Object.assign(n.style, {
background: "linear-gradient(135deg, var(--purpura-lb-bg-start), var(--purpura-lb-bg-end))",
border: "1px solid var(--purpura-lb-border)",
borderRadius: "12px",
padding: "14px 20px",
marginBottom: "20px",
textAlign: "left"
});
e.prepend(n);
r();
}
n = setInterval(o, 150);
t = new MutationObserver(o);
t.observe(document.body, {
childList: true,
subtree: true
});
}
})();
