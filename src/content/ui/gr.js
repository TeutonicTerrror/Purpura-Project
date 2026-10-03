/*
 * Purpura Extension
 * Copyright © 2026 TeutonicTerror
 * Licensed under the GNU General Public License v3.0.
 */
(function purpuraGreetingMain() {
  function t(key, substitutions) { return chrome.i18n.getMessage(key, substitutions) || key; }
  let isGreetingsEnabled = false;
  let greetingInjected = false;

  const userSpecificMessages = {
    "1089239338": { text: "TeutonicTerror? Where have I heard that before...", rarity: "secret" },
    "287525063": { text: "Coral mode: Cliggy Edition.", rarity: "epic" },
    "5191689634": { text: "Drpeppercarries is better than you.", rarity: "legendary" },
  };

  const rarityChances = {
    secret: "0.1%",
    legendary: "3%",
    epic: "14%",
    common: "82.9%",
    seasonal: "0%",
  };

const messageTable = [
  { text: "Today is a great day.", rarity: "common" },
  { text: "We ball.", rarity: "common" },
  { text: "Not a bad day to exist.", rarity: "common" },
  { text: "You got this.", rarity: "common" },
  { text: "Let's try not to mess this up.", rarity: "common" },
  { text: "Could be worse.", rarity: "common" },
  { text: "Send it.", rarity: "common" },
  { text: "Tonight we storm the dark kingdom.", rarity: "common" },

  { text: "Purpura > Other Extensions.", rarity: "epic" },
  { text: "Something big is brewing.", rarity: "epic" },
  { text: "What if we-- Ah nevermind...", rarity: "epic" },
  { text: "The odds are looking decent.", rarity: "epic" },
  { text: "This run might go crazy.", rarity: "epic" },

  { text: "Main character energy.", rarity: "legendary" },
  { text: "Today's the day.", rarity: "legendary" },
  { text: "Dr Pepper is the best pop.", rarity: "legendary" },
  { text: "Jesse we need to cook.", rarity: "legendary" },
  { text: "Something legendary just started.", rarity: "legendary" },

  { text: "You weren't supposed to see this.", rarity: "secret" },
  { text: "I know what kind of man you are.", rarity: "secret" },
  { text: "This is pretty rare man. Took a long time.", rarity: "secret" },
  { text: "Alright… go do something incredibly stupid.", rarity: "secret" },
  { text: "How did we get here?", rarity: "secret" },
  { text: "Remember kids, stay in School. It makes you better at Mine---I mean Roblox.", rarity: "secret" },
  { text: "TeutonicTerror? Where have I heard that before...", rarity: "secret" },
];

  function getRandomRarity() {
    const rand = Math.random() * 100;
    if (rand <= 0.1) return "secret";
    if (rand <= 3.1) return "legendary";
    if (rand <= 17.1) return "epic";
    return "common";
  }

  function getRandomMessage() {
    const idx = Math.floor(Math.random() * messageTable.length);
    return messageTable[idx];
  }

  function pickMessageAndRarity(uid) {
    const storedKey = `purpura-rarity-${uid}`;
    const stored = window.localStorage.getItem(storedKey);
    if (userSpecificMessages[uid]) {
      const forced = userSpecificMessages[uid];
      const rarity = forced.rarity || stored || getRandomRarity();
      if (!stored) window.localStorage.setItem(storedKey, rarity);
      return { message: forced.text, rarity };
    }
    const picked = getRandomMessage();
    return { message: picked.text, rarity: picked.rarity };
  }

  async function getUserId() {
    try {
      const response = await fetch('https://users.roblox.com/v1/users/authenticated', { credentials: 'include' });
      if (!response.ok) return null;
      const userData = await response.json();
      return userData.id;
    } catch (e) {
      return null;
    }
  }

  async function injectGreeting() {
    if (!isGreetingsEnabled) return;
    if (window.location.pathname !== '/home') return;
    if (greetingInjected) {
      if (document.querySelector('.purpura-greeting-wrapper')) return;
      greetingInjected = false;
    }
    const homeHeader = document.querySelector('h1[data-purpura-id="purpura-home-h1"]') || document.querySelector('h1');
    if (!homeHeader) return;
    greetingInjected = true;
    const uid = await getUserId();
    if (!uid) return;
    const themeRes = await chrome.runtime.sendMessage({ action: "getRobloxTheme" });
    const isLight = themeRes?.theme === "light";
    const [userRes, thumbRes] = await Promise.all([
      fetch(`https://users.roblox.com/v1/users/${uid}`).then(r => (r.ok ? r.json() : {})),
      fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${uid}&size=150x150&format=png&isCircular=false`).then(r => (r.ok ? r.json() : {}))
    ]);
    const username = userRes?.name || userRes?.username || `User ${uid}`;
    const displayName = userRes?.displayName || username;
    const imageUrl = thumbRes?.data?.[0]?.imageUrl || "";
    const hr = new Date().getHours();
    const when = hr < 12 ? t('greetings_morning') : hr < 18 ? t('greetings_afternoon') : t('greetings_evening');
    const greetingText = `${when}, ${username}`;
    const isChristmas = (() => {
      const now = new Date();
      return now.getMonth() === 11 && now.getDate() === 25;
    })();
    const isHalloween = (() => {
      const now = new Date();
      return now.getMonth() === 9 && now.getDate() === 31;
    })();
    const isNewYear = (() => {
      const now = new Date();
      return now.getMonth() === 0 && now.getDate() === 1;
    })();
    let { message, rarity } = pickMessageAndRarity(String(uid));
    if (isChristmas) {
      message = "Merry Christmas, you filthy animal.";
      rarity = "seasonal";
    } else if (isHalloween) {
      const halloweenOptions = [
        "Spooky scary skeletons are out tonight..",
        "Stranger things have happened than this..."
      ];
      message = halloweenOptions[Math.floor(Math.random() * halloweenOptions.length)];
      rarity = "seasonal";
    } else if (isNewYear) {
      message = "The ball dropped.";
      rarity = "seasonal";
    }

    const rarityBorderColors = {
      secret: "rgba(255, 140, 60, 0.8)",
      legendary: "rgba(255, 215, 0, 0.8)",
      epic: "rgba(179, 136, 255, 0.8)",
      common: "rgba(179, 136, 255, 0.6)",
      seasonal: "rgba(255, 0, 0, 0.8)"
    };
    const borderColor = rarityBorderColors[rarity] || rarityBorderColors.common;

    document.querySelectorAll(".purpura-greeting-wrapper").forEach(el => el.remove());
    const wrapper = document.createElement("div");
    wrapper.className = "purpura-greeting-wrapper";
    wrapper.style.margin = isLight ? "0 0 24px" : "0 0 20px";
    if (isLight) {
      wrapper.style.animation = "purpuraFadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards";
    }
    wrapper.innerHTML = `
      <div class="section" style="display:flex;flex-direction:column;">
        <div class="col-xs-12 container-header" style="display:flex;align-items:center;margin-bottom:${isLight ? '18px' : '15px'};">
          <a class="avatar" style="margin-right:${isLight ? '18px' : '15px'};width:128px;height:128px;" href="https://www.roblox.com/users/${uid}/profile">
            <span style="width:128px;height:128px;display:inline-block;background:none;border:none;">
              <thumbnail-2d class="avatar-card-image">
                <span class="thumbnail-2d-container" thumbnail-type="AvatarHeadshot">
                  <img src="${imageUrl}" alt="${displayName}" title="${displayName}" style="width:128px;height:128px;display:block;border-radius:50%;">
                </span>
              </thumbnail-2d>
            </span>
          </a>
          <div style="display:flex;flex-direction:column;justify-content:center;">
            <h1 style="display:flex;align-items:center;margin:0;font-size:${isLight ? '24px' : '20px'};font-weight:${isLight ? '800' : '700'};${isLight ? 'letter-spacing:-0.5px;' : ''}">
              <a href="https://www.roblox.com/users/${uid}/profile" class="user-name-container" style="text-decoration:none;color:inherit;margin-right:12px;">${greetingText}</a>
            </h1>
            <a href="https://www.roblox.com/users/${uid}/profile" class="user-name-container" style="text-decoration:none;color:var(--rbx-text-color);${isLight ? 'opacity:0.7;margin-top:4px;font-size:15px;font-weight:500;' : 'margin-top:6px;'}">${isLight ? `@${username}` : displayName}</a>
          </div>
        </div>
        <div class="purpura-message rarity-${rarity}" style="position:relative;display:flex;align-items:center;gap:${isLight ? '14px' : '12px'};padding:${isLight ? '16px 20px' : '12px 14px'};border-radius:${isLight ? '20px' : '16px'};background:${isLight ? 'rgba(255,255,255,0.75)' : 'rgba(20,20,28,0.9)'};${isLight ? 'backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);' : ''}box-shadow:${isLight ? '0 10px 30px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.02)' : '0 10px 30px rgba(0,0,0,0.2)'};border:1px solid ${isLight ? 'rgba(0,0,0,0.06)' : borderColor};">
          <span class="purpura-badge" style="position:relative;z-index:1;flex-shrink:0;padding:6px ${isLight ? '14px' : '12px'};border-radius:999px;font-size:11px;font-weight:${isLight ? '800' : '700'};text-transform:uppercase;letter-spacing:${isLight ? '1.5px' : '1.2px'};display:flex;align-items:center;gap:${isLight ? '8px' : '6px'};transition:all 0.3s ease;"></span>
          <span class="purpura-message-text" style="position:relative;z-index:1;font-weight:700;font-size:${isLight ? '17px' : '16px'};line-height:${isLight ? '1.4' : '1.2'};color:${isLight ? '#191b1d' : '#fff'};${isLight ? 'letter-spacing:-0.2px;' : ''}"></span>
        </div>
      </div>
    `;
    const messageBox = wrapper.querySelector(".purpura-message");
    const badge = wrapper.querySelector(".purpura-badge");
    const msgEl = wrapper.querySelector(".purpura-message-text");
    msgEl.textContent = message;
    const chanceText = rarity === "seasonal" ? (isChristmas ? "100%" : "0%") : (rarityChances[rarity] || "??%");
    if (isLight) {
      messageBox.style.borderLeft = `6px solid ${borderColor}`;
    }
    const svgIcons = {
      secret: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C11.4477 2 11 2.44772 11 3V7.09C7.97 7.55 5.5 9.41 4.24 12.06C3.23 13.98 3.5 16.2 4.92 17.66L12 24L19.08 17.66C20.5 16.2 20.78 13.98 19.76 12.06C18.5 9.41 16.03 7.55 13 7.09V3C13 2.44772 12.5523 2 12 2Z" fill="currentColor"/></svg>',
      legendary: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L14.09 8.26L20.97 8.27L15.45 12.14L17.54 18.4L12 14.77L6.46 18.4L8.55 12.14L3.03 8.27L9.91 8.26L12 2Z" fill="currentColor"/></svg>',
      epic: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15 8H21L16.5 12.5L18.5 19L12 15.5L5.5 19L7.5 12.5L3 8H9L12 2Z" fill="currentColor"/></svg>',
    };
    switch (rarity) {
      case "secret":
        badge.innerHTML = `${svgIcons.secret}<span>SECRET RARE</span>`;
        badge.style.background = isLight ? "rgba(255, 140, 60, 0.12)" : "rgba(255, 140, 60, 0.15)";
        badge.style.border = `1px solid ${isLight ? "rgba(255, 140, 60, 0.4)" : "rgba(255, 140, 60, 0.5)"}`;
        badge.style.color = isLight ? "#d35400" : "#FFB14B";
        break;
      case "legendary":
        badge.innerHTML = `${svgIcons.legendary}<span>LEGENDARY</span>`;
        badge.style.background = isLight ? "rgba(241, 196, 15, 0.15)" : "linear-gradient(90deg, rgba(255,215,0,0.3), rgba(255,140,0,0.3))";
        badge.style.border = `1px solid ${isLight ? "rgba(241, 196, 15, 0.5)" : "rgba(255,215,0,0.6)"}`;
        badge.style.color = isLight ? "#9a7d0a" : "#FFD700";
        break;
      case "epic":
        badge.innerHTML = `${svgIcons.epic}<span>EPIC</span>`;
        badge.style.background = isLight ? "rgba(155, 89, 182, 0.12)" : "linear-gradient(90deg, rgba(138,43,226,0.3), rgba(179,136,255,0.3))";
        badge.style.border = `1px solid ${isLight ? "rgba(155, 89, 182, 0.4)" : "rgba(179,136,255,0.6)"}`;
        badge.style.color = isLight ? "#7d3c98" : "#b388ff";
        break;
      case "seasonal":
        badge.textContent = "SEASONAL";
        badge.style.background = isLight ? "rgba(231, 76, 60, 0.12)" : "rgba(255, 0, 0, 0.15)";
        badge.style.border = `1px solid ${isLight ? "rgba(231, 76, 60, 0.4)" : "rgba(255, 0, 0, 0.6)"}`;
        badge.style.color = isLight ? "#c0392b" : "#ff4d4d";
        break;
      default:
        badge.textContent = "COMMON";
        badge.style.background = isLight ? "rgba(149, 165, 166, 0.12)" : "rgba(179, 136, 255, 0.15)";
        badge.style.border = `1px solid ${isLight ? "rgba(149, 165, 166, 0.4)" : "rgba(179, 136, 255, 0.3)"}`;
        badge.style.color = isLight ? "#7f8c8d" : "#b388ff";
        break;
    }
    const tooltipBg = isLight ? "rgba(255, 255, 255, 0.95)" : "rgba(15, 15, 25, 0.95)";
    const tooltipColor = isLight ? "#393b3d" : "rgba(255, 255, 255, 0.95)";
    const tooltipShadow = isLight ? "0 8px 20px rgba(0, 0, 0, 0.1)" : "0 8px 20px rgba(0, 0, 0, 0.4)";
    wrapper.style.setProperty('--purpura-tooltip-bg', tooltipBg);
    wrapper.style.setProperty('--purpura-tooltip-color', tooltipColor);
    wrapper.style.setProperty('--purpura-tooltip-shadow', tooltipShadow);
    badge.setAttribute("data-purpura-tooltip", t('greetings_chance', [chanceText]));
    if (!document.querySelector("#purpura-console-styles")) {
      const style = document.createElement("style");
      style.id = "purpura-console-styles";
      style.textContent = `
        .purpura-badge[data-purpura-tooltip] {
          position: relative;
          cursor: help;
        }
        .purpura-badge[data-purpura-tooltip]::after {
          content: attr(data-purpura-tooltip);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-8px);
          padding: 6px 10px;
          border-radius: 10px;
          background: var(--purpura-tooltip-bg, rgba(15, 15, 25, 0.95));
          color: var(--purpura-tooltip-color, rgba(255, 255, 255, 0.95));
          font-size: 11px;
          white-space: nowrap;
          box-shadow: var(--purpura-tooltip-shadow, 0 8px 20px rgba(0, 0, 0, 0.4));
          opacity: 0;
          transition: opacity 130ms ease-in-out;
          pointer-events: none;
          z-index: 999;
        }
        .purpura-badge[data-purpura-tooltip]:hover::after {
          opacity: 1;
        }
        @keyframes purpuraFadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
            filter: blur(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
      `;
      document.head.appendChild(style);
    }
    homeHeader.parentNode.insertBefore(wrapper, homeHeader);
  }

  function clearGreeting() {
    document.querySelectorAll(".purpura-greeting-wrapper").forEach(el => el.remove());
    greetingInjected = false;
  }

  function loadGreetingsState() {
    window.__PurpuraSettings.ready.then(function() {
      var v = window.__PurpuraSettings.get('gr');
      var newState = v !== undefined ? Boolean(v) : true;
      if (newState !== isGreetingsEnabled) {
        isGreetingsEnabled = newState;
        if (isGreetingsEnabled) {
          greetingInjected = false;
          injectGreeting();
        } else {
          clearGreeting();
        }
      }
    });
  }

  loadGreetingsState();

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.gr) {
      loadGreetingsState();
    }
  });

  function setupNavigationListener() {
    const notify = () => {
      greetingInjected = false;
      injectGreeting();
    };

    const pushState = history.pushState;
    const replaceState = history.replaceState;

    history.pushState = function () {
      pushState.apply(history, arguments);
      notify();
    };

    history.replaceState = function () {
      replaceState.apply(history, arguments);
      notify();
    };

    window.addEventListener('popstate', notify);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectGreeting);
  } else {
    injectGreeting();
  }

  setupNavigationListener();

  let debounceTimer;
  let lastThemeWasLight = null;

  function detectThemeChange() {
    const nowLight = document.body.classList.contains('light-theme') || (!document.body.classList.contains('dark-theme') && document.documentElement.classList.contains('light-theme'));
    if (lastThemeWasLight !== null && lastThemeWasLight !== nowLight) {
      clearGreeting();
    }
    lastThemeWasLight = nowLight;
  }

  const observer = new MutationObserver(() => {
    detectThemeChange();
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(injectGreeting, 100);
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
})();
  