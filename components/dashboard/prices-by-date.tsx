// component/dashboard/prices-by-date.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  RotateCcw,
  Check,
  Loader2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  listRoomsService,
  getRoomDailyPricesService,
  updateRoomDailyPricesService,
  type BackendRoom,
  type RoomDailyPrice,
} from "@/services/room.service"

const formatCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value)

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

const getMonthName = (month: number) =>
  new Date(2026, month, 1).toLocaleDateString("es-CO", {
    month: "long",
  })

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate()

const getFirstDayOfMonth = (year: number, month: number) =>
  new Date(year, month, 1).getDay()

export function PricesByDate() {
  const [rooms, setRooms] = useState<BackendRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState("")
  const [currentDate, setCurrentDate] = useState(new Date())

  const [dailyPrices, setDailyPrices] = useState<RoomDailyPrice[]>([])
  const [selectedDays, setSelectedDays] = useState<string[]>([])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPrice, setEditingPrice] = useState("")
  const [isMultiSelect, setIsMultiSelect] = useState(false)

  const [isLoadingRooms, setIsLoadingRooms] = useState(false)
  const [isLoadingPrices, setIsLoadingPrices] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const room = rooms.find((r) => r.id === selectedRoom)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  useEffect(() => {
    const loadRooms = async () => {
      setIsLoadingRooms(true)

      try {
        const data = await listRoomsService()
        setRooms(data)

        if (data.length > 0) {
          setSelectedRoom(data[0].id)
        }
      } finally {
        setIsLoadingRooms(false)
      }
    }

    loadRooms()
  }, [])

  useEffect(() => {
    if (!selectedRoom) return

    const loadDailyPrices = async () => {
      setIsLoadingPrices(true)

      try {
        const start = formatDate(new Date(year, month, 1))
        const end = formatDate(new Date(year, month, daysInMonth))

        const data = await getRoomDailyPricesService({
          roomId: selectedRoom,
          start,
          end,
        })

        setDailyPrices(data)
      } finally {
        setIsLoadingPrices(false)
      }
    }

    loadDailyPrices()
  }, [selectedRoom, year, month, daysInMonth])

  const monthPrices = useMemo(() => {
    const prices: Record<string, RoomDailyPrice> = {}

    dailyPrices.forEach((item) => {
      prices[item.date] = item
    })

    return prices
  }, [dailyPrices])

  const stats = useMemo(() => {
    if (!room) {
      return {
        modifiedDays: 0,
        maxPrice: 0,
        minPrice: 0,
      }
    }

    const allPrices = dailyPrices.map((item) => item.price)
    const modifiedDays = dailyPrices.filter((item) => item.isOverride).length

    const maxPrice =
      allPrices.length > 0 ? Math.max(...allPrices, room.price) : room.price

    const minPrice =
      allPrices.length > 0 ? Math.min(...allPrices, room.price) : room.price

    return {
      modifiedDays,
      maxPrice,
      minPrice,
    }
  }, [dailyPrices, room])

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
    setSelectedDays([])
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
    setSelectedDays([])
  }

  const handleDayClick = (day: number) => {
    if (!room) return

    const dateStr = formatDate(new Date(year, month, day))

    if (isMultiSelect) {
      setSelectedDays((prev) =>
        prev.includes(dateStr)
          ? prev.filter((d) => d !== dateStr)
          : [...prev, dateStr]
      )
      return
    }

    setSelectedDays([dateStr])

    const existingPrice = monthPrices[dateStr]?.price
    setEditingPrice(String(existingPrice ?? room.price))

    setIsDialogOpen(true)
  }

  const handleOpenMultiEditDialog = () => {
    if (!room || selectedDays.length === 0) return

    setEditingPrice(String(room.price))
    setIsDialogOpen(true)
  }

  const handleSavePrice = async () => {
    if (!room) return

    const price = Number(editingPrice.replace(/\D/g, ""))

    if (isNaN(price) || price <= 0) return

    setIsSaving(true)

    try {
      const response = await updateRoomDailyPricesService(room.id, {
        prices: selectedDays.map((date) => ({
          date,
          price: price === room.price ? null : price,
        })),
      })

      setDailyPrices((prev) => {
        const selectedSet = new Set(selectedDays)
        const filtered = prev.filter((item) => !selectedSet.has(item.date))

        return [...filtered, ...response]
      })

      setIsDialogOpen(false)
      setSelectedDays([])
      setIsMultiSelect(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetToBase = async () => {
    if (!room) return

    setIsSaving(true)

    try {
      await updateRoomDailyPricesService(room.id, {
        prices: selectedDays.map((date) => ({
          date,
          price: null,
        })),
      })

      setDailyPrices((prev) =>
        prev.filter((item) => !selectedDays.includes(item.date))
      )

      setIsDialogOpen(false)
      setSelectedDays([])
      setIsMultiSelect(false)
    } finally {
      setIsSaving(false)
    }
  }

  const getDayPrice = (day: number): number => {
    if (!room) return 0

    const dateStr = formatDate(new Date(year, month, day))
    return monthPrices[dateStr]?.price ?? room.price
  }

  const isCustomPrice = (day: number): boolean => {
    const dateStr = formatDate(new Date(year, month, day))
    return monthPrices[dateStr]?.isOverride === true
  }

  const isSelected = (day: number): boolean => {
    const dateStr = formatDate(new Date(year, month, day))
    return selectedDays.includes(dateStr)
  }

  const calendarDays: Array<number | null> = []

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  if (isLoadingRooms) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando habitaciones...
        </CardContent>
      </Card>
    )
  }

  if (!room) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            No hay habitaciones disponibles.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5 text-primary" />
            Precios por Fecha
          </CardTitle>
          <CardDescription>
            Configura precios especiales para días específicos.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <Label
                htmlFor="room-select"
                className="mb-2 block text-sm font-medium"
              >
                Habitación
              </Label>

              <Select
                value={selectedRoom}
                onValueChange={(value) => {
                  setSelectedRoom(value)
                  setSelectedDays([])
                  setIsMultiSelect(false)
                }}
              >
                <SelectTrigger id="room-select" className="w-full">
                  <SelectValue placeholder="Selecciona una habitación" />
                </SelectTrigger>

                <SelectContent>
                  {rooms.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.nameRoom} ({r.type}) - {formatCOP(r.price)}/noche
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button
                variant={isMultiSelect ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setIsMultiSelect(!isMultiSelect)
                  setSelectedDays([])
                }}
              >
                {isMultiSelect ? (
                  <>
                    <Check className="mr-1 h-4 w-4" />
                    Selección múltiple
                  </>
                ) : (
                  "Selección múltiple"
                )}
              </Button>

              {isMultiSelect && selectedDays.length > 0 && (
                <Button size="sm" onClick={handleOpenMultiEditDialog}>
                  Editar {selectedDays.length} días
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold capitalize">
                  {getMonthName(month)} {year}
                </h3>

                {isLoadingPrices && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>

              <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div className="mb-2 grid grid-cols-7 gap-1">
              {dayNames.map((name) => (
                <div
                  key={name}
                  className="py-2 text-center text-xs font-medium text-muted-foreground"
                >
                  {name}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <div key={index} className="aspect-square">
                  {day && (
                    <button
                      onClick={() => handleDayClick(day)}
                      disabled={isLoadingPrices}
                      className={cn(
                        "flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-lg border p-1 transition-all",
                        "hover:border-primary/50 hover:bg-accent/50",
                        "disabled:pointer-events-none disabled:opacity-60",
                        isSelected(day) &&
                          "border-primary bg-primary/10 ring-2 ring-primary",
                        isCustomPrice(day)
                          ? "border-red-400 bg-red-50"
                          : "border-border bg-card"
                      )}
                    >
                      <span
                        className={cn(
                          "text-xs font-medium sm:text-sm",
                          isCustomPrice(day)
                          ? "text-red-600 font-semibold"
                          : "text-foreground"
                        )}
                      >
                        {day}
                      </span>

                      <span
                        className={cn(
                          "w-full truncate text-center text-[10px] sm:text-xs",
                            isCustomPrice(day)
                              ? "font-semibold text-red-600"
                              : "text-muted-foreground"
                        )}
                      >
                        {formatCOP(getDayPrice(day))
                          .replace("COP", "")
                          .trim()}
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 border-t pt-4">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border border-border bg-card" />
                <span className="text-xs text-muted-foreground">
                  Precio base
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded border border-red-400 bg-red-50" />
                <span className="text-xs font-medium text-red-600">
                  Precio personalizado
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumen del Mes</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Precio base
              </div>

              <p className="text-2xl font-semibold">{formatCOP(room.price)}</p>
              <p className="text-xs text-muted-foreground">por noche</p>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                Días modificados
              </div>

              <p className="text-2xl font-semibold">{stats.modifiedDays}</p>
              <p className="text-xs text-muted-foreground">
                de {daysInMonth} días
              </p>
            </div>

            <div className="rounded-lg bg-success/10 p-4">
              <div className="mb-1 flex items-center gap-2 text-sm text-success">
                <TrendingUp className="h-4 w-4" />
                Mayor precio
              </div>

              <p className="text-2xl font-semibold text-success">
                {formatCOP(stats.maxPrice)}
              </p>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingDown className="h-4 w-4" />
                Menor precio
              </div>

              <p className="text-2xl font-semibold">
                {formatCOP(stats.minPrice)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDays.length === 1
                ? "Editar precio"
                : `Editar ${selectedDays.length} días`}
            </DialogTitle>

            <DialogDescription>
              {selectedDays.length === 1 ? (
                <>
                  Fecha:{" "}
                  {new Date(selectedDays[0] + "T12:00:00").toLocaleDateString(
                    "es-CO",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </>
              ) : (
                <>Aplicar el mismo precio a {selectedDays.length} días.</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="price" className="text-sm font-medium">
                Nuevo precio COP
              </Label>

              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>

                <Input
                  id="price"
                  type="number"
                  value={editingPrice}
                  onChange={(e) => setEditingPrice(e.target.value)}
                  className="pl-7"
                  placeholder={String(room.price)}
                />
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Precio base: {formatCOP(room.price)}
              </p>
            </div>

            {selectedDays.length === 1 &&
              monthPrices[selectedDays[0]]?.isOverride && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Precio actual:{" "}
                    {formatCOP(monthPrices[selectedDays[0]].price)}
                  </Badge>
                </div>
              )}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={handleResetToBase}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Restablecer base
            </Button>

            <Button
              onClick={handleSavePrice}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}