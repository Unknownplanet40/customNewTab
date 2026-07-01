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
    case "success":
      [0, 0.08, 0.18, 0.32].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(620 + i * 160, now + delay);

        gain.gain.setValueAtTime(0.28, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.75);

        osc.connect(gain).connect(ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.9);
      });
      break;
    case "matrix":
      const baseTime = now;
      const blipFrequencies = [760, 980, 1350, 1820, 2480, 3150];
      const blipCount = 22;

      for (let i = 0; i < blipCount; i++) {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.frequency.value = blipFrequencies[i % blipFrequencies.length] * (0.92 + Math.random() * 0.16);
          osc.type = i % 4 === 0 ? "square" : "sawtooth";

          filter.type = "bandpass";
          filter.frequency.value = osc.frequency.value * 0.9;
          filter.Q.value = 14;

          gain.gain.setValueAtTime(0.25 - i * 0.008, baseTime + i * 0.026);
          gain.gain.exponentialRampToValueAtTime(0.001, baseTime + i * 0.026 + 0.11);

          osc.connect(filter).connect(gain).connect(ctx.destination);
          osc.start(baseTime + i * 0.026);
          osc.stop(baseTime + i * 0.026 + 0.14);
        }, i * 26);
      }

      const hum = ctx.createOscillator();
      const hGain = ctx.createGain();
      hum.type = "sine";
      hum.frequency.value = 72;
      hGain.gain.setValueAtTime(0.11, baseTime + 0.1);
      hGain.gain.exponentialRampToValueAtTime(0.001, baseTime + 0.9);
      hum.connect(hGain).connect(ctx.destination);
      hum.start(baseTime + 0.1);
      break;
    case "matrixout":
      const humOut = ctx.createOscillator();
      const hGainOut = ctx.createGain();
      humOut.type = "sine";
      humOut.frequency.value = 72;
      hGainOut.gain.setValueAtTime(0.11, now);
      hGainOut.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      humOut.connect(hGainOut).connect(ctx.destination);
      humOut.start(now);
      break;
    case "love":
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(220, now);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1).connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(880, now + 0.15);
      gain2.gain.setValueAtTime(0.15, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2).connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.65);
      break;
    default:
      playEasterSound("success");
      break;
  }
}

function eggConfetti(options = {}) {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    pointer-events: none; z-index: 99999;
  `;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = options.colors || ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444"];
  const particles = [];
  const count = options.count || 120;
  const gravity = options.gravity || 0.35;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 10 + 5,
      h: Math.random() * 5 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 4 + 2,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.3,
      opacity: 1,
    });
  }

  let frame;
  let elapsed = 0;
  const duration = options.duration || 3000;
  const startTime = Date.now();

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    elapsed = Date.now() - startTime;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += gravity;
      p.angle += p.spin;
      p.opacity = Math.max(0, 1 - elapsed / duration);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    if (elapsed < duration) {
      frame = requestAnimationFrame(draw);
    } else {
      canvas.remove();
    }
  }

  draw();
  return () => {
    cancelAnimationFrame(frame);
    canvas.remove();
  };
}

function showEggModal({ icon, isIconBeating = false, title, subtitle, body, accent = "#6366f1", showClose = true }) {
  const existing = document.getElementById("easterEggModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "easterEggModal";
  modal.style.cssText = `
    position: fixed; inset: 0; z-index: 99998;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
    animation: eggFadeIn 0.3s ease;
    padding: 1rem;
  `;

  modal.innerHTML = `
    <div id="easterEggCard" style="
      background: rgba(15, 15, 30, 0.5);
      border: 1px solid ${accent}55;
      border-radius: 1rem;
      padding: 2.5rem 2rem;
      max-width: 480px;
      width: 100%;
      text-align: center;
      box-shadow: 0 0 60px ${accent}33, 0 30px 60px rgba(0,0,0,0.5);
      animation: eggSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
    ">
      ${
        showClose
          ? `
        <button id="eggCloseBtn" style="
          position: absolute; top: 1rem; right: 1rem;
          background: rgba(255,255,255,0.08); border: none; color: rgba(255,255,255,0.6);
          width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
          font-size: 0.9rem; display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        " onmouseover="this.style.background='rgba(255,255,255,0.15)'"
           onmouseout="this.style.background='rgba(255,255,255,0.08)'">
          <i class="bi bi-x-lg"></i>
        </button>`
          : ""
      }
      <div style="font-size: 3.5rem; margin-bottom: 0.75rem; line-height:1" ${isIconBeating ? 'class="beating-icon"' : ""}>${icon}</div>
      <h3 style="
        color: #fff; font-size: 1.5rem; font-weight: 700;
        margin-bottom: 0.4rem; font-family: 'Outfit', sans-serif;
        background: linear-gradient(135deg, #fff 0%, ${accent} 100%);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        background-clip: text;
      ">${title}</h3>
      ${subtitle ? `<p style="color: rgba(255,255,255,0.4); font-size: 0.85rem; margin-bottom: 1.25rem; font-style: italic;">${subtitle}</p>` : ""}
      <div style="
        background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
        border-radius: 12px; padding: 1rem 1.25rem; text-align: left;
        color: rgba(255,255,255,0.75); font-size: 0.88rem; line-height: 1.7;
      ">${body}</div>
    </div>
  `;

  if (!document.getElementById("eggStyles")) {
    const style = document.createElement("style");
    style.id = "eggStyles";
    style.textContent = `
      @keyframes eggFadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes eggSlideIn { from { opacity: 0; transform: scale(0.7) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      @keyframes eggShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
      @keyframes eggGlow { 0%,100%{box-shadow:0 0 20px rgba(99,102,241,0.3)} 50%{box-shadow:0 0 50px rgba(99,102,241,0.7)} }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(modal);

  const closeModal = () => {
    modal.style.animation = "eggFadeIn 0.2s ease reverse";
    setTimeout(() => modal.remove(), 500);
  };

  const closeBtn = modal.querySelector("#eggCloseBtn");
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", function escClose(e) {
    if (e.key === "Escape") {
      closeModal();
      document.removeEventListener("keydown", escClose);
    }
  });

  return modal;
}

// screen saver: matrix rain effect, and dvd bouncer effect
function SS_MatrixRain(options = {}) {
  let { accent = "#00ff41", canvaOpacity = 1 } = options;
  const canvas = document.createElement("canvas");

  canvas.style.cssText = `
    position: fixed; inset: 0; z-index: 9999; pointer-events: none;
    width: 100%; height: 100%; opacity: 0;
    transition: opacity 0.6s ease-in-out;
  `;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const fontSize = 14;
  const cols = Math.floor(canvas.width / fontSize);
  const drops = Array(cols).fill(1);
  const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF";

  setTimeout(() => {
    canvas.style.opacity = canvaOpacity;
  }, 50);

  const interval = setInterval(() => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = accent;
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }, 45);

  const hideCanvas = () => {
    clearInterval(interval);
    canvas.style.opacity = "0";
    setTimeout(() => canvas.remove(), 1000);
    document.removeEventListener("click", hideCanvas);
    document.removeEventListener("keydown", hideCanvas);
    playEasterSound("matrixout");
  };

  document.addEventListener("click", hideCanvas);
  document.addEventListener("keydown", hideCanvas);

  return canvas;
}

function SS_DVDBouncer(options= {}) {
  let { speed = "slow", logoPath = "assets/images/icons/icons-x192.png", opacity = 1 } = options;
  const canvas = document.createElement("canvas");
  canvas.style.cssText = `
    position: fixed; inset: 0; z-index: 9999; pointer-events: none;
    width: 100%; height: 100%; opacity: 0;
    transition: opacity 0.7s ease-in-out;
    background: rgba(0, 0, 0, ${opacity});
  `;
  document.body.appendChild(canvas);

  const speedMap = {
    slow: 0.7,
    normal: 1.0,
    fast: 2.2,
  };

  speed = speedMap[speed] || speedMap.normal;

  const ctx = canvas.getContext("2d");
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const img = new Image();
  img.src = logoPath;

  let x = Math.random() * (width - 220) + 20;
  let y = Math.random() * (height - 220) + 20;
  
  let vx = 2.8 * speed;
  let vy = 2.5 * speed;

  let logoSize = Math.min(220, Math.max(96, Math.floor(Math.min(width, height) * 0.15))); 
  let loaded = false;
  let animationFrame;
  let currentHue = Math.random() * 360;

  const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  window.addEventListener("resize", resize);

  img.onload = () => loaded = true;

  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    if (!loaded) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#666";
      ctx.font = "bold 32px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Can't load logo...", width / 2, height / 2);
      animationFrame = requestAnimationFrame(draw);
      return;
    }

const oldX = x;
    const oldY = y;

    x += vx;
    y += vy;

    let hitCorner = false;

    if (x <= 0 || x + logoSize >= width) {
      vx *= -1;
      x = Math.max(0, Math.min(width - logoSize, x));
      if ((oldY <= 0 || oldY + logoSize >= height)) hitCorner = true;
    }

    if (y <= 0 || y + logoSize >= height) {
      vy *= -1;
      y = Math.max(0, Math.min(height - logoSize, y));
      if ((oldX <= 0 || oldX + logoSize >= width)) hitCorner = true;
    }

    if (hitCorner) {
      currentHue = (currentHue + 55) % 360;
    }

    ctx.save();
    ctx.filter = `hue-rotate(${currentHue}deg) saturate(1.4)`;
    ctx.drawImage(img, x, y, logoSize, logoSize);
    ctx.restore();
  };

  const animate = () => {
    draw();
    animationFrame = requestAnimationFrame(animate);
  };

  setTimeout(() => {
    canvas.style.opacity = "1";
    animate();
  }, 80);

  const hide = () => {
    cancelAnimationFrame(animationFrame);
    canvas.style.opacity = "0";
    window.removeEventListener("resize", resize);
    setTimeout(() => canvas.remove(), 800);
    document.removeEventListener("click", hide);
    document.removeEventListener("keydown", hide);
  };

  document.addEventListener("click", hide);
  document.addEventListener("keydown", hide);

  return canvas;
}

const EASTER_EGGS = [
  {
    id: "caps",
    name: "Secret Name",
    pattern: ["c", "a", "p", "s"],
    trigger() {
      playEasterSound("success");
      eggConfetti({ count: 180, duration: 4000 });
      showEggModal({
        icon: "👾",
        title: "Capsss",
        accent: "#6366f1",
        subtitle: "I debug life the same way I debug code with patience, caffeine, and a bit of panic.",
        body: `
          <p style="margin:0 0 0.75rem;">Hey there! You've discovered a hidden easter egg. This page is filled with little surprises for those who explore.</p>
          <p style="margin:0;">Keep exploring, and who knows what other secrets you might find!</p>
          <p style="margin:0; font-size:0.8rem; color:rgba(255,255,255,0.4); margin-top:0.75rem;">- Caps</p>
        `,
        showClose: false,
      });
    },
  },
  {
    id: "screenSaver",
    name: "Matrix",
    pattern: ["h", "a", "c", "k", "e", "r"],
    trigger() {
      const randomEgg = EASTER_EGGS[Math.floor(Math.random() * EASTER_EGGS.length)];
      if (randomEgg.id === "screenSaver") {
        playEasterSound("matrix");
        SS_MatrixRain({canvaOpacity: 0.7});
      } else {
        SS_DVDBouncer({opacity: 0.7});
      }
    },
  },
  {
    id: "love",
    name: "tomylove",
    pattern: ["l", "o", "v", "e"],
    trigger() {
      playEasterSound("love");
      eggConfetti({ colors: ["#ef4444", "#ec4899", "#f97316", "#ffffff"], count: 100, gravity: 0.2 });
      showEggModal({
        icon: "💖",
        isIconBeating: true,
        title: "To my Love ❤️",
        accent: "#ec4899",
        subtitle: "❤️ ❤️ ❤️ ❤️ ❤️ ❤️ ❤️ ❤️ ❤️ ❤️",
        body: `
          <p style="margin:0 0 0.75rem; display: none;">This new tab page was crafted with passion, late nights, and way too much coffee ☕</p>
          <p style="display: none; margin:0; font-size:0.8rem; color:rgba(255,255,255,0.4);">Every animation, every gradient, every line of code — all made just for <em>you</em>.</p>
        `,
      });
    },
  },
];

let _screensaverCleanup = null;

export function initEasterEggs(screensaverEnabled = false, screensaverType = "random", idleDuration = 300000) {
  if (_screensaverCleanup) {
    _screensaverCleanup();
    _screensaverCleanup = null;
  }

  const MAX_PATTERN = Math.max(...EASTER_EGGS.map((e) => e.pattern.length));
  let inputBuffer = [];
  let idleTimer = null;

  const triggerScreensaver = () => {
    let type = screensaverType;
    if (type === "random") {
      type = Math.random() < 0.5 ? "matrix" : "dvd";
    }
    if (type === "matrix") {
      playEasterSound("matrix");
      SS_MatrixRain({ canvaOpacity: 0.7 });
    } else {
      SS_DVDBouncer({ opacity: 0.7 });
    }
  };

  const resetIdleTimer = () => {
    if (!screensaverEnabled) return;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(triggerScreensaver, idleDuration);
  };

  const onActivity = () => resetIdleTimer();

  if (screensaverEnabled) {
    window.addEventListener("mousemove", onActivity);
    window.addEventListener("click", onActivity);
    window.addEventListener("keydown", onActivity);
    window.addEventListener("scroll", onActivity);
    resetIdleTimer();
  }

  const onKeyDown = (e) => {
    if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") return;

    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    inputBuffer.push(key);

    if (inputBuffer.length > MAX_PATTERN) {
      inputBuffer = inputBuffer.slice(-MAX_PATTERN);
    }

    for (const egg of EASTER_EGGS) {
      const pLen = egg.pattern.length;
      if (inputBuffer.length >= pLen) {
        const tail = inputBuffer.slice(-pLen);
        const matched = egg.pattern.every((k, i) => k === tail[i]);
        if (matched) {
          if (egg.id !== "screenSaver") {
            inputBuffer = [];
            egg.trigger();
            break;
          } else if (!screensaverEnabled) {
            // Allow manual trigger via easter egg keyword even if screensaver is off
            inputBuffer = [];
            triggerScreensaver();
            break;
          }
        }
      }
    }
  };

  window.addEventListener("keydown", onKeyDown);

  // Store cleanup function for next call
  _screensaverCleanup = () => {
    clearTimeout(idleTimer);
    window.removeEventListener("mousemove", onActivity);
    window.removeEventListener("click", onActivity);
    window.removeEventListener("keydown", onActivity);
    window.removeEventListener("scroll", onActivity);
    window.removeEventListener("keydown", onKeyDown);
  };
}
