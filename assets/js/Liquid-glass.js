export function LQ_tilt(tiltIntensity) {
  const $tiltElements = $(".liquid-glass-tilt");
  const DEBUG_MODE = false;

  let mouseX = 0;
  let mouseY = 0;
  let isMouseInWindow = false;

  $(window).on("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isMouseInWindow = true;
  });

  $(window).on("mouseleave", () => {
    isMouseInWindow = false;
  });

  const states = $tiltElements
    .map(function () {
      const $el = $(this);
      let $debugCircle = null;
      if (DEBUG_MODE) {
        $debugCircle = $("<div>").css({
          position: "fixed",
          border: "1px dashed rgba(0, 255, 255, 0.3)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9999,
          transform: "translate(-50%, -50%)",
        });
        $("body").append($debugCircle);
      }

      return {
        $el,
        $debugCircle,
        currentX: 0,
        currentY: 0,
        targetX: 0,
        targetY: 0,
        currentOpacity: 0,
        targetOpacity: 0,
      };
    })
    .get();

  function update() {
    states.forEach((state) => {
      const rect = state.$el[0].getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = mouseX - centerX;
      const deltaY = mouseY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const radius = 800;

      if (state.$debugCircle) {
        state.$debugCircle.css({
          left: `${centerX}px`,
          top: `${centerY}px`,
          width: `${radius * 2}px`,
          height: `${radius * 2}px`,
        });
      }

      if (isMouseInWindow && distance < radius) {
        const strength = 1 - distance / radius;
        const maxTilt = tiltIntensity || 15;

        state.targetX = (deltaY / radius) * -maxTilt * strength * 3;
        state.targetY = (deltaX / radius) * maxTilt * strength * 3;
        state.targetOpacity = distance < rect.width * 2 ? 1 : 0;
      } else {
        state.targetX = 0;
        state.targetY = 0;
        state.targetOpacity = 0;
      }

      state.currentX += (state.targetX - state.currentX) * 0.1;
      state.currentY += (state.targetY - state.currentY) * 0.1;

      state.$el.css("transform", `perspective(1000px) rotateX(${state.currentX.toFixed(2)}deg) rotateY(${state.currentY.toFixed(2)}deg)`);

      if (state.targetOpacity > 0 || state.currentOpacity > 0.01) {
        const px = (mouseX - rect.left) / rect.width;
        const py = (mouseY - rect.top) / rect.height;
        state.$el.css({
          "--mx": `${px * 100}%`,
          "--my": `${py * 100}%`,
        });
      }
    });

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

export function GlassThemeChange() {
  if (!GlassThemeChange._observer) {
    GlassThemeChange._observer = new MutationObserver(GlassThemeChange);
    GlassThemeChange._observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-bs-theme"],
    });
  }

  const currentTheme = $("html").attr("data-bs-theme") || "light";
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  if (!GlassThemeChange._systemThemeListenerAttached) {
    mediaQuery.addEventListener("change", GlassThemeChange);
    GlassThemeChange._systemThemeListenerAttached = true;
  }

  const isDark = currentTheme === "dark" || (currentTheme === "auto" && mediaQuery.matches);
  $(".liquid-glass").toggleClass("liquid-glass-dark", isDark);
}

export function GlassInteractive(isEnabled = true) {
  if (isEnabled) {
    $(".liquid-glass").addClass("liquid-glass-interactive");
  } else {
    $(".liquid-glass").removeClass("liquid-glass-interactive");
  }
}

export function GlassTilt(isEnabled = true, tiltIntensity = 15) {
  if (isEnabled) {
    $(".liquid-glass").not(".no-tilt").addClass("liquid-glass-tilt");
    LQ_tilt(tiltIntensity);
  } else {
    $(".liquid-glass").removeClass("liquid-glass-tilt");
  }
}

export function GlassDepth(depth = 1) {
  const validDepths = [0, 1, 2, 3];
  const d = validDepths.includes(depth) ? depth : 1;
  $(".liquid-glass").removeClass("lg-depth-0 lg-depth-1 lg-depth-2 lg-depth-3").addClass(`lg-depth-${d}`);
}

export default { LQ_tilt, GlassThemeChange, GlassInteractive, GlassTilt, GlassDepth };