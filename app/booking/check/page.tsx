"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowLeft, FileText, CalendarDays, CreditCard } from "lucide-react"

import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { getReservationsByClientDocumentPublicService } from "@/services/reservation.service"

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  PENDING: { label: "Pendiente", variant: "secondary" },
  PAID_PENDING_APPROVAL: { label: "Pago pendiente aprobación", variant: "secondary" },
  CONFIRMED: { label: "Confirmada", variant: "default" },
  APPROVED: { label: "Aprobada", variant: "default" },
  REJECTED: { label: "Rechazada", variant: "destructive" },
}

type ReservationItem = {
  id: string
  startDate: string
  endDate: string
  status: string
  totalValue: number | string
}

export default function BookingCheckPage() {
  const router = useRouter()

  const [document, setDocument] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reservations, setReservations] = useState<ReservationItem[]>([])

  const handleSearch = async () => {
    if (!document.trim()) {
      setError("Ingresa tu número de cédula o documento.")
      setReservations([])
      return
    }

    setLoading(true)
    setError(null)
    setReservations([])

    try {
      const res = await getReservationsByClientDocumentPublicService(document.trim())

      if (!res?.ok || !res?.data) {
        throw new Error(res?.message || "No se encontraron reservas")
      }

      const normalized = Array.isArray(res.data) ? res.data : [res.data]

      if (normalized.length === 0) {
        throw new Error("No se encontraron reservas para este documento")
      }

      setReservations(normalized)
    } catch (e: any) {
      setError(e?.message || "No se pudo consultar la reserva")
    } finally {
      setLoading(false)
    }
  }

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
              Consulta tus reservas por cédula
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Ingresa el número de documento del titular para consultar todas las reservas asociadas
            </p>
          </div>

          <Card className="border-border shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                <Input
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  placeholder="Ingresa tu cédula o documento"
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

          {reservations.length > 0 && (
            <div className="mt-8">
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                <h2 className="font-serif text-2xl font-bold text-foreground">
                  Reservas encontradas
                </h2>
              </div>

              <div className="grid gap-4">
                {reservations.map((reservation) => {
                  const cfg = statusConfig[reservation.status] || statusConfig.PENDING

                  return (
                    <Card key={reservation.id} className="border-border shadow-md">
                      <CardContent className="p-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <h3 className="font-bold text-foreground">
                                Reserva #{reservation.id}
                              </h3>
                              <Badge variant={cfg.variant}>{cfg.label}</Badge>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CalendarDays className="h-4 w-4 text-accent" />
                                <span>
                                  {String(reservation.startDate)} - {String(reservation.endDate)}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <CreditCard className="h-4 w-4 text-accent" />
                                <span>
                                  Total:{" "}
                                  <strong className="text-foreground">
                                    ${Number(reservation.totalValue || 0).toLocaleString()}
                                  </strong>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 sm:flex-row">
                            <Button
                              variant="outline"
                              onClick={() => router.push(`/booking/success?id=${reservation.id}`)}
                              className="rounded-xl"
                            >
                              Ver detalle
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}