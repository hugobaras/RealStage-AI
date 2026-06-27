import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchAllCatalog } from "../api/config";
import { INTERIOR_STYLES, OUTDOOR_STYLES } from "../constants/styles";
import { ROOM_TYPES } from "../constants/roomTypes";
import { PLANS } from "../constants/plans";
import { FEATURES } from "../constants/features";
import {
  GENERATION_TUNING_DEFAULTS,
  GENERATION_TUNING_PRESETS,
} from "../constants/generationTuning";

const CatalogContext = createContext(null);

const LOCAL_DEFAULTS = {
  styles: { items: [...INTERIOR_STYLES, ...OUTDOOR_STYLES] },
  roomTypes: { items: ROOM_TYPES },
  plans: { items: PLANS },
  features: { features: FEATURES },
  generationTuning: {
    defaults: GENERATION_TUNING_DEFAULTS,
    presets: GENERATION_TUNING_PRESETS,
  },
};

export function CatalogProvider({ children }) {
  const [catalog, setCatalog] = useState(LOCAL_DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchAllCatalog()
      .then((data) => {
        if (!cancelled) setCatalog((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => ({ catalog, loading }), [catalog, loading]);

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    return { catalog: LOCAL_DEFAULTS, loading: false };
  }
  return context;
}
