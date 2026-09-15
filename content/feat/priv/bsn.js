/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
const e = "bsn";
const r = "purpura-blur-serials";
const t = "purpura-blur-serials-styles";
function n() {
if (document.getElementById(t)) return;
const e = document.createElement("style");
e.id = t;
e.textContent = "body.purpura-blur-serials .limited-number-container," + "body.purpura-blur-serials .collectible-serial-number," + "body.purpura-blur-serials .item-serial-number{" + "filter:blur(6px)!important;transition:filter .2s ease}" + "body.purpura-blur-serials .limited-number-container:hover," + "body.purpura-blur-serials .collectible-serial-number:hover," + "body.purpura-blur-serials .item-serial-number:hover{" + "filter:blur(0)!important}";
(document.head || document.documentElement).appendChild(e);
}
function u() {
if (!document.body) return;
const t = window.__PurpuraSettings.get(e) === true;
document.body.classList.toggle(r, t);
}
window.__PurpuraSettings.ready.then(function() {
n();
u();
});
chrome.storage.onChanged.addListener(function(r, t) {
if (t !== "sync") return;
if (!r[e]) return;
n();
u();
});
})();
