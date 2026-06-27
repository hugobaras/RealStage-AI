import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AdminProvider } from "./contexts/AdminContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { CatalogProvider } from "./hooks/useCatalog.jsx";
import AuthPage from "./components/AuthPage";
import LandingPage from "./components/landing/LandingPage";
import MainLayout from "./components/MainLayout";
import PricingPage from "./components/PricingPage";
import AgencySettingsPage from "./components/AgencySettingsPage";
import UserSettingsPage from "./components/UserSettingsPage";
import AdminLayout from "./components/admin/AdminLayout";
import AdminRoute from "./components/admin/AdminRoute";
import AdminDashboardPage from "./components/admin/AdminDashboardPage";
import AdminUsersPage from "./components/admin/AdminUsersPage";
import AdminUserDetailPage from "./components/admin/AdminUserDetailPage";
import AdminReportsPage from "./components/admin/AdminReportsPage";
import AdminGenerationsPage from "./components/admin/AdminGenerationsPage";
import AdminCatalogPage from "./components/admin/AdminCatalogPage";
import AdminAuditPage from "./components/admin/AdminAuditPage";
import AdminStripePage from "./components/admin/AdminStripePage";
import AdminSearchPage from "./components/admin/AdminSearchPage";
import AdminBlacklistPage from "./components/admin/AdminBlacklistPage";
import AdminAgenciesPage from "./components/admin/AdminAgenciesPage";
import AdminPlatformPage from "./components/admin/AdminPlatformPage";
import AdminAdminsPage from "./components/admin/AdminAdminsPage";
import AdminNotificationsPage from "./components/admin/AdminNotificationsPage";
import AdminTuningLabPage from "./components/admin/AdminTuningLabPage";
import AdminMarketingPage from "./components/admin/AdminMarketingPage";
import AdminAnnouncementsPage from "./components/admin/AdminAnnouncementsPage";
import {
  PropertiesListPage,
  default as PropertyWorkspacePage,
} from "./components/PropertiesPage";
import ChatWidget from "./components/ChatWidget";

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
      <AdminProvider>
        <CatalogProvider>
          <div className="app-themed flex h-[100dvh] flex-col overflow-hidden lg:h-screen">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <Routes>
                <Route path="/" element={<MainLayout />} />
                <Route path="/properties" element={<PropertiesListPage />} />
                <Route
                  path="/properties/:id"
                  element={<PropertyWorkspacePage />}
                />
                <Route path="/settings" element={<UserSettingsPage />} />
                <Route
                  path="/settings/agency"
                  element={<AgencySettingsPage />}
                />
                <Route path="/pricing" element={<PricingPage />} />
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route
                      path="users/:uid"
                      element={<AdminUserDetailPage />}
                    />
                    <Route path="reports" element={<AdminReportsPage />} />
                    <Route
                      path="generations"
                      element={<AdminGenerationsPage />}
                    />
                    <Route path="catalog" element={<AdminCatalogPage />} />
                    <Route path="audit" element={<AdminAuditPage />} />
                    <Route path="stripe" element={<AdminStripePage />} />
                    <Route path="search" element={<AdminSearchPage />} />
                    <Route path="blacklist" element={<AdminBlacklistPage />} />
                    <Route path="agencies" element={<AdminAgenciesPage />} />
                    <Route path="platform" element={<AdminPlatformPage />} />
                    <Route path="admins" element={<AdminAdminsPage />} />
                    <Route
                      path="notifications"
                      element={<AdminNotificationsPage />}
                    />
                    <Route path="tuning-lab" element={<AdminTuningLabPage />} />
                    <Route path="marketing" element={<AdminMarketingPage />} />
                    <Route
                      path="announcements"
                      element={<AdminAnnouncementsPage />}
                    />
                  </Route>
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
          <ChatWidget />
        </CatalogProvider>
      </AdminProvider>
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
