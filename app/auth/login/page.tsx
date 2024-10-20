"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"

// Esquema de validación de Zod
const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)

  // Inicializar el formulario con react-hook-form y zod
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const apiUrl = process.env.NEXT_PUBLIC_CARFNDR_API_URL

  const handleLogin = async (values: { email: string; password: string }) => {
    // Verificar si ya hay una solicitud en curso
    if (loading) return

    setLoading(true)
    try {
      const res = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await res.json()

      if (res.ok) {
        login(data.token) // Establecer el token en el contexto de autenticación
        router.push("/dashboard") // Redirigir al dashboard
      } else {
        // Manejar errores del servidor o credenciales inválidas
        const errorMessage = data.error || "Credenciales inválidas"
        toast({ description: errorMessage, variant: "destructive" })
      }
    } catch (error) {
      // Mostrar mensaje de error del servidor
      toast({ description: "Error del servidor. Inténtalo de nuevo.", variant: "destructive" })
    } finally {
      setLoading(false) // Restablecer el estado de carga
    }
  }

  return (
    <div className="flex h-screen items-center justify-center px-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleLogin)}
          className="w-full max-w-md space-y-3"
        >
          <div className="py-4 flex flex-row justify-center">
            <Link href="/" className="flex items-center space-x-2 w-36">
              <svg viewBox="0 0 3.77 0.66" fill="currentColor">
                <path d="M3.6.26c.02-.02.06-.03.09-.03h.05c.01.01.03.01.03.02L3.7.36C3.69.35 3.69.35 3.68.35 3.67.34 3.66.34 3.65.34s-.03.01-.04.02S3.6.38 3.6.4v.21h-.14V.23h.14zM.24.66.25.49.1.58 0 .41.15.33 0 .25.1.08l.15.09L.24 0h.2L.42.17.57.08l.1.17-.15.08.15.08-.1.17L.43.49l.01.17zM.96.61.81.23h.14l.1.32H.99l.1-.32h.14l-.15.38zm.46.01c-.04 0-.08-.01-.11-.03a.2.2 0 0 1-.08-.07c-.01-.03-.02-.06-.02-.1s0-.07.02-.1.05-.05.08-.07.06-.03.1-.03.07.01.1.03c.03.01.05.04.07.07.02.02.03.06.03.09v.03c-.01 0-.01.01-.01.02h-.33V.38h.28l-.06.03c0-.02-.01-.03-.01-.05L1.45.33C1.44.32 1.43.32 1.41.32c-.01 0-.03 0-.04.01s-.02.02-.03.04c-.01.01-.01.03-.01.05s0 .04.01.06l.03.03c.02.01.03.01.05.01s.04 0 .05-.01c.01 0 .03-.01.04-.03l.07.07a.2.2 0 0 1-.07.05c-.03.01-.06.02-.09.02m.45-.01V.4c0-.02-.01-.03-.02-.04S1.83.34 1.82.34c-.02 0-.03 0-.03.01-.01 0-.02.01-.02.02-.01.01-.01.01-.01.03v.21h-.13V.05h.13v.21l.02-.02c.02-.01.05-.01.08-.01s.05 0 .07.01c.03.02.04.03.06.05.01.02.01.05.01.08v.24zm.17 0V.23h.14v.38zm.07-.42c-.02 0-.04-.01-.05-.02a.1.1 0 0 1-.02-.05c0-.02.01-.04.02-.05.01-.02.03-.02.05-.02s.04 0 .05.02c.01.01.02.03.02.05s-.01.04-.02.05-.03.02-.05.02m.36.42V.4c0-.02-.01-.03-.02-.04S2.43.34 2.41.34c-.01 0-.02 0-.03.01-.01 0-.01.01-.02.02v.24h-.14V.23h.14v.03c0-.01.01-.01.02-.02.02-.01.05-.01.08-.01s.05 0 .07.01c.02.02.04.03.05.05.01.03.02.05.02.08v.24zm.33.01c-.04 0-.07-.01-.1-.03-.02-.02-.05-.04-.06-.07-.02-.03-.02-.06-.02-.1s0-.07.02-.1c.01-.03.04-.05.06-.07.03-.02.06-.02.1-.02.02 0 .05 0 .07.01 0 0 .01.01.02.01v-.2h.13v.56h-.13V.59c-.01 0-.01.01-.02.01-.02.01-.05.02-.07.02M2.82.5c.02 0 .03-.01.04-.01l.03-.03c0-.01.01-.02.01-.04 0-.01-.01-.03-.01-.04L2.86.35c-.01 0-.02-.01-.04-.01-.01 0-.02.01-.03.01l-.03.03c-.01.01-.01.03-.01.04 0 .02 0 .03.01.04l.03.03c.01 0 .02.01.03.01m.44.12c-.04 0-.08-.01-.11-.03a.2.2 0 0 1-.08-.07c-.02-.03-.02-.06-.02-.1s0-.07.02-.1.04-.05.08-.07c.03-.02.06-.03.1-.03s.07.01.1.03c.03.01.05.04.07.07.02.02.03.06.03.09 0 .01-.01.02-.01.03v.02h-.33V.38h.28l-.06.03c0-.02-.01-.03-.01-.05L3.29.33C3.28.32 3.27.32 3.25.32c-.01 0-.03 0-.04.01s-.02.02-.03.04c-.01.01-.01.03-.01.05s0 .04.01.06l.03.03c.01.01.03.01.05.01s.03 0 .05-.01c.01 0 .03-.01.04-.03l.07.07a.2.2 0 0 1-.07.05c-.03.01-.06.02-.09.02" />
              </svg>
            </Link>
          </div>

          {/* Campo de Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo de Contraseña */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Botón de Login */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Iniciando..." : "Login"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
