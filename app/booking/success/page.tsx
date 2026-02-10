"use client"

import { useSearchParams } from "next/navigation"
import { useBooking } from "@/lib/booking-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, XCircle, Home, Hotel } from "lucide-react"
import Link from "next/link"

const statusConfig = {
  PENDING: { label: "Pendiente", icon: Clock, color: "text-amber-500" },
  PAID_PENDING_APPROVAL: { label: "Pago recibido - Pendiente de aprobacion", icon: Clock, color: "text-amber-500" },
  APPROVED: { label: "Aprobada", icon: CheckCircle2, color: "text-green-500" },
  REJECTED: { label: "Rechazada", icon: XCircle, color: "text-destructive" },
}

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const resId = searchParams.get("id")
  const { reservations, rooms, resetBooking } = useBooking()

  const reservation = reservations.find((r) => r.id === resId)

  if (!reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border text-center">
          <CardContent className="p-8 space-y-4">
            <Hotel className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="font-serif text-xl font-bold text-foreground">Reserva no encontrada</h2>
            <p className="text-muted-foreground">No se pudo encontrar la reserva solicitada.</p>
            <Link href="/">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Volver al inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const room = rooms.find((r) => r.id === reservation.roomId)
  const cfg = statusConfig[reservation.status]
  const StatusIcon = cfg.icon

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-lg border-border">
        <CardContent className="p-8 space-y-6 text-center">
          <StatusIcon className={`mx-auto h-16 w-16 ${cfg.color}`} />

          <div className="space-y-2">
            <h1 className="font-serif text-2xl font-bold text-foreground">
              {reservation.status === "PAID_PENDING_APPROVAL" ? "Pago Recibido" : cfg.label}
            </h1>
            <p className="text-muted-foreground">
              {reservation.status === "PAID_PENDING_APPROVAL"
                ? "Su pago fue procesado exitosamente. Un administrador revisara y aprobara su reserva."
                : reservation.status === "APPROVED"
                ? "Su reserva ha sido aprobada. Le esperamos."
                : reservation.status === "REJECTED"
                ? "Lo sentimos, su reserva ha sido rechazada. Contacte recepcion."
                : "Su reserva esta en proceso."}
            </p>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-3 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Codigo de reserva</span>
              <span className="font-mono font-bold text-foreground">{reservation.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Habitacion</span>
              <span className="text-foreground">{room?.name || reservation.roomId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fechas</span>
              <span className="text-foreground">{reservation.startDate} - {reservation.endDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Huespedes</span>
              <span className="text-foreground">{reservation.adults + reservation.kids + reservation.babies} personas</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="font-medium text-foreground">Total</span>
              <span className="text-lg font-bold text-accent">${reservation.totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-center pt-1">
              <Badge variant={reservation.status === "APPROVED" ? "default" : reservation.status === "REJECTED" ? "destructive" : "secondary"}>
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
