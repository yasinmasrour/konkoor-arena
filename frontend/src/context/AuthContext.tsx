import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { connectSocket, disconnectSocket } from "../socket/socket";
import type { AuthUser } from "../services/authService";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (user: AuthUser, token: string) => void;
  updateUser: (user: AuthUser) => void;
  logout: () => void;
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
      setToken(savedToken);
      connectSocket(savedToken);
    }
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const login = (nextUser: AuthUser, nextToken: string) => {
    setUser(nextUser); setToken(nextToken);
    localStorage.setItem("token", nextToken);
    localStorage.setItem("user", JSON.stringify(nextUser));
    connectSocket(nextToken);
  };

  const updateUser = (nextUser: AuthUser) => {
    setUser(nextUser);
    localStorage.setItem("user", JSON.stringify(nextUser));
  };

  const logout = () => {
    disconnectSocket(); setUser(null); setToken(null);
    localStorage.removeItem("token"); localStorage.removeItem("user");
  };

  return <AuthContext.Provider value={{ user, token, loading, login, updateUser, logout }}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
