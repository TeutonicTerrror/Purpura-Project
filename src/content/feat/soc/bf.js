/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
if (window.purpuraBulkUnfriendInitialized) return;
window.purpuraBulkUnfriendInitialized = true;

var SETTING_KEY = 'bf';
var enabled = true;
var bulkMode = false;
var selectedFriends = [];

(function() {
    var style = document.createElement('style');
    style.textContent = ':root{--purpura-bf-chip-bg:#2a2a2e;--purpura-bf-chip-text:#e0e0e0;--purpura-bf-danger:#c0392b;--purpura-bf-danger-hover:#e74c3c;--purpura-bf-danger-light:#d32f2f;--purpura-bf-overlay:rgba(0,0,0,0.6);--purpura-bf-overlay-heavy:rgba(0,0,0,0.7);--purpura-bf-modal-bg:#1e1e24;--purpura-bf-modal-shadow:rgba(0,0,0,0.4);--purpura-bf-border:rgba(255,255,255,0.06);--purpura-bf-border-light:rgba(255,255,255,0.04);--purpura-bf-text-emphasis:#f0f0f0;--purpura-bf-text-muted:#8a8a90;--purpura-bf-text-primary:#ddd;--purpura-bf-btn-cancel-bg:rgba(255,255,255,0.06);--purpura-bf-btn-cancel-hover:rgba(255,255,255,0.1);--purpura-bf-progress-track:rgba(74,77,85,0.5);--purpura-bf-focus-ring:#fff;--purpura-bf-white:#fff;--purpura-bf-surface:rgba(39,41,48,1)}.purpura-unfriend-radio{width:24px;height:24px;border:none;background:none;cursor:pointer;padding:0;margin:0;outline:none;display:flex;align-items:center;justify-content:center}.purpura-unfriend-radio .icon-radio-check-circle,.purpura-unfriend-radio .icon-radio-check-circle-filled{font-size:24px;line-height:1}.purpura-bulk-toggle:hover{filter:brightness(1.2)}.purpura-bulk-toggle:active{filter:brightness(0.9)}.purpura-bulk-toggle:focus-visible{outline:2px solid var(--purpura-bf-focus-ring);outline-offset:2px}.purpura-unfriend-action-btn:hover{filter:brightness(1.1)}.purpura-unfriend-action-btn:active{filter:brightness(0.85)}.purpura-unfriend-action-btn:focus-visible{outline:2px solid var(--purpura-bf-focus-ring);outline-offset:2px}';
    document.head.appendChild(style);
})();

function getPageCsrfToken() {
    var meta = document.querySelector('meta[name="csrf-token"]');
    if (meta) return meta.getAttribute('content');
    if (window.Roblox && window.Roblox.XsrfToken) {
        try { var t = window.Roblox.XsrfToken.getToken(); if (t) return t; } catch(e) {}
    }
    var match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
    return '';
}

var headerObserver = null;
var headerTimer = null;

var bulkToggleButton = null;
var unfriendActionButton = null;

function injectToggleButton() {
    if (document.querySelector('.purpura-bulk-toggle')) return;

    var chipContainer = document.querySelector('.chip-filters-container');
    if (!chipContainer) return;

    var btn = document.createElement('button');
    btn.className = 'purpura-bulk-toggle';
    btn.textContent = bulkMode ? 'Exit Bulk Mode' : 'Bulk Unfriend';
    btn.style.cssText = 'border:none;border-radius:32px;padding:6px 16px;font-size:14px;font-weight:500;cursor:pointer;background:var(--purpura-bf-chip-bg);color:var(--purpura-bf-chip-text);transition:background 0.15s;line-height:1.4;';
    btn.addEventListener('click', function() {
        toggleBulkMode();
    });
    bulkToggleButton = btn;

    var actionBtn = document.createElement('button');
    actionBtn.className = 'purpura-unfriend-action-btn';
    actionBtn.style.cssText = 'display:none;border:none;border-radius:32px;padding:6px 16px;font-size:14px;font-weight:500;cursor:pointer;background:var(--purpura-bf-danger);color:var(--purpura-bf-white);line-height:1.4;';
    actionBtn.textContent = 'Unfriend';
    actionBtn.addEventListener('click', function() {
        showConfirmation();
    });
    unfriendActionButton = actionBtn;

    var wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;align-items:center;gap:8px;margin-top:12px;';
    wrapper.appendChild(btn);
    wrapper.appendChild(actionBtn);

    chipContainer.insertAdjacentElement('afterend', wrapper);

    updateUnfriendButton();
}

function startHeaderObserver() {
    if (headerObserver) return;
    headerObserver = new MutationObserver(function() {
        if (!enabled) return;
        if (!headerTimer) {
            headerTimer = setTimeout(function() {
                headerTimer = null;
                injectToggleButton();
                if (bulkMode) updateCardCheckboxes();
            }, 200);
        }
    });
    headerObserver.observe(document.body, { childList: true, subtree: true });
}

function stopHeaderObserver() {
    if (headerObserver) { headerObserver.disconnect(); headerObserver = null; }
    clearTimeout(headerTimer);
    headerTimer = null;
}

function toggleBulkMode() {
    bulkMode = !bulkMode;
    selectedFriends = [];
    if (bulkToggleButton) {
        bulkToggleButton.textContent = bulkMode ? 'Exit Bulk Mode' : 'Bulk Unfriend';
    }
    updateCardCheckboxes();
    updateUnfriendButton();
}

function enterBulkCardMode() {
    var cards = document.querySelectorAll('.avatar-card-caption');
    for (var i = 0; i < cards.length; i++) {
        var caption = cards[i];
        var card = caption.closest('.avatar-card, li.list-item');
        if (!card) continue;

        var link = caption.querySelector('a.avatar-name, a[href*="/users/"]');
        var friendId = link ? (link.href.match(/\/users\/(\d+)/) || [])[1] : null;
        if (!friendId) continue;

        var radio = card.querySelector('.purpura-unfriend-radio');

        var innerElements = card.querySelectorAll('a, button, svg, span, img');
        for (var j = 0; j < innerElements.length; j++) {
            if (!innerElements[j].classList.contains('purpura-unfriend-radio') &&
                !innerElements[j].closest('.purpura-unfriend-radio')) {
                innerElements[j].style.pointerEvents = 'none';
            }
        }
        card.style.pointerEvents = 'auto';
        card.style.cursor = 'pointer';

        if (!card._purpuraClickHandler) {
            (function(cardEl) {
                card._purpuraClickHandler = function(e) {
                    var radio2 = cardEl.querySelector('.purpura-unfriend-radio');
                    if (radio2 && !e.target.closest('.purpura-unfriend-radio')) {
                        radio2.click();
                    }
                };
            })(card);
            card.addEventListener('click', card._purpuraClickHandler);
        }
    }
}

function exitBulkCardMode() {
    var cards = document.querySelectorAll('.avatar-card-caption');
    for (var i = 0; i < cards.length; i++) {
        var caption = cards[i];
        var card = caption.closest('.avatar-card, li.list-item');
        if (!card) continue;

        card.style.pointerEvents = '';
        card.style.cursor = '';
        var innerElements = card.querySelectorAll('a, button, svg, span, img');
        for (var j2 = 0; j2 < innerElements.length; j2++) {
            innerElements[j2].style.pointerEvents = '';
        }
        if (card._purpuraClickHandler) {
            card.removeEventListener('click', card._purpuraClickHandler);
            delete card._purpuraClickHandler;
        }
    }
}

function updateCardCheckboxes() {
    var allRadios = document.querySelectorAll('.purpura-unfriend-radio');
    for (var r = 0; r < allRadios.length; r++) {
        allRadios[r].remove();
    }

    var cards = document.querySelectorAll('.avatar-card-caption');
    for (var i = 0; i < cards.length; i++) {
        var caption = cards[i];
        if (!bulkMode) continue;

        var link = caption.querySelector('a.avatar-name, a[href*="/users/"]');
        var friendId = link ? (link.href.match(/\/users\/(\d+)/) || [])[1] : null;
        if (!friendId) continue;

        var isChecked = false;
        for (var j = 0; j < selectedFriends.length; j++) {
            if (selectedFriends[j].id === friendId) { isChecked = true; break; }
        }

        var radio = document.createElement('button');
        radio.type = 'button';
        radio.className = 'purpura-unfriend-radio';
        radio.setAttribute('role', 'checkbox');
        radio.setAttribute('aria-checked', String(isChecked));
        radio.style.cssText = 'position:absolute;top:8px;left:8px;z-index:999;pointer-events:auto;';
        var iconSpan = document.createElement('span');
        iconSpan.className = isChecked ? 'icon-radio-check-circle-filled' : 'icon-radio-check-circle';
        iconSpan.style.pointerEvents = 'none';
        radio.appendChild(iconSpan);

        radio.dataset.friendId = friendId;
        radio.dataset.friendName = link.textContent.trim();
        radio.addEventListener('click', function(e) {
            e.stopPropagation();
            var checked = this.getAttribute('aria-checked') === 'true';
            var newChecked = !checked;
            this.setAttribute('aria-checked', String(newChecked));
            var icon = this.querySelector('span');
            if (icon) icon.className = newChecked ? 'icon-radio-check-circle-filled' : 'icon-radio-check-circle';
            var id = this.dataset.friendId;
            var name = this.dataset.friendName;
            if (newChecked) {
                var exists = false;
                for (var j = 0; j < selectedFriends.length; j++) {
                    if (selectedFriends[j].id === id) { exists = true; break; }
                }
                if (!exists) selectedFriends.push({ id: id, name: name });
            } else {
                var filtered = [];
                for (var k = 0; k < selectedFriends.length; k++) {
                    if (selectedFriends[k].id !== id) filtered.push(selectedFriends[k]);
                }
                selectedFriends = filtered;
            }
            updateUnfriendButton();
        });

        var cardNode = caption.closest('.avatar-card, li.list-item') || caption.parentNode;
        cardNode.style.position = 'relative';
        cardNode.appendChild(radio);
    }
    if (bulkMode) {
        enterBulkCardMode();
    } else {
        exitBulkCardMode();
    }
}

function updateUnfriendButton() {
    if (!unfriendActionButton) return;

    if (bulkMode && selectedFriends.length > 0) {
        unfriendActionButton.style.display = '';
        unfriendActionButton.textContent = 'Unfriend (' + selectedFriends.length + ')';
    } else {
        unfriendActionButton.style.display = 'none';
    }
}

function showConfirmation() {
    var overlay = document.createElement('div');
    overlay.className = 'purpura-confirm-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:var(--purpura-bf-overlay);z-index:99999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);';

    var modal = document.createElement('div');
    modal.style.cssText = 'background:var(--purpura-bf-modal-bg);border-radius:16px;box-shadow:0 8px 40px var(--purpura-bf-modal-shadow);max-width:440px;width:90%;max-height:80vh;overflow:hidden;display:flex;flex-direction:column;';

    var header = document.createElement('div');
    header.style.cssText = 'padding:20px 24px 16px;border-bottom:1px solid var(--purpura-bf-border);';
    var title = document.createElement('h2');
    title.textContent = 'Unfriend ' + selectedFriends.length + ' user' + (selectedFriends.length > 1 ? 's' : '') + '?';
    title.style.cssText = 'color:var(--purpura-bf-text-emphasis);font-size:17px;font-weight:600;margin:0;line-height:1.3;';
    var subtitle = document.createElement('div');
    subtitle.textContent = 'This cannot be undone. You can always re-add them later.';
    subtitle.style.cssText = 'color:var(--purpura-bf-text-muted);font-size:13px;margin-top:6px;';
    header.appendChild(title);
    header.appendChild(subtitle);
    modal.appendChild(header);

    var list = document.createElement('div');
    list.style.cssText = 'max-height:260px;overflow-y:auto;padding:8px 24px;';
    selectedFriends.forEach(function(friend) {
        var item = document.createElement('div');
        item.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--purpura-bf-border-light);';

        var nameSpan = document.createElement('span');
        nameSpan.textContent = friend.name;
        nameSpan.style.cssText = 'color:var(--purpura-bf-text-primary);font-size:14px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;';
        item.appendChild(nameSpan);

        var removeBtn = document.createElement('button');
        removeBtn.textContent = '\u2715';
        removeBtn.style.cssText = 'background:none;border:none;color:var(--purpura-bf-text-muted);cursor:pointer;font-size:15px;padding:4px 8px;border-radius:6px;transition:all 0.15s;line-height:1;margin-left:8px;flex-shrink:0;';
        removeBtn.addEventListener('mouseenter', function() { this.style.background = 'var(--purpura-bf-btn-cancel-bg)'; this.style.color = 'var(--purpura-bf-danger-hover)'; });
        removeBtn.addEventListener('mouseleave', function() { this.style.background = 'none'; this.style.color = 'var(--purpura-bf-text-muted)'; });
        removeBtn.addEventListener('click', function() {
            selectedFriends = selectedFriends.filter(function(f) { return f.id !== friend.id; });
            var radioBtn = document.querySelector('.purpura-unfriend-radio[data-friend-id="' + friend.id + '"]');
            if (radioBtn) { radioBtn.setAttribute('aria-checked', 'false'); var ic = radioBtn.querySelector('span'); if (ic) ic.className = 'icon-radio-check-circle'; }
            overlay.remove();
            if (selectedFriends.length > 0) showConfirmation();
            updateUnfriendButton();
        });
        item.appendChild(removeBtn);
        list.appendChild(item);
    });
    modal.appendChild(list);

    var footer = document.createElement('div');
    footer.style.cssText = 'padding:16px 24px;border-top:1px solid var(--purpura-bf-border);display:flex;gap:10px;justify-content:flex-end;';

    var cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = 'border:none;border-radius:8px;padding:8px 20px;font-size:14px;font-weight:500;cursor:pointer;background:var(--purpura-bf-btn-cancel-bg);color:var(--purpura-bf-text-primary);transition:background 0.15s;line-height:1.4;';
    cancelBtn.addEventListener('mouseenter', function() { this.style.background = 'var(--purpura-bf-btn-cancel-hover)'; });
    cancelBtn.addEventListener('mouseleave', function() { this.style.background = 'var(--purpura-bf-btn-cancel-bg)'; });
    cancelBtn.addEventListener('click', function() { overlay.remove(); });
    footer.appendChild(cancelBtn);

    var confirmBtn = document.createElement('button');
    var confirmLabel = selectedFriends.length === 1 ? 'Unfriend ' + selectedFriends[0].name : 'Unfriend ' + selectedFriends.length + ' users';
    confirmBtn.textContent = confirmLabel;
    confirmBtn.style.cssText = 'border:none;border-radius:8px;padding:8px 20px;font-size:14px;font-weight:600;cursor:pointer;background:var(--purpura-bf-danger);color:var(--purpura-bf-white);transition:background 0.15s;line-height:1.4;';
    confirmBtn.addEventListener('mouseenter', function() { this.style.background = 'var(--purpura-bf-danger-hover)'; });
    confirmBtn.addEventListener('mouseleave', function() { this.style.background = 'var(--purpura-bf-danger)'; });
    confirmBtn.addEventListener('click', function() {
        overlay.remove();
        executeUnfriend();
    });
    footer.appendChild(confirmBtn);

    modal.appendChild(footer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

function executeUnfriend() {
    var total = selectedFriends.length;
    var completed = 0;

    var progressOverlay = document.createElement('div');
    progressOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:var(--purpura-bf-overlay-heavy);z-index:99999;display:flex;align-items:center;justify-content:center;';

    var progressBox = document.createElement('div');
    progressBox.style.cssText = 'background:var(--purpura-bf-surface);border-radius:12px;padding:24px;text-align:center;max-width:400px;width:90%;';

    var progressText = document.createElement('div');
    progressText.style.cssText = 'color:var(--purpura-bf-text-emphasis);font-size:16px;margin-bottom:12px;';
    progressText.textContent = 'Unfriending...';
    progressBox.appendChild(progressText);

    var progressBar = document.createElement('div');
    progressBar.style.cssText = 'width:100%;height:8px;background:var(--purpura-bf-progress-track);border-radius:4px;overflow:hidden;';
    var progressFill = document.createElement('div');
    progressFill.style.cssText = 'width:0%;height:100%;background:var(--purpura-bf-danger-light);border-radius:4px;transition:width 0.3s;';
    progressBar.appendChild(progressFill);
    progressBox.appendChild(progressBar);

    progressOverlay.appendChild(progressBox);
    document.body.appendChild(progressOverlay);

    var retryMap = {};
    function processNext(index, retryId) {
        if (index >= selectedFriends.length) {
            progressText.textContent = 'Done! Refreshing...';
            progressFill.style.width = '100%';
            setTimeout(function() { location.reload(); }, 2000);
            return;
        }

        var friend = selectedFriends[index];
        progressText.textContent = 'Unfriending ' + friend.name + ' (' + (index + 1) + '/' + total + ')';
        progressFill.style.width = ((index + 1) / total * 100) + '%';

        chrome.runtime.sendMessage({
            action: 'unfriendUser',
            userId: friend.id,
            csrfToken: getPageCsrfToken()
        }, function(response) {
            var ok = response && (response.ok || (response.status >= 200 && response.status < 300));
            if (!ok) {
                var retryCount = retryMap[friend.id] || 0;
                if (retryCount < 2) {
                    retryMap[friend.id] = retryCount + 1;
                    progressText.textContent = 'Retrying ' + friend.name + '... (attempt ' + (retryCount + 1) + '/' + 2 + ')';
                    setTimeout(function() {
                        processNext(index, friend.id);
                    }, 1000 * (retryCount + 1));
                    return;
                }
            }
            setTimeout(function() {
                processNext(index + 1);
            }, 400);
        });
    }

    processNext(0);
}

function startObserver() {
    var container = document.querySelector('.avatar-cards, .friends-list, [data-testid="friends-list"]');
    if (container) {
        var obs = new MutationObserver(function(mutations) {
            if (!bulkMode) return;
            for (var i = 0; i < mutations.length; i++) {
                var m = mutations[i];
                var t = m.target;
                if (t.classList && t.classList.contains('purpura-unfriend-radio')) return;
                if (t.closest && t.closest('.purpura-unfriend-radio')) return;
                for (var j = 0; j < m.addedNodes.length; j++) {
                    var n = m.addedNodes[j];
                    if (n.nodeType !== 1) continue;
                    if (n.classList && n.classList.contains('purpura-unfriend-radio')) return;
                    if (n.querySelector && n.querySelector('.purpura-unfriend-radio')) return;
                }
                for (var k = 0; k < m.removedNodes.length; k++) {
                    var n2 = m.removedNodes[k];
                    if (n2.nodeType !== 1) continue;
                    if (n2.classList && n2.classList.contains('purpura-unfriend-radio')) return;
                    if (n2.querySelector && n2.querySelector('.purpura-unfriend-radio')) return;
                }
            }
            updateCardCheckboxes();
        });
        obs.observe(container, { childList: true, subtree: true });
    }
}

window.__PurpuraSettings.ready.then(function() {
    enabled = window.__PurpuraSettings.get(SETTING_KEY) !== false;
    if (enabled) {
        injectToggleButton();
        startHeaderObserver();
        startObserver();
    }
});

chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync' && changes[SETTING_KEY]) {
        enabled = changes[SETTING_KEY].newValue !== false;
        if (!enabled && bulkMode) {
            bulkMode = false;
            updateCardCheckboxes();
            var btn = document.querySelector('.purpura-unfriend-action-btn');
            if (btn) btn.remove();
            var toggle = document.querySelector('.purpura-bulk-toggle');
            if (toggle) toggle.remove();
            stopHeaderObserver();
        }
    }
});
})();
