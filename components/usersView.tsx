"use client"

import { useEffect, useState } from "react"
import { RectangleEllipsis } from "lucide-react"

import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import ChangePasswordForm from "./ChagePasswordForm"
// Importación de Skeleton
import CreateUserForm from "./CreateUserForm"

const apiUrl = process.env.NEXT_PUBLIC_CARFNDR_API_URL

// Función para obtener los usuarios con paginación
async function fetchUsers(page: number, limit: number, token: string) {
  const response = await fetch(
    `${apiUrl}/list-users?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  )

  if (!response.ok) {
    const errorDetails = await response.text()
    console.error("Fetch error details:", errorDetails)
    throw new Error(`Error fetching data: ${response.status} - ${errorDetails}`)
  }
  const data = await response.json()
  return data.users // Acceder a la propiedad 'users' del JSON
}

// Función para crear un usuario
async function createUser(username: string, token: string) {
  const response = await fetch(`${apiUrl}/create-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ username }), // Aseguramos que se envía el campo username
  })

  if (!response.ok) {
    const errorDetails = await response.text()
    throw new Error(`Error creating user: ${response.status} - ${errorDetails}`)
  }

  const data = await response.json()
  return data
}

interface User {
  id: number
  username: string
  email: string
  role: string
  last_login: string
  status: string
}

interface UsersViewProps {
  role: string // User role
  token: string // Authentication token
}

export default function UsersView({ role, token }: UsersViewProps) {
  const [users, setUsers] = useState<User[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit] = useState(12)
  const [newUser, setNewUser] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true) // Estado para el cargador
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] =
    useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  const getUsers = async () => {
    setLoading(true) // Iniciar la carga
    try {
      const usersData = await fetchUsers(currentPage, limit, token)
      setUsers(usersData)
      setTotalPages(Math.ceil(usersData.length / limit)) // Ajuste para paginación
      setErrorMessage("") // Limpiar el mensaje de error
    } catch (error) {
      setErrorMessage("Failed to load users. Please try again.")
      console.error(error)
    }
    setLoading(false) // Finalizar la carga
  }

  useEffect(() => {
    getUsers()
  }, [currentPage, limit, token])

  const handleCreateUser = async () => {
    if (!newUser.trim()) {
      setErrorMessage("Please enter a valid username.") // Validar el nombre de usuario
      return
    }

    try {
      const result = await createUser(newUser, token)
      if (result.error) {
        setErrorMessage(result.error)
      } else {
        setErrorMessage("")
        setUsers((prevUsers) => [...prevUsers, result]) // Actualizar la lista de usuarios
        setNewUser("")
        setIsDialogOpen(false)
        toast({
          description: "User successfully added.",
        })
      }
    } catch (error) {
      console.error("Error creating user:", error)
      setErrorMessage("Failed to create user.")
    }
  }

  return (
    <div>
      <div className="flex justify-between">
        <div className="pb-4 text-xl">Users</div>
        <div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger>
              <Button size="sm">Add</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add User</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                Enter a new username to add to the system.
              </DialogDescription>
              <CreateUserForm
                token={token}
                onClose={() => setIsDialogOpen(false)}
                onUserCreated={getUsers} // Pasar la función de recarga
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <Skeleton className="h-10 w-full" /> // Mostrar cargador mientras carga
        ) : (
          <div>
            <div className="overflow-x-auto">
              <Table className="mt-0 w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>{user.status}</TableCell>
                        <TableCell>{user.last_login}</TableCell>
                        <TableCell className="p-0">
                          <Button
                            className=" "
                            onClick={() => {
                              setSelectedUserId(user.id)
                              setIsChangePasswordDialogOpen(true)
                            }}
                          >
                            Reset password
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6}>No data available</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Single Dialog Instance */}
            <Dialog
              open={isChangePasswordDialogOpen}
              onOpenChange={(isOpen) => {
                setIsChangePasswordDialogOpen(isOpen)
                if (!isOpen) setSelectedUserId(null)
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create User</DialogTitle>
                </DialogHeader>
                {selectedUserId && (
                  <ChangePasswordForm
                    userId={selectedUserId}
                    token={token}
                    onClose={() => setIsChangePasswordDialogOpen(false)}
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            />
          </PaginationItem>
          {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
            const page = Math.max(1, currentPage - 2 + index)
            if (page <= totalPages) {
              return (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === page}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            }
            return null
          })}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
