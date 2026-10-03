/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
    function t(key, substitutions) { return chrome.i18n.getMessage(key, substitutions) || key; }
    const STORAGE_KEY = 'onb';

    function isHomePage() {
        return location.pathname === '/home' || location.pathname.startsWith('/home/');
    }

    function createOverlay() {
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

        const img = document.createElement('img');
        img.src = chrome.runtime.getURL('images/icons/default/Purpura_Default_Logo_128.png');
        img.alt = 'Purpura Icon';
        img.style.cssText = 'width: 28px; height: 28px; flex-shrink: 0; border-radius: 6px;';

        const title = document.createElement('span');
        title.textContent = t('onboarding_welcome');
        title.style.cssText = 'font-weight: 700; font-size: 16px; color: #f7f7f8;';

        header.appendChild(img);
        header.appendChild(title);

        const body = document.createElement('div');
        body.style.cssText = `
            padding: 18px 20px;
            overflow-y: auto;
            color: rgba(247,247,248,0.9);
            font-size: 14px;
            line-height: 1.6;
        `;

        const paragraph1 = document.createElement('p');
        paragraph1.textContent = t('onboarding_desc');
        paragraph1.style.margin = '0 0 12px 0';

        const list = document.createElement('ul');
        list.style.cssText = 'margin: 0 0 16px 18px; padding: 0; line-height: 1.6;';

        const item = document.createElement('li');
        item.style.marginBottom = '8px';
        item.textContent = t('onboarding_step1');
        list.appendChild(item);
        body.appendChild(paragraph1);
        body.appendChild(list);

        const screenshot = document.createElement('img');
        screenshot.src = chrome.runtime.getURL('images/onboarding.png');
        screenshot.alt = 'Purpura settings button guide';
        screenshot.style.cssText = 'max-width: 100%; max-height: 220px; width: auto; height: auto; display: block; margin: 12px auto; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15);';
        body.appendChild(screenshot);

        const footer = document.createElement('div');
        footer.style.cssText = `
            padding: 14px 20px;
            border-top: 1px solid rgba(255,255,255,0.12);
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.textContent = t('onboarding_gotIt');
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

    function init() {
        if (!isHomePage()) return;

        chrome.storage.local.get([STORAGE_KEY], result => {
            if (result[STORAGE_KEY]) return;

            const overlay = createOverlay();
            document.documentElement.appendChild(overlay);
        });
    }

    // run on load and on URL changes (SPA navigation)
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
