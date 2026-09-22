import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { connectSocket, disconnectSocket } from "../socket/socket";
import type { AuthUser } from "../services/authService";
import { getMyFeatures } from "../api/featureApi";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (user: AuthUser, token: string) => void;
  updateUser: (user: AuthUser) => void;
  logout: () => void;
  // 🆕
  hasFeature: (featureName: string) => boolean;
  hasExamAccess: (examId: string) => boolean;
  refreshFeatures: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(savedToken);
      connectSocket(savedToken);
    }
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const login = (nextUser: AuthUser, nextToken: string) => {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem("token", nextToken);
    localStorage.setItem("user", JSON.stringify(nextUser));
    connectSocket(nextToken);
  };

  const updateUser = (nextUser: AuthUser) => {
    setUser(nextUser);
    localStorage.setItem("user", JSON.stringify(nextUser));
  };

  const logout = () => {
    disconnectSocket();
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // 🆕 چک feature
  const hasFeature = useCallback(
    (featureName: string): boolean => {
      if (!user) return false;
      if (user.role === "ADMIN") return true;
      return user.features?.includes(featureName) ?? false;
    },
    [user],
  );

  // 🆕 چک دسترسی آزمون
  const hasExamAccess = useCallback(
    (examId: string): boolean => {
      if (!user) return false;
      if (user.role === "ADMIN") return true;
      if (user.features?.includes("exams")) return true;
      return user.examPurchases?.includes(examId) ?? false;
    },
    [user],
  );

  // 🆕 refresh features (بعد از خرید)
  const refreshFeatures = useCallback(async () => {
    if (!user) return;
    try {
      const result = await getMyFeatures();
      const updatedUser = {
        ...user,
        features: result.features,
        examPurchases: result.examPurchases,
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Failed to refresh features:", err);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        updateUser,
        logout,
        hasFeature,
        hasExamAccess,
        refreshFeatures,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
