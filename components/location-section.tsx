// components/location-section.tsx
"use client"

import React from "react"

const MAPS_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3873.5419645553925!2d-75.66885978959098!3d4.573787095381599!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e38f5636c0cc8db%3A0x244ec53765df8fd1!2sCasa%20Nova!5e1!3m2!1ses!2sco!4v1772290822179!5m2!1ses!2sco"

export function LocationSection() {
  return (
    <section id="location" className="bg-secondary/50 py-20 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            ¿Dónde estamos?
          </p>
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-5xl text-balance">
            Ubicación del Hotel
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Encuéntranos fácilmente y llega sin complicaciones.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Info */}
          <div className="lg:col-span-2 rounded-2xl bg-card p-6 shadow-lg">
            <h3 className="text-lg font-bold text-card-foreground">Hotel Casanova</h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Dirección: <span className="font-medium text-foreground">Hojas anchas</span>
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Ciudad: <span className="font-medium text-foreground">Circasia, Colombia</span>
            </p>

            <p className="mt-4 text-sm text-muted-foreground">
              Puedes abrir la ubicación en Google Maps y trazar tu ruta.
            </p>

            <a
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent/90"
              href={MAPS_EMBED_URL.replace("embed?", "?")}
              target="_blank"
              rel="noreferrer"
            >
              Abrir en Google Maps
            </a>
          </div>

          {/* Map */}
          <div className="lg:col-span-3 overflow-hidden rounded-2xl bg-card shadow-lg">
            <div className="relative aspect-[16/10] w-full">
              <iframe
                title="Mapa - Ubicación del hotel"
                src={MAPS_EMBED_URL}
                className="absolute inset-0 h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}