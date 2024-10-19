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

// Function to fetch models with query and pagination
async function fetchVehicleModels(
  token: string,
  query: string = "",
  page: number = 1,
  limit: number = 10
) {
  const response = await fetch(
    `${apiUrl}/select-models?query=${query}&page=${page}&limit=${limit}`,
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

interface SelectModelsProps {
    token: string;
    onModelSelect: (modelId: number | null, modelName: string) => void;
    disabled?: boolean; // Añadimos la prop disabled
  }
  
  export default function SelectModels({
    token,
    onModelSelect,
    disabled = false, // Propiedad predeterminada en false
  }: SelectModelsProps) {
    const [models, setModels] = useState<{ id: number; model: string }[]>([]);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<string>("");
    const [query, setQuery] = useState<string>("");
    const [loadingModels, setLoadingModels] = useState(false);
  
    const loadModels = async (searchTerm: string) => {
      setLoadingModels(true);
      try {
        const modelOptions = await fetchVehicleModels(token, searchTerm);
        setModels(modelOptions.items || []);
      } catch (error) {
        console.error("Error fetching models:", error);
      }
      setLoadingModels(false);
    };
  
    useEffect(() => {
      if (!disabled) loadModels(""); // Cargar modelos solo si el combobox no está deshabilitado
    }, [token, disabled]);
  
 // Handle search when pressing "Enter"
 const handleSearch = (inputValue: string) => {
    setModels([]) // Reset models before loading new ones
    loadModels(inputValue) // Fetch models with the new query
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
              ? models.find((model) => model.id.toString() === value)?.model
              : "Search or select model..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[460px] p-0">
          <Command>
            <CommandInput
              placeholder="Search models..."
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
              {loadingModels ? (
                <CommandEmpty>Loading models...</CommandEmpty>
              ) : models.length === 0 ? (
                <CommandEmpty>No models found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {models.map((model) => (
                    <CommandItem
                      key={model.id}
                      value={model.id.toString()}
                      onSelect={(currentValue) => {
                        const selectedModel = models.find(
                          (m) => m.id.toString() === currentValue
                        );
                        setValue(currentValue === value ? "" : currentValue);
                        onModelSelect(selectedModel?.id || null, selectedModel?.model || "");
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === model.id.toString() ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {model.model}
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
  