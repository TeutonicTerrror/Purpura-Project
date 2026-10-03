/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(() => {
    'use strict';
    
    if (window.purpuraCursorInitialized) return;
    window.purpuraCursorInitialized = true;

    let currentCursor = 'auto';
    let currentPreset = 'default';
    let styleElement = null;
    let isEnabled = false;
    let vfxCleanup = null;
    let dragCleanup = null;

    const CURSORS = {
        default: { cursor: 'auto' },
        purpura: { cursor: 'url("data:image/svg+xml;charset=utf8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'28\' height=\'28\' viewBox=\'0 0 28 28\'%3E%3Cdefs%3E%3ClinearGradient id=\'ag\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' stop-color=\'%23f0e6ff\'/%3E%3Cstop offset=\'100%25\' stop-color=\'%23a78bfa\'/%3E%3C/linearGradient%3E%3Cfilter id=\'gw\' x=\'-40%25\' y=\'-40%25\' width=\'180%25\' height=\'180%25\'%3E%3CfeGaussianBlur in=\'SourceGraphic\' stdDeviation=\'1.5\' result=\'b\'/%3E%3CfeMerge%3E%3CfeMergeNode in=\'b\'/%3E%3CfeMergeNode in=\'SourceGraphic\'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Cg filter=\'url(%23gw)\'%3E%3Cpath d=\'M4 2L4 22L9 15L13 24L16 22L12 13L20 13Z\' fill=\'url(%23ag)\' stroke=\'%232d1060\' stroke-width=\'1\' stroke-linejoin=\'round\'/%3E%3C/g%3E%3C/svg%3E") 4 2, auto' },
        dot: { cursor: 'url("data:image/svg+xml;charset=utf8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 16 16\'%3E%3Ccircle cx=\'8\' cy=\'8\' r=\'4\' fill=\'white\' stroke=\'black\' stroke-width=\'1.5\'/%3E%3C/svg%3E") 8 8, auto' },
        bolt: { cursor: 'url("data:image/svg+xml;charset=utf8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'22\' height=\'32\' viewBox=\'0 0 22 32\'%3E%3Cdefs%3E%3Cfilter id=\'gw\' x=\'-50%25\' y=\'-50%25\' width=\'200%25\' height=\'200%25\'%3E%3CfeGaussianBlur in=\'SourceGraphic\' stdDeviation=\'2\' result=\'b\'/%3E%3CfeMerge%3E%3CfeMergeNode in=\'b\'/%3E%3CfeMergeNode in=\'SourceGraphic\'/%3E%3C/feMerge%3E%3C/filter%3E%3ClinearGradient id=\'blg\' x1=\'0%25\' y1=\'0%25\' x2=\'50%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' stop-color=\'%23ffffff\'/%3E%3Cstop offset=\'35%25\' stop-color=\'%237dd3fc\'/%3E%3Cstop offset=\'100%25\' stop-color=\'%23facc15\'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cpath d=\'M15 2L5 17H12L7 30L22 13H14Z\' fill=\'%237dd3fc\' opacity=\'0.5\' filter=\'url(%23gw)\'/%3E%3Cpath d=\'M15 2L5 17H12L7 30L22 13H14Z\' fill=\'url(%23blg)\' stroke=\'%23bfdbfe\' stroke-width=\'0.75\' stroke-linejoin=\'round\'/%3E%3C/svg%3E") 15 2, auto' },
        ghost: { cursor: 'url("data:image/svg+xml;charset=utf8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'22\' height=\'28\' viewBox=\'0 0 22 28\'%3E%3Cpath d=\'M11 2C5.5 2 2 6.5 2 12v14l2.5-2.5 2.5 2.5 2.5-2.5 2.5 2.5 2.5-2.5 2.5 2.5V12C20 6.5 16.5 2 11 2Z\' fill=\'white\' stroke=\'%23111\' stroke-width=\'1.5\'/%3E%3Ccircle cx=\'8\' cy=\'12\' r=\'1.5\' fill=\'%23333\'/%3E%3Ccircle cx=\'14\' cy=\'12\' r=\'1.5\' fill=\'%23333\'/%3E%3C/svg%3E") 11 2, auto' },
        nova: { cursor: 'url("data:image/svg+xml;charset=utf8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'28\' height=\'28\' viewBox=\'0 0 28 28\'%3E%3Cdefs%3E%3ClinearGradient id=\'ng\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' stop-color=\'%23fef9c3\'/%3E%3Cstop offset=\'100%25\' stop-color=\'%23f59e0b\'/%3E%3C/linearGradient%3E%3CradialGradient id=\'ngc\' cx=\'50%25\' cy=\'50%25\'%3E%3Cstop offset=\'0%25\' stop-color=\'%23fff7d6\'/%3E%3Cstop offset=\'100%25\' stop-color=\'%23fbbf24\'/%3E%3C/radialGradient%3E%3Cfilter id=\'nf\' x=\'-50%25\' y=\'-50%25\' width=\'200%25\' height=\'200%25\'%3E%3CfeGaussianBlur in=\'SourceGraphic\' stdDeviation=\'2\' result=\'b\'/%3E%3CfeMerge%3E%3CfeMergeNode in=\'b\'/%3E%3CfeMergeNode in=\'SourceGraphic\'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Ccircle cx=\'14\' cy=\'14\' r=\'7\' fill=\'%23fde68a\' opacity=\'0.2\'/%3E%3Cg stroke=\'url(%23ng)\' stroke-linecap=\'round\'%3E%3Cline x1=\'14\' y1=\'3\' x2=\'14\' y2=\'10\' stroke-width=\'2\'/%3E%3Cline x1=\'14\' y1=\'18\' x2=\'14\' y2=\'25\' stroke-width=\'2\'/%3E%3Cline x1=\'3\' y1=\'14\' x2=\'10\' y2=\'14\' stroke-width=\'2\'/%3E%3Cline x1=\'18\' y1=\'14\' x2=\'25\' y2=\'14\' stroke-width=\'2\'/%3E%3Cline x1=\'5.8\' y1=\'5.8\' x2=\'10.5\' y2=\'10.5\' stroke-width=\'1.5\'/%3E%3Cline x1=\'17.5\' y1=\'17.5\' x2=\'22.2\' y2=\'22.2\' stroke-width=\'1.5\'/%3E%3Cline x1=\'22.2\' y1=\'5.8\' x2=\'17.5\' y2=\'10.5\' stroke-width=\'1.5\'/%3E%3Cline x1=\'5.8\' y1=\'22.2\' x2=\'10.5\' y2=\'17.5\' stroke-width=\'1.5\'/%3E%3C/g%3E%3Ccircle cx=\'14\' cy=\'14\' r=\'3.5\' fill=\'url(%23ngc)\' filter=\'url(%23nf)\'/%3E%3C/svg%3E") 14 14, auto' }
    };

    function svgToBase64(svg) {
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    }

    function getCursorCSS(pcrData) {
        if (!pcrData) return 'auto';
        if (pcrData.type === 'custom' && pcrData.cursor) return pcrData.cursor;
        const preset = CURSORS[pcrData.preset];
        if (preset) {
            if (preset.cursor === 'auto') return 'auto';
            const m = preset.cursor.match(/url\("data:image\/svg\+xml;charset=utf8,(.+?)"\)/);
            if (m) {
                const svg = decodeURIComponent(m[1]);
                const hotspot = preset.cursor.replace(/.*"\)\s*(\d+\s+\d+).*/, '$1') || '0 0';
                return 'url(' + svgToBase64(svg) + ') ' + hotspot + ', auto';
            }
            return preset.cursor;
        }
        return pcrData.cursor || 'auto';
    }

    function initializeCursors() {
        window.__PurpuraSettings.ready.then(function() {
            const data = window.__PurpuraSettings.get('pcr');
            if (data) {
                isEnabled = data.enabled === true;
                const cursorCSS = getCursorCSS(data);
                if (isEnabled) {
                    applyCursorToPage(cursorCSS);
                    currentPreset = data.preset || 'default';
                    updateVFX(currentPreset, data.trailEffects !== false);
                }
            }
        });
        
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'updateCursor') {
                if (isEnabled) {
                    applyCursorToPage(message.cursor);
                }
                sendResponse({success: true});
            }
        });
        
        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'local' && changes.pcr) {
                const newData = window.__PurpuraSettings.get('pcr');
                if (newData) {
                    isEnabled = newData.enabled === true;
                    const cursorCSS = getCursorCSS(newData);
                    if (isEnabled && cursorCSS !== 'auto') {
                        applyCursorToPage(cursorCSS);
                        currentPreset = newData.preset || 'default';
                        updateVFX(currentPreset, newData.trailEffects !== false);
                    } else {
                        applyCursorToPage('auto');
                        stopVFX();
                        if (dragCleanup) { dragCleanup(); dragCleanup = null; }
                        document.documentElement.classList.remove('purpura-cursor-override');
                    }
                }
            }
        });
    }

    function stopVFX() {
        const host = document.getElementById('purpura-vfx-host');
        if (host) {
            host.style.display = 'none';
            host.replaceChildren();
        }
        if (vfxCleanup) {
            vfxCleanup();
            vfxCleanup = null;
        }
    }

    function updateVFX(preset, trailEnabled) {
        stopVFX();
        if (!isEnabled) return;
        if (trailEnabled === false) return;
        ensurePcrStyles();
        if (preset === 'purpura') startPurpuraTrail();
        else if (preset === 'nova') startNovaGlow();
        else if (preset === 'ghost') startGhostTrail();
        else if (preset === 'bolt') startBoltTrail();
        else if (preset === 'dot') startDotTrail();
    }

    function ensurePcrStyles() {
        if (document.getElementById('purpura-pcr-vars')) return;
        var s = document.createElement('style');
        s.id = 'purpura-pcr-vars';
        s.textContent = ':root{' +
            '--purpura-pcr-purpura-1:#e9d5ff;--purpura-pcr-purpura-2:#c4b5fd;--purpura-pcr-purpura-3:#a78bfa;' +
            '--purpura-pcr-purpura-4:#f0e6ff;--purpura-pcr-purpura-5:#ddd6fe;--purpura-pcr-purpura-6:#ede9fe;' +
            '--purpura-pcr-ghost-glow-start:rgba(180,255,210,0.55);--purpura-pcr-ghost-glow-end:rgba(180,255,210,0.1);' +
            '--purpura-pcr-ghost-color-1:rgba(210,255,230,0.55);--purpura-pcr-ghost-color-2:rgba(200,240,255,0.5);' +
            '--purpura-pcr-ghost-color-3:rgba(230,220,255,0.5);--purpura-pcr-ghost-color-4:rgba(255,255,255,0.45);' +
            '--purpura-pcr-dot-rgb:255,255,255;' +
            '--purpura-pcr-bolt-1:#ffffff;--purpura-pcr-bolt-2:#e0f0ff;--purpura-pcr-bolt-3:#7dd3fc;' +
            '--purpura-pcr-bolt-4:#facc15;--purpura-pcr-bolt-5:#fde68a;--purpura-pcr-bolt-6:#bfdbfe;' +
            '--purpura-pcr-bolt-arc-glow-1:#7dd3fc;--purpura-pcr-bolt-arc-glow-2:#bfdbfe;' +
            '--purpura-pcr-bolt-flash-center:rgba(255,255,255,0.9);--purpura-pcr-bolt-flash-mid:rgba(125,211,252,0.5);' +
            '--purpura-pcr-nova-1:#fef9c3;--purpura-pcr-nova-2:#fde68a;--purpura-pcr-nova-3:#fbbf24;--purpura-pcr-nova-4:#f59e0b;' +
            '--purpura-pcr-nova-5:#fef08a;--purpura-pcr-nova-6:#fcd34d;--purpura-pcr-nova-7:#fff7d6;--purpura-pcr-nova-8:#fffbeb;' +
            '--purpura-pcr-nova-ring-border:rgba(251,191,36,0.75);--purpura-pcr-nova-ring-glow-1:rgba(251,191,36,0.4);' +
            '--purpura-pcr-nova-ring-glow-2:rgba(254,243,199,0.2);--purpura-pcr-nova-flare-center:rgba(255,251,235,0.95);' +
            '--purpura-pcr-nova-flare-mid:rgba(251,191,36,0.6);--purpura-pcr-nova-flare-glow-1:rgba(251,191,36,0.7);' +
            '--purpura-pcr-nova-flare-glow-2:rgba(254,243,199,0.3)}';
        document.head.appendChild(s);
    }

    function startPurpuraTrail() {
        ensurePcrStyles();
        const host = document.createElement('div');
        host.id = 'purpura-vfx-host';
        host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647;overflow:hidden;';

        const style = document.createElement('style');
        style.textContent = `
            @keyframes purpura-spark {
                0%   { opacity: 0.9; transform: translate(-50%,-50%) scale(1) translateY(0); }
                100% { opacity: 0;   transform: translate(-50%,-50%) scale(0.1) translateY(-18px); }
            }
            .purpura-spark {
                position: fixed;
                border-radius: 50%;
                pointer-events: none;
                animation: purpura-spark 0.55s ease-out forwards;
            }
        `;
        host.appendChild(style);
        document.body.appendChild(host);

        const COLORS = ['var(--purpura-pcr-purpura-1)','var(--purpura-pcr-purpura-2)','var(--purpura-pcr-purpura-3)','var(--purpura-pcr-purpura-4)','var(--purpura-pcr-purpura-5)','var(--purpura-pcr-purpura-6)'];
        let lastX = -999, lastY = -999;

        const onMove = (e) => {
            const dx = e.clientX - lastX, dy = e.clientY - lastY;
            if (dx * dx + dy * dy < 120) return;
            lastX = e.clientX;
            lastY = e.clientY;

            const count = 2 + Math.floor(Math.random() * 2);
            for (let i = 0; i < count; i++) {
                const sp = document.createElement('div');
                sp.className = 'purpura-spark';
                const size = 3 + Math.random() * 4;
                sp.style.cssText = `
                    left:${e.clientX + (Math.random() - 0.5) * 14}px;
                    top:${e.clientY + (Math.random() - 0.5) * 14}px;
                    width:${size}px;
                    height:${size}px;
                    background:${COLORS[Math.floor(Math.random() * COLORS.length)]};
                    animation-duration:${0.38 + Math.random() * 0.3}s;
                    animation-delay:${Math.random() * 0.04}s;
                `;
                host.appendChild(sp);
                sp.addEventListener('animationend', () => sp.remove(), { once: true });
            }
        };

        document.addEventListener('mousemove', onMove);
        vfxCleanup = () => {
            document.removeEventListener('mousemove', onMove);
            host.remove();
        };
    }

    function startGhostTrail() {
        const host = document.createElement('div');
        host.id = 'purpura-vfx-host';
        host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647;';

        const style = document.createElement('style');
        style.textContent = `
            @keyframes ghost-silhouette {
                0%   { opacity: var(--start-opacity); transform: translate(-50%, 0px)   scale(1);    filter: blur(0px) drop-shadow(0 0 6px var(--purpura-pcr-ghost-glow-start)); }
                70%  { opacity: calc(var(--start-opacity) * 0.4); }
                100% { opacity: 0;                                transform: translate(-50%, -60px) scale(0.6);  filter: blur(3px) drop-shadow(0 0 2px var(--purpura-pcr-ghost-glow-end)); }
            }
            .ghost-silhouette {
                position: fixed;
                pointer-events: none;
                animation: ghost-silhouette var(--dur) ease-out forwards;
            }
        `;
        host.appendChild(style);
        document.body.appendChild(host);

        const GHOST_PATH = 'M10,0 C4.477,0 0,4.477 0,10 L0,26 Q2.5,22.5 5,26 Q7.5,22.5 10,26 Q12.5,22.5 15,26 Q17.5,22.5 20,26 L20,10 C20,4.477 15.523,0 10,0 Z';
        const GHOST_COLORS = [
            'var(--purpura-pcr-ghost-color-1)',
            'var(--purpura-pcr-ghost-color-2)',
            'var(--purpura-pcr-ghost-color-3)',
            'var(--purpura-pcr-ghost-color-4)',
        ];

        let lastX = -999, lastY = -999;

        const onMove = (e) => {
            const dx = e.clientX - lastX, dy = e.clientY - lastY;
            if (dx * dx + dy * dy < 200) return;
            lastX = e.clientX;
            lastY = e.clientY;

            const size = 10 + Math.random() * 6;
            const color = GHOST_COLORS[Math.floor(Math.random() * GHOST_COLORS.length)];
            const dur = (1.8 + Math.random() * 0.8).toFixed(2) + 's';
            const startOpacity = 0.5 + Math.random() * 0.25;
            const offsetX = (Math.random() - 0.5) * 6;

            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 20 26');
            svg.setAttribute('width', size);
            svg.setAttribute('height', size * 1.3);
            svg.classList.add('ghost-silhouette');
            svg.style.cssText = `
                left: ${e.clientX + offsetX}px;
                top: ${e.clientY}px;
                --dur: ${dur};
                --start-opacity: ${startOpacity};
            `;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', GHOST_PATH);
            path.setAttribute('fill', color);
            svg.appendChild(path);

            host.appendChild(svg);
            svg.addEventListener('animationend', () => svg.remove(), { once: true });
        };

        document.addEventListener('mousemove', onMove);
        vfxCleanup = () => {
            document.removeEventListener('mousemove', onMove);
            host.remove();
        };
    }

    function startDotTrail() {
        const host = document.createElement('div');
        host.id = 'purpura-vfx-host';
        host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647;overflow:hidden;';

        const style = document.createElement('style');
        style.textContent = `
            @keyframes dot-streak-fade {
                0%   { opacity: var(--start-op); }
                100% { opacity: 0; }
            }
            .dot-streak {
                position: fixed;
                pointer-events: none;
                border-radius: 9999px;
                transform-origin: center center;
                animation: dot-streak-fade var(--dur) ease-out forwards;
            }
        `;
        host.appendChild(style);
        document.body.appendChild(host);

        let lastX = -999, lastY = -999;
        const STROKE_COLOR = 'var(--purpura-pcr-dot-rgb)';

        const onMove = (e) => {
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;
            const dist2 = dx * dx + dy * dy;
            if (dist2 < 18) return;

            const angle = Math.atan2(dy, dx);
            const dist = Math.sqrt(dist2);
            const len = Math.min(dist * 1.1, 36) + 8;
            const thickness = 5 + Math.random() * 3;

            const el = document.createElement('div');
            el.className = 'dot-streak';
            const dur = (0.35 + Math.random() * 0.2).toFixed(2) + 's';
            const op = (0.55 + Math.random() * 0.3).toFixed(2);
            el.style.cssText = `
                left: ${(lastX + e.clientX) / 2}px;
                top: ${(lastY + e.clientY) / 2}px;
                width: ${len}px;
                height: ${thickness}px;
                background: rgba(${STROKE_COLOR}, 0.65);
                box-shadow: 0 0 ${thickness * 2}px rgba(${STROKE_COLOR}, 0.7), 0 0 ${thickness * 5}px rgba(${STROKE_COLOR}, 0.25);
                transform: translate(-50%, -50%) rotate(${angle}rad);
                --dur: ${dur};
                --start-op: ${op};
            `;
            host.appendChild(el);
            el.addEventListener('animationend', () => el.remove(), { once: true });

            lastX = e.clientX;
            lastY = e.clientY;
        };

        document.addEventListener('mousemove', onMove);
        vfxCleanup = () => {
            document.removeEventListener('mousemove', onMove);
            host.remove();
        };
    }

    function startBoltTrail() {
        const host = document.createElement('div');
        host.id = 'purpura-vfx-host';
        host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647;overflow:hidden;';

        const style = document.createElement('style');
        style.textContent = `
            @keyframes bolt-spark {
                0%   { opacity: 1;   transform: translate(-50%,-50%) scale(1) translate(0,0); }
                100% { opacity: 0;   transform: translate(-50%,-50%) scale(0) translate(var(--bx),var(--by)); }
            }
            @keyframes bolt-arc {
                0%   { opacity: 0.9; transform: translate(-50%,-50%) scaleX(1); }
                100% { opacity: 0;   transform: translate(-50%,-50%) scaleX(0.1); }
            }
            @keyframes bolt-flash {
                0%   { opacity: 0.7; transform: translate(-50%,-50%) scale(1); }
                50%  { opacity: 1;   transform: translate(-50%,-50%) scale(1.6); }
                100% { opacity: 0;   transform: translate(-50%,-50%) scale(0.3); }
            }
            .bolt-spark {
                position: fixed;
                border-radius: 50%;
                pointer-events: none;
                animation: bolt-spark 0.35s ease-out forwards;
            }
            .bolt-arc {
                position: fixed;
                height: 2px;
                border-radius: 1px;
                pointer-events: none;
                transform-origin: left center;
                animation: bolt-arc 0.25s ease-out forwards;
            }
            .bolt-flash {
                position: fixed;
                border-radius: 50%;
                pointer-events: none;
                animation: bolt-flash 0.2s ease-out forwards;
            }
        `;
        host.appendChild(style);
        document.body.appendChild(host);

        const SPARK_COLORS = [
            'var(--purpura-pcr-bolt-1)',
            'var(--purpura-pcr-bolt-2)',
            'var(--purpura-pcr-bolt-3)',
            'var(--purpura-pcr-bolt-4)',
            'var(--purpura-pcr-bolt-5)',
            'var(--purpura-pcr-bolt-6)',
        ];
        let lastX = -999, lastY = -999;

        const onMove = (e) => {
            const dx = e.clientX - lastX, dy = e.clientY - lastY;
            const dist2 = dx * dx + dy * dy;
            if (dist2 < 60) return;
            lastX = e.clientX;
            lastY = e.clientY;

            const speed = Math.min(Math.sqrt(dist2), 60);
            const sparkCount = 2 + Math.floor(speed / 12);

            for (let i = 0; i < sparkCount; i++) {
                const el = document.createElement('div');
                el.className = 'bolt-spark';
                const size = 2 + Math.random() * 4;
                const angle = Math.random() * Math.PI * 2;
                const spread = 6 + Math.random() * 14;
                const bx = Math.cos(angle) * spread;
                const by = Math.sin(angle) * spread;
                const color = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];
                el.style.cssText = `
                    left:${e.clientX + (Math.random() - 0.5) * 10}px;
                    top:${e.clientY + (Math.random() - 0.5) * 10}px;
                    width:${size}px;
                    height:${size}px;
                    background:${color};
                    box-shadow:0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color};
                    --bx:${bx}px;
                    --by:${by}px;
                    animation-duration:${0.2 + Math.random() * 0.2}s;
                `;
                host.appendChild(el);
                el.addEventListener('animationend', () => el.remove(), { once: true });
            }

            if (Math.random() < 0.4) {
                const arc = document.createElement('div');
                arc.className = 'bolt-arc';
                const arcAngle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.8;
                const arcLen = 12 + Math.random() * 20;
                arc.style.cssText = `
                    left:${e.clientX}px;
                    top:${e.clientY}px;
                    width:${arcLen}px;
                    background:${SPARK_COLORS[Math.floor(Math.random() * 3)]};
                    box-shadow:0 0 4px var(--purpura-pcr-bolt-arc-glow-1), 0 0 8px var(--purpura-pcr-bolt-arc-glow-2);
                    transform-origin:left center;
                    transform:translate(-50%,-50%) rotate(${arcAngle}rad);
                    animation-duration:${0.15 + Math.random() * 0.1}s;
                `;
                host.appendChild(arc);
                arc.addEventListener('animationend', () => arc.remove(), { once: true });
            }

            if (speed > 30 && Math.random() < 0.3) {
                const flash = document.createElement('div');
                flash.className = 'bolt-flash';
                const fs = 10 + Math.random() * 10;
                flash.style.cssText = `
                    left:${e.clientX}px;
                    top:${e.clientY}px;
                    width:${fs}px;
                    height:${fs}px;
                    background:radial-gradient(circle, var(--purpura-pcr-bolt-flash-center) 0%, var(--purpura-pcr-bolt-flash-mid) 50%, transparent 70%);
                    animation-duration:${0.15 + Math.random() * 0.1}s;
                `;
                host.appendChild(flash);
                flash.addEventListener('animationend', () => flash.remove(), { once: true });
            }
        };

        document.addEventListener('mousemove', onMove);
        vfxCleanup = () => {
            document.removeEventListener('mousemove', onMove);
            host.remove();
        };
    }

    function startNovaGlow() {
        const host = document.createElement('div');
        host.id = 'purpura-vfx-host';
        host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647;';
        document.body.appendChild(host);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes nova-ember {
                0%   { opacity: var(--so); transform: translate(-50%,-50%) scale(1) translate(0px,0px); }
                100% { opacity: 0;         transform: translate(-50%,-50%) scale(0.2) translate(var(--nx),var(--ny)); }
            }
            .nova-ember {
                position: fixed;
                border-radius: 50%;
                pointer-events: none;
                animation: nova-ember var(--nd) ease-out forwards;
            }
            @keyframes nova-ray {
                from { opacity: 0.85; height: var(--rl); }
                to   { opacity: 0;    height: 0; }
            }
            .nova-ray {
                position: absolute;
                border-radius: 9999px;
                pointer-events: none;
                transform-origin: bottom center;
                animation: nova-ray var(--nd) ease-out forwards;
            }
            @keyframes nova-ring {
                0%   { opacity: 0.75; transform: translate(-50%,-50%) scale(0.15); }
                100% { opacity: 0;    transform: translate(-50%,-50%) scale(3); }
            }
            .nova-ring {
                position: fixed;
                border-radius: 50%;
                pointer-events: none;
                animation: nova-ring 0.6s ease-out forwards;
            }
            @keyframes nova-flare {
                0%   { opacity: 0.9; transform: translate(-50%,-50%) scale(0.4); }
                40%  { opacity: 1;   transform: translate(-50%,-50%) scale(1.4); }
                100% { opacity: 0;   transform: translate(-50%,-50%) scale(0.2); }
            }
            .nova-flare {
                position: fixed;
                border-radius: 50%;
                pointer-events: none;
                animation: nova-flare 0.22s ease-out forwards;
            }
        `;
        host.appendChild(style);

        const COLORS = ['var(--purpura-pcr-nova-1)','var(--purpura-pcr-nova-2)','var(--purpura-pcr-nova-3)','var(--purpura-pcr-nova-4)','var(--purpura-pcr-nova-5)','var(--purpura-pcr-nova-6)','var(--purpura-pcr-nova-7)','var(--purpura-pcr-nova-8)'];
        let lastX = -999, lastY = -999, moveCount = 0;

        const onMove = (e) => {
            const x = e.clientX, y = e.clientY;
            const dx = x - lastX, dy = y - lastY;
            const dist2 = dx * dx + dy * dy;
            if (dist2 < 22) return;
            moveCount++;

            const speed = Math.sqrt(dist2);
            const emberCount = 2 + Math.floor(speed / 16);
            for (let i = 0; i < Math.min(emberCount, 5); i++) {
                const el = document.createElement('div');
                el.className = 'nova-ember';
                const size = 2.5 + Math.random() * 5;
                const angle = Math.random() * Math.PI * 2;
                const spread = 14 + Math.random() * 26;
                const color = COLORS[Math.floor(Math.random() * COLORS.length)];
                const dur = (0.45 + Math.random() * 0.35).toFixed(2);
                el.style.cssText = `
                    left:${x + (Math.random() - 0.5) * 8}px;
                    top:${y + (Math.random() - 0.5) * 8}px;
                    width:${size}px;
                    height:${size}px;
                    background:${color};
                    box-shadow:0 0 ${size * 2.5}px ${color}, 0 0 ${size * 5}px ${COLORS[0]};
                    --nx:${(Math.cos(angle) * spread).toFixed(1)}px;
                    --ny:${(Math.sin(angle) * spread).toFixed(1)}px;
                    --nd:${dur}s;
                    --so:${(0.7 + Math.random() * 0.25).toFixed(2)};
                `;
                host.appendChild(el);
                el.addEventListener('animationend', () => el.remove(), { once: true });
            }

            if (dist2 > 180) {
                const rayCount = 3 + Math.floor(Math.random() * 4);
                for (let i = 0; i < rayCount; i++) {
                    const baseAngle = (i / rayCount) * Math.PI * 2 + Math.random() * 0.5;
                    const len = 8 + Math.random() * 18;
                    const thick = 1.2 + Math.random() * 1.5;
                    const dur = (0.25 + Math.random() * 0.2).toFixed(2);
                    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

                    const wrapper = document.createElement('div');
                    wrapper.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:0;height:0;overflow:visible;pointer-events:none;`;

                    const ray = document.createElement('div');
                    ray.className = 'nova-ray';
                    ray.style.cssText = `
                        width:${thick}px;
                        height:${len}px;
                        left:${-thick / 2}px;
                        top:${-len}px;
                        background:linear-gradient(to top, ${color}, transparent);
                        box-shadow:0 0 4px ${color};
                        transform:rotate(${baseAngle.toFixed(3)}rad);
                        --rl:${len}px;
                        --nd:${dur}s;
                    `;
                    wrapper.appendChild(ray);
                    host.appendChild(wrapper);
                    ray.addEventListener('animationend', () => wrapper.remove(), { once: true });
                }
            }

            if (moveCount % 7 === 0) {
                const ring = document.createElement('div');
                ring.className = 'nova-ring';
                const rs = 10 + Math.random() * 8;
                ring.style.cssText = `
                    left:${x}px; top:${y}px;
                    width:${rs}px; height:${rs}px;
                    border: 1.5px solid var(--purpura-pcr-nova-ring-border);
                    box-shadow: 0 0 6px var(--purpura-pcr-nova-ring-glow-1), inset 0 0 4px var(--purpura-pcr-nova-ring-glow-2);
                `;
                host.appendChild(ring);
                ring.addEventListener('animationend', () => ring.remove(), { once: true });
            }

            if (speed > 28 && Math.random() < 0.35) {
                const flare = document.createElement('div');
                flare.className = 'nova-flare';
                const fs = 14 + Math.random() * 12;
                flare.style.cssText = `
                    left:${x}px; top:${y}px;
                    width:${fs}px; height:${fs}px;
                    background:radial-gradient(circle, var(--purpura-pcr-nova-flare-center) 0%, var(--purpura-pcr-nova-flare-mid) 40%, transparent 70%);
                    box-shadow:0 0 10px var(--purpura-pcr-nova-flare-glow-1), 0 0 20px var(--purpura-pcr-nova-flare-glow-2);
                `;
                host.appendChild(flare);
                flare.addEventListener('animationend', () => flare.remove(), { once: true });
            }

            lastX = x;
            lastY = y;
        };

        document.addEventListener('mousemove', onMove);
        vfxCleanup = () => {
            document.removeEventListener('mousemove', onMove);
            host.remove();
        };
    }
    
    function applyCursorToPage(cursorCSS) {
        if (currentCursor === cursorCSS) return;
        
        if (dragCleanup) {
            dragCleanup();
            dragCleanup = null;
        }
        
        currentCursor = cursorCSS;
        
        if (styleElement) {
            styleElement.remove();
            styleElement = null;
        }
        
        if (cursorCSS === 'auto') {
            document.documentElement.classList.remove('purpura-cursor-override');
            return;
        }
        
        styleElement = document.createElement('style');
        styleElement.id = 'purpura-cursor-style';
        styleElement.textContent = `
            /* Universal cursor override with maximum specificity */
            *, *:hover, *:active, *:focus, *:visited, *::before, *::after {
                cursor: ${cursorCSS} !important;
            }
            
            /* Specific overrides for interactive elements */
            a, button, input[type="button"], input[type="submit"], 
            .btn, [role="button"], [onclick], .clickable, .interactive {
                cursor: ${cursorCSS} !important;
            }
            
            /* Text input areas */
            input[type="text"], input[type="password"], input[type="email"],
            textarea, [contenteditable="true"] {
                cursor: ${cursorCSS} !important;
            }
            
            /* Game canvas and interactive areas */
            canvas, #game-instances, .game-container, .game-viewport {
                cursor: ${cursorCSS} !important;
            }
            
            /* Drag and drop elements - critical for fixing drag cursor reversion */
            [draggable="true"], [draggable], .draggable, .drag-handle,
            .sortable-item, .ui-draggable, .ui-sortable {
                cursor: ${cursorCSS} !important;
            }
            
            /* Force override during drag operations */
            *:active, *[style*="cursor"], *[data-cursor] {
                cursor: ${cursorCSS} !important;
            }
            
            /* Roblox specific selectors */
            .rbx-tab, .tab-content, .game-card, .game-tile,
            .avatar-card, .item-card, .catalog-item, .notification,
            .dropdown, .modal, .dialog, .menu, .tooltip {
                cursor: ${cursorCSS} !important;
            }
            
            /* Override all possible cursor states */
            html.purpura-cursor-override *,
            html.purpura-cursor-override *:active,
            html.purpura-cursor-override *:hover,
            html.purpura-cursor-override *:focus,
            html.purpura-cursor-override *:visited,
            html.purpura-cursor-override *[dragging="true"] {
                cursor: ${cursorCSS} !important;
            }
        `;
        
        document.head.appendChild(styleElement);
        document.documentElement.classList.add('purpura-cursor-override');

        const forceDragCursor = (e) => {
            const target = e && e.target;
            if (!target || !target.style || typeof target.style.setProperty !== 'function') return;
            target.style.setProperty('cursor', cursorCSS, 'important');
        };
        
        document.addEventListener('dragstart', forceDragCursor, true);
        
        document.addEventListener('drag', forceDragCursor, true);
        
        document.addEventListener('dragend', forceDragCursor, true);
        
        dragCleanup = () => {
            document.removeEventListener('dragstart', forceDragCursor, true);
            document.removeEventListener('drag', forceDragCursor, true);
            document.removeEventListener('dragend', forceDragCursor, true);
        };
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCursors);
    } else {
        initializeCursors();
    }
})();