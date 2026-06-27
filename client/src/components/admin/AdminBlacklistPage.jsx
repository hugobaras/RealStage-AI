import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { fetchAdminBlacklist, updateAdminBlacklist } from "../../api/admin";

export default function AdminBlacklistPage() {
  const { getIdToken } = useAuth();
  const [emails, setEmails] = useState("");
  const [domains, setDomains] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const idToken = await getIdToken();
        const data = await fetchAdminBlacklist(idToken);
        setEmails((data.blacklist.emails ?? []).join("\n"));
        setDomains((data.blacklist.domains ?? []).join("\n"));
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [getIdToken]);

  const save = async () => {
    setError(null);
    try {
      const idToken = await getIdToken();
      await updateAdminBlacklist(idToken, {
        emails: emails
          .split("\n")
          .map((e) => e.trim())
          .filter(Boolean),
        domains: domains
          .split("\n")
          .map((d) => d.trim())
          .filter(Boolean),
      });
      setMessage("Liste noire enregistrée.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold text-fg">Liste noire</h2>
      {message && <p className="text-sm text-emerald-300">{message}</p>}
      {error && <p className="text-sm text-red-300">{error}</p>}
      <label className="block space-y-2">
        <span className="text-sm text-fg-muted">E-mails (un par ligne)</span>
        <textarea
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          rows={6}
          className="w-full rounded-xl border border-line bg-elevated p-3 text-sm text-fg"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm text-fg-muted">Domaines (un par ligne)</span>
        <textarea
          value={domains}
          onChange={(e) => setDomains(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-line bg-elevated p-3 text-sm text-fg"
        />
      </label>
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
