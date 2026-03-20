//app/booking/services/page.tsx
"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useBooking } from "@/lib/booking-context"
import { Button } from "@/components/ui/button"
import { Sparkles, Minus, Plus, ArrowRight } from "lucide-react"
import type { SelectedService } from "@/lib/mock-data"
import { listServicesPublicService, type BackendService } from "@/services/service.service"
import { formatCurrencyCOP } from "@/utils/format"

export default function BookingServicesPage() {
  const router = useRouter()

  const [services, setServices] = useState<BackendService[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Record<string, SelectedService>>({})
  const { booking, setSelectedServices, hydrated } = useBooking()

  useEffect(() => {
    if (!hydrated) return
  
    if (!booking.selectedRooms || booking.selectedRooms.length === 0) {
      router.push("/")
      return
    }
  
    ;(async () => {
      try {
        setLoading(true)
        const data = await listServicesPublicService()
        setServices(Array.isArray(data) ? data : [])
      } finally {
        setLoading(false)
      }
    })()
  }, [hydrated, booking.selectedRooms, router])

  const activeServices = useMemo(
    () => services.filter((s) => s.status === "ACTIVE" && s.type === "STAY"),
    [services],
  )

  const toggleService = (serviceId: string) => {
    setSelected((prev) => {
      const next = { ...prev }
      if (next[serviceId]) delete next[serviceId]
      else next[serviceId] = { serviceId, amount: 1 }
      return next
    })
  }

  const updateAmount = (serviceId: string, delta: number) => {
    setSelected((prev) => {
      const current = prev[serviceId]
      if (!current) return prev
      const newAmount = Math.max(1, current.amount + delta)
      return { ...prev, [serviceId]: { ...current, amount: newAmount } }
    })
  }

  const handleContinue = () => {
    setSelectedServices(Object.values(selected))
    setTimeout(() => router.push("/booking/guest"), 0)
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

      {loading ? (
        <p className="text-muted-foreground">Cargando servicios...</p>
      ) : activeServices.length === 0 ? (
        <p className="text-muted-foreground">No hay servicios disponibles en este momento.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {activeServices.map((service) => {
            const isSelected = !!selected[service.id]
            const Icon = Sparkles // (backend no trae icono)

            return (
              <div
                key={service.id}
                className={`rounded-2xl border-2 bg-card p-5 transition-all ${
                  isSelected ? "border-accent shadow-lg shadow-accent/10" : "border-transparent shadow"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
                      isSelected ? "bg-accent" : "bg-secondary"
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${isSelected ? "text-accent-foreground" : "text-muted-foreground"}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-card-foreground">{service.name}</h3>
                      <span className="font-bold text-foreground whitespace-nowrap">
                        {formatCurrencyCOP(service.price)}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {service.description ?? (service as any).decription ?? ""}
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
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">{selected[service.id].amount}</span>
                          <button
                            type="button"
                            onClick={() => updateAmount(service.id, 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border text-foreground hover:bg-secondary"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {total > 0 && (
        <div className="mt-6 rounded-xl bg-accent/10 p-4 text-center">
          <span className="text-sm text-muted-foreground">Total servicios adicionales: </span>
          <span className="text-lg font-bold text-accent">{formatCurrencyCOP(total)}</span>
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