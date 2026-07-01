//import { consoleStyledMessage } from "./helpers.js";
let logoInterval = null;

function getAnime() {
  if (typeof anime !== "undefined") return anime;
  if (typeof window !== "undefined" && window.anime) return window.anime;
  return null;
}

function safeAnimate(...args) {
  const animeRef = getAnime();
  if (!animeRef || typeof animeRef.animate !== "function") {
    // consoleStyledMessage("danger", "Anime.js v4 animate is not available.");
    console.log("Anime.js v4 animate is not available. Animations will not run.");
    return null;
  }
  return animeRef.animate(...args);
}

function safeStagger(...args) {
  const animeRef = getAnime();
  if (!animeRef || typeof animeRef.stagger !== "function") {
    // consoleStyledMessage("danger", "Anime.js v4 stagger is not available.");
    console.log("Anime.js v4 stagger is not available. Animations will not run.");
    return () => 0;
  }
  return animeRef.stagger(...args);
}

function ensureVisible(targets) {
  if (typeof $ !== "undefined" && targets instanceof $) {
    targets.css("visibility", "visible");
  } else if (typeof targets === "string") {
    document.querySelectorAll(targets).forEach((el) => (el.style.visibility = "visible"));
  } else if (targets instanceof HTMLElement) {
    targets.style.visibility = "visible";
  } else if (Array.isArray(targets) || (targets && typeof targets.forEach === "function")) {
    targets.forEach((el) => {
      if (el instanceof HTMLElement) el.style.visibility = "visible";
      else if (typeof el === "string") document.querySelectorAll(el).forEach((e) => (e.style.visibility = "visible"));
    });
  } else if (typeof $ !== "undefined") {
    $(targets).css("visibility", "visible");
  }
}

export function prepareForAnimation(targets) {
  if (typeof anime === "undefined") {
    //consoleStyledMessage("danger", "Anime.js is not loaded. Animations will not run.");
    console.log("Anime.js is not loaded. Animations will not run.");
    return null;
  }
  if (typeof $ !== "undefined" && targets instanceof $) {
    targets.css({ opacity: 0, visibility: "hidden" });
  } else if (typeof targets === "string") {
    document.querySelectorAll(targets).forEach((el) => {
      el.style.opacity = 0;
      el.style.visibility = "hidden";
    });
  } else if (targets instanceof HTMLElement) {
    targets.style.opacity = 0;
    targets.style.visibility = "hidden";
  } else if (Array.isArray(targets) || (targets && typeof targets.forEach === "function")) {
    targets.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.opacity = 0;
        el.style.visibility = "hidden";
      } else if (typeof el === "string") {
        document.querySelectorAll(el).forEach((e) => {
          e.style.opacity = 0;
          e.style.visibility = "hidden";
        });
      }
    });
  } else if (typeof $ !== "undefined") {
    $(targets).css({ opacity: 0, visibility: "hidden" });
  }
}

export function showWithoutAnimation(targets) {
  if (typeof $ !== "undefined" && targets instanceof $) {
    targets.css({ opacity: 1, visibility: "visible" });
  } else if (typeof targets === "string") {
    document.querySelectorAll(targets).forEach((el) => {
      el.style.opacity = 1;
      el.style.visibility = "visible";
    });
  } else if (targets instanceof HTMLElement) {
    targets.style.opacity = 1;
    targets.style.visibility = "visible";
  } else if (Array.isArray(targets) || (targets && typeof targets.forEach === "function")) {
    targets.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.opacity = 1;
        el.style.visibility = "visible";
      } else if (typeof el === "string") {
        document.querySelectorAll(el).forEach((e) => {
          e.style.opacity = 1;
          e.style.visibility = "visible";
        });
      }
    });
  } else if (typeof $ !== "undefined") {
    $(targets).css({ opacity: 1, visibility: "visible" });
  }
}

export function Animation(targets, options = {}) {
  if (typeof anime === "undefined") {
    // consoleStyledMessage("warning", "Anime.js is not loaded.");
    console.log("Anime.js is not loaded. Animations will not run.");
    return null;
  }

  const { direction = "up", duration = 1000, delay = 0, distance = 40, easing = "outQuart", begin = null, complete = null, onComplete = null } = options;

  const animationParams = {
    opacity: [0, 1],
    duration,
    delay,
    ease: easing,
    onBegin: (anim) => {
      ensureVisible(targets);
      if (begin) begin(anim);
    },
    onComplete: onComplete || complete,
  };

  switch (direction) {
    case "up":
      animationParams.translateY = [distance, 0];
      break;
    case "down":
      animationParams.translateY = [-distance, 0];
      break;
    case "left":
      animationParams.translateX = [distance, 0];
      break;
    case "right":
      animationParams.translateX = [-distance, 0];
      break;
    case "fade":
      break; // No translation, pure fade-in
    default:
      animationParams.translateY = [distance, 0];
  }

  return safeAnimate(targets, animationParams);
}

export function staggerAnimation(targets, options = {}) {
  if (typeof anime === "undefined") {
    //consoleStyledMessage("warning", "Anime.js is not loaded.");
    console.log("Anime.js is not loaded. Animations will not run.");
    return null;
  }

  const { direction = "up", duration = 800, staggerDelay = 100, startDelay = 0, distance = 20, easing = "outCubic", begin = null, complete = null } = options;

  const animationParams = {
    opacity: [0, 1],
    duration,
    delay: safeStagger(staggerDelay, { start: startDelay }),
    ease: easing,
    onBegin: (anim) => {
      ensureVisible(targets);
      if (begin) begin(anim);
    },
    onComplete: complete,
  };

  switch (direction) {
    case "up":
      animationParams.translateY = [distance, 0];
      break;
    case "down":
      animationParams.translateY = [-distance, 0];
      break;
    case "left":
      animationParams.translateX = [distance, 0];
      break;
    case "right":
      animationParams.translateX = [-distance, 0];
      break;
    default:
      animationParams.translateY = [distance, 0];
  }

  return safeAnimate(targets, animationParams);
}

export function scrollReveal(targets, options = {}) {
  if (typeof anime === "undefined") {
    //consoleStyledMessage("warning", "Anime.js is not loaded. Scroll animations will not run.");
    console.log("Anime.js is not loaded. Scroll animations will not run.");
    return null;
  }

  const {
    direction = "up",
    directionIn = null,
    directionOut = null,
    duration = 1000,
    delay = 0,
    distance = 40,
    easing = "outQuart",
    threshold = 0.15,
    thresholdIn = null,
    thresholdOut = null,
    viewportOffset = null,
    rootMargin = "0px",
    once = true,
    begin = null,
    complete = null,
  } = options;

  const resolvedDirectionIn = directionIn || direction;
  const opposites = {
    up: "down",
    down: "up",
    left: "right",
    right: "left",
  };
  const resolvedDirectionOut = directionOut || opposites[resolvedDirectionIn] || resolvedDirectionIn;

  // Helper: convert a viewportOffset value into a rootMargin string
  let resolvedRootMargin = rootMargin;
  if (viewportOffset !== null) {
    if (viewportOffset === "center") {
      resolvedRootMargin = "-45% 0px -45% 0px";
    } else if (typeof viewportOffset === "string") {
      const cleanOffset = viewportOffset.trim();
      if (cleanOffset.endsWith("%") || cleanOffset.endsWith("px")) {
        const sign = cleanOffset.startsWith("-") ? "" : "-";
        resolvedRootMargin = `${sign}${cleanOffset} 0px ${sign}${cleanOffset} 0px`;
      }
    } else if (typeof viewportOffset === "number") {
      resolvedRootMargin = `-${viewportOffset}px 0px -${viewportOffset}px 0px`;
    }
  }

  // When using viewportOffset, default thresholds to 0.01 for reliable triggering
  const resolvedThresholdIn = viewportOffset !== null ? (thresholdIn !== null ? thresholdIn : 0.01) : thresholdIn !== null ? thresholdIn : threshold;

  const resolvedThresholdOut = viewportOffset !== null ? (thresholdOut !== null ? thresholdOut : 0.01) : thresholdOut !== null ? thresholdOut : once ? threshold : 0.35;

  // Combine thresholds into a single unique sorted array for the IntersectionObserver
  const observerThresholds = Array.from(new Set([resolvedThresholdIn, resolvedThresholdOut])).sort((a, b) => a - b);

  // Resolve target elements
  let elements = [];
  if (typeof $ !== "undefined" && targets instanceof $) {
    elements = targets.toArray();
  } else if (typeof targets === "string") {
    elements = Array.from(document.querySelectorAll(targets));
  } else if (targets instanceof HTMLElement) {
    elements = [targets];
  } else if (Array.isArray(targets)) {
    elements = targets.filter((el) => el instanceof HTMLElement);
  } else if (targets && typeof targets.forEach === "function") {
    targets.forEach((el) => {
      if (el instanceof HTMLElement) elements.push(el);
    });
  }

  if (elements.length === 0) return null;

  // Initial state: hide elements before animating them in.
  elements.forEach((el) => {
    prepareForAnimation(el);
    el._scrollRevealState = "hidden";
  });

  // ── Entrance animation logic ──
  function playEnter(el) {
    if (el._scrollRevealState !== "hidden") return;
    consoleStyledMessage("info", `ScrollReveal: [ENTER] Element entered trigger zone`, el);
    el._scrollRevealState = "visible";
    el._scrollRevealShown = true;

    if (el._scrollRevealAnim) el._scrollRevealAnim.cancel();
    ensureVisible(el);

    const currentOpacity = el.style.opacity !== "" ? parseFloat(el.style.opacity) : 0;
    const params = {
      opacity: [currentOpacity, 1],
      duration,
      delay,
      ease: easing,
      onBegin: (anim) => {
        ensureVisible(el);
        if (begin) begin(anim, el);
      },
      onComplete: (anim) => {
        if (complete) complete(anim, el);
      },
    };

    switch (resolvedDirectionIn) {
      case "up":
        params.translateY = [-distance, 0];
        break;
      case "down":
        params.translateY = [distance, 0];
        break;
      case "left":
        params.translateX = [-distance, 0];
        break;
      case "right":
        params.translateX = [distance, 0];
        break;
      default:
        params.translateY = [distance, 0];
    }

    el._scrollRevealAnim = safeAnimate(el, params);
  }

  // ── Exit animation logic ──
  function playExit(el) {
    if (el._scrollRevealState !== "visible" || !el._scrollRevealShown) return;
    consoleStyledMessage("info", `ScrollReveal: [EXIT] Element left trigger zone`, el);
    el._scrollRevealState = "hidden";

    if (el._scrollRevealAnim) el._scrollRevealAnim.cancel();

    const currentOpacity = el.style.opacity !== "" ? parseFloat(el.style.opacity) : 1;
    const params = {
      opacity: [currentOpacity, 0],
      duration: duration / 2,
      ease: easing,
      onComplete: () => {
        el.style.visibility = "hidden";
      },
    };

    switch (resolvedDirectionOut) {
      case "up":
        params.translateY = [0, -distance];
        break;
      case "down":
        params.translateY = [0, distance];
        break;
      case "left":
        params.translateX = [0, -distance];
        break;
      case "right":
        params.translateX = [0, distance];
        break;
      default:
        params.translateY = [0, distance];
    }

    el._scrollRevealAnim = safeAnimate(el, params);
  }

  // ── Main Observer (uses viewportOffset) ──
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        const ratio = entry.intersectionRatio;

        if (ratio >= resolvedThresholdIn && el._scrollRevealState === "hidden" && entry.isIntersecting) {
          playEnter(el);
          if (once) observer.unobserve(el);
        } else if (!once && ratio < resolvedThresholdOut && el._scrollRevealState === "visible" && el._scrollRevealShown) {
          // Prevent stuttering: if we are at the bottom of the page, don't exit elements that are on-screen
          const tolerance = (typeof distance === "number" ? distance : 50) + 100;
          const isAtBottom = Math.ceil(window.innerHeight + window.scrollY) >= document.body.offsetHeight - tolerance;
          if (isAtBottom && el._isActuallyOnScreen) {
            return;
          }
          playExit(el);
        }
      });
    },
    {
      threshold: observerThresholds,
      rootMargin: resolvedRootMargin,
    },
  );

  // ── Visibility Fallback Observer (uses full viewport) ──
  // Tracks if elements are actually visible on screen regardless of viewportOffset
  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        el._isActuallyOnScreen = entry.isIntersecting;

        // If an element completely leaves the actual viewport, guarantee it exits (if once: false)
        if (!once && !entry.isIntersecting && el._scrollRevealState === "visible") {
          playExit(el);
        }
      });
    },
    {
      threshold: 0,
      rootMargin: "0px",
    },
  );

  elements.forEach((el) => {
    observer.observe(el);
    visibilityObserver.observe(el);
  });

  // ── Scroll Fallback Logic ──
  // Triggers elements if the page is scrolled near the absolute bottom.
  let scrollTimeout = null;
  function handleScrollFallback() {
    if (scrollTimeout) return;
    scrollTimeout = setTimeout(() => {
      scrollTimeout = null;

      const tolerance = (typeof distance === "number" ? distance : 50) + 150;
      const isAtBottom = Math.ceil(window.innerHeight + window.scrollY) >= document.body.offsetHeight - tolerance;

      if (isAtBottom) {
        let unrevealedCount = 0;
        elements.forEach((el) => {
          // Only force reveal elements that are ACTUALLY inside the viewport right now
          if (el._scrollRevealState === "hidden" && el._isActuallyOnScreen) {
            playEnter(el);
            if (once) {
              observer.unobserve(el);
              visibilityObserver.unobserve(el);
            }
          }
          if (once && el._scrollRevealState === "hidden") {
            unrevealedCount++;
          }
        });

        // If all are revealed and `once` is true, we don't need this listener anymore
        if (once && unrevealedCount === 0) {
          window.removeEventListener("scroll", handleScrollFallback);
        }
      }
    }, 150);
  }

  window.addEventListener("scroll", handleScrollFallback);
  // Trigger once on init in case page is already at the bottom
  setTimeout(handleScrollFallback, 100);

  return observer;
}

export function runEntranceAnimations(enabled) {
  // Elements that should animate in on page load.
  // Note: .now-playing-bar is excluded — it has its own visibility system (shown when music plays).
  const staticElements = {
    greeting: ".greeting-container",
    logo: ".header-logo",
    clock: ".clock-container",
    analogClock: ".analog-clock",
    search: ".search-box",
    shortcuts: ".shortcut-item",
    quote: ".quote-container",
    countdown: "#countdownWidget",
    nowPlaying: ".now-playing-bar",
  };

  if (!enabled) {
    Object.values(staticElements).forEach((selector) => {
      showWithoutAnimation(selector);
    });
    return;
  }

  Object.values(staticElements).forEach((selector) => {
    prepareForAnimation(selector);
  });

  Animation(staticElements.search, {
    direction: "fade",
    duration: 500,
    delay: 200,
    complete() {
      const shortcuts = document.querySelectorAll(staticElements.shortcuts);
      const shortcutDelays = [600, 300, 100, 300, 600];
      shortcuts.forEach((item, index) => {
        const delay = shortcutDelays[index] !== undefined ? shortcutDelays[index] : 1200;
        const isThisLastItem = index === shortcuts.length - 1;
        Animation(item, {
          direction: "up",
          distance: 30,
          duration: 300,
          delay: delay,
          complete() {
            if (isThisLastItem) {
              Animation(staticElements.greeting, { direction: "down", distance: 25, duration: 800, delay: 0 });
              Animation(staticElements.logo, { direction: "right", distance: 25, duration: 300, delay: 0 });
              Animation(staticElements.countdown, { direction: "up", distance: 25, duration: 800, delay: 300 });

              Animation(staticElements.clock, { direction: "down", distance: 25, duration: 800, delay: 150 });
              Animation(staticElements.analogClock, { direction: "left", distance: 20, duration: 800, delay: 200 });

              Animation(staticElements.quote, { direction: "up", distance: 25, duration: 800, delay: 300 });

              const npBar = document.querySelector(staticElements.nowPlaying);
              if (npBar && !npBar.classList.contains("visible")) {
                Animation(staticElements.nowPlaying, { direction: "up", distance: 25, duration: 800, delay: 400 });
              } else if (npBar) {
                showWithoutAnimation(staticElements.nowPlaying);
              }
            }
          },
        });
      });
    },
  });
}

export function runLogoTransition(headerLogo, logos, enabled) {
  if (logoInterval) {
    clearInterval(logoInterval);
    logoInterval = null;
  }

  let logoIndex = 0;

  const cycleLogo = () => {
    logoIndex = (logoIndex + 1) % logos.length;
    const nextSrc = logos[logoIndex];

    if (!enabled) {
      if (headerLogo instanceof jQuery) {
        headerLogo.attr("src", nextSrc);
      } else {
        headerLogo.src = nextSrc;
      }
      return;
    }

    if (headerLogo instanceof jQuery) {
      headerLogo.fadeOut(2000, function () {
        headerLogo.attr("src", nextSrc);
        headerLogo.fadeIn(2000);
      });
    } else {
      const $logo = typeof $ !== "undefined" ? $(headerLogo) : null;
      if ($logo) {
        $logo.fadeOut(2000, function () {
          $logo.attr("src", nextSrc);
          $logo.fadeIn(2000);
        });
      } else {
        headerLogo.src = nextSrc;
      }
    }
  };

  logoInterval = setInterval(cycleLogo, 14500);
}

export function toggleNowPlayingBarAnimation(visible, animated) {
  const selector = ".now-playing-bar";
  const elements = Array.from(document.querySelectorAll(selector));
  if (visible) {
    elements.forEach(el => el.classList.add("visible"));
    if (!animated) {
      showWithoutAnimation(selector);
    } else {
      prepareForAnimation(selector);
      Animation(selector, {
        direction: "up",
        distance: 25,
        duration: 600,
        delay: 0,
      });
    }
  } else {
    elements.forEach(el => el.classList.remove("visible"));
    if (!animated) {
      if (typeof $ !== "undefined") {
        $(selector).css({ opacity: 0, visibility: "hidden" });
      } else {
        elements.forEach((el) => {
          el.style.opacity = 0;
          el.style.visibility = "hidden";
        });
      }
    } else {
      const animeRef = getAnime();
      if (animeRef && typeof animeRef.animate === "function") {
        animeRef.animate(selector, {
          opacity: 0,
          translateY: 25,
          duration: 500,
          ease: "outQuart",
          onComplete: () => {
            elements.forEach((el) => (el.style.visibility = "hidden"));
          },
        });
      } else {
        elements.forEach((el) => {
          el.style.opacity = 0;
          el.style.visibility = "hidden";
        });
      }
    }
  }
}

export default { prepareForAnimation, scrollReveal, Animation, showWithoutAnimation, runEntranceAnimations, runLogoTransition, toggleNowPlayingBarAnimation };