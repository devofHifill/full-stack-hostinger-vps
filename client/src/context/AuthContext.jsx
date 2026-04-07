import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("sebvm_token") || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("sebvm_user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("sebvm_token", token);
    } else {
      localStorage.removeItem("sebvm_token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("sebvm_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("sebvm_user");
    }
  }, [user]);

  const login = ({ token, user }) => {
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("sebvm_token");
    localStorage.removeItem("sebvm_user");
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token,
      login,
      logout,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}