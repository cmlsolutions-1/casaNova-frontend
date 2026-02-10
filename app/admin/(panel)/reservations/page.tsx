"use client"

import { useState, useMemo } from "react"
import { useBooking } from "@/lib/booking-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, X, Eye, Filter } from "lucide-react"
import type { Reservation } from "@/lib/mock-data"

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PAID_PENDING_APPROVAL: "Pago pendiente",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
}

const statusVariant = (s: string) => {
  if (s === "APPROVED") return "default" as const
  if (s === "REJECTED") return "destructive" as const
  if (s === "PAID_PENDING_APPROVAL") return "secondary" as const
  return "outline" as const
}

export default function AdminReservationsPage() {
  const { reservations, rooms, services, payments, updateReservationStatus, updateReservation, adminAuth } = useBooking()
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDate, setFilterDate] = useState("")
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null)
  const [editingRes, setEditingRes] = useState<Reservation | null>(null)
  const isEmployee = adminAuth.user?.role === "EMPLOYEE"

  const filtered = useMemo(() => {
    let result = [...reservations]
    if (filterStatus !== "all") {
      result = result.filter((r) => r.status === filterStatus)
    }
    if (filterDate) {
      result = result.filter((r) => r.startDate <= filterDate && r.endDate >= filterDate)
    }
    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [reservations, filterStatus, filterDate])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">Reservas</h1>
        <p className="text-muted-foreground">
          {isEmployee ? "Vista de reservas (solo lectura)" : "Gestiona y aprueba reservas"}
        </p>
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
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="PAID_PENDING_APPROVAL">Pago pendiente</SelectItem>
                  <SelectItem value="APPROVED">Aprobada</SelectItem>
                  <SelectItem value="REJECTED">Rechazada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Fecha</Label>
              <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-48" />
            </div>
            {(filterStatus !== "all" || filterDate) && (
              <Button variant="ghost" size="sm" onClick={() => { setFilterStatus("all"); setFilterDate("") }}>
                Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
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
                <th className="pb-3 pr-4 font-medium">ID</th>
                <th className="pb-3 pr-4 font-medium">Huesped</th>
                <th className="pb-3 pr-4 font-medium">Habitacion</th>
                <th className="pb-3 pr-4 font-medium">Fechas</th>
                <th className="pb-3 pr-4 font-medium">Total</th>
                <th className="pb-3 pr-4 font-medium">Estado</th>
                <th className="pb-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((res) => {
                const room = rooms.find((r) => r.id === res.roomId)
                const payment = payments.find((p) => p.reservationId === res.id)
                return (
                  <tr key={res.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 pr-4 font-mono text-xs text-foreground">{res.id}</td>
                    <td className="py-3 pr-4 text-foreground">{res.guestInfo.name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{room?.name || res.roomId}</td>
                    <td className="py-3 pr-4 text-muted-foreground text-xs">{res.startDate} - {res.endDate}</td>
                    <td className="py-3 pr-4 font-medium text-foreground">
                      ${res.totalPrice.toLocaleString()}
                      {payment && (
                        <Badge variant="outline" className="ml-2 text-[10px]">
                          {payment.status === "paid" ? "Pagado" : "Pendiente"}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={statusVariant(res.status)}>{statusLabels[res.status]}</Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedRes(res)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!isEmployee && res.status === "PAID_PENDING_APPROVAL" && (
                          <>
                            <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700" onClick={() => updateReservationStatus(res.id, "APPROVED")}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive/80" onClick={() => updateReservationStatus(res.id, "REJECTED")}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {!isEmployee && (
                          <Button variant="ghost" size="sm" onClick={() => setEditingRes(res)}>
                            Editar
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

      {/* Detail dialog */}
      <Dialog open={!!selectedRes} onOpenChange={(o) => !o && setSelectedRes(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-foreground">Detalle de Reserva</DialogTitle>
          </DialogHeader>
          {selectedRes && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground">ID</p>
                  <p className="font-mono text-foreground">{selectedRes.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Estado</p>
                  <Badge variant={statusVariant(selectedRes.status)}>{statusLabels[selectedRes.status]}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Huesped</p>
                  <p className="font-medium text-foreground">{selectedRes.guestInfo.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="text-foreground">{selectedRes.guestInfo.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Telefono</p>
                  <p className="text-foreground">{selectedRes.guestInfo.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Documento</p>
                  <p className="text-foreground">{selectedRes.guestInfo.documentType} {selectedRes.guestInfo.documentNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fechas</p>
                  <p className="text-foreground">{selectedRes.startDate} - {selectedRes.endDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Personas</p>
                  <p className="text-foreground">{selectedRes.adults} adultos, {selectedRes.kids} ninos, {selectedRes.babies} bebes, {selectedRes.pets} mascotas</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Habitacion</p>
                <p className="font-medium text-foreground">{rooms.find((r) => r.id === selectedRes.roomId)?.name || selectedRes.roomId}</p>
              </div>
              {selectedRes.services.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-1">Servicios</p>
                  <ul className="space-y-1">
                    {selectedRes.services.map((s) => {
                      const svc = services.find((sv) => sv.id === s.serviceId)
                      return (
                        <li key={s.serviceId} className="text-foreground">
                          {svc?.name || s.serviceId} x{s.amount} = ${(svc?.price || 0) * s.amount}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
              <div className="pt-2 border-t border-border">
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">Total</span>
                  <span className="text-lg font-bold text-accent">${selectedRes.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editingRes} onOpenChange={(o) => !o && setEditingRes(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-foreground">Editar Reserva</DialogTitle>
          </DialogHeader>
          {editingRes && (
            <EditReservationForm
              reservation={editingRes}
              rooms={rooms}
              onSave={(id, data) => {
                updateReservation(id, data)
                setEditingRes(null)
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
  rooms,
  onSave,
  onClose,
}: {
  reservation: Reservation
  rooms: { id: string; name: string }[]
  onSave: (id: string, data: Partial<Reservation>) => void
  onClose: () => void
}) {
  const [startDate, setStartDate] = useState(reservation.startDate)
  const [endDate, setEndDate] = useState(reservation.endDate)
  const [status, setStatus] = useState(reservation.status)
  const [roomId, setRoomId] = useState(reservation.roomId)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-foreground">Fecha inicio</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground">Fecha fin</Label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Habitacion</Label>
        <Select value={roomId} onValueChange={setRoomId}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {rooms.map((r) => (
              <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Estado</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as Reservation["status"])}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pendiente</SelectItem>
            <SelectItem value="PAID_PENDING_APPROVAL">Pago pendiente</SelectItem>
            <SelectItem value="APPROVED">Aprobada</SelectItem>
            <SelectItem value="REJECTED">Rechazada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button
          className="bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={() => onSave(reservation.id, { startDate, endDate, status, roomId })}
        >
          Guardar cambios
        </Button>
      </div>
    </div>
  )
}
