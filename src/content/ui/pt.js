/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
if (!window.purpuraTabsInitialized) {
    window.purpuraTabsInitialized = true;

    let titleObserver = null;
    let storedConfig = null;

    initializePurpuraTabs();

    function initializePurpuraTabs() {
        window.__PurpuraSettings.ready.then(function() {
            var config = window.__PurpuraSettings.getRaw('pt');

            if (config === undefined) {
                const defaultConfig = {
                    enabled: true,
                    favicon: { type: 'purpura', url: chrome.runtime.getURL('images/icons/default/Purpura_Default_Logo_48.png'), data: null },
                    titleFormat: '{n} Purpura'
                };
                applyPurpuraChanges(defaultConfig);
                setupTitleObserver(defaultConfig);
                window.__PurpuraSettings.set('pt', defaultConfig);
                return;
            }

            if (config.enabled) {
                applyPurpuraChanges(config);
                setupTitleObserver(config);
            } else {
                revertPurpuraChanges();
                removeTitleObserver();
            }
        });
    }

    chrome.storage.onChanged.addListener(changes => {
        if (changes.pt) {
            const config = changes.pt.newValue;
            if (config?.enabled) {
                applyPurpuraChanges(config);
                setupTitleObserver(config);
            } else {
                revertPurpuraChanges();
                removeTitleObserver();
            }
        }
    });

    const PURPURA_ICON_URLS = {
        default: '',
        purpura: chrome.runtime.getURL('images/icons/default/Purpura_Default_Logo_48.png'),
        newYears: chrome.runtime.getURL('images/icons/newYears/Purpura_NewYears_Logo_48.png'),
        lunarNewYear: chrome.runtime.getURL('images/icons/lunarNewYear/Purpura_LunarNewYear_Logo_48.png'),
        valentines: chrome.runtime.getURL('images/icons/valentines/Purpura_Valentines_Logo_48.png'),
        blackHistory: chrome.runtime.getURL('images/icons/blackHistory/Purpura_BlackHistory_Logo_48.png'),
        stPatricksDay: chrome.runtime.getURL('images/icons/stPatricksDay/Purpura_StPatricks_Logo_48.png'),
        womensDay: chrome.runtime.getURL('images/icons/womensDay/Purpura_WomensDay_Logo_48.png'),
        easter: chrome.runtime.getURL('images/icons/easter/Purpura_Easter_Logo_48.png'),
        pride: chrome.runtime.getURL('images/icons/pride/Purpura_Pride_Logo_48.png'),
        halloween: chrome.runtime.getURL('images/icons/halloween/Purpura_Halloween_Logo_48.png'),
        diwali: chrome.runtime.getURL('images/icons/diwali/Purpura_Diwali_Logo_48.png'),
        hanukkah: chrome.runtime.getURL('images/icons/hanukkah/Purpura_Hanukkah_Logo_48.png'),
        christmas: chrome.runtime.getURL('images/icons/christmas/Purpura_Christmas_Logo_48.png'),
    };

    function applyPurpuraChanges(config) {
        let faviconUrl = '/favicon.ico';
        const iconType = config.favicon?.type || 'purpura';
        if (iconType === 'custom' && config.favicon?.data) {
            faviconUrl = config.favicon.data;
        } else if (iconType === 'default') {
            faviconUrl = '/favicon.ico';
        } else {
            faviconUrl = PURPURA_ICON_URLS[iconType] || PURPURA_ICON_URLS.purpura;
        }
        
        let link = document.querySelector("link[rel~='icon']") || document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = faviconUrl;
        document.head.appendChild(link);
        
        applyTitleFormat(config);
    }

    function applyTitleFormat(config) {
        let newTitle = config.titleFormat || '{n} Purpura';
        let currentTitle = document.title || 'Roblox'; 
        
        const originalTitle = extractOriginalTitle(currentTitle);
        
        if (newTitle.includes('{title}')) {
            newTitle = newTitle.replace('{title}', originalTitle);
        }
        
        if (newTitle.includes('{n}')) {
            newTitle = newTitle.replace('{n}', '( ✦ )');
        } else {
            newTitle = newTitle.replace(/ \( ✦ \)/g, '');
            currentTitle = currentTitle.replace(/ \( ✦ \)/g, '');
        }
        
        if (currentTitle !== newTitle) {
            document.title = newTitle;
        }
    }

    function extractOriginalTitle(title) {
        if (!title || typeof title !== 'string') {
            return 'Roblox'; 
        }
        
        return title
            .replace(/ \(w\/ Purpura\).*$/, '')
            .replace(/^.*\|\s*/, '')
            .replace(/^🎮\s*/, '')
            .replace(/\s*\( ✦ \).*$/, '') 
            .replace(/^.*Purpura\s*/, '')
            .replace(/^\s*\( ✦ \)\s*/, '') 
            .trim() || 'Roblox';
    }

    function revertPurpuraChanges() {
        const link = document.querySelector("link[rel~='icon']");
        if (link) {
            link.href = '/favicon.ico';
        }
        
        const originalTitle = extractOriginalTitle(document.title);
        document.title = originalTitle;
    }

    function setupTitleObserver(config) {
        storedConfig = config;
        removeTitleObserver(); 
        
        const expectedTitle = generateExpectedTitle(config);
        let isUpdatingTitle = false;
        let titleLocked = false;
        
        const originalTitleElementSetter = Object.getOwnPropertyDescriptor(HTMLTitleElement.prototype, 'textContent');
        const originalInnerTextSetter = Object.getOwnPropertyDescriptor(HTMLTitleElement.prototype, 'innerText');
        
        const originalDocumentTitleSetter = Object.getOwnPropertyDescriptor(Document.prototype, 'title').set;
        const originalDocumentTitleGetter = Object.getOwnPropertyDescriptor(Document.prototype, 'title').get;
        
        const mainTitleElement = document.querySelector('title');
        
        titleLocked = true;
        if (mainTitleElement) {
            mainTitleElement.textContent = expectedTitle;
        }
        originalDocumentTitleSetter.call(document, expectedTitle);
        
        if (originalTitleElementSetter && originalTitleElementSetter.set) {
            Object.defineProperty(HTMLTitleElement.prototype, 'textContent', {
                set: function(value) {
                    if (!titleLocked || isUpdatingTitle) {
                        originalTitleElementSetter.set.call(this, value);
                    } else {
                        originalTitleElementSetter.set.call(this, expectedTitle);
                    }
                },
                get: originalTitleElementSetter.get,
                configurable: true
            });
        }
        
        if (originalInnerTextSetter && originalInnerTextSetter.set) {
            Object.defineProperty(HTMLTitleElement.prototype, 'innerText', {
                set: function(value) {
                    if (!titleLocked || isUpdatingTitle) {
                        originalInnerTextSetter.set.call(this, value);
                    } else {
                        originalInnerTextSetter.set.call(this, expectedTitle);
                    }
                },
                get: originalInnerTextSetter.get,
                configurable: true
            });
        }
        
        Object.defineProperty(document, 'title', {
            set: function(value) {
                if (!titleLocked || isUpdatingTitle) {
                    originalDocumentTitleSetter.call(this, value);
                } else {
                    originalDocumentTitleSetter.call(this, expectedTitle);
                }
            },
            get: function() {
                return titleLocked ? expectedTitle : originalDocumentTitleGetter.call(this);
            },
            configurable: true
        });
        
        const securityWatcher = new MutationObserver((mutations) => {
            if (titleLocked && !isUpdatingTitle) {
                mutations.forEach(mutation => {
                    if (mutation.type === 'childList' || mutation.type === 'characterData') {
                        const currentTitle = document.querySelector('title');
                        if (currentTitle && currentTitle.textContent !== expectedTitle) {
                            isUpdatingTitle = true;
                            currentTitle.textContent = expectedTitle;
                            setTimeout(() => { isUpdatingTitle = false; }, 1);
                        }
                    }
                });
            }
        });
        
        if (mainTitleElement) {
            securityWatcher.observe(mainTitleElement, {
                childList: true,
                characterData: true,
                subtree: true
            });
        }
        
        const nuclearWatcher = setInterval(() => {
            if (titleLocked && !isUpdatingTitle) {
                const currentTitleElement = document.querySelector('title');
                if (currentTitleElement && currentTitleElement.textContent !== expectedTitle) {
                    isUpdatingTitle = true;
                    currentTitleElement.textContent = expectedTitle;
                    setTimeout(() => { isUpdatingTitle = false; }, 1);
                }
                
                if (originalDocumentTitleGetter.call(document) !== expectedTitle) {
                    isUpdatingTitle = true;
                    originalDocumentTitleSetter.call(document, expectedTitle);
                    setTimeout(() => { isUpdatingTitle = false; }, 1);
                }
            }
        }, 1); 
        titleObserver = {
            disconnect: () => securityWatcher.disconnect(),
            nuclearWatcher: nuclearWatcher,
            originalTitleElementSetter: originalTitleElementSetter,
            originalInnerTextSetter: originalInnerTextSetter,
            originalDocumentTitleSetter: originalDocumentTitleSetter,
            originalDocumentTitleGetter: originalDocumentTitleGetter,
            titleLocked: true,
            unlock: () => { titleLocked = false; }
        };
    }

    function generateExpectedTitle(config, currentTitle = null) {
        let newTitle = config.titleFormat || '{n} Purpura';
        
        if (currentTitle) {
            const originalTitle = extractOriginalTitle(currentTitle);
            if (newTitle.includes('{title}')) {
                newTitle = newTitle.replace('{title}', originalTitle);
            }
        } else {
            if (newTitle.includes('{title}')) {
                newTitle = newTitle.replace('{title}', 'Roblox');
            }
        }
        
        if (newTitle.includes('{n}')) {
            newTitle = newTitle.replace('{n}', '( ✦ )');
        }
        return newTitle;
    }

    function removeTitleObserver() {
        if (titleObserver) {
            titleObserver.disconnect();
            
            if (titleObserver.nuclearWatcher) {
                clearInterval(titleObserver.nuclearWatcher);
            }
            
            if (titleObserver.originalTitleElementSetter) {
                Object.defineProperty(HTMLTitleElement.prototype, 'textContent', titleObserver.originalTitleElementSetter);
            }
            
            if (titleObserver.originalInnerTextSetter) {
                Object.defineProperty(HTMLTitleElement.prototype, 'innerText', titleObserver.originalInnerTextSetter);
            }
            
            if (titleObserver.originalDocumentTitleSetter) {
                Object.defineProperty(document, 'title', {
                    set: titleObserver.originalDocumentTitleSetter,
                    get: titleObserver.originalDocumentTitleGetter,
                    configurable: true
                });
            }
            
            if (titleObserver.unlock) {
                titleObserver.unlock();
            }
            
            titleObserver = null;
        }
        storedConfig = null;
    }
}
