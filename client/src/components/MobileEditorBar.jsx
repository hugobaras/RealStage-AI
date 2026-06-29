import { SlidersHorizontal } from "lucide-react";
import { GenerateActionButtons } from "./ControlPanel";

export default function MobileEditorBar({
  onOpenControls,
  active = false,
  generateActions,
}) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line/80 bg-panel/95 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] backdrop-blur-xl md:hidden"
      aria-label="Actions éditeur"
      style={{
        minHeight:
          "calc(var(--layout-mobile-bar-height) + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <button
        type="button"
        onClick={onOpenControls}
        className={`flex h-[var(--layout-mobile-bar-param-height)] w-full items-center justify-center gap-2 text-sm font-semibold transition ${
          active
            ? "bg-accent/10 text-accent-light"
            : "text-fg hover:bg-elevated/50"
        }`}
        aria-expanded={active}
      >
        <SlidersHorizontal className="h-4 w-4" strokeWidth={2} />
        Paramètres
      </button>

      {generateActions && (
        <div className="px-3 py-2">
          <GenerateActionButtons
            {...generateActions}
            horizontal
            hideEmptyHint
          />
        </div>
      )}
    </nav>
  );
}
