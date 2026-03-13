"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, CalendarDays, Users, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useBooking } from "@/lib/booking-context"

function GuestCounter({
  label,
  value,
  onChange,
  min = 0,
  max = 10,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary disabled:opacity-30"
          aria-label={`Disminuir ${label}`}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-6 text-center text-sm font-semibold">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary disabled:opacity-30"
          aria-label={`Aumentar ${label}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export function SearchBar() {
  const router = useRouter()
  const { setSearchParams } = useBooking()

  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [adults, setAdults] = useState(2)
  const [kids, setKids] = useState(0)
  const [babies, setBabies] = useState(0)
  const [pets, setPets] = useState(0)

  const [openStart, setOpenStart] = useState(false)
  const [openEnd, setOpenEnd] = useState(false)
  const [openGuests, setOpenGuests] = useState(false)

  const handleSearch = () => {
    if (!startDate || !endDate) return
    if (endDate <= startDate) return

    const params = {
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
      adults,
      kids,
      babies,
      pets,
    }

    setSearchParams(params)

    const query = new URLSearchParams({
      start: params.startDate,
      end: params.endDate,
      adults: String(adults),
      kids: String(kids),
      babies: String(babies),
      pets: String(pets),
    })

    router.push(`/search?${query.toString()}`)
  }

  const totalGuests = adults + kids + babies

  const handleSelectStartDate = (date: Date | undefined) => {
    if (!date) return

    setStartDate(date)

    if (endDate && endDate <= date) {
      setEndDate(undefined)
    }

    setOpenStart(false)
    setOpenEnd(true)
    setOpenGuests(false)
  }

  const handleSelectEndDate = (date: Date | undefined) => {
    if (!date) return

    setEndDate(date)
    setOpenEnd(false)
    setOpenGuests(true)
  }

  return (
    <div id="search" className="relative z-10 mx-auto -mt-20 max-w-5xl px-4">
      <div className="glass rounded-2xl p-4 shadow-2xl md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          {/* Llegada */}
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Llegada
            </label>
            <Popover open={openStart} onOpenChange={setOpenStart}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm transition-colors hover:border-accent"
                >
                  <CalendarDays className="h-4 w-4 text-accent" />
                  <span className={startDate ? "font-medium text-foreground" : "text-muted-foreground"}>
                    {startDate
                      ? format(startDate, "dd MMM yyyy", { locale: es })
                      : "Seleccionar fecha"}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  locale={es}
                  mode="single"
                  selected={startDate}
                  onSelect={handleSelectStartDate}
                  disabled={(date) => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    return date < today
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Salida */}
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Salida
            </label>
            <Popover
              open={openEnd}
              onOpenChange={(open) => {
                if (!startDate && open) return
                setOpenEnd(open)
              }}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={!startDate}
                  className="flex w-full items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CalendarDays className="h-4 w-4 text-accent" />
                  <span className={endDate ? "font-medium text-foreground" : "text-muted-foreground"}>
                    {endDate
                      ? format(endDate, "dd MMM yyyy", { locale: es })
                      : "Seleccionar fecha"}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  locale={es}
                  mode="single"
                  selected={endDate}
                  onSelect={handleSelectEndDate}
                  disabled={(date) => {
                    const minDate = startDate ?? new Date()
                    return date <= minDate
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Huéspedes */}
          <div className="flex-1">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Huéspedes
            </label>
            <Popover open={openGuests} onOpenChange={setOpenGuests}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={!startDate || !endDate}
                  className="flex w-full items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-left text-sm transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Users className="h-4 w-4 text-accent" />
                  <span className="font-medium text-foreground">
                    {totalGuests} {totalGuests === 1 ? "huésped" : "huéspedes"}
                    {pets > 0 ? `, ${pets} mascota${pets > 1 ? "s" : ""}` : ""}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72" align="start">
                <div className="space-y-1">
                  <GuestCounter label="Adultos" value={adults} onChange={setAdults} min={1} max={10} />
                  <GuestCounter label="Niños" value={kids} onChange={setKids} />
                  <GuestCounter label="Bebés" value={babies} onChange={setBabies} />
                  <GuestCounter label="Mascotas" value={pets} onChange={setPets} max={3} />

                  <div className="pt-3">
                    <Button
                      type="button"
                      className="w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"
                      onClick={() => setOpenGuests(false)}
                    >
                      Confirmar huéspedes
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Buscar */}
          <Button
            onClick={handleSearch}
            disabled={!startDate || !endDate}
            className="h-auto rounded-xl bg-accent px-8 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent/90 md:py-3"
          >
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
        </div>
      </div>
    </div>
  )
}