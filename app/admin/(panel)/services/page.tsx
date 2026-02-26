"use client"

import React, { useEffect, useState } from "react"
import { useBooking } from "@/lib/booking-context"

import {
  listServicesService,
  createServiceService,
  updateServiceService,
  updateServiceStatusService,
  getServiceService,
  type BackendService,
  type ServiceBillingType,
  type ServiceUpsertBody,
} from "@/services/service.service"

import { uploadMediaService } from "@/services/media.service"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Plus, Pencil, X } from "lucide-react"

type ImageFile = {
  id: string
  file: File
  preview: string
}

function normalizeService(s: any): BackendService {
  return {
    ...s,
    description: s.description ?? s.decription ?? "",
    images: s.images ?? [],
  }
}

function ServiceForm({
  service,
  onSave,
  onClose,
}: {
  service?: BackendService
  onSave: (data: ServiceUpsertBody) => Promise<void>
  onClose: () => void
}) {
  const [name, setName] = useState(service?.name ?? "")
  const [description, setDescription] = useState(service?.description ?? "")
  const [price, setPrice] = useState(service?.price ?? 50)
  const [billingType, setBillingType] =
    useState<ServiceBillingType>(service?.billingType ?? "FIXED")

  const [images, setImages] = useState<ImageFile[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const existingImages = service?.images ?? []

  useEffect(() => {
    if (!service) return
    setName(service.name)
    setDescription(service.description ?? "")
    setPrice(service.price)
    setBillingType(service.billingType)
    setImages([])
  }, [service])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      let imagesIds: string[] = []

      if (images.length > 0) {
        const upload = await uploadMediaService(
          images.map((img) => img.file)
        )
        imagesIds = upload.ids
      }
      console.log("BODY A ENVIAR:", { name, description, price, billingType, imagesIds })

      await onSave({
        name,
        description,
        price,
        billingType,
        imagesIds,
      })

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
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Tipo de cobro</Label>
        <Select
          value={billingType}
          onValueChange={(v) =>
            setBillingType(v as ServiceBillingType)
          }
        >
          <SelectTrigger>
            <SelectValue />
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

      {/* Upload */}
      <div className="space-y-2">
        <Label>Imágenes</Label>
        <Input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? [])
            const newImages = files
              .filter((file) => file.type.startsWith("image/"))
              .map((file) => ({
                id: crypto.randomUUID(),
                file,
                preview: URL.createObjectURL(file),
              }))
            setImages((prev) => [...prev, ...newImages])
          }}
        />
      </div>

      {/* Preview nuevas */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square overflow-hidden rounded-lg border"
            >
              <img
                src={img.preview}
                alt="preview"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setImages((prev) =>
                    prev.filter((i) => i.id !== img.id)
                  )
                }
                className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}


      {/* Preview existentes */}
        {existingImages.length > 0 && images.length === 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {existingImages.map((img, i) => (
              <div
                key={i}
                className="aspect-square overflow-hidden rounded-lg border"
              >
                <img
                  src={img}
                  alt="Servicio"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          type="button"
          onClick={onClose}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving
            ? "Guardando..."
            : service
            ? "Guardar cambios"
            : "Crear servicio"}
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
  const [creating, setCreating] = useState(false)
  const [editingService, setEditingService] =
    useState<BackendService | null>(null)
  const [changingId, setChangingId] =
    useState<string | null>(null)

  const loadServices = async () => {
    setLoading(true)
    try {
      const data = await listServicesService()
      setServices(data.map(normalizeService))
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Servicios</h1>

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

      {loading && <p>Cargando...</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((svc) => {
          const img = svc.images?.[0]
          const isActive = svc.status === "ACTIVE"

          return (
            <Card key={svc.id}>
              <div className="relative h-36 bg-muted">
                {img ? (
                  <img
                    src={img}
                    alt={svc.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Sin imagen
                  </div>
                )}
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

              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between">
                  <h3 className="font-semibold">{svc.name}</h3>
                  <span className="font-bold">
                    ${svc.price}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground">
                  {svc.description}
                </p>

                {canManage && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      const full =
                        await getServiceService(svc.id)
                      setEditingService(
                        normalizeService(full)
                      )
                    }}
                  >
                    <Pencil className="mr-2 h-3 w-3" />
                    Editar
                  </Button>
                  
                )}
                {/* Toggle status */}
                <Button
                      size="sm"
                      className={
                        isActive ? "bg-red-600 text-white hover:bg-red-700" : "bg-green-600 text-white hover:bg-green-700"
                      }
                      disabled={changingId === svc.id}
                      onClick={async () => {
                        setChangingId(svc.id)
                        try {
                          await updateServiceStatusService(svc.id, isActive ? "INACTIVE" : "ACTIVE")
                          await loadServices()
                        } finally {
                          setChangingId(null)
                        }
                      }}
                    >
                      {changingId === svc.id ? "Procesando..." : isActive ? "Inactivar" : "Activar"}
                    </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog
        open={!!editingService}
        onOpenChange={(open) =>
          !open && setEditingService(null)
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar servicio</DialogTitle>
          </DialogHeader>
          {editingService && (
            <ServiceForm
              service={editingService}
              onSave={async (body) => {
                await updateServiceService(
                  editingService.id,
                  body
                )
                await loadServices()
              }}
              onClose={() =>
                setEditingService(null)
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}