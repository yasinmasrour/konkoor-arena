import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { connectSocket, disconnectSocket } from "../socket/socket";

interface User {
  id: string;

  firstName: string;

  lastName: string;

  email: string;

  role: string;
}

interface AuthContextType {
  user: User | null;

  token: string | null;

  loading: boolean;

  login: (user: User, token: string) => void;

  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);

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

    if (savedUser) {
       
      setUser(JSON.parse(savedUser));
    }

     
    setLoading(false);
  }, []);

  const login = (user: User, token: string) => {
    setUser(user);

    setToken(token);

    localStorage.setItem("token", token);

    localStorage.setItem("user", JSON.stringify(user));

    connectSocket(token);
  };

  const logout = () => {
    disconnectSocket();

    setUser(null);

    setToken(null);

    localStorage.removeItem("token");

    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
