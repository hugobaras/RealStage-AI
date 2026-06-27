import { useEffect, useState } from "react";
import { fetchCatalogSection } from "../api/config";

export default function AnnouncementBanner() {
  const [item, setItem] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCatalogSection("announcements");
        const items = data?.items ?? [];
        const now = Date.now();
        const active = items.find((a) => {
          const start = a.startsAt ? new Date(a.startsAt).getTime() : 0;
          const end = a.endsAt ? new Date(a.endsAt).getTime() : Infinity;
          return now >= start && now <= end;
        });
        if (active) {
          const key = `ann_dismiss_${active.id}`;
          if (active.dismissible && localStorage.getItem(key)) return;
          setItem(active);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  if (!item || dismissed) return null;

  const dismiss = () => {
    if (item.dismissible) {
      localStorage.setItem(`ann_dismiss_${item.id}`, "1");
    }
    setDismissed(true);
  };

  return (
    <div className="shrink-0 border-b border-accent/30 bg-accent/10 px-4 py-2 text-center text-sm text-fg">
      {item.message}
      {item.dismissible && (
        <button
          type="button"
          onClick={dismiss}
          className="ml-3 text-accent-light hover:underline"
        >
          Fermer
        </button>
      )}
    </div>
  );
}
