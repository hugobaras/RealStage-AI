import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import AppMenuDrawer from "./AppMenuDrawer";
import MobileAppNav from "./MobileAppNav";

export default function SecondaryPageLayout({
  children,
  title,
  headerAction,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-deep">
        <MobileAppNav />
        {(title || headerAction) && (
          <header className="flex items-center justify-between gap-3 border-b border-line bg-panel px-3 py-3 md:px-6 md:py-4 lg:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line/80 bg-panel/50 text-fg transition hover:bg-elevated/60 md:hidden"
                aria-label="Ouvrir le menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              {title && (
                <h1 className="truncate font-display text-lg font-semibold text-fg md:text-2xl">
                  {title}
                </h1>
              )}
            </div>
            {headerAction}
          </header>
        )}
        {children}
      </div>
      <AppMenuDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        activeMode="meubler"
        onModeChange={() => navigate("/")}
      />
    </>
  );
}
