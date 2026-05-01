"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Hotel, DollarSign, CalendarOff, Calendar } from "lucide-react"
import { PricesByDate } from "@/components/dashboard/prices-by-date"
import { AvailabilityByDate } from "@/components/dashboard/availability-by-date"
import { SpecialSeasons } from "@/components/dashboard/special-seasons"

export default function HotelDashboard() {
  const [activeTab, setActiveTab] = useState("prices")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
              <Hotel className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground text-balance">
                Gestión Hotelera
              </h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Configuración avanzada de tarifas, disponibilidad y temporadas
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full sm:w-auto flex-wrap h-auto gap-1 p-1 bg-muted/50 mb-6">
            <TabsTrigger
              value="prices"
              className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm"
            >
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Precios por fecha</span>
              <span className="sm:hidden">Precios</span>
            </TabsTrigger>
            <TabsTrigger
              value="availability"
              className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm"
            >
              <CalendarOff className="w-4 h-4" />
              <span className="hidden sm:inline">Disponibilidad por fecha</span>
              <span className="sm:hidden">Disponibilidad</span>
            </TabsTrigger>
            <TabsTrigger
              value="seasons"
              className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Temporadas especiales</span>
              <span className="sm:hidden">Temporadas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prices" className="mt-0">
            <PricesByDate />
          </TabsContent>

          <TabsContent value="availability" className="mt-0">
            <AvailabilityByDate />
          </TabsContent>

          <TabsContent value="seasons" className="mt-0">
            <SpecialSeasons />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
