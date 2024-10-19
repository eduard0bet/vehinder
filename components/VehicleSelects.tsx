"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import SelectModels from "./selectModels"; 
import SelectTrims from "./selectTrims";

const apiUrl = process.env.NEXT_PUBLIC_CARFNDR_API_URL;

// Functions to fetch data
async function fetchVehicleOptionsForYear(token: string) {
  const response = await fetch(`${apiUrl}/select-years`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.json();
}

async function fetchVehicleBrands(token: string) {
  const response = await fetch(`${apiUrl}/select-makes`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.json();
}

interface VehicleSelectsProps {
  token: string;
  onSelectionChange: (selection: {
    yearId: number | null;
    brandId: number | null;
    modelId: number | null;
    trimId: number | null;
  }) => void;
}

export default function VehicleSelects({
  token,
  onSelectionChange,
}: VehicleSelectsProps) {
  const [years, setYears] = useState<{ id: number; year: number }[]>([]);
  const [brands, setBrands] = useState<{ id: number; make: string }[]>([]);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<number | null>(null);
  const [selectedTrim, setSelectedTrim] = useState<number | null>(null);

  const [loadingYears, setLoadingYears] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(false);

  // Load years on initial mount
  useEffect(() => {
    const loadYears = async () => {
      setLoadingYears(true);
      try {
        const yearOptions = await fetchVehicleOptionsForYear(token);
        setYears(yearOptions.years || []);
      } catch (error) {
        console.error("Error fetching years:", error);
      }
      setLoadingYears(false);
    };
    loadYears();
  }, [token]);

  // Load brands when a year is selected
  useEffect(() => {
    const loadBrands = async () => {
      if (selectedYear) {
        setLoadingBrands(true);
        try {
          const brandOptions = await fetchVehicleBrands(token);
          setBrands(brandOptions.makes || []);
        } catch (error) {
          console.error("Error fetching brands:", error);
        }
        setLoadingBrands(false);
      }
    };
    loadBrands();
  }, [selectedYear, token]);

  // Update the selection when any dropdown changes
  useEffect(() => {
    onSelectionChange({
      yearId: selectedYear,
      brandId: selectedBrand,
      modelId: selectedModel,
      trimId: selectedTrim,
    });
  }, [selectedYear, selectedBrand, selectedModel, selectedTrim, onSelectionChange]);

  // Handle model selection from the SelectModels
  const handleModelSelect = (modelId: number | null) => {
    setSelectedModel(modelId);
    setSelectedTrim(null); // Reset trim if a new model is selected
  };

  // Handle trim selection from the SelectTrims
  const handleTrimSelect = (trimId: number | null) => {
    setSelectedTrim(trimId);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Year Select */}
      {loadingYears ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <Select onValueChange={(value) => setSelectedYear(parseInt(value))}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Years</SelectLabel>
              {years.map((year) => (
                <SelectItem key={year.id} value={year.id.toString()}>
                  {year.year}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}

      {/* Brand Select */}
      {loadingBrands ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <Select
          onValueChange={(value) => {
            setSelectedBrand(parseInt(value));
            setSelectedModel(null); // Reset model and trim if brand changes
            setSelectedTrim(null);
          }}
          disabled={!selectedYear}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Brands</SelectLabel>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id.toString()}>
                  {brand.make}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}

      {/* Model Select (using SelectModels, disabled until brand is selected) */}
      <SelectModels
        token={token}
        onModelSelect={handleModelSelect}
        disabled={!selectedBrand}
      />

      {/* Trim Select (using SelectTrims, disabled until model is selected) */}
      <SelectTrims
        token={token}
        onTrimselect={handleTrimSelect}
        disabled={!selectedModel}
      />
    </div>
  );
}
