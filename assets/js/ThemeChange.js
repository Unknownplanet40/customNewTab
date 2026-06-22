export function ThemeChange(theme = "auto") {
  const html = document.documentElement;
  if (theme === "auto") {
    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    html.setAttribute("data-bs-theme", isDarkMode ? "dark" : "light");
  } if (theme === "dark" || theme === "light") {
    html.setAttribute("data-bs-theme", theme);
  } else {
    html.setAttribute("data-bs-theme", theme);
  }
}
