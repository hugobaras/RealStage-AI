import { useCallback, useEffect, useState } from "react";
import {
  fetchAgencySettings,
  updateAgencySettings,
  uploadAgencyLogo,
} from "../api/agencySettings";
import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "../contexts/SubscriptionContext";

const CACHE_KEY = "realstage_agency_settings";

export function useAgencySettings() {
  const { getIdToken } = useAuth();
  const { hasFeature } = useSubscription();
  const enabled = hasFeature("agencyPresets");

  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled) return null;
    setLoading(true);
    try {
      const idToken = await getIdToken();
      const data = await fetchAgencySettings(idToken);
      setSettings(data);
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      return data;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  }, [enabled, getIdToken]);

  useEffect(() => {
    if (enabled) refresh();
  }, [enabled, refresh]);

  const save = useCallback(
    async (patch) => {
      const idToken = await getIdToken();
      const data = await updateAgencySettings(idToken, patch);
      setSettings(data);
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      return data;
    },
    [getIdToken],
  );

  const uploadLogo = useCallback(
    async (imageDataUrl) => {
      const idToken = await getIdToken();
      const data = await uploadAgencyLogo(idToken, imageDataUrl);
      setSettings(data);
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      return data;
    },
    [getIdToken],
  );

  return {
    settings,
    loading,
    refresh,
    save,
    uploadLogo,
    enabled,
  };
}
