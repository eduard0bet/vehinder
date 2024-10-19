"use client"

import { useEffect, useState } from "react"
import { RotateCcw } from "lucide-react"

import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
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

import VehicleSelects from "./VehicleSelects"

const apiUrl = process.env.NEXT_PUBLIC_CARFNDR_API_URL

// Función para obtener vehículos
async function fetchVehicles(
  page: number,
  limit: number,
  token: string,
  query = ""
) {
  const endpoint = query
    ? `${apiUrl}/vehicleSearch?query=${encodeURIComponent(query)}`
    : `${apiUrl}/vehicleList?page=${page}&limit=${limit}`

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const errorDetails = await response.text()
    console.error("Fetch error details:", errorDetails)
    throw new Error(`Error fetching data: ${response.status} - ${errorDetails}`)
  }

  const data = await response.json()
  return data
}

// Función para crear un vehículo
async function createVehicle(
  vehicleData: {
    make_id: number
    model_id: number
    year_id: number
    trim_id: number
  },
  token: string
) {
  const response = await fetch(`${apiUrl}/create-vehicle`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(vehicleData),
  })

  const data = await response.json()
  return data
}

interface Vehicle {
  vehicle_id: number
  make: string
  model: string
  year: number
  trim: string
}

interface VehiclesViewProps {
  role: string
  token: string
}

export default function VehiclesView({ role, token }: VehiclesViewProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit] = useState(12)
  const [query, setQuery] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [errorMessageSearch, setErrorMessageSearch] = useState<string | null>(
    null
  )

  const [selection, setSelection] = useState<{
    yearId: number | null
    brandId: number | null
    modelId: number | null
    trimId: number | null
  }>({
    yearId: null,
    brandId: null,
    modelId: null,
    trimId: null,
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const getVehicles = async () => {
      try {
        const data = await fetchVehicles(currentPage, limit, token, query)
        setVehicles(data.items)
        setTotalPages(data.totalPages || 1)
        setErrorMessageSearch(
          data.items.length === 0 ? "No results found" : null
        )
      } catch (error) {
        console.error("Error fetching vehicles:", error)
        setErrorMessageSearch("An error occurred while fetching vehicles.")
      }
    }

    getVehicles()
  }, [currentPage, limit, token, query])

  const handleCreateVehicle = async () => {
    const { yearId, brandId, modelId, trimId } = selection
    if (!yearId || !brandId || !modelId || !trimId) {
      setErrorMessage("Please select all fields.")
      return
    }

    try {
      const result = await createVehicle(
        {
          make_id: brandId!,
          model_id: modelId!,
          year_id: yearId!,
          trim_id: trimId!,
        },
        token
      )

      if (result.message === "Vehicle already exists") {
        setErrorMessage("Vehicle already exists")
      } else {
        setErrorMessage("")
        setIsDialogOpen(false)
        toast({
          description: "Vehicle successfully added.",
        })
        const data = await fetchVehicles(currentPage, limit, token)
        setVehicles(data.items)
      }
    } catch (error) {
      console.error("Error creating vehicle:", error)
      setErrorMessage("Failed to create vehicle.")
    }
  }

  const handleSearch = () => {
    setQuery(searchTerm)
    setCurrentPage(1)
  }

  const handleReset = () => {
    setSearchTerm("")
    setQuery("")
    setErrorMessageSearch(null)
  }

  return (
    <div>
      <div className="flex justify-between gap-2">
        <div className="mt-1 text-xl md:mr-6">Vehicles</div>
        <div className="basis-4/5 flex gap-2">
          <Input
            type="text"
            placeholder="Search by make, model, year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch}>Search</Button>
          {query && (
            <Button variant="secondary" onClick={handleReset}>
              <RotateCcw />
            </Button>
          )}
        </div>
        <div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(isOpen) => {
              setIsDialogOpen(isOpen)
              if (!isOpen) {
                setErrorMessage("")
                setSelection({
                  yearId: null,
                  brandId: null,
                  modelId: null,
                  trimId: null,
                })
              }
            }}
          >
            <DialogTrigger>
              <Button>Add</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Vehicle</DialogTitle>
              </DialogHeader>

              <VehicleSelects token={token} onSelectionChange={setSelection} />
              {errorMessage && (
                <p className="text-sm text-red-400">{errorMessage}</p>
              )}

              <DialogFooter>
                <Button onClick={handleCreateVehicle}>Create Vehicle</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="overflow-x-auto">
        {errorMessageSearch ? (
          <p>{errorMessageSearch}</p>
        ) : (
          <Table className="mt-0 w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Trim</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.vehicle_id}>
                  <TableCell>{vehicle.vehicle_id}</TableCell>
                  <TableCell>{vehicle.year}</TableCell>
                  <TableCell>{vehicle.make}</TableCell>
                  <TableCell>{vehicle.model}</TableCell>
                  <TableCell>{vehicle.trim}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
          {currentPage > 3 && (
            <>
              <PaginationItem>
                <PaginationLink href="#" onClick={() => setCurrentPage(1)}>
                  1
                </PaginationLink>
              </PaginationItem>
              <span>...</span>
            </>
          )}
          {Array.from({ length: 5 }, (_, index) => {
            const page = currentPage - 2 + index
            if (page > 0 && page <= totalPages) {
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
          {currentPage < totalPages - 2 && (
            <>
              <span>...</span>
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
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
