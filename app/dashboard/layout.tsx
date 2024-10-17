// app/dashboard/layout.tsx

import { Inter } from "next/font/google"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { Card, CardContent } from "@/components/ui/card"
import { DashboardNav } from "@/components/dashboadNav"

const inter = Inter({ subsets: ["latin"] })

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const token = cookieStore.get("token")?.value

  if (!token) {
    // Redirige al login si no hay token
    redirect("/auth/login")
  }

  return (
    <section className="container grid items-center pb-8 md:py-4 gap-3">
      <Card>
        <DashboardNav />
      </Card>
      <Card>
        <CardContent className="p-4">{children}</CardContent>
      </Card>
    </section>
  )
}
