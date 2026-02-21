//app/rooms/[id]/page.tsx
"use client"

import { use, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { useBooking } from "@/lib/booking-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Users,
  Bed,
  Check,
  PawPrint,
  Waves,
  UtensilsCrossed,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

function RoomDetailContent({ roomId }: { roomId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { rooms, setSelectedRoom, booking, setSearchParams } = useBooking()
  const [imgIdx, setImgIdx] = useState(0)

  const room = rooms.find((r) => r.id === roomId)

  const start = searchParams.get("start") || booking.searchParams?.startDate || ""
  const end = searchParams.get("end") || booking.searchParams?.endDate || ""
  const adults = Number(searchParams.get("adults")) || booking.searchParams?.adults || 2
  const kids = Number(searchParams.get("kids")) || booking.searchParams?.kids || 0
  const babies = Number(searchParams.get("babies")) || booking.searchParams?.babies || 0
  const pets = Number(searchParams.get("pets")) || booking.searchParams?.pets || 0

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center">
        <h2 className="text-xl font-bold">Habitacion no encontrada</h2>
        <Link href="/">
          <Button className="mt-4 bg-accent text-accent-foreground">Volver al inicio</Button>
        </Link>
      </div>
    )
  }

  const handleSelect = () => {
    setSelectedRoom(room)
    if (start && end) {
      setSearchParams({ startDate: start, endDate: end, adults, kids, babies, pets })
    }
    router.push("/booking/services")
  }

  const prevImg = () => setImgIdx((p) => (p === 0 ? room.images.length - 1 : p - 1))
  const nextImg = () => setImgIdx((p) => (p + 1) % room.images.length)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href={start ? `/search?start=${start}&end=${end}&adults=${adults}&kids=${kids}&babies=${babies}&pets=${pets}` : "/"}
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
              src={room.images[imgIdx] || "/placeholder.svg"}
              alt={`${room.name} - foto ${imgIdx + 1}`}
              className="aspect-[4/3] w-full object-cover"
            />
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
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {room.images.map((_, i) => (
                <button
                  key={`thumb-${room.images[i]}`}
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
            {room.images.map((img, i) => (
              <button
                key={img}
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
              {room.petFriendly && (
                <Badge className="bg-accent/20 text-accent border border-accent/30">
                  <PawPrint className="mr-1 h-3 w-3" />Pet Friendly
                </Badge>
              )}
              {room.oceanView && (
                <Badge className="bg-blue-500/20 text-blue-700 border border-blue-500/30">
                  <Waves className="mr-1 h-3 w-3" />Vista al Mar
                </Badge>
              )}
              {room.breakfastIncluded && (
                <Badge className="bg-green-500/20 text-green-700 border border-green-500/30">
                  <UtensilsCrossed className="mr-1 h-3 w-3" />Desayuno Incluido
                </Badge>
              )}
            </div>

            <h1 className="font-serif text-2xl font-bold text-card-foreground md:text-3xl">
              {room.name}
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
                {room.amenities.map((a) => (
                  <span key={a} className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                    <Check className="h-3 w-3 text-accent" />{a}
                  </span>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSelect}
              className="mt-8 w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl py-3 h-auto text-base font-bold"
            >
              Seleccionar Habitacion
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
        <Suspense fallback={<div className="flex items-center justify-center py-40 text-muted-foreground">Cargando...</div>}>
          <RoomDetailContent roomId={id} />
        </Suspense>
      </div>
      <PublicFooter />
    </main>
  )
}
