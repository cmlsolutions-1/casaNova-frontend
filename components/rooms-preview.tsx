//components/rooms-preview.tsx
"use client"

import Link from "next/link"
import { rooms } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bed, Users, Eye } from "lucide-react"

export function RoomsPreview() {
  const featured = rooms.slice(0, 3)

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
            Cada habitacion ha sido disenada con atencion al detalle para ofrecer
            el maximo confort y elegancia.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((room) => (
            <div
              key={room.id}
              className="group overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={room.images[0] || "/placeholder.svg"}
                  alt={room.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 right-3 flex gap-1.5">
                  {room.petFriendly && (
                    <Badge className="bg-accent text-accent-foreground text-xs">Pet Friendly</Badge>
                  )}
                  {room.oceanView && (
                    <Badge className="bg-blue-500 text-white text-xs">Vista al Mar</Badge>
                  )}
                  {room.breakfastIncluded && (
                    <Badge className="bg-green-600 text-white text-xs">Desayuno</Badge>
                  )}
                </div>
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
                <h3 className="text-lg font-bold text-card-foreground">{room.name}</h3>
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
          ))}
        </div>
      </div>
    </section>
  )
}
