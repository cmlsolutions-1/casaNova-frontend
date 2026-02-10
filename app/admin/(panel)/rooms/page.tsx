"use client"

import React from "react"

import { useState } from "react"
import { useBooking } from "@/lib/booking-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil } from "lucide-react"
import type { Room } from "@/lib/mock-data"

function RoomForm({
  room,
  onSave,
  onClose,
}: {
  room?: Room
  onSave: (data: Room) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Room>(
    room || {
      id: `room-${Date.now()}`,
      type: "sencilla",
      name: "",
      description: "",
      singleBeds: 1,
      doubleBeds: 0,
      capacity: 1,
      price: 100,
      images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop"],
      petFriendly: false,
      breakfastIncluded: false,
      oceanView: false,
      amenities: ["WiFi", "TV", "Aire acondicionado"],
      status: "available",
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-foreground">Nombre</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground">Tipo</Label>
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Room["type"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sencilla">Sencilla</SelectItem>
              <SelectItem value="doble">Doble</SelectItem>
              <SelectItem value="multiple">Multiple</SelectItem>
              <SelectItem value="suite">Suite</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Descripcion</Label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="space-y-2">
          <Label className="text-foreground">Camas sencillas</Label>
          <Input type="number" min={0} value={form.singleBeds} onChange={(e) => setForm({ ...form, singleBeds: Number(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground">Camas dobles</Label>
          <Input type="number" min={0} value={form.doubleBeds} onChange={(e) => setForm({ ...form, doubleBeds: Number(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground">Capacidad</Label>
          <Input type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground">Precio/noche ($)</Label>
          <Input type="number" min={1} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Imagenes (URLs separadas por coma)</Label>
        <Input
          value={form.images.join(", ")}
          onChange={(e) => setForm({ ...form, images: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Amenities (separados por coma)</Label>
        <Input
          value={form.amenities.join(", ")}
          onChange={(e) => setForm({ ...form, amenities: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
        />
      </div>

      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <Switch checked={form.petFriendly} onCheckedChange={(v) => setForm({ ...form, petFriendly: v })} />
          <Label className="text-foreground">Pet Friendly</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.breakfastIncluded} onCheckedChange={(v) => setForm({ ...form, breakfastIncluded: v })} />
          <Label className="text-foreground">Desayuno incluido</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.oceanView} onCheckedChange={(v) => setForm({ ...form, oceanView: v })} />
          <Label className="text-foreground">Vista al mar</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Estado</Label>
        <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Room["status"] })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Disponible</SelectItem>
            <SelectItem value="occupied">Ocupada</SelectItem>
            <SelectItem value="maintenance">Mantenimiento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">{room ? "Guardar cambios" : "Crear habitacion"}</Button>
      </div>
    </form>
  )
}

export default function AdminRoomsPage() {
  const { rooms, addRoom, updateRoom, adminAuth } = useBooking()
  const [editRoom, setEditRoom] = useState<Room | null>(null)
  const [creating, setCreating] = useState(false)
  const isEmployee = adminAuth.user?.role === "EMPLOYEE"

  const statusLabels: Record<string, string> = {
    available: "Disponible",
    occupied: "Ocupada",
    maintenance: "Mantenimiento",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Habitaciones</h1>
          <p className="text-muted-foreground">Gestiona las habitaciones del hotel</p>
        </div>
        {!isEmployee && (
          <Dialog open={creating} onOpenChange={setCreating}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Habitacion
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-serif text-foreground">Crear Habitacion</DialogTitle>
              </DialogHeader>
              <RoomForm
                onSave={(room) => addRoom(room)}
                onClose={() => setCreating(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rooms.map((room) => (
          <Card key={room.id} className="overflow-hidden border-border">
            <div className="relative h-40">
              <img
                src={room.images[0] || "/placeholder.svg"}
                alt={room.name}
                className="h-full w-full object-cover"
              />
              <Badge className="absolute top-2 right-2" variant={room.status === "available" ? "default" : "secondary"}>
                {statusLabels[room.status]}
              </Badge>
            </div>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-semibold text-foreground">{room.name}</h3>
                <span className="text-lg font-bold text-accent">${room.price}<span className="text-xs text-muted-foreground">/noche</span></span>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">{room.type}</Badge>
                <Badge variant="outline" className="text-xs">Cap: {room.capacity}</Badge>
                {room.petFriendly && <Badge variant="outline" className="text-xs">Pet Friendly</Badge>}
                {room.breakfastIncluded && <Badge variant="outline" className="text-xs">Desayuno</Badge>}
                {room.oceanView && <Badge variant="outline" className="text-xs">Vista al mar</Badge>}
              </div>
              {!isEmployee && (
                <Dialog open={editRoom?.id === room.id} onOpenChange={(open) => !open && setEditRoom(null)}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full mt-2 bg-transparent" onClick={() => setEditRoom(room)}>
                      <Pencil className="mr-2 h-3 w-3" />
                      Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="font-serif text-foreground">Editar Habitacion</DialogTitle>
                    </DialogHeader>
                    {editRoom && (
                      <RoomForm
                        room={editRoom}
                        onSave={(data) => updateRoom(data.id, data)}
                        onClose={() => setEditRoom(null)}
                      />
                    )}
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
