// @/components/yearsView.tsx
"use client"

import { useEffect, useState } from "react"

import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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

async function fetchYears(page: number, limit: number, token: string) {
  const response = await fetch(
    `${apiUrl}/yearsList?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  )

  console.log("Response status:", response.status)

  if (!response.ok) {
    const errorDetails = await response.text()
    console.error("Fetch error details:", errorDetails)
    throw new Error(`Error fetching data: ${response.status} - ${errorDetails}`)
  }

  const data = await response.json()
  return data
}

async function createYear(year: number, token: string) {
  const response = await fetch(`${apiUrl}/v1/create-year`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ year }),
  })

  const data = await response.json()
  return data
}

interface Year {
  id: number
  year: number
}

interface YearsViewProps {
  role: string // User role
  token: string // Authentication token
}

export default function YearsView({ role, token }: YearsViewProps) {
  const [years, setYears] = useState<Year[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [limit] = useState(12)
  const [newYear, setNewYear] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const getYears = async () => {
      try {
        const data = await fetchYears(currentPage, limit, token)
        setYears(data.items)
        setTotalPages(data.totalPages)
      } catch (error) {}
    }

    getYears()
  }, [currentPage, limit, token])

  const handleCreateYear = async () => {
    if (!newYear || isNaN(Number(newYear))) {
      setErrorMessage("Please enter a valid year.")
      return
    }

    try {
      console.log("Creating year with token:", token)
      const result = await createYear(Number(newYear), token)
      if (result.error) {
        setErrorMessage(result.error)
      } else {
        setErrorMessage("")
        const updatedYears = [...years, result.year]
        updatedYears.sort((a, b) => b.year - a.year)
        setYears(updatedYears)
        setNewYear("")
        setIsDialogOpen(false)
        toast({
          description: "Year successfully added.",
        })
      }
    } catch (error) {
      console.error("Error creating year:", error)
      setErrorMessage("Failed to create year.")
    }
  }

  return (
    <div>
      <div className="flex justify-between">
        <div className="pb-4 text-xl">Years</div>
        {role === "admin" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">Add</Button>
            </DialogTrigger>
            <DialogContent className="min-w-fit">
              <DialogHeader>
                <DialogTitle>Add Year</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                Enter a new year to add to the system.
              </DialogDescription>
              <Input
                type="number"
                placeholder="Enter the year"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
              />
              {errorMessage && (
                <p className="text-sm text-red-400">{errorMessage}</p>
              )}
              <DialogFooter>
                <Button onClick={handleCreateYear}>Save Year</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table className="mt-0 w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Year</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {years?.length > 0 ? (
              years.map((year) => (
                <TableRow key={year.id}>
                  <TableCell>{year.id}</TableCell>
                  <TableCell>{year.year}</TableCell>
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
