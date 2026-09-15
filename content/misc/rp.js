/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
var e = "https://chromewebstore.google.com/detail/purpura/lpneoiebggmkhlldeongbcipekohjepc";
var t = 12e3;
setTimeout(function() {
chrome.storage.local.get([ "purpuraFirstInstalled", "purpuraRobloxVisits", "purpuraSettingsOpenedCount", "purpuraReviewEligible", "purpuraReviewPromptShown", "purpuraReviewCompleted" ], function(r) {
if (r.purpuraReviewCompleted) return;
if (r.purpuraReviewPromptShown) return;
if (!r.purpuraReviewEligible) return;
if (!document.body) return;
var a = document.createElement("style");
a.textContent = [ '#purpura-review-toast{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);width:440px;max-width:calc(100% - 32px);z-index:9999998;background:linear-gradient(135deg,#13111c,#1a1428);border:1px solid rgba(155,109,255,0.3);border-radius:14px;padding:14px 20px;box-shadow:0 8px 32px rgba(0,0,0,0.5),0 0 0 1px rgba(155,109,255,0.12);font-family:"DM Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#f0eeff;font-size:14px;line-height:1.4;opacity:0;transition:opacity 0.3s,transform 0.4s cubic-bezier(0.22,1,0.36,1)}', "#purpura-review-toast.visible{transform:translateX(-50%) translateY(0);opacity:1}", "#purpura-review-toast.hiding{transform:translateX(-50%) translateY(20px);opacity:0;transition:transform 0.25s ease-in,opacity 0.2s}", ".purpura-toast-inner{display:flex;align-items:center;justify-content:center;gap:16px;max-width:640px;margin:0 auto}", ".purpura-toast-text{color:#a89ec4;font-weight:500}", ".purpura-toast-text strong{color:#f0eeff;font-weight:700}", ".purpura-toast-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 18px;border-radius:8px;background:linear-gradient(135deg,#7c3aed,#6d28d9);border:none;color:#fff;font-size:13px;font-weight:600;cursor:pointer;text-decoration:none;transition:transform 0.2s,box-shadow 0.2s;white-space:nowrap;box-shadow:0 2px 8px rgba(124,58,237,0.35)}", ".purpura-toast-btn:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(124,58,237,0.5)}", ".purpura-toast-close{flex-shrink:0;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:50%;color:#8075a0;cursor:pointer;transition:color 0.2s,background 0.2s;background:rgba(255,255,255,0.04)}", ".purpura-toast-close svg{width:14px;height:14px}", ".purpura-toast-close:hover{color:#f0eeff;background:rgba(255,255,255,0.1)}" ].join("");
document.head.appendChild(a);
chrome.storage.local.set({
purpuraReviewPromptShown: true,
purpuraReviewPromptLastShown: Date.now()
});
var o = document.createElement("div");
o.id = "purpura-review-toast";
o.innerHTML = '<div class="purpura-toast-inner"><span class="purpura-toast-close" id="purpura-toast-close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span><span class="purpura-toast-text">&#x2B50; Enjoying <strong>Purpura</strong>? Your review helps the project grow.</span><a class="purpura-toast-btn" id="purpura-review-btn" href="' + e + '" target="_blank" rel="noopener">Leave a Review</a></div>';
document.body.appendChild(o);
setTimeout(function() {
o.classList.add("visible");
}, 150);
var n = function() {
if (!o.parentNode) return;
chrome.runtime.sendMessage({
action: "resetReviewCriteria"
});
o.classList.add("hiding");
setTimeout(function() {
if (o.parentNode) o.remove();
}, 350);
};
var i = setTimeout(n, t);
document.getElementById("purpura-toast-close").addEventListener("click", function(e) {
e.preventDefault();
clearTimeout(i);
n();
});
document.getElementById("purpura-review-btn").addEventListener("click", function() {
chrome.runtime.sendMessage({
action: "reviewCompleted"
});
});
o.addEventListener("mouseenter", function() {
clearTimeout(i);
});
o.addEventListener("mouseleave", function() {
i = setTimeout(n, t);
});
});
}, Math.random() * 400 + 100);
})();
