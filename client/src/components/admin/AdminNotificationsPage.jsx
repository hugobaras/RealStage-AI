import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  fetchAdminNotifications,
  updateAdminNotifications,
  sendTestAdminEmail,
  fetchAdminEmailTemplates,
} from "../../api/admin";

export default function AdminNotificationsPage() {
  const { getIdToken } = useAuth();
  const [config, setConfig] = useState(null);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    (async () => {
      const idToken = await getIdToken();
      const [notif, tpl] = await Promise.all([
        fetchAdminNotifications(idToken),
        fetchAdminEmailTemplates(idToken),
      ]);
      setConfig(notif.config);
      setTemplates(tpl.templates);
    })();
  }, [getIdToken]);

  const save = async () => {
    const idToken = await getIdToken();
    await updateAdminNotifications(idToken, config);
  };

  if (!config) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold text-fg">Notifications admin</h2>
      <input
        value={(config.emails ?? []).join(", ")}
        onChange={(e) =>
          setConfig({
            ...config,
            emails: e.target.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          })
        }
        placeholder="E-mails admin (séparés par virgule)"
        className="w-full rounded-xl border border-line bg-elevated px-3 py-2 text-sm text-fg"
      />
      <input
        value={config.slackWebhookUrl ?? ""}
        onChange={(e) =>
          setConfig({ ...config, slackWebhookUrl: e.target.value })
        }
        placeholder="URL webhook Slack"
        className="w-full rounded-xl border border-line bg-elevated px-3 py-2 text-sm text-fg"
      />
      <button
        type="button"
        onClick={save}
        className="rounded-xl bg-accent px-4 py-2 text-sm text-white"
      >
        Enregistrer
      </button>
      <div>
        <h3 className="mb-2 font-semibold text-fg">
          E-mails transactionnels (test)
        </h3>
        <div className="flex flex-wrap gap-2">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={async () => {
                const idToken = await getIdToken();
                await sendTestAdminEmail(idToken, t.id);
              }}
              className="rounded-lg bg-elevated px-3 py-1.5 text-xs text-fg"
            >
              {t.id}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
