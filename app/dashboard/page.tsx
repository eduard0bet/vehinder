"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import DashboardClient from "@/components/DashboardClient";

export default function Dashboard() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  // Función para decodificar el token JWT
  const decodeJWT = (token: string) => {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  };

  useEffect(() => {
    const token = Cookies.get("token");

    if (!token) {
      // Si no hay token, redirigir al login
      router.push("/auth/login");
    } else {
      // Decodificar el token y obtener el rol
      const decoded = decodeJWT(token);
      setRole(decoded.role);
    }
  }, [router]);

  if (!role) {
    return <p>Cargando...</p>; // Puedes mostrar un loader mientras se carga el estado
  }

  return <DashboardClient role={role} />;
}
