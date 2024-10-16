"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface AuthContextProps {
  isLoggedIn: boolean;
  role: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded) {
        setIsLoggedIn(true);
        setRole(decoded.role);
      } else {
        setIsLoggedIn(false);
        setRole(null);
      }
    }

    // Listen for custom "authChange" events to re-check the login status
    const handleAuthChange = () => {
      const updatedToken = Cookies.get("token");
      if (updatedToken) {
        const decoded = decodeJWT(updatedToken);
        setIsLoggedIn(Boolean(decoded));
        setRole(decoded?.role || null);
      } else {
        setIsLoggedIn(false);
        setRole(null);
      }
    };

    window.addEventListener("authChange", handleAuthChange);
    return () => {
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  const login = (token: string) => {
    Cookies.set("token", token);
    const decoded = decodeJWT(token);
    if (decoded) {
      setIsLoggedIn(true);
      setRole(decoded.role);
      window.dispatchEvent(new Event("authChange"));
      router.push("/dashboard");
    }
  };

  const logout = () => {
    Cookies.remove("token");
    setIsLoggedIn(false);
    setRole(null);
    window.dispatchEvent(new Event("authChange"));
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, role, login, logout }}>
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
