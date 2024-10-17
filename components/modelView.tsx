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

// Función para obtener los modelos con paginación
async function fetchModels(page: number, limit: number, token: string) {
    const response = await fetch(
        `${apiUrl}/modelsList?page=${page}&limit=${limit}`,
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

// Función para crear un modelo
async function createModel(model: string, token: string) {
    const response = await fetch(`${apiUrl}/create-model`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ model }),
    })

    if (!response.ok) {
        const errorDetails = await response.text()
        throw new Error(`Error creating model: ${response.status} - ${errorDetails}`)
    }

    const data = await response.json()
    return data
}

interface Model {
    id: number
    model: string
}

interface ModelsViewProps {
    role: string // User role
    token: string // Authentication token
}

export default function ModelsView({ role, token }: ModelsViewProps) {
    const [models, setModels] = useState<Model[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [limit] = useState(12)
    const [newModel, setNewModel] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    useEffect(() => {
        const getModels = async () => {
            try {
                const data = await fetchModels(currentPage, limit, token)
                setModels(data.items)
                setTotalPages(data.totalPages)
            } catch (error) {
                setErrorMessage("Failed to load models. Please try again.")
                console.error(error)
            }
        }

        getModels()
    }, [currentPage, limit, token])

    const handleCreateModel = async () => {
        if (!newModel.trim()) {
            setErrorMessage("Please enter a valid model name.")
            return
        }

        try {
            const result = await createModel(newModel, token)
            if (result.error) {
                setErrorMessage(result.error)
            } else {
                setErrorMessage("")
                // Insertar el nuevo modelo en la lista de manera ordenada
                const updatedModels = [...models, result.model].sort((a, b) =>
                    a.model.localeCompare(b.model)
                )
                setModels(updatedModels)
                setNewModel("")
                setIsDialogOpen(false)
                toast({
                    description: "Model successfully added.",
                })
            }
        } catch (error) {
            console.error("Error creating model:", error)
            setErrorMessage("Failed to create model.")
        }
    }

    return (
        <div>
            <div className="flex justify-between">
                <div className="pb-4 text-xl">Models</div>
                <div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger>
                            <Button size="sm">Add</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Model</DialogTitle>
                            </DialogHeader>
                            <DialogDescription>
                                Enter a new model to add to the system.
                            </DialogDescription>
                            <Input
                                type="text"
                                placeholder="Enter the model name"
                                value={newModel}
                                onChange={(e) => setNewModel(e.target.value)}
                            />
                            {errorMessage && (
                                <p className="text-sm text-red-400">{errorMessage}</p>
                            )}
                            <DialogFooter>
                                <Button onClick={handleCreateModel}>Create Model</Button>
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
                            <TableHead>Model</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {models?.length > 0 ? (
                            models.map((model) => (
                                <TableRow key={model.id}>
                                    <TableCell>{model.id}</TableCell>
                                    <TableCell>{model.model}</TableCell>
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
