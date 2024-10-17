// context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

interface AuthContextProps {
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = Cookies.get("token");
    setIsLoggedIn(!!token);
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    Cookies.set("token", token, { expires: 1, sameSite: "Strict" });
    setIsLoggedIn(true);
    window.location.href = "/dashboard";
  };

  const logout = () => {
    Cookies.remove("token");
    setIsLoggedIn(false);
    window.location.href = "/auth/login";
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
