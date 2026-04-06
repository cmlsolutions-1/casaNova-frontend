// app/search/page.tsx
"use client"

import { useBooking } from "@/lib/booking-context"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"
import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bed, Users, ArrowLeft, SearchX } from "lucide-react"
import Link from "next/link"

import { listAvailableRoomsPublicService, type BackendRoom } from "@/services/room.service"
import { parseISO, format } from "date-fns"
import { es } from "date-fns/locale"
import { calculateRoomPrice } from "@/utils/price-calculator"

function SearchResults() {
  const searchParams = useSearchParams()
  const { booking, setSearchParams } = useBooking()
  const start = searchParams.get("start") || ""
  const end = searchParams.get("end") || ""
  const adults = Number(searchParams.get("adults")) || 1
  const kids = Number(searchParams.get("kids")) || 0
  const babies = Number(searchParams.get("babies")) || 0
  const pets = Number(searchParams.get("pets")) || 0
  const remaining = Number(searchParams.get("remaining")) || 0

  const totalPeople = adults + kids + babies
  const people = remaining > 0 ? remaining : totalPeople

  const [rooms, setRooms] = useState<BackendRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editingSearch, setEditingSearch] = useState(false)
  const [localSearch, setLocalSearch] = useState({
    start: start || "",
    end: end || "",
    adults: adults || 1,
    kids: kids || 0,
    babies: babies || 0,
    pets: pets || 0,
  })

  const returnTo = searchParams.get("returnTo") || ""

  // Fechas bonitas
  const prettyRange = useMemo(() => {
    try {
      if (!start || !end) return ""
      return `${format(parseISO(start), "dd MMM yyyy", { locale: es })} - ${format(parseISO(end), "dd MMM yyyy", { locale: es })}`
    } catch {
      return `${start} - ${end}`
    }
  }, [start, end])

  const selectedIds = useMemo(() => {
    if (returnTo === "confirm") {
      return new Set<string>()
    }

    const list = booking.selectedRooms ?? []
      return new Set(list.map((r: any) => String(r?.id)))
    }, [booking.selectedRooms, returnTo])

  useEffect(() => {
    let alive = true

    // si falta algo, no consultamos
    if (!start || !end || !people) {
      setRooms([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    ;(async () => {
      try {
        const data = await listAvailableRoomsPublicService({ start, end, people })
        if (!alive) return

        // opcional: filtrar solo activas
        const filtered = (data ?? [])
        .filter((r) => r.status === "ACTIVE")
        .filter((r) => !selectedIds.has(String(r.id))) // ya seleccionadas NO aparecen

      setRooms(filtered)

        setRooms(filtered)
      } catch (e: any) {
        if (!alive) return
        setError(e?.message ?? "Error buscando habitaciones")
        setRooms([])
      } finally {
        if (alive) setLoading(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [start, end, people, selectedIds])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Link>

      <div className="mb-8 rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
            Resultados de Búsqueda
          </h1>

          <button
            onClick={() => setEditingSearch(!editingSearch)}
            className="text-sm text-accent hover:underline"
          >
            {editingSearch ? "Cancelar" : "Modificar búsqueda"}
          </button>
        </div>

        {!editingSearch ? (
          <p className="text-muted-foreground">
            {prettyRange}
            {" | "}
            {adults} adulto{adults !== 1 ? "s" : ""}
            {kids > 0 ? `, ${kids} niño${kids !== 1 ? "s" : ""}` : ""}
            {babies > 0 ? `, ${babies} bebé${babies !== 1 ? "s" : ""}` : ""}
            {pets > 0 ? `, ${pets} mascota${pets !== 1 ? "s" : ""}` : ""}
          </p>
        ) : (
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
            
            {/* LLEGADA */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Llegada</label>
              <span className="text-[10px] text-muted-foreground/70 invisible">.</span>
              <input
                type="date"
                value={localSearch.start}
                onChange={(e) =>
                  setLocalSearch((prev) => ({ ...prev, start: e.target.value }))
                }
                className="rounded-xl border px-3 py-2 text-sm"
              />
            </div>

            {/* SALIDA */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Salida</label>
              <span className="text-[10px] text-muted-foreground/70 invisible">.</span>
              <input
                type="date"
                value={localSearch.end}
                onChange={(e) =>
                  setLocalSearch((prev) => ({ ...prev, end: e.target.value }))
                }
                className="rounded-xl border px-3 py-2 text-sm"
              />
            </div>

            {/* ADULTOS */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Adultos</label>
              <span className="text-[10px] text-muted-foreground/70">9 años o más</span>
              <input
                type="number"
                min={1}
                value={localSearch.adults}
                onChange={(e) =>
                  setLocalSearch((prev) => ({ ...prev, adults: Number(e.target.value) }))
                }
                className="rounded-xl border px-3 py-2 text-sm"
              />
            </div>

            {/* NIÑOS */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Niños</label>
              <span className="text-[10px] text-muted-foreground/70">De 5 a 8 años</span>
              <input
                type="number"
                min={0}
                value={localSearch.kids}
                onChange={(e) =>
                  setLocalSearch((prev) => ({ ...prev, kids: Number(e.target.value) }))
                }
                className="rounded-xl border px-3 py-2 text-sm"
              />
            </div>

            {/* BEBÉS */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Bebés</label>
              <span className="text-[10px] text-muted-foreground/70">Menos de 5 años</span>
              <input
                type="number"
                min={0}
                value={localSearch.babies}
                onChange={(e) =>
                  setLocalSearch((prev) => ({ ...prev, babies: Number(e.target.value) }))
                }
                className="rounded-xl border px-3 py-2 text-sm"
              />
            </div>

            {/* MASCOTAS */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Mascotas</label>
              <span className="text-[10px] text-muted-foreground/70 invisible">.</span>
              <input
                type="number"
                min={0}
                value={localSearch.pets}
                onChange={(e) =>
                  setLocalSearch((prev) => ({
                    ...prev,
                    pets: Number(e.target.value),
                  }))
                }
                className="rounded-xl border px-3 py-2 text-sm"
              />
            </div>

            {/* BOTÓN */}
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchParams({
                    startDate: localSearch.start,
                    endDate: localSearch.end,
                    adults: Number(localSearch.adults),
                    kids: Number(localSearch.kids),
                    babies: Number(localSearch.babies),
                    pets: Number(localSearch.pets),
                  })

                  const params = new URLSearchParams({
                    start: localSearch.start,
                    end: localSearch.end,
                    adults: String(localSearch.adults),
                    kids: String(localSearch.kids),
                    babies: String(localSearch.babies),
                    pets: String(localSearch.pets),
                    remaining: "0",
                    returnTo,
                  })

                  window.location.href = `/search?${params.toString()}`
                }}
                className="w-full rounded-xl bg-accent text-accent-foreground"
              >
                Buscar
              </Button>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-40 text-muted-foreground">
          Cargando resultados...
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <SearchX className="h-16 w-16 text-muted-foreground/40 mb-4" />
          <h2 className="text-xl font-bold text-foreground">Ocurrió un error</h2>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <Link href="/">
            <Button className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl">
              Nueva búsqueda
            </Button>
          </Link>
        </div>
      )}

      {!loading && !error && rooms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <SearchX className="h-16 w-16 text-muted-foreground/40 mb-4" />
          <h2 className="text-xl font-bold text-foreground">No se encontraron habitaciones</h2>
          <p className="mt-2 text-muted-foreground">
            Intenta modificar tus criterios de búsqueda.
          </p>
          <Link href="/">
            <Button className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl">
              Nueva búsqueda
            </Button>
          </Link>
        </div>
      )}

      {remaining > 0 && (
        <div className="mb-6 rounded-2xl border border-accent/30 bg-accent/10 p-4">
          <p className="font-semibold text-foreground">
            Aún faltan {remaining} persona{remaining === 1 ? "" : "s"} por acomodar
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Selecciona otra habitación para completar tu reserva y continuar a servicios adicionales.
          </p>
        </div>
      )}

      {!loading && !error && rooms.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => {
            const img = room.images?.[0]?.url || "/placeholder.svg"

            // Calcular cuántas personas van en esta habitación
            const peopleForThisRoom = Math.min(room.capacity ?? 0, people)

            // Distribuir adultos y niños en esta habitación
            const adultsInRoom = Math.min(adults, peopleForThisRoom)
            const remainingCapacity = peopleForThisRoom - adultsInRoom
            const kidsInRoom = Math.min(kids, remainingCapacity)

            // Calcular precio con descuento para niños
            const priceCalc = calculateRoomPrice(
              Number(room.price ?? 0),
              adultsInRoom,
              kidsInRoom
            )

            return (
              <div
                key={room.id}
                className="group flex flex-col h-full overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="relative h-52 overflow-hidden flex-shrink-0">
                  <img
                    src={img}
                    alt={`Habitación ${room.nameRoom}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant="secondary" className="capitalize text-xs">{room.type}</Badge>
                    <div className="text-right">
                      <span className="text-xl font-bold text-foreground">
                        ${priceCalc.total.toLocaleString()}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        / noche
                      </p>

                      {/* Desglose visual del precio */}
                    <div className="mt-1 text-[10px] text-muted-foreground space-y-0.5">
                      {adultsInRoom > 0 && (
                        <p>
                          {adultsInRoom} adulto{adultsInRoom > 1 ? "s" : ""} × ${Number(room.price).toLocaleString()} = ${(priceCalc.adultsPrice).toLocaleString()}
                        </p>
                      )}
                      {kidsInRoom > 0 && (
                        <p className="text-emerald-600 font-medium">
                          {kidsInRoom} niño{kidsInRoom > 1 ? "s" : ""} × ${(Number(room.price) * 0.5).toLocaleString()} = ${priceCalc.kidsPrice.toLocaleString()}
                        </p>
                      )}
                      {priceCalc.kidsDiscount > 0 && (
                        <p className="text-emerald-600">
                          Descuento niños: -${priceCalc.kidsDiscount.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>




                  <h3 className="text-lg font-bold text-card-foreground">
                    Hab. {room.nameRoom}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {room.description}
                  </p>

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

                  {/* Badge de descuento si hay niños */}
                  {kidsInRoom > 0 && (
                    <div className="mt-2">
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs">
                        ✓ Descuento de niños aplicado
                      </Badge>
                    </div>
                  )}

                  <div className="mt-auto pt-4">
                  <Link
                    href={`/rooms/${room.id}?start=${start}&end=${end}&adults=${adults}&kids=${kids}&babies=${babies}&pets=${pets}&remaining=${remaining}&returnTo=${returnTo}`}
                    className="mt-4 block"
                  >
                    <Button className="w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                      Ver Detalles
                    </Button>
                  </Link>
                </div>
              </div>
              </div>
            )
          })}
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