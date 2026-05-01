"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
} from "lucide-react"
import {
  rooms,
  initialCustomPrices,
  formatCOP,
  formatDate,
  getMonthName,
  getDaysInMonth,
  getFirstDayOfMonth,
  type CustomPrice,
} from "@/lib/hotel-data"
import { cn } from "@/lib/utils"

export function PricesByDate() {
  const [selectedRoom, setSelectedRoom] = useState(rooms[0].id)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)) // April 2026
  const [customPrices, setCustomPrices] = useState<CustomPrice[]>(initialCustomPrices)
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPrice, setEditingPrice] = useState<string>("")
  const [isMultiSelect, setIsMultiSelect] = useState(false)

  const room = rooms.find((r) => r.id === selectedRoom)!
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Calculate calendar data
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  // Get prices for current room and month
  const monthPrices = useMemo(() => {
    const prices: Record<string, number> = {}
    customPrices
      .filter((p) => p.roomId === selectedRoom)
      .forEach((p) => {
        const date = new Date(p.date)
        if (date.getFullYear() === year && date.getMonth() === month) {
          prices[p.date] = p.price
        }
      })
    return prices
  }, [customPrices, selectedRoom, year, month])

  // Calculate stats
  const stats = useMemo(() => {
    const allPrices = Object.values(monthPrices)
    const modifiedDays = allPrices.length
    const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : room.basePrice
    const minPrice = allPrices.length > 0 ? Math.min(...allPrices, room.basePrice) : room.basePrice
    return { modifiedDays, maxPrice, minPrice }
  }, [monthPrices, room.basePrice])

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
    setSelectedDays([])
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
    setSelectedDays([])
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
      const existingPrice = monthPrices[dateStr]
      setEditingPrice(existingPrice?.toString() || room.basePrice.toString())
      setIsDialogOpen(true)
    }
  }

  const handleOpenMultiEditDialog = () => {
    if (selectedDays.length > 0) {
      setEditingPrice(room.basePrice.toString())
      setIsDialogOpen(true)
    }
  }

  const handleSavePrice = () => {
    const price = parseInt(editingPrice)
    if (isNaN(price) || price <= 0) return

    setCustomPrices((prev) => {
      const newPrices = prev.filter(
        (p) => !(p.roomId === selectedRoom && selectedDays.includes(p.date))
      )
      selectedDays.forEach((date) => {
        if (price !== room.basePrice) {
          newPrices.push({ roomId: selectedRoom, date, price })
        }
      })
      return newPrices
    })

    setIsDialogOpen(false)
    setSelectedDays([])
    setIsMultiSelect(false)
  }

  const handleResetToBase = () => {
    setCustomPrices((prev) =>
      prev.filter(
        (p) => !(p.roomId === selectedRoom && selectedDays.includes(p.date))
      )
    )
    setIsDialogOpen(false)
    setSelectedDays([])
    setIsMultiSelect(false)
  }

  const getDayPrice = (day: number): number => {
    const dateStr = formatDate(new Date(year, month, day))
    return monthPrices[dateStr] || room.basePrice
  }

  const isCustomPrice = (day: number): boolean => {
    const dateStr = formatDate(new Date(year, month, day))
    return dateStr in monthPrices
  }

  const isSelected = (day: number): boolean => {
    const dateStr = formatDate(new Date(year, month, day))
    return selectedDays.includes(dateStr)
  }

  // Generate calendar grid
  const calendarDays = []
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Precios por Fecha
          </CardTitle>
          <CardDescription>
            Configura precios especiales para días específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="room-select" className="text-sm font-medium mb-2 block">
                Habitación
              </Label>
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger id="room-select" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} ({r.type}) - {formatCOP(r.basePrice)}/noche
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
                    <Check className="w-4 h-4 mr-1" />
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
                        "w-full h-full rounded-lg border transition-all flex flex-col items-center justify-center gap-0.5 p-1",
                        "hover:border-primary/50 hover:bg-accent/50",
                        isSelected(day) && "ring-2 ring-primary border-primary bg-primary/10",
                        isCustomPrice(day)
                          ? "bg-primary/5 border-primary/30"
                          : "border-border bg-card"
                      )}
                    >
                      <span
                        className={cn(
                          "text-xs sm:text-sm font-medium",
                          isCustomPrice(day) ? "text-primary" : "text-foreground"
                        )}
                      >
                        {day}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] sm:text-xs truncate w-full text-center",
                          isCustomPrice(day)
                            ? "text-primary font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {formatCOP(getDayPrice(day)).replace("COP", "").trim()}
                      </span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-border bg-card" />
                <span className="text-xs text-muted-foreground">Precio base</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border border-primary/30 bg-primary/5" />
                <span className="text-xs text-muted-foreground">Precio personalizado</span>
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
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <DollarSign className="w-4 h-4" />
                Precio base
              </div>
              <p className="text-2xl font-semibold">{formatCOP(room.basePrice)}</p>
              <p className="text-xs text-muted-foreground">por noche</p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <CalendarIcon className="w-4 h-4" />
                Días modificados
              </div>
              <p className="text-2xl font-semibold">{stats.modifiedDays}</p>
              <p className="text-xs text-muted-foreground">de {daysInMonth} días</p>
            </div>

            <div className="p-4 rounded-lg bg-success/10">
              <div className="flex items-center gap-2 text-sm text-success mb-1">
                <TrendingUp className="w-4 h-4" />
                Mayor precio
              </div>
              <p className="text-2xl font-semibold text-success">{formatCOP(stats.maxPrice)}</p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <TrendingDown className="w-4 h-4" />
                Menor precio
              </div>
              <p className="text-2xl font-semibold">{formatCOP(stats.minPrice)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Price Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDays.length === 1 ? "Editar precio" : `Editar ${selectedDays.length} días`}
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
                <>Aplicar el mismo precio a {selectedDays.length} días seleccionados</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="price" className="text-sm font-medium">
                Nuevo precio (COP)
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
                  placeholder={room.basePrice.toString()}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Precio base: {formatCOP(room.basePrice)}
              </p>
            </div>

            {selectedDays.length === 1 && monthPrices[selectedDays[0]] && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Precio actual: {formatCOP(monthPrices[selectedDays[0]])}
                </Badge>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleResetToBase}
              className="w-full sm:w-auto"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restablecer base
            </Button>
            <Button onClick={handleSavePrice} className="w-full sm:w-auto">
              Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
