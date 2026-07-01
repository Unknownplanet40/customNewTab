export function initSearchController() {
  const $clock = $("#clock");
  const $greeting = $("#greeting");
  const $date = $("#date");
  const $analogClock = $("#analogClock");
  const $hourHand = $(".hour-hand");
  const $minuteHand = $(".minute-hand");
  const $secondHand = $(".second-hand");
  const $searchForm = $("#searchForm");
  const $searchInput = $("#searchInput");
  const $suggestionsBox = $("#suggestionsBox");
  const $clearBtn = $("#clearBtn");
  const $engineSelector = $("#engineSelector");
  const $currentEngineIcon = $("#current-engine-icon");

  let selectedSuggestionIndex = -1;
  let typedQuery = "";
  let debounceTimeout = null;

  const engineIcons = {
    google: "bi-google",
    bing: "bi-microsoft",
    duckduckgo: "bi-shield-shaded",
    youtube: "bi-youtube",
    chatgpt: "bi-chat-dots",
    grok: "bi-chat-dots",
    claude: "bi-chat-dots",
  };

  let showGreeting = true;
  let showDateTime = true;
  let showSeconds = true;
  let showAnalogClock = true;
  let enableBirthday = true;
  let displayName = "Capsss";
  let birthdate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  let randomBirthdayGreeting = "";

  function pickRandomBirthdayGreeting(name) {
    const birthdayMessages = [
      `Happy Birthday, ${name}! Hope you have an awesome day!`,
      `Wishing you a wonderful birthday, ${name}!`,
      `Cheers to another trip around the sun, ${name}!`,
      `Have a fantastic birthday, ${name}!`,
      `May your day be filled with joy and celebration, ${name}!`,
      `Happy Birthday, ${name}! Here's to making great memories today!`,
      `Warmest wishes on your special day, ${name}!`,
      `Hope your birthday is as special as you are, ${name}!`,
      `Another year older, another year wiser! Happy Birthday, ${name}!`,
      `Hope your birthday is filled with fun and laughter, ${name}!`,
      `Wishing you a day as amazing as you are, ${name}!`,
      `Here's to a year of success and happiness, ${name}!`,
      `May your birthday be filled with love and joy, ${name}!`,
    ];
    const randomIndex = Math.floor(Math.random() * birthdayMessages.length);
    randomBirthdayGreeting = birthdayMessages[randomIndex];
  }

  function updateClock() {
    const now = new Date();

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursStr = String(hours).padStart(1, "0");

    if (showSeconds) {
      $clock.text(`${hoursStr}:${minutes}:${seconds} ${ampm}`);
    } else {
      $clock.text(`${hoursStr}:${minutes} ${ampm}`);
    }

    // Update Analog Clock Hands
    if (showAnalogClock) {
      const hr = now.getHours();
      const min = now.getMinutes();
      const sec = now.getSeconds();

      const hrRotation = hr * 30 + min * 0.5;
      const minRotation = min * 6 + sec * 0.1;
      const secRotation = sec * 6;

      $hourHand.css("transform", `rotate(${hrRotation}deg)`);
      $minuteHand.css("transform", `rotate(${minRotation}deg)`);
      $secondHand.css("transform", `rotate(${secRotation}deg)`);
      $secondHand.toggle(showSeconds);
    }

    const currentHour = now.getHours();

    const options = { weekday: "long", month: "long", day: "numeric" };
    const dateStr = now.toLocaleDateString("en-US", options);
    if ($date.text() !== dateStr) {
      $date.text(dateStr);
    }
  }

  let currentGreetingText = "";

  function updateGreeting() {
    const now = new Date();
    const currentHour = now.getHours();
    let isBirthday = false;
    if (birthdate) {
      if (typeof birthdate === "string") {
        const parts = birthdate.split("-");
        if (parts.length === 3) {
          const bMonth = parseInt(parts[1], 10) - 1;
          const bDay = parseInt(parts[2], 10);
          isBirthday = now.getMonth() === bMonth && now.getDate() === bDay;
        }
      } else if (birthdate instanceof Date) {
        isBirthday = now.getMonth() === birthdate.getMonth() && now.getDate() === birthdate.getDate();
      }
    }

    const name = displayName || "Capsss";

    const morningGreetings = [
      `Good morning, ${name}!`,
      `Rise and shine, ${name}!`,
      `Good morning, sunshine!`,
      `Top of the morning to you, ${name}!`,
      `Hello, beautiful morning!`,
      `Morning, ${name}! Ready to crush the day?`,
      `Wishing you a wonderful morning, ${name}!`,
      `Hey ${name}, good morning!`,
      `Good morning, sleepyhead!`,
      `A fresh new day awaits you, ${name}!`,
    ];

    const afternoonGreetings = [
      `Good afternoon, ${name}!`,
      `Hey ${name}, how's your afternoon going?`,
      `Good afternoon, ${name}! Hope you're having a great day.`,
      `Happy afternoon, ${name}!`,
      `Good afternoon! Keep shining, ${name}!`,
      `Afternoon vibes, ${name}!`,
      `Wishing you a productive afternoon, ${name}!`,
      `Hello ${name}, beautiful afternoon!`,
      `Surviving the afternoon, ${name}? You've got this!`,
      `Good afternoon, rockstar!`,
    ];

    const eveningGreetings = [
      `Good evening, ${name}!`,
      `Good evening, ${name}! Hope you had a wonderful day.`,
      `Evening, ${name}! Time to relax`,
      `Hello ${name}, lovely evening!`,
      `Good evening! Unwind and enjoy, ${name}.`,
      `Hey ${name}, good evening!`,
      `Wishing you a peaceful evening, ${name}!`,
      `Good evening, night owl!`,
      `Evening, ${name}! How was your day?`,
      `Beautiful evening to you, ${name}!`,
    ];

    function getRandomGreeting(greetingsArray) {
      return greetingsArray[Math.floor(Math.random() * greetingsArray.length)];
    }

    let greetingText = getRandomGreeting(eveningGreetings);

    if (enableBirthday && isBirthday) {
      greetingText = randomBirthdayGreeting || `Happy Birthday, ${name}!`;
    } else {
      if (currentHour >= 5 && currentHour < 12) {
        greetingText = getRandomGreeting(morningGreetings);
      } else if (currentHour >= 12 && currentHour < 18) {
        greetingText = getRandomGreeting(afternoonGreetings);
      }
    }

    currentGreetingText = greetingText || `Hello, ${name}!`;
    $greeting.text(currentGreetingText);
  }

  function loadGreetingClockSettings() {
    chrome.storage.local.get(
      {
        showGreeting: true,
        showDateTime: true,
        showSeconds: true,
        showAnalogClock: true,
        enableBirthday: true,
        displayName: "Capsss",
        birthdate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      },
      function (items) {
        showGreeting = items.showGreeting;
        showDateTime = items.showDateTime;
        showSeconds = items.showSeconds;
        showAnalogClock = items.showAnalogClock;
        enableBirthday = items.enableBirthday;
        displayName = items.displayName || "Capsss";

        if (items.birthdate instanceof Date) {
          const year = items.birthdate.getFullYear();
          const month = String(items.birthdate.getMonth() + 1).padStart(2, "0");
          const day = String(items.birthdate.getDate()).padStart(2, "0");
          birthdate = `${year}-${month}-${day}`;
        } else {
          birthdate = items.birthdate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        }

        pickRandomBirthdayGreeting(displayName || "Capsss");

        $greeting.toggleClass("d-md-none", !showGreeting);
        $(".clock-container").toggle(showDateTime);
        $analogClock.toggle(showAnalogClock);
        if (showDateTime) {
          $analogClock.addClass("below-time").removeClass("no-digital");
        } else {
          $analogClock.removeClass("below-time").addClass("no-digital");
        }

        updateGreeting();
        updateClock();
      },
    );
  }

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local") {
      if (
        changes.showGreeting !== undefined ||
        changes.showDateTime !== undefined ||
        changes.showSeconds !== undefined ||
        changes.showAnalogClock !== undefined ||
        changes.enableBirthday !== undefined ||
        changes.displayName !== undefined ||
        changes.birthdate !== undefined
      ) {
        loadGreetingClockSettings();
      }
    }
  });

  loadGreetingClockSettings();
  setInterval(updateClock, 1000);

  $searchInput.val("");
  hideSuggestions();
  $clearBtn.addClass("d-none");

  $(".engine-option").on("click", function (e) {
    e.preventDefault();
    const $this = $(this);

    $(".engine-option").removeClass("active");
    $this.addClass("active");

    const engine = $this.data("engine");
    const action = $this.data("action");
    const placeholder = $this.data("placeholder");

    $searchForm.attr("action", action);
    $searchInput.attr("placeholder", placeholder);

    $currentEngineIcon.removeClass().addClass(`bi ${engineIcons[engine] || "bi-search"}`);

    chrome.storage.local.set({ searchEngine: engine });

    $searchInput.focus();

    triggerSuggestions();
  });

  chrome.storage.local.get({ searchEngine: "google" }, function (items) {
    const initialEngine = items.searchEngine || "google";
    const $targetOption = $(`.engine-option[data-engine="${initialEngine}"]`);
    if ($targetOption.length) {
      $(".engine-option").removeClass("active");
      $targetOption.addClass("active");

      const engine = $targetOption.data("engine");
      const action = $targetOption.data("action");
      const placeholder = $targetOption.data("placeholder");

      $searchForm.attr("action", action);
      $searchInput.attr("placeholder", placeholder);
      $currentEngineIcon.removeClass().addClass(`bi ${engineIcons[engine] || "bi-search"}`);
    }
  });

  // --- Autocomplete Suggestions ---
  /* function fetchSuggestions(query) {
    if (!query) {
      hideSuggestions();
      return;
    }

    $.ajax({
      url: "https://suggestqueries.google.com/complete/search",
      jsonp: "callback",
      dataType: "jsonp",
      data: {
        q: query,
        client: "youtube",
        hl: "en"
      },
      success: function (data) {
        if (Array.isArray(data) && Array.isArray(data[1])) {
          const suggestions = data[1].slice(0, 6); // Cap at 6 results
          renderSuggestions(suggestions);
        } else {
          hideSuggestions();
        }
      },
      error: function () {
        hideSuggestions();
      }
    });
  } */

  function fetchSuggestions(query) {
    if (!query || query.trim().length === 0) {
      hideSuggestions();
      return;
    }

    if (!navigator.onLine) {
      const $errorEl = $("<div>").addClass("suggestion-item-error text-body").text("No internet connection. Suggestions are unavailable.");
      $suggestionsBox.empty().append($errorEl).removeClass("d-none");
      setTimeout(() => {
        $errorEl.fadeOut(500, function () {
          hideSuggestions();
        });
      }, 3000);
      return;
    }

    const encodedQuery = encodeURIComponent(query);
    const url = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodedQuery}&hl=en`;

    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error("Network error");
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data) && Array.isArray(data[1])) {
          const suggestions = data[1].slice(0, 6);
          renderSuggestions(suggestions);
        } else {
          hideSuggestions();
        }
      })
      .catch((err) => {
        const $errorEl = $("<div>")
          .addClass("suggestion-item-error text-danger fw-bold")
          .text("Failed to load suggestions - " + err.message);
        $suggestionsBox.empty().append($errorEl).removeClass("d-none");
        setTimeout(() => {
          $errorEl.fadeOut(500, function () {
            hideSuggestions();
          });
        }, 3000);
      });
  }

  function renderSuggestions(suggestions) {
    if (suggestions.length === 0 || $searchInput.val().trim() === "") {
      hideSuggestions();
      return;
    }

    selectedSuggestionIndex = -1;
    $suggestionsBox.empty();

    suggestions.forEach((item) => {
      const suggestionText = Array.isArray(item) ? item[0] : item;

      const $el = $("<div>")
        .addClass("suggestion-item")
        .html(`<i class="bi bi-search suggestion-icon"></i> <span>${escapeHtml(suggestionText)}</span>`)
        .attr("data-value", suggestionText)
        .on("click", function () {
          $searchInput.val(suggestionText);
          hideSuggestions();
          $searchForm.submit();
        });

      $suggestionsBox.append($el);
    });

    $suggestionsBox.removeClass("d-none");
    $(".search-wrapper").addClass("search-active");
  }

  function hideSuggestions() {
    $suggestionsBox.addClass("d-none").empty();
    selectedSuggestionIndex = -1;
    $(".search-wrapper").removeClass("search-active");
  }

  function triggerSuggestions() {
    const val = $searchInput.val().trim();
    typedQuery = val;

    $clearBtn.toggleClass("d-none", val.length === 0);

    clearTimeout(debounceTimeout);
    if (val.length > 0) {
      debounceTimeout = setTimeout(() => {
        fetchSuggestions(val);
      }, 150);
    } else {
      hideSuggestions();
    }
  }

  function escapeHtml(string) {
    return String(string).replace(/[&<>"']/g, function (s) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[s];
    });
  }

  $searchInput.on("input", triggerSuggestions);

  $clearBtn.on("click", function () {
    $searchInput.val("").focus();
    hideSuggestions();
    $clearBtn.addClass("d-none");
  });

  $searchInput.on("keydown", function (e) {
    const $items = $suggestionsBox.find(".suggestion-item");
    const itemsCount = $items.length;

    if ($suggestionsBox.hasClass("d-none") || itemsCount === 0) {
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedSuggestionIndex = (selectedSuggestionIndex + 1) % itemsCount;
      updateSuggestionHighlight($items);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedSuggestionIndex = (selectedSuggestionIndex - 1 + itemsCount) % itemsCount;
      updateSuggestionHighlight($items);
    } else if (e.key === "Escape") {
      e.preventDefault();
      hideSuggestions();
      $searchInput.val(typedQuery);
    }
  });

  function updateSuggestionHighlight($items) {
    $items.removeClass("active");
    if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < $items.length) {
      const $activeItem = $items.eq(selectedSuggestionIndex);
      $activeItem.addClass("active");
      $searchInput.val($activeItem.attr("data-value"));
    } else {
      $searchInput.val(typedQuery);
    }
  }

  $(document).on("click", function (e) {
    if (!$(e.target).closest(".search-wrapper").length) {
      setTimeout(() => {
        hideSuggestions();
      }, 100);
    }
  });

  $searchForm.on("submit", function (e) {
    const query = $searchInput.val().trim();
    if (!query) {
      e.preventDefault();
      return;
    }
    const action = $searchForm.attr("action");
    if (action.includes("duckduckgo.com")) {
      // DuckDuckGo expects action "https://duckduckgo.com/" and q="query"
      // it works automatically with method="get" and q in name
    }
  });
}
