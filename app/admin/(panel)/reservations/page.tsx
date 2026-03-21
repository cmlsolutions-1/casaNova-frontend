//app/admin/(panel)/reservations/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { useBooking } from "@/lib/booking-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Eye, Filter } from "lucide-react"
import { authStorage } from "@/lib/auth-storage"

import {
  listReservationsService,
  updateReservationByAdminService,
  type ReservationListItem,
} from "@/services/reservation.service"
import { formatCurrencyCOP } from "@/utils/format"
import { formatDateSpanish } from "@/utils/date"

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PAID_PENDING_APPROVAL: "Pago pendiente",
  APPROVED: "Aprobada",
  CONFIRMED: "Confirmada",
  REJECTED: "Rechazada",
}

const statusClassName = (s: string) => {
  if (s === "PENDING") {
    return "bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-100"
  }

  if (s === "PAID_PENDING_APPROVAL") {
    return "bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-100"
  }

  if (s === "APPROVED") {
    return "bg-orange-100 text-orange-800 border border-orange-300 hover:bg-orange-100"
  }

  if (s === "CONFIRMED") {
    return "bg-green-100 text-green-800 border border-green-300 hover:bg-green-100"
  }

  if (s === "REJECTED") {
    return "bg-red-100 text-red-800 border border-red-300 hover:bg-red-100"
  }

  return "bg-muted text-muted-foreground border border-border"
}

export default function AdminReservationsPage() {
  const { adminAuth } = useBooking()

  const [reservations, setReservations] = useState<ReservationListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDate, setFilterDate] = useState("")
  const [selectedRes, setSelectedRes] = useState<ReservationListItem | null>(null)
  const [editingRes, setEditingRes] = useState<ReservationListItem | null>(null)

  const isEmployee = adminAuth.user?.role === "EMPLOYEE"

  const loadReservations = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await listReservationsService()

      if (!res?.ok || !Array.isArray(res?.data?.data)) {
        throw new Error("No se pudieron cargar las reservas")
      }

      setReservations(res.data.data)
    } catch (e: any) {
      setError(e?.message || "Error cargando reservas")
      setReservations([])
    } finally {
      setLoading(false)
    }
  }

  const getReservationDetailLabel = (res: ReservationListItem) => {
  const roomNames = res.rooms?.map((room) => room.nameRoom).filter(Boolean) ?? []
  const serviceNames = res.services?.map((service) => service.name).filter(Boolean) ?? []

    if (roomNames.length > 0) {
      return roomNames.join(", ")
    }

    if (serviceNames.length > 0) {
      return serviceNames.join(", ")
    }

    return "Sin detalle"
  }

  useEffect(() => {
    loadReservations()
  }, [])

  const filtered = useMemo(() => {
    let result = [...reservations]

    if (filterStatus !== "all") {
      result = result.filter((r) => r.status === filterStatus)
    }

    if (filterDate) {
      result = result.filter((r) => {
        const start = new Date(r.startDate).toISOString().slice(0, 10)
        const end = new Date(r.endDate).toISOString().slice(0, 10)
        return start <= filterDate && end >= filterDate
      })
    }

    return result.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.startDate).getTime()
      const dateB = new Date(b.createdAt || b.startDate).getTime()
      return dateB - dateA
    })
  }, [reservations, filterStatus, filterDate])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">Reservas</h1>
        <p className="text-muted-foreground">
          {isEmployee ? "Vista de reservas (solo lectura)" : "Gestiona las reservas del sistema"}
        </p>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>

      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filtros:</span>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Estado</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="PAID_PENDING_APPROVAL">Pago pendiente</SelectItem>
                  <SelectItem value="APPROVED">Aprobada</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                  <SelectItem value="REJECTED">Rechazada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Fecha</Label>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-48"
              />
            </div>

            {(filterStatus !== "all" || filterDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterStatus("all")
                  setFilterDate("")
                }}
              >
                Limpiar
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={loadReservations} disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Cargando reservas...</p>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No se encontraron reservas con los filtros aplicados.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Nro Reserva</th>
                <th className="pb-3 pr-4 font-medium">Huésped</th>
                <th className="pb-3 pr-4 font-medium">Habitación/Servicio</th>
                <th className="pb-3 pr-4 font-medium">Fechas</th>
                <th className="pb-3 pr-4 font-medium">Total</th>
                <th className="pb-3 pr-4 font-medium">Estado</th>
                <th className="pb-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((res) => {
                const detailLabel = getReservationDetailLabel(res)

                return (
                  <tr key={res.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 pr-4 font-mono text-xs text-foreground">
                      {res.reservationCode || res.id}
                    </td>
                    <td className="py-3 pr-4 text-foreground">
                      {res.client?.fullName || res.client?.documentNumber || "Sin nombre"}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{detailLabel}</td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">
                      {formatDateSpanish(res.startDate)} - {formatDateSpanish(res.endDate)}
                    </td>
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {formatCurrencyCOP(res.totalValue)}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge className={statusClassName(res.status)}>
                        {statusLabels[res.status] || res.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedRes(res)}>
                          <Eye className="h-4 w-4" />
                        </Button>

                        {!isEmployee && (
                          <Button variant="ghost" size="sm" onClick={() => setEditingRes(res)}>
                            Editar fechas
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!selectedRes} onOpenChange={(o) => !o && setSelectedRes(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-foreground">Detalle de Reserva</DialogTitle>
          </DialogHeader>

          {selectedRes && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground">Código</p>
                  <p className="font-mono text-foreground">
                    {selectedRes.reservationCode || selectedRes.id}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">Estado</p>
                  <Badge className={statusClassName(selectedRes.status)}>
                    {statusLabels[selectedRes.status] || selectedRes.status}
                  </Badge>
                </div>

                <div>
                  <p className="text-muted-foreground">Huésped</p>
                  <p className="font-medium text-foreground">
                    {selectedRes.client?.fullName || "No disponible"}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">Documento</p>
                  <p className="text-foreground">
                    {selectedRes.client?.documentNumber || "No disponible"}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground">Fecha de ingreso</p>
                  <p className="text-foreground">{formatDateSpanish(selectedRes.startDate)}</p>
                </div>

                <div>
                  <p className="text-muted-foreground">Fecha de salida</p>
                  <p className="text-foreground">{formatDateSpanish(selectedRes.endDate)}</p>
                </div>
              </div>

              <div>
                <p className="mb-1 text-muted-foreground">Habitaciones</p>
                {selectedRes.rooms?.length ? (
                  <ul className="space-y-1">
                    {selectedRes.rooms.map((room) => (
                      <li key={room.id} className="text-foreground">
                        {room.nameRoom} - {room.numberOfPeople} personas
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-foreground">No disponible</p>
                )}
              </div>

              {selectedRes.services?.length ? (
                <div>
                  <p className="mb-1 text-muted-foreground">Servicios</p>
                  <ul className="space-y-1">
                    {selectedRes.services.map((service) => (
                      <li key={service.id} className="text-foreground">
                        {service.name || service.id}
                        {service.amount ? ` x${service.amount}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="border-t border-border pt-2">
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">Total</span>
                  <span className="text-lg font-bold text-accent">
                    {formatCurrencyCOP(selectedRes.totalValue)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingRes} onOpenChange={(o) => !o && setEditingRes(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-foreground">Editar fechas de reserva</DialogTitle>
          </DialogHeader>

          {editingRes && (
            <EditReservationForm
              reservation={editingRes}
              token={authStorage.getAccess() || ""}
              onSaved={() => {
                setEditingRes(null)
                loadReservations()
              }}
              onClose={() => setEditingRes(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EditReservationForm({
  reservation,
  token,
  onSaved,
  onClose,
}: {
  reservation: ReservationListItem
  token: string
  onSaved: () => void
  onClose: () => void
}) {
  const [startDate, setStartDate] = useState(
    new Date(reservation.startDate).toISOString().slice(0, 10)
  )
  const [endDate, setEndDate] = useState(
    new Date(reservation.endDate).toISOString().slice(0, 10)
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      await updateReservationByAdminService(
        reservation.id,
        {
          startDate,
          endDate,
        },
        token,
      )

      onSaved()
    } catch (e: any) {
      setError(e?.message || "No se pudo actualizar la reserva")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-foreground">Fecha inicio</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Fecha fin</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button
          className="bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  )
}