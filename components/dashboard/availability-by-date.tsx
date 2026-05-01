"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
} from "lucide-react"
import {
  rooms,
  initialBlocks,
  blockReasons,
  formatDate,
  getMonthName,
  getDaysInMonth,
  getFirstDayOfMonth,
  type RoomBlock,
} from "@/lib/hotel-data"
import { cn } from "@/lib/utils"

export function AvailabilityByDate() {
  const [selectedRoom, setSelectedRoom] = useState(rooms[1].id) // Room 102 has blocks
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)) // April 2026
  const [blocks, setBlocks] = useState<RoomBlock[]>(initialBlocks)
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedReason, setSelectedReason] = useState(blockReasons[0])
  const [isMultiSelect, setIsMultiSelect] = useState(false)
  const [dialogMode, setDialogMode] = useState<"block" | "unblock">("block")

  const room = rooms.find((r) => r.id === selectedRoom)!
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  // Get blocks for current room and month
  const monthBlocks = useMemo(() => {
    const blockMap: Record<string, string> = {}
    blocks
      .filter((b) => b.roomId === selectedRoom)
      .forEach((b) => {
        const date = new Date(b.date)
        if (date.getFullYear() === year && date.getMonth() === month) {
          blockMap[b.date] = b.reason
        }
      })
    return blockMap
  }, [blocks, selectedRoom, year, month])

  // Calculate stats
  const stats = useMemo(() => {
    const blockedDays = Object.keys(monthBlocks).length
    const availableDays = daysInMonth - blockedDays

    // Find next blocked date
    const today = new Date()
    const sortedBlockDates = blocks
      .filter((b) => b.roomId === selectedRoom && new Date(b.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const nextBlocked = sortedBlockDates[0]?.date

    return { blockedDays, availableDays, nextBlocked }
  }, [monthBlocks, daysInMonth, blocks, selectedRoom])

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
    return dateStr in monthBlocks
  }

  const getBlockReason = (day: number): string | undefined => {
    const dateStr = formatDate(new Date(year, month, day))
    return monthBlocks[dateStr]
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
    } else {
      setSelectedDays([dateStr])
      setDialogMode(isBlocked(day) ? "unblock" : "block")
      setIsDialogOpen(true)
    }
  }

  const handleOpenMultiEditDialog = (mode: "block" | "unblock") => {
    if (selectedDays.length > 0) {
      setDialogMode(mode)
      setIsDialogOpen(true)
    }
  }

  const handleBlockDays = () => {
    setBlocks((prev) => {
      const newBlocks = prev.filter(
        (b) => !(b.roomId === selectedRoom && selectedDays.includes(b.date))
      )
      selectedDays.forEach((date) => {
        newBlocks.push({ roomId: selectedRoom, date, reason: selectedReason })
      })
      return newBlocks
    })
    setIsDialogOpen(false)
    setSelectedDays([])
    setIsMultiSelect(false)
  }

  const handleUnblockDays = () => {
    setBlocks((prev) =>
      prev.filter(
        (b) => !(b.roomId === selectedRoom && selectedDays.includes(b.date))
      )
    )
    setIsDialogOpen(false)
    setSelectedDays([])
    setIsMultiSelect(false)
  }

  // Generate calendar grid
  const calendarDays = []
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  // Count selected blocked/available
  const selectedBlocked = selectedDays.filter((d) => d in monthBlocks).length
  const selectedAvailable = selectedDays.length - selectedBlocked

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarOff className="w-5 h-5 text-primary" />
            Disponibilidad por Fecha
          </CardTitle>
          <CardDescription>
            Bloquea o habilita habitaciones para días específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="room-select-avail" className="text-sm font-medium mb-2 block">
                Habitación
              </Label>
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger id="room-select-avail" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} ({r.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2 flex-wrap">
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
                    <Check className="w-4 h-4 mr-1" />
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
                      <Lock className="w-4 h-4 mr-1" />
                      Bloquear ({selectedAvailable})
                    </Button>
                  )}
                  {selectedBlocked > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenMultiEditDialog("unblock")}
                    >
                      <Unlock className="w-4 h-4 mr-1" />
                      Desbloquear ({selectedBlocked})
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h3 className="text-lg font-semibold">
                {getMonthName(month)} {year}
              </h3>
              <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((name) => (
                <div
                  key={name}
                  className="text-center text-xs font-medium text-muted-foreground py-2"
                >
                  {name}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <div key={index} className="aspect-square">
                  {day && (
                    <button
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        "w-full h-full rounded-lg border transition-all flex flex-col items-center justify-center gap-0.5 p-1 relative",
                        "hover:border-primary/50",
                        isSelected(day) && "ring-2 ring-primary border-primary",
                        isBlocked(day)
                          ? "bg-destructive/10 border-destructive/30"
                          : "border-border bg-card hover:bg-accent/50"
                      )}
                    >
                      <span
                        className={cn(
                          "text-xs sm:text-sm font-medium",
                          isBlocked(day) ? "text-destructive" : "text-foreground"
                        )}
                      >
                        {day}
                      </span>
                      {isBlocked(day) ? (
                        <Lock className="w-3 h-3 text-destructive" />
                      ) : (
                        <CalendarCheck className="w-3 h-3 text-success" />
                      )}
                      <span
                        className={cn(
                          "text-[8px] sm:text-[10px] truncate w-full text-center",
                          isBlocked(day) ? "text-destructive/70" : "text-success"
                        )}
                      >
                        {isBlocked(day) ? "Bloqueado" : "Disponible"}
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-border bg-card flex items-center justify-center">
                  <CalendarCheck className="w-2.5 h-2.5 text-success" />
                </div>
                <span className="text-xs text-muted-foreground">Disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-destructive/30 bg-destructive/10 flex items-center justify-center">
                  <Lock className="w-2.5 h-2.5 text-destructive" />
                </div>
                <span className="text-xs text-muted-foreground">Bloqueado</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumen del Mes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-success/10">
              <div className="flex items-center gap-2 text-sm text-success mb-1">
                <CalendarCheck className="w-4 h-4" />
                Días disponibles
              </div>
              <p className="text-2xl font-semibold text-success">{stats.availableDays}</p>
              <p className="text-xs text-muted-foreground">de {daysInMonth} días</p>
            </div>

            <div className="p-4 rounded-lg bg-destructive/10">
              <div className="flex items-center gap-2 text-sm text-destructive mb-1">
                <Lock className="w-4 h-4" />
                Días bloqueados
              </div>
              <p className="text-2xl font-semibold text-destructive">{stats.blockedDays}</p>
              <p className="text-xs text-muted-foreground">de {daysInMonth} días</p>
            </div>

            {stats.nextBlocked && (
              <div className="p-4 rounded-lg bg-warning/10">
                <div className="flex items-center gap-2 text-sm text-warning-foreground mb-1">
                  <AlertCircle className="w-4 h-4" />
                  Próximo bloqueo
                </div>
                <p className="text-sm font-medium">
                  {new Date(stats.nextBlocked + "T12:00:00").toLocaleDateString("es-CO", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}

            {/* Blocked days list */}
            {Object.keys(monthBlocks).length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Días bloqueados este mes:</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {Object.entries(monthBlocks).map(([date, reason]) => (
                    <div
                      key={date}
                      className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm"
                    >
                      <span>
                        {new Date(date + "T12:00:00").toLocaleDateString("es-CO", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {reason}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Block/Unblock Dialog */}
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
                  {new Date(selectedDays[0] + "T12:00:00").toLocaleDateString("es-CO", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </>
              ) : (
                <>{selectedDays.length} días seleccionados</>
              )}
            </DialogDescription>
          </DialogHeader>

          {dialogMode === "block" ? (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="block-reason" className="text-sm font-medium">
                  Motivo del bloqueo
                </Label>
                <Select value={selectedReason} onValueChange={setSelectedReason}>
                  <SelectTrigger id="block-reason" className="w-full mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {blockReasons.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedDays.length === 1 && getBlockReason(parseInt(selectedDays[0].split("-")[2])) && (
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">
                    Actualmente bloqueado: {getBlockReason(parseInt(selectedDays[0].split("-")[2]))}
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                {selectedDays.length === 1
                  ? "¿Estás seguro de que deseas desbloquear este día?"
                  : `¿Estás seguro de que deseas desbloquear ${selectedBlocked} días?`}
              </p>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            {dialogMode === "block" ? (
              <Button
                variant="destructive"
                onClick={handleBlockDays}
                className="w-full sm:w-auto"
              >
                <Lock className="w-4 h-4 mr-2" />
                Bloquear
              </Button>
            ) : (
              <Button onClick={handleUnblockDays} className="w-full sm:w-auto">
                <Unlock className="w-4 h-4 mr-2" />
                Desbloquear
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
