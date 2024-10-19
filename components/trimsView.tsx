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
    import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    } from "@/components/ui/pagination"
    import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
    } from "@/components/ui/select"
    import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    } from "@/components/ui/table"

    const apiUrl = process.env.NEXT_PUBLIC_CARFNDR_API_URL

    async function fetchTrims(page: number, limit: number, token: string) {
    const response = await fetch(
        `${apiUrl}/trimsList?page=${page}&limit=${limit}`,
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

    async function fetchTrimOptions(token: string) {
    const response = await fetch(`${apiUrl}/trim-select-options`, {
        headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        },
    })

    if (!response.ok) {
        const errorDetails = await response.text()
        console.error("Fetch error details:", errorDetails)
        throw new Error(
        `Error fetching options: ${response.status} - ${errorDetails}`
        )
    }

    const data = await response.json()
    return data
    }

    async function createTrim(
    trimData: {
        cylinders_id: number
        displacement_id: number
        transmission_id: number
        drive_id: number
    },
    token: string
    ) {
    const response = await fetch(`${apiUrl}/create-trim`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(trimData),
    })

    const data = await response.json()
    return data
    }

    interface Trim {
    id: number
    trim: string
    }

    interface TrimOptions {
    cylinders: { id: number; cylinders: string }[]
    displacements: { id: number; displ: string }[]
    transmissions: { id: number; trany: string }[]
    drives: { id: number; drive: string }[]
    }

    interface TrimsViewProps {
    role: string
    token: string
    }

    export default function TrimsView({ role, token }: TrimsViewProps) {
    const [trims, setTrims] = useState<Trim[]>([])
    const [trimOptions, setTrimOptions] = useState<TrimOptions | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [limit] = useState(12)
    const [selectedCylinder, setSelectedCylinder] = useState<number | null>(null)
    const [selectedDisplacement, setSelectedDisplacement] = useState<
        number | null
    >(null)
    const [selectedTransmission, setSelectedTransmission] = useState<
        number | null
    >(null)
    const [selectedDrive, setSelectedDrive] = useState<number | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const loadTrims = async () => {
        try {
        const data = await fetchTrims(currentPage, limit, token)
        setTrims(data.items)
        setTotalPages(data.totalPages)
        } catch (error) {
        console.error("Error fetching trims:", error)
        setErrorMessage("Failed to load trims. Please try again.")
        }
    }

    useEffect(() => {
        const getTrimOptions = async () => {
        try {
            const data = await fetchTrimOptions(token)
            setTrimOptions(data)
        } catch (error) {
            console.error("Error fetching trim options:", error)
        }
        }

        getTrimOptions()
    }, [token])

    useEffect(() => {
        loadTrims()
    }, [currentPage, limit, token])

    const handleCreateTrim = async () => {
        if (
        selectedCylinder === null ||
        selectedDisplacement === null ||
        selectedTransmission === null ||
        selectedDrive === null
        ) {
        setErrorMessage("Please select all fields.")
        return
        }

        try {
        const result = await createTrim(
            {
            cylinders_id: selectedCylinder,
            displacement_id: selectedDisplacement,
            transmission_id: selectedTransmission,
            drive_id: selectedDrive,
            },
            token
        )

        if (result.message === "El trim ya existe") {
            setErrorMessage(`Trim already exists`)
        } else if (result.trim_id) {
            setErrorMessage("")
            setIsDialogOpen(false)
            toast({
            description: "Trim successfully added.",
            })
            loadTrims() // Refrescar la lista de trims después de agregar uno nuevo
        }
        } catch (error) {
        console.error("Error creating trim:", error)
        setErrorMessage("Failed to create trim.")
        }
    }

    return (
        <div>
        <div className="flex justify-between">
            <div className="pb-4 text-xl">Trims</div>
            <div>
            <Dialog
                open={isDialogOpen}
                onOpenChange={(isOpen) => {
                setIsDialogOpen(isOpen)
                if (!isOpen) {
                    // Reseteamos el mensaje de error y los selectores al cerrar el diálogo
                    setErrorMessage("")
                    setSelectedCylinder(null)
                    setSelectedDisplacement(null)
                    setSelectedTransmission(null)
                    setSelectedDrive(null)
                }
                }}
            >
                <DialogTrigger>
                <Button size="sm">Add</Button>
                </DialogTrigger>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Trim</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    {trimOptions ? (
                    <>
                        <div className="flex justify-between gap-2">
                        <Select
                            onValueChange={(value) =>
                            setSelectedCylinder(parseInt(value))
                            }
                        >
                            <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Cylinder" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Cylinders</SelectLabel>
                                {trimOptions.cylinders.map((cylinder) => (
                                <SelectItem
                                    key={cylinder.id}
                                    value={cylinder.id.toString()}
                                >
                                    {cylinder.cylinders}
                                </SelectItem>
                                ))}
                            </SelectGroup>
                            </SelectContent>
                        </Select>

                        <Select
                            onValueChange={(value) =>
                            setSelectedDisplacement(parseInt(value))
                            }
                        >
                            <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Displacement" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Displacements</SelectLabel>
                                {trimOptions.displacements.map((displ) => (
                                <SelectItem
                                    key={displ.id}
                                    value={displ.id.toString()}
                                >
                                    {displ.displ}
                                </SelectItem>
                                ))}
                            </SelectGroup>
                            </SelectContent>
                        </Select>
                        </div>
                        <div className="flex justify-between gap-2 mt-2">
                        <Select
                            onValueChange={(value) =>
                            setSelectedTransmission(parseInt(value))
                            }
                        >
                            <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Transmission" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Transmissions</SelectLabel>
                                {trimOptions.transmissions.map((trany) => (
                                <SelectItem
                                    key={trany.id}
                                    value={trany.id.toString()}
                                >
                                    {trany.trany}
                                </SelectItem>
                                ))}
                            </SelectGroup>
                            </SelectContent>
                        </Select>

                        <Select
                            onValueChange={(value) =>
                            setSelectedDrive(parseInt(value))
                            }
                        >
                            <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Drive" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Drives</SelectLabel>
                                {trimOptions.drives.map((drive) => (
                                <SelectItem
                                    key={drive.id}
                                    value={drive.id.toString()}
                                >
                                    {drive.drive}
                                </SelectItem>
                                ))}
                            </SelectGroup>
                            </SelectContent>
                        </Select>
                        </div>
                        {errorMessage && (
                        <p className="text-sm text-red-400">{errorMessage}</p>
                        )}
                    </>
                    ) : (
                    <p>Loading options...</p>
                    )}
                </DialogDescription>
                <DialogFooter>
                    <Button onClick={handleCreateTrim} disabled={!trimOptions}>
                    Create Trim
                    </Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>
            </div>
        </div>

        {/* Tabular display of trims */}
        <div className="overflow-x-auto">
            <Table className="mt-0 w-full">
            <TableHeader>
                <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead>Trim</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {trims?.length > 0 ? (
                trims.map((trim) => (
                    <TableRow key={trim.id}>
                    <TableCell>{trim.id}</TableCell>
                    <TableCell>{trim.trim}</TableCell>
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

        {/* Pagination */}
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
