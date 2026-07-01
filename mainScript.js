import { BGcircleTheme } from "./assets/js/Background.js";
import { ThemeChange } from "./assets/js/ThemeChange.js";
import { GlassThemeChange, GlassInteractive, GlassTilt, GlassDepth } from "./assets/js/Liquid-glass.js";
import { initSearchController } from "./assets/js/search.js";
import { initQuoteController } from "./assets/js/quote.js";
import { initMusicController } from "./assets/js/music.js";
import { runEntranceAnimations, runLogoTransition, toggleNowPlayingBarAnimation } from "./assets/js/animations.js";
import { initEasterEggs } from "./assets/js/easterEggs.js";

if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) {
  window.chrome = window.chrome || {};
  chrome.storage = chrome.storage || {};
  chrome.storage.local = {
    get: function (keys, callback) {
      const result = {};
      if (typeof keys === "string") {
        try {
          const val = localStorage.getItem(keys);
          result[keys] = val !== null ? JSON.parse(val) : undefined;
        } catch (e) {
          result[keys] = undefined;
        }
      } else if (Array.isArray(keys)) {
        keys.forEach((key) => {
          try {
            const val = localStorage.getItem(key);
            result[key] = val !== null ? JSON.parse(val) : undefined;
          } catch (e) {
            result[key] = undefined;
          }
        });
      } else if (typeof keys === "object") {
        Object.keys(keys).forEach((key) => {
          try {
            const val = localStorage.getItem(key);
            result[key] = val !== null ? JSON.parse(val) : keys[key];
          } catch (e) {
            result[key] = keys[key];
          }
        });
      }
      setTimeout(() => callback(result), 0);
    },
    set: function (items, callback) {
      Object.keys(items).forEach((key) => {
        try {
          localStorage.setItem(key, JSON.stringify(items[key]));
        } catch (e) {}
      });
      if (callback) {
        setTimeout(callback, 0);
      }
    },
  };
  chrome.storage.onChanged = {
    addListener: function () {},
  };
}

$(document).ready(function () {
  const defaultSettings = {
    darkMode: true,
    searchEngine: "google",
    onlineApi: false,
    apiNinjaKey: "",
    contentType: "quotes",
    tilt: true,
    pageAnimations: true,
    adaptiveTextColor: true,
    bgStyle: "circles",
    circleTheme: "cv",
    circleSpeed: "normal",
    bgGradient: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    customBgImage: "",
    slideshowInterval: "5",
    dynamicWallpaperFolder: "RJC_Wallpaper",
    weatherEnabled: false,
    weatherUnit: "celsius",
    manualWeatherLat: "",
    manualWeatherLon: "",
    batteryEnabled: false,
    countdownEnabled: false,
    countdownName: "Event",
    countdownDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}T23:59:59`,
    musicEnabled: false,
    musicVolume: 0.4,
    musicDelay: 15,
    showLyrics: true,
    screensaverEnabled: false,
    screensaverType: "random",
    screensaverIdle: "5",
    shortcuts: [
      { name: "YouTube", url: "https://youtube.com", openInNewTab: false, iconType: "bootstrap", iconValue: "bi-youtube text-danger" },
      { name: "GitHub", url: "https://github.com", openInNewTab: false, iconType: "bootstrap", iconValue: "bi-github" },
      { name: "Facebook", url: "https://facebook.com", openInNewTab: false, iconType: "bootstrap", iconValue: "bi-facebook text-primary" },
      { name: "Instagram", url: "https://instagram.com", openInNewTab: false, iconType: "bootstrap", iconValue: "bi-instagram" },
    ],
    gmailSettings: {
      name: "Gmail",
      url: "https://mail.google.com",
      openInNewTab: false,
      enableDropdown: true,
    },
    gmailDropdownItems: [
      { name: "Primary Account", url: "https://mail.google.com/mail/u/0/#inbox", openInNewTab: false },
      { name: "Secondary Account", url: "https://mail.google.com/mail/u/1/#inbox", openInNewTab: false },
      { name: "Tertiary Account", url: "https://mail.google.com/mail/u/3/#inbox", openInNewTab: false },
      { name: "Quaternary Account", url: "https://mail.google.com/mail/u/4/#inbox", openInNewTab: false },
      { name: "Quinary Account", url: "https://mail.google.com/mail/u/2/#inbox", openInNewTab: false },
    ],
  };

  let musicController = null;
  let showLyricsSetting = true;
  let pageAnimationsSetting = true;
  let currentLyricText = "";
  const nowPlayingContainer = document.getElementById("nowPlayingText");
  const nowPlayingBar = document.getElementById("nowPlayingBar");
  const nowPlayingTitle = document.getElementById("nowPlayingTitle");
  const nowPlayingArtist = document.getElementById("nowPlayingArtist");
  const nowPlayingLyrics = document.getElementById("nowPlayingLyrics");
  const nowPlayingControls = document.getElementById("nowPlayingControls");
  const musicPlayPauseBtn = document.getElementById("musicPlayPauseBtn");
  const musicNextBtn = document.getElementById("musicNextBtn");

  function changefavicon(isEnabled) {
    if (!isEnabled) return;
    const isFirefox = typeof InstallTrigger !== "undefined";
    const faviconLink = document.querySelector('link[rel="icon"]');
    if (isFirefox && faviconLink) {
      faviconLink.href = "assets/images/Gprofile.gif";
    } else if (faviconLink) {
      faviconLink.href = "assets/images/icons/icons-x192.png";
    }
  }

  function updateLyricsUI() {
    if (!nowPlayingLyrics) return;
    if (showLyricsSetting && currentLyricText) {
      nowPlayingLyrics.textContent = currentLyricText;
      nowPlayingLyrics.classList.add("visible");
    } else {
      nowPlayingLyrics.classList.remove("visible");
      setTimeout(() => {
        if (!nowPlayingLyrics.classList.contains("visible")) {
          nowPlayingLyrics.textContent = "";
        }
      }, 350);
    }
  }

  function getShortcutIconHtml(shortcut) {
    if (shortcut.iconType === "bootstrap") {
      return `<i class="${shortcut.iconValue}"></i>`;
    } else if (shortcut.iconType === "image" && shortcut.iconValue) {
      return `<img src="${shortcut.iconValue}" alt="${shortcut.name}" class="shortcut-img" />`;
    } else {
      let url = shortcut.url || "";
      if (url && !/^https?:\/\//i.test(url)) {
        url = "https://" + url;
      }
      try {
        const urlObj = new URL(url);
        return `<img src="https://www.google.com/s2/favicons?sz=64&domain=${urlObj.hostname}" alt="${shortcut.name}" class="shortcut-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';" /><i class="bi bi-link-45deg" style="display:none;"></i>`;
      } catch (e) {
        return `<i class="bi bi-link-45deg"></i>`;
      }
    }
  }

  function renderShortcuts(shortcuts, gmailSettings, gmailDropdownItems) {
    const $container = $(".shortcuts-container");
    if (!$container.length) return;
    $container.empty();

    if (gmailSettings) {
      const gName = gmailSettings.name || "Gmail";
      let gUrl = gmailSettings.url || "https://mail.google.com";
      if (gUrl && !/^https?:\/\//i.test(gUrl)) {
        gUrl = "https://" + gUrl;
      }
      const gTarget = gmailSettings.openInNewTab ? 'target="_blank"' : 'target="_self"';
      const enableDropdown = gmailSettings.enableDropdown !== false;

      let gmailHtml = "";
      const visibleItems = gmailDropdownItems ? gmailDropdownItems.filter((item) => item.visible !== false) : [];

      if (enableDropdown && visibleItems.length > 0) {
        gmailHtml += `
          <div class="position-relative shortcut-dropdown-wrapper">
            <a href="${gUrl || "#"}" ${gTarget} class="d-flex align-items-center justify-content-center text-decoration-none text-white shortcut-item liquid-glass no-tilt lg-depth-1" title="${gName}">
              <i class="bi bi-envelope-at"></i>
            </a>
            <div class="p-2 position-absolute shortcut-dropdown liquid-glass no-tilt lg-depth-2">`;

        visibleItems.forEach((item) => {
          let itemUrl = item.url || "";
          if (itemUrl && !/^https?:\/\//i.test(itemUrl)) {
            itemUrl = "https://" + itemUrl;
          }
          const itemTarget = item.openInNewTab ? 'target="_blank"' : 'target="_self"';
          gmailHtml += `
            <a href="${itemUrl || "#"}" ${itemTarget} class="d-flex gap-2 align-items-center text-white text-decoration-none shortcut-dropdown-item">
              <i class="bi bi-link-45deg"></i>
              <span>${item.name || "Account"}</span>
            </a>`;
        });

        gmailHtml += `
            </div>
          </div>`;
      } else {
        gmailHtml += `
          <a href="${gUrl || "#"}" ${gTarget} class="d-flex align-items-center justify-content-center text-decoration-none text-white shortcut-item liquid-glass no-tilt lg-depth-1" title="${gName}">
            <i class="bi bi-envelope-at"></i>
          </a>`;
      }
      $container.append(gmailHtml);
    }

    if (shortcuts && shortcuts.length > 0) {
      shortcuts.forEach((item, index) => {
        let url = item.url || "";
        if (url && !/^https?:\/\//i.test(url)) {
          url = "https://" + url;
        }
        const target = item.openInNewTab ? 'target="_blank"' : 'target="_self"';
        const iconHtml = getShortcutIconHtml(item);

        $container.append(`
          <a href="${url || "#"}" ${target} draggable="true" data-index="${index}" class="d-flex align-items-center justify-content-center text-decoration-none text-white shortcut-item liquid-glass no-tilt lg-depth-1 draggable-shortcut" title="${item.name || ""}">
            ${iconHtml}
          </a>
        `);
      });
    }

    if (typeof GlassThemeChange === "function") GlassThemeChange();
    if (typeof GlassInteractive === "function") GlassInteractive(true);
    chrome.storage.local.get("tilt", function (res) {
      if (typeof GlassTilt === "function") GlassTilt(res.tilt !== false, 10);
    });
  }

  const logoImages = ["assets/images/mainLogo.png", "assets/images/Gprofile.gif", "assets/images/portal.gif"];

  chrome.storage.local.get(defaultSettings, function (items) {
    BGcircleTheme(items.circles, items.circleTheme, items.circleSpeed);
    ThemeChange(items.darkMode ? "dark" : "light");
    $(".loader").addClass("d-none");

    GlassThemeChange();
    GlassInteractive(true);
    GlassTilt(items.tilt, 10);
    GlassDepth(3);
    initSearchController();
    initQuoteController(items.onlineApi, items.contentType, items.apiNinjaKey);

    renderShortcuts(items.shortcuts, items.gmailSettings, items.gmailDropdownItems);

    pageAnimationsSetting = items.pageAnimations !== false;
    if (!pageAnimationsSetting) {
      document.body.classList.add("no-animations");
    } else {
      document.body.classList.remove("no-animations");
    }

    runEntranceAnimations(pageAnimationsSetting);

    runLogoTransition($(".header-logo"), logoImages, pageAnimationsSetting);

    if (nowPlayingBar) {
      if (items.musicEnabled) {
        nowPlayingBar.style.setProperty("display", "", "important");
      } else {
        nowPlayingBar.style.setProperty("display", "none", "important");
        toggleNowPlayingBarAnimation(false, false);
      }
    }

    applyBackgroundSettings(items.bgStyle, items.bgGradient, items.customBgImage, items.slideshowInterval, items.dynamicWallpaperFolder, items.adaptiveTextColor);
    initWeatherWidget(items.weatherEnabled, items.weatherUnit);
    initBatteryWidget(items.batteryEnabled);
    initCountdownWidget(items.countdownEnabled, items.countdownName, items.countdownDate);
    initKeyboardShortcuts();
    initEasterEggs(items.screensaverEnabled, items.screensaverType, parseInt(items.screensaverIdle || 5) * 60000);
    initDraggableShortcuts(items.shortcuts);
    changefavicon(true);

    musicController = initMusicController({
      enabled: items.musicEnabled,
      volume: items.musicVolume,
      delaySeconds: items.musicDelay,
    });

    showLyricsSetting = items.showLyrics;
    updateLyricsUI();
  });

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local") {
      if (changes.shortcuts !== undefined || changes.gmailSettings !== undefined || changes.gmailDropdownItems !== undefined) {
        chrome.storage.local.get(defaultSettings, function (items) {
          renderShortcuts(items.shortcuts, items.gmailSettings, items.gmailDropdownItems);
        });
      }
      if (changes.circles !== undefined || changes.circleTheme !== undefined || changes.circleSpeed !== undefined) {
        chrome.storage.local.get(defaultSettings, function (items) {
          BGcircleTheme(items.circles, items.circleTheme, items.circleSpeed);
        });
      }
      if (changes.darkMode !== undefined) {
        ThemeChange(changes.darkMode.newValue ? "dark" : "light");
      }
      if (changes.tilt !== undefined) {
        GlassTilt(changes.tilt.newValue, 10);
      }
      if (changes.searchEngine !== undefined) {
        const engine = changes.searchEngine.newValue;
        const $targetOption = $(`.engine-option[data-engine="${engine}"]`);
        if ($targetOption.length) {
          $(".engine-option").removeClass("active");
          $targetOption.addClass("active");
          const action = $targetOption.data("action");
          const placeholder = $targetOption.data("placeholder");
          $("#searchForm").attr("action", action);
          $("#searchInput").attr("placeholder", placeholder);
          const engineIcons = {
            google: "bi-google",
            bing: "bi-microsoft",
            duckduckgo: "bi-shield-shaded",
            youtube: "bi-youtube",
            chatgpt: "bi-chat-dots",
            grok: "bi-chat-dots",
            claude: "bi-chat-dots",
          };
          $("#current-engine-icon")
            .removeClass()
            .addClass(`bi ${engineIcons[engine] || "bi-search"}`);
        }
      }
      if (changes.onlineApi !== undefined || changes.contentType !== undefined || changes.apiNinjaKey !== undefined) {
        chrome.storage.local.get(defaultSettings, function (items) {
          initQuoteController(items.onlineApi, items.contentType, items.apiNinjaKey);
        });
      }
      if (changes.musicEnabled !== undefined || changes.musicDelay !== undefined) {
        if (musicController) musicController.stop();
        chrome.storage.local.get(defaultSettings, function (items) {
          if (nowPlayingBar) {
            if (items.musicEnabled) {
              nowPlayingBar.style.setProperty("display", "", "important");
              toggleNowPlayingBarAnimation(true, pageAnimationsSetting);
            } else {
              nowPlayingBar.style.setProperty("display", "none", "important");
              toggleNowPlayingBarAnimation(false, pageAnimationsSetting);
            }
          }
          musicController = initMusicController({
            enabled: items.musicEnabled,
            volume: items.musicVolume,
            delaySeconds: items.musicDelay,
            bypassDelay: true,
          });
        });
      } else if (changes.musicVolume !== undefined) {
        if (musicController) {
          musicController.setVolume(changes.musicVolume.newValue);
        }
      }
      if (changes.showLyrics !== undefined) {
        showLyricsSetting = changes.showLyrics.newValue;
        updateLyricsUI();
      }
      if (changes.pageAnimations !== undefined) {
        pageAnimationsSetting = changes.pageAnimations.newValue !== false;
        if (!pageAnimationsSetting) {
          document.body.classList.add("no-animations");
        } else {
          document.body.classList.remove("no-animations");
        }
        runLogoTransition($(".header-logo"), logoImages, pageAnimationsSetting);
      }
      if (changes.bgStyle !== undefined || changes.bgGradient !== undefined || changes.customBgImage !== undefined || changes.slideshowInterval !== undefined || changes.dynamicWallpaperFolder !== undefined || changes.adaptiveTextColor !== undefined) {
        chrome.storage.local.get(defaultSettings, function (items) {
          applyBackgroundSettings(items.bgStyle, items.bgGradient, items.customBgImage, items.slideshowInterval, items.dynamicWallpaperFolder, items.adaptiveTextColor);
        });
      }
      if (changes.weatherEnabled !== undefined || changes.weatherUnit !== undefined || changes.manualWeatherLat !== undefined || changes.manualWeatherLon !== undefined) {
        chrome.storage.local.get(defaultSettings, function (items) {
          initWeatherWidget(items.weatherEnabled, items.weatherUnit);
        });
      }
      if (changes.batteryEnabled !== undefined) {
        chrome.storage.local.get(defaultSettings, function (items) {
          initBatteryWidget(items.batteryEnabled);
        });
      }
      if (changes.countdownEnabled !== undefined || changes.countdownName !== undefined || changes.countdownDate !== undefined) {
        chrome.storage.local.get(defaultSettings, function (items) {
          initCountdownWidget(items.countdownEnabled, items.countdownName, items.countdownDate);
        });
      }
      if (changes.shortcuts !== undefined) {
        chrome.storage.local.get(defaultSettings, function (items) {
          initDraggableShortcuts(items.shortcuts);
        });
      }
      if (changes.screensaverEnabled !== undefined || changes.screensaverType !== undefined || changes.screensaverIdle !== undefined) {
        chrome.storage.local.get(defaultSettings, function (items) {
          initEasterEggs(items.screensaverEnabled, items.screensaverType, parseInt(items.screensaverIdle || 5) * 60000);
        });
      }
    }
  });

  let clearTextTimeout = null;
  let isPlayingState = false;
  let pausedByVisibility = false;

  document.addEventListener("visibilitychange", () => {
    if (!musicController) return;
    if (document.hidden) {
      if (isPlayingState) {
        musicController.togglePlayPause();
        pausedByVisibility = true;
      }
    } else {
      if (pausedByVisibility) {
        musicController.togglePlayPause();
        pausedByVisibility = false;
      }
    }
  });

  window.addEventListener("lyricupdate", (e) => {
    currentLyricText = e.detail.text || "";
    updateLyricsUI();
  });

  window.addEventListener("nowplaying", (e) => {
    const { status, playing, title, artist, cover } = e.detail;
    if (!nowPlayingBar) return;

    nowPlayingBar.classList.remove("now-playing-error");
    nowPlayingArtist.setAttribute("title", artist || "Unknown Artist");
    nowPlayingContainer.setAttribute("title", artist || "Unknown Artist");

    if (clearTextTimeout) {
      clearTimeout(clearTextTimeout);
      clearTextTimeout = null;
    }

    const noteIcon = nowPlayingBar.querySelector(".now-playing-icon > i");
    let imgEl = nowPlayingBar.querySelector(".now-playing-cover-img");

    const bgLayer = nowPlayingBar.querySelector(".now-playing-bg");

    if (status !== "stopped" && cover) {
      if (!imgEl) {
        imgEl = document.createElement("img");
        imgEl.className = "now-playing-cover-img";
        nowPlayingBar.querySelector(".now-playing-icon").appendChild(imgEl);
      }
      imgEl.src = `assets/music/${cover}`;
      imgEl.style.display = "block";
      if (noteIcon) noteIcon.style.opacity = "0";

      if (bgLayer) bgLayer.style.backgroundImage = `url(assets/music/${cover})`;
    } else {
      if (imgEl) imgEl.style.display = "none";
      if (noteIcon) noteIcon.style.opacity = "";
      if (bgLayer) bgLayer.style.backgroundImage = "";
    }

    if (status === "stopped") {
      changeTabTitle({ title, artist, status: "stopped" });
      isPlayingState = false;
      pausedByVisibility = false;
      nowPlayingTitle.textContent = "Idle";
      nowPlayingArtist.textContent = "No song playing";
      nowPlayingTitle.classList.remove("marquee");
      nowPlayingBar.classList.remove("audio-active");

      const equalizer = nowPlayingBar.querySelector(".now-playing-bars");
      if (equalizer) equalizer.classList.add("paused");

      if (musicPlayPauseBtn) {
        musicPlayPauseBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
      }

      if (!nowPlayingBar.classList.contains("visible")) {
        toggleNowPlayingBarAnimation(true, pageAnimationsSetting);
      }
    } else if (status === "paused") {
      changeTabTitle({ title, artist, status: "paused" });
      isPlayingState = false;
      nowPlayingTitle.textContent = title;
      nowPlayingArtist.textContent = artist;
      nowPlayingBar.classList.add("audio-active");

      nowPlayingTitle.classList.remove("marquee");
      if (title.length > 22) {
        nowPlayingTitle.classList.add("marquee");
      }

      const equalizer = nowPlayingBar.querySelector(".now-playing-bars");
      if (equalizer) equalizer.classList.add("paused");

      if (musicPlayPauseBtn) {
        musicPlayPauseBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
      }

      if (!nowPlayingBar.classList.contains("visible")) {
        toggleNowPlayingBarAnimation(true, pageAnimationsSetting);
      }
    } else {
      changeTabTitle({ title, artist, status: "playing" });
      isPlayingState = true;
      nowPlayingTitle.textContent = title;
      nowPlayingArtist.textContent = artist;
      nowPlayingBar.classList.add("audio-active");

      nowPlayingTitle.classList.remove("marquee");
      if (title.length > 22) {
        nowPlayingTitle.classList.add("marquee");
      }

      const equalizer = nowPlayingBar.querySelector(".now-playing-bars");
      if (equalizer) equalizer.classList.remove("paused");

      if (musicPlayPauseBtn) {
        musicPlayPauseBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
      }

      if (!nowPlayingBar.classList.contains("visible")) {
        toggleNowPlayingBarAnimation(true, pageAnimationsSetting);
      }
    }
  });

  window.addEventListener("nowplayingerror", (e) => {
    if (!nowPlayingBar) return;
    const { reason } = e.detail;

    nowPlayingTitle.textContent = "⚠ Playback Error";
    nowPlayingArtist.textContent = "No song playing";
    nowPlayingContainer.setAttribute("title", reason || "Could not play audio.");
    nowPlayingTitle.classList.remove("marquee");
    toggleNowPlayingBarAnimation(true, pageAnimationsSetting);
    nowPlayingBar.classList.add("now-playing-error");
    changeTabTitle({ status: "default" });
  });

  function changeTabTitle(options = {}) {
    const { title = "New Tab", artist = "", status = "" } = options;

    if (status === "stopped") {
      document.title = `${title} - ${artist} (Stopped)`;
      setTimeout(() => {
        document.title = "New Tab";
      }, 3000);
    } else if (status === "paused") {
      document.title = `${title} - ${artist} (Paused)`;
    } else if (status === "default") {
      document.title = "New Tab";
    } else {
      document.title = `${title} - ${artist}`;
    }
  }

  if (nowPlayingBar) {
    nowPlayingBar.addEventListener("click", (e) => {
      if (e.target.closest("#nowPlayingLyrics") || e.target.closest("#nowPlayingControls")) {
        return;
      }
      if (nowPlayingControls) {
        const isVisible = nowPlayingControls.classList.toggle("visible");
        nowPlayingBar.classList.toggle("controls-visible", isVisible);
      }
    });
  }

  if (musicPlayPauseBtn) {
    musicPlayPauseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (musicController) musicController.togglePlayPause();
    });
  }

  if (musicNextBtn) {
    musicNextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (musicController) musicController.next();
    });
  }

  $(document).on("click", ".shortcut-dropdown-wrapper .shortcut-item", function (e) {
    const $dropdownWrapper = $(this).closest(".shortcut-dropdown-wrapper");
    const $dropdownMenu = $dropdownWrapper.find(".shortcut-dropdown");
    if ($dropdownMenu.length) {
      e.preventDefault();
      e.stopPropagation();
      $(".shortcut-dropdown").not($dropdownMenu).removeClass("show");
      $dropdownMenu.toggleClass("show");
    }
  });

  $(document).on("click", ".shortcut-dropdown-item", function () {
    $(".shortcut-dropdown").removeClass("show");
  });

  $(document).on("click", function (e) {
    const $dropdownWrapper = $(".shortcut-dropdown-wrapper");
    if (!$dropdownWrapper.is(e.target) && $dropdownWrapper.has(e.target).length === 0) {
      $(".shortcut-dropdown").removeClass("show");
    }
  });

  let slideshowTimer = null;
  let currentSlideshowIndex = 0;

  const slideshowWallpapers = [
    "https://images.unsplash.com/photo-1491466424936-e304919aada7?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1530675706010-bc677ce30ab6?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1503431128871-cd250803fa41?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1585468274952-66591eb14165?auto=format&fit=crop&w=1920&q=80",
  ];

  let DynamicWallpaperTimer = null;

  function updateThemeBasedOnBrightness(brightness, adaptiveTextColor) {
    if (!adaptiveTextColor) {
      document.body.classList.remove("theme-light-bg");
      return;
    }
    // Lowered threshold to 140 for better sensitivity to bright backgrounds
    if (brightness >= 140) {
      document.body.classList.add("theme-light-bg");
    } else {
      document.body.classList.remove("theme-light-bg");
    }
  }

  function analyzeImageBrightness(imageUrl, adaptiveTextColor) {
    if (!adaptiveTextColor) {
      document.body.classList.remove("theme-light-bg");
      return;
    }
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = function() {
      const canvas = document.createElement("canvas");
      canvas.width = 50;
      canvas.height = 50;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, 50, 50);
      try {
        const data = ctx.getImageData(0, 0, 50, 50).data;
        let r = 0, g = 0, b = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i+1];
          b += data[i+2];
        }
        const pixels = data.length / 4;
        const brightness = Math.round((r / pixels) * 0.299 + (g / pixels) * 0.587 + (b / pixels) * 0.114);
        updateThemeBasedOnBrightness(brightness, adaptiveTextColor);
      } catch (e) {
        document.body.classList.remove("theme-light-bg");
      }
    };
    img.onerror = () => document.body.classList.remove("theme-light-bg");
    img.src = imageUrl;
  }

  function analyzeGradientBrightness(gradientStr, adaptiveTextColor) {
    if (!adaptiveTextColor) {
      document.body.classList.remove("theme-light-bg");
      return;
    }
    const rgbMatches = [...gradientStr.matchAll(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g)];
    const hexMatches = [...gradientStr.matchAll(/#([0-9a-fA-F]{3,6})/g)];
    let totalBright = 0, count = 0;
    
    rgbMatches.forEach(m => {
      totalBright += Math.round(m[1]*0.299 + m[2]*0.587 + m[3]*0.114);
      count++;
    });
    hexMatches.forEach(m => {
      let hex = m[1];
      if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
      totalBright += Math.round(parseInt(hex.substr(0, 2), 16)*0.299 + parseInt(hex.substr(2, 2), 16)*0.587 + parseInt(hex.substr(4, 2), 16)*0.114);
      count++;
    });
    
    if (count > 0) {
      updateThemeBasedOnBrightness(totalBright / count, adaptiveTextColor);
    } else {
      document.body.classList.remove("theme-light-bg");
    }
  }

  function applyBackgroundSettings(bgStyle, bgGradient, customBgImage, slideshowInterval, dynamicWallpaperFolder, adaptiveTextColor) {
    if (slideshowTimer) {
      clearInterval(slideshowTimer);
      slideshowTimer = null;
    }

    if (DynamicWallpaperTimer) {
      clearInterval(DynamicWallpaperTimer);
      DynamicWallpaperTimer = null;
    }

    document.body.style.background = "";
    document.body.style.backgroundImage = "";
    document.body.style.transition = "background-image 1.5s ease-in-out";

    const circlesContainer = document.querySelector(".circles");
    if (bgStyle === "circles") {
      updateThemeBasedOnBrightness(0, adaptiveTextColor); // Dark theme
      if (circlesContainer) circlesContainer.style.display = "";
    } else {
      if (circlesContainer) circlesContainer.style.display = "none";
    }

    if (bgStyle === "gradient") {
      const grad = bgGradient || "linear-gradient(135deg, #0f2027, #203a43, #2c5364)";
      document.body.style.background = grad;
      analyzeGradientBrightness(grad, adaptiveTextColor);
    } else if (bgStyle === "image") {
      if (customBgImage) {
        document.body.style.backgroundImage = `url(${customBgImage})`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundRepeat = "no-repeat";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundAttachment = "fixed";
        document.body.style.transition = "background-image 1.5s ease-in-out";
        analyzeImageBrightness(customBgImage, adaptiveTextColor);
      } else {
        document.body.style.background = "linear-gradient(135deg, #0f2027, #203a43, #2c5364)";
        analyzeGradientBrightness("linear-gradient(135deg, #0f2027, #203a43, #2c5364)", adaptiveTextColor);
      }
    } else if (bgStyle === "slideshow") {
      const changeWallpaper = () => {
        const wp = slideshowWallpapers[currentSlideshowIndex];
        document.body.style.backgroundImage = `url(${wp})`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundAttachment = "fixed";
        document.body.style.transition = "background-image 1.5s ease-in-out";
        analyzeImageBrightness(wp, adaptiveTextColor);
        currentSlideshowIndex = (currentSlideshowIndex + 1) % slideshowWallpapers.length;
      };
      changeWallpaper();
      const intervalMs = parseInt(slideshowInterval || "5") * 60 * 1000;
      slideshowTimer = setInterval(changeWallpaper, intervalMs);
    } else if (bgStyle === "dynamic") {
      const applyDynamic = (wallpapersData) => {
        const selectedFolder = dynamicWallpaperFolder || "RJC_Wallpaper";
        const theme = wallpapersData.wallpapers.find(w => w.folder === selectedFolder) || wallpapersData.wallpapers[0];
        if (!theme) return;

        const changeDynamicWallpaper = () => {
          const currentHour = new Date().getHours();
          const imgIndex = theme.config.hourToWallpaper[currentHour] || 0;
          const imgFile = theme.config.imageFilename.replace('*', imgIndex);
          const dwp = `assets/images/DynamicWallpapers/${theme.folder}/${imgFile}`;
          
          document.body.style.backgroundImage = `url(${dwp})`;
          document.body.style.backgroundSize = "cover";
          document.body.style.backgroundPosition = "center";
          document.body.style.backgroundAttachment = "fixed";
          document.body.style.transition = "background-image 500ms ease-in-out";
          analyzeImageBrightness(dwp, adaptiveTextColor);
        };
        changeDynamicWallpaper();
        DynamicWallpaperTimer = setInterval(changeDynamicWallpaper, 1000);
      };

      if (window.dynamicWallpapersData) {
        applyDynamic(window.dynamicWallpapersData);
      } else {
        fetch('assets/images/DynamicWallpapers/folders.json')
          .then(res => res.json())
          .then(data => {
            window.dynamicWallpapersData = data;
            applyDynamic(data);
          })
          .catch(err => console.error("Error loading dynamic wallpapers:", err));
      }
    }
  }

  let weatherTimer = null;
  function initWeatherWidget(enabled, unit) {
    const widget = document.getElementById("weatherWidget");
    if (!widget) return;

    if (weatherTimer) {
      clearInterval(weatherTimer);
      weatherTimer = null;
    }

    if (!enabled) {
      widget.classList.add("d-none");
      return;
    }

    widget.classList.remove("d-none");

    // change to loading state
    document.getElementById("weatherIcon").className = "bi bi-arrow-repeat weather-loading";
    document.getElementById("weatherTemp").textContent = "Loading...";

    if (!navigator.geolocation) {
      document.getElementById("weatherIcon").className = "bi bi-geo-alt-slash";
      document.getElementById("weatherTemp").textContent = "Geolocation not supported";
      return;
    }

    if (!navigator.onLine) {
      document.getElementById("weatherIcon").className = "bi bi-cloud-slash";
      document.getElementById("weatherTemp").textContent = "Offline";
      return;
    }

    const fetchWeatherData = (lat, lon) => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.current_weather) {
            let temp = data.current_weather.temperature;
            const code = data.current_weather.weathercode;
            if (unit === "fahrenheit") {
              temp = (temp * 9) / 5 + 32;
              temp = temp % 1 !== 0 ? temp.toFixed(1) : temp.toFixed(0);
              document.getElementById("weatherTemp").textContent = `${temp}°F`;
            } else {
              temp = temp % 1 !== 0 ? temp.toFixed(1) : temp.toFixed(0);
              document.getElementById("weatherTemp").textContent = `${temp}°C`;
            }

            const iconEl = document.getElementById("weatherIcon");
            if (iconEl) {
              iconEl.className = getWeatherIconClass(code);
            }

            const weatherDesc = getWeatherDescription(code);
            document.getElementById("weatherWidget").setAttribute("title", weatherDesc || "Weather");
          }
        })
        .catch((err) => console.error("Error fetching weather:", err));
    };

    const fetchWeather = () => {
      chrome.storage.local.get(["manualWeatherLat", "manualWeatherLon", "weatherLat", "weatherLon"], function (res) {
        if (res.manualWeatherLat && res.manualWeatherLon) {
          fetchWeatherData(res.manualWeatherLat, res.manualWeatherLon);
        } else if (res.weatherLat && res.weatherLon) {
          fetchWeatherData(res.weatherLat, res.weatherLon);
        } else {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude;
              const lon = position.coords.longitude;
              chrome.storage.local.set({ weatherLat: lat, weatherLon: lon });
              fetchWeatherData(lat, lon);
            },
            (err) => {
              // fallback hardcoded location
              fetchWeatherData(14.4276, 120.9372);
            },
          );
        }
      });
    };

    fetchWeather();
    weatherTimer = setInterval(fetchWeather, 10 * 60 * 1000);
  }

  function getWeatherIconClass(code) {
    if (code === 0) return "bi bi-sun";
    if (code >= 1 && code <= 3) return "bi bi-cloud-sun";
    if (code === 45 || code === 48) return "bi bi-cloud-fog2";
    if (code >= 51 && code <= 55) return "bi bi-cloud-drizzle";
    if (code >= 61 && code <= 65) return "bi bi-cloud-rain";
    if (code >= 71 && code <= 77) return "bi bi-cloud-snow";
    if (code >= 80 && code <= 82) return "bi bi-cloud-rain-heavy";
    if (code >= 95) return "bi bi-cloud-lightning-rain";
    return "bi bi-cloud-sun";
  }

  function getWeatherDescription(code) {
    const key = String(code).padStart(2, "0");

    const weatherDescriptions = {
      // 00-19: No precipitation at the station
      "00": "Cloud development not observed or not observable",
      "01": "Clouds generally dissolving or becoming less developed",
      "02": "State of sky on the whole unchanged",
      "03": "Clouds generally forming or developing",
      "04": "Visibility reduced by smoke, e.g. veldt or forest fires, industrial smoke or volcanic ashes",
      "05": "Haze",
      "06": "Widespread dust in suspension in the air, not raised by wind at or near the station",
      "07": "Dust or sand raised by wind at or near the station, but no well developed dust whirl(s) or sand whirl(s)",
      "08": "Well developed dust whirl(s) or sand whirl(s) seen, but no duststorm or sandstorm",
      "09": "Duststorm or sandstorm within sight or at the station during the preceding hour",
      10: "Mist",
      11: "Patches of shallow fog or ice fog at the station",
      12: "More or less continuous shallow fog or ice fog at the station",
      13: "Lightning visible, no thunder heard",
      14: "Precipitation within sight, not reaching the ground or the surface of the sea",
      15: "Precipitation within sight, reaching the ground, but distant (>5 km)",
      16: "Precipitation within sight, reaching the ground, near to, but not at the station",
      17: "Thunderstorm, but no precipitation at the time of observation",
      18: "Squalls at or within sight of the station during the preceding hour or at the time of observation",
      19: "Funnel cloud(s) (Tornado cloud or water-spout)",

      // 20-29: Precipitation, fog, etc. during the preceding hour but not now
      20: "Drizzle (not freezing) or snow grains not falling as shower(s)",
      21: "Rain (not freezing)",
      22: "Snow",
      23: "Rain and snow or ice pellets",
      24: "Freezing drizzle or freezing rain",
      25: "Shower(s) of rain",
      26: "Shower(s) of snow, or of rain and snow",
      27: "Shower(s) of hail, or of rain and hail",
      28: "Fog or ice fog",
      29: "Thunderstorm (with or without precipitation)",

      // 30-39: Duststorm, sandstorm, drifting or blowing snow
      30: "Slight or moderate duststorm or sandstorm - has decreased during the preceding hour",
      31: "Slight or moderate duststorm or sandstorm - no appreciable change",
      32: "Slight or moderate duststorm or sandstorm - has begun or has increased",
      33: "Severe duststorm or sandstorm - has decreased during the preceding hour",
      34: "Severe duststorm or sandstorm - no appreciable change",
      35: "Severe duststorm or sandstorm - has begun or has increased",
      36: "Slight or moderate blowing snow generally low (below eye level)",
      37: "Heavy drifting snow",
      38: "Slight or moderate blowing snow generally high (above eye level)",
      39: "Heavy drifting snow",

      // 40-49: Fog or ice fog at the time of observation
      40: "Fog or ice fog at a distance, but not at the station during the preceding hour",
      41: "Fog or ice fog in patches",
      42: "Fog or ice fog, sky visible - has become thinner during the preceding hour",
      43: "Fog or ice fog, sky invisible",
      44: "Fog or ice fog, sky visible - no appreciable change during the preceding hour",
      45: "Fog or ice fog, sky invisible",
      46: "Fog or ice fog, sky visible - has begun or has become thicker",
      47: "Fog or ice fog, sky invisible",
      48: "Fog, depositing rime, sky visible",
      49: "Fog, depositing rime, sky invisible",

      // 50-59: Drizzle
      50: "Drizzle, not freezing, intermittent - slight at time of observation",
      51: "Drizzle, not freezing, continuous - slight at time of observation",
      52: "Drizzle, not freezing, intermittent - moderate at time of observation",
      53: "Drizzle, not freezing, continuous - moderate at time of observation",
      54: "Drizzle, not freezing, intermittent - heavy at time of observation",
      55: "Drizzle, not freezing, continuous - heavy at time of observation",
      56: "Drizzle, freezing, slight",
      57: "Drizzle, freezing, moderate or heavy",
      58: "Drizzle and rain, slight",
      59: "Drizzle and rain, moderate or heavy",

      // 60-69: Rain
      60: "Rain, not freezing, intermittent - slight at time of observation",
      61: "Rain, not freezing, continuous - slight at time of observation",
      62: "Rain, not freezing, intermittent - moderate at time of observation",
      63: "Rain, not freezing, continuous - moderate at time of observation",
      64: "Rain, not freezing, intermittent - heavy at time of observation",
      65: "Rain, not freezing, continuous - heavy at time of observation",
      66: "Rain, freezing, slight",
      67: "Rain, freezing, moderate or heavy",
      68: "Rain or drizzle and snow, slight",
      69: "Rain or drizzle and snow, moderate or heavy",

      // 70-79: Solid precipitation (not in showers)
      70: "Intermittent fall of snowflakes - slight at time of observation",
      71: "Continuous fall of snowflakes - slight at time of observation",
      72: "Intermittent fall of snowflakes - moderate at time of observation",
      73: "Continuous fall of snowflakes - moderate at time of observation",
      74: "Intermittent fall of snowflakes - heavy at time of observation",
      75: "Continuous fall of snowflakes - heavy at time of observation",
      76: "Diamond dust (with or without fog)",
      77: "Snow grains (with or without fog)",
      78: "Isolated star-like snow crystals (with or without fog)",
      79: "Ice pellets",

      // 80-99: Showery precipitation or thunderstorm
      80: "Rain shower(s), slight",
      81: "Rain shower(s), moderate or heavy",
      82: "Rain shower(s), violent",
      83: "Shower(s) of rain and snow mixed, slight",
      84: "Shower(s) of rain and snow mixed, moderate or heavy",
      85: "Snow shower(s), slight",
      86: "Snow shower(s), moderate or heavy",
      87: "Shower(s) of snow pellets or small hail - slight",
      88: "Shower(s) of snow pellets or small hail - moderate or heavy",
      89: "Shower(s) of hail - slight",
      90: "Shower(s) of hail - moderate or heavy",
      91: "Slight rain at time of observation - Thunderstorm during the preceding hour but not now",
      92: "Moderate or heavy rain at time of observation - Thunderstorm during the preceding hour but not now",
      93: "Slight snow, or rain and snow mixed or hail at time of observation - Thunderstorm during the preceding hour",
      94: "Moderate or heavy snow, or rain and snow mixed or hail at time of observation - Thunderstorm during the preceding hour",
      95: "Thunderstorm, slight or moderate, without hail but with rain and/or snow",
      96: "Thunderstorm, slight or moderate, with hail",
      97: "Thunderstorm, heavy, without hail but with rain and/or snow",
      98: "Thunderstorm combined with duststorm or sandstorm",
      99: "Thunderstorm, heavy, with hail",
    };

    return weatherDescriptions[key] || `Unknown weather code: ${code}`;
  }

  function initBatteryWidget(enabled) {
    const widget = document.getElementById("batteryWidget");
    if (!widget) return;

    if (!enabled || !navigator.getBattery) {
      widget.classList.add("d-none");
      return;
    }

    widget.classList.remove("d-none");

    const updateBatteryStatus = (battery) => {
      const pct = Math.round(battery.level * 100);
      document.getElementById("batteryPercent").textContent = `${pct}%`;

      const iconEl = document.getElementById("batteryIcon");
      if (iconEl) {
        if (battery.charging) {
          iconEl.className = "text-success bi bi-battery-charging";
        } else if (pct <= 20) {
          iconEl.className = "text-danger bi bi-battery";
        } else if (pct <= 50) {
          iconEl.className = "bi bi-battery-half";
        } else {
          iconEl.className = "bi bi-battery-full";
        }
      }
    };

    navigator.getBattery().then((battery) => {
      updateBatteryStatus(battery);
      battery.addEventListener("levelchange", () => updateBatteryStatus(battery));
      battery.addEventListener("chargingchange", () => updateBatteryStatus(battery));
    });

    navigator.getBattery().then((battery) => {
      if (battery.level === 1 && battery.charging) {
        widget.classList.add("d-none");
      }
    });
  }

  let countdownTimer = null;
  function initCountdownWidget(enabled, name, targetDateStr) {
    const widget = document.getElementById("countdownWidget");
    if (!widget) return;

    let audioContext;

    function getAudioContext() {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      return audioContext;
    }

    function playEasterSound(type = "success") {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      switch (type) {
        case "CountdownComplete": {
          const notes = [
            { freq: 523.25, duration: 0.12 },
            { freq: 659.25, duration: 0.12 },
            { freq: 783.99, duration: 0.12 },
            { freq: 1046.5, duration: 0.35 },
          ];

          let time = now;

          notes.forEach(({ freq, duration }) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, time);

            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.25, time + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(time);
            osc.stop(time + duration);

            time += duration;
          });

          break;
        }

        default:
          // error sound
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(220, now);
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.25, now + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.5);
          break;
      }
    }

    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }

    if (!enabled || !targetDateStr) {
      widget.classList.add("d-none");
      return;
    }

    widget.classList.remove("d-none");
    const nameEl = document.getElementById("countdownName");
    nameEl.textContent = name || "Event";
    nameEl.classList.remove("marquee");
    if (name && name.length > 25) {
      nameEl.classList.add("marquee");
    }

    const targetTime = new Date(targetDateStr).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (isNaN(difference)) {
        document.getElementById("countdownTime").textContent = "Invalid Date";
        return;
      }

      if (difference <= 0) {
        document.getElementById("countdownTime").textContent = "Event Started";
        playEasterSound("CountdownComplete");
        const easterSoundInterval = setInterval(() => {
          playEasterSound("CountdownComplete");
        }, 2000);
        clearInterval(countdownTimer);
        setTimeout(() => {
          clearInterval(easterSoundInterval);
          const newDateTime = new Date();
          newDateTime.setMonth(newDateTime.getMonth() + 1);
          newDateTime.setHours(newDateTime.getHours(), newDateTime.getMinutes(), newDateTime.getSeconds(), 0);
          const formattedDate = newDateTime.toISOString().replace(/\.\d{3}Z$/, "");
          chrome.storage.local.set({
            countdownName: "New Event",
            countdownDate: formattedDate,
            countdownEnabled: false,
          });
        }, 3000);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (days > 0) {
        document.getElementById("countdownTime").textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      } else if (hours > 0) {
        document.getElementById("countdownTime").textContent = `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        document.getElementById("countdownTime").textContent = `${minutes}m ${seconds}s`;
      } else if (seconds > 0) {
        document.getElementById("countdownTime").textContent = `${seconds}s`;
      } else {
        document.getElementById("countdownTime").textContent = "Event Started";
      }
    };

    updateCountdown();
    countdownTimer = setInterval(updateCountdown, 1000);
  }

  function initKeyboardShortcuts() {
    const modal = document.getElementById("keyboardHintsModal");
    const closeBtn = document.getElementById("closeKeyboardHintsBtn");

    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => {
        modal.classList.add("d-none");
      });
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.add("d-none");
        }
      });
    }

    window.addEventListener("keydown", (e) => {
      if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
        if (e.key === "Escape" && document.activeElement.id === "searchInput") {
          document.activeElement.blur();
        }
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        const searchInput = document.getElementById("searchInput");
        if (searchInput) searchInput.focus();
      } else if (e.key === " " || e.key.toLowerCase() === "m") {
        e.preventDefault();
        if (musicController) musicController.togglePlayPause();
      } else if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        if (musicController) musicController.next();
      } else if (e.key.toLowerCase() === "l") {
        e.preventDefault();
        showLyricsSetting = !showLyricsSetting;
        chrome.storage.local.set({ showLyrics: showLyricsSetting });
      } else if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        if (modal) {
          modal.classList.toggle("d-none");
        }
      }
    });
  }

  function initDraggableShortcuts(shortcuts) {
    const container = document.querySelector(".shortcuts-container");
    if (!container) return;

    let draggedItem = null;

    container.addEventListener("dragstart", (e) => {
      const target = e.target.closest(".draggable-shortcut");
      if (target) {
        draggedItem = target;
        target.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
      }
    });

    container.addEventListener("dragend", (e) => {
      const target = e.target.closest(".draggable-shortcut");
      if (target) {
        target.classList.remove("dragging");

        const newShortcuts = [];
        container.querySelectorAll(".draggable-shortcut").forEach((el) => {
          const index = parseInt(el.getAttribute("data-index"));
          if (!isNaN(index) && shortcuts[index]) {
            newShortcuts.push(shortcuts[index]);
          }
        });

        chrome.storage.local.set({ shortcuts: newShortcuts });
      }
    });

    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      const draggingItem = container.querySelector(".dragging");
      if (!draggingItem) return;

      const siblings = [...container.querySelectorAll(".draggable-shortcut:not(.dragging)")];
      const nextSibling = siblings.find((sibling) => {
        const rect = sibling.getBoundingClientRect();
        return e.clientX <= rect.left + rect.width / 2;
      });

      container.insertBefore(draggingItem, nextSibling);
    });
  }
});
