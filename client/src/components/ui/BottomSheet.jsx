import { useEffect, useRef, useState } from "react";

const SNAP_HEIGHTS = {
  half: "45vh",
  full: "88vh",
};

export default function BottomSheet({
  open,
  onClose,
  title,
  children,
  defaultSnap = "half",
}) {
  const panelRef = useRef(null);
  const triggerRef = useRef(null);
  const [snap, setSnap] = useState(defaultSnap);

  useEffect(() => {
    if (open) setSnap(defaultSnap);
  }, [open, defaultSnap]);

  useEffect(() => {
    if (!open) return;

    triggerRef.current = document.activeElement;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      triggerRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const height = SNAP_HEIGHTS[snap] ?? SNAP_HEIGHTS.half;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-label="Fermer"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ height, maxHeight: "calc(100dvh - env(safe-area-inset-top, 0px) - 1rem)" }}
        className="relative flex flex-col rounded-t-2xl border border-line/80 bg-panel shadow-2xl animate-[slide-up_0.3s_ease-out]"
      >
        <div className="flex shrink-0 flex-col items-center border-b border-line/60 px-4 pb-2 pt-3">
          <button
            type="button"
            onClick={() => setSnap((s) => (s === "half" ? "full" : "half"))}
            className="mb-2 h-1 w-10 rounded-full bg-line"
            aria-label={snap === "half" ? "Agrandir" : "Réduire"}
          />
          {title && (
            <h2 className="w-full text-center text-sm font-semibold text-fg">
              {title}
            </h2>
          )}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pb-[env(safe-area-inset-bottom)]">
          {children}
        </div>
      </div>
    </div>
  );
}
