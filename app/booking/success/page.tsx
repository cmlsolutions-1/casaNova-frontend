//app/booking/success/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useBooking } from "@/lib/booking-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, XCircle, Home, Hotel, Loader2 } from "lucide-react"
import Link from "next/link"
import { getReservationByIdPublicService } from "@/services/reservation.service"
import type { ReservationDetailById } from "@/services/reservation.service"

import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  PENDING: {
    label: "Pendiente",
    icon: Clock,
    color: "text-amber-500",
  },
  PAID_PENDING_APPROVAL: {
    label: "Pago recibido - Pendiente de aprobación",
    icon: Clock,
    color: "text-amber-500",
  },
  CONFIRMED: {
    label: "Confirmada",
    icon: CheckCircle2,
    color: "text-green-500",
  },
  APPROVED: {
    label: "Aprobada",
    icon: CheckCircle2,
    color: "text-green-500",
  },
  REJECTED: {
    label: "Rechazada",
    icon: XCircle,
    color: "text-destructive",
  },
}

const FINAL_STATUSES = ["CONFIRMED", "APPROVED", "REJECTED"]
const SUCCESS_STATUSES = ["CONFIRMED", "APPROVED"]

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()

  // Buscar en múltiples parámetros
  const resId = 
    searchParams.get("id") || 
    searchParams.get("external_reference") || 
    searchParams.get("payment_id")

  const paymentStatus = searchParams.get("status")
  const collectionStatus = searchParams.get("collection_status")

  const { resetBooking } = useBooking()

  const [reservation, setReservation] = useState<ReservationDetailById | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!resId) {
      setLoading(false)
      setError("No se recibió el identificador de la reserva en la URL")
      return
    }

    let alive = true
    let timeoutId: NodeJS.Timeout | null = null

    const maxAttempts = 10
    const intervalMs = 3000

    const fetchReservation = async (currentAttempt = 1) => {
      try {
        if (!alive) return

        setAttempt(currentAttempt)

        const res = await getReservationByIdPublicService(resId)
        if (!alive) return

        console.log("RESPUESTA COMPLETA RESERVA:", res)

        const reservationData = res?.data ?? res

        if (!reservationData?.id) {
          throw new Error(res?.message || "No se pudo consultar la reserva")
        }

        setError(null)
        setReservation(reservationData)

        if (FINAL_STATUSES.includes(reservationData.status)) {
          setLoading(false)
          return
        }

        // Si alcanza máximo de intentos
        if (currentAttempt >= maxAttempts) {
          setLoading(false)
          return
        }

        // Reintentar
        timeoutId = setTimeout(() => {
          fetchReservation(currentAttempt + 1)
        }, intervalMs)
      } catch (e: any) {
        if (!alive) return

        console.error("Error consultando reserva:", e)

        if (currentAttempt >= maxAttempts) {
          setReservation(null)
          setError(e?.message || "No se pudo consultar la reserva después de varios intentos")
          setLoading(false)
          return
        }

        timeoutId = setTimeout(() => {
          fetchReservation(currentAttempt + 1)
        }, intervalMs)
      }
    }

    fetchReservation(1)

    return () => {
      alive = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [resId, paymentStatus, collectionStatus])

  function formatDateFromISO(isoString: string): string {
    if (!isoString) return "-"
    // Extrae "YYYY-MM-DD" y divide en partes
    const [year, month, day] = isoString.slice(0, 10).split("-")
    return `${day}-${month}-${year}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border text-center">
          <CardContent className="p-8 space-y-4">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-accent" />

            <h2 className="font-serif text-xl font-bold text-foreground">
              Verificando tu reserva
            </h2>

            <p className="text-muted-foreground">
              Estamos procesando el estado de tu reserva. La página se actualizará automáticamente.
            </p>

            <div className="rounded-lg bg-muted p-4 text-sm text-left space-y-2">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Reserva</span>
                <span className="font-mono text-foreground break-all">{resId}</span>
              </div>

              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Intento</span>
                <span className="text-foreground">
                  {attempt} / 10
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Esto puede tardar unos segundos mientras el sistema confirma tu pago y actualiza la reserva.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md border-border text-center">
          <CardContent className="p-8 space-y-4">
            <Hotel className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="font-serif text-xl font-bold text-foreground">
              Reserva no encontrada
            </h2>
            <p className="text-muted-foreground">
              {error || "No se pudo encontrar la reserva solicitada."}
            </p>

            {resId && (
              <div className="rounded-lg bg-muted p-4 text-sm text-left">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">ID recibido</span>
                  <span className="font-mono text-foreground break-all">{resId}</span>
                </div>
              </div>
            )}

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
  const isSuccess = SUCCESS_STATUSES.includes(reservation.status)

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-lg border-border">
        <CardContent className="p-8 space-y-6 text-center">
          <StatusIcon className={`mx-auto h-16 w-16 ${cfg.color}`} />

          <div className="space-y-2">
            <h1 className="font-serif text-2xl font-bold text-foreground">
              {isSuccess ? "Pago realizado con éxito" : cfg.label}
            </h1>

            <p className="text-muted-foreground">
              {isSuccess
                ? "Tu reserva ha sido confirmada exitosamente."
                : reservation.status === "REJECTED"
                ? "Lo sentimos, tu reserva fue rechazada."
                : "Tu reserva está en proceso de validación y esta página se actualizó automáticamente."}
            </p>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-3 text-left text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Código de reserva</span>
              <span className="font-mono font-bold text-foreground break-all">
                {reservation.id}
              </span>
            </div>

            {!!reservation.reservationCode && (
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Código de verificación</span>
                <span className="font-mono text-foreground">
                  {reservation.reservationCode}
                </span>
              </div>
            )}

            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Cliente</span>
              <span className="text-foreground text-right">
                {reservation.client?.fullName || "-"}
              </span>
            </div>

            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Nro Identificacion</span>
              <span className="text-foreground text-right">
                {reservation.client?.documentNumber || "-"}
              </span>
            </div>

            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Habitación</span>
              <span className="text-foreground text-right">
                {firstRoom?.nameRoom || "-"}
              </span>
            </div>

            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Nro de Personas</span>
              <span className="text-foreground text-right">
                {firstRoom?.numberOfPeople || "-"}
              </span>
            </div>

            

            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Check in</span>
              <span className="text-foreground text-right">
                {formatDateFromISO(reservation.startDate)}
              </span>
            </div>

            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Check out</span>
              <span className="text-foreground text-right">
                {formatDateFromISO(reservation.endDate)}
              </span>
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
                  isSuccess
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

          {!!reservation.services?.length && (
            <div className="text-left">
              <h4 className="mb-2 font-semibold text-foreground">Servicios</h4>
              <div className="flex flex-wrap gap-2">
                {reservation.services.map((service) => (
                  <Badge key={service.id} variant="secondary">
                    {service.name || "Servicio"}
                  </Badge>
                ))}
              </div>
            </div>
          )}

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