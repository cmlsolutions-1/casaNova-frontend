//app/booking/services/page.tsx
"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useBooking } from "@/lib/booking-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sparkles, Minus, Plus, ArrowRight, Eye } from "lucide-react"
import type { SelectedService } from "@/lib/mock-data"
import { listServicesPublicService, type BackendService } from "@/services/service.service"
import { formatCurrencyCOP } from "@/utils/format"
import { AutoImageCarousel } from "@/components/auto-image-carousel"

export default function BookingServicesPage() {
  const router = useRouter()

  const [services, setServices] = useState<BackendService[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Record<string, SelectedService>>({})
  const [detailService, setDetailService] = useState<BackendService | null>(null)

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

  const detailSelected = detailService ? !!selected[detailService.id] : false

  return (
    <div>
      <h1 className="mb-2 font-serif text-2xl font-bold text-foreground md:text-3xl">
        Servicios Adicionales
      </h1>
      <p className="mb-8 text-muted-foreground">
        Seleccione los servicios que desea agregar a su estancia. Todos son opcionales.
      </p>

      {loading ? (
        <p className="text-muted-foreground">Cargando servicios...</p>
      ) : activeServices.length === 0 ? (
        <p className="text-muted-foreground">No hay servicios disponibles en este momento.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {activeServices.map((service) => {
            const isSelected = !!selected[service.id]
            const Icon = Sparkles

            return (
              <div
                key={service.id}
                className={`overflow-hidden rounded-2xl border bg-card transition-all ${
                  isSelected
                    ? "border-accent shadow-lg shadow-accent/10"
                    : "border-border shadow-sm hover:shadow-md"
                }`}
              >
                <div className="relative h-48 overflow-hidden">
                  <AutoImageCarousel
                    images={service.images}
                    alt={service.name}
                    fallback="/LOGO.PNG"
                    interval={3200}
                    showDots={(service.images?.length ?? 0) > 1}
                    className="h-full w-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        isSelected ? "bg-accent" : "bg-white/90"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          isSelected ? "text-accent-foreground" : "text-foreground"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-bold text-card-foreground">{service.name}</h3>
                    <span className="whitespace-nowrap font-bold text-foreground">
                      {formatCurrencyCOP(service.price)}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {service.description ?? service.decription ?? ""}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleService(service.id)}
                      className={
                        isSelected
                          ? "rounded-lg bg-accent text-accent-foreground hover:bg-accent/90"
                          : "rounded-lg"
                      }
                    >
                      {isSelected ? "Agregado" : "Agregar"}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDetailService(service)}
                      className="rounded-lg"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Más info
                    </Button>

                    {isSelected && (
                      <div className="ml-auto flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateAmount(service.id, -1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border text-foreground hover:bg-secondary"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-sm font-bold">
                          {selected[service.id].amount}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateAmount(service.id, 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border text-foreground hover:bg-secondary"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    )}
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
          className="h-auto rounded-xl bg-accent px-8 py-3 font-semibold text-accent-foreground hover:bg-accent/90"
        >
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <Dialog open={!!detailService} onOpenChange={(open) => !open && setDetailService(null)}>
        <DialogContent className="max-w-3xl">
          {detailService && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">
                  {detailService.name}
                </DialogTitle>
                <DialogDescription>
                  Conoce más detalles del servicio antes de agregarlo a tu reserva.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="overflow-hidden rounded-2xl border bg-muted">
                  <div className="h-72">
                    <AutoImageCarousel
                      images={detailService.images}
                      alt={detailService.name}
                      fallback="/LOGO.PNG"
                      interval={3400}
                      showDots={(detailService.images?.length ?? 0) > 1}
                      className="h-full w-full"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
                      {detailService.type === "STAY" ? "Servicio de alojamiento" : "Servicio especial"}
                    </span>
                    <span className="text-xl font-bold text-foreground">
                      {formatCurrencyCOP(detailService.price)}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground text-justify">
                    {detailService.description ?? detailService.decription ?? "Sin descripción disponible."}
                  </p>

                  <div className="mt-6 flex items-center gap-3">
                    <Button
                      variant={detailSelected ? "default" : "outline"}
                      onClick={() => toggleService(detailService.id)}
                      className={
                        detailSelected
                          ? "bg-accent text-accent-foreground hover:bg-accent/90"
                          : ""
                      }
                    >
                      {detailSelected ? "Agregado" : "Agregar servicio"}
                    </Button>

                    {detailSelected && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateAmount(detailService.id, -1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border text-foreground hover:bg-secondary"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold">
                          {selected[detailService.id].amount}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateAmount(detailService.id, 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border text-foreground hover:bg-secondary"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}