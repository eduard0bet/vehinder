"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Función manual para decodificar el token JWT
function decodeJWT(token: string) {
  const base64Url = token.split(".")[1]
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join("")
  )

  return JSON.parse(jsonPayload)
}

export default function UserNav() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [role, setRole] = useState<string | null>(null) // Estado para el rol

  useEffect(() => {
    const handleCookieChange = () => {
      const updatedToken = Cookies.get("token");
      if (updatedToken) {
        try {
          const updatedRole = decodeJWT(updatedToken).role; // Decodificar el token y verificar expiración
          setIsLoggedIn(true);
          setRole(updatedRole);
        } catch (error: any) { // Añadir tipo "any" al error
          if (error.message === "Token expired") {
            setIsLoggedIn(false);
            setRole(null);
            router.push("/auth/login");
          }
        }
      } else {
        setIsLoggedIn(false);
        setRole(null); // Resetear el rol si no hay token
      }
    };
  
    const interval = setInterval(handleCookieChange, 1000); // Verificar cambios cada segundo
  
    return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
  }, []);
  

  const handleAuthAction = () => {
    if (isLoggedIn) {
      // Eliminar la cookie del token
      Cookies.remove("token")
      router.push("/")
    } else {
      // Redirigir a la página de login
      router.push("/auth/login")
    }
  }

  return (
    <>
      <div className="flex justify-between gap-1">
        {isLoggedIn ? (
           <Link href="/dashboard">
           <Button
           size="sm"
           variant="ghost"
           className="w-full"
         >
           Dasboard
         </Button></Link>
        ) : (
          ""
        )}

        {!isLoggedIn && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAuthAction}
            className="w-full"
          >
            Login
          </Button>
        )}
      </div>
    </>
  )
}
