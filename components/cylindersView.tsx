"use client";

import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const apiUrl = process.env.NEXT_PUBLIC_CARFNDR_API_URL;

// Función para obtener los cylinders con paginación
async function fetchCylinders(page: number, limit: number, token: string) {
  const response = await fetch(
    `${apiUrl}/cylindersList?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorDetails = await response.text();
    console.error("Fetch error details:", errorDetails);
    throw new Error(`Error fetching data: ${response.status} - ${errorDetails}`);
  }
  const data = await response.json();
  return data;
}

// Función para crear un cylinder
async function createCylinder(cylinder: string, token: string) {
  const response = await fetch(`${apiUrl}/create-cylinders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ cylinders: cylinder }),
  });

  const data = await response.json();
  return data;
}

interface Cylinder {
  id: number;
  cylinders: string;
}

interface CylindersViewProps {
  role: string; // User role
  token: string; // Authentication token
}

export default function CylindersView({ role, token }: CylindersViewProps) {
  const [cylinders, setCylinders] = useState<Cylinder[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(12);
  const [newCylinder, setNewCylinder] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const getCylinders = async () => {
      try {
        const data = await fetchCylinders(currentPage, limit, token);
        console.log("Fetched Cylinders:", data);
        setCylinders(data.items);  // Verifica que los datos se están guardando
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching cylinders:", error);
        setErrorMessage("Failed to load cylinders. Please try again.");
      }
    };

    getCylinders();
  }, [currentPage, limit, token]);

  const handleCreateCylinder = async () => {
    if (!newCylinder.trim()) {
      setErrorMessage("Please enter a valid cylinder name.");
      return;
    }

    try {
      const result = await createCylinder(newCylinder, token);
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setErrorMessage("");
        const updatedCylinders = [...cylinders, result.cylinder].sort((a, b) =>
          a.cylinders.localeCompare(b.cylinders)
        );
        setCylinders(updatedCylinders);
        setNewCylinder("");
        setIsDialogOpen(false);
        toast({
          description: "Cylinder successfully added.",
        });
      }
    } catch (error) {
      console.error("Error creating cylinder:", error);
      setErrorMessage("Failed to create cylinder.");
    }
  };

  return (
    <div>
      <div className="flex justify-between">
        <div className="pb-4 text-xl">Cylinders</div>
        <div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger>
              <Button size="sm">Add</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Cylinder</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                Enter a new cylinder to add to the system.
              </DialogDescription>
              <Input
                type="text"
                placeholder="Enter the cylinder name"
                value={newCylinder}
                onChange={(e) => setNewCylinder(e.target.value)}
              />
              {errorMessage && (
                <p className="text-sm text-red-400">{errorMessage}</p>
              )}
              <DialogFooter>
                <Button onClick={handleCreateCylinder}>Create Cylinder</Button>
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
              <TableHead>Cylinder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cylinders?.length > 0 ? (
              cylinders.map((cylinder) => (
                <TableRow key={cylinder.id}>
                  <TableCell>{cylinder.id}</TableCell>
                  <TableCell>{cylinder.cylinders}</TableCell>
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
  );
}
