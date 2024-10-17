"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { Eraser } from "lucide-react"

// Importa el Skeleton de Shadcn UI

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"

// Función auxiliar para hacer fetch de los datos
async function fetchData(endpoint: string) {
  const apiUrl = process.env.NEXT_PUBLIC_CARFNDR_API_URL
  const apiKey = process.env.NEXT_PUBLIC_CARFNDR_API_KEY
  const response = await fetch(`${apiUrl}${endpoint}`, {
    headers: {
      "x-api-key": apiKey,
    } as HeadersInit,
  })
  if (!response.ok) {
    throw new Error("Error fetching data")
  }
  return response.json()
}

export function VehicleFinder() {
  // Estados para años, marcas, modelos, trims y el ID del vehículo
  const [years, setYears] = useState<{ id: number; year: number }[]>([])
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null)
  const [makes, setMakes] = useState<{ id: number; make: string }[]>([])
  const [selectedMakeId, setSelectedMakeId] = useState<number | null>(null)
  const [models, setModels] = useState<{ id: number; model: string }[]>([])
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null)
  const [trims, setTrims] = useState<{ trim_id: number; trim: string }[]>([])
  const [selectedTrimId, setSelectedTrimId] = useState<number | null>(null)
  const [vehicleId, setVehicleId] = useState<number | null>(null)

  // Estados de carga para cada selección
  const [loadingYears, setLoadingYears] = useState(false)
  const [loadingMakes, setLoadingMakes] = useState(false)
  const [loadingModels, setLoadingModels] = useState(false)
  const [loadingTrims, setLoadingTrims] = useState(false)

  // Función para limpiar todos los selects
  const clearSelections = () => {
    setSelectedYearId(null)
    setSelectedMakeId(null)
    setSelectedModelId(null)
    setSelectedTrimId(null)
    setVehicleId(null)
  }

  // Cargar los años al montar el componente
  useEffect(() => {
    setLoadingYears(true)
    fetchData("/years")
      .then((data) => {
        // Ordenar los años de forma descendente
        const sortedYears = data.sort(
          (a: { year: number }, b: { year: number }) => b.year - a.year
        )
        setYears(sortedYears)
        setLoadingYears(false)
      })
      .catch((error) => {
        console.error("Error loading years:", error)
        setLoadingYears(false)
      })
  }, [])

  // Cargar las marcas cuando se selecciona un año
  useEffect(() => {
    if (selectedYearId) {
      setLoadingMakes(true) // Inicia el estado de carga
      fetchData(`/makes-by-year?id=${selectedYearId}`)
        .then((data) => {
          const sortedMakes = data
            .map((make: { id: number; make: string }) => ({
              ...make,
              make:
                make.make.charAt(0).toUpperCase() +
                make.make.slice(1).toLowerCase(),
            }))
            .sort((a: { make: string }, b: { make: string }) =>
              a.make.localeCompare(b.make)
            )

          setMakes(sortedMakes)
          setLoadingMakes(false) // Finaliza el estado de carga
        })
        .catch((error) => {
          console.error("Error loading makes:", error)
          setLoadingMakes(false) // Finaliza el estado de carga incluso en caso de error
        })
    } else {
      setMakes([]) // Limpia las marcas si no hay año seleccionado
    }
  }, [selectedYearId])

  // Cargar los modelos cuando se selecciona una marca
  useEffect(() => {
    if (selectedYearId && selectedMakeId) {
      setLoadingModels(true) // Inicia el estado de carga para modelos
      fetchData(
        `/models-by-year-make?year_id=${selectedYearId}&make_id=${selectedMakeId}`
      )
        .then((data) => {
          const sortedModels = data
            .map((model: { id: number; model: string }) => ({
              ...model,
              model:
                model.model.charAt(0).toUpperCase() +
                model.model.slice(1).toLowerCase(),
            }))
            .sort((a: { model: string }, b: { model: string }) =>
              a.model.localeCompare(b.model)
            )

          setModels(sortedModels)
          setLoadingModels(false) // Finaliza el estado de carga
        })
        .catch((error) => {
          console.error("Error loading models:", error)
          setLoadingModels(false) // Asegúrate de finalizar el estado de carga incluso si hay un error
        })
    } else {
      setModels([]) // Limpia los modelos si no hay selecciones válidas
    }
  }, [selectedYearId, selectedMakeId])

  useEffect(() => {
    if (selectedYearId && selectedMakeId && selectedModelId) {
      setLoadingTrims(true) // Inicia el estado de carga para trims
      fetchData(
        `/vehicle-trim?year_id=${selectedYearId}&make_id=${selectedMakeId}&model_id=${selectedModelId}`
      )
        .then((data) => {
          setTrims(data)
          setLoadingTrims(false) // Finaliza el estado de carga
        })
        .catch((error) => {
          console.error("Error loading trims:", error)
          setLoadingTrims(false) // Asegúrate de finalizar el estado de carga incluso si hay un error
        })
    } else {
      setTrims([]) // Limpia los trims si no hay selecciones válidas
    }
  }, [selectedYearId, selectedMakeId, selectedModelId])

  // Hacer fetch del ID del vehículo cuando se seleccionan los 4 valores
  useEffect(() => {
    if (selectedYearId && selectedMakeId && selectedModelId && selectedTrimId) {
      fetchData(
        `/getvehicleid?year_id=${selectedYearId}&make_id=${selectedMakeId}&model_id=${selectedModelId}&trim_id=${selectedTrimId}`
      )
        .then((data) => setVehicleId(data[0]?.id))
        .catch((error) => console.error("Error fetching vehicle ID:", error))
    }
  }, [selectedYearId, selectedMakeId, selectedModelId, selectedTrimId])

  return (
    <>

          <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
            <div className="w-full md:grow">
              {loadingYears ? (
                <Skeleton className="h-14 w-full" />
              ) : (
                <Select
                  onValueChange={(value) => setSelectedYearId(Number(value))}
                >
                  <SelectTrigger className="h-14 text-xl">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year.id} value={String(year.id)}>
                        {year.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="w-full md:grow">
              {selectedYearId &&
                (loadingMakes ? ( // Verifica si se están cargando las marcas
                  <Skeleton className="h-14 w-full" /> // Muestra el skeleton
                ) : (
                  <Select
                    onValueChange={(value) => setSelectedMakeId(Number(value))}
                  >
                    <SelectTrigger className="h-14 text-xl">
                      <SelectValue placeholder="Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {makes.map((make) => (
                        <SelectItem key={make.id} value={String(make.id)}>
                          {make.make}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ))}
            </div>

            <div className="w-full md:grow">
              {selectedMakeId &&
                (loadingModels ? (
                  <Skeleton className="h-14 w-full" /> // Muestra el skeleton cuando se están cargando los modelos
                ) : (
                  <Select
                    onValueChange={(value) => setSelectedModelId(Number(value))}
                  >
                    <SelectTrigger className="h-14 text-xl">
                      <SelectValue placeholder="Model" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={String(model.id)}>
                          {model.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ))}
            </div>

            <div className="w-full md:grow">
              {selectedModelId &&
                (loadingTrims ? (
                  <Skeleton className="h-14 w-full" /> // Muestra el skeleton mientras se están cargando los trims
                ) : (
                  <Select
                    onValueChange={(value) => setSelectedTrimId(Number(value))}
                  >
                    <SelectTrigger className="h-14 text-xl">
                      <SelectValue placeholder="Trim" />
                    </SelectTrigger>
                    <SelectContent>
                      {trims.map((trim) => (
                        <SelectItem
                          key={trim.trim_id}
                          value={String(trim.trim_id)}
                        >
                          {trim.trim}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ))}
            </div>

            {vehicleId && (
              <>
                {/* <div className="flex justify-center md:w-auto w-full dark:bg-transparent h-14 p-3 text-xl rounded border">
                  <p> {vehicleId}</p>
                </div> */}
                <div>
                  <Button
                    className="h-14"
                    variant="outline"
                    onClick={clearSelections}
                  >
                    <Eraser />
                  </Button>
                </div>
              </>
            )}
          </div>
      
    </>
  )
}
