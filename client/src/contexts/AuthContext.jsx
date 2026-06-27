import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { auth, firebaseConfigured } from "../firebase/config";

const AuthContext = createContext(null);

function mapAuthError(code) {
  const messages = {
    "auth/email-already-in-use": "Cette adresse e-mail est déjà utilisée.",
    "auth/invalid-email": "Adresse e-mail invalide.",
    "auth/weak-password":
      "Le mot de passe doit contenir au moins 6 caractères.",
    "auth/user-not-found": "Aucun compte avec cette adresse e-mail.",
    "auth/wrong-password": "Mot de passe incorrect.",
    "auth/invalid-credential": "Identifiants incorrects.",
    "auth/too-many-requests": "Trop de tentatives. Réessayez plus tard.",
    "auth/popup-closed-by-user": "Connexion Google annulée.",
    "auth/popup-blocked":
      "La popup a été bloquée par le navigateur. Autorisez les popups pour ce site.",
    "auth/cancelled-popup-request":
      "Une autre connexion est en cours. Fermez la popup et réessayez.",
    "auth/unauthorized-domain":
      "Ce domaine n'est pas autorisé dans Firebase. Ajoutez-le dans Console Firebase > Authentication > Paramètres > Domaines autorisés.",
    "auth/operation-not-allowed":
      "La connexion Google n'est pas activée dans Firebase (Authentication > Méthode de connexion > Google).",
    "auth/network-request-failed":
      "Erreur réseau. Vérifiez votre connexion et réessayez.",
    "auth/internal-error":
      "Erreur Firebase / Google OAuth. Vérifiez les domaines autorisés et la configuration OAuth.",
  };
  return messages[code] ?? "Une erreur est survenue. Réessayez.";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return undefined;
    }

    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
  }, []);

  const getIdToken = useCallback(async () => {
    if (!user) return null;
    return user.getIdToken();
  }, [user]);

  const signUp = useCallback(async (email, password, displayName) => {
    if (!auth) throw new Error("Firebase non configuré.");
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      if (displayName?.trim()) {
        await updateProfile(credential.user, {
          displayName: displayName.trim(),
        });
      }
      return credential.user;
    } catch (err) {
      throw new Error(mapAuthError(err.code));
    }
  }, []);

  const signIn = useCallback(async (email, password) => {
    if (!auth) throw new Error("Firebase non configuré.");
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      return credential.user;
    } catch (err) {
      throw new Error(mapAuthError(err.code));
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) throw new Error("Firebase non configuré.");
    const provider = new GoogleAuthProvider();
    try {
      const credential = await signInWithPopup(auth, provider);
      return credential.user;
    } catch (err) {
      console.error("Google sign-in:", err.code, err.message);
      throw new Error(mapAuthError(err.code));
    }
  }, []);

  const logout = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
  }, []);

  const updateDisplayName = useCallback(
    async (displayName) => {
      if (!auth || !user) throw new Error("Non connecté.");
      try {
        await updateProfile(user, {
          displayName: displayName.trim() || null,
        });
        await user.reload();
        setUser(auth.currentUser);
      } catch (err) {
        throw new Error(mapAuthError(err.code));
      }
    },
    [user],
  );

  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      if (!auth || !user) throw new Error("Non connecté.");
      if (!user.email) {
        throw new Error(
          "Impossible de modifier le mot de passe pour ce compte.",
        );
      }
      try {
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword,
        );
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
      } catch (err) {
        throw new Error(mapAuthError(err.code));
      }
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      firebaseConfigured,
      getIdToken,
      signUp,
      signIn,
      signInWithGoogle,
      logout,
      updateDisplayName,
      changePassword,
    }),
    [
      user,
      loading,
      getIdToken,
      signUp,
      signIn,
      signInWithGoogle,
      logout,
      updateDisplayName,
      changePassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider.");
  }
  return context;
}
