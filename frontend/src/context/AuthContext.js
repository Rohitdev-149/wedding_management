import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import authService from "../services/authService";
import {
  preloadCriticalRoutes,
  preloadRoleSpecificRoutes,
} from "../utils/routePreloader";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          // Preload role-specific routes
          preloadRoleSpecificRoutes(currentUser.role);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
        // Start preloading critical routes after auth is complete
        preloadCriticalRoutes();
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);
    setUser(response.data.user);
    return response;
  }, []);

  const register = useCallback(async (userData) => {
    const response = await authService.register(userData);
    console.log("Register response:", response);
    console.log("Register response.data:", response.data);
    console.log("Setting user to:", response.data.user);
    setUser(response.data.user);
    return response;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(userData);
  }, []);

  // Memoize value to prevent unnecessary re-renders of children
  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      updateUser,
      isAuthenticated: !!user,
    }),
    [user, loading, login, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
