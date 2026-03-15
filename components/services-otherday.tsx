"use client"

import Link from "next/link"
import { CalendarDays, PartyPopper, SunMedium, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrencyCOP } from "@/utils/format"

const options = [
  {
    id: "DAY_PASS",
    title: "Pasadía",
    description:
      "Ideal para disfrutar un día especial con familia y amigos. Mínimo 20 personas.",
    price: 500000,
    extra: "Persona adicional: $25.000 COP",
    icon: SunMedium,
    image: "/pasadia.jpg",
  },
  {
    id: "EVENT_HALL",
    title: "Salón de eventos",
    description:
      "Reserva nuestro salón social para celebraciones, reuniones y eventos especiales.",
    price: 2000000,
    extra: "Horario: 7:00 pm a 2:30 am · Aforo máximo: 150 personas",
    icon: PartyPopper,
    image: "/salon-eventos.jpg",
  },
]

export function ServicesOtherDay() {
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

        <div className="grid gap-6 md:grid-cols-2">
          {options.map((service) => {
            const Icon = service.icon

            return (
              <div
                key={service.id}
                className="group overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
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
                  <h3 className="text-lg font-bold text-card-foreground">{service.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>

                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-accent" />
                      <span>{service.id === "DAY_PASS" ? "Mínimo 20 personas" : "Máximo 150 personas"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-accent" />
                      <span>{service.extra}</span>
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