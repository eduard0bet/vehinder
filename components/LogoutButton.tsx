// components/LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // Elimina el token de las cookies
    Cookies.remove("token");

    // Redirige al usuario a la página de inicio de sesión o a la página principal
    router.push("/auth/login");
  };

  return (
    <Button onClick={handleLogout} size="sm" variant="ghost">
      Logout
    </Button>
  );
}
