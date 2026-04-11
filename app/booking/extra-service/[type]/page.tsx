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

import { DescriptionParser } from "@/components/description-parser"

// Configuración DAY_PASS
const DAY_PASS_MIN_PEOPLE = 10
const DAY_PASS_MAX_PEOPLE = 100
const DAY_PASS_PRICE_PER_PERSON = 25000

// Configuración EVENT_HALL
const EVENT_HALL_DEFAULT_CAPACITY = 150

// Detectar tipo de servicio
function getExtraServiceKind(serviceName: string): "DAY_PASS" | "EVENT_HALL" {
  const name = serviceName.toLowerCase()
  if (name.includes("salon") || name.includes("salón")) {
    return "EVENT_HALL"
  }
  return "DAY_PASS"
}

// Extraer capacidad del nombre del servicio (ej: "Salón 100 personas" → 100)
function getEventHallCapacity(serviceName: string): number {
  const match = serviceName.match(/(\d+)\s*(personas|personas?)/i)
  if (match && match[1]) {
    return parseInt(match[1], 10)
  }
  // Si no encuentra número, usar valor por defecto
  return EVENT_HALL_DEFAULT_CAPACITY
}

export default function ExtraServiceBookingPage() {
  const router = useRouter()
  const params = useParams()
  const { setExtraBooking } = useBooking()

  const serviceId = String(params.type)

  const [service, setService] = useState<BackendService | null>(null)
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState("")
  const [people, setPeople] = useState(DAY_PASS_MIN_PEOPLE)
  const [error, setError] = useState("")

  // Capacidad fija para EVENT_HALL (extraída del nombre)
  const eventHallCapacity = useMemo(() => {
    if (!service) return EVENT_HALL_DEFAULT_CAPACITY
    const kind = getExtraServiceKind(service.name)
    if (kind === "EVENT_HALL") {
      return getEventHallCapacity(service.name)
    }
    return EVENT_HALL_DEFAULT_CAPACITY
  }, [service])

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
          if (kind === "DAY_PASS") {
            setPeople(DAY_PASS_MIN_PEOPLE)
          } else {
            // Para EVENT_HALL, usar la capacidad fija del servicio
            setPeople(getEventHallCapacity(found.name))
          }
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

  // Cálculo del total
  const total = useMemo(() => {
    if (!service || !kind) return 0

    if (kind === "DAY_PASS") {
      // DAY_PASS: personas × $25.000
      return people * DAY_PASS_PRICE_PER_PERSON
    }

    // EVENT_HALL: precio fijo del servicio
    return Number(service.price)
  }, [service, kind, people])

  // Desglose para DAY_PASS
  const priceBreakdown = useMemo(() => {
    if (!service || kind !== "DAY_PASS") return null

    return {
      pricePerPerson: DAY_PASS_PRICE_PER_PERSON,
      people,
      total: people * DAY_PASS_PRICE_PER_PERSON,
    }
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

    if (kind === "DAY_PASS") {
      if (people < DAY_PASS_MIN_PEOPLE) {
        setError(`El pasadía requiere mínimo ${DAY_PASS_MIN_PEOPLE} personas.`)
        return
      }
      if (people > DAY_PASS_MAX_PEOPLE) {
        setError(`El pasadía permite máximo ${DAY_PASS_MAX_PEOPLE} personas.`)
        return
      }
    }

    // EVENT_HALL no necesita validación de personas (es fija)

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
        <div className="mt-4 max-w-2xl">
          <DescriptionParser 
            text={service.decription || ""} 
            className="max-w-2xl"
          />
        </div>
      </div>

      <Card className="border-border shadow-lg">
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-5">
              {/* Fecha */}
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

              {/* Selector de personas SOLO para DAY_PASS */}
              {kind === "DAY_PASS" && (
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
                          setPeople((prev) => Math.max(DAY_PASS_MIN_PEOPLE, prev - 1))
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-secondary"
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setPeople((prev) => Math.min(DAY_PASS_MAX_PEOPLE, prev + 1))
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-secondary"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="mt-2 text-xs text-muted-foreground">
                    Mínimo {DAY_PASS_MIN_PEOPLE} personas | Máximo {DAY_PASS_MAX_PEOPLE} personas | ${DAY_PASS_PRICE_PER_PERSON.toLocaleString()} por persona
                  </p>
                </div>
              )}

              {/* Para EVENT_HALL mostrar capacidad fija (sin selector) */}
              {kind === "EVENT_HALL" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Capacidad del salón
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-4 py-3">
                    <Users className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium text-foreground">
                      {eventHallCapacity} personas (capacidad fija)
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Este salón tiene capacidad fija para {eventHallCapacity} personas. No es posible modificar la cantidad.
                  </p>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>

            {/* Resumen */}
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

                {kind === "DAY_PASS" && priceBreakdown && (
                  <>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Precio por persona</span>
                      <span className="font-medium text-foreground">
                        {formatCurrencyCOP(priceBreakdown.pricePerPerson)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">
                        {priceBreakdown.people} persona(s) × {formatCurrencyCOP(priceBreakdown.pricePerPerson)}
                      </span>
                      <span className="font-medium text-foreground">
                        {formatCurrencyCOP(priceBreakdown.total)}
                      </span>
                    </div>
                  </>
                )}

                {kind === "EVENT_HALL" && (
                  <>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Capacidad</span>
                      <span className="font-medium text-foreground">
                        {eventHallCapacity} personas
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">Horario</span>
                      <span className="font-medium text-foreground">6:00 pm a 3:00 am</span>
                    </div>
                  </>
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