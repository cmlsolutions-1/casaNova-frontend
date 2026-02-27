// app/rooms/[id]/page.tsx
"use client"

import React, { Suspense, useEffect, useMemo, useState } from "react"
import { use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"

import { useBooking } from "@/lib/booking-context"
import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Users,
  Bed,
  Check,
} from "lucide-react"

import { getRoomPublicService, type BackendRoom } from "@/services/room.service"

function RoomDetailContent({ roomId }: { roomId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setSelectedRoom, booking, setSearchParams } = useBooking()

  const [room, setRoom] = useState<BackendRoom | null>(null)
  const [loadingRoom, setLoadingRoom] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)

  // Cargar habitación desde backend (PUBLICO)
  useEffect(() => {
    let alive = true
    setLoadingRoom(true)

    ;(async () => {
      try {
        const data = await getRoomPublicService(roomId)
        if (!alive) return
        setRoom(data)
        setImgIdx(0)
      } catch {
        if (!alive) return
        setRoom(null)
      } finally {
        if (alive) setLoadingRoom(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [roomId])

  // Params de búsqueda (se conservan)
  const start = searchParams.get("start") || booking.searchParams?.startDate || ""
  const end = searchParams.get("end") || booking.searchParams?.endDate || ""
  const adults = Number(searchParams.get("adults")) || booking.searchParams?.adults || 2
  const kids = Number(searchParams.get("kids")) || booking.searchParams?.kids || 0
  const babies = Number(searchParams.get("babies")) || booking.searchParams?.babies || 0
  const pets = Number(searchParams.get("pets")) || booking.searchParams?.pets || 0

  // Normaliza urls (backend devuelve [{id,url}])
  const imageUrls = useMemo(() => {
    const urls = (room?.images ?? []).map((x: any) => x?.url).filter(Boolean)
    return urls.length ? urls : ["/placeholder.svg"]
  }, [room])

  const prevImg = () => setImgIdx((p) => (p === 0 ? imageUrls.length - 1 : p - 1))
  const nextImg = () => setImgIdx((p) => (p + 1) % imageUrls.length)

  const handleSelect = () => {
    if (!room) return
    setSelectedRoom(room as any) // si tu SelectedRoom type es distinto, te lo ajusto luego
    if (start && end) {
      setSearchParams({ startDate: start, endDate: end, adults, kids, babies, pets })
    }
    router.push("/booking/services")
  }

  if (loadingRoom) {
    return (
      <div className="flex items-center justify-center py-40 text-muted-foreground">
        Cargando...
      </div>
    )
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center">
        <h2 className="text-xl font-bold">Habitación no encontrada</h2>
        <Link href="/">
          <Button className="mt-4 bg-accent text-accent-foreground">Volver al inicio</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href={
          start
            ? `/search?start=${start}&end=${end}&adults=${adults}&kids=${kids}&babies=${babies}&pets=${pets}`
            : "/"
        }
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a resultados
      </Link>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Gallery */}
        <div className="lg:col-span-3">
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={imageUrls[imgIdx] || "/placeholder.svg"}
              alt={`Habitación ${room.nameRoom} - foto ${imgIdx + 1}`}
              className="aspect-[4/3] w-full object-cover"
            />

            {imageUrls.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImg}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={nextImg}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                  aria-label="Foto siguiente"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {imageUrls.map((_, i) => (
                <button
                  key={`dot-${i}`}
                  type="button"
                  onClick={() => setImgIdx(i)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === imgIdx ? "w-6 bg-accent" : "w-2 bg-white/60",
                  )}
                  aria-label={`Ver foto ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto">
            {imageUrls.map((img, i) => (
              <button
                key={`${img}-${i}`}
                type="button"
                onClick={() => setImgIdx(i)}
                className={cn(
                  "flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                  i === imgIdx ? "border-accent" : "border-transparent opacity-60 hover:opacity-100",
                )}
              >
                <img src={img || "/placeholder.svg"} alt="" className="h-16 w-24 object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-card p-6 shadow-lg">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="secondary" className="capitalize">{room.type}</Badge>
            </div>

            <h1 className="font-serif text-2xl font-bold text-card-foreground md:text-3xl">
              Hab. {room.nameRoom}
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {room.description}
            </p>

            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">${room.price}</span>
              <span className="text-muted-foreground">/ noche</span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-secondary p-3 text-center">
                <Users className="mx-auto mb-1 h-5 w-5 text-accent" />
                <span className="text-xs text-muted-foreground">Capacidad</span>
                <p className="text-sm font-bold">{room.capacity} personas</p>
              </div>
              <div className="rounded-xl bg-secondary p-3 text-center">
                <Bed className="mx-auto mb-1 h-5 w-5 text-accent" />
                <span className="text-xs text-muted-foreground">Camas</span>
                <p className="text-sm font-bold">
                  {room.singleBeds > 0 ? `${room.singleBeds} sencilla${room.singleBeds > 1 ? "s" : ""}` : ""}
                  {room.singleBeds > 0 && room.doubleBeds > 0 ? " + " : ""}
                  {room.doubleBeds > 0 ? `${room.doubleBeds} doble${room.doubleBeds > 1 ? "s" : ""}` : ""}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Amenidades
              </h3>

              <div className="flex flex-wrap gap-2">
                {(room.amenities ?? []).map((a) => (
                  <span
                    key={a.id}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    <Check className="h-3 w-3 text-accent" />
                    {a.name}
                  </span>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSelect}
              className="mt-8 w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl py-3 h-auto text-base font-bold"
            >
              Seleccionar Habitación
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <main>
      <PublicHeader />
      <div className="pt-20">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-40 text-muted-foreground">
              Cargando...
            </div>
          }
        >
          <RoomDetailContent roomId={id} />
        </Suspense>
      </div>
      <PublicFooter />
    </main>
  )
}