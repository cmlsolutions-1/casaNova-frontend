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
  Moon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CalendarRange,
  CalendarDays,
  Loader2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  listSeasonsService,
  createSeasonService,
  updateSeasonService,
  updateSeasonStatusService,
  type BackendSeason,
  type SeasonType,
} from "@/services/season.service"

type FormData = {
  name: string
  description: string
  keyDate: string
  startDate: string
  endDate: string
  minimumNights: number
  status: "ACTIVE" | "INACTIVE"
}

function emptyForm(): FormData {
  return {
    name: "",
    description: "",
    keyDate: "",
    startDate: "",
    endDate: "",
    minimumNights: 2,
    status: "ACTIVE",
  }
}

function normalizeDate(value?: string | null) {
  if (!value) return ""
  return value.split("T")[0]
}

function getNights(start: string, end: string) {
  const startDate = new Date(`${start}T12:00:00`)
  const endDate = new Date(`${end}T12:00:00`)

  return Math.max(
    1,
    Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000)
  )
}

function seasonApplies(season: BackendSeason, checkIn: string, checkOut: string) {
  const checkInDate = new Date(`${checkIn}T12:00:00`)
  const checkOutDate = new Date(`${checkOut}T12:00:00`)

  if (season.type === "KEY_DATE" && season.keyDate) {
    const keyDate = new Date(`${normalizeDate(season.keyDate)}T12:00:00`)
    return keyDate >= checkInDate && keyDate < checkOutDate
  }

  if (season.type === "DATE_RANGE" && season.startDate && season.endDate) {
    const start = new Date(`${normalizeDate(season.startDate)}T12:00:00`)
    const end = new Date(`${normalizeDate(season.endDate)}T12:00:00`)
    return checkInDate <= end && checkOutDate > start
  }

  return false
}

export function SpecialSeasons() {
  const [seasons, setSeasons] = useState<BackendSeason[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingSeason, setEditingSeason] = useState<BackendSeason | null>(null)
  const [formData, setFormData] = useState<FormData>(emptyForm())
  const [dateType, setDateType] = useState<"single" | "range">("single")

  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSeasons = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await listSeasonsService()
      setSeasons(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setError(e?.message ?? "No se pudieron cargar las temporadas")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSeasons()
  }, [])

  const resetForm = () => {
    setFormData(emptyForm())
    setDateType("single")
    setEditingSeason(null)
  }

  const buildPayload = () => {
    const type: SeasonType = dateType === "single" ? "KEY_DATE" : "DATE_RANGE"

    return {
      name: formData.name.trim(),
      description: formData.description.trim(),
      type,
      keyDate: type === "KEY_DATE" ? formData.keyDate : null,
      startDate: type === "DATE_RANGE" ? formData.startDate : null,
      endDate: type === "DATE_RANGE" ? formData.endDate : null,
      minimumNights: Number(formData.minimumNights || 1),
    }
  }

  const handleSaveSeason = async () => {
    const payload = buildPayload()

    if (!payload.name) return
    if (payload.type === "KEY_DATE" && !payload.keyDate) return
    if (payload.type === "DATE_RANGE" && (!payload.startDate || !payload.endDate)) return

    setIsSaving(true)

    try {
      if (editingSeason) {
        const updated = await updateSeasonService(editingSeason.id, payload)

        setSeasons((prev) =>
          prev.map((s) => (s.id === editingSeason.id ? updated : s))
        )
      } else {
        const created = await createSeasonService(payload)
        setSeasons((prev) => [created, ...prev])
      }

      setIsCreateDialogOpen(false)
      resetForm()
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditSeason = (season: BackendSeason) => {
    const isKeyDate = season.type === "KEY_DATE"

    setEditingSeason(season)
    setDateType(isKeyDate ? "single" : "range")

    setFormData({
      name: season.name ?? "",
      description: season.description ?? "",
      keyDate: normalizeDate(season.keyDate),
      startDate: normalizeDate(season.startDate),
      endDate: normalizeDate(season.endDate),
      minimumNights: Number(season.minimumNights ?? 2),
      status: season.status ?? "ACTIVE",
    })

    setIsCreateDialogOpen(true)
  }

  const handleToggleActive = async (season: BackendSeason) => {
    const nextStatus = season.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"

    setSeasons((prev) =>
      prev.map((s) => (s.id === season.id ? { ...s, status: nextStatus } : s))
    )

    try {
      await updateSeasonStatusService(season.id, nextStatus)
    } catch {
      setSeasons((prev) =>
        prev.map((s) =>
          s.id === season.id ? { ...s, status: season.status } : s
        )
      )
    }
  }

  const simulationResult = useMemo(() => {
    if (!checkIn || !checkOut) return null

    const checkInDate = new Date(`${checkIn}T12:00:00`)
    const checkOutDate = new Date(`${checkOut}T12:00:00`)

    if (checkOutDate <= checkInDate) {
      return {
        valid: false,
        message: "La fecha de salida debe ser posterior a la entrada",
      }
    }

    const nights = getNights(checkIn, checkOut)

    const violation = seasons
      .filter((s) => s.status === "ACTIVE")
      .find((season) => {
        return (
          seasonApplies(season, checkIn, checkOut) &&
          nights < Number(season.minimumNights ?? 1)
        )
      })

    if (violation) {
      return {
        valid: false,
        nights,
        message: `La reserva incluye ${violation.name} y requiere mínimo ${violation.minimumNights} noche${
          violation.minimumNights > 1 ? "s" : ""
        }. Actualmente seleccionaste ${nights} noche${nights > 1 ? "s" : ""}.`,
      }
    }

    return {
      valid: true,
      nights,
      message: `Reserva permitida (${nights} noche${nights > 1 ? "s" : ""})`,
    }
  }, [checkIn, checkOut, seasons])

  const formatSeasonDates = (season: BackendSeason) => {
    if (season.type === "KEY_DATE" && season.keyDate) {
      return new Date(`${normalizeDate(season.keyDate)}T12:00:00`).toLocaleDateString(
        "es-CO",
        { day: "numeric", month: "long", year: "numeric" }
      )
    }

    if (season.startDate && season.endDate) {
      const start = new Date(`${normalizeDate(season.startDate)}T12:00:00`)
        .toLocaleDateString("es-CO", { day: "numeric", month: "short" })

      const end = new Date(`${normalizeDate(season.endDate)}T12:00:00`)
        .toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })

      return `${start} - ${end}`
    }

    return "Sin fecha"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Temporadas Especiales
              </CardTitle>
              <CardDescription>
                Configura reglas de mínimo de noches para fechas especiales.
              </CardDescription>
            </div>

            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={(open) => {
                setIsCreateDialogOpen(open)
                if (!open) resetForm()
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva temporada
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingSeason ? "Editar temporada" : "Crear temporada especial"}
                  </DialogTitle>
                  <DialogDescription>
                    Define el mínimo de noches requerido para esta temporada.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="season-name">Nombre</Label>
                    <Input
                      id="season-name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Ej: Semana Santa, Navidad, Año Nuevo"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block">Tipo de temporada</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={dateType === "single" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDateType("single")}
                        className="flex-1"
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Fecha clave
                      </Button>

                      <Button
                        type="button"
                        variant={dateType === "range" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDateType("range")}
                        className="flex-1"
                      >
                        <CalendarRange className="mr-2 h-4 w-4" />
                        Rango
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
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            keyDate: e.target.value,
                          }))
                        }
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
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              startDate: e.target.value,
                            }))
                          }
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="end-date">Fecha fin</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              endDate: e.target.value,
                            }))
                          }
                          className="mt-2"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="min-nights">Mínimo de noches</Label>
                    <Input
                      id="min-nights"
                      type="number"
                      min={1}
                      value={formData.minimumNights}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          minimumNights: Number(e.target.value || 1),
                        }))
                      }
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Información adicional sobre esta temporada..."
                      className="mt-2"
                      rows={2}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    disabled={isSaving}
                  >
                    Cancelar
                  </Button>

                  <Button onClick={handleSaveSeason} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : editingSeason ? (
                      "Guardar cambios"
                    ) : (
                      "Crear temporada"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Temporadas configuradas ({seasons.length})
          </h3>

          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando temporadas...
              </CardContent>
            </Card>
          ) : seasons.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  No hay temporadas configuradas.
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
                    season.status !== "ACTIVE" && "opacity-60"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold">{season.name}</h4>

                          <Badge
                            variant={
                              season.status === "ACTIVE" ? "default" : "secondary"
                            }
                            className="text-xs"
                          >
                            {season.status === "ACTIVE" ? "Activa" : "Inactiva"}
                          </Badge>

                          <Badge variant="outline" className="text-xs">
                            {season.type === "KEY_DATE"
                              ? "Fecha clave"
                              : "Rango"}
                          </Badge>
                        </div>

                        <div className="mb-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatSeasonDates(season)}
                          </div>

                          <div className="flex items-center gap-1">
                            <Moon className="h-4 w-4" />
                            Mínimo {season.minimumNights} noche
                            {season.minimumNights > 1 ? "s" : ""}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {season.description || "Sin descripción"}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <Switch
                          checked={season.status === "ACTIVE"}
                          onCheckedChange={() => handleToggleActive(season)}
                        />

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditSeason(season)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarRange className="h-5 w-5 text-primary" />
              Simulador de Reserva
            </CardTitle>
            <CardDescription>
              Verifica si una reserva cumple las reglas.
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
                  "rounded-lg border p-4",
                  simulationResult.valid
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-red-300 bg-red-50"
                )}
              >
                <div className="flex items-start gap-3">
                  {simulationResult.valid ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  )}

                  <div>
                    <p
                      className={cn(
                        "text-sm font-medium",
                        simulationResult.valid
                          ? "text-emerald-700"
                          : "text-red-700"
                      )}
                    >
                      {simulationResult.valid
                        ? "Reserva permitida"
                        : "Reserva no permitida"}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {simulationResult.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground">
                Ejemplo rápido:
              </p>

              <Button
                variant="outline"
                size="sm"
                className="h-auto w-full justify-start py-2 text-xs"
                onClick={() => {
                  setCheckIn("2026-12-23")
                  setCheckOut("2026-12-25")
                }}
              >
                <AlertTriangle className="mr-2 h-3 w-3 text-amber-600" />
                23-25 dic
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}