"use client"

import { useEffect, useState } from "react"

import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { DialogFooter } from "./ui/dialog"

const apiUrl = process.env.NEXT_PUBLIC_CARFNDR_API_URL

// Fetch roles for the select
async function fetchRoles(token: string) {
  const response = await fetch(`${apiUrl}/list-roles`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const errorDetails = await response.text()
    throw new Error(`Error fetching roles: ${errorDetails}`)
  }

  const data = await response.json()
  return data.roles
}

// Function to create a user
async function createUser(userDetails: any, token: string) {
  try {
    const response = await fetch(`${apiUrl}/create-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userDetails),
    })

    if (!response.ok) {
      const errorDetails = await response.json()
      throw new Error(errorDetails.error || "Failed to create user.")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

interface CreateUserFormProps {
  token: string
  onClose: () => void
  onUserCreated: () => void // Nueva prop para manejar la recarga
}

export default function CreateUserForm({
  token,
  onClose,
  onUserCreated
}: CreateUserFormProps) {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [roleId, setRoleId] = useState<number | null>(null)
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([])
  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(false) // Declaración de estado para loading

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const rolesData = await fetchRoles(token)
        setRoles(rolesData)
      } catch (error) {
        console.error("Error fetching roles:", error)
        setErrorMessage("Failed to load roles.")
      }
    }
    loadRoles()
  }, [token])

  const handleCreateUser = async () => {
    // Reset de mensajes de error
    setErrorMessage("")

    // Validación de campos
    if (!username || !email || !password || !confirmPassword || !roleId) {
      setErrorMessage("Please fill in all fields.")
      return
    }

    // Validación de contraseñas coincidentes
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.")
      return
    }

    // Crear el payload del usuario
    const userDetails = {
      username,
      email,
      password,
      confirmPassword: confirmPassword,
      role_id: roleId,
      status_id: 1,
    }

    setLoading(true) // Activar estado de carga

    try {
      // Llamar a la función para crear el usuario
      const result = await createUser(userDetails, token)

      // Mostrar el toast con la API Key si existe en la respuesta
      if (result.api_key) {
        toast({
          description: `User created successfully. API Key: ${result.api_key}`,
        })
      } else {
        toast({
          description: "User created successfully.",
        })
      }

      // Reset de campos tras la creación exitosa
      setUsername("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setRoleId(null)

      onUserCreated()

      // Cerrar el diálogo
      onClose()
    } catch (error: any) {
      console.error("Error creating user:", error)
      // Manejar el error específico del servidor
      setErrorMessage(error.message || "Failed to create user.")
    } finally {
      setLoading(false) // Desactivar estado de carga
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading}
      />
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
      <Input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={loading}
      />
      <Select
        onValueChange={(value) => setRoleId(parseInt(value))}
        disabled={loading}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Role" />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.id} value={role.id.toString()}>
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
      <DialogFooter>
        <Button onClick={handleCreateUser} disabled={loading}>
          {loading ? "Creating..." : "Add User"}
        </Button>
      </DialogFooter>
    </div>
  )
}
