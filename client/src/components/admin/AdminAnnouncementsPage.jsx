import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { fetchAdminConfig, updateAdminConfig } from "../../api/admin";

export default function AdminAnnouncementsPage() {
  const { getIdToken } = useAuth();
  const [jsonText, setJsonText] = useState("");

  useEffect(() => {
    (async () => {
      const idToken = await getIdToken();
      const data = await fetchAdminConfig(idToken, "announcements");
      setJsonText(JSON.stringify(data.announcements ?? { items: [] }, null, 2));
    })();
  }, [getIdToken]);

  const save = async () => {
    const idToken = await getIdToken();
    await updateAdminConfig(idToken, "announcements", JSON.parse(jsonText));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-fg">Annonces in-app</h2>
      <textarea
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        rows={16}
        className="w-full rounded-xl border border-line bg-elevated p-4 font-mono text-sm text-fg"
      />
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
