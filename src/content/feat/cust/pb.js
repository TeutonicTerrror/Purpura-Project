/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
    'use strict';
    function t(key, substitutions) { return chrome.i18n.getMessage(key, substitutions) || key; }
    
    let isPageBindsEnabled = true;
    let keybinds = [];
    let lastKeyPressTime = 0;
    const COOLDOWN_DURATION = 5000; 
    
    if (!window.location.href.includes('roblox')) {
        return;
    }

    (function() {
        var style = document.createElement('style');
        style.textContent = ':root{--purpura-pb-grad-start:#b388ff;--purpura-pb-grad-end:#7c4dff;--purpura-pb-shadow:rgba(0,0,0,0.3);--purpura-pb-border:rgba(255,255,255,0.2)}';
        document.head.appendChild(style);
    })();
    
    function showNavigationNotification(keybindName, targetUrl) {
        const existingNotification = document.getElementById('purpura-page-bind-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.id = 'purpura-page-bind-notification';
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--purpura-pb-grad-start), var(--purpura-pb-grad-end));
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px var(--purpura-pb-shadow);
            z-index: 10000;
            animation: slideInUp 0.3s ease-out;
            max-width: 300px;
            border: 1px solid var(--purpura-pb-border);
        `;
        
        if (!document.getElementById('purpura-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'purpura-notification-styles';
            styles.textContent = `
                @keyframes slideInUp {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                @keyframes fadeOut {
                    from {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <div>
                    <div style="font-weight: 600;">${t('pageBinds_title')}</div>
                    <div style="font-size: 12px; opacity: 0.9;">${t('pageBinds_navigating', [keybindName])}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => {
                    if (notification && notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);
    }
    
    function loadKeybinds() {
        window.__PurpuraSettings.ready.then(function() {
            const result = { 'pb': window.__PurpuraSettings.get('pb') };
            const defaultKeybinds = [
                { key: 'G', name: 'Groups', url: 'https://www.roblox.com/communities/', enabled: true, isDefault: true },
                { key: 'I', name: 'Inventory', url: 'https://www.roblox.com/users/{userID}/inventory', enabled: true, isDefault: true },
                { key: 'C', name: 'Catalog', url: 'https://www.roblox.com/catalog', enabled: true, isDefault: true },
                { key: 'E', name: 'Avatar Editor', url: 'https://www.roblox.com/my/avatar', enabled: true, isDefault: true },
                { key: 'F', name: 'Friends', url: 'https://www.roblox.com/users/friends', enabled: true, isDefault: true },
                { key: 'S', name: 'Studio', url: 'https://create.roblox.com/', enabled: true, isDefault: true },
                { key: 'R', name: 'Games', url: 'https://www.roblox.com/charts', enabled: true, isDefault: true },
                { key: 'P', name: 'Purpura Settings', url: 'https://www.roblox.com/my/account?purpura=info#!/info', enabled: true, isDefault: true }
            ];
            
            const data = result['pb'];
            let allKeybinds;
            
            if (Array.isArray(data)) {
                // Old format: plain array of binds -- treat as enabled, migrate to new format
                isPageBindsEnabled = true;
                allKeybinds = data;
                chrome.storage.sync.set({ 'pb': { enabled: true, binds: data } });
            } else if (data && typeof data === 'object' && Array.isArray(data.binds)) {
                // New format: { enabled, binds }
                isPageBindsEnabled = data.enabled === true;
                allKeybinds = data.binds;
            } else {
                // No data -- feature disabled by default
                isPageBindsEnabled = false;
                keybinds = [];
                return;
            }
            
            const existingKeys = allKeybinds.map((kb) => (kb && kb.key ? kb.key.toUpperCase() : ""));
            const newDefaults = defaultKeybinds.filter((defaultKb) => !existingKeys.includes(defaultKb.key.toUpperCase()));
            if (newDefaults.length > 0) {
                allKeybinds = [...allKeybinds, ...newDefaults];
                chrome.storage.sync.set({ 'pb': { enabled: isPageBindsEnabled, binds: allKeybinds } });
            }
            
            keybinds = allKeybinds.filter(kb => kb.enabled);
        });
    }
    
    function isInInputField() {
        const activeElement = document.activeElement;
        if (!activeElement) return false;
        
        const inputTags = ['INPUT', 'TEXTAREA', 'SELECT'];
        const editableTypes = ['text', 'password', 'email', 'search', 'url', 'tel', 'number'];
        
        if (inputTags.includes(activeElement.tagName)) {
            if (activeElement.tagName === 'INPUT') {
                const type = activeElement.type.toLowerCase();
                return editableTypes.includes(type);
            }
            return true;
        }
        
        if (activeElement.contentEditable === 'true') {
            return true;
        }
        
        const role = activeElement.getAttribute('role');
        if (role && ['textbox', 'searchbox', 'combobox'].includes(role.toLowerCase())) {
            return true;
        }
        
        return false;
    }
    
    function getCurrentUserID() {
                if (window.Roblox && window.Roblox.config && window.Roblox.config.userId) {
            return window.Roblox.config.userId.toString();
        }
        
        const userIdMeta = document.querySelector('meta[name="user-data"]');
        if (userIdMeta) {
            try {
                const userData = JSON.parse(userIdMeta.getAttribute('data-userid'));
                if (userData && userData.UserId) {
                    return userData.UserId.toString();
                }
            } catch (e) {
            }
        }
        
        const userPageMatch = window.location.href.match(/\/users\/(\d+)/);
        if (userPageMatch) {
            return userPageMatch[1];
        }
        
        const userLink = document.querySelector('a[href*="/users/"]');
        if (userLink) {
            const match = userLink.href.match(/\/users\/(\d+)/);
            if (match) {
                return match[1];
            }
        }
        
        return null;
    }
    
    function processUrl(url) {
        const userID = getCurrentUserID();
        if (userID && url.includes('{userID}')) {
            return url.replace('{userID}', userID);
        }
        return url;
    }
    
    function handleKeydown(event) {
        if (document._purpuraCapturingKey) {
            return;
        }

        if (!isPageBindsEnabled) {
            return;
        }
        
        const currentTime = Date.now();
        if (currentTime - lastKeyPressTime < COOLDOWN_DURATION) {
            return;
        }
        
        if (isInInputField()) {
            return;
        }
        
        if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) {
            return;
        }
        
        const pressedKey = event.key.toUpperCase();
        
        const keybind = keybinds.find(kb => kb.key.toUpperCase() === pressedKey);
        if (keybind) {
            event.preventDefault();
            event.stopPropagation();
            
            lastKeyPressTime = currentTime;
            
            const targetUrl = processUrl(keybind.url);
            
            showNavigationNotification(keybind.name, targetUrl);
            
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 500);
        }
    }
    
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync' && changes['pb']) {
            setTimeout(loadKeybinds, 0);
        }
    });
    
    document.addEventListener('keydown', handleKeydown, true);
    
    loadKeybinds();
})();
