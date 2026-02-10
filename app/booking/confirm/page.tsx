"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useBooking } from "@/lib/booking-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  CalendarDays,
  Users,
  Bed,
  ArrowRight,
  Pencil,
  Hotel,
} from "lucide-react"

export default function BookingConfirmPage() {
  const router = useRouter()
  const { booking, services } = useBooking()
  const { searchParams: sp, selectedRoom: room, selectedServices, guestInfo } = booking

  useEffect(() => {
    if (!room || !sp || !guestInfo) {
      router.push("/")
    }
  }, [room, sp, guestInfo, router])

  if (!room || !sp || !guestInfo) return null

  const start = new Date(sp.startDate)
  const end = new Date(sp.endDate)
  const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
  const roomTotal = room.price * nights

  const svcDetails = selectedServices.map((s) => {
    const svc = services.find((sv) => sv.id === s.serviceId)
    return {
      name: svc?.name || "Servicio",
      unitPrice: svc?.price || 0,
      amount: s.amount,
      total: (svc?.price || 0) * s.amount,
    }
  })
  const svcTotal = svcDetails.reduce((sum, s) => sum + s.total, 0)
  const grandTotal = roomTotal + svcTotal

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-foreground md:text-3xl mb-2">
        Confirmar Reserva
      </h1>
      <p className="text-muted-foreground mb-8">
        Revise los detalles de su reserva antes de proceder al pago.
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dates & guests */}
          <div className="rounded-2xl bg-card p-5 shadow">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Fechas y Huespedes
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Estancia</p>
                  <p className="text-sm font-bold">{sp.startDate} - {sp.endDate}</p>
                  <p className="text-xs text-muted-foreground">{nights} noche{nights > 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Huespedes</p>
                  <p className="text-sm font-bold">
                    {sp.adults} adulto{sp.adults > 1 ? "s" : ""}
                    {sp.kids > 0 ? `, ${sp.kids} nino${sp.kids > 1 ? "s" : ""}` : ""}
                    {sp.babies > 0 ? `, ${sp.babies} bebe${sp.babies > 1 ? "s" : ""}` : ""}
                    {sp.pets > 0 ? `, ${sp.pets} mascota${sp.pets > 1 ? "s" : ""}` : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Room */}
          <div className="rounded-2xl bg-card p-5 shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Habitacion
              </h2>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="flex items-center gap-1 text-xs text-accent hover:underline"
              >
                <Pencil className="h-3 w-3" /> Cambiar
              </button>
            </div>
            <div className="flex gap-4">
              <img
                src={room.images[0] || "/placeholder.svg"}
                alt={room.name}
                className="h-20 w-28 flex-shrink-0 rounded-xl object-cover"
              />
              <div>
                <h3 className="font-bold text-card-foreground">{room.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">{room.type}</p>
                <p className="mt-1 text-sm font-bold">${room.price} x {nights} noche{nights > 1 ? "s" : ""} = <span className="text-accent">${roomTotal}</span></p>
              </div>
            </div>
          </div>

          {/* Services */}
          {svcDetails.length > 0 && (
            <div className="rounded-2xl bg-card p-5 shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Servicios Adicionales
                </h2>
                <button
                  type="button"
                  onClick={() => router.push("/booking/services")}
                  className="flex items-center gap-1 text-xs text-accent hover:underline"
                >
                  <Pencil className="h-3 w-3" /> Editar
                </button>
              </div>
              <div className="space-y-2">
                {svcDetails.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-sm">
                    <span className="text-card-foreground">{s.name} x{s.amount}</span>
                    <span className="font-bold">${s.total}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guest */}
          <div className="rounded-2xl bg-card p-5 shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Datos del Huesped
              </h2>
              <button
                type="button"
                onClick={() => router.push("/booking/guest")}
                className="flex items-center gap-1 text-xs text-accent hover:underline"
              >
                <Pencil className="h-3 w-3" /> Editar
              </button>
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div><span className="text-muted-foreground">Nombre:</span> <span className="font-medium">{guestInfo.name}</span></div>
              <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{guestInfo.email}</span></div>
              <div><span className="text-muted-foreground">Telefono:</span> <span className="font-medium">{guestInfo.phone}</span></div>
              <div><span className="text-muted-foreground">Documento:</span> <span className="font-medium">{guestInfo.documentType} {guestInfo.documentNumber}</span></div>
            </div>
          </div>
        </div>

        {/* Price summary */}
        <div>
          <div className="sticky top-28 rounded-2xl bg-card p-6 shadow-lg">
            <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold text-card-foreground">
              <Hotel className="h-5 w-5 text-accent" />
              Resumen
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Habitacion ({nights} noche{nights > 1 ? "s" : ""})</span>
                <span className="font-bold">${roomTotal}</span>
              </div>
              {svcTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Servicios</span>
                  <span className="font-bold">${svcTotal}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base">
                <span className="font-bold">Total</span>
                <span className="text-xl font-bold text-accent">${grandTotal}</span>
              </div>
            </div>
            <Button
              onClick={() => router.push("/booking/payment")}
              className="mt-6 w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl py-3 h-auto text-base font-bold"
            >
              Ir a Pagar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
