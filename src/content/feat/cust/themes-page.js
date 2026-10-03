/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function () {
    if (window.location.pathname !== '/purpura-themes') return;
    if (document.getElementById('purpura-themes-root')) return;

    var CSS = '\
#purpura-themes-root{--t-surface:var(--color-surface-0, #0b0c12);--t-surface-2:var(--color-surface-100, #111219);--t-surface-3:var(--color-surface-200, #161720);--t-text:var(--color-content-default, #f0eeff);--t-text-2:var(--color-content-muted, #a89ec4);--t-text-3:var(--color-content-tertiary, #6d6487);--t-accent:#9b6dff;--t-accent-hover:#b088ff;--t-accent-glow:rgba(155,109,255,0.15);--t-border:var(--color-divider, rgba(255,255,255,0.07));--t-border-2:rgba(255,255,255,0.12);--t-danger:#f87171;--t-success:#4ade80;--t-radius:10px;--t-radius-lg:14px;--t-ease:cubic-bezier(0.22,1,0.36,1)}\
*,*::before,*::after{box-sizing:border-box}\
#purpura-themes-root{font-family:inherit;color:var(--t-text);display:block;position:relative;z-index:1}\
.themes-root{max-width:960px;margin:0 auto;padding:32px 24px}\
.themes-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;background:transparent}\
.themes-header-left{display:flex;align-items:center;gap:14px}\
.themes-logo{width:48px;height:48px;border-radius:10px}\
.themes-header-left h1{font-size:32px;font-weight:700;letter-spacing:-0.5px;margin:0;background:linear-gradient(135deg,#c4a7ff,#9b6dff 50%,#7c4dff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}\
.themes-tabs{display:flex;gap:4px;margin-bottom:24px;background:var(--t-surface-2);padding:4px;border-radius:var(--t-radius);border:1px solid var(--t-border);width:fit-content}\
.themes-tab{padding:8px 20px;border:none;background:transparent;color:var(--t-text-2);font-size:13px;font-weight:600;border-radius:8px;cursor:pointer;transition:all 0.15s var(--t-ease);font-family:inherit}\
.themes-tab:hover{color:var(--t-text)}\
.themes-tab.active{background:var(--t-accent-glow);color:var(--t-accent)}\
.themes-main{min-height:400px}\
.themes-panel{display:none}\
.themes-panel.active{display:block;animation:t-panel-in 0.22s var(--t-ease) forwards}\
@keyframes t-panel-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}\
.themes-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}\
.themes-card{background:var(--t-surface-2);border:1px solid var(--t-border);border-radius:var(--t-radius-lg);padding:20px;cursor:pointer;transition:all 0.2s var(--t-ease);position:relative;overflow:hidden}\
.themes-card:hover{border-color:rgba(155,109,255,0.35);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.3)}\
.themes-card.active{border-color:var(--t-accent);box-shadow:0 0 0 2px var(--t-accent-glow)}\
.themes-card.active::after{content:"Active";position:absolute;top:12px;right:12px;font-size:10px;font-weight:700;color:var(--t-accent);background:var(--t-accent-glow);padding:3px 8px;border-radius:99px;text-transform:uppercase;letter-spacing:0.5px}\
.themes-card-robox{position:absolute;bottom:12px;right:12px;font-size:9px;font-weight:700;color:var(--t-text-2);background:var(--t-surface-3);padding:2px 7px;border-radius:99px;text-transform:uppercase;letter-spacing:0.5px;border:1px solid var(--t-border)}\
.themes-card-preview{display:flex;gap:3px;margin-bottom:14px}\
.themes-card-swatch{width:28px;height:28px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);flex-shrink:0}\
.themes-card-name{font-size:15px;font-weight:700;color:var(--t-text);margin:0 0 4px}\
.themes-card-desc{font-size:12px;color:var(--t-text-2);margin:0 0 6px;line-height:1.45}\
.themes-card-author{font-size:11px;color:var(--t-text-3);font-style:italic}\
.themes-card-actions{display:flex;gap:8px;margin-top:12px}\
.themes-card-loading{padding:40px;text-align:center;color:var(--t-text-2);font-size:14px;grid-column:1/-1}\
.themes-custom-layout{display:flex;gap:20px;align-items:flex-start}\
.themes-custom-sidebar{width:220px;flex-shrink:0}\
.themes-custom-sidebar h3{font-size:15px;font-weight:700;margin:0 0 10px;color:var(--t-text)}\
.themes-custom-list{display:flex;flex-direction:column;gap:4px;margin-bottom:14px;max-height:400px;overflow-y:auto}\
.themes-custom-item{padding:10px 12px;background:var(--t-surface-2);border:1px solid var(--t-border);border-radius:var(--t-radius);cursor:pointer;transition:all 0.15s var(--t-ease);font-size:13px;font-weight:500;color:var(--t-text-2);display:flex;align-items:center;justify-content:space-between}\
.themes-custom-item:hover{background:var(--t-surface-3);color:var(--t-text)}\
.themes-custom-item.active{background:var(--t-accent-glow);color:var(--t-text);border-color:rgba(155,109,255,0.3)}\
.themes-custom-item-delete{width:20px;height:20px;border-radius:50%;background:rgba(248,113,113,0.12);border:none;color:var(--t-danger);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:12px;opacity:0;transition:opacity 0.15s;flex-shrink:0}\
.themes-custom-item:hover .themes-custom-item-delete{opacity:1}\
.themes-custom-item-delete:hover{background:rgba(248,113,113,0.25)}\
.themes-custom-actions{display:flex;flex-direction:column;gap:6px}\
.themes-btn{padding:9px 14px;border-radius:var(--t-radius);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:all 0.15s var(--t-ease);border:none}\
.themes-btn:active{transform:scale(0.97)}\
.themes-btn-outline{background:transparent;border:1px solid var(--t-border-2);color:var(--t-text-2)}\
.themes-btn-outline:hover{background:var(--t-accent-glow);border-color:rgba(155,109,255,0.35);color:var(--t-text)}\
.themes-btn-primary{background:var(--t-accent);color:#fff;box-shadow:0 2px 10px rgba(155,109,255,0.35)}\
.themes-btn-primary:hover{background:#8a5df0;box-shadow:0 4px 16px rgba(155,109,255,0.45)}\
.themes-btn-danger{background:rgba(248,113,113,0.12);color:var(--t-danger);border:1px solid rgba(248,113,113,0.2)}\
.themes-btn-danger:hover{background:rgba(248,113,113,0.22);border-color:rgba(248,113,113,0.35)}\
.themes-custom-editor{flex:1;min-width:0;min-height:380px;background:var(--t-surface-2);border:1px solid var(--t-border);border-radius:var(--t-radius-lg);padding:24px}\
.themes-editor-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;min-height:300px;color:var(--t-text-3);gap:12px}\
.themes-editor-empty p{font-size:14px;margin:0}\
.themes-editor-meta{display:flex;gap:12px;margin-bottom:18px;flex-wrap:wrap}\
.themes-form-group{display:flex;flex-direction:column;gap:4px;flex:1;min-width:140px}\
.themes-form-group label{font-size:11px;font-weight:700;color:var(--t-text-3);text-transform:uppercase;letter-spacing:0.5px}\
.themes-form-group input{width:100%;padding:8px 10px;border-radius:8px;border:1px solid var(--t-border-2);background:var(--t-surface);color:var(--t-text);font-size:13px;font-family:inherit;transition:border-color 0.15s}\
.themes-form-group input:focus{outline:none;border-color:var(--t-accent);box-shadow:0 0 0 3px var(--t-accent-glow)}\
.themes-editor-tabs{display:flex;gap:2px;margin-bottom:16px}\
.themes-editor-tab{padding:6px 14px;border:none;background:transparent;color:var(--t-text-3);font-size:12px;font-weight:600;cursor:pointer;border-bottom:2px solid transparent;transition:all 0.15s;font-family:inherit}\
.themes-editor-tab:hover{color:var(--t-text-2)}\
.themes-editor-tab.active{color:var(--t-accent);border-bottom-color:var(--t-accent)}\
.themes-editor-fields{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;margin-bottom:20px}\
.theme-color-field{display:flex;flex-direction:column;gap:6px;padding:10px 12px;background:var(--t-surface);border:1px solid var(--t-border);border-radius:var(--t-radius);transition:border-color 0.15s}\
.theme-color-field:hover{border-color:rgba(155,109,255,0.25)}\
.theme-color-top{display:flex;align-items:center;gap:8px}\
.theme-color-top label{font-size:12px;color:var(--t-text-2);flex:1;min-width:0;overflow:visible;white-space:normal;line-height:1.35;font-weight:500;text-transform:none;letter-spacing:0}\
.theme-color-rgb{font-size:11px;color:var(--t-text-3);font-family:monospace;min-width:110px;text-align:right;flex-shrink:0}\
.theme-color-top input[type=color]{-webkit-appearance:none;appearance:none;width:32px;height:24px;border-radius:6px;border:1px solid var(--t-border-2);cursor:pointer;padding:0;background:transparent;flex-shrink:0}\
.theme-color-top input[type=color]::-webkit-color-swatch-wrapper{padding:0}\
.theme-color-top input[type=color]::-webkit-color-swatch{border-radius:4px;border:1px solid rgba(255,255,255,0.08)}\
.theme-color-opacity{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--t-text-3)}\
.theme-color-opacity span:first-child{min-width:50px;flex-shrink:0}\
.theme-color-opacity input[type=range]{-webkit-appearance:none;appearance:none;flex:1;height:4px;border-radius:2px;background:var(--t-surface-3);outline:none;cursor:pointer}\
.theme-color-opacity input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:14px;height:14px;border-radius:50%;background:var(--t-accent);cursor:pointer;border:2px solid var(--t-surface);transition:transform 0.1s;margin-top:-5px}\
.theme-color-opacity input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.15)}\
.theme-color-opacity-val{min-width:36px;text-align:right;font-family:monospace;flex-shrink:0}\
.themes-editor-actions{display:flex;gap:8px;flex-wrap:wrap}\
.themes-empty-state{padding:20px;text-align:center;color:var(--t-text-3);font-size:13px;font-style:italic}\
.themes-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--t-accent);color:#fff;padding:10px 20px;border-radius:99px;font-size:13px;font-weight:600;z-index:999999;animation:t-toast-in 0.25s var(--t-ease) forwards}\
@keyframes t-toast-in{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}\
';

    var FIELD_GROUPS = {
        surfaces: [
            { key: 'surface0', label: 'Surface 0', def: '#121215' },
            { key: 'surface100', label: 'Surface 100', def: '#191a1f' },
            { key: 'surface200', label: 'Surface 200', def: '#272930' },
            { key: 'surface300', label: 'Surface 300', def: '#45494d' },
            { key: 'mainText', label: 'Main Text Color', def: '#f7f7f8' },
            { key: 'secondaryText', label: 'Secondary Text Color', def: '#d5d7dd' },
            { key: 'playButton', label: 'Playbutton Color', def: '#335fff' }
        ]
    };

    var DEFAULT_COLORS = {};
    function collectDefaults(group) {
        group.forEach(function (f) { if (f.key) { DEFAULT_COLORS[f.key] = f.def; } });
    }
    Object.values(FIELD_GROUPS).forEach(collectDefaults);

    var editingThemeIndex = -1;
    var editingColors = null;
    var currentRobloxTheme = 'Dark';

    function getState() {
        return window.PurpuraThemeEngine ? window.PurpuraThemeEngine.getState() : { selected: 'none', enabled: false, customColors: null, customThemes: [], presetData: null };
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;');
    }

    function showToast(msg) {
        var existing = document.querySelector('.themes-toast');
        if (existing) existing.remove();
        var toast = document.createElement('div');
        toast.className = 'themes-toast';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(function () { toast.remove(); }, 2500);
    }

    function fetchRobloxTheme() {
        return fetch('https://accountsettings.roblox.com/v1/themes/1/0', { credentials: 'include' })
            .then(function (r) { return r.ok ? r.json() : { themeType: 'Dark' }; })
            .then(function (d) { return d.themeType || 'Dark'; })
            .catch(function () { return 'Dark'; });
    }

    function setRobloxTheme(themeValue) {
        function doPatch(token) {
            var headers = { 'Content-Type': 'application/json' };
            if (token) headers['X-CSRF-Token'] = token;
            return fetch('https://accountsettings.roblox.com/v1/themes/1/0', {
                method: 'PATCH',
                credentials: 'include',
                headers: headers,
                body: JSON.stringify({ themeType: themeValue })
            });
        }

        function onSuccess() {
            currentRobloxTheme = themeValue;
            if (themeValue === 'Light') {
                document.body.classList.remove('dark-theme');
                document.body.classList.add('light-theme');
            } else {
                document.body.classList.remove('light-theme');
                document.body.classList.add('dark-theme');
            }
            try {
                var stored = localStorage.getItem('theme');
                if (stored) {
                    var parsed = JSON.parse(stored);
                    var metaEl = document.querySelector('meta[name="user-data"]');
                    var userId = metaEl ? (metaEl.getAttribute('data-userid') || metaEl.getAttribute('data-user-id')) : null;
                    if (userId && Array.isArray(parsed.data)) {
                        var entry = parsed.data.find(function (e) { return e[0] === Number(userId); });
                        if (entry) { entry[1] = themeValue === 'Light' ? 0 : 1; localStorage.setItem('theme', JSON.stringify(parsed)); }
                    }
                }
            } catch (e) {}
            renderShippedCards();
        }

        doPatch(null).then(function (resp) {
            if (resp.ok) { onSuccess(); return; }
            if (resp.status === 403) {
                var csrfToken = resp.headers.get('X-CSRF-Token');
                if (csrfToken) {
                    return doPatch(csrfToken).then(function (retryResp) {
                        if (retryResp.ok) onSuccess();
                    });
                }
            }
        }).catch(function () {});
    }

    function renderRobloxThemeCards() {
        var state = getState();
        var presets = state.presetData;
        var hasPreset = state.selected !== 'none';
        var html = '';
        var lightActive = !hasPreset && currentRobloxTheme === 'Light';
        var darkActive = !hasPreset && currentRobloxTheme === 'Dark';

        var entries = [
            { key: 'robloxLight', roboxTheme: 'Light', active: lightActive },
            { key: 'robloxDark', roboxTheme: 'Dark', active: darkActive }
        ];

        entries.forEach(function (entry) {
            var p = presets ? presets[entry.key] : null;
            var name = p ? p.name : 'Roblox ' + entry.roboxTheme;
            var desc = '';
            var author = 'Roblox';
            var swatchKeys = p ? Object.keys(p.colors).slice(0, 5) : [];
            var swatchHtml = swatchKeys.map(function (k) { return '<div class="themes-card-swatch" style="background:' + p.colors[k] + '"></div>'; }).join('');
            if (!swatchHtml) swatchHtml = '<div class="themes-card-swatch" style="background:#888"></div>';

            html += '<div class="themes-card' + (entry.active ? ' active' : '') + '">';
            html += '<span class="themes-card-robox">Roblox</span>';
            html += '<div class="themes-card-preview">' + swatchHtml + '</div>';
            html += '<div class="themes-card-name">' + escapeHtml(name) + '</div>';
            html += '<div class="themes-card-desc">' + escapeHtml(desc) + '</div>';
            html += '<div class="themes-card-author">by ' + escapeHtml(author) + '</div>';
            html += '<div class="themes-card-actions">';
            html += '<button class="themes-btn themes-btn-primary btn-robox-theme" data-robox-theme="' + entry.roboxTheme + '">' + (entry.active ? 'Active' : 'Apply') + '</button>';
            html += '</div></div>';
        });

        return html;
    }

    function bindRobloxThemeEvents(container) {
        if (!container) return;
        container.querySelectorAll('.btn-robox-theme').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var theme = btn.getAttribute('data-robox-theme');
                setRobloxTheme(theme);
            });
        });
    }

    function renderShippedCards() {
        var state = getState();
        var container = document.getElementById('shippedCards');
        if (!container) return;
        var presets = state.presetData;
        if (!presets) { container.innerHTML = '<div class="themes-card-loading">Loading presets...</div>'; return; }
        var keys = Object.keys(presets);
        var html = renderRobloxThemeCards();
        keys.forEach(function (key) {
            if (key === 'robloxLight' || key === 'robloxDark') return;
            var p = presets[key];
            var swatchKeys = Object.keys(p.colors).slice(0, 5);
            var swatchHtml = swatchKeys.map(function (k) { return '<div class="themes-card-swatch" style="background:' + p.colors[k] + '"></div>'; }).join('');
            var activeClass = state.selected === key ? ' active' : '';
            html += '<div class="themes-card' + activeClass + '" data-preset="' + key + '">';
            html += '<div class="themes-card-preview">' + swatchHtml + '</div>';
            html += '<div class="themes-card-name">' + escapeHtml(p.name) + '</div>';
            html += '<div class="themes-card-desc">' + escapeHtml(p.description) + '</div>';
            html += '<div class="themes-card-author">by ' + escapeHtml(p.author) + '</div>';
            html += '<div class="themes-card-actions">';
            html += '<button class="themes-btn themes-btn-primary btn-apply-preset" data-preset="' + key + '">' + (state.selected === key ? 'Applied' : 'Apply') + '</button>';
            if (state.selected === key) html += '<button class="themes-btn themes-btn-outline btn-unequip">Unequip</button>';
            html += '</div></div>';
        });
        if (state.selected === 'custom') html += '<div style="margin-top:12px"><button class="themes-btn themes-btn-outline btn-unequip">Unequip Custom Theme</button></div>';
        container.innerHTML = html;
        bindShippedEvents();
        bindRobloxThemeEvents(container);
    }

    function bindShippedEvents() {
        var container = document.getElementById('shippedCards');
        if (!container) return;
        container.querySelectorAll('.btn-apply-preset').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var preset = btn.getAttribute('data-preset');
                if (window.PurpuraThemeEngine) { window.PurpuraThemeEngine.setTheme(preset); }
                setTimeout(renderShippedCards, 200);
            });
        });
        container.querySelectorAll('.btn-unequip').forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (window.PurpuraThemeEngine) { window.PurpuraThemeEngine.setTheme('none'); }
                setTimeout(renderShippedCards, 200);
            });
        });
    }

    function renderCustomList() {
        var state = getState();
        var container = document.getElementById('customThemeList');
        if (!container) return;
        var themes = state.customThemes || [];
        if (themes.length === 0) { container.innerHTML = '<div class="themes-empty-state">No custom themes yet</div>'; return; }
        var html = '';
        themes.forEach(function (t, i) {
            var activeClass = state.selected === 'custom' && editingThemeIndex === i ? ' active' : '';
            html += '<div class="themes-custom-item' + activeClass + '" data-index="' + i + '">';
            html += '<span>' + escapeHtml(t.name) + '</span>';
            html += '<button class="themes-custom-item-delete" data-index="' + i + '" title="Delete">x</button>';
            html += '</div>';
        });
        container.innerHTML = html;
        container.querySelectorAll('.themes-custom-item').forEach(function (item) {
            item.addEventListener('click', function (e) {
                if (e.target.classList.contains('themes-custom-item-delete')) return;
                editTheme(parseInt(item.getAttribute('data-index')));
            });
        });
        container.querySelectorAll('.themes-custom-item-delete').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                deleteTheme(parseInt(btn.getAttribute('data-index')));
            });
        });
    }

    function editTheme(index) {
        var state = getState();
        var themes = state.customThemes || [];
        if (index < 0 || index >= themes.length) return;
        editingThemeIndex = index;
        editingColors = JSON.parse(JSON.stringify(themes[index].colors));
        document.getElementById('editorName').value = themes[index].name || '';
        document.getElementById('editorDesc').value = themes[index].description || '';
        document.getElementById('editorAuthor').value = themes[index].author || '';
        document.getElementById('btnDeleteTheme').style.display = '';
        showEditor();
        renderColorFields();
        renderCustomList();
    }

    function newTheme() {
        editingThemeIndex = -1;
        editingColors = JSON.parse(JSON.stringify(DEFAULT_COLORS));
        document.getElementById('editorName').value = '';
        document.getElementById('editorDesc').value = '';
        document.getElementById('editorAuthor').value = '';
        document.getElementById('btnDeleteTheme').style.display = 'none';
        showEditor();
        renderColorFields();
    }

    function saveTheme() {
        var name = document.getElementById('editorName').value.trim() || 'Custom Theme';
        var desc = document.getElementById('editorDesc').value.trim();
        var author = document.getElementById('editorAuthor').value.trim() || 'Unknown';
        if (!window.PurpuraThemeEngine) { showToast('Theme engine not ready'); return; }
        if (editingThemeIndex >= 0) {
            var state = getState();
            var themes = state.customThemes || [];
            if (editingThemeIndex < themes.length) {
                themes[editingThemeIndex].name = name;
                themes[editingThemeIndex].description = desc;
                themes[editingThemeIndex].author = author;
                themes[editingThemeIndex].colors = JSON.parse(JSON.stringify(editingColors));
                var update = window.PurpuraThemeEngine.getState();
                window.__PurpuraSettings.set('thm', Object.assign(update, { customThemes: themes }));
            }
        } else {
            window.PurpuraThemeEngine.saveCustomTheme(name, desc, author, editingColors);
            editingThemeIndex = (window.PurpuraThemeEngine.getState().customThemes || []).length - 1;
        }
        window.PurpuraThemeEngine.setCustomColors(editingColors);
        window.PurpuraThemeEngine.setTheme('custom');
        showToast('Theme saved!');
        renderCustomList();
    }

    function deleteTheme(index) {
        if (!confirm('Delete this theme?')) return;
        var state = getState();
        var themes = state.customThemes || [];
        var wasActive = state.selected === 'custom' && themes[index] &&
            JSON.stringify(themes[index].colors) === JSON.stringify(state.customColors);
        window.PurpuraThemeEngine.deleteCustomTheme(index);
        if (editingThemeIndex === index) hideEditor();
        if (wasActive) {
            window.PurpuraThemeEngine.setTheme('none');
            setTimeout(renderShippedCards, 200);
        }
        if (editingThemeIndex > index) editingThemeIndex--;
        else if (editingThemeIndex === index) editingThemeIndex = -1;
        renderCustomList();
        showToast('Theme deleted');
    }

    function showEditor() {
        document.getElementById('editorEmpty').style.display = 'none';
        document.getElementById('editorForm').style.display = '';
    }

    function hideEditor() {
        document.getElementById('editorEmpty').style.display = '';
        document.getElementById('editorForm').style.display = 'none';
        editingThemeIndex = -1;
        editingColors = null;
    }

    function hexToRgb(hex) {
        return {
            r: parseInt(hex.slice(1, 3), 16),
            g: parseInt(hex.slice(3, 5), 16),
            b: parseInt(hex.slice(5, 7), 16)
        };
    }

    function toHexColor(value) {
        if (!value) return '#000000';
        if (value.length === 7 && value[0] === '#') return value;
        if (value.length === 4 && value[0] === '#') return value;
        if (value.slice(0, 4) === 'rgb(' || value.slice(0, 5) === 'rgba(') {
            var m = value.match(/[\d.]+/g);
            if (m && m.length >= 3) {
                return '#' + [parseInt(m[0]), parseInt(m[1]), parseInt(m[2])].map(function (v) {
                    var h = Math.max(0, Math.min(255, v)).toString(16);
                    return h.length === 1 ? '0' + h : h;
                }).join('');
            }
        }
        return '#000000';
    }

    function parseColorValue(value) {
        if (!value) return { hex: '#000000', opacity: 100 };
        if (value.slice(0, 5) === 'rgba(') {
            var m = value.match(/[\d.]+/g);
            if (m && m.length >= 4) {
                return {
                    hex: toHexColor(value),
                    opacity: Math.round(parseFloat(m[3]) * 100)
                };
            }
        }
        if (value.slice(0, 4) === 'rgb(') {
            return { hex: toHexColor(value), opacity: 100 };
        }
        return { hex: toHexColor(value), opacity: 100 };
    }

    function buildColorValue(hex, opacity) {
        if (opacity >= 100) return hex;
        var rgb = hexToRgb(hex);
        return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + (opacity / 100) + ')';
    }

    function renderColorFields() {
        var container = document.getElementById('editorFields');
        if (!container) return;
        var allFields = FIELD_GROUPS.surfaces;
        var html = '';

        allFields.forEach(function (f) {
            var value = editingColors ? editingColors[f.key] : f.def;
            if (!value) value = f.def;
            var parsed = parseColorValue(value);
            var rgb = hexToRgb(parsed.hex);
            var rgbStr = 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
            html += '<div class="theme-color-field">';
            html += '<div class="theme-color-top">';
            html += '<label>' + escapeHtml(f.label) + '</label>';
            html += '<span class="theme-color-rgb">' + rgbStr + '</span>';
            html += '<input type="color" value="' + parsed.hex + '" data-color-key="' + f.key + '">';
            html += '</div>';
            html += '<div class="theme-color-opacity">';
            html += '<span>Opacity</span>';
            html += '<input type="range" min="0" max="100" value="' + parsed.opacity + '" data-opacity-key="' + f.key + '">';
            html += '<span class="theme-color-opacity-val" data-opacity-display="' + f.key + '">' + parsed.opacity + '%</span>';
            html += '</div>';
            html += '</div>';
        });

        container.innerHTML = html;

        container.querySelectorAll('input[type=color]').forEach(function (input) {
            input.addEventListener('input', function () {
                var key = input.getAttribute('data-color-key');
                var slider = container.querySelector('input[data-opacity-key="' + key + '"]');
                var opacity = slider ? parseInt(slider.value) : 100;
                var newValue = buildColorValue(input.value, opacity);
                editingColors[key] = newValue;
                var rgb = hexToRgb(input.value);
                var rgbSpan = input.closest('.theme-color-field').querySelector('.theme-color-rgb');
                if (rgbSpan) rgbSpan.textContent = 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
                if (window.PurpuraThemeEngine) window.PurpuraThemeEngine.applyLivePreview(editingColors);
            });
        });

        container.querySelectorAll('input[type=range]').forEach(function (slider) {
            slider.addEventListener('input', function () {
                var key = slider.getAttribute('data-opacity-key');
                var colorInput = container.querySelector('input[data-color-key="' + key + '"]');
                var hex = colorInput ? colorInput.value : '#000000';
                var opacity = parseInt(slider.value);
                var newValue = buildColorValue(hex, opacity);
                editingColors[key] = newValue;
                var disp = container.querySelector('[data-opacity-display="' + key + '"]');
                if (disp) disp.textContent = opacity + '%';
                if (window.PurpuraThemeEngine) window.PurpuraThemeEngine.applyLivePreview(editingColors);
            });
        });
    }

    function exportCurrentTheme() {
        if (!editingColors) { showToast('No theme to export'); return; }
        var name = document.getElementById('editorName').value.trim() || 'Custom Theme';
        var desc = document.getElementById('editorDesc').value.trim();
        var author = document.getElementById('editorAuthor').value.trim() || 'Unknown';
        window.PurpuraThemeEngine.exportTheme(name, desc, author, editingColors);
        showToast('Theme exported!');
    }

    function importThemeFile(file) {
        var reader = new FileReader();
        reader.onload = function () {
            try {
                var theme = window.PurpuraThemeEngine.importTheme(reader.result);
                editingColors = theme.colors;
                editingThemeIndex = -1;
                document.getElementById('editorName').value = theme.name;
                document.getElementById('editorDesc').value = theme.description || '';
                document.getElementById('editorAuthor').value = theme.author || '';
                document.getElementById('btnDeleteTheme').style.display = 'none';
                showEditor();
                renderColorFields();
                showToast('Theme imported: ' + theme.name);
            } catch (e) { showToast('Import failed: ' + e.message); }
        };
        reader.readAsText(file);
    }

    function injectPage() {
        document.title = 'Themes - Roblox';

        var contentArea = document.querySelector('.main-content') ||
                          document.querySelector('.content') ||
                          document.querySelector('.container-main') ||
                          document.querySelector('#container') ||
                          document.querySelector('main') ||
                          document.querySelector('.page-content');

        var style = document.createElement('style');
        style.id = 'purpura-themes-css';
        style.textContent = CSS;
        (document.head || document.documentElement).appendChild(style);

        var logoUrl = chrome.runtime.getURL('images/icons/default/Purpura_Default_Logo_48.png');

        var root = document.createElement('div');
        root.id = 'purpura-themes-root';
        root.innerHTML =
            '<div class="themes-root">' +
            '<header class="themes-header"><div class="themes-header-left"><img class="themes-logo" src="' + logoUrl + '" alt="Purpura"><h1>Themes</h1></div></header>' +
            '<nav class="themes-tabs" id="themesTabs"><button class="themes-tab active" data-tab="shipped">Shipped</button><button class="themes-tab" data-tab="custom">Custom</button></nav>' +
            '<main class="themes-main">' +
            '<section class="themes-panel active" id="panelShipped"><div class="themes-cards" id="shippedCards"><div class="themes-card-loading">Loading presets...</div></div></section>' +
            '<section class="themes-panel" id="panelCustom"><div class="themes-custom-layout"><div class="themes-custom-sidebar"><h3>My Themes</h3><div class="themes-custom-list" id="customThemeList"><div class="themes-empty-state">No custom themes yet</div></div><div class="themes-custom-actions"><button class="themes-btn themes-btn-outline" id="btnNewTheme">+ New Theme</button><button class="themes-btn themes-btn-outline" id="btnImportTheme">Import .purpuraTheme</button><input type="file" id="importFileInput" accept=".purpuraTheme" style="display:none"></div></div><div class="themes-custom-editor" id="customEditor"><div class="themes-editor-empty" id="editorEmpty"><p>Select or create a custom theme to start editing</p></div><div class="themes-editor-form" id="editorForm" style="display:none"><div class="themes-editor-meta"><div class="themes-form-group"><label>Theme Name</label><input type="text" id="editorName" placeholder="Custom Theme" maxlength="50"></div><div class="themes-form-group"><label>Description</label><input type="text" id="editorDesc" placeholder="Pick colors or paste RGB values. Changes apply live to the page behind this editor." maxlength="120"></div><div class="themes-form-group"><label>Author</label><input type="text" id="editorAuthor" placeholder="You" maxlength="50"></div></div><div class="themes-editor-tabs"><button class="themes-editor-tab active" data-editor-tab="surfaces">ROBLOX</button></div><div class="themes-editor-fields" id="editorFields"></div><div class="themes-editor-actions"><button class="themes-btn themes-btn-primary" id="btnSaveTheme">Save Theme</button><button class="themes-btn themes-btn-outline" id="btnExportTheme">Export .purpuraTheme</button><button class="themes-btn themes-btn-outline" id="btnResetTheme">Reset</button><button class="themes-btn themes-btn-danger" id="btnDeleteTheme" style="display:none">Delete</button></div></div></div></div></section>' +
            '</main></div>';

        if (contentArea) {
            contentArea.style.backgroundColor = 'transparent';
            contentArea.innerHTML = '';
            contentArea.appendChild(root);
        } else {
            document.body.appendChild(root);
        }

        fetchRobloxTheme().then(function (t) {
            currentRobloxTheme = t;
            renderShippedCards();
        });

        renderShippedCards();
        renderCustomList();

        document.getElementById('themesTabs').addEventListener('click', function (e) {
            var tab = e.target.closest('.themes-tab');
            if (!tab) return;
            var tabName = tab.getAttribute('data-tab');
            document.querySelectorAll('.themes-tab').forEach(function (t) { t.classList.toggle('active', t === tab); });
            var panelName = 'panel' + tabName.charAt(0).toUpperCase() + tabName.slice(1);
            document.querySelectorAll('.themes-panel').forEach(function (p) { p.classList.toggle('active', p.id === panelName); });
        });
        document.getElementById('btnNewTheme').addEventListener('click', newTheme);
        document.getElementById('btnSaveTheme').addEventListener('click', saveTheme);
        document.getElementById('btnExportTheme').addEventListener('click', exportCurrentTheme);
        document.getElementById('btnDeleteTheme').addEventListener('click', function () { if (editingThemeIndex >= 0) deleteTheme(editingThemeIndex); });
        document.getElementById('btnImportTheme').addEventListener('click', function () { document.getElementById('importFileInput').click(); });
        document.getElementById('importFileInput').addEventListener('change', function (e) { if (e.target.files && e.target.files[0]) importThemeFile(e.target.files[0]); e.target.value = ''; });
        document.getElementById('btnResetTheme').addEventListener('click', function () {
            if (!confirm('Reset all colors to Roblox defaults?')) return;
            editingColors = JSON.parse(JSON.stringify(DEFAULT_COLORS));
            renderColorFields();
            if (window.PurpuraThemeEngine) window.PurpuraThemeEngine.applyLivePreview(editingColors);
            showToast('Colors reset to defaults');
        });

        var pollAttempts = 0;
        var pollInterval = setInterval(function () {
            if (window.PurpuraThemeEngine) {
                clearInterval(pollInterval);
                renderShippedCards();
                renderCustomList();
            } else if (++pollAttempts > 40) {
                clearInterval(pollInterval);
            }
        }, 100);

        chrome.storage.onChanged.addListener(function (changes, areaName) {
            if (areaName !== 'local') return;
            if (changes.thm || changes.thmEnabled) {
                renderShippedCards();
                renderCustomList();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectPage);
    } else {
        injectPage();
    }
})();
