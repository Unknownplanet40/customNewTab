import { showAlert, showConfirmation } from "./assets/js/SweetAlert.js";
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

document.addEventListener("DOMContentLoaded", () => {
  const settings = [
    { id: "toggleDarkMode", key: "darkMode", type: "checkbox", default: true },
    { id: "selectSearchEngine", key: "searchEngine", type: "select", default: "google" },
    { id: "toggleDateTime", key: "showDateTime", type: "checkbox", default: true },
    { id: "toggleShowSeconds", key: "showSeconds", type: "checkbox", default: true },
    { id: "toggleAnalogClock", key: "showAnalogClock", type: "checkbox", default: true },
    { id: "toggleGreeting", key: "showGreeting", type: "checkbox", default: true },
    { id: "inputDisplayName", key: "displayName", type: "input", default: "Capsss" },
    { id: "toggleBirthday", key: "enableBirthday", type: "checkbox", default: true },
    { id: "inputBirthdate", key: "birthdate", type: "input", default: "2006-01-31" },
    { id: "toggleOnlineApi", key: "onlineApi", type: "checkbox", default: false },
    { id: "inputApiKey", key: "apiNinjaKey", type: "input", default: "" },
    { id: "selectContentType", key: "contentType", type: "select", default: "quotes" },
    { id: "toggleTilt", key: "tilt", type: "checkbox", default: true },
    { id: "toggleAnimations", key: "pageAnimations", type: "checkbox", default: true },
    { id: "toggleAdaptiveTextColor", key: "adaptiveTextColor", type: "checkbox", default: true },
    { id: "selectBgStyle", key: "bgStyle", type: "select", default: "circles" },
    { id: "selectCircleTheme", key: "circleTheme", type: "select", default: "cv" },
    { id: "selectCircleSpeed", key: "circleSpeed", type: "select", default: "normal" },
    { id: "inputBgGradient", key: "bgGradient", type: "input", default: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)" },
    { id: "selectSlideshowInterval", key: "slideshowInterval", type: "select", default: "5" },
    { id: "selectDynamicWallpaper", key: "dynamicWallpaperFolder", type: "select", default: "RJC_Wallpaper" },
    { id: "toggleWeather", key: "weatherEnabled", type: "checkbox", default: false },
    { id: "selectWeatherUnit", key: "weatherUnit", type: "select", default: "celsius" },
    { id: "inputWeatherLat", key: "manualWeatherLat", type: "input", default: "" },
    { id: "inputWeatherLon", key: "manualWeatherLon", type: "input", default: "" },
    { id: "toggleBattery", key: "batteryEnabled", type: "checkbox", default: false },
    { id: "toggleCountdown", key: "countdownEnabled", type: "checkbox", default: false },
    { id: "inputCountdownName", key: "countdownName", type: "input", default: "New Year" },
    { id: "inputCountdownDate", key: "countdownDate", type: "input", default: "" },
    { id: "toggleMusicEnabled", key: "musicEnabled", type: "checkbox", default: false },
    { id: "toggleShowLyrics", key: "showLyrics", type: "checkbox", default: true },
    { id: "inputMusicDelay", key: "musicDelay", type: "input", default: "15" },
    { id: "toggleScreensaver", key: "screensaverEnabled", type: "checkbox", default: false },
    { id: "selectScreensaverType", key: "screensaverType", type: "select", default: "random" },
    { id: "selectScreensaverIdle", key: "screensaverIdle", type: "select", default: "5" },
  ];

  const selectBgStyleEl = document.getElementById("selectBgStyle");
  const circleSubSettings = document.getElementById("circleSubSettings");
  const selectCircleThemeEl = document.getElementById("selectCircleTheme");
  const selectCircleSpeedEl = document.getElementById("selectCircleSpeed");
  const gradientSubSettings = document.getElementById("gradientSubSettings");
  const imageSubSettings = document.getElementById("imageSubSettings");
  const slideshowSubSettings = document.getElementById("slideshowSubSettings");
  const dynamicWallpaperSubSettings = document.getElementById("dynamicWallpaperSubSettings");
  const inputBgImageEl = document.getElementById("inputBgImage");
  const clearBgImageBtn = document.getElementById("clearBgImageBtn");

  const toggleWeatherEl = document.getElementById("toggleWeather");
  const weatherSubSettings = document.getElementById("weatherSubSettings");
  const toggleCountdownEl = document.getElementById("toggleCountdown");
  const countdownSubSettings = document.getElementById("countdownSubSettings");

  const toggleOnlineApiEl = document.getElementById("toggleOnlineApi");
  const apiKeyContainer = document.getElementById("apiKeyContainer");
  const inputApiKeyEl = document.getElementById("inputApiKey");
  const selectContentTypeEl = document.getElementById("selectContentType");

  const toggleGreetingEl = document.getElementById("toggleGreeting");
  const greetingSubSettings = document.getElementById("greetingSubSettings");
  const inputDisplayNameEl = document.getElementById("inputDisplayName");
  const toggleBirthdayEl = document.getElementById("toggleBirthday");
  const birthdayInputContainer = document.getElementById("birthdayInputContainer");
  const inputBirthdateEl = document.getElementById("inputBirthdate");

  const toggleDateTimeEl = document.getElementById("toggleDateTime");
  const clockSubSettings = document.getElementById("clockSubSettings");
  const toggleShowSecondsEl = document.getElementById("toggleShowSeconds");

  const toggleMusicEl = document.getElementById("toggleMusicEnabled");
  const toggleShowLyricsEl = document.getElementById("toggleShowLyrics");
  const musicSubSettings = document.getElementById("musicSubSettings");
  const rangeMusicVolumeEl = document.getElementById("rangeMusicVolume");
  const musicVolumeLabelEl = document.getElementById("musicVolumeLabel");
  const inputMusicDelayEl = document.getElementById("inputMusicDelay");

  const toggleScreensaverEl = document.getElementById("toggleScreensaver");
  const screensaverSubSettings = document.getElementById("screensaverSubSettings");

  // --- Visibility helpers ---
  function toggleFlexClass(el, isVisible) {
    if (!el) return;
    if (isVisible) {
      el.classList.remove("d-none");
      el.classList.add("d-flex");
    } else {
      el.classList.remove("d-flex");
      el.classList.add("d-none");
    }
  }

  function updateBackgroundSettingsVisibility() {
    if (selectBgStyleEl) {
      const style = selectBgStyleEl.value;
      toggleFlexClass(circleSubSettings, style === "circles");
      toggleFlexClass(gradientSubSettings, style === "gradient");
      toggleFlexClass(imageSubSettings, style === "image");
      toggleFlexClass(slideshowSubSettings, style === "slideshow");
      toggleFlexClass(dynamicWallpaperSubSettings, style === "dynamic");
    }
  }

  function updateWeatherSettingsVisibility() {
    if (toggleWeatherEl && weatherSubSettings) {
      toggleFlexClass(weatherSubSettings, toggleWeatherEl.checked);
    }
  }

  function updateCountdownSettingsVisibility() {
    if (toggleCountdownEl && countdownSubSettings) {
      toggleFlexClass(countdownSubSettings, toggleCountdownEl.checked);
    }
  }

  function updateScreensaverSettingsVisibility() {
    if (toggleScreensaverEl && screensaverSubSettings) {
      toggleFlexClass(screensaverSubSettings, toggleScreensaverEl.checked);
    }
  }

  function updateApiSettingsState() {
    if (toggleOnlineApiEl) {
      const isOnline = toggleOnlineApiEl.checked;
      toggleFlexClass(apiKeyContainer, isOnline);
      if (inputApiKeyEl) inputApiKeyEl.disabled = !isOnline;
      if (selectContentTypeEl) {
        selectContentTypeEl.disabled = !isOnline;
        selectContentTypeEl.style.opacity = isOnline ? "1" : "0.5";
      }
    }
  }

  function updateGreetingSettingsState() {
    if (toggleGreetingEl) {
      const isGreetingEnabled = toggleGreetingEl.checked;
      toggleFlexClass(greetingSubSettings, isGreetingEnabled);
      if (inputDisplayNameEl) inputDisplayNameEl.disabled = !isGreetingEnabled;
      if (toggleBirthdayEl) toggleBirthdayEl.disabled = !isGreetingEnabled;
      updateBirthdayInputState();
    }
  }

  function updateBirthdayInputState() {
    if (toggleBirthdayEl && toggleGreetingEl) {
      const isBirthdayEnabled = toggleBirthdayEl.checked && toggleGreetingEl.checked;
      toggleFlexClass(birthdayInputContainer, isBirthdayEnabled);
      if (inputBirthdateEl) inputBirthdateEl.disabled = !isBirthdayEnabled;
    }
  }

  // File reader for custom background image
  if (inputBgImageEl) {
    inputBgImageEl.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 4 * 1024 * 1024) {
        document.getElementById("bgImageError").classList.remove("d-none");
        document.getElementById("bgImageError").classList.remove("text-primary");
        document.getElementById("bgImageError").classList.add("text-danger");
        document.getElementById("bgImageError").textContent = "Image size exceeds 4MB. Please upload a smaller image.";
        setTimeout(() => {
          document.getElementById("bgImageError").classList.add("d-none");
          document.getElementById("bgImageError").classList.remove("text-danger");
          document.getElementById("bgImageError").classList.add("text-primary");
          document.getElementById("bgImageError").textContent = "Wallpaper uploaded successfully!";
        }, 2000);
        inputBgImageEl.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = function (event) {
        const dataUrl = event.target.result;
        chrome.storage.local.set({ customBgImage: dataUrl }, () => {
          document.getElementById("bgImageError").classList.remove("d-none");
          document.getElementById("bgImageError").classList.remove("text-danger");
          document.getElementById("bgImageError").classList.add("text-success");
          document.getElementById("bgImageError").textContent = "Wallpaper uploaded successfully!";
          setTimeout(() => {
            document.getElementById("bgImageError").classList.add("d-none");
            document.getElementById("bgImageError").classList.remove("text-success");
            document.getElementById("bgImageError").classList.add("text-danger");
            document.getElementById("bgImageError").textContent = "Image size exceeds 4MB. Please upload a smaller image.";
          }, 2000);
        });
      };
      reader.readAsDataURL(file);
    });
  }

  if (clearBgImageBtn) {
    clearBgImageBtn.addEventListener("click", () => {
      chrome.storage.local.remove("customBgImage", () => {
        if (inputBgImageEl) inputBgImageEl.value = "";
        document.getElementById("bgImageError").classList.remove("d-none");
        document.getElementById("bgImageError").classList.remove("text-danger");
        document.getElementById("bgImageError").classList.add("text-primary");
        document.getElementById("bgImageError").textContent = "Wallpaper removed successfully!";
        setTimeout(() => {
          document.getElementById("bgImageError").classList.add("d-none");
          document.getElementById("bgImageError").classList.remove("text-primary");
          document.getElementById("bgImageError").classList.add("text-danger");
          document.getElementById("bgImageError").textContent = "Image size exceeds 4MB. Please upload a smaller image.";
        }, 2000);
      });
    });
  }

  function updateClockSettingsState() {
    if (toggleDateTimeEl && clockSubSettings) {
      const isClockEnabled = toggleDateTimeEl.checked;
      toggleFlexClass(clockSubSettings, isClockEnabled);
      if (toggleShowSecondsEl) toggleShowSecondsEl.disabled = !isClockEnabled;
    }
  }

  function updateMusicSettingsState() {
    if (toggleMusicEl && musicSubSettings) {
      const isMusicEnabled = toggleMusicEl.checked;
      toggleFlexClass(musicSubSettings, isMusicEnabled);
      if (rangeMusicVolumeEl) rangeMusicVolumeEl.disabled = !isMusicEnabled;
      if (inputMusicDelayEl) inputMusicDelayEl.disabled = !isMusicEnabled;
      if (toggleShowLyricsEl) toggleShowLyricsEl.disabled = !isMusicEnabled;
    }
  }

  // Volume slider label update
  if (rangeMusicVolumeEl && musicVolumeLabelEl) {
    rangeMusicVolumeEl.addEventListener("input", () => {
      musicVolumeLabelEl.textContent = `${rangeMusicVolumeEl.value}%`;
      chrome.storage.local.set({ musicVolume: parseInt(rangeMusicVolumeEl.value) / 100 });
    });
  }

  const defaultShortcuts = [
    { name: "YouTube", url: "https://youtube.com", openInNewTab: false, iconType: "bootstrap", iconValue: "bi-youtube text-danger" },
      { name: "GitHub", url: "https://github.com", openInNewTab: false, iconType: "bootstrap", iconValue: "bi-github" },
      { name: "Facebook", url: "https://facebook.com", openInNewTab: false, iconType: "bootstrap", iconValue: "bi-facebook text-primary" },
      { name: "Instagram", url: "https://instagram.com", openInNewTab: false, iconType: "bootstrap", iconValue: "bi-instagram" },
  ];

  const defaultGmailSettings = {
    name: "Gmail",
    url: "https://mail.google.com",
    openInNewTab: false,
    enableDropdown: true,
  };

  const defaultGmailDropdownItems = [
    { name: "Primary Account", url: "https://mail.google.com/mail/u/0/#inbox", openInNewTab: false },
    { name: "Secondary Account", url: "https://mail.google.com/mail/u/1/#inbox", openInNewTab: false },
    { name: "Tertiary Account", url: "https://mail.google.com/mail/u/3/#inbox", openInNewTab: false },
    { name: "Quaternary Account", url: "https://mail.google.com/mail/u/4/#inbox", openInNewTab: false },
    { name: "Quinary Account", url: "https://mail.google.com/mail/u/2/#inbox", openInNewTab: false },
  ];

  const gmailNameEl = document.getElementById("gmailName");
  const gmailUrlEl = document.getElementById("gmailUrl");
  const gmailNewTabEl = document.getElementById("gmailNewTab");
  const gmailEnableDropdownEl = document.getElementById("gmailEnableDropdown");
  const gmailDropdownSubSettings = document.getElementById("gmailDropdownSubSettings");
  const gmailDropdownItemsList = document.getElementById("gmailDropdownItemsList");
  const addGmailDropdownItemBtn = document.getElementById("addGmailDropdownItemBtn");

  const shortcutsListEl = document.getElementById("shortcutsList");
  const addShortcutBtn = document.getElementById("addShortcutBtn");

  let localShortcuts = [];
  let localGmailSettings = {};
  let localGmailDropdownItems = [];

  function saveShortcuts() {
    chrome.storage.local.set({ shortcuts: localShortcuts });
  }

  function saveGmailSettings() {
    chrome.storage.local.set({ gmailSettings: localGmailSettings });
  }

  function saveGmailDropdownItems() {
    chrome.storage.local.set({ gmailDropdownItems: localGmailDropdownItems });
  }

  function renderShortcuts() {
    if (!shortcutsListEl) return;
    shortcutsListEl.innerHTML = "";
    localShortcuts.forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "p-2 rounded shortcut-editor-item";
      div.innerHTML = `
        <div class="d-flex align-items-center justify-content-between mb-1">
          <input type="text" class="shortcut-name-input setting-select w-50 py-0 px-2" placeholder="Name" value="${item.name || ""}" style="font-size: 0.75rem; height: 24px; text-align: left; cursor: text" data-index="${index}" />
          <div class="d-flex align-items-center gap-2">
            <label class="toggle-switch-sm" title="Open in New Tab">
              <input type="checkbox" class="shortcut-newtab-input" ${item.openInNewTab ? "checked" : ""} data-index="${index}" />
              <span class="toggle-slider"></span>
            </label>
            <button type="button" class="btn btn-sm btn-link text-danger p-0 border-0 delete-shortcut-btn d-none" style="font-size: 0.85rem" data-index="${index}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
        <input type="text" class="shortcut-url-input setting-select w-100 py-0 px-2" placeholder="URL" value="${item.url || ""}" style="font-size: 0.75rem; height: 24px; text-align: left; cursor: text" data-index="${index}" />
      `;
      shortcutsListEl.appendChild(div);
    });
  }

  function renderGmailDropdownItems() {
    if (!gmailDropdownItemsList) return;
    gmailDropdownItemsList.innerHTML = "";
    localGmailDropdownItems.forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "p-2 rounded shortcut-editor-item";
      div.innerHTML = `
        <div class="d-flex align-items-center justify-content-between mb-1">
          <input type="text" class="gmail-item-name-input setting-select w-50 py-0 px-2" placeholder="Account Name" value="${item.name || ""}" style="font-size: 0.75rem; height: 24px; text-align: left; cursor: text" data-index="${index}" />
          <div class="d-flex align-items-center gap-2">
            <label class="toggle-switch-sm" title="Open in New Tab">
              <input type="checkbox" class="gmail-item-newtab-input" ${item.openInNewTab ? "checked" : ""} data-index="${index}" />
              <span class="toggle-slider"></span>
            </label>
            <i class="bi bi-eye text-white-50" style="font-size: 0.8rem" title="Show/Hide in dropdown"></i>
            <label class="toggle-switch-sm" title="Show / Hide">
              <input type="checkbox" class="gmail-item-visible-input" ${item.visible !== false ? "checked" : ""} data-index="${index}" />
              <span class="toggle-slider"></span>
            </label>
            <button type="button" class="btn btn-sm btn-link text-danger p-0 border-0 delete-gmail-item-btn" style="font-size: 0.85rem" data-index="${index}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
        <input type="text" class="gmail-item-url-input setting-select w-100 py-0 px-2" placeholder="URL" value="${item.url || ""}" style="font-size: 0.75rem; height: 24px; text-align: left; cursor: text" data-index="${index}" />
      `;
      gmailDropdownItemsList.appendChild(div);
    });
  }

  function updateGmailDropdownSubSettingsVisibility() {
    if (gmailDropdownSubSettings && gmailEnableDropdownEl) {
      gmailDropdownSubSettings.style.display = gmailEnableDropdownEl.checked ? "flex" : "none";
    }
  }

  const keysToGet = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.default;
    return acc;
  }, {});
  keysToGet.musicVolume = 0.4;
  keysToGet.shortcuts = defaultShortcuts;
  keysToGet.gmailSettings = defaultGmailSettings;
  keysToGet.gmailDropdownItems = defaultGmailDropdownItems;

  chrome.storage.local.get(keysToGet, (result) => {
    settings.forEach((setting) => {
      const el = document.getElementById(setting.id);
      if (el) {
        if (setting.type === "checkbox") {
          el.checked = result[setting.key];
        } else {
          el.value = result[setting.key];
        }
      }
    });

    if (rangeMusicVolumeEl) {
      const vol = Math.round((result.musicVolume || 0.4) * 100);
      rangeMusicVolumeEl.value = vol;
      if (musicVolumeLabelEl) musicVolumeLabelEl.textContent = `${vol}%`;
    }

    localShortcuts = result.shortcuts;
    localGmailSettings = result.gmailSettings;
    localGmailDropdownItems = result.gmailDropdownItems;

    if (gmailNameEl) gmailNameEl.value = localGmailSettings.name || "Gmail";
    if (gmailUrlEl) gmailUrlEl.value = localGmailSettings.url || "";
    if (gmailNewTabEl) gmailNewTabEl.checked = localGmailSettings.openInNewTab || false;
    if (gmailEnableDropdownEl) gmailEnableDropdownEl.checked = localGmailSettings.enableDropdown !== false;

    renderShortcuts();
    renderGmailDropdownItems();
    updateGmailDropdownSubSettingsVisibility();

    updateBackgroundSettingsVisibility();
    updateWeatherSettingsVisibility();
    updateCountdownSettingsVisibility();
    updateScreensaverSettingsVisibility();
    updateApiSettingsState();
    updateGreetingSettingsState();
    updateClockSettingsState();
    updateMusicSettingsState();
  });

  // --- Save settings on change/input ---
  settings.forEach((setting) => {
    const el = document.getElementById(setting.id);
    if (el) {
      const eventType = setting.type === "checkbox" || setting.type === "select" ? "change" : "input";
      el.addEventListener(eventType, () => {
        const val = setting.type === "checkbox" ? el.checked : el.value;
        chrome.storage.local.set({ [setting.key]: val });

        if (setting.id === "selectBgStyle") updateBackgroundSettingsVisibility();
        else if (setting.id === "toggleWeather") updateWeatherSettingsVisibility();
        else if (setting.id === "toggleCountdown") updateCountdownSettingsVisibility();
        else if (setting.id === "toggleScreensaver") updateScreensaverSettingsVisibility();
        else if (setting.id === "toggleOnlineApi") updateApiSettingsState();
        else if (setting.id === "toggleGreeting") updateGreetingSettingsState();
        else if (setting.id === "toggleBirthday") updateBirthdayInputState();
        else if (setting.id === "toggleDateTime") updateClockSettingsState();
        else if (setting.id === "toggleMusicEnabled") updateMusicSettingsState();
      });
    }
  });

  if (shortcutsListEl) {
    shortcutsListEl.addEventListener("input", (e) => {
      const index = parseInt(e.target.dataset.index);
      if (isNaN(index)) return;
      if (e.target.classList.contains("shortcut-name-input")) {
        localShortcuts[index].name = e.target.value;
      } else if (e.target.classList.contains("shortcut-url-input")) {
        localShortcuts[index].url = e.target.value;
      }
      saveShortcuts();
    });

    shortcutsListEl.addEventListener("change", (e) => {
      const index = parseInt(e.target.dataset.index);
      if (isNaN(index)) return;
      if (e.target.classList.contains("shortcut-newtab-input")) {
        localShortcuts[index].openInNewTab = e.target.checked;
        saveShortcuts();
      }
    });

    shortcutsListEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".delete-shortcut-btn");
      if (!btn) return;
      const index = parseInt(btn.dataset.index);
      if (isNaN(index)) return;
      localShortcuts.splice(index, 1);
      saveShortcuts();
      renderShortcuts();
    });
  }

  if (addShortcutBtn) {
    addShortcutBtn.addEventListener("click", () => {
      localShortcuts.push({ name: "", url: "", openInNewTab: false });
      saveShortcuts();
      renderShortcuts();
    });
  }

  const gmailInputs = [gmailNameEl, gmailUrlEl, gmailNewTabEl, gmailEnableDropdownEl];
  gmailInputs.forEach((el) => {
    if (el) {
      const eventType = el.type === "checkbox" ? "change" : "input";
      el.addEventListener(eventType, () => {
        localGmailSettings.name = gmailNameEl ? gmailNameEl.value : "Gmail";
        localGmailSettings.url = gmailUrlEl ? gmailUrlEl.value : "";
        localGmailSettings.openInNewTab = gmailNewTabEl ? gmailNewTabEl.checked : false;
        localGmailSettings.enableDropdown = gmailEnableDropdownEl ? gmailEnableDropdownEl.checked : true;
        saveGmailSettings();
        if (el === gmailEnableDropdownEl) {
          updateGmailDropdownSubSettingsVisibility();
        }
      });
    }
  });

  if (gmailDropdownItemsList) {
    gmailDropdownItemsList.addEventListener("input", (e) => {
      const index = parseInt(e.target.dataset.index);
      if (isNaN(index)) return;
      if (e.target.classList.contains("gmail-item-name-input")) {
        localGmailDropdownItems[index].name = e.target.value;
      } else if (e.target.classList.contains("gmail-item-url-input")) {
        localGmailDropdownItems[index].url = e.target.value;
      }
      saveGmailDropdownItems();
    });

    gmailDropdownItemsList.addEventListener("change", (e) => {
      const index = parseInt(e.target.dataset.index);
      if (isNaN(index)) return;
      if (e.target.classList.contains("gmail-item-newtab-input")) {
        localGmailDropdownItems[index].openInNewTab = e.target.checked;
        saveGmailDropdownItems();
      } else if (e.target.classList.contains("gmail-item-visible-input")) {
        localGmailDropdownItems[index].visible = e.target.checked;
        saveGmailDropdownItems();
      }
    });

    gmailDropdownItemsList.addEventListener("click", (e) => {
      const btn = e.target.closest(".delete-gmail-item-btn");
      if (!btn) return;
      const index = parseInt(btn.dataset.index);
      if (isNaN(index)) return;
      localGmailDropdownItems.splice(index, 1);
      saveGmailDropdownItems();
      renderGmailDropdownItems();
    });
  }

  if (addGmailDropdownItemBtn) {
    addGmailDropdownItemBtn.addEventListener("click", () => {
      if (localGmailDropdownItems.length >= 5) {
        showAlert({
          title: "info",
          text: "You can only have a maximum of 5 Gmail dropdown items.",
          icon: "info",
          timer: 3000,
          position: "center",
          noButtons: true,
        });
        return;
      }
      showConfirmation({
        title: "Are you sure?",
        text: "Do you want to add a new Gmail dropdown item? (Maximum limit: 5 items)",
        icon: "question",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        timer: 0,
        position: "center",
      }).then((result) => {
        if (result.isConfirmed) {
          localGmailDropdownItems.push({ name: "", url: "", openInNewTab: false, visible: true });
          saveGmailDropdownItems();
          renderGmailDropdownItems();
        }
      });
    });
  }

  const musicDirPathInput = document.getElementById("musicDirPathInput");
  const copyMusicPathBtn = document.getElementById("copyMusicPathBtn");

  if (musicDirPathInput) {
    fetch("assets/music/tracks.json")
      .then((res) => res.json())
      .then((data) => {
        if (data.musicDirectory) {
          musicDirPathInput.value = data.musicDirectory;
        } else {
          musicDirPathInput.value = "Run manage_music.bat first";
        }
      })
      .catch(() => {
        musicDirPathInput.value = "Run manage_music.bat first";
      });

    musicDirPathInput.addEventListener("click", () => {
      musicDirPathInput.select();
    });
  }

  if (copyMusicPathBtn && musicDirPathInput) {
    copyMusicPathBtn.addEventListener("click", () => {
      const val = musicDirPathInput.value;
      if (val && val !== "Loading path..." && val !== "Run manage_music.bat first") {
        navigator.clipboard.writeText(val).then(() => {
          const originalIcon = copyMusicPathBtn.innerHTML;
          copyMusicPathBtn.innerHTML = '<i class="bi bi-check2"></i>';
          setTimeout(() => {
            copyMusicPathBtn.innerHTML = originalIcon;
          }, 2000);
        });
      }
    });
  }

  const selectDynamicWallpaperEl = document.getElementById("selectDynamicWallpaper");
  if (selectDynamicWallpaperEl) {
    fetch("assets/images/DynamicWallpapers/folders.json")
      .then((res) => res.json())
      .then((data) => {
        selectDynamicWallpaperEl.innerHTML = "";
        if (data.wallpapers && data.wallpapers.length > 0) {
          data.wallpapers.forEach((wp) => {
            const option = document.createElement("option");
            option.value = wp.folder;
            option.textContent = wp.config.displayName || wp.folder;
            selectDynamicWallpaperEl.appendChild(option);
          });
          // Restore selected value
          chrome.storage.local.get(["dynamicWallpaperFolder"], function(res) {
            if (res.dynamicWallpaperFolder) {
              selectDynamicWallpaperEl.value = res.dynamicWallpaperFolder;
            }
          });
        } else {
          const option = document.createElement("option");
          option.value = "";
          option.textContent = "No dynamic wallpapers found";
          selectDynamicWallpaperEl.appendChild(option);
        }
      })
      .catch(() => {
        selectDynamicWallpaperEl.innerHTML = "<option value=''>Error loading folders.json</option>";
      });
  }
});
