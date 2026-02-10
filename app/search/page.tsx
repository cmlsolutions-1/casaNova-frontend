"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { useBooking } from "@/lib/booking-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bed, Users, ArrowLeft, SearchX } from "lucide-react"
import Link from "next/link"

function SearchResults() {
  const searchParams = useSearchParams()
  const { rooms } = useBooking()

  const start = searchParams.get("start") || ""
  const end = searchParams.get("end") || ""
  const adults = Number(searchParams.get("adults")) || 1
  const kids = Number(searchParams.get("kids")) || 0
  const babies = Number(searchParams.get("babies")) || 0
  const pets = Number(searchParams.get("pets")) || 0

  const numberOfPeople = adults + kids + babies

  const filtered = rooms.filter((room) => {
    if (room.capacity < numberOfPeople) return false
    if (pets > 0 && !room.petFriendly) return false
    if (room.status !== "available") return false
    return true
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Link>

      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
          Resultados de Busqueda
        </h1>
        <p className="mt-2 text-muted-foreground">
          {start && end ? `${start} - ${end}` : ""}
          {" | "}{adults} adulto{adults !== 1 ? "s" : ""}
          {kids > 0 ? `, ${kids} nino${kids !== 1 ? "s" : ""}` : ""}
          {babies > 0 ? `, ${babies} bebe${babies !== 1 ? "s" : ""}` : ""}
          {pets > 0 ? `, ${pets} mascota${pets !== 1 ? "s" : ""}` : ""}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <SearchX className="h-16 w-16 text-muted-foreground/40 mb-4" />
          <h2 className="text-xl font-bold text-foreground">No se encontraron habitaciones</h2>
          <p className="mt-2 text-muted-foreground">
            Intente modificar sus criterios de busqueda.
          </p>
          <Link href="/">
            <Button className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl">
              Nueva busqueda
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((room) => (
            <div
              key={room.id}
              className="group overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={room.images[0] || "/placeholder.svg"}
                  alt={room.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 right-3 flex flex-wrap gap-1.5">
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
                  <Badge variant="secondary" className="capitalize text-xs">{room.type}</Badge>
                  <span className="text-xl font-bold text-foreground">
                    ${room.price}
                    <span className="text-sm font-normal text-muted-foreground">/noche</span>
                  </span>
                </div>
                <h3 className="text-lg font-bold text-card-foreground">{room.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{room.description}</p>
                <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" /> {room.capacity} pers.
                  </span>
                  <span className="flex items-center gap-1">
                    <Bed className="h-4 w-4" />
                    {room.singleBeds > 0 ? `${room.singleBeds} sencilla${room.singleBeds > 1 ? "s" : ""}` : ""}
                    {room.singleBeds > 0 && room.doubleBeds > 0 ? " + " : ""}
                    {room.doubleBeds > 0 ? `${room.doubleBeds} doble${room.doubleBeds > 1 ? "s" : ""}` : ""}
                  </span>
                </div>
                <Link
                  href={`/rooms/${room.id}?start=${start}&end=${end}&adults=${adults}&kids=${kids}&babies=${babies}&pets=${pets}`}
                  className="mt-4 block"
                >
                  <Button className="w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                    Ver Detalles
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <main>
      <PublicHeader />
      <div className="pt-20">
        <Suspense fallback={<div className="flex items-center justify-center py-40 text-muted-foreground">Cargando resultados...</div>}>
          <SearchResults />
        </Suspense>
      </div>
      <PublicFooter />
    </main>
  )
}
