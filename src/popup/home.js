/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
function t(key, substitutions) {
    return chrome.i18n.getMessage(key, substitutions) || key;
}

function localizeHtml() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const msg = chrome.i18n.getMessage(el.dataset.i18n);
        if (msg) el.textContent = msg;
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const msg = chrome.i18n.getMessage(el.dataset.i18nTitle);
        if (msg) el.title = msg;
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    localizeHtml();
    const banStatus = await checkBanStatus();

    if (banStatus.banned) {
        showBlockingBanScreen(banStatus.reason, banStatus.expiresAt);
        return;
    }

    const extensionUI = document.querySelector('.extension-ui');
    if (extensionUI) {
        extensionUI.classList.add('verified');
    }

    loadUserInfo();
    loadDebugInfo();

    const openSettingsButtonLarge = document.getElementById('openSettingsButtonLarge');

    if (openSettingsButtonLarge) {
        openSettingsButtonLarge.addEventListener('click', function () {
            chrome.tabs.create({ url: 'https://www.roblox.com/my/account?purpura=info' });
        });
    }

const purpuraStoreButton = document.getElementById('purpuraStoreButton');
    if (purpuraStoreButton) {
        purpuraStoreButton.addEventListener('click', function () {
            chrome.tabs.create({ url: 'https://www.roblox.com/games/store-section/7191592908' });
        });
    }



    const discordBanner = document.getElementById('discordBanner');
    if (discordBanner) {
        discordBanner.addEventListener('click', function () {
            chrome.tabs.create({ url: 'https://discord.gg/TT4sgtEkNV' });
        });
    }

    const robloxBanner = document.getElementById('robloxBanner');
    if (robloxBanner) {
        robloxBanner.addEventListener('click', function () {
            chrome.tabs.create({ url: 'https://www.roblox.com/communities/35582394/Purpura-Extension#!/about' });
        });
    }
});

async function loadDebugInfo() {
    const featuresEl = document.getElementById('debugFeatures');
    const sessionEl = document.getElementById('debugSession');
    const browserEl = document.getElementById('debugBrowser');

    if (!featuresEl || !sessionEl || !browserEl) return;

    try {
        const [localData, syncData] = await Promise.all([
            chrome.storage.local.get(null),
            chrome.storage.sync.get(null)
        ]);

        const featureConfig = {
            [t('popup_debugServerInfo')]: syncData['si']?.enabled ?? true,
            [t('popup_debugBotDetector')]: syncData['bd'] ?? true,
            [t('popup_debugPinnedGames')]: syncData['pg'] ?? false,
            [t('popup_debugGameLauncherWidget')]: syncData['glw'] ?? false,
            [t('popup_debugGameLauncherOmnibox')]: syncData['game-launcher-omnibox'] ?? false,
            [t('popup_debugGameOutfits')]: syncData['go']?.enabled ?? true,
            [t('popup_debugPageBinds')]: syncData['pb'] ? t('popup_debugConfigured') : t('popup_debugNone'),
            [t('popup_debugBloatwareRemover')]: syncData['bwr'] ?? false,
            [t('popup_debugGreetings')]: localData['gr'] ?? true,
            [t('popup_debugPurpuraCursors')]: localData['pcr']?.enabled ?? false,
            [t('popup_debugPurpuraTabs')]: localData['pt']?.enabled ?? false,
            [t('popup_debugUncorporatify')]: localData['unc'] ?? false,
            [t('popup_debugThemeEditor')]: localData['rothemerActive'] ?? false,
        };

        const sessionInfo = {
            [t('popup_debugUserId')]: localData['robloxUserId'] || t('popup_debugNotDetected'),
            [t('popup_debugBannedLabel')]: localData['purpuraBanned'] ? `${t('popup_debugYes')}: ${localData['purpuraBanReason']}` : t('popup_debugNo')
        };

        const browserInfo = {
            [t('popup_debugPlatform')]: navigator.platform,
            [t('popup_debugLanguage')]: navigator.language,
            [t('popup_debugCookies')]: navigator.cookieEnabled ? t('popup_debugEnabled') : t('popup_debugDisabled'),
            [t('popup_debugOnline')]: navigator.onLine ? t('popup_debugYes') : t('popup_debugNo')
        };

        const renderDebugRows = (container, data) => {
            container.innerHTML = '';
            for (const [key, value] of Object.entries(data)) {
                const row = document.createElement('div');
                row.className = 'debug-row';

                const keyEl = document.createElement('span');
                keyEl.className = 'debug-key';
                keyEl.textContent = key;

                const valueEl = document.createElement('span');
                valueEl.className = 'debug-value';

                if (typeof value === 'boolean') {
                    valueEl.textContent = value ? t('popup_debugEnabled') : t('popup_debugDisabled');
                    valueEl.classList.add(value ? 'enabled' : 'disabled');
                } else if (value === 'Active' || value === 'Enabled' || value === 'Yes') {
                    valueEl.textContent = value;
                    valueEl.classList.add('enabled');
                } else if (value === 'Inactive' || value === 'Disabled' || value === 'No' || value === 'None') {
                    valueEl.textContent = value;
                    valueEl.classList.add('disabled');
                } else {
                    valueEl.textContent = String(value);
                }

                row.appendChild(keyEl);
                row.appendChild(valueEl);
                container.appendChild(row);
            }
        };

        renderDebugRows(featuresEl, featureConfig);
        renderDebugRows(sessionEl, sessionInfo);
        renderDebugRows(browserEl, browserInfo);
    } catch (error) { }
}

async function loadUserInfo() {
    const avatarImg = document.getElementById('userAvatar');
    const displayNameEl = document.getElementById('userDisplayName');

    try {
        const userResponse = await fetch('https://users.roblox.com/v1/users/authenticated', {
            credentials: 'include'
        });

        if (!userResponse.ok) {
            if (displayNameEl) {
                displayNameEl.textContent = t('popup_notLoggedIn');
            }
            return;
        }

        const userData = await userResponse.json();
        if (!userData || !userData.id) return;

        if (displayNameEl && userData.displayName) {
            displayNameEl.textContent = userData.displayName;
        }

        if (avatarImg) {
            const avatarResponse = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userData.id}&size=150x150&format=Png&isCircular=true`, {
                credentials: 'include'
            });

            if (avatarResponse.ok) {
                const avatarData = await avatarResponse.json();
                if (avatarData.data && avatarData.data[0] && avatarData.data[0].imageUrl) {
                    avatarImg.src = avatarData.data[0].imageUrl;
                    avatarImg.classList.add('loaded');
                }
            }
        }
    } catch (error) {
        if (displayNameEl) {
            displayNameEl.textContent = t('popup_notLoggedIn');
        }
    }
}

async function checkBanStatus() {
    try {
        const localBan = await chrome.storage.local.get(['purpuraBanned', 'purpuraBanReason', 'purpuraBannedAt']);

        if (localBan.purpuraBanned) {
            await chrome.storage.local.set({ noFeatures: true, noFeaturesReason: localBan.purpuraBanReason });
            return {
                banned: true,
                reason: localBan.purpuraBanReason,
                bannedAt: localBan.purpuraBannedAt
            };
        }

        const response = await chrome.runtime.sendMessage({ action: "checkBanStatus" });

        if (response && response.banned) {
            await chrome.storage.local.set({ noFeatures: true, noFeaturesReason: response.reason });
            return {
                banned: true,
                reason: response.reason,
                expiresAt: response.expiresAt
            };
        }

        await chrome.storage.local.set({ noFeatures: false, noFeaturesReason: null });
        return { banned: false };
    } catch (error) {
        await chrome.storage.local.set({ noFeatures: false, noFeaturesReason: null });
        return { banned: false };
    }
}

function showBlockingBanScreen(reason, expiresAt) {
    let expiresText = t('popup_permanent');
    if (expiresAt) {
        const expiresDate = new Date(expiresAt);
        expiresText = expiresDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    document.body.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #1a0000, #2d0000, #1a0000);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
        ">
            <div style="
                background: linear-gradient(135deg, #3d0000, #1a0000);
                border: 3px solid #ff4444;
                border-radius: 16px;
                padding: 40px;
                max-width: 450px;
                text-align: center;
                box-shadow: 0 8px 32px rgba(255, 68, 68, 0.4), 0 0 60px rgba(255, 68, 68, 0.2);
            ">
                <div style="margin-bottom: 24px;">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ff4444" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                    </svg>
                </div>
                <h2 style="color: #ff4444; margin-bottom: 16px; font-size: 28px; font-weight: bold; font-family: 'Segoe UI', sans-serif;">
                    ${t('popup_accessDenied')}
                </h2>
                <p style="color: #ff8888; margin-bottom: 24px; font-size: 16px; line-height: 1.6; font-family: 'Segoe UI', sans-serif;">
                    ${t('popup_accountBannedFromExtension')}
                </p>
                <div style="
                    background: rgba(255, 68, 68, 0.1);
                    border: 1px solid rgba(255, 68, 68, 0.3);
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 24px;
                ">
                    <div style="margin-bottom: 12px;">
                        <span style="color: #ff8888; font-weight: bold; font-family: 'Segoe UI', sans-serif;">${t('popup_reason')}:</span>
                        <p style="color: #ffffff; margin-top: 4px; font-family: 'Segoe UI', sans-serif;">${reason || t('popup_noReasonProvided')}</p>
                    </div>
                    <div>
                        <span style="color: #ff8888; font-weight: bold; font-family: 'Segoe UI', sans-serif;">${t('popup_expires')}:</span>
                        <p style="color: #ffffff; margin-top: 4px; font-family: 'Segoe UI', sans-serif;">${expiresText}</p>
                    </div>
                </div>
                <p style="color: #888888; margin-bottom: 24px; font-size: 14px; font-family: 'Segoe UI', sans-serif;">
                    ${t('popup_banErrorContact')}
                </p>
                <a 
                    href="https://discord.gg/TT4sgtEkNV" 
                    target="_blank"
                    style="
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        padding: 12px 24px;
                        background: linear-gradient(135deg, #5865F2, #4752C4);
                        border: none;
                        border-radius: 8px;
                        color: white;
                        font-weight: bold;
                        text-decoration: none;
                        font-size: 14px;
                        font-family: 'Segoe UI', sans-serif;
                    "
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0189 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                    </svg>
                    ${t('popup_contactSupportDiscord')}
                </a>
            </div>
        </div>
    `;
}

async function refreshAllRobloxPages() {
    try {
        const tabs = await chrome.tabs.query({ url: "*://*.roblox.com/*" });

        if (tabs.length > 0) {
            for (const tab of tabs) {
                try {
                    await chrome.tabs.reload(tab.id);
                } catch (error) {
                }
            }

            showRefreshNotification(tabs.length);
        }
    } catch (error) {
    }
}

function showRefreshNotification(tabCount) {
    const existingNotice = document.querySelector('.refresh-notice');
    if (existingNotice) {
        existingNotice.remove();
    }

    const notice = document.createElement('div');
    notice.className = 'refresh-notice';
    notice.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        z-index: 10000;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;

    notice.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <span>🔄</span>
            <div>
                <div style="font-weight: 700;">${t('popup_refreshingPages')}</div>
                <div style="font-size: 12px; opacity: 0.9;">${t('popup_robloxTabsUpdated', [String(tabCount), tabCount > 1 ? 's' : ''])}</div>
            </div>
        </div>
    `;

    document.body.appendChild(notice);

    setTimeout(() => {
        notice.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notice.parentNode) {
                notice.parentNode.removeChild(notice);
            }
        }, 300);
    }, 3000);
}

async function getUserId() {
    try {
        const response = await fetch('https://users.roblox.com/v1/users/authenticated', {
            credentials: 'include'
        });

        if (!response.ok) {
            if (response.status === 401) {
                showNotification(t('popup_loginToRoblox'), 'error');
            }
            return null;
        }

        const userData = await response.json();

        if (!userData || !userData.id) {
            showNotification(t('popup_unableGetUserInfo'), 'error');
            return null;
        }

        return userData.id;
    } catch (error) {
        showNotification(t('popup_networkError'), 'error');
        return null;
    }
}

function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const colors = {
        success: 'linear-gradient(135deg, #10B981, #059669)',
        error: 'linear-gradient(135deg, #EF4444, #DC2626)',
        info: 'linear-gradient(135deg, #3B82F6, #2563EB)'
    };

    notification.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: ${colors[type]};
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;

    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}