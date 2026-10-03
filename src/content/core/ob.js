/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
    const STORAGE_KEY = 'ob';

    function isHomePage() {
        return location.pathname === '/home' || location.pathname.startsWith('/home/');
    }

    async function getDisplayName() {
        try {
            const response = await fetch('https://users.roblox.com/v1/users/authenticated', { credentials: 'include' });
            if (!response.ok) return null;
            const userData = await response.json();
            const uid = userData.id;
            if (!uid) return null;
            const userRes = await fetch(`https://users.roblox.com/v1/users/${uid}`, { credentials: 'include' });
            if (!userRes.ok) return null;
            const user = await userRes.json();
            return user.displayName || user.name || user.username || null;
        } catch {
            return null;
        }
    }

    function createOverlay(displayName) {
        const overlay = document.createElement('div');
        overlay.id = 'purpura-onboarding-overlay';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.6);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            width: min(550px, 100%);
            max-height: calc(100vh - 60px);
            background: #0e0f11;
            border-radius: 16px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: 0 16px 40px rgba(0,0,0,0.55);
        `;

        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            align-items: center;
            padding: 16px 20px;
            gap: 10px;
            border-bottom: 1px solid rgba(255,255,255,0.12);
        `;

        const icon = document.createElement('img');
        icon.src = chrome.runtime.getURL('images/icons/default/Purpura_Default_Logo_128.png');
        icon.alt = 'Purpura Icon';
        icon.style.cssText = 'width: 28px; height: 28px; flex-shrink: 0; border-radius: 6px;';

        const title = document.createElement('span');
        title.textContent = 'Welcome to Purpura!';
        title.style.cssText = 'font-weight: 700; font-size: 16px; color: #f7f7f8;';

        header.appendChild(icon);
        header.appendChild(title);

        const body = document.createElement('div');
        body.style.cssText = `
            padding: 18px 20px;
            overflow-y: auto;
            color: rgba(247,247,248,0.9);
            font-size: 14px;
            line-height: 1.6;
        `;

        const greeting = document.createElement('p');
        greeting.textContent = displayName ? `Welcome to Purpura, ${displayName}! Glad to have you here.` : 'Welcome to Purpura! Glad to have you here.';
        greeting.style.margin = '0 0 12px 0';

        const description = document.createElement('p');
        description.textContent = 'Purpura is a Roblox enhancement suite designed to improve your overall experience and make the website less of a buggy mess.';
        description.style.margin = '0 0 12px 0';

        const instructions = document.createElement('p');
        instructions.textContent = 'To get started, click the gear icon in the Roblox navbar, then select "Purpura Settings" to open the settings menu.';
        instructions.style.margin = '0 0 12px 0';

        const screenshot = document.createElement('img');
        screenshot.src = chrome.runtime.getURL('images/onboarding.png');
        screenshot.alt = 'Purpura settings button guide';
        screenshot.style.cssText = 'max-width: 100%; max-height: 220px; width: auto; height: auto; display: block; margin: 12px auto; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15);';

        const closing = document.createElement('p');
        closing.textContent = 'Enjoy using Purpura!';
        closing.style.margin = '12px 0 0 0';
        closing.style.opacity = '0.9';
        closing.style.textAlign = 'center';
        closing.style.width = '100%';

        body.appendChild(greeting);
        body.appendChild(description);
        body.appendChild(instructions);
        body.appendChild(screenshot);
        body.appendChild(closing);

        const footer = document.createElement('div');
        footer.style.cssText = `
            padding: 14px 20px;
            border-top: 1px solid rgba(255,255,255,0.12);
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Got It!';
        closeBtn.style.cssText = `
            padding: 10px 14px;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.2);
            background: rgba(255,255,255,0.08);
            color: #f7f7f8;
            cursor: pointer;
            font-weight: 600;
        `;

        closeBtn.addEventListener('click', () => {
            chrome.storage.local.set({ [STORAGE_KEY]: true }, () => {
                overlay.remove();
            });
        });

        const closeIcon = document.createElement('button');
        closeIcon.setAttribute('aria-label', 'Close');
        closeIcon.style.cssText = `
            position: absolute;
            top: 16px;
            right: 16px;
            width: 32px;
            height: 32px;
            border: none;
            background: rgba(255,255,255,0.08);
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        closeIcon.innerHTML = '<span style="color: rgba(247,247,248,0.9); font-size: 16px; line-height: 1;">✕</span>';
        closeIcon.addEventListener('click', () => {
            chrome.storage.local.set({ [STORAGE_KEY]: true }, () => {
                overlay.remove();
            });
        });

        dialog.appendChild(header);
        dialog.appendChild(body);
        dialog.appendChild(footer);
        dialog.appendChild(closeIcon);
        footer.appendChild(closeBtn);

        overlay.appendChild(dialog);

        return overlay;
    }

    async function init() {
        if (!isHomePage()) return;

        window.__PurpuraSettings.ready.then(async function() {
            if (window.__PurpuraSettings.get(STORAGE_KEY)) return;

            const displayName = await getDisplayName();
            const overlay = createOverlay(displayName);
            document.documentElement.appendChild(overlay);
        });
    }

    function watchUrlChanges() {
        let last = location.href;
        setInterval(() => {
            if (location.href !== last) {
                last = location.href;
                init();
            }
        }, 500);
    }

    init();
    watchUrlChanges();
})();
