// @/components/makesView.tsx
"use client"

import { useEffect, useState } from "react"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const apiUrl = process.env.NEXT_PUBLIC_CARFNDR_API_URL

async function fetchMakes(page: number, limit: number, token: string) {
  const response = await fetch(
    `${apiUrl}/makesList?page=${page}&limit=${limit}`,
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
  return data
}

async function createMake(make: string, token: string) {
  const response = await fetch(`${apiUrl}/create-make`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ make }),
  })

  const data = await response.json()
  return data
}

interface Year {
  id: number
  make: string
}

interface YearsViewProps {
  role: string // User role
  token: string // Authentication token
}

export default function YearsView({ role, token }: YearsViewProps) {
  const [makes, setMakes] = useState<Year[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit] = useState(12)
  const [newMake, setNewMake] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const getMakes = async () => {
      try {
        const data = await fetchMakes(currentPage, limit, token)
        setMakes(data.items)
        setTotalPages(data.totalPages)
      } catch (error) {
        console.error(error)
      }
    }

    getMakes()
  }, [currentPage, limit, token])

  const handleCreateMake = async () => {
    if (!newMake.trim()) {
      setErrorMessage("Please enter a brand name.")
      return
    }

    try {
      const result = await createMake(newMake, token)
      if (result.error) {
        setErrorMessage(result.error)
      } else {
        setErrorMessage("")
        const updatedMakes = [...makes, result.make]
        updatedMakes.sort((a, b) => b.make.localeCompare(a.make)) // Ordenar alfabéticamente
        setMakes(updatedMakes)
        setNewMake("")
        setIsDialogOpen(false) // Cierra el diálogo
        toast({
          description: "Brand successfully added.", // Muestra el toast
        })
      }
    } catch (error) {
      console.error("Error creating Brand:", error)
      setErrorMessage("Failed to create Brand.")
    }
  }

  return (
    <div>
      <div className="flex justify-between">
        <div className="pb-4 text-xl">Brands</div>
        <div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger>
              <Button size="sm">Add</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Brand</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                Enter a new brand to add to the system.
              </DialogDescription>
              <Input
                type="text" // Permitir solo texto
                placeholder="Enter the brand name"
                value={newMake}
                onChange={(e) => setNewMake(e.target.value)}
              />
              {errorMessage && (
                <p className="text-sm text-red-400">{errorMessage}</p>
              )}
              <DialogFooter>
                <Button onClick={handleCreateMake}>Create Brand</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="mt-0 w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Brand</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {makes?.length > 0 ? (
              makes.map((make) => (
                <TableRow key={make.id}>
                  <TableCell>{make.id}</TableCell>
                  <TableCell>{make.make}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2}>No data available</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, index) => (
            <PaginationItem key={index}>
              <PaginationLink
                href="#"
                isActive={currentPage === index + 1}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
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
