//app/admin/(panel)/services/page.tsx

"use client"

import React, { useEffect, useState } from "react"
import { useBooking } from "@/lib/booking-context"

import {
  listServicesService,
  createServiceService,
  updateServiceService,
  updateServiceStatusService,
  type BackendService,
  type ServiceStatus,
} from "@/services/service.service"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ServiceBillingType } from "@/services/service.service"


import { Plus, Pencil } from "lucide-react"

function serviceImageByName(name: string) {
  if (name.toLowerCase().includes("spa"))
    return "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop"

  if (name.toLowerCase().includes("jacuzzi"))
    return "https://images.unsplash.com/photo-1582582621959-48d27397dc7c?w=800&h=600&fit=crop"

  return "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop"
}

function ServiceForm({
  service,
  onSave,
  onClose,
}: {
  service?: BackendService
  onSave: (data: { name: string; description: string; price: number; billingType: ServiceBillingType }) => Promise<void>
  onClose: () => void
}) {
  const [name, setName] = useState(service?.name ?? "")
  const [description, setDescription] = useState(service?.description ?? "")
  const [price, setPrice] = useState(service?.price ?? 50)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [billingType, setBillingType] = useState<ServiceBillingType>(service?.billingType ?? "FIXED")

  useEffect(() => {
    if (!service) return
    setName(service.name)
    setDescription(service.description)
    setPrice(service.price)
    setBillingType(service.billingType)
  }, [service])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      await onSave({ name, description, price, billingType })
      onClose()
    } catch (e: any) {
      setError(e?.message ?? "Error guardando servicio")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-2">
        <Label>Nombre</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label>Descripción</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required />
      </div>

      <div className="space-y-2">
        <Label>Tipo de cobro</Label>
        <Select value={billingType} onValueChange={(v) => setBillingType(v as ServiceBillingType)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FIXED">Fijo</SelectItem>
            <SelectItem value="HOURLY">Por hora</SelectItem>
          </SelectContent>
        </Select>
      </div>


      <div className="space-y-2">
        <Label>Precio ($)</Label>
        <Input
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando..." : service ? "Guardar cambios" : "Crear servicio"}
        </Button>
      </div>
    </form>
  )
}

export default function AdminServicesPage() {
  const { adminAuth } = useBooking()
  const role = adminAuth.user?.role

  const canManage = role === "SUPER_ADMIN" || role === "ADMIN"

  const [services, setServices] = useState<BackendService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [creating, setCreating] = useState(false)
  const [editingService, setEditingService] = useState<BackendService | null>(null)

  const [changingId, setChangingId] = useState<string | null>(null)

  const loadServices = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await listServicesService()
      const normalized = data.map((s: any) => ({
        ...s,
        // SIEMPRE garantiza description
        description: s.description ?? s.decription ?? "",
      }))
      setServices(normalized)
    } catch (e: any) {
      setError(e?.message ?? "Error cargando servicios")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!adminAuth.isAuthenticated) return
    loadServices()
  }, [adminAuth.isAuthenticated])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Servicios</h1>
          <p className="text-muted-foreground">Gestiona los servicios adicionales del hotel</p>
        </div>

        {canManage && (
          <Dialog open={creating} onOpenChange={setCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo servicio
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear servicio</DialogTitle>
              </DialogHeader>

              <ServiceForm
                onSave={async (body) => {
                  await createServiceService(body)
                  await loadServices()
                }}
                onClose={() => setCreating(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* States */}
      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((svc) => {
          const img = serviceImageByName(svc.name)
          const isActive = svc.status === "ACTIVE"

          return (
            <Card key={svc.id} className="overflow-hidden border-border">
              {/* Image */}
              <div className="relative h-36">
                <img src={img} alt={svc.name} className="h-full w-full object-cover" />

                <Badge
                  className={`absolute top-2 right-2 ${
                    isActive
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-red-100 text-red-700 border border-red-300"
                  }`}
                >
                  {isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              {/* Content */}
              <CardContent className="p-4 space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  {svc.billingType === "HOURLY" ? "Por hora" : "Fijo"}
                </Badge>
              </div>

                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{svc.name}</h3>
                  <span className="font-bold text-accent">${svc.price}</span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">{svc.decription}</p>

                {/* Actions */}
                {canManage && (
                  <div className="mt-3 flex justify-center gap-2 flex-wrap">
                    {/* Edit */}
                    <Button size="sm" variant="outline" onClick={() => setEditingService(svc)}>
                      <Pencil className="mr-2 h-3 w-3" />
                      Editar
                    </Button>

                    {/* Toggle status */}
                    <Button
                      size="sm"
                      className={
                        isActive
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }
                      disabled={changingId === svc.id}
                      onClick={async () => {
                        setChangingId(svc.id)
                        try {
                          await updateServiceStatusService(
                            svc.id,
                            isActive ? "INACTIVE" : "ACTIVE",
                          )
                          await loadServices()
                        } finally {
                          setChangingId(null)
                        }
                      }}
                    >
                      {changingId === svc.id
                        ? "Procesando..."
                        : isActive
                        ? "Inactivar"
                        : "Activar"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Edit Dialog global */}
      <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar servicio</DialogTitle>
          </DialogHeader>

          {editingService && (
            <ServiceForm
              service={editingService}
              onSave={async (body) => {
                await updateServiceService(editingService.id, body)
                await loadServices()
              }}
              onClose={() => setEditingService(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
