import { SidebarProvider } from "../contexts/SidebarContext";
import Sidebar from "./Sidebar";

function AppShellLayout({ children, activeMode, onModeChange }) {
  return (
    <div className="app-themed flex h-[100dvh] min-h-0 w-full flex-1 overflow-hidden lg:h-screen">
      <Sidebar activeMode={activeMode} onModeChange={onModeChange} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </div>
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
