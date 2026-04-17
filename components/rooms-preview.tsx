//components/rooms-preview.tsx
"use client";

import Link from "next/link";
import { listRoomsPublicService, type BackendRoom, type RoomType } from "@/services/room.service"
import React, { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bed, Users, Eye } from "lucide-react";
import { formatCurrencyCOP } from "@/utils/format"
import { AutoImageCarousel } from "@/components/auto-image-carousel"

const ROOM_TYPE_LABEL: Record<RoomType, string> = {
  SIMPLE: "Simple",
  DOUBLE: "Doble",
  TRIPLE: "Triple",
  QUADRUPLE: "Cuádruple",
  QUINTUPLE: "Quíntuple",
  SEXTUPLE: "Séxtuple",
  VIP: "VIP",
}

export function RoomsPreview() {
  const [rooms, setRooms] = useState<BackendRoom[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true

    ;(async () => {
      try {
        const data = await listRoomsPublicService()
        if (!alive) return
        // Filtrar solo habitaciones activas
        setRooms((data ?? []).filter((r) => r.status === "ACTIVE"))
      } finally {
        if (alive) setLoading(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [])

  // Ordenar todas las habitaciones de forma ascendente (numérica y alfabética)
  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) =>
      a.nameRoom.localeCompare(b.nameRoom, undefined, {
        numeric: true,      // "Hab 2" antes que "Hab 10"
        sensitivity: "base", //  Ignora mayúsculas/minúsculas
      })
    )
  }, [rooms])

  return (
    <section id="rooms" className="bg-secondary/50 py-20 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center space-y-6">
        {/* Badge superior más destacado */}
        <div className="inline-flex items-center justify-center">
        <span className="rounded-full bg-accent px-5 py-2 text-xs font-bold uppercase tracking-[0.25em] text-accent-foreground border-2 border-accent-foreground/20">
          Alojamiento de Lujo
        </span>
      </div>

        {/* Título más grande, negrita extrema y balanceado */}
        <h2 className="font-serif text-4xl font-extrabold tracking-tight text-foreground md:text-6xl lg:text-7xl text-balance">
          Nuestras Habitaciones
        </h2>

        {/* Descripción corregida: sin </span> sobrante */}
        <p className="mx-auto max-w-3xl text-lg md:text-xl font-medium leading-relaxed text-foreground/90">
          Cada habitación ha sido diseñada con{" "}
          <span className="font-bold text-accent">atención al detalle</span> para ofrecer el{" "}
          <span className="font-bold text-foreground">máximo confort</span> y elegancia en el corazón del Eje Cafetero.
        </p>
      </div>

        {loading && (
          <p className="text-center text-muted-foreground">Cargando habitaciones...</p>
        )}

        {!loading && sortedRooms.length === 0 && (
          <p className="text-center text-muted-foreground">
            No hay habitaciones disponibles en este momento.
          </p>
        )}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {sortedRooms.map((room) => {
            return (
              <div 
                key={room.id} 
                className="group flex flex-col h-full overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                <div className="relative h-56 overflow-hidden">
                  <div className="h-full w-full transition-transform duration-500 group-hover:scale-110">
                    <AutoImageCarousel
                      images={room.images}
                      alt={`Habitación ${room.nameRoom}`}
                      fallback="/placeholder.svg"
                      interval={3200}
                      showDots={(room.images?.length ?? 0) > 1}
                      className="h-full w-full"
                    />
                  </div>
                </div>

                <div className="flex flex-col flex-1 p-5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {ROOM_TYPE_LABEL[room.type]}
                    </Badge>

                    <span className="text-lg font-bold text-foreground">
                      {formatCurrencyCOP(room.price)}
                      <span className="ml-1 text-sm font-normal text-muted-foreground">
                        / noche
                      </span>
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
                      {room.singleBeds + room.doubleBeds + room.cabin + room.extraDouble} camas
                    </span>
                  </div>

                 <Link href={`/rooms/${room.id}`} className="mt-auto pt-4 block">
                    {/* Botón sólido amarillo, sin transparencia, texto contrastante */}
                    <Button className="w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">
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