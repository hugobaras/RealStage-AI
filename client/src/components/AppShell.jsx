import { SidebarProvider } from "../contexts/SidebarContext";
import Sidebar from "./Sidebar";

function AppShellLayout({ children, activeMode, onModeChange }) {
  return (
    <div className="layout-shell app-themed">
      <Sidebar activeMode={activeMode} onModeChange={onModeChange} />
      <div className="layout-main">{children}</div>
    </div>
  );
}

export default function AppShell({ children, activeMode, onModeChange }) {
  return (
    <SidebarProvider>
      <AppShellLayout activeMode={activeMode} onModeChange={onModeChange}>
        {children}
      </AppShellLayout>
    </SidebarProvider>
  );
}
