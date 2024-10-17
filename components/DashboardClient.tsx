"use client"

import { useEffect, useState } from "react"
import Cookies from "js-cookie"

import { Card, CardContent, CardHeader } from "./ui/card"
import { Skeleton } from "./ui/skeleton"

interface DashboardClientProps {
  role: string
}

interface Stats {
  total_vehicles: string
  total_makes: string
  total_models: string
  total_trims: string
}

export default function DashboardClient({ role }: DashboardClientProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      const token = Cookies.get("token")

      if (!token) {
        setError("No se encontró un token de autenticación.")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CARFNDR_API_URL}/stats`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )

        if (!response.ok) {
          throw new Error("Error al obtener las estadísticas.")
        }

        const data = await response.json()
        setStats(data.stats)
      } catch (error) {
        setError("Error al obtener las estadísticas.")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <>
      <div>
        <div className="flex justify-between gap-2">
          {loading ? (
            <>
              <div className="w-full h-20">
                <Skeleton className="w-full h-20" />
              </div>
              <div className="w-full h-20">
                <Skeleton className="w-full h-20" />
              </div>
              <div className="w-full h-20">
                <Skeleton className="w-full h-20" />
              </div>
              <div className="w-full h-20">
                <Skeleton className="w-full h-20" />
              </div>
            </>
          ) : error ? (
            <p>{error}</p>
          ) : stats ? (
            <>
              <div className="w-full">
                <Card>
                  <CardHeader className="text-lg py-2 font-mono">
                    Vehicles
                  </CardHeader>
                  <CardContent className="">
                    <span className="text-4xl font-extrabold">
                      {stats.total_vehicles}
                    </span>
                  </CardContent>
                </Card>
              </div>
              <div className="w-full">
                <Card>
                  <CardHeader className="text-lg py-2 font-mono">
                    Brands
                  </CardHeader>
                  <CardContent>
                    <span className="text-4xl font-extrabold">
                      {stats.total_makes}
                    </span>
                  </CardContent>
                </Card>
              </div>
              <div className="w-full">
                <Card>
                  <CardHeader className="text-lg py-2 font-mono">
                    Models
                  </CardHeader>
                  <CardContent>
                    <span className="text-4xl font-extrabold">
                      {stats.total_models}
                    </span>
                  </CardContent>
                </Card>
              </div>
              <div className="w-full">
                <Card>
                  <CardHeader className="text-lg py-2 font-mono">
                    Trims
                  </CardHeader>
                  <CardContent>
                    <span className="text-4xl font-extrabold">
                      {stats.total_trims}
                    </span>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <p>No hay estadísticas disponibles.</p>
          )}
        </div>
      </div>
{/* 
      <span className="text-xs">
        {role === "admin" ? (
          <p>admin</p>
        ) : role === "user" ? (
          <p>user</p>
        ) : role === "client" ? (
          <p>cliente</p>
        ) : (
          <p>No tienes permisos para ver esta página</p>
        )}
      </span> */}
    </>
  )
}
