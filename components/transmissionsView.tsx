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

// Función para obtener las transmisiones con paginación
async function fetchTransmissions(page: number, limit: number, token: string) {
  const response = await fetch(
    `${apiUrl}/transmissionsList?page=${page}&limit=${limit}`,
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
    throw new Error(
      `Error fetching data: ${response.status} - ${errorDetails}`
    );
  }
  const data = await response.json();
  return data;
}

// Función para crear una transmisión
async function createTransmission(trany: string, token: string) {
  const response = await fetch(`${apiUrl}/create-transmission`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ trany }),
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(
      `Error creating transmission: ${response.status} - ${errorDetails}`
    );
  }

  const data = await response.json();
  return data;
}

interface Transmission {
  id: number;
  trany: string;
}

interface TransmissionsViewProps {
  role: string; // User role
  token: string; // Authentication token
}

export default function TransmissionsView({
  role,
  token,
}: TransmissionsViewProps) {
  const [transmissions, setTransmissions] = useState<Transmission[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(12);
  const [newTransmission, setNewTransmission] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const getTransmissions = async () => {
      try {
        const data = await fetchTransmissions(currentPage, limit, token);
        setTransmissions(data.items);
        setTotalPages(data.totalPages);
      } catch (error) {
        setErrorMessage("Failed to load transmissions. Please try again.");
        console.error(error);
      }
    };

    getTransmissions();
  }, [currentPage, limit, token]);

  const handleCreateTransmission = async () => {
    if (!newTransmission.trim()) {
      setErrorMessage("Please enter a valid transmission name.");
      return;
    }

    try {
      const result = await createTransmission(newTransmission, token);
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setErrorMessage("");
        const updatedTransmissions = [
          ...transmissions,
          result.transmission,
        ].sort((a, b) => a.trany.localeCompare(b.trany));
        setTransmissions(updatedTransmissions);
        setNewTransmission("");
        setIsDialogOpen(false);
        toast({
          description: "Transmission successfully added.",
        });
      }
    } catch (error) {
      console.error("Error creating transmission:", error);
      setErrorMessage("Failed to create transmission.");
    }
  };

  return (
    <div>
      <div className="flex justify-between">
        <div className="pb-4 text-xl">Transmissions</div>
        <div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger>
              <Button size="sm">Add</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Transmission</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                Enter a new transmission to add to the system.
              </DialogDescription>
              <Input
                type="text"
                placeholder="Enter the transmission type"
                value={newTransmission}
                onChange={(e) => setNewTransmission(e.target.value)}
              />
              {errorMessage && (
                <p className="text-sm text-red-400">{errorMessage}</p>
              )}
              <DialogFooter>
                <Button onClick={handleCreateTransmission}>
                  Create Transmission
                </Button>
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
              <TableHead>Transmission</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transmissions?.length > 0 ? (
              transmissions.map((transmission) => (
                <TableRow key={transmission.id}>
                  <TableCell>{transmission.id}</TableCell>
                  <TableCell>{transmission.trany}</TableCell>
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
