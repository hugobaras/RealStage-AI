import { createContext, useContext, useMemo } from "react";
import { useLocation } from "react-router-dom";

const SidebarContext = createContext(null);

function isEditorPath(pathname) {
  return pathname === "/" || /^\/properties\/[^/]+$/.test(pathname);
}

export function SidebarProvider({ children }) {
  const location = useLocation();
  const isEditor = isEditorPath(location.pathname);

  const value = useMemo(() => ({ isEditor }), [isEditor]);

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar doit être utilisé dans un SidebarProvider.");
  }
  return context;
}
