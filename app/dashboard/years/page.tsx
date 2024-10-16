"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

import YearsView from "@/components/yearsView";

export default function YearsPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Function to decode JWT token
  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Failed to decode JWT:", error);
      return null;
    }
  };

  useEffect(() => {
    const token = Cookies.get("token");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    const decoded = decodeJWT(token);
    if (decoded) {
      setRole(decoded.role);
      setToken(token);
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  // Display a loading state while determining the role and token
  if (!role || !token) {
    return <div>Loading...</div>;
  }

  // Only render the YearsView component if the role is "admin"
  return role === "admin" ? <YearsView role={role} token={token} /> : null;
}
