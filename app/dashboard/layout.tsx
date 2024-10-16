// app/dashboard/layout.tsx
import React from "react";
import { Inter } from "next/font/google";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardNav } from "@/components/dashboadNav";

const inter = Inter({ subsets: ["latin"] });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="container grid items-center pb-8 md:py-4">
      <div className={inter.className}>
        <DashboardNav />
        <main className="p-2">
          <Card>
            <CardContent className="py-4 px-4">{children}</CardContent>
          </Card>
        </main>
      </div>
    </section>
  );
}
