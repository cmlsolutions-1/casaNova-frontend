"use client"

import React from "react"

import { useState } from "react"
import { useBooking } from "@/lib/booking-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Pencil } from "lucide-react"
import type { Service } from "@/lib/mock-data"

function ServiceForm({
  service,
  onSave,
  onClose,
}: {
  service?: Service
  onSave: (data: Service) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Service>(
    service || {
      id: `srv-${Date.now()}`,
      name: "",
      description: "",
      price: 50,
      icon: "Sparkles",
      status: "active",
      images: ["https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop"],
      hasSchedule: false,
      maxAmount: 4,
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-foreground">Nombre</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground">Precio ($)</Label>
          <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Descripcion</Label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Imagenes (URLs separadas por coma)</Label>
        <Input
          value={form.images.join(", ")}
          onChange={(e) => setForm({ ...form, images: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-foreground">Cantidad maxima</Label>
          <Input type="number" min={1} value={form.maxAmount} onChange={(e) => setForm({ ...form, maxAmount: Number(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground">Estado</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Service["status"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="inactive">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch checked={form.hasSchedule} onCheckedChange={(v) => setForm({ ...form, hasSchedule: v })} />
        <Label className="text-foreground">Requiere horario</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">{service ? "Guardar cambios" : "Crear servicio"}</Button>
      </div>
    </form>
  )
}

export default function AdminServicesPage() {
  const { services, addService, updateService, adminAuth } = useBooking()
  const [editService, setEditService] = useState<Service | null>(null)
  const [creating, setCreating] = useState(false)
  const isEmployee = adminAuth.user?.role === "EMPLOYEE"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Servicios</h1>
          <p className="text-muted-foreground">Gestiona los servicios adicionales</p>
        </div>
        {!isEmployee && (
          <Dialog open={creating} onOpenChange={setCreating}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Servicio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-serif text-foreground">Crear Servicio</DialogTitle>
              </DialogHeader>
              <ServiceForm onSave={(s) => addService(s)} onClose={() => setCreating(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((svc) => (
          <Card key={svc.id} className="overflow-hidden border-border">
            <div className="relative h-36">
              <img src={svc.images[0] || "/placeholder.svg"} alt={svc.name} className="h-full w-full object-cover" />
              <Badge className="absolute top-2 right-2" variant={svc.status === "active" ? "default" : "secondary"}>
                {svc.status === "active" ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-semibold text-foreground">{svc.name}</h3>
                <span className="font-bold text-accent">${svc.price}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{svc.description}</p>
              {!isEmployee && (
                <Dialog open={editService?.id === svc.id} onOpenChange={(open) => !open && setEditService(null)}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full mt-1 bg-transparent" onClick={() => setEditService(svc)}>
                      <Pencil className="mr-2 h-3 w-3" />
                      Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="font-serif text-foreground">Editar Servicio</DialogTitle>
                    </DialogHeader>
                    {editService && (
                      <ServiceForm
                        service={editService}
                        onSave={(data) => updateService(data.id, data)}
                        onClose={() => setEditService(null)}
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
