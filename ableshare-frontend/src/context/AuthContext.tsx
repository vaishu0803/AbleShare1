import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type User = {
  id: number;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Restore session on refresh
useEffect(() => {
  const fetchMe = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        credentials: "include",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();

      if (data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  fetchMe();
}, []);


  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
  await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
    credentials: "include",
  });
  setUser(null);
};


  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
