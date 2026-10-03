/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
if (window.purpuraChatEligibilityInitialized) return;
window.purpuraChatEligibilityInitialized = true;

(function() {
    var style = document.createElement('style');
    style.textContent = ':root{--purpura-ce-tooltip-bg:#1a1b1f;--purpura-ce-tooltip-text:#e0e0e0;--purpura-ce-tooltip-border:rgba(255,255,255,0.08);--purpura-ce-tooltip-shadow:rgba(0,0,0,0.35);--purpura-ce-canchat-bg:#1a2a1a;--purpura-ce-canchat-border:rgba(57,203,121,0.3);--purpura-ce-canchat-text:#a0e8b8;--purpura-ce-cannot-bg:#2a1a1a;--purpura-ce-cannot-border:rgba(239,83,80,0.3);--purpura-ce-cannot-text:#f0a0a0;--purpura-ce-agecheck-bg:#2a2410;--purpura-ce-agecheck-border:rgba(245,158,11,0.3);--purpura-ce-agecheck-text:#f0c860}';
    document.head.appendChild(style);
})();

var SETTING_KEY = 'ce';
var enabled = true;

var TOOLTIP_DELAY = 300;
var tooltipEl = null;
var tooltipTimeout = null;
var scrollHandler = null;

var CONVERSATIONS_URL = 'https://apis.roblox.com/platform-chat-api/v1/get-user-conversations?include_cards=true&include_user_data=true&include_messages=true&check_for_group_up=true';
var MAX_CONVERSATION_PAGES = 5;
var RESTRICTED_PHRASES = [
    "other users can't see messages in this chat",
    'due to new chat rules'
];
var AGE_CHECK_PHRASES = [
    'needs to complete an age check',
    'one or more users need to complete an age check to see your messages',
    'has not completed an age check'
];

var chatStatus = null;
var chatStatusPromise = null;
var chatStatusUserId = null;
var hoveredElement = null;

function createTooltip() {
    if (tooltipEl) return;
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'purpura-chat-eligibility-tooltip';
    tooltipEl.style.cssText = [
        'position:fixed;z-index:100000;padding:8px 14px;border-radius:8px;',
        'font-size:13px;font-weight:500;line-height:1.3;white-space:nowrap;',
        'pointer-events:none;opacity:0;transition:opacity 0.15s;',
        'font-family:"DM Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
        'box-shadow:0 4px 16px var(--purpura-ce-tooltip-shadow);',
        'background:var(--purpura-ce-tooltip-bg);color:var(--purpura-ce-tooltip-text);border:1px solid var(--purpura-ce-tooltip-border);'
    ].join('');
    document.body.appendChild(tooltipEl);
}

function showTooltip(target, text, type) {
    createTooltip();
    if (!tooltipEl) return;

    var colors = {
        canChat: { bg: 'var(--purpura-ce-canchat-bg)', border: 'var(--purpura-ce-canchat-border)', text: 'var(--purpura-ce-canchat-text)' },
        cannotChat: { bg: 'var(--purpura-ce-cannot-bg)', border: 'var(--purpura-ce-cannot-border)', text: 'var(--purpura-ce-cannot-text)' },
        ageCheck: { bg: 'var(--purpura-ce-agecheck-bg)', border: 'var(--purpura-ce-agecheck-border)', text: 'var(--purpura-ce-agecheck-text)' }
    };
    var c = colors[type] || colors.cannotChat;
    tooltipEl.textContent = text;
    tooltipEl.style.background = c.bg;
    tooltipEl.style.borderColor = c.border;
    tooltipEl.style.color = c.text;
    tooltipEl.style.opacity = '1';

    positionTooltip(target);

    if (!scrollHandler) {
        scrollHandler = positionTooltip.bind(null, target);
        window.addEventListener('scroll', scrollHandler, { passive: true });
    }
}

function hideTooltip() {
    if (tooltipTimeout) { clearTimeout(tooltipTimeout); tooltipTimeout = null; }
    if (tooltipEl) tooltipEl.style.opacity = '0';
    if (scrollHandler) {
        window.removeEventListener('scroll', scrollHandler);
        scrollHandler = null;
    }
}

function positionTooltip(target) {
    if (!tooltipEl) return;
    var rect = target.getBoundingClientRect();
    var top = rect.top - tooltipEl.offsetHeight - 6;
    var left = rect.left + (rect.width / 2) - (tooltipEl.offsetWidth / 2);

    if (top < 8) top = rect.bottom + 6;
    if (left < 8) left = 8;
    if (left + tooltipEl.offsetWidth > window.innerWidth - 8) {
        left = window.innerWidth - tooltipEl.offsetWidth - 8;
    }

    tooltipEl.style.top = top + 'px';
    tooltipEl.style.left = left + 'px';
}

function getUserIdFromProfile() {
    var match = window.location.pathname.match(/\/users\/(\d+)/);
    return match ? match[1] : null;
}

function findChatElements() {
    var elements = [];
    var section = document.querySelector('.profile-header-overlay');
    if (!section) return elements;

    var buttons = section.querySelectorAll('button, a, [role="button"]');
    for (var i = 0; i < buttons.length; i++) {
        var el = buttons[i];
        var identity = [
            el.id,
            el.getAttribute('name') || '',
            el.getAttribute('href') || '',
            el.getAttribute('aria-label') || '',
            el.getAttribute('data-testid') || '',
            el.getAttribute('title') || '',
            el.textContent || ''
        ].join(' ').toLowerCase();
        if (/\bchat\b/.test(identity)) {
            elements.push(el);
        }
    }
    return elements;
}

function matchesAny(text, phrases) {
    for (var i = 0; i < phrases.length; i++) {
        if (text.indexOf(phrases[i]) !== -1) return true;
    }
    return false;
}

function requestConversations(url) {
    return new Promise(function(resolve) {
        try {
            chrome.runtime.sendMessage({
                type: 'PURPURA_FETCH_RESOURCE_REQUEST',
                url: url,
                method: 'GET',
                body: '',
                accept: 'application/json, text/plain;q=0.9, */*;q=0.8'
            }, function(response) {
                if (chrome.runtime.lastError || !response || !response.ok) {
                    resolve(null);
                    return;
                }
                try {
                    resolve(JSON.parse(response.text || '{}'));
                } catch (e) {
                    resolve(null);
                }
            });
        } catch (e) {
            resolve(null);
        }
    });
}

function analyzeConversations(conversations, targetUserId) {
    if (!Array.isArray(conversations)) return null;

    var status = null;

    for (var i = 0; i < conversations.length; i++) {
        var conversation = conversations[i];
        if (!conversation || !Array.isArray(conversation.participant_user_ids)) continue;
        if (conversation.participant_user_ids.map(Number).indexOf(Number(targetUserId)) === -1) continue;

        var canChat = true;
        var hasAgeChecked = true;
        var messages = Array.isArray(conversation.messages) ? conversation.messages : [];

        for (var j = 0; j < messages.length; j++) {
            var message = messages[j];
            var content = (message && typeof message.content === 'string' ? message.content : '').toLowerCase();
            if (!content) continue;
            if (matchesAny(content, RESTRICTED_PHRASES)) canChat = false;
            if (matchesAny(content, AGE_CHECK_PHRASES)) hasAgeChecked = false;
        }

        if (status) {
            status.canChat = status.canChat && canChat;
            status.hasAgeChecked = status.hasAgeChecked && hasAgeChecked;
        } else {
            status = { canChat: canChat, hasAgeChecked: hasAgeChecked };
        }
    }

    return status;
}

function loadChatStatus(userId) {
    if (chatStatusPromise && String(chatStatusUserId) === String(userId)) return chatStatusPromise;

    chatStatusUserId = userId;
    chatStatus = null;
    chatStatusPromise = (async function() {
        var cursor = null;
        var gotData = false;

        for (var page = 0; page < MAX_CONVERSATION_PAGES; page++) {
            var url = CONVERSATIONS_URL + (cursor ? '&cursor=' + encodeURIComponent(cursor) : '');
            var data = await requestConversations(url);
            if (!data || !Array.isArray(data.conversations)) break;
            gotData = true;

            var pageStatus = analyzeConversations(data.conversations, userId);
            if (pageStatus) {
                chatStatus = pageStatus;
                return pageStatus;
            }

            if (!data.next_cursor) break;
            cursor = data.next_cursor;
        }

        chatStatus = null;
        if (!gotData) chatStatusPromise = null;
        return null;
    })();

    return chatStatusPromise;
}

function describeChatStatus(status) {
    if (!status) return null;
    if (status.hasAgeChecked === false) return { type: 'ageCheck', text: 'Age verification required to chat' };
    if (status.canChat === false) return { type: 'cannotChat', text: 'Cannot chat -- restricted by chat rules' };
    if (status.canChat === true) return { type: 'canChat', text: 'You can chat with this user' };
    return null;
}

function attachTooltips(elements) {
    for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        if (el.dataset.purpuraChatTooltip === '1') continue;
        el.dataset.purpuraChatTooltip = '1';

        el.addEventListener('mouseenter', function(elem) {
            return function() {
                var userId = getUserIdFromProfile();
                if (!userId) return;

                hoveredElement = elem;
                var pending = chatStatus ? Promise.resolve(chatStatus) : loadChatStatus(userId);

                pending.then(function(status) {
                    if (hoveredElement !== elem) return;
                    var result = describeChatStatus(status);
                    if (!result) return;

                    if (tooltipTimeout) clearTimeout(tooltipTimeout);
                    tooltipTimeout = setTimeout(function() {
                        if (hoveredElement !== elem) return;
                        showTooltip(elem, result.text, result.type);
                    }, TOOLTIP_DELAY);
                }).catch(function() {});
            };
        }(el));

        el.addEventListener('mouseleave', function() {
            hoveredElement = null;
            hideTooltip();
        });

        el.addEventListener('click', function() {
            hoveredElement = null;
            hideTooltip();
        });
    }
}

function resetChatStatus() {
    chatStatus = null;
    chatStatusPromise = null;
    chatStatusUserId = null;
}

function processProfile() {
    if (!enabled) return;

    var userId = getUserIdFromProfile();
    if (userId) loadChatStatus(userId).catch(function() {});

    var chatEls = findChatElements();
    if (chatEls.length) {
        attachTooltips(chatEls);
    }
}

var observer = null;
var lastUrl = location.href;

function startObserver() {
    if (observer) observer.disconnect();
    observer = new MutationObserver(function() {
        processProfile();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    processProfile();
}

function stopObserver() {
    if (observer) { observer.disconnect(); observer = null; }
}

function applyEnabledState() {
    if (enabled) {
        startObserver();
    } else {
        stopObserver();
        hideTooltip();
        if (tooltipEl && tooltipEl.parentNode) tooltipEl.remove();
        tooltipEl = null;
    }
}

window.__PurpuraSettings.ready.then(function() {
    enabled = window.__PurpuraSettings.get(SETTING_KEY) !== false;
    if (/\/users\/\d+/.test(window.location.pathname)) {
        applyEnabledState();
    }
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync' && changes[SETTING_KEY]) {
        enabled = changes[SETTING_KEY].newValue !== false;
        applyEnabledState();
    }
});

new MutationObserver(function() {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        stopObserver();
        hideTooltip();
        hoveredElement = null;
        resetChatStatus();
        if (/\/users\/\d+/.test(window.location.pathname)) {
            applyEnabledState();
        } else {
            if (tooltipEl && tooltipEl.parentNode) tooltipEl.remove();
            tooltipEl = null;
        }
    }
}).observe(document, { childList: true, subtree: true });
})();
