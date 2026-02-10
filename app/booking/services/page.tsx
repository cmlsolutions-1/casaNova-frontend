"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useBooking } from "@/lib/booking-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Coffee, Car, Map, Clock, Wine, Minus, Plus, ArrowRight } from "lucide-react"
import type { SelectedService } from "@/lib/mock-data"

const iconMap: Record<string, React.ElementType> = {
  Sparkles,
  Coffee,
  Car,
  Map,
  Clock,
  Wine,
}

export default function BookingServicesPage() {
  const router = useRouter()
  const { services, booking, setSelectedServices } = useBooking()
  const [selected, setSelected] = useState<Record<string, SelectedService>>({})

  useEffect(() => {
    if (!booking.selectedRoom) {
      router.push("/")
      return
    }
    if (booking.selectedServices.length > 0) {
      const map: Record<string, SelectedService> = {}
      for (const s of booking.selectedServices) {
        map[s.serviceId] = s
      }
      setSelected(map)
    }
  }, [booking.selectedRoom, booking.selectedServices, router])

  const toggleService = (serviceId: string) => {
    setSelected((prev) => {
      const next = { ...prev }
      if (next[serviceId]) {
        delete next[serviceId]
      } else {
        next[serviceId] = { serviceId, amount: 1 }
      }
      return next
    })
  }

  const updateAmount = (serviceId: string, delta: number) => {
    const svc = services.find((s) => s.id === serviceId)
    if (!svc) return
    setSelected((prev) => {
      const current = prev[serviceId]
      if (!current) return prev
      const newAmount = Math.max(1, Math.min(svc.maxAmount, current.amount + delta))
      return { ...prev, [serviceId]: { ...current, amount: newAmount } }
    })
  }

  const updateSchedule = (serviceId: string, field: "startHour" | "endHour", value: string) => {
    setSelected((prev) => {
      const current = prev[serviceId]
      if (!current) return prev
      return { ...prev, [serviceId]: { ...current, [field]: value } }
    })
  }

  const handleContinue = () => {
    setSelectedServices(Object.values(selected))
    router.push("/booking/guest")
  }

  const total = Object.values(selected).reduce((sum, s) => {
    const svc = services.find((sv) => sv.id === s.serviceId)
    return sum + (svc ? svc.price * s.amount : 0)
  }, 0)

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-foreground md:text-3xl mb-2">
        Servicios Adicionales
      </h1>
      <p className="text-muted-foreground mb-8">
        Seleccione los servicios que desea agregar a su estancia. Todos son opcionales.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {services
          .filter((s) => s.status === "active")
          .map((service) => {
            const Icon = iconMap[service.icon] || Sparkles
            const isSelected = !!selected[service.id]

            return (
              <div
                key={service.id}
                className={`rounded-2xl border-2 bg-card p-5 transition-all ${
                  isSelected ? "border-accent shadow-lg shadow-accent/10" : "border-transparent shadow"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${isSelected ? "bg-accent" : "bg-secondary"}`}>
                    <Icon className={`h-6 w-6 ${isSelected ? "text-accent-foreground" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-card-foreground">{service.name}</h3>
                      <span className="font-bold text-foreground whitespace-nowrap">${service.price}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {service.description}
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleService(service.id)}
                        className={isSelected ? "bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg" : "rounded-lg"}
                      >
                        {isSelected ? "Agregado" : "Agregar"}
                      </Button>

                      {isSelected && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateAmount(service.id, -1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border text-foreground hover:bg-secondary"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">
                            {selected[service.id].amount}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateAmount(service.id, 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border text-foreground hover:bg-secondary"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {isSelected && service.hasSchedule && (
                      <div className="mt-3 flex gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground">Desde</label>
                          <input
                            type="time"
                            value={selected[service.id]?.startHour || ""}
                            onChange={(e) => updateSchedule(service.id, "startHour", e.target.value)}
                            className="mt-0.5 block w-full rounded-lg border border-input bg-background px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Hasta</label>
                          <input
                            type="time"
                            value={selected[service.id]?.endHour || ""}
                            onChange={(e) => updateSchedule(service.id, "endHour", e.target.value)}
                            className="mt-0.5 block w-full rounded-lg border border-input bg-background px-2 py-1 text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
      </div>

      {total > 0 && (
        <div className="mt-6 rounded-xl bg-accent/10 p-4 text-center">
          <span className="text-sm text-muted-foreground">Total servicios adicionales: </span>
          <span className="text-lg font-bold text-accent">${total} USD</span>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleContinue}
          className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl px-8 py-3 h-auto font-semibold"
        >
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
