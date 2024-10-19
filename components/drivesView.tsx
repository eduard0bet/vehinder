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

// Función para obtener los drives con paginación
async function fetchDrives(page: number, limit: number, token: string) {
  const response = await fetch(
    `${apiUrl}/drivesList?page=${page}&limit=${limit}`,
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

// Función para crear un drive
async function createDrive(drive: string, token: string) {
  const response = await fetch(`${apiUrl}/create-drive`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ drive }),
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`Error creating drive: ${response.status} - ${errorDetails}`);
  }

  const data = await response.json();
  return data;
}

interface Drive {
  id: number;
  drive: string;
}

interface DrivesViewProps {
  role: string; // User role
  token: string; // Authentication token
}

export default function DrivesView({ role, token }: DrivesViewProps) {
  const [drives, setDrives] = useState<Drive[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(12);
  const [newDrive, setNewDrive] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const getDrives = async () => {
      try {
        const data = await fetchDrives(currentPage, limit, token);
        setDrives(data.items);
        setTotalPages(data.totalPages);
      } catch (error) {
        setErrorMessage("Failed to load drives. Please try again.");
        console.error(error);
      }
    };

    getDrives();
  }, [currentPage, limit, token]);

  const handleCreateDrive = async () => {
    if (!newDrive.trim()) {
      setErrorMessage("Please enter a valid drive type.");
      return;
    }

    try {
      const result = await createDrive(newDrive, token);
      if (result.error) {
        setErrorMessage(result.error);
      } else {
        setErrorMessage("");
        const updatedDrives = [...drives, result.drive].sort((a, b) =>
          a.drive.localeCompare(b.drive)
        );
        setDrives(updatedDrives);
        setNewDrive("");
        setIsDialogOpen(false);
        toast({
          description: "Drive successfully added.",
        });
      }
    } catch (error) {
      console.error("Error creating drive:", error);
      setErrorMessage("Failed to create drive.");
    }
  };

  return (
    <div>
      <div className="flex justify-between">
        <div className="pb-4 text-xl">Drives</div>
        <div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger>
              <Button size="sm">Add</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Drive</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                Enter a new drive type to add to the system.
              </DialogDescription>
              <Input
                type="text"
                placeholder="Enter the drive type"
                value={newDrive}
                onChange={(e) => setNewDrive(e.target.value)}
              />
              {errorMessage && (
                <p className="text-sm text-red-400">{errorMessage}</p>
              )}
              <DialogFooter>
                <Button onClick={handleCreateDrive}>Create Drive</Button>
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
              <TableHead>Drive</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drives?.length > 0 ? (
              drives.map((drive) => (
                <TableRow key={drive.id}>
                  <TableCell>{drive.id}</TableCell>
                  <TableCell>{drive.drive}</TableCell>
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
