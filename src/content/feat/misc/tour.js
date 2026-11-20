/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function() {
    'use strict';

    if (window.__PurpuraTourLoaded) return;
    window.__PurpuraTourLoaded = true;

    if (window.top !== window.self) return;

    const REQUEST_KEY = 'purpuraTourRequest';
    const STATE_KEY = 'purpuraTourState';
    const OUTRO_KEY = 'purpuraTourOutro';
    const DONE_KEY = 'purpuraTourDone';
    const ROOT_ID = 'purpura-tour-root';
    const STYLE_ID = 'purpura-tour-style';
    const SITE = 'https://www.roblox.com';
    const STATE_TTL_MS = 10 * 60 * 1000;
    const TARGET_TIMEOUT_MS = 5000;
    const TARGET_POLL_MS = 40;
    const STEP_ANIMATION_MS = 180;

    function t(key) {
        return chrome.i18n.getMessage(key) || key;
    }

    const STEPS = [
        {
            id: 'welcome',
            center: true,
            titleKey: 'tour_step_welcome_title',
            bodyKey: 'tour_step_welcome_body'
        },
        {
            id: 'robux',
            route: '/home',
            targets: [ '#nav-robux', '#nav-robux-icon', '.nav-robux-icon', '#nav-robux-amount' ],
            titleKey: 'tour_step_robux_title',
            bodyKey: 'tour_step_robux_body'
        },
        {
            id: 'search',
            route: '/home',
            targets: [ '#navbar-search-input', '.navbar-search', 'form[role="search"]' ],
            titleKey: 'tour_step_search_title',
            bodyKey: 'tour_step_search_body'
        },
        {
            id: 'sidebar',
            route: '/home',
            targets: [ '#purpura-sidebar-nav', '.left-nav', '#left-navigation-container', '#navigation' ],
            placement: 'right',
            prepare: 'sidebar',
            titleKey: 'tour_step_sidebar_title',
            bodyKey: 'tour_step_sidebar_body'
        },
        {
            id: 'settings',
            route: '/my/account?purpura=info',
            targets: [ '#purpura-sidebar', '#purpura-ui-container', '#purpura-settings-container' ],
            titleKey: 'tour_step_settings_title',
            bodyKey: 'tour_step_settings_body'
        },
        {
            id: 'appearance',
            route: '/my/account?purpura=appearance',
            targets: [ '[data-setting-card="themeManager"]', '#purpura-section-content' ],
            titleKey: 'tour_step_appearance_title',
            bodyKey: 'tour_step_appearance_body'
        },
        {
            id: 'catalog',
            route: '/my/account?purpura=catalog',
            targets: [ '[data-setting-card="robuxConversations"]', '#purpura-section-content' ],
            titleKey: 'tour_step_catalog_title',
            bodyKey: 'tour_step_catalog_body'
        }
    ];

    const state = {
        active: false,
        index: 0,
        navCount: 0,
        ready: false,
        inOutro: false,
        outro: null,
        root: null,
        card: null,
        spotlight: null,
        pill: null,
        counter: null,
        title: null,
        body: null,
        dots: null,
        backBtn: null,
        nextBtn: null,
        openBtn: null,
        target: null,
        prepared: null,
        side: 'center',
        raf: null,
        waitTimer: null,
        keyHandler: null,
        lastBox: null,
        holdTransitionUntil: 0,
        pendingY: 0
    };

    function clamp(value, min, max) {
        if (max < min) return min;
        return Math.max(min, Math.min(max, value));
    }

    function ensureStyles() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = [
            '#' + ROOT_ID + '{position:fixed;inset:0;z-index:2147483000;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}',
            '#' + ROOT_ID + ' *{box-sizing:border-box;}',
            '.purpura-tour-spotlight{position:absolute;border-radius:10px;pointer-events:none;opacity:0;',
            'box-shadow:0 0 0 9999px rgba(7,6,13,.72),0 0 0 1.5px rgba(155,109,255,.85),0 0 22px rgba(155,109,255,.32);',
            'transition:top 140ms linear,left 140ms linear,width 140ms linear,height 140ms linear,opacity 140ms ease;}',
            '.purpura-tour-spotlight.is-visible{opacity:1;}',
            '.purpura-tour-card{position:absolute;width:344px;max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);overflow:auto;',
            'padding:16px 18px 14px;border-radius:13px;opacity:0;visibility:hidden;',
            'background:linear-gradient(158deg,#1d1928 0%,#15121d 60%,#0f0d15 100%);',
            'border:1px solid rgba(155,109,255,.24);color:#f3efff;',
            'box-shadow:0 18px 46px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.05);',
            'transition:transform 200ms ease,opacity 140ms ease;}',
            '.purpura-tour-card.is-visible{opacity:1;visibility:visible;}',
            '.purpura-tour-card.is-following{transition:opacity 140ms ease;}',
            '.purpura-tour-head{display:flex;align-items:center;gap:8px;margin-bottom:10px;}',
            '.purpura-tour-logo{width:20px;height:20px;border-radius:6px;flex-shrink:0;}',
            '.purpura-tour-label{font-size:10px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#b79dff;}',
            '.purpura-tour-counter{margin-left:auto;font-size:11px;font-weight:600;color:rgba(226,216,255,.55);font-variant-numeric:tabular-nums;}',
            '.purpura-tour-close{width:22px;height:22px;padding:0;margin-left:2px;border:0;border-radius:6px;cursor:pointer;',
            'background:transparent;color:rgba(226,216,255,.55);font-size:15px;line-height:1;display:flex;align-items:center;justify-content:center;',
            'transition:background .15s,color .15s;}',
            '.purpura-tour-close:hover{background:rgba(255,255,255,.07);color:#fff;}',
            '.purpura-tour-title{margin:0 0 6px;font-size:15px;font-weight:700;letter-spacing:-.1px;color:#f7f4ff;}',
            '.purpura-tour-body{margin:0;font-size:13px;line-height:1.62;color:rgba(230,222,252,.82);}',
            '.purpura-tour-foot{display:flex;align-items:center;gap:10px;margin-top:14px;}',
            '.purpura-tour-dots{display:flex;align-items:center;gap:5px;}',
            '.purpura-tour-dot{width:6px;height:6px;border-radius:99px;background:rgba(255,255,255,.2);transition:width .18s,background .18s;}',
            '.purpura-tour-dot.is-active{width:16px;background:#9b6dff;}',
            '.purpura-tour-actions{margin-left:auto;display:flex;align-items:center;gap:7px;}',
            '.purpura-tour-btn{font-family:inherit;font-size:12.5px;font-weight:600;border-radius:8px;padding:7px 13px;cursor:pointer;',
            'border:1px solid transparent;transition:background .15s,border-color .15s,transform .1s;white-space:nowrap;}',
            '.purpura-tour-btn:active{transform:scale(.97);}',
            '.purpura-tour-btn.ghost{background:transparent;border-color:rgba(255,255,255,.16);color:rgba(236,229,255,.86);}',
            '.purpura-tour-btn.ghost:hover{border-color:rgba(255,255,255,.3);background:rgba(255,255,255,.05);}',
            '.purpura-tour-btn.primary{background:linear-gradient(135deg,#8b5cf6 0%,#6f3fd0 100%);color:#fff;box-shadow:0 4px 14px rgba(122,68,192,.4);}',
            '.purpura-tour-btn.primary:hover{background:linear-gradient(135deg,#9a6bff 0%,#7b47e0 100%);}',
            '.purpura-tour-btn[hidden]{display:none;}',
            '.purpura-tour-outro{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;',
            '.purpura-tour-outro[hidden]{display:none;}',
            'background:rgba(7,6,13,.78);backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);',
            'opacity:0;pointer-events:none;transition:opacity .2s ease;}',
            '.purpura-tour-outro.is-visible{opacity:1;pointer-events:auto;}',
            '.purpura-tour-outro-panel{position:relative;width:min(460px,100%);max-height:calc(100vh - 40px);overflow:auto;',
            'padding:32px 30px 26px;border-radius:18px;text-align:center;',
            'background:radial-gradient(120% 100% at 50% 0%,rgba(122,68,192,.30) 0%,rgba(24,19,35,.98) 52%,rgba(12,10,18,.99) 100%);',
            'border:1px solid rgba(155,109,255,.32);box-shadow:0 30px 80px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.06);',
            'transform:translateY(10px) scale(.985);transition:transform .26s cubic-bezier(.22,1,.36,1);}',
            '.purpura-tour-outro.is-visible .purpura-tour-outro-panel{transform:none;}',
            '.purpura-tour-outro-logo{width:54px;height:54px;border-radius:15px;display:block;margin:0 auto 16px;}',
            '.purpura-tour-outro-title{margin:0 0 9px;font-size:23px;font-weight:800;letter-spacing:-.4px;color:#f8f5ff;}',
            '.purpura-tour-outro-body{margin:0 auto;max-width:350px;font-size:13.5px;line-height:1.65;color:rgba(230,222,252,.78);}',
            '.purpura-tour-outro-actions{display:flex;flex-wrap:wrap;gap:9px;justify-content:center;margin-top:24px;}',
            '.purpura-tour-outro-actions .purpura-tour-btn{padding:10px 18px;font-size:13px;border-radius:10px;text-decoration:none;display:inline-flex;align-items:center;}',
            '.purpura-tour-outro-close{position:absolute;top:14px;right:14px;width:26px;height:26px;font-size:16px;}',
            '@media (max-width:520px){.purpura-tour-outro-panel{padding:28px 20px 22px;}.purpura-tour-outro-title{font-size:21px;}}',
            '.purpura-tour-pill{position:fixed;right:20px;bottom:20px;display:flex;align-items:center;gap:8px;padding:8px 10px 8px 9px;',
            'border-radius:99px;background:rgba(20,16,30,.94);border:1px solid rgba(155,109,255,.3);color:rgba(240,234,255,.92);',
            'box-shadow:0 10px 30px rgba(0,0,0,.45);font-size:12px;font-weight:600;pointer-events:auto;}',
            '.purpura-tour-pill img{width:16px;height:16px;border-radius:4px;}',
            '.purpura-tour-pill span{font-variant-numeric:tabular-nums;color:rgba(226,216,255,.6);font-weight:600;}',
            '.purpura-tour-pill button{border:0;background:transparent;color:rgba(226,216,255,.55);cursor:pointer;font-size:14px;line-height:1;padding:0 2px;}',
            '.purpura-tour-pill button:hover{color:#fff;}',
            '@media (prefers-reduced-motion: reduce){.purpura-tour-spotlight,.purpura-tour-card,.purpura-tour-dot{transition:none !important;}}'
        ].join('');

        (document.head || document.documentElement).appendChild(style);
    }

    function buildUi() {
        if (state.root && document.contains(state.root)) return;

        const root = document.createElement('div');
        root.id = ROOT_ID;
        root.addEventListener('wheel', forwardScroll, { passive: false });
        root.addEventListener('touchmove', forwardTouch, { passive: false });

        const spotlight = document.createElement('div');
        spotlight.className = 'purpura-tour-spotlight';

        const card = document.createElement('div');
        card.className = 'purpura-tour-card';
        card.setAttribute('role', 'dialog');
        card.setAttribute('aria-modal', 'true');
        card.setAttribute('aria-labelledby', 'purpura-tour-title');
        card.tabIndex = -1;

        const head = document.createElement('div');
        head.className = 'purpura-tour-head';

        const logo = document.createElement('img');
        logo.className = 'purpura-tour-logo';
        logo.src = chrome.runtime.getURL('images/icons/default/Purpura_Default_Logo_48.png');
        logo.alt = '';

        const label = document.createElement('span');
        label.className = 'purpura-tour-label';
        label.textContent = t('tour_label');

        const counter = document.createElement('span');
        counter.className = 'purpura-tour-counter';

        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'purpura-tour-close';
        close.setAttribute('aria-label', t('tour_skip'));
        close.textContent = '\u00d7';
        close.addEventListener('click', () => finish());

        head.appendChild(logo);
        head.appendChild(label);
        head.appendChild(counter);
        head.appendChild(close);

        const title = document.createElement('h2');
        title.className = 'purpura-tour-title';
        title.id = 'purpura-tour-title';

        const body = document.createElement('p');
        body.className = 'purpura-tour-body';

        const foot = document.createElement('div');
        foot.className = 'purpura-tour-foot';

        const dots = document.createElement('div');
        dots.className = 'purpura-tour-dots';
        dots.setAttribute('aria-hidden', 'true');

        const actions = document.createElement('div');
        actions.className = 'purpura-tour-actions';

        const backBtn = document.createElement('button');
        backBtn.type = 'button';
        backBtn.className = 'purpura-tour-btn ghost';
        backBtn.textContent = t('tour_back');
        backBtn.hidden = true;
        backBtn.addEventListener('click', previous);

        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'purpura-tour-btn primary';
        nextBtn.textContent = t('tour_next');
        nextBtn.addEventListener('click', next);

        actions.appendChild(backBtn);
        actions.appendChild(nextBtn);
        foot.appendChild(dots);
        foot.appendChild(actions);

        card.appendChild(head);
        card.appendChild(title);
        card.appendChild(body);
        card.appendChild(foot);

        const pill = document.createElement('div');
        pill.className = 'purpura-tour-pill';
        pill.hidden = true;

        const pillLogo = document.createElement('img');
        pillLogo.src = logo.src;
        pillLogo.alt = '';

        const pillText = document.createElement('b');
        pillText.textContent = t('tour_label');

        const pillCounter = document.createElement('span');

        const pillClose = document.createElement('button');
        pillClose.type = 'button';
        pillClose.setAttribute('aria-label', t('tour_skip'));
        pillClose.textContent = '\u00d7';
        pillClose.addEventListener('click', () => finish());

        pill.appendChild(pillLogo);
        pill.appendChild(pillText);
        pill.appendChild(pillCounter);
        pill.appendChild(pillClose);

        const outro = document.createElement('div');
        outro.className = 'purpura-tour-outro';
        outro.hidden = true;
        outro.setAttribute('role', 'dialog');
        outro.setAttribute('aria-modal', 'true');
        outro.setAttribute('aria-labelledby', 'purpura-tour-outro-title');

        const outroPanel = document.createElement('div');
        outroPanel.className = 'purpura-tour-outro-panel';

        const outroClose = document.createElement('button');
        outroClose.type = 'button';
        outroClose.className = 'purpura-tour-close purpura-tour-outro-close';
        outroClose.setAttribute('aria-label', t('tour_skip'));
        outroClose.textContent = '\u00d7';
        outroClose.addEventListener('click', () => finish());

        const outroLogo = document.createElement('img');
        outroLogo.className = 'purpura-tour-outro-logo';
        outroLogo.src = logo.src;
        outroLogo.alt = '';

        const outroTitle = document.createElement('h2');
        outroTitle.className = 'purpura-tour-outro-title';
        outroTitle.id = 'purpura-tour-outro-title';
        outroTitle.textContent = t('tour_outro_title');

        const outroBody = document.createElement('p');
        outroBody.className = 'purpura-tour-outro-body';
        outroBody.textContent = t('tour_outro_body');

        const outroActions = document.createElement('div');
        outroActions.className = 'purpura-tour-outro-actions';

        const settingsBtn = document.createElement('button');
        settingsBtn.type = 'button';
        settingsBtn.className = 'purpura-tour-btn primary';
        settingsBtn.textContent = t('tour_outro_settings');
        settingsBtn.addEventListener('click', () => {
            finish();
            window.location.href = SITE + '/my/account?purpura=info';
        });

        const donateBtn = document.createElement('a');
        donateBtn.className = 'purpura-tour-btn ghost';
        donateBtn.href = 'https://ko-fi.com/N0Q220I61C';
        donateBtn.target = '_blank';
        donateBtn.rel = 'noopener noreferrer';
        donateBtn.textContent = t('tour_outro_donate');
        donateBtn.addEventListener('click', () => {

            setTimeout(finish, 150);
        });

        outroActions.appendChild(settingsBtn);
        outroActions.appendChild(donateBtn);

        outroPanel.appendChild(outroClose);
        outroPanel.appendChild(outroLogo);
        outroPanel.appendChild(outroTitle);
        outroPanel.appendChild(outroBody);
        outroPanel.appendChild(outroActions);
        outro.appendChild(outroPanel);

        root.appendChild(spotlight);
        root.appendChild(card);
        root.appendChild(pill);
        root.appendChild(outro);

        state.root = root;
        state.card = card;
        state.spotlight = spotlight;
        state.pill = pill;
        state.counter = counter;
        state.title = title;
        state.body = body;
        state.dots = dots;
        state.backBtn = backBtn;
        state.nextBtn = nextBtn;
        state.outro = outro;
        state.outroPrimaryBtn = settingsBtn;
        state.pillCounter = pillCounter;

        document.documentElement.appendChild(root);
    }

    function forwardScroll(event) {
        event.preventDefault();
        state.pendingY += event.deltaY;
        if (state.pendingY > 220) state.pendingY = 220;
        if (state.pendingY < -220) state.pendingY = -220;
        window.scrollBy(0, state.pendingY);
        state.pendingY = 0;
    }

    function forwardTouch(event) {
        if (event.cancelable) event.preventDefault();
    }

    function routeMatches(route) {
        if (!route) return true;

        const want = new URL(route, SITE);
        if (want.pathname !== location.pathname) return false;

        const wantSection = want.searchParams.get('purpura');
        const hereSection = new URLSearchParams(location.search).get('purpura');
        return wantSection === hereSection;
    }

    function persist(index, navCount, done) {
        let settled = false;
        const finish = function() {
            if (settled) return;
            settled = true;
            if (typeof done === 'function') done();
        };

        try {
            chrome.storage.local.set({
                [STATE_KEY]: { index: index, at: Date.now(), navCount: navCount || 0 }
            }, finish);
        } catch (error) {
            finish();
        }
    }

    function clearState() {
        try {
            chrome.storage.local.remove(STATE_KEY);
            chrome.storage.local.set({ [DONE_KEY]: true });
        } catch (error) {
        }
    }

    function go(route) {
        window.location.assign(SITE + route);
    }

    function expandSidebar(element) {
        if (!element) return;
        if (element.id === 'purpura-sidebar-nav') return;

        element.setAttribute('data-purpura-sbt-hover', 'true');
        try {
            const event = typeof PointerEvent === 'function'
                ? new PointerEvent('pointerenter', { bubbles: false })
                : new MouseEvent('mouseenter', { bubbles: false });
            element.dispatchEvent(event);
        } catch (error) {
        }
    }

    function collapseSidebar() {
        const element = state.prepared;
        if (!element) return;

        element.removeAttribute('data-purpura-sbt-hover');
        try {
            const event = typeof PointerEvent === 'function'
                ? new PointerEvent('pointerleave', { bubbles: false })
                : new MouseEvent('mouseleave', { bubbles: false });
            element.dispatchEvent(event);
        } catch (error) {
        }
    }

    function findTarget(step) {
        for (const selector of step.targets || []) {
            let element = null;
            try {
                element = document.querySelector(selector);
            } catch (error) {
                element = null;
            }
            if (!element) continue;

            if (!element.getClientRects().length) continue;

            const rect = element.getBoundingClientRect();
            if (rect.width < 8 || rect.height < 8) continue;

            const computed = window.getComputedStyle(element);
            if (computed.visibility === 'hidden' || computed.display === 'none') continue;

            if (step.prepare === 'sidebar') {
                state.prepared = element;
                expandSidebar(element);
            }

            return element;
        }

        return null;
    }

    function scrollTargetIntoView(element) {
        if (!element) return;

        const rect = element.getBoundingClientRect();
        const visible = rect.top >= 8 && rect.bottom <= window.innerHeight - 8;
        if (visible) return;

        try {
            element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
        } catch (error) {
        }
    }

    function revealTarget(step, index) {
        if (!state.active || state.index !== index) return;

        const target = state.target;
        if (!target) return;

        setTimeout(function() {
            if (!state.active || state.index !== index || state.target !== target) return;
            positionCard(true);
            if (state.spotlight && targetBox()) state.spotlight.classList.add('is-visible');
        }, step.prepare === 'sidebar' ? 80 : 16);
    }

    function renderDots() {
        state.dots.innerHTML = '';
        STEPS.forEach(function(_, index) {
            const dot = document.createElement('span');
            dot.className = 'purpura-tour-dot' + (index === state.index ? ' is-active' : '');
            state.dots.appendChild(dot);
        });
    }

    function renderStep() {
        const step = STEPS[state.index];
        if (!step) return;

        state.counter.textContent = (state.index + 1) + ' / ' + STEPS.length;
        state.title.textContent = t(step.titleKey);
        state.body.textContent = t(step.bodyKey);
        state.backBtn.hidden = state.index === 0;
        state.nextBtn.textContent = state.index === STEPS.length - 1 ? t('tour_done') : t('tour_next');
        renderDots();

        state.ready = false;
        state.lastBox = null;
        state.card.classList.remove('is-visible');
        state.spotlight.classList.remove('is-visible');
        state.card.classList.add('is-following');

        scrollTargetIntoView(state.target);
        state.holdTransitionUntil = Date.now() + STEP_ANIMATION_MS;

        requestAnimationFrame(function() {
            positionCard(true);
        });

        if (state.card) {
            try {
                state.card.focus({ preventScroll: true });
            } catch (error) {
            }
        }
    }

    function targetBox() {
        if (!state.target || !document.contains(state.target)) return null;

        const rect = state.target.getBoundingClientRect();
        if (rect.width < 8 || rect.height < 8) return null;

        const pad = 6;
        return {
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
            bottom: rect.bottom + pad,
            right: rect.right + pad
        };
    }

    function chooseSide(box, cardWidth, cardHeight) {
        if (!box) return 'center';

        const width = window.innerWidth;
        const height = window.innerHeight;
        const margin = 12;
        const gap = 12;
        const step = STEPS[state.index];

        if (step && step.placement === 'right' && width - box.right - gap - margin >= cardWidth) return 'right';

        if (box.height > box.width * 1.6) {
            if (width - box.right - gap - margin >= cardWidth) return 'right';
            if (box.left - gap - margin >= cardWidth) return 'left';
        }

        const below = height - box.bottom - gap - margin;
        const above = box.top - gap - margin;

        if (below >= cardHeight) return 'below';
        if (above >= cardHeight) return 'above';
        if (below >= above) return 'below';
        return 'above';
    }

    function positionCard(animate) {
        if (!state.active || !state.card || !state.spotlight) return;

        const box = targetBox();
        const width = window.innerWidth;
        const height = window.innerHeight;
        const cardWidth = state.card.offsetWidth || 344;
        const cardHeight = state.card.offsetHeight || 170;
        const margin = 12;
        const gap = 12;

        const side = chooseSide(box, cardWidth, cardHeight);
        let left;
        let top;

        if (!box || side === 'center') {
            left = clamp(width / 2 - cardWidth / 2, margin, width - cardWidth - margin);
            top = clamp(height / 2 - cardHeight / 2, margin, height - cardHeight - margin);
        } else if (side === 'right') {
            left = box.right + gap;
            top = clamp(box.top + box.height / 2 - cardHeight / 2, margin, height - cardHeight - margin);
        } else if (side === 'left') {
            left = box.left - gap - cardWidth;
            top = clamp(box.top + box.height / 2 - cardHeight / 2, margin, height - cardHeight - margin);
        } else if (side === 'below') {
            left = clamp(box.left + box.width / 2 - cardWidth / 2, margin, width - cardWidth - margin);
            top = clamp(box.bottom + gap, margin, height - cardHeight - margin);
        } else {
            left = clamp(box.left + box.width / 2 - cardWidth / 2, margin, width - cardWidth - margin);
            top = clamp(box.top - gap - cardHeight, margin, height - cardHeight - margin);
        }

        if (animate) state.holdTransitionUntil = Date.now() + STEP_ANIMATION_MS;
        const following = Date.now() > state.holdTransitionUntil;
        state.card.classList.toggle('is-following', following);

        if (box) {
            const rounded = {
                top: Math.round(box.top),
                left: Math.round(box.left),
                width: Math.round(box.width),
                height: Math.round(box.height)
            };
            const last = state.lastBox;
            if (!last || last.top !== rounded.top || last.left !== rounded.left ||
                last.width !== rounded.width || last.height !== rounded.height) {
                state.spotlight.style.top = rounded.top + 'px';
                state.spotlight.style.left = rounded.left + 'px';
                state.spotlight.style.width = rounded.width + 'px';
                state.spotlight.style.height = rounded.height + 'px';
                state.lastBox = rounded;
            }
        }

        state.card.style.left = Math.round(left) + 'px';
        state.card.style.top = Math.round(top) + 'px';

        if (!state.ready) {
            state.ready = true;
            state.spotlight.classList.toggle('is-visible', !!box);
            state.card.classList.add('is-visible');
        }
    }

    function tick() {
        if (!state.active) return;
        if (!state.inOutro) positionCard(false);
        state.raf = requestAnimationFrame(tick);
    }

    function hidePill() {
        if (state.pill) state.pill.hidden = true;
    }

    function showPill() {
        if (!state.pill || state.pillCounter === undefined) return;
        state.pillCounter.textContent = (state.index + 1) + ' / ' + STEPS.length;
        state.pill.hidden = false;
    }

    function openStep(index) {
        if (!state.active) return;

        clearTimeout(state.waitTimer);
        state.waitTimer = null;
        state.index = index;
        const step = STEPS[index];
        if (!step) {
            finish();
            return;
        }

        state.navCount = 0;

        state.target = null;
        state.lastBox = null;
        state.ready = false;
        state.card.classList.remove('is-visible');
        state.spotlight.classList.remove('is-visible');
        collapseSidebar();
        state.prepared = null;

        if (step.center) {
            hidePill();
            renderStep();
            return;
        }

        hidePill();
        renderStep();
        state.waitTimer = setTimeout(function() {
            beginWait(step, index, Date.now());
        }, 16);
    }

    function beginWait(step, index, startedAt) {
        if (!state.active) return;

        const found = findTarget(step);
        if (found) {
            clearTimeout(state.waitTimer);
            state.waitTimer = null;
            state.target = found;
            hidePill();
            scrollTargetIntoView(found);
            revealTarget(step, index);
            return;
        }

        if (Date.now() - startedAt > TARGET_TIMEOUT_MS) {
            clearTimeout(state.waitTimer);
            state.waitTimer = null;
            state.target = null;
            hidePill();
            return;
        }

        state.waitTimer = setTimeout(function() {
            beginWait(step, index, startedAt);
        }, TARGET_POLL_MS);
    }

    function advance(index) {
        if (!state.active) return;

        if (index >= STEPS.length) {
            finish();
            return;
        }

        const step = STEPS[index];
        if (step.route && !routeMatches(step.route)) {

            if (state.navCount >= 2) {
                state.navCount = 0;
                openStep(index);
                return;
            }

            collapseSidebar();
            state.navCount += 1;
            persist(index, state.navCount, function() {
                go(step.route);
            });
            return;
        }

        state.navCount = 0;
        persist(index);
        openStep(index);
    }

    function next() {
        if (!state.active || state.inOutro) return;

        if (state.index >= STEPS.length - 1) {
            completeTour();
            return;
        }

        advance(state.index + 1);
    }

    function completeTour() {
        if (!state.active) return;

        clearState();

        if (location.pathname === '/home') {
            showOutro();
            return;
        }

        let leaving = false;
        const leave = function() {
            if (leaving) return;
            leaving = true;
            finish();
            window.location.assign(SITE + '/home');
        };

        try {
            chrome.storage.local.set({ [OUTRO_KEY]: Date.now() }, leave);
        } catch (error) {
            leave();
        }
    }

    function showOutro() {
        if (!state.active || state.inOutro) return;

        state.inOutro = true;
        state.ready = false;
        clearTimeout(state.waitTimer);
        state.waitTimer = null;
        collapseSidebar();

        if (state.card) state.card.classList.remove('is-visible');
        if (state.spotlight) state.spotlight.classList.remove('is-visible');
        hidePill();

        clearState();

        state.outro.hidden = false;
        requestAnimationFrame(function() {
            state.outro.classList.add('is-visible');
        });

        try {
            state.outroPrimaryBtn.focus({ preventScroll: true });
        } catch (error) {
        }
    }

    function showOutroStandalone() {
        if (state.active) return true;
        if (!document.body) return false;

        state.active = true;

        ensureStyles();
        buildUi();

        state.keyHandler = handleKeys;
        document.addEventListener('keydown', state.keyHandler, true);

        showOutro();
        return true;
    }

    function previous() {
        if (!state.active || state.inOutro || state.index === 0) return;

        const target = state.index - 1;
        const step = STEPS[target];
        if (step.route && !routeMatches(step.route)) {
            collapseSidebar();
            persist(target, 0, function() {
                go(step.route);
            });
            return;
        }

        openStep(target);
    }

    function trapTab(event, container) {
        if (!container) return;

        const focusable = Array.prototype.filter.call(
            container.querySelectorAll('button'),
            button => !button.hidden
        );
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        } else if (event.shiftKey && (document.activeElement === first || document.activeElement === container)) {
            event.preventDefault();
            last.focus();
        }
    }

    function handleKeys(event) {
        if (!state.active) return;

        if (event.key === 'Escape') {
            event.preventDefault();
            finish();
            return;
        }

        if (state.inOutro) {
            if (event.key === 'Tab' && state.outro && state.outro.contains(document.activeElement)) {
                trapTab(event, state.outro);
            }
            return;
        }

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            next();
            return;
        }

        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            previous();
            return;
        }

        if (event.key !== 'Tab' || !state.card) return;
        if (!state.card.contains(document.activeElement)) return;

        trapTab(event, state.card);
    }

    function finish() {
        if (!state.active) return;

        state.active = false;
        clearTimeout(state.waitTimer);
        state.waitTimer = null;
        collapseSidebar();

        if (state.raf) {
            cancelAnimationFrame(state.raf);
            state.raf = null;
        }

        if (state.keyHandler) {
            document.removeEventListener('keydown', state.keyHandler, true);
            state.keyHandler = null;
        }

        if (state.root && state.root.parentNode) state.root.parentNode.removeChild(state.root);
        state.root = null;
        state.card = null;
        state.spotlight = null;
        state.pill = null;
        state.target = null;
        state.prepared = null;
        state.inOutro = false;
        state.outro = null;
        state.outroPrimaryBtn = null;

        clearState();
    }

    function startAt(index) {
        if (state.active) return true;
        if (!document.body) return false;

        state.active = true;
        state.index = index;
        state.ready = false;

        ensureStyles();
        buildUi();

        state.keyHandler = handleKeys;
        document.addEventListener('keydown', state.keyHandler, true);

        state.raf = requestAnimationFrame(tick);

        advance(index);
        return true;
    }

    function start() {
        return startAt(0);
    }

    window.__PurpuraTour = {
        start: start,
        stop: finish,
        isActive: function() {
            return state.active;
        }
    };

    function whenBodyReady(callback) {
        if (document.body) {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback, { once: true });
    }

    function boot() {
        try {
            chrome.storage.local.get([ STATE_KEY, REQUEST_KEY, OUTRO_KEY ], function(stored) {
                const outroAt = Number(stored && stored[OUTRO_KEY]);
                if (outroAt) {
                    chrome.storage.local.remove(OUTRO_KEY);
                    if ((Date.now() - outroAt) < STATE_TTL_MS) {
                        whenBodyReady(function() {
                            showOutroStandalone();
                        });
                        return;
                    }
                }

                const saved = stored && stored[STATE_KEY];
                const requested = stored && stored[REQUEST_KEY];
                let index = -1;

                if (saved && typeof saved.index === 'number' && saved.at && (Date.now() - saved.at) < STATE_TTL_MS) {
                    index = saved.index;
                    state.navCount = Number(saved.navCount) || 0;
                }

                if (requested) {
                    chrome.storage.local.remove(REQUEST_KEY);
                    if (index === -1) index = 0;
                }

                if (index === -1) return;

                whenBodyReady(function() {
                    startAt(clamp(index, 0, STEPS.length - 1));
                });
            });
        } catch (error) {
        }
    }

    boot();
    window.addEventListener('pageshow', function() {
        if (state.active) return;
        boot();
    });
})();
