import { BGcircleTheme } from "./assets/js/Background.js";
import { ThemeChange } from "./assets/js/ThemeChange.js";
import { GlassThemeChange, GlassInteractive, GlassTilt, GlassDepth } from "./assets/js/Liquid-glass.js";
import { initSearchController } from "./assets/js/search.js";
import { initQuoteController } from "./assets/js/quote.js";
import { initMusicController } from "./assets/js/music.js";
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
        } catch(e) { result[keys] = undefined; }
      } else if (Array.isArray(keys)) {
        keys.forEach((key) => {
          try {
            const val = localStorage.getItem(key);
            result[key] = val !== null ? JSON.parse(val) : undefined;
          } catch(e) { result[key] = undefined; }
        });
      } else if (typeof keys === "object") {
        Object.keys(keys).forEach((key) => {
          try {
            const val = localStorage.getItem(key);
            result[key] = val !== null ? JSON.parse(val) : keys[key];
          } catch(e) { result[key] = keys[key]; }
        });
      }
      setTimeout(() => callback(result), 0);
    },
    set: function (items, callback) {
      Object.keys(items).forEach((key) => {
        try {
          localStorage.setItem(key, JSON.stringify(items[key]));
        } catch(e) {}
      });
      if (callback) {
        setTimeout(callback, 0);
      }
    }
  };
  chrome.storage.onChanged = {
    addListener: function () {}
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
    circles: true,
    circleTheme: "cv",
    circleSpeed: "normal",
    musicEnabled: false,
    musicVolume: 0.4,
    musicDelay: 15,
    showLyrics: true,
    shortcuts: [
      { name: "GitHub", url: "https://github.com", openInNewTab: false, iconType: "bootstrap", iconValue: "bi-github" },
      { name: "YouTube", url: "https://youtube.com", openInNewTab: false, iconType: "bootstrap", iconValue: "bi-youtube text-danger" },
      { name: "YTS", url: "https://yts.gg/home", openInNewTab: false, iconType: "image", iconValue: "assets/images/shortcuts/yts_x32.png" },
      { name: "TBP CL", url: "https://tbcpl.lol/", openInNewTab: false, iconType: "image", iconValue: "assets/images/shortcuts/tbcp.png" },
    ],
    gmailSettings: {
      name: "Gmail",
      url: "https://mail.google.com",
      openInNewTab: false,
      enableDropdown: true,
    },
    gmailDropdownItems: [
      { name: "Personal Account", url: "https://mail.google.com/mail/u/0/#inbox", openInNewTab: false },
      { name: "Secondary Account", url: "https://mail.google.com/mail/u/1/#inbox", openInNewTab: false },
      { name: "Cvsu Account", url: "https://mail.google.com/mail/u/3/#inbox", openInNewTab: false },
      { name: "Dump Account", url: "https://mail.google.com/mail/u/4/#inbox", openInNewTab: false },
      { name: "Gmail Account 3", url: "https://mail.google.com/mail/u/2/#inbox", openInNewTab: false },
    ],
  };

  let musicController = null;
  let showLyricsSetting = true;
  let currentLyricText = "";
  const nowPlayingContainer = document.getElementById("nowPlayingText");
  const nowPlayingBar = document.getElementById("nowPlayingBar");
  const nowPlayingTitle = document.getElementById("nowPlayingTitle");
  const nowPlayingArtist = document.getElementById("nowPlayingArtist");
  const nowPlayingLyrics = document.getElementById("nowPlayingLyrics");
  const nowPlayingControls = document.getElementById("nowPlayingControls");
  const musicPlayPauseBtn = document.getElementById("musicPlayPauseBtn");
  const musicNextBtn = document.getElementById("musicNextBtn");

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
      shortcuts.forEach((item) => {
        let itemUrl = item.url || "";
        if (itemUrl && !/^https?:\/\//i.test(itemUrl)) {
          itemUrl = "https://" + itemUrl;
        }
        const target = item.openInNewTab ? 'target="_blank"' : 'target="_self"';
        const iconHtml = getShortcutIconHtml(item);

        const shortcutHtml = `
          <a href="${itemUrl || "#"}" ${target} class="d-flex align-items-center justify-content-center text-decoration-none text-white shortcut-item liquid-glass no-tilt lg-depth-1" title="${item.name || ""}">
            ${iconHtml}
          </a>`;
        $container.append(shortcutHtml);
      });
    }

    if (typeof GlassThemeChange === "function") GlassThemeChange();
    if (typeof GlassInteractive === "function") GlassInteractive(true);
    chrome.storage.local.get("tilt", function (res) {
      if (typeof GlassTilt === "function") GlassTilt(res.tilt !== false, 10);
    });
  }

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

    if (nowPlayingBar) {
      if (items.musicEnabled) {
        nowPlayingBar.style.setProperty("display", "", "important");
      } else {
        nowPlayingBar.style.setProperty("display", "none", "important");
      }
    }

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
            } else {
              nowPlayingBar.style.setProperty("display", "none", "important");
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
    const { status, playing, title, artist } = e.detail;
    if (!nowPlayingBar) return;

    nowPlayingBar.classList.remove("now-playing-error");
    nowPlayingArtist.setAttribute("title", artist || "Unknown Artist");
    nowPlayingContainer.setAttribute("title", artist || "Unknown Artist");

    if (clearTextTimeout) {
      clearTimeout(clearTextTimeout);
      clearTextTimeout = null;
    }

    if (status === "stopped") {
      isPlayingState = false;
      pausedByVisibility = false;
      nowPlayingBar.classList.remove("visible");
      if (nowPlayingControls) {
        nowPlayingControls.classList.remove("visible");
        nowPlayingBar.classList.remove("controls-visible");
      }
      clearTextTimeout = setTimeout(() => {
        nowPlayingTitle.textContent = "Idle";
        nowPlayingArtist.textContent = "No song playing";
        nowPlayingTitle.classList.remove("marquee");
        clearTextTimeout = null;
      }, 520);
    } else if (status === "paused") {
      isPlayingState = false;
      nowPlayingTitle.textContent = title;
      nowPlayingArtist.textContent = artist;

      nowPlayingTitle.classList.remove("marquee");
      if (title.length > 22) {
        nowPlayingTitle.classList.add("marquee");
      }

      const equalizer = nowPlayingBar.querySelector(".now-playing-bars");
      if (equalizer) equalizer.classList.add("paused");

      if (musicPlayPauseBtn) {
        musicPlayPauseBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
      }

      nowPlayingBar.classList.add("visible");
    } else {
      isPlayingState = true;
      nowPlayingTitle.textContent = title;
      nowPlayingArtist.textContent = artist;

      nowPlayingTitle.classList.remove("marquee");
      if (title.length > 22) {
        nowPlayingTitle.classList.add("marquee");
      }

      const equalizer = nowPlayingBar.querySelector(".now-playing-bars");
      if (equalizer) equalizer.classList.remove("paused");

      if (musicPlayPauseBtn) {
        musicPlayPauseBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
      }

      nowPlayingBar.classList.add("visible");
    }
  });

  window.addEventListener("nowplayingerror", (e) => {
    if (!nowPlayingBar) return;
    const { reason } = e.detail;

    nowPlayingTitle.textContent = "⚠ Playback Error";
    nowPlayingArtist.textContent = "No song playing";
    nowPlayingContainer.setAttribute("title", reason || "Could not play audio.");
    nowPlayingTitle.classList.remove("marquee");
    nowPlayingBar.classList.add("visible", "now-playing-error");
  });

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

  const logos = ["assets/images/mainLogo.png", "assets/images/Gprofile.gif", "assets/images/portal.gif"];

  const headerLogo = $(".header-logo");
  let logoIndex = 0;
  setInterval(() => {
    logoIndex = (logoIndex + 1) % logos.length;
    headerLogo.fadeOut(2000, function () {
      headerLogo.attr("src", logos[logoIndex]);
      headerLogo.fadeIn(2000);
    });
  }, 14500);
});
