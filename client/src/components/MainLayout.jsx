import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AppShell from "./AppShell";
import TopBar from "./TopBar";
import MobileModeBar from "./MobileModeBar";
import MobileBottomNav from "./MobileBottomNav";
import ControlPanel from "./ControlPanel";
import ControlsDrawer from "./ControlsDrawer";
import ImageCanvas from "./ImageCanvas";
import HistoryPanel from "./HistoryPanel";
import WorkflowBar from "./WorkflowBar";
import PhotoQueueStrip from "./PhotoQueueStrip";
import BatchProgressBar from "./BatchProgressBar";
import TrialBanner from "./TrialBanner";
import AnnouncementBanner from "./AnnouncementBanner";
import PaywallModal from "./PaywallModal";
import QuotaModal from "./QuotaModal";
import PropertyCreateModal from "./PropertyCreateModal";
import ReportImageModal from "./ReportImageModal";
import RoomChecklist from "./RoomChecklist";
import { generateImage } from "../api/generate";
import { fetchGenerations, toggleGenerationFavorite } from "../api/generations";
import { reportGeneration } from "../api/reports";
import { createProperty, fetchProperties } from "../api/properties";
import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "../contexts/SubscriptionContext";
import { usePreferences } from "../hooks/usePreferences";
import { useAgencySettings } from "../hooks/useAgencySettings";
import { MODES, isStyleMode } from "../constants/modes";
import { ROOM_TYPES } from "../constants/roomTypes";
import {
  getStyleById,
  resolveStyleForRoom,
  getStylesForRoomType,
} from "../constants/styles";
import {
  normalizeGenerationTuning,
  toApiGenerationTuning,
} from "../constants/generationTuning";
import { getAppBgClass } from "../utils/modeTheme";
import {
  LISTING_STEPS,
  ESSENTIAL_ROOMS,
  getListingActiveStep,
  countEssentialDone,
  buildRoomStatus,
  getNextEssentialRoom,
} from "../constants/listingWorkflow";
import { readFileAsDataUrl, urlToDataUrl } from "../utils/image";
import { compressImage } from "../utils/imageCompress";
import {
  applyImageAdjustments,
  downloadImage,
} from "../utils/imageAdjustments";
import { mergeLocalFavorites, setLocalFavorite } from "../utils/favorites";
import {
  applyImageLabel,
  downloadListingPack,
  downloadBatchListingPack,
  downloadPropertyListingPack,
} from "../utils/exportPack";
import { normalizeExportLabel } from "../constants/exportLabel";
import { getDefaultVariantStyles } from "./VariantPicker";

const ACTIVE_PROPERTY_KEY = "realstage_active_property";

function buildGenerationLabel(entry) {
  if (!entry) return null;
  const modeLabel = MODES[entry.mode]?.label ?? entry.mode;
  const roomLabel =
    ROOM_TYPES.find((room) => room.id === entry.roomType)?.label ??
    entry.roomType;
  const styleLabel = entry.style
    ? (getStyleById(entry.style)?.label ?? entry.style)
    : null;
  return [modeLabel, roomLabel, styleLabel].filter(Boolean).join(" · ");
}

function buildGenerateLabel(mode, subscription) {
  const modeLabel = MODES[mode]?.generateLabel ?? "Générer";
  if (!subscription) return modeLabel;

  if (subscription.subscription?.status === "active" && subscription.plan) {
    if (subscription.monthlyLimit == null) {
      return `${modeLabel} (illimité)`;
    }
    return `${modeLabel} (${subscription.monthlyRemaining}/${subscription.monthlyLimit})`;
  }

  if (subscription.trialRemaining > 0) {
    return `${modeLabel} (essai ${subscription.trialRemaining}/${subscription.trialLimit})`;
  }

  return `${modeLabel} — abonnement requis`;
}

async function prepareImage(source) {
  const dataUrl =
    typeof source === "string" ? source : await readFileAsDataUrl(source);
  return compressImage(dataUrl);
}

export default function MainLayout({ propertyIdFromRoute = null }) {
  const { getIdToken } = useAuth();
  const navigate = useNavigate();
  const {
    subscription,
    refreshSubscription,
    syncSubscription,
    canGenerate,
    openPaywall,
    handleGenerationError,
    paywallOpen,
    quotaModalOpen,
    closePaywall,
    plan,
    monthlyLimit,
    monthlyRemaining,
    canUseDeepThinking,
    deepThinkingLimit,
    deepThinkingRemaining,
    paywallReason,
    hasFeature,
  } = useSubscription();

  const { settings: agencySettings } = useAgencySettings();

  const { prefs, setPref } = usePreferences();
  const [searchParams, setSearchParams] = useSearchParams();

  const [mode, setModeState] = useState(prefs.mode);
  const [roomType, setRoomTypeState] = useState(prefs.roomType);
  const [roomSqm, setRoomSqmState] = useState(
    prefs.roomSqm != null ? prefs.roomSqm : null,
  );
  const [style, setStyleState] = useState(() =>
    resolveStyleForRoom(prefs.style, prefs.roomType),
  );
  const [deepThinking, setDeepThinkingState] = useState(prefs.deepThinking);
  const [generationTuning, setGenerationTuningState] = useState(() =>
    normalizeGenerationTuning(prefs.generationTuning),
  );

  const [baseImage, setBaseImage] = useState(null);
  const [displayImage, setDisplayImage] = useState(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const [photoQueue, setPhotoQueue] = useState([]);

  const [brightness, setBrightness] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [adjustedImage, setAdjustedImage] = useState(null);
  const [adjusting, setAdjusting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [mobileTab, setMobileTab] = useState("canvas");
  const [historyExpanded, setHistoryExpanded] = useState(true);

  const [batchState, setBatchState] = useState(null);
  const batchCancelRef = useRef(false);

  const [variantStyles, setVariantStyles] = useState(() =>
    getDefaultVariantStyles(prefs.style, prefs.roomType),
  );
  const [activeVariants, setActiveVariants] = useState([]);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  const [batchResults, setBatchResults] = useState([]);
  const [exportingPack, setExportingPack] = useState(false);

  const [properties, setProperties] = useState([]);
  const [activePropertyId, setActivePropertyId] = useState(
    () =>
      propertyIdFromRoute ||
      sessionStorage.getItem(ACTIVE_PROPERTY_KEY) ||
      null,
  );
  const [propertyCreateOpen, setPropertyCreateOpen] = useState(false);
  const [propertyCreating, setPropertyCreating] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const listingMode = Boolean(prefs.listingMode);
  const [listingHint, setListingHint] = useState(null);

  const activeProperty = useMemo(
    () => properties.find((p) => p.id === activePropertyId) ?? null,
    [properties, activePropertyId],
  );

  const branding = hasFeature("agencyPresets") ? agencySettings : null;
  const exportLabel = useMemo(() => normalizeExportLabel(prefs), [prefs]);

  const setMode = useCallback(
    (v) => {
      setModeState(v);
      setPref("mode", v);
    },
    [setPref],
  );

  const setRoomType = useCallback(
    (v) => {
      setRoomTypeState(v);
      setPref("roomType", v);
      setStyleState((current) => {
        const next = resolveStyleForRoom(current, v);
        if (next !== current) setPref("style", next);
        return next;
      });
      setVariantStyles((prev) => {
        const next = [];
        for (const id of prev) {
          const resolved = resolveStyleForRoom(id, v);
          if (!next.includes(resolved)) next.push(resolved);
        }
        for (const style of getStylesForRoomType(v)) {
          if (next.length >= 3) break;
          if (!next.includes(style.id)) next.push(style.id);
        }
        return next.slice(0, 3);
      });
    },
    [setPref],
  );

  const setRoomSqm = useCallback(
    (v) => {
      if (v === null || v === "" || v === undefined) {
        setRoomSqmState(null);
        setPref("roomSqm", null);
        return;
      }
      const n = Math.round(Number(v));
      if (!Number.isFinite(n)) return;
      setRoomSqmState(n);
      setPref("roomSqm", n);
    },
    [setPref],
  );

  const setStyle = useCallback(
    (v) => {
      setStyleState(v);
      setPref("style", v);
      setVariantStyles((prev) => {
        if (prev.includes(v)) return prev;
        const next = [v, ...prev.filter((id) => id !== v)];
        return next.slice(0, 3);
      });
    },
    [setPref],
  );

  const setDeepThinking = useCallback(
    (v) => {
      setDeepThinkingState(v);
      setPref("deepThinking", v);
    },
    [setPref],
  );

  const setGenerationTuning = useCallback(
    (v) => {
      const next = normalizeGenerationTuning(v);
      setGenerationTuningState(next);
      setPref("generationTuning", next);
    },
    [setPref],
  );

  useEffect(() => {
    if (!canUseDeepThinking && deepThinking) {
      setDeepThinkingState(false);
      setPref("deepThinking", false);
    }
  }, [canUseDeepThinking, deepThinking, setPref]);

  const clearVariants = useCallback(() => {
    setActiveVariants([]);
    setSelectedVariantIndex(0);
  }, []);

  useEffect(() => {
    if (propertyIdFromRoute) {
      setActivePropertyId(propertyIdFromRoute);
      sessionStorage.setItem(ACTIVE_PROPERTY_KEY, propertyIdFromRoute);
    }
  }, [propertyIdFromRoute]);

  useEffect(() => {
    if (!hasFeature("multiProjects")) return;
    let cancelled = false;
    (async () => {
      try {
        const idToken = await getIdToken();
        const list = await fetchProperties(idToken);
        if (!cancelled) setProperties(list);
      } catch (err) {
        if (!handleGenerationError(err) && !cancelled) {
          /* ignore load errors */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getIdToken, hasFeature, handleGenerationError]);

  useEffect(() => {
    if (
      hasFeature("agencyPresets") &&
      agencySettings?.defaultStyle &&
      prefs.style === "moderne"
    ) {
      setStyleState(agencySettings.defaultStyle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agencySettings?.defaultStyle, hasFeature]);

  const roomStatus = useMemo(
    () =>
      buildRoomStatus({
        history,
        photoQueue,
        roomType,
        roomProgress: activeProperty?.roomProgress,
      }),
    [history, photoQueue, roomType, activeProperty?.roomProgress],
  );

  const essentialDone = countEssentialDone(roomStatus);
  const essentialTotal = ESSENTIAL_ROOMS.length;

  const filteredHistory = useMemo(() => {
    if (!activePropertyId) return history;
    return history.filter((h) => h.propertyId === activePropertyId);
  }, [history, activePropertyId]);

  const activeGeneration = useMemo(() => {
    if (!selectedHistoryId) return null;
    return history.find((entry) => entry.id === selectedHistoryId) ?? null;
  }, [history, selectedHistoryId]);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      setHistoryLoading(true);
      try {
        const idToken = await getIdToken();
        const data = await fetchGenerations(idToken, {
          propertyId: activePropertyId,
        });
        if (!cancelled) {
          setHistory(mergeLocalFavorites(data.generations ?? []));
        }
      } catch {
        if (!cancelled) {
          console.error("Impossible de charger l'historique.");
        }
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    }

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, [getIdToken, activePropertyId]);

  useEffect(() => {
    if (searchParams.get("checkout") !== "success") return;

    (async () => {
      try {
        await syncSubscription();
      } catch {
        await refreshSubscription();
      }
    })();
    const next = new URLSearchParams(searchParams);
    next.delete("checkout");
    next.delete("session_id");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams, refreshSubscription, syncSubscription]);

  const resetAdjustments = useCallback(() => {
    setBrightness(0);
    setTemperature(0);
  }, []);

  const loadImage = useCallback(
    async (source, { keepQueue = false } = {}) => {
      try {
        const dataUrl = await prepareImage(source);
        setBaseImage(dataUrl);
        setDisplayImage(dataUrl);
        setSelectedHistoryId(null);
        resetAdjustments();
        setError(null);
        clearVariants();
        if (!keepQueue) {
          setPhotoQueue([]);
          setBatchResults([]);
        }
      } catch {
        setError("Impossible de charger l'image.");
      }
    },
    [resetAdjustments, clearVariants],
  );

  const handleImageLoaded = useCallback(
    async (input, isMulti = false) => {
      if (isMulti && Array.isArray(input)) {
        try {
          const prepared = await Promise.all(input.map((f) => prepareImage(f)));
          setPhotoQueue(prepared.slice(1));
          await loadImage(prepared[0], { keepQueue: true });
        } catch {
          setError("Impossible de charger les images.");
        }
        return;
      }
      await loadImage(input);
    },
    [loadImage],
  );

  const handleImagesQueued = useCallback(
    async (files) => {
      await handleImageLoaded(files, true);
    },
    [handleImageLoaded],
  );

  const handleHistorySelect = useCallback(
    async (entry) => {
      setSelectedHistoryId(entry.id);
      setDisplayImage(entry.imageUrl);
      resetAdjustments();
      clearVariants();

      if (entry.variantGroupId) {
        const group = history.filter(
          (h) => h.variantGroupId === entry.variantGroupId,
        );
        if (group.length > 1) {
          const sorted = [...group].sort(
            (a, b) => (a.variantIndex ?? 0) - (b.variantIndex ?? 0),
          );
          setActiveVariants(sorted);
          const idx = sorted.findIndex((v) => v.id === entry.id);
          setSelectedVariantIndex(idx >= 0 ? idx : 0);
        }
      }

      if (entry.baseImageUrl) {
        try {
          const base = await urlToDataUrl(entry.baseImageUrl);
          setBaseImage(base);
        } catch {
          setBaseImage(entry.imageUrl);
        }
      } else {
        setBaseImage(entry.imageUrl);
      }
      setMobileTab("canvas");
    },
    [resetAdjustments, clearVariants, history],
  );

  const useResultAsBase = useCallback(
    async (imageUrl = displayImage) => {
      if (!imageUrl) return;
      try {
        const dataUrl = imageUrl.startsWith("data:")
          ? imageUrl
          : await urlToDataUrl(imageUrl);
        setBaseImage(dataUrl);
        setDisplayImage(dataUrl);
        setSelectedHistoryId(null);
        resetAdjustments();
        setError(null);
        clearVariants();
      } catch {
        setError("Impossible de réutiliser cette image.");
      }
    },
    [displayImage, resetAdjustments, clearVariants],
  );

  const startNextPhoto = useCallback(async () => {
    if (photoQueue.length > 0) {
      const [next, ...rest] = photoQueue;
      setPhotoQueue(rest);
      setBaseImage(next);
      setDisplayImage(next);
      setSelectedHistoryId(null);
      resetAdjustments();
      setError(null);
      clearVariants();
      return;
    }

    setBaseImage(null);
    setDisplayImage(null);
    setSelectedHistoryId(null);
    resetAdjustments();
    setError(null);
    clearVariants();
    setMobileTab("canvas");
  }, [photoQueue, resetAdjustments, clearVariants]);

  useEffect(() => {
    if (!displayImage) {
      setAdjustedImage(null);
      return;
    }

    if (brightness === 0 && temperature === 0) {
      setAdjustedImage(displayImage);
      setAdjusting(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setAdjusting(true);
      try {
        const result = await applyImageAdjustments(displayImage, {
          brightness,
          temperature,
        });
        if (!cancelled) setAdjustedImage(result);
      } catch {
        if (!cancelled) setAdjustedImage(displayImage);
      } finally {
        if (!cancelled) setAdjusting(false);
      }
    }, 100);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [displayImage, brightness, temperature]);

  const previewImage = adjustedImage ?? displayImage;
  const hasAdjustments = brightness !== 0 || temperature !== 0;
  const hasResult =
    Boolean(baseImage) && Boolean(displayImage) && baseImage !== displayImage;

  const handleDownload = useCallback(
    async (imageUrl = previewImage) => {
      if (!imageUrl) return;
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      try {
        let src = imageUrl;
        const isGenerated = Boolean(baseImage) && imageUrl !== baseImage;
        if (exportLabel && isGenerated) {
          src = await applyImageLabel(imageUrl, exportLabel.text);
        }
        await downloadImage(src, `realstage-${stamp}.jpg`);
      } catch {
        setError("Impossible de télécharger l'image.");
      }
    },
    [previewImage, baseImage, exportLabel],
  );

  const runGenerateForImage = useCallback(
    async (imageBase, { styleOverride, variantGroupId, variantIndex } = {}) => {
      const idToken = await getIdToken();
      const effectiveStyle = styleOverride ?? style;

      const data = await generateImage(
        {
          mode,
          base_image: imageBase,
          room_type: roomType,
          style: effectiveStyle,
          deep_thinking: deepThinking,
          generation_tuning: hasFeature("generationTuning")
            ? toApiGenerationTuning(generationTuning)
            : null,
          room_sqm:
            mode === "meubler" &&
            roomSqm != null &&
            roomSqm >= 5 &&
            roomSqm <= 200
              ? roomSqm
              : null,
          variant_group_id: variantGroupId ?? null,
          variant_index: variantIndex ?? null,
          property_id: activePropertyId ?? null,
        },
        idToken,
      );

      const entry = data.generation ?? {
        id: crypto.randomUUID(),
        imageUrl: data.imageUrl,
        mode,
        roomType,
        style: isStyleMode(mode) ? effectiveStyle : null,
        variantGroupId: variantGroupId ?? null,
        variantIndex: variantIndex ?? null,
        propertyId: activePropertyId ?? null,
        timestamp: Date.now(),
        favorite: false,
      };

      setHistory((prev) => {
        const withoutDuplicate = prev.filter((item) => item.id !== entry.id);
        return mergeLocalFavorites([entry, ...withoutDuplicate]);
      });

      await refreshSubscription();
      return entry;
    },
    [
      mode,
      roomType,
      roomSqm,
      style,
      deepThinking,
      generationTuning,
      hasFeature,
      getIdToken,
      refreshSubscription,
      activePropertyId,
    ],
  );

  const runGenerate = useCallback(async () => {
    if (!baseImage) return null;

    setError(null);
    setLoading(true);
    clearVariants();

    try {
      const entry = await runGenerateForImage(baseImage);
      setDisplayImage(entry.imageUrl);
      setSelectedHistoryId(entry.id);
      resetAdjustments();

      if (listingMode && hasFeature("listingWorkflow")) {
        const nextRoom = getNextEssentialRoom({
          ...roomStatus,
          [roomType]: "done",
        });
        if (nextRoom) {
          setListingHint(nextRoom);
          setRoomType(nextRoom);
        } else {
          setListingHint(null);
        }
      }

      return entry;
    } catch (err) {
      if (!handleGenerationError(err)) {
        setError(err.message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [
    baseImage,
    runGenerateForImage,
    resetAdjustments,
    handleGenerationError,
    clearVariants,
    listingMode,
    hasFeature,
    roomStatus,
    roomType,
    setRoomType,
  ]);

  const ensureCanGenerateCount = useCallback(
    (count) => {
      if (!canGenerate) {
        openPaywall(subscription?.reason ?? "trial_exhausted");
        return false;
      }
      if (
        monthlyLimit != null &&
        monthlyRemaining != null &&
        count > monthlyRemaining
      ) {
        setError(
          `Quota insuffisant : ${count} génération(s) demandée(s), ${monthlyRemaining} restante(s) ce mois.`,
        );
        return false;
      }
      if (deepThinking) {
        if (!canUseDeepThinking || deepThinkingLimit === 0) {
          openPaywall("deep_thinking_quota_exceeded");
          return false;
        }
        if (
          deepThinkingLimit != null &&
          deepThinkingRemaining != null &&
          count > deepThinkingRemaining
        ) {
          setError(
            `Quota réflexion approfondie insuffisant : ${count} demandée(s), ${deepThinkingRemaining} restante(s) ce mois.`,
          );
          return false;
        }
      }
      return true;
    },
    [
      canGenerate,
      openPaywall,
      subscription,
      monthlyLimit,
      monthlyRemaining,
      deepThinking,
      canUseDeepThinking,
      deepThinkingLimit,
      deepThinkingRemaining,
    ],
  );

  const runBatchGenerate = useCallback(async () => {
    if (!baseImage || loading) return;

    const photos = [baseImage, ...photoQueue];
    if (photos.length < 2) return;
    if (!ensureCanGenerateCount(photos.length)) return;

    batchCancelRef.current = false;
    setBatchState({ current: 0, total: photos.length });
    setError(null);
    setLoading(true);
    clearVariants();

    const results = [];

    try {
      for (let i = 0; i < photos.length; i++) {
        if (batchCancelRef.current) break;

        setBatchState({ current: i + 1, total: photos.length });

        const photo = photos[i];
        if (i > 0) {
          setBaseImage(photo);
          setDisplayImage(photo);
          setPhotoQueue(photos.slice(i + 1));
          resetAdjustments();
        }

        try {
          const entry = await runGenerateForImage(photo);
          results.push({
            before: photo,
            after: entry.imageUrl,
            roomType,
          });
          setDisplayImage(entry.imageUrl);
          setSelectedHistoryId(entry.id);
          resetAdjustments();
        } catch (err) {
          if (handleGenerationError(err)) break;
          setError(err.message);
          break;
        }
      }

      setBatchResults(results);
    } finally {
      setLoading(false);
      setBatchState(null);
      batchCancelRef.current = false;
    }
  }, [
    baseImage,
    photoQueue,
    loading,
    ensureCanGenerateCount,
    clearVariants,
    runGenerateForImage,
    roomType,
    resetAdjustments,
    handleGenerationError,
  ]);

  const runGenerateVariants = useCallback(async () => {
    if (!baseImage || loading || !isStyleMode(mode)) return;
    if (variantStyles.length < 2) {
      setError("Sélectionnez au moins 2 styles pour les variantes.");
      return;
    }
    if (!ensureCanGenerateCount(variantStyles.length)) return;

    setError(null);
    setLoading(true);

    const groupId = crypto.randomUUID();
    const generated = [];

    try {
      for (let i = 0; i < variantStyles.length; i++) {
        const styleId = variantStyles[i];
        const entry = await runGenerateForImage(baseImage, {
          styleOverride: styleId,
          variantGroupId: groupId,
          variantIndex: i,
        });
        generated.push(entry);
      }

      setActiveVariants(generated);
      setSelectedVariantIndex(0);
      setDisplayImage(generated[0].imageUrl);
      setSelectedHistoryId(generated[0].id);
      resetAdjustments();
    } catch (err) {
      if (!handleGenerationError(err)) {
        setError(err.message);
      }
      if (generated.length > 0) {
        setActiveVariants(generated);
        setSelectedVariantIndex(0);
        setDisplayImage(generated[0].imageUrl);
        setSelectedHistoryId(generated[0].id);
      }
    } finally {
      setLoading(false);
    }
  }, [
    baseImage,
    loading,
    mode,
    variantStyles,
    ensureCanGenerateCount,
    runGenerateForImage,
    resetAdjustments,
    handleGenerationError,
  ]);

  const handleGenerateClick = useCallback(() => {
    if (!baseImage || loading) return;
    if (!ensureCanGenerateCount(1)) return;
    runGenerate();
  }, [baseImage, loading, ensureCanGenerateCount, runGenerate]);

  const handleBatchGenerateClick = useCallback(() => {
    if (!baseImage || loading || photoQueue.length === 0) return;
    runBatchGenerate();
  }, [baseImage, loading, photoQueue, runBatchGenerate]);

  const handleVariantsGenerateClick = useCallback(() => {
    if (!baseImage || loading) return;
    runGenerateVariants();
  }, [baseImage, loading, runGenerateVariants]);

  const handleCancelBatch = useCallback(() => {
    batchCancelRef.current = true;
  }, []);

  const handleVariantSelect = useCallback(
    (index) => {
      const variant = activeVariants[index];
      if (!variant) return;
      setSelectedVariantIndex(index);
      setDisplayImage(variant.imageUrl);
      setSelectedHistoryId(variant.id);
      resetAdjustments();
    },
    [activeVariants, resetAdjustments],
  );

  const handleToggleFavorite = useCallback(
    async (item) => {
      const next = !item.favorite;

      setHistory((prev) =>
        prev.map((h) => (h.id === item.id ? { ...h, favorite: next } : h)),
      );

      try {
        const idToken = await getIdToken();
        const updated = await toggleGenerationFavorite(item.id, next, idToken);
        setHistory((prev) =>
          prev.map((h) => (h.id === item.id ? { ...h, ...updated } : h)),
        );
      } catch {
        setLocalFavorite(item.id, next);
      }
    },
    [getIdToken],
  );

  const openReportModal = useCallback(
    (entry = null) => {
      const target = entry ?? activeGeneration;
      if (!target?.id) return;
      setReportTarget(target);
      setReportModalOpen(true);
    },
    [activeGeneration],
  );

  const handleReportSubmit = useCallback(
    async ({ reason, comment }) => {
      if (!reportTarget?.id) {
        throw new Error("Aucune génération sélectionnée.");
      }
      const idToken = await getIdToken();
      await reportGeneration(
        {
          generationId: reportTarget.id,
          reason,
          comment,
        },
        idToken,
      );
    },
    [reportTarget, getIdToken],
  );

  const handleExportPack = useCallback(
    async (entry = null) => {
      const before = entry?.baseImageUrl
        ? await urlToDataUrl(entry.baseImageUrl).catch(() => null)
        : baseImage;
      const after = entry?.imageUrl ?? previewImage;
      const packRoomType = entry?.roomType ?? roomType;

      if (!before || !after || before === after) {
        setError("Pack annonce indisponible sans photo avant/après.");
        return;
      }

      setExportingPack(true);
      try {
        const variants =
          activeVariants.length >= 2
            ? activeVariants.map((v) => ({
                imageUrl: v.imageUrl,
                style: v.style,
                after: v.imageUrl,
              }))
            : null;

        await downloadListingPack({
          before,
          after,
          roomType: packRoomType,
          branding,
          exportLabel,
          variants,
        });
      } catch {
        setError("Impossible de créer le pack annonce.");
      } finally {
        setExportingPack(false);
      }
    },
    [baseImage, previewImage, roomType, branding, exportLabel, activeVariants],
  );

  const handleExportBatchPack = useCallback(async () => {
    if (!batchResults.length && !filteredHistory.length) return;

    setExportingPack(true);
    try {
      if (activeProperty && hasFeature("multiProjects")) {
        const items = batchResults.length
          ? batchResults
          : filteredHistory
              .filter((h) => h.baseImageUrl && h.imageUrl !== h.baseImageUrl)
              .map((h) => ({
                before: h.baseImageUrl,
                after: h.imageUrl,
                roomType: h.roomType,
              }));

        await downloadPropertyListingPack(items, {
          address: activeProperty.address,
          label: activeProperty.label,
          branding,
          exportLabel,
        });
      } else {
        await downloadBatchListingPack(batchResults, { branding, exportLabel });
      }
    } catch {
      setError("Impossible de créer le pack annonce.");
    } finally {
      setExportingPack(false);
    }
  }, [
    batchResults,
    filteredHistory,
    activeProperty,
    hasFeature,
    branding,
    exportLabel,
  ]);

  const handleChainDeclutterToFurnish = useCallback(async () => {
    if (!displayImage || loading) return;
    await useResultAsBase(displayImage);
    setMode("meubler");
    setMobileTab("canvas");
  }, [displayImage, loading, useResultAsBase, setMode]);

  const handlePropertySelect = useCallback(
    (propertyId) => {
      setActivePropertyId(propertyId);
      if (propertyId) {
        sessionStorage.setItem(ACTIVE_PROPERTY_KEY, propertyId);
        navigate(`/properties/${propertyId}`);
      } else {
        sessionStorage.removeItem(ACTIVE_PROPERTY_KEY);
        navigate("/");
      }
    },
    [navigate],
  );

  const handlePropertyCreate = useCallback(
    async ({ label, address }) => {
      if (!hasFeature("multiProjects")) {
        openPaywall("agence_required");
        return;
      }
      setPropertyCreating(true);
      try {
        const idToken = await getIdToken();
        const property = await createProperty(idToken, { label, address });
        setProperties((prev) => [property, ...prev]);
        setPropertyCreateOpen(false);
        handlePropertySelect(property.id);
      } catch (err) {
        if (!handleGenerationError(err)) {
          setError(err.message);
        }
      } finally {
        setPropertyCreating(false);
      }
    },
    [
      hasFeature,
      openPaywall,
      getIdToken,
      handlePropertySelect,
      handleGenerationError,
    ],
  );

  const handleRoomChecklistSelect = useCallback(
    (roomId) => {
      setRoomType(roomId);
      setListingHint(null);
    },
    [setRoomType],
  );

  const listingGetActiveStep = useCallback(
    (ctx) =>
      getListingActiveStep({
        ...ctx,
        activeVariants,
        exporting: exportingPack,
        essentialDone,
        essentialTotal,
      }),
    [activeVariants, exportingPack, essentialDone, essentialTotal],
  );

  const workflowExtraBadge =
    listingMode && hasFeature("listingWorkflow") ? (
      <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent-light ring-1 ring-accent/40">
        {essentialDone}/{essentialTotal} pièces
      </span>
    ) : null;

  useEffect(() => {
    function onKeyDown(e) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "Enter") {
        e.preventDefault();
        handleGenerateClick();
      }
      if (mod && e.key === "s") {
        e.preventDefault();
        handleDownload();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleGenerateClick, handleDownload]);

  const generateLabel = buildGenerateLabel(mode, subscription);
  const totalQueuePhotos = photoQueue.length + (baseImage ? 1 : 0);

  const showWorkflowBar = listingMode && hasFeature("listingWorkflow");

  const mobileControlsClass =
    mobileTab === "controls"
      ? "flex min-h-0 flex-1 flex-col overflow-y-auto lg:hidden"
      : "hidden";

  const workspaceClass =
    mobileTab === "canvas"
      ? "relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex-row"
      : "relative hidden min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex lg:flex-row";

  const controlPanelProps = {
    mode,
    style,
    roomType,
    roomSqm,
    baseImage,
    deepThinking,
    loading,
    exportingPack,
    generateLabel,
    error,
    brightness,
    temperature,
    adjusting,
    hasAdjustableImage: Boolean(displayImage),
    hasAdjustments,
    hasResult,
    queueCount: photoQueue.length,
    totalQueuePhotos,
    variantStyles,
    batchResultsCount: batchResults.length,
    onStyleChange: setStyle,
    onRoomTypeChange: setRoomType,
    onRoomSqmChange: setRoomSqm,
    onImageLoaded: handleImageLoaded,
    onNextPhoto: startNextPhoto,
    onDeepThinkingChange: setDeepThinking,
    onBrightnessChange: setBrightness,
    onTemperatureChange: setTemperature,
    onResetAdjustments: resetAdjustments,
    onDownload: () => handleDownload(),
    onExportPack: () => handleExportPack(),
    onExportBatchPack: handleExportBatchPack,
    onGenerateClick: handleGenerateClick,
    onBatchGenerateClick: handleBatchGenerateClick,
    onVariantsGenerateClick: handleVariantsGenerateClick,
    onVariantStylesChange: setVariantStyles,
    onUseAsBase: () => useResultAsBase(),
    onChainDeclutterToFurnish: handleChainDeclutterToFurnish,
    deepThinkingLimit,
    deepThinkingRemaining,
    canUseDeepThinking,
    generationTuning,
    onGenerationTuningChange: setGenerationTuning,
    canUseGenerationTuning: hasFeature("generationTuning"),
    onUpgradeForTuning: () => openPaywall("pro_required"),
    aiLabelEnabled: prefs.aiLabelEnabled,
    onAiLabelEnabledChange: (value) => setPref("aiLabelEnabled", value),
  };

  return (
    <div
      data-mode={mode}
      className={`app-themed flex h-[100dvh] flex-col overflow-hidden lg:h-screen lg:flex-row ${getAppBgClass(mode)}`}
    >
      <div className="app-grid-bg pointer-events-none fixed inset-0 opacity-50" />
      <AppShell activeMode={mode} onModeChange={setMode}>
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col pb-[calc(3.25rem+env(safe-area-inset-bottom))] lg:pb-0">
          <TopBar
            mode={mode}
            properties={properties}
            activePropertyId={activePropertyId}
            activeProperty={activeProperty}
            onPropertySelect={handlePropertySelect}
            onPropertyCreateClick={() => {
              if (!hasFeature("multiProjects")) {
                openPaywall("agence_required");
                return;
              }
              setPropertyCreateOpen(true);
            }}
            hasFeature={hasFeature}
          />
          {showWorkflowBar && (
            <WorkflowBar
              mode={mode}
              hasImage={Boolean(baseImage)}
              hasResult={hasResult}
              loading={loading}
              queueCount={photoQueue.length}
              batchProgress={batchState}
              steps={
                listingMode && hasFeature("listingWorkflow")
                  ? LISTING_STEPS
                  : undefined
              }
              getActiveStep={
                listingMode && hasFeature("listingWorkflow")
                  ? listingGetActiveStep
                  : undefined
              }
              extraBadge={workflowExtraBadge}
            />
          )}
          {listingMode && hasFeature("listingWorkflow") && (
            <RoomChecklist
              mode={mode}
              roomStatus={roomStatus}
              currentRoomType={roomType}
              onRoomSelect={handleRoomChecklistSelect}
              essentialDone={essentialDone}
              essentialTotal={essentialTotal}
            />
          )}
          {listingHint && (
            <div className="shrink-0 border-b border-accent/20 bg-accent/10 px-4 py-2 text-center text-xs text-accent-light">
              Prochaine pièce essentielle suggérée — configurez et générez.
            </div>
          )}
          <PhotoQueueStrip
            mode={mode}
            queue={photoQueue}
            currentImage={baseImage}
          />
          {batchState && (
            <BatchProgressBar
              mode={mode}
              current={batchState.current}
              total={batchState.total}
              onCancel={handleCancelBatch}
            />
          )}
          <AnnouncementBanner />
          <TrialBanner mode={mode} />

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className={mobileControlsClass}>
              <ControlPanel {...controlPanelProps} />
            </div>

            <div className={workspaceClass}>
              <ControlsDrawer>
                <ControlPanel {...controlPanelProps} />
              </ControlsDrawer>

              <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <div className="relative min-h-0 flex-1 overflow-hidden">
                  <ImageCanvas
                    mode={mode}
                    beforeImage={baseImage}
                    afterImage={previewImage}
                    loading={loading}
                    adjusting={adjusting}
                    loadingLabel={MODES[mode]?.loadingLabel}
                    hasResult={hasResult}
                    queueCount={photoQueue.length}
                    activeVariants={activeVariants}
                    selectedVariantIndex={selectedVariantIndex}
                    onVariantSelect={handleVariantSelect}
                    variantCompareEnabled={hasFeature("variantCompare")}
                    onImageLoaded={(dataUrl) => handleImageLoaded(dataUrl)}
                    onImagesQueued={handleImagesQueued}
                    onUseAsBase={() => useResultAsBase()}
                    onNextPhoto={startNextPhoto}
                    onDownload={() => handleDownload()}
                    onExportPack={() => handleExportPack()}
                    onChainDeclutterToFurnish={handleChainDeclutterToFurnish}
                    generationId={activeGeneration?.id ?? null}
                    onReport={() => openReportModal()}
                    isFavorite={activeGeneration?.favorite ?? false}
                    onToggleFavorite={
                      activeGeneration
                        ? () => handleToggleFavorite(activeGeneration)
                        : undefined
                    }
                  />
                </div>

                <HistoryPanel
                  mode={mode}
                  history={filteredHistory}
                  loading={historyLoading}
                  selectedId={selectedHistoryId}
                  propertyLabel={activeProperty?.label}
                  onSelect={handleHistorySelect}
                  onUseAsBase={(entry) => useResultAsBase(entry.imageUrl)}
                  onDownload={handleDownload}
                  onToggleFavorite={handleToggleFavorite}
                  onExportPack={handleExportPack}
                  onReport={openReportModal}
                  expanded={historyExpanded}
                  onExpandedChange={setHistoryExpanded}
                />
              </div>
            </div>
          </div>

          <MobileModeBar activeMode={mode} onModeChange={setMode} />

          <MobileBottomNav
            mode={mode}
            activeTab={mobileTab}
            onTabChange={setMobileTab}
          />
        </div>
      </AppShell>

      <PaywallModal open={paywallOpen} onClose={closePaywall} mode={mode} />
      <QuotaModal
        open={quotaModalOpen}
        onClose={closePaywall}
        plan={plan}
        monthlyLimit={monthlyLimit}
        deepThinkingLimit={deepThinkingLimit}
        reason={paywallReason}
        mode={mode}
      />
      <PropertyCreateModal
        open={propertyCreateOpen}
        onClose={() => setPropertyCreateOpen(false)}
        onCreate={handlePropertyCreate}
        loading={propertyCreating}
      />
      <ReportImageModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSubmit={handleReportSubmit}
        mode={reportTarget?.mode ?? mode}
        generationLabel={buildGenerationLabel(reportTarget)}
      />
    </div>
  );
}
