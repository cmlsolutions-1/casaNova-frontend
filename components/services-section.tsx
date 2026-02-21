//components/services-section.tsx
"use client"

import React from "react"

import { Sparkles, Coffee, Car, Map, Clock, Wine } from "lucide-react"
import { services } from "@/lib/mock-data"

const iconMap: Record<string, React.ElementType> = {
  Sparkles,
  Coffee,
  Car,
  Map,
  Clock,
  Wine,
}

export function ServicesSection() {
  return (
    <section id="services" className="py-20 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Experiencias exclusivas
          </p>
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-5xl text-balance">
            Servicios Adicionales
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Disfrute de una gama completa de servicios disenados para hacer de su
            estancia una experiencia inolvidable agregados a tu reserva.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = iconMap[service.icon] || Sparkles
            return (
              <div
                key={service.id}
                className="group relative overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.images[0] || "/placeholder.svg"}
                    alt={service.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                      <Icon className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <span className="text-lg font-bold text-white">${service.price} USD</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-card-foreground">{service.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
