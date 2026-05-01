"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Moon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CalendarRange,
  CalendarDays,
} from "lucide-react"
import {
  initialSpecialSeasons,
  type SpecialSeason,
} from "@/lib/hotel-data"
import { cn } from "@/lib/utils"

export function SpecialSeasons() {
  const [seasons, setSeasons] = useState<SpecialSeason[]>(initialSpecialSeasons)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingSeason, setEditingSeason] = useState<SpecialSeason | null>(null)
  const [formData, setFormData] = useState<Partial<SpecialSeason>>({
    name: "",
    keyDate: "",
    startDate: "",
    endDate: "",
    minimumNights: 2,
    description: "",
    active: true,
  })
  const [dateType, setDateType] = useState<"single" | "range">("single")

  // Simulator state
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")

  const resetForm = () => {
    setFormData({
      name: "",
      keyDate: "",
      startDate: "",
      endDate: "",
      minimumNights: 2,
      description: "",
      active: true,
    })
    setDateType("single")
    setEditingSeason(null)
  }

  const handleCreateSeason = () => {
    const newSeason: SpecialSeason = {
      id: `season-${Date.now()}`,
      name: formData.name || "",
      keyDate: dateType === "single" ? formData.keyDate : undefined,
      startDate: dateType === "range" ? formData.startDate : undefined,
      endDate: dateType === "range" ? formData.endDate : undefined,
      minimumNights: formData.minimumNights || 2,
      description: formData.description || "",
      active: formData.active ?? true,
    }

    if (editingSeason) {
      setSeasons((prev) =>
        prev.map((s) => (s.id === editingSeason.id ? { ...newSeason, id: editingSeason.id } : s))
      )
    } else {
      setSeasons((prev) => [...prev, newSeason])
    }

    setIsCreateDialogOpen(false)
    resetForm()
  }

  const handleEditSeason = (season: SpecialSeason) => {
    setEditingSeason(season)
    setFormData({
      name: season.name,
      keyDate: season.keyDate || "",
      startDate: season.startDate || "",
      endDate: season.endDate || "",
      minimumNights: season.minimumNights,
      description: season.description,
      active: season.active,
    })
    setDateType(season.keyDate ? "single" : "range")
    setIsCreateDialogOpen(true)
  }

  const handleDeleteSeason = (seasonId: string) => {
    setSeasons((prev) => prev.filter((s) => s.id !== seasonId))
  }

  const handleToggleActive = (seasonId: string) => {
    setSeasons((prev) =>
      prev.map((s) => (s.id === seasonId ? { ...s, active: !s.active } : s))
    )
  }

  // Simulator logic
  const simulationResult = useMemo(() => {
    if (!checkIn || !checkOut) return null

    const checkInDate = new Date(checkIn + "T12:00:00")
    const checkOutDate = new Date(checkOut + "T12:00:00")

    if (checkOutDate <= checkInDate) {
      return { valid: false, message: "La fecha de salida debe ser posterior a la entrada" }
    }

    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

    // Check all active seasons
    const violations: string[] = []
    const activeSeasons = seasons.filter((s) => s.active)

    for (const season of activeSeasons) {
      let seasonApplies = false

      if (season.keyDate) {
        // Single date season - check if the key date falls within the reservation
        const keyDate = new Date(season.keyDate + "T12:00:00")
        if (keyDate >= checkInDate && keyDate < checkOutDate) {
          seasonApplies = true
        }
      } else if (season.startDate && season.endDate) {
        // Range season - check if any day of the range overlaps with the reservation
        const rangeStart = new Date(season.startDate + "T12:00:00")
        const rangeEnd = new Date(season.endDate + "T12:00:00")

        // Check for overlap
        if (checkInDate <= rangeEnd && checkOutDate > rangeStart) {
          seasonApplies = true
        }
      }

      if (seasonApplies && nights < season.minimumNights) {
        violations.push(
          `La reserva incluye ${season.name} y requiere mínimo ${season.minimumNights} noches (tienes ${nights})`
        )
      }
    }

    if (violations.length > 0) {
      return { valid: false, message: violations.join(". "), nights }
    }

    return { valid: true, message: `Reserva permitida (${nights} noche${nights > 1 ? "s" : ""})`, nights }
  }, [checkIn, checkOut, seasons])

  const formatSeasonDates = (season: SpecialSeason): string => {
    if (season.keyDate) {
      return new Date(season.keyDate + "T12:00:00").toLocaleDateString("es-CO", {
        day: "numeric",
        month: "long",
      })
    }
    if (season.startDate && season.endDate) {
      const start = new Date(season.startDate + "T12:00:00").toLocaleDateString("es-CO", {
        day: "numeric",
        month: "short",
      })
      const end = new Date(season.endDate + "T12:00:00").toLocaleDateString("es-CO", {
        day: "numeric",
        month: "short",
      })
      return `${start} - ${end}`
    }
    return ""
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Temporadas Especiales
              </CardTitle>
              <CardDescription>
                Configura reglas de mínimo de noches para fechas especiales
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
              setIsCreateDialogOpen(open)
              if (!open) resetForm()
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva temporada
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingSeason ? "Editar temporada" : "Crear temporada especial"}
                  </DialogTitle>
                  <DialogDescription>
                    Define las reglas de mínimo de noches para esta temporada
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="season-name">Nombre de la temporada</Label>
                    <Input
                      id="season-name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="ej: Navidad, Semana Santa"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Tipo de fecha</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={dateType === "single" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDateType("single")}
                        className="flex-1"
                      >
                        <CalendarDays className="w-4 h-4 mr-2" />
                        Fecha clave
                      </Button>
                      <Button
                        type="button"
                        variant={dateType === "range" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDateType("range")}
                        className="flex-1"
                      >
                        <CalendarRange className="w-4 h-4 mr-2" />
                        Rango de fechas
                      </Button>
                    </div>
                  </div>

                  {dateType === "single" ? (
                    <div>
                      <Label htmlFor="key-date">Fecha clave</Label>
                      <Input
                        id="key-date"
                        type="date"
                        value={formData.keyDate}
                        onChange={(e) => setFormData((prev) => ({ ...prev, keyDate: e.target.value }))}
                        className="mt-2"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start-date">Fecha inicio</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-date">Fecha fin</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="min-nights">Mínimo de noches requerido</Label>
                    <Input
                      id="min-nights"
                      type="number"
                      min={1}
                      value={formData.minimumNights}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, minimumNights: parseInt(e.target.value) || 2 }))
                      }
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción o nota</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Información adicional sobre esta temporada..."
                      className="mt-2"
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <Label htmlFor="active-switch">Estado activo</Label>
                      <p className="text-xs text-muted-foreground">
                        Las reglas inactivas no afectan las reservas
                      </p>
                    </div>
                    <Switch
                      id="active-switch"
                      checked={formData.active}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, active: checked }))}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateSeason}>
                    {editingSeason ? "Guardar cambios" : "Crear temporada"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seasons List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Temporadas configuradas ({seasons.length})
          </h3>

          {seasons.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No hay temporadas configuradas</p>
                <p className="text-sm text-muted-foreground/70">
                  Crea tu primera temporada especial
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {seasons.map((season) => (
                <Card
                  key={season.id}
                  className={cn(
                    "transition-all",
                    !season.active && "opacity-60"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{season.name}</h4>
                          <Badge
                            variant={season.active ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {season.active ? "Activa" : "Inactiva"}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatSeasonDates(season)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Moon className="w-4 h-4" />
                            Mínimo {season.minimumNights} noche{season.minimumNights > 1 ? "s" : ""}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">{season.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Switch
                          checked={season.active}
                          onCheckedChange={() => handleToggleActive(season.id)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditSeason(season)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSeason(season.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Simulator */}
        <Card className="h-fit sticky top-24">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarRange className="w-5 h-5 text-primary" />
              Simulador de Reserva
            </CardTitle>
            <CardDescription>
              Verifica si una reserva cumple las reglas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="check-in">Fecha de entrada</Label>
              <Input
                id="check-in"
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="check-out">Fecha de salida</Label>
              <Input
                id="check-out"
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="mt-2"
              />
            </div>

            {simulationResult && (
              <div
                className={cn(
                  "p-4 rounded-lg",
                  simulationResult.valid
                    ? "bg-success/10 border border-success/30"
                    : "bg-destructive/10 border border-destructive/30"
                )}
              >
                <div className="flex items-start gap-3">
                  {simulationResult.valid ? (
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p
                      className={cn(
                        "font-medium text-sm",
                        simulationResult.valid ? "text-success" : "text-destructive"
                      )}
                    >
                      {simulationResult.valid ? "Reserva permitida" : "Reserva no permitida"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {simulationResult.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Example scenarios */}
            <div className="pt-4 border-t">
              <p className="text-xs font-medium text-muted-foreground mb-3">
                Ejemplos para probar:
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs h-auto py-2"
                  onClick={() => {
                    setCheckIn("2026-12-23")
                    setCheckOut("2026-12-25")
                  }}
                >
                  <AlertTriangle className="w-3 h-3 mr-2 text-warning" />
                  23-25 dic (2 noches - NO válido)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs h-auto py-2"
                  onClick={() => {
                    setCheckIn("2026-12-23")
                    setCheckOut("2026-12-26")
                  }}
                >
                  <CheckCircle2 className="w-3 h-3 mr-2 text-success" />
                  23-26 dic (3 noches - válido)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs h-auto py-2"
                  onClick={() => {
                    setCheckIn("2026-12-30")
                    setCheckOut("2027-01-01")
                  }}
                >
                  <AlertTriangle className="w-3 h-3 mr-2 text-warning" />
                  30 dic - 1 ene (2 noches - NO válido)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs h-auto py-2"
                  onClick={() => {
                    setCheckIn("2026-12-30")
                    setCheckOut("2027-01-02")
                  }}
                >
                  <CheckCircle2 className="w-3 h-3 mr-2 text-success" />
                  30 dic - 2 ene (3 noches - válido)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs h-auto py-2"
                  onClick={() => {
                    setCheckIn("2026-04-03")
                    setCheckOut("2026-04-04")
                  }}
                >
                  <AlertTriangle className="w-3 h-3 mr-2 text-warning" />
                  3-4 abril (1 noche - Semana Santa NO válido)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
