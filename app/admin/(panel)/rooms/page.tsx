//app/admin/(panel)/rooms/page.tsx
"use client"

import React, { useEffect, useState } from "react"
import { useBooking } from "@/lib/booking-context"
import { listAmenitiesService, type BackendAmenity } from "@/services/amenity.service"
import {
  listRoomsService,
  getRoomService,
  createRoomService,
  updateRoomService,
  updateRoomStatusService,
  updateRoomBusyService,
  type BackendRoom,
  type RoomType,
  type RoomStatus,
  type RoomUpsertBody,
} from "@/services/room.service"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"

import { Plus, Pencil, Users, BedDouble, BedSingle } from "lucide-react"
import { uploadMediaService } from "@/services/media.service"

const TYPE_LABEL: Record<RoomType, string> = {
  SIMPLE: "Sencilla",
  DOUBLE: "Doble",
  TRIPLE: "Triple",
  QUADRUPLE: "Cuádruple",
  QUINTUPLE: "Quíntuple",
  SEXTUPLE: "Séxtuple",
  VIP: "VIP",
}

function roomImageByType(type: RoomType) {
  // 🔥 imágenes quemadas por ahora (fallback)
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
  onSave: (data: RoomUpsertBody) => Promise<void>
  onClose: () => void
}) {
  const [amenities, setAmenities] = useState<BackendAmenity[]>([])
  const [files, setFiles] = useState<File[]>([])

  const [form, setForm] = useState<RoomUpsertBody>(
    room
      ? {
          type: room.type,
          nameRoom: room.nameRoom,
          description: room.description,
          singleBeds: room.singleBeds,
          doubleBeds: room.doubleBeds,
          cabin: room.cabin ?? 0,
          extraDouble: room.extraDouble ?? 0,
          capacity: room.capacity,
          price: room.price,
          status: room.status,
          isBusy: room.isBusy,
          amenityIds: room.amenities?.map((a) => a.id) ?? [],
          imagesIds: [], // ⚠️ por ahora: el GET devuelve images (urls) pero no ids
        }
      : {
          type: "SIMPLE",
          nameRoom: "",
          description: "",
          singleBeds: 1,
          doubleBeds: 0,
          cabin: 0,
          extraDouble: 0,
          capacity: 1,
          price: 100,
          status: "ACTIVE",
          isBusy: false,
          amenityIds: [],
          imagesIds: [],
        },
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Si cambia "room" (por ejemplo al abrir editar con getRoomService),
  // sincronizamos el form con lo nuevo.
  useEffect(() => {
    if (!room) return
    setForm({
      type: room.type,
      nameRoom: room.nameRoom,
      description: room.description,
      singleBeds: room.singleBeds,
      doubleBeds: room.doubleBeds,
      cabin: room.cabin ?? 0,
      extraDouble: room.extraDouble ?? 0,
      capacity: room.capacity,
      price: room.price,
      status: room.status,
      isBusy: room.isBusy,
      amenityIds: room.amenities?.map((a) => a.id) ?? [],
      imagesIds: [],
    })
  }, [room])

  useEffect(() => {
    async function loadAmenities() {
      try {
        const data = await listAmenitiesService()
        setAmenities(data.filter((a) => a.status === "ACTIVE"))
      } catch {
        console.log("No se pudieron cargar amenidades")
      }
    }
    loadAmenities()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      let imagesIds: string[] = []
    if (files.length > 0) {
      const upload = await uploadMediaService(files)
      imagesIds = upload.ids
    }
    await onSave({ ...form, imagesIds })
    
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
          <Label className="text-foreground">Descripción</Label>
          <Input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Ej: Habitación con vista al mar"
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
              <SelectItem value="TRIPLE">Triple</SelectItem>
              <SelectItem value="QUADRUPLE">Cuádruple</SelectItem>
              <SelectItem value="QUINTUPLE">Quíntuple</SelectItem>
              <SelectItem value="SEXTUPLE">Séxtuple</SelectItem>
              <SelectItem value="VIP">VIP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <Label className="text-foreground">Cabaña</Label>
          <Input
            type="number"
            min={0}
            value={form.cabin}
            onChange={(e) => setForm({ ...form, cabin: Number(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Doble extra</Label>
          <Input
            type="number"
            min={0}
            value={form.extraDouble}
            onChange={(e) => setForm({ ...form, extraDouble: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Amenidades</Label>

        <div className="max-h-40 overflow-y-auto rounded-md border p-3 space-y-2">
          {amenities.map((a) => {
            const checked = form.amenityIds.includes(a.id)
            return (
              <label key={a.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    setForm((prev) => ({
                      ...prev,
                      amenityIds: checked
                        ? prev.amenityIds.filter((id) => id !== a.id)
                        : [...prev.amenityIds, a.id],
                    }))
                  }}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span>{a.name}</span>
              </label>
            )
          })}
        </div>



        {form.amenityIds.length === 0 && (
          <p className="text-xs text-muted-foreground">Selecciona una o varias amenidades.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Imágenes</Label>
        <Input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
        <p className="text-xs text-muted-foreground">
          {files.length > 0 ? `${files.length} archivo(s) seleccionado(s)` : "Selecciona una o más imágenes."}
        </p>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Switch checked={form.isBusy} onCheckedChange={(v) => setForm({ ...form, isBusy: v })} />
        <Label className="text-foreground">Ocupada (isBusy)</Label>
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
          const img = room.images?.[0] || roomImageByType(room.type)
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
                  <div className="min-w-0">
                    <h3 className="font-serif font-semibold text-foreground truncate">
                      Hab. {room.nameRoom}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{room.description}</p>
                  </div>

                  <span className="text-lg font-bold text-accent whitespace-nowrap">
                    ${room.price}
                    <span className="text-xs text-muted-foreground">/noche</span>
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1 flex-wrap">
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

                  <Badge variant="secondary" className="text-xs">
                    {TYPE_LABEL[room.type] ?? room.type}
                  </Badge>

                  {(room.cabin ?? 0) > 0 && (
                    <Badge variant="outline" className="text-xs">
                      Cabaña: {room.cabin}
                    </Badge>
                  )}
                  {(room.extraDouble ?? 0) > 0 && (
                    <Badge variant="outline" className="text-xs">
                      Doble extra: {room.extraDouble}
                    </Badge>
                  )}
                </div>

                {room.amenities?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {room.amenities.slice(0, 8).map((a) => (
                      <Badge key={a.id} variant="outline" className="text-xs">
                        {a.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {canManageRooms && (
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        const full = await getRoomService(room.id)
                        setEditingRoom(full)
                      }}
                    >
                      <Pencil className="mr-2 h-3 w-3" />
                      Editar
                    </Button>

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