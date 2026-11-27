import { createContext, useContext, useEffect, useState } from "react";
import {
  clearToken,
  getCurrentUser,
  getToken,
  loginUser,
  registerUser,
  setToken,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on page refresh if a token exists
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentUser()
      .then((res) => setUser(res.data.user))
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async ({ email, password }) => {
    const res = await loginUser({ email, password });
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async ({ username, email, password }) => {
    await registerUser({ username, email, password });
    // Backend /auth/register doesn't return a token, so log in right after
    return login({ email, password });
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: Boolean(user),
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
