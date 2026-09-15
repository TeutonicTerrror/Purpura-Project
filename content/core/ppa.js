/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
if (window.Purpura && window.Purpura.copyDebug) return;
window.Purpura = window.Purpura || {};
function e(e) {
const o = document.createElement("textarea");
o.value = e;
o.style.position = "fixed";
o.style.left = "-9999px";
o.style.top = "-9999px";
document.body.appendChild(o);
o.focus();
o.select();
let t = false;
try {
t = document.execCommand("copy");
} catch (e) {}
document.body.removeChild(o);
return t;
}
window.Purpura.migrateKeys = function() {
return new Promise(e => {
const o = t => {
document.removeEventListener("purpura-migrate-keys-response", o);
e(t.detail || {
success: false,
error: "empty_response",
migrated: 0
});
};
document.addEventListener("purpura-migrate-keys-response", o);
document.dispatchEvent(new CustomEvent("purpura-migrate-keys"));
setTimeout(() => {
document.removeEventListener("purpura-migrate-keys-response", o);
e({
success: false,
error: "timeout",
migrated: 0
});
}, 15e3);
});
};
window.Purpura.copyDebug = function() {
return new Promise(o => {
const t = async r => {
document.removeEventListener("purpura-copy-debug-response", t);
if (r.detail.error) {
console.log("%c✗ Failed to copy debug info", "color: #f44336; font-weight: bold;");
o("Failed to copy debug info");
} else {
let t = false;
try {
await navigator.clipboard.writeText(r.detail.debugText);
t = true;
} catch (o) {
t = e(r.detail.debugText);
}
if (t) {
console.log("%c✓ Debug info copied to clipboard!", "color: #4caf50; font-weight: bold;");
o("Debug info copied to clipboard!");
} else {
console.log("%c✗ Failed to copy to clipboard", "color: #f44336; font-weight: bold;");
o("Failed to copy to clipboard");
}
}
};
document.addEventListener("purpura-copy-debug-response", t);
document.dispatchEvent(new CustomEvent("purpura-copy-debug-request"));
});
};
})();
