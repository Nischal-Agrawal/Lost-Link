import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser
} from "../services/authService.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await getCurrentUser();

      setUser(response.data.user);

      return response.data.user;
    } catch {
      setUser(null);

      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const response = await getCurrentUser();

        if (mounted) {
          setUser(response.data.user);
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  const register = useCallback(async (data) => {
    const response = await registerUser(data);

    setUser(response.data.user);

    return response.data.user;
  }, []);

  const login = useCallback(async (data) => {
    const response = await loginUser(data);

    setUser(response.data.user);

    return response.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "ADMIN",
      register,
      login,
      logout,
      refreshUser
    }),
    [
      user,
      loading,
      register,
      login,
      logout,
      refreshUser
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}