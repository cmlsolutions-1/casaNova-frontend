//components/services-otherday.tsx

"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { CalendarDays, PartyPopper, SunMedium, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrencyCOP } from "@/utils/format"
import {
  listServicesPublicService,
  type BackendService,
} from "@/services/service.service"

function getExtraServiceMeta(service: BackendService) {
  const name = service.name.toLowerCase()

  if (name.includes("salon") || name.includes("salón")) {
    return {
      kind: "EVENT_HALL" as const,
      icon: PartyPopper,
      peopleText: "Máximo 150 personas",
      extra: "Horario: 7:00 pm a 2:30 am",
      fallbackImage: "/salon-eventos.jpg",
    }
  }

  return {
    kind: "DAY_PASS" as const,
    icon: SunMedium,
    peopleText: "Mínimo 20 personas",
    extra: "Persona adicional: $25.000 COP",
    fallbackImage: "/pasadia.jpg",
  }
}

export function ServicesOtherDay() {
  const [services, setServices] = useState<BackendService[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true

    ;(async () => {
      try {
        const data = await listServicesPublicService()
        if (!alive) return

        const filtered = (data ?? []).filter(
          (service) => service.status === "ACTIVE" && service.type === "DAY_PASS"
        )

        setServices(filtered)
      } catch {
        if (!alive) return
        setServices([])
      } finally {
        if (alive) setLoading(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [])

  const featured = useMemo(() => services.slice(0, 2), [services])

  return (
    <section id="services" className="px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Tenemos más servicios para ti
          </p>
          <h2 className="text-balance font-serif text-3xl font-bold text-foreground md:text-5xl">
            Otros servicios
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Disfruta de nuestro servicio de pasadía o reserva el salón de eventos
            para compartir un día diferente con familia y amigos.
          </p>
        </div>

        {loading && (
          <p className="text-center text-muted-foreground">Cargando servicios...</p>
        )}

        {!loading && featured.length === 0 && (
          <p className="text-center text-muted-foreground">
            No hay servicios disponibles en este momento.
          </p>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {featured.map((service) => {
            const meta = getExtraServiceMeta(service)
            const Icon = meta.icon
            const image = service.images?.[0]?.url || meta.fallbackImage

            return (
              <div
                key={service.id}
                className="group overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={image}
                    alt={service.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                      <Icon className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <span className="text-lg font-bold text-white">
                      {formatCurrencyCOP(service.price)}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-card-foreground">{service.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-accent" />
                      <span>{meta.peopleText}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-accent" />
                      <span>{meta.extra}</span>
                    </div>
                  </div>

                  <Link href={`/booking/extra-service/${service.id}`} className="mt-5 block">
                    <Button className="w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Reservar ahora
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}