// component/dashboard/availability-by-date.tsx
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
  CalendarOff,
  CalendarCheck,
  AlertCircle,
  Check,
  Lock,
  Unlock,
  Loader2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  listRoomsService,
  getRoomAvailabilityPublicService,
  updateRoomAvailabilityService,
  type BackendRoom,
  type RoomAvailabilityDay,
} from "@/services/room.service"

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

export function AvailabilityByDate() {
  const [rooms, setRooms] = useState<BackendRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState("")
  const [currentDate, setCurrentDate] = useState(new Date())

  const [availabilityDays, setAvailabilityDays] = useState<RoomAvailabilityDay[]>([])
  const [selectedDays, setSelectedDays] = useState<string[]>([])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isMultiSelect, setIsMultiSelect] = useState(false)
  const [dialogMode, setDialogMode] = useState<"block" | "unblock">("block")

  const [isLoadingRooms, setIsLoadingRooms] = useState(false)
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false)
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

    const loadAvailability = async () => {
      setIsLoadingAvailability(true)

      try {
        const start = formatDate(new Date(year, month, 1))
        const end = formatDate(new Date(year, month, daysInMonth))

        const data = await getRoomAvailabilityPublicService({
          roomId: selectedRoom,
          start,
          end,
        })

        setAvailabilityDays(data)
      } finally {
        setIsLoadingAvailability(false)
      }
    }

    loadAvailability()
  }, [selectedRoom, year, month, daysInMonth])

  const availabilityMap = useMemo(() => {
    const map: Record<string, RoomAvailabilityDay> = {}

    availabilityDays.forEach((item) => {
      map[item.date] = item
    })

    return map
  }, [availabilityDays])

  const monthBlocks = useMemo(() => {
    const blockMap: Record<string, boolean> = {}

    availabilityDays.forEach((item) => {
      if (item.isAvailable === false) {
        blockMap[item.date] = true
      }
    })

    return blockMap
  }, [availabilityDays])

  const stats = useMemo(() => {
    const blockedDays = Object.keys(monthBlocks).length
    const availableDays = daysInMonth - blockedDays

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const nextBlocked = Object.keys(monthBlocks)
      .filter((date) => new Date(`${date}T12:00:00`) >= today)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0]

    return {
      blockedDays,
      availableDays,
      nextBlocked,
    }
  }, [monthBlocks, daysInMonth])

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
    setSelectedDays([])
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
    setSelectedDays([])
  }

  const isBlocked = (day: number): boolean => {
    const dateStr = formatDate(new Date(year, month, day))
    return availabilityMap[dateStr]?.isAvailable === false
  }

  const isSelected = (day: number): boolean => {
    const dateStr = formatDate(new Date(year, month, day))
    return selectedDays.includes(dateStr)
  }

  const handleDayClick = (day: number) => {
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
    setDialogMode(isBlocked(day) ? "unblock" : "block")
    setIsDialogOpen(true)
  }

  const handleOpenMultiEditDialog = (mode: "block" | "unblock") => {
    if (selectedDays.length === 0) return

    setDialogMode(mode)
    setIsDialogOpen(true)
  }

  const updateSelectedAvailability = async (isAvailable: boolean) => {
    if (!room || selectedDays.length === 0) return

    setIsSaving(true)

    try {
      await Promise.all(
        selectedDays.map((date) =>
          updateRoomAvailabilityService(room.id, {
            startDate: date,
            endDate: date,
            isAvailable,
          })
        )
      )

      setAvailabilityDays((prev) => {
        const selectedSet = new Set(selectedDays)
        const filtered = prev.filter((item) => !selectedSet.has(item.date))

        const updated = selectedDays.map((date) => ({
          date,
          isAvailable,
        }))

        return [...filtered, ...updated]
      })

      setIsDialogOpen(false)
      setSelectedDays([])
      setIsMultiSelect(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleBlockDays = () => {
    updateSelectedAvailability(false)
  }

  const handleUnblockDays = () => {
    updateSelectedAvailability(true)
  }

  const calendarDays: Array<number | null> = []

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const selectedBlocked = selectedDays.filter((date) => {
    return availabilityMap[date]?.isAvailable === false
  }).length

  const selectedAvailable = selectedDays.length - selectedBlocked

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
            <CalendarOff className="h-5 w-5 text-primary" />
            Disponibilidad por Fecha
          </CardTitle>

          <CardDescription>
            Bloquea o habilita habitaciones para días específicos.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <Label
                htmlFor="room-select-avail"
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
                <SelectTrigger id="room-select-avail" className="w-full">
                  <SelectValue placeholder="Selecciona una habitación" />
                </SelectTrigger>

                <SelectContent>
                  {rooms.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.nameRoom} ({r.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-end gap-2">
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
                <>
                  {selectedAvailable > 0 && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleOpenMultiEditDialog("block")}
                    >
                      <Lock className="mr-1 h-4 w-4" />
                      Bloquear ({selectedAvailable})
                    </Button>
                  )}

                  {selectedBlocked > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenMultiEditDialog("unblock")}
                    >
                      <Unlock className="mr-1 h-4 w-4" />
                      Desbloquear ({selectedBlocked})
                    </Button>
                  )}
                </>
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

                {isLoadingAvailability && (
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
                      disabled={isLoadingAvailability}
                      className={cn(
                        "relative flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-lg border p-1 transition-all",
                        "disabled:pointer-events-none disabled:opacity-60",
                        isSelected(day) &&
                          "border-primary ring-2 ring-primary",
                        isBlocked(day)
                          ? "border-red-400 bg-red-50 hover:bg-red-100"
                          : "border-border bg-card hover:border-emerald-400 hover:bg-emerald-50"
                      )}
                    >
                      <span
                        className={cn(
                          "text-xs font-semibold sm:text-sm",
                          isBlocked(day)
                            ? "text-red-700"
                            : "text-foreground"
                        )}
                      >
                        {day}
                      </span>

                      {isBlocked(day) ? (
                        <Lock className="h-3 w-3 text-red-600" />
                      ) : (
                        <CalendarCheck className="h-3 w-3 text-emerald-600" />
                      )}

                      <span
                        className={cn(
                          "w-full truncate text-center text-[8px] font-medium sm:text-[10px]",
                          isBlocked(day)
                            ? "text-red-700"
                            : "text-emerald-600"
                        )}
                      >
                        {isBlocked(day) ? "Bloqueado" : "Disponible"}
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 border-t pt-4">
              <div className="flex items-center gap-2">
                <div className="flex h-4 w-4 items-center justify-center rounded border border-border bg-card">
                  <CalendarCheck className="h-2.5 w-2.5 text-emerald-600" />
                </div>
                <span className="text-xs text-muted-foreground">
                  Disponible
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex h-4 w-4 items-center justify-center rounded border border-red-400 bg-red-50">
                  <Lock className="h-2.5 w-2.5 text-red-600" />
                </div>
                <span className="text-xs font-medium text-red-600">
                  Bloqueado
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
            <div className="rounded-lg bg-emerald-50 p-4">
              <div className="mb-1 flex items-center gap-2 text-sm text-emerald-700">
                <CalendarCheck className="h-4 w-4" />
                Días disponibles
              </div>

              <p className="text-2xl font-semibold text-emerald-700">
                {stats.availableDays}
              </p>

              <p className="text-xs text-muted-foreground">
                de {daysInMonth} días
              </p>
            </div>

            <div className="rounded-lg bg-red-50 p-4">
              <div className="mb-1 flex items-center gap-2 text-sm text-red-700">
                <Lock className="h-4 w-4" />
                Días bloqueados
              </div>

              <p className="text-2xl font-semibold text-red-700">
                {stats.blockedDays}
              </p>

              <p className="text-xs text-muted-foreground">
                de {daysInMonth} días
              </p>
            </div>

            {stats.nextBlocked && (
              <div className="rounded-lg bg-amber-50 p-4">
                <div className="mb-1 flex items-center gap-2 text-sm text-amber-700">
                  <AlertCircle className="h-4 w-4" />
                  Próximo bloqueo
                </div>

                <p className="text-sm font-medium text-foreground">
                  {new Date(`${stats.nextBlocked}T12:00:00`).toLocaleDateString(
                    "es-CO",
                    {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>
            )}

            {Object.keys(monthBlocks).length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium">
                  Días bloqueados este mes:
                </p>

                <div className="max-h-40 space-y-2 overflow-y-auto">
                  {Object.keys(monthBlocks)
                    .sort()
                    .map((date) => (
                      <div
                        key={date}
                        className="flex items-center justify-between rounded bg-muted/50 p-2 text-sm"
                      >
                        <span>
                          {new Date(`${date}T12:00:00`).toLocaleDateString(
                            "es-CO",
                            {
                              day: "numeric",
                              month: "short",
                            }
                          )}
                        </span>

                        <Badge
                          variant="secondary"
                          className="bg-red-50 text-xs text-red-700"
                        >
                          Bloqueado
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "block"
                ? selectedDays.length === 1
                  ? "Bloquear día"
                  : `Bloquear ${selectedDays.length} días`
                : selectedDays.length === 1
                  ? "Desbloquear día"
                  : `Desbloquear ${selectedDays.length} días`}
            </DialogTitle>

            <DialogDescription>
              {selectedDays.length === 1 ? (
                <>
                  Fecha:{" "}
                  {new Date(`${selectedDays[0]}T12:00:00`).toLocaleDateString(
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
                <>{selectedDays.length} días seleccionados</>
              )}
            </DialogDescription>
          </DialogHeader>

          {dialogMode === "block" ? (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Al bloquear esta fecha, la habitación no aparecerá disponible
                para reservas en el sitio público.
              </p>
            </div>
          ) : (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                {selectedDays.length === 1
                  ? "¿Estás seguro de que deseas habilitar este día nuevamente?"
                  : `¿Estás seguro de que deseas habilitar ${selectedBlocked} días nuevamente?`}
              </p>
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>

            {dialogMode === "block" ? (
              <Button
                variant="destructive"
                onClick={handleBlockDays}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Bloqueando...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Bloquear
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleUnblockDays}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Desbloqueando...
                  </>
                ) : (
                  <>
                    <Unlock className="mr-2 h-4 w-4" />
                    Desbloquear
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}