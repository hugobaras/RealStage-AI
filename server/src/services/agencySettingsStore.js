import { getStorage } from "firebase-admin/storage";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getFirebaseConfig } from "../config.js";
import { initFirebaseAdmin, isFirebaseConfigured } from "./firebaseAdmin.js";
import { isValidStyle } from "./promptBuilder.js";

const SIGNED_URL_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const DEFAULT_SETTINGS = {
  defaultStyle: null,
  logoPath: null,
  logoDataUrl: null,
  logoOpacity: 0.15,
  watermarkPosition: "bottom-right",
  photoSignature: "",
  legalMentions: "",
  signatureFontSize: 16,
  signatureBold: true,
  legalFontSize: 12,
  legalBold: false,
};

const MAX_LOGO_DATA_URL_LENGTH = 900_000;

function settingsRef(uid) {
  initFirebaseAdmin();
  return getFirestore().collection("users").doc(uid);
}

function bucket() {
  const { storageBucket } = getFirebaseConfig();
  return getStorage().bucket(storageBucket);
}

function isStorageEnabled() {
  return getFirebaseConfig().storageConfigured;
}

async function signedReadUrl(storagePath) {
  const [url] = await bucket()
    .file(storagePath)
    .getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + SIGNED_URL_TTL_MS,
    });
  return url;
}

function clampFontSize(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

async function toAgencySettings(data) {
  const settings = { ...DEFAULT_SETTINGS, ...data };
  let logoUrl = null;

  if (settings.logoPath && isStorageEnabled()) {
    try {
      logoUrl = await signedReadUrl(settings.logoPath);
    } catch {
      logoUrl = settings.logoDataUrl ?? null;
    }
  } else if (settings.logoDataUrl) {
    logoUrl = settings.logoDataUrl;
  }

  return {
    defaultStyle: settings.defaultStyle,
    logoPath: settings.logoPath,
    logoUrl,
    logoOpacity: settings.logoOpacity ?? 0.15,
    watermarkPosition: settings.watermarkPosition ?? "bottom-right",
    photoSignature: settings.photoSignature ?? "",
    legalMentions: settings.legalMentions ?? "",
    signatureFontSize: clampFontSize(
      settings.signatureFontSize,
      10,
      48,
      DEFAULT_SETTINGS.signatureFontSize,
    ),
    signatureBold:
      settings.signatureBold !== undefined
        ? Boolean(settings.signatureBold)
        : DEFAULT_SETTINGS.signatureBold,
    legalFontSize: clampFontSize(
      settings.legalFontSize,
      8,
      32,
      DEFAULT_SETTINGS.legalFontSize,
    ),
    legalBold:
      settings.legalBold !== undefined
        ? Boolean(settings.legalBold)
        : DEFAULT_SETTINGS.legalBold,
    updatedAt: settings.updatedAt?.toMillis?.() ?? null,
  };
}

export async function getAgencySettings(uid) {
  if (!isFirebaseConfigured()) {
    return toAgencySettings(DEFAULT_SETTINGS);
  }

  const doc = await settingsRef(uid).get();
  const data = doc.data()?.agencySettings ?? {};
  return toAgencySettings(data);
}

export async function updateAgencySettings(uid, payload) {
  if (!isFirebaseConfigured()) {
    return toAgencySettings({ ...DEFAULT_SETTINGS, ...payload });
  }

  const patch = { updatedAt: FieldValue.serverTimestamp() };

  if (payload.defaultStyle !== undefined) {
    if (payload.defaultStyle === null || payload.defaultStyle === "") {
      patch.defaultStyle = null;
    } else if (isValidStyle(payload.defaultStyle)) {
      patch.defaultStyle = payload.defaultStyle;
    } else {
      const err = new Error("Style invalide.");
      err.status = 400;
      throw err;
    }
  }

  if (payload.logoOpacity != null) {
    const opacity = Number(payload.logoOpacity);
    patch.logoOpacity = Number.isFinite(opacity)
      ? Math.min(1, Math.max(0, opacity))
      : 0.15;
  }

  if (payload.watermarkPosition != null) {
    const valid = new Set(["bottom-right", "bottom-left", "center"]);
    patch.watermarkPosition = valid.has(payload.watermarkPosition)
      ? payload.watermarkPosition
      : "bottom-right";
  }

  if (payload.photoSignature != null) {
    patch.photoSignature = String(payload.photoSignature).slice(0, 200);
  }

  if (payload.legalMentions != null) {
    patch.legalMentions = String(payload.legalMentions).slice(0, 500);
  }

  if (payload.signatureFontSize != null) {
    patch.signatureFontSize = clampFontSize(
      payload.signatureFontSize,
      10,
      48,
      DEFAULT_SETTINGS.signatureFontSize,
    );
  }

  if (payload.signatureBold != null) {
    patch.signatureBold = Boolean(payload.signatureBold);
  }

  if (payload.legalFontSize != null) {
    patch.legalFontSize = clampFontSize(
      payload.legalFontSize,
      8,
      32,
      DEFAULT_SETTINGS.legalFontSize,
    );
  }

  if (payload.legalBold != null) {
    patch.legalBold = Boolean(payload.legalBold);
  }

  const ref = settingsRef(uid);
  const doc = await ref.get();
  const existing = doc.data()?.agencySettings ?? {};

  await ref.set(
    {
      agencySettings: {
        ...existing,
        ...patch,
      },
    },
    { merge: true },
  );

  const updated = await ref.get();
  return toAgencySettings(updated.data()?.agencySettings ?? {});
}

export async function uploadAgencyLogo(
  uid,
  buffer,
  contentType = "image/png",
  dataUrl = null,
) {
  if (!isFirebaseConfigured()) {
    const err = new Error("Stockage non disponible.");
    err.status = 503;
    throw err;
  }

  const ref = settingsRef(uid);
  const doc = await ref.get();
  const existing = doc.data()?.agencySettings ?? {};

  if (!isStorageEnabled()) {
    const stored =
      dataUrl ?? `data:${contentType};base64,${buffer.toString("base64")}`;

    if (stored.length > MAX_LOGO_DATA_URL_LENGTH) {
      const err = new Error(
        "Logo trop volumineux. Utilisez une image plus petite (max ~500 Ko).",
      );
      err.status = 400;
      throw err;
    }

    await ref.set(
      {
        agencySettings: {
          ...existing,
          logoDataUrl: stored,
          logoPath: null,
          updatedAt: FieldValue.serverTimestamp(),
        },
      },
      { merge: true },
    );

    return getAgencySettings(uid);
  }

  const ext = contentType.includes("png")
    ? "png"
    : contentType.includes("webp")
      ? "webp"
      : contentType.includes("jpeg") || contentType.includes("jpg")
        ? "jpg"
        : "png";
  const logoPath = `users/${uid}/agency/logo.${ext}`;

  await bucket()
    .file(logoPath)
    .save(buffer, {
      contentType,
      resumable: false,
      metadata: { cacheControl: "private, max-age=3600" },
    });

  await ref.set(
    {
      agencySettings: {
        ...existing,
        logoPath,
        logoDataUrl: null,
        updatedAt: FieldValue.serverTimestamp(),
      },
    },
    { merge: true },
  );

  return getAgencySettings(uid);
}
