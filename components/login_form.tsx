"use client"

import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

// Esquema de validación de Zod
const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Inicializar el formulario con react-hook-form y zod
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:3091/v1/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await res.json()

      if (res.ok) {
        // Guardar el token en cookies en lugar de session storage
        Cookies.set("token", data.token, { expires: 1, path: "/" }) // Expira en 1 día

        // Redirigir al dashboard
        router.push("/dashboard")
      } else {
        console.error("Error en el login:", data.error || "Credenciales inválidas")
      }
    } catch (error) {
      console.error("Error del servidor:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleLogin)}
          className="w-full max-w-md space-y-4 p-4"
        >
          <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
          
          {/* Campo de Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input placeholder="Ingresa tu correo" {...field} />
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
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Contraseña" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Botón de Login */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Iniciando..." : "Iniciar sesión"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
