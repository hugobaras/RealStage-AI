import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchMe } from "../api/admin";
import { useAuth } from "./AuthContext";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const { user, getIdToken } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshAdmin = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return false;
    }

    setLoading(true);
    try {
      const idToken = await getIdToken(true);
      const data = await fetchMe(idToken);
      const admin = data.admin === true || data.user?.admin === true;
      setIsAdmin(admin);
      return admin;
    } catch {
      setIsAdmin(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, getIdToken]);

  useEffect(() => {
    refreshAdmin();
  }, [refreshAdmin]);

  const value = useMemo(
    () => ({ isAdmin, loading, refreshAdmin }),
    [isAdmin, loading, refreshAdmin],
  );

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin doit être utilisé dans un AdminProvider.");
  }
  return context;
}
