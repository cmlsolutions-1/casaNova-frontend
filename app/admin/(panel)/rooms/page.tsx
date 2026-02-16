//app/admin/(panel)/rooms/page.tsx
"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useBooking } from "@/lib/booking-context"
import {
  listRoomsService,
  createRoomService,
  updateRoomService,
  updateRoomStatusService,
  updateRoomBusyService,
  type BackendRoom,
  type RoomType,
  type RoomStatus,
} from "@/services/room.service"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { 
  Plus, 
  Pencil,
  Users, 
  BedDouble,
  BedSingle
 } from "lucide-react"




const TYPE_LABEL: Record<RoomType, string> = {
  SIMPLE: "Sencilla",
  DOUBLE: "Doble",
  VIP: "VIP",
}

function roomImageByType(type: RoomType) {
  // 🔥 imágenes quemadas por ahora
  if (type === "VIP") return "https://images.unsplash.com/photo-1541971875076-8f970d573be6?w=800&h=600&fit=crop"
  if (type === "DOUBLE") return "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop"
  return "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop"
}

function RoomForm({
  room,
  onSave,
  onClose,
}: {
  room?: BackendRoom
  onSave: (data: Omit<BackendRoom, "id">) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState<Omit<BackendRoom, "id">>(
    room
      ? {
          type: room.type,
          nameRoom: room.nameRoom,
          singleBeds: room.singleBeds,
          doubleBeds: room.doubleBeds,
          capacity: room.capacity,
          price: room.price,
          status: room.status,
          isBusy: room.isBusy,
        }
      : {
          type: "SIMPLE",
          nameRoom: "",
          singleBeds: 1,
          doubleBeds: 0,
          capacity: 1,
          price: 100,
          status: "ACTIVE",
          isBusy: false,
        },
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSave(form)
      onClose()
    } catch (e: any) {
      setError(e?.message ?? "Error guardando habitación")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-foreground">Nombre habitación</Label>
          <Input
            value={form.nameRoom}
            onChange={(e) => setForm({ ...form, nameRoom: e.target.value })}
            placeholder="Ej: 001"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Tipo</Label>
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as RoomType })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SIMPLE">Sencilla</SelectItem>
              <SelectItem value="DOUBLE">Doble</SelectItem>
              <SelectItem value="VIP">VIP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="space-y-2">
          <Label className="text-foreground">Camas sencillas</Label>
          <Input
            type="number"
            min={0}
            value={form.singleBeds}
            onChange={(e) => setForm({ ...form, singleBeds: Number(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Camas dobles</Label>
          <Input
            type="number"
            min={0}
            value={form.doubleBeds}
            onChange={(e) => setForm({ ...form, doubleBeds: Number(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Capacidad</Label>
          <Input
            type="number"
            min={1}
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Precio/noche ($)</Label>
          <Input
            type="number"
            min={1}
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-foreground">Estado</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as RoomStatus })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Activa</SelectItem>
              <SelectItem value="INACTIVE">Inactiva</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 pt-7">
          <Switch checked={form.isBusy} onCheckedChange={(v) => setForm({ ...form, isBusy: v })} />
          <Label className="text-foreground">Ocupada (isBusy)</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={saving}>
          {saving ? "Guardando..." : room ? "Guardar cambios" : "Crear habitación"}
        </Button>
      </div>
    </form>
  )
}

export default function AdminRoomsPage() {
  const { adminAuth } = useBooking()
  const role = adminAuth.user?.role
  const canManageRooms = role === "SUPER_ADMIN" || role === "ADMIN"

  const [creating, setCreating] = useState(false)
  const [editingRoom, setEditingRoom] = useState<BackendRoom | null>(null)

  const [rooms, setRooms] = useState<BackendRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [changingId, setChangingId] = useState<string | null>(null)

  const loadRooms = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listRoomsService()
      setRooms(data)
    } catch (e: any) {
      setError(e?.message ?? "Error cargando habitaciones")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!adminAuth.isAuthenticated) return
    loadRooms()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminAuth.isAuthenticated])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Habitaciones</h1>
          <p className="text-muted-foreground">Gestiona las habitaciones del hotel</p>
        </div>

        {canManageRooms && (
          <Dialog open={creating} onOpenChange={setCreating}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="mr-2 h-4 w-4" />
                Nueva habitación
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-serif text-foreground">Crear habitación</DialogTitle>
              </DialogHeader>
              <RoomForm
                onSave={async (data) => {
                  await createRoomService(data)
                  await loadRooms()
                }}
                onClose={() => setCreating(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Edit dialog global */}
      <Dialog open={!!editingRoom} onOpenChange={(open) => !open && setEditingRoom(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-foreground">Editar habitación</DialogTitle>
          </DialogHeader>
          {editingRoom && (
            <RoomForm
              room={editingRoom}
              onSave={async (data) => {
                await updateRoomService(editingRoom.id, data)
                await loadRooms()
              }}
              onClose={() => setEditingRoom(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {loading && <p className="text-muted-foreground">Cargando...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rooms.map((room) => {
          const img = roomImageByType(room.type)
          const isActive = room.status === "ACTIVE"

          return (
            <Card key={room.id} className="overflow-hidden border-border">
              <div className="relative h-40">
                <img src={img} alt={room.nameRoom} className="h-full w-full object-cover" />

                <div className="absolute top-2 right-2 flex gap-2">
                  <Badge
                    className={
                      isActive
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-red-100 text-red-700 border border-red-300"
                    }
                  >
                    {isActive ? "Activa" : "Inactiva"}
                  </Badge>

                  <Badge
                    className={
                      room.isBusy
                        ? "bg-amber-100 text-amber-700 border border-amber-300"
                        : "bg-blue-100 text-blue-700 border border-blue-300"
                    }
                  >
                    {room.isBusy ? "Ocupada" : "Libre"}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-semibold text-foreground">Hab. {room.nameRoom}</h3>
                  <span className="text-lg font-bold text-accent">
                    ${room.price}
                    <span className="text-xs text-muted-foreground">/noche</span>
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{room.capacity}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <BedSingle className="h-4 w-4" />
                    <span>{room.singleBeds}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <BedDouble className="h-4 w-4" />
                    <span>{room.doubleBeds}</span>
                  </div>
                </div>


                {canManageRooms && (
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingRoom(room)}>
                      <Pencil className="mr-2 h-3 w-3" />
                      Editar
                    </Button>

                    {/* Botón estado ACTIVE/INACTIVE */}
                    <Button
                      size="sm"
                      className={
                        isActive ? "bg-red-600 text-white hover:bg-red-700" : "bg-green-600 text-white hover:bg-green-700"
                      }
                      disabled={changingId === room.id}
                      onClick={async () => {
                        setChangingId(room.id)
                        try {
                          await updateRoomStatusService(room.id, isActive ? "INACTIVE" : "ACTIVE")
                          await loadRooms()
                        } finally {
                          setChangingId(null)
                        }
                      }}
                    >
                      {changingId === room.id ? "Procesando..." : isActive ? "Inactivar" : "Activar"}
                    </Button>

                    {/* Botón busy */}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={changingId === room.id}
                      onClick={async () => {
                        setChangingId(room.id)
                        try {
                          await updateRoomBusyService(room.id, !room.isBusy)
                          await loadRooms()
                        } finally {
                          setChangingId(null)
                        }
                      }}
                    >
                      {room.isBusy ? "Marcar libre" : "Marcar ocupada"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
