import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function Drawer({
  open,
  onClose,
  title,
  children,
  side = "left",
  widthClass = "w-72 max-w-[85vw]",
}) {
  const panelRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    triggerRef.current = document.activeElement;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      panelRef.current?.querySelector("button, a, input")?.focus();
    }, 50);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      window.clearTimeout(timer);
      triggerRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const slideFrom =
    side === "left"
      ? "left-0 animate-[slide-in-left_0.25s_ease-out]"
      : "right-0 animate-[slide-in-right_0.25s_ease-out]";

  return (
    <div className="fixed inset-0 z-50 flex" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Fermer le menu"
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex h-full ${widthClass} flex-col border-line/80 bg-panel shadow-2xl ${slideFrom} ${side === "left" ? "border-r" : "border-l ml-auto"}`}
      >
        {title && (
          <div className="flex shrink-0 items-center justify-between border-b border-line/80 px-4 py-3">
            <h2 className="text-sm font-semibold text-fg">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-fg-muted transition hover:bg-elevated hover:text-fg"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </aside>
    </div>
  );
}
