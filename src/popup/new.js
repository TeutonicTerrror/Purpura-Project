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

var CHG_TAGS = [
    'Potentially Fixed', 'Sub-Toggle', 'Sub', 'Experimental', 'Optimized', 'Adjusted',
    'Reworked', 'Addition', 'Added', 'Fixed', 'Improved', 'Changed', 'Removed',
    'Renamed', 'Beta', 'New', 'Fix'
];

var CHG_TAG_RE = new RegExp(
    '^(' + CHG_TAGS.map(function (tag) {
        return tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }).join('|') + ')\\s*:\\s*',
    'i'
);

// Optional "(Firefox) " / "(Chrome) " prefix: shown as a pill, hidden on the other browser.
var CHG_BROWSER_RE = /^\((Firefox|Chrome)\)\s*/i;
var CHG_BROWSER = location.protocol === 'moz-extension:' ? 'firefox' : 'chrome';

document.getElementById('closeBtn').addEventListener('click', function () {
    window.close();
});

(function () {
    var card = document.getElementById('changelogCard');
    if (!card || !window.PURPURA_CHANGELOG || !PURPURA_CHANGELOG.length) return;
    var entry = PURPURA_CHANGELOG[0];

    var html =
        '<div class="card release">' +
        '<div>' +
        '<div class="release-title">Purpura v' + escapeHtml(entry.version) + '</div>' +
        '<p class="release-date">' + formatDate(entry.date) + '</p>' +
        '</div>' +
        '<span class="chg-pill">Latest</span>' +
        '</div>';

    splitSections(entry.body).forEach(function (section) {
        var icon = emojiUrl(section.tag);

        html += '<section class="card chg-section">';
        if (section.title) {
            html += '<div class="chg-head">' +
                (icon ? '<span class="chg-icon"><img src="' + icon + '" alt="" aria-hidden="true"></span>' : '') +
                '<h3 class="chg-title">' + escapeHtml(section.title) + '</h3>' +
                '<button class="chg-toggle" type="button" aria-expanded="true" aria-label="Collapse section">' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>' +
                '</button>' +
                '</div>';
        }
        html += '<div class="chg-body">' + renderSectionBody(section.lines) + '</div></section>';
    });

    card.innerHTML = html;
    bindSectionToggles(card);
})();

setupAccessibility();

function bindSectionToggles(card) {
    card.querySelectorAll('.chg-section').forEach(function (section) {
        var head = section.querySelector('.chg-head');
        var toggle = section.querySelector('.chg-toggle');
        var body = section.querySelector('.chg-body');
        if (!head || !toggle || !body) return;

        function setCollapsed(collapsed) {
            section.classList.toggle('is-collapsed', collapsed);
            body.hidden = collapsed;
            toggle.setAttribute('aria-expanded', String(!collapsed));
            toggle.setAttribute('aria-label', collapsed ? 'Expand section' : 'Collapse section');
        }

        head.addEventListener('click', function () {
            setCollapsed(!section.classList.contains('is-collapsed'));
        });
    });
}

function splitSections(md) {
    var lines = String(md || '').split('\n');
    var sections = [];
    var current = { title: '', tag: '', lines: [] };

    for (var i = 0; i < lines.length; i++) {
        var heading = /^##?\s+(.*)$/.exec(lines[i].trim());
        if (!heading) {
            current.lines.push(lines[i]);
            continue;
        }
        if (current.title || current.lines.join('').trim()) sections.push(current);
        var tag = emojiTag(heading[1]);
        current = {
            title: tag ? heading[1].split(tag).join('').trim() : heading[1].trim(),
            tag: tag,
            lines: []
        };
    }

    if (current.title || current.lines.join('').trim()) sections.push(current);
    return sections;
}

function splitBlocks(lines) {
    var blocks = [];
    var current = null;

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var trimmed = line.trim();
        if (!trimmed) {
            current = null;
            continue;
        }

        var bullet = /^(\s*)-\s+(.*)$/.exec(line);
        if (bullet) {
            if (!current || current.type !== 'list') {
                current = { type: 'list', entries: [], stack: [] };
                blocks.push(current);
            }
            pushEntry(current, bullet[1].length, bullet[2]);
            continue;
        }

        if (!current || current.type !== 'text') {
            current = { type: 'text', lines: [] };
            blocks.push(current);
        }
        current.lines.push(trimmed);
    }

    return blocks;
}

function pushEntry(block, indent, text) {
    while (block.stack.length && indent <= block.stack[block.stack.length - 1].indent) {
        block.stack.pop();
    }

    var entry = { text: text, children: [] };
    var parent = block.stack.length ? block.stack[block.stack.length - 1].entry : null;
    if (parent) parent.children.push(entry);
    else block.entries.push(entry);

    block.stack.push({ indent: indent, entry: entry });
}

function renderSectionBody(lines) {
    return splitBlocks(lines).map(function (block) {
        if (block.type === 'text') {
            return block.lines.map(function (line) {
                return '<p class="changes-p">' + formatLine(line) + '</p>';
            }).join('');
        }
        return renderEntries(block.entries, 0);
    }).join('');
}

function renderEntries(entries, depth) {
    return entries.filter(function (entry) {
        var browser = CHG_BROWSER_RE.exec(entry.text);
        return !browser || browser[1].toLowerCase() === CHG_BROWSER;
    }).map(function (entry) {
        var html = '<div class="' + (depth === 0 ? 'chg-item' : 'chg-node') + '">' +
            '<p class="' + (depth === 0 ? 'chg-text' : 'chg-sub') + '">' +
            formatItemText(entry.text) + '</p>';

        if (entry.children.length) {
            html += '<div class="chg-subs">' + renderEntries(entry.children, depth + 1) + '</div>';
        }

        return html + '</div>';
    }).join('');
}

function formatItemText(raw) {
    var browser = CHG_BROWSER_RE.exec(raw);
    var browserPill = '';
    if (browser) {
        var name = browser[1].toLowerCase();
        var label = name === 'firefox' ? 'Firefox' : 'Chrome';
        browserPill = '<span class="chg-browser" data-browser="' + name + '">' +
            '<img src="' + chrome.runtime.getURL('images/browsers/' + name + '.svg') + '" alt="" aria-hidden="true">' +
            label + '</span>';
        raw = raw.slice(browser[0].length);
    }

    var match = CHG_TAG_RE.exec(raw);
    var tag = '';
    var text = raw;
    if (match) {
        tag = match[1];
        text = raw.slice(match[0].length);
    }

    var kind = tagKind(tag);
    return browserPill + (tag
        ? '<span class="chg-tag"' + (kind ? ' data-kind="' + kind + '"' : '') + '>' + escapeHtml(tag) + '</span>'
        : '') + formatLine(text);
}

function tagKind(tag) {
    var kinds = {
        'new': 'new',
        'addition': 'addition',
        'added': 'addition',
        'reworked': 'reworked',
        'optimized': 'optimized',
        'improved': 'improved',
        'adjusted': 'adjusted',
        'changed': 'adjusted',
        'fix': 'fix',
        'fixed': 'fix',
        'potentially fixed': 'potential',
        'removed': 'removed',
        'renamed': 'renamed',
        'sub-toggle': 'toggle',
        'sub': 'toggle',
        'beta': 'beta',
        'experimental': 'experimental'
    };
    return kinds[String(tag || '').toLowerCase()] || '';
}

var A11Y_STORAGE_KEY = 'purpura_changelog_a11y';

function setupAccessibility() {
    var button = document.getElementById('a11yBtn');
    var panel = document.getElementById('a11yPanel');
    if (!button || !panel) return;

    var state = loadA11yState();

    panel.querySelectorAll('input[data-a11y]').forEach(function (input) {
        var key = input.getAttribute('data-a11y');
        input.checked = !!state[key];
        input.addEventListener('change', function () {
            state[key] = input.checked;
            applyA11yState(state);
            saveA11yState(state);
        });
    });

    applyA11yState(state);

    function setOpen(open) {
        panel.hidden = !open;
        button.setAttribute('aria-expanded', String(open));
    }

    button.addEventListener('click', function (event) {
        event.stopPropagation();
        setOpen(panel.hidden);
    });
    panel.addEventListener('click', function (event) { event.stopPropagation(); });
    document.addEventListener('click', function () {
        if (!panel.hidden) setOpen(false);
    });
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && !panel.hidden) setOpen(false);
    });
}

function loadA11yState() {
    try {
        return JSON.parse(localStorage.getItem(A11Y_STORAGE_KEY)) || {};
    } catch (error) {
        return {};
    }
}

function saveA11yState(state) {
    try {
        localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(state));
    } catch (error) { }
}

function applyA11yState(state) {
    var root = document.documentElement;
    root.classList.toggle('a11y-dyslexia', !!state.dyslexia);
    root.classList.toggle('a11y-large', !!state.large);
    root.classList.toggle('a11y-contrast', !!state.contrast);
    if (state.colorblind) root.setAttribute('data-a11y-colorblind', 'on');
    else root.removeAttribute('data-a11y-colorblind');
}

function emojiTag(text) {
    var match = String(text || '').match(/:Purpura_[A-Za-z_]+:/);
    return match ? match[0] : '';
}

function emojiUrl(tag) {
    var match = /^:Purpura_(.+):$/.exec(tag || '');
    var path = match ? PURPURA_EMOJIS[match[1]] : null;
    return path ? chrome.runtime.getURL(path) : '';
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
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
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
