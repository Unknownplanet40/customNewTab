const VALID = {
  icons: ["info", "success", "error", "warning", "question"],
};

function getTheme() {
  const target = document.documentElement;
  const theme = target.getAttribute("data-bs-theme");
  return theme === "dark" ? "dark" : "light";
}

function attachGlassTilt(el) {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const maxTilt = 8;

  function onMove(e) {
    el.style.transition = "transform 0s";
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - py) * maxTilt;
    const ry = (px - 0.5) * maxTilt;
    el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  }

  function reset() {
    el.style.transition = "transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1)";
    el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
    el.style.setProperty("--mx", `50%`);
    el.style.setProperty("--my", `50%`);
  }

  el.addEventListener("mousemove", onMove);
  el.addEventListener("mouseleave", reset);
}

function normalize(value, validList, fallback) {
  const v = String(value).toLowerCase();
  return validList.includes(v) ? v : fallback;
}

export function showToast({ title = "Title here", icon = "info", timer = 0, position = "top-end" } = {}) {
  let iconToApply = normalize(icon, VALID.icons, "info");

  const Toast = Swal.mixin({
    toast: true,
    theme: getTheme() === "dark" ? "bootstrap-5-dark" : "bootstrap-5-light",
    icon: iconToApply,
    position: position,
    showConfirmButton: false,
    allowEscapeKey: false,
    timer: timer,
    timerProgressBar: timer !== false && timer > 0,
    customClass: {
      title: "fw-bold",
      popup: `bg-transparent liquid-glass lg-depth-1 rounded-4 border`,
      timerProgressBar: "rounded-3 bg-gradient bg-body bg-opacity-25",
      container: "overflow-hidden",
    },
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);

      attachGlassTilt(toast);
    },
  });

  return Toast.fire({ title });
}

export function showAlert(options = {}) {
  const { title = "Title here", text = "", icon = "info", timer = 0, position = "center", noButtons = true } = options;

  let iconToApply = normalize(icon, VALID.icons, "info");
  return Swal.fire({
    theme: getTheme() === "dark" ? "bootstrap-5-dark" : "bootstrap-5-light",
    title: title,
    text: text,
    icon: iconToApply,
    position: position,
    timer: timer,
    timerProgressBar: timer !== false && timer > 0,
    showConfirmButton: noButtons ? false : timer === false || timer === 0 ? true : false,
    allowOutsideClick: !noButtons,
    allowEscapeKey: !noButtons,
    customClass: {
      title: "fw-bold",
      popup: `bg-transparent liquid-glass lg-depth-3 rounded-4 border text-body`,
      timerProgressBar: "rounded-3 bg-gradient bg-body bg-opacity-25",
      confirmButton: "btn btn-primary lg-button px-4 py-2 mt-3",
      cancelButton: "btn btn-secondary lg-button px-4 py-2 mt-3",
    },
    didOpen: (alert) => {
      if (timer !== false && timer > 0) {
        alert.addEventListener("mouseenter", Swal.stopTimer);
        alert.addEventListener("mouseleave", Swal.resumeTimer);
      }

      attachGlassTilt(alert);
    },
  });
}

export function showConfirmation(options = {}) {
  const { title = "Are you sure?", text = "", icon = "question", confirmButtonText = "Yes", cancelButtonText = "No", timer = 0, position = "center" } = options;
  let iconToApply = normalize(icon, VALID.icons, "question");

  return Swal.fire({
    theme: getTheme() === "dark" ? "bootstrap-5-dark" : "bootstrap-5-light",
    title: title,
    text: text,
    icon: iconToApply,
    position: position,
    showCancelButton: true,
    confirmButtonText: confirmButtonText,
    cancelButtonText: cancelButtonText,
    timer: timer,
    timerProgressBar: timer !== false && timer > 0,
    customClass: {
      title: "fw-bold",
      popup: `bg-transparent liquid-glass rounded-4 border text-body`,
      timerProgressBar: "rounded-3 bg-gradient bg-body bg-opacity-25",
      confirmButton: "btn btn-primary lg-button px-4 py-2 mt-3 shadow-none",
      cancelButton: "btn btn-secondary lg-button px-4 py-2 mt-3 shadow-none",
    },
    didOpen: (alert) => {
      if (timer !== false && timer > 0) {
        alert.addEventListener("mouseenter", Swal.stopTimer);
        alert.addEventListener("mouseleave", Swal.resumeTimer);
      }

      attachGlassTilt(alert);
    },
  });
}

export default { showToast, showAlert, showConfirmation };
