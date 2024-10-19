"use client"

import { useEffect, useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// API URL
const apiUrl = process.env.NEXT_PUBLIC_CARFNDR_API_URL

// Function to fetch trims with query and pagination
async function fetchVehicleTrims(
  token: string,
  query: string = "",
  page: number = 1,
  limit: number = 10
) {
  const response = await fetch(
    `${apiUrl}/select-trims?query=${query}&page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  )
  const data = await response.json()
  return data
}

interface SelectTrimsComboboxProps {
    token: string;
    onTrimselect: (trimId: number | null, trimName: string) => void;
    disabled?: boolean; // Añadimos la prop disabled
  }
  
  export default function SelectTrimsCombobox({
    token,
    onTrimselect,
    disabled = false, // Propiedad predeterminada en false
  }: SelectTrimsComboboxProps) {
    const [trims, setTrims] = useState<{ id: number; trim: string }[]>([]);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<string>("");
    const [query, setQuery] = useState<string>("");
    const [loadingTrims, setLoadingTrims] = useState(false);
  
    const loadTrims = async (searchTerm: string) => {
      setLoadingTrims(true);
      try {
        const trimOptions = await fetchVehicleTrims(token, searchTerm);
        setTrims(trimOptions.items || []);
      } catch (error) {
        console.error("Error fetching trims:", error);
      }
      setLoadingTrims(false);
    };
  
    useEffect(() => {
      if (!disabled) loadTrims(""); // Cargar trimos solo si el combobox no está deshabilitado
    }, [token, disabled]);
  
 // Handle search when pressing "Enter"
 const handleSearch = (inputValue: string) => {
    setTrims([]) // Reset trims before loading new ones
    loadTrims(inputValue) // Fetch trims with the new query
    setQuery("") // Clear the search input after fetching
  }

  // Reset query when popover is closed
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setQuery("") // Clear the search query when closing
    }
    setOpen(isOpen)
  }
  
    return (
        <Popover open={open} onOpenChange={handleOpenChange} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled} // Aplicamos la propiedad disabled aquí
          >
            {value
              ? trims.find((trim) => trim.id.toString() === value)?.trim
              : "Search or select trim..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[460px] p-0">
          <Command>
            <CommandInput
              placeholder="Search trims..."
              value={query}
              onValueChange={(inputValue) => setQuery(inputValue)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(query);
                }
              }}
              disabled={disabled} // Deshabilitamos la búsqueda si está en estado disabled
            />
            <CommandList>
              {loadingTrims ? (
                <CommandEmpty>Loading trims...</CommandEmpty>
              ) : trims.length === 0 ? (
                <CommandEmpty>No trims found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {trims.map((trim) => (
                    <CommandItem
                      key={trim.id}
                      value={trim.id.toString()}
                      onSelect={(currentValue) => {
                        const selectedTrim = trims.find(
                          (m) => m.id.toString() === currentValue
                        );
                        setValue(currentValue === value ? "" : currentValue);
                        onTrimselect(selectedTrim?.id || null, selectedTrim?.trim || "");
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === trim.id.toString() ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {trim.trim}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
  