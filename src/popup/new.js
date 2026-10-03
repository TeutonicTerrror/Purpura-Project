/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
var PURPURA_EMOJIS = {
    Bug: 'images/purpuraEmoji/Purpura_Bug.svg',
    Checkmark: 'images/purpuraEmoji/Purpura_Checkmark.svg',
    Dragon_Face: 'images/purpuraEmoji/Purpura_Dragon_Face.svg',
    Eyes: 'images/purpuraEmoji/Purpura_Eyes.svg',
    Fire: 'images/purpuraEmoji/Purpura_Fire.svg',
    Heart: 'images/purpuraEmoji/Purpura_Heart.svg',
    Pray: 'images/purpuraEmoji/Purpura_Pray.svg',
    Puzzle: 'images/purpuraEmoji/Purpura_Puzzle.svg',
    Skull: 'images/purpuraEmoji/Purpura_Skull.svg',
    Sparkles: 'images/purpuraEmoji/Purpura_Sparkles.svg',
    Speaker: 'images/purpuraEmoji/Purpura_Speaker.svg',
    Thinking: 'images/purpuraEmoji/Purpura_Thinking.svg',
    Thumbs_Down: 'images/purpuraEmoji/Purpura_Thumbs_Down.svg',
    Thumbs_Up: 'images/purpuraEmoji/Purpura_Thumbs_Up.svg',
    Weary: 'images/purpuraEmoji/Purpura_Weary.svg',
    Wilted_Rose: 'images/purpuraEmoji/Purpura_Wilted_Rose.svg',
    X_Mark: 'images/purpuraEmoji/Purpura_X_Mark.svg'
};

document.getElementById('closeBtn').addEventListener('click', function () {
    window.close();
});

(function () {
    var card = document.getElementById('changelogCard');
    if (!window.PURPURA_CHANGELOG || !PURPURA_CHANGELOG.length) return;
    var entry = PURPURA_CHANGELOG[0];
    card.innerHTML =
        '<h2>Purpura v' + escapeHtml(entry.version) + '</h2>' +
        '<div class="date">&#x1F4C5; ' + formatDate(entry.date) + '</div>' +
        '<div class="changes-body">' + parseMarkdown(entry.body) + '</div>';
})();

function parseMarkdown(md) {
    if (!md) return '';
    md = md.replace(/<:[^:]+:\d+>/g, '');
    md = md.replace(/<@&\d+>/g, '');
    var lines = md.split('\n');
    var html = '';
    var inList = false;
    var inSubList = false;
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var trimmed = line.trim();
        if (trimmed === '') {
            if (inSubList) { html += '</ul></li>'; inSubList = false; }
            if (inList) { html += '</ul>'; inList = false; }
            continue;
        }
        var leadingSpaces = line.length - line.replace(/^ +/, '').length;
        if (trimmed.indexOf('## ') === 0) {
            if (inSubList) { html += '</ul></li>'; inSubList = false; }
            if (inList) { html += '</ul>'; inList = false; }
            html += '<h3 class="changes-h2">' + formatLine(trimmed.slice(3)) + '</h3>';
        } else if (trimmed.indexOf('# ') === 0) {
            if (inSubList) { html += '</ul></li>'; inSubList = false; }
            if (inList) { html += '</ul>'; inList = false; }
            html += '<h3 class="changes-h1">' + formatLine(trimmed.slice(2)) + '</h3>';
        } else if (trimmed.indexOf('- ') === 0) {
            if (leadingSpaces >= 2 && inList) {
                if (!inSubList) { html += '<ul class="changes-sublist">'; inSubList = true; }
                html += '<li>' + formatLine(trimmed.slice(2)) + '</li>';
            } else {
                if (inSubList) { html += '</ul></li>'; inSubList = false; }
                if (!inList) { html += '<ul class="changes-list">'; inList = true; }
                html += '<li>' + formatLine(trimmed.slice(2)) + '</li>';
            }
        } else {
            if (inSubList) { html += '</ul></li>'; inSubList = false; }
            if (inList) { html += '</ul>'; inList = false; }
            html += '<p class="changes-p">' + formatLine(trimmed) + '</p>';
        }
    }
    if (inSubList) { html += '</ul></li>'; }
    if (inList) { html += '</ul>'; }
    return html;
}

function formatLine(text) {
    text = escapeHtml(text);
    text = replaceEmojis(text);
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = replaceLinks(text);
    return text;
}

function replaceLinks(text) {
    return text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (match, label, url) {
        if (!/^(https?:\/\/|mailto:|\/)/i.test(url)) return match;
        return '<a href="' + url.replace(/"/g, '&quot;') + '" target="_blank" rel="noopener noreferrer">' + label + '</a>';
    });
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

function formatDate(iso) {
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) return iso;
    return escapeHtml(months[d.getMonth()] + ' ' + d.getFullYear());
}

function replaceEmojis(text) {
    for (var name in PURPURA_EMOJIS) {
        if (PURPURA_EMOJIS.hasOwnProperty(name)) {
            var tag = ':Purpura_' + name + ':';
            var img = '<img src="' + chrome.runtime.getURL(PURPURA_EMOJIS[name]) + '" alt="' + tag + '" class="purpura-emoji">';
            text = text.split(tag).join(img);
        }
    }
    return text;
}
