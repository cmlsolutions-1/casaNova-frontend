//app/booking/check/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowLeft, FileText, CalendarDays, CreditCard, ShieldCheck } from "lucide-react"

import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { formatDateSpanish } from "@/utils/date"
import { formatCurrencyCOP } from "@/utils/format"

import { getReservationByClientAndCodePublicService } from "@/services/reservation.service"
import type { ReservationByClientItem } from "@/services/reservation.service"

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  PENDING: { label: "Pendiente", variant: "secondary" },
  PAID_PENDING_APPROVAL: { label: "Pago pendiente aprobación", variant: "secondary" },
  CONFIRMED: { label: "Confirmada", variant: "default" },
  APPROVED: { label: "Aprobada", variant: "default" },
  REJECTED: { label: "Rechazada", variant: "destructive" },
}

/* type ReservationRoom = {
  id: string
  nameRoom: string
  price: number
  numberOfPeople: string
  images: string[]
}

type ReservationItem = {
  id: string
  startDate: string
  endDate: string
  reservationCode?: number | string
  status: string
  totalValue: number | string
  client?: {
    id: string
    fullName: string
    documentNumber: string
  }
  rooms?: ReservationRoom[]
  services?: any[]
} */

export default function BookingCheckPage() {
  const router = useRouter()

  const [document, setDocument] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reservation, setReservation] = useState<ReservationByClientItem  | null>(null)

  const handleSearch = async () => {
    if (!document.trim()) {
      setError("Ingresa tu número de cédula o documento.")
      setReservation(null)
      return
    }

    if (!code.trim()) {
      setError("Ingresa el código de verificación de la reserva.")
      setReservation(null)
      return
    }

    setLoading(true)
    setError(null)
    setReservation(null)

    try {
      const res = await getReservationByClientAndCodePublicService(
        document.trim(),
        code.trim(),
      )


      console.log("RESPUESTA COMPLETA:", res)
      
      if (!res?.id) {
        throw new Error("No se encontró la reserva")
      }

      setReservation(res)
    } catch (e: any) {
      setError(e?.message || "No se pudo consultar la reserva")
    } finally {
      setLoading(false)
    }
  }

  const totalGuests =
  reservation?.rooms?.reduce((acc, room) => {
    return acc + Number(room.numberOfPeople || 0)
  }, 0) ?? 0

  console.log("reservation", reservation)
console.log("rooms", reservation?.rooms)
console.log("numberOfPeople room 0", reservation?.rooms?.[0]?.numberOfPeople)

  return (
    <main>
      <PublicHeader />

      <div className="min-h-screen bg-background pt-28">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-6 rounded-xl"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>

          <div className="mb-8 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              Consulta de reserva
            </p>
            <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
              Consulta tu reserva
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Ingresa tu número de documento y el código de verificación para consultar tu reserva
            </p>
          </div>

          <Card className="border-border shadow-lg">
            <CardContent className="p-6">
              <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                <Input
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  placeholder="Ingresa tu cédula o documento"
                  className="rounded-xl"
                />

                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ingresa el código de verificación"
                  className="rounded-xl"
                />

                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <Search className="mr-2 h-4 w-4" />
                  {loading ? "Consultando..." : "Consultar"}
                </Button>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {reservation && (
          <div className="mt-8">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              <h2 className="font-serif text-2xl font-bold text-foreground">
                Reserva encontrada
              </h2>
            </div>

            <Card className="border-border shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-bold text-foreground">
                        Reserva #{reservation.reservationCode ?? "—"}
                      </h3>

                      <Badge variant={(statusConfig[reservation.status] || statusConfig.PENDING).variant}>
                        {(statusConfig[reservation.status] || statusConfig.PENDING).label}
                      </Badge>
                    </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarDays className="h-4 w-4 text-accent" />
                          <div className="flex flex-col text-sm text-muted-foreground">
                            <span>
                              <strong>Fecha de ingreso:</strong>{" "}
                              {formatDateSpanish(reservation.startDate)}
                            </span>

                              <span>
                                <strong>Fecha de salida:</strong>{" "}
                                {formatDateSpanish(reservation.endDate)}
                              </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CreditCard className="h-4 w-4 text-accent" />
                          <span>
                            Total:{" "}
                            <strong className="text-foreground">
                              {formatCurrencyCOP(reservation.totalValue)}
                            </strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ShieldCheck className="h-4 w-4 text-accent" />
                          <span>
                            Cantidad de personas:{" "}
                            <strong className="text-foreground">{totalGuests}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        variant="outline"
                        onClick={() =>
                          router.push(
                            `/booking/success?id=${reservation.id}&document=${document}&code=${code}`
                          )
                        }
                        className="rounded-xl"
                      >
                        Ver detalle
                      </Button>
                    </div>
                  </div>

                  {!!reservation.rooms?.length && (
                    <div className="mt-6">
                      <h4 className="mb-2 font-semibold text-foreground">Habitaciones</h4>
                      <div className="flex flex-wrap gap-2">
                        {reservation.rooms.map((room) => (
                            <Badge key={room.id} variant="secondary">
                              {room.nameRoom}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}

                  {!!reservation.services?.length && (
                    <div className="mt-6">
                      <h4 className="mb-2 font-semibold text-foreground">Servicios</h4>
                      <div className="flex flex-wrap gap-2">
                        {reservation.services.map((service, index) => (
                          <Badge key={`${service}-${index}`} variant="secondary">
                            {service.name || "Servicio"}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}