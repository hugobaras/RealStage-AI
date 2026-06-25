import { useCallback } from "react";
import { applyTheme } from "../utils/theme";
import { usePreferences } from "./usePreferences";

export function useTheme() {
  const { prefs, setPref } = usePreferences();
  const theme = prefs.theme === "light" ? "light" : "dark";
  const isLight = theme === "light";

  const setTheme = useCallback(
    (next) => {
      const resolved = next === "light" ? "light" : "dark";
      setPref("theme", resolved);
      applyTheme(resolved);
    },
    [setPref],
  );

  const toggleTheme = useCallback(() => {
    setTheme(isLight ? "dark" : "light");
  }, [isLight, setTheme]);

  return { theme, isLight, setTheme, toggleTheme };
}
