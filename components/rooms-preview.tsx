// components/rooms-preview.tsx
"use client"

import Link from "next/link"
import {
  listRoomsPublicService,
  type BackendRoom,
  type RoomType,
} from "@/services/room.service"
import React, { useEffect, useMemo, useState, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bed, Users, Eye, ChevronLeft, ChevronRight, X, Expand } from "lucide-react"
import { formatCurrencyCOP } from "@/utils/format"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog"

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

  // Estado para la galería modal
  const [selectedRoom, setSelectedRoom] = useState<BackendRoom | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    let alive = true

    ;(async () => {
      try {
        const data = await listRoomsPublicService()
        if (!alive) return
        setRooms((data ?? []).filter((r) => r.status === "ACTIVE"))
      } finally {
        if (alive) setLoading(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [])

  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) =>
      a.nameRoom.localeCompare(b.nameRoom, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    )
  }, [rooms])

  // Abrir galería
  const openGallery = useCallback((room: BackendRoom) => {
    setSelectedRoom(room)
    setCurrentImageIndex(0)
  }, [])

  // Cerrar galería
  const closeGallery = useCallback(() => {
    setSelectedRoom(null)
    setCurrentImageIndex(0)
  }, [])

  // Navegación
  const nextImage = useCallback(() => {
    if (!selectedRoom?.images?.length) return
    setCurrentImageIndex((prev) =>
      prev >= selectedRoom.images.length - 1 ? 0 : prev + 1
    )
  }, [selectedRoom?.images?.length])

  const prevImage = useCallback(() => {
    if (!selectedRoom?.images?.length) return
    setCurrentImageIndex((prev) =>
      prev <= 0 ? selectedRoom.images.length - 1 : prev - 1
    )
  }, [selectedRoom?.images?.length])

  // Soporte para teclado
  useEffect(() => {
    if (!selectedRoom) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextImage()
      if (e.key === "ArrowLeft") prevImage()
      if (e.key === "Escape") closeGallery()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedRoom, nextImage, prevImage, closeGallery])

  const currentImage = selectedRoom?.images?.[currentImageIndex]?.url

  return (
    <section id="rooms" className="bg-secondary/50 py-20 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center space-y-6">
          <div className="inline-flex items-center justify-center">
            <span className="rounded-full bg-accent px-5 py-2 text-xs font-bold uppercase tracking-[0.25em] text-accent-foreground border-2 border-accent-foreground/20 shadow-xl transition-shadow hover:shadow-lg">
              Alojamiento de Lujo
            </span>
          </div>

          <h2 className="font-serif text-4xl font-extrabold tracking-tight text-foreground md:text-6xl lg:text-7xl text-balance">
            Nuestras Habitaciones
          </h2>

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
            const firstImage = room.images?.[0]?.url || "/placeholder.svg"

            return (
              <div
                key={room.id}
                className="group flex flex-col h-full overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Imagen clicable con overlay */}
                <div
                  className="relative h-56 overflow-hidden cursor-pointer"
                  onClick={() => openGallery(room)}
                >
                  <img
                    src={firstImage}
                    alt={`Habitación ${room.nameRoom}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Overlay con ícono */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-foreground shadow-lg">
                        <Expand className="h-4 w-4" />
                        Ver galería
                      </span>
                    </div>
                  </div>

                  {/* Badge de contador */}
                  {room.images && room.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                      {room.images.length} fotos
                    </div>
                  )}
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

        {/* Galería Modal Global */}
        <Dialog open={!!selectedRoom} onOpenChange={(open) => !open && closeGallery()}>
          <DialogContent className="max-w-5xl p-0 overflow-hidden bg-background">
            <DialogHeader className="sr-only">
              <DialogTitle>
                Galería de {selectedRoom?.nameRoom}
              </DialogTitle>
            </DialogHeader>

            {selectedRoom && (
              <div className="relative">
                {/* Imagen principal */}
                <div className="aspect-video w-full bg-black">
                  <img
                    src={currentImage || "/placeholder.svg"}
                    alt={`${selectedRoom.nameRoom} - Foto ${currentImageIndex + 1}`}
                    className="h-full w-full object-contain"
                  />
                </div>

                {/* Botón cerrar */}
                <button
                  onClick={closeGallery}
                  className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                  aria-label="Cerrar galería"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Controles de navegación */}
                {selectedRoom.images && selectedRoom.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                      aria-label="Foto anterior"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>

                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                      aria-label="Foto siguiente"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>

                    {/* Indicador de posición */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-sm text-white">
                      {currentImageIndex + 1} / {selectedRoom.images.length}
                    </div>
                  </>
                )}

                {/* Título de habitación */}
                <div className="absolute bottom-4 left-4 rounded-lg bg-black/60 px-3 py-1.5 text-sm font-medium text-white">
                  Hab. {selectedRoom.nameRoom}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}