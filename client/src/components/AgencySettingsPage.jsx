import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Image as ImageIcon } from "lucide-react";
import { STYLES } from "../constants/styles";
import { DEFAULT_AGENCY_TYPOGRAPHY } from "../constants/agencyTypography";
import { useAgencySettings } from "../hooks/useAgencySettings";
import { useSubscription } from "../contexts/SubscriptionContext";
import { composeSideBySide } from "../utils/exportPack";
import { compressLogo } from "../utils/imageCompress";
import AppShell from "./AppShell";
import MobileAppNav from "./MobileAppNav";

const WATERMARK_POSITIONS = [
  { id: "bottom-right", label: "Bas droite" },
  { id: "bottom-left", label: "Bas gauche" },
  { id: "center", label: "Centre" },
];

function TypographyControls({
  prefix,
  label,
  current,
  onChange,
  sizeMin,
  sizeMax,
}) {
  const sizeKey = `${prefix}FontSize`;
  const boldKey = `${prefix}Bold`;
  const size = current[sizeKey] ?? DEFAULT_AGENCY_TYPOGRAPHY[sizeKey];
  const bold = current[boldKey] ?? DEFAULT_AGENCY_TYPOGRAPHY[boldKey];

  return (
    <div className="mt-2 flex flex-wrap items-end gap-4 rounded-xl border border-line bg-elevated/50 px-3 py-2">
      <label className="min-w-[7rem] flex-1">
        <span className="mb-1 block text-xs text-fg-muted">
          {label} — taille
        </span>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={sizeMin}
            max={sizeMax}
            value={size}
            onChange={(e) => onChange(sizeKey, Number(e.target.value))}
            className="flex-1"
          />
          <span className="w-8 text-right text-xs tabular-nums text-fg-muted">
            {size}
          </span>
        </div>
      </label>
      <label className="flex cursor-pointer items-center gap-2 pb-1 text-sm text-fg-subtle">
        <input
          type="checkbox"
          checked={bold}
          onChange={(e) => onChange(boldKey, e.target.checked)}
          className="rounded border-line"
        />
        Gras
      </label>
    </div>
  );
}

export default function AgencySettingsPage() {
  const { hasFeature } = useSubscription();
  const { settings, loading, save, uploadLogo } = useAgencySettings();
  const logoInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState(null);
  const [logoSuccess, setLogoSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [form, setForm] = useState(null);

  const current = form ??
    settings ?? {
      defaultStyle: "scandinave",
      logoOpacity: 0.15,
      watermarkPosition: "bottom-right",
      photoSignature: "",
      legalMentions: "",
      logoUrl: null,
      ...DEFAULT_AGENCY_TYPOGRAPHY,
    };

  if (!hasFeature("agencyPresets")) {
    return (
      <AppShell>
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto bg-deep p-6 text-center">
          <MobileAppNav />
          <h1 className="font-display text-xl font-semibold text-fg">
            Paramètres agence
          </h1>
          <p className="mt-2 max-w-md text-sm text-fg-muted">
            Style par défaut, logo, signature et mentions légales — réservé au
            forfait Agence.
          </p>
          <Link to="/pricing" className="btn-primary mt-6">
            Voir les forfaits
          </Link>
        </div>
      </AppShell>
    );
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...(prev ?? current), [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await save({
        defaultStyle: current.defaultStyle,
        logoOpacity: current.logoOpacity,
        watermarkPosition: current.watermarkPosition,
        photoSignature: current.photoSignature,
        legalMentions: current.legalMentions,
        signatureFontSize: current.signatureFontSize,
        signatureBold: current.signatureBold,
        legalFontSize: current.legalFontSize,
        legalBold: current.legalBold,
      });
      setForm(null);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLogoError("Format non supporté. Utilisez PNG, JPEG ou WebP.");
      e.target.value = "";
      return;
    }

    setLogoError(null);
    setLogoSuccess(false);
    setLogoUploading(true);

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () =>
          reject(new Error("Lecture du fichier impossible."));
        reader.readAsDataURL(file);
      });

      const compressed = await compressLogo(dataUrl, 512);
      await uploadLogo(compressed);
      setForm(null);
      setLogoSuccess(true);
    } catch (err) {
      const message =
        err.status === 403
          ? "Le logo agence nécessite le forfait Agence."
          : err.message || "Impossible de téléverser le logo.";
      setLogoError(message);
    } finally {
      setLogoUploading(false);
      e.target.value = "";
    }
  };

  const generatePreview = async () => {
    const placeholderBefore =
      "data:image/svg+xml," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="#333" width="400" height="300"/><text x="50%" y="50%" fill="#888" text-anchor="middle" font-size="20">Avant</text></svg>',
      );
    const placeholderAfter =
      "data:image/svg+xml," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="#555" width="400" height="300"/><text x="50%" y="50%" fill="#ccc" text-anchor="middle" font-size="20">Après</text></svg>',
      );

    const url = await composeSideBySide(placeholderBefore, placeholderAfter, {
      branding: current,
    });
    setPreviewUrl(url);
  };

  return (
    <AppShell>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-deep">
        <MobileAppNav />
        <header className="border-b border-line bg-panel px-4 py-4 lg:px-8">
          <h1 className="font-display text-2xl font-semibold text-fg">
            Paramètres agence
          </h1>
          <p className="mt-1 text-sm text-fg-muted">
            Configurez une fois — toutes vos exports suivront votre identité.
          </p>
        </header>

        <div className="mx-auto grid max-w-5xl gap-8 p-4 lg:grid-cols-2 lg:p-8">
          <div className="space-y-5">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-fg-subtle">
                Style par défaut
              </span>
              <select
                value={current.defaultStyle ?? "scandinave"}
                onChange={(e) => handleChange("defaultStyle", e.target.value)}
                className="input-field"
              >
                {STYLES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <span className="mb-2 block text-sm font-medium text-fg-subtle">
                Logo agence
              </span>
              <div className="flex items-center gap-3">
                {current.logoUrl ? (
                  <img
                    src={current.logoUrl}
                    alt="Logo"
                    className="h-12 w-12 rounded-lg border border-line object-contain bg-transparent p-1"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-line">
                    <ImageIcon className="h-5 w-5 text-fg-subtle" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={logoUploading}
                  className="btn-secondary text-sm disabled:opacity-50"
                >
                  {logoUploading ? "Envoi…" : "Téléverser"}
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>
              {logoError && (
                <p className="mt-2 text-xs text-red-400">{logoError}</p>
              )}
              {logoSuccess && !logoError && (
                <p className="mt-2 text-xs text-estate-stone-light">
                  Logo enregistré.
                </p>
              )}
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-fg-subtle">
                Opacité logo ({Math.round((current.logoOpacity ?? 0.15) * 100)}
                %)
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={current.logoOpacity ?? 0.15}
                onChange={(e) =>
                  handleChange("logoOpacity", Number(e.target.value))
                }
                className="w-full"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-fg-subtle">
                Position du filigrane
              </span>
              <select
                value={current.watermarkPosition ?? "bottom-right"}
                onChange={(e) =>
                  handleChange("watermarkPosition", e.target.value)
                }
                className="input-field"
              >
                {WATERMARK_POSITIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-fg-subtle">
                Signature photo
              </span>
              <input
                type="text"
                value={current.photoSignature ?? ""}
                onChange={(e) => handleChange("photoSignature", e.target.value)}
                placeholder="Agence Dupont — 01 23 45 67 89"
                className="input-field"
              />
              <TypographyControls
                prefix="signature"
                label="Signature"
                current={current}
                onChange={handleChange}
                sizeMin={10}
                sizeMax={48}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-fg-subtle">
                Mentions légales
              </span>
              <textarea
                value={current.legalMentions ?? ""}
                onChange={(e) => handleChange("legalMentions", e.target.value)}
                placeholder="Photos virtuellement meublées — non contractuel"
                rows={3}
                className="input-field"
              />
              <TypographyControls
                prefix="legal"
                label="Mentions"
                current={current}
                onChange={handleChange}
                sizeMin={8}
                sizeMax={32}
              />
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || loading}
                className="btn-primary"
              >
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
              <button
                type="button"
                onClick={generatePreview}
                className="btn-secondary"
              >
                Aperçu export
              </button>
            </div>
          </div>

          <div className="surface-card rounded-2xl p-4">
            <h2 className="mb-3 text-sm font-semibold text-fg-subtle">
              Aperçu export
            </h2>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Aperçu export"
                className="w-full rounded-lg"
              />
            ) : (
              <p className="text-sm text-fg-muted">
                Cliquez sur « Aperçu export » pour visualiser le rendu avec
                votre branding.
              </p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
