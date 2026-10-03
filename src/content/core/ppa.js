/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
    if (window.Purpura && window.Purpura.copyDebug) return;
    window.Purpura = window.Purpura || {};
    
    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        let success = false;
        try {
            success = document.execCommand('copy');
        } catch (e) {}
        document.body.removeChild(textarea);
        return success;
    }
    
    window.Purpura.migrateKeys = function() {
        return new Promise((resolve) => {
            const handler = (event) => {
                document.removeEventListener('purpura-migrate-keys-response', handler);
                resolve(event.detail || { success: false, error: 'empty_response', migrated: 0 });
            };

            document.addEventListener('purpura-migrate-keys-response', handler);
            document.dispatchEvent(new CustomEvent('purpura-migrate-keys'));

            setTimeout(() => {
                document.removeEventListener('purpura-migrate-keys-response', handler);
                resolve({ success: false, error: 'timeout', migrated: 0 });
            }, 15000);
        });
    };

    window.Purpura.copyDebug = function() {
        return new Promise((resolve) => {
            const handler = async (event) => {
                document.removeEventListener('purpura-copy-debug-response', handler);
                if (event.detail.error) {
                    console.log('%c✗ Failed to copy debug info', 'color: #f44336; font-weight: bold;');
                    resolve('Failed to copy debug info');
                } else {
                    let copied = false;
                    try {
                        await navigator.clipboard.writeText(event.detail.debugText);
                        copied = true;
                    } catch (e) {
                        copied = fallbackCopy(event.detail.debugText);
                    }
                    
                    if (copied) {
                        console.log('%c✓ Debug info copied to clipboard!', 'color: #4caf50; font-weight: bold;');
                        resolve('Debug info copied to clipboard!');
                    } else {
                        console.log('%c✗ Failed to copy to clipboard', 'color: #f44336; font-weight: bold;');
                        resolve('Failed to copy to clipboard');
                    }
                }
            };
            document.addEventListener('purpura-copy-debug-response', handler);
            document.dispatchEvent(new CustomEvent('purpura-copy-debug-request'));
        });
    };
})();
