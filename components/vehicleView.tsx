// @/components/vehiclesView.tsx
"use client"

import { useEffect, useState } from "react"
import { Eraser, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

async function fetchVehicles(
  page: number,
  limit: number,
  token: string,
  query = ""
) {
  const apiUrl = process.env.NEXT_PUBLIC_CARFNDR_API_URL
  const endpoint = query
    ? `${apiUrl}/vehicleSearch?query=${encodeURIComponent(query)}`
    : `${apiUrl}/vehicleList?page=${page}&limit=${limit}`

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (response.status === 404) {
    return { items: [], message: "No results found" }
  }

  if (!response.ok) {
    const errorDetails = await response.text()
    console.error("Fetch error details:", errorDetails)
    throw new Error(`Error fetching data: ${response.status} - ${errorDetails}`)
  }

  const data = await response.json()
  return data
}

interface Vehicle {
  vehicle_id: number
  make: string // Marca del vehículo
  model: string
  year: number
  trim: string
}

interface VehiclesViewProps {
  role: string // User role
  token: string // Authentication token
}

export default function VehiclesView({ role, token }: VehiclesViewProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit] = useState(24)
  const [query, setQuery] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const getVehicles = async () => {
      try {
        const data = await fetchVehicles(currentPage, limit, token, query)
        setVehicles(data.items)
        setTotalPages(data.totalPages || 1)
        setErrorMessage(data.items.length === 0 ? data.message : null)
      } catch (error) {
        console.error("Error fetching vehicles:", error)
        setErrorMessage("An error occurred while fetching vehicles.")
      }
    }

    getVehicles()
  }, [currentPage, limit, token, query])

  const handleSearch = () => {
    setQuery(searchTerm)
    setCurrentPage(1)
  }

  const handleReset = () => {
    setSearchTerm("")
    setQuery("")
    setErrorMessage(null)
  }

  return (
    <div>
      <div className="pb-4 text-xl">
        Vehicles
      </div>
      <div className="flex gap-2">
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

      <div className="overflow-x-auto">
        {errorMessage ? (
          <p>{errorMessage}</p>
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
