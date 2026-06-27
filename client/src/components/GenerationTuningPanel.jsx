import { Sparkles, Lock } from "lucide-react";
import {
  GENERATION_TUNING_DEFAULTS,
  GENERATION_TUNING_PRESETS,
  normalizeGenerationTuning,
  tuningEquals,
} from "../constants/generationTuning";

function TuningSlider({
  label,
  hint,
  value,
  minLabel,
  maxLabel,
  onChange,
  disabled,
  theme,
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <label className="text-sm text-fg-subtle">{label}</label>
          {hint && <p className="text-[10px] text-muted">{hint}</p>}
        </div>
        <span className="shrink-0 text-xs tabular-nums text-muted">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`h-1.5 w-full cursor-pointer appearance-none rounded-full bg-elevated ${theme.slider} disabled:cursor-not-allowed disabled:opacity-40`}
      />
      <div className="mt-1 flex justify-between text-[10px] text-fg-muted">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

export default function GenerationTuningPanel({
  value,
  onChange,
  disabled,
  theme,
  locked,
  onUpgradeClick,
}) {
  const tuning = normalizeGenerationTuning(value);

  const update = (patch) => {
    onChange(normalizeGenerationTuning({ ...tuning, ...patch }));
  };

  const reset = () => onChange({ ...GENERATION_TUNING_DEFAULTS });

  const isCustom = !tuningEquals(tuning, GENERATION_TUNING_DEFAULTS);

  if (locked) {
    return (
      <div className="rounded-xl border border-dashed border-line/80 bg-surface/30 px-3 py-3">
        <div className="flex items-start gap-2.5">
          <Lock className={`mt-0.5 h-4 w-4 shrink-0 ${theme.icon}`} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-fg">Réglages IA avancés</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">
              Curseurs créativité / fidélité, précision du prompt et niveau de
              détail — réservés aux forfaits Pro et Agence.
            </p>
            {onUpgradeClick && (
              <button
                type="button"
                onClick={onUpgradeClick}
                className={`mt-2 text-[11px] font-semibold ${theme.text} transition hover:text-fg`}
              >
                Passer au Pro →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className={`h-4 w-4 ${theme.icon}`} />
          <p className="text-sm font-medium text-fg">Réglages IA avancés</p>
        </div>
        {isCustom && (
          <button
            type="button"
            onClick={reset}
            disabled={disabled}
            className="text-[11px] text-fg-muted transition hover:text-fg disabled:opacity-40"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {GENERATION_TUNING_PRESETS.map((preset) => {
          const active = tuningEquals(tuning, preset.values);
          return (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              title={preset.description}
              onClick={() => onChange({ ...preset.values })}
              className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition disabled:opacity-40 ${
                active
                  ? `${theme.border} ${theme.bgSubtle} ${theme.text}`
                  : "border-line/80 text-fg-muted hover:border-line hover:text-fg"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <TuningSlider
        label="Fidélité ↔ Créativité"
        hint="Plus la créativité est haute, plus le rendu s'éloigne de la photo source."
        value={tuning.creativity}
        minLabel="Fidèle"
        maxLabel="Créatif"
        onChange={(creativity) => update({ creativity })}
        disabled={disabled}
        theme={theme}
      />
      <TuningSlider
        label="Précision du prompt"
        hint="Force l'IA à suivre strictement le style et le mobilier demandés."
        value={tuning.promptPrecision}
        minLabel="Souple"
        maxLabel="Strict"
        onChange={(promptPrecision) => update({ promptPrecision })}
        disabled={disabled}
        theme={theme}
      />
      <TuningSlider
        label="Niveau de détail"
        hint="Plus de passes de calcul pour un rendu fin (génération un peu plus longue)."
        value={tuning.detailLevel}
        minLabel="Rapide"
        maxLabel="Détaillé"
        onChange={(detailLevel) => update({ detailLevel })}
        disabled={disabled}
        theme={theme}
      />
    </div>
  );
}
