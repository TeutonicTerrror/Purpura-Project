/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
var PURPURA_EMOJIS = {
Bug: "images/purpuraEmoji/Purpura_Bug.svg",
Checkmark: "images/purpuraEmoji/Purpura_Checkmark.svg",
Dragon_Face: "images/purpuraEmoji/Purpura_Dragon_Face.svg",
Eyes: "images/purpuraEmoji/Purpura_Eyes.svg",
Fire: "images/purpuraEmoji/Purpura_Fire.svg",
Heart: "images/purpuraEmoji/Purpura_Heart.svg",
Pray: "images/purpuraEmoji/Purpura_Pray.svg",
Puzzle: "images/purpuraEmoji/Purpura_Puzzle.svg",
Skull: "images/purpuraEmoji/Purpura_Skull.svg",
Sparkles: "images/purpuraEmoji/Purpura_Sparkles.svg",
Speaker: "images/purpuraEmoji/Purpura_Speaker.svg",
Thinking: "images/purpuraEmoji/Purpura_Thinking.svg",
Thumbs_Down: "images/purpuraEmoji/Purpura_Thumbs_Down.svg",
Thumbs_Up: "images/purpuraEmoji/Purpura_Thumbs_Up.svg",
Weary: "images/purpuraEmoji/Purpura_Weary.svg",
Wilted_Rose: "images/purpuraEmoji/Purpura_Wilted_Rose.svg",
X_Mark: "images/purpuraEmoji/Purpura_X_Mark.svg"
};

document.getElementById("closeBtn").addEventListener("click", function() {
window.close();
});

(function() {
var r = document.getElementById("changelogCard");
if (!window.PURPURA_CHANGELOG || !PURPURA_CHANGELOG.length) return;
var e = PURPURA_CHANGELOG[0];
r.innerHTML = "<h2>Purpura v" + escapeHtml(e.version) + "</h2>" + '<div class="date">&#x1F4C5; ' + formatDate(e.date) + "</div>" + '<div class="changes-body">' + parseMarkdown(e.body) + "</div>";
})();

function parseMarkdown(r) {
if (!r) return "";
r = r.replace(/<:[^:]+:\d+>/g, "");
r = r.replace(/<@&\d+>/g, "");
var e = r.split("\n");
var a = "";
var u = false;
var i = false;
for (var s = 0; s < e.length; s++) {
var l = e[s];
var n = l.trim();
if (n === "") {
if (i) {
a += "</ul></li>";
i = false;
}
if (u) {
a += "</ul>";
u = false;
}
continue;
}
var p = l.length - l.replace(/^ +/, "").length;
if (n.indexOf("## ") === 0) {
if (i) {
a += "</ul></li>";
i = false;
}
if (u) {
a += "</ul>";
u = false;
}
a += '<h3 class="changes-h2">' + formatLine(n.slice(3)) + "</h3>";
} else if (n.indexOf("# ") === 0) {
if (i) {
a += "</ul></li>";
i = false;
}
if (u) {
a += "</ul>";
u = false;
}
a += '<h3 class="changes-h1">' + formatLine(n.slice(2)) + "</h3>";
} else if (n.indexOf("- ") === 0) {
if (p >= 2 && u) {
if (!i) {
a += '<ul class="changes-sublist">';
i = true;
}
a += "<li>" + formatLine(n.slice(2)) + "</li>";
} else {
if (i) {
a += "</ul></li>";
i = false;
}
if (!u) {
a += '<ul class="changes-list">';
u = true;
}
a += "<li>" + formatLine(n.slice(2)) + "</li>";
}
} else {
if (i) {
a += "</ul></li>";
i = false;
}
if (u) {
a += "</ul>";
u = false;
}
a += '<p class="changes-p">' + formatLine(n) + "</p>";
}
}
if (i) {
a += "</ul></li>";
}
if (u) {
a += "</ul>";
}
return a;
}

function formatLine(r) {
r = escapeHtml(r);
r = replaceEmojis(r);
r = r.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
return r;
}

function escapeHtml(r) {
var e = document.createElement("div");
e.appendChild(document.createTextNode(r));
return e.innerHTML;
}

function formatDate(r) {
var e = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
var a = new Date(r + "T00:00:00");
if (isNaN(a.getTime())) return r;
return escapeHtml(e[a.getMonth()] + " " + a.getFullYear());
}

function replaceEmojis(r) {
for (var e in PURPURA_EMOJIS) {
if (PURPURA_EMOJIS.hasOwnProperty(e)) {
var a = ":Purpura_" + e + ":";
var u = '<img src="' + chrome.runtime.getURL(PURPURA_EMOJIS[e]) + '" alt="' + a + '" class="purpura-emoji">';
r = r.split(a).join(u);
}
}
return r;
}
