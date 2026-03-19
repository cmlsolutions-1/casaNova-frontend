//app/booking/extra-service/[type]/page.tsx

"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, CalendarDays, Minus, Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useBooking } from "@/lib/booking-context"
import { formatCurrencyCOP } from "@/utils/format"
import {
  listServicesPublicService,
  type BackendService,
} from "@/services/service.service"

function getExtraServiceKind(serviceName: string): "DAY_PASS" | "EVENT_HALL" {
  const name = serviceName.toLowerCase()

  if (name.includes("salon") || name.includes("salón")) {
    return "EVENT_HALL"
  }

  return "DAY_PASS"
}

export default function ExtraServiceBookingPage() {
  const router = useRouter()
  const params = useParams()
  const { setExtraBooking } = useBooking()

  const serviceId = String(params.type)

  const [service, setService] = useState<BackendService | null>(null)
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState("")
  const [people, setPeople] = useState(20)
  const [error, setError] = useState("")

  useEffect(() => {
    let alive = true

    ;(async () => {
      try {
        setLoading(true)

        const services = await listServicesPublicService()
        if (!alive) return

        const found = (services ?? []).find(
          (item) => item.id === serviceId && item.status === "ACTIVE" && item.type === "DAY_PASS"
        )

        setService(found || null)

        if (found) {
          const kind = getExtraServiceKind(found.name)
          setPeople(kind === "DAY_PASS" ? 20 : 1)
        }
      } catch {
        if (!alive) return
        setService(null)
      } finally {
        if (alive) setLoading(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [serviceId])

  const kind = service ? getExtraServiceKind(service.name) : null

  const total = useMemo(() => {
    if (!service || !kind) return 0

    if (kind === "DAY_PASS") {
      const extraPeople = Math.max(0, people - 20)
      return Number(service.price) + extraPeople * 25000
    }

    return Number(service.price)
  }, [service, kind, people])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-muted-foreground">Cargando servicio...</p>
      </div>
    )
  }

  if (!service || !kind) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-muted-foreground">Servicio no válido.</p>
      </div>
    )
  }

  const handleContinue = () => {
    setError("")

    if (!date) {
      setError("Debes seleccionar una fecha.")
      return
    }

    if (kind === "DAY_PASS" && people < 20) {
      setError("El pasadía requiere mínimo 20 personas.")
      return
    }

    if (kind === "EVENT_HALL" && people > 150) {
      setError("El salón de eventos permite máximo 150 personas.")
      return
    }

    setExtraBooking({
      serviceId: service.id,
      serviceName: service.name,
      kind,
      date,
      people,
      totalPrice: total,
    })

    router.push("/booking/guest")
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Button variant="outline" onClick={() => router.back()} className="mb-6 rounded-xl">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          Reserva especial
        </p>
        <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
          {service.name}
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{service.description}</p>
      </div>

      <Card className="border-border shadow-lg">
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Fecha de reserva
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="rounded-xl pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Cantidad de personas
                </label>
                <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4 text-accent" />
                    <span>{people} personas</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setPeople((prev) =>
                          Math.max(kind === "DAY_PASS" ? 20 : 1, prev - 1)
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-secondary"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setPeople((prev) =>
                          Math.min(kind === "EVENT_HALL" ? 150 : 300, prev + 1)
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-secondary"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-secondary/50 p-5">
              <h2 className="mb-4 font-serif text-xl font-bold text-foreground">
                Resumen
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Servicio</span>
                  <span className="font-medium text-foreground">{service.name}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Fecha</span>
                  <span className="font-medium text-foreground">
                    {date || "Sin seleccionar"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Personas</span>
                  <span className="font-medium text-foreground">{people}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Condición</span>
                  <span className="font-medium text-foreground">
                    {kind === "DAY_PASS" ? "Mínimo 20 personas" : "Máximo 150 personas"}
                  </span>
                </div>

                {kind === "EVENT_HALL" && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Horario</span>
                    <span className="font-medium text-foreground">7:00 pm a 2:30 am</span>
                  </div>
                )}

                {kind === "DAY_PASS" && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Adicional</span>
                    <span className="font-medium text-foreground">$25.000 por persona</span>
                  </div>
                )}

                <div className="border-t border-border pt-3">
                  <div className="flex justify-between gap-4">
                    <span className="font-medium text-foreground">Total</span>
                    <span className="text-lg font-bold text-accent">
                      {formatCurrencyCOP(total)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleContinue}
                className="mt-6 h-auto w-full rounded-xl bg-accent px-8 py-3 font-semibold text-accent-foreground hover:bg-accent/90"
              >
                Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}