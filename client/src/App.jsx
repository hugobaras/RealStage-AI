import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import AuthPage from "./components/AuthPage";
import LandingPage from "./components/landing/LandingPage";
import MainLayout from "./components/MainLayout";
import PricingPage from "./components/PricingPage";
import AgencySettingsPage from "./components/AgencySettingsPage";
import UserSettingsPage from "./components/UserSettingsPage";
import {
  PropertiesListPage,
  default as PropertyWorkspacePage,
} from "./components/PropertiesPage";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-deep">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <SubscriptionProvider>
      <div className="app-themed h-[100dvh] overflow-hidden lg:h-screen">
        <Routes>
          <Route path="/" element={<MainLayout />} />
          <Route path="/properties" element={<PropertiesListPage />} />
          <Route path="/properties/:id" element={<PropertyWorkspacePage />} />
          <Route path="/settings" element={<UserSettingsPage />} />
          <Route path="/settings/agency" element={<AgencySettingsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </SubscriptionProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
