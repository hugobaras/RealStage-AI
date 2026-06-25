export const THEMES = ["dark", "light"];

export function getStoredTheme() {
  try {
    const raw = localStorage.getItem("realstage_prefs");
    if (!raw) return "dark";
    const prefs = JSON.parse(raw);
    return prefs.theme === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function applyTheme(theme) {
  const resolved = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", resolved);
  document.documentElement.style.colorScheme = resolved;
  return resolved;
}

export function initTheme() {
  return applyTheme(getStoredTheme());
}
