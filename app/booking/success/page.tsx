//app/booking/success/page.tsx

"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useBooking } from "@/lib/booking-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, XCircle, Home, Hotel } from "lucide-react"
import Link from "next/link"
import { getReservationByIdPublicService } from "@/services/reservation.service"

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  PENDING: { label: "Pendiente", icon: Clock, color: "text-amber-500" },
  PAID_PENDING_APPROVAL: { label: "Pago recibido - Pendiente de aprobación", icon: Clock, color: "text-amber-500" },
  CONFIRMED: { label: "Confirmada", icon: CheckCircle2, color: "text-green-500" },
  APPROVED: { label: "Aprobada", icon: CheckCircle2, color: "text-green-500" },
  REJECTED: { label: "Rechazada", icon: XCircle, color: "text-destructive" },
}

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const resId = searchParams.get("id")
  const { resetBooking } = useBooking()

  const [reservation, setReservation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!resId) {
      setLoading(false)
      setError("No se recibió id de reserva")
      return
    }

    let alive = true

    ;(async () => {
      try {
        const res = await getReservationByIdPublicService(resId)
        if (!alive) return
        if (!res?.ok) {
          throw new Error(res?.message || "No se pudo consultar la reserva")
        }
        setReservation(res.data)
      } catch (e: any) {
        if (!alive) return
        setError(e?.message || "No se pudo consultar la reserva")
      } finally {
        if (alive) setLoading(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [resId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <p className="text-muted-foreground">Verificando estado de la reserva...</p>
      </div>
    )
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border text-center">
          <CardContent className="p-8 space-y-4">
            <Hotel className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="font-serif text-xl font-bold text-foreground">Reserva no encontrada</h2>
            <p className="text-muted-foreground">{error || "No se pudo encontrar la reserva solicitada."}</p>
            <Link href="/">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                Volver al inicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const cfg = statusConfig[reservation.status] || statusConfig.PENDING
  const StatusIcon = cfg.icon
  const firstRoom = reservation.rooms?.[0]

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-lg border-border">
        <CardContent className="p-8 space-y-6 text-center">
          <StatusIcon className={`mx-auto h-16 w-16 ${cfg.color}`} />

          <div className="space-y-2">
            <h1 className="font-serif text-2xl font-bold text-foreground">
              {reservation.status === "CONFIRMED" || reservation.status === "APPROVED"
                ? "Pago realizado con éxito"
                : cfg.label}
            </h1>
            <p className="text-muted-foreground">
              {reservation.status === "CONFIRMED" || reservation.status === "APPROVED"
                ? "Tu reserva ha sido confirmada exitosamente."
                : reservation.status === "REJECTED"
                ? "Lo sentimos, tu reserva fue rechazada."
                : "Tu reserva está en proceso de validación."}
            </p>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-3 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Código de reserva</span>
              <span className="font-mono font-bold text-foreground">{reservation.id}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente</span>
              <span className="text-foreground">{reservation.client?.fullName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Habitación</span>
              <span className="text-foreground">{firstRoom?.nameRoom || "-"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Fechas</span>
              <span className="text-foreground">{reservation.startDate} - {reservation.endDate}</span>
            </div>

            <div className="flex justify-between border-t border-border pt-2">
              <span className="font-medium text-foreground">Total</span>
              <span className="text-lg font-bold text-accent">
                ${Number(reservation.totalValue).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-center pt-1">
              <Badge
                variant={
                  reservation.status === "CONFIRMED" || reservation.status === "APPROVED"
                    ? "default"
                    : reservation.status === "REJECTED"
                    ? "destructive"
                    : "secondary"
                }
              >
                {cfg.label}
              </Badge>
            </div>
          </div>

          <Link href="/" onClick={() => resetBooking()}>
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-2">
              <Home className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}