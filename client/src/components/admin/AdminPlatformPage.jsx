import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { fetchAdminPlatform, updateAdminPlatform } from "../../api/admin";

export default function AdminPlatformPage() {
  const { getIdToken } = useAuth();
  const [platform, setPlatform] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    (async () => {
      const idToken = await getIdToken();
      const data = await fetchAdminPlatform(idToken);
      setPlatform(data.platform);
    })();
  }, [getIdToken]);

  const save = async () => {
    const idToken = await getIdToken();
    await updateAdminPlatform(idToken, platform);
    setMessage("Configuration plateforme enregistrée.");
  };

  if (!platform) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-accent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold text-fg">Plateforme</h2>
      {message && <p className="text-sm text-emerald-300">{message}</p>}
      <label className="flex items-center gap-2 text-sm text-fg">
        <input
          type="checkbox"
          checked={platform.maintenance?.enabled ?? false}
          onChange={(e) =>
            setPlatform({
              ...platform,
              maintenance: {
                ...platform.maintenance,
                enabled: e.target.checked,
              },
            })
          }
        />
        Mode maintenance
      </label>
      <input
        value={platform.maintenance?.message ?? ""}
        onChange={(e) =>
          setPlatform({
            ...platform,
            maintenance: { ...platform.maintenance, message: e.target.value },
          })
        }
        placeholder="Message maintenance"
        className="w-full rounded-xl border border-line bg-elevated px-3 py-2 text-sm text-fg"
      />
      <h3 className="font-semibold text-fg">Modèles Fal</h3>
      {["staging", "declutter", "replace"].map((key) => (
        <input
          key={key}
          value={platform.falModels?.[key] ?? ""}
          onChange={(e) =>
            setPlatform({
              ...platform,
              falModels: { ...platform.falModels, [key]: e.target.value },
            })
          }
          placeholder={`Modèle ${key}`}
          className="w-full rounded-xl border border-line bg-elevated px-3 py-2 text-sm text-fg"
        />
      ))}
      <button
        type="button"
        onClick={save}
        className="rounded-xl bg-accent px-4 py-2 text-sm text-white"
      >
        Enregistrer
      </button>
    </div>
  );
}
