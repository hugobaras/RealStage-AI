import { useState, useEffect, useCallback } from "react";
import { applyTheme } from "../utils/theme";
import { GENERATION_TUNING_DEFAULTS } from "../constants/generationTuning";

const STORAGE_KEY = "realstage_prefs";

const DEFAULTS = {
  mode: "meubler",
  roomType: "salon",
  style: "moderne",
  deepThinking: true,
  roomSqm: null,
  listingMode: false,
  theme: "light",
  generationTuning: { ...GENERATION_TUNING_DEFAULTS },
};

const listeners = new Set();

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

function notifyListeners(prefs) {
  listeners.forEach((fn) => fn(prefs));
}

export function usePreferences() {
  const [prefs, setPrefs] = useState(loadPrefs);

  useEffect(() => {
    const sync = (next) => {
      setPrefs(next);
      if (next.theme) applyTheme(next.theme);
    };
    listeners.add(sync);
    return () => listeners.delete(sync);
  }, []);

  const setPref = useCallback((key, value) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      notifyListeners(next);
      return next;
    });
  }, []);

  return { prefs, setPref };
}
