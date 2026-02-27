//components/rooms-preview.tsx
"use client";

import Link from "next/link";
import { listRoomsPublicService, type BackendRoom } from "@/services/room.service"
import React, { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bed, Users, Eye } from "lucide-react";

export function RoomsPreview() {
  const [rooms, setRooms] = useState<BackendRoom[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const data = await listRoomsPublicService()
        if (!alive) return
        // opcional: solo activas
        setRooms((data ?? []).filter((r) => r.status === "ACTIVE"))
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const featured = useMemo(() => rooms.slice(0, 3), [rooms])

  return (
    <section id="rooms" className="bg-secondary/50 py-20 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Alojamiento de lujo
          </p>
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-5xl text-balance">
            Nuestras Habitaciones
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Cada habitacion ha sido disenada con atencion al detalle para
            ofrecer el maximo confort y elegancia.
          </p>
        </div>

        {loading && (
          <p className="text-center text-muted-foreground">Cargando habitaciones...</p>
        )}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((room) => {
            const img = room.images?.[0]?.url || "/placeholder.svg"

            return (
              <div key={room.id} className="group overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={img}
                    alt={`Habitación ${room.nameRoom}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant="secondary" className="capitalize text-xs">
                      {room.type}
                    </Badge>

                    <span className="text-xl font-bold text-foreground">
                      ${room.price}
                      <span className="text-sm font-normal text-muted-foreground">/noche</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-card-foreground">
                    Hab. {room.nameRoom}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {room.description}
                  </p>

                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {room.capacity} pers.
                    </span>

                    <span className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      {room.singleBeds + room.doubleBeds} camas
                    </span>
                  </div>

                  <Link href={`/rooms/${room.id}`} className="mt-4 block">
                    <Button variant="outline" className="w-full rounded-xl border-accent text-accent hover:bg-accent hover:text-accent-foreground bg-transparent">
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalles
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