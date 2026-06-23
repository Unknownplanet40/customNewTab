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
    { id: "toggleCircles", key: "circles", type: "checkbox", default: true },
    { id: "selectCircleTheme", key: "circleTheme", type: "select", default: "cv" },
    { id: "selectCircleSpeed", key: "circleSpeed", type: "select", default: "normal" },
    { id: "toggleMusicEnabled", key: "musicEnabled", type: "checkbox", default: false },
    { id: "toggleShowLyrics", key: "showLyrics", type: "checkbox", default: true },
    { id: "inputMusicDelay", key: "musicDelay", type: "input", default: "15" },
  ];

  const toggleCirclesEl = document.getElementById("toggleCircles");
  const circleSubSettings = document.getElementById("circleSubSettings");
  const selectCircleThemeEl = document.getElementById("selectCircleTheme");
  const selectCircleSpeedEl = document.getElementById("selectCircleSpeed");

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

  // --- Visibility helpers ---
  function updateCircleSubSettingsVisibility() {
    if (toggleCirclesEl && circleSubSettings) {
      const isEnabled = toggleCirclesEl.checked;
      circleSubSettings.style.display = isEnabled ? "flex" : "none";
      if (selectCircleThemeEl) selectCircleThemeEl.disabled = !isEnabled;
      if (selectCircleSpeedEl) selectCircleSpeedEl.disabled = !isEnabled;
    }
  }

  function updateApiSettingsState() {
    if (toggleOnlineApiEl) {
      const isOnline = toggleOnlineApiEl.checked;
      if (apiKeyContainer) apiKeyContainer.style.display = isOnline ? "flex" : "none";
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
      if (greetingSubSettings) greetingSubSettings.style.display = isGreetingEnabled ? "flex" : "none";
      if (inputDisplayNameEl) inputDisplayNameEl.disabled = !isGreetingEnabled;
      if (toggleBirthdayEl) toggleBirthdayEl.disabled = !isGreetingEnabled;
      updateBirthdayInputState();
    }
  }

  function updateBirthdayInputState() {
    if (toggleBirthdayEl && toggleGreetingEl) {
      const isBirthdayEnabled = toggleBirthdayEl.checked && toggleGreetingEl.checked;
      if (birthdayInputContainer) birthdayInputContainer.style.display = isBirthdayEnabled ? "flex" : "none";
      if (inputBirthdateEl) inputBirthdateEl.disabled = !isBirthdayEnabled;
    }
  }

  function updateClockSettingsState() {
    if (toggleDateTimeEl && clockSubSettings) {
      const isClockEnabled = toggleDateTimeEl.checked;
      clockSubSettings.style.display = isClockEnabled ? "flex" : "none";
      if (toggleShowSecondsEl) toggleShowSecondsEl.disabled = !isClockEnabled;
    }
  }

  function updateMusicSettingsState() {
    if (toggleMusicEl && musicSubSettings) {
      const isMusicEnabled = toggleMusicEl.checked;
      musicSubSettings.style.display = isMusicEnabled ? "flex" : "none";
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

  // --- Shortcuts & Gmail Handling ---
  const defaultShortcuts = [
    { name: "GitHub", url: "https://github.com", openInNewTab: false, iconType: "bootstrap", iconValue: "bi-github" },
    { name: "YouTube", url: "https://youtube.com", openInNewTab: false, iconType: "bootstrap", iconValue: "bi-youtube text-danger" },
    { name: "YTS", url: "https://yts.gg/home", openInNewTab: false, iconType: "image", iconValue: "assets/images/shortcuts/yts_x32.png" },
    { name: "TBP CL", url: "https://tbcpl.lol/", openInNewTab: false, iconType: "image", iconValue: "assets/images/shortcuts/tbcp.png" },
  ];

  const defaultGmailSettings = {
    name: "Gmail",
    url: "https://mail.google.com",
    openInNewTab: false,
    enableDropdown: true,
  };

  const defaultGmailDropdownItems = [
    { name: "Personal Account", url: "https://mail.google.com/mail/u/0/#inbox", openInNewTab: false },
    { name: "Secondary Account", url: "https://mail.google.com/mail/u/1/#inbox", openInNewTab: false },
    { name: "Cvsu Account", url: "https://mail.google.com/mail/u/3/#inbox", openInNewTab: false },
    { name: "Dump Account", url: "https://mail.google.com/mail/u/4/#inbox", openInNewTab: false },
    { name: "Gmail Account 3", url: "https://mail.google.com/mail/u/2/#inbox", openInNewTab: false },
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

    updateCircleSubSettingsVisibility();
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

        if (setting.id === "toggleCircles") updateCircleSubSettingsVisibility();
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
});
